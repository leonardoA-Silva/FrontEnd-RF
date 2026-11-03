# Buyer new-ui integration — 2026-11-03

Source: `origin/new-ui` at `abe2906`. Destination: `Rafael/Sprint2----Comprador`. Backup of the clean initial destination: `codex/comprador-antes-new-ui` at `3b5c937`.

## Result

Public/account/company styling from the source branch was integrated. The buyer retains its real API features and uses forest navigation, paper canvas, editorial typography, shared form controls, responsive material cards and collapsible mobile filters/navigation. The source branch's demonstration buyer dashboard was not used. Authentication/session, Google availability checks, safe API errors and buyer endpoints remain those of the destination branch. Backend/mobile files were not modified.

## Checks performed

- `npm run build`: passed. Home and the optional 3D scene are separate lazy chunks. Vite still reports chunks over 500 kB.
- `npm run lint`: one existing error and one warning in unchanged `src/components/Notification.tsx` (`handleClose` declaration/dependencies). All changed application areas pass scoped ESLint.
- `git diff --cached --check`: passed.
- Local one-off Playwright `verify-new-ui.cjs`: public catalog, detail, About, login, account selection and personal registration; all nine buyer sections; mobile navigation; widths 375/768/1280px. No horizontal page overflow or uncaught JavaScript errors. Catalog/account screenshots were inspected.
- Local `verify-buyer-new-ui.cjs`: catalog search/filter/pagination, loading/error/empty states, profile read/update, upload validation, password/first access, account deletion, recovery/reset, expired session, minimal session data and disabled Google login without configuration. Mocked API contracts.
- Local `verify-profile-cep-about-new-ui.cjs`: photo preview before/after confirmed upload and error preservation; invalid images; object URL cleanup; ViaCEP request privacy, error/retry/manual/race cases; address payload; conditional About signup. Mocked external service/API contracts. The current address UI retries lookup on CEP blur, not through a removed button expected by an older script.
- Local `verify-live-buyer-new-ui.cjs`: actual backend process, MySQL and Socket.IO against an exclusively created disposable database. Verified authenticated reservations, stock/cancellation, zero-cost donation, supplier acceptance, address visibility, notifications/realtime, address CRUD/null coordinates, card metadata CRUD, multipart photo persistence, message send/edit/delete/leave and responsive layouts. Disposable database removed after execution; original project database untouched.
- The old chat test expected a visible list error after leaving a conversation. Its expectation was updated for the destination branch's pre-existing recent-conversation fallback. The backend's invalid SQL alias remains confirmed; it was not fixed by this frontend task.
- Computed buyer text contrast pairs range from 6.86:1 to 12.16:1 for the tested combinations.

Playwright scripts and screenshots are local ignored verification artifacts, not a configured npm test suite. No SMTP, real OAuth, payment gateway or actual financial transaction was exercised. Historical screenshots imported from the source branch are not evidence of current API capability.
