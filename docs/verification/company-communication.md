# Company messages and notifications

## Delivered

- Routes `/dashboardEmpresa/mensagens` and `/dashboardEmpresa/notificacoes`, under the existing company guard; preview routes `/previa/dashboard/empresa/mensagens` and `/previa/dashboard/empresa/notificacoes`.
- Approved forest/ivory composition, sidebar destinations, notification bell and counters; fixed bottom navigation on phones.
- Preview chat: five fictional conversations, search, unread filter, per-conversation drafts, local send, Enter/Shift+Enter, 2000-character cap, material links, grouped history, mobile list/thread navigation and unknown-conversation fallback. Drafts/messages stay in memory until the workspace unmounts or reloads. No fake automatic replies, deliveries, online status, attachment uploads or network sends.
- Notifications: date groups, all/unread/type filters, detail dialogs, mark one/all as read, loading, empty, failure, retry and sign-in states. Preview read changes survive route navigation within the workspace. The message notification can open its corresponding preview conversation.
- Real notification list/read actions use the existing Axios interceptor and owner-scoped REST contract. Updates happen only after response validation; failed mutations retain unread state. No push transport or arbitrary server-supplied action links.
- Real chat explicitly states that messaging is not yet connected. The development preview link is only exposed in development builds.

## Integration limits

The backend has Socket.IO message events, but the frontend has no Socket.IO client dependency. The inspected conversation-list SQL references the undefined `other` alias. Correcting that query and agreeing on the client transport/authentication/CORS integration are backend-owner/integration follow-ups; no sibling files were edited. Live authenticated server/database messaging was not exercised. The interface does not present the preview as real customer communication.

## Verification

- `npm run lint` and `npm run build`: passed, retaining the existing home sculpture chunk-size warning.
- Edge: both preview routes at 320, 390, 768 and 1440 px; repeated with normal/reduced motion for deep links, unread changes, footer clearance and fixed mobile navigation. No page overflow or runtime errors; no active animation under reduced motion.
- Exercised conversation search/empty/reset, local send, cleared draft, Shift+Enter, per-conversation draft retention, preview page navigation, notification-to-conversation link, read-all persistence, unread empty state, type filtering, dialog Escape and invalid conversation.
- Zero API calls from the company communication previews.
- Intercepted real REST responses: initial loading, valid list, individual read, read-all, empty, malformed response, network failure, 401/403/404/500 and retry. Rejected read mutation does not update unread state. Internal server strings remain hidden. Real-chat composer is absent; unauthenticated access redirects to login.
- Screenshots: `company-mensagens-1440.png`, `company-mensagens-390.png`, `company-mensagens-conversa-390.png`, `company-notificacoes-1440.png`, `company-notificacoes-390.png`.

No real personal data or credentials were used in screenshots or fixtures. Changes remain local on `new-ui`, without commit or push in this step.
