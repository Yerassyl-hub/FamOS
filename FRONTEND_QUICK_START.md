# Быстрый старт для фронтенда FamOS

## 🚀 Промпт для создания фронтенда

Создай современное веб-приложение для управления FamOS - системой автоматизации WhatsApp с AI-ассистентом.

## Техническое задание

### Стек
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** для стилей
- **React Query (TanStack Query)** для API
- **Recharts** для графиков
- **Axios** для HTTP

### API Base URL
```
http://localhost:3000/api
```

## Основные страницы

### 1. Dashboard (`/`)
- Статус WhatsApp (подключен/не подключен, QR код)
- Карточки статистики (сообщения, чаты, автоответы)
- Быстрые действия (синхронизация, анализ стиля)
- Последние отчеты

### 2. WhatsApp Status (`/whatsapp`)
- Статус подключения
- QR код для сканирования
- Кнопки управления (переподключить, отключить)
- История ошибок

### 3. Чаты (`/chats`)
- Список всех чатов
- Поиск и фильтры
- Переход к сообщениям

### 4. Сообщения (`/chats/[chatId]`)
- История сообщений
- Пагинация
- Поиск

### 5. Автоответы (`/auto-reply`)
- Переключатель включить/выключить
- Статус
- Статистика автоответов

### 6. Анализ стиля (`/style`)
- Кнопка запуска анализа
- Профиль стиля (фразы, статистика, графики)

### 7. Отчеты (`/reports`)
- Календарь отчетов
- Список отчетов
- Детальный просмотр с графиками

## Критически важные API endpoints

### Статус
```typescript
GET /api/status        // Статус сервера (НЕ /status!)
GET /api/health        // Health check
GET /api/stats         // Общая статистика
```

### WhatsApp
```typescript
GET /api/whatsapp/status      // Статус WhatsApp + QR код
POST /api/whatsapp/reconnect  // Переподключить
POST /api/whatsapp/disconnect // Отключить
```

### Автоответы
```typescript
GET /api/auto-reply           // Статус
POST /api/auto-reply          // { enabled: true/false }
```

## Примеры кода

### React Hook для WhatsApp статуса
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: async () => {
      const { data } = await api.getWhatsAppStatus();
      return data;
    },
    refetchInterval: 5000, // обновлять каждые 5 секунд
  });
};

export const useReconnectWhatsApp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.reconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] });
    },
  });
};
```

### Компонент переключателя автоответов
```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function AutoReplyToggle() {
  const queryClient = useQueryClient();
  
  const { data: status } = useQuery({
    queryKey: ['auto-reply'],
    queryFn: async () => {
      const { data } = await api.getAutoReplyStatus();
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => api.toggleAutoReply(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-reply'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate(!status?.autoReplyEnabled);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={status?.autoReplyEnabled || false}
          onChange={handleToggle}
          disabled={toggleMutation.isPending}
          className="sr-only peer"
        />
        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium">
          Автоответы {status?.autoReplyEnabled ? 'включены' : 'выключены'}
        </span>
      </label>
    </div>
  );
}
```

### Компонент статуса WhatsApp
```tsx
'use client';

import { useWhatsAppStatus, useReconnectWhatsApp } from '@/hooks/useWhatsApp';
import QRCode from 'qrcode.react';

export function WhatsAppStatusCard() {
  const { data: status, isLoading } = useWhatsAppStatus();
  const reconnect = useReconnectWhatsApp();

  if (isLoading) return <div>Загрузка...</div>;

  const statusColors = {
    ready: 'bg-green-500',
    authenticated: 'bg-green-500',
    connecting: 'bg-yellow-500',
    disconnected: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">WhatsApp</h2>
        <div className={`w-3 h-3 rounded-full ${statusColors[status?.status] || 'bg-gray-500'}`} />
      </div>

      {status?.status === 'connecting' && status.qrCode && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600 mb-2">Отсканируйте QR код:</p>
          <div className="flex justify-center">
            <QRCode value={status.qrCode} size={200} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm">
          Статус: <span className="font-semibold">{status?.status}</span>
        </p>
        {status?.lastError && (
          <p className="text-sm text-red-600">Ошибка: {status.lastError}</p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => reconnect.mutate()}
          disabled={reconnect.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Переподключить
        </button>
      </div>
    </div>
  );
}
```

## Важные замечания

1. **Все API endpoints начинаются с `/api`**:
   - ✅ `GET /api/status`
   - ❌ `GET /status` (вызовет 404)

2. **CORS настроен** - можно делать запросы с любого порта

3. **WhatsApp QR код** доступен через `GET /api/whatsapp/status` в поле `qrCode`

4. **Автоответы** - простой toggle, статус через `GET /api/auto-reply`

5. **Real-time обновления** - используйте `refetchInterval` в React Query

## Структура проекта

```
app/
├── layout.tsx
├── page.tsx                    # Dashboard
├── whatsapp/
│   └── page.tsx                # WhatsApp статус
├── chats/
│   ├── page.tsx
│   └── [chatId]/
│       └── page.tsx
├── auto-reply/
│   └── page.tsx
├── style/
│   └── page.tsx
├── reports/
│   ├── page.tsx
│   └── [date]/
│       └── page.tsx
└── api/
    └── client.ts               # Axios клиент
```

## Начни с этого

1. Создай Next.js проект
2. Настрой API client
3. Создай Dashboard с WhatsApp статусом
4. Добавь переключатель автоответов
5. Остальные страницы по мере необходимости

**Готово! Бэкенд полностью готов, все endpoints работают.**
