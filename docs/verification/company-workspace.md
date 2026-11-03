# Company workspace verification — 2026-10-29

## Delivered scope

The company dashboard is replaced with the selected forest-rail/ivory-table design. Nested routes under `/dashboardEmpresa` and development-only `/previa/dashboard/empresa` cover the materials library, publishing form, editing, details, company account and delete confirmation dialog. Search, category/type filters, derived counts and pagination work. Real products use their API photos; missing/broken photos get a designed placeholder. Demo samples have no personal data.

Preview is interactive: create/edit/delete/account changes stay in React memory, use explicit simulation copy, never read account storage and reset on reload. The user dashboard and earlier home/login/registration design are preserved.

Real mode reads the confirmed product list and filters display to the stored account UUID, with loading, network/server failure, retry, empty and not-found states. Filtering is presentation, not authorization. Account GET/PUT use the verified own-user-protected routes, updating only name and cellphone. No data are logged or additionally persisted.

Product mutations remain disabled outside preview because current backend JWT-only product routes lack role/ownership authorization and no safe location-selection contract was confirmed. This is a concrete backend dependency, documented in api-contract.md. The UI does not claim a real publication or deletion succeeded.

## Evidence

- Focused ESLint for company pages, dashboard wrapper/preview and App: passed.
- Production TypeScript/Vite build: passed, retaining the existing bundle-size warning. No new dependencies.
- Full lint: prior Notification.tsx error/warning remain outside this change.
- Bundled Playwright/headless Edge: five page views checked at 320/390/768/1440px, no horizontal document overflow, one H1, no page JavaScript errors. Desktop/mobile captures inspected; delete confirmation captured separately.
- Preview interactions passed: search/no results/reset, sale/donation filtering, pagination, required validation/focus, sale requires price, donation clears/hides price, create then detail, edit then detail, delete cancellation/confirmation, account simulation, missing-product route. No API requests or local/session storage writes.
- Real-mode acceptance with intercepted synthetic responses passed: own-product filtering, list failure/retry/empty, real product mutation controls disabled, account GET/PUT allowlisted fields, saved response, recoverable update error with retained values, account 403 and anonymous nested-route redirect. No real account or product mutations were submitted.
- Images are generated original local assets; no remote image host is contacted.

No configured frontend test suite exists; these are targeted browser acceptance checks. Live backend, email and production deployment were not exercised. Backend source was inspected read-only.
