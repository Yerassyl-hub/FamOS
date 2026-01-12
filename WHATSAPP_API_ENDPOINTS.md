# WhatsApp API Endpoints для фронтенда

## Проблема: 404 на `/status`

Если фронтенд получает ошибку 404 на `/status`, это означает, что используется неправильный URL.

## Правильные endpoints:

### ✅ Статус сервера
```
GET /api/status
GET /api/health
```

### ✅ Статус WhatsApp
```
GET /api/whatsapp/status
```

**Response:**
```json
{
  "status": "ready" | "connecting" | "disconnected",
  "isConnected": true,
  "qrCode": "QR_CODE_OR_NULL",
  "lastError": null,
  "isConnecting": false
}
```

## Исправление во фронтенде

Если фронтенд обращается к `/status`, нужно изменить на:

```javascript
// ❌ Неправильно
fetch('/status')

// ✅ Правильно
fetch('/api/status')
// или
fetch('http://localhost:3000/api/status')
```

## Все доступные endpoints

### Статус и здоровье
- `GET /api/health` - Проверка здоровья сервера
- `GET /api/status` - Статус сервера (алиас для health)
- `GET /api/stats` - Общая статистика

### WhatsApp
- `GET /api/whatsapp/status` - Статус подключения WhatsApp
- `POST /api/whatsapp/reconnect` - Переподключить WhatsApp
- `POST /api/whatsapp/disconnect` - Отключить WhatsApp

### Автоответы
- `GET /api/auto-reply` - Статус автоответов
- `POST /api/auto-reply` - Включить/выключить автоответы

### Чаты и сообщения
- `GET /api/chats` - Список чатов
- `GET /api/chats/:chatId/messages` - Сообщения чата

### Отчеты
- `GET /api/reports` - Последние отчеты
- `GET /api/reports/:date` - Отчет за дату

### Стиль
- `GET /api/style` - Профиль стиля
- `POST /api/analyze-style` - Проанализировать стиль

## Base URL

Все endpoints должны начинаться с `/api`:
- ✅ `http://localhost:3000/api/status`
- ❌ `http://localhost:3000/status`

## CORS

Бэкенд настроен для работы с фронтендом на любом порту (в разработке).
