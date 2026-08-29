# Product analytics event matrix

Seednergy records only the allowlisted event and property names below. The database function rejects every other event, property, oversized payload and unauthenticated request.

| Event | Trigger | Allowed properties |
| --- | --- | --- |
| `app_opened` | Authenticated app session starts | None |
| `onboarding_completed` | First-cycle onboarding completes | None |
| `cycle_started` | A cycle is created | `seed_slug`, `source` |
| `cycle_action_completed` | The current care action is marked complete | `cycle_day`, `seed_slug` |
| `photo_check_started` | A check photo is submitted | `cycle_day`, `seed_slug` |
| `photo_check_completed` | A photo check returns | `status`, `cycle_day`, `seed_slug` |
| `harvest_completed` | A cycle is harvested | None |
| `garden_opened` | Garden is opened | None |
| `notification_preference_changed` | Notification preference changes | `status` |
| `account_deletion_requested` | Confirmed deletion begins | None |

Never add email, display name, user-entered text, tokens, passwords, photo data, photo paths, signed URLs or location to analytics properties.

The CMS dashboard reads aggregated active-seed, draft, active-cycle, completed-cycle, user, AI-request, AI-cost and seed-popularity metrics. It does not expose the per-user analytics event table.
