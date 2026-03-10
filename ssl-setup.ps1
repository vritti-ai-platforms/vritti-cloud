# Vritti local SSL setup for Windows
# Run as Administrator for hosts file modification

$ErrorActionPreference = "Stop"

Write-Host "=== Vritti SSL Setup for Windows ===" -ForegroundColor Cyan
Write-Host ""

# 1. Install mkcert if not present
if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Host "mkcert not found. Installing via winget..." -ForegroundColor Yellow
    winget install FiloSottile.mkcert
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

    if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "mkcert installed but not in PATH yet. Restart PowerShell and run again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "mkcert found." -ForegroundColor Green
}

# 2. Install local CA (trust store)
Write-Host ""
Write-Host "Installing local CA into trust store..." -ForegroundColor Yellow
mkcert -install
Write-Host "Local CA installed." -ForegroundColor Green

# 3. Generate certs
$certsTemp = Join-Path $PSScriptRoot "certs-temp"
New-Item -ItemType Directory -Force -Path $certsTemp | Out-Null

Write-Host ""
Write-Host "Generating certificates..." -ForegroundColor Yellow

Push-Location $certsTemp
$mkcertArgs = @(
    "-key-file", "local.vrittiai.com+4-key.pem",
    "-cert-file", "local.vrittiai.com+4.pem",
    "local.vrittiai.com",
    "cloud.local.vrittiai.com",
    "localhost",
    "127.0.0.1",
    "::1"
)
& mkcert @mkcertArgs
Pop-Location

Write-Host "Certificates generated." -ForegroundColor Green

# 4. Copy certs to each service
Write-Host ""
Write-Host "Copying certificates to services..." -ForegroundColor Yellow
$services = @("cloud-server", "cloud-web", "web-nexus", "cloud-microfrontend", "api-nexus")
foreach ($svc in $services) {
    $svcPath = Join-Path $PSScriptRoot $svc
    if (Test-Path $svcPath) {
        $dest = Join-Path $svcPath "certs"
        New-Item -ItemType Directory -Force -Path $dest | Out-Null
        Copy-Item "$certsTemp\*" -Destination $dest -Force
        Write-Host "  Copied to $svc\certs\" -ForegroundColor Green
    } else {
        Write-Host "  Skipped $svc (folder not found)" -ForegroundColor DarkGray
    }
}

# 5. Add hosts entries (requires admin)
Write-Host ""
Write-Host "Checking hosts file entries..." -ForegroundColor Yellow
$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$hostsEntries = @(
    "127.0.0.1`t`tlocal.vrittiai.com",
    "127.0.0.1`t`tcloud.local.vrittiai.com"
)

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    $hostsContent = Get-Content $hostsFile -Raw
    foreach ($entry in $hostsEntries) {
        $domain = ($entry -split "\s+")[1]
        if ($hostsContent -notmatch [regex]::Escape($domain)) {
            Add-Content -Path $hostsFile -Value $entry
            Write-Host "  Added: $domain" -ForegroundColor Green
        } else {
            Write-Host "  Already exists: $domain" -ForegroundColor DarkGray
        }
    }
} else {
    Write-Host "  Not running as Administrator - skipping hosts file update." -ForegroundColor Yellow
    Write-Host "  Manually add these lines to $hostsFile :" -ForegroundColor Yellow
    foreach ($entry in $hostsEntries) {
        Write-Host "    $entry" -ForegroundColor White
    }
}

# Cleanup temp folder
Remove-Item -Recurse -Force $certsTemp

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Set USE_HTTPS=true in the .env of each service you want to run over HTTPS"
Write-Host "  2. All services must use the same protocol (all HTTP or all HTTPS)"
Write-Host "  3. Start services normally - they will pick up the certs from their certs/ folder"
Write-Host ""
