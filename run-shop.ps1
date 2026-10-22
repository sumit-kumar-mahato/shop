# Starts the Prabodh Kumar Mahato clothing store with Docker Desktop.
# Right-click → "Run with PowerShell".

Clear-Host
Set-Location -Path $PSScriptRoot
Write-Output "========================================================"
Write-Output "   PRABODH KUMAR MAHATO CLOTHING STORE"
Write-Output "========================================================"
Write-Output ""

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warning "Docker is not installed. Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Read-Host "Press ENTER to exit"
    exit 1
}

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Docker Desktop is not running. Start it from the Start menu, wait for the green status, then run this script again."
    Read-Host "Press ENTER to exit"
    exit 1
}

# First run: create .env with a random session secret and ask for the admin login.
if (-not (Test-Path ".env")) {
    Write-Output "First-time setup — let's create your administrator account."
    $adminEmail = Read-Host "Admin email"
    $adminPassword = Read-Host "Admin password (at least 10 characters)"
    $bytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    $lines = (Get-Content ".env.example") `
        -replace '^AUTH_SECRET=.*', "AUTH_SECRET=`"$secret`"" `
        -replace '^ADMIN_EMAIL=.*', "ADMIN_EMAIL=`"$adminEmail`"" `
        -replace '^ADMIN_PASSWORD=.*', "ADMIN_PASSWORD=`"$adminPassword`""
    Set-Content -Path ".env" -Value $lines -Encoding utf8
    Write-Output "Saved settings to .env"
}

Write-Output "[*] Building and starting the store (first run can take several minutes)..."
& docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not start the store. See the messages above."
    Read-Host "Press ENTER to exit"
    exit 1
}

Write-Output ""
Write-Output "  Store:        http://localhost:3000"
Write-Output "  Admin panel:  http://localhost:3000/admin   (sign in with your admin email)"
Write-Output ""
Write-Output "  To stop:      docker compose down"
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
Read-Host "Press ENTER to close this window"
