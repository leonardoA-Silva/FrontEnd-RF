# Frontend Security and Privacy

This guide covers browser-side responsibilities. The frontend is not a security boundary; the API must validate and authorize every operation.

## Sensitive data

Treat CPF, CNPJ, password, JWT, email, phone, birth date, and address as sensitive. Collect only what the current flow and API require.

- Never log sensitive values, put them in query strings, include them in screenshots, or use real values in examples/fixtures.
- Never store a password or plaintext CPF/CNPJ in localStorage, sessionStorage, cookies, analytics, or browser history.
- Do not add console logging of complete Axios request/response objects; they may contain tokens and personal data.
- Clear session tokens and in-memory user state on logout. Avoid retaining authenticated data after session expiration.
- The current app stores JWT under `token` in local/session storage. Do not independently add another token key or persistence scheme. Any session architecture change requires an explicit security review.

## Trust boundaries

- Treat all URL parameters, form values, files, and API responses as untrusted.
- Render user-provided content as text. Do not use `dangerouslySetInnerHTML` for listing descriptions or messages.
- Validate types, lengths, and expected formats on the client for usability; backend validation and authorization remain mandatory.
- Do not trust role values, prices, ownership, listing availability, payment state, or reservation state derived only from browser storage/UI state.
- `ProtectedRoute` improves navigation UX but cannot protect API resources. A user can call the API without the UI.
- Do not put secrets in `VITE_*` variables: Vite embeds client variables in browser bundles.

## Authentication and errors

- Attach bearer tokens only through the configured Axios interceptor unless a reviewed API contract says otherwise.
- Avoid including tokens in error reports or telemetry. Sanitize error messages before display.
- Distinguish authentication failure (sign in again), authorization failure (no permission), validation errors, and network/server failure.
- Never claim a payment or reservation succeeded until confirmed by the server/provider response.

## Files and external services

- Check upload type/size constraints against the backend before building upload UI; client checks do not replace server-side scanning/validation.
- Before adding maps, social login, analytics, payment, or AI services, identify third-party data sharing, consent, secret management, costs, and approved privacy policy. Ask for approval where these change product/legal behavior.
- Avoid sending personal data to public AI services or external APIs unless the product owner explicitly approves the data flow.
