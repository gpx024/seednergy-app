# Implementation decision log

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

