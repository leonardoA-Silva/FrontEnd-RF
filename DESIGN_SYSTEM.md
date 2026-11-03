# Reaproveita Franca — Design system

## 1. Scope and source

Updated 2026-11-03. The user selected `origin/new-ui` (`abe2906`) as the visual reference and requested its integration into `Rafael/Sprint2----Comprador`, followed by styling all buyer screens. Profiles: App/Product UI and E-commerce/Store, with an editorial public shell. This document supersedes the earlier Figma styling notes. API support and product rules still take precedence over a visual prototype.

## 2. Concept

Warm paper, forest navigation and material photography: the catalog feels like a library of materials, while the account is a practical workspace. Preserve real stock, reservations, profile, addresses, cards, notifications and conversations. No demonstration buyer records or financial success screens.

## 3. Colors

Shared buyer tokens live in `src/index.css` as `--buyer-*` variables.

| Token | Value | Purpose |
| --- | --- | --- |
| paper | #FAF9F5 | Page canvas |
| forest | #0F3D2E | Rail, primary actions and titles |
| green | #1B4B3A | Hover and supporting brand text |
| surface | #FFFFFF | Forms and material surfaces; inherited from new-ui |
| line | #E7E4DA | Dividers |
| muted | #4B5A55 | Supporting copy |
| soft | #EEF1E8 | Status and quiet backgrounds |
| accent | #D97706 | Keyboard focus and restrained public accents |

Errors use #9F1239 on #FFF1F2. Status meaning always includes text. No color-only distinction.

## 4. Typography

System sans for controls and text, Georgia / Times New Roman for editorial buyer titles and material names. Titles: fluid 34–52px, 36px on narrow screens, normal weight, line-height 1.12. Subtitles: 21px/650. Body: 16px/1.7. Labels/actions: 15px/600. Navigation: 14px; metadata: 12–13px. These compact metadata sizes and Lucide icons deliberately follow the supplied branch and repository conventions. Existing locally hosted About fonts remain available for compatibility, but About now uses the new editorial palette and system font pairing.

## 5. Spacing and layout

Buyer desktop rail: 244px, sticky, with its own scrolling if needed. Workspace: maximum 1500px; content padding 40px desktop, 28px medium and 20px phone. Below 900px, the rail becomes a top section with a native expandable navigation. All nine sections retain query-string deep links. Public catalog width: min(1440px, viewport minus 96px), reducing gutters on smaller screens.

## 6. Surfaces and shapes

Primary form surfaces: 24px radius, white, restrained forest-tinted shadow. Material cards: 20px radius. Inputs: 12px radius. Primary and secondary actions: pill shape. Feedback: 14px radius. Use whitespace for grouping, outlines for fields and fine rules for metadata; avoid stacking elevated surfaces.

## 7. Shared components

`buyerStyles` exports semantic class names backed by the shared CSS tokens, covering every buyer account page, recovery, first access, material details and reservation request. `marketplaceStyles` reuses the same primitives. Header keeps session-aware account actions and a mobile menu while using the `new-ui` brand. Footer uses real public routes and hides the create-account link for signed-in users. Destructive actions retain native dialog behavior, Escape handling and focus restoration.

## 8. Catalog and detail

Real API photos only; unavailable images have an explicit placeholder. Material photos use a stable aspect ratio; cards contain category, name, price or donation, quantity, conservation and availability. Three public columns on wide displays, two medium, one phone. The embedded catalog uses two columns at laptop sizes. Mobile filters expand on demand to keep materials reachable. Search, filters, ordering, pagination and refresh retain their existing behavior. Product detail and reservation use the same buyer title, input, feedback and action styles.

## 9. Account and forms

Explore, reservations, history, notifications, messages, addresses, cards, profile and security all use the forest workspace. Inputs remain labeled and at least 48px high. Profile upload preserves its pending/saved preview and current API limitation after reload. Address lookup keeps the existing separate ViaCEP service; no API JWT is sent to it. Cards remain metadata management only; no payment approval, PAN/CVV collection or gateway simulation.

## 10. States and interaction

Keep loading, empty, validation, success, server/network error, retry and authorization behavior. Never replace API confirmation with local visual success. Reservation submissions retain duplicate-prevention behavior after an uncertain response. Native dialogs preserve confirmation and pending states. Conversation listing still has a backend SQL alias issue; the pre-existing frontend session fallback is preserved, not presented as an API fix.

## 11. Accessibility and motion

Visible keyboard focus uses the branch's amber outline, 3px with 4px offset. Touch controls are at least 44px; form actions are 48px. Icon-only controls have pt-BR names. Expandable navigation and filters announce their state. Buyer hover motion is limited to transform, 180–250ms; reduced-motion removes it. Product name and supporting text wrap. No new icon family or dependency was introduced beyond the requested branch's existing dependency set.

## 12. Review and contrast

Concept review: material photography plus forest rail and editorial titles follow the specific supplied branch. The weakest observed point was a tall mobile filter block delaying material cards; filters now collapse on phones/tablets. Compact sidebar filters were widened to preserve option labels. Measured text contrasts: forest/paper 11.54:1, muted/paper 6.89:1, white/forest 12.16:1, rail muted/forest 6.86:1, muted/white 7.26:1, green/soft 8.70:1. No claim of overall WCAG certification.

## 13. Assets and performance

The requested merge includes the existing `new-ui` WebP assets, account layouts, company workspace, GSAP and optional Three.js scene. Home and its animation code load lazily; the 3D scene is separately lazy-loaded and requires an explicit action. No buyer feature needs 3D. Keep real catalog photos lazy except the main detail photo. Do not add remote stock photos, dependencies or illustrative stock to the live catalog. Production bundle warnings are reported rather than hidden.

## 14. Verification and continuation

Use `npm run lint`, `npm run build` and responsive route inspection. One-off local Playwright scripts in ignored `.verification.local/` validate buyer contracts and layouts at 375/768/1280px. They are not a configured npm test suite. Real API/MySQL/Socket.IO checks use an exclusively created disposable database and clean it up; never initialize or drop the project's database. Check the current task report for results. Historical verification documents imported from `new-ui` describe that branch's original previews and do not prove current API behavior. Future pages must reuse these tokens, primitives and actual API capabilities.

### Profile avatar update — 2026-11-03

Profile photo uses a 44px forest camera action on the 112px preview, plus a labeled image-picker control. The `AccountAvatar` primitive is 36px, circular, with a neutral fallback. Confirmed uploads update a session-owned in-memory photo store shared across the profile and both headers. Pending/failed uploads do not replace the confirmed header photo. Photos are not persisted in browser storage; API readback remains unavailable after reload. See `docs/auditoria-perfil-integracoes.md` for current evidence and integration limitations.
