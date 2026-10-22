# API Integration Contract (Verified Snapshot)

This is a frontend integration reference, not a promise that the API will remain unchanged. Re-check backend routes/controllers before implementing or changing a flow. Backend source of truth is `backend-RF/src/index.js`, `src/routes/apiRoutes.js`, and `src/routes/modules/*Routes.js` plus their controllers. API prefix: `/api/reaproveitafranca`.

## Base URL and auth

- Web Axios base URL: `import.meta.env.VITE_API_URL ?? "/api/reaproveitafranca"` in `src/axios/Axios.ts`.
- Vite `/api` proxy target: `process.env.VITE_BACKEND_URL || "http://localhost:5000"`.
- Request interceptor attaches `Authorization: Bearer <token>` from browser storage key `token`.
- Do not invent refresh-token behavior, cookie auth, or token shape. Inspect login controller and existing login UI before changing session handling.
- Backend has `POST /user/login` with `{ email, password }`; there are not separate company/buyer endpoints. The page and helper exports now use this route. The response contains `token`, `user` and `mustChangePassword`.
- Snapshot refreshed against backend commit `83575fc` on 2026-10-22. Buyer frontend implementation and verification limits: [buyer API integration](buyer-api-integration.md).

## Confirmed routes

| Method | Path after API prefix | Auth at route | Known behavior |
|---|---|---|---|
| POST | `/user/create` | Public | Individual account creation; accepts multipart upload field `photo`; requires name, CPF, email, password, cellphone, birthday and address fields; returns `message`, `id`, `emailSent` on success. |
| POST | `/user/create/empresa` | Public | Company account creation; accepts `photo`; requires personal and company documents plus account/address fields; returns `message`, `id`, `emailSent`. |
| POST | `/user/login` | Public + auth rate limiter | Single login route; inspect controller and current page payload before relying on credential/response details. |
| POST | `/user/login/google` | Public + auth rate limiter | Accepts `idToken` (or `credential`); Google ID token verified against backend `GOOGLE_CLIENT_ID`. Public browser client ID is not configured locally. |
| GET / GET or POST | `/user/login/linkedin` / `/user/login/linkedin/callback` | Public + auth rate limiter | Authorization URL and callback exist. Frontend activation is blocked by missing callback state verification and an unverified-token fallback in the reviewed backend. |
| POST | `/user/password/forgot` | Public + auth rate limiter | `{ email }`; generic success response, emailed reset link. Delivery depends on mail and frontend URL configuration. |
| POST | `/user/password/reset` | Public | `{ token, newPassword }`; invalid/expired token returns 401. |
| GET / PUT / DELETE | `/user/:id` | JWT, owner/admin in controller | Read own profile; multipart update of `name`, `cellphone`, `birthday`, `photo`; delete own account (409 for dependencies). GET/PUT responses do not return the photo. |
| PATCH | `/user/password` | JWT | `{ currentPassword, newPassword }`; wrong current password returns 401 without `auth: false`. |
| PATCH | `/user/password/first-access` | JWT | Same fields; only `firstLogin` accounts, updates status to active. |
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
- Product list/detail include `photos: [{ id, photo }]`, with raw base64. No MIME is supplied; the frontend recognizes JPEG/PNG/GIF/WebP signatures and rejects unsupported image types. Product create/edit support multipart photos, but seller ownership/company authorization must be addressed in the API before calling that flow ready.
- Backend route list does not expose reservation, payment, negotiation history, notifications or environmental impact endpoints. Profile, password and social endpoints are listed above; route existence alone does not prove deployment/configuration works.
- Backend Socket.IO chat code exists, but handshake/events, persistence, authorization, and CORS must be verified before connecting a web chat client. Current socket CORS in `server.js` is hardcoded to `http://localhost:3000`, which may not match Vite's development origin.

## Error and response handling

API errors commonly return `{ error: string }`; success responses vary by endpoint. Parse defensively, show concise pt-BR copy, and retain field values safely after recoverable failures. Handle timeout/network loss separately from server validation. Do not assume every endpoint returns `{ success, data }`, and do not display raw backend exception details.

If an implementation needs an unverified contract, inspect the backend controller/service/schema first. If the API lacks the needed capability, stop at the frontend boundary and report the required API change; do not fake persistence or a successful payment/reservation.
