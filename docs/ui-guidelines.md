# UI, Responsive Design, and Accessibility Guidelines

Use this guide when adding or changing screens. The goal is a coherent, clear marketplace experience, not a redesign of unrelated pages.

## Visual direction from the current frontend

- Current pages use a warm off-white canvas, deep green text/brand accents, and occasional amber accents. Existing examples include `#FAF9F5`, `#1B4B3A`, `#0F3D2E`, and `#D97706`; inspect the page being changed rather than assuming every screen uses identical tokens.
- Prefer the existing Tailwind-in-TSX `styles` object pattern. Avoid one-off color inventions and broad global CSS changes.
- Use MUI where the nearest feature already uses it or where its accessible component behavior materially helps. Do not mix MUI and hand-built controls within one flow without a clear reason.
- Prefer Lucide icons already in the dependency set. Decorative icons should not compete with labels; icon-only actions need accessible names.
- Product imagery should have appropriate crop/aspect ratio and avoid layout shifts. Never add unlicensed stock imagery or real user data as a fixture.

## Interaction requirements

- Use explicit labels and concise pt-BR copy. Tell users what is required and why; preserve safe form input after recoverable errors.
- Every async action should visibly communicate pending state and prevent accidental duplicate submission where relevant.
- Provide designed loading, empty, success, validation, network/API error, and permission-denied states; do not rely only on browser alerts.
- Confirm destructive actions and make navigation/return paths clear.
- Keep focus visible, support keyboard operation, and return focus appropriately after dialogs/modals close.
- Use semantic headings and landmarks. Associate field errors with controls (`aria-describedby` where applicable) and announce asynchronous status/errors accessibly.
- Do not encode meaning by color alone; status badges also need text or another clear signal.

## Responsive behavior

- Design for narrow screens first when adding new marketplace or account flows; verify desktop layouts remain balanced.
- Avoid fixed page widths and horizontal scrolling for ordinary content. Tables may need a deliberate mobile alternative.
- Ensure navigation, forms, dialogs, cards, and action targets remain usable with touch and zoom.
- Test at a narrow phone viewport, a tablet-ish width, and desktop; record any unavailable visual verification.

## Consistency and design decisions

Before creating a new reusable pattern, search for an existing component or similar page. Extract shared UI only when reuse is real, not hypothetical. If a durable product-wide color/type/spacing system is approved later, document it as explicit tokens rather than letting an agent infer a full design system from a few pages.
