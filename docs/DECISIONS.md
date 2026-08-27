# Implementation decision log

## 2026-08-27, pre-commercial acceptance before store integration

- Complete and verify one self-contained private Android build before involving the client in Apple, Google Play or RevenueCat accounts.
- The preview uses the real backend, Google authentication and AI, but disables development controls, email delivery, payments and production push delivery.
- Premium access is presented honestly as a non-transactional preview. No local or simulated entitlement is granted.
- Commercial integrations remain required before public release and must be tested against client-owned accounts.

## 2026-08-26, Stage 11 privacy and compliance decisions

- Account deletion removes storage objects through the Supabase Storage API before database and Auth deletion. Direct SQL deletion from `storage.objects` is not used because it can orphan the underlying files.
- The deletion sequence is retry-safe. Storage removal is verified before database cleanup, database deletes are idempotent, and Auth deletion happens last.
- The append-only `cycle_events` rule remains intact during normal use. A transaction-local flag permits deletion only inside the service-role account-deletion function.
- Check-photo retention is configurable and disabled while the blueprint’s 90-day proposal remains legally unapproved. The deployed job logs `skipped_unconfigured` rather than silently choosing a policy.
- Harvest photos remain until the user deletes the account. They are excluded from the automated check-photo retention job.
- Product analytics use a first-party Supabase table, an explicit event allowlist and a small non-PII property allowlist. Analytics failures never block the grow cycle.
- The first AI photo notice is stored on the profile and enforced by both the mobile route and the server-side photo-check function.
- Sentry uses the client-owned `seednergy/seednergy-app` project with default PII disabled and zero performance tracing. Logs, Session Replay and User Feedback are disabled.

## 2026-08-26, Stage 9 harvest and notification decisions

- Harvest completion is a database RPC, not a client-side table update. This keeps ownership, readiness, idempotency, the cycle transition, the harvest record, and the event in one transaction.
- AI use suggestions run after the harvest event is stored. Provider failure cannot lose the harvest and returns authored fallback ideas.
- Suggestions are limited to 3 to 5 short use ideas. Full recipes and health claims are outside scope.
- Harvest photos are optional, private, and stored in the existing private cycle-photo bucket with a cycle-scoped path.
- The Private Garden is a personal archive only. Its model can support future sharing without exposing records now.
- Notification permission is requested only when the user enables reminders. Existing permission may be synchronized silently at app start.
- Notifications represent authored next actions only. There are no generic engagement messages.
- Development defaults are daily frequency with quiet hours from 21:00 to 08:00. Users can disable reminders or choose a quieter frequency.
- Expo Push is the delivery provider for the Expo React Native client. Native notification support requires a rebuilt development APK.
- The database cron dispatcher is deliberately simple for the initial product stage. Receipt reconciliation and retry processing are deferred and recorded as limitations.
