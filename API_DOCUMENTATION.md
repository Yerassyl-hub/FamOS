# API Документация для фронтенда

## Базовый URL
```
http://localhost:3000/api
```

## CORS
Бэкенд настроен для работы с фронтендом:
- CORS включен для всех источников (в разработке)
- Поддерживаются методы: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Разрешены заголовки: Content-Type, Authorization

## Endpoints для управления автоответами

### Получить статус автоответов
```http
GET /api/auto-reply
```

**Response:**
```json
{
  "autoReplyEnabled": true,
  "timestamp": "2026-01-12T09:15:00.000Z"
}
```

### Включить/выключить автоответы
```http
POST /api/auto-reply
Content-Type: application/json

{
  "enabled": true
}
```

**Response (успех):**
```json
{
  "success": true,
  "autoReplyEnabled": true,
  "message": "Auto-reply enabled successfully"
}
```

**Response (ошибка):**
```json
{
  "success": false,
  "error": "enabled must be a boolean value"
}
```

## Примеры использования для фронтенда

### JavaScript/Fetch
```javascript
// Получить статус
async function getAutoReplyStatus() {
  const response = await fetch('http://localhost:3000/api/auto-reply');
  const data = await response.json();
  return data.autoReplyEnabled;
}

// Включить/выключить
async function toggleAutoReply(enabled) {
  const response = await fetch('http://localhost:3000/api/auto-reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enabled }),
  });
  const data = await response.json();
  return data;
}
```

### React Hook
```typescript
import { useState, useEffect } from 'react';

function useAutoReply() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/auto-reply')
      .then(res => res.json())
      .then(data => {
        setEnabled(data.autoReplyEnabled);
        setLoading(false);
      });
  }, []);

  const toggle = async (newValue: boolean) => {
    setLoading(true);
    const response = await fetch('http://localhost:3000/api/auto-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newValue }),
    });
    const data = await response.json();
    if (data.success) {
      setEnabled(data.autoReplyEnabled);
    }
    setLoading(false);
    return data;
  };

  return { enabled, loading, toggle };
}
```

### React Component Example
```tsx
import React from 'react';
import { useAutoReply } from './hooks/useAutoReply';

function AutoReplyToggle() {
  const { enabled, loading, toggle } = useAutoReply();

  const handleToggle = async () => {
    await toggle(!enabled);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          disabled={loading}
        />
        Автоответы {enabled ? 'включены' : 'выключены'}
      </label>
    </div>
  );
}
```

## Все доступные endpoints

### Управление
- `GET /api/health` - Проверка статуса
- `GET /api/stats` - Общая статистика
- `POST /api/sync-chats` - Синхронизация чатов
- `POST /api/analyze-style` - Анализ стиля
- `GET /api/style` - Профиль стиля

### Автоответы
- `GET /api/auto-reply` - Статус автоответов
- `POST /api/auto-reply` - Включить/выключить

### Отчеты
- `GET /api/reports` - Последние отчеты
- `GET /api/reports/:date` - Отчет за дату

### Чаты и сообщения
- `GET /api/chats` - Список чатов
- `GET /api/chats/:chatId/messages` - Сообщения чата

## Обработка ошибок

Все endpoints возвращают стандартные HTTP коды:
- `200` - Успех
- `400` - Неверный запрос
- `500` - Ошибка сервера

Пример обработки:
```javascript
try {
  const response = await fetch('http://localhost:3000/api/auto-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error);
}
```
