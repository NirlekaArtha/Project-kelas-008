#!/usr/bin/env pwsh

function Get-ValidAbsolutePath {
    param (
        [string]$Prompt
    )
    
    while ($true) {
        $path = Read-Host -Prompt $Prompt
        $path = $path.Trim('"').Trim("'")  # Remove any surrounding quotes
        
        if (-not [System.IO.Path]::IsPathRooted($path)) {
            Write-Host "Error: Path must be an absolute path (e.g., C:\Projects\my-project)" -ForegroundColor Red
            continue
        }
        
        $parentDir = [System.IO.Path]::GetDirectoryName($path)
        if (-not (Test-Path -Path $parentDir)) {
            Write-Host "Error: The directory '$parentDir' does not exist" -ForegroundColor Red
            continue
        }
        
        return $path
    }
}

$projectPath = Get-ValidAbsolutePath -Prompt "Masukkan path project (e.g., C:\Users\You\Documents\Project\Project-kelas-008)"

$envPath = Join-Path -Path $projectPath -ChildPath ".env"

if (-not (Test-Path -Path $envPath)) {
    Write-Host "Creating .env file at $envPath"
    New-Item -Path $envPath -ItemType File | Out-Null
    
    @"
PORT=3001
NODE_ENV=development
"@ | Out-File -FilePath $envPath -Encoding utf8

    Write-Host "Menambahkan default environment variables ke .env" -ForegroundColor Green
} else {
    Write-Host ".env file udah ada di $($envPath)" -ForegroundColor Yellow
    Write-Host "Skip menulis default variables untuk mencegah overwriting konfigurasi yang sudah ada" -ForegroundColor Yellow
}

try {
    Set-Location -Path $projectPath -ErrorAction Stop
    npm i
    
    Write-Host "`nSetup sukses!" -ForegroundColor Green
    Write-Host "Contents of .env file at $($envPath):" -ForegroundColor Cyan
    Get-Content -Path $envPath
    Write-Host "`nDon't forget to edit or add something to the .env file if needed" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
