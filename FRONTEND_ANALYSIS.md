# Полный анализ возможностей бэкенда FamOS

## Анализ API Endpoints

### 1. Health & Status
- **GET /api/health** - Проверка статуса сервера
  - Возвращает: `{ status: 'ok', timestamp: string }`
  - Использование: Индикатор подключения, мониторинг

### 2. Управление синхронизацией
- **POST /api/sync-chats** - Запуск синхронизации всех чатов
  - Возвращает: `{ success: true, message: string }`
  - Использование: Кнопка "Синхронизировать чаты", прогресс-бар

### 3. Анализ стиля общения
- **POST /api/analyze-style** - Запуск анализа стиля
  - Body: `{ userId?: string }`
  - Возвращает: `{ success: true, analyzedMessages: number, styleProfile: object }`
  - Использование: Кнопка "Проанализировать стиль", прогресс анализа

- **GET /api/style** - Получить профиль стиля
  - Query: `?userId=default`
  - Возвращает: Полный объект UserStyle или ошибку
  - Использование: Отображение профиля стиля, статистика

### 4. Управление автоответами
- **POST /api/auto-reply** - Включить/выключить автоответы
  - Body: `{ enabled: boolean }`
  - Возвращает: `{ success: true, autoReplyEnabled: boolean }`
  - Использование: Toggle switch, статус

- **GET /api/auto-reply** - Статус автоответов
  - Возвращает: `{ autoReplyEnabled: boolean }`
  - Использование: Отображение текущего статуса

### 5. Ежедневные отчеты
- **GET /api/reports** - Последние отчеты
  - Query: `?limit=7`
  - Возвращает: `{ reports: DailyReport[] }`
  - Использование: Список отчетов, графики, календарь

- **GET /api/reports/:date** - Отчет за конкретную дату
  - Params: `date` (формат: YYYY-MM-DD)
  - Возвращает: DailyReport или ошибку
  - Использование: Детальный просмотр отчета

### 6. Статистика
- **GET /api/stats** - Общая статистика
  - Возвращает: `{ totalMessages, totalChats, activeChats, autoReplyEnabled }`
  - Использование: Dashboard, карточки статистики

### 7. Чаты и сообщения
- **GET /api/chats** - Список всех чатов
  - Возвращает: `{ chats: Chat[] }`
  - Использование: Список чатов, поиск, фильтры

- **GET /api/chats/:chatId/messages** - Сообщения чата
  - Params: `chatId`
  - Query: `?limit=50&skip=0`
  - Возвращает: `{ messages: Message[] }`
  - Использование: Просмотр истории чата, пагинация

## Структура данных

### Chat
```typescript
{
  chatId: string;
  name: string;
  isGroup: boolean;
  participants: string[];
  messageCount: number;
  lastMessageAt?: Date;
  metadata?: {
    picture?: string;
    description?: string;
  };
  isArchived: boolean;
  isPinned: boolean;
}
```

### Message
```typescript
{
  messageId: string;
  chatId: string;
  sender: string;
  text: string;
  fromMe: boolean;
  timestamp: Date;
  isGroup: boolean;
  isMedia: boolean;
  mediaType?: string;
}
```

### UserStyle
```typescript
{
  userId: string;
  styleProfile: {
    commonPhrases: string[];
    averageMessageLength: number;
    useEmojis: boolean;
    emojiFrequency: number;
    useCapitalization: boolean;
    punctuationStyle: string;
    averageResponseTime: number;
    responsePatterns: {
      greeting: string[];
      goodbye: string[];
      question: string[];
      agreement: string[];
      disagreement: string[];
    };
    vocabulary: {
      commonWords: string[];
      uniqueWords: string[];
    };
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  analyzedMessagesCount: number;
  lastAnalyzedAt?: Date;
}
```

### DailyReport
```typescript
{
  date: string; // YYYY-MM-DD
  statistics: {
    totalMessages: number;
    incomingMessages: number;
    outgoingMessages: number;
    activeChats: number;
    newChats: number;
    messagesByHour: number[]; // 24 элемента
    topContacts: Array<{
      chatId: string;
      name: string;
      messageCount: number;
    }>;
  };
  aiActivity: {
    autoRepliedMessages: number;
    suggestedReplies: number;
    accuracyScore?: number;
  };
  highlights: string[];
  insights?: {
    mostActiveTime: string;
    responseRate: number;
    averageResponseTime: number;
    sentimentTrend: string;
  };
}
```

## Функциональные требования к фронтенду

### 1. Dashboard (Главная страница)
- Карточки статистики (totalMessages, totalChats, activeChats)
- Статус автоответов (включен/выключен)
- Последние отчеты (мини-превью)
- Быстрые действия (синхронизация, анализ стиля)

### 2. Страница чатов
- Список всех чатов с поиском и фильтрами
- Группировка (личные/группы)
- Сортировка (по дате последнего сообщения)
- Клик на чат → переход к сообщениям

### 3. Страница сообщений чата
- История сообщений (пагинация)
- Разделение входящих/исходящих
- Поиск по сообщениям
- Информация о чате

### 4. Страница анализа стиля
- Кнопка запуска анализа
- Прогресс анализа (если долго)
- Отображение профиля стиля:
  - Частые фразы
  - Статистика (длина сообщений, эмодзи)
  - Словарь
  - Паттерны ответов
  - График sentiment

### 5. Страница отчетов
- Календарь с датами отчетов
- Список последних отчетов
- Детальный просмотр отчета:
  - График активности по часам
  - Топ контактов
  - Статистика сообщений
  - Insights и highlights

### 6. Настройки
- Управление автоответами (toggle)
- Настройки синхронизации
- Настройки анализа

## Технические требования

### Рекомендуемый стек
- **React** + **TypeScript** (или Next.js для SSR)
- **Tailwind CSS** или **Material-UI** для стилей
- **React Query / SWR** для кэширования API запросов
- **Recharts / Chart.js** для графиков
- **React Router** для навигации
- **Axios / Fetch** для HTTP запросов

### Особенности реализации
- Real-time обновления (WebSocket или polling)
- Оптимистичные обновления UI
- Обработка ошибок и loading states
- Responsive design (мобильная версия)
- Темная/светлая тема

## Необходимые компоненты UI

1. **Dashboard Cards** - карточки статистики
2. **Chat List** - список чатов с поиском
3. **Message Thread** - поток сообщений
4. **Style Profile** - визуализация профиля стиля
5. **Report Calendar** - календарь отчетов
6. **Charts** - графики активности, sentiment
7. **Toggle Switch** - переключатель автоответов
8. **Progress Bar** - прогресс синхронизации/анализа
9. **Search Bar** - поиск по чатам/сообщениям
10. **Filters** - фильтры (группы/личные, даты)
