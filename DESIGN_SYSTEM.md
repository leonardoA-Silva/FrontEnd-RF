# Marketplace — design reference

Current extension, 2026-10-29: the static catalog example and payment demonstration described in the historical sections below have been removed. The buyer API extension at the end of this document is authoritative for current account/reservation screens.

## 1. Project overview

Reaproveita Franca, web frontend. Profiles: Redesign + E-commerce/Store + App/Product UI. This reference covers `/marketplace`, its reservation/payment demonstration, and the separately scoped `/sobre-nos` page described below. It does not authorize redesigning other pages. Audience: people and companies reusing industrial materials. The catalog now contains only the single `mkt-1` demonstration record, per the user's follow-up.

## 2. Brand direction

Concept: a compact industrial-material catalog, with a persistent filter rail, four photographs per desktop row and green reservation actions; the reservation form and checkout retain the same restrained hierarchy.

Source: the user-provided [Figma file](https://www.figma.com/design/oKjqeMhVdtDDLqLOTxIVis/TCC---Senai). Inspected frames: `119:311` catalog, `119:533` detail, `135:4` request, `249:863` checkout, `249:1403` Pix, `249:1592` card selection, `249:1481` new card, `135:120` confirmation. External inspiration is unnecessary because the user supplied the visual target.

Review: the original oversized search, two-column catalog, nested price panels and unrelated stock photos obscured the requested composition. These were removed. Exact photography and font matching remain incomplete because asset download was declined; do not describe the implementation as pixel-identical.

Copy is pt-BR, concise and explicit about demonstration status. A local state transition is never evidence of a real reservation or approved payment.

## 3. Color system

Tokens are scoped in `marketplaceStyles.ts`, not applied globally.

| Token | Value | Role |
| --- | --- | --- |
| Page | `#fbfbf9` | Catalog/detail canvas |
| Surface | `#ffffff` | Cards, rail, header |
| `--mkt-primary` | `#10b981` | Prototype green, primary catalog actions |
| `--mkt-dark` | `#064e3b` | Titles, footer, text on green tints |
| `--mkt-muted` | `#4b5563` | Supporting copy |
| `--mkt-line` | `#e5e7eb` | Rules and field outlines |
| `--mkt-soft` | `#ecfdf5` | Badges and circular-economy notices |
| `--mkt-payment` | `#006c4a` | Checkout actions, focus |
| Payment canvas | `#f8f9fa` | Payment page background |
| Payment surface | `#f3f4f5` | Totals and selected options |
| Payment outline | `#bbcac0` | Payment panel boundaries |
| Payment rail selection | `#d9e6dd` | Selected account navigation |
| Body | `#1f2937` | Primary text |
| Muted labels | Tailwind gray-500 | Secondary labels |
| Condition | Tailwind amber-700 | Material condition |

White surfaces, fine outlines and green actions deliberately follow the Figma. Payment buttons use dark green. Error copy uses Tailwind red-700. Do not add gradients or glass.

## 4. Typography system

Runtime font: existing Tailwind `font-sans` (system sans-serif). The Figma names Gabarito, Manrope and Plus Jakarta Sans; these fonts are not bundled and were not downloaded. Do not claim the font match is exact.

Scale: caption 10/11/12px; metadata 13px; body/control 14px; card title 16px; subsection 18/20px; payment total 28px; page title 24px mobile / 30px desktop. Body leading is relaxed; headings are tight and bold. This compact scale follows the supplied design rather than the skill's generic 16px minimum. Text wraps on narrow screens.

## 5. Layout system

Header minimum height 80px; search band 42px control + 16px vertical padding. Desktop gutters `clamp(24px,4vw,64px)`. Catalog rail `clamp(178px,17.5vw,280px)`; content padding `clamp(20px,2vw,32px)`; grid gap 20px. One card column below 640px, two from 640px, four from 1024px. Images use 1.87 aspect ratio. The footer follows content and remains at the viewport bottom on short pages.

Flow: catalog → detail → request → checkout → Pix or card selection → optional new-card view → confirmation → session's demonstration reservation. Donation checkout bypasses payment, preserving the product's no-price donation rule. No optional-contribution business policy is introduced without an API/product contract.

Request/confirmation container: max 864px including padding. Payment rail: 260px on desktop, hidden below 1024px. Payment panel: max 880px; Pix panel max 512px. Mobile panels stack. There are no hero sections, horizontal rails or full-screen slides in this feature.

## 6. Component system

Use React + existing Tailwind class objects. Shared Header/Footer accept an opt-in `marketplace` variant; default callers retain their prior styling. `MaterialImage` owns sized photography and unavailable-image fallback. `DemoNotice` identifies UI-only state. `PaymentFrame` owns payment navigation and panel width. `FlowUnavailable` handles unknown materials and missing in-memory requests.

Buttons: green filled primary, white/green outlined secondary; payment action dark green. Forms: associated native labels, 48px minimum input height, 8px radius, native validation, inline submission error. No new component library or dependencies.

## 7. Card and section style

Catalog: white, 16px radius, 1px gray outline, `0 4px 16px rgba(31,41,55,.04)` shadow. Payment: 12px radius and `0 4px 12px rgba(0,0,0,.03)` shadow. Informational sections remain flat. No nested price cards, gradients, overlays or decorative elevation.

## 8. Icon system

Use existing lucide-react per repository rules. Metadata icons 14–18px, section icons 20–28px, confirmation 42px. Decorative icons are hidden from assistive technology where appropriate. Icon buttons have pt-BR accessible names.

## 9. Image and asset rules

Use existing local material images only as disclosed fallbacks: `hero-leather-scraps.jpg`, `retalho-couro-nobre.png`, `retalho-nobuck-macio.png`, `eva-camurca-premium.png`. Other material photos show an explicit unavailable state instead of unrelated products. No temporary Figma URLs at runtime. Exact Figma images/icons are pending download authorization.

The payment QR and card illustration are deliberately non-payable/non-sensitive demonstration visuals. Do not copy payment data, avatar photos or personal details from the Figma into fixtures. Once approved asset access is available, use the original non-sensitive design assets in their matching slots.

## 10. Animation and interaction system

CSS color transitions only; no motion library. Hover darkens actions; active state uses deeper green; disabled buttons reduce opacity and change cursor. Every control receives a visible dark-green `focus-visible` outline. Navigation resets scroll and focuses the content container.

Filters and pagination act on the labeled demonstration catalog; totals reflect the filtered records. Search/filter empty state offers reset. Copy action reports copying/success/error and permits manual fallback. Unknown routes and expired drafts offer recovery. No real network operations are added, so provider loading/errors remain an integration dependency rather than simulated API outcomes.

Images reserve geometry, first catalog image is eager and other images are lazy. Existing asset caching/build remains Vite-managed; no Core Web Vitals measurements or guarantees are claimed.

## 11. Accessibility rules

Native links/buttons, fieldsets, labels, skip link, sequential headings, live results and copy feedback. Required quantity/date/terms prevent progression; quantity is bounded by the selected material and dates cannot precede the local day. Data and status have text labels in addition to colors.

Computed WCAG ratios: white / primary green **2.54:1**; white / payment green **6.47:1**; muted / page **7.29:1**; dark green / soft green **9.23:1**; gray-500 / white **4.83:1**. The supplied bright-green/white action pairing has lower contrast than AA for small text; it is retained as a reference-fidelity exception and must not be reported as an AA pass. No motion is added; 200% zoom and narrow layouts must remain usable.

## 12. Review constraints and exceptions

The supplied prototype is authoritative for visual composition. Explicit exceptions: compact metadata below 16px; pure white surfaces; fine card outlines; existing Lucide library; bright primary green; existing font fallback; missing exact assets; demonstration notice; donation has no payment; no unsupported verification seals, quantified CO₂ savings, real Pix codes or payment approval claims. These exceptions must remain visible in delivery status.

## 13. Future feature instructions

Reuse these scoped components/tokens for marketplace work. Do not apply this document as a reason to redesign unrelated screens. Replace demo data only after verifying product image, supplier, distance, availability and price contracts. Server authorization must require registered users for real reservation actions.

## 14. Update policy

Update this document when the scoped components change. Payment/reservation remain UI-only until real backend/provider confirmation, failure handling and authorization have been exercised. See `docs/marketplace-prototype.md` for boundaries and acceptance evidence.

## About page — Figma extension (2026-10-22)

Surface: institutional/marketing page at `/sobre-nos`, matching Figma frame `137:4`. Concept: a direct statement of the local circular-economy mission beside the original artisan photograph, followed by a leaf-textured participation band. The explicit reference overrides the skill's generic ban on a text/photo split.

- Layout at 1600px: 80px header; hero with 64px side gutters, 80px vertical padding, 64px column gap and 640×400px image; 379px participation band; 181px footer. Below desktop, sections stack with 20–32px gutters; no fixed height clips content.
- Typography: locally bundled, OFL-licensed Manrope (400/500/600/700) for text, Instrument Serif (400) for the 64px mission/56px CTA titles (48px/40px on mobile), and Gabarito (600/700/800) for the brand. The `RF About` font aliases apply only to this page, preserving marketplace typography. `font-display: swap`; no runtime Google Fonts requests.
- Colors: reuse Figma `#fbfbf9`, `#064e3b`, `#10b981`, `#d97706`, `#4b5563`, `#ecfdf5` and white. Text/background contrast for green actions remains the documented reference-fidelity exception. The orange/white CTA also follows the supplied reference.
- Assets: original Figma `d7b6e.png` → `public/about/artesao-couro.png`, `c2370.png` → `public/about/economia-circular.png`, `a53d2.svg` → `public/about/repeat.svg`. Hero crop 1.6; radius 24px; the decorative background fills the CTA with a 92% deep-green overlay. No prototype avatar or personal account details are copied.
- Header/footer: opt-in `about` variants, active `/sobre-nos` navigation and dynamic real session state. Other page variants remain in place. Public visitors retain sign-in/register actions.
- Actions: “Explorar Materiais” opens `/marketplace`; “Cadastre-se Gratuitamente” opens `/cadastro`; “Como Funciona” opens a native modal with keyboard/Escape/focus restoration and honest demonstration status. No new API capability is asserted.
- Content exception: omit the prototype's blanket claim that all reused material is free, since the confirmed product supports both sale and donation. No statistics or additional product promises are invented.
- Review: original imagery, headline family and section geometry match the reference; the weakest initial difference was the header brand/profile styling, corrected in the scoped variant. Mobile text wraps and navigation remains usable. No motion was added.
- Validation: `npm run build`; scoped ESLint; desktop/mobile browser inspection at 375/768/1280/1600px, original image/font loading, navigation/modal interactions and the single-example catalog. The global lint's 34 existing errors/2 warnings remain unrelated to this feature.

The backend restore/pull was explicitly authorized only in the follow-up; see [frontend integration analysis](docs/frontend-readiness-review.md). The subsequent buyer integration is documented below.

## Buyer API extension (2026-10-22)

The default marketplace now shows API records; the single demonstration remains under `?origem=exemplo`. Real cards/details display only verified product fields and raster photos. No supplier identity, location, per-kilo pricing, dates, reservation action or approved charge is inferred. Live loading, retry/error, empty, filtering and pagination states replace static records on this surface.

`ProductCatalog` is shared by marketplace and buyer dashboard. `marketplaceTheme` supplies its scoped variables and focus states in both contexts, preventing invisible actions when embedded outside `MarketplaceLayout`. The shared catalog uses one column on phones, two from 640px and four from 1280px, with a 240px filter rail from 768px. Mobile search occupies a full row. Prototype-only catalog geometry described earlier remains scoped to the example.

Buyer account screens reuse the existing warm `#FAF9F5` canvas, white outlined panels, `#0F3D2E` headings and `#4B5A55` supporting text. `buyerStyles` owns 44–48px controls, 12px radii, dark `#006c4a` primary buttons, visible focus and textual error/success feedback. Existing system fonts and Lucide icons are retained. Header uses the existing compact marketplace variant for buyer/account recovery routes. Native destructive confirmation supports Escape, focus restoration and pending-state cancellation blocking.

No fake metrics or persisted negotiation history remain in the buyer dashboard. Unsupported services have explicit empty states. Recovery tokens remain in memory and are removed from the URL. See [buyer integration evidence](docs/buyer-api-integration.md) for contracts, checks and remaining configuration dependencies. These screens have browser verification with contract mocks; live API readiness is not claimed.

## Buyer API extension — reservations and account resources (2026-10-29)

Profile: App/Product UI + Store, preserving the Figma composition and existing account navigation. Concept: one truthful action per server-supported step, from material to reservation and supplier response. No redesign or new visual language. All new account pages use `buyerStyles`, the same warm canvas, dark-green actions, white panels, system sans and Lucide library. The approved project's compact 14px copy and 12–16px radii remain explicit exceptions to generic skill defaults; no gradients or motion added.

The dashboard sidebar stays in place for reservations/history, notifications, messages, addresses, cards, profile and security; on narrow screens it wraps above content. New controls have 44–48px minimum height, associated native labels and visible focus. Resource views include loading, empty, sanitized error/retry and confirmed success states. Destructive dialogs block while pending and restore focus on cancellation/Escape. Input styles use block layout; untrusted names/message text wrap.

Material photos remain API-only with geometric placeholders. Location shows only the disclosure supplied by the server. Reservation quantities are whole units; totals and status come from the server, and donation remains free. Messaging uses server acknowledgements and textual ownership/deletion states; no fake replies, chat history or purchase metrics. Cards display existing tokenized records without collecting PAN/CVV/token. No payment visual, QR or fake success remains.

Review: retained compact account layout and brand. The weakest observed details were a filter label touching its desktop control and missing focus restoration after unmounting a dialog; both were corrected. Reservations were visually inspected at 375px and 1280px; interactions/layout also exercised at 768px. Contrast pairs reuse `#006c4a`/white, `#0F3D2E`/white and `#4B5A55`/`#FAF9F5`. See [current verification and backend limitations](docs/buyer-api-update-2026-10-29.md).

Computed contrast for those three pairs: **6.47:1**, **12.16:1** and **6.89:1**, respectively. These measured pairs cover the new account actions/headings/supporting text; they do not claim every historical marketplace color pairing passes AA.

### Profile, postal lookup and authenticated About actions

Buyer profile uses a 112×112px circular photo preview with fixed geometry and the existing green-tint/UserRound fallback. A local object URL shows the selected image; only confirmed upload changes its caption to sent. No stock avatar, persistent browser photo cache or claim of reload recovery is added. Object URLs are revoked on replacement/unmount. The API still lacks authenticated photo readback.

The address form keeps its two-column desktop/stacked mobile layout. CEP lookup has explicit pending, found, partial, invalid/not-found and network/retry copy. Existing dark-green/outlined button patterns and accessible status/alerts are reused; fields remain manually editable and stale responses cannot overwrite newer input. No new colors, dependencies or motion. About retains its Figma section; the registration CTA is hidden for authenticated accounts and returns on logout. The complete continuation brief is `docs/CONTINUIDADE-PROJETO.md`.
