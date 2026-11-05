# API Integration Contract (Verified Snapshot)

This is a frontend integration reference, not a promise that the API will remain unchanged. Re-check backend routes/controllers before implementing or changing a flow. Backend source of truth is `backend-RF/src/index.js`, `src/routes/apiRoutes.js`, and `src/routes/modules/*Routes.js` plus their controllers. API prefix: `/api/reaproveitafranca`.

## Base URL and auth

- Web Axios base URL: `import.meta.env.VITE_API_URL ?? "/api/reaproveitafranca"` in `src/axios/Axios.ts`.
- Vite `/api` proxy target: `process.env.VITE_BACKEND_URL || "http://localhost:5000"`.
- Request interceptor attaches `Authorization: Bearer <token>` from browser storage key `token`.
- Do not invent refresh-token behavior, cookie auth, or token shape. Inspect login controller and existing login UI before changing session handling.
- Backend has `POST /user/login`; there are not separate `/login/empresa` and `/login` paths under the API prefix. The currently exported `loginEmpresa` and `loginUsuario` helpers in `Axios.ts` both post to `/login` and are unused/broken; login page calls the actual route inline. Do not use those helpers as-is.

## Confirmed routes

| Method | Path after API prefix | Auth at route | Known behavior |
|---|---|---|---|
| POST | `/user/create` | Public | Individual account creation; accepts multipart upload field `photo`; requires name, CPF, email, password, cellphone, birthday and address fields; returns `message`, `id`, `emailSent` on success. |
| POST | `/user/create/empresa` | Public | Company account creation; accepts `photo`; requires personal and company documents plus account/address fields; returns `message`, `id`, `emailSent`. |
| POST | `/user/login` | Public + auth rate limiter | Single login route; inspect controller and current page payload before relying on credential/response details. |
| POST | `/otp/enviar` | No route-level JWT middleware | Sends/re-sends verification code; inspect OTP service for semantics and limits. |
| POST | `/otp/verificar` | No route-level JWT middleware | Verifies code. Current frontend helper posts `{ id, code }`. |
| GET | `/product/` | Public | Returns product list. Controller returns an array on success. |
| GET | `/product/:id` | Public | Product by UUID; invalid id returns 400, missing record 404. |
| POST | `/product/create` | JWT | Creates product; fields include name, description, price, priority, quantity, status, category, `type_negotiation`, weight, `conservation_state`, `id_localization`; sale requires price, donation forbids price. Owner is derived from JWT. |
| PUT | `/product/:id` | JWT | Updates product fields; inspect service/controller for exact partial-update semantics. |
| DELETE | `/product/:id` | JWT | Deletes product. |
| POST | `/localization/` | Validation middleware, no route-level JWT shown | Creates localization; inspect validator/controller for payload. |
| POST/GET/GET by id/PUT/DELETE | `/log/` and `/log/:id` | No route-level JWT shown | Log CRUD exists; do not expose or wire it to normal user screens without a security review. |

Auth middleware placement can be route-specific or router-level. Do not infer authorization from the HTTP method alone; verify backend middleware and ownership checks. Never treat `ProtectedRoute` as security enforcement.

## Known payload and implementation caveats

- Registration uses multipart form data with `photo`; current frontend helper builds `FormData` and declares account payload interfaces in `Axios.ts`. Confirm the backend field names before renaming them.
- API registration expects cellphone as 11 numeric digits and password minimum length 6 according to current controller. Keep client validation aligned but server remains authoritative.
- Backend user/company create routes call the same user controller with different document requirements and roles. Company login is not a separate API route.
- CPF/CNPJ are encrypted/stored server-side using backend helpers. The browser must send them only as required for the flow, never log them or persist them.
- Product responses and image-upload behavior must be inspected from product service/schema before designing a complete listing editor; current create controller does not read an uploaded product photo field.
- Backend route list does not currently expose reservation, payment, user profile, password recovery, social login, or environmental impact endpoints.
- Backend Socket.IO chat code exists, but handshake/events, persistence, authorization, and CORS must be verified before connecting a web chat client. Current socket CORS in `server.js` is hardcoded to `http://localhost:3000`, which may not match Vite's development origin.

## Error and response handling

API errors commonly return `{ error: string }`; success responses vary by endpoint. Parse defensively, show concise pt-BR copy, and retain field values safely after recoverable failures. Handle timeout/network loss separately from server validation. Do not assume every endpoint returns `{ success, data }`, and do not display raw backend exception details.

If an implementation needs an unverified contract, inspect the backend controller/service/schema first. If the API lacks the needed capability, stop at the frontend boundary and report the required API change; do not fake persistence or a successful payment/reservation.

## Company workspace reinspection — 2026-10-29

This newer source inspection supersedes the earlier statements above about missing profile routes and product-photo support. The backend has changed since that snapshot.

- `productRoutes.js` now accepts multipart `photos` for POST `/product/create` and PUT `/product/:id`; photo add/update/delete routes also exist. GET product responses include `{ id, photo }` objects with base64 image bytes.
- Product schema category values are `madeira`, `metal`, `plastico`, `papel/papelao`, `vidro`, `tecido`, `borracha`, `eletronicos`. Negotiation is `sale`/`donation`; condition is `new`/`good`/`regular`/`poor`; status is `available`/`reserved`/`unavailable`. No separate couro or EVA enum was invented by this frontend. Quantity is integer units and weight is separate.
- User routes now include GET `/user/:id` and PUT `/user/:id`. Controllers enforce own-user/admin authorization. Update accepts `name`, `cellphone`, optional birthday/photo, and returns `{ message, user }`; email, role and status are not editable through this route. The company account view uses name/cellphone only.
- Product create/update/delete routes apply JWT verification but the inspected controller/service does **not** enforce company-only creation or product ownership on updates/deletes. The frontend cannot supply that server security boundary. Company workspace product mutation controls therefore remain unavailable in real mode; local preview simulates changes only in memory.
- Product creation requires `id_localization`, but no verified safe current-address listing/selection contract was established for the company workspace. The frontend does not ask users to enter raw UUIDs or silently create duplicate locations.

Required backend-owner follow-up: enforce company-role creation and own-product/admin authorization for update/delete/photo mutations; expose/confirm a safe location selection contract. No backend files were modified. Other newly present routes were outside this change's verification scope and are not claimed delivered.

## Company communication reinspection — 2026-11-05

The current backend now mounts `/notification` and `/conversation` under the API prefix. This supersedes earlier missing-notification assumptions for these inspected routes.

- `GET /notification/`: JWT required; array of the current user's notifications. Fields consumed by the frontend: UUID `id`, `type`, `title`, nullable `content`, `read` (`sim`/`nao`), `created_in`. Ownership derives from `req.userId`, not a frontend user parameter.
- `PATCH /notification/:id/read`: owner-scoped service; response `{ message, notification }`. The frontend confirms matching id and `read: sim` before updating its read state.
- `PATCH /notification/read-all`: owner-scoped service; response `{ message, updated }`. The frontend waits for a successful valid response before updating the loaded list. No notification creation or deletion UI is introduced.
- Notification types verified in `notificationService`: `reserva_solicitada`, `reserva_aceita`, `reserva_recusada`, `pagamento_confirmado`, `nova_mensagem`, `nova_review`, `disputa_aberta`, `disputa_resolvida`, `sistema`. Generic server content is displayed as text; references are not converted into arbitrary links or unimplemented reservation actions.
- The notification page loads on entry and explicit refresh. No Socket.IO connection, polling, background push or read-receipt subscription is claimed. Header/sidebar counts reflect the list loaded in the current company workspace, not a guaranteed live count across all routes.
- Chat message loading/sending/marking read currently use Socket.IO (`load_messages`, `send_message`, `mark_read`, `join_conversation`), with server authentication and participant checks. The frontend has no installed Socket.IO client. No transport or new endpoint was invented.
- `conversationService.listConversationsForUser` currently selects `other.id_user` / `otherUserId` through an undefined `other` alias, while the joined participant alias is `otherCp`. This requires a backend-owner correction and integration verification before connecting the conversation list.

New company routes `/dashboardEmpresa/mensagens` and `/dashboardEmpresa/notificacoes` retain the existing company role guard. Both have development-only preview equivalents under `/previa/dashboard/empresa/`. Chat is explicitly local and illustrative in preview and unavailable for real sends. The real notification contract was checked with browser-intercepted responses, not a live authenticated server/database session. No backend files or dependencies were modified.

## Live integration after API pull — 2026-11-05

This section supersedes the preceding chat limitation. At the owner's request, the backend `main` was fast-forwarded from `cf23b5d` to `a8611b4`; that revision fixes the conversation query's participant alias. Its SQL already defines `conversation_participant`; the old local database had not applied that schema.

After explicit approval to replace the local database, an encrypted external backup was created and decryption verified by hash. The API's current `RFScript.sql` recreated the configured local database with 19 tables. Two synthetic accounts without documents, phone or address records were inserted solely for integration checks. Passwords were generated in process memory and only their bcrypt hashes stored. No real credentials or person records were added to the repository.

The owner explicitly approved `socket.io-client`. The frontend uses authenticated Socket.IO WebSocket connections through Vite's `/socket.io` proxy; JWTs travel in the handshake `auth` object, not URLs. `GET /conversation/` supplies the list; verified `join_conversation`, `load_messages` (latest 100), `mark_read` and `send_message` events supply the thread. Messages are deduplicated by server id; outgoing success requires server acknowledgement and does not automatically retry an uncertain send. Disconnect/retry/error states retain drafts. Actual message data has no product association, so the material context bar remains preview-only.

**Important:** `leave_conversation` removes the participant from the database, rather than merely leaving a socket room. The frontend never emits it for navigation/cleanup; it disconnects its socket on leaving the chat page. It listens for new, edited and deleted message events without introducing edit/delete controls.

Verified against the actual local API and MySQL: login through the browser, buyer-to-company delivery, company-to-buyer delivery, reply received without reload, persistence of three messages, preservation of both conversation participants after navigation, notification generation and persisted individual/all-read actions. No HTTP or WebSocket mocking was used for this live verification. Deployment still needs a same-origin `/socket.io` reverse proxy; Vite's proxy is development configuration.

## Company account and material integration — 2026-11-05

This reinspection supersedes the previous blanket restriction on product update/delete and the absence of a location listing contract. Publication remains disabled in the web UI: POST `/product/create` still has no verified company-role enforcement. No backend source was changed.

- PUT `/product/:id` and DELETE `/product/:id` scope their SQL mutations to `id_user = req.userId`. Update requires the complete product payload, including location. The web editor preserves `priority` and lets the company select from its own locations; the API remains responsible for final authorization/validation. JSON `photos` replaces the complete photo collection; `[]` removes all photos. Separate photo mutation routes were not enabled because their owner authorization is not established. Zero stock is accepted for existing materials.
- GET `/localization/` returns the authenticated user's locations. POST requires `{ userId, zipCode, street, neighborhood, number, city, state }`; `userId` must match the JWT. PUT updates only supplied editable fields, preserving omitted coordinates. DELETE is owner-scoped and returns 409 for locations linked to announcements. No geocoding or third-party address requests were added.
- GET `/user/:id/photo` requires own-user/admin authorization, returns an image blob or 204, and is fetched using the Axios bearer interceptor. PUT `/user/:id` accepts multipart `photo`; image signature and 5 MB limit are checked on the server. Photo data remains in component memory/object URLs and is not copied to browser storage. The profile parser accommodates null cellphone on synthetic test accounts without exposing other account fields.
- GET `/environmental-impact/` supplies estimates for purchases in which the account is a buyer or seller. The screen displays returned records and their sums, not invented categories, measured outcomes, or platform-wide statistics.
- GET `/dispute/` supplies disputes authorized for the account as buyer/seller. The web page supports consultation, situation filter, descriptions and recorded resolution. Administrative resolution/rejection and opening/editing disputes were not introduced.
- Reservations received remain blocked: `/shopping/` lists buyer-owned purchases, and GET `/shopping/:id` restricts detail to buyer/admin. Seller acceptance/refusal exists but does not complete a seller consultation workflow. No workaround using another account or administrator credentials was added.

Evidence and scope limits: [company-functional-integration.md](verification/company-functional-integration.md).

## Company map and dispute notification follow-up — 2026-11-05

- Authenticated `/mapaEmpresas` now consumes GET `/product/` and GET `/localization/product/:productId`. It shows product listings rather than fabricated seller names. Missing coordinates are counted/omitted; partial failures remain visible with retry. Coordinate lookups are bounded to six concurrent calls and abort on navigation. The map retains only approximate coordinates and area labels, discarding authorized exact-address fields.
- The development map preview remains illustrative and network-free with respect to the project API. OpenStreetMap basemap requests are the existing external service, not a new geocoder.
- Notification references with `reference_table = dispute` and a valid UUID navigate to the account-authorized dispute list/detail using `?disputa=` after confirmed read acknowledgement. Unavailable/unowned/invalid IDs show a controlled unavailable state. Arbitrary reference URLs are never followed.
- Reconfirmed actual seller reservation gap: GET `/shopping/:id` returns 403 to its seller, and GET `/shopping/` excludes that received sale. Accept/refuse support does not supply the missing seller consultation. Publication remains disabled pending server company-role enforcement.
- Real persisted impact and dispute records, map data, read acknowledgement and deep-link reload were verified locally with disposable fixtures. The completed-shopping state required for impact calculation was test data prepared directly in MySQL; no completed-sale or payment UI is claimed.

Portuguese implementation report, evidence and backend handoff: [relatorio-empresa-sem-chat-2026-11-05.md](relatorio-empresa-sem-chat-2026-11-05.md).
