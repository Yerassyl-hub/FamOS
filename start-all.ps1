# Скрипт для запуска всех сервисов FamOS

Write-Host "Starting FamOS services..." -ForegroundColor Cyan
Write-Host ""

# Запуск Docker контейнеров
Write-Host "[1/3] Starting Docker containers (MongoDB & Redis)..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✅ Docker containers started" -ForegroundColor Green
Write-Host ""

# Ожидание запуска контейнеров
Write-Host "[2/3] Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "✅ Containers ready" -ForegroundColor Green
Write-Host ""

# Запуск бэкенда
Write-Host "[3/3] Starting backend server..." -ForegroundColor Yellow
Write-Host "   Backend will run on: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Запуск в новом окне PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run start:dev"

Write-Host "✅ Backend server starting in new window" -ForegroundColor Green
Write-Host ""
Write-Host "To monitor services, run: .\monitor.ps1" -ForegroundColor Cyan
