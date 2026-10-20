# Feature Readiness and Evidence

Filmcraft distinguishes feature breadth from readiness for real work. Apply the same principle here: the presence of a screen, route, button, type, or endpoint is not proof that a user workflow is complete.

## Status vocabulary

- **Proposed:** requirement or design exists; implementation not verified.
- **UI-only:** user interface exists, but persistence/API integration is absent, mocked, or unverified.
- **API-supported:** an API route exists, but the complete web flow has not been exercised.
- **Integrated:** the web flow was exercised against the relevant API contract, including success and failure behavior.
- **Ready:** integrated flow also meets role rules, input/error handling, responsive/accessibility expectations, and reproducible verification. State any scope limitations.
- **Blocked:** a specific dependency or product decision prevents completion.

These are evidence labels, not a numeric score. Do not invent percentages or use “done” where the evidence only proves a partial stage.

## Readiness checklist

For each significant feature, provide evidence for the applicable items:

- [ ] User story, target role, business rule, and out-of-scope behavior are explicit.
- [ ] Correct route and direct navigation behavior exist.
- [ ] API path, payload, response, auth, role/ownership, and server validation were verified.
- [ ] Loading, success, empty, validation, permission, not-found, and network/server error states are addressed.
- [ ] User data is handled safely and only persisted as needed.
- [ ] Keyboard/focus, labels, status announcements, and responsive layout were checked.
- [ ] `npm run lint` and `npm run build` results are recorded; relevant UI/API behavior was exercised where possible.
- [ ] External API/mobile dependencies and unresolved decisions are listed.

## Evidence format

When updating a feature status or reporting completion, include:

```text
Status: UI-only | API-supported | Integrated | Ready | Blocked
Evidence: files/routes and exact interaction or API check performed
Checks: command + result
Limitations: what was not tested or is not implemented
Dependencies: API/mobile/product decision, if any
```

Update [product.md](product.md) or [api-contract.md](api-contract.md) only when you have new source evidence or an approved decision. Keep unknowns unknown; do not treat estimates as facts.
