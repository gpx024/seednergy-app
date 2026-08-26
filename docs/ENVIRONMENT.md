# Environment and operations runbook

## Mobile environment

Create `.env.local` from `.env.example` and provide:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_ENABLE_DEV_ROUTES`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_ENABLE_APPLE_AUTH`
- `EXPO_PUBLIC_PHOTO_CHECK_PROVIDER`

These values are included in the application bundle and must not contain secrets.

## Supabase secrets

Configure in Supabase Edge Function secrets:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, currently a compatible low-cost model selected for development

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
```

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
