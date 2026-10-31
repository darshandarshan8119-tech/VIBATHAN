# ============================================================
#  VIBEATHON 2026 - Unified Setup & Run Script (PowerShell)
#  Run from the repo root:  .\setup_and_run.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$Root     = Split-Path -Parent $MyInvocation.MyCommand.Definition
$Backend  = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$Venv     = Join-Path $Backend ".venv"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VIBEATHON 2026 - Setup & Run"             -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Backend: Python virtual environment -------------------
Write-Host "[1/5] Creating Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path $Venv)) {
    python -m venv $Venv
    Write-Host "      venv created at $Venv" -ForegroundColor Green
} else {
    Write-Host "      venv already exists, skipping." -ForegroundColor DarkGray
}

$Pip    = Join-Path $Venv "Scripts\pip.exe"
$Python = Join-Path $Venv "Scripts\python.exe"

# -- 2. Backend: Install Python dependencies ------------------
Write-Host "[2/5] Installing Python dependencies from requirements.txt..." -ForegroundColor Yellow
& $Pip install --upgrade pip --quiet
& $Pip install -r (Join-Path $Backend "requirements.txt")
Write-Host "      Python deps installed." -ForegroundColor Green

# -- 3. Backend: .env (copy from example if missing) ----------
$EnvFile    = Join-Path $Backend ".env"
$EnvExample = Join-Path $Backend ".env.example"
if (-not (Test-Path $EnvFile)) {
    Write-Host "[3/5] Creating backend/.env (SQLite dev mode)..." -ForegroundColor Yellow
    Copy-Item $EnvExample $EnvFile
    (Get-Content $EnvFile) `
        -replace "^DATABASE_URL=.*",  "DATABASE_URL=sqlite:///market_intelligence.db.sqlite3" `
        -replace "^DJANGO_DEBUG=.*",  "DJANGO_DEBUG=true" `
        -replace "^REDIS_URL=.*",     "REDIS_URL=redis://localhost:6379/0" |
        Set-Content $EnvFile
    Write-Host "      .env written." -ForegroundColor Green
} else {
    Write-Host "[3/5] backend/.env already exists, skipping." -ForegroundColor DarkGray
}

# -- 4. Backend: Migrate database -----------------------------
Write-Host "[4/5] Running Django migrations..." -ForegroundColor Yellow
Push-Location $Backend
$env:DJANGO_SETTINGS_MODULE = "agrimart.settings"
$env:DJANGO_DEBUG            = "true"
$env:DATABASE_URL            = "sqlite:///market_intelligence.db.sqlite3"
& $Python manage.py migrate --run-syncdb 2>&1
Pop-Location
Write-Host "      Migrations done." -ForegroundColor Green

# -- 5. Frontend: npm install ---------------------------------
Write-Host "[5/5] Installing frontend Node dependencies..." -ForegroundColor Yellow
Push-Location $Frontend
npm install --legacy-peer-deps
Pop-Location
Write-Host "      Node deps installed." -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Starting servers..."       -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend  -> http://127.0.0.1:8000"  -ForegroundColor Green
Write-Host "  Frontend -> http://localhost:5173"   -ForegroundColor Green
Write-Host ""

# -- Start Django backend in a new window ---------------------
$backendCmd = "cd '$Backend'; `$env:DJANGO_DEBUG='true'; `$env:DATABASE_URL='sqlite:///market_intelligence.db.sqlite3'; & '$Python' manage.py runserver 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# -- Start Vite frontend in a new window ----------------------
$frontendCmd = "cd '$Frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "Both servers launched in separate windows." -ForegroundColor Cyan
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Green
