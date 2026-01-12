# Скрипт для мониторинга FamOS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   FamOS Monitoring Dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Docker контейнеров
Write-Host "[1] Docker Containers Status:" -ForegroundColor Yellow
docker ps --filter "name=famos" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# Проверка API
Write-Host "[2] Backend API Status:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ Backend is running on http://localhost:3000" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding yet" -ForegroundColor Red
    Write-Host "   Make sure 'npm run start:dev' is running" -ForegroundColor Gray
}
Write-Host ""

# Последние логи приложения
Write-Host "[3] Recent Application Logs:" -ForegroundColor Yellow
$logFile = Get-ChildItem -Path "logs" -Filter "famos-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($logFile) {
    Write-Host "   Latest log: $($logFile.Name)" -ForegroundColor Gray
    Get-Content $logFile.FullName -Tail 10
} else {
    Write-Host "   No log files found yet" -ForegroundColor Gray
}
Write-Host ""

# Полезные команды
Write-Host "[4] Useful Commands:" -ForegroundColor Yellow
Write-Host "   View Docker logs:    docker-compose logs -f" -ForegroundColor Gray
Write-Host "   View app logs:       Get-Content logs\famos-*.log -Tail 50 -Wait" -ForegroundColor Gray
Write-Host "   Check API:            curl http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host "   View stats:           curl http://localhost:3000/api/stats" -ForegroundColor Gray
Write-Host ""

Write-Host "Press Ctrl+C to exit monitoring" -ForegroundColor Cyan
