# Stage 12 store submission handoff

This document records what the current Seednergy build does. It is a technical preparation aid, not approved legal advice and not a substitute for the account owner's review in App Store Connect or Google Play Console.

## Build identity

- App name: Seednergy
- Expo slug: `seednergy`
- iOS bundle identifier: `com.seednergy.app`
- Android package: `com.seednergy.app`
- Public version: `0.1.0`
- iOS build number: `1`
- Android version code: `1`
- Orientation: portrait
- Age-rating position: no mature content is implemented. The account owner must still complete each store's questionnaire.

## Build profiles

- `development`: internal Android APK with Expo developer tools. It requires a Metro server and is never submitted to a store.
- `preview`: self-contained internal build. Android outputs an APK for direct device testing. A preview build is the correct place to verify the native splash screen.
- `production`: store build. Android outputs an AAB. iOS outputs a signed archive when Apple credentials are available.

Before building `preview` or `production`, configure their public environment values in EAS. Never add the Supabase service-role key, OpenAI key, Sentry auth token, Google OAuth secret, Apple private key, Firebase service-account JSON, or any other secret to an `EXPO_PUBLIC_` variable.

The current preview is intentionally pre-commercial. Its checked-in feature boundary disables development routes, email authentication, payments and production push delivery. Store-owned integrations will be enabled only in a later verified build after the client accounts are available.

## Permission purpose strings

- Camera: "Seednergy uses the camera so you can photograph your active grow cycle."
- Photos: "Seednergy uses your selected plant photos for cycle-specific growth checks."
- Microphone: disabled.
- Notifications: optional cycle-action reminders. Android Firebase Cloud Messaging and Apple push credentials are not yet configured.
- Location, contacts, calendar, Bluetooth, health, advertising ID and microphone are not requested by the implemented application.

## Current data inventory

The final declarations must include Seednergy's own handling and every integrated third-party SDK or service.

| Data or activity | Why it is used | Linked to account | Current processor or destination |
| --- | --- | --- | --- |
| Email address and authentication identifier | Account creation, login and account recovery | Yes | Supabase Auth, Google OAuth when selected |
| Optional display name | Personalised greeting and profile | Yes | Supabase |
| Growing preferences, time availability, light/environment selection and timezone | Tailoring authored guidance and cycle timing | Yes | Supabase |
| Cycle actions, progress, checks and harvest history | Core app functionality and Private Garden | Yes | Supabase |
| Plant photographs selected or captured by the user | Private growth checks and optional harvest record | Yes | Private Supabase Storage; check photos may be sent to the configured OpenAI model for analysis |
| Push token and notification preferences | Optional cycle-action notifications | Yes | Supabase and Expo Push Service when notifications are configured |
| In-app product events | Operational product analytics without advertising | Yes, by account identifier | Supabase |
| Crash and diagnostic information | Reliability monitoring | Potentially linked through a pseudonymous account identifier and technical identifiers | Sentry; enabled with default PII, Logs, Session Replay, User Feedback and performance tracing disabled |

No payment information, contacts, precise or approximate device location, health data, browsing history, advertising profile or public Garden content is implemented. The app does not currently sell data or use it for third-party advertising. These statements must be rechecked whenever SDKs or features change.

## Apple App Privacy draft mapping

Review these proposed categories against the final live build and the current App Store Connect questions:

- Contact Info: Email Address, app functionality and account management, linked to the user, not used for tracking.
- User Content: Photos or Videos and Other User Content, app functionality, linked to the user, not used for tracking.
- Identifiers: User ID, app functionality and account management, linked to the user, not used for tracking.
- Usage Data: Product Interaction, analytics and app functionality, linked to the user, not used for tracking.
- Diagnostics: Crash Data and Performance Data only if Sentry is enabled, app functionality/analytics, review linkage using Sentry's final configuration, not used for tracking.
- Other Data: growing preferences and cycle records may need Other User Content or Other Data depending on the current questionnaire wording.

Required external inputs: approved public privacy-policy URL, an Apple Developer organisation account, App Store Connect access, Apple signing credentials, final disclosure approval and TestFlight testers.

## Google Play Data Safety draft mapping

Review these proposed categories against the final live build and the current Play Console form:

- Personal info: email address, user IDs and optional name, collected for account management and app functionality.
- Photos and videos: optional plant photos, collected for app functionality.
- App activity: app interactions and other user-generated content, collected for app functionality and operational analytics.
- App info and performance: crash logs and diagnostics only when Sentry is enabled.
- Data is encrypted in transit by the configured HTTPS services.
- Account deletion is available in-app under Profile, Account and privacy.
- No advertising or cross-app tracking is implemented.

Do not mark data as "not collected" merely because a feature is optional. Google requires disclosure when data is transmitted off device, including transmission by integrated SDKs. The owner must verify whether each processor qualifies as a service provider or sharing under the current form.

Required external inputs: approved public privacy-policy URL, client-owned Play Console account and verification, completed Data Safety approval, content-rating questionnaire, store listing copy/screenshots, and internal-testing testers.

## Release checklist

- [x] Approved Seednergy mark used for app icon and splash asset.
- [x] Android adaptive icon configured on stone `#efe9dc`.
- [x] Preview and production EAS profiles configured.
- [x] Camera and photo purpose strings configured; microphone disabled.
- [ ] Replace temporary seed and profile photography with approved production artwork.
- [ ] Approve horticultural content and the photo-retention period.
- [ ] Publish approved Privacy Policy, Terms of Service and support pages.
- [x] Configure client-owned Sentry with default PII, Logs, Session Replay, User Feedback and performance tracing disabled.
- [ ] Verify a test crash and readable source map in a new preview build, then approve the diagnostic disclosure.
- [ ] Configure Firebase/FCM and Apple push credentials, then re-audit notification disclosures.
- [ ] Build and test a self-contained Android preview APK on the Pixel.
- [ ] Create and upload an Android production AAB to Play internal testing.
- [ ] Complete Apple Developer enrolment and signing.
- [ ] Build and install the iOS preview on a real iPhone.
- [ ] Upload the iOS production build to TestFlight.
- [ ] Complete both store privacy, age-rating and content questionnaires.
- [ ] Capture final store screenshots from signed release candidates.

## Commands

```text
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile production
```

Production submission commands should only run after the corresponding app records and legal metadata exist:

```text
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```
