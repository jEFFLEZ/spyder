# QFLASH Installer

This folder contains a PowerShell installer `install-qflash.ps1` that can:

- Install QFLASH for the current user (default) by copying compiled `dist` files to `%APPDATA%\Funeste38\QFlash` and adding the folder to user PATH.
- Install QFLASH system-wide (requires Administrator) by copying to `C:\Program Files\Funesterie\QFlash` and adding to machine PATH.
- Install via npm global if the package is published: `install-qflash.ps1 -Mode npm`.

Usage examples:

PowerShell (current user):
PS> .\install-qflash.ps1 -Mode user

PowerShell (system/admin):
PS> Start-Process powershell -Verb runAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File "install-qflash.ps1" -Mode system'

NPM global install (requires published package):
PS> .\install-qflash.ps1 -Mode npm
