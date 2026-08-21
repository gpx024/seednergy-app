# Seednergy — Screen Map & Pattern Library

74 screens resolve to **14 layout patterns**. Build the pattern once, then every screen is that pattern with different content. Read with `DESIGN-SYSTEM.md` + `tokens.css`. Every pattern below has a built reference screen in `Seednergy Design System Final.dc.html` — sections 05 and 06.

Source layouts (`uploads/` — `01.png`–`14.png`, plus the named screen references such as `cycle_detail_growth.png`, `first_seed_selection.png`, `photo_upload_screen.png`) are **content and flow reference only** — they predate the v5 visual system (white cards on cream, no relief). Take structure and copy from them; take all styling from the design system.

---

## Pattern library

### P1 · Focus moment
Centred media or status glyph → Crimson headline → one line of body → single primary button → optional text link. No tab bar. The most-used pattern in the app.
**Inverts to the forest ground** when celebratory or commercial — and an inverted screen carries no tab bar, with a plain dismiss cross top-left instead.

### P2 · Form
Stacked labelled fields (`.sd-field`), optional SSO buttons above a divider, primary button, legal footnote in caption.

### P3 · Single-select question
Step ticks top-right, Crimson question, 3–6 stacked option rows (icon + name + one-line description + radio), continue button pinned below.

### P4 · Home dashboard
Greeting (Inter caption + Crimson name) with avatar, one hero cycle card (`.sd-card--hero`) carrying status pill / photo / stage segment / coach panel / primary action, tab bar. Six content states, one layout.

### P5 · Grouped list
Uppercase group label + rows of `.sd-row` — photo **flush to the card edge** as a 98px full-height column, then Crimson name / caption meta / filled status pill, and the oval **cycle gauge** at the right. Optional filter pills above (active = forest). Grid variant for galleries.

### P6 · Detail — hero media + panels
Back / centred title+subtitle / more header, optional stage progress ticks, hero photo frame with overlay chip, one or more panels (label + Crimson headline + body + optional italic observation), primary CTA, text link beneath.

### P7 · Capture
Full-bleed camera behind a **graduated forest scrim** — strong at top and bottom for the chrome, clearing through the middle band so the feed shows inside the framing guide. Instruction card, shutter with two side actions, skip link. No tab bar. Guide-chip variant for the upload screen.

### P8 · Processing / result
Centred spinner or status glyph → Crimson verdict → findings panel (diagnosis, corrective steps) → next-action block → primary + secondary CTA.

### P9 · Conversation
Header with close, context card, alternating bubbles (user = olive fill, coach = surface), next-action block, input + keyboard.

### P10 · Feed
Filter tabs (active = forest), post cards (avatar + location + photo + caption + reaction chips + points), floating action button, tab bar.

### P11 · Composer
Selection rows with check state, photo drop target, caption field, chip grid for categories, auto-filled data table, toggle row, preview → publish.

### P12 · Commerce
Benefit list with check icons, plan cards with a "best value" badge, price in terracotta, subscribe button, fine print. Inverted forest ground, no tab bar.

### P13 · Settings list
Grouped rows with chevrons, toggle rows, external-link rows, destructive action last in ink not red.

### P14 · Stats
Rank badge, **progress bar** to next tier — the one place a bar is still correct, because a rank is not a cycle — points-earning list, leaderboard rows with position and avatar.

---

## Screen map

### Onboarding & auth — 12
| Screen | Pattern |
|---|---|
| Splash / brand | P1 |
| Value proposition — "Grow your own food from seed to harvest" | P1 |
| Create account (SSO + email) | P2 |
| Forgot password | P2 |
| Q1 Where will you grow? (step 1/4) | P3 |
| Q2 How much light? (step 2/4) | P3 |
| Q3 How much time? (step 3/4) | P3 |
| Q4 What brings you to Seednergy? (step 4/4, multi-select) | P3 |
| Let's start your first cycle | P1 |
| First seed — Cress detail | P6 |
| Ready to begin? (cycle summary) | P6 |
| Stay in the loop (notification opt-in) | P1 |

### Home — 6 states, one layout
| Screen | Pattern |
|---|---|
| Empty — no cycle yet | P4 |
| Single active cycle | P4 |
| Multiple active cycles | P4 (list variant) |
| Needs check | P4 |
| Harvest soon | P4 |
| Ready to harvest | P4 |

### Cycles — 20
| Screen | Pattern |
|---|---|
| My Cycles (Active / Completed / Archived) | P5 |
| Cycle detail — setup ("Welcome your seeds") | P6 |
| Cycle detail — growth (guided action) | P6 |
| Cycle detail — needs check | P6 |
| Stage review prompt (camera overlay) | P7 |
| Check your growth — intro | P1 |
| Check growth — capture + best-results guide | P7 |
| Checking your growth… | P8 |
| Result: Looks on track | P8 |
| Result: Most likely too little light | P8 |
| Result: Ready to harvest | P8 |
| Ask the coach | P9 |
| Coach answer | P9 |
| Check history | P5 |
| Ready for harvest (AI analysis complete) | P6 |
| Time to harvest — instructions | P6 |
| Simple harvest steps | P6 |
| Cycle complete | **P1 inverted** |
| Archive this cycle? | P1 |
| Restart cycle? | P1 |

### Harvest record — 4
| Screen | Pattern |
|---|---|
| Save a photo of what you grew | P11 |
| Harvest gallery | P5 (grid) |
| Cycle history | P5 |
| Saved privately — share prompt | P1 |

### Explore — 4
*Explore is the **seed catalogue** — every seed available in the app, growing over time. **Five seeds at launch**; more are added continuously, so treat the catalogue as server-driven data, never a hardcoded list. Each seed carries one of three states — **free**, **locked** (unlock via P12) or **coming soon** — and the P5 grid must handle all three from day one, plus an empty search result. Do not build for five; build for fifty.*

| Screen | Pattern |
|---|---|
| Explore seeds (search + free / unlock / coming soon) | P5 |
| Seed detail — free (Cress) | P6 |
| Seed detail — locked (Basil) | P6 |
| Seed detail — coming soon (Cherry Tomatoes) | P6 |

### Garden — 12 · **POST-MVP, do not build at launch**
*The Garden is the community section: users share their profile, harvest photos and progress with other growers. It is **not part of the MVP** — that is why there is no Garden tab in the shipped bar. When it ships it becomes the **fifth tab**, and the bar goes house · cycle · magnifier · **garden** · person. Two consequences for how you build now:*

*1. Build the tab bar as a **list rendered from an array**, not five hardcoded cells, so adding the fifth item later is a data change. Cells are `flex: 1`, so a five-item bar reflows on its own (78px cells instead of 98px at 390px wide — still above the 44px hit-target minimum).*
*2. When the Garden tab arrives it needs an icon that is **not the sprout** — the sprout mark is brand-only and never an interface icon (DESIGN-SYSTEM.md §4). Use an outlined plot/grid or a people glyph at the same 21px / stroke 2.15.*

*The twelve screens below are specified and pattern-mapped so they are ready to build, but none of them ship at launch.*

| Screen | Pattern |
|---|---|
| Garden feed (Featured / Nearby / Harvests) | P10 |
| Garden empty | P1 |
| What would you like to share? | P11 |
| Share growth — photo | P11 |
| Add details (caption, category, city toggle) | P11 |
| Preview post | P11 |
| Post detail | P10 |
| Post detail — reaction given | P10 |
| My garden posts | P5 |
| Your progress / rank | P14 |
| City leaderboard | P14 |
| Grow this seed (from a post) | P6 |

### Payment — 6
| Screen | Pattern |
|---|---|
| Unlock more seeds (paywall) | **P12 inverted** |
| Unlock single seed | **P12 inverted** |
| Premium access — plans | **P12 inverted** |
| Purchase successful | **P1 inverted** |
| Payment failed | P1 |
| Restore purchase | P1 |

### Profile — 4
| Screen | Pattern |
|---|---|
| Profile | P14 + P13 |
| Settings | P13 |
| Notifications | P13 |
| Subscription | P13 |

### Permissions & errors — 7
| Screen | Pattern |
|---|---|
| Photo access required | P1 |
| Reminders are off | P1 |
| You're offline | P1 |
| Taking a rest (server) | P1 |
| Something went wrong | P1 |
| The photo is unclear | P1 |
| We couldn't check the photo | P1 |

**Total 75 · 14 patterns.** P1 alone covers 22 screens; P6 covers 12. Build P1, P4, P5 and P6 first — they carry 45 of the 75.

### MVP scope
**Ship at launch — 63 screens:** onboarding & auth, home, cycles, harvest record, explore, payment, profile, permissions & errors.
**Post-MVP — 12 screens:** the entire Garden section, and with it patterns **P10 (feed)** and **P11 (composer)**, and the leaderboard half of **P14**. P14's rank and progress screens stay in the MVP under Profile.

So the launch build is **12 patterns, not 14**. P10 and P11 have reference screens in section 06 of the design system so the visual language is settled when you come to them — but nothing in the MVP routes to them.
