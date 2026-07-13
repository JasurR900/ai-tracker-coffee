# Счётчик калорий — AI Трекер (Cal AI)

AI-kaloriya trekeri webapp: Next.js 16 + TypeScript + MUI v9 + Redux Toolkit + Google Gemini + Supabase (auth, database, storage).

## Sahifalar

| Route | Tavsif |
| --- | --- |
| `/` | Welcome — «Следите за своим рационом» |
| `/onboarding/1..5` | Jins/yosh → bo'y/vazn → mashqlar → maqsad → dieta |
| `/processing` | 99% — plan hisoblash animatsiyasi |
| `/plan` | «Ваш персональный план готов!» — kunlik KBJU normalar |
| `/dashboard` | Asosiy ekran — qolgan kaloriya, makrolar, ovqatlar tarixi |
| `/scan` | Kamera / galereya → Gemini AI tahlil |
| `/food/[id]` | Ovqat detali — KBJU + AI tavsifi |
| `/premium` | Premium tariflar |
| `/checkout` | To'lov (demo) |
| `/profile`, `/loyalty`, `/maps` | Profil va stub sahifalar |

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # production server
```

## Muhit sozlamalari

`.env.local` (`.env.example`dan nusxa oling):

```
GEMINI_API_KEY=<gemini-key>
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Yangi Supabase proyekt uchun schema (jadvallar, RLS, storage bucket) bir marta o'rnatiladi:

```bash
POSTGRES_URL_NON_POOLING="postgres://..." node scripts/setup-db.mjs
```

> **Muhim:** Hozirgi kalitning free-tier kvotasi 0 va Gemini 2.5+/3.x modellarga
> ruxsati yo'q. Kalit ishlamasa, `/api/analyze` avtomatik **fallback rejimga**
> o'tadi (o'rtacha porsiya bo'yicha taxminiy baho, tavsifda ogohlantirish bilan).
> To'liq AI tahlil uchun [Google AI Studio](https://aistudio.google.com/apikey)dan
> kvotali yangi kalit oling — kod `gemini-2.5-flash → gemini-2.0-flash →
> gemini-2.0-flash-lite` zanjirini avtomatik sinaydi.

## Arxitektura

```
src/
├── app/                    # Next.js App Router sahifalari + /api/analyze
├── components/
│   ├── layout/             # AppShell, BottomNav, PageHeader
│   ├── onboarding/         # WheelPicker, HeightRuler, WeightSlider, steps/
│   ├── dashboard/          # WeekStrip, CaloriesCard, MealCard
│   └── ui/                 # PrimaryButton, SelectCard, ProgressRing, ikonlar
├── store/                  # Redux Toolkit: profile / meals / app slicelari
├── lib/                    # nutrition (Mifflin-St Jeor), storage, image, format
├── theme/                  # MUI tema (Manrope, navy #1B1B6D, orange #F94C10)
└── types/                  # Umumiy TypeScript tiplar
```

- **Auth:** Supabase email/parol. Registratsiya server route (`/api/auth/register`)
  orqali service-role bilan tasdiqlangan user yaratadi — email-confirmation shart emas.
- **Persistensiya:** profil va ovqatlar Supabase Postgres'da (`profiles`, `meals`
  jadvallari, RLS bilan har kim faqat o'z ma'lumotini ko'radi), sessiya reload'dan
  keyin ham saqlanadi.
- **Rasmlar:** clientda 640px/JPEG'ga siqiladi → Supabase Storage `meal-photos`
  bucket'iga yuklanadi (public URL, foydalanuvchi faqat o'z papkasiga yozadi).
- **Plan hisobi:** Mifflin–St Jeor BMR × faollik × maqsad; makrolar dieta bo'yicha.
