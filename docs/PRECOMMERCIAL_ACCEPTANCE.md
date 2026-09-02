# Pre-commercial Android acceptance build

This is the final private demonstration stage before client-owned commercial services are connected. It uses the real Seednergy application, Supabase backend, Google sign-in, authored content, deterministic cycle engine, private storage and live server-side AI photo checks.

The acceptance APK is self-contained. It does not need Metro, PowerShell or the development client after installation.

Preview builds automatically maintain one separate harvest-ready Cress cycle when no other active cycle is ready. This private acceptance-only fixture is disabled in production and remains available until the prelaunch visual and harvest testing period ends.

## Acceptance path

Use a fresh account or sign out before beginning.

1. Open the app and confirm the welcome screen appears.
2. Complete onboarding and use Google sign-in.
3. Start the free Cress cycle.
4. Confirm Home shows the current day, stage, next action and progress.
5. Mark a due action complete, close the app, reopen it and confirm the state persists.
6. Open the cycle and complete an AI photo check with a clear plant photograph.
7. Confirm unclear or failed checks explain what to do and do not mutate cycle state.
8. Follow the real cycle to harvest. Development time simulation is intentionally absent from this build.
9. Mark the cycle harvested, with and without an optional photo.
10. Open the Private Garden and confirm only the completed harvest is shown with a stable layout.
11. Open a premium seed, select View premium access, and confirm the preview explains the commercial boundary without taking payment.
12. Open Profile, Notifications and confirm the app explains that push delivery comes with the release build rather than showing a Firebase error.
13. Log out, sign in with Google again and confirm the account history returns.
14. Verify account deletion separately with a disposable account only.

## Expected monitoring

- Normal navigation must not create a Sentry issue.
- A provider or network failure should show a bounded error state, not a blank screen.
- Sentry must not contain plant photographs, access tokens, passwords or raw personal content.

## Not part of this acceptance build

- Email sign-up and password recovery, pending reliable production email delivery
- Apple sign-in and signed iOS distribution
- RevenueCat, StoreKit, Play Billing, purchase restoration and entitlement webhooks
- Firebase or Apple production push delivery
- App Store Connect, Google Play Console submission and public store listings
- Approved legal URLs, final retention policy and production artwork
- CMS, community, public Garden, gamification and localisation

These are deferred integrations, not simulated successes. The premium screen is a presentation boundary only and cannot create access.

## Build command

```text
npx eas-cli build --platform android --profile preview
```

The preview profile fixes development routes, email authentication, payments and push delivery to off. Enabling any of them requires a new verified build and the corresponding provider setup.
