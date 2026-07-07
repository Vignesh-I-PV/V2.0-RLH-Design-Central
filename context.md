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
  of V1**. Don't add them without a product decision.)
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
**"View as: Planner / Ops Lead"** toggle in the top-right.

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

### Known cosmetic (non-bug) items
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
