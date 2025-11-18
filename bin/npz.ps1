param([string[]]$Args)
# Lightweight PowerShell launcher to run the qflash NPZ daemon without npm
$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location (Join-Path $here '..')
$node = $env:NODEJS_PATH -or 'node'
$exe = Get-Command $node -ErrorAction SilentlyContinue
if (-not $exe) {
  Write-Error "node executable not found. Update PATH or set NODEJS_PATH env var to the node binary."
  exit 1
}
$script = Join-Path (Get-Location) 'dist/daemon/qflashd.js'
if (-not (Test-Path $script)) {
  Write-Error "Daemon script not found: $script. Run build first (npm run build) or compile TypeScript." 
  exit 2
}
& $node $script @Args
