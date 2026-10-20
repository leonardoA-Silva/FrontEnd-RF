# Agent Task Workflow

Adapted from Filmcraft's autonomous work loop: orient, define evidence, implement, verify, and report. This workflow does not grant permission to edit outside `FrontEnd-RF`.

## 1. Orient

- Read `AGENTS.md`; consult `llms.txt` for the documentation map.
- Locate the route, UI, API client, and tests/checks related to the request.
- Read only the relevant API/mobile source needed to validate integration. Treat those repositories as read-only.
- Check current working-tree changes before editing so existing user work is not overwritten.

## 2. Define the outcome

Write a short acceptance checklist for every behavior-changing task. Make it observable: route, interaction, role, expected API result, error handling, and responsive/accessibility behavior as applicable. Mark external API/product decisions as blockers instead of inventing answers.

## 3. Implement narrowly

- Prefer the smallest coherent patch consistent with nearby patterns.
- Keep UI state and API contract concerns separated enough to reason about; avoid speculative abstractions.
- Do not silently add fake API data, fake payment/reservation success, or hidden policy assumptions.
- Update the relevant docs when a verified contract or durable product/architecture decision changes.

## 4. Verify and inspect

- Run lint and build from the frontend directory.
- Exercise changed UI when practical; inspect browser errors, network request, empty/error states, narrow and wide layouts, and keyboard/focus behavior.
- Record what was not verifiable (for example, unavailable API server, no test suite, or another repository owner needed).
- Read the final diff and confirm only intended frontend paths changed.

## 5. Report honestly

State what changed, what evidence supports it, checks and results, remaining limitations, and any cross-repository handoff. Use “implemented in the UI” separately from “integrated end-to-end” and “production-ready.” Do not claim a feature is complete based only on a screen or successful build.

## Decision policy

Agents may make reversible implementation choices that follow existing patterns. Ask for a product-owner decision when the choice changes business rules, privacy/legal behavior, external service/costs, or public API contracts. For a durable architectural decision, use the ADR process in [adr/README.md](adr/README.md). For unresolved scope, report the options and consequences rather than expanding scope.
