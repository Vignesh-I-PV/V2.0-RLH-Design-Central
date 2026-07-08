# context.md — Network Design Central (RLH Design Central), v2.0

This file is the one place to read before changing anything — either
yourself, or by pasting this whole file to an AI assistant along with your
question. It covers: what this project is, how the 3 files fit together,
how to view it, and what to know before editing.

---

## The 3 files

| File | What it is | Do you edit it? |
|---|---|---|
| `v2.0-rlh-design-base.jsx` | All the app's code — UI + logic | **Yes** — this is the one you change |
| `index.html` | Loads React and this jsx file into a browser page | Rarely — only if you need to change fonts/CDN/page title |
| `context.md` | This file | Update the changelog at the bottom when you make notable changes |

That's it. No build step, no `npm install`, nothing to compile ahead of
time. `index.html` reads `v2.0-rlh-design-base.jsx` fresh every time the
page loads and turns it into a working app right there in the browser.

---

## Viewing it

**On the web (recommended):** put both files in a GitHub repo and turn on
GitHub Pages — see the walkthrough your assistant gave you, or ask again any
time with "how do I put this on GitHub Pages" and it'll give you the
click-by-click version (no terminal needed — GitHub's website lets you
create a repo and drag-and-drop upload files directly).

**Locally, before pushing:** double-clicking `index.html` will show an error
message — this is expected, not broken. Browsers block a local page from
reading a second local file the way this app needs to (same reason the
original prototype needed this too). The friendliest option if you want to
preview a change before pushing to GitHub:
- In **VS Code**: install the free "Live Server" extension, then
  right-click `index.html` → "Open with Live Server". One click, no typing.
- Otherwise, just push to GitHub and check the Pages URL — it only takes
  about a minute per change.

---

## What this project is

A **V1 internal desktop ops panel** for Valmo/Meesho **RLH (Regional
Linehaul) network planning** — replacing a Google-Sheets-based process. A
planner sets inputs, generates optimized route plans per Sort Centre,
reviews them, pushes them to regional Ops Leads for row-by-row alignment,
freezes, and finalises.

- **V1 scope = 3 modules only:** Design Inputs → Design Creation → Design
  Review & Ops Alignment, plus a Network Map. (A parent "5-module NDC
  vision" — OCF Simulator, Network Simulator, Change Management — is **out
  of V1**. Don't add them without a product decision.) **Command Center is
  currently hidden** from the nav and default view (product decision —
  "retrieve it later"); the code and data behind it are still intact, just
  not linked from the sidebar. See Changelog.
- **Platform:** Desktop-first, expert internal ops users.
- **Owner (design):** Pranita Sapkal · **Product owner:** Vignesh Iyer ·
  **Org:** Meesho / Valmo.
- **Figma remains the source of truth for visual design.** This app
  demonstrates interaction and flow; where visual polish conflicts, defer
  to Figma.

### Personas
| Persona | Role | What they see |
|---|---|---|
| **Central Network Planner** (primary) | Owns inputs, creates designs, pushes for alignment, finalises | Full panel |
| **Ops Lead / Regional PoC** (secondary) | Reviews pushed plans row-by-row, gives structured feedback | Stripped shell — Ops Alignment + Map only |

In production this is a real per-user login. The app fakes it with a
**"View as: Planner / Ops Lead"** toggle — shown **only on the Ops
Alignment screen** (top-right), not on other screens.

### Domain glossary
| Term | Meaning |
|---|---|
| **LMSC** | Last-Mile Sort Centre — the origin hub (~80 in scope) |
| **LMDC** | Last-Mile Delivery Centre — destination nodes (~10–13k, avg ~150/SC) |
| **RLH** | Regional Linehaul — the LMSC → LMDC routing problem (V1 scope) |
| **NLH** | National Linehaul — out of scope here |
| **CPS** | Cost Per Shipment — the primary cost metric |
| **Design Cycle / Plan Group** | A named planning cycle (e.g. "July 2026"); one upload + trigger = one group; all creation & alignment scoped to it; ≤80 SCs |
| **HW (Historical Weight)** | 0 / 0.5 / 1 — penalty for changing routes vs preserving last month's design. HW > 0 needs a reference plan per SC |
| **Run** | One triggered DS solver job = one SC × one HW value (async, Gurobi VRPTW) |
| **AutoDML** | Read-only source of truth for active network nodes; the panel surfaces only flagged warnings as a pre-plan gate |
| **Design Review** | Per-run metrics review (Coverage / CPS / Utilisation / Routes / Vehicles / Distance / Cost). No reject — un-pushed runs are discarded |
| **Ops Alignment** | The feedback loop: Ops Lead reviews route rows and flags cells with suggested corrections; Planner **Simulates** (metric delta only), Accepts/Rejects, then **Acknowledges** (freeze) → **Finalises** |
| **Acknowledge** | Irreversible freeze — locks Ops-Lead editing. A first-class guarded action with a confirm dialog |
| **Simulate** | Shows metric movement (Δ km/cost/time/vehicles) for a proposed change — NOT a full re-plan |
| **Lifecycle** | Draft → Running → Created → In Review → Pushed → In Alignment → Acknowledged → Finalised → (RFQ handoff) |
| **L1→L4 pattern** | The navigation shape shared by Design Review and Ops Alignment: **L1** status/zone chips (rail header) → **L2** SC list (rail body) → **L3** a compact plan **card** in the main pane (one per plan; click a card's icon to drill in) → **L4** the full plan detail (Plan Details / Route View tabs). See "L3/L4 card pattern" below before touching either screen. |

**Flaggable cells (Ops Lead):** Vehicle Type · Touchpoint · Route Code · Lat
· Lng · Round-Trip Distance · Breakdown TAT · Out Cutoff. (Non-flaggable: SC
location, node volume.)

### Locked decisions — don't relitigate without design/product sign-off
1. **V1 = 3 modules only** (Inputs · Creation · Review/Alignment + Map).
2. Persona split via **real login** in production (this app uses the demo toggle).
3. **Design Cycle** scopes all runs; cap ≤80 per group (not 240 stacked).
4. Persistence = **2 versions only** (published baseline + finalised). No per-edit audit log.
5. **Simulate = metric delta only**, wired per-row inline (not a footer button).
6. **Acknowledge = irreversible freeze**, guarded action with a confirm dialog naming who's locked.
7. **3-HW comparison is mandatory for V1** (not deferred). Un-pushed runs are discarded (no reject button).
8. **Reference-plan smart defaults** — carry forward last cycle's finalised plan; only manually pick for new SCs.
9. **No inline field-level validation on inputs** — "showing a file error is good enough" (shallow validation).
10. **No month-over-month comparison in V1.**
11. **Map is high priority** (arc map; benchmark Locus / Kepler.gl).
12. **All buttons/filters must be wired** — no dead controls; backend-dependent ones show "coming soon" toasts.
13. **FTUX is sparing** — 4-step dismissible coachmark + contextual ⓘ tooltips + two dismissible banners.

**ADR-001** — Ops Alignment review grain = **ROUTE level** (one
Aligned/Needs-Change verdict per route, not per DC). Node-level params are
edited inside a route's drill-down.
**ADR-002** — Navigation = left-sidebar only; Ops Alignment = master-detail;
Design Creation carries a network-tier placeholder (RLH/NLH/FM).

### Design system
**Meesho Crystal v1.1.1 with a Valmo navy override.**

| Token | Value |
|---|---|
| Shell sidebar | `#0B1430` (dark navy) |
| Primary CTA | `#003F98` (Valmo navy — do **not** switch to Crystal indigo `#3C29B7`) |
| Accent | `#2F4FC6` |
| Surface | `#F4F5F8` / `#FFFFFF` |
| Ink | `#14171F` / `#4A4F5E` / `#7A8094` |
| Neutrals | `#272829` / `#5A5E66` / `#8E96A3` / `#C3C9D4` / `#E6EBF2` / `#F2F5FA` |
| Success `#128A3E` · Warning `#C77B00` · Danger `#D14B4B` · Info `#1E6FB8` | |

**Typography:** Mier B02 (400 / 600-Demi / 700), 13px base — see "Fonts"
below; currently falls back to system fonts.

### Open / pending product items (unchanged from original handoff)
- Wire real backend for CSV upload/export/replace/delete (currently toasts / session-only state).
- Real ~80-SC list + zones, DS-job output contract, final input templates, Planner/Ops access lists.
- Free-text global search (top bar) is stubbed to a "coming soon" toast.
- "Open in new tab" is stubbed to a toast.
- Ops-Lead two-snapshot diff; phased-release option — under discussion.

### Pending fixes (as of the last session — ask before assuming these are resolved)
The UI was signed off as "largely good" with **a few specific fixes still
to come**, but they weren't itemized before the session ended. **If you're
an AI picking this up: ask the person what those fixes are before doing
unrelated work** — don't guess and don't assume silence means it's all
settled. Once you get the list, replace this paragraph with the actual items.

---

## Fonts

The brand font (Mier B02) isn't loaded anywhere yet — its `.woff2` files
weren't part of the original handoff to this project. The app runs fully
functional on system fonts in the meantime (this was already the original
prototype's documented offline fallback, not a new gap).

If you get the 3 files later (`Mier_B02-Book.woff2`, `Mier_B02-Demi.woff2`,
`Mier_B02-Bold.woff2`), the easiest path with only these 3 project files is
to host them somewhere with a public URL (e.g. add them to the same GitHub
repo and reference the "raw" GitHub URL) and add `@font-face` rules
pointing at that URL inside `index.html`'s `<style>` block.

## If the CDN is blocked

`index.html` loads React, ReactDOM, and the Babel compiler from `unpkg.com`.
If you're on a corporate network that blocks or breaks CDN scripts (some
proxies re-compress responses in a way that breaks browser security
checks), the app will fail to load with a blank page and console errors
about React not being defined. Two options: try it from a different network
(e.g. home wifi, or your phone's hotspot) to confirm that's the cause, or
ask your assistant to rebuild the "bundled locally" version (no CDN
dependency) — that variant exists, it just trades "3 files" for "3 files
plus a `vendor/` folder."

---

## For whoever (or whatever AI) edits `v2.0-rlh-design-base.jsx` next

### Where this code came from
The very first version of this app was built with a design tool that
exported a custom template format (`{{ binding }}`, `<sc-if>`, `<sc-for>`
tags) that only ran inside that tool's own runtime script. It was
mechanically converted into this plain React file — same state, same logic,
same look — using an automated script (kept separately, ask your assistant
if you want it) rather than by hand, since the original was about 7,200
lines. The conversion was verified by actually rendering every module in a
real browser and comparing it against the original before being handed
over — this is not a rough draft.

### The file's 3 sections (see the banner comments inside it)
1. **Helpers** — `css()` turns a CSS-text string into the object React's
   `style` prop needs; `hoverOn()`/`hoverOff()` handle a couple hundred
   hover-color effects that the original implemented in a non-standard way.
   If you're writing brand-new UI, prefer a real `style={{...}}` object and
   a real CSS `:hover` rule instead of extending these — they exist for
   compatibility with code ported from the original, not as the preferred
   pattern going forward.
2. **`View()`** — all the markup. Notice it's wrapped in `with (B) { ... }`
   — this is intentional, not a mistake. Every value used in the markup
   (like `{cycleName}` or `{item.label}`) comes from one big object built
   fresh on every render by `NDCApp.renderVals()`; `with` is what lets the
   markup use short names like `cycleName` directly instead of
   `B.cycleName` everywhere. Don't "clean this up" into strict-mode code
   without also restructuring the whole file — the two changes have to
   happen together.
3. **`NDCApp`** — the component: state, the fake/sample data generator, and
   every button/action's logic. The last two lines mount it onto the page.

### The L3/L4 card pattern (Design Review + Ops Alignment)
Both screens follow the same shape: selecting an SC in the left rail (L2)
doesn't jump straight to the full plan — it shows a compact **card** (L3)
in the main pane first. The card's top-right icons (eye = view detail, map,
download CSV) are the only way into the full plan (L4: metrics + Plan
Details / Route View tabs). A "Back to plans" control returns from L4 to L3.

- State: `st.opsDetailOpen` (Ops Lead) / a plan is "open" once its detail
  view is entered — look for `showCard` / `detailOpen` / `openDetail` /
  `backToCards` (or the align-side equivalents) in `oSel`/`aSel` if you need
  to trace it.
- Each SC currently has exactly **one** plan, so L3 always renders a single
  card today — it's still written as a mapped list/stack on purpose so
  adding multiple plans per SC later doesn't require restructuring, just a
  longer array.
- Card layout convention (apply this to any new plan/run card): identity +
  status pills top-left, **view/map/download icons top-right**, compact
  metrics strip in the middle, **primary actions (Push/Simulate/Acknowledge/
  Finalise) bottom-right**. Keep cards as short as possible — full summary,
  minimum height.
- Ops Alignment's three Planner states (Pending/Received/Finalised) and
  four Ops-Lead states (To Review/Submitted/Acknowledged/Finalised) each
  have their own card content (see the card markup directly above each
  `isPushed`/`isFinal`/etc. condition) but all share this same layout
  convention and icon/action placement.
- The "Received" filter tab intentionally includes **both** `In Alignment`
  and `Acknowledged` plans (comment: "gives every plan exactly one home
  across the 3 tabs") — an Acknowledged plan showing under "Received" is
  correct, not a bug.
- **L4 (full plan detail) now opens as a full-screen overlay everywhere**
  (Design Review and both Ops Alignment personas, in every state) — see
  "Unified L4 full-screen detail" below.

### Unified L4 full-screen detail (Design Review + Ops Alignment, both personas)
As of 2026-07-08, the L4 "click the eye icon" plan detail uses **one shared
visual template** across Design Review and Ops Alignment (Planner and Ops
Lead, every status). Previously Design Review opened L4 as a full-screen
fixed overlay while Ops Alignment expanded it inline in the same layout —
these are now the same shape:

- **Full-screen overlay** (`position:fixed; inset:0`) with a top bar (Back,
  identity + status tags, context actions — Simulate/Map/Download as
  applicable — and a Close `✕`) and a scrollable body below it.
- **Two tabs inside the body: "Plan Detail" and "Route View."** Nothing
  else is a top-level tab.
  - **Plan Detail** = the summary: inputs strip, output metrics grid,
    vehicle mix/vehicles-by-type, status banners (awaiting feedback /
    acknowledged-locked / finalised / needs-acknowledge-to-decide), and
    reviewer/co-reviewer info. Nothing route-by-route lives here.
  - **Route View** = the route-level content: Design Review's read-only
    route breakdown (still has its own inner Detail-View-by-DC / Route-View
    toggle — that's a second, narrower choice nested *inside* this tab, not
    a competing top-level tab); Ops Alignment Planner's per-route
    Accept/Reject change cards; Ops Alignment Ops Lead's per-route
    Aligned/Needs-Change decision table. This fixes a prior bug where the
    Ops-Lead's tab was labelled "Route View" but actually rendered the
    vehicle-mix summary — vehicle mix now lives under Plan Detail, where it
    belongs.
- Each context (`reviewDetail`, `aSel`, `oSel`) still computes its own data
  shape and keeps its own state key for which one is open — this was a
  visual/structural unification, not a data-model merge. Don't assume
  `reviewDetail`/`aSel`/`oSel` share fields beyond the tab-name convention
  (`secDetails`/`secRoute` or equivalent).
- Any sticky bottom action bar for a given context (Ops Alignment's
  Validate/Accept-all/Acknowledge/Finalise bar, Ops Lead's Validate/Mark-
  all-Aligned/Simulate/Submit bar) now lives **inside** that context's
  full-screen overlay (sibling to the scrollable body, at the bottom of the
  same fixed-position flex column) — not at the page layout level like
  before.

### Ops Alignment: Accept/Reject now gated on Acknowledge & Freeze
As of 2026-07-08, the **Planner** can no longer Accept/Reject a flagged
change while a plan is still `In Alignment`. They can review what Ops
flagged (read-only), run Simulate, and Acknowledge & Freeze — but the
Accept/Reject buttons on each flagged route/DC change only unlock once the
plan is `Acknowledged`. This reverses the prior "decide before freezing"
flow (see the old inline comment that used to read "Accept/Reject unlocks
the moment feedback is received (In Alignment), per row, BEFORE
Acknowledge" — that's no longer true). Acknowledge itself still only
depends on Ops feedback having been submitted, not on any rows being
decided — an Acknowledge with pending rows now leads *into* the
decide-every-row-then-Finalise step rather than skipping it. Reflect this if
you touch `alignVals()`'s `canDecide`/`decideLocked` computation or the
`In Alignment` banner copy. This does **not** touch the Ops Lead's own
Aligned/Needs-Change flagging — that's a different, still-immediate
mechanism (it's Ops proposing changes, not Planner deciding on them).

### "Nudge reviewers" removed from Ops Alignment (Planner side)
As of 2026-07-08, the "Nudge reviewers" button (bell icon + label, shown on
a `Pushed`-status plan card and in that state's sticky action bar) has been
removed from the Planner's Ops Alignment view, per product decision. The
underlying `remindedPlans` state, `onNudge` handler, and the Ops-Lead-side
"Reminder from planner" chip in their rail list were left in place (now
functionally unreachable/dead, matching this file's convention of leaving
superseded logic intact rather than deleting it — see the Command Center
precedent above) rather than torn out, in case nudging comes back in a
different form. Don't re-wire that dead code without a product decision.

### Volume upload validation (Design Inputs)
Uploading a volume CSV now runs through `validateVolCsv()` (a deterministic
fake validator — see its comment for the naming escape-hatches to force
pass/fail while testing/demoing). A file that fails is added to the library
with its errors visible but is **never** set active — whatever was active
for that type stays active until a corrected re-upload passes. `volEdits`
(state, keyed by file name) overlays corrections from a "Replace" re-upload
onto either a seeded or session-uploaded row, the same pattern `scEdits`
uses for SC Master. `activeNameOf()` will never fall back to a file that
has errors — double-check that invariant if you touch it.

### SC Master "Ops Leads" dropdown
The 8 old per-role email columns were replaced with one "N leads" column;
`pocList` (name + role + a derived email) drives a `position:fixed`
dropdown anchored to the clicked button's bounding rect (not
`position:absolute` — the table scrolls, and `fixed` avoids clipping).


- A couple of `<select>`s have an `<option selected={...}>` ported as-is
  from the original — React may log a console note about this; harmless.
- Repeated list rows use their position in the list as their React "key"
  (fine for filtering/searching; if you ever add drag-to-reorder to a list,
  switch that list to a stable key like an SC code first).

### If something looks different from the original design
Treat it as a bug in the port, not an intentional redesign, and flag it —
nothing about the product behavior was meant to change in the conversion.

---

## Changelog
- **2026-07-07** — Converted from the original Claude-Design DSL prototype
  (`ndc.dc.html`) to plain React/JSX; removed dead code flagged in the
  original design handoff (unused volume-library "set active" machinery,
  an always-off `mapNational` flag); simplified from a multi-file project
  down to these 3 files.
- **2026-07-08** —
  - **Volume Inputs validation gating**: uploads are now actually
    validated (`validateVolCsv()`); a failing file shows row-level errors
    and is never set active; added a "Replace" re-upload flow that
    re-validates in place (`volEdits` overlay).
  - **SC Master**: collapsed 8 per-role email columns into one "Ops Leads"
    column with a `position:fixed` dropdown (name/role/email per lead).
  - **Ops-Lead Ops Alignment tabs** renamed *Overall Summary → Plan
    Details*, *Vehicle Plan → Route View*; *Node Details* tab removed.
    Same two-tab pattern added to the Planner's Ops Alignment read-only
    state; Design Review already had this exact pattern.
  - **Design Review**: run cards converted from a 2-column grid to a
    full-width list (one per row); "Finalise directly" now shows the
    confirm-dialog copy: *"Bypassing Ops Alignment... This action cannot
    be undone."*; the Runs-bar "Planned" bubble and "In Flight" section
    were removed; Detail View / Route View toggle moved to the left with
    Detail View shown first and the "Route Breakdown" label removed.
  - **Command Center hidden** from the sidebar and as the default view
    (now defaults to Design Inputs) — product decision to bring it back
    later; code/data left intact.
  - **"View as" toggle** scoped to the Ops Alignment screen only (was
    showing on every screen).
  - **Design Review Detail View (DC × Route)**: rows for the same route are
    now visually boxed together (outside border around the group), matching
    how the source planning spreadsheet groups a route's rows.
  - **Ops Alignment rebuilt to the same L1→L4 pattern as Design Review**
    (status/zone → SC → plan card → full detail) for both personas —
    Planner's Pending/Received/Finalised and Ops Lead's To Review/
    Submitted/Acknowledged/Finalised each get their own card content
    (metrics, reviewer status, Simulate/Acknowledge, lock banners) per spec.
    Plan cards across Design Review and Ops Alignment now consistently put
    view/map/download icons top-right and primary actions bottom-right.
  - Read (but did not yet build against) a sample plan-output spreadsheet
    (`DS Output`/`Ops Feedback` × `Details`/`Route View`, plus `Metrics`)
    establishing: the Details↔Route View pivot relationship (conceptual,
    not literal formulas), route rows visually grouped with an outside
    border, and that a route-code/touch-point re-sort + Route View
    recompute only happens on **Simulate or Finalise**, not on every edit.
  - Signed off as "largely good" — a handful of further fixes are planned
    but weren't itemized before the session ended; see "Pending fixes" above.
  - **L4 plan detail unified across Design Review + Ops Alignment (both
    personas, every state)**: same full-screen overlay chrome, same
    "Plan Detail" / "Route View" two-tab body. Fixed the Ops-Lead tab
    mislabel where "Route View" rendered the vehicle-mix summary instead of
    a route table — vehicle mix moved to Plan Detail, Route View now shows
    the actual per-route Aligned/Needs-Change table. See "Unified L4
    full-screen detail" above.
  - **"Nudge reviewers" removed** from the Planner's Ops Alignment view
    (card action + sticky bar); see "'Nudge reviewers' removed" above.
  - **Planner Accept/Reject now gated on Acknowledge & Freeze**: a flagged
    change can no longer be decided while a plan is `In Alignment`; the
    Planner must Acknowledge & Freeze first. See "Accept/Reject now gated
    on Acknowledge & Freeze" above.
