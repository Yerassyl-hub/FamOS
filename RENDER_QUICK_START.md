# ⚡ Быстрый деплой на Render.com

> 💰 **Бесплатный план доступен!** См. `RENDER_PRICING.md` для деталей.

## 🚀 Шаги деплоя

### 1. Подготовка репозитория

✅ Репозиторий уже в GitHub: `Yerassyl-hub/FamOS`  
✅ Все файлы готовы  
✅ `render.yaml` создан

### 2. Создание сервисов на Render

#### A. MongoDB
1. Render Dashboard → "New +" → "MongoDB"
2. Name: `famos-mongo`
3. Plan: `Free`
4. Database: `famos`
5. Создать

#### B. Redis
1. Render Dashboard → "New +" → "Redis"  
2. Name: `famos-redis`
3. Plan: `Free`
4. Создать

#### C. Web Service (Backend)
1. Render Dashboard → "New +" → "Web Service"
2. Подключите репозиторий: `Yerassyl-hub/FamOS`
3. Настройки:
   - **Name:** `famos-backend`
   - **Region:** `Frankfurt` (или ближайший)
   - **Branch:** `main`
   - **Root Directory:** `server` ⚠️ ВАЖНО!
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

### 3. Переменные окружения

В настройках Web Service → Environment:

```env
NODE_ENV=production
PORT=10000

# MongoDB (из Internal Connection String вашего MongoDB сервиса)
MONGODB_URI=mongodb://famos-mongo:27017/famos

# Redis (из вашего Redis сервиса)
REDIS_HOST=famos-redis
REDIS_PORT=6379

# CORS (укажите URL фронтенда или * для всех)
FRONTEND_URL=*
```

### 4. Деплой

1. Нажмите "Create Web Service"
2. Render начнет деплой
3. Дождитесь завершения (5-10 минут)
4. Получите URL: `https://your-app.onrender.com`

## ✅ Проверка

После деплоя проверьте:

```bash
# Health
curl https://your-app.onrender.com/api/health

# Stats
curl https://your-app.onrender.com/api/stats
```

## 🔗 Использование во фронтенде

Обновите `.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-app.onrender.com/api
```

## ⚠️ Важно

1. **Root Directory:** обязательно `server`
2. **MongoDB/Redis:** используйте Internal Connection для бесплатного плана
3. **Free план:** сервисы "засыпают" после 15 минут бездействия
4. **WhatsApp:** может не работать на Render (нужен постоянный процесс)

## 📝 Готово!

Ваш бэкенд будет доступен по адресу:
```
https://your-app.onrender.com/api
```
