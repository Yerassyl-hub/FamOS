# 🚀 Деплой бэкенда FamOS на Render.com

## 📋 Подготовка

### 1. Подключите репозиторий к Render

1. Зайдите на [render.com](https://render.com)
2. Создайте аккаунт (если нет)
3. Нажмите "New +" → "Web Service"
4. Подключите GitHub репозиторий: `Yerassyl-hub/FamOS`
5. Выберите ветку: `main`

### 2. Настройки сервиса

**Name:** `famos-backend`  
**Region:** `Frankfurt` (или ближайший к вам)  
**Branch:** `main`  
**Root Directory:** `server` (важно!)  
**Environment:** `Node`  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm run start:prod`

### 3. Переменные окружения

Добавьте в Render Dashboard → Environment:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb://localhost:27017/famos  # Замените на ваш MongoDB URI
REDIS_HOST=localhost  # Замените на ваш Redis host
REDIS_PORT=6379
FRONTEND_URL=*
```

## 🗄️ Базы данных на Render

### MongoDB

1. Создайте **MongoDB** сервис:
   - "New +" → "MongoDB"
   - Name: `famos-mongo`
   - Plan: `Free`
   - Database Name: `famos`

2. После создания скопируйте **Internal Connection String**
3. Используйте его в `MONGODB_URI` вашего веб-сервиса

### Redis

1. Создайте **Redis** сервис:
   - "New +" → "Redis"
   - Name: `famos-redis`
   - Plan: `Free`

2. После создания скопируйте **Internal Redis URL**
3. Используйте его в `REDIS_HOST` и `REDIS_PORT`

## ⚙️ Настройка переменных окружения

В Render Dashboard → Environment Variables:

```env
# Обязательные
NODE_ENV=production
PORT=10000

# MongoDB (из вашего MongoDB сервиса)
MONGODB_URI=mongodb://famos-mongo:27017/famos
# Или внешний MongoDB:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/famos

# Redis (из вашего Redis сервиса)
REDIS_HOST=famos-redis
REDIS_PORT=6379
# Или внешний Redis:
# REDIS_HOST=your-redis-host.render.com
# REDIS_PORT=6379

# CORS (укажите URL вашего фронтенда)
FRONTEND_URL=https://your-frontend.onrender.com
# Или для разработки:
# FRONTEND_URL=*
```

## 🔧 Важные настройки

### Root Directory
**ВАЖНО:** Установите `Root Directory: server`

Render должен знать, что код находится в папке `server/`, а не в корне.

### Build & Start Commands

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:prod
```

## 📝 Проверка деплоя

После деплоя проверьте:

1. **Health endpoint:**
   ```
   https://your-app.onrender.com/api/health
   ```

2. **Stats endpoint:**
   ```
   https://your-app.onrender.com/api/stats
   ```

## 🔗 Использование во фронтенде

После деплоя обновите API URL во фронтенде:

```env
# .env.production
NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api
```

## ⚠️ Важные замечания

1. **Free план** - сервисы "засыпают" после 15 минут бездействия
2. **MongoDB и Redis** - используйте Internal Connection для бесплатного плана
3. **WhatsApp** - может не работать на Render (нужен постоянный процесс)
4. **Логи** - доступны в Render Dashboard → Logs

## 🐛 Troubleshooting

### Ошибка: "Cannot find module"
- Проверьте Root Directory: должен быть `server`
- Проверьте, что `package.json` в папке `server/`

### Ошибка: "Port already in use"
- Render автоматически устанавливает PORT через переменную окружения
- Не указывайте PORT вручную, используйте `process.env.PORT`

### Ошибка подключения к MongoDB/Redis
- Используйте **Internal Connection String** для бесплатного плана
- Или используйте внешние сервисы (MongoDB Atlas, Redis Cloud)

## 📚 Дополнительные ресурсы

- [Render Documentation](https://render.com/docs)
- [Deploy Node.js Apps](https://render.com/docs/deploy-nodejs-app)
