# Login refinement

The former small centered card is replaced by a material-led forest panel and an ivory form. Existing brand artwork, palette and typography are retained. The company/buyer radio selection has clearer labels and selection feedback; inputs use 16 px text, larger touch targets and native autocomplete. Mobile prioritizes access and omits the decorative panel. Entrances and feedback respect reduced-motion preferences.

No authentication endpoint, payload, role gate or persistence behavior was changed. Password recovery and social login were not added.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed, retaining the existing home sculpture chunk-size warning.
- Edge layouts at 320, 390, 768, 1024 and 1440 px, with normal and reduced motion: no horizontal overflow; role selection and labels work; reduced motion has no running animation.
- Mocked API responses: invalid credentials (401), server error (500), network failure and incompatible role. Error messages, retry availability, field retention, role-change error clearing, password visibility and disabled pending controls checked. Empty submission does not call the API. No real credentials or accounts were used; no screenshots include entered credentials.
- Blank-form screenshots: `login-refined-{320,390,768,1024,1440}.png`. Comparison: `login-before-desktop.png`.

The actual API login was not exercised. Changes remain local on `new-ui`, without a commit or push.
