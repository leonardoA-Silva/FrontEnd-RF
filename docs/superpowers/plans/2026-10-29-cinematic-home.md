# Cinematic home implementation plan

**Goal:** Implement the selected full-page reference on the existing home route.
**Architecture:** Semantic React sections and existing shared header/footer; generated local WebP illustrations. GSAP scopes scroll reveals and parallax. A lazy-loaded R3F canvas offers an interactive procedural ribbon sculpture with bounded camera controls and fallback to the hero image.
**Stack:** Existing React/TypeScript/Tailwind/Vite, approved GSAP, Three, R3F, Drei.
**Spec:** User-selected full-home image and DESIGN.md. Original green/ivory palette, headings and section sequence are authoritative.

- [x] Produce and optimize local hero, transformation and material illustrations; preserve generated originals.
- [x] Implement responsive home sections, shared brand and navigation. Keep forms and API contracts intact.
- [x] Build lazy interactive 3D sculpture with error boundary, reduced motion, pause and offscreen suspension.
- [x] Add GSAP scoped reveals/parallax with cleanup, pause and reduced motion.
- [x] Verify lint, build, desktop/phone/tablet layout, keyboard/menu/navigation, 3D and fallback, reduced motion, and route teardown.

Constraints: frontend only; no new API, unsupported inventory/impact claims, real personal data, social destinations or unverified transactional functionality. No tests framework exists; use targeted browser checks, not an added framework. GPU-intensive scene loads only on request; descriptive image remains accessible. Existing changes to other routes are preserved.
