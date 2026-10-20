<div align="center">

# Reaproveita Franca

### Give industrial materials a second life.

Web frontend for a circular-economy platform connecting local material generators with the people and organizations ready to reuse what would otherwise become waste.

<p>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white">
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white">
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white">
  <img alt="License MIT" src="https://img.shields.io/badge/License-MIT-2f6f4e.svg">
</p>

**TCC · Systems Development · SENAI Franca/SP · 4th semester**

[Explore the app](#-get-started) · [Understand the project](#-how-it-works) · [Read the agent guides](#-documentation)

</div>

---

![Reusable leather material representing the circular-economy marketplace](public/hero-leather-scraps.jpg)

## ♻️ The idea

Factories often have useful leftover materials—leather, fabric, EVA, rubber, foam, packaging, pallets, and more. Reaproveita Franca helps make those materials discoverable by connecting companies with artisans, cooperatives, schools, NGOs, and small businesses in Franca, Brazil.

The broader product is developed as three independent applications: a web frontend, a mobile app, and an API. **This repository contains the web frontend only.**

## ✨ What this web app contains

The current frontend includes public discovery and account flows, plus role-specific protected areas:

| Area | Current experience |
| --- | --- |
| Public home | Product introduction and marketplace context |
| Account access | Login screen with company/buyer selection |
| Registration | Account type selection and individual/company registration forms |
| User area | Protected user dashboard route |
| Company area | Protected company dashboard route |
| API connection | Shared Axios client, JWT request interceptor, registration and email-code helpers |

> **Implementation status matters.** A page or API route by itself does not mean an end-to-end feature is complete. Reservation, negotiation, payment, recovery, social login, map, and environmental-impact workflows are not confirmed as complete in the current web/API implementation. See [Feature readiness](docs/feature-readiness.md) and [Product status](docs/product.md).

## 🔄 How it works

```mermaid
flowchart LR
    Company[Company publishes reusable material] --> Listing[Material listing]
    Listing --> Reusers[Artisans · Cooperatives · Schools · Businesses]
    Reusers --> Reuse[Material finds a new use]
    Reuse --> Impact[Less waste · More local circularity]
```

The product vision includes sale and donation listings. Current backend product validation requires a price for sale and forbids a price for donation. Only present workflows that the API actually supports; the product vision is not a promise that every transaction feature is already available.

## 🧭 Application routes

Routes are defined in [`src/App.tsx`](src/App.tsx). Role checks in the frontend improve navigation UX; the API must enforce authorization independently.

| Route | Access | Screen |
| --- | --- | --- |
| `/` | Public | Home |
| `/login` | Public | Login |
| `/cadastro` | Public | Choose account type |
| `/cadastro-empresa` | Public | Company registration |
| `/cadastro-pessoal` | Public | Individual registration |
| `/dashboardUsuario` | `user` role | User dashboard |
| `/dashboardEmpresa` | `company` role | Company dashboard |

## 🧱 Technology

| Concern | Technology |
| --- | --- |
| UI | React 19 + TypeScript |
| Build and dev server | Vite 8 |
| Navigation | React Router 7 |
| Styling | Tailwind CSS 4 + MUI 9 |
| Icons | lucide-react |
| HTTP | Axios |
| Code quality | ESLint + TypeScript build |

## 🚀 Get started

### Requirements

- Node.js 20 or newer
- npm
- The API running locally for authenticated and data-backed flows

### Install and run

```bash
npm install
npm run dev
```

Vite starts the web app and proxies `/api` to `http://localhost:5000` by default. To point the proxy at another API host, create a local `.env.local` file:

```dotenv
VITE_BACKEND_URL=http://localhost:5000
```

The API base path is `/api/reaproveitafranca`. `VITE_API_URL` can override the Axios base URL when a direct API URL is needed. **Do not put secrets in `VITE_*` variables**—Vite exposes them to browser code.

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and create the production bundle |
| `npm run preview` | Preview the production build locally |

There is currently no dedicated frontend test suite or root-level workspace command. Run commands from this repository, not the workspace root.

## 🔌 Connected applications

| Application | Repository | Responsibility |
| --- | --- | --- |
| Web | [FrontEnd-RF](https://github.com/leonardoA-Silva/FrontEnd-RF) | Browser experience (this repository) |
| API | [backend-RF](https://github.com/ViniciusPeroni/backend-RF) | Express API, MySQL, authentication, and Socket.IO infrastructure |
| Mobile | [Mobile-RF](https://github.com/BryanMoreira0717/Mobile-RF) | Native app built with Expo / React Native |

These are separate applications with separate dependencies and owners—not a monorepo. For this repository, sibling apps are read-only references; coordinate required changes with their maintainers.

### API integration note

The web app uses [`src/axios/Axios.ts`](src/axios/Axios.ts). The API currently exposes one `POST /user/login` route; the two exported login helper functions in the web Axios module target `/login` and should not be used as-is. The login page currently calls the API inline. Check the [verified API contract](docs/api-contract.md) before changing integrations.

## 🗂️ Project map

```text
src/
├── App.tsx                  # Browser routes and protected dashboards
├── main.tsx                 # React entry point
├── index.css                # Global Tailwind import
├── axios/Axios.ts           # Axios client, auth interceptor, API helpers/types
├── components/              # Shared UI, notifications, route guard, OTP modal
├── hooks/                   # Logged-user and notification hooks
└── pages/
    ├── home/                 # Public landing page
    ├── login/                # Login flow
    ├── register/             # Account type and registration flows
    └── dashboard/            # User and company areas
```

Styling follows nearby code: Tailwind classes are generally grouped in a local `styles` object in each TSX file. MUI is also in use. Prefer the established pattern in the area you are changing.

## 📚 Documentation

- [Agent entry point](llms.txt) — recommended reading order for AI coding agents.
- [Agent rules](AGENTS.md) and [agent workflow](CLAUDE.md).
- [Architecture](docs/architecture.md) and [verified API contract](docs/api-contract.md).
- [Product context and requirements](docs/product.md) and [feature readiness](docs/feature-readiness.md).
- [UI guidelines](docs/ui-guidelines.md), [pt-BR content](docs/localization.md), and [security/privacy](docs/security-privacy.md).
- [Quality checks](docs/quality.md), [cross-repository workflow](docs/integration-workflow.md), and [decisions](docs/decisions.md).
- [Contributing](CONTRIBUTING.md) and [ADR process](docs/adr/README.md).

## 🎓 Project context

Reaproveita Franca is a final course project (TCC) for the 4th semester of the Systems Development program at SENAI Franca/SP. Its goals are to reduce industrial waste, make reusable materials easier to find, strengthen the local economy, and support circular-economy practices.

Product proposals such as photo-based material classification, category suggestions, maps, impact indicators, and recommendations should be treated as future scope unless their implementation and API support are verified.

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
