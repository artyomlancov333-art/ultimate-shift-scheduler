# 📦 Инструкция по деплою проекта

## Шаг 1: Загрузка на GitHub

### 1.1. Инициализация Git (если ещё не сделано)

```bash
cd /Users/kseniasoboleva/Downloads/ultimate-shift-scheduler

# Инициализация репозитория
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Full shift scheduler implementation"
```

### 1.2. Создание репозитория на GitHub

1. Зайдите на [github.com](https://github.com)
2. Нажмите **"New repository"** (зелёная кнопка)
3. Название: `ultimate-shift-scheduler`
4. Выберите **Public** или **Private**
5. **НЕ** добавляйте README, .gitignore или лицензию (у нас уже есть файлы)
6. Нажмите **"Create repository"**

### 1.3. Подключение и загрузка

```bash
# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ultimate-shift-scheduler.git

# Загрузите код
git branch -M main
git push -u origin main
```

## Шаг 2: Настройка Firebase

### 2.1. Проверка Firebase проекта

1. Зайдите на [console.firebase.google.com](https://console.firebase.google.com)
2. Убедитесь, что проект `ultimate-shift-scheduler` существует
3. Если нет — создайте новый проект

### 2.2. Настройка Authentication

1. В Firebase Console перейдите в **Authentication**
2. Включите **Email/Password** провайдер
3. Сохраните настройки

### 2.3. Настройка Firestore

1. Перейдите в **Firestore Database**
2. Создайте базу данных (если ещё не создана)
3. Выберите режим: **Production mode** или **Test mode** (для начала можно Test)
4. Выберите регион (например, `europe-west`)

### 2.4. Правила безопасности Firestore

Перейдите в **Firestore Database → Rules** и установите:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Slots collection
    match /slots/{slotId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Days off collection
    match /daysOff/{dayOffId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Referrals collection
    match /referrals/{referralId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Change history collection
    match /changeHistory/{historyId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Шаг 3: Деплой на Vercel

### 3.1. Подключение к Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Выберите репозиторий `ultimate-shift-scheduler`
5. Нажмите **"Import"**

### 3.2. Настройка проекта в Vercel

Vercel автоматически определит настройки из `vercel.json`, но проверьте:

- **Framework Preset**: Vite
- **Root Directory**: `./` (корень проекта)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3. Переменные окружения

В настройках проекта Vercel перейдите в **Settings → Environment Variables** и добавьте:

```
FIREBASE_API_KEY=AIzaSyASJIpNOj58QUKOEEsFYYiqrldmff9Bk50
FIREBASE_AUTH_DOMAIN=ultimate-shift-scheduler.firebaseapp.com
FIREBASE_PROJECT_ID=ultimate-shift-scheduler
CRON_SECRET=your-secret-key-here (опционально, для защиты cron)
```

**Где найти Firebase ключи:**
1. Firebase Console → Project Settings (⚙️)
2. Вкладка **General**
3. Прокрутите вниз до **Your apps**
4. Выберите веб-приложение или создайте новое
5. Скопируйте значения из `firebaseConfig`

### 3.4. Деплой

1. Нажмите **"Deploy"**
2. Дождитесь завершения сборки (обычно 2-3 минуты)
3. После успешного деплоя вы получите URL вида: `https://your-project.vercel.app`

## Шаг 4: Настройка Cron Job

### 4.1. Автоматическая настройка (через vercel.json)

Cron job уже настроен в `vercel.json` и будет работать автоматически после деплоя.

### 4.2. Ручная настройка (если нужно)

1. В Vercel Dashboard перейдите в **Settings → Cron Jobs**
2. Добавьте новый cron:
   - **Path**: `/api/cron/recalculate-ratings`
   - **Schedule**: `0 0 * * *` (каждый день в 00:00 UTC)
   - **Timezone**: UTC

### 4.3. Защита Cron (опционально)

Если установили `CRON_SECRET`, настройте в Vercel:
- В **Settings → Environment Variables** добавьте `CRON_SECRET`
- Cron endpoint будет проверять этот секрет

## Шаг 5: Создание первого админа

### 5.1. Регистрация через интерфейс

1. Откройте задеплоенное приложение
2. Зарегистрируйтесь через `/register`
3. Запомните email и пароль

### 5.2. Назначение роли админа

1. Откройте Firebase Console
2. Перейдите в **Firestore Database**
3. Найдите коллекцию `users`
4. Найдите документ с вашим `userId` (можно найти по email в поле `email`)
5. Измените поле `role` с `"user"` на `"admin"`
6. Сохраните

### 5.3. Альтернативный способ (через Firebase CLI)

```bash
# Установите Firebase CLI
npm install -g firebase-tools

# Войдите
firebase login

# Инициализируйте проект
firebase init firestore

# Создайте файл для обновления
# В Firestore Console → Data → выберите документ пользователя
# Или используйте Firebase Admin SDK
```

## Шаг 6: Проверка работы

### 6.1. Проверка фронтенда

1. Откройте задеплоенное приложение
2. Зарегистрируйтесь/войдите
3. Проверьте все страницы:
   - Dashboard
   - Profile
   - Team
   - Leaderboard
   - Slots
   - DaysOff

### 6.2. Проверка админ-панели

1. Войдите как админ
2. Перейдите на `/admin`
3. Проверьте:
   - Список пользователей
   - Создание пользователя
   - Просмотр деталей пользователя

### 6.3. Проверка API

Протестируйте API endpoints:

```bash
# Get profile
curl -X POST https://your-project.vercel.app/api/bot/get-profile \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'

# Set earnings
curl -X POST https://your-project.vercel.app/api/bot/set-earnings \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "earnings": 10000}'
```

## Шаг 7: Интеграция с Telegram ботом

### 7.1. Обновление бота

В вашем Telegram боте обновите URL endpoints:

```javascript
const API_BASE_URL = 'https://your-project.vercel.app/api/bot';

// Пример использования
const response = await fetch(`${API_BASE_URL}/get-profile`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: userId })
});
```

### 7.2. Тестирование

Протестируйте все endpoints бота:
- `/api/bot/set-earnings`
- `/api/bot/get-profile`
- `/api/bot/get-team`
- `/api/bot/get-rating`

## 📝 Чеклист перед запуском

- [ ] Код загружен на GitHub
- [ ] Firebase проект настроен
- [ ] Authentication включен (Email/Password)
- [ ] Firestore создан и правила установлены
- [ ] Проект задеплоен на Vercel
- [ ] Переменные окружения настроены
- [ ] Создан первый админ-пользователь
- [ ] Проверена работа всех страниц
- [ ] Проверена работа API endpoints
- [ ] Telegram бот обновлён с новыми URL

## 🆘 Решение проблем

### Ошибка при деплое
- Проверьте, что все зависимости в `package.json`
- Убедитесь, что TypeScript компилируется без ошибок: `npm run type-check`

### Ошибки Firebase
- Проверьте правильность API ключей
- Убедитесь, что правила Firestore настроены
- Проверьте, что Authentication включен

### API не работает
- Проверьте переменные окружения в Vercel
- Проверьте логи в Vercel Dashboard → Functions

### Cron не запускается
- Проверьте настройки в `vercel.json`
- Проверьте логи в Vercel Dashboard → Cron Jobs

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Vercel Dashboard
2. Проверьте консоль браузера (F12)
3. Проверьте Firebase Console на наличие ошибок

---

**Готово!** Ваше приложение должно быть полностью работоспособным! 🎉

