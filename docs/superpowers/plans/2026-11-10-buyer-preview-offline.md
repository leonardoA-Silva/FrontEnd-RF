# Plan: Make buyer preview interactive without API

> **Executor instructions**: Keep demo behavior limited to the buyer-preview route. Run checks below; do not claim API-backed behavior works in preview.
>
> **Drift check**: `git diff --name-only 0add2b2 -- src/axios/Axios.ts src/hooks/useBuyerSocket.ts src/pages/dashboard/DashboardPreview.tsx src/pages/dashboard/DashboardUsuario.tsx src/pages/dashboard/comprador/BuyerAddresses.tsx src/pages/dashboard/comprador/BuyerProfile.tsx src/pages/dashboard/comprador/BuyerReservations.tsx src/pages/dashboard/comprador/BuyerSecurity.tsx src/pages/marketplace/ProductCatalog.tsx src/preview/buyerPreview.mjs src/preview/buyerPreview.d.mts scripts/buyer-preview.test.mjs`
> Expected: no output. Reconcile any changed paths before editing.

## Status

- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Planned at**: revision `0add2b2f83ea35774a262d003e689612a4fcdeb7`, 2026-11-10

## Why this matters

`/previa/dashboard/usuario` currently shows only a link to login. Buyer pages use Axios and chat uses Socket.IO, so directly mounting the real dashboard either requires a live backend or risks sending demo actions to real services. Deliver the real buyer layouts with clearly fictitious data and local-only interactions.

## Current state

- `src/App.tsx:67-70` exposes both preview routes only in development. Buyer preview currently renders `DashboardPreview` with `kind="user"`.
- `src/pages/dashboard/DashboardPreview.tsx:25-26` renders the company demo or a login link; it does not mount buyer screens.
- `src/pages/dashboard/DashboardUsuario.tsx:28-46` composes the real buyer tabs and calls `useBuyerSocket(token)`. It returns nothing without a session user.
- Buyer pages call functions on the shared Axios instance in `src/axios/Axios.ts:217-264`; marketplace catalog uses that client too.
- `src/hooks/useBuyerSocket.ts:9-30` connects only when given a token. Use null token in preview.
- `src/pages/dashboard/comprador/BuyerAddresses.tsx` also uses CEP lookup; preview must not call external network services.
- Company demo is precedent: `src/pages/company/CompanyWorkspace.tsx` seeds data in memory and gates live operations on `preview`.
- `package.json` provides `npm run lint` and `npm run build`; no test runner is configured. Node 24 built-in test runner is available without adding dependencies.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Focused demo tests | `node --test scripts/buyer-preview.test.mjs` | All tests pass |
| Lint | `npm run lint` | Exit 0 |
| Typecheck/build | `npm run build` | TypeScript and Vite exit 0 |
| Diff hygiene | `git diff --check` | No output, exit 0 |

## Scope

- `src/axios/Axios.ts`
- `src/pages/dashboard/DashboardPreview.tsx`
- `src/pages/dashboard/DashboardUsuario.tsx`
- `src/pages/dashboard/comprador/BuyerAddresses.tsx`
- `src/pages/dashboard/comprador/BuyerProfile.tsx`
- `src/pages/dashboard/comprador/BuyerReservations.tsx`
- `src/pages/dashboard/comprador/BuyerSecurity.tsx`
- `src/pages/marketplace/ProductCatalog.tsx`
- `src/hooks/useBuyerSocket.ts` only if needed to make network isolation explicit
- `src/preview/buyerPreview.mjs`
- `src/preview/buyerPreview.d.mts`
- `scripts/buyer-preview.test.mjs`

Do not add dependencies, alter authenticated buyer behavior, or touch backend/mobile repositories.

## Steps

### Step 1: Prove preview transport is local-only

Add a small built-in Node test for the demo transport: known buyer reads return representative fixtures; supported mutations update only in-memory data; unknown paths reject instead of reaching network; chat events stay local; a fresh demo state restores defaults. Then implement the smallest Axios adapter/transport selected only when current route is `/previa/dashboard/usuario`. Do not attach stored JWT in this mode. Keep authenticated requests on the existing Axios adapter.

**Verify**: `node --test scripts/buyer-preview.test.mjs` → tests fail before implementation, then pass after.

### Step 2: Mount real buyer components with isolated demo identity

Update `DashboardPreview` and `DashboardUsuario` to pass preview mode, provide a synthetic buyer identity without reading/altering stored sessions, and use null token so `useBuyerSocket` never connects. Display explicit “dados fictícios / alterações temporárias” messaging. Route links from buyer preview must stay within preview or clearly exit it.

**Verify**: focused tests pass; `npm run build` → exit 0.

### Step 3: Cover buyer screens and local actions

Return representative product, reservation/history, notification, address, card, profile, and conversation data matching existing API response shapes. Support harmless demo mutations (read/delete notification, edit/remove address or card, message draft/send, reservation cancel) in memory. Disable account deletion and password changes rather than pretending to complete sensitive actions. Prevent CEP lookup from making external requests in preview.

**Verify**: `node --test scripts/buyer-preview.test.mjs` covers each fixture/mutation category and network-deny fallback; no external network call is reachable from the preview route.

### Step 4: Validate and review

Run lint/build, inspect route and final diff. Confirm regular authenticated dashboard still uses live APIs and socket; demo route never reads or clears session credentials and never emits HTTP or Socket.IO traffic.

**Verify**: `npm run lint`, `npm run build`, `git diff --check` all exit 0; working tree contains only scoped files.

## Done criteria

- [x] `/previa/dashboard/usuario` mounts buyer workspace without login/API.
- [x] Buyer tabs show representative fake data and support safe local-only actions.
- [x] Preview transport rejects unknown requests; CEP and Socket.IO use no network; session storage is bypassed.
- [x] Authenticated buyer route remains wired to existing real behavior.
- [x] Focused Node tests, lint, build, and `git diff --check` pass.

## STOP conditions

- A buyer component performs network access outside the shared Axios client and CEP service, requiring unlisted integration work.
- Fixture shape cannot be derived from current API types/components.
- A safe preview would require changing authenticated behavior or persisting user data.
- Verification fails twice after focused correction.

## Maintenance notes

Keep demo fixtures clearly fictional. Any new buyer endpoint must fail closed in preview until an explicit local fixture is added. Sensitive account/security actions remain disabled.
