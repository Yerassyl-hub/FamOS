# 📘 Детальное руководство по подключению фронтенда к API

## 🎯 Главное правило

**ВСЕ запросы идут на: `http://localhost:3000/api`**

Префикс `/api` уже включен в URL, не добавляйте его дважды!

---

## ✅ Правильная настройка

### 1. Создайте файл переменных окружения

#### Next.js 14+ (App Router)
**Файл:** `.env.local` (в корне проекта фронтенда)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### Vite / React
**Файл:** `.env` (в корне проекта фронтенда)
```env
VITE_API_URL=http://localhost:3000/api
```

#### Create React App
**Файл:** `.env` (в корне проекта фронтенда)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 2. Создайте API Client

#### Next.js / TypeScript
**Файл:** `lib/api/client.ts`

```typescript
import axios from 'axios';

// ✅ ПРАВИЛЬНО: Используем переменную окружения
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Создаем axios instance
export const apiClient = axios.create({
  baseURL: API_URL, // Уже содержит /api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.error('❌ Endpoint not found:', error.config?.url);
      console.error('Проверьте, что бэкенд запущен и endpoint существует');
    }
    return Promise.reject(error);
  }
);

// ✅ ПРАВИЛЬНО: Все методы БЕЗ префикса /api (он уже в baseURL)
export const api = {
  // Статус
  health: () => apiClient.get('/health'),
  status: () => apiClient.get('/status'),
  
  // WhatsApp
  whatsapp: {
    getStatus: () => apiClient.get('/whatsapp/status'),
    generateQR: () => apiClient.post('/whatsapp/generate-qr'),
    reconnect: () => apiClient.post('/whatsapp/reconnect'),
    disconnect: () => apiClient.post('/whatsapp/disconnect'),
  },
  
  // Автоответы
  autoReply: {
    getStatus: () => apiClient.get('/auto-reply'),
    toggle: (enabled: boolean) => 
      apiClient.post('/auto-reply', { enabled }),
  },
  
  // Статистика
  stats: () => apiClient.get('/stats'),
  
  // Чаты
  chats: {
    getAll: () => apiClient.get('/chats'),
    getMessages: (chatId: string, limit = 50, skip = 0) =>
      apiClient.get(`/chats/${chatId}/messages?limit=${limit}&skip=${skip}`),
  },
  
  // Отчеты
  reports: {
    getAll: (limit = 7) => apiClient.get(`/reports?limit=${limit}`),
    getByDate: (date: string) => apiClient.get(`/reports/${date}`),
  },
  
  // Стиль
  style: {
    get: (userId = 'default') => apiClient.get(`/style?userId=${userId}`),
    analyze: (userId?: string) => 
      apiClient.post('/analyze-style', { userId }),
  },
  
  // Синхронизация
  sync: {
    chats: () => apiClient.post('/sync-chats'),
  },
};
```

#### Vite / React
**Файл:** `src/lib/api/client.ts`

```typescript
import axios from 'axios';

// ✅ ПРАВИЛЬНО: Используем переменную окружения Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL, // Уже содержит /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... остальной код такой же
```

---

## ❌ ЧАСТЫЕ ОШИБКИ (НЕ ДЕЛАЙТЕ ТАК!)

### Ошибка 1: Двойной префикс /api
```typescript
// ❌ НЕПРАВИЛЬНО
const API_URL = 'http://localhost:3000/api';
apiClient.get('/api/health'); // Получится: /api/api/health ❌

// ✅ ПРАВИЛЬНО
const API_URL = 'http://localhost:3000/api';
apiClient.get('/health'); // Получится: /api/health ✅
```

### Ошибка 2: Относительные пути без /api
```typescript
// ❌ НЕПРАВИЛЬНО
fetch('/health') // Будет искать на том же порту, что и фронтенд

// ✅ ПРАВИЛЬНО
fetch('http://localhost:3000/api/health')
// или
fetch(`${API_URL}/health`)
```

### Ошибка 3: Запросы к GitHub
```typescript
// ❌ НЕПРАВИЛЬНО
fetch('https://github.com/Yerassyl-hub/FamOS/api/health')

// ✅ ПРАВИЛЬНО
fetch('http://localhost:3000/api/health')
```

### Ошибка 4: Хардкод URL в компонентах
```typescript
// ❌ НЕПРАВИЛЬНО
function Component() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('http://localhost:3000/api/health') // Хардкод!
      .then(r => r.json())
      .then(setData);
  }, []);
}

// ✅ ПРАВИЛЬНО
import { api } from '@/lib/api/client';

function Component() {
  const { data } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health().then(r => r.data),
  });
}
```

---

## 📝 Примеры использования

### React Query Hook

**Файл:** `hooks/useApi.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// ✅ Health check
export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.health();
      return data;
    },
    refetchInterval: 30000,
  });
};

// ✅ WhatsApp Status
export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const { data } = await api.whatsapp.getStatus();
      return data;
    },
    refetchInterval: 5000, // Обновлять каждые 5 секунд
  });
};

// ✅ Auto Reply
export const useAutoReply = () => {
  const queryClient = useQueryClient();
  
  const { data: status } = useQuery({
    queryKey: ['auto-reply'],
    queryFn: async () => {
      const { data } = await api.autoReply.getStatus();
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => api.autoReply.toggle(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-reply'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return {
    enabled: status?.autoReplyEnabled || false,
    toggle: (enabled: boolean) => toggleMutation.mutate(enabled),
    isLoading: toggleMutation.isPending,
  };
};

// ✅ Stats
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.stats();
      return data;
    },
    refetchInterval: 30000,
  });
};
```

### Компонент с использованием

**Файл:** `components/Dashboard.tsx`

```tsx
'use client';

import { useHealth, useStats, useAutoReply, useWhatsAppStatus } from '@/hooks/useApi';

export function Dashboard() {
  const { data: health } = useHealth();
  const { data: stats } = useStats();
  const { enabled: autoReplyEnabled, toggle: toggleAutoReply } = useAutoReply();
  const { data: whatsappStatus } = useWhatsAppStatus();

  return (
    <div>
      {/* Health Status */}
      <div>
        <p>API Status: {health?.status}</p>
      </div>

      {/* WhatsApp Status */}
      <div>
        <p>WhatsApp: {whatsappStatus?.isConnected ? '✅ Подключено' : '❌ Не подключено'}</p>
        {whatsappStatus?.qrCode && (
          <QRCode value={whatsappStatus.qrCode} />
        )}
      </div>

      {/* Auto Reply Toggle */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={autoReplyEnabled}
            onChange={(e) => toggleAutoReply(e.target.checked)}
          />
          Автоответы
        </label>
      </div>

      {/* Stats */}
      <div>
        <p>Сообщений: {stats?.totalMessages}</p>
        <p>Чатов: {stats?.totalChats}</p>
      </div>
    </div>
  );
}
```

---

## 🔍 Проверка настройки

### Шаг 1: Проверьте переменную окружения

```typescript
// В консоли браузера или в коде
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// Должно вывести: http://localhost:3000/api
```

### Шаг 2: Проверьте подключение

```typescript
// В консоли браузера
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Должно вывести: { status: 'ok', timestamp: '...' }
```

### Шаг 3: Проверьте CORS

Если видите ошибку CORS в консоли:
1. Убедитесь, что бэкенд запущен
2. Проверьте, что используете правильный URL
3. Перезапустите бэкенд после изменений CORS

---

## 📋 Чеклист для фронтенда

- [ ] Создан файл `.env.local` (Next.js) или `.env` (Vite)
- [ ] Установлена переменная `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
- [ ] Создан API client с правильным `baseURL`
- [ ] Все запросы используют API client (не хардкод)
- [ ] Нет двойного префикса `/api` в запросах
- [ ] Нет относительных путей без `/api`
- [ ] Нет запросов к GitHub
- [ ] Бэкенд запущен на `http://localhost:3000`
- [ ] Фронтенд запущен на другом порту (например, `3001`)

---

## 🚀 Быстрый старт

1. **Создайте `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. **Создайте `lib/api/client.ts`** (скопируйте код выше)

3. **Создайте `hooks/useApi.ts`** (скопируйте код выше)

4. **Используйте в компонентах:**
   ```tsx
   import { useStats } from '@/hooks/useApi';
   
   function MyComponent() {
     const { data: stats } = useStats();
     return <div>{stats?.totalMessages}</div>;
   }
   ```

5. **Перезапустите dev сервер** после создания `.env.local`

---

## ⚠️ Важные замечания

1. **Префикс `/api` уже в `baseURL`** - не добавляйте его в запросах
2. **Перезапустите фронтенд** после изменения `.env.local`
3. **Бэкенд должен быть запущен** на порту 3000
4. **Используйте переменные окружения** - не хардкодите URL

---

## 📞 Если что-то не работает

1. Проверьте консоль браузера на ошибки
2. Проверьте, что бэкенд запущен: `curl http://localhost:3000/api/health`
3. Проверьте переменную окружения: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Убедитесь, что используете правильный префикс для вашего фреймворка:
   - Next.js: `NEXT_PUBLIC_`
   - Vite: `VITE_`
   - CRA: `REACT_APP_`

---

## ✅ Итог

**Все запросы идут на:** `http://localhost:3000/api`

**Префикс `/api` включен автоматически** в `baseURL`

**Используется переменная окружения** (можно изменить в `.env.local`)

**Нет хардкода URL** в коде

**Нет относительных путей**

**Нет запросов к GitHub**

Фронтенд готов к работе с бэкендом! 🚀
