# Frontend Decisions and Known Constraints

This file records implementation-relevant facts. Add dated entries when a team decision resolves an ambiguity; do not turn assumptions into policy.

## Current baseline

- **2026-10-20 — Three independent applications:** web, API, and mobile are separate repositories/apps with independent dependencies. This frontend may read sibling repositories for contracts but may only write inside `FrontEnd-RF` during frontend tasks.
- **2026-10-20 — Existing web stack:** retain React + TypeScript + Vite, React Router, Tailwind, MUI, Axios, and lucide-react. No new state/query/form library is currently configured.
- **2026-10-20 — UI language:** user-facing strings are pt-BR; technical docs can be English.
- **2026-10-20 — API prefix/auth:** web uses `/api/reaproveitafranca`; JWT comes from storage key `token`, sent as Bearer by `src/axios/Axios.ts`.
- **2026-10-20 — Login mismatch:** backend route is `/user/login`; the two exported login helper functions in `Axios.ts` post to `/login` and are not a valid integration path. `Login.tsx` calls the API inline; check its actual payload and response handling.
- **2026-10-20 — Requirements vs delivered scope:** reservations, payment, account recovery, social auth, and environmental insights are not in the currently inspected API route inventory. Product requirements alone do not authorize mock completion claims.
- **2026-10-20 — Documentation drift:** the existing frontend README has stale statements about routes, features, and API helpers. Prefer live code and this verified integration guide; update README only in a separately scoped documentation task.
- **2026-10-20 — Mobile is not the web reference implementation:** Mobile is Expo SDK 57. Its `AGENTS.md` requires versioned Expo docs before coding there; never change mobile from this frontend task.

## Open questions (do not guess)

- Whether login identity is email, CPF/CNPJ, or both, and the exact normalized response/token/role schema.
- Whether company verification gates listing publication, and what status values/API implement it.
- Reservation lifecycle, negotiation status vocabulary, quantity locking, expiry/cancellation, and ownership rules.
- Payment provider, fee calculation/rounding, refund behavior, webhook source of truth, and donation exemption enforcement.
- Product image upload contract/storage and whether listing images are currently supported by API.
- Socket.IO web handshake, room/event names, persistence, authorization, and allowed development origins.
- Whether the 5% fee in the README is an approved current rule or a proposal.

Resolve these with code/API evidence or an explicit product-owner decision. Record the decision and update the relevant contract/requirements guide.
