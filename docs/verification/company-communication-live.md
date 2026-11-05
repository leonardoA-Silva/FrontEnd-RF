# Live company communication verification — 2026-11-05

## Environment

- Backend `main` updated with `git pull --ff-only`: `cf23b5d` → `a8611b4`. Backend worktree remains clean; no backend source or credentials changed.
- Existing Windows MySQL 8 service on 3306. The API's SQL includes `conversation_participant`; that table was absent from the former local database.
- The owner explicitly requested replacement of the configured database using the current API SQL. Before replacement, a mysqldump was encrypted using Windows DPAPI CurrentUser outside both repositories. Decryption in memory matched the original SHA-256; no plaintext backup was written to the repository. This verifies recoverable backup bytes, not a full SQL restoration exercise.
- Local database recreated with 19 tables. The earlier three account rows are in the backup; the new test database contains two synthetic active accounts with bcrypt password hashes and no document/address/phone records.
- API running on `http://localhost:5000`; frontend on `http://127.0.0.1:5173`. No SMTP, external payment or production system was exercised.

## Actual API/database evidence

No intercepted/mock responses in this run:

1. Authenticate company and buyer using `POST /user/login`; exercise company login through the frontend form.
2. Create their conversation with authenticated `POST /conversation/`.
3. Connect the buyer through Socket.IO over the frontend's Vite proxy and send an initial message.
4. Open the actual company chat; confirm history from the server.
5. Send from the company textarea; require server acknowledgement and receipt by the buyer socket.
6. Send a buyer reply; confirm it appears in the company's browser without reloading.
7. Open a generated message notification, navigate to its conversation, then mark remaining notifications read through the UI.
8. Query MySQL/API: three messages persisted; both participant rows remain; company notifications have `read = sim`. The buyer's notification list contains only their own rows.
9. Inspect desktop and phone; no horizontal overflow or browser runtime errors. No screenshots contain login credentials or real personal data.

The frontend now uses the explicitly approved `socket.io-client` dependency. The API's `leave_conversation` event is deliberately not emitted during navigation, since it removes the participant. The latest 100 messages are displayed; attachment viewing/uploading and a new-conversation/contact picker are outside this change. Notification refresh remains entry/manual rather than a global push subscription.

Screenshots: `company-chat-live-desktop.png`, `company-chat-live-mobile.png`, `company-notifications-live-desktop.png`.

An interactive browser window was opened on the company account using the actual login response, without putting credentials in code or URLs. API and frontend processes were left running for review. Lint/build and the network-free preview remain part of frontend verification. No commit or push in this step.
