# Reaproveita Franca Web — Agent Workflow

Read [AGENTS.md](AGENTS.md) first. These instructions describe how to work; the rules there take precedence.

## Start every task

1. Confirm the current working directory is `FrontEnd-RF` and read its `AGENTS.md`.
2. Inspect the relevant route, page/component, API helper, and nearest established pattern before editing. Read only the sibling API/mobile files needed to verify a contract; never modify them.
3. Classify the request: existing behavior, bug, new UI, or requirement proposal. Check [docs/product.md](docs/product.md) and [docs/api-contract.md](docs/api-contract.md) for status and known mismatches.
4. State a compact implementation/verification plan for multi-file or behavior-changing work. For a small scoped change, proceed directly.
5. For UI work, read [docs/ui-guidelines.md](docs/ui-guidelines.md); for identity, forms, logs, or storage, read [docs/security-privacy.md](docs/security-privacy.md). If another app must change, follow [docs/integration-workflow.md](docs/integration-workflow.md).
6. For a new or changed user capability, use [docs/feature-readiness.md](docs/feature-readiness.md) to define observable acceptance evidence; use [docs/localization.md](docs/localization.md) for pt-BR strings. Record durable architectural choices with [docs/adr/README.md](docs/adr/README.md).

## Work loop

1. Define observable acceptance criteria, including user-visible states and role access.
2. Make the smallest cohesive change that fits the existing React/TypeScript and styling patterns.
3. Keep data access in the existing Axios client (`src/axios/Axios.ts`) unless the task clearly requires a new service boundary. Do not wire the known unused/broken login helper exports without checking the actual route and payload.
4. Validate inputs and render server errors safely. Do not store sensitive identifiers as remembered form values or persist more user data than needed.
5. Run `npm run lint` and `npm run build` in this app. For visual changes, launch `npm run dev`, exercise the changed route and inspect responsive behavior. Mention any check that could not be run.
6. Review the final diff for scope creep, secrets, unsupported API assumptions, accessibility regressions, and edits outside this repository.

## Ask before proceeding only when blocked

Make reasonable local implementation decisions without stopping for minor preferences. Ask the user when a choice changes business policy, requires a new API/mobile contract, spends money, publishes/pushes, handles real personal data, or would violate the frontend-only write boundary. If integration support is missing, implement only a clearly labeled frontend proposal/mock when requested; otherwise report the blocker rather than faking a successful integration.

## Completion report

Summarize what changed, list the exact verification commands and their result, and disclose unimplemented requirements or API/mobile work that remains. Never report aspirational requirements as delivered functionality.
