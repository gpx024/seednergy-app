# Seednergy app — handoff to Claude Code

## What's here
| File | What it is |
|---|---|
| `tokens.css` | Literal design values + composed component recipes. The source of truth. |
| `DESIGN-SYSTEM.md` | The rules behind the values, and the seven non-negotiables. |
| `SCREEN-MAP.md` | 14 layout patterns, and all 75 screens mapped to a pattern. |
| `../Seednergy Design System Final.dc.html` | The living reference — component gallery, five built flow screens, and a built reference screen for all 14 layout patterns. Open it to see the relief rendered. |
| `../uploads/01–14.png` | Original screen layouts. **Content and flow reference only** — they predate the v4 visual system. |

## How to brief Claude Code

> Build the Seednergy mobile app. `handoff/tokens.css` is the design source of truth — use those variables and recipes literally; never invent a colour, shadow, radius or type size that isn't in it. Read `handoff/DESIGN-SYSTEM.md` before writing any UI, and hold the seven non-negotiables in §7. `handoff/SCREEN-MAP.md` lists every screen and the pattern it uses; build patterns P1, P4, P5 and P6 first, since they cover 45 of the 75 screens. The PNGs in `uploads/` show content and flow only — take structure and copy from them and all styling from the design system. Start with the onboarding flow.

## The two things that go wrong
**Soft shadows.** Default shadow instincts produce wide, faded blurs. This system is offset ≈ blur, plus a 1.5px near-zero-blur bevel. If it looks like a soft glow, it's wrong.

**An unapproved background colour.** The screen ground is `#EEECE7`, raised volume is `#F3F1EC`, and tab cells use only their approved active and inactive tones. Do not introduce another ground or card fill.

## Not in this handoff yet
- Real app photography (cool-neutral grade — see DESIGN-SYSTEM §5). All imagery in the reference is placeholder.
- Dark mode.
- Marketing/social photography direction — a separate content system, deliberately not in the app system.
