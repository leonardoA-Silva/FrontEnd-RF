# Plan: Reaproveita Franca UI redesign

## Goal

Redesign all currently implemented web surfaces while preserving the approved Recycle identity, verified product truth, existing routes, role guards, API behavior, form semantics, and pt-BR copy.

## Architecture

Keep the existing React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Axios, and Lucide stack. Work in three independently verifiable surface groups: public/authentication, company/user dashboards and materials, then map; share existing shell/token conventions only where they are genuinely shared. Do not add dependencies or modify API/mobile repositories.

## Tech Stack

React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Axios, lucide-react.

## Spec path

`PRODUCT.md`, `DESIGN.md`, `docs/product.md`, `docs/api-contract.md`, `docs/ui-guidelines.md`, and this plan.

## Global Constraints

- Preserve identity: Recycle symbol, Manrope, forest green/leather/paper palette.
- All user-facing copy remains pt-BR.
- Only companies publish; listings are sale or donation; donation has no price.
- Do not claim payment, reservation, map, negotiation, messaging, or impact features unless current implementation/API confirms them.
- Preserve routes, guards, and behavior; keep changes frontend-only.
- Respect `prefers-reduced-motion`; keep controls semantic, keyboard accessible, and responsive.
- Avoid adding dependencies.
- Preserve existing local untracked preview files (`preview-mapa.html`, `src/preview-mapa.tsx`).

## Review Focus

1. **Unverified homepage proof removed or confirmed** — inspect rendered home content; no unsourced impact figures or testimonial claims remain.
2. **Flow regressions** — verify all existing route destinations, auth/register controls, protected routes, and material form interactions remain wired.
3. **Unsupported API promises** — audit new/retained copy against API contract and actual code, especially reservation, payment, and map.
4. **Responsive/accessibility regressions** — inspect at 1440, 768, and 390 widths; check keyboard focus, labels, color contrast, touch usability, and reduced motion.
5. **Build/style regressions** — run `npm run lint` and `npm run build` from this repository; check console/network failures on changed routes where practical.

## Surface groups

### D. Motion direction refinement from the user's references

- Direction: cinematic motion inspired by the interaction craft of Active Theory, Cuberto, Locomotive and Igloo Inc.; editorial composition informed by Obys Agency. These are references for motion/composition only, not templates or claims of direct site research.
- Keep the established Reaproveita Franca palette, Manrope, content, routes and product truth. Do not add Three.js/WebGL, smooth-scroll, custom cursors, autoplay video, or dependencies.
- Focal moment: the real material photograph on the home hero opens with a controlled shutter; the material explorer responds to the visitor's actual selection. Map markers and material-image changes communicate selection with bounded transforms/opacity.
- Operate surfaces (login, registration, dashboards, material form/list, map) use fast, interruptible state feedback and modest route entrance only; no long cinematic waits or repeated scroll choreography.
- Reduced-motion mode removes spatial travel, shutter and scroll-linked movement while leaving every image, action and state visible.
- Verification: lint/build; inspect all routes at desktop/tablet/mobile; test home material selection, map selection/filtering where data is available, registration form controls, reduced-motion preference, and check for console errors/overflow.

### A. Public home and authentication

- Files: `src/pages/home/Home.tsx`, `src/pages/login/Login.tsx`, `src/pages/register/RegisterType.tsx`, `src/pages/register/RegisterCompany.tsx`, `src/pages/register/RegisterUser.tsx`, and only the nearest shared header/footer or global tokens if necessary.
- Acceptance: public information is factually supported; CTA destinations stay on implemented routes; forms preserve validation, request, loading, success, and recoverable error behavior; responsive layouts remain usable.
- Verification: inspect each route's controls and states, then lint/build.

### B. Dashboards and materials

- Files: `src/components/dashboard/DashboardShell.tsx`, `src/pages/dashboard/DashboardUsuario.tsx`, `src/pages/dashboard/DashboardEmpresa.tsx`, `src/pages/dashboard/MeusMateriais.tsx`, `src/pages/dashboard/NovoMaterial.tsx`, `src/pages/dashboard/dashboardApi.ts` only if required to understand existing data (avoid API changes).
- Acceptance: role-specific navigation and logout remain; existing material list/create behavior and request states remain; no invented KPIs, transactions, or actions are shown.
- Verification: test shell links/menu/logout, list empty/error/success states where reachable, and material form interactions at desktop/mobile widths; lint/build.

### C. Company map

- Files: `src/pages/dashboard/MapaEmpresas.tsx`, `src/pages/dashboard/mapaApi.ts`, shared dashboard shell only if needed.
- Acceptance: preserve real map/provider functionality, filters, selection, and navigation as implemented; do not imply unsupported geocoding or map data.
- Verification: exercise available map/list controls and loading/error/empty states; inspect narrow width; lint/build.

## Execution order

1. Capture a before-state for representative public and app screens; inventory all current routes, assets, forms, and behaviors.
2. Finalize design direction using the existing brand constraints and professional reference research; keep the marketing page and app screens in their respective visual modes.
3. Implement group A and verify before proceeding.
4. Implement group B and verify before proceeding.
5. Implement group C and verify.
6. Run whole-app lint/build, inspect final screenshots at desktop/tablet/mobile widths, exercise changed controls, and review the final diff for scope/privacy/API assumptions.
