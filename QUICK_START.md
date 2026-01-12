# Быстрый старт FamOS

## Шаг 1: Запуск сервисов

```bash
# Запустить MongoDB и Redis
docker-compose up -d

# Запустить приложение
npm run start:dev
```

## Шаг 2: Подключение к WhatsApp

1. Дождитесь появления QR кода в терминале
2. Откройте WhatsApp на телефоне
3. Настройки → Связанные устройства → Связать устройство
4. Отсканируйте QR код

## Шаг 3: Синхронизация чатов

После подключения система автоматически синхронизирует чаты. Или вручную:

```bash
curl -X POST http://localhost:3000/api/sync-chats
```

## Шаг 4: Анализ стиля общения

```bash
curl -X POST http://localhost:3000/api/analyze-style
```

Подождите несколько минут (зависит от количества сообщений).

## Шаг 5: Включение автоответов

```bash
curl -X POST http://localhost:3000/api/auto-reply \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

## Шаг 6: Проверка работы

```bash
# Проверить статус
curl http://localhost:3000/api/health

# Посмотреть статистику
curl http://localhost:3000/api/stats

# Посмотреть отчеты
curl http://localhost:3000/api/reports
```

## Что дальше?

- Система автоматически сохраняет все сообщения
- Ежедневные отчеты генерируются автоматически в 1:00 AM
- Автоответы работают в фоне (если включены)
- Используйте API для управления системой

## Полезные команды

```bash
# Выключить автоответы
curl -X POST http://localhost:3000/api/auto-reply \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'

# Получить профиль стиля
curl http://localhost:3000/api/style

# Получить список чатов
curl http://localhost:3000/api/chats

# Получить сообщения чата
curl "http://localhost:3000/api/chats/1234567890/messages?limit=50"
```
