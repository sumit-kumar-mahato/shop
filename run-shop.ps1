# PowerShell Runner Script for Prabodh Kumar Mahato Luxury Storefront & CMS
# Double-click or run this script to launch the application using Docker

Clear-Host

Write-Output "========================================================"
Write-Output "   PRABODH KUMAR MAHATO LUXURY CLOTHING RETAIL SYSTEM   "
Write-Output "        No-Code visual Storefront & Admin CMS           "
Write-Output "========================================================"
Write-Output ""

# 1. Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Warning "Docker is not detected on your system."
    Write-Output "Please download and install Docker Desktop first: https://www.docker.com/products/docker-desktop/"
    Write-Output "After installation, restart your computer and run this script again."
    Read-Host "Press ENTER to exit..."
    exit
}

# 2. Check if Docker Daemon is running
Write-Output "[*] Verifying Docker environment status..."
& docker ps > $null 2>&1
if ($LastExitCode -ne 0) {
    Write-Warning "Docker is installed, but the daemon is not running."
    Write-Output "Please open 'Docker Desktop' from your Start Menu and wait for it to start (green indicator)."
    Write-Output "Once Docker is running, press any key to continue..."
    Read-Host
}

# 3. Build container
Write-Output "[*] Building your eCommerce storefront container image (Next.js & SQLite)..."
Write-Output "    (This might take a few minutes on first run to download dependencies)"
& docker compose build
if ($LastExitCode -ne 0) {
    Write-Error "Failed to build the container. Check above logs for compilation details."
    Read-Host "Press ENTER to exit..."
    exit
}

# 4. Spin up container
Write-Output ""
Write-Output "[*] Launching storefront server..."
& docker compose up -d
if ($LastExitCode -ne 0) {
    Write-Error "Failed to launch the container service."
    Read-Host "Press ENTER to exit..."
    exit
}

# 5. Success summary
Write-Output ""
Write-Output "========================================================"
Write-Output "  SUCCESS! Your luxury clothing storefront is running.  "
Write-Output "  Database (SQLite) has been seeded with fashion items. "
Write-Output "========================================================"
Write-Output ""
Write-Output "  [+] Customer Website: http://localhost:3000"
Write-Output "  [+] Visual Admin CMS: http://localhost:3000/admin"
Write-Output ""
Write-Output "[*] Automatically opening your browser to storefront..."
Start-Sleep -Seconds 2

# Open default browser
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3000/admin"

Write-Output ""
Write-Output "========================================================"
Write-Output "  To stop the server, run: docker compose down          "
Write-Output "========================================================"
Write-Output ""
Read-Host "Press ENTER to close this window..."
