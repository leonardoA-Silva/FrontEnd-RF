# Plan: Integrate company screens into main without losing buyer flows

> **Executor instructions**: Follow steps in order. Run every verification gate. Stop and write a handback if a STOP condition occurs; do not choose a product behavior.
>
> **Drift check (run first)**: `git diff --name-only f40ad19 -- DESIGN.md docs/api-contract.md src/App.tsx src/components/Footer.tsx src/components/Notification.tsx src/components/dashboard/WorkspaceFrame.tsx src/hooks/useLoggedUser.ts src/index.css src/pages/company/CompanyShell.tsx src/pages/dashboard/DashboardUsuario.tsx src/pages/login/Login.tsx vite.config.ts`
> Expected: no output. If any listed path changed, compare the current code and this plan before merging.

## Status

- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Planned at**: revision `f40ad19c5263f4533272c01b5e0134233f796a04`, 2026-11-10

## Why this matters

`leonardo/telas-empresa` contains completed company routes and a shared dashboard design. `main` contains working buyer and authentication behavior that must not be replaced by the branch's demo dashboard or login presentation. A conflict-aware merge should deliver company screens while retaining those main flows and bringing their presentation closer to the company's existing style.

## Current state

- `main` is locally updated to `origin/main` at `9b98433`; it has buyer routes and authenticated buyer screens.
- `leonardo/telas-empresa` is at `f40ad19`, one documentation commit ahead of `origin/leonardo/telas-empresa`; its source tree includes company screens and `WorkspaceFrame`.
- The previous merge attempt was aborted before conflict resolution. The worktree is clean on `leonardo/telas-empresa`.
- `src/components/dashboard/WorkspaceFrame.tsx:19-35` supplies the company visual frame and logout behavior; `:36-57` defines company navigation, account header, and footer.
- `src/pages/company/CompanyShell.tsx:7-14` wraps company routes in `WorkspaceFrame` and displays preview/notice states.
- `src/pages/dashboard/DashboardUsuario.tsx:1-20` on the branch is demo-oriented. The `main` version imports `useBuyerSocket`, `ProductCatalog`, and buyer pages such as `BuyerReservations`, `BuyerNotifications`, `BuyerAddresses`, `BuyerCards`, `BuyerConversations`, `BuyerProfile`, and `BuyerSecurity`.
- `main`'s `src/pages/login/Login.tsx:1-28` imports `saveSession`, API error helpers, and `GoogleSignIn`; retain these authentication paths when restyling.
- The conflict set is `DESIGN.md`, `docs/api-contract.md`, `src/App.tsx`, `src/components/Footer.tsx`, `src/components/Notification.tsx`, `src/hooks/useLoggedUser.ts`, `src/index.css`, `src/pages/company/CompanyShell.tsx`, `src/pages/dashboard/DashboardUsuario.tsx`, `src/pages/login/Login.tsx`, and `vite.config.ts`.
- Repository convention: user-facing copy is pt-BR; follow existing Tailwind/local-style patterns. `src/components/dashboard/WorkspaceFrame.tsx` is the visual exemplar for the integrated workspace.
- There is no configured automated test suite. `package.json` defines `npm run lint` as `eslint .` and `npm run build` as `tsc -b && vite build`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Lint | `npm run lint` | Exit code 0 |
| Build and typecheck | `npm run build` | TypeScript and Vite build exit 0 |
| Whitespace/conflict check | `git diff --check` | No output and exit code 0 |
| Unresolved paths | `git diff --name-only --diff-filter=U` | No output |

## Scope

**In scope** (manual conflict resolution only):
- `DESIGN.md`
- `docs/api-contract.md`
- `src/App.tsx`
- `src/components/Footer.tsx`
- `src/components/Notification.tsx`
- `src/components/dashboard/WorkspaceFrame.tsx`
- `src/hooks/useLoggedUser.ts`
- `src/index.css`
- `src/pages/company/CompanyShell.tsx`
- `src/pages/dashboard/DashboardUsuario.tsx`
- `src/pages/login/Login.tsx`
- `vite.config.ts`

Merge all other committed branch paths unchanged unless Git reports additional conflicts. Do not discard non-conflicting branch additions.

**Out of scope**:
- Backend and mobile repositories — this is a frontend-only integration.
- New API capabilities, buyer features, or dependencies — preserve existing contracts and behavior only.
- Push, publish, or remote branch updates.

## Steps

### Step 1: Confirm clean source and target revisions

Confirm the current branch is `leonardo/telas-empresa`, no local changes exist, and `main` still points to `origin/main`. Refresh remote refs with `git fetch --all --prune` only if network access is available; do not reset either branch. Recheck whether either branch advanced since this plan was written.

**Verify**: `git status --short --branch` is clean; `git rev-parse main origin/main leonardo/telas-empresa` shows the expected commits or a documented newer fast-forward.

### Step 2: Merge company branch into main

Switch to local `main` and merge `leonardo/telas-empresa`. Keep the buyer and login behavior from `main`, and combine branch styling/routes rather than choosing either side wholesale. Resolve all conflicts in the named files. If Git reports conflicts outside the list, inspect their base/ours/theirs versions and stop if their intent is unclear.

Specific outcomes:

- `src/App.tsx`: retain all `main` marketplace, buyer, registration, and auth routes; add company routes and development previews from the branch.
- `src/pages/company/CompanyShell.tsx`: retain the branch's `WorkspaceFrame` and company section labels; preserve company preview, notice, and correct exit/session behavior.
- `src/components/dashboard/WorkspaceFrame.tsx`: route normal exits through `clearSession()` so the main session store and profile-photo cache stay synchronized; previews must not clear the user's session.
- `src/pages/dashboard/DashboardUsuario.tsx`: retain `main` buyer data sources, socket, route/query navigation, and all buyer pages. Apply `WorkspaceFrame`/branch visual patterns without replacing live behavior with demo-only `MaterialStorefront` and `UserRecords`.
- `src/pages/login/Login.tsx`: retain `main` API login, role checks, session saving, Google sign-in, first-access routing, and recovery link. Adopt branch presentation using existing styles without dropping account-deletion status or error states.
- `src/index.css` and `DESIGN.md`: keep both sides' required styles and design tokens; avoid duplicate/conflicting definitions where they produce inconsistent workspace styling.
- `docs/api-contract.md`: preserve verified main buyer/auth contracts and add company contracts only where already documented and supported.
- `src/components/Footer.tsx`, `src/components/Notification.tsx`, and `src/hooks/useLoggedUser.ts`: preserve behavior consumed by both buyer and company paths while retaining compatible branch styling.
- `vite.config.ts`: keep the `main` backend target (`127.0.0.1:5000`) unless project evidence shows the branch target is required; retain socket proxy support.

**Verify**: `git diff --name-only --diff-filter=U` prints no paths; `git diff --check` exits 0.

### Step 3: Validate merged behavior and appearance

Run lint and production build. Inspect changed routes at desktop and narrow widths if the local app and required API are available. Check login and buyer screens retain their existing actions; check company screens use the shared branch workspace and navigation. If API-backed paths cannot run, report them as unverified rather than simulating success.

**Verify**: `npm run lint` and `npm run build` exit 0; `git diff --check` exits 0; no unresolved merge paths remain.

### Step 4: Review and finish local merge

Review the complete merge diff against both parents. Confirm all listed main buyer/auth behaviors and company routes remain represented. Create a clear English merge commit only after checks pass. Do not push.

**Verify**: `git status --short --branch` is clean after commit; `git log --oneline --decorate --graph -8` shows the merge commit on `main` with both histories as parents.

## Test plan

- No automated test suite is configured in this frontend.
- Run `npm run lint` and `npm run build` after conflict resolution.
- If backend/API access is available, manually exercise buyer login, Google sign-in entry point, buyer navigation, and company routes at desktop and narrow widths. Record unavailable backend-dependent checks as blocked.
- **Verify**: both configured commands exit 0; no conflict markers remain in the named files.

## Done criteria

- [ ] `git diff --name-only --diff-filter=U` → no output.
- [ ] `npm run lint` → exit 0.
- [ ] `npm run build` → exit 0.
- [ ] Main buyer flows and login behavior remain in code and reachable.
- [ ] Company routes remain reachable and use `WorkspaceFrame` styling.
- [ ] Merge commit exists locally on `main`; no push occurred.
- [ ] No files outside the merge's branch diff and this plan/spec are modified.

## STOP conditions

Stop and write a handback if:

- `main` or `leonardo/telas-empresa` advanced and new commits alter the assumptions above.
- Any existing buyer/auth flow cannot be preserved alongside company routes without a new product decision.
- A conflict affects files outside the listed set and intent cannot be established from history/code.
- Lint/build fails twice after a focused correction, or resolution requires changing API/mobile contracts.
- A visual change requires removing behavior to fit the layout.

## Maintenance notes

Review route protection, session handling, and responsive navigation closely. Do not present demo-only company data as live API data. Backend and mobile integration remain outside this frontend merge.
