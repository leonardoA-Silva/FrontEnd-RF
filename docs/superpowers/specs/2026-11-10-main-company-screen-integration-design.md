# Main and Company Screens Integration

## Goal

Merge `leonardo/telas-empresa` into `main` without removing working buyer or authentication behavior. Apply the company branch's established visual language to retained flows where merge conflicts require presentation changes.

## Constraints

- Keep API and mobile repositories unchanged.
- Preserve real buyer features from `main`: catalog, reservations, history, real-time notifications and messaging, addresses, cards, profile, and security.
- Preserve login behavior from `main`: role validation, Google sign-in, session persistence, first-access password flow, and account-deletion notice.
- Keep company routes and company-specific screens from `leonardo/telas-empresa`.
- Do not push or publish.

## Integration approach

Use `main` behavior as source of truth for buyer and authentication flows. Use `leonardo/telas-empresa` company routes, `WorkspaceFrame`, company page styling, and design tokens. Adapt retained buyer and login markup to the branch's existing visual patterns without replacing their data flow or capabilities.

Resolve shared files by combining behavior rather than selecting one side wholesale:

- `src/App.tsx`: retain current main routes and add company routes and previews.
- `src/pages/company/CompanyShell.tsx`: use `WorkspaceFrame` while retaining preview, notice, section, and exit behavior required by company routes.
- `src/pages/dashboard/DashboardUsuario.tsx`: keep the authenticated buyer implementation; apply the branch's shared workspace styling without replacing buyer features with demo-only content.
- `src/pages/login/Login.tsx`: keep main's authentication handlers and Google flow; align presentation with the branch's login design, retaining recovery and status messages.
- `src/index.css`, `DESIGN.md`, and `docs/api-contract.md`: combine both sets of additions and preserve existing main-specific styles and verified API details.
- `src/components/Footer.tsx`, `src/components/Notification.tsx`, `src/hooks/useLoggedUser.ts`, and `vite.config.ts`: preserve both required behavior and compatible visual/configuration changes; use main's backend target unless evidence requires otherwise.

## Acceptance checks

- No conflict markers remain and the merge has no unresolved paths.
- Buyer and login flows listed above remain reachable and wired to their existing APIs.
- Company routes from the branch remain reachable and use the shared company frame.
- `npm run lint` and `npm run build` pass.
- Review final diff and local merge graph; do not push.

## Risks

Shared page and global CSS changes can regress buyer layouts. Resolve by preserving buyer components and validating the build plus affected route behavior where the local environment permits.
