# Local dashboard preview — 2026-10-29

Development-only routes: `/previa/dashboard/empresa` and `/previa/dashboard/usuario`. Links are available on the development login screen. A labeled local-preview bar switches between panels and exits to login.

Both existing dashboard components accept an optional preview flag. The user hook returns an explicit fictitious identity without reading session data in preview mode. Exiting preview never clears an existing session. No token is fabricated, no user records are persisted, no API request is made, and the original protected dashboard routes remain unchanged.

Verification:
- Production build passed with the existing bundle-size warning.
- Focused ESLint passed for App, dashboards, login and useLoggedUser.
- Browser checks passed for both anonymous previews, switching panels, 390/1440px overflow, no API requests, no JavaScript errors, isolated demo identity and preserving an existing synthetic session on exit.
- Original `/dashboardEmpresa` and `/dashboardUsuario` still redirect anonymous visitors to login.
- Production JavaScript was checked: preview route strings are absent; the preview routes and login shortcuts are gated by `import.meta.env.DEV`.
- Only visual examples are available. Publishing, reservations and other placeholder controls are not implemented by this preview.

No configured frontend test suite exists; these are targeted browser assertions. Existing prototype dashboard content was not redesigned.

Full npm run lint retains one prior error and one warning in Notification.tsx, outside this change.
