# Промпт для разработки фронтенда FamOS

## Контекст проекта

FamOS (Family Operating System) - это бэкенд-приложение на NestJS для автоматизации WhatsApp с AI-ассистентом. Бэкенд уже реализован и предоставляет REST API. Необходимо создать современный веб-интерфейс для полного использования всех возможностей бэкенда.

## Техническое задание

### Стек технологий
- **React 18+** с **TypeScript**
- **Next.js 14** (App Router) для SSR и оптимизации
- **Tailwind CSS** для стилизации
- **React Query (TanStack Query)** для управления состоянием и кэширования API
- **Recharts** для графиков и визуализации данных
- **Axios** для HTTP запросов
- **React Hook Form** для форм
- **Zod** для валидации

### API Base URL
```
http://localhost:3000/api
```

### Структура приложения

```
app/
├── layout.tsx              # Главный layout
├── page.tsx                # Dashboard (главная страница)
├── chats/
│   ├── page.tsx            # Список всех чатов
│   └── [chatId]/
│       └── page.tsx        # История сообщений чата
├── style/
│   └── page.tsx            # Анализ стиля общения
├── reports/
│   ├── page.tsx            # Список отчетов
│   └── [date]/
│       └── page.tsx        # Детальный отчет
├── settings/
│   └── page.tsx            # Настройки
└── api/
    └── client.ts           # Axios клиент для API
```

## Функциональные требования

### 1. Dashboard (Главная страница - `/`)

**Компоненты:**
- **Stats Cards** - 4 карточки:
  - Всего сообщений (GET /api/stats → totalMessages)
  - Всего чатов (GET /api/stats → totalChats)
  - Активных чатов (GET /api/stats → activeChats)
  - Статус автоответов (GET /api/auto-reply → autoReplyEnabled)

- **Quick Actions** - кнопки:
  - "Синхронизировать чаты" (POST /api/sync-chats)
  - "Проанализировать стиль" (POST /api/analyze-style)
  - Toggle "Автоответы" (POST /api/auto-reply)

- **Recent Reports** - список последних 3 отчетов (GET /api/reports?limit=3)
  - Дата отчета
  - Всего сообщений за день
  - Топ контакт
  - Ссылка на детальный просмотр

**Дизайн:**
- Современный, минималистичный
- Темная/светлая тема
- Анимации при загрузке данных
- Skeleton loaders

### 2. Страница чатов (`/chats`)

**Компоненты:**
- **Search Bar** - поиск по названию чата
- **Filters**:
  - Все / Личные / Группы
  - Сортировка: по дате последнего сообщения
- **Chat List**:
  - Аватар чата (если есть в metadata.picture)
  - Название чата
  - Последнее сообщение (превью)
  - Время последнего сообщения
  - Количество непрочитанных (опционально)
  - Badge для групп
- **Pagination** или infinite scroll

**Функционал:**
- Клик на чат → переход к `/chats/[chatId]`
- Поиск в реальном времени
- Фильтрация без перезагрузки

### 3. Страница сообщений чата (`/chats/[chatId]`)

**Компоненты:**
- **Chat Header**:
  - Название чата
  - Информация о чате (количество сообщений, участники для групп)
  - Кнопка "Назад"
- **Messages List**:
  - Отображение сообщений в виде чата (как в мессенджерах)
  - Входящие слева, исходящие справа
  - Timestamp каждого сообщения
  - Badge "[MEDIA]" для медиа-сообщений
  - Разделители по датам
- **Pagination**:
  - Кнопка "Загрузить еще" (GET /api/chats/:chatId/messages?skip=X)
  - Infinite scroll

**Дизайн:**
- Похож на WhatsApp Web
- Плавная прокрутка
- Автоскролл к последнему сообщению

### 4. Страница анализа стиля (`/style`)

**Компоненты:**
- **Analysis Trigger**:
  - Кнопка "Проанализировать стиль"
  - Прогресс-бар при анализе
  - Уведомление об успехе/ошибке

- **Style Profile Display** (после анализа):
  - **Overview Cards**:
    - Проанализировано сообщений
    - Средняя длина сообщения
    - Использование эмодзи (да/нет, частота)
    - Стиль пунктуации
  
  - **Common Phrases**:
    - Список топ-20 частых фраз
    - Отображение в виде тегов/chips
  
  - **Vocabulary**:
    - Топ-50 частых слов
    - Облако тегов (word cloud)
  
  - **Response Patterns**:
    - Таблица с примерами:
      - Приветствия
      - Прощания
      - Вопросы
      - Согласие
      - Несогласие
  
  - **Sentiment Chart**:
    - Pie chart или bar chart
    - Распределение: positive/neutral/negative

**API:**
- GET /api/style - получить профиль
- POST /api/analyze-style - запустить анализ

### 5. Страница отчетов (`/reports`)

**Компоненты:**
- **Reports Calendar**:
  - Календарь с отметками дат, когда есть отчеты
  - Клик на дату → переход к детальному отчету
  
- **Reports List**:
  - Список последних отчетов (GET /api/reports?limit=7)
  - Карточка отчета:
    - Дата
    - Всего сообщений
    - Входящие/Исходящие
    - Топ контакт
    - Ссылка на детали

### 6. Детальный отчет (`/reports/[date]`)

**Компоненты:**
- **Header**: Дата отчета, кнопка "Назад"

- **Statistics Cards**:
  - Всего сообщений
  - Входящие
  - Исходящие
  - Активных чатов
  - Новых чатов

- **Activity Chart**:
  - Line chart или bar chart
  - Активность по часам (messagesByHour - 24 значения)
  - Ось X: 0-23 часа
  - Ось Y: количество сообщений

- **Top Contacts**:
  - Таблица или список
  - Контакт, количество сообщений
  - Прогресс-бар для визуализации

- **Insights**:
  - Самое активное время
  - Response rate
  - Average response time
  - Sentiment trend

- **Highlights**:
  - Список highlights из отчета

**API:** GET /api/reports/:date

### 7. Настройки (`/settings`)

**Компоненты:**
- **Auto-Reply Section**:
  - Toggle switch для включения/выключения
  - Текущий статус
  - Описание функции

- **Sync Section**:
  - Кнопка "Синхронизировать чаты сейчас"
  - Информация о последней синхронизации

- **Style Analysis Section**:
  - Кнопка "Проанализировать стиль"
  - Информация о последнем анализе

## Технические детали реализации

### API Client (lib/api/client.ts)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы для всех API responses
export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface StatsResponse {
  totalMessages: number;
  totalChats: number;
  activeChats: number;
  autoReplyEnabled: boolean;
}

// ... остальные типы

// API методы
export const api = {
  health: () => apiClient.get<HealthResponse>('/health'),
  stats: () => apiClient.get<StatsResponse>('/stats'),
  syncChats: () => apiClient.post('/sync-chats'),
  analyzeStyle: (userId?: string) => 
    apiClient.post('/analyze-style', { userId }),
  getStyle: (userId?: string) => 
    apiClient.get(`/style?userId=${userId || 'default'}`),
  toggleAutoReply: (enabled: boolean) =>
    apiClient.post('/auto-reply', { enabled }),
  getAutoReplyStatus: () => apiClient.get('/auto-reply'),
  getReports: (limit?: number) =>
    apiClient.get(`/reports?limit=${limit || 7}`),
  getReport: (date: string) => apiClient.get(`/reports/${date}`),
  getChats: () => apiClient.get('/chats'),
  getChatMessages: (chatId: string, limit?: number, skip?: number) =>
    apiClient.get(`/chats/${chatId}/messages?limit=${limit || 50}&skip=${skip || 0}`),
};
```

### React Query Hooks (hooks/useApi.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.stats();
      return data;
    },
    refetchInterval: 30000, // обновлять каждые 30 секунд
  });
};

export const useSyncChats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.syncChats(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// ... остальные hooks
```

## Дизайн-система

### Цвета (Tailwind)
- Primary: `blue-600`, `blue-700`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Background: `gray-50` (light), `gray-900` (dark)
- Text: `gray-900` (light), `gray-100` (dark)

### Компоненты
- Использовать shadcn/ui или создать собственные компоненты
- Кнопки, карточки, таблицы, графики
- Модальные окна для подтверждений
- Toast notifications для уведомлений

### Responsive
- Mobile-first подход
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Адаптивная навигация (sidebar на desktop, drawer на mobile)

## Дополнительные функции

1. **Real-time обновления**:
   - Polling каждые 30 секунд для stats
   - WebSocket (если добавите в бэкенд) для сообщений

2. **Обработка ошибок**:
   - Error boundaries
   - Toast notifications для ошибок
   - Retry механизм

3. **Оптимизация**:
   - Lazy loading компонентов
   - Виртуализация списков (react-window) для больших списков
   - Image optimization

4. **Accessibility**:
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

## Чеклист реализации

- [ ] Настроить Next.js проект с TypeScript
- [ ] Установить зависимости (Tailwind, React Query, Recharts, Axios)
- [ ] Создать API client с типами
- [ ] Создать React Query hooks
- [ ] Реализовать Dashboard
- [ ] Реализовать страницу чатов
- [ ] Реализовать страницу сообщений
- [ ] Реализовать страницу анализа стиля
- [ ] Реализовать страницу отчетов
- [ ] Реализовать детальный отчет
- [ ] Реализовать настройки
- [ ] Добавить темную тему
- [ ] Добавить обработку ошибок
- [ ] Оптимизировать производительность
- [ ] Тестирование на разных устройствах

## Примеры кода

### Dashboard Stats Card
```tsx
import { useStats } from '@/hooks/useApi';

export function StatsCard() {
  const { data, isLoading } = useStats();
  
  if (isLoading) return <StatsCardSkeleton />;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Всего сообщений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data?.totalMessages}</div>
        </CardContent>
      </Card>
      {/* ... остальные карточки */}
    </div>
  );
}
```

### Chat List
```tsx
import { useChats } from '@/hooks/useApi';

export function ChatList() {
  const { data: chats, isLoading } = useChats();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'groups'>('all');
  
  const filteredChats = useMemo(() => {
    return chats?.chats.filter(chat => {
      const matchesSearch = chat.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || 
        (filter === 'personal' && !chat.isGroup) ||
        (filter === 'groups' && chat.isGroup);
      return matchesSearch && matchesFilter;
    }) || [];
  }, [chats, search, filter]);
  
  // ... render
}
```

## Заключение

Создайте современное, отзывчивое веб-приложение, которое полностью использует все возможности бэкенда FamOS. Приложение должно быть интуитивным, быстрым и визуально привлекательным. Используйте лучшие практики React/Next.js для оптимальной производительности и пользовательского опыта.
