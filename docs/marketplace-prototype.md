# Marketplace prototype implementation

> Archived on 2026-10-29: the static example and payment/reservation demonstration were removed. See [current buyer API integration](buyer-api-update-2026-10-29.md). The content below documents the former prototype only.

Update 2026-10-22: the user requested only one catalog example; `mkt-1` is the sole demonstration record. After the explicitly requested backend restore/pull, API commit `83575fc` adds product photos and user/account routes. The historical API notes below describe the earlier inspection; see [frontend-readiness-review.md](frontend-readiness-review.md) for the current static analysis. No new API integration was performed.

Status: **UI-only**. Scope: frontend marketplace and its demonstration reservation/payment pages. No backend/mobile edits, new dependencies, real charges, or real reservations.

## Observable acceptance criteria

- `/marketplace`: compact search/category band, left desktop filter rail, four desktop cards per row, responsive single/two-column alternatives, truthful count, effective filters and pagination.
- `/marketplace/material/:materialId`: material-specific image gallery, description, availability, modality and request link.
- `/marketplace/reserva/:materialId`: bounded integer quantity, circular-use purpose, non-past local pickup date, optional note and required terms. Required fields prevent progression.
- `/marketplace/finalizar/:materialId`: review quantity and amount, choose Pix/card for sales. Donations have no charge and bypass payment.
- `/marketplace/pagamento/:materialId/pix`: demonstration code, copy pending/success/failure states, no payable QR.
- `/marketplace/pagamento/:materialId/cartao`: select a clearly labeled demonstration card; navigate to `/novo-cartao` to inspect the Figma's separate card-field view. Card fields are read-only illustrative values, without real payment collection.
- `/marketplace/confirmacao/:materialId`: explicitly simulated confirmation with request details. Never mark a real payment approved or a supplier notified.
- `/marketplace/minhas-reservas`: show/clear the current session's completed demonstration. No localStorage/sessionStorage writes; refreshing loses the demo and offers request recovery.
- Browser back/forward, unknown material IDs, missing drafts, mobile overflow and keyboard focus remain usable.

## Source and deviations

The user supplied the Figma file `oKjqeMhVdtDDLqLOTxIVis`. The linked `3:2` node no longer exists; frames were discovered on page `0:1` and inspected individually. Frame IDs are recorded in `DESIGN_SYSTEM.md`.

Exact images/icons could not be downloaded: network was blocked in the sandbox and the escalation request was declined. Existing relevant local images and explicit unavailable states are temporary. Typography uses the current system sans stack, not the unbundled Figma fonts. Do not claim pixel-perfect fidelity.

The prototype includes contribution language and immediate approval cues, but no current API contract establishes these behaviors. Existing sale examples retain a labeled per-unit demonstration calculation; donation has no price. No fees, installments, approval latency, verification status, carbon metrics, chat availability or payment policy is invented.

## Required API owner handoff

Verified read-only in `backend-RF/src/routes/apiRoutes.js`: routers are user/localization/OTP/product/log. `productRoutes.js` supports catalog CRUD; `productService.js` does not return supplier name, photos or geographic distance. There are no reservation or payment routes.

To integrate this flow, the backend owner must first define authenticated reservation creation/read/status/cancellation, server stock/price validation, pickup fields and allowed statuses; provider-created payment intents, tokenized card handling and server-verified webhook outcomes; and the product image/supplier/location contract. Optional contributions and price/unit semantics need an approved product/API decision. Do not invent endpoint paths or implement these changes in this frontend task.

The previous marketplace created local fake reservation/approval records using shared dashboard modals. The new marketplace no longer invokes those callbacks or writes those storage keys. Unrelated dashboard demonstrations are outside this change.

## Verification

- `npm run build`: successful after running outside the sandbox to permit Vite's child processes. Vite reports the existing large-chunk warning.
- `npx eslint src/pages/marketplace src/components/Header.tsx src/components/Footer.tsx src/App.tsx`: successful.
- Initial `npm run lint`: 34 errors and 2 warnings in pre-existing files; unrelated fixes were intentionally not included.
- Isolated Edge/Playwright run: passed catalog four-column layout, pagination, category/availability filters, empty search/reset, required fields, Pix copy interaction, card selection/new-card navigation, simulated confirmation, session reservation view, donation bypass, unknown material, recovery after refresh and no horizontal overflow at 375/768/1024/1280px. No API writes, browser runtime errors or local/session storage entries were observed. Screenshots of the affected catalog/detail/request/checkout/payment/confirmation pages were inspected. The browser run uses an isolated context without the user's authenticated session.
- Local verification scripts/screenshots are kept in the ignored `.verification.local` directory. They contain no user account or real payment data.

No repository test suite was added; the local browser checks are task-specific verification, not a new maintained test framework.
