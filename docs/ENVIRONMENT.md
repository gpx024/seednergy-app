# Environment and operations runbook

## Mobile environment

Create `.env.local` from `.env.example` and provide:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_ENABLE_DEV_ROUTES`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_ENABLE_APPLE_AUTH`
- `EXPO_PUBLIC_PHOTO_CHECK_PROVIDER`
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- `EXPO_PUBLIC_TERMS_URL`
- `EXPO_PUBLIC_SUPPORT_URL`
- `EXPO_PUBLIC_SENTRY_DSN`

These values are included in the application bundle and must not contain secrets.

## Supabase secrets

Configure in Supabase Edge Function secrets:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, currently a compatible low-cost model selected for development
- `PHOTO_RETENTION_JOB_SECRET`, generated during Stage 11 and used only to authenticate the retention job

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Do not copy the service-role key into `.env.local`.

## Start the development build

```text
cd C:\Users\gerar\Codex\seednergy-app
npx expo start --dev-client --lan --clear
```

The phone and laptop must be on the same network. If LAN routing is blocked:

```text
npx expo start --dev-client --tunnel --clear
```

The app installed from a development APK needs this server while developing. A production or preview build bundles the JavaScript and does not need the laptop server.

## Create a new Android development APK

Native package changes, including `expo-notifications`, require a new development build:

```text
npx eas build --platform android --profile development
```

Download and install the APK from the Expo build page, then reconnect it to the local Expo development server.

## Supabase deployment

Review migration scope first:

```text
npx supabase db push --dry-run
npx supabase db lint --linked --level error
```

Apply and deploy:

```text
npx supabase db push
npx supabase functions deploy photo-check
npx supabase functions deploy harvest-suggestions
npx supabase functions deploy delete-account
npx supabase functions deploy photo-retention
```

## Stage 11 privacy operations

- Account deletion runs through the `delete-account` Edge Function. It authenticates the current user, recursively removes all objects below that user’s private storage prefix, verifies the prefix is empty, deletes owned database rows in dependency order, then deletes the Supabase Auth user.
- Photo retention runs through the `photo-retention` Edge Function and writes every attempt to `privacy_job_runs`.
- The retention job is intentionally `skipped_unconfigured` while `privacy_configuration.check_photo_retention_days` is null. Do not set the proposed 90-day value until the legal policy is approved.
- Once approved, update the configuration value and schedule a daily authenticated POST to the function. The `PHOTO_RETENTION_JOB_SECRET` value must remain server-side.

## Sentry

The client-owned Sentry project is `seednergy/seednergy-app`. Add its public DSN as `EXPO_PUBLIC_SENTRY_DSN`. Store `SENTRY_AUTH_TOKEN` as a secret EAS environment variable for source-map uploads, never in Git. Logs, Session Replay, User Feedback, default PII collection and performance tracing are disabled. Adding `@sentry/react-native` changes native code, so install a new development or preview APK before testing Sentry.

## Notification test

Before the first Android push test, configure Firebase Cloud Messaging under the client-owned Google account:

1. Open Firebase Console and add Firebase to the existing client-owned Google Cloud project, or create a client-owned Firebase project.
2. Register an Android app with package name `com.seednergy.app`.
3. Download `google-services.json`, place it at the repository path agreed for environment files, and configure `expo.android.googleServicesFile` in `app.json`.
4. Create an FCM v1 service-account key in Firebase.
5. Run `npx eas-cli credentials --platform android` and upload the FCM v1 key under Android push notification credentials.
6. Build a new development APK after `google-services.json` is configured.

Do not reuse a personal Firebase project for client production ownership. Keep the service-account JSON out of Git and treat it as a credential.

1. Install the new development APK containing `expo-notifications`.
2. Log in on a physical phone.
3. Open Profile, Notifications.
4. Enable notifications and accept the system permission prompt.
5. Choose a frequency and save.
6. Complete a due action. Confirm a pending notification exists in Supabase for that cycle and is outside quiet hours.
7. When it arrives, tap it and confirm the correct cycle opens.

## Secret hygiene

Do not commit `.env.local`, API keys, service-role keys, OAuth client secrets, exported user data, or private photos. Rotate a credential immediately if it appears in Git history, logs, screenshots, or chat.
