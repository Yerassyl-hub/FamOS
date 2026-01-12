# Настройка API для фронтенда

## Проблема: Фронтенд не может получить данные

Если фронтенд получает ошибки при обращении к API, проверьте следующее:

## 1. Правильный API URL

### ❌ Неправильно
```javascript
// Не используйте GitHub URL!
fetch('https://github.com/Yerassyl-hub/FamOS/api/health')

// Не используйте относительный путь без префикса
fetch('/health')
```

### ✅ Правильно
```javascript
// Локальная разработка
const API_URL = 'http://localhost:3000/api';

// Или через переменную окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

fetch(`${API_URL}/health`)
```

## 2. Настройка переменных окружения

### Next.js (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### React/Vite (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Использование в коде
```typescript
// Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Vite/React
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

## 3. API Client пример

```typescript
// lib/api/client.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Добавить interceptors для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export const api = {
  health: () => apiClient.get('/health'),
  status: () => apiClient.get('/status'),
  whatsapp: {
    getStatus: () => apiClient.get('/whatsapp/status'),
    generateQR: () => apiClient.post('/whatsapp/generate-qr'),
    reconnect: () => apiClient.post('/whatsapp/reconnect'),
    disconnect: () => apiClient.post('/whatsapp/disconnect'),
  },
  autoReply: {
    getStatus: () => apiClient.get('/auto-reply'),
    toggle: (enabled: boolean) => apiClient.post('/auto-reply', { enabled }),
  },
  stats: () => apiClient.get('/stats'),
  chats: {
    getAll: () => apiClient.get('/chats'),
    getMessages: (chatId: string, limit = 50, skip = 0) =>
      apiClient.get(`/chats/${chatId}/messages?limit=${limit}&skip=${skip}`),
  },
  reports: {
    getAll: (limit = 7) => apiClient.get(`/reports?limit=${limit}`),
    getByDate: (date: string) => apiClient.get(`/reports/${date}`),
  },
  style: {
    get: (userId = 'default') => apiClient.get(`/style?userId=${userId}`),
    analyze: (userId?: string) => apiClient.post('/analyze-style', { userId }),
  },
  sync: {
    chats: () => apiClient.post('/sync-chats'),
  },
};
```

## 4. Проверка подключения

### Тест подключения
```typescript
// Проверить, доступен ли API
async function checkAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    console.log('✅ API доступен:', data);
    return true;
  } catch (error) {
    console.error('❌ API недоступен:', error);
    return false;
  }
}
```

## 5. CORS настройки

Бэкенд настроен для работы с любым фронтендом:
- ✅ CORS включен для всех источников в разработке
- ✅ Поддерживаются все необходимые методы
- ✅ Разрешены нужные заголовки

Если все еще есть проблемы с CORS:
1. Убедитесь, что бэкенд запущен на `localhost:3000`
2. Проверьте, что фронтенд обращается к правильному URL
3. Проверьте консоль браузера на ошибки CORS

## 6. Типичные ошибки

### Ошибка: "Failed to fetch"
**Причина:** Бэкенд не запущен или неправильный URL  
**Решение:** Запустите бэкенд и проверьте URL

### Ошибка: "CORS policy"
**Причина:** Проблемы с CORS (но должно работать, т.к. настроено для всех)  
**Решение:** Проверьте настройки CORS в `main.ts`

### Ошибка: 404 Not Found
**Причина:** Неправильный endpoint или бэкенд не перезапущен  
**Решение:** Проверьте список endpoints и перезапустите бэкенд

## 7. Быстрая проверка

```bash
# 1. Проверить, что бэкенд запущен
curl http://localhost:3000/api/health

# 2. Проверить CORS (из браузера консоли)
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## 8. Production настройки

Для продакшена:

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

И в бэкенде:
```env
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```
