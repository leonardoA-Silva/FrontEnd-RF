# Contributing to Reaproveita Franca Web

This repository is the independently maintained web frontend. Read [AGENTS.md](AGENTS.md) before making changes; its scope and privacy rules are mandatory. For project orientation, start with [llms.txt](llms.txt).

## Local setup

Requirements: Node.js 20+ and npm. Run commands from `FrontEnd-RF/`:

```bash
npm install
npm run dev
```

The Vite development proxy forwards `/api` to `VITE_BACKEND_URL` or `http://localhost:5000`. The Axios base can be overridden with `VITE_API_URL`. These are client configuration values, not secret storage; never place credentials in `VITE_*` variables.

## Before submitting a change

```bash
npm run lint
npm run build
```

There is no configured automated test suite or root-level workspace script. If either command fails, report the actual output and whether failures are in touched code; do not suppress unrelated errors or state that verification passed. For UI work, follow [docs/quality.md](docs/quality.md) and [docs/ui-guidelines.md](docs/ui-guidelines.md).

## Change hygiene

- Keep each change focused on one user-visible behavior or documentation purpose.
- Inspect `git status` and the diff before and after work. Preserve unrelated modifications; do not revert or stage other contributors' changes.
- Never modify the API or mobile repository as part of a frontend-only contribution. Document the cross-repo dependency instead.
- Add/adjust types and API documentation only from verified contracts. Keep business behavior and errors understandable in pt-BR.
- Do not add dependencies, credentials, real personal information, or unlicensed assets without explicit approval.
- Do not commit, push, publish, or open a PR unless explicitly requested.

## Pull request / handoff summary

Describe the user-facing change, affected routes, API assumptions/contracts, verification commands and results, known limitations, and any required API/mobile follow-up. Distinguish what was inspected from what was actually exercised.
