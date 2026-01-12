# 🎨 Инструкция для фронтенда FamOS

## 📋 Что нужно знать

- **Бэкенд работает на:** `http://192.168.8.59:3000/api`
- **Ваш IP адрес:** Замените `192.168.8.59` на IP ноутбука с бэкендом (если изменился)

## 🚀 Шаг 1: Создайте Next.js проект

```bash
npx create-next-app@latest famos-frontend --typescript --tailwind --app
cd famos-frontend
```

Или используйте ваш существующий проект.

## 🔧 Шаг 2: Настройте переменные окружения

### Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_API_URL=http://192.168.8.59:3000/api
```

⚠️ **Важно:** Замените `192.168.8.59` на реальный IP адрес ноутбука с бэкендом!

## 📦 Шаг 3: Установите зависимости

```bash
npm install axios @tanstack/react-query
```

Или если используете другие библиотеки:
```bash
npm install axios
# или
npm install fetch
```

## 🔌 Шаг 4: Создайте API клиент

### Создайте файл `lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы для API ответов
export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface StatsResponse {
  totalMessages: number;
  totalChats: number;
  activeChats: number;
  autoReplyEnabled: boolean;
}

export interface WhatsAppStatusResponse {
  status: 'disconnected' | 'connecting' | 'authenticated' | 'ready' | 'qr_code';
  isConnected: boolean;
  qrCode: string | null;
  lastError: string | null;
  isConnecting: boolean;
}

export interface Chat {
  chatId: string;
  name: string;
  isGroup: boolean;
  messageCount: number;
  lastMessageAt?: string;
}

export interface Message {
  messageId: string;
  chatId: string;
  sender: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
}

// API функции
export const api = {
  // Health
  health: () => apiClient.get<HealthResponse>('/health'),
  
  // Stats
  getStats: () => apiClient.get<StatsResponse>('/stats'),
  
  // WhatsApp
  getWhatsAppStatus: () => apiClient.get<WhatsAppStatusResponse>('/whatsapp/status'),
  reconnectWhatsApp: () => apiClient.post('/whatsapp/reconnect'),
  disconnectWhatsApp: () => apiClient.post('/whatsapp/disconnect'),
  generateQrCode: () => apiClient.post<{ success: boolean; qrCode: string | null }>('/whatsapp/generate-qr'),
  
  // Auto-reply
  getAutoReplyStatus: () => apiClient.get<{ autoReplyEnabled: boolean }>('/auto-reply'),
  toggleAutoReply: (enabled: boolean) => apiClient.post('/auto-reply', { enabled }),
  
  // Chats
  getChats: () => apiClient.get<{ chats: Chat[] }>('/chats'),
  getChatMessages: (chatId: string, limit = 50, skip = 0) => 
    apiClient.get<{ messages: Message[] }>(`/chats/${chatId}/messages`, {
      params: { limit, skip },
    }),
  
  // Reports
  getReports: (limit = 10) => apiClient.get('/reports', { params: { limit } }),
  getReport: (date: string) => apiClient.get(`/reports/${date}`),
  
  // Style
  getStyle: (userId = 'default') => apiClient.get(`/style?userId=${userId}`),
  analyzeStyle: (userId = 'default') => apiClient.post('/analyze-style', { userId }),
  
  // Sync
  syncChats: () => apiClient.post('/sync-chats'),
};
```

## 🎣 Шаг 5: Создайте React Hooks (опционально, если используете React Query)

### Создайте файл `hooks/useApi.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Health
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health().then(res => res.data),
  });
}

// Stats
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats().then(res => res.data),
    refetchInterval: 5000, // Обновлять каждые 5 секунд
  });
}

// WhatsApp Status
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: () => api.getWhatsAppStatus().then(res => res.data),
    refetchInterval: 3000, // Обновлять каждые 3 секунды
  });
}

// Chats
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => api.getChats().then(res => res.data.chats),
  });
}

// Chat Messages
export function useChatMessages(chatId: string) {
  return useQuery({
    queryKey: ['chats', chatId, 'messages'],
    queryFn: () => api.getChatMessages(chatId).then(res => res.data.messages),
    enabled: !!chatId,
  });
}

// Auto-reply
export function useAutoReply() {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['auto-reply'],
    queryFn: () => api.getAutoReplyStatus().then(res => res.data),
  });
  
  const mutation = useMutation({
    mutationFn: (enabled: boolean) => api.toggleAutoReply(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-reply'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
  
  return {
    enabled: data?.autoReplyEnabled ?? false,
    toggle: mutation.mutate,
    isLoading: mutation.isPending,
  };
}

// WhatsApp Actions
export function useWhatsAppActions() {
  const queryClient = useQueryClient();
  
  const reconnect = useMutation({
    mutationFn: () => api.reconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    },
  });
  
  const disconnect = useMutation({
    mutationFn: () => api.disconnectWhatsApp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    },
  });
  
  const generateQr = useMutation({
    mutationFn: () => api.generateQrCode(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
    },
  });
  
  return {
    reconnect: reconnect.mutate,
    disconnect: disconnect.mutate,
    generateQr: generateQr.mutate,
    isLoading: reconnect.isPending || disconnect.isPending || generateQr.isPending,
  };
}
```

## 📄 Шаг 6: Создайте компоненты

### Пример: Dashboard (`app/page.tsx`):

```typescript
'use client';

import { useStats, useWhatsAppStatus } from '@/hooks/useApi';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: whatsapp, isLoading: whatsappLoading } = useWhatsAppStatus();
  
  if (statsLoading || whatsappLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">FamOS Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Messages</h3>
          <p className="text-2xl font-bold">{stats?.totalMessages || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Total Chats</h3>
          <p className="text-2xl font-bold">{stats?.totalChats || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Active Chats</h3>
          <p className="text-2xl font-bold">{stats?.activeChats || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-500">Auto-reply</h3>
          <p className="text-2xl font-bold">
            {stats?.autoReplyEnabled ? '✅ On' : '❌ Off'}
          </p>
        </div>
      </div>
      
      {/* WhatsApp Status */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2">WhatsApp Status</h2>
        <p>Status: <span className="font-bold">{whatsapp?.status}</span></p>
        <p>Connected: {whatsapp?.isConnected ? '✅ Yes' : '❌ No'}</p>
        {whatsapp?.qrCode && (
          <div className="mt-4">
            <p>QR Code available</p>
            <img src={whatsapp.qrCode} alt="QR Code" />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Пример: Chats List (`app/chats/page.tsx`):

```typescript
'use client';

import { useChats } from '@/hooks/useApi';
import Link from 'next/link';

export default function ChatsPage() {
  const { data: chats, isLoading } = useChats();
  
  if (isLoading) {
    return <div>Loading chats...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Chats</h1>
      
      <div className="space-y-2">
        {chats?.map((chat) => (
          <Link
            key={chat.chatId}
            href={`/chats/${chat.chatId}`}
            className="block bg-white p-4 rounded shadow hover:bg-gray-50"
          >
            <h3 className="font-bold">{chat.name}</h3>
            <p className="text-sm text-gray-500">
              {chat.messageCount} messages
              {chat.isGroup && ' • Group'}
            </p>
            {chat.lastMessageAt && (
              <p className="text-xs text-gray-400">
                Last message: {new Date(chat.lastMessageAt).toLocaleString()}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## ⚙️ Шаг 7: Настройте React Query Provider (если используете)

### Создайте файл `app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Обновите `app/layout.tsx`:

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## ✅ Шаг 8: Проверьте подключение

### Запустите фронтенд:

```bash
npm run dev
```

### Откройте в браузере:

```
http://localhost:3000
```

### Проверьте консоль браузера:

Откройте DevTools (F12) → Console. Не должно быть ошибок подключения к API.

## 🐛 Troubleshooting

### Проблема: "Network Error" или "Connection refused"

**Решение:**
1. Проверьте, что бэкенд запущен на `192.168.8.59:3000`
2. Проверьте IP адрес в `.env.local`
3. Убедитесь, что оба ноутбука в одной сети

### Проблема: "CORS error"

**Решение:**
1. Убедитесь, что бэкенд запущен в development режиме
2. Проверьте, что используете правильный URL в `.env.local`

### Проблема: "404 Not Found"

**Решение:**
1. Убедитесь, что используете `/api` в URL:
   ```typescript
   // ✅ Правильно
   const API_URL = 'http://192.168.8.59:3000/api';
   
   // ❌ Неправильно
   const API_URL = 'http://192.168.8.59:3000';
   ```

## 📝 Быстрый старт (без React Query)

Если не хотите использовать React Query, можно использовать простой fetch:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getStats() {
  const response = await fetch(`${API_URL}/stats`);
  return response.json();
}

// В компоненте
'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    getStats().then(setStats);
  }, []);
  
  if (!stats) return <div>Loading...</div>;
  
  return <div>{/* ... */}</div>;
}
```

## 🎯 Итог

1. ✅ Создайте `.env.local` с IP адресом бэкенда
2. ✅ Создайте API клиент (`lib/api.ts`)
3. ✅ Создайте компоненты с использованием API
4. ✅ Запустите фронтенд и проверьте подключение

## 📚 Дополнительная документация

- `FRONTEND_PROMPT.md` - полная спецификация фронтенда
- `API_DOCUMENTATION.md` - все API endpoints
- `FRONTEND_NETWORK_SETUP.md` - настройка для сети
