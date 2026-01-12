# Скрипт для анализа стиля общения

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Анализ стиля общения" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Запускаю анализ..." -ForegroundColor Yellow

try {
    $body = @{} | ConvertTo-Json
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/analyze-style" -ContentType "application/json" -Body $body
    
    Write-Host "`n✅ Анализ завершен успешно!`n" -ForegroundColor Green
    Write-Host "Результаты:" -ForegroundColor Cyan
    Write-Host "  Проанализировано сообщений: $($response.analyzedMessages)" -ForegroundColor White
    Write-Host "  Статус: $($response.success)" -ForegroundColor White
    
    Write-Host "`nПрофиль стиля создан. Теперь можно включить автоответы!`n" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Ошибка при анализе:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nУбедитесь, что:" -ForegroundColor Yellow
    Write-Host "  1. Backend запущен (npm run start:dev)" -ForegroundColor Gray
    Write-Host "  2. В базе есть ваши сообщения" -ForegroundColor Gray
}
