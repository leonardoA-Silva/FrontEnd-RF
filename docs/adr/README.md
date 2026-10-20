# Architecture Decision Records

Use an ADR for a decision that is durable, cross-cutting, costly to reverse, or changes how agents should make future changes. Do not create ADRs for routine component implementation details.

## Process

1. Check [decisions.md](../decisions.md) and existing ADRs for prior choices.
2. Add a sequentially numbered file such as `0001-api-client-boundary.md` in this directory.
3. Start with status (`Proposed`, `Accepted`, `Deprecated`, or `Superseded`) and date (`YYYY-MM-DD`).
4. Explain context, considered options, chosen decision, and consequences/trade-offs. Link evidence and affected docs.
5. When superseding a decision, keep the old ADR and link the replacement; do not rewrite history as if the old choice never happened.
6. Update `AGENTS.md`, architecture/integration docs, or `decisions.md` only if the accepted decision changes agent guidance or current facts.

## Template

```markdown
# ADR-NNNN: Short decision title

- Status: Proposed
- Date: YYYY-MM-DD

## Context
What problem or constraint requires a decision?

## Options considered
What viable alternatives were considered and what are their trade-offs?

## Decision
What is chosen, and what is explicitly not chosen?

## Consequences
Benefits, costs, risks, migration/maintenance obligations, and follow-up work.

## Evidence and links
Relevant source files, API contracts, requirements, or discussions.
```
