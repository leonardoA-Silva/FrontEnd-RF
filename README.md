# Reaproveita Franca — Web Frontend

A **circular economy** digital platform connecting companies that generate reusable industrial waste with artisans, cooperatives, schools, NGOs, and small businesses in Franca/SP, Brazil.

> Final course project (TCC) — 4th semester — Systems Development — SENAI Franca/SP. Version `1.0.0`.

Listings can be **Sale** or **Donation**. Only companies can publish listings. Any registered user can request a reservation. Payments are processed inside the platform with a **5% fee**. Pickup/delivery is arranged directly between the parties.

## Related repositories

- Mobile: https://github.com/BryanMoreira0717/Mobile-RF
- Backend/API: https://github.com/ViniciusPeroni/backend-RF
- This frontend: https://github.com/leonardoA-Silva/FrontEnd-RF

Prototype: Figma TCC-Senai · Flows: Miro · Sprints: Trello (links in the TCC document).

## Stack

| Layer | Technology |
| --- | --- |
| App | React 19 + TypeScript + Vite 8 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + MUI 9 |
| Icons | lucide-react |
| HTTP | axios (`src/axios/Axios.ts`) |
| Lint/Build | ESLint + `tsc -b && vite build` |

## Prerequisites

- Node.js 20+ and npm

## Getting started

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # tsc + production build
npm run preview  # serve the production build
npm run lint     # eslint
```

## Project structure

```text
src/
  main.tsx            # entry point + index.css import
  index.css           # only `@import "tailwindcss"`
  App.tsx             # routes (BrowserRouter)
  components/
    Header.tsx        # brand + Sign in / Sign up buttons
    Footer.tsx        # links + copyright
  pages/
    home/Home.tsx     # hero + stats + technologies + testimonial
    login/Login.tsx   # "Sign in to your account" card (tabs, social login)
    register/         # RegisterType / RegisterCompany / RegisterUser (under construction)
  axios/Axios.ts      # HTTP client (under construction)
```

Code convention: no per-component `.css` files — a `styles` object inside each `.tsx` holds semantic Tailwind classes (see `Home.tsx`).

## Routes

| Route | Status | Description |
| --- | --- | --- |
| `/` | ✅ active | Home |
| `/login` | 🚧 ready, route commented out in `App.tsx` | Company/buyer login + Google/LinkedIn |

> To enable login, uncomment the import and the `<Route path="/login">` in `src/App.tsx:3,14`.

## Features (RF01–RF18)

- ✅ RF03 partial (screen), RF08/RF09 partial (Home showcase)
- 🚧 RF01/RF02/RF04–RF07, RF10–RF18: registration, listing, reservation, payment, history, notification, rating, and profile screens — under construction in backend/register

## Business rules (RN01–RN10 summary)

1. Only companies publish listings. 2. Any registered user can request a reservation. 3. Instant publishing, no prior approval. 4. Type Sale or Donation. 5–6. Reservations accepted/declined by the advertiser. 7–8. In-platform payment + 5% fee (donations exempt). 9. Shipping/pickup handled by the parties. 10. Listings require title, description, category, photos, quantity, weight, location, condition, and type.

Full document (in Portuguese): `POLITICA_PRIVACIDADE_E_TERMOS_DE_USO.pdf` (+ `.txt`) at the repo root.

## Roadmap (out of v1.0.0 scope)

AI (photo-based classification, category/description suggestions), ESG/CO₂ dashboard, carrier/freight/tracking integration, ERP/invoicing.

## License

MIT — see `LICENSE` (© 2026 Leonardo Alves da Silva).
