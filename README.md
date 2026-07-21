# Счётчик калорий — AI Трекер (Cal AI)

AI-kaloriya trekeri webapp: Next.js 16 + TypeScript + MUI v9 + Redux Toolkit.
Backend: Point Coffee Core REST API (`NEXT_PUBLIC_API_URL`). Auth: JWT from
the native Point Coffee app WebView (no separate login).

## Sahifalar

| Route | Tavsif |
| --- | --- |
| `/` | Welcome — «Следите за своим рационом» |
| `/onboarding/1..5` | Jins/yosh → bo'y/vazn → mashqlar → maqsad → dieta |
| `/processing` | 99% — plan hisoblash animatsiyasi |
| `/plan` | «Ваш персональный план готов!» — kunlik KBJU normalar |
| `/dashboard` | Asosiy ekran — qolgan kaloriya, makrolar, ovqatlar tarixi |
| `/scan` | Kamera / galereya → Core API `/analyze` |
| `/food/[id]` | Ovqat detali — KBJU + AI tavsifi |
| `/premium` | Trial + pullik tariflar |
| `/checkout` | Real to'lov (wallet / click / payme / uzum) |
| `/subscription` | Obuna holati |
| `/profile` | Profil |

## Ishga tushirish

```bash
npm install
npm run dev      # http://0.0.0.0:3000 (LAN: http://192.168.1.159:3000)
npm run build
npm start
```

## Muhit sozlamalari

`.env.local`:

```
NEXT_PUBLIC_API_URL=https://core.pointcoffee.uz
```

JWT mobile WebView orqali inject qilinadi (`window.__COFFEE_JWT__` yoki
`postMessage` `{type:'AUTH_TOKEN', token}`).

## API shartnomasi

Qarang: [`docs/NUTRITION_MOBILE.md`](docs/NUTRITION_MOBILE.md).

## Arxitektura

```
src/
├── app/                    # Next.js App Router
├── components/
├── store/                  # Redux: profile / meals / app / subscription
├── lib/api/                # REST client + JWT bridge
├── theme/
└── types/
```

- **Auth:** Coffee mobile JWT (Bearer). Alohida login yo'q.
- **Profil / meals / upload / analyze / subscriptions:** Core REST API.
- **Plan hisobi:** Mifflin–St Jeor (client-side), `PUT /profile` orqali saqlanadi.
