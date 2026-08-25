# Seed content authoring before the CMS

Seednergy reads seed content from Supabase. The mobile application does not contain the catalogue or growing instructions. The Stage 14 CMS will write to the same model.

## Current workflow

1. Open the client-owned Supabase project.
2. Use **Table Editor → seeds** to duplicate a reviewed seed row.
3. Give the new seed a unique `slug`, new UUID, correct access type and a higher `content_version` when replacing published content.
4. Keep `active` off while authoring.
5. Add ordered rows in **seed_stages**. Days must start at 1 and contain no gaps or overlaps.
6. Add an image descriptor to `images`. Temporary bundled images use `{ "kind": "bundled", "key": "cress" }`. CMS-hosted images use `{ "kind": "remote", "url": "https://…" }`.
7. Set `content_review_status` to `grower_reviewed` only after an identified grower has checked the guidance.
8. Turn `active` on. The seed then appears in Explore without an application change or store release.

## Required launch-seed fields

- Name, botanical name, description and expected result
- Minimum and maximum duration, difficulty, environment and light summary
- Materials, harvest instructions, harvest readiness, storage and taste profile
- Access type, content version, image and source URLs
- At least one contiguous stage, including an explicit harvest-ready stage
- Per stage: guidance, next action, observation, milestone, good-state description and common problems

`coming_soon` rows may omit stages and images because they cannot start a cycle.

## Review warning

The Stage 5 launch content is a researched draft. Its source URLs are stored in `content_sources`, but sources do not replace crop testing or review by an experienced grower. Do not change `content_review_status` merely because the text reads plausibly.

