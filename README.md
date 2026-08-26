# Seednergy app

Expo React Native application for Seednergy’s guided seed-to-harvest experience. The current implementation covers onboarding, Supabase authentication, authored seed content, the grow-cycle engine, AI-assisted private photo checks, harvest completion, a Private Garden, action-based push notification scheduling, Stage 11 privacy controls, and Stage 12 store-build preparation.

The product and technical source of truth is the Notion page **Seednergy Build Blueprint Codex**. Local documents describe the implemented system and operational handover, they do not replace the blueprint.

## Requirements

- Node.js 20 or newer
- npm
- Git
- An Expo account for Android development builds
- A linked Supabase project
- A physical Android or iOS device for push notification testing

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the public Supabase URL and publishable key. Never add service-role or OpenAI keys to the app environment.
3. Install dependencies with `npm install`.
4. Start the development server with `npx expo start --dev-client --lan --clear`.
5. Open the installed Seednergy development build and scan the QR code.

If LAN access is unavailable, use `npx expo start --dev-client --tunnel --clear`. The development server must remain running while testing a development build.

## Quality checks

```text
npm run typecheck
npm run lint
npm test
npx expo export --platform android
npx supabase db lint --linked --level error
```

## Backend deployment

```text
npx supabase db push --dry-run
npx supabase db push
npx supabase functions deploy photo-check
npx supabase functions deploy harvest-suggestions
npx supabase functions deploy delete-account
npx supabase functions deploy photo-retention
```

Set `OPENAI_API_KEY` and `OPENAI_MODEL` as Supabase Edge Function secrets. They must never be exposed through an `EXPO_PUBLIC_` variable.

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Environment and runbook](./docs/ENVIRONMENT.md)
- [Decision log](./docs/DECISIONS.md)
- [Known limitations](./docs/KNOWN_LIMITATIONS.md)
- [Stage 8 AI evaluation](./docs/AI_EVALUATION_STAGE8.md)
- [Seed content authoring](./docs/SEED_CONTENT_AUTHORING.md)
- [Stage 12 store submission handoff](./docs/STORE_SUBMISSION_STAGE12.md)
