# Project Context — Complete Reference
**NDC v2.0 / RLH Design Central**

> **Last updated:** 2026-07-24
> **Scope:** This file describes the app **as built today** (RLH only). It intentionally excludes any discussion of in-progress or future modules (e.g. SC-DC Mapping, Route Scheduler) — those live in separate future-scope reference docs and should not be assumed to exist in this codebase yet.
> **Relationship to `context.md`:** the repo's `context.md` is the dated, session-by-session changelog — append-only, historical, maintained by the dev process itself. This file is the *synthesized current state of truth*, consolidated into one document for convenience. If the two ever disagree, `context.md`'s most recent entry wins; then this file should be corrected to match.

### Update log (this file)
- **2026-07-24** — Corrected the Module Map: removed "Clustering, Mapping" as a Design Creation sub-tab (it was never actually built and doesn't exist in source) and replaced it with what's actually in the code — a network-tier selector (RLH / NLH / FM Carting) at the top of Design Creation, RLH active, the other two showing a "coming in a future cycle" toast on click. Confirmed by direct inspection of `v2.0-rlh-design-base.jsx`. No other changes from the 2026-07-17 synthesis.
- **2026-07-17** — Initial version, compiled by direct code inspection of `v2.0-rlh-design-base.jsx` plus the repo's `context.md`.

---

## 1. What this project is

A **V1 internal desktop ops panel** for Valmo/Meesho **RLH (Regional Linehaul) network planning** — replacing a Google-Sheets-based process. A Central Planner sets inputs, generates optimised route plans per Sort Centre (via an external DS/solver job), reviews them, pushes them to regional Ops Leads for row-by-row alignment, freezes, and finalises for RFQ handoff.

It is a **working prototype**, not production software: single-file React (`v2.0-rlh-design-base.jsx`, ~916KB), no build step (Babel-in-browser via CDN), all state lives in browser session memory. Nothing here has been backend-wired yet — uploads, exports, and the DS job itself are simulated/stubbed.

- **V1 scope = 3 modules only:** Design Inputs → Design Creation → Design Review & Ops Alignment, plus a Network Map. A parent "5-module NDC vision" (OCF Simulator, Network Simulator, Change Management) is **out of V1** — don't add without a product decision.
- **Platform:** Desktop-first, expert internal ops users.
- **Owner (design):** Pranita Sapkal · **Product owner:** Vignesh Iyer · **Org:** Meesho / Valmo.
- **Figma remains the source of truth for visual design.** This app demonstrates interaction and flow; where visual polish conflicts, defer to Figma.
- **Command Center** is currently hidden from the nav (product decision — "retrieve it later"); code and data behind it are intact, just unlinked.

## 2. Personas

| Persona | Role | What they see |
|---|---|---|
| **Central Network Planner** (primary) | Owns inputs, creates designs, pushes for alignment, acknowledges, finalises | Full panel |
| **Ops Lead / Regional PoC** (secondary) | Reviews pushed plans row-by-row, gives structured feedback | Stripped shell — Ops Alignment + Map only |

In production this is a real per-user login. The app fakes it with a **"View as: Planner / Ops Lead"** toggle, shown only on the Ops Alignment screen (top-right).

Within the Ops Lead persona there's a second layer: an **acting-persona switcher** (`opsPersonaName()`, default "Rahul Sharma") simulating multiple named reviewers on the same plan, so multi-reviewer behaviour (co-reviewer visibility, reviewer-name attribution, progressive feedback merging) can be demoed without real multi-user login.

## 3. Domain glossary

| Term | Meaning |
|---|---|
| **LMSC** | Last-Mile Sort Centre — the origin hub (~80 in scope) |
| **LMDC** | Last-Mile Delivery Centre — destination nodes (~10–13k, avg ~150/SC) |
| **RLH** | Regional Linehaul — the LMSC → LMDC routing problem (V1 scope) |
| **NLH** | National Linehaul — out of scope here |
| **CPS** | Cost Per Shipment — the primary cost metric |
| **Design Cycle / Plan Group** | A named planning cycle (e.g. "July 2026"); one upload + trigger = one group; all creation & alignment scoped to it; ≤80 SCs |
| **HW (Historical Weight)** | 0 / 0.5 / 1 — penalty for changing routes vs. preserving the prior design. HW > 0 needs a reference plan per SC. |
| **Run** | One triggered DS solver job = one SC × one HW value (async, conceptually Gurobi VRPTW) |
| **AutoDML** | Read-only source of truth for active network nodes; the panel surfaces only flagged warnings as a pre-plan gate |
| **Design Review** | Per-run metrics review (Coverage / CPS / Utilisation / Routes / Vehicles / Distance / Cost). No reject — un-pushed runs are discarded |
| **Ops Alignment** | The feedback loop: Ops Lead reviews route rows and flags cells with suggested corrections; Planner reviews, Acknowledges (freeze), decides field-by-field, Finalises |
| **Acknowledge** | Freeze — locks Ops-Lead editing. Guarded action with a confirm dialog. Reversible via **Unfreeze** (Planner-only) |
| **Simulate** | Shows metric movement for a proposed change set — not a full re-plan; preview-only, never mutates `plan.rows` |
| **Lifecycle** | Draft → Running → Created → In Review → Pushed → In Alignment → Acknowledged → Finalised → (RFQ handoff) |
| **L1→L4 pattern** | Shared navigation shape of Design Review and Ops Alignment: **L1** status/zone chips (rail header) → **L2** SC/plan list (rail body) → **L3** a compact plan card in the main pane → **L4** the full-screen plan detail (Plan Inputs → Plan Outputs → Validation Flags → Plan Details tabs) |

**Flaggable cells (Ops Lead):** Vehicle Type · Touchpoint · Route Code · Lat · Lng · Round-Trip Distance. (Non-flaggable: SC location, node volume.)

## 4. Module map (corrected 2026-07-24)

| Main Tab | Sub-tab | Key function |
|---|---|---|
| Design Inputs | Volume Forecast Upload | Pincode/node-level shipment forecasts |
| Design Inputs | Node & Vehicle Master → Sort Centre Master | SC-level parameters (type, zone, capacities, docks, TP limits, hours, location, POCs) |
| Design Inputs | Node & Vehicle Master → SC Vehicle Availability | Which vehicle types are usable at which SC, with per-SC overrides |
| Design Inputs | Node & Vehicle Master → Vehicle Master | System-wide vehicle type definitions (capacity, distance limit, TP limit, LH feasibility) |
| Design Inputs | Design Ingestion | Ingest externally-created FM/NLH/RLH plans for sanity checks |
| Design Inputs | Node Opening Request | Capture new node requests |
| Design Creation | Network-tier selector (RLH / NLH / FM Carting) | Segmented control at the top of Design Creation. **RLH is the only active tier in V1** — NLH and FM Carting are visible but show a "coming in a future cycle" toast on click (`CTIER` in source). *(Corrects an earlier, inaccurate "Clustering, Mapping" sub-tab entry that was never actually built.)* |
| Design Creation | Route Planning → RLH | The 4-step plan-creation wizard (fully built) |
| Design Review & Alignments | Design Review — RLH Route Plan | View created plans, metrics, guardrails, push to Ops Alignment |
| Design Review & Alignments | Ops Alignment | Planner ↔ Ops Lead row-by-row review & freeze loop (its own top-level nav item in the actual build) |
| Design Review & Alignments | Map Visualisation | Route arc map, filters, side-by-side original-vs-feedback view |
| Finalise (separate nav item) | — | Lists Acknowledged (ready-to-finalise) + Finalised plans for RFQ handoff. Surfaced via a **top-of-page 5-stage rail** (Design Inputs → Design Creation → Design Review → Ops Alignment → Finalise), not a sidebar item. |
| Change Management, Network Design Support | — | Out of V1 build scope (documented in the original spec only) |

**Sidebar nav (as coded):**
- Planner, group **PLAN**: Design Inputs, Design Creation.
- Planner, group **REVIEW & ALIGN**: Design Review, Ops Alignment, Network Map.
- Ops Lead, group **MY REVIEWS**: Ops Alignment, Network Map.
- Past-cycle view, group **VIEW**: Finalised Plans, Network Map.
- "Finalise" is reached via the top stage-rail (see above), not a sidebar entry.

## 5. Status / lifecycle model

The plan status enum used throughout Ops Alignment and Finalise:

```
Pushed → In Alignment → Acknowledged → Finalised
```

- **Pushed** — plan sent to Ops Alignment, no feedback yet.
- **In Alignment** — ≥1 Ops Lead reviewer has submitted feedback.
- **Acknowledged** — Planner has frozen the plan (Acknowledge & Freeze); Ops editing locked; Planner now decides field-by-field.
- **Finalised** — terminal; committed, read-only, ready for RFQ handoff.

Both personas' rail filters are 4-stage and map onto this same enum:

- **Planner rail:** Pending Feedback (`Pushed`) → Feedback Received (`In Alignment`) → Acknowledged (`Acknowledged`) → Finalised (`Finalised`).
- **Ops Lead rail:** To Review → Submitted → Acknowledged → Finalised (computed from the same enum plus this reviewer's own submission state).

**Unfreeze** (Planner-only) reverses `Acknowledged` back to `In Alignment` — never to `Pushed` — resetting only the Planner's own decisions while leaving submitted Ops feedback intact.

## 6. Locked decisions — don't relitigate without design/product sign-off

1. V1 = 3 modules only (Inputs · Creation · Review/Alignment + Map).
2. Persona split via real login in production (this app uses the demo toggle).
3. Design Cycle scopes all runs; cap ≤80 per group (not 240 stacked).
4. Persistence = 2 versions only (published baseline + finalised). No per-edit audit log.
5. Simulate = metric delta only, wired per-row inline (not a footer button).
6. Acknowledge = freeze, guarded confirm dialog. Reversible via Unfreeze (Planner-only).
7. 3-HW comparison is mandatory for V1 (not deferred). Un-pushed runs are discarded (no reject button).
8. Reference-plan smart defaults — carry forward last cycle's finalised plan; only manually pick for new SCs.
9. No inline field-level validation on inputs — "showing a file error is good enough" (shallow validation).
10. No month-over-month comparison in V1.
11. Map is high priority (arc map; benchmark Locus / Kepler.gl).
12. All buttons/filters must be wired — no dead controls; backend-dependent ones show "coming soon" toasts.
13. FTUX is sparing — 4-step dismissible coachmark + contextual ⓘ tooltips + two dismissible banners.

**ADR-001** — Ops Alignment review grain = ROUTE level (one Aligned/Needs-Change verdict per route, not per DC). Node-level params are edited inside a route's drill-down.
**ADR-002** — Navigation = left-sidebar only; Ops Alignment = master-detail; Design Creation carries a network-tier placeholder (RLH/NLH/FM) — this is the `CTIER` segmented control, see Module Map above.
**ADR-003** — Design Cycle plan-group cap is ≤80 SC runs (see item 3 above) — a process-level cap, not a per-route constraint.

## 7. Design system

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

**Typography:** the build falls back to a system sans-serif stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) — Mier B02 (400/600/700, 13px base) was the original spec but isn't hosted yet. Liberation Sans is a close metric-compatible stand-in for mockups/renders.

## 8. Known limitations / caveats worth remembering

- **Untested in a real browser** by a human, as of this writing — every change has been validated by Babel parse + a div/fragment balance heuristic only. Budget for a real click-through pass.
- **Demo/seed data is mixed with real computed logic.** Some validation flags you'll see in the UI are genuinely computed from live plan data (e.g. everything inside `computeHypotheticalPlan()`); others are RNG-seeded for demo plan cards (`mkRun()`, used for Design Review's seeded historical plans) and use the same threshold *labels* without being derived from real routes.
- **Cost rates are placeholders** for any vehicle type beyond TATA ACE / Bolero / TATA 407 — a capacity-scaled fallback, not a real rate, until product supplies one.
- **Distance is not a real road-network distance** — `NDC_haversineKm()` is straight-line haversine with a flat ×55 multiplier to land seeded lat/lng deltas in a plausible km range. Replace with a real distance service when one exists.
- **Figma is the visual source of truth** — if something here looks different from the original design, treat it as a bug in the port and flag it, not an intentional redesign.

---

## 9. Logics & Formulae

### The single source of truth: `computeHypotheticalPlan(plan, effectiveFbByIdx)`

Every distance, cost, CPS, and validation figure shown anywhere in Ops Alignment (Details, Route View, Validate, Simulate, Finalise preview) is computed by this one function — never approximated or RNG-generated. It returns:

```
{ routes, scVolume, scCost, scCPS, originalScCPS, errors, warnings, hasErrors, warningsOnly, clean }
```

Two feedback sets are passed in depending on context: `effectiveFbFor()` (proposed, used by Validate/Simulate) vs. `effectiveFbForFinalise()` (accepted-only, used only at Finalise).

**Step 1 — Flatten every DC across every route.** Each DC is tagged with its original route/TP and whatever DC-level override the effective feedback carries. A DC's route code can point at an existing route (a move) or a not-yet-existing code (a **split**), which requires its own manually-picked vehicle — never inherited from the source route. Merge-conflict detection: two DCs proposing the same new split-route code with different vehicles is an error.

**Step 2 — Group by effective route, sort by touch point.** Primary sort ascending TP; direction-aware tie-break (a DC moving to a *later* TP sorts after the resident already there; otherwise the mover wins the tie). Every DC is then reassigned a clean `1..N` sequence. **TP > 7 warning** on any route with more than 7 DCs after reordering.

**Step 3 — Vehicle assignment per route.** Existing route: override if proposed, else original vehicle. New/split route: whatever was chosen at split-creation, falling back to `'TATA ACE / 7ft'`.

**Step 4 — Distance.** Legs run SC → DC₁ → … → DCₙ → SC. `calcLeg = NDC_haversineKm(...)` is the system reference; the **official** leg distance is the user-entered value if one exists, else `calcLeg`. **Distance-variance warning** if a user leg differs from calculated by >25%. **The return leg is always system-calculated**, never user-editable. **Distance-vs-vehicle-limit warning** if total round-trip exceeds the vehicle's distance limit.

**Step 5 — Cost, CPS, rollups:**
```
volume       = Σ (DC volumes on this route)
costPerKm    = NDC_costPerKmFor(vehicleName, vehicleCapacity)
cost         = distance × costPerKm
routeCPS     = volume > 0 ? cost / volume : 0
scVolume     = Σ (route volumes)
scCost       = Σ (route costs)
scCPS        = scVolume > 0 ? scCost / scVolume : 0
```
`originalScCPS` recursively calls `computeHypotheticalPlan(plan, {})` (no feedback) for an apples-to-apples before/after in Simulate.

### Distance formula: `NDC_haversineKm(lat1, lng1, lat2, lng2)`
Standard haversine, **with a flat ×55 multiplier** (a stand-in to land seeded lat/lng deltas in a plausible 60–360km range — not a real distance claim; replace with a real routing service when one exists).

### Cost formula: `NDC_costPerKmFor(vehicleName, vehicleCapacity)`
| Vehicle | Rs/km |
|---|---|
| TATA ACE / 7ft | 12 |
| Bolero / 8ft | 14 |
| TATA 407 / 10ft | 18 |

Fallback for any other type: `rate = 18 × (vehicleCapacity / 3500)` — a capacity-scaled placeholder off the TATA 407's rate.

### Utilisation
```
util = vehicleCapacity ? min(0.98, routeVolume / vehicleCapacity) : 0.7 (fallback)
```
`util > 0.90` → "Over-loaded" (warning). `util < 0.40` → "Under-utilised (<40%)" (warning).

### Historical Weight (HW) mechanics
- **HW = 0** — full re-optimise, no bias.
- **HW = 0.5** — moderate stability bias toward the previous finalised plan.
- **HW = 1** — maximum stability, closest to the prior plan.
- **HW > 0 requires a reference plan** for that SC — the run is blocked without one.
- The 3-HW comparison is mandatory for V1.

### Design-Creation trigger-time thresholds
| Check | Threshold | Severity |
|---|---|---|
| Reference plan required | HW > 0 or New-Node mode on, no reference plan picked | Blocking |
| Missing SC location/dock data | `!lat \|\| !lng \|\| !docks` | Blocking |
| Zero/missing-volume LMDC | any DC with zero/missing volume | Blocking |
| Distance limit exceeded | farthest DC > every active vehicle's distance limit | Blocking |
| Touchpoints exceed vehicle-master limit | entered TP > cap for that type | Warning |
| Sort-capacity breach | planned volume > SC sort capacity | Warning |
| Volume-capacity breach | planned volume > SC volume capacity | Warning |
| Oversized-vehicle (under-range) | farthest DC < 40% of largest vehicle's range | Warning |
| Coverage flag | avg volume/DC > 380 **and** DC count < 110 | Warning |

### Design Review card-level thresholds (⚠ partly demo-seeded)
| Flag | Threshold |
|---|---|
| Avg touch points > 7 | `avgTP > 7` |
| Over-loaded | `util > 0.9` |
| Under-utilised | `util < 0.40` |
| Coverage gap | `coverage < 0.98` |
| Input ≠ output node count | RNG-seeded demo flag (10% chance) — not a real check |

---

## 10. Validation Rules

Every validation message carries a severity: **Blocking** (`sev:'danger'`, prevents trigger/submit/finalise) or **Warning** (`sev:'warning'`, surfaces but doesn't block).

### Layer 1 — Design Creation trigger-time checks
See the threshold table in §9. Any blocking flag sets that SC's readiness to "Blocked"; warnings alone still allow triggering ("N warnings").

### Layer 2 — Ops Alignment live recompute (`computeHypotheticalPlan()`)
| # | Check | Severity |
|---|---|---|
| 1 | New-route vehicle conflict (two DCs propose the same new split code with different vehicles) | Blocking |
| 2 | Touch points > 7 after auto-reorder | Warning |
| 3 | Distance-variance >25% (only while unresolved) | Warning |
| 4 | Distance vs. vehicle limit | Warning |

**Validate Changes** runs all 4 together against the current proposed state, shown inline tagged to the exact route/DC. **Submit Feedback is locked** if any blocking failure remains.

### Layer 3 — Design Review seeded card-level flags (⚠ partly demo data)
Same threshold language as the live engine, but on seeded historical plans (`mkRun()`) these are RNG-generated, not derived from actual routes.

### Layer 4 — Upstream data-ingestion validations
- Volume/Node/SC/Vehicle Master uploads: template download → upload → row-level validation → reject-on-mismatch. A failed file is **never added to the library**. Once passed and submitted, **it can no longer be deleted** — only replaced.
- AutoDML node checks (pre-plan gate, not blocking data entry): link active but node inactive; link active but LMDC has zero capacity; LMDC mapped to >1 SC.
- SC Master mandatory fields: SC Type, Zone, Sort Capacity, Volume Capacity, number of docks.
- Vehicle Master TP cap is a **reference limit, not a hard block**.

---

## 11. Rule Engine (access-based & state-lock rules)

### Access-based rules
| Capability | Central Planner | Ops Lead |
|---|---|---|
| Create a design/plan | ✅ | ❌ |
| View Design Inputs / Creation / Review | ✅ | ❌ |
| See plans in Ops Alignment | All plans they pushed | Only plans where they're a named reviewer |
| Propose a row/field change | ❌ | ✅, while `Pushed`/`In Alignment` and not yet submitted |
| Accept/Reject a proposed change | ✅, only once `Acknowledged` | ❌ |
| Acknowledge & Freeze | ✅ (requires ≥1 reviewer submitted) | ❌ |
| Unfreeze | ✅ (Planner-only, only while `Acknowledged`) | ❌ |
| Finalise | ✅ (requires `Acknowledged` + all flagged fields decided + clean validation) | ❌ |
| Submit Feedback | ❌ | ✅ (locked if any blocking failure remains) |
| Simulate / Validate | ✅ | ✅ |

**Reviewer attribution:** every proposed change is tagged with the proposing Ops Lead's name (`fb.by`, surfaced as `propBy`).

### State-lock rules (status state machine)
`Pushed → In Alignment → Acknowledged → Finalised`

- **Pushed** — Ops can view/propose; Planner sees no feedback to act on yet.
- **In Alignment** (≥1 submitted) — Ops can still edit until Acknowledge; **Planner cannot Accept/Reject yet** (`decideLocked:true`) — can only review, Simulate, and Acknowledge & Freeze. Acknowledge itself only requires ≥1 submission, not full decision.
- **Acknowledged (frozen)** — Ops editing locked. Planner decides **per field** (Route Code, Touch Point, Lat/Lng-as-one-"position", Distance at DC level; Vehicle Type at route level). The 5-state Acknowledge/Simulate/Validate/Finalise sequence: (1) nothing decided → Simulate previews everything proposed; (2) any decision made → Simulate off, Validate only; (3) Validate clean → Simulate back on; (4) all decided + validated clean → Finalise unlocks.
  - `canFinalise = (status==='Acknowledged') && allDecided && validatedClean`
- **Unfreeze** (Planner-only, only while `Acknowledged`): reverts to `In Alignment`, never to `Pushed`. Clears only the Planner's own decisions; submitted Ops feedback (`plan.rows[i].fb`, `plan.submittedReviewers`) is untouched.
- **Finalised (terminal):** read-only. `confirmFin()` calls `effectiveFbForFinalise(plan)` (accepted-only), recomputes, and rewrites `plan.rows`/`plan.metrics` — the one place Details/Route View show the new order.

### Feedback aggregation
- **`effectiveFbFor(plan)`** — merges every reviewer's submitted feedback with the current session's in-progress edits; what Validate/Simulate always run against.
- **`effectiveFbForFinalise(plan)`** — accepted-only counterpart, used only at Finalise; a rejected field (including a rejected split) reverts to its original value.

### File-library rules
A file failing validation is never added to the library. Once submitted, it can't be deleted — only replaced by a corrected re-upload. `activeNameOf()` never falls back to an errored file.

### Planner rail — 4-stage filter rule
```
'Pending Feedback' → status 'Pushed'
'Feedback Received' → status 'In Alignment'
'Acknowledged'      → status 'Acknowledged'
'Finalised'         → status 'Finalised'
```
Every plan has exactly one home across the 4 tabs. Both rails share the same segmented-control visual pattern (2×2 grid inside a light-grey track, solid navy block on the active segment).

---

## 12. Core Flows

```
Design Inputs  →  Design Creation (RLH)  →  Design Review  →  Ops Alignment  →  Finalise → RFQ handoff
```
Design Review can also **skip** Ops Alignment entirely via "Finalise Directly."

### Flow A — Design Inputs → Design Creation (RLH)
**A0 — Prerequisite masters:** Volume Forecast, SC Master, SC Vehicle Availability, Vehicle Master, Node Inputs (AutoDML + New Additions/Closures/Migrations).
**A1 — Node Selection:** pick SC(s) → pick volume file → per-SC capacity/location shown (missing location/dock = blocking) → expand to LMDC list (AutoDML + Additions + Migrations-in − Closures/Migrations-out), any row droppable → zero/missing-volume DCs flagged (blocking) → CSV download.
**A2 — Operating Mode & HW:** choose HW (0/0.5/1) → optional New Node Addition mode → reference plan required if HW>0 or mode on (blocking if none picked).
**A3 — Vehicle Configuration:** HW 0.5/1 or New-Node mode → vehicle set from reference plan (uneditable base, can add extra). HW=0 → defaults from SC Vehicle Availability, fully editable.
**A4 — Preview & Trigger:** summary card per SC with all flags → correct or accept violations → optional run name → Run Queue (Planned→In-Progress→Completed) → links into Design Review on completion.

### Flow B — Design Review → push to Ops Alignment (or Finalise Directly)
Lists every plan (card per run ID, grouped by SC). Real validations: coverage must be 100%, TP>7 flagged, utilisation >90%/<40% flagged. Then: **Push to Alignment** (POC-selection modal, reads SC Master's POC list + manual add) → visible only to named reviewers at status `Pushed`; or **Finalise Directly** → skips Ops Alignment, straight to `Finalised` + RFQ, guarded by explicit confirm.

### Flow C — Ops Alignment loop
**C1 — Ops Lead reviews (`Pushed`→`In Alignment`):** row-level Aligned/Needs-Change; Needs Change opens edit panel (DC-level Lat/Lng/TP/Route Code incl. split; route-level Vehicle Type; mandatory Remarks). **Validate Changes** runs the 4 rules; Submit locked on blocking failure. **Simulate** compares original vs. proposed. **Submit Feedback** moves plan to `In Alignment` on first submission (progressive merge).
**C2 — Planner reviews & Acknowledges (`In Alignment`):** read-only review + Simulate; **Acknowledge & Freeze** is the only action (requires ≥1 submission).
**C3 — Planner decides field-by-field (`Acknowledged`):** the 5-state machine (§11); decisions via tick/cross, inline or "Review changes" modal (Accept All/Reject All per route); auto TP-reorder shown as display-only diff; **Unfreeze** available; once all decided + validated clean, **Finalise** unlocks.
**C4 — Finalise (`Acknowledged`→`Finalised`):** full-screen preview (real metrics, derived route table, warnings panel) → confirm commits (`confirmFin()`) → status → `Finalised`, read-only.

### Flow D — Finalise view → RFQ handoff
Separate top-level surface (reached via the stage rail, not a sidebar item) listing every `Acknowledged` and `Finalised` plan, for handoff to the LH team.

### Map Visualisation (cross-cutting)
Available from Design Review, Ops Alignment (both personas), standalone. Route arc plot, LMSC square/LMDC circle markers, legend. Filters: LMDC search, Route, Vehicle Type, Zone. Standalone map reuses the exact same per-DC positions as Details (not a disconnected data source).
