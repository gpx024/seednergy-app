# Stage 11 privacy and monitoring verification

## Before the consolidated APK

- Keep `privacy_configuration.check_photo_retention_days` null until the legal retention period is approved.
- A retention dry run may be invoked with an authenticated operator secret and `{ "dryRun": true, "retentionDays": 90 }`. The number is an input for simulation only. It does not save a policy, set expiry dates or delete records or files.
- Confirm the preview EAS environment has `EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION=true`, a Sentry DSN, and a sensitive `SENTRY_AUTH_TOKEN`.
- Production must keep `EXPO_PUBLIC_ENABLE_MONITORING_VERIFICATION=false`.

## Consolidated APK checks

1. Open Profile, Account and privacy, Monitoring verification.
2. Send one test event and copy the returned event ID.
3. In Sentry, find that event ID and confirm its environment is `preview` and the stack points to the TypeScript source, not only a minified bundle line.
4. Confirm the event contains no user, request, email, token, password, photo URI, image payload or arbitrary extra data.
5. Use Test native crash, confirm the warning, reopen the app, and confirm the native crash is symbolicated in Sentry.
6. Create a disposable user with at least one check photo and one harvest photo.
7. Delete the account in the app.
8. Confirm the response succeeds, the Auth user is gone, profile and owned rows are gone, and Storage has no object under the deleted user's prefix.
9. Confirm the matching `account_deletion_audits` row is completed and contains counts and booleans only, with no user identifier or file path.

## Still blocked on external decisions

- Approved Privacy Policy, Terms and support URLs.
- Approved photo retention period and scheduled deletion activation.
- Secret rotation confirmation.
- Physical-device Sentry verification cannot be completed until the consolidated APK is installed.
