# Company functional integration — 2026-11-05

Branch: `leonardo/telas-empresa`. Frontend-only implementation; no new dependencies or backend source changes.

## Implemented flows

- Existing material editor: authenticated full update with preserved priority/location, own-address selection, sale/donation validation, image addition/removal and support for zero stock. Successful UI feedback follows the API acknowledgement. Existing material deletion has confirmation, pending lock and recoverable errors.
- `/dashboardEmpresa/enderecos`: authenticated address list, create, edit and confirmed delete. Accessed from the company profile and material editor. Coordinates are not exposed or overwritten. Drafts remain after a failed submission. Preview operations are in memory only.
- Profile: authenticated photo load/update via image blobs/multipart, format/size validation, preview/cancel, pending/error/success states and object URL cleanup. Existing name/cellphone editing is retained; nullable test-account cellphone no longer prevents loading the profile.
- `/dashboardEmpresa/indicadores`: actual account-linked impact estimates, totals and individual records with date/calculation method. No sample values in authenticated mode.
- `/dashboardEmpresa/disputas`: actual authorized list, situation filtering and read-only details/resolution. Available in company navigation.

## Runtime evidence

An Edge/Playwright harness used the actual running API through Vite and the local MySQL instance. It obtained a short-lived, correctly scoped test token for the existing synthetic company using local configuration in memory; it did not re-test the login form or store credentials/tokens in files. API/database access used only local test accounts and generated data.

Confirmed against actual API responses:

1. Create an address through the web form, reload, edit it and re-query it.
2. Prepare a disposable material via the API, edit name/quantity through the UI and re-query persisted data. Confirm priority and location are unchanged.
3. Add a photo using the web file control, confirm two persisted photos, then remove both, save zero stock and confirm no photos/quantity zero in the API.
4. Attempt deleting the linked address through the UI: actual 409, the address remains.
5. Upload a synthetic PNG through the profile UI and reload to confirm an authenticated image response remains available. In a focused follow-up, save name/cellphone through the profile form, reload and confirm both; restore the synthetic account’s original contact/name after verification.
6. Confirm actual empty impact/dispute lists display their designed empty states. This database has no qualifying records; populated server-side impact/dispute generation was not verified.
7. Delete the disposable material through its confirmation dialog; public GET then returns 404. Delete the now-unlinked address through the UI. Disposable product/address data were removed.
8. Inspect address, dispute, impact, profile and material editor routes at 390 px, and desktop at 1440 px: no horizontal overflow or browser runtime errors in the run. Screenshots omit contact/address form values.

Separate simulated browser responses verified populated impact totals, dispute details/resolution and filtering, HTTP 401/403/404/500, malformed success data and retry to the actual empty API result. A failed address PUT returned a simulated 403: error was sanitized, draft retained, and retry succeeded against the actual API. Development preview address operations made zero API calls.

A follow-up harness check stopped on a locator ambiguity between the close icon and footer close button, resolved by targeting the footer button. The complete follow-up run passed. There is no configured automated test suite in this repository; this was execution of a local integration harness.

## Limits

Publication still depends on backend company-only enforcement. Received-reservation consultation/history, new-contact selection, payment, dispute mutations and impact calculation are outside these completed flows. Impact sums cover the complete account-linked records returned by the API and are estimates, not independent measurements. Production API/Socket.IO proxy setup still needs deployment verification.

Final validation: `npm run lint` passed without errors/warnings; `npm run build` passed. Vite still reports a bundle-size warning (the existing 3D chunk also exceeds 500 kB); no dependency upgrades or unrelated bundle refactor were made. `git diff --check` passed. No commit/push requested for this implementation step.
