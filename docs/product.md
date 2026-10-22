# Product Context and Requirements

## Product summary

Reaproveita Franca is a circular-economy platform for Franca/SP. Companies publish reusable industrial materials (for example leather, fabric, EVA, rubber, foam, packaging, and pallets); artisans, cooperatives, schools, NGOs, and businesses can discover and reuse them. The broader product includes web, mobile, and API applications. This repository delivers only the web frontend.

The TCC scope describes future marketplace, reservations/negotiations, payments, chat, maps, impact indicators, and photo-based classification. Those statements are product goals, not proof those features are implemented. Confirm the current API and UI before presenting a capability as available.

## Current confirmed business rules

Based on frontend project context and current API code; reconfirm against approved team policy when changing behavior:

1. Only company accounts may publish listings.
2. Registered users may request reservation, subject to a future/confirmed API workflow; do not imply reservation endpoints already exist.
3. A listing is for sale or donation.
4. Sale listings require a price; donation listings must not have a price.
5. The current API's company/user registration requires email, documents, contact/address fields; company registration includes both CPF and CNPJ.
6. Product creation requires category, negotiation type, weight, condition and localization identifier, as currently validated in the backend.
7. The README describes payment through the platform with a 5% fee (donations exempt) and pickup/delivery arranged between parties. Treat fee/payment as proposal context until the payment contract and policy are implemented and approved.

## Requirement traceability

| Requirement | Goal | Web/API status in inspected code |
|---|---|---|
| RF01 User registration | Name, CPF, email, password, phone, address | Registration screen/helper and API route exist; verify end-to-end before marking complete. |
| RF02 User login | User access | A login UI exists; one API login route exists. Actual screen payload/response controls are authoritative. |
| RF03 Company login | Company access | UI has company/buyer selection, but API has one `/user/login`; separate company login endpoint is not confirmed. |
| RF04 Company registration | Company and legal-responsible information; verification | Company create route exists and sends OTP; administrative verification workflow is not established by reviewed route inventory. |
| RF05 Product listing | Company publishes sale/donation | Product create API route exists; verify UI, ownership authorization, photos and end-to-end behavior. |
| RF06 Product purchase/reservation | User reserves listing | No reservation route found in current API route inventory. |
| RF07 Payment | In-platform payment | No payment API route found. Do not simulate a charge. |
| RF08 Logout | End session | Implement according to actual current token storage/session hook; clear all relevant session state. |
| RF09 Chat | Buyer/company conversation | Socket.IO chat code exists in backend; web protocol and authorization need verification. |
| RF10 Negotiation history | Status/history view | No negotiation route found in API route inventory. |
| RF11 Account recovery | Email recovery | Forgot/reset routes and frontend screens implemented; browser verified with contract mocks. Mail delivery and live API flow remain unverified. |
| RF12 External identity | Google/Apple | Google API and optional frontend button implemented; disabled without public Client ID. LinkedIn API exists but has unresolved callback verification. Apple route not found. |
| RF13 Promoted listings | Paid prioritization | Product schema has `priority`; business rules and payment integration are not confirmed. |
| RF14 Map | Locate seller | Localization API exists; map frontend/provider integration is not confirmed. |

This table is a snapshot, not a project roadmap. Update it only after checking implementation and recording evidence. Do not call a feature “done” because a screen, requirement, model field, or route exists independently.

Buyer snapshot, 2026-10-22: real product list/detail/photos, own profile edit/upload, password change/first access, recovery/reset and account deletion are wired to verified API contracts. No live API server was available during this verification; see [implementation evidence](buyer-api-integration.md). The single marketplace example remains explicitly separated from API records.

## Quality requirements

- Security: avoid exposing account data and sensitive documents; honor role-specific UI while relying on backend authorization.
- Validation: validate in the browser for clear feedback and expect server validation to remain authoritative.
- UX: make registration and future reservation flows understandable; clearly show progress and recoverable errors.
- Responsiveness: support modern desktop, tablet, and mobile browsers.
- Consistency: align visual patterns across web/mobile where real shared design tokens exist; do not assume the mobile codebase is the canonical web design system.
- Accessibility: semantic structure, keyboard use, focus visibility, labels, and meaningful error feedback.
- Compatibility: use supported modern browser APIs and verify the production Vite build.
