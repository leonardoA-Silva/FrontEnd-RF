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
