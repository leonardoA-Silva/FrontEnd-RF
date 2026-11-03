# Home implementation verification — 2026-10-29

## Delivered

Home route `/` follows the approved reference: material sculpture hero, three-stage reuse illustration, dark-green material gallery, account steps, closing section, shared navigation and footer. Portuguese document language and title are configured. All links use existing routes or section anchors; no social accounts, listing inventory, payments or reservations were invented.

GSAP provides scoped entry and scroll parallax animations, reverted on navigation, pause and reduced motion. Local generated WebP assets are documented in `public/images/home/README.md`. The default hero is an illustration. “Explorar em 3D” explicitly loads Three/R3F/Drei and a simplified procedural ribbon sculpture; it is not the exact generated image converted into a model. The bag transformation remains an illustration with parallax, not a deforming bag model.

## Checks

- `npm run build`: passed. Vite warns about chunks above 500 kB; the 3D chunk is separate and requested only after activation (verified in browser network activity).
- `npx eslint src/pages/home src/components/Header.tsx src/components/Footer.tsx src/components/Brand.tsx`: passed.
- `npm run lint`: failed with 17 errors and 1 warning outside the home implementation. Linting the same five files from Git HEAD reproduced all 17 errors and the warning: EmailVerificationModal (7), Notification (1 + warning), useLoggedUser (1), RegisterCompany (4), RegisterUser (4). No unrelated validation/authentication changes were made to resolve them.
- `npm audit --json`: reports five high-severity dependency advisories in existing brace-expansion, follow-redirects, source-map-js, Vite and Zod. No unrelated dependency upgrades were performed.
- Headless Microsoft Edge via bundled Playwright: rendered at 320, 390, 768 and 1440 px without horizontal document overflow; all local images load, no page JavaScript errors.
- Browser assertions passed for: single main heading; lazy 3D loading; working WebGL context; keyboard rotation; reset and close; pause/resume; mobile menu and anchor navigation; existing signup/login navigation; route cleanup; reduced motion; pt-BR document language.
- WebGL rendering was inspected using the software ANGLE backend in headless Edge. A first browser run without that backend also exercised the image fallback path.
- Desktop and mobile full-page captures were visually inspected after exercising the reveal animations. Captures contain no account data.

There is no configured frontend test suite. Browser assertions are focused acceptance checks, not a claim of an existing test suite passing. API workflows and authenticated data were not changed or end-to-end validated.

## Captures

- `home-desktop.png`: complete desktop page.
- `home-mobile.png`: complete 390px page.
- `home-3d.png`: activated interactive sculpture.

Prior changes in account and dashboard pages from earlier conversation work were preserved.
