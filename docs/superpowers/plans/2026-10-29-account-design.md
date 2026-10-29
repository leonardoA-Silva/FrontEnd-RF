# Account visual continuity implementation plan

**Goal:** Apply the approved home identity to login, profile choice, company/personal registration and email verification, excluding dashboards.
**Spec:** User instruction to continue the existing home style. DESIGN.md tokens remain authoritative.
**Architecture:** Shared account shell with sticky material illustration and scoped CSS. Native labeled controls follow existing Tailwind patterns; MUI Dialog provides modal focus management. Registration reuses presentation and state across the two existing payloads. API requests stay in the current Axios module; no endpoints or required fields change.

- [x] Build account shell, progress and field primitives, keeping illustrations local and decorative motion restrained.
- [x] Restyle login and profile selection. Preserve login endpoint, role checks and storage choice. Remove unsupported social/recovery affordances and sensitive logging.
- [x] Implement common registration presentation with existing fields, photo, location lookup, validation, loading and recoverable errors. Preserve company CNPJ/CPF and personal birthday requirements.
- [x] Restyle OTP in accessible modal with resend cooldown, pending/error/success states and focus return.
- [x] Verify lint/build and all routes at phone/tablet/desktop sizes; exercise form validation, request errors, multipart contracts, OTP success/resend/failure through intercepted synthetic responses, not real API mutations.

No new dependencies. No dashboard changes. No real personal data in fixtures, captures or logs. Backend integration success is not claimed from intercepted browser checks.
