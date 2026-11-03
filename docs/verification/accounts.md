# Account flows verification — 2026-10-29

## Scope and implementation

Applied the existing home identity to `/login`, `/cadastro`, `/cadastro-pessoal`, `/cadastro-empresa` and email verification. Shared editorial shell, local material artwork, forest/ivory surfaces, serif accents, restrained entrances and numbered registration sections. Dashboards and API files were not modified during this continuation.

Both registration routes share field presentation and state while keeping their distinct payloads: company CNPJ plus responsible CPF, personal CPF plus birthday. Existing multipart helpers and `photo` field are retained. CEP and IBGE lookups retain the existing providers, with explicit failure/retry/manual-entry states and cancellation of stale requests. Field errors are associated with controls and focus goes to the first invalid field.

Login retains the existing endpoint, role checks and local/session storage choice. Unsupported social buttons and nonexistent recovery route were removed; no replacement API is claimed. Sensitive response logging and raw server errors were removed from the touched flows. The OTP flow uses MUI Dialog for focus management and a single paste-friendly one-time-code input; supports resend cooldown, initial-email failure, pending, invalid code, failure, success and login redirection. Closing verification restores focus to an explicit reopen action and blocks duplicate account creation after a successful response.

## Evidence

- `npm run build`: passed, with the existing bundle-size warning; 3D remains lazy and is not loaded by the account shell.
- `npx eslint src/components/account src/components/EmailVerificationModal.tsx src/pages/register src/pages/login`: passed.
- `npm run lint`: two pre-existing errors and one warning remain in Notification.tsx and useLoggedUser.ts. The previous registration and OTP errors are removed by the shared typed implementation.
- Bundled Playwright with headless Edge: all four routes loaded with exactly one H1, no page JavaScript errors and no horizontal overflow at 320/390/768/1440 px.
- Empty-registration validation focuses the first invalid control and marks all required personal fields.
- Intercepted synthetic browser checks passed for both multipart field contracts, photo selection/upload, pending submission guard, recoverable account conflict, retained form data, OTP resend rate-limit error/retry/cooldown, invalid code, successful verification and login redirect.
- Login password visibility and safe unauthorized messages verified. Modal focus containment, close/reopen and focus restoration were also exercised.
- IBGE failure shows manual state/city controls; retry restores the list without losing the selected state. CEP failure leaves manual fields usable. Reduced-motion disables the artwork entrance.
- Registration checks confirm no local/session storage persistence. Network mutations were intercepted; no real accounts or OTP requests were created.
- Empty-form desktop and mobile captures inspected. No sensitive values are present in saved screenshots.

No configured frontend test suite exists. These are targeted browser acceptance checks using simulated API responses, not proof of live backend/email delivery.
