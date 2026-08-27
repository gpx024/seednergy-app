# Seednergy Codex Instructions

This repository is the Seednergy application project. The local project path is:

`C:\Users\gerar\Codex\seednergy-app`

The product and technical source of truth is the Notion document **Seednergy Build Blueprint Codex**:

https://app.notion.com/p/3b6bdea3223481278b4dffef6dcc8df8

Read this file first, then read the relevant stage of the Notion blueprint before editing. Do not create or use `CLAUDE.md` in this repository.

## Operating rules

1. Work on one numbered stage at a time. Do not build the whole application in one request.
2. Inspect the existing repository before editing.
3. State the intended files, requirement IDs, assumptions and risks before making changes.
4. Preserve all completed stages. Do not replace working code with a new architecture without an explicit decision.
5. Keep product logic out of React screens. Screens render state and send intents.
6. Keep the grow-cycle engine deterministic and independent of AI, network and UI code.
7. Keep provider integrations behind interfaces. This includes AI, storage, payments, notifications and analytics.
8. Never put API keys, service-role keys, payment secrets or provider credentials in the mobile application.
9. Use typed contracts and runtime validation at application and API boundaries.
10. Treat every item marked OPEN in the blueprint as unresolved. Do not guess a production policy.
11. Do not add Public Garden functionality, community data, sharing, gamification, chat, open-ended AI chat or recipe generation before the blueprint permits it. A non-functional Public Garden "Coming soon" surface is permitted by the 2026-08-27 decision log.
12. Do not write legal, privacy, subscription or horticultural content as if it were approved. Flag it for review.

## Required workflow for every stage

Before coding:

- Read the relevant blueprint stage and requirement IDs.
- Inspect the current repository and existing tests.
- Explain the smallest complete vertical slice for this stage.
- List files to change and any schema, migration or environment changes.

After coding:

- Run typecheck.
- Run lint.
- Run targeted tests and the full relevant test suite.
- Manually verify the stage acceptance path.
- Report changed files, commands and results.
- Report known limitations, deferred work and new environment variable names without values.
- Create a Git commit for the completed stage when the user requests implementation.

## Architecture rules

- Mobile: React Native, Expo and TypeScript strict mode.
- Backend: Supabase Postgres, Auth, Storage and Edge Functions unless a later decision changes this.
- Layers: presentation, application, domain and infrastructure.
- Domain code must not import React, Expo, network clients, database clients or storage clients.
- Demo and production providers must implement the same interfaces.
- Demo mode may use deterministic fixtures. It must never be presented as validated live AI.
- AI must not mutate cycle state. Only explicit domain rules and user actions may do that.
- Use append-only cycle events from the cycle implementation stage so later community and gamification features can build on real product events.
- Use versioned seed content so a content change does not unexpectedly rewrite an active cycle.

## AI and privacy rules

- AI calls happen server-side only.
- The v1 approach uses a multimodal LLM for plant guidance. Pl@ntNet is not part of v1 unless an explicit decision reintroduces it.
- Return confidence and uncertainty honestly.
- Unclear, irrelevant or rejected photos do not consume the user's allowance.
- Never log raw uploaded photos, secrets or unnecessary personal data.
- Photo retention and account deletion behaviour must follow the approved legal policy.
- Do not claim that a simulated result is a proof that the production AI works.

## Scope guardrails

The public launch baseline is the four-seed scope in the blueprint: Cress, Pea shoots, Radish microgreens and Broccoli microgreens, subject to the latest approved decision log. Cress is free. Other access rules must come from the blueprint, not invention in code.

The first release has four main tabs: Home, Cycles, Explore and Garden. Profile remains accessible from the raised avatar on Home. Garden contains the implemented Private Garden and may show Public Garden only as a non-functional "Coming soon" state. Public sharing, community data and gamification are later extensions.

The repository must remain runnable after every stage. If a requested change conflicts with this file or the Notion blueprint, stop and identify the conflict before editing.
