# Cross-Repository Integration Workflow

The RF workspace contains independent web, API, and mobile codebases. Coordinate contract changes without assuming a shared build, package manager, CI, or release process.

## Repository ownership

| App | Directory | Stack | Frontend task write boundary |
|---|---|---|---|
| Web | `FrontEnd-RF/` | React/TypeScript/Vite | Writable for this task. |
| API | `backend-RF/` | Express 4/MySQL 8/Socket.IO | Read for contract verification; do not edit during frontend-only work. |
| Mobile | `Mobile-RF/` | Expo SDK 57 / React Native | Read for parity/context; do not edit during frontend-only work. |

Each app has its own dependencies and scripts. Run a command from the application directory it belongs to. There is no workspace-root `package.json` or unified CI/test command.

## When the API contract is insufficient

1. Search actual API routes, middleware, controller, and service/schema. Record the exact evidence in `docs/api-contract.md` only when the verified snapshot needs updating.
2. If the API already supports the flow, implement against its real payload and response; include loading/error/unauthorized states.
3. If support is absent or ambiguous, do not invent endpoints or simulate persistence. Describe the API change needed, including method/path, auth/role, request/response shape, validation, and failure cases.
4. Keep this frontend task limited to frontend files. A separately authorized API task must be owned and verified in `backend-RF` by its maintainer.
5. Once the API contract is agreed and implemented, update the frontend helper/types and contract reference together, then verify against a running API when available.

## Mobile parity

The mobile app is a separate Expo SDK 57 project using React Native, AsyncStorage key `@token`, and a hardcoded LAN API address in its Axios service. Do not copy that address or storage behavior into the web client. If implementing equivalent mobile behavior is requested, hand off the exact user flow and API contract; the mobile owner must follow `Mobile-RF/AGENTS.md` and consult Expo docs version 57.0.0 before coding.

## Contract change checklist

- [ ] Existing API route/controller verified; no stale or hypothetical route used.
- [ ] Roles, ownership checks, validation, and error response semantics identified.
- [ ] Sensitive fields and upload content rules identified.
- [ ] Web request/response types and UI states match the API.
- [ ] Mobile parity need is documented, not silently assumed.
- [ ] Required changes in other repositories are stated explicitly in the completion report.
