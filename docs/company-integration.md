# Company integration status

Frontend routes under `/dashboardEmpresa`:

| Route | Verified API contract | Scope |
| --- | --- | --- |
| `/notificacoes` | `GET /notification`, `PATCH /notification/:id/read`, `PATCH /notification/read-all`, `DELETE /notification/:id` | Account-scoped list, unread filter, mark-read actions and confirmed deletion |
| Shell notification bell | `GET /notification/unread/count` | Refreshes on navigation, window focus and local mark-read events; not a real-time socket subscription |
| `/indicadores` | `GET /environmental-impact` | Per-shopping estimates; not company-exclusive totals |
| `/disputas` | `GET /dispute`, `PUT /dispute/:id` | Participant-scoped monitoring and description editing for own open disputes; resolving/rejecting is admin-only |
| `/avaliacoes` | `GET /review`, `PUT/DELETE /review/:id` | Received/sent scopes; only own authored reviews expose editing/deletion. Filtering is presentation; API enforces authorization |
| `/perfil` | `GET/PUT /user/:id`, `GET /localization`, `PUT /localization/:id` | Name/contact and existing addresses; API enforces ownership |
| `/recebimentos` | `/payment/configuration`, `/payment/mercado-pago/account`, `/payment/mercado-pago/connect` | Existing account connection management; no claim of completed payments |
| `/negociacoes` | No seller list/detail contract | Explicit unavailable state; do not present buyer purchases as sales |

`/mapaEmpresas` now loads `GET /localization/companies`. Coordinates are approximate as returned by the server; no invented radius, distances, prices, donation flags or company photographs are shown.

## Required backend coordination

Current `shoppingService.getShoppings` filters non-admin requests by buyer ID only. Current detail controller also denies sellers. A seller-authorized list/detail contract is required before implementing incoming negotiation details, payment history/actions, and review/dispute creation from those negotiations. Seller status mutation exists but must not be exposed without the corresponding authorized context and item ownership checks. No backend files were changed.

## Verification boundary

Browser checks use intercepted synthetic responses, not production credentials or personal records. They establish frontend rendering, request wiring, route guards, error/empty behavior and responsive layout, not working OAuth, payment processing, database migrations or geocoding. The frontend has no configured test suite.

Additional action checks at 1440 and 390 px: editing/deleting own reviews, hiding author actions on received reviews, restricting dispute edits to own open entries, preserving review drafts on HTTP 409, cancelling deletion, and confirmed notification deletion. All passed with intercepted responses. No backend mutations were made during these checks.

## Material and profile management

- `/dashboardEmpresa/materiais/:id/editar`: full `PUT /product/:id` with all required fields; checks current account ownership before rendering the form. Donation sends empty price (controller normalizes to null). `DELETE /product/:id` requires explicit confirmation.
- Photos are managed as a collection in the owner-authorized product PUT. Unchanged photos are omitted; changed photos use binary multipart files; removing all sends an empty `photos` field. Individual photo routes currently authenticate but do not check product ownership, so the frontend does not use them. Backend maintainers should enforce ownership there independently of this frontend.
- Company profile now supports `POST/DELETE /localization`, profile-photo multipart `PUT /user/:id`, and `PATCH /user/password`. Passwords and selected images remain in component memory only. Password fields clear on success; contact/address data is not newly persisted to browser storage.
- Browser verification uses intercepted responses and generated temporary password values, not actual account credentials. Real database updates/geocoding and filled-address creation remain unverified.
