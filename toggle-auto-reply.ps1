# Скрипт для включения/выключения автоответов

param(
    [bool]$Enabled = $true
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Управление автоответами" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$body = @{ enabled = $Enabled } | ConvertTo-Json
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auto-reply" -ContentType "application/json" -Body $body

if ($response.autoReplyEnabled) {
    Write-Host "✅ Автоответы ВКЛЮЧЕНЫ" -ForegroundColor Green
    Write-Host "`nСистема будет автоматически отвечать на входящие сообщения`n" -ForegroundColor Gray
} else {
    Write-Host "❌ Автоответы ВЫКЛЮЧЕНЫ" -ForegroundColor Red
    Write-Host "`nАвтоматические ответы отключены`n" -ForegroundColor Gray
}
