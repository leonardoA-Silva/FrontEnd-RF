# Frontend Quality and Verification

## Automated gates

From `FrontEnd-RF/`:

```bash
npm run lint
npm run build
```

`npm run build` runs TypeScript project builds followed by Vite production bundling. The checks below use Node's built-in test runner and the installed Vite/API libraries; there is no additional test framework or configured CI suite.

### Integration checks against the local API

The frontend now uses `src/api/client.ts` and the contracts in `src/api/services.ts`. Development HTTP and Socket.IO requests go through Vite to `http://127.0.0.1:5000`; `VITE_BACKEND_URL` can configure the development proxy. Production can use `VITE_API_URL` or a same-origin reverse proxy. No temporary Cloudflare hostname is embedded in executable code.

- `npm run test:contracts`: built-in Node tests for multipart material photos, donation price omission and preservation of existing photos during editing. Node 22.17+ supports the TypeScript stripping flag used here.
- `npm run check:api`: read-only checks through the running Vite server on port 5174. Checks public product reads, unauthenticated REST access and protected Socket.IO operations. Set `RF_CHECK_API_URL` to change the checked API base.
- `npm run test:integration`: requires the sibling `backend-RF`, its installed dependencies and a development MySQL account able to create/drop databases. Creates a randomly named `rf_web_test_*` database, imports only schema DDL, runs actual frontend service functions against a temporary API and deletes that database in `finally`. It never imports existing user data or executes the destructive database statements from `RFScript.sql`. Synthetic credentials are generated in memory and not printed. Provider credentials are replaced; no external payment, SMTP or OAuth operation is exercised.

The isolated integration covers company/buyer login, materials and photos, the account's main address, profiles, buyer reservations/cancellation, seller acceptance/refusal through notifications, read-only environmental impact, saved cards, notification reads, Socket.IO messaging and invalid-session cleanup. Pix and card charges use the backend's simulated provider. Card tokenization and payment-method lookup are intercepted; assertions verify that local JWTs never reach those external calls and that the local charge receives a token instead of the card number/CVV. This does not validate a real provider authorization or charge.

The company receiving-account page is `/dashboardEmpresa/pagamentos`; it uses the API's existing Mercado Pago account/connect/disconnect routes. Creating a real authorization or charge requires the configured provider and user interaction. `/dashboardEmpresa/reservas` follows `Mobile-RF/src/pages/reservationScreens/ReservationRequestsScreen.js`: it lists `reserva_solicitada` notifications, deduplicates purchase references and calls `PATCH /shopping/:id/status` to accept/refuse. Notifications are not an authoritative sale-status/history endpoint; the UI explains that older requests can already have been answered.

### Mobile functional parity

The buyer/company flows use the current desktop `Mobile-RF/App.js`, `src/services/axios.js` and screen implementations as the reference. Web navigation/layout remains browser-native. Both profiles expose a real overview, company map/search/chat, profile/photo, main address, password security, notifications and conversations with message editing/deletion. Buyer history includes all/active/completed reservations, Pix/card checkout, saved-card selection/removal, approval confirmation and read-only impact. Companies publish/edit/delete their listings, answer received requests and manage Mercado Pago linkage.

Features absent from the mobile implementation were removed from the web surface and their dedicated modules: reviews, disputes, self-account deletion, address deletion/manual coordinates, card editing, payment cancellation, manual impact generation, leaving conversations, OTP resend/login resumption and demo previews. Material publication sends one photo; editing preserves the original photos as the mobile editor does. No code or configuration was changed in the mobile/backend repositories.

`npm run test:integration -- --browser` optionally keeps the disposable environment available for up to three minutes after the service tests. The loopback-only `/__test__/company` and `/__test__/buyer` pages install runtime-generated synthetic sessions in that test origin; no real account/session is reused or printed. `/__test__/done` ends this optional phase. The temporary database is then removed through the same cleanup path.

## UI verification checklist

For a changed flow, verify as applicable:

- Route loads directly and through in-app navigation; protected routes redirect/deny the wrong role.
- Loading, success, empty, validation, API/network failure, and retry states are understandable in pt-BR.
- Form labels, keyboard tab order, visible focus, submit behavior, disabled/loading states, and field error associations work.
- At narrow phone, tablet, and desktop widths, content remains usable without unintended horizontal overflow.
- Images have useful alt text or are correctly decorative; icon-only buttons have accessible names.
- Browser console has no new errors; requests use the configured Axios client and expected API path.
- Authentication does not leak across logout, and sensitive values are not persisted or logged.

## Data and security review

- Treat all API data as untrusted; render user-provided strings as text, never raw HTML.
- Never include CPF/CNPJ, email, address, JWT, password, or user records in debug logs, committed screenshots, test data, or URL query strings.
- Do not make client-side role checks the sole access control.
- Avoid storing passwords or sensitive documents in local/session storage. Token storage follows existing code until a deliberately reviewed session redesign.
- Do not report payment success without a real payment provider/API confirmation.

## Change-specific evidence

The completion note should name the route/flow exercised and exact commands run. If visual browser verification was unavailable, say so. If a change depends on API or mobile work that cannot be performed under the repository boundary, identify that dependency explicitly.

Google login and registration use Google Identity Services. Buyers use `/user/login/google`; companies submit their required business data to `/user/create/empresa/google`. The disposable integration suite also covers Google buyer/company flows with identity verification simulated in that test process. See [Google setup](google-sign-in.md) for real-provider prerequisites and verification limits.
