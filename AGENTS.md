# Reaproveita Franca Web — Agent Rules

These rules apply to every human and AI contributor working in this repository. `CLAUDE.md` is the session workflow; this file contains the durable rules and wins if instructions conflict. The scope of this repository is the web frontend only.

## Non-negotiable rules

1. **Frontend-only changes.** Do not edit `backend-RF/`, `Mobile-RF/`, sibling repositories, or files outside `FrontEnd-RF/`. You may read sibling repositories to confirm integration behavior. For cross-repository work, explain the required change and ask the owner to apply it in that repository.
2. **Inspect before assuming.** Treat source code and live route/configuration files as authoritative over stale README text, mockups, requirements, and comments. Distinguish implemented behavior from planned requirements. Never invent an API endpoint, payload, role, status, payment flow, or design token.
3. **Protect sensitive data.** CPF/CNPJ, passwords, JWTs, addresses, and personal contact information are sensitive. Never log them, put them in URLs, screenshots, fixtures, or documentation examples. Do not add credentials or real personal data to the repository. Frontend validation is for usability; authorization and validation must remain enforced by the API.
4. **Keep user-facing copy in Brazilian Portuguese (pt-BR).** This applies to labels, validation, loading/empty/error states, notifications, and accessibility names. Technical documentation and code may use English.
5. **Respect the existing stack and style.** React 19, TypeScript, Vite 8, React Router 7, Tailwind CSS 4, MUI 9, Axios, and lucide-react are already installed. Avoid new dependencies unless essential and explicitly approved. Components generally use a local `styles` object of Tailwind classes; there are no per-component CSS files by convention. Existing code may mix MUI and Tailwind; follow the nearest working pattern.
6. **Preserve product rules.** Only companies publish listings; listings are sale or donation; donation has no price; any registered user may request a reservation. Do not claim that payment, shipping, AI classification, maps, chat, or other planned features are available unless implementation and API support are confirmed.
7. **Handle every request state.** Network-backed UI must consider loading, success, empty, validation, unauthorized/forbidden, not-found, server/network failure, and retry where appropriate. Avoid exposing raw stack traces or backend internals to users.
8. **Do not silently broaden scope.** Do not perform unrelated redesigns, cleanup, dependency upgrades, or API/mobile edits. Preserve unrelated and pre-existing changes.

## Verify changes

Run commands from this repository (not the workspace root):

```bash
npm run lint
npm run build
```

There is no configured test suite in this frontend. Do not claim tests passed if none were run. For UI changes, also run the app and inspect the affected route at desktop and narrow/mobile widths when practical. See [docs/quality.md](docs/quality.md).

## Source of truth and references

- [CLAUDE.md](CLAUDE.md): agent work loop.
- [docs/architecture.md](docs/architecture.md): actual frontend architecture and boundaries.
- [docs/api-contract.md](docs/api-contract.md): verified API surface and known mismatches.
- [docs/product.md](docs/product.md): product context, business rules, and requirement status.
- [docs/quality.md](docs/quality.md): validation and review criteria.
- [docs/ui-guidelines.md](docs/ui-guidelines.md): visual, responsive, and accessibility conventions.
- [docs/security-privacy.md](docs/security-privacy.md): frontend security and personal-data handling.
- [docs/integration-workflow.md](docs/integration-workflow.md): safe coordination across the three repositories.
- [docs/agent-workflow.md](docs/agent-workflow.md): task lifecycle, acceptance evidence, and handoff.
- [docs/feature-readiness.md](docs/feature-readiness.md): how to report implementation status honestly.
- [docs/localization.md](docs/localization.md): pt-BR writing and formatting conventions.
- [docs/adr/README.md](docs/adr/README.md): template for durable technical decisions.
- [CONTRIBUTING.md](CONTRIBUTING.md): contributor setup, checks, and change hygiene.
- [docs/decisions.md](docs/decisions.md): decisions and known integration caveats.
- [llms.txt](llms.txt): compact entry point and reading order for AI agents.

When sources conflict, use this order: current implementation and backend route/controller code for existing behavior; then these repository-specific agent rules; then approved product decisions; then proposal/requirements documents; then old README prose or comments. Record important unresolved disagreements instead of guessing.
