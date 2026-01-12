# ✅ Чеклист API Endpoints для фронтенда

## Статус всех endpoints

### ✅ Реализованные и работающие

#### Статус и здоровье
- ✅ `GET /api/health` - Проверка здоровья API
- ✅ `GET /api/status` - Статус сервера (алиас для health)

#### WhatsApp
- ✅ `GET /api/whatsapp/status` - Статус подключения WhatsApp
- ✅ `POST /api/whatsapp/reconnect` - Переподключить WhatsApp
- ✅ `POST /api/whatsapp/disconnect` - Отключить WhatsApp
- ✅ `POST /api/whatsapp/generate-qr` - Генерация QR кода

#### Автоответы
- ✅ `GET /api/auto-reply` - Статус автоответов
- ✅ `POST /api/auto-reply` - Включить/выключить автоответы

#### Статистика
- ✅ `GET /api/stats` - Общая статистика

#### Чаты и сообщения
- ✅ `GET /api/chats` - Список всех чатов
- ✅ `GET /api/chats/:chatId/messages` - Сообщения чата

#### Отчеты
- ✅ `GET /api/reports` - Последние отчеты
- ✅ `GET /api/reports/:date` - Отчет за дату

#### Стиль общения
- ✅ `GET /api/style` - Профиль стиля
- ✅ `POST /api/analyze-style` - Проанализировать стиль

#### Управление
- ✅ `POST /api/sync-chats` - Синхронизация чатов

## Форматы ответов

### GET /api/health
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T09:30:00.000Z"
}
```

### GET /api/whatsapp/status
```json
{
  "status": "ready" | "connecting" | "disconnected" | "authenticated",
  "isConnected": true,
  "qrCode": "QR_CODE_STRING_OR_NULL",
  "lastError": null,
  "isConnecting": false
}
```

### POST /api/whatsapp/generate-qr
```json
{
  "success": true,
  "qrCode": "QR_CODE_STRING_OR_NULL",
  "message": "QR code generated"
}
```

### POST /api/whatsapp/disconnect
```json
{
  "success": true,
  "message": "WhatsApp disconnected successfully"
}
```

## Проверка endpoints

Все endpoints можно проверить:

```bash
# Health
curl http://localhost:3000/api/health

# WhatsApp Status
curl http://localhost:3000/api/whatsapp/status

# Generate QR
curl -X POST http://localhost:3000/api/whatsapp/generate-qr

# Disconnect
curl -X POST http://localhost:3000/api/whatsapp/disconnect
```

## Важно для фронтенда

1. **Все endpoints начинаются с `/api`** - не забывайте префикс!
2. **CORS настроен** - можно делать запросы с любого порта
3. **QR код** доступен через `GET /api/whatsapp/status` в поле `qrCode`
4. **Если endpoint возвращает 404** - проверьте, что бэкенд запущен и перезапущен после изменений

## Если получаете 404

1. Убедитесь, что бэкенд запущен: `npm run start:dev`
2. Проверьте URL - должен начинаться с `/api`
3. Проверьте, что изменения закомпилированы: `npm run build`
4. Перезапустите бэкенд после изменений
