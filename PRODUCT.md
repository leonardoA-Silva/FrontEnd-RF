# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Companies in Franca's footwear-industry supply chain that publish reusable surplus materials; artisans, cooperatives, schools, NGOs, and businesses looking for those materials.

## Product Purpose

Reaproveita Franca connects local industrial surplus with people and organizations that can reuse it. Success means making it easier to discover and give reusable materials a new destination in the local circular economy.

## Positioning

The product focuses on reusable materials from Franca's footwear-industry ecosystem and local reuse. No exclusive market position or measured impact claim has been verified.

## Operating Context

Companies publish material listings for sale or donation. Registered users can discover listings. Current interface and API behavior must be checked before claiming reservation, payment, negotiation, messaging, or map capabilities are available.

## Capabilities and Constraints

- This repository contains the web frontend only; the API and mobile application are separate projects.
- Only company accounts may publish listings.
- Listings are for sale or donation; sale requires a price and donation has no price.
- Frontend routes include public home, login, registration type/company/user, company and user dashboards, company materials and new-material screens, and a protected company map route.
- A screen or product goal does not prove an API-backed capability. In particular, payment and reservation endpoints are not confirmed by the current API contract; map provider integration is not confirmed.
- Preserve existing routes, role protection, form behavior, and request states. Do not invent backend contracts or product claims.

## Brand Commitments

- Product name: Reaproveita Franca.
- Preserve the approved Recycle symbol and the existing Manrope typography.
- Preserve the established forest-green, leather/terracotta, and paper palette documented in `DESIGN.md`.
- User-facing copy is Brazilian Portuguese (pt-BR).

## Evidence on Hand

- Product and API status: `docs/product.md`, `docs/api-contract.md`, and the current route/page implementation.
- Existing local material imagery is referenced by `src/pages/home/Home.tsx`; verify availability and provenance before reuse.
- Current homepage includes impact statistics and a named testimonial whose verification is not established in repository product documentation. Do not present them as verified proof without confirmation.
- No verified testimonials, measured impact data, customer logos, or commercial benchmarks are established here.

## Product Principles

- Keep material reuse local and understandable.
- Make the distinction between company publishers and material-seeking users clear.
- Represent sale and donation accurately.
- Keep uncertain or unimplemented capabilities clearly separate from working flows.
- Make essential flows accessible and usable at desktop and narrow/mobile widths.

## Accessibility & Inclusion

Use semantic landmarks and headings, keyboard-operable controls, visible focus, labeled form fields, accessible async status/error feedback, sufficient contrast, and reduced-motion support. Support responsive layouts and touch targets.
