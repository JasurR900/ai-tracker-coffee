# Счётчик калорий — AI Трекер (Cal AI)

AI-kaloriya trekeri webapp: Next.js 16 + TypeScript + MUI v9 + Redux Toolkit + Google Gemini.

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

`.env.local`:

```
GEMINI_API_KEY=<sizning-kalitingiz>
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

- **Persistensiya:** butun holat `localStorage`da (`calai:profile`, `calai:meals`),
  store subscribe orqali avtomatik saqlanadi, SSR-xavfsiz hydration bilan.
- **Plan hisobi:** Mifflin–St Jeor BMR × faollik × maqsad; makrolar dieta bo'yicha.
- **Rasmlar:** clientda 640px/JPEG'ga siqiladi, localStorage kvotasi himoyalangan
  (30 ta ovqat cheklovi, kvota to'lsa eski fotolar tushiriladi).
