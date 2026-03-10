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

# 3. Generate certs directly into certs/ directory
$dest = Join-Path $PSScriptRoot "certs"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

Write-Host ""
Write-Host "Generating certificates..." -ForegroundColor Yellow

Push-Location $dest

# Wildcard cert (used by cloud-server and cloud-web)
& mkcert `
    -key-file "_wildcard.local.vrittiai.com+4-key.pem" `
    -cert-file "_wildcard.local.vrittiai.com+4.pem" `
    "*.local.vrittiai.com" `
    "local.vrittiai.com" `
    "localhost" `
    "127.0.0.1" `
    "::1"

# Explicit-domain cert (alternative without wildcard)
& mkcert `
    -key-file "local.vrittiai.com+4-key.pem" `
    -cert-file "local.vrittiai.com+4.pem" `
    "local.vrittiai.com" `
    "cloud.local.vrittiai.com" `
    "localhost" `
    "127.0.0.1" `
    "::1"

Pop-Location

Write-Host "Certificates generated in certs/." -ForegroundColor Green

# 4. Add hosts entries (requires admin)
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

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Set USE_HTTPS=true in the .env of each service you want to run over HTTPS"
Write-Host "  2. All services must use the same protocol (all HTTP or all HTTPS)"
Write-Host "  3. Start services normally - they will pick up the certs from the root certs/ folder"
Write-Host ""
