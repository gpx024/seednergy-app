# Seednergy Mobile Design System, September 2026 final visual pass
Binding visual spec for the Seednergy app. Companion files: `tokens.css` (literal values), `SCREEN-MAP.md` (what to build).

**Fonts:** Crimson Text (600, 400 italic) + Inter (400/500/600). Google Fonts.
**Frame:** 390 × 844.

---

## 1. The surfacing rule

The app is one material at two tones. The screen **ground** is `#EEECE7`; every **raised surface** is `#F3F1EC`, one step lighter. That single step separates layer one from the canvas while preserving the one-material idea. There are no borders and no unapproved surface fills. Depth comes from light.

Two consequences to hold onto:

**Everything is raised, with two purposeful exceptions.** Text inputs sit inset on a near-white fill (`--sd-input`), because a field has to look like it receives. The selected bottom-navigation cell is also inset, because it represents the current pressed location. All other cards, filters, pills and the navigation bar itself are raised.

**Two layers.** Canvas is the ground and raised volume is the card. The **second layer, a panel nested inside a card, uses highlight `#70484A` with raised-surface type `#F3F1EC`**. Keep panel body copy at 13px+ and headlines in Crimson at 16px+. It is the strongest block on the screen, so it is reserved for the coach's voice and next action, with at most one per card.

**App relief stops at the app.** OS chrome — status bar, system keyboard — is never given the relief treatment. A bevelled keyboard reads as a toy.

**Everything is bevelled.** Each raised element carries two inner shadows under its outer pair: a bright lip top-left, a warm lip bottom-right, at 1.5px with ~1px blur. Near-zero blur is the point — the edge reads as a machined lip, not a soft glow. Outer shadows are tight too: **offset ≈ blur**. Never a wide, faded shadow.

```
box-shadow: var(--sd-raise-md), var(--sd-bevel);
```

Pressed feedback: soften the outer shadow one step down the scale and keep the bevel. The selected navigation cell is the sole persistent inset state.

**Minimum 14px between raised elements** — below that the shadows collide and the relief turns to mud.

## 2. Colour

The approved palette below is binding. Additional states must be derived from these colours instead of introducing legacy hexes.

Uppercase section labels and sub-navigation use **olive `#6D7A38`**. Idle progress labels use `#6A6960`, while the current stage uses seed `#504B24`.

| Token | Hex | Owns |
|---|---|---|
| background | `#EEECE7` | main screen ground |
| raised | `#F3F1EC` | every raised card, chip, field and light-on-dark label |
| brand | `#472C2A` | Seednergy wordmark, body anchor and special dark pages |
| olive | `#6D7A38` | city and temperature, progress, on-track state and primary button |
| seed | `#504B24` | seed names and current progress-stage text |
| accent | `#A66C6F` | growth-stage subtitle and supporting accent text |
| progress text | `#6A6960` | idle stage labels such as Set up and Harvest |
| highlight | `#70484A` | coach and next-action panel |
| coach label / active tab | `#DCDAD5` | Your coach text and inset current tab ground |
| inactive tab surface | `#E5E3DE` | raised navigation bar ground |
| active tab content | `#846967` | current tab icon and label |
| alert | `#A64032` | needs-check alerts only |

**Division of labour, strictly:** olive is action, progress and positive status. Highlight is the coach voice. Brand is the dark anchor and special-screen ground. Never show two filled buttons of equal weight on one screen.

**Status is a raised pill.** On track uses the raised surface with olive text, needs check uses alert, and archived uses the plain raised fill. All statuses carry the same relief so colour remains meaningful.

## 3. Type

Crimson Text carries all **named and actionable** text: screen titles, card names, button labels, panel headlines, stat values. Inter carries **body copy, captions, uppercase labels and sub-navigation** (filter tabs, stage selector, tab bar).

| Role | Font | Size |
|---|---|---|
| display/lg | Crimson 600 | 32/44.8, brand or accent according to hierarchy |
| screen title | Crimson 600 | 28/36, brand |
| display/md | Crimson 600 | 24/33.6, brand or accent according to hierarchy |
| card name | Crimson 600 | 20/28, **seed** |
| list row name | Crimson 600 | 18/25.2, **seed** |
| inverted headline | Crimson 600 | 36/50.4, cream, the achievement rather than the status |
| title | Crimson 600 | 24/33.6, ink |
| compact data value | Crimson 600 | 16/22.4, seed |
| panel headline | Crimson 600 | 18/25.2, ink |
| button | Crimson **700** | 18/25.2 |
| body | Inter 400 | 14/20, ink 82% |
| caption | Inter 400 | 12/16, ink 64% |
| label | Inter **700** | 10.5–11, .12em, caps, **olive** (raised colour on a highlight panel) |
| tab / segment | Inter 500–600 | 10.5 |

Crimson runs ~2px larger than the Inter it replaces, to match x-height. Never Crimson below 16px. Never Inter above 20px.

## 4. Space, radius, icons

4pt base. Screen gutter 20 · card padding 16 · gap between raised cards **14 minimum** · section gap 24.

Sub-navigation keeps a 48px accessible touch target, but its painted selected pill is only 32px high with 12px horizontal padding. Never paint the full touch target as the highlight.

Radius: chip 12 · field 16 · card 20 · media 26 · screen 40 · pill 999.

Icons: 21px, **stroke 2.15**, round caps and joins, no fills, `currentColor`. 24px for standalone actions (back, close, more), 16px inline with text. Sole exception: the 28–32px confirmation check is a display glyph at stroke 2.3.

Canonical pre-commercial tab set: **house · cycle (clock-arrow) · magnifier · leaf**. The fourth item is Garden, where Private Garden is operational and Public Garden is explicitly coming soon. Profile is reached through the top-right avatar or brand-mark action, so it is not duplicated in the tab bar.

## 4b. The cycle gauge and the cycle row

**Cycle progress is never a bar.** It is the logo's oval, filling clockwise from the top in olive, with the day count inside. Two sizes only: **44×69** as the compact hero anchor on Home, **38×60** at the end of a list row.

```
<svg viewBox="0 0 62 100">
  <rect x="3.5" y="3.5" width="55" height="93" rx="27.5" class="sd-gauge__track"/>
  <rect x="3.5" y="3.5" width="55" height="93" rx="27.5" class="sd-gauge__fill"
        stroke-dashoffset="{{ 250 * (1 - pct) }}"/>
</svg>
```

`stroke-dasharray: 250` on the fill; `stroke-dashoffset` is `250 × (1 − pct)`. The 44×69 variant uses stroke-width 5 and dasharray 252. Do not rotate the rect, the path already starts at the top.

Why it matters: the brand concept is The Living Cycle, and this puts it in the component a user looks at most. It also reads faster than a bar, because the number and the arc occupy one place.

**Rank progress stays a bar** (`.sd-track`). A rank is not a cycle; spending the oval on points would dilute the one place it means something.

**The cycle row** puts the photo **flush to the card edge** — the row is `padding: 0; overflow: hidden; align-items: stretch`, and the photo is a 98px full-height column with no radius of its own. Name, meta and status pill stack in the middle; the gauge sits at the right with 16px of margin. Never pad the photo back in.

## 4c. The tab bar

No divider line. The whole bar is one raised block on `#E5E3DE`. The **active cell** is inset and slightly darker on `#DCDAD5`, with the same 20px bevel radius as a card. It fills the cell while retaining a 4px reveal of the raised bar. Active icon and label use `#846967`; inactive icon and label use brand `#472C2A`.

**Inverted screens carry no tab bar at all.** See §6.

## 5. Imagery — app

The app's photography has a different job from the marketing photography, and the two must not be swapped.

In-app, a photo exists so a grower can **compare it to their own tray**. So:

- Plant-forward: the plant fills 60–70% of frame, background dissolved.
- **Cool-neutral grade.** Warm-cream photography has nowhere to separate from a stone UI — photo and interface merge into one hazy field. Green needs to cut against the stone.
- Sharp on the subject, shallow depth behind.
- Photos sit in a raised, bevelled frame with 6px of surface around them; the image itself sits slightly proud. The mat is what makes them feel physical.
- Circle crop only for the completion moment, with the confirmation badge overlapping bottom-right.
- Never bleed to the screen edge — except behind a camera viewfinder.

Marketing photography (warm, editorial, hands-in-soil, window light) belongs to a separate content system and must not be used in-app.

## 6. The inverted ground — moment screens

To break the monotony of a single-colour app, **moment screens invert to a palette dark**. Harvest completion uses seed `#504B24`; commercial and account moments may use brand `#472C2A`. Raised cards stay `#F3F1EC`, type uses `#EEECE7`, and relief is recast for the dark ground (`--sd-inv-*`).

Three rules for an inverted screen:

**No tab bar.** This is the clean distinction across the app: light screens are places you navigate, dark brand screens are moments you pass through. A nav bar would say "you're still browsing" at exactly the moment the design is trying to interrupt.

**A dismiss affordance top-left** — a plain cream cross, no relief — so the screen can be revisited from history without becoming a dead end. The primary and text buttons are the real exits.

**The achievement leads, the status labels.** On cycle complete, "You grew this." is the 38px Crimson headline and "Cycle complete" is a small accent kicker above it. Not the other way round.

On the completion screen the harvest photo takes **the logo's seed silhouette**, framed in raised stone. Four supplied three-dimensional growth-stage artworks orbit the photo at seed, germination, seedling and grown positions. This closes the visual loop opened by the cycle gauge without implying a user photo when none was saved.

Use it for, and only for: cycle complete · purchase success · the three paywalls · premium confirmation. Roughly one screen in ten. Ordinary screens never invert — it stops meaning anything if it's common.

## 7. Non-negotiables

1. Use `#EEECE7` for the ground, `#F3F1EC` for every raised surface, and `#70484A` for the nested coach panel. No borders or unapproved surface fills, except dividers inside a settings group.
2. Every element is raised and bevelled, except text inputs and the selected navigation cell, which are inset. OS chrome gets neither.
3. Offset ≈ blur. No wide soft shadows.
4. One primary (olive) button per screen. SSO and alternate actions may carry olive *labels*, never olive fills.
5. Accent `#A66C6F` supports hierarchy. The active tab uses `#846967`; the active filter and primary button use olive `#6D7A38`; the coach panel uses highlight `#70484A`.
5b. Cycle progress is the oval gauge, never a bar. Status is a filled pill, never a coloured word.
5c. Inverted screens use brand `#472C2A` and carry no tab bar.
6. Crimson for named/actionable, Inter for body/labels/sub-nav.
7. 14px minimum between raised elements.
8. The alert colour is `#A64032`, and it means "needs check" and nothing else. No amber, blue or unapproved hexes.
9. Olive `#6D7A38` owns action, progress and positive status. Seed `#504B24` owns plant names and the current stage.
