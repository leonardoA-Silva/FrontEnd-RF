# Frontend Architecture

## Product and repository boundary

Reaproveita Franca connects industrial material generators with people and organizations that can reuse those materials. This repository is the web client only. The workspace also contains an independently maintained Express/MySQL API and an Expo mobile application; each has its own dependencies and release ownership. Do not treat the workspace as an npm monorepo.

## Stack and commands

- React 19 + TypeScript 6, built and served by Vite 8.
- React Router 7 for browser routes.
- Tailwind CSS 4 through `@tailwindcss/vite`; MUI 9 is also used.
- Axios for HTTP; lucide-react for icons.
- `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview`.
- No frontend test suite is configured currently.

Run every command from `FrontEnd-RF/`.

## Current source layout

```text
src/
  main.tsx                 # React entry point and global CSS import
  App.tsx                  # BrowserRouter and route table
  index.css                # Tailwind import
  axios/Axios.ts           # Axios instance, auth interceptor, current API helpers/types
  components/              # shared header/footer, route protection, notifications, OTP modal
  hooks/                   # logged-user and notification hooks
  pages/home/              # public landing page
  pages/login/             # login page
  pages/register/          # account type and user/company registration
  pages/dashboard/         # user/company dashboards
```

Routes are currently declared in `src/App.tsx`:

| Path | Access | Current screen |
|---|---|---|
| `/` | Public | Home |
| `/login` | Public | Login |
| `/cadastro` | Public | Registration type selection |
| `/cadastro-empresa` | Public | Company registration |
| `/cadastro-pessoal` | Public | Individual registration |
| `/dashboardUsuario` | `user` role | User dashboard via `ProtectedRoute` |
| `/dashboardEmpresa` | `company` role | Company dashboard via `ProtectedRoute` |

Do not rely on old README assertions that login is commented out or that current routes are unfinished; inspect `App.tsx` and the screens.

## Responsibilities and data flow

- Route composition and role-protected entry points belong in `App.tsx` and `ProtectedRoute`.
- Pages own screen-level state and user flows; shared, genuinely reusable UI belongs in `components/`.
- The Axios instance in `src/axios/Axios.ts` owns the base URL and request interceptor. Use it instead of creating a second client. Its base is `VITE_API_URL` or `/api/reaproveitafranca`; the interceptor reads JWT from `localStorage` then `sessionStorage` under `token`.
- Vite proxies `/api` to `VITE_BACKEND_URL` or `http://localhost:5000`.
- Keep server data distinct from form/view state. Convert/normalize data at the service/UI boundary and type known responses; do not use `any` to conceal an unknown contract.

## Styling and accessibility

Follow local conventions: Tailwind utility strings grouped in a `styles` object in TSX; use MUI only when consistent with neighboring components or a concrete need. Avoid introducing component CSS files or global styling changes casually. User-facing text is pt-BR. Use semantic HTML, associated labels, keyboard-operable controls, visible focus, accessible names for icon-only controls, and error messaging associated with the affected field. Responsive layouts must work for phone, tablet, and desktop widths.

## Integration and product boundaries

See [api-contract.md](api-contract.md) for confirmed routes. The API currently exposes account creation, one login route, OTP, product listing/create/update/delete, localization creation, logs, and Socket.IO chat infrastructure. A route existing does not mean the web UI has completed the associated product flow. Payment, reservation workflow, social login, map UI, AI classification, and environmental indicators must be treated as planned/unverified until both client and API contracts exist.

The mobile app is Expo SDK 57, React Native, and JavaScript. Its API base URL is currently a hardcoded LAN address; that is mobile-only configuration and must not be copied into the web app. Its `AGENTS.md` requires exact SDK-versioned Expo docs before mobile coding; mobile changes are outside this repository's scope.
