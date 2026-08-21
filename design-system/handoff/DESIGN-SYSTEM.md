# Seednergy — Mobile Design System v5
Binding visual spec for the Seednergy app. Companion files: `tokens.css` (literal values), `SCREEN-MAP.md` (what to build).

**Fonts:** Crimson Text (600, 400 italic) + Inter (400/500/600). Google Fonts.
**Frame:** 390 × 844.

---

## 1. The surfacing rule

The app is one material at two tones. The screen **ground** is `#E8E2D4` warm stone; every **raised surface** is `#EFEADF`, one step lighter. That single step is what lets layer one separate from the canvas without abandoning the one-material idea. There are still **no borders and no third fill**. Depth comes only from light.

Two consequences to hold onto:

**Everything is raised — with one exception.** Stage selectors, coach panels, pills: all raised. The single exception is **text inputs**, which sit inset on a near-white fill (`--sd-input`), because a field has to look like it receives. Nothing else in the app is inset.

**Two layers.** Canvas is the surface and the card. The **second layer — a panel nested inside a card — is terracotta with stone type**. It uses a deeper terracotta (`#b25f35`) than the titles, and full-alpha stone type only — never reduce the type's alpha on this fill. Contrast is 3.6:1, so keep panel body copy at 13px+ and headlines in Crimson at 16px+; this is a deliberate brand call over strict AA. It is the loudest thing on the screen, so it is reserved for the coach's voice and the next action, and there is at most one per card. Pills and chips stay canvas; sand is held back for photo mats and dividers.

**App relief stops at the app.** OS chrome — status bar, system keyboard — is never given the relief treatment. A bevelled keyboard reads as a toy.

**Everything is bevelled.** Each raised element carries two inner shadows under its outer pair: a bright lip top-left, a warm lip bottom-right, at 1.5px with ~1px blur. Near-zero blur is the point — the edge reads as a machined lip, not a soft glow. Outer shadows are tight too: **offset ≈ blur**. Never a wide, faded shadow.

```
box-shadow: var(--sd-raise-md), var(--sd-bevel);
```

Pressed feedback: soften the outer shadow one step down the scale and keep the bevel. Never invert it, never move the element.

**Minimum 14px between raised elements** — below that the shadows collide and the relief turns to mud.

## 2. Colour

Five brand hexes plus one utility fill for text entry. Greys are ink at reduced alpha so nothing goes cold against the stone. Alphas stay high — 82% for body, 64% for captions — because low-contrast type on a mid-tone stone ground fails fast.

Uppercase section labels and sub-navigation (filter tabs, idle segment items) take **olive-label `#5a5f2d`** rather than grey ink: it reads as structure, not as disabled text.

| Token | Hex | Owns |
|---|---|---|
| canvas | `#E8E2D4` | the screen **ground** only |
| card | `#EFEADF` | every **raised** surface — cards, pills, chips, segments, sheets |
| sand | `#d8d1c0` | photo mats, tab-bar ground |
| gauge-track | `#DCD5C4` | the cycle gauge's unfilled ring |
| input | `#FAF7F1` | text-entry fill (inset) — the only non-canvas surface |
| terracotta | `#cc8353` | light fill and the inverted-screen kicker. **Never carries text** — cream on it is 2.3:1 |
| terracotta-panel | `#b25f35` | nested second-layer panels (darker, for AA type contrast) |
| terracotta-text | `#b25f35` | terracotta **as type at UI scale** — tab labels, pills, step numbers, text buttons, small caps. `#cc8353` as type is for Crimson display ≥20px only (3.55:1 clears large-text, fails at UI scale) |
| olive | `#71763b` | the one primary button per screen, brand mark, completion badge, "new" and "harvested" status |
| sage | `#5C7F3F` | **growth only** — cycle-gauge fill, stage labels. Never a button, so action and progress never look alike |
| forest | `#2F3D28` | the **dark anchor** — inverted grounds, "on track" status, the active filter tab, every named item in a list |
| alert | `#9E3521` | "needs check" and nothing else. Its scarcity is what makes it work |
| stone | `#F7F5EE` | type on an olive, alert or terracotta fill |
| ink | `#2e2a24` | all body type, and inactive tab icons |
| olive-label | `#5a5f2d` | uppercase section labels, filter tabs, idle segment items |

**Division of labour, strictly:** olive is action and structure. Terracotta is voice and moment — roughly 5% of pixels. Never a terracotta filled button beside an olive one; never two filled buttons of equal weight on one screen.

**Status is a filled pill, never a coloured word on stone.** The fill *is* the state: forest for on track, olive for new and harvested, alert clay for needs check, and the plain card fill for archived. Type is always stone or canvas. All of them carry the same relief, so the fill is the only variable a user has to read. Exactly one terracotta-filled pill per screen, maximum.

## 3. Type

Crimson Text carries all **named and actionable** text: screen titles, card names, button labels, panel headlines, stat values. Inter carries **body copy, captions, uppercase labels and sub-navigation** (filter tabs, stage selector, tab bar).

| Role | Font | Size |
|---|---|---|
| display/lg | Crimson 600 | 30/34, terracotta |
| display/md | Crimson 600 | 25/29, terracotta |
| card name | Crimson 600 | 22/1.15, **forest** |
| list row name | Crimson 600 | 18/1.15, **forest** |
| inverted headline | Crimson 600 | 38/1.15, cream — the achievement, not the status |
| title | Crimson 600 | 19.5/24, ink |
| panel headline | Crimson 600 | 16.5/1.3, ink |
| button | Crimson **700** | 18/1 |
| body | Inter 400 | 14/20, ink 82% |
| caption | Inter 400 | 12/16, ink 64% |
| label | Inter **700** | 10.5–11, .12em, caps, **olive-label** (stone on a terracotta panel) |
| tab / segment | Inter 500–600 | 10.5 |

Crimson runs ~2px larger than the Inter it replaces, to match x-height. Never Crimson below 16px. Never Inter above 20px.

## 4. Space, radius, icons

4pt base. Screen gutter 20 · card padding 16 · gap between raised cards **14 minimum** · section gap 24.

Radius: chip 12 · field 16 · card 20 · media 26 · screen 40 · pill 999.

Icons: 21px, **stroke 2.15**, round caps and joins, no fills, `currentColor`. 24px for standalone actions (back, close, more), 16px inline with text. Sole exception: the 28–32px confirmation check is a display glyph at stroke 2.3.

Canonical tab set at launch: **house · cycle (clock-arrow) · magnifier · person** — four items. The sprout mark is brand-only and never an interface icon.

**The bar grows to five post-MVP.** The Garden (community) section is not in the MVP; when it ships it inserts a fifth tab between magnifier and person. Render the bar from an array rather than hardcoding cells, and give Garden a non-sprout glyph (outlined plot/grid, or people) at the same 21px / stroke 2.15. At 390px a five-item bar gives 78px cells — still well above the 44px minimum, so no layout change is needed.

## 4b. The cycle gauge and the cycle row

**Cycle progress is never a bar.** It is the logo's oval, filling clockwise from the top in sage, with the day count inside. Two sizes only: **52×82** as the hero anchor on Home, **38×60** at the end of a list row.

```
<svg viewBox="0 0 62 100">
  <rect x="3.5" y="3.5" width="55" height="93" rx="27.5" class="sd-gauge__track"/>
  <rect x="3.5" y="3.5" width="55" height="93" rx="27.5" class="sd-gauge__fill"
        stroke-dashoffset="{{ 250 * (1 - pct) }}"/>
</svg>
```

`stroke-dasharray: 250` on the fill; `stroke-dashoffset` is `250 × (1 − pct)`. The 52×82 variant uses stroke-width 5 and dasharray 252. Do not rotate the rect — the path already starts at the top.

Why it matters: the brand concept is The Living Cycle, and this puts it in the component a user looks at most. It also reads faster than a bar, because the number and the arc occupy one place.

**Rank progress stays a bar** (`.sd-track`). A rank is not a cycle; spending the oval on points would dilute the one place it means something.

**The cycle row** puts the photo **flush to the card edge** — the row is `padding: 0; overflow: hidden; align-items: stretch`, and the photo is a 98px full-height column with no radius of its own. Name, meta and status pill stack in the middle; the gauge sits at the right with 16px of margin. Never pad the photo back in.

## 4c. The tab bar

No divider line. The bar carries **its own warm-stone ground** (`--sd-tabbar-ground`) — the tone change alone separates it from the canvas. The **active cell** is the raised element: it fills the whole cell, full height and half the gap to each neighbour, and runs **flush to the screen's bottom edge** with no radius and no bar padding. Active icon and label are terracotta `#b25f35`; inactive are full ink.

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

To break the monotony of a single-colour app, **moment screens invert to forest** `#2F3D28`: raised cards stay `#EFEADF`, type goes cream, and relief is recast with a near-black cast shadow and a green-lit highlight (`--sd-inv-*`).

Three rules for an inverted screen:

**No tab bar.** This is the clean distinction across the app: cream screens are places you navigate, forest screens are moments you pass through. A nav bar would say "you're still browsing" at exactly the moment the design is trying to interrupt.

**A dismiss affordance top-left** — a plain cream cross, no relief — so the screen can be revisited from history without becoming a dead end. The primary and text buttons are the real exits.

**The achievement leads, the status labels.** On cycle complete, "You grew this." is the 38px Crimson headline and "Cycle complete" is a small terracotta kicker above it. Not the other way round.

On the completion screen the photo takes **the logo's seed silhouette** — a 200×306 stone frame at 100px radius — with an olive check badge. It matches the gauge and closes the loop the gauge opens.

Use it for, and only for: cycle complete · purchase success · the three paywalls · premium confirmation. Roughly one screen in ten. Ordinary screens never invert — it stops meaning anything if it's common.

## 7. Non-negotiables

1. Canvas for the ground, `#EFEADF` for every raised surface; terracotta for nested panels; near-white for text inputs; sand for photo mats and the tab-bar ground. Nothing else. No borders, no dividers except rows inside a settings group.
2. Every element raised and bevelled — except text inputs, which are inset. OS chrome gets neither.
3. Offset ≈ blur. No wide soft shadows.
4. One primary (olive) button per screen. SSO and alternate actions may carry olive *labels*, never olive fills.
5. Terracotta: titles (`#cc8353` display / `#b25f35` at UI scale), the active **tab-bar** item, and one nested panel per card. Never a filled button on a cream screen. The **active filter tab is forest**, not terracotta — a filter is structure, not voice.
5b. Cycle progress is the oval gauge, never a bar. Status is a filled pill, never a coloured word.
5c. Inverted screens are forest and carry no tab bar.
6. Crimson for named/actionable, Inter for body/labels/sub-nav.
7. 14px minimum between raised elements.
8. Greys are ink at alpha — never a cold grey. The only semantic colour is alert clay `#9E3521`, and it means "needs check" and nothing else. No amber, no blue, no new hexes.
9. Two greens, two jobs: olive is action and brand, sage is growth and progress. Never swap them.
