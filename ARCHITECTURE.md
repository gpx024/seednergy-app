# Seednergy implementation architecture

This document records the implemented architecture. The Notion build blueprint remains authoritative for product scope and stage ordering.

## Layers

- `app/` contains Expo Router screens and route composition.
- `src/domain/` contains deterministic cycle, harvest, stage, content, and photo-check rules.
- `src/application/` derives user-facing state from domain objects.
- `src/ports/` defines repository, storage, AI, notification, and authentication boundaries.
- `src/infrastructure/` contains Supabase, Expo, storage, and provider adapters.
- `src/presentation/` owns resource hooks and provider state.
- `src/ui/` contains reusable components and design tokens.
- `supabase/migrations/` is the numbered database history for a fresh project.
- `supabase/functions/` contains server-side AI calls. Provider secrets never enter the mobile bundle.

## Runtime flow

The mobile app authenticates with Supabase using the publishable key. Row Level Security restricts private records to their owner. Sensitive mutations use authenticated security-definer RPCs that derive ownership and important cycle state on the server.

Cycle state is computed from an immutable seed content version, cycle start date, timezone, authored stages, and append-only events. AI photo checks may advise, but cannot mutate cycle state. Harvest completion is an explicit user command. The database records the harvest event atomically before the Edge Function generates optional post-harvest ideas.

Harvest photos use the private `cycle-photos` bucket under a user and cycle scoped path. The UI receives short-lived signed URLs. The Private Garden reads only the signed-in user’s harvest rows.

Notifications are created only from authored cycle actions. The server applies preference frequency and quiet hours, stores a cycle deep link, and queues due messages through Expo Push. Opening a notification routes to `/cycle/<cycle-id>`.

## Trust boundaries

- Public app configuration: Supabase URL, publishable key, feature flags, Expo project ID.
- Server-only secrets: Supabase service-role key, OpenAI API key.
- Server authority: ownership, quota, cycle state changes, harvest completion, notification scheduling.
- Client authority: user intent, photo selection, presentation, navigation, notification permission request.

## Stage 9 scope boundary

Included: harvest readiness, explicit harvest completion, post-harvest suggestions, optional private photo, Private Garden history, push preferences, quiet hours, and cycle deep links.

Excluded: public sharing, community, payments, recipes, commerce, gamification, CMS tooling, and Apple production credentials.

