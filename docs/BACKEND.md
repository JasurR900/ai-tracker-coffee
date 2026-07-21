# Backend спецификация — AI Трекер Калорий (Cal AI)

Документ для миграции с Supabase на собственный REST API.
Здесь описано **всё**, что использует фронтенд: авторизация, структура БД,
все эндпоинты с каждым параметром, загрузка файлов, AI-анализ, валидация.

- Фронтенд: Next.js 16 (App Router), деплой: `ai-food.pointcoffee.uz`
- Текущий бэкенд: Supabase (Auth + Postgres + Storage) — **заменяется**
- Формат обмена: JSON, кодировка UTF-8
- Все даты/время: ISO 8601 строки в UTC (`2026-07-21T11:48:00.000Z`)

---

## 1. Авторизация

Логин по **имени пользователя** (username) + пароль. E-mail в продукте не используется.

> Историческая деталь Supabase: username маппился на синтетический e-mail
> `<username>@users.calai.app`. В новом бэкенде это не нужно — храните username напрямую.

### 1.1 Правила валидации

| Поле | Правило | Ошибка (ru) |
| --- | --- | --- |
| `username` | regex `^[a-zA-Z0-9_]{3,20}$`, приводится к lowercase, уникален | `Имя пользователя: 3–20 символов, только латинские буквы, цифры и _` / `Это имя пользователя уже занято` |
| `password` | минимум 6 символов | `Пароль должен быть не короче 6 символов` |

### 1.2 Токены

JWT (Bearer). Все защищённые запросы:

```
Authorization: Bearer <accessToken>
```

Рекомендуется: accessToken TTL ~1 час + refreshToken TTL ~30 дней (Supabase работал так же, фронт умеет авто-рефреш).

### 1.3 POST `/auth/register`

Создание аккаунта. Подтверждение почты НЕ требуется — аккаунт активен сразу.

Запрос:
```json
{ "username": "jasur", "password": "secret123" }
```

Ответ `201`:
```json
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": { "id": "uuid", "username": "jasur", "createdAt": "2026-07-21T10:00:00.000Z" }
}
```

Ошибки:
- `400` — `{ "error": "Имя пользователя: 3–20 символов, только латинские буквы, цифры и _" }`
- `400` — `{ "error": "Пароль должен быть не короче 6 символов" }`
- `409` — `{ "error": "Это имя пользователя уже занято" }`

### 1.4 POST `/auth/login`

Запрос:
```json
{ "username": "jasur", "password": "secret123" }
```

Ответ `200`: как у register.

Ошибки:
- `401` — `{ "error": "Неверное имя пользователя или пароль" }`

### 1.5 POST `/auth/refresh`

Запрос: `{ "refreshToken": "jwt..." }`
Ответ `200`: `{ "accessToken": "jwt...", "refreshToken": "jwt..." }`
Ошибка `401` — refresh невалиден/истёк.

### 1.6 POST `/auth/logout`

Заголовок Authorization. Инвалидирует refresh-токен. Ответ `204`.

### 1.7 GET `/auth/me`

Возвращает текущего пользователя по accessToken (фронт вызывает при старте приложения
для восстановления сессии).

Ответ `200`:
```json
{ "id": "uuid", "username": "jasur", "createdAt": "..." }
```
Ошибка `401` — токен невалиден.

---

## 2. Структура базы данных (PostgreSQL)

```sql
-- ===== users =====
create table users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,           -- lowercase, ^[a-z0-9_]{3,20}$
  password_hash text not null,                  -- bcrypt/argon2
  created_at    timestamptz not null default now()
);

-- ===== profiles (1:1 с users) =====
create table profiles (
  id                   uuid primary key references users(id) on delete cascade,
  username             text,                    -- дублируется для удобства выборок
  gender               text,                    -- 'male' | 'female' | null
  birth_date           jsonb,                   -- {"year":2000,"month":0,"day":1}  month: 0-11!
  height_cm            integer default 170,     -- диапазон в UI: 100..230
  weight_kg            numeric  default 70,     -- диапазон в UI: 30..200, шаг 0.5
  workouts             text,                    -- '0-2' | '3-5' | '6+' | null
  goal                 text,                    -- 'lose' | 'maintain' | 'gain' | null
  diet                 text,                    -- 'classic' | 'vegan' | 'keto' | 'paleo' | null
  plan                 jsonb,                   -- {"calories":2538,"protein":190,"carbs":286,"fats":71} | null
  subscription         jsonb,                   -- см. раздел 5 | null
  auto_track_orders    boolean default false,
  onboarding_completed boolean default false,
  updated_at           timestamptz not null default now()
);

-- ===== meals =====
create table meals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  name        text not null,
  calories    integer not null default 0,       -- ккал, целое ≥ 0
  protein     numeric not null default 0,       -- граммы, 1 знак после запятой
  fats        numeric not null default 0,
  carbs       numeric not null default 0,
  description text default '',
  photo_url   text,                             -- абсолютный URL или null
  created_at  timestamptz not null default now()
);

create index meals_user_created_idx on meals (user_id, created_at desc);
```

**Критично (безопасность):** каждый пользователь видит/меняет ТОЛЬКО свои строки
(в Supabase это делал RLS). В REST API — проверка `user_id == токен.userId` на каждом
запросе к profiles/meals/файлам.

### 2.1 JSON-формы полей

`birth_date` — месяц **0-индексный** (0 = январь, 11 = декабрь):
```json
{ "year": 1998, "month": 5, "day": 6 }
```

`plan` (дневные цели, все числа целые):
```json
{ "calories": 2538, "protein": 190, "carbs": 286, "fats": 71 }
```

`subscription` (null, если подписки нет):
```json
{
  "planId": "year",                       // 'week' | 'month' | 'quarter' | 'year'
  "label": "Годовой",                     // 'Недельный' | 'Месячный' | 'Квартальный' | 'Годовой'
  "paidAt": "2026-07-21T11:00:00.000Z",
  "expiresAt": "2027-07-21T11:00:00.000Z"
}
```

---

## 3. Профиль — REST API

### 3.1 GET `/profile`

Профиль текущего пользователя.

Ответ `200` (если профиль ещё не создан — `200` с `null` или `404`, фронт обрабатывает оба):
```json
{
  "gender": "male",
  "birthDate": { "year": 1998, "month": 5, "day": 6 },
  "heightCm": 186,
  "weightKg": 86.5,
  "workouts": "3-5",
  "goal": "gain",
  "diet": "classic",
  "plan": { "calories": 2538, "protein": 190, "carbs": 286, "fats": 71 },
  "subscription": null,
  "autoTrackOrders": false,
  "onboardingCompleted": true
}
```

### 3.2 PUT `/profile`

Полный upsert профиля (фронт всегда шлёт весь объект). Тело — ровно те же поля,
что в ответе GET. Все поля могут быть null кроме `heightCm`, `weightKg`,
`autoTrackOrders`, `onboardingCompleted`.

Ответ `200` — сохранённый профиль.

Вызывается фронтом:
- по завершении онбординга (расчёт плана),
- при переключении «Автоматически учитывать мои заказы»,
- при ручном редактировании целей (страница «Настроить цели»),
- при оплате подписки (пишется `subscription`).

### 3.3 DELETE `/profile`

«Сбросить все данные»: удаляет профиль (строку profiles). Аккаунт/логин остаётся.
Ответ `204`.

---

## 4. Приёмы пищи (meals) — REST API

Тип `Meal` в ответах (везде одинаковый):
```json
{
  "id": "uuid",
  "name": "Гамбургер с котлетой и салатом",
  "calories": 550,
  "protein": 30,
  "fats": 35,
  "carbs": 40,
  "description": "Блюдо состоит из ...",
  "photo": "https://cdn.example.com/meal-photos/<userId>/<file>.jpg",
  "createdAt": "2026-07-21T11:48:00.000Z"
}
```
(`photo` может быть `null` — например, блюдо добавлено текстом.)

### 4.1 GET `/meals`

Список приёмов пищи пользователя, сортировка `createdAt desc`, лимит 50
(поддержите query `?limit=50`, по умолчанию 50).

Ответ `200`: `{ "items": [Meal, ...] }`

### 4.2 POST `/meals`

Создать приём пищи.

Запрос:
```json
{
  "name": "Плов с говядиной",
  "calories": 880,
  "protein": 33,
  "fats": 40,
  "carbs": 96,
  "description": "…",
  "photo": "https://…/photo.jpg",     // string | null
  "createdAt": "2026-07-20T12:00:00.000Z"   // ОПЦИОНАЛЬНО: добавление задним числом
}
```
Если `createdAt` не передан — ставится `now()`. Фронт передаёт прошедшую дату,
когда пользователь добавляет еду текстом за прошлый день (выбор из последних 7 дней,
время фиксируется 12:00 локального дня).

Ответ `201`: созданный `Meal` (с id и createdAt).

### 4.3 PATCH `/meals/:id`

Редактирование (диалог «Редактировать блюдо»). Изменяемые поля — только эти шесть:

```json
{
  "name": "Плов узбекский",
  "calories": 750,
  "protein": 33,
  "fats": 40,
  "carbs": 96,
  "description": "…"
}
```
`photo` и `createdAt` через PATCH не меняются.

Ответ `200`: обновлённый `Meal`. `404` — чужой/несуществующий id.

### 4.4 DELETE `/meals/:id`

Удаление (свайп-влево → корзина). Бэкенд обязан также удалить файл фото,
если `photo_url` не null. Ответ `204`.

### 4.5 DELETE `/meals`

Удалить ВСЕ приёмы пищи пользователя (кнопка «Сбросить все данные» вместе с
DELETE /profile). Также удалить все файлы фото пользователя. Ответ `204`.

---

## 5. Подписка Premium

Подписка хранится в `profiles.subscription` (см. 2.1) и пишется через PUT `/profile`.
Оплата сейчас — демо (реальный биллинг не подключён). Если бэкенд захочет выделить
отдельный эндпоинт — согласуйте, но текущему фронту достаточно PUT `/profile`.

Тарифы (захардкожены на фронте, `src/lib/premium.ts`):

| planId | label (тариф) | statusLabel | Цена, сум | Дней |
| --- | --- | --- | --- | --- |
| `week` | 1 неделя | Недельный | 10 000 | 7 |
| `month` | 1 месяц | Месячный | 25 000 | 30 |
| `quarter` | 3 месяца | Квартальный | 75 000 | 90 |
| `year` | 12 месяцев | Годовой | 200 000 | 365 |

Расчёт: `expiresAt = paidAt + days`. «Оставшиеся дни» =
`ceil((expiresAt - now) / 86400000)`, не меньше 0. Статус «Активна», если
`expiresAt > now`, иначе «Истекла».

> **Примечание.** На странице «Оформление» кошелёк («Баланс: 25 000 сум»),
> способы оплаты (Payme/Click/Uzum) и купоны («Подписка AI Трекер Калорий на 3 МЕСЯЦА»,
> «Купон на бесплатный напиток») — сейчас СТАТИЧЕСКАЯ демо-верстка, API за ними нет.
> Если бэкенд будет делать реальный биллинг/кошелёк/купоны — это новые эндпоинты,
> согласуйте контракт отдельно.

---

## 6. Загрузка фото (замена Supabase Storage)

### 6.1 POST `/upload/meal-photo`

- `Content-Type: multipart/form-data`, поле файла: **`file`**
- Файл: JPEG (фронт сжимает на клиенте до max 640px по большей стороне, quality 0.75,
  типичный размер 30–120 КБ)
- Сохранять в путь вида `<userId>/<уникальное-имя>.jpg`
- Файл должен быть **публично доступен по URL** (фронт вставляет URL в `<img src>`)

Ответ `201`:
```json
{ "url": "https://cdn.example.com/meal-photos/<userId>/<name>.jpg" }
```

Ошибки: `400` (не изображение/слишком большой — лимит поставьте 5 МБ), `401`.

Права: пользователь пишет только в свою папку; удаление файлов — только своих
(происходит на бэкенде при DELETE meals).

---

## 7. AI-анализ еды (Gemini)

Сейчас реализован внутри Next.js: `src/app/api/analyze/route.ts`.
Можно (а) оставить на фронтовом сервере или (б) перенести на бэкенд — тогда
эндпоинт ниже. Ключ Gemini живёт ТОЛЬКО на сервере.

### 7.1 POST `/analyze`

Запрос — ровно ОДНО из двух полей:
```json
{ "image": "data:image/jpeg;base64,<...>" }
```
или
```json
{ "text": "плов, большая порция" }
```
- `image`: data-URL (jpeg/png/webp). Если префикса `data:image/...;base64,` нет —
  считать что это чистый base64 JPEG.
- `text`: строка, обрезается до 1000 символов.

Ответ `200`:
```json
{
  "isFood": true,
  "name": "Плов с говядиной",
  "calories": 880,
  "protein": 33.0,
  "fats": 40.0,
  "carbs": 96.0,
  "description": "Блюдо состоит из риса, говядины, моркови и лука…",
  "source": "ai"
}
```
- `isFood: false` — на фото/в тексте нет еды; остальные поля — нули и пустые строки.
  Фронт показывает «На фото не удалось распознать еду».
- `source`: `"ai"` — реальный ответ модели; `"fallback"` — заглушка (см. 7.5).
- Нормализация чисел: calories — целое ≥0; protein/fats/carbs — ≥0, округление до 0.1.

Ошибки: `400` invalid body, `502` `{ "error": "<текст>" }` — анализ не удался.

### 7.2 Модели (пробовать по цепочке до первого успеха)

```
gemini-3.1-pro-preview  →  gemini-3-flash-preview  →  gemini-2.5-flash  →  gemini-2.0-flash
```

Вызов: Google Gemini API `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`,
заголовок `x-goog-api-key: <GEMINI_API_KEY>`,
config: `responseMimeType: application/json`, `temperature: 0.4`, structured output по схеме 7.4.

### 7.3 Промпты (копировать дословно)

Для ФОТО (part 1 — inlineData изображения, part 2 — этот текст):

```
Ты — профессиональный нутрициолог. Проанализируй фотографию еды.
Определи блюдо и оцени его пищевую ценность для порции, изображённой на фото.
Ответь строго на русском языке.
Если на фото нет еды или напитка, установи isFood = false, а остальные поля заполни нулями и пустыми строками.

description — 2–3 предложения СТРОГО о составе и питательной ценности блюда, как объяснил бы нутрициолог:
- из каких основных ингредиентов состоит блюдо и что они дают организму;
- насколько блюдо насыщенное/лёгкое, чем оно богато (белок, углеводы, жиры, клетчатка) и кому/когда подходит.
ЗАПРЕЩЕНО упоминать посуду, подачу, сервировку, оформление, внешний вид и «аппетитность» — никакого рекламного тона.
Пример хорошего description:
"Плотный мясной суп: наваристый бульон с говядиной и яйцом даёт около 35 г белка, зелень и томаты добавляют клетчатку и витамины. Блюдо достаточно калорийное и сытное — хорошо подходит для полноценного обеда или восстановления после тренировки."
```

Для ТЕКСТА (один text-part: промпт + описание пользователя в конце):

```
Ты — профессиональный нутрициолог. Пользователь описал приём пищи текстом.
Определи блюдо и оцени его пищевую ценность для описанной порции (если размер порции не указан — возьми стандартную).
Ответь строго на русском языке.
Если текст не описывает еду или напиток, установи isFood = false, а остальные поля заполни нулями и пустыми строками.

description — 2–3 предложения СТРОГО о составе и питательной ценности блюда:
из чего оно состоит, что даёт организму, насколько насыщенное и кому/когда подходит.
ЗАПРЕЩЕНО упоминать посуду, подачу, оформление и «аппетитность».

Описание пользователя: <текст пользователя>
```

### 7.4 JSON-схема ответа модели (structured output)

```json
{
  "type": "object",
  "properties": {
    "isFood":      { "type": "boolean" },
    "name":        { "type": "string", "description": "Название блюда на русском, например \"Курица с рисом\"" },
    "calories":    { "type": "number", "description": "Калорийность порции, ккал" },
    "protein":     { "type": "number", "description": "Белки, граммы" },
    "fats":        { "type": "number", "description": "Жиры, граммы" },
    "carbs":       { "type": "number", "description": "Углеводы, граммы" },
    "description": { "type": "string" }
  },
  "required": ["isFood", "name", "calories", "protein", "fats", "carbs", "description"]
}
```

### 7.5 Fallback при недоступности Gemini

Если ВСЕ модели вернули quota/permission-ошибку (HTTP 429/403, RESOURCE_EXHAUSTED,
PERMISSION_DENIED) — вернуть `200` с заглушкой, `source: "fallback"`, случайный
вариант из:

| name | calories | protein | fats | carbs |
| --- | --- | --- | --- | --- |
| Домашнее блюдо | 420 | 22 | 16 | 46 |
| Порция гарнира с белком | 510 | 28 | 18 | 55 |
| Лёгкий приём пищи | 320 | 15 | 11 | 40 |

description фиксированный:
```
Приблизительная оценка: AI-сервис временно недоступен, значения рассчитаны по средней порции. Попробуйте отсканировать блюдо позже для точного анализа.
```
Прочие ошибки (сеть, 5xx) → `502` с текстом ошибки.

---

## 8. Бизнес-логика на фронте (для справки, НЕ переносится)

Расчёт дневного плана выполняется на клиенте (`src/lib/nutrition.ts`),
но формулы приводим, чтобы бэкенд понимал происхождение чисел:

- BMR (Миффлин–Сан Жеор): `10*вес + 6.25*рост − 5*возраст + (муж: +5 / жен: −161)`
- Активность: `0-2` → ×1.375, `3-5` → ×1.55, `6+` → ×1.725
- Цель: `lose` → ×0.8, `maintain` → ×1.0, `gain` → ×1.15
- Макросплит по диете (доли калорий, protein/fats/carbs):
  - `classic`: 30% / 25% / 45%
  - `vegan`: 20% / 25% / 55%
  - `keto`: 25% / 70% / 5%
  - `paleo`: 35% / 40% / 25%
- Граммы: белки/углеводы = ккал×доля/4, жиры = ккал×доля/9, всё округляется.

---

## 9. Общие требования

### 9.1 Формат ошибок (единый)

```json
{ "error": "Человекочитаемое сообщение на русском" }
```
Статусы: `400` валидация, `401` нет/невалидный токен, `403` чужой ресурс,
`404` не найдено, `409` конфликт (username занят), `502` внешний сервис (Gemini).

### 9.2 CORS

Разрешить origin фронта: `https://ai-food.pointcoffee.uz` (+ `http://localhost:3000`
для разработки). Методы: GET, POST, PUT, PATCH, DELETE. Заголовки: Authorization,
Content-Type.

### 9.3 Переменные окружения бэкенда

| Переменная | Назначение |
| --- | --- |
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` | подпись access-токенов |
| `JWT_REFRESH_SECRET` | подпись refresh-токенов |
| `GEMINI_API_KEY` | Google Gemini (если /analyze переносится на бэкенд) |
| `STORAGE_*` | доступ к файловому хранилищу (S3/диск) для фото |

### 9.4 Сводная таблица эндпоинтов

| Метод | Путь | Auth | Назначение |
| --- | --- | --- | --- |
| POST | /auth/register | — | регистрация (username+password) |
| POST | /auth/login | — | вход |
| POST | /auth/refresh | — | обновление токенов |
| POST | /auth/logout | ✓ | выход |
| GET | /auth/me | ✓ | текущий пользователь |
| GET | /profile | ✓ | получить профиль |
| PUT | /profile | ✓ | upsert профиля (включая plan и subscription) |
| DELETE | /profile | ✓ | сброс данных профиля |
| GET | /meals?limit=50 | ✓ | список блюд (createdAt desc) |
| POST | /meals | ✓ | создать блюдо (опц. createdAt задним числом) |
| PATCH | /meals/:id | ✓ | редактировать name/calories/protein/fats/carbs/description |
| DELETE | /meals/:id | ✓ | удалить блюдо + его фото |
| DELETE | /meals | ✓ | удалить все блюда пользователя + фото |
| POST | /upload/meal-photo | ✓ | загрузка JPEG, ответ { url } |
| POST | /analyze | ✓ | AI-анализ: { image } ИЛИ { text } |

### 9.5 Миграция данных из Supabase

Текущий проект: `https://ijcecgnopsbgyjtnfwqt.supabase.co`
- `auth.users` → users (username = `raw_user_meta_data->>'username'`,
  либо `split_part(email,'@',1)`; пароли перенести нельзя — пользователи зададут заново
  или мигрируйте хэши через Supabase admin API)
- `public.profiles`, `public.meals` → одноимённые таблицы (структура идентична разделу 2)
- Storage bucket `meal-photos` → новое хранилище; в `meals.photo_url` заменить домен

---

## 10. Соответствие фронтенд-кода и API (что где вызывается)

| Файл фронта | Что делает | Эндпоинт |
| --- | --- | --- |
| `src/app/auth/page.tsx` | вход/регистрация | POST /auth/login, /auth/register |
| `src/store/provider.tsx` | восстановление сессии, загрузка данных | GET /auth/me, /profile, /meals |
| `src/app/processing/page.tsx` | сохранение профиля после онбординга | PUT /profile |
| `src/app/plan/page.tsx` | тумблер auto_track_orders | PUT /profile |
| `src/app/goals/page.tsx` | ручное изменение целей (plan) | PUT /profile |
| `src/app/checkout/page.tsx` | оплата → subscription | PUT /profile |
| `src/app/scan/page.tsx` | фото → анализ → фото-URL → блюдо | POST /analyze, /upload/meal-photo, /meals |
| `src/app/add-text/page.tsx` | текст → анализ → блюдо (опц. createdAt) | POST /analyze, /meals |
| `src/components/food/EditMealDialog.tsx` | редактирование блюда | PATCH /meals/:id |
| `src/app/dashboard/page.tsx` | свайп-удаление | DELETE /meals/:id |
| `src/app/profile/page.tsx` | сброс данных, выход | DELETE /meals, /profile; POST /auth/logout |
