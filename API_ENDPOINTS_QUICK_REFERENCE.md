# 📋 Быстрая справка по API endpoints

## ⚠️ Важно!

**`/api` - это префикс, а не endpoint!**

❌ **Неправильно:**
```
http://localhost:3000/api
```

✅ **Правильно:**
```
http://localhost:3000/api/health
http://localhost:3000/api/stats
http://localhost:3000/api/whatsapp/status
```

## ✅ Рабочие endpoints

### Статус и здоровье
- `GET /api/health` - Проверка работы бэкенда
- `GET /api/status` - Статус (аналог health)

### Статистика
- `GET /api/stats` - Общая статистика (сообщения, чаты, автоответы)

### WhatsApp
- `GET /api/whatsapp/status` - Статус подключения WhatsApp
- `POST /api/whatsapp/reconnect` - Переподключить WhatsApp
- `POST /api/whatsapp/disconnect` - Отключить WhatsApp
- `POST /api/whatsapp/generate-qr` - Сгенерировать QR код

### Автоответы
- `GET /api/auto-reply` - Статус автоответов
- `POST /api/auto-reply` - Включить/выключить автоответы

### Чаты
- `GET /api/chats` - Список всех чатов
- `GET /api/chats/:chatId/messages` - Сообщения чата

### Отчеты
- `GET /api/reports` - Список отчетов
- `GET /api/reports/:date` - Отчет за конкретную дату

### Стиль
- `GET /api/style` - Профиль стиля общения
- `POST /api/analyze-style` - Проанализировать стиль

### Управление
- `POST /api/sync-chats` - Синхронизировать чаты

## 🧪 Тестирование в браузере

### Откройте в браузере:

```
http://localhost:3000/api/health
```

**Должен вернуть:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T10:34:05.300Z"
}
```

### Другие примеры:

```
http://localhost:3000/api/stats
http://localhost:3000/api/whatsapp/status
http://localhost:3000/api/chats
```

## 🔧 Проверка через curl

```bash
# Health
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats

# WhatsApp Status
curl http://localhost:3000/api/whatsapp/status
```

## 📝 Для фронтенда

### Правильный API URL:

```typescript
// ✅ Правильно
const API_URL = 'http://localhost:3000/api';

// Использование:
fetch(`${API_URL}/health`)  // → http://localhost:3000/api/health
fetch(`${API_URL}/stats`)   // → http://localhost:3000/api/stats
```

### ❌ Неправильно:

```typescript
// Не делайте так:
fetch('http://localhost:3000/api')  // ❌ 404 ошибка!
```

## 🎯 Итог

- `/api` - это префикс для всех endpoints
- Всегда используйте конкретный endpoint: `/api/health`, `/api/stats`, и т.д.
- Для проверки используйте: `http://localhost:3000/api/health`
