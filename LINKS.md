# Прямые ссылки FamOS

## 🌐 API Endpoints

### Основные
- **Health Check**: http://localhost:3000/api/health
- **Статистика**: http://localhost:3000/api/stats
- **Список чатов**: http://localhost:3000/api/chats
- **Статус автоответов**: http://localhost:3000/api/auto-reply

### Управление
- **Синхронизация чатов**: POST http://localhost:3000/api/sync-chats
- **Анализ стиля**: POST http://localhost:3000/api/analyze-style
- **Профиль стиля**: http://localhost:3000/api/style
- **Включить/выключить автоответы**: POST http://localhost:3000/api/auto-reply

### Отчеты
- **Последние отчеты**: http://localhost:3000/api/reports
- **Отчет за дату**: http://localhost:3000/api/reports/2026-01-12
- **Отчеты (7 дней)**: http://localhost:3000/api/reports?limit=7

### Сообщения
- **Сообщения чата**: http://localhost:3000/api/chats/{chatId}/messages
- **Сообщения с пагинацией**: http://localhost:3000/api/chats/{chatId}/messages?limit=50&skip=0

## 📊 Мониторинг

### Docker
- **Статус контейнеров**: `docker ps --filter "name=famos"`
- **Логи MongoDB**: `docker logs -f famos-mongo`
- **Логи Redis**: `docker logs -f famos-redis`
- **Все логи**: `docker-compose logs -f`

### Логи приложения
- **Последние логи**: `Get-Content logs\famos-*.log -Tail 50 -Wait`
- **Папка логов**: `C:\Users\amang\OneDrive\Desktop\FamOS\logs\`

## 🗄️ Базы данных

### MongoDB
- **Connection String**: `mongodb://localhost:27017/famos`
- **Порт**: `27017`
- **Контейнер**: `famos-mongo`
- **Данные**: `C:\Users\amang\OneDrive\Desktop\FamOS\mongo_data\`
- **Подключение**: `docker exec -it famos-mongo mongosh famos`

### Redis
- **Host**: `localhost:6380`
- **Порт**: `6380` (внутри контейнера: `6379`)
- **Контейнер**: `famos-redis`
- **Данные**: `C:\Users\amang\OneDrive\Desktop\FamOS\redis_data\`
- **Подключение**: `docker exec -it famos-redis redis-cli`

## 📁 Файлы и папки

- **Код бэкенда**: `C:\Users\amang\OneDrive\Desktop\FamOS\server\src\`
- **Логи**: `C:\Users\amang\OneDrive\Desktop\FamOS\logs\`
- **MongoDB данные**: `C:\Users\amang\OneDrive\Desktop\FamOS\mongo_data\`
- **Redis данные**: `C:\Users\amang\OneDrive\Desktop\FamOS\redis_data\`
- **WhatsApp сессия**: `C:\Users\amang\OneDrive\Desktop\FamOS\wa_auth_info\`

## 🚀 Быстрые команды

### PowerShell
```powershell
# Мониторинг
.\monitor.ps1

# Запуск всех сервисов
.\start-all.ps1

# Проверка API
Invoke-WebRequest http://localhost:3000/api/health

# Статистика
Invoke-WebRequest http://localhost:3000/api/stats
```

### cURL (если установлен)
```bash
# Health
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats

# Chats
curl http://localhost:3000/api/chats

# Auto-reply status
curl http://localhost:3000/api/auto-reply
```

## 📝 Примеры запросов

### Включить автоответы
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/auto-reply" -ContentType "application/json" -Body '{"enabled":true}'
```

### Запустить синхронизацию
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/sync-chats"
```

### Проанализировать стиль
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/analyze-style" -ContentType "application/json" -Body '{}'
```

## 🔗 GitHub

- **Репозиторий**: https://github.com/Yerassyl-hub/FamOS
- **Issues**: https://github.com/Yerassyl-hub/FamOS/issues
- **Pull Requests**: https://github.com/Yerassyl-hub/FamOS/pulls
