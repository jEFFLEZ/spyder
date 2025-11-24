param(
  [string]$Root = 'D:\qflush',
  [string]$OutText = 'D:\qflush-code-dump.txt',
  [string]$OutRaw = 'D:\qflush-code-dump.raw',
  [string]$OutPng = 'D:\qflush-code-dump.png',
  [int]$ImageWidth = 1024
)

Write-Host "=== QFLUSH DUMP START ==="
Write-Host "Root          : $Root"
Write-Host "OutText       : $OutText"
Write-Host "OutRaw        : $OutRaw"
Write-Host "OutPng        : $OutPng"
Write-Host "ImageWidth    : $ImageWidth"
Write-Host ""

# 1) Validation du root
if (-not (Test-Path -Path $Root)) {
  Write-Error "Root path '$Root' not found."
  exit 2
}

# 2) Nettoyage des sorties précédentes
foreach ($p in @($OutText, $OutRaw, $OutPng)) {
  if (Test-Path $p) {
    Write-Host "Removing previous output: $p"
    Remove-Item $p -Force -ErrorAction SilentlyContinue
  }
}

# 3) Préparation writer UTF-8 sans BOM
$utf8NoBOM = New-Object System.Text.UTF8Encoding($false)
$fs = [System.IO.File]::Open(
  $OutText,
  [System.IO.FileMode]::Create,
  [System.IO.FileAccess]::Write,
  [System.IO.FileShare]::Read
)
$sw = New-Object System.IO.StreamWriter($fs, $utf8NoBOM)

# Extensions considérées comme "texte"
$textExtensions = @(
  '.ts', '.tsx', '.js', '.cjs', '.mjs',
  '.json', '.yml', '.yaml', '.md',
  '.ps1', '.psm1', '.psd1',
  '.xml', '.txt', '.sh', '.bat',
  '.c', '.cpp', '.h', '.hpp'
)

# Dossiers à exclure
$excludePatterns = @(
  '\node_modules\',
  '\dist\',
  '\out\',
  '\.git\',
  '\coverage\',
  '\.vscode\',
  '\.idea\',
  '\.vs\',
  '\.qflush\cache\'
)

function Test-ExcludedPath([string]$fullPath) {
  foreach ($pat in $excludePatterns) {
    if ($fullPath -like "*$pat*") { return $true }
  }
  return $false
}

try {
  # En-tête du dump
  $now = (Get-Date).ToString("o")
  $sw.WriteLine("qflush code dump generated: $now")
  $sw.WriteLine()

  Write-Host "Scanning files under: $Root"
  $files = Get-ChildItem -Path $Root -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { -not (Test-ExcludedPath $_.FullName) } |
    Sort-Object FullName

  Write-Host ("Found {0} files after exclusions." -f $files.Count)
  Write-Host ""

  foreach ($f in $files) {
    try {
      # Chemin relatif
      $rel = $f.FullName
      if ($rel.StartsWith($Root, [System.StringComparison]::InvariantCultureIgnoreCase)) {
        $rel = $rel.Substring($Root.Length).TrimStart('\','/')
      }

      Write-Host "Dumping file: $rel"

      $sep = '=' * 28
      $sw.WriteLine($sep)
      $sw.WriteLine("FILE: $rel")
      $sw.WriteLine($sep)
      $sw.WriteLine($sep)

      $ext = [System.IO.Path]::GetExtension($f.FullName).ToLowerInvariant()
      $isTextExt = $textExtensions -contains $ext

      if ($isTextExt) {
        # Lecture texte
        $raw = $null
        try {
          $raw = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        } catch {
          $raw = $null
        }

        if ($null -ne $raw) {
          # Découper en lignes, écrire sans utiliser -f sur le contenu
          $lines = $raw -split "`r?`n"
          $ln = 1
          foreach ($line in $lines) {
            $prefix = "{0,6}: " -f $ln
            $sw.WriteLine($prefix + $line)
            $ln++
          }
        } else {
          # Fallback binaire
          $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
          $sw.WriteLine("[BINARY CONTENT - {0} bytes] (text read failed)" -f $bytes.Length)
          for ($i = 0; $i -lt $bytes.Length; $i += 16) {
            $end = [Math]::Min($i + 15, $bytes.Length - 1)
            $slice = $bytes[$i..$end]
            $hex = ($slice | ForEach-Object { $_.ToString('x2') }) -join ' '
            $sw.WriteLine('{0,6}: {1}' -f (($i / 16) + 1), $hex)
          }
        }
      } else {
        # Lecture binaire pure
        $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
        $sw.WriteLine("[BINARY CONTENT - {0} bytes]" -f $bytes.Length)
        for ($i = 0; $i -lt $bytes.Length; $i += 16) {
          $end = [Math]::Min($i + 15, $bytes.Length - 1)
          $slice = $bytes[$i..$end]
          $hex = ($slice | ForEach-Object { $_.ToString('x2') }) -join ' '
          $sw.WriteLine('{0,6}: {1}' -f (($i / 16) + 1), $hex)
        }
      }

      $sw.WriteLine()
      $sw.WriteLine()
      $sw.Flush()
    } catch {
      # IMPORTANT : ne pas utiliser -f avec le message d'exception
      $sw.WriteLine("[ERROR] Failed to include file: " + $f.FullName)
      $sw.WriteLine("Reason: " + $_.Exception.Message)
      $sw.WriteLine()
      $sw.WriteLine()
      $sw.Flush()

      Write-Warning "Failed to dump file: $($f.FullName) -> $($_.Exception.Message)"
    }
  }

  $completed = (Get-Date -Format o)
  $sw.WriteLine("Completed: $completed")
  $sw.Flush()
  Write-Host "Text dump completed at: $completed"
}
finally {
  $sw.Close()
  $fs.Close()
}

# 5) Conversion du texte → RAW RGBA → PNG (ImageMagick)
Write-Host ""
Write-Host "=== Building RAW / PNG from text dump ==="

try {
  if (-not (Test-Path $OutText)) {
    Write-Warning "Text dump not found at $OutText, aborting RAW/PNG generation."
    return
  }

  $textBytes = [System.IO.File]::ReadAllBytes($OutText)
  $len = $textBytes.Length
  Write-Host ("Text dump size: {0} bytes" -f $len)

  # Padding à multiple de 4 (RGBA)
  $pad = (4 - ($len % 4)) % 4
  if ($pad -gt 0) {
    Write-Host ("Applying padding of {0} bytes to align to RGBA." -f $pad)
    $new = New-Object byte[] ($len + $pad)
    [System.Array]::Copy($textBytes, 0, $new, 0, $len)
    $textBytes = $new
    $len = $textBytes.Length
  }

  [System.IO.File]::WriteAllBytes($OutRaw, $textBytes)
  Write-Host "RAW RGBA bytes written to: $OutRaw (length=${len})"

  $pixels = [int]($len / 4)
  $width = [int]$ImageWidth
  if ($width -le 0) { $width = 1024 }
  $height = [int][Math]::Ceiling($pixels / $width)

  Write-Host ("Image logical size: {0}x{1} pixels (pixels={2})" -f $width, $height, $pixels)

  # Ensure raw length matches width*height*4 by padding with zeros if necessary
  $requiredBytes = $width * $height * 4
  if ($len -lt $requiredBytes) {
    $padNeeded = $requiredBytes - $len
    Write-Host ("Padding raw file to {0} bytes (adding {1} zeros) to match image size" -f $requiredBytes, $padNeeded)
    $newArr = New-Object byte[] $requiredBytes
    [System.Array]::Copy($textBytes, 0, $newArr, 0, $len)
    [System.IO.File]::WriteAllBytes($OutRaw, $newArr)
    $len = $newArr.Length
  }

  # Detect ImageMagick executable reliably
  $magickExe = $null
  try { $magickExe = (Get-Command magick -ErrorAction SilentlyContinue).Source } catch {}
  if (-not $magickExe) {
    try { $magickExe = (Get-Command convert -ErrorAction SilentlyContinue).Source } catch {}
  }

  $useMagick = $false
  $useConvert = $false
  if ($magickExe) {
    $exeName = (Split-Path $magickExe -Leaf).ToLower()
    if ($exeName -eq 'magick' -or $exeName -eq 'magick.exe') {
      $useMagick = $true
    } else {
      # candidate 'convert' found - ensure it's ImageMagick, not Windows convert
      try {
        $ver = & $magickExe -version 2>&1
        if ($ver -and ($ver -join "`n") -match 'ImageMagick') { $useConvert = $true }
      } catch {
        $useConvert = $false
      }
    }
  }

  if ($useMagick -or $useConvert) {
    if ($useMagick) {
      Write-Host "Using ImageMagick (magick) at: $magickExe"
      # magick v7: magick -size WxH -depth 8 rgba:in.raw out.png
      & $magickExe '-size' "${width}x${height}" '-depth' '8' ('rgba:' + $OutRaw) $OutPng
    } else {
      Write-Host "Using ImageMagick (convert) at: $magickExe"
      & $magickExe '-size' "${width}x${height}" '-depth' '8' ('rgba:' + $OutRaw) $OutPng
    }

    if (Test-Path $OutPng) {
      Write-Host "✅ RGBA image written to: $OutPng (size=${width}x${height})"
    } else {
      Write-Warning "ImageMagick executed but $OutPng not found. Check logs above."
    }
  } else {
    Write-Warning "ImageMagick not found in PATH or 'convert' is the Windows tool. Skipping PNG generation."
    Write-Host "RAW RGBA written to $OutRaw."
    Write-Host "Install ImageMagick and run manually:"
    Write-Host "  magick -size ${width}x${height} -depth 8 rgba:`"$OutRaw`" `"$OutPng`""
  }
} catch {
  Write-Warning "Failed to create RGBA raw/png: $($_.Exception.Message)"
}

Write-Host "Text dump written to: $OutText"
Write-Host "=== QFLUSH DUMP END ==="
