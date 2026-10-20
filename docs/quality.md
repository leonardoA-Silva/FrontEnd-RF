# Frontend Quality and Verification

## Automated gates

From `FrontEnd-RF/`:

```bash
npm run lint
npm run build
```

`npm run build` runs TypeScript project builds followed by Vite production bundling. No dedicated test or CI suite is currently configured; do not fabricate test results. If adding a test framework is proposed, discuss its maintenance/dependency cost first rather than silently expanding the stack.

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
