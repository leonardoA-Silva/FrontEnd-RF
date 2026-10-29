# Distinct login and registration — 2026-10-29

This refinement replaces the previous shared account hero/shell. The earlier account verification report remains valid for submission/OTP contracts, but its visual layout description is superseded here.

- Login: independent dark forest page, compact central form, inverse brand, back navigation and minimal footer. No decorative material image, shared marketing sidebar or full public navigation.
- Account choice: editorial heading, two illustrated photographic choices, native radio selection, continuation action and existing signup progress.
- Personal/company registration: light workspace, practical heading and profile tag, sticky vertical orientation rail, white form sheet. Phones use a horizontal progress indicator. No sculpture panel is reused.
- Old shared hero markup and its unused CSS were removed. Field styling and the established validation, submission and OTP logic were retained.

Validation: focused ESLint and production build pass. Full `npm run lint` retains the prior two errors and one warning in Notification.tsx/useLoggedUser.ts. Desktop and phone screenshots were inspected. Browser acceptance covers all four routes at 320/390/768/1440 px, one H1 per route, no repeated sculpture, no horizontal overflow, native profile selection including keyboard arrows, signup validation/focus, back/login navigation and login profile/password controls. Requests are intercepted; no accounts are created. No real personal data appear in captures.
