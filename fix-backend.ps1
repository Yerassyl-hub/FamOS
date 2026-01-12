# Скрипт для исправления проблем с бэкендом

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FamOS Backend Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Остановить все Node.js процессы
Write-Host "[1/4] Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
Write-Host ""

# Шаг 2: Остановить все Chrome/Chromium процессы (Puppeteer)
Write-Host "[2/4] Stopping Chrome/Chromium processes..." -ForegroundColor Yellow
Get-Process -Name chrome,chromium,msedge -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Browser processes stopped" -ForegroundColor Green
Write-Host ""

# Шаг 3: Проверить Docker
Write-Host "[3/4] Checking Docker containers..." -ForegroundColor Yellow
$mongo = docker ps --filter "name=famos-mongo" --format "{{.Names}}" | Select-Object -First 1
$redis = docker ps --filter "name=famos-redis" --format "{{.Names}}" | Select-Object -First 1

if (-not $mongo) {
    Write-Host "⚠️  MongoDB not running, starting..." -ForegroundColor Yellow
    docker-compose up -d mongo
    Start-Sleep -Seconds 3
}

if (-not $redis) {
    Write-Host "⚠️  Redis not running, starting..." -ForegroundColor Yellow
    docker-compose up -d redis
    Start-Sleep -Seconds 3
}

Write-Host "✅ Docker containers ready" -ForegroundColor Green
Write-Host ""

# Шаг 4: Запустить бэкенд
Write-Host "[4/4] Starting backend..." -ForegroundColor Yellow
Write-Host "   Backend will start in a new window" -ForegroundColor Gray
Write-Host "   Press Ctrl+C in that window to stop" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

Write-Host "✅ Backend starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Waiting 5 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Проверка
Write-Host ""
Write-Host "Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Backend is starting, please wait..." -ForegroundColor Yellow
    Write-Host "   Check the new window for startup logs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Done! Backend should be running now." -ForegroundColor Cyan
