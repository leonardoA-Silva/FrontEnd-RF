# Company workspace implementation plan

**Goal:** Implement the selected company dashboard style across library, publish, edit, detail, account and delete confirmation; keep the local API-free preview usable.
**Architecture:** Company shell and nested routes with one workspace state owner. Demo products live only in React memory. Production loads the confirmed public product list and filters by logged identity; account uses protected own-user GET/PUT contracts. Product mutations are deliberately unavailable outside preview until backend role/ownership authorization and a safe location-selection contract are confirmed.

- [x] Add typed product mappings, temporary demo data and defensive read adapters.
- [x] Build forest rail, editorial header, search/filter/pagination library, status/loading/error/empty states.
- [x] Build publication/edit forms, photo preview, sale/donation validation, details and accessible delete confirmation.
- [x] Build company account view/edit using confirmed name/cellphone fields, no document persistence.
- [x] Verify all nested routes, preview isolation/local CRUD, account states, production authorization boundaries, keyboard/responsive layout, lint/build.

Constraints: frontend only, no dependency changes, preserve all user/home/account work, no personal data in fixtures/screenshots/logs. Prototype changes are explicitly temporary and never reported as server persistence. Real product mutations must not rely on frontend ownership checks as authorization.
