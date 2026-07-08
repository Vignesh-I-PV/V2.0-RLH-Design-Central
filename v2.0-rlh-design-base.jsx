// Shared helpers for the ported Network Design Central prototype.
//
// css() -- turns a plain CSS-text string (e.g. "color:red; padding:4px;")
// into the {property: value} object React's `style` prop requires. This
// exists purely so the original prototype's inline `style="..."` strings
// could be mechanically ported to JSX without hand-rewriting ~2,150
// individual style attributes into object literals. It is intentionally
// forgiving (skips anything that doesn't look like "prop: value;").
function css(str) {
  const out = {};
  String(str).split(';').forEach((rule) => {
    const i = rule.indexOf(':');
    if (i < 0) return;
    let k = rule.slice(0, i).trim();
    let v = rule.slice(i + 1).trim();
    if (!k || !v) return;
    k = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[k] = v;
  });
  return out;
}

// hoverOn()/hoverOff() -- the original prototype used a non-standard
// `style-hover="..."` attribute (a Claude-Design DC runtime feature) to get
// simple hover feedback without wiring a real onMouseEnter/onMouseLeave pair
// per element. React has no such attribute, so the transpiler
// (convert/transpile.py) synthesizes real handlers that swap the touched
// inline style properties directly on the DOM node on hover, and restore
// them on mouse-leave. No re-render involved -- same visual effect as the
// original, same performance characteristics (it's just direct style
// mutation, exactly what the browser would do for a real :hover rule).
function hoverOn(e, hoverCssText) {
  const hoverProps = css(hoverCssText);
  Object.keys(hoverProps).forEach((k) => { e.currentTarget.style[k] = hoverProps[k]; });
}
function hoverOff(e, baseCssText, hoverCssText) {
  const hoverProps = css(hoverCssText);
  const baseProps = css(baseCssText);
  Object.keys(hoverProps).forEach((k) => {
    e.currentTarget.style[k] = Object.prototype.hasOwnProperty.call(baseProps, k) ? baseProps[k] : '';
  });
}
// View() renders the whole app shell from a flat bindings object (B), produced
// each render by NDCApp.renderVals() in app.jsx. This mirrors the original
// Claude-Design template's binding model on purpose: every {{ key }} in the
// original ndc.dc.html markup referenced a bare identifier resolved against
// one flat object, and the `with (B) { ... }` below reproduces that exact
// scoping so the port could be done mechanically and verified 1:1 against the
// original rather than hand-restructured into per-section props.
//
// This file must stay non-strict (no "use strict", not an ES module) for
// `with` to be legal -- see CLAUDE.md "Known intentional patterns".
function View(B, self) {
  with (B) {
    return (
      <>
<div style={css(`display:flex; height:100vh; width:100%; overflow:hidden; background:#F4F5F8;`)}>
{/* ============ SIDEBAR ============ */}
<aside style={css(`width:250px; flex-shrink:0; background:#0B1430; display:flex; flex-direction:column; border-right:1px solid #1A2447;`)}>
<div style={css(`padding:18px 18px 14px; display:flex; align-items:center; gap:11px;`)}>
<div style={css(`width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg,#003F98,#2F4FC6); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(0,63,152,0.45);`)}>
<svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#fff"} strokeWidth={"1.9"}><path d={"M5 18a2 2 0 100-.01M19 6a2 2 0 100-.01M7 17c4 0 3-9 10-9"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</div>
<div style={css(`min-width:0;`)}>
<div style={css(`font-size:13.5px; font-weight:700; color:#fff; line-height:1.15; white-space:nowrap;`)}>Network Design Central</div>
<div style={css(`font-size:10px; font-weight:600; color:#8E9AC4; letter-spacing:0.04em;`)}>RLH · NETWORK DESIGN CENTRAL</div>
</div>
</div>
{/* design cycle selector */}
<div style={css(`padding:0 14px 8px; position:relative;`)}>
<button onClick={toggleCycle} style={css(`display:flex; align-items:center; gap:9px; width:100%; padding:9px 11px; border:1px solid #243056; border-radius:8px; background:#111B3C; cursor:pointer; text-align:left;`)} title={"Switch design cycle"}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#7E8AB8"} strokeWidth={"1.7"}><path d={"M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 9.5h16M8.5 3v3.5M15.5 3v3.5"} strokeLinecap={"round"} /></svg>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`font-size:9.5px; font-weight:600; color:#8E9AC4; letter-spacing:0.05em;`)}>DESIGN CYCLE</div>
<div style={css(`font-size:13px; font-weight:600; color:#E8ECF7; line-height:1.2;`)}>{cycleName}</div>
</div>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#7E8AB8"} strokeWidth={"2"}><path d={"M6 9l6 6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</button>
{(cycleOpen) ? (<>
<div onClick={closeCycle} style={css(`position:fixed; inset:0; z-index:40;`)} />
<div style={css(`position:absolute; left:14px; right:14px; top:100%; margin-top:5px; z-index:50; background:#15224A; border:1px solid #2A3866; border-radius:8px; padding:6px; box-shadow:0 14px 34px rgba(0,0,0,0.45);`)}>
<div style={css(`font-size:9.5px; font-weight:700; color:#8E9AC4; letter-spacing:0.05em; padding:6px 8px 4px;`)}>SWITCH CYCLE</div>
{(cycleOptions || []).map((c, __i1) => (<React.Fragment key={__i1}>
<button onClick={c.onSelect} style={css(`display:flex; align-items:center; gap:9px; width:100%; padding:8px 10px; border:none; background:${c.rowBg}; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `background:#1E2C57;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:9px; width:100%; padding:8px 10px; border:none; background:${c.rowBg}; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`, `background:#1E2C57;`)}>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:600; color:#E8ECF7;`)}>{c.name}</div><div style={css(`font-size:10.5px; color:#8E9AC4;`)}>{c.meta}</div></div>
{(c.active) ? (<><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#6E8BFF"} strokeWidth={"2.4"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></>) : null}
</button>
</React.Fragment>))}
<button onClick={toggleCyclePicker} style={css(`display:flex; align-items:center; gap:9px; width:100%; padding:7px 10px; border:none; background:transparent; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `background:#1E2C57;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:9px; width:100%; padding:7px 10px; border:none; background:transparent; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`, `background:#1E2C57;`)}>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:12px; font-weight:500; color:#9AB4FF;`)}>Pick a custom past month…</div></div>
<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#7E8AB8"} strokeWidth={"2.2"}><path d={cyclePickerChevron} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</button>
{(cyclePickerOpen) ? (<>
{(pastCycleOptions || []).map((p, __i2) => (<React.Fragment key={__i2}>
<button onClick={p.onSelect} style={css(`display:flex; align-items:center; gap:9px; width:100%; padding:6px 10px 6px 22px; border:none; background:${p.rowBg}; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `background:#1E2C57;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:9px; width:100%; padding:6px 10px 6px 22px; border:none; background:${p.rowBg}; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit;`, `background:#1E2C57;`)}>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:12px; font-weight:600; color:#C8D4F5;`)}>{p.name}</div><div style={css(`font-size:10px; color:#8E9AC4;`)}>{p.meta}</div></div>
{(p.active) ? (<><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#6E8BFF"} strokeWidth={"2.4"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></>) : null}
</button>
</React.Fragment>))}
</>) : null}
<div style={css(`height:1px; background:#2A3866; margin:5px 6px;`)} />
<button onClick={newCycle} style={css(`display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px; border:none; background:transparent; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit; color:#9AB4FF; font-size:12.5px; font-weight:600;`)} onMouseEnter={(e) => hoverOn(e, `background:#1E2C57;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px; border:none; background:transparent; border-radius:7px; cursor:pointer; text-align:left; font-family:inherit; color:#9AB4FF; font-size:12.5px; font-weight:600;`, `background:#1E2C57;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Start new design cycle</button>
</div>
</>) : null}
</div>
{/* nav */}
<nav style={css(`flex:1; overflow-y:auto; padding:4px 12px 12px;`)}>
{(navGroups || []).map((group, __i4) => (<React.Fragment key={__i4}>
<div style={css(`margin-top:14px;`)}>
<div style={css(`padding:0 8px 7px; font-size:10px; font-weight:700; letter-spacing:0.09em; color:#8E9AC4;`)}>{group.label}</div>
{(group.items || []).map((item, __i3) => (<React.Fragment key={__i3}>
<button type={"button"} onClick={item.onClick} title={item.label} style={css(`position:relative; display:flex; align-items:center; gap:11px; width:100%; height:40px; padding:0 10px 0 14px; margin-bottom:2px; border:none; border-radius:8px; cursor:pointer; font-family:inherit; font-size:13px; text-align:left; background:${item.bg}; color:${item.color}; font-weight:${item.weight}; transition:background 120ms, color 120ms;`)} onMouseEnter={(e) => hoverOn(e, `background:rgba(255,255,255,0.06); color:#E8ECF7;`)} onMouseLeave={(e) => hoverOff(e, `position:relative; display:flex; align-items:center; gap:11px; width:100%; height:40px; padding:0 10px 0 14px; margin-bottom:2px; border:none; border-radius:8px; cursor:pointer; font-family:inherit; font-size:13px; text-align:left; background:${item.bg}; color:${item.color}; font-weight:${item.weight}; transition:background 120ms, color 120ms;`, `background:rgba(255,255,255,0.06); color:#E8ECF7;`)}>
{(item.active) ? (<><span style={css(`position:absolute; left:0; top:9px; bottom:9px; width:3px; border-radius:0 3px 3px 0; background:#2F4FC6;`)} /></>) : null}
<span aria-hidden={"true"} style={css(`flex-shrink:0; width:19px; font-size:18px; line-height:1; text-align:center;`)}>{item.emoji}</span>
<span style={css(`flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{item.label}</span>
{(item.hasBadge) ? (<><span style={css(`display:inline-flex; align-items:center; justify-content:center; min-width:19px; height:18px; padding:0 6px; border-radius:999px; font-size:10px; font-weight:700; background:${item.badgeBg}; color:${item.badgeFg}; letter-spacing:0.02em;`)}>{item.badge}</span></>) : null}
</button>
</React.Fragment>))}
</div>
</React.Fragment>))}
</nav>
{/* footer wordmark */}
<div style={css(`padding:13px 18px; border-top:1px solid #1A2447; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`font-size:13px; font-weight:800; color:#fff; letter-spacing:-0.01em;`)}>valmo</span>
<span style={css(`font-size:10.5px; color:#8E9AC4;`)}>Network Design</span>
</div>
</aside>
{/* ============ MAIN ============ */}
<div style={css(`flex:1; display:flex; flex-direction:column; min-width:0;`)}>
{/* HEADER */}
<header style={css(`height:60px; flex-shrink:0; background:#FFFFFF; border-bottom:1px solid #E6EBF2; display:flex; align-items:center; gap:14px; padding:0 22px; z-index:5;`)}>
<div style={css(`min-width:120px; flex-shrink:0;`)}>
<div style={css(`font-size:15px; font-weight:700; color:#14171F; line-height:1.15;`)}>{moduleTitle}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{moduleSubtitle}</div>
</div>
<div style={css(`flex:1;`)} />
{/* F5 — stub global search demoted to an unobtrusive icon button (still toasts "coming soon") so a dead control isn't the most prominent header input. */}
<button onClick={comingSoonSearch} aria-label={"Search"} title={"Search across sort centres, plans and runs"} style={css(`display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:1px solid #E6EBF2; border-radius:8px; background:#F7F8FB; cursor:pointer; color:#8E96A3; font-family:inherit; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4; color:#5A5E66;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:1px solid #E6EBF2; border-radius:8px; background:#F7F8FB; cursor:pointer; color:#8E96A3; font-family:inherit; flex-shrink:0;`, `border-color:#C3C9D4; color:#5A5E66;`)}>
<svg aria-hidden={"true"} width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
</button>
<div style={css(`display:flex; align-items:center; gap:7px; height:32px; padding:0 12px; border-radius:999px; background:${freezeMiniBg}; color:${freezeMiniFg}; font-size:12px; font-weight:600; white-space:nowrap;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
        {freezeMiniText}
      </div>
{(showPersonaToggle) ? (<>
<div style={css(`display:flex; align-items:center; gap:8px; padding:4px 7px 4px 9px; border:1px dashed #C3C9D4; border-radius:999px;`)} title={"Switch your view — Planner or Ops Lead"}>
<span style={css(`font-size:9.5px; font-weight:700; letter-spacing:0.07em; color:#5A5E66;`)}>View as</span>
<div style={css(`display:flex; background:#F2F5FA; border-radius:999px; padding:2px; gap:2px;`)}>
<button onClick={setPlanner} style={css(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; padding:5px 11px; border-radius:999px; background:${plannerSegBg}; color:${plannerSegFg}; transition:all 140ms;`)}>Planner</button>
<button onClick={setOps} style={css(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; padding:5px 11px; border-radius:999px; background:${opsSegBg}; color:${opsSegFg}; transition:all 140ms;`)}>Ops Lead</button>
</div>
</div>
</>) : null}
<div style={css(`display:flex; align-items:center; gap:9px; padding-left:4px;`)}>
<div style={css(`width:33px; height:33px; border-radius:50%; background:linear-gradient(135deg,#003F98,#2F4FC6); color:#fff; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-weight:700; flex-shrink:0;`)}>{personaInitials}</div>
<div style={css(`line-height:1.2;`)}>
<div style={css(`font-size:12.5px; font-weight:600; color:#14171F; white-space:nowrap;`)}>{personaName}</div>
<div style={css(`font-size:11px; color:#5A5E66; white-space:nowrap;`)}>{personaRole}</div>
</div>
</div>
</header>
{/* IN-MODULE SUB-TABS (Tier-2 only): filters / inner views for the active module.
         Top-level module nav lives solely in the left sidebar. */}
{(lifecycleRail.showRail) ? (<>
{/* Tier-1 flow-stage rail REMOVED (2026-07-06): top-level modules now live ONLY in the left
           sidebar (user decision: "left sidebar only"). This also removes the Ops-Lead's dead
           Design Review / Finalise stage labels (the "empty tab"). Only Tier-2 in-module sub-tabs
           remain below. plannerStages/opsStages logic is now dead — cleaned in a later pass. */}
{/* TIER 2 — sub-tabs for the active stage */}
{(subTabs.show) ? (<>
<div style={css(`flex-shrink:0; background:#fff; border-bottom:1px solid #E6EBF2; display:flex; align-items:center; padding:0 22px 0 16px; height:40px; gap:0; overflow:visible;`)}>
{(subTabs.tabs || []).map((st2, __i5) => (<React.Fragment key={__i5}>
{(st2.disabled) ? (<>
<div style={css(`position:relative; display:flex; align-items:stretch; flex-shrink:0;`)}>
<button disabled={""} style={css(`display:flex; align-items:center; gap:5px; height:40px; padding:0 16px; border:none; background:transparent; cursor:not-allowed; font-family:inherit; font-size:13.5px; font-weight:500; color:#C3C9D4; white-space:nowrap;`)}>
                  {st2.label}
                  {(st2.hasBadge) ? (<><span style={css(`padding:1px 6px; border-radius:999px; font-size:9.5px; font-weight:700; background:#F2F5FA; color:#C3C9D4;`)}>{st2.badge}</span></>) : null}
{/* ⓘ icon for disabled tabs (custom tooltip, no red dot) */}
<span className={"ndc-tip"} style={css(`position:relative; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; color:#C3C9D4; line-height:1;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z"} /></svg><span className={"ndc-tip-pop"}>{st2.tip}</span></span>
</button>
</div>
</>) : null}
{(st2.notDisabled) ? (<>
<div style={css(`position:relative; display:flex; align-items:stretch; flex-shrink:0;`)}>
<button onClick={st2.onClick} style={css(`display:flex; align-items:center; gap:5px; height:40px; padding:0 16px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13.5px; font-weight:${st2.weight}; color:${st2.color}; white-space:nowrap;`)}>
                  {st2.label}
                  {(st2.hasBadge) ? (<><span style={css(`padding:1px 6px; border-radius:999px; font-size:9.5px; font-weight:700; background:${st2.badgeBg}; color:${st2.badgeFg};`)}>{st2.badge}</span></>) : null}
{/* ⓘ icon + custom tooltip + optional red-dot attention badge */}
<span className={"ndc-tip"} style={css(`position:relative; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; color:#8E96A3; line-height:1;`)} onMouseEnter={(e) => hoverOn(e, `color:#5A5E66;`)} onMouseLeave={(e) => hoverOff(e, `position:relative; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; color:#8E96A3; line-height:1;`, `color:#5A5E66;`)}>
<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z"} /></svg>
{(st2.showDot) ? (<>
<span style={css(`position:absolute; top:-2px; right:-2px; width:6px; height:6px; border-radius:50%; background:#D14B4B; border:1.5px solid #fff; flex-shrink:0;`)} />
</>) : null}
<span className={"ndc-tip-pop"}>{st2.tip}</span>
</span>
</button>
{(st2.active) ? (<>
<span style={css(`position:absolute; left:0; right:0; bottom:0; height:2px; background:#003F98; border-radius:2px 2px 0 0;`)} />
</>) : null}
</div>
</>) : null}
</React.Fragment>))}
{/* Search SC lives at the right corner of the tab row (Design Review) */}
{(subTabs.showSearch) ? (<>
<div style={css(`flex:1; min-width:8px;`)} />
<div style={css(`display:flex; align-items:center; gap:7px; height:32px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={subTabs.searchVal} onInput={subTabs.onSearch} placeholder={subTabs.searchPlaceholder} style={css(`border:none; outline:none; font-family:inherit; font-size:12.5px; color:#14171F; background:transparent; width:130px;`)} />
</div>
</>) : null}
</div>
</>) : null}
</>) : null}
{/* CONTENT */}
<main style={css(`flex:1; overflow-y:auto; overflow-x:hidden;`)}>
{/* ===== COMMAND CENTER ===== */}
{(isCommand) ? (<>
<div style={css(`padding:${contentPad}; max-width:1560px; margin:0 auto;`)}>
{(showCoach) ? (<>
<div style={css(`display:flex; align-items:center; gap:24px; padding:12px 18px; margin-bottom:20px; border-radius:8px; background:linear-gradient(100deg,#EAEEFB,#F3F0FB); border:1px solid #D9E0F6;`)}>
<div style={css(`flex-shrink:0; min-width:120px;`)}>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; line-height:1.4;`)}>Here's how this<br />panel works</div>
</div>
<div style={css(`width:1px; height:32px; background:#D9E0F6; flex-shrink:0;`)} />
<div style={css(`display:flex; align-items:center; gap:0; flex:1;`)}>
<div style={css(`padding:0 14px 0 0;`)}>
<div style={css(`font-size:10.5px; font-weight:700; color:#003F98; letter-spacing:0.04em;`)}>① Create the design</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px;`)}>Set inputs (volume · nodes · vehicles), then generate route plans per SC</div>
</div>
<div style={css(`color:#8E96A3; font-size:14px; flex-shrink:0; padding-right:14px;`)}>→</div>
<div style={css(`padding:0 14px 0 0;`)}>
<div style={css(`font-size:10.5px; font-weight:700; color:#003F98; letter-spacing:0.04em;`)}>② Review & align</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px;`)}>Compare generated plans, push to Ops Leads, resolve feedback</div>
</div>
<div style={css(`color:#8E96A3; font-size:14px; flex-shrink:0; padding-right:14px;`)}>→</div>
<div style={css(`padding:0;`)}>
<div style={css(`font-size:10.5px; font-weight:700; color:#003F98; letter-spacing:0.04em;`)}>③ Finalise & hand off</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px;`)}>Acknowledge, freeze the design, and hand it to RFQ</div>
</div>
</div>
<button onClick={dismissCoach} aria-label={"Dismiss"} style={css(`border:none; background:transparent; cursor:pointer; padding:4px; color:#8E96A3; display:flex; flex-shrink:0;`)} title={"Dismiss"}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
</>) : null}
{/* DEADLINE HERO */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:20px 26px; display:flex; flex-wrap:wrap; gap:20px 32px; align-items:center;`)}>
<div style={css(`flex-shrink:0; display:flex; align-items:center; gap:16px; padding-right:28px; border-right:1px solid #E6EBF2;`)}>
<div>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.07em; color:#7A8094; margin-bottom:6px;`)}>TIME TO FREEZE</div>
<div style={css(`display:flex; align-items:center; gap:9px;`)}>
<span style={css(`font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:52px; line-height:1; color:#003F98;`)}>{hero.days}</span>
<span style={css(`font-size:13px; color:#5A5E66; line-height:1.4;`)}>days<br />left</span>
</div>
<div style={css(`display:inline-flex; align-items:center; gap:6px; margin-top:10px; padding:4px 10px; border-radius:999px; background:${hero.healthBg}; color:${hero.healthFg}; font-size:11.5px; font-weight:700;`)}>
<span style={css(`width:6px; height:6px; border-radius:50%; background:${hero.healthDot};`)} />{hero.healthLabel}
                </div>
</div>
</div>
<div style={css(`flex:1; min-width:480px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.07em; color:#7A8094; margin-bottom:14px;`)}>CYCLE MILESTONES</div>
<div style={css(`display:flex; align-items:flex-start;`)}>
{(milestones || []).map((ms, __i6) => (<React.Fragment key={__i6}>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`display:flex; align-items:center;`)}>
<div style={css(`width:11px; height:11px; border-radius:50%; flex-shrink:0; background:${ms.dotBg}; border:2px solid ${ms.dotBorder};`)} />
<div style={css(`flex:1; height:1.5px; background:${ms.lineBg};`)} />
</div>
<div style={css(`margin-top:9px; padding-right:12px;`)}>
<div style={css(`font-size:10.5px; font-weight:600; color:#7A8094;`)}>{ms.date}</div>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; margin-top:2px; line-height:1.25;`)}>{ms.label}</div>
<div style={css(`font-size:11px; color:#5A5E66; margin-top:2px;`)}>{ms.stateLabel}</div>
</div>
</div>
</React.Fragment>))}
</div>
</div>
</div>
{/* WORK QUEUE */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; margin:24px 2px 14px;`)}>
<div>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Ops Alignment</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>Click any tile to jump to the filtered view</div>
</div>
<button onClick={goAlign} style={css(`display:inline-flex; align-items:center; gap:8px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; height:36px; padding:0 16px; border-radius:8px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:8px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; height:36px; padding:0 16px; border-radius:8px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>Open Ops Alignment<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
{(queueGroups || []).map((g, __i8) => (<React.Fragment key={__i8}>
<div style={css(`margin-bottom:22px;`)}>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fill,minmax(232px,1fr)); gap:14px;`)}>
{(g.tiles || []).map((t, __i7) => (<React.Fragment key={__i7}>
<button onClick={t.onClick} style={css(`position:relative; text-align:left; display:flex; flex-direction:column; gap:13px; padding:18px; background:#fff; border:1px solid #E6EBF2; border-radius:13px; cursor:pointer; font-family:inherit; transition:transform 140ms, box-shadow 140ms, border-color 140ms; overflow:hidden; opacity:${t.cardOpacity};`)} onMouseEnter={(e) => hoverOn(e, `transform:translateY(-2px); box-shadow:0 8px 22px rgba(11,20,48,0.10); border-color:#D2DAEA;`)} onMouseLeave={(e) => hoverOff(e, `position:relative; text-align:left; display:flex; flex-direction:column; gap:13px; padding:18px; background:#fff; border:1px solid #E6EBF2; border-radius:13px; cursor:pointer; font-family:inherit; transition:transform 140ms, box-shadow 140ms, border-color 140ms; overflow:hidden; opacity:${t.cardOpacity};`, `transform:translateY(-2px); box-shadow:0 8px 22px rgba(11,20,48,0.10); border-color:#D2DAEA;`)}>
<span style={css(`position:absolute; left:0; top:0; bottom:0; width:3px; background:${t.barBg};`)} />
<div style={css(`display:flex; align-items:center; justify-content:space-between;`)}>
<div style={css(`width:38px; height:38px; border-radius:8px; background:${t.iconBg}; display:flex; align-items:center; justify-content:center;`)}>
<svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={t.iconFg} strokeWidth={"1.8"}><path d={t.iconPath} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</div>
<svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#6B7280"} strokeWidth={"2"}><path d={"M9 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</div>
<div>
<div style={css(`font-family:'Space Grotesk',sans-serif; font-size:34px; font-weight:500; color:${t.numColor}; line-height:1;`)}>{t.num}</div>
<div style={css(`font-size:13px; font-weight:600; color:${t.labelColor}; margin-top:7px;`)}>{t.label}</div>
<div style={css(`display:flex; align-items:center; gap:5px; margin-top:2px;`)}>{(t.overdue) ? (<><span style={css(`width:6px; height:6px; border-radius:50%; background:#D14B4B; flex-shrink:0;`)} /></>) : null}<span style={css(`font-size:11.5px; color:${t.subColor};`)}>{t.sub}</span></div>
</div>
</button>
</React.Fragment>))}
</div>
</div>
</React.Fragment>))}
{/* RUN QUEUE CARD */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; margin:0 2px 22px;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:14px 18px; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`width:34px; height:34px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M4 6h16M4 12h16M4 18h10"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Run queue</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:1px;`)}>DS runs triggered this session — updated live as runs complete</div>
</div>
{(ccRunEmpty) ? (<>
<button onClick={ccRunGoCreate} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Start a design</button>
</>) : null}
{(ccRunNotEmpty) ? (<>
<div style={css(`display:flex; align-items:center; gap:8px;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#F2F5FA; color:#5A5E66;`)}>{ccRunQueuedN} Planned</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>{ccRunProgN} In Progress</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#E7F4EC; color:#128A3E;`)}>{ccRunDoneN} Completed</span>
<button onClick={ccRunGoCreate} style={css(`margin-left:4px; display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `margin-left:4px; display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Add more</button>
</div>
</>) : null}
</div>
{(ccRunEmpty) ? (<>
<div style={css(`display:flex; align-items:center; gap:12px; padding:18px 18px;`)}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M4 6h16M4 12h16M4 18h10"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12.5px; color:#8E96A3;`)}>No runs in progress — trigger a design to see it here.</span>
</div>
</>) : null}
{(ccRunNotEmpty) ? (<>
{(ccRunItems || []).map((ri, __i9) => (<React.Fragment key={__i9}>
<div style={css(`display:flex; align-items:center; gap:14px; padding:10px 18px; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:14px; padding:10px 18px; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`font-size:12.5px; font-weight:700; color:#14171F; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{ri.scCode}</div>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:${ri.statusBg}; color:${ri.statusFg}; flex-shrink:0;`)}>
{(ri.isRunning) ? (<><span style={css(`width:6px; height:6px; border-radius:50%; background:#C77B00; animation:ndcpulse 1s ease-in-out infinite;`)} /></>) : null}
{(ri.isDone) ? (<><svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></>) : null}
                    {ri.statusLabel}
                  </span>
</div>
</React.Fragment>))}
</>) : null}
</div>
{/* SCOPE STRIP */}
<div style={css(`display:flex; flex-wrap:wrap; margin-top:22px; padding:4px 4px; background:#fff; border:1px solid #E6EBF2; border-radius:13px;`)}>
{(scopeStats || []).map((st, __i10) => (<React.Fragment key={__i10}>
<div style={css(`flex:1; min-width:150px; padding:16px 20px; border-right:1px solid #EEF1F6;`)}>
<div style={css(`font-family:'Space Grotesk',sans-serif; font-size:23px; font-weight:500; color:#14171F; line-height:1;`)}>{st.value}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:6px;`)}>{st.label}</div>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
{/* ===== DESIGN INPUTS ===== */}
{(isInputs) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
{/* subtab strip hoisted to Tier-2 nav — hidden here to avoid duplication */}
{/* panels */}
<div style={css(`flex:1; overflow:auto; padding:22px 28px;`)}>
{/* 1.1 LIBRARY-INDEPENDENCE BANNER — always visible, independent of selected tab */}
<div style={css(`display:flex; align-items:center; gap:9px; padding:9px 14px; margin-bottom:18px; background:#F2F5FA; border:1px solid #DDE3ED; border-radius:7px;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg>
<span style={css(`font-size:12px; color:#5A5E66;`)}>Masters — shared across all design cycles. Update anytime; changes aren't tied to a plan cycle.</span>
</div>
{/* VOLUME INPUTS */}
{(isVolumeTab) ? (<>
{/* Active-per-type status strip + per-type upload/template (replaces the 4 permanent empty upload cards) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:13px 15px; margin-bottom:16px;`)}>
<div style={css(`display:flex; align-items:baseline; gap:9px; margin-bottom:11px; flex-wrap:wrap;`)}>
<span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.06em;`)}>ACTIVE THIS CYCLE</span>
<span style={css(`font-size:11.5px; color:#8E96A3;`)}>One file per type feeds design creation · uploads land in the library below · use the ⬇ icon for a template</span>
</div>
<div style={css(`display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;`)}>
{(volActiveStrip || []).map((v, __i11) => (<React.Fragment key={__i11}>
<div style={css(`border:1px solid #E6EBF2; border-radius:8px; padding:10px 12px; background:#FAFBFD; display:flex; flex-direction:column; gap:7px;`)}>
<div style={css(`display:flex; align-items:center; gap:7px;`)}>
<span style={css(`width:7px; height:7px; border-radius:50%; background:${v.dotColor}; flex-shrink:0;`)} />
<span style={css(`font-size:12px; font-weight:700; color:#14171F;`)}>{v.short}</span>
<div style={css(`flex:1;`)} />
<button onClick={v.onTemplate} aria-label={"Download template"} title={`Download ${v.short} template`} style={css(`width:25px; height:25px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:25px; height:25px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66; flex-shrink:0;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M12 4v12M7 11l5 5 5-5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={v.onUpload} aria-label={"Upload file"} title={`Upload / replace ${v.short} file`} style={css(`height:25px; padding:0 10px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:25px; padding:0 10px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; flex-shrink:0;`, `background:#00337D;`)}><svg aria-hidden={"true"} width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 16V4M7 9l5-5 5 5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Upload</button>
</div>
{(v.hasActive) ? (<>
<div style={css(`min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:600; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)} title={v.activeName}>{v.activeName}</div><div style={css(`font-size:10.5px; color:${v.valColor}; margin-top:2px;`)}>{v.statusLabel}</div></div>
</>) : null}
{(v.noActive) ? (<>
<div style={css(`font-size:11.5px; color:#8E96A3;`)}>No active file — upload one to begin</div>
</>) : null}
</div>
</React.Fragment>))}
</div>
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; margin-top:24px;`)}>
<div style={css(`padding:16px 16px 16px;`)}>
<div style={css(`font-size:14px; font-weight:700; color:#14171F; margin-bottom:4px;`)}>Volume file library</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-bottom:16px;`)}>One consolidated library across volume types. Different teams own FM / FMSC / LMDC — filter by type to find theirs. One file is active per cycle.</div>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; height:36px; padding:0 12px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={volSearch} onInput={onVolSearch} placeholder={"Search file or uploader…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12px; color:#14171F; background:transparent; width:170px;`)} />
</div>
<div style={css(`display:flex; gap:8px; flex-wrap:wrap;`)}>
{(volTypeChips || []).map((z, __i12) => (<React.Fragment key={__i12}>
<button onClick={z.onClick} style={css(`border:1px solid ${z.bd}; background:${z.bg}; color:${z.fg}; font-family:inherit; font-size:12px; font-weight:600; padding:6px 12px; border-radius:999px; cursor:pointer;`)}>{z.label}</button>
</React.Fragment>))}
</div>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:12px; color:#5A5E66;`)}>Showing <strong style={css(`color:#14171F;`)}>{volFilesShown}</strong> of <strong style={css(`color:#14171F;`)}>{volFilesTotal}</strong></span>
</div>
</div>
<div style={css(`display:grid; grid-template-columns:minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,1.15fr) minmax(0,1.2fr) minmax(0,1.15fr) minmax(0,0.95fr); background:#F2F5FA; border-top:1px solid #E6EBF2;`)}>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>FILE NAME</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>TYPE</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>ROWS</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>VOLUME</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>UPLOADED</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>UPLOADED BY</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VALIDATION</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>ACTIONS</div>
</div>
{(volumeFiles || []).map((f, __i13) => (<React.Fragment key={__i13}>
<div style={css(`display:grid; grid-template-columns:minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,1.15fr) minmax(0,1.2fr) minmax(0,1.15fr) minmax(0,0.95fr); align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,1.15fr) minmax(0,1.2fr) minmax(0,1.15fr) minmax(0,0.95fr); align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:12px 14px; font-size:13px; font-weight:600; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)} title={f.name}>{f.name}</div>
<div style={css(`padding:12px 14px;`)}><span style={css(`display:inline-flex; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:600; background:#EAEEFB; color:#2F4FC6;`)}>{f.type}</span></div>
<div style={css(`padding:12px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{f.rows}</div>
<div style={css(`padding:12px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{f.vol}</div>
<div style={css(`padding:12px 14px; font-size:12px; color:#5A5E66;`)}>{f.date}</div>
<div style={css(`padding:12px 14px; font-size:12px; color:#14171F;`)}>{f.by}</div>
<div style={css(`padding:10px 14px;`)}>
{(f.hasErrors) ? (<><button onClick={f.onViewErrors} style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${f.valBg}; color:${f.valFg}; border:none; cursor:pointer; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `opacity:0.85;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${f.valBg}; color:${f.valFg}; border:none; cursor:pointer; font-family:inherit;`, `opacity:0.85;`)}>{f.valLabel}</button></>) : null}
{(f.hasNoErrors) ? (<><span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#E7F4EC; color:#128A3E;`)}>✓ Validated</span></>) : null}
</div>
<div style={css(`padding:8px 14px; display:flex; gap:5px; justify-content:flex-end;`)}>
<button onClick={f.downloadCsv} aria-label={"Download CSV"} title={"Download"} style={css(`width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={f.onReplace} aria-label={"Replace file"} title={"Replace"} style={css(`width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={f.onDelete} aria-label={"Delete file"} title={"Delete"} style={css(`width:28px; height:28px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`)} onMouseEnter={(e) => hoverOn(e, `background:#FBEAEA;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`, `background:#FBEAEA;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
</React.Fragment>))}
{(volFilesEmpty) ? (<><div style={css(`padding:26px 16px; text-align:center; font-size:12.5px; color:#5A5E66;`)}>{volEmptyMsg}</div></>) : null}
</div>
</>) : null}
{/* MASTERS */}
{(isMastersTab) ? (<>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:-22px -28px 20px; padding:11px 28px; background:#fff; border-bottom:1px solid #E6EBF2;`)}>
{(mastersTabs || []).map((m, __i14) => (<React.Fragment key={__i14}><button onClick={m.onClick} style={css(`display:flex; align-items:center; gap:7px; padding:6px 12px; border:1px solid ${m.bd}; background:${m.bg}; border-radius:8px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:${m.weight}; color:${m.color};`)}>{m.label}<span className={"ndc-tip"} style={css(`position:relative; display:inline-flex; align-items:center; opacity:0.7;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z"} /></svg><span className={"ndc-tip-pop"}>{m.tip}</span></span></button></React.Fragment>))}
</div>
{(isScMaster) ? (<>
<div style={css(`display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:13px;`)}>
<div style={css(`display:flex; align-items:center; gap:7px; height:36px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={scSearch} onInput={onInputsSearch} placeholder={"Search SC code or name…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12.5px; color:#14171F; background:transparent; width:190px;`)} />
</div>
<div style={css(`display:flex; gap:6px; flex-wrap:wrap;`)}>
{(zoneChips || []).map((z, __i15) => (<React.Fragment key={__i15}>
<button onClick={z.onClick} style={css(`border:1px solid ${z.bd}; background:${z.bg}; color:${z.fg}; font-family:inherit; font-size:12px; font-weight:600; padding:7px 13px; border-radius:999px; cursor:pointer;`)}>{z.label}</button>
</React.Fragment>))}
</div>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:12px; color:#5A5E66;`)}>Showing <strong style={css(`color:#14171F;`)}>{scShown}</strong> of <strong style={css(`color:#14171F;`)}>{scTotal}</strong> SCs</span>
<button onClick={addSc} style={css(`display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} /></svg>Add SC</button>
</div>
{/* 1.7 SC Master — full template columns; 1.8 freeze header via sticky; overflow-x:auto for wide table */}
<div style={css(`display:flex; flex-direction:column; height:calc(100vh - 300px); min-height:360px; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; background:#fff;`)}>
<div style={css(`flex:1; min-height:0; overflow:auto;`)}>
<div style={css(`min-width:1180px;`)}>
<div style={css(`display:grid; grid-template-columns:90px 130px 160px 90px 80px 90px 90px 70px 70px 60px 80px 72px 72px 140px 80px; background:#E6EBF2; position:sticky; top:0; z-index:6;`)}>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>SC CODE</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>NAME</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>CITY, STATE</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>SC TYPE</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>ZONE</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right; white-space:nowrap;`)}>VOL CAP</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right; white-space:nowrap;`)}>SORT CAP</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>NLH DOCKS</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>RLH DOCKS</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>LOCAL TP</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>NON-LOCAL TP</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>OPEN</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center; white-space:nowrap;`)}>CLOSE</div>
<div style={css(`padding:9px 10px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>OPS LEADS</div>
<div style={css(`padding:9px 10px;`)} />
</div>
{(scRows || []).map((s, __i16) => (<React.Fragment key={__i16}>
<div style={css(`display:grid; grid-template-columns:90px 130px 160px 90px 80px 90px 90px 70px 70px 60px 80px 72px 72px 140px 80px; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:90px 130px 160px 90px 80px 90px 90px 70px 70px 60px 80px 72px 72px 140px 80px; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:10px 10px; font-size:12px; font-weight:700; color:#003F98; white-space:nowrap;`)}>{s.code}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{s.name}</div>
<div style={css(`padding:10px 10px; font-size:11.5px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{s.cityState}</div>
<div style={css(`padding:10px 10px;`)}><span style={css(`display:inline-flex; padding:2px 7px; border-radius:999px; font-size:10.5px; font-weight:600; background:#EAEEFB; color:#2F4FC6; white-space:nowrap;`)}>{s.scType}</span></div>
<div style={css(`padding:10px 10px;`)}><span style={css(`display:inline-flex; padding:2px 7px; border-radius:999px; font-size:10.5px; font-weight:600; background:#F2F5FA; color:#5A5E66; white-space:nowrap;`)}>{s.zone}</span></div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap;`)}>{s.volCap}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap;`)}>{s.sortCap}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.nlhDocks}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.rlhDocks}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.localTp}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.nonLocalTp}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.openTime}</div>
<div style={css(`padding:10px 10px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{s.closeTime}</div>
<div style={css(`padding:10px 10px;`)}>
<button onClick={s.togglePoc} style={css(`display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 9px; border:1px solid ${s.pocOpen ? '#003F98' : '#E6EBF2'}; background:${s.pocOpen ? '#EAEEFB' : '#fff'}; color:${s.pocOpen ? '#003F98' : '#5A5E66'}; border-radius:6px; cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:600; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 9px; border:1px solid ${s.pocOpen ? '#003F98' : '#E6EBF2'}; background:${s.pocOpen ? '#EAEEFB' : '#fff'}; color:${s.pocOpen ? '#003F98' : '#5A5E66'}; border-radius:6px; cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:600; white-space:nowrap;`, `border-color:#003F98; color:#003F98;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{s.pocSummary}<svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} style={css(`transform:rotate(${s.pocOpen ? '180deg' : '0deg'}); transition:transform 120ms;`)}><path d={"M6 9l6 6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
<div style={css(`padding:7px 10px; display:flex; gap:4px; justify-content:flex-end;`)}>
<button onClick={s.rowEdit} aria-label={"Edit row"} title={"Edit"} style={css(`width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M14 6l4 4M4 20l4-1 9.5-9.5a2 2 0 00-3-3L5 16z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={s.rowDeleteConfirm} aria-label={"Delete row"} title={"Delete"} style={css(`width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#D14B4B; color:#D14B4B;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:1px solid #E6EBF2; background:#fff; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#D14B4B; color:#D14B4B;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
{(s.pocOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:89;`)} onClick={s.togglePoc} />
<div style={css(`position:fixed; top:${s.pocOpenRect.top}px; left:${s.pocOpenRect.left}px; width:260px; max-height:280px; overflow-y:auto; background:#fff; border:1px solid #E6EBF2; border-radius:10px; box-shadow:0 12px 32px rgba(11,20,48,0.18); z-index:90;`)}>
{(s.pocList.length === 0) ? (<>
<div style={css(`padding:14px; font-size:12px; color:#8E96A3;`)}>No Ops Leads on file for this SC.</div>
</>) : null}
{(s.pocList || []).map((p, __i900) => (<React.Fragment key={__i900}>
<div style={css(`padding:9px 13px; border-bottom:1px solid #F2F5FA;`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; gap:8px;`)}><span style={css(`font-size:12.5px; font-weight:700; color:#14171F;`)}>{p.name}</span><span style={css(`font-size:10px; font-weight:600; color:#2F4FC6; background:#EAEEFB; padding:1px 7px; border-radius:999px; white-space:nowrap;`)}>{p.role}</span></div>
<div style={css(`font-size:11px; color:#8E96A3; margin-top:2px;`)}>{p.email}</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
</React.Fragment>))}
</div>
</div>
{(scMasterPager.showPager) ? (<>
<div style={css(`border-top:1px solid #E6EBF2; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; background:#fff; flex-shrink:0;`)}>
<span style={css(`font-size:12px; color:#5A5E66;`)}>{scMasterPager.pageLabel}</span>
<div style={css(`display:flex; gap:6px; align-items:center;`)}>
<button onClick={scMasterPager.onPrev} aria-label={"Previous page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${scMasterPager.prevCursor}; opacity:${scMasterPager.prevOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
{(scMasterPager.pageButtons || []).map((pb, __i17) => (<React.Fragment key={__i17}>
{(pb.gap) ? (<><span style={css(`font-size:13px; color:#8E96A3; padding:4px 4px;`)}>…</span></>) : null}
{(pb.notGap) ? (<><button onClick={pb.onClick} style={css(`position:relative; border:none; background:transparent; font-family:inherit; font-size:13px; padding:4px 8px; cursor:pointer; color:${pb.color}; font-weight:${pb.weight};`)}>{pb.n}{(pb.active) ? (<><span style={css(`position:absolute; left:6px; right:6px; bottom:0; height:2px; background:#003F98; border-radius:2px;`)} /></>) : null}</button></>) : null}
</React.Fragment>))}
<button onClick={scMasterPager.onNext} aria-label={"Next page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${scMasterPager.nextCursor}; opacity:${scMasterPager.nextOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
</>) : null}
</div>{/* /full-height SC Master */}
</>) : null}
{(isAvail) ? (<>
<div style={css(`display:flex; align-items:center; gap:14px; padding:15px 18px; background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:16px;`)}>
<div style={css(`width:38px; height:38px; border-radius:8px; background:#EAEEFB; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.6"}><path d={"M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:13.5px; font-weight:700; color:#14171F;`)}>Bulk Upload — SC Vehicle Availability</div><div style={css(`font-size:11.5px; color:#5A5E66;`)}>One row per vehicle type per SC · upload replaces all prior records</div></div>
<button onClick={availTemplate} style={css(`display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 4v12M7 11l5 5 5-5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Template</button>
<button onClick={uploadFile} style={css(`display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Upload CSV</button>
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:10px 16px; display:flex; align-items:center; gap:14px; margin-bottom:12px;`)}>
<div style={css(`display:flex; align-items:center; gap:7px; height:36px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff; flex-shrink:0;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={availSearch} onInput={onAvailSearch} placeholder={"Search SC code, name or vehicle…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12.5px; color:#14171F; background:transparent; width:220px;`)} />
</div>
<span style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>{scVehAvailCountLabel}</span>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:11.5px; color:#8E96A3;`)}>Vehicle availability is configured per SC — use Add on each SC below.</span>
</div>
{(scVehAvail || []).map((g, __i22) => (<React.Fragment key={__i22}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:12px; overflow:hidden;`)}>
{/* SC header — mirrors Design-Creation Step 2 Vehicle Configuration cards */}
<div style={css(`display:flex; align-items:center; gap:12px; padding:13px 18px; background:#F9FAFB; border-bottom:1px solid #EEF1F6;`)}>
<div>
<div style={css(`display:flex; align-items:center; gap:9px;`)}>
<span style={css(`font-size:14px; font-weight:700; color:#003F98;`)}>{g.code}</span>
<span style={css(`font-size:13px; color:#14171F;`)}>{g.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; color:#5A5E66; background:#E6EBF2;`)}>{g.zone}</span>
</div>
<div style={css(`display:flex; gap:18px; margin-top:6px;`)}>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>SORT CAP  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{g.sortCap}</span></div>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>ACTIVE NODES  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{g.dcCount}</span></div>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>VEHICLES  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{g.totalCount}</span></div>
</div>
</div>
<div style={css(`flex:1;`)} />
{(g.notAdding) ? (<><button onClick={g.addAvail} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1.5px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1.5px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#EAEEFB;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Add Vehicle</button></>) : null}
{(g.isAdding) ? (<><span style={css(`font-size:12px; color:#5A5E66;`)}>Adding a vehicle…</span></>) : null}
</div>
{(g.isAdding) ? (<>
<div style={css(`padding:14px 18px; background:#F7F9FC; border-bottom:1px solid #EEF1F6;`)}>
<div style={css(`font-size:12px; font-weight:700; color:#003F98; margin-bottom:10px; letter-spacing:0.02em;`)}>{g.addForm.title}</div>
<div style={css(`display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap;`)}>
<div style={css(`flex:1.6; min-width:150px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>VEHICLE TYPE</div><select value={g.addForm.vehicleType} onChange={g.addForm.onTypeChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; outline:none; cursor:pointer; appearance:auto;`)}>{(g.addForm.typeOptions || []).map((o, __i18) => (<React.Fragment key={__i18}><option value={o.value}>{o.label}</option></React.Fragment>))}</select></div>
<div style={css(`flex:0.9; min-width:84px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>VEHICLES</div><input type={"number"} min={"1"} value={g.addForm.count} onInput={g.addForm.onCountChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none; text-align:center;`)} /></div>
<div style={css(`flex:0.9; min-width:96px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>TP LIMIT <span style={css(`font-weight:400; color:#8E96A3;`)}>(VM {g.addForm.vmTp})</span></div><input type={"number"} min={"1"} max={"20"} value={g.addForm.tp} onInput={g.addForm.onTpChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid ${g.addForm.tpBd}; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none; text-align:center;`)} /></div>
<div style={css(`flex:1; min-width:86px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>CAPACITY <span style={css(`font-weight:400; color:#8E96A3;`)}>(VM {g.addForm.vmCap})</span></div><input type={"number"} min={"0"} placeholder={g.addForm.vmCap} value={g.addForm.cap} onInput={g.addForm.onCapChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none; text-align:right; font-variant-numeric:tabular-nums;`)} /></div>
<div style={css(`flex:1; min-width:90px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>DISTANCE</div><div style={css(`height:36px; display:flex; align-items:center; padding:0 10px; border:1px solid #EEF1F6; border-radius:8px; background:#F2F5FA; font-size:13px; color:#5A5E66;`)}>{g.addForm.dist}</div></div>
<div style={css(`flex:1; min-width:108px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>ZONE FEASIBILITY</div><select value={g.addForm.zoneFeas} onChange={g.addForm.onZoneFeasChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; outline:none; cursor:pointer; appearance:auto;`)}><option value={"Both"}>Both</option><option value={"Local"}>Local</option><option value={"Non-Local"}>Non-Local</option></select></div>
<button onClick={g.addForm.onAdd} style={css(`height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>{g.addForm.submitLabel}</button>
<button onClick={g.addForm.onCancel} style={css(`height:36px; padding:0 14px; border:1px solid #D0D5DD; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `color:#14171F; border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 14px; border:1px solid #D0D5DD; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`, `color:#14171F; border-color:#C3C9D4;`)}>Cancel</button>
</div>
{(g.addForm.tpWarn) ? (<><div style={css(`margin-top:10px; font-size:11.5px; color:#C77B00; display:inline-flex; align-items:center; gap:5px;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinejoin={"round"} /><line x1={"12"} y1={"9"} x2={"12"} y2={"13"} /><line x1={"12"} y1={"17"} x2={"12.01"} y2={"17"} strokeWidth={"3"} strokeLinecap={"round"} /></svg>{g.addForm.tpWarnText}</div></>) : null}
</div>
</>) : null}
<div style={css(`display:grid; grid-template-columns:1.6fr 1.1fr 1.1fr 0.95fr 0.85fr 1fr 0.95fr 108px; background:#E6EBF2; position:sticky; top:0; z-index:4;`)}>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE TYPE</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CAPACITY</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DISTANCE LIMIT</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>VEHICLES</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TP LIMIT</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ZONE FEASIBILITY</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>WITHIN LIMIT</div>
<div />
</div>
<div style={css(`max-height:138px; overflow-y:auto;`)}>
{(g.rows || []).map((r, __i21) => (<React.Fragment key={__i21}>
<div style={css(`display:grid; grid-template-columns:1.6fr 1.1fr 1.1fr 0.95fr 0.85fr 1fr 0.95fr 108px; align-items:center; border-top:1px solid #EEF1F6; background:${r.rowEditing ? '#F7F9FC' : 'transparent'};`)}>
{/* VEHICLE TYPE */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px; font-size:12.5px; font-weight:600; color:#14171F;`)}>{r.t}</div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px;`)}><select value={r.draftType} onChange={r.onDraftType} style={css(`width:100%; height:30px; padding:0 6px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; font-weight:600; color:#14171F; background:#fff; outline:none; cursor:pointer; appearance:auto; box-sizing:border-box;`)}>{(r.typeOpts || []).map((to, __i19) => (<React.Fragment key={__i19}><option value={to.value}>{to.label}</option></React.Fragment>))}</select></div></>) : null}
{/* CAPACITY */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.cap}</div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px;`)}><input type={"number"} min={"0"} value={r.draftCap} onInput={r.onDraftCap} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* DISTANCE */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.dist}</div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px;`)}><input type={"number"} min={"0"} value={r.draftDist} onInput={r.onDraftDist} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* VEHICLES COUNT */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{r.cnt}</div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px;`)}><input type={"number"} min={"0"} value={r.draftCnt} onInput={r.onDraftCnt} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:center; background:#fff;`)} /></div></>) : null}
{/* TP LIMIT */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px; text-align:center;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11.5px; font-weight:600; background:#F2F5FA; color:#14171F;`)}>{r.tp}</span></div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px;`)}><input type={"number"} min={"0"} value={r.draftTp} onInput={r.onDraftTp} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:center; background:#fff;`)} /></div></>) : null}
{/* ZONE FEASIBILITY */}
{(r.rowNotEditing) ? (<><div style={css(`padding:11px 14px;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11.5px; font-weight:600; background:${r.zfBg}; color:${r.zfFg};`)}>{r.zf}</span></div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:5px 8px; display:flex; gap:4px; flex-wrap:wrap; align-items:center;`)}>{(r.zfChips || []).map((zc, __i20) => (<React.Fragment key={__i20}><button onClick={zc.onSelect} style={css(`height:26px; padding:0 8px; border:1px solid ${zc.bd}; background:${zc.bg}; color:${zc.fg}; font-family:inherit; font-size:11px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`)}>{zc.label}</button></React.Fragment>))}</div></>) : null}
{/* WITHIN LIMIT (static in both modes) */}
<div style={css(`padding:11px 14px;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${r.vmBg}; color:${r.vmFg};`)}>{r.vmLabel}</span></div>
{/* ACTION CELL */}
{(r.rowNotEditing) ? (<><div style={css(`padding:0 6px; display:flex; align-items:center; justify-content:center; gap:4px;`)}><button onClick={r.onEditAvail} aria-label={"Edit row"} title={"Edit"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button><button onClick={r.rowDelete} aria-label={"Delete row"} title={"Remove"} style={css(`width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`)} onMouseEnter={(e) => hoverOn(e, `background:#FBEAEA;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`, `background:#FBEAEA;`)}><svg aria-hidden={"true"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></div></>) : null}
{(r.rowEditing) ? (<><div style={css(`padding:6px 8px; display:flex; align-items:center; justify-content:flex-end; gap:5px;`)}><button onClick={r.onSaveAvailRow} title={"Save"} style={css(`height:28px; padding:0 11px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:999px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:28px; padding:0 11px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:999px; cursor:pointer;`, `background:#00337D;`)}>Save</button><button onClick={r.onCancelAvailRow} title={"Cancel"} style={css(`height:28px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:999px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#8E96A3;`)} onMouseLeave={(e) => hoverOff(e, `height:28px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:999px; cursor:pointer;`, `border-color:#8E96A3;`)}>Cancel</button></div></>) : null}
</div>
</React.Fragment>))}
</div>
</div>
</React.Fragment>))}
{(availNoResults) ? (<>
<div style={css(`padding:30px 16px; text-align:center; color:#5A5E66; border:1px dashed #C3C9D4; border-radius:8px; background:#FAFBFD; margin-bottom:12px;`)}>
<div style={css(`font-size:13px; font-weight:600; color:#14171F; margin-bottom:3px;`)}>No SC matches your search</div>
<div style={css(`font-size:12px;`)}>Try a different SC code, name, or vehicle type.</div>
</div>
</>) : null}
{(scAvailPager.showPager) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; border-top:1px solid #E6EBF2; padding:12px 16px; display:flex; align-items:center; justify-content:space-between;`)}>
<span style={css(`font-size:12px; color:#5A5E66;`)}>{scAvailPager.pageLabel}</span>
<div style={css(`display:flex; gap:6px; align-items:center;`)}>
<button onClick={scAvailPager.onPrev} aria-label={"Previous page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${scAvailPager.prevCursor}; opacity:${scAvailPager.prevOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
{(scAvailPager.pageButtons || []).map((pb, __i23) => (<React.Fragment key={__i23}>
{(pb.gap) ? (<><span style={css(`font-size:13px; color:#8E96A3; padding:4px 4px;`)}>…</span></>) : null}
{(pb.notGap) ? (<><button onClick={pb.onClick} style={css(`position:relative; border:none; background:transparent; font-family:inherit; font-size:13px; padding:4px 8px; cursor:pointer; color:${pb.color}; font-weight:${pb.weight};`)}>{pb.n}{(pb.active) ? (<><span style={css(`position:absolute; left:6px; right:6px; bottom:0; height:2px; background:#003F98; border-radius:2px;`)} /></>) : null}</button></>) : null}
</React.Fragment>))}
<button onClick={scAvailPager.onNext} aria-label={"Next page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${scAvailPager.nextCursor}; opacity:${scAvailPager.nextOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
</>) : null}
</>) : null}
{(isVehMaster) ? (<>
{/* roadmap banner + "N vehicle types" count banner removed per request */}
<div style={css(`display:flex; align-items:center; gap:12px; margin-bottom:14px;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; padding:10px 14px; background:#EAF1FB; border:1px solid #CFE0F1; border-radius:8px; flex:1;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg>
<span style={css(`font-size:12px; color:#1E6FB8; font-weight:600;`)}>Touch Point Limit is the hard cap — SC Vehicle Availability cannot exceed this</span>
</div> {(addVehNotOpen) ? (<><button onClick={addVehType} style={css(`display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} /></svg>Add Vehicle Type</button></>) : null}
{(addVehOpen) ? (<><span style={css(`font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{addVehInlineHint}</span></>) : null}
</div>
{/* INLINE ADD / EDIT VEHICLE TYPE PANEL */}
{(addVehOpen) ? (<>
<div style={css(`background:#F7F9FC; border:1px solid #E6EBF2; border-radius:8px; padding:14px 16px; margin-bottom:12px;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#14171F; margin-bottom:12px;`)}>{addVehModalTitle}</div>
{/* §8 — single-line add/edit row (fields + LH Feasibility + actions inline, mirrors the SC Vehicle Availability add form) */}
<div style={css(`display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;`)}>
<div style={css(`flex:1.4; min-width:126px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>Vehicle Type<span style={css(`color:#D14B4B;`)}> *</span></div>
<input value={addVehVtype} onInput={onAddVehVtype} placeholder={"e.g. 20ft"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1; min-width:96px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>Capacity</div>
<input type={"number"} min={"0"} value={addVehCapacity} onInput={onAddVehCapacity} placeholder={"0"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1; min-width:96px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>Dist (KM)</div>
<input type={"number"} min={"0"} value={addVehDist} onInput={onAddVehDist} placeholder={"0"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1; min-width:100px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>TP Hard Cap<span style={css(`color:#D14B4B;`)}> *</span></div>
<input type={"number"} min={"0"} value={addVehHardCap} onInput={onAddVehHardCap} placeholder={"0"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1; min-width:92px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>TP Local</div>
<input type={"number"} min={"0"} value={addVehLocalTp} onInput={onAddVehLocalTp} placeholder={"0"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1; min-width:104px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>TP Non-Local</div>
<input type={"number"} min={"0"} value={addVehNonLocalTp} onInput={onAddVehNonLocalTp} placeholder={"0"} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; box-sizing:border-box; background:#fff;`)} />
</div>
<div style={css(`flex:1.4; min-width:150px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:5px;`)}>LH Feasibility</div>
<div style={css(`display:flex; flex-wrap:wrap; gap:6px;`)}>
{(addVehFeasChips || []).map((fc, __i24) => (<React.Fragment key={__i24}>
<button type={"button"} onClick={fc.onToggle} aria-pressed={fc.on} style={css(`display:inline-flex; align-items:center; height:36px; padding:0 13px; border:1px solid ${fc.bd}; background:${fc.bg}; color:${fc.fg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)}>{fc.label}</button>
</React.Fragment>))}
</div>
</div>
<button onClick={closeAddVeh} style={css(`height:36px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)}>Cancel</button>
<button onClick={submitAddVeh} style={css(`height:36px; padding:0 20px; border:none; background:${addVehBtnBg}; color:${addVehBtnFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${addVehBtnCursor}; white-space:nowrap;`)}>{addVehSubmitLabel}</button>
</div>
</div>
</>) : null}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
{/* 1.8 Vehicle Master — sticky header */}
<div style={css(`display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1.2fr 84px; background:#E6EBF2; position:sticky; top:0; z-index:4;`)}>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE TYPE</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CAPACITY (SHIPMENTS)</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DISTANCE LIMIT (KMS)</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TOUCH POINT LIMIT</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LH FEASIBILITY</div>
<div style={css(`padding:10px 14px;`)} />
</div>
<div style={css(`max-height:360px; overflow-y:auto;`)}>
{(vehMaster || []).map((v, __i27) => (<React.Fragment key={__i27}>
<div style={css(`display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1.2fr 84px; align-items:center; border-top:1px solid #EEF1F6; background:${v.editing ? '#F7F9FC' : 'transparent'};`)}>
{/* VEHICLE TYPE */}
{(v.notEditing) ? (<><div style={css(`padding:13px 14px; font-size:13px; font-weight:700; color:#14171F;`)}>{v.name}</div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px;`)}><input value={v.draftVtype} onInput={v.onDraftVtype} placeholder={"Vehicle type"} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; font-weight:700; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; background:#fff;`)} /></div></>) : null}
{/* CAPACITY */}
{(v.notEditing) ? (<><div style={css(`padding:13px 14px; text-align:right; font-size:13px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{v.capacity}</div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px;`)}><input type={"number"} min={"0"} value={v.draftCap} onInput={v.onDraftCap} placeholder={"0"} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* DISTANCE */}
{(v.notEditing) ? (<><div style={css(`padding:13px 14px; text-align:right; font-size:13px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{v.dist} km</div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px;`)}><input type={"number"} min={"0"} value={v.draftDist} onInput={v.onDraftDist} placeholder={"0"} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* TOUCH POINT LIMIT */}
{(v.notEditing) ? (<><div style={css(`padding:13px 14px; display:flex; justify-content:center;`)}><span style={css(`display:inline-flex; min-width:28px; height:24px; align-items:center; justify-content:center; padding:0 9px; border-radius:999px; background:#EAF1FB; color:#1E6FB8; font-size:12.5px; font-weight:700;`)}>{v.tp}</span></div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px;`)}><input type={"number"} min={"0"} value={v.draftTp} onInput={v.onDraftTp} placeholder={"0"} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:center; background:#fff;`)} /></div></>) : null}
{/* LH FEASIBILITY */}
{(v.notEditing) ? (<><div style={css(`padding:10px 14px; display:flex; flex-wrap:wrap; gap:6px;`)}>{(v.feas || []).map((lf, __i25) => (<React.Fragment key={__i25}><span style={css(`padding:3px 10px; border-radius:6px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{lf}</span></React.Fragment>))}</div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px; display:flex; flex-wrap:wrap; gap:5px; align-items:center;`)}>{(v.evFeasChips || []).map((fc, __i26) => (<React.Fragment key={__i26}><button onClick={fc.onToggle} style={css(`height:26px; padding:0 9px; border:1px solid ${fc.bd}; background:${fc.bg}; color:${fc.fg}; font-family:inherit; font-size:11px; font-weight:600; border-radius:999px; cursor:pointer;`)}>{fc.label}</button></React.Fragment>))}</div></>) : null}
{/* ACTION CELL */}
{(v.notEditing) ? (<><div style={css(`padding:7px 14px; display:flex; justify-content:flex-end; gap:6px;`)}><button onClick={v.onEdit} title={"Edit vehicle type"} aria-label={`Edit ${v.name}`} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button><button onClick={v.onDeleteConfirm} title={"Remove vehicle type"} aria-label={`Remove ${v.name}`} style={css(`width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`)} onMouseEnter={(e) => hoverOn(e, `background:#FBEAEA;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`, `background:#FBEAEA;`)}><svg aria-hidden={"true"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></div></>) : null}
{(v.editing) ? (<><div style={css(`padding:7px 10px; display:flex; justify-content:flex-end; gap:6px;`)}><button onClick={v.onSaveRow} title={"Save changes"} style={css(`height:30px; padding:0 12px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 12px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>Save</button><button onClick={v.onCancelRow} title={"Cancel"} style={css(`height:30px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#8E96A3;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer;`, `border-color:#8E96A3;`)}>Cancel</button></div></>) : null}
</div>
</React.Fragment>))}
</div>{/* /max-height Vehicle Master body */}
</div>
</>) : null}
</>) : null}
{/* NODE INPUTS */}
{(isNodesTab) ? (<>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:-22px -28px 20px; padding:11px 28px; background:#fff; border-bottom:1px solid #E6EBF2;`)}>
{(nodeSteps || []).map((ns, __i28) => (<React.Fragment key={__i28}><button onClick={ns.onClick} style={css(`display:flex; align-items:center; gap:7px; padding:6px 12px; border:1px solid ${ns.bd}; background:${ns.bg}; border-radius:8px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:${ns.weight}; color:${ns.color};`)}>{ns.label}<span className={"ndc-tip"} style={css(`position:relative; display:inline-flex; align-items:center; opacity:0.7;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z"} /></svg><span className={"ndc-tip-pop"}>{ns.tip}</span></span></button></React.Fragment>))}
</div>
{(nstepActive) ? (<>
{/* AutoDML read-only info banner removed per request */}
{/* Show filter + 6-stat summary live below the gate banner */}
{/* §2: AutoDML is read-only / refer-only — the "Resolve flagged inputs · Re-run check" gate was removed (nothing is actionable here; flags are reference-only). */}
{(gate.clean) ? (<>
<div style={css(`display:flex; align-items:center; gap:16px; padding:16px 20px; margin-bottom:16px; background:#E7F4EC; border:1px solid #B6E0C6; border-radius:8px;`)}>
<div style={css(`width:40px; height:40px; border-radius:8px; background:#C6E9D3; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1;`)}><div style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Inputs clean — ready to plan</div><div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>All AutoDML checks passed.</div></div>
<button onClick={startCreation} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Start Design Creation<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</>) : null}
{/* 3 stat cards */}
<div style={css(`display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px;`)}>
{(nodeStats || []).map((s, __i29) => (<React.Fragment key={__i29}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 18px;`)}>
<div style={css(`font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:500; color:${s.color}; line-height:1;`)}>{s.n}</div>
<div style={css(`font-size:12.5px; font-weight:700; color:#14171F; margin-top:8px;`)}>{s.label}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px;`)}>{s.sub}</div>
</div>
</React.Fragment>))}
</div>
{/* Validation warnings filter cards */}
<div style={css(`display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px;`)}>
{(autodmlFilterCards || []).map((fc, __i30) => (<React.Fragment key={__i30}>
<button onClick={fc.onClick} style={css(`position:relative; text-align:left; background:${fc.bg}; border:1px solid ${fc.bd}; border-radius:8px; padding:14px 16px; cursor:pointer; font-family:inherit; transition:border-color 120ms, background 120ms;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C77B00;`)} onMouseLeave={(e) => hoverOff(e, `position:relative; text-align:left; background:${fc.bg}; border:1px solid ${fc.bd}; border-radius:8px; padding:14px 16px; cursor:pointer; font-family:inherit; transition:border-color 120ms, background 120ms;`, `border-color:#C77B00;`)}>
{(fc.dotShow) ? (<><span style={css(`position:absolute; top:10px; right:10px; width:7px; height:7px; border-radius:50%; background:#C77B00;`)} /></>) : null}
<div style={css(`font-family:'Space Grotesk',sans-serif; font-size:26px; font-weight:500; color:${fc.countColor}; line-height:1;`)}>{fc.count}</div>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; margin-top:8px; line-height:1.3;`)}>{fc.label}</div>
<div style={css(`font-size:11px; color:#5A5E66; margin-top:3px;`)}>{fc.sub}</div>
</button>
</React.Fragment>))}
</div>
{/* LMSC filter + count + CSV */}
<div style={css(`display:flex; align-items:center; gap:10px; margin-bottom:12px;`)}>
<span style={css(`font-size:12px; font-weight:700; color:#5A5E66;`)}>LMSC</span>
<div style={css(`display:flex; align-items:center; gap:7px; height:34px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg><input value={nodeLmscSearch} onInput={onNodeLmscSearch} placeholder={"All LMSCs…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12px; color:#14171F; background:transparent; width:130px;`)} /></div>
{(nodeFilterDirty) ? (<><button onClick={clearNodeFilters} style={css(`border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; padding:5px 10px; border-radius:999px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; padding:5px 10px; border-radius:999px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Clear ✕</button></>) : null}
<div style={css(`flex:1;`)} />
<span style={css(`font-size:12px; color:#5A5E66;`)}><strong style={css(`color:#14171F;`)}>{nodeCountLabel}</strong></span>
<button onClick={onDownloadNodeCsv} aria-label={"Download AutoDML node view as CSV"} style={css(`display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 4v12M7 11l5 5 5-5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Download CSV</button>
</div>
{/* Node table (fix 1.5) — columns: LMSC Code · LMDC Code · LMSC Capacity · LMDC Capacity · LMSC Active · LMDC Active */}
{(nodeEmpty) ? (<>
<div style={css(`padding:32px 24px; text-align:center; color:#5A5E66; border:1px dashed #C3C9D4; border-radius:8px; background:#FAFBFD; margin-bottom:16px;`)}>
<svg width={"30"} height={"30"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"2.2"} style={css(`margin-bottom:6px;`)}><circle cx={"11"} cy={"11"} r={"7"} /><path d={"M21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<div style={css(`font-size:13px; font-weight:600; color:#14171F; margin-bottom:3px;`)}>No nodes for this filter</div>
<div style={css(`font-size:12px;`)}>Try a different SHOW filter or LMSC, or clear the filters.</div>
</div>
</>) : null}
{(nodeShown) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; margin-bottom:16px;`)}>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr; background:#E6EBF2; position:sticky; top:0; z-index:4;`)}>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMSC CODE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMDC CODE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>LMSC CAPACITY</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>LMDC CAPACITY</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>LMSC ACTIVE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>LMDC ACTIVE</div>
</div>
<div style={css(`max-height:calc(100vh - 470px); min-height:220px; overflow-y:auto;`)}>
{(nodeRows || []).map((r, __i31) => (<React.Fragment key={__i31}>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:9px 13px; font-size:12px; font-weight:700; color:#003F98; font-variant-numeric:tabular-nums;`)}>{r.lmsc}</div>
<div style={css(`padding:9px 13px; font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{r.lmdc}</div>
<div style={css(`padding:9px 13px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.lmscCapStr}</div>
<div style={css(`padding:9px 13px; font-size:12px; color:${r.capColor}; font-weight:${r.capWeight}; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.capStr}</div>
<div style={css(`padding:9px 13px; text-align:center;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${r.lmscActiveBg}; color:${r.lmscActiveFg};`)}>{r.lmscActiveLabel}</span></div>
<div style={css(`padding:9px 13px; text-align:center;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${r.lmdcActiveBg}; color:${r.lmdcActiveFg};`)}>{r.lmdcActiveLabel}</span></div>
</div>
</React.Fragment>))}
</div>
{(autodmlPager.showPager) ? (<>
<div style={css(`border-top:1px solid #E6EBF2; padding:12px 16px; display:flex; align-items:center; justify-content:space-between;`)}>
<span style={css(`font-size:12px; color:#5A5E66;`)}>{autodmlPager.pageLabel}</span>
<div style={css(`display:flex; gap:6px; align-items:center;`)}>
<button onClick={autodmlPager.onPrev} aria-label={"Previous page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${autodmlPager.prevCursor}; opacity:${autodmlPager.prevOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
{(autodmlPager.pageButtons || []).map((pb, __i32) => (<React.Fragment key={__i32}>
{(pb.gap) ? (<><span style={css(`font-size:13px; color:#8E96A3; padding:4px 4px;`)}>…</span></>) : null}
{(pb.notGap) ? (<><button onClick={pb.onClick} style={css(`position:relative; border:none; background:transparent; font-family:inherit; font-size:13px; padding:4px 8px; cursor:pointer; color:${pb.color}; font-weight:${pb.weight};`)}>{pb.n}{(pb.active) ? (<><span style={css(`position:absolute; left:6px; right:6px; bottom:0; height:2px; background:#003F98; border-radius:2px;`)} /></>) : null}</button></>) : null}
</React.Fragment>))}
<button onClick={autodmlPager.onNext} aria-label={"Next page"} style={css(`width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:1px solid #E6EBF2; border-radius:8px; background:#fff; color:#5A5E66; cursor:${autodmlPager.nextCursor}; opacity:${autodmlPager.nextOpacity};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
</>) : null}
</div>
</>) : null}
</>) : null}
{(nstepChanges) ? (<>
{/* heading dropped (duplicates the sub-tab name); page starts at the upload section, LAST UPLOADED kept top-right */}
<div style={css(`display:flex; align-items:center; justify-content:flex-end; margin-bottom:10px;`)}>
<div style={css(`display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:#5A5E66; white-space:nowrap;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.7"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:700; letter-spacing:0.03em; color:#8E96A3;`)}>LAST UPLOADED</span>
<span style={css(`font-weight:600; color:#14171F;`)}>{nodeChangeUploadedBy} · {nodeChangeUploadedDate}</span>
</div>
</div>
<div style={css(`display:flex; align-items:center; gap:14px; padding:15px 18px; border:1.5px dashed #C3C9D4; border-radius:8px; background:#FAFBFD; margin-bottom:16px;`)}>
<div style={css(`width:40px; height:40px; border-radius:8px; background:#EAEEFB; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.8"}><path d={"M12 16V4M7 9l5-5 5 5M4 20h16"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1;`)}><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>Upload node changes</div><div style={css(`font-size:11.5px; color:#5A5E66;`)}>Single CSV — additions, closures & migrations in one file · <strong style={css(`color:#C77B00;`)}>override</strong>: the latest upload fully replaces all prior node-change data (not appended)</div></div>
<button onClick={changesTemplate} style={css(`display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Template</button>
<button onClick={uploadNodeChanges} style={css(`display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 15px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 15px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Upload CSV</button>
</div>
{/* 1.6 UNIFIED additions · closures · migrations table */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; margin-bottom:18px;`)}>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; background:#E6EBF2; position:sticky; top:0; z-index:4;`)}>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMSC CODE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMDC CODE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>NODE FLAG</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>LMDC LATITUDE</div>
<div style={css(`padding:10px 13px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>LMDC LONGITUDE</div>
</div>
{(nodeChanges || []).map((nc, __i33) => (<React.Fragment key={__i33}>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:1fr 1fr 1fr 1fr 1fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:10px 13px; font-size:12.5px; font-weight:700; color:#003F98;`)}>{nc.lmscCode}</div>
<div style={css(`padding:10px 13px; font-size:12.5px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{nc.lmdcCode}</div>
<div style={css(`padding:10px 13px;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${nc.flagBg}; color:${nc.flagFg};`)}>{nc.flag}</span></div>
<div style={css(`padding:10px 13px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{nc.lat}</div>
<div style={css(`padding:10px 13px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{nc.lng}</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
</>) : null}
{/* DESIGN INGESTION */}
{(isIngestionTab) ? (<>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:-22px -28px 20px; padding:11px 28px; background:#fff; border-bottom:1px solid #E6EBF2;`)}>
{(ingTabs || []).map((t, __i34) => (<React.Fragment key={__i34}><button onClick={t.onClick} style={css(`display:flex; align-items:center; gap:7px; padding:6px 12px; border:1px solid ${t.bd}; background:${t.bg}; border-radius:8px; cursor:pointer; font-family:inherit; font-size:12px; font-weight:${t.weight}; color:${t.color};`)}>{t.label}<span className={"ndc-tip"} style={css(`position:relative; display:inline-flex; align-items:center; opacity:0.7;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M12 16v-4M12 8h.01M12 21a9 9 0 100-18 9 9 0 000 18z"} /></svg><span className={"ndc-tip-pop"}>{t.tip}</span></span>{(t.soon) ? (<><span style={css(`padding:1px 6px; border-radius:999px; font-size:9px; font-weight:700; background:#EDEFF3; color:#5A5E66;`)}>SOON</span></>) : null}</button></React.Fragment>))}
</div>
{/* Ingestion summary dashboard */}
<div style={css(`display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px;`)}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 18px;`)}>
<div style={css(`font-size:22px; font-weight:700; color:#14171F; font-variant-numeric:tabular-nums;`)}>{ingTotalRows}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:3px;`)}>Total rows</div>
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 18px;`)}>
<div style={css(`font-size:22px; font-weight:700; color:#128A3E; font-variant-numeric:tabular-nums;`)}>{ingErrors}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:3px;`)}>Validation errors</div>
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 18px;`)}>
<div style={css(`font-size:22px; font-weight:700; color:#14171F; font-variant-numeric:tabular-nums;`)}>{ingCount}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:3px;`)}>Plans submitted</div>
</div>
</div>
{/* Upload card */}
<div style={css(`display:flex; align-items:center; gap:14px; padding:15px 18px; border:1.5px dashed #C3C9D4; border-radius:8px; background:#FAFBFD; margin-bottom:16px;`)}>
<div style={css(`width:40px; height:40px; border-radius:8px; background:#EAEEFB; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"20"} height={"20"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.8"}><path d={"M12 16V4M7 9l5-5 5 5M4 20h16"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1;`)}><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>Ingest an external RLH plan</div><div style={css(`font-size:11.5px; color:#5A5E66;`)}>CSV · template enforced · validated then eligible to push for alignment</div></div>
<button onClick={ingestTemplate} style={css(`height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Template</button>
<button onClick={uploadFile} style={css(`height:36px; padding:0 15px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 15px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Ingest CSV</button>
</div>
{/* Recently ingested list */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
<div style={css(`padding:12px 16px; border-bottom:1px solid #E6EBF2; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>Recently ingested</span>
{(ingHasPlans) ? (<><span style={css(`padding:1px 8px; border-radius:999px; font-size:11px; font-weight:600; background:#E7F4EC; color:#128A3E;`)}>{ingCount}</span></>) : null}
</div>
{(ingHasPlans) ? (<>
<div style={css(`display:grid; grid-template-columns:2fr 1.2fr 1.2fr 0.9fr 0.85fr; border-bottom:1px solid #EEF1F6; background:#F9FAFB;`)}>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>FILENAME</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>UPLOADED BY</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>TIMESTAMP</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>ROWS</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>STATUS</div>
</div>
{(ingPlans || []).map((p, __i35) => (<React.Fragment key={__i35}>
<div style={css(`display:grid; grid-template-columns:2fr 1.2fr 1.2fr 0.9fr 0.85fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:2fr 1.2fr 1.2fr 0.9fr 0.85fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:11px 14px;`)}><span style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{p.name}</span><div style={css(`font-size:11px; color:#8E96A3; margin-top:2px;`)}>{p.runId}</div></div>
<div style={css(`padding:11px 14px; font-size:12px; color:#14171F;`)}>{p.by}</div>
<div style={css(`padding:11px 14px; font-size:12px; color:#5A5E66;`)}>{p.date}</div>
<div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{p.rows}</div>
<div style={css(`padding:11px 14px;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#E7F4EC; color:#128A3E;`)}>Validated</span></div>
</div>
</React.Fragment>))}
</>) : null}
{(ingNoPlans) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.5"}><path d={"M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5M9 13h6M9 17h4"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`font-size:13.5px; font-weight:600; color:#14171F; margin-top:12px;`)}>No external plans uploaded for this cycle.</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-top:5px; max-width:360px; line-height:1.5;`)}>Use <strong>Ingest CSV</strong> above to add an externally-built RLH plan. It will appear here once validated.</div>
</div>
</>) : null}
</div>
</>) : null}
</div>
</div>
{/* ADD SORT CENTRE MODAL */}
{(addScOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:80; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:880px; max-width:100%; max-height:92vh; overflow:auto; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3);`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #E6EBF2; position:sticky; top:0; background:#fff; z-index:1;`)}>
<div style={css(`font-size:17px; font-weight:700; color:#14171F;`)}>{addScTitle}</div>
<button onClick={closeAddSc} aria-label={"Close dialog"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex;`)}><svg aria-hidden={"true"} width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`padding:22px 24px;`)}>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px 18px;`)}>
{(addScMain || []).map((f, __i37) => (<React.Fragment key={__i37}>
<div>
<div style={css(`font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:6px;`)}>{f.label}{(f.req) ? (<><span style={css(`color:#D14B4B;`)}> *</span></>) : null}</div>
{(f.isSelect) ? (<><select value={f.value} onChange={f.onInput} style={css(`width:100%; height:38px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none; background:#fff;`)}>{(f.options || []).map((o, __i36) => (<React.Fragment key={__i36}><option value={o.value}>{o.label}</option></React.Fragment>))}</select></>) : null}
{(f.isTime) ? (<><input type={"time"} value={f.value} onInput={f.onInput} style={css(`width:100%; height:38px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none;`)} /></>) : null}
{(f.isText) ? (<><input value={f.value} onInput={f.onInput} placeholder={f.ph} style={css(`width:100%; height:38px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none;`)} /></>) : null}
</div>
</React.Fragment>))}
</div>
<div style={css(`display:flex; align-items:center; gap:8px; margin:20px 0 14px; padding:10px 13px; background:#EAF1FB; border:1px solid #CFE0F1; border-radius:8px;`)}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2zM4 7l8 6 8-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12px; color:#14171F;`)}>Contact fields below are email IDs (ops contacts).</span>
</div>
<div style={css(`display:grid; grid-template-columns:1fr 1fr; gap:14px 18px;`)}>
{(addScContacts || []).map((c, __i38) => (<React.Fragment key={__i38}>
<div>
<div style={css(`font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#5A5E66; margin-bottom:6px;`)}>{c.label}</div>
<input value={c.value} onInput={c.onInput} placeholder={c.ph} style={css(`width:100%; height:38px; padding:0 10px; border:1px solid #C3C9D4; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; outline:none;`)} />
</div>
</React.Fragment>))}
</div>
</div>
<div style={css(`display:flex; align-items:center; justify-content:flex-end; gap:12px; padding:16px 24px; border-top:1px solid #E6EBF2; background:#FAFBFD; position:sticky; bottom:0;`)}>
<button onClick={closeAddSc} style={css(`height:38px; padding:0 18px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={submitAddSc} style={css(`height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>{addScSubmitLabel}</button>
</div>
</div>
</div>
</>) : null}
</>) : null}
{/* ===== DESIGN CREATION ===== */}
{(isCreation) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
{/* Design-cycle blue banner removed (2026-07-06) — the cycle + progress live in the sidebar cycle selector. */}
{/* Network-tier selector (placeholder): RLH is built; NLH & FM Carting arrive in a future
               cycle. Re-added so Design Creation is future-ready for more than RLH (see the removed
               "plan-input-type selector" note at Step 1). Mirrors the Design-Ingestion tab pattern. */}
<div style={css(`display:flex; align-items:center; gap:12px; padding:11px 28px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0;`)}>
<span style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>ROUTE PLANNING</span>
<div style={css(`display:flex; gap:6px;`)}>
{(creationTierSeg || []).map((ct, __i39) => (<React.Fragment key={__i39}><button onClick={ct.onClick} title={ct.sub} style={css(`display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 13px; border:1px solid ${ct.bd}; background:${ct.bg}; color:${ct.fg}; font-family:inherit; font-size:12.5px; font-weight:${ct.weight}; border-radius:8px; cursor:pointer;`)}>{ct.label}{(ct.soon) ? (<><span style={css(`padding:1px 6px; border-radius:999px; font-size:9px; font-weight:700; background:#F2F5FA; color:#8E96A3;`)}>SOON</span></>) : null}</button></React.Fragment>))}
</div>
</div>
{/* ===== WIZARD VIEW (Input Selection tab) ===== */}
{(isWizardView) ? (<>
{/* stepper */}
<div style={css(`display:flex; align-items:center; padding:16px 28px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0;`)}>
{(stepper || []).map((s, __i40) => (<React.Fragment key={__i40}>
<div style={css(`display:flex; align-items:center; flex:${s.flex}; min-width:0;`)}>
<button onClick={s.onClick} style={css(`display:flex; align-items:center; gap:10px; border:none; background:transparent; cursor:pointer; font-family:inherit; flex-shrink:0; padding:0;`)}>
<span style={css(`width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12.5px; font-weight:700; background:${s.numBg}; color:${s.numFg}; border:1.5px solid ${s.numBd}; box-shadow:${s.numShadow}; flex-shrink:0; transition:background 140ms, box-shadow 140ms;`)}>
{(s.isDone) ? (<><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#fff"} strokeWidth={"2.4"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></>) : null}
{(s.notDone) ? (<>{s.n}</>) : null}
</span>
<span style={css(`display:flex; flex-direction:column; align-items:flex-start; line-height:1.25;`)}><span style={css(`font-size:13px; font-weight:${s.labelWeight}; color:${s.labelColor}; white-space:nowrap;`)}>{s.label}</span><span style={css(`font-size:9.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${s.subColor};`)}>{s.subLabel}</span></span>
</button>
{(s.hasLine) ? (<><div style={css(`flex:1; height:3px; border-radius:3px; background:${s.lineBg}; margin:0 16px; min-width:20px;`)} /></>) : null}
</div>
</React.Fragment>))}
</div>
{/* step body */}
<div style={css(`flex:1; overflow:auto; padding:22px 28px; background:#fff;`)}>
{/* ROUND-TRIP RESUME BANNER: shown when the planner came here to fix a blocker and can jump back to where they were */}
{(showResume) ? (<>
<div style={css(`display:flex; align-items:center; gap:12px; padding:11px 16px; margin-bottom:18px; background:#EAF0FB; border:1px solid #C5D4F0; border-radius:8px;`)}>
<svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.9"} style={css(`flex-shrink:0;`)}><path d={"M3 12a9 9 0 109-9 9 9 0 00-6.4 2.7L3 8M3 4v4h4"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12.5px; color:#14171F; font-weight:600;`)}>Fixing inputs for your run</span>
<span style={css(`font-size:12px; color:#5A5E66;`)}>· make your changes, then jump back to finish triggering.</span>
<div style={css(`flex:1;`)} />
<button onClick={onResume} style={css(`display:inline-flex; align-items:center; gap:7px; height:32px; padding:0 14px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}>{resumeLabel}<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</>) : null}
{/* STEP 1 SELECT LMDC VOLUME FILE */}
{/* A. Plan-input-type selector removed — RLH creation uses only LMDC Landing volume.
                 FM / FMSC volumes belong to future NLH / FM-carting tabs, not here. */}
{(isStep1) ? (<>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Select LMDC volume file</div>
<div style={css(`font-size:12px; color:#5A5E66; margin:2px 0 12px;`)}>Showing the last 4 uploaded LMDC Landing files for this cycle. Pick one to activate for RLH route planning, then select sort centres below.</div>
{/* 2.3: Search bar for volume file selection */}
<div style={css(`display:flex; align-items:center; gap:7px; height:36px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff; max-width:360px; margin-bottom:12px;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={creationVolSearch} onInput={onVolSearch} placeholder={"Search volume files…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12.5px; color:#14171F; background:transparent; flex:1;`)} />
</div>
{/* Files (LMDC Landing only, last 4) */}
{(planTypeHasFiles) ? (<>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:12px; margin-bottom:22px;`)}>
{(volOptions || []).map((o, __i41) => (<React.Fragment key={__i41}>
<button onClick={o.onSelect} style={css(`display:flex; align-items:center; gap:13px; text-align:left; padding:18px; border:1.5px solid ${o.bd}; background:${o.bg}; border-radius:8px; cursor:pointer; font-family:inherit;`)}>
<span style={css(`width:20px; height:20px; border-radius:50%; border:2px solid ${o.dotBd}; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><span style={css(`width:10px; height:10px; border-radius:50%; background:${o.dotBg}; opacity:${o.dotOp};`)} /></span>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{o.name}</div><div style={css(`font-size:11.5px; color:#5A5E66; margin-top:3px;`)}>{o.rows} LMDC rows · {o.vol} shipments</div></div>
</button>
</React.Fragment>))}
</div>
{(volFilesEmpty) ? (<><div style={css(`padding:16px 0 10px; text-align:center; font-size:12.5px; color:#5A5E66;`)}>No volume files match this search.</div></>) : null}
</>) : null}
{/* Empty state */}
{(planTypeNoFiles) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; gap:10px; padding:36px 24px; background:#F7F8FB; border:1px dashed #C3C9D4; border-radius:8px; text-align:center; margin-bottom:22px;`)}>
<svg width={"28"} height={"28"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"1.5"}><path d={"M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<div style={css(`font-size:13px; font-weight:600; color:#5A5E66;`)}>No volume file available for this sort centre.</div>
<div style={css(`font-size:12px; color:#8E96A3;`)}>Upload an LMDC Landing volume file from Volume Inputs, then return here to select one.</div>
</div>
</>) : null}
</>) : null}
{/* STEP 1 — progressive disclosure: prompt to pick a plan file before sort centres appear */}
{(step1NoFile) ? (<>
<div style={css(`display:flex; align-items:center; gap:10px; padding:16px 18px; margin-top:18px; background:#F7F8FB; border:1px dashed #C3C9D4; border-radius:8px; color:#5A5E66;`)}>
<svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg>
<span style={css(`font-size:12.5px;`)}>Select an LMDC volume file above — the sort centres for this cycle will appear here.</span>
</div>
</>) : null}
{/* STEP 1 (cont.) SORT CENTRE SELECTION — shown once a plan file is chosen */}
{(step1HasFile) ? (<>
<div style={css(`height:1px; background:#E6EBF2; margin:8px 0 18px;`)} />
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Select sort centres</div>
<div style={css(`font-size:12px; color:#5A5E66; margin:2px 0 14px;`)}>Pick the LMSCs to plan this cycle, grouped by zone (cap 80). Expand a row to preview its LMDCs.</div>
<div style={css(`display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px;`)}>
<div style={css(`display:flex; align-items:center; gap:7px; height:36px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<input value={creationSearch} onInput={onCreationSearch} placeholder={"Search LMSC code or name…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12.5px; color:#14171F; background:transparent; width:190px;`)} />
</div>
<div style={css(`display:flex; gap:6px; flex-wrap:wrap;`)}>
{(creationZoneChips || []).map((z, __i42) => (<React.Fragment key={__i42}><button onClick={z.onClick} style={css(`border:1px solid ${z.bd}; background:${z.bg}; color:${z.fg}; font-family:inherit; font-size:12px; font-weight:600; padding:7px 13px; border-radius:999px; cursor:pointer;`)}>{z.label}</button></React.Fragment>))}
</div>
<div style={css(`flex:1;`)} />
{/* B. CSV download — validation aid (selected SCs + node-vs-volume coverage) */}
<button onClick={downloadSelectionCsv} title={"Download selected SCs + volume-coverage as CSV"} style={css(`display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 4v12M7 11l5 5 5-5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Download CSV</button>
<button onClick={selectAllSCs} style={css(`height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#EAEEFB;`)}>Select all shown</button>
<button onClick={clearAllSCs} style={css(`height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Clear</button>
</div>
<div style={css(`display:flex; align-items:center; gap:10px; margin-bottom:12px;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:7px; padding:5px 12px; border-radius:999px; background:#EAEEFB; color:#003F98; font-size:12px; font-weight:700;`)}>{creationSelCount} LMSCs selected</span>
<span style={css(`font-size:12px; color:#5A5E66;`)}>Showing {creationShown} of {creationTotal} · grouped by zone · cap 80 per cycle</span>
</div>
{/* D. Overall missing / zero-volume callout — blocks Trigger downstream */}
{(volGapHasGap) ? (<>
<div style={css(`display:flex; align-items:flex-start; gap:13px; padding:14px 16px; margin-bottom:14px; background:#FAFBFD; border:1px solid #E6EBF2; border-left:3px solid #D14B4B; border-radius:8px;`)}>
<svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#D14B4B"} strokeWidth={"1.9"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<div style={css(`flex:1;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#D14B4B;`)}>{volGapHeadline}</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-top:3px; line-height:1.5;`)}>{volGapDetail} Update the volume file or drop the affected DCs from this run (expand an SC below). The plan can't be triggered until every selected SC has complete volume.</div>
</div>
</div>
</>) : null}
{(volGapAllClean) ? (<>
<div style={css(`display:flex; align-items:center; gap:11px; padding:11px 16px; margin-bottom:14px; background:#E7F4EC; border:1px solid #B6E0C6; border-radius:8px;`)}>
<svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.1"} style={css(`flex-shrink:0;`)}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12.5px; color:#14171F;`)}>Volume complete for all selected SCs — ready to configure vehicles.</span>
</div>
</>) : null}
{(scGroups || []).map((g, __i45) => (<React.Fragment key={__i45}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:12px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; gap:11px; padding:11px 16px; background:#F7F8FB; cursor:pointer;`)}>
<button onClick={g.onToggleCollapse} style={css(`display:flex; align-items:center; gap:10px; border:none; background:transparent; cursor:pointer; font-family:inherit; flex:1; text-align:left; padding:0;`)}>
<svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"2"}><path d={g.chev} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>{g.zone}</span>
<span style={css(`font-size:11.5px; color:#5A5E66;`)}>{g.count} LMSCs</span>
</button>
<span style={css(`font-size:11.5px; font-weight:600; color:#003F98;`)}>{g.selLabel} selected</span>
<button onClick={g.onSelectZone} style={css(`height:30px; padding:0 11px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:7px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 11px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:7px; cursor:pointer;`, `background:#EAEEFB;`)}>Select zone</button>
</div>
{(g.expanded) ? (<>
<div>
{(g.scs || []).map((s, __i44) => (<React.Fragment key={__i44}>
<div style={css(`border-top:1px solid #EEF1F6;`)}>
<div style={css(`display:flex; align-items:center; background:${s.rowBg};`)}>
<button onClick={s.onToggle} style={css(`flex:1; display:flex; align-items:center; gap:12px; border:none; background:transparent; cursor:pointer; font-family:inherit; padding:11px 16px; text-align:left; min-width:0;`)}>
<span style={css(`width:18px; height:18px; border-radius:5px; border:1.5px solid ${s.checkBd}; background:${s.checkBg}; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#fff"} strokeWidth={"3"} style={css(`opacity:${s.checkOp};`)}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></span>
<span style={css(`font-size:12.5px; font-weight:700; color:#003F98; width:62px; flex-shrink:0;`)}>{s.code}</span>
<span style={css(`font-size:12.5px; color:#14171F; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{s.name}</span>
{(s.newSc) ? (<><span style={css(`padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; background:#EAEEFB; color:#2F4FC6; flex-shrink:0;`)}>NEW SC</span></>) : null}
{/* D. per-SC volume gap flag */}
{(s.volGap) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:#FBEAEA; color:#D14B4B; flex-shrink:0;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{s.volGapLabel}</span></>) : null}
<span style={css(`font-size:12px; color:#5A5E66; width:84px; text-align:right; flex-shrink:0;`)}>{s.dcCount} DCs</span>
<span style={css(`font-size:12px; color:#5A5E66; width:66px; text-align:right; flex-shrink:0;`)}>{s.volume}</span>
</button>
<button onClick={s.onExpand} aria-label={s.expandAria} title={"Show LMDCs"} style={css(`width:42px; height:42px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:42px; height:42px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66; flex-shrink:0;`, `color:#003F98;`)}><svg aria-hidden={"true"} width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={s.expandChev} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
{/* 2.5: SC Master properties sub-row (shown for every SC that is selected or hovered) */}
{(s.noMissingMaster) ? (<>
<div style={css(`display:flex; gap:20px; flex-wrap:wrap; padding:5px 16px 7px 46px; background:${s.rowBg}; border-top:1px solid #F2F5FA;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px;`)}><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>VOL CAP</span><span style={css(`font-size:12px; font-variant-numeric:tabular-nums; color:#14171F;`)}>{s.scVolCapLabel}</span></span>
<span style={css(`display:inline-flex; align-items:center; gap:5px;`)}><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>SORT CAP</span><span style={css(`font-size:12px; font-variant-numeric:tabular-nums; color:#14171F;`)}>{s.scSortCapLabel}</span></span>
<span style={css(`display:inline-flex; align-items:center; gap:5px;`)}><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>RLH DOCKS</span><span style={css(`font-size:12px; color:#14171F;`)}>{s.scDocksLabel}</span></span>
<span style={css(`display:inline-flex; align-items:center; gap:5px;`)}><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>LOCATION</span><span style={css(`font-size:12px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{s.scLocLabel}</span></span>
</div>
</>) : null}
{(s.hasMissingMaster) ? (<>
<div style={css(`display:flex; align-items:center; gap:10px; padding:7px 16px 7px 46px; background:#FDF6EC; border-top:1px solid #F4E4BF;`)}>
<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"2"} style={css(`flex-shrink:0;`)}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12px; font-weight:700; color:#C77B00;`)}>SC Master details missing</span>
<span style={css(`font-size:11.5px; color:#5A5E66;`)}>Vol capacity, sort capacity, RLH docks or location are not set.</span>
<button onClick={s.onFixMaster} style={css(`display:inline-flex; align-items:center; gap:5px; height:26px; padding:0 10px; border:1px solid #E0C98A; background:#fff; color:#C77B00; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:7px; cursor:pointer; margin-left:auto; flex-shrink:0;`)}>Update via SC Master<svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</>) : null}
{(s.expanded) ? (<>
<div style={css(`background:#FAFBFD; border-top:1px solid #EEF1F6; padding:6px 16px 10px 46px;`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:8px 0 4px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMDCs · AutoDML actives + additions − closures</div>
{(s.dropCount) ? (<><button onClick={s.onRestoreDropped} style={css(`display:inline-flex; align-items:center; gap:5px; height:26px; padding:0 10px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:11px; font-weight:600; border-radius:7px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:5px; height:26px; padding:0 10px; border:1px solid #E6EBF2; background:#fff; color:#003F98; font-family:inherit; font-size:11px; font-weight:600; border-radius:7px; cursor:pointer;`, `background:#EAEEFB;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{s.dropCount} dropped · restore</button></>) : null}
</div>
<div style={css(`display:grid; grid-template-columns:1fr 1.6fr 0.9fr 0.9fr 0.9fr 0.9fr 40px; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; background:#fff;`)}>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA;`)}>DC CODE</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA;`)}>NAME</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA; text-align:right;`)}>VOLUME</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA; text-align:right;`)}>CAPACITY</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA;`)}>VOL FLAG</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA;`)}>SOURCE</div>
<div style={css(`padding:7px 11px; font-size:10px; font-weight:700; color:#5A5E66; background:#F2F5FA;`)} />
{(s.lmdcs || []).map((l, __i43) => (<React.Fragment key={__i43}>
<div style={css(`padding:7px 11px; font-size:12px; font-weight:600; color:#003F98; border-top:1px solid #F2F5FA;`)}>{l.code}</div>
<div style={css(`padding:7px 11px; font-size:12px; color:#14171F; border-top:1px solid #F2F5FA;`)}>{l.name}</div>
<div style={css(`padding:7px 11px; font-size:12px; color:${l.volFg}; border-top:1px solid #F2F5FA; text-align:right; font-variant-numeric:tabular-nums; font-weight:${l.volWeight};`)}>{l.vol}</div>
<div style={css(`padding:7px 11px; font-size:12px; color:#14171F; border-top:1px solid #F2F5FA; text-align:right; font-variant-numeric:tabular-nums;`)}>{l.cap}</div>
<div style={css(`padding:7px 11px; border-top:1px solid #F2F5FA;`)}><span style={css(`padding:1px 7px; border-radius:999px; font-size:10px; font-weight:600; background:${l.volFlagBg}; color:${l.volFlagFg};`)}>{l.volFlag}</span></div>
<div style={css(`padding:7px 11px; border-top:1px solid #F2F5FA;`)}><span style={css(`padding:1px 7px; border-radius:999px; font-size:10px; font-weight:600; background:${l.srcBg}; color:${l.srcFg};`)}>{l.src}</span></div>
<div style={css(`padding:4px 6px; border-top:1px solid #F2F5FA; display:flex; align-items:center; justify-content:center;`)}><button onClick={l.onDrop} title={l.dropTitle} aria-label={l.dropTitle} style={css(`width:26px; height:26px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:6px; color:${l.dropColor};`)} onMouseEnter={(e) => hoverOn(e, `color:#D14B4B; background:#FBEAEA;`)} onMouseLeave={(e) => hoverOff(e, `width:26px; height:26px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; border-radius:6px; color:${l.dropColor};`, `color:#D14B4B; background:#FBEAEA;`)}><svg aria-hidden={"true"} width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></div>
</React.Fragment>))}
</div>
</div>
</>) : null}
</div>
</React.Fragment>))}
</div>
</>) : null}
</div>
</React.Fragment>))}
</>) : null}
{/* Volume step removed — the selected plan file already encodes the volume scenario */}
{/* STEP 3 VEHICLE CONFIGURATION (reordered: now after Operating Mode & HW) */}
{(isStep3) ? (<>
<div style={css(`margin-bottom:14px;`)}>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Vehicle Configuration</div>
{/* E/F/H — mirrors the SC Vehicle Availability master columns; editable per run; optional. */}
<div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>Edit vehicle type, count and parameters for this run — the SC Vehicle Availability master is untouched. Vehicle config is <strong style={css(`color:#14171F;`)}>optional</strong>: leave an SC empty and the routing engine uses its default vehicle set.</div>
</div>
{(vehAddOnly) ? (<>
<div style={css(`display:flex; align-items:flex-start; gap:10px; padding:11px 14px; margin-bottom:12px; background:#EAF1FB; border:1px solid #CFE0F1; border-radius:8px;`)}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg>
<span style={css(`font-size:12px; color:#1E6FB8; font-weight:600; line-height:1.5;`)}>Historical plan selected (HW {'>'} 0 or New-Node mode) — the vehicle list matches the reference plan. You can <strong>add</strong> vehicles for simulation, but existing rows can't be edited or removed.</span>
</div>
</>) : null}
{(scVehicleCards || []).map((vc, __i49) => (<React.Fragment key={__i49}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:12px; overflow:hidden;`)}>
{/* SC header */}
<div style={css(`display:flex; align-items:center; gap:12px; padding:13px 18px; background:#F9FAFB; border-bottom:1px solid #EEF1F6;`)}>
<div>
<div style={css(`display:flex; align-items:center; gap:9px;`)}>
<span style={css(`font-size:14px; font-weight:700; color:#003F98;`)}>{vc.code}</span>
<span style={css(`font-size:13px; color:#14171F;`)}>{vc.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; color:#5A5E66; background:#E6EBF2;`)}>{vc.zone}</span>
</div>
<div style={css(`display:flex; gap:18px; margin-top:6px;`)}>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>SORT CAP  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{vc.sortCap}</span></div>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>ACTIVE NODES  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{vc.dcCount}</span></div>
<div><span style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>VEHICLES  </span><span style={css(`font-size:12px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{vc.totalCount}</span></div>
</div>
</div>
<div style={css(`flex:1;`)} />
{(vc.tpWarn) ? (<><span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinejoin={"round"} /><line x1={"12"} y1={"9"} x2={"12"} y2={"13"} /><line x1={"12"} y1={"17"} x2={"12.01"} y2={"17"} strokeWidth={"3"} strokeLinecap={"round"} /></svg>{vc.tpWarnLabel}</span></>) : null}
{(vc.isAdding) ? (<><span style={css(`font-size:12px; color:#5A5E66;`)}>Adding vehicle…</span></>) : null}
{(vc.notAdding) ? (<><button onClick={vc.onAddVehicle} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1.5px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1.5px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#EAEEFB;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 5v14M5 12h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Add Vehicle</button></>) : null}
</div>
{/* Inline add vehicle form (E/F — master columns + editable) */}
{(vc.isAdding) ? (<>
<div style={css(`padding:14px 18px 16px; background:#F4F5F8; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`display:grid; grid-template-columns:1.8fr 1.1fr 0.9fr 1fr 1.4fr auto; gap:12px; align-items:flex-end;`)}>
<div>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>VEHICLE TYPE</div>
<select value={vc.addForm.type} onChange={vc.addForm.onTypeChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; outline:none; cursor:pointer; appearance:auto;`)}>
{(vc.vehTypeOptions || []).map((o, __i46) => (<React.Fragment key={__i46}><option value={o.value}>{o.label}</option></React.Fragment>))}
</select>
</div>
<div>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>VEHICLES <span style={css(`color:#D14B4B; font-weight:400;`)}>*</span></div>
<input type={"number"} min={"1"} placeholder={"1"} value={vc.addForm.count} onInput={vc.addForm.onCountChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none;`)} />
</div>
<div>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>TP <span style={css(`font-weight:400; color:#8E96A3;`)}>(VM {vc.addForm.vmTp})</span></div>
<input type={"number"} min={"1"} max={"20"} placeholder={vc.addForm.vmTp} value={vc.addForm.tp} onInput={vc.addForm.onTpChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid ${vc.addForm.tpBd}; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none;`)} />
</div>
<div>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>CAPACITY <span style={css(`font-weight:400; color:#8E96A3;`)}>(VM {vc.addForm.vmCap})</span></div>
<input type={"number"} min={"0"} placeholder={vc.addForm.vmCap} value={vc.addForm.cap} onInput={vc.addForm.onCapChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none; text-align:right; font-variant-numeric:tabular-nums;`)} />
</div>
<div>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:5px;`)}>ZONE FEASIBILITY</div>
<select onChange={vc.addForm.onZoneFeasChange} style={css(`width:100%; height:36px; padding:0 10px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; outline:none; cursor:pointer; appearance:auto;`)}>
<option value={"Both"}>Both</option>
<option value={"Local"}>Local</option>
<option value={"Non-Local"}>Non-Local</option>
</select>
</div>
<div style={css(`display:flex; gap:8px; padding-bottom:1px;`)}>
<button onClick={vc.addForm.onAdd} style={css(`height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>Add</button>
<button onClick={vc.addForm.onCancel} style={css(`height:36px; padding:0 14px; border:1px solid #D0D5DD; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `color:#14171F; border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 14px; border:1px solid #D0D5DD; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; white-space:nowrap;`, `color:#14171F; border-color:#C3C9D4;`)}>Cancel</button>
</div>
</div>
{(vc.addForm.tpWarn) ? (<><div style={css(`margin-top:10px; font-size:11.5px; color:#C77B00; display:inline-flex; align-items:center; gap:5px;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinejoin={"round"} /><line x1={"12"} y1={"9"} x2={"12"} y2={"13"} /><line x1={"12"} y1={"17"} x2={"12.01"} y2={"17"} strokeWidth={"3"} strokeLinecap={"round"} /></svg>{vc.addForm.tpWarnText}</div></>) : null}
</div>
</>) : null}
{/* 0-vehicle graceful state (H) */}
{(vc.empty) ? (<>
<div style={css(`display:flex; align-items:center; gap:10px; padding:16px 18px; background:#FAFBFD; color:#5A5E66;`)}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.8"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg>
<span style={css(`font-size:12.5px;`)}>No vehicles configured for this SC — the routing engine will use its default vehicle set. Add a vehicle to override.</span>
</div>
</>) : null}
{/* Vehicle table — static display + pencil inline-row-edit (matches Vehicle Master pattern) */}
{(vc.notEmpty) ? (<>
<div style={css(`display:grid; grid-template-columns:1.4fr 1fr 1fr 0.85fr 1fr 1.2fr 84px; background:#E6EBF2;`)}>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE TYPE</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CAPACITY</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DISTANCE LIMIT</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>VEHICLES</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TP LIMIT</div>
<div style={css(`padding:9px 14px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ZONE FEASIBILITY</div>
<div style={css(`padding:9px 14px;`)} />
</div>
{(vc.vehicleRows || []).map((v, __i48) => (<React.Fragment key={__i48}>
<div style={css(`display:grid; grid-template-columns:1.4fr 1fr 1fr 0.85fr 1fr 1.2fr 84px; align-items:center; border-top:1px solid #EEF1F6; background:${v.rowEditing ? '#F7F9FC' : 'transparent'};`)}>
{/* VEHICLE TYPE — static in row-edit (existing rows); only the Add-Vehicle form allows type selection */}
{(v.rowNotEditing) ? (<><div style={css(`padding:12px 14px; font-size:12.5px; font-weight:700; color:#14171F;`)}>{v.type}</div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:12px 14px; font-size:12.5px; font-weight:700; color:#14171F;`)} title={"Vehicle type is fixed on existing rows — delete and re-add to change type"}>{v.type}</div></>) : null}
{/* CAPACITY (editable; defaults from vehicle type) */}
{(v.rowNotEditing) ? (<><div style={css(`padding:12px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{v.cap}</div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px;`)}><input type={"number"} min={"0"} value={v.rdCapVal} onInput={v.onDraftCap} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* DISTANCE (editable; defaults from vehicle type) */}
{(v.rowNotEditing) ? (<><div style={css(`padding:12px 14px; font-size:12.5px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{v.dist}</div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px;`)}><input type={"number"} min={"0"} value={v.rdDistVal} onInput={v.onDraftDist} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:right; background:#fff;`)} /></div></>) : null}
{/* VEHICLES COUNT */}
{(v.rowNotEditing) ? (<><div style={css(`padding:12px 14px; font-size:12.5px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{v.count}</div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px;`)}><input type={"number"} min={"0"} value={v.rdCnt} onInput={v.onDraftCnt} style={css(`width:100%; height:30px; border:1px solid #C3C9D4; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:center; background:#fff;`)} /></div></>) : null}
{/* TP LIMIT */}
{(v.rowNotEditing) ? (<><div style={css(`padding:12px 14px; display:flex; justify-content:center;`)}><span style={css(`display:inline-flex; min-width:28px; height:24px; align-items:center; justify-content:center; padding:0 9px; border-radius:999px; background:${v.tpBg}; color:${v.tpFg}; font-size:12.5px; font-weight:700;`)}>{v.tp}</span></div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px;`)}><input type={"number"} min={"0"} value={v.rdTp} onInput={v.onDraftTp} title={`VM limit ${v.vmTp}`} style={css(`width:100%; height:30px; border:1px solid ${v.rdTpBd}; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; padding:0 8px; box-sizing:border-box; outline:none; text-align:center; background:#fff;`)} /></div></>) : null}
{/* ZONE FEASIBILITY */}
{(v.rowNotEditing) ? (<><div style={css(`padding:10px 14px;`)}><span style={css(`display:inline-flex; padding:2px 9px; border-radius:999px; font-size:11.5px; font-weight:600; background:${v.zfBg}; color:${v.zfFg};`)}>{v.serveType}</span></div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px; display:flex; gap:4px; flex-wrap:wrap; align-items:center;`)}>{(v.rdZfChips || []).map((zc, __i47) => (<React.Fragment key={__i47}><button onClick={zc.onSelect} style={css(`height:26px; padding:0 8px; border:1px solid ${zc.bd}; background:${zc.bg}; color:${zc.fg}; font-family:inherit; font-size:11px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`)}>{zc.label}</button></React.Fragment>))}</div></>) : null}
{/* ACTION CELL */}
{(v.rowShowControls) ? (<><div style={css(`padding:6px 10px; display:flex; justify-content:flex-end; gap:5px;`)}><button onClick={v.onEditRow} title={"Edit row"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg aria-hidden={"true"} width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button><button onClick={v.onDelete} title={"Remove"} style={css(`width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`)} onMouseEnter={(e) => hoverOn(e, `background:#FBEAEA;`)} onMouseLeave={(e) => hoverOff(e, `width:30px; height:30px; border:1px solid #F2C9C9; background:#FDF3F3; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#D14B4B;`, `background:#FBEAEA;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></div></>) : null}
{(v.rowEditing) ? (<><div style={css(`padding:6px 10px; display:flex; justify-content:flex-end; gap:5px;`)}><button onClick={v.onSaveVehRow} title={"Save"} style={css(`height:30px; padding:0 12px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 12px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>Save</button><button onClick={v.onCancelVehRow} title={"Cancel"} style={css(`height:30px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#8E96A3;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:999px; cursor:pointer;`, `border-color:#8E96A3;`)}>Cancel</button></div></>) : null}
</div>
</React.Fragment>))}
</>) : null}
</div>
</React.Fragment>))}
</>) : null}
{/* STEP 3 PREVIEW & TRIGGER */}
{(isStep2) ? (<>
{/* queueIdle wrapper removed 2026-07-06: it blanked step 2 whenever any run was queued (e.g. the seeded GGNS). Step 2 now always renders, like step 1. */}
<div style={css(`margin-bottom:14px;`)}>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Operating Mode & HW</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>Pick the operating mode and Historical Weight per SC, and a reference plan where required. Vehicles are configured next.</div>
</div>
{/* Algorithm Mode — New Node Addition toggle (Run Name moved to step 4) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:18px 24px; margin-bottom:16px;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#14171F; margin-bottom:12px;`)}>Algorithm Mode</div>
<div style={css(`display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap;`)}>
{/* K — New Node Addition mode: a polished DS-algorithm mode toggle (labeled switch), not "include the new nodes" */}
<label onClick={onToggleNewNodeMode} style={css(`display:flex; align-items:center; gap:16px; cursor:pointer; padding:14px 16px; border:1px solid ${newNodeCardBd}; border-radius:8px; background:${newNodeCardBg}; user-select:none; flex-shrink:0; max-width:420px; transition:border-color 150ms, background 150ms;`)}>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:6px;`)}>
<span style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>New Node Addition mode</span>
<span title={"Only adds new nodes to existing routes — existing RFQs/routes stay unchanged. Leave off to re-optimise the whole network."} style={css(`display:inline-flex; align-items:center; justify-content:center; width:15px; height:15px; border-radius:50%; color:#8E96A3; cursor:help; flex-shrink:0;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><circle cx={"12"} cy={"12"} r={"9"} /><path d={"M12 11v5M12 8h.01"} strokeLinecap={"round"} /></svg></span>
</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px; line-height:1.45;`)}>Only adds new nodes to existing routes — existing RFQs/routes stay unchanged.</div>
</div>
<span role={"switch"} aria-checked={newNodeMode} aria-label={"New Node Addition mode"} style={css(`position:relative; width:36px; height:20px; border-radius:999px; background:${newNodesTrackBg}; flex-shrink:0; transition:background 150ms;`)}><span style={css(`position:absolute; top:2px; left:${newNodesKnobX}; width:16px; height:16px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.25); transition:left 150ms;`)} /></span>
</label>
</div>
</div>
{/* Design Summary table */}
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:10px;`)}>DESIGN SUMMARY — {previewCardCount} SCS</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
{/* Batch toolbar */}
<div style={css(`display:flex; align-items:center; gap:0; padding:0; background:#F9FAFB; border-bottom:1px solid #E6EBF2;`)}>
{/* HW global group */}
<div style={css(`display:flex; align-items:center; gap:10px; padding:11px 18px;`)}>
<span style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>SET ALL HW</span>
<div style={css(`display:inline-flex; gap:2px; padding:2px; background:#EEF1F6; border-radius:7px;`)}>
<button onClick={onGlobalHw0} style={css(`height:28px; min-width:32px; padding:0 9px; border:1px solid ${globalHw0Bd}; background:${globalHw0Bg}; color:${globalHw0Fg}; font-family:inherit; font-size:12px; font-weight:700; border-radius:5px; cursor:pointer; transition:none;`)}>0</button>
<button onClick={onGlobalHw05} style={css(`height:28px; min-width:38px; padding:0 9px; border:1px solid ${globalHw05Bd}; background:${globalHw05Bg}; color:${globalHw05Fg}; font-family:inherit; font-size:12px; font-weight:700; border-radius:5px; cursor:pointer; transition:none;`)}>0.5</button>
<button onClick={onGlobalHw1} style={css(`height:28px; min-width:32px; padding:0 9px; border:1px solid ${globalHw1Bd}; background:${globalHw1Bg}; color:${globalHw1Fg}; font-family:inherit; font-size:12px; font-weight:700; border-radius:5px; cursor:pointer; transition:none;`)}>1</button>
</div>
{(step3HasCustomHw) ? (<><span style={css(`font-size:11px; color:#8E96A3;`)}>{customHwLabel}</span></>) : null}
</div>
{/* Divider */}
<div style={css(`width:1px; height:28px; background:#E6EBF2; flex-shrink:0;`)} />
{/* Ref Plan global group */}
<div style={css(`display:flex; align-items:center; gap:10px; padding:11px 18px; flex:1;`)}>
<span style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>Reference plan</span>
{(globalRefApplied) ? (<>
<div style={css(`display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#128A3E; font-weight:600;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>June 2026 applied to all SCs</div>
</>) : null}
{(step3RefAllCovered) ? (<>

{(!globalRefApplied) ? (<><span style={css(`font-size:12px; color:#128A3E; font-weight:600;`)}>✓ All SCs covered</span></>) : null}
</>) : null}
{(!step3RefAllCovered) ? (<>
{(!globalRefApplied) ? (<>
<button onClick={onApplyGlobalRef} style={css(`height:28px; padding:0 12px; border:1px solid #D0D5DD; background:#fff; color:#003F98; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB; border-color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `height:28px; padding:0 12px; border:1px solid #D0D5DD; background:#fff; color:#003F98; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`, `background:#EAEEFB; border-color:#003F98;`)}>Apply June 2026 to all</button>
<span style={css(`font-size:12px; color:#C77B00; display:inline-flex; align-items:center; gap:4px;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinejoin={"round"} /><line x1={"12"} y1={"9"} x2={"12"} y2={"13"} /><line x1={"12"} y1={"17"} x2={"12.01"} y2={"17"} strokeWidth={"3"} strokeLinecap={"round"} /></svg>{step3RefNeedLabel}</span>
</>) : null}
</>) : null}
</div>
</div>
{/* O — Step-3 validation summary banner (TP / distance / ref-plan) */}
{(step3HasErrors) ? (<>
<div style={css(`display:flex; align-items:center; gap:9px; padding:11px 18px; background:#FAFBFD; border-bottom:1px solid #E6EBF2; border-left:3px solid #D14B4B;`)}>
<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#D14B4B"} strokeWidth={"2"} style={css(`flex-shrink:0;`)}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12.5px; font-weight:700; color:#D14B4B;`)}>Error</span>
<span style={css(`font-size:12.5px; color:#5A5E66; font-weight:500;`)}>{step3ErrorLabel}</span>
</div>
</>) : null}
{/* L — per-row "select to trigger" checkbox removed; everything selected in Step 1 runs.
                       M — carry-forward totals: NODES + VOLUME + VEHICLES per SC. */}
{/* Column headers */}
<div style={css(`display:grid; grid-template-columns:2.2fr 0.7fr 0.8fr 1.1fr 1.2fr 1.6fr 1.6fr; background:#E6EBF2;`)}>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMSC</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>NODES</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>VOLUME</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLES</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>HIST. WEIGHT</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>Reference plan</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VALIDATION</div>
</div>
{(previewCards || []).map((c, __i52) => (<React.Fragment key={__i52}>
<div style={css(`border-top:1px solid #EEF1F6; border-left:${c.focusBd}; background:${c.focusBg};`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `border-top:1px solid #EEF1F6; border-left:${c.focusBd}; background:${c.focusBg};`, `background:#FAFBFD;`)}>
<div style={css(`display:grid; grid-template-columns:2.2fr 0.7fr 0.8fr 1.1fr 1.2fr 1.6fr 1.6fr; align-items:center;`)}>
<div style={css(`padding:10px 16px; min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:7px;`)}>
<span style={css(`font-size:13px; font-weight:700; color:#003F98;`)}>{c.code}</span>
<span style={css(`padding:1px 7px; border-radius:999px; font-size:10.5px; color:#5A5E66; background:#F2F5FA; flex-shrink:0;`)}>{c.zone}</span>
</div>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{c.name}</div>
</div>
<div style={css(`padding:10px 14px; text-align:center; font-size:12.5px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{c.dcCount}</div>
<div style={css(`padding:10px 14px; text-align:right; font-size:12.5px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{c.volume}</div>
<div style={css(`padding:10px 14px; font-size:12px; font-weight:600; color:${c.vehFg};`)}>{c.vehLabel}</div>
<div style={css(`padding:7px 14px;`)}>
<div style={css(`display:inline-flex; gap:2px; padding:2px; background:#F2F5FA; border-radius:7px;`)}>
<button onClick={c.onHw0} style={css(`height:26px; min-width:30px; padding:0 7px; border:1px solid ${c.hw0Bd}; background:${c.hw0Bg}; color:${c.hw0Fg}; font-family:inherit; font-size:11.5px; font-weight:700; border-radius:5px; cursor:pointer;`)}>0</button>
<button onClick={c.onHw05} style={css(`height:26px; min-width:36px; padding:0 7px; border:1px solid ${c.hw05Bd}; background:${c.hw05Bg}; color:${c.hw05Fg}; font-family:inherit; font-size:11.5px; font-weight:700; border-radius:5px; cursor:pointer;`)}>0.5</button>
<button onClick={c.onHw1} style={css(`height:26px; min-width:30px; padding:0 7px; border:1px solid ${c.hw1Bd}; background:${c.hw1Bg}; color:${c.hw1Fg}; font-family:inherit; font-size:11.5px; font-weight:700; border-radius:5px; cursor:pointer;`)}>1</button>
</div>
</div>
{/* I — per-row reference-plan picker; HW 0 = "—", HW 0.5/1 = dropdown select */}
<div style={css(`padding:8px 14px;`)}>
{(c.refNotNeeded) ? (<><span style={css(`font-size:12px; color:#8E96A3;`)}>—</span></>) : null}
{(c.refShowSelect) ? (<><select onChange={c.onPickRefSel} aria-label={"Pick a reference plan"} style={css(`height:28px; padding:0 8px; border:1px solid #C3C9D4; background:#fff; color:#14171F; font-family:inherit; font-size:11.5px; font-weight:500; border-radius:7px; cursor:pointer; outline:none;`)}><option value={""}>Pick reference plan…</option>{(c.refOptions || []).map((ro, __i50) => (<React.Fragment key={__i50}><option value={ro.value} selected={ro.value === c.refCurrentVal}>{ro.label}</option></React.Fragment>))}</select></>) : null}
</div>
{/* VALIDATION */}
<div style={css(`padding:10px 14px;`)}>
{(c.clean) ? (<><div style={css(`display:inline-flex; align-items:center; gap:4px; font-size:12px; color:#128A3E; font-weight:600;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Clean · ready</div></>) : null}
{(c.warnOnly) ? (<><div style={css(`display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#C77B00; font-weight:700;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{c.flagLabel}</div></>) : null}
{(c.hasErrors) ? (<><div style={css(`display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#D14B4B; font-weight:700;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{c.flagLabel}</div></>) : null}
</div>
</div>
{/* O — detailed validation messages (2-3 lines each) so the planner can go fix */}
{(c.hasFlags) ? (<>
<div style={css(`padding:2px 16px 12px;`)}>
{(c.flags || []).map((f, __i51) => (<React.Fragment key={__i51}>
<div style={css(`display:flex; align-items:flex-start; gap:8px; padding:8px 11px; margin-top:6px; background:${f.sevBg}; border-left:${f.sevAccent}; border-radius:8px;`)}>
<span style={css(`width:7px; height:7px; border-radius:50%; background:${f.dot}; flex-shrink:0; margin-top:5px;`)} />
<div style={css(`flex:1;`)}><span style={css(`font-size:10px; font-weight:700; color:${f.sevFg}; letter-spacing:0.04em;`)}>{f.sevLabel}</span><div style={css(`font-size:11.5px; color:#14171F; line-height:1.5; margin-top:1px;`)}>{f.t}</div></div>
</div>
</React.Fragment>))}
</div>
</>) : null}
</div>
</React.Fragment>))}
</div>
</>) : null}
{/* STEP 4 — PREVIEW & TRIGGER (commit sheet: readiness banner + batch stats + per-SC recap) */}
{(isStep4) ? (<>
<div style={css(`margin-bottom:14px;`)}>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Preview & trigger</div>
<div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>Review exactly what will run, then trigger the design from the footer.</div>
</div>
{/* EMPTY: no SCs selected */}
{(step4Empty) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; padding:52px 24px; text-align:center; gap:9px; background:#fff; border:1px solid #E6EBF2; border-radius:10px;`)}>
<svg width={"30"} height={"30"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"1.5"}><path d={"M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<div style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>No sort centres selected</div>
<div style={css(`font-size:12.5px; color:#5A5E66; max-width:340px; line-height:1.5;`)}>Go back to Step 1 → Input Selection and pick the SCs you want to design.</div>
</div>
</>) : null}
{(step4HasScs) ? (<>
{/* 2.4: Run Name input — moved here from step 2 so it's near the trigger action */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; padding:14px 18px; margin-bottom:14px; display:flex; align-items:flex-start; gap:28px; flex-wrap:wrap;`)}>
<div style={css(`min-width:220px; flex:1; max-width:400px;`)}>
<div style={css(`font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:6px;`)}>RUN NAME <span style={css(`font-weight:400; color:#8E96A3; letter-spacing:0;`)}>(optional)</span></div>
<input value={runName} onInput={onRunNameChange} placeholder={"e.g. July-South-Run1"} style={css(`width:100%; height:36px; padding:0 12px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:13px; color:#14171F; background:#fff; box-sizing:border-box; outline:none;`)} />
<div style={css(`font-size:11px; color:#8E96A3; margin-top:5px;`)}>Hint: [SC]–[Region]–[Date]</div>
</div>
</div>
{/* 2.6: Validation panel — flags aggregated across all selected SCs */}
{(step4AnyFlags) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; overflow:hidden; margin-bottom:14px;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; padding:11px 16px; border-bottom:1px solid #E6EBF2; background:#F9FAFB;`)}>
<span style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>Validation</span>
{(step4HasErrorFlags) ? (<><span style={css(`display:inline-flex; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#FBEAEA; color:#D14B4B;`)}>{step4ErrorFlagCount} Error</span></>) : null}
{(step4HasWarnFlags) ? (<><span style={css(`display:inline-flex; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>{step4WarnFlagCount} Warning</span></>) : null}
{(step4HasErrorFlags) ? (<><span style={css(`font-size:11.5px; color:#D14B4B; margin-left:4px;`)}>— Resolve errors to trigger</span></>) : null}
</div>
{(step4FlagsList || []).map((vf, __i53) => (<React.Fragment key={__i53}>
<div style={css(`display:flex; align-items:flex-start; gap:12px; padding:10px 16px; border-top:1px solid #F2F5FA;`)}>
<span style={css(`display:inline-flex; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:${vf.sevBg}; color:${vf.sevFg}; flex-shrink:0; margin-top:1px;`)}>{vf.sevLabel}</span>
<div style={css(`flex:1; min-width:0;`)}><span style={css(`font-size:12.5px; color:#14171F; font-weight:600;`)}>{vf.title}</span>{(vf.hasSCs) ? (<><span style={css(`font-size:12px; color:#5A5E66;`)}> · {vf.scList}</span></>) : null}</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
{/* A — readiness banner (single predicate: ready = green, blocked = red). ETA only when ready. */}
{(triggerReady) ? (<>
<div style={css(`display:flex; align-items:center; gap:13px; padding:14px 18px; margin-bottom:14px; background:#E7F4EC; border:1px solid #B6E0C6; border-radius:10px;`)}>
<div style={css(`width:36px; height:36px; border-radius:9px; background:#CDEBD7; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.4"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:13.5px; font-weight:700; color:#14171F;`)}>Ready to trigger — {batchScLabel} clean</div><div style={css(`font-size:12px; color:#4A6B54; margin-top:2px;`)}>All selected SCs pass validation. Estimated completion ~{estLabel} once triggered.</div></div>
</div>
</>) : null}
{(triggerBlocked) ? (<>
<div style={css(`display:flex; align-items:center; gap:13px; padding:14px 18px; margin-bottom:14px; background:#FBEAEA; border:1px solid #F0C9C9; border-radius:10px;`)}>
<div style={css(`width:36px; height:36px; border-radius:9px; background:#F6D6D6; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"19"} height={"19"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#D14B4B"} strokeWidth={"2.1"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:13.5px; font-weight:700; color:#14171F;`)}>{triggerBlockReason}</div><div style={css(`font-size:12px; color:#8A4B4B; margin-top:2px;`)}>Fix the flagged SC(s) below — use “Fix” to jump straight to the step that resolves it.</div></div>
</div>
</>) : null}
{/* B — batch stat strip */}
<div style={css(`display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:16px;`)}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:9px; padding:13px 15px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>SORT CENTRES</div><div style={css(`font-size:19px; font-weight:700; color:#14171F; margin-top:3px; font-variant-numeric:tabular-nums;`)}>{triggerCount}</div></div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:9px; padding:13px 15px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DESIGN RUNS</div><div style={css(`font-size:19px; font-weight:700; color:#14171F; margin-top:3px; font-variant-numeric:tabular-nums;`)}>{triggerCount}</div></div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:9px; padding:13px 15px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>PLANNED VOLUME</div><div style={css(`font-size:19px; font-weight:700; color:#14171F; margin-top:3px; font-variant-numeric:tabular-nums;`)}>{batchVolLabel}</div></div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:9px; padding:13px 15px;`)}><div style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DELIVERY CENTRES</div><div style={css(`font-size:19px; font-weight:700; color:#14171F; margin-top:3px; font-variant-numeric:tabular-nums;`)}>{batchDcTotal}</div></div>
</div>
{/* C — per-SC recap: not-ready first, clean behind an expander */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; overflow:hidden;`)}>
<div style={css(`display:grid; grid-template-columns:1.5fr 1.4fr 0.5fr 1.1fr 1fr 1.5fr; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>SORT CENTRE</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>MODE</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>HW</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>REFERENCE</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLES</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>READINESS</div>
</div>
{/* not-ready rows (always visible, accent-left) */}
{(hasNotReadyRecap) ? (<>
{(recapNotReady || []).map((c, __i54) => (<React.Fragment key={__i54}>
<div style={css(`display:grid; grid-template-columns:1.5fr 1.4fr 0.5fr 1.1fr 1fr 1.5fr; align-items:center; border-top:1px solid #EEF1F6; border-left:3px solid ${c.readinessFg};`)}>
<div style={css(`padding:11px 14px; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:700; color:#14171F;`)}>{c.code}</div><div style={css(`font-size:11px; color:#8E96A3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{c.name}</div></div>
<div style={css(`padding:11px 14px; font-size:11.5px; color:#4A4F5E;`)}>{c.modeLabel}</div>
<div style={css(`padding:11px 14px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{c.hw}</div>
<div style={css(`padding:11px 14px; font-size:11.5px; color:${c.refFg}; font-weight:600;`)}>{c.refPlanLabel}</div>
<div style={css(`padding:11px 14px; font-size:11.5px; color:${c.vehFg};`)}>{c.vehLabel}</div>
<div style={css(`padding:9px 14px; display:flex; align-items:center; gap:9px;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:${c.readinessBg}; color:${c.readinessFg};`)}>{c.readinessLabel}</span>
<button onClick={c.onFixRow} style={css(`display:inline-flex; align-items:center; gap:4px; border:none; background:transparent; padding:0; font-family:inherit; font-size:11.5px; font-weight:700; color:#003F98; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B9CCEE;`)} onMouseEnter={(e) => hoverOn(e, `text-decoration-color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:4px; border:none; background:transparent; padding:0; font-family:inherit; font-size:11.5px; font-weight:700; color:#003F98; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B9CCEE;`, `text-decoration-color:#003F98;`)}>Fix<svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.4"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
</React.Fragment>))}
</>) : null}
{/* clean rows behind expander */}
{(hasCleanRecap) ? (<>
<button onClick={onToggleRecapReady} style={css(`display:flex; align-items:center; gap:8px; width:100%; padding:11px 14px; border:none; border-top:1px solid #EEF1F6; background:#FAFBFD; font-family:inherit; font-size:12px; font-weight:700; color:#128A3E; cursor:pointer; text-align:left;`)} onMouseEnter={(e) => hoverOn(e, `background:#F2F7F4;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:8px; width:100%; padding:11px 14px; border:none; border-top:1px solid #EEF1F6; background:#FAFBFD; font-family:inherit; font-size:12px; font-weight:700; color:#128A3E; cursor:pointer; text-align:left;`, `background:#F2F7F4;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"2.2"} style={css(`flex-shrink:0;`)}><path d={recapReadyChev} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.4"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{cleanRecapLabel}</button>
{(recapReadyOpen) ? (<>
{(recapClean || []).map((c, __i55) => (<React.Fragment key={__i55}>
<div style={css(`display:grid; grid-template-columns:1.5fr 1.4fr 0.5fr 1.1fr 1fr 1.5fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:1.5fr 1.4fr 0.5fr 1.1fr 1fr 1.5fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:10px 14px; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:600; color:#14171F;`)}>{c.code}</div><div style={css(`font-size:11px; color:#8E96A3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{c.name}</div></div>
<div style={css(`padding:10px 14px; font-size:11.5px; color:#4A4F5E;`)}>{c.modeLabel}</div>
<div style={css(`padding:10px 14px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{c.hw}</div>
<div style={css(`padding:10px 14px; font-size:11.5px; color:${c.refFg};`)}>{c.refPlanLabel}</div>
<div style={css(`padding:10px 14px; font-size:11.5px; color:${c.vehFg};`)}>{c.vehLabel}</div>
<div style={css(`padding:10px 14px;`)}><span style={css(`display:inline-flex; align-items:center; gap:4px; font-size:11.5px; color:#128A3E; font-weight:600;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Ready</span></div>
</div>
</React.Fragment>))}
</>) : null}
</>) : null}
</div>
</>) : null}
</>) : null}
</div>
{/* footer nav */}
<div style={css(`flex-shrink:0; display:flex; align-items:center; gap:14px; padding:13px 28px; background:#fff; border-top:1px solid #E6EBF2;`)}>
{(showBack) ? (<><button onClick={creBack} style={css(`display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M19 12H5M11 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Back</button></>) : null}
<div style={css(`flex:1;`)} />
{/* step counter hoisted to Tier-2 nav */}
{(showNext) ? (<><button onClick={creNext} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:${nextBg}; color:${nextFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${nextCursor};`)}>{nextLabel}<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
{(step4Idle) ? (<>
{(triggerBlocked) ? (<><button onClick={onBlockFix} title={blockFixTitle} style={css(`display:inline-flex; align-items:center; gap:6px; font-family:inherit; font-size:11.5px; color:#D14B4B; font-weight:700; max-width:300px; text-align:right; border:none; background:transparent; padding:0; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#E8A6A6;`)} onMouseEnter={(e) => hoverOn(e, `text-decoration-color:#D14B4B;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; font-family:inherit; font-size:11.5px; color:#D14B4B; font-weight:700; max-width:300px; text-align:right; border:none; background:transparent; padding:0; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#E8A6A6;`, `text-decoration-color:#D14B4B;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"} style={css(`flex-shrink:0;`)}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{triggerBlockReason}<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} style={css(`flex-shrink:0;`)}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
<button onClick={triggerAll} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:${triggerAllBg}; color:${triggerAllFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${triggerAllCursor};`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M5 3l14 9-14 9V3z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Trigger Design ({triggerCount} SCs)</button>
</>) : null}
{(step4Active) ? (<><button onClick={goCreateMore} style={css(`display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}>Add more plans</button><button onClick={goReview} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Open Design Review<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
</div>
</>) : null}{/* end isWizardView */}
{/* ===== RUN QUEUE VIEW (Run Queue tab) ===== */}
{(isQueueView) ? (<>
<div style={css(`flex:1; overflow:auto; padding:22px 28px; background:#fff;`)}>
{/* IN-FLIGHT: at least one Planned / In-Progress run. Completed runs drop out to Design Review. */}
{(queueInFlight) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:14px 18px; border-bottom:1px solid #E6EBF2;`)}>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Design Run Queue</div><div style={css(`font-size:11.5px; color:#8E96A3; margin-top:1px;`)}>In-flight runs · each solve takes ~{estLabel}. Completed runs move to Design Review.</div></div>
<div style={css(`flex:1;`)} />
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#F2F5FA; color:#5A5E66;`)}>{runPlannedN} Planned</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>{runProgN} In Progress</span>
{(hasDoneRuns) ? (<><button onClick={goReview} style={css(`display:inline-flex; align-items:center; gap:5px; border:none; background:transparent; padding:4px 6px; font-family:inherit; font-size:11px; font-weight:700; color:#128A3E; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B6E0C6;`)} onMouseEnter={(e) => hoverOn(e, `text-decoration-color:#128A3E;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:5px; border:none; background:transparent; padding:4px 6px; font-family:inherit; font-size:11px; font-weight:700; color:#128A3E; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B6E0C6;`, `text-decoration-color:#128A3E;`)}>{doneReviewLabel}<svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.4"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
</div>
<div style={css(`display:grid; grid-template-columns:2fr 0.8fr 0.5fr 0.9fr 1.3fr 1.6fr 1.1fr; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>RUN NAME</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>SC</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>HW</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>NEW NODE</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>REF PLAN</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>STATUS</div>
<div style={css(`padding:9px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>TRIGGERED</div>
</div>
{(queueRows || []).map((c, __i56) => (<React.Fragment key={__i56}>
<div style={css(`display:grid; grid-template-columns:2fr 0.8fr 0.5fr 0.9fr 1.3fr 1.6fr 1.1fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:2fr 0.8fr 0.5fr 0.9fr 1.3fr 1.6fr 1.1fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:11px 14px; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:700; color:#003F98; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{c.runName}</div></div>
<div style={css(`padding:11px 14px; font-size:12px; color:#14171F; font-weight:600;`)}>{c.code}</div>
<div style={css(`padding:11px 14px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{c.hw}</div>
<div style={css(`padding:11px 14px; text-align:center;`)}>
{(c.newNode) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; color:#128A3E;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>On</span></>) : null}
{(c.newNodeOff) ? (<><span style={css(`font-size:12px; color:#8E96A3;`)}>—</span></>) : null}
</div>
<div style={css(`padding:11px 14px; min-width:0;`)}><div style={css(`font-size:11.5px; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{c.refPlanLabel}</div></div>
<div style={css(`padding:9px 14px; min-width:0;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:6px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:600; background:${c.statusBg}; color:${c.statusFg};`)}>
{(c.isRunning) ? (<><span style={css(`width:7px; height:7px; border-radius:50%; background:#C77B00; animation:ndcpulse 1s ease-in-out infinite;`)} /></>) : null}
                        {c.status}
                      </span>
</div>
<div style={css(`padding:11px 14px;`)}><div style={css(`font-size:11px; color:#8E96A3; font-variant-numeric:tabular-nums;`)}>Triggered {c.triggered} · {c.triggeredBy}</div></div>
</div>
</React.Fragment>))}
</div>
</>) : null}
{/* ALL-DONE: every run finished — table is empty, so show a dedicated hand-off state. */}
{(queueAllDone) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; padding:56px 24px; text-align:center; gap:11px; background:#fff; border:1px solid #B6E0C6; border-radius:10px;`)}>
<div style={css(`width:44px; height:44px; border-radius:11px; background:#E7F4EC; display:flex; align-items:center; justify-content:center;`)}><svg width={"24"} height={"24"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>All runs finished</div>
<div style={css(`font-size:12.5px; color:#5A5E66; max-width:380px; line-height:1.5;`)}>{doneCountLabel} ready to inspect in Design Review — compare metrics, then push for alignment.</div>
<button onClick={goReview} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; margin-top:4px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Open Design Review<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</>) : null}
{/* NEVER-RAN: nothing has been triggered yet. */}
{(queueNeverRan) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px; text-align:center; gap:10px;`)}>
<svg width={"32"} height={"32"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"1.5"}><path d={"M12 8v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<div style={css(`font-size:14px; font-weight:600; color:#14171F;`)}>No runs queued yet</div>
<div style={css(`font-size:12.5px; color:#5A5E66; max-width:360px; line-height:1.5;`)}>Complete the wizard and trigger a design run — it will appear here with live progress.</div>
</div>
</>) : null}
</div>
<div style={css(`flex-shrink:0; display:flex; align-items:center; gap:14px; padding:13px 28px; background:#fff; border-top:1px solid #E6EBF2;`)}>
{(queueInFlight) ? (<><button onClick={goCreateMore} style={css(`display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}>Add more plans</button></>) : null}
<div style={css(`flex:1;`)} />
{(queueInFlight) ? (<><button onClick={goReview} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Open Design Review<svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
</div>
</>) : null}{/* end isQueueView */}
</div>
</>) : null}
{/* ===== DESIGN REVIEW ===== */}
{(isReview) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
{/* Search SC moved into the Tier-2 tab row (right corner) — no separate search row. */}
<div style={css(`flex:1; display:flex; min-height:0;`)}>
{/* LEFT RAIL */}
<aside style={css(`width:296px; flex-shrink:0; border-right:1px solid #E6EBF2; background:#fff; display:flex; flex-direction:column;`)}>
{/* Rail header: count summary + zone chips */}
<div style={css(`padding:13px 16px 9px; display:flex; align-items:center; justify-content:space-between;`)}>
<span style={css(`font-size:12px; font-weight:700; color:#14171F;`)}>Runs</span>
{(rqHasQueue) ? (<>
<div style={css(`display:flex; align-items:center; gap:5px;`)}>
{(rqShowProg) ? (<><span style={css(`display:inline-flex; align-items:center; padding:2px 7px; border-radius:999px; font-size:10px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>{rqProgN} In Progress</span></>) : null}
<span style={css(`display:inline-flex; align-items:center; padding:2px 7px; border-radius:999px; font-size:10px; font-weight:700; background:#E7F4EC; color:#128A3E;`)}>{rqDoneN} Completed</span>
</div>
</>) : null}
{(rqNoQueue) ? (<>
<span style={css(`font-size:11px; color:#5A5E66;`)}>{reviewShown} of {reviewTotal}</span>
</>) : null}
</div>
<div style={css(`padding:0 12px 10px; display:flex; gap:5px; flex-wrap:wrap;`)}>
{(reviewZoneChips || []).map((z, __i57) => (<React.Fragment key={__i57}><button onClick={z.onClick} style={css(`border:1px solid ${z.bd}; background:${z.bg}; color:${z.fg}; font-family:inherit; font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; cursor:pointer;`)}>{z.label}</button></React.Fragment>))}
</div>
<div style={css(`flex:1; overflow-y:auto; padding:0 10px 12px;`)}>
{/* In-flight section removed per product decision -- the rail now just lists completed runs. */}
{/* Completed runs (clickable, as before) */}
{(reviewList || []).map((r, __i59) => (<React.Fragment key={__i59}>
<div style={css(`padding:0 2px; margin-bottom:3px;`)}>
<button onClick={r.onClick} style={css(`width:100%; display:flex; align-items:center; gap:9px; min-width:0; text-align:left; padding:9px 10px; border:1px solid ${r.bd}; border-radius:8px; background:${r.bg}; cursor:pointer; font-family:inherit;`)}>
<span title={r.sevTitle} style={css(`width:9px; height:9px; border-radius:50%; background:${r.sevDot}; flex-shrink:0;`)} />
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:7px;`)}><span style={css(`font-size:12.5px; font-weight:700; color:#003F98;`)}>{r.code}</span><span style={css(`font-size:11px; color:#5A5E66;`)}>{r.zone}</span></div>
<div style={css(`font-size:11.5px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{r.name}</div>
</div>
<div style={css(`text-align:right; flex-shrink:0;`)}>
<span style={css(`display:inline-block; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; background:${r.verdictBg}; color:${r.verdictFg};`)}>{r.verdict}</span>
<div style={css(`font-size:11px; color:#5A5E66; margin-top:3px; font-variant-numeric:tabular-nums;`)}>CPS ₹{r.cps}</div>
</div>
</button>
</div>
</React.Fragment>))}
{(reviewListEmpty) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; gap:10px; padding:40px 20px; text-align:center;`)}>
<svg width={"30"} height={"30"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"1.6"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<div style={css(`font-size:12.5px; color:#5A5E66; line-height:1.5;`)}>No completed runs match your search or zone.</div>
<button onClick={reviewClearSearch} style={css(`height:32px; padding:0 14px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Clear filters</button>
</div>
</>) : null}
</div>
</aside>
{/* RIGHT DETAIL */}
<main style={css(`flex:1; overflow-y:auto; padding:22px 28px; min-width:0;`)}>
{(hasCurSC) ? (<>
{/* L1→L2→L3 breadcrumb: cycle › SC › plan */}
<div style={css(`display:flex; align-items:center; gap:5px; margin-bottom:12px; font-size:11.5px; color:#8E96A3; flex-wrap:wrap;`)}>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{cycleName}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#003F98;`)}>{curCode}</span>
{(reviewDetail.open) ? (<>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#14171F;`)}>{reviewDetail.runId}</span>
</>) : null}
</div>
{/* Detail header block on its own white surface (text must not float on grey) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 20px; margin-bottom:16px;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; margin-bottom:6px;`)}>
<span style={css(`font-size:19px; font-weight:700; color:#14171F;`)}>{curCode}</span>
<span style={css(`font-size:14px; color:#5A5E66;`)}>{curName}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{curZone}</span>
<span style={css(`font-size:12px; color:#5A5E66;`)}>{curDcCount} LMDCs</span>
</div>
<div style={css(`font-size:13px; color:#5A5E66;`)}>Every run triggered for this SC this cycle is shown below. Historical Weight is one parameter on each run — compare runs, then push one to alignment.</div>
{/* §9 R1/R2 — RUNS for this SC (organised by run, not HW). Each card = one run with a unique ID. */}
<div style={css(`display:flex; align-items:center; gap:9px; margin-top:16px;`)}>
<div style={css(`width:4px; height:18px; background:#003F98; border-radius:2px;`)} />
<span style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Runs generated</span>
<span style={css(`font-size:12px; color:#5A5E66;`)}>— {runCountLabel}</span>
<div style={css(`flex:1;`)} />
{/* Push is per-run now (button on each run card); SC-level badge shows once any run is pushed. */}
{(reviewPushed) ? (<><span style={css(`display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 14px; border-radius:8px; background:#E7F0F8; color:#1E6FB8; font-size:12.5px; font-weight:600;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Pushed to alignment</span></>) : null}
</div>
</div>
<div style={css(`display:flex; flex-direction:column; gap:10px;`)}>
{(planCards || []).map((c, __i60) => (<React.Fragment key={__i60}>
<div style={css(`width:100%; box-sizing:border-box; border:1px solid #E6EBF2; background:#fff; border-radius:13px; padding:16px 20px; display:flex; align-items:center; gap:22px; flex-wrap:wrap;`)}>
{/* Full-width row card, one per line (list, not a grid). Compact top-to-bottom flow (not a wide
    multi-column spread) so each card takes the least vertical+horizontal space that still shows
    the complete summary -- icons top-right, primary actions bottom-right. */}
<div style={css(`width:100%; box-sizing:border-box;`)}>
{/* TOP ROW: identity (left) + view/map/download icons (top-right) */}
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;`)}>
<div style={css(`min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap;`)}>
<span style={css(`font-size:13.5px; font-weight:700; color:#003F98;`)}>{c.runId}</span>
{(c.pushed) ? (<><span style={css(`padding:2px 9px; border-radius:999px; font-size:10px; font-weight:700; background:${c.pushedTagBg}; color:${c.pushedTagFg};`)}>{c.pushedTag}</span></>) : null}
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:#EAEEFB; color:#2F4FC6;`)}>{c.hwLabel} · {c.hwTag}</span>
</div>
<div style={css(`font-size:10.5px; color:#8E96A3; margin-top:3px;`)}>Triggered {c.triggeredAt} · {c.triggeredBy}</div>
</div>
<div style={css(`display:flex; gap:6px; flex-shrink:0;`)}>
<button onClick={c.onMap} aria-label={"Open this run on the map"} title={"View routes on map"} style={css(`display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={c.onDownloadCsv} aria-label={"Download this plan as CSV"} title={"Download plan summary CSV"} style={css(`display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={c.onDetail} aria-label={"Open full plan detail"} title={"Open full plan detail"} style={css(`display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; justify-content:center; width:28px; height:28px; border:1px solid #E6EBF2; border-radius:7px; background:#fff; cursor:pointer; color:#5A5E66;`, `border-color:#003F98; color:#003F98; background:#F3F7FE;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7M15 3h6v6M10 14L21 3"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
{/* MIDDLE: compact inputs line + output metrics grid */}
<div style={css(`display:flex; flex-wrap:wrap; gap:8px 22px; margin-top:10px; padding-top:10px; border-top:1px solid #F4F5F8; font-size:11px; color:#5A5E66;`)}>
<span><span style={css(`color:#8E96A3;`)}>Nodes</span> <strong style={css(`color:#14171F; font-weight:600;`)}>{c.nodes}</strong></span>
<span><span style={css(`color:#8E96A3;`)}>Volume</span> <strong style={css(`color:#14171F; font-weight:600;`)}>{c.volume}</strong></span>
<span><span style={css(`color:#8E96A3;`)}>Vehicle type · count</span> <strong style={css(`color:#14171F; font-weight:600;`)}>{c.vehInput}</strong></span>
</div>
<div style={css(`display:grid; grid-template-columns:repeat(6, 1fr); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-top:8px;`)}>
<div style={css(`background:#fff; padding:8px 10px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:500; color:${c.coverageColor}; line-height:1;`)}>{c.coverage}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>Coverage</div>{(c.coverageGap) ? (<><div style={css(`font-size:8.5px; font-weight:700; color:#D14B4B; margin-top:3px; line-height:1.3;`)}>{c.coverageGapText}</div></>) : null}</div>
<div style={css(`background:#fff; padding:8px 10px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:500; color:${c.utilColor}; line-height:1;`)}>{c.util}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>Utilisation</div></div>
<div style={css(`background:#fff; padding:8px 10px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:500; color:#14171F; line-height:1;`)}>{c.cps}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>CPS</div>{(c.cpsRefOn) ? (<><div style={css(`font-size:8.5px; font-weight:600; color:${c.cpsDeltaColor}; margin-top:3px;`)} title={c.cpsDeltaTooltip}>{c.cpsDeltaLabel}</div></>) : null}</div>
<div style={css(`background:#fff; padding:8px 10px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:500; color:#14171F; line-height:1;`)}>{c.routes}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>Routes</div></div>
<div style={css(`background:#fff; padding:8px 10px;`)} title={c.rdrTooltip}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:500; color:${c.rdrColor}; line-height:1;`)}>{c.rdrLabel}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>RDR</div></div>
<div style={css(`background:#fff; padding:8px 10px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:500; color:#14171F; line-height:1; font-variant-numeric:tabular-nums;`)}>{c.distance}</div><div style={css(`font-size:9.5px; color:#5A5E66; margin-top:4px;`)}>Distance</div></div>
</div>
{(c.hasUtilChip) ? (<><div style={css(`display:inline-flex; align-items:center; gap:6px; padding:3px 9px; border-radius:6px; background:#FBF1DF; border:1px solid #F5DEB8; font-size:10.5px; font-weight:600; color:#C77B00; margin-top:8px;`)}><svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{c.utilChipLabel}</div></>) : null}
{/* BOTTOM ROW: validation flag (left) + primary actions (bottom-right) */}
<div style={css(`display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-top:12px; padding-top:10px; border-top:1px solid #F4F5F8;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:6px; padding:5px 10px; border-radius:999px; font-size:10.5px; font-weight:600; background:${c.flagBg}; color:${c.flagFg};`)}><span style={css(`width:7px; height:7px; border-radius:50%; background:${c.flagDot};`)} />{c.flagLabel}</span>
<div style={css(`display:flex; gap:8px;`)}>
<button onClick={c.onPush} aria-label={"Push this run to Ops Alignment"} style={css(`display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 13px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; justify-content:center; gap:7px; height:34px; padding:0 13px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`, `background:#00337D;`)}>Push to alignment<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={c.onFinaliseDirect} aria-label={"Finalise this run directly without Ops alignment"} style={css(`display:inline-flex; align-items:center; justify-content:center; height:34px; padding:0 13px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C77B00; color:#C77B00;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; justify-content:center; height:34px; padding:0 13px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`, `border-color:#C77B00; color:#C77B00;`)}>Finalise directly</button>
</div>
</div>
</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
{/* Ingested plans section (RLH Plan Ingestion → Design Review wiring) */}
{(hasReviewIngested) ? (<>
<div style={css(`margin-top:22px;`)}>
<div style={css(`font-size:12px; font-weight:700; color:#5A5E66; letter-spacing:0.05em; margin-bottom:10px;`)}>INGESTED PLANS</div>
{(reviewIngestedPlans || []).map((ip, __i61) => (<React.Fragment key={__i61}>
<div style={css(`display:flex; align-items:center; gap:14px; padding:13px 16px; background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:8px;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:flex; align-items:center; gap:14px; padding:13px 16px; background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:8px;`, `background:#FAFBFD;`)}>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:3px;`)}>
<span style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{ip.name}</span>
<span style={css(`padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; background:#EAF3FB; color:#1E6FB8;`)}>Ingested</span>
<span style={css(`padding:2px 8px; border-radius:999px; font-size:10px; font-weight:600; background:#E7F4EC; color:#128A3E;`)}>Validated</span>
</div>
<div style={css(`font-size:11px; color:#8E96A3;`)}>{ip.runId} · SC {ip.scCode} · {ip.rows} rows · {ip.by} · {ip.date}</div>
</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
{(noCurSC) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px 40px; text-align:center;`)}>
<div style={css(`width:54px; height:54px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"26"} height={"26"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.5"}><path d={"M12 8v4l3 2M12 21a9 9 0 100-18 9 9 0 000 18z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F; margin-bottom:5px;`)}>No runs ready to review yet</div><div style={css(`font-size:12.5px; color:#5A5E66; max-width:380px; line-height:1.6;`)}>An SC appears here once all three historical-weight runs finish. Trigger runs in Design Creation, then check back when the run queue completes.</div></div>
<button onClick={goCreate} style={css(`height:36px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Go to Design Creation</button>
</div>
</>) : null}
</main>
</div>
{/* PUSH MODAL */}
{(pushOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:80; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:560px; max-width:100%; max-height:90vh; overflow:auto; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3);`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #E6EBF2;`)}>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Push to Ops Alignment</div><div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>{pushSCname}</div></div>
<button onClick={closePush} aria-label={"Close dialog"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex;`)}><svg aria-hidden={"true"} width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`padding:20px 22px;`)}>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; margin-bottom:9px;`)}>SC POCs <span style={css(`font-weight:500; color:#5A5E66;`)}>— from SC Master</span></div>
<div style={css(`display:flex; flex-wrap:wrap; gap:7px; margin-bottom:20px;`)}>
{(pocChips || []).map((p, __i62) => (<React.Fragment key={__i62}><button onClick={p.onToggle} style={css(`display:inline-flex; align-items:center; gap:6px; padding:7px 13px; border:1px solid ${p.bd}; background:${p.bg}; color:${p.fg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:999px; cursor:pointer;`)}>{p.name}</button></React.Fragment>))}
</div>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; margin-bottom:9px;`)}>Add a reviewer manually</div>
<div style={css(`display:flex; gap:8px; margin-bottom:20px;`)}>
<input value={pushName} onInput={onPushName} placeholder={"Name"} style={css(`flex:1; height:38px; padding:0 12px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none;`)} />
<input value={pushEmail} onInput={onPushEmail} placeholder={"email@valmo.com"} style={css(`flex:1.2; height:38px; padding:0 12px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none;`)} />
<button onClick={addManualReviewer} style={css(`height:38px; padding:0 15px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 15px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer; flex-shrink:0;`, `background:#EAEEFB;`)}>Add</button>
</div>
<div style={css(`font-size:12px; font-weight:700; color:#14171F; margin-bottom:9px;`)}>Reviewers <span style={css(`color:#003F98;`)}>({pushCount})</span></div>
<div style={css(`display:flex; flex-direction:column; gap:7px;`)}>
{(reviewersList || []).map((r, __i63) => (<React.Fragment key={__i63}>
<div style={css(`display:flex; align-items:center; gap:11px; padding:9px 13px; background:#FAFBFD; border:1px solid #EEF1F6; border-radius:8px;`)}>
<div style={css(`width:30px; height:30px; border-radius:50%; background:#EAEEFB; color:#003F98; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; overflow:hidden;`)}>{r.initials}</div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:600; color:#14171F;`)}>{r.name}</div><div style={css(`font-size:11px; color:#5A5E66;`)}>{r.email}</div></div>
{(r.isPoc) ? (<><span style={css(`padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; background:#EAEEFB; color:#2F4FC6;`)}>SC POC</span></>) : null}
<button onClick={r.onRemove} aria-label={"Remove reviewer"} style={css(`border:none; background:transparent; cursor:pointer; padding:4px; color:#5A5E66; display:flex;`)}><svg aria-hidden={"true"} width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
</React.Fragment>))}
</div>
</div>
<div style={css(`display:flex; align-items:center; gap:12px; padding:16px 22px; border-top:1px solid #E6EBF2; background:#FAFBFD;`)}>
<span style={css(`font-size:11.5px; color:#5A5E66; flex:1;`)}>Pushed plans are visible only to named reviewers.</span>
<button onClick={closePush} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={doPush} style={css(`height:38px; padding:0 18px; border:none; background:${pushBtnBg}; color:${pushBtnFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${pushCursor};`)}>Push to {pushCount} reviewers</button>
</div>
</div>
</div>
</>) : null}
{/* §9 R4 — FULL-SCREEN PLAN DETAIL (opened by the detail icon on a run card) */}
{(reviewDetail.open) ? (<>
<div style={css(`position:fixed; inset:0; z-index:90; background:#F4F5F8; display:flex; flex-direction:column;`)}>
{/* detail top bar */}
<div style={css(`display:flex; align-items:center; gap:14px; padding:14px 26px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0;`)}>
<button onClick={reviewDetail.close} aria-label={"Back to Design Review"} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Back to runs</button>
<div style={css(`display:flex; align-items:center; gap:9px; flex-wrap:wrap;`)}>
<span style={css(`font-size:16px; font-weight:700; color:#003F98;`)}>{reviewDetail.runId}</span>
<span style={css(`font-size:14px; color:#14171F;`)}>{reviewDetail.code} · {reviewDetail.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{reviewDetail.zone} Zone</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; font-weight:700; background:#EAEEFB; color:#2F4FC6;`)}>{reviewDetail.hwLabel} · {reviewDetail.hwTag}</span>
</div>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:11.5px; color:#8E96A3;`)}>Triggered {reviewDetail.triggeredAt} · {reviewDetail.triggeredBy}</span>
<button onClick={reviewDetail.onMap} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#EAEEFB;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#EAEEFB;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Open on map</button>
<button onClick={reviewDetail.onDownloadCsv} aria-label={"Download route breakdown as CSV"} title={"Download route breakdown CSV"} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Download CSV</button>
<button onClick={reviewDetail.close} aria-label={"Close detail"} style={css(`display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:1px solid #E6EBF2; border-radius:8px; background:#fff; cursor:pointer; color:#5A5E66;`)}><svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`flex:1; overflow-y:auto; padding:22px 26px;`)}>
{/* Plan Detail / Route View tabs — same pattern as Ops Alignment */}
<div style={css(`display:flex; gap:22px; border-bottom:1px solid #E6EBF2; margin-bottom:18px;`)}>
{(reviewDetail.sections || []).map((t, __iRDT) => (<React.Fragment key={__iRDT}>
<button onClick={t.onClick} style={css(`position:relative; padding:0 0 12px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13px; font-weight:${t.weight}; color:${t.color};`)}>{t.label}{(t.active) ? (<><span style={css(`position:absolute; left:0; right:0; bottom:0; height:3px; background:#003F98; border-radius:3px 3px 0 0;`)} /></>) : null}</button>
</React.Fragment>))}
</div>
{(reviewDetail.secDetails) ? (<>
{/* inputs strip */}
<div style={css(`display:flex; flex-wrap:wrap; gap:20px 36px; padding:15px 18px; background:#fff; border:1px solid #E6EBF2; border-radius:8px; margin-bottom:18px;`)}>
<div><div style={css(`font-size:10.5px; color:#5A5E66;`)}>Nodes (input)</div><div style={css(`font-size:15px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{reviewDetail.nodes}</div></div>
<div><div style={css(`font-size:10.5px; color:#5A5E66;`)}>Volume (input)</div><div style={css(`font-size:15px; font-weight:600; color:#14171F; font-variant-numeric:tabular-nums;`)}>{reviewDetail.volume}</div></div>
<div><div style={css(`font-size:10.5px; color:#5A5E66;`)}>Historical weight (input)</div><div style={css(`font-size:15px; font-weight:600; color:#14171F;`)}>{reviewDetail.hwLabel} · {reviewDetail.hwTag}</div></div>
<div style={css(`min-width:200px;`)}><div style={css(`font-size:10.5px; color:#5A5E66;`)}>Vehicle type · count (input)</div><div style={css(`font-size:13.5px; font-weight:600; color:#14171F;`)}>{reviewDetail.vehInput}</div></div>
</div>
{/* output metrics */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:12px 16px; margin-bottom:12px; display:flex; align-items:center; gap:9px;`)}><div style={css(`width:4px; height:18px; background:#003F98; border-radius:2px;`)} /><span style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>Output metrics</span></div>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(118px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-bottom:18px;`)}>
{(reviewDetail.metrics || []).map((m, __i64) => (<React.Fragment key={__i64}>
<div style={css(`background:#fff; padding:14px 15px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:21px; font-weight:500; color:${m.valueColor}; line-height:1;`)}>{m.value}</div><div style={css(`font-size:11.5px; font-weight:600; color:#14171F; margin-top:7px;`)}>{m.label}</div><div style={css(`font-size:10.5px; color:#5A5E66;`)}>{m.sub}</div>{(m.hasDelta) ? (<><div style={css(`font-size:9.5px; font-weight:600; color:${m.deltaColor}; margin-top:4px; white-space:nowrap;`)}>{m.delta}</div></>) : null}</div>
</React.Fragment>))}
</div>
{/* vehicles by type */}
{(reviewDetail.hasVeh) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:18px 20px; margin-bottom:18px;`)}>
<div style={css(`display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:13px;`)}><div style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>Vehicles by type</div><div style={css(`font-size:11.5px; color:#5A5E66;`)}>{reviewDetail.vehTotal} total</div></div>
<div style={css(`display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;`)}>
{(reviewDetail.vehArr || []).map((v, __i65) => (<React.Fragment key={__i65}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 13px; background:#F7F8FB; border:1px solid #EEF1F6; border-radius:8px;`)}>
<span style={css(`font-size:12.5px; color:#14171F; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{v.veh}</span>
<span style={css(`font-size:13px; font-weight:700; color:#003F98; flex-shrink:0;`)}>×{v.n}</span>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
{/* validation flags */}
{(reviewDetail.hasFlags) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 18px; margin-bottom:18px;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#14171F; margin-bottom:9px;`)}>Validation flags</div>
<div style={css(`display:flex; flex-direction:column; gap:7px;`)}>
{(reviewDetail.flags || []).map((fl, __i66) => (<React.Fragment key={__i66}><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; background:#F7F8FB; border:1px solid #EEF1F6; border-radius:8px;`)}><span style={css(`display:inline-flex; align-items:center; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:700; background:${fl.sevBg}; color:${fl.sevFg}; flex-shrink:0;`)}>{fl.sevLabel}</span><span style={css(`font-size:12.5px; color:#5A5E66;`)}>{fl.t}</span></div></React.Fragment>))}
</div>
</div>
</>) : null}
{(reviewDetail.noFlags) ? (<><div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:12px 16px; display:flex; align-items:center; gap:8px; margin-bottom:18px; font-size:12.5px; color:#128A3E;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>No validation flags on this run.</div></>) : null}
</>) : null}
{(reviewDetail.secRoute) ? (<>
{/* per-route breakdown — §P3.2 toggle: Detail View (DC × Route) / Route View, left-aligned */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
<div style={css(`padding:12px 16px; border-bottom:1px solid #EEF1F6; display:flex; align-items:center; gap:12px; flex-wrap:wrap;`)}>
<div style={css(`display:flex; border:1px solid #E6EBF2; border-radius:6px; overflow:hidden; flex-shrink:0;`)}>
<button onClick={reviewDetail.onDcView} style={css(`height:30px; padding:0 12px; font-size:12px; font-weight:600; border:none; border-right:1px solid #E6EBF2; cursor:pointer; font-family:inherit; background:${reviewDetail.dcViewBg}; color:${reviewDetail.dcViewFg};`)}>Detail View (DC × Route)</button>
<button onClick={reviewDetail.onRouteView} style={css(`height:30px; padding:0 12px; font-size:12px; font-weight:600; border:none; cursor:pointer; font-family:inherit; background:${reviewDetail.routeViewBg}; color:${reviewDetail.routeViewFg};`)}>Route View</button>
</div>
</div>
{/* Route View (Pivot at Route) — default */}
{(reviewDetail.isRouteView) ? (<>
<div style={css(`overflow-x:auto;`)}>
<div style={css(`min-width:1200px;`)}>
<div style={css(`display:grid; grid-template-columns:1fr 0.95fr 0.85fr 0.5fr 0.7fr 0.7fr 0.7fr 0.5fr 0.6fr 0.65fr 0.65fr 0.95fr; background:#E6EBF2;`)}>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMDC</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ROUTE</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>COUNT</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>FREQ</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DIST (KM)</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CPS</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TPs</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>UTIL</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>VOLUME</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CAP</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>LAT / LONG</div>
</div>
{(reviewDetail.routeRows || []).map((r, __i67) => (<React.Fragment key={__i67}>
<div style={css(`display:grid; grid-template-columns:1fr 0.95fr 0.85fr 0.5fr 0.7fr 0.7fr 0.7fr 0.5fr 0.6fr 0.65fr 0.65fr 0.95fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:1fr 0.95fr 0.85fr 0.5fr 0.7fr 0.7fr 0.7fr 0.5fr 0.6fr 0.65fr 0.65fr 0.95fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:11px 12px; font-size:12px; font-weight:600; color:#003F98;`)}>{r.lmdc}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F;`)}>{r.segment}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F;`)}>{r.veh}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:center;`)}>{r.count}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#5A5E66;`)}>{r.freq}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.dist}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.cps}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:center;`)}>{r.tps}</div>
<div style={css(`padding:11px 12px; text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:5px;`)}><span style={css(`font-size:12px; font-weight:600; color:${r.utilColor}; font-variant-numeric:tabular-nums;`)}>{r.util}</span>{(r.hasUtilFlag) ? (<><span style={css(`padding:1px 5px; border-radius:3px; font-size:9px; font-weight:700; background:#FBF1DF; color:#C77B00; white-space:nowrap;`)}>{r.utilFlagLabel}</span></>) : null}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.vol}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.cap}</div>
<div style={css(`padding:11px 12px; font-size:11.5px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap;`)}>{r.latLng}</div>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
{/* Detail View (DC × Route) — §P3.2 */}
{(reviewDetail.isDcView) ? (<>
<div style={css(`overflow-x:auto;`)}>
<div style={css(`min-width:1100px;`)}>
<div style={css(`display:grid; grid-template-columns:1.1fr 0.75fr 1fr 0.45fr 0.7fr 0.65fr 0.55fr 0.65fr 0.9fr 0.7fr; background:#E6EBF2;`)}>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>LMDC</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DESIGN VOL</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ROUTE CODE</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TP</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ZONE</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>OUT CUTOFF</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>TAT</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>IN CUTOFF</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE TYPE</div>
<div style={css(`padding:10px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>RT DIST (KM)</div>
</div>
{(reviewDetail.dcRows || []).map((d, __i68) => (<React.Fragment key={__i68}>
<div style={css(`display:grid; grid-template-columns:1.1fr 0.75fr 1fr 0.45fr 0.7fr 0.65fr 0.55fr 0.65fr 0.9fr 0.7fr; align-items:center; border-left:2px solid #8E96A3; border-right:2px solid #8E96A3; border-top:${d.isFirstInGroup ? '2px solid #8E96A3' : '1px solid #F4F5F8'}; border-bottom:${d.isLastInGroup ? '2px solid #8E96A3' : 'none'}; margin-top:${d.isFirstInGroup ? '6px' : '0'};`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `background:transparent;`, `background:#FAFBFD;`)}>
<div style={css(`padding:11px 12px; font-size:12px; font-weight:600; color:#003F98;`)}>{d.lmdc}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{d.designVol}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F;`)}>{d.routeCode}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:center; font-variant-numeric:tabular-nums;`)}>{d.tp}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#5A5E66;`)}>{d.zone}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{d.outCutoff}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right;`)}>{d.tat}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{d.inCutoff}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F;`)}>{d.vehType}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; text-align:right; font-variant-numeric:tabular-nums;`)}>{d.rtDist}</div>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
</div>
</>) : null}
</div>
</div>
</>) : null}
</div>
</>) : null}
{/* ===== OPS ALIGNMENT · PLANNER ===== */}
{(isAlignPlanner) ? (<>
<div style={css(`display:flex; flex-direction:row; height:100%; min-height:0;`)}>
{/* ===== EMPTY STATE (no plans in the active filter) — full width ===== */}
{(aSel.empty) ? (<>
<div style={css(`flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px 40px; text-align:center;`)}>
<div style={css(`width:54px; height:54px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"26"} height={"26"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.5"}><path d={"M3 12.5l3.3 3.3L12.5 9M11 16l1.4 1.4L21 9"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F; margin-bottom:5px;`)}>No plans in this view</div><div style={css(`font-size:12.5px; color:#5A5E66; max-width:360px; line-height:1.6;`)}>No plans match the current filter. Clear it to see all plans in this cycle, or push runs from Design Review to start the alignment loop.</div></div>
<button onClick={alignClearFilter} style={css(`height:36px; padding:0 16px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Clear filter</button>
</div>
</>) : null}
{/* ===== MASTER RAIL: SC / plan list (persistent, like Design Review) ===== */}
{(alignIsL1) ? (<>
<aside style={css(`width:300px; flex-shrink:0; border-right:1px solid #E6EBF2; background:#fff; display:flex; flex-direction:column; min-height:0;`)}>
{/* filter segment (moved off the top tab-strip into the rail) */}
<div style={css(`padding:12px 12px 8px; flex-shrink:0;`)}>
<div style={css(`display:flex; gap:3px; background:#F2F5FA; border-radius:8px; padding:3px;`)}>
{(alignFilterSeg || []).map((fs, __i69) => (<React.Fragment key={__i69}><button onClick={fs.onClick} title={fs.label} style={css(`flex:1; min-width:0; height:29px; border:none; border-radius:6px; background:${fs.bg}; color:${fs.fg}; font-family:inherit; font-size:11px; font-weight:${fs.weight}; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{fs.short} {fs.count}</button></React.Fragment>))}
</div>
</div>
<div style={css(`padding:0 16px 8px; font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em; flex-shrink:0;`)}>{planCount} PLANS</div>
<div style={css(`flex:1; overflow-y:auto; padding:0 9px 12px; min-height:0;`)}>
{(planList || []).map((p, __i70) => (<React.Fragment key={__i70}>
<button onClick={p.onClick} style={css(`width:100%; text-align:left; display:flex; flex-direction:column; gap:5px; padding:10px 11px; margin-bottom:4px; border:1px solid ${p.bd}; border-radius:9px; background:${p.bg}; cursor:pointer; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `width:100%; text-align:left; display:flex; flex-direction:column; gap:5px; padding:10px 11px; margin-bottom:4px; border:1px solid ${p.bd}; border-radius:9px; background:${p.bg}; cursor:pointer; font-family:inherit;`, `border-color:#C3C9D4;`)}>
<div style={css(`display:flex; align-items:center; gap:6px; min-width:0;`)}><span style={css(`font-size:12.5px; font-weight:700; color:#003F98; flex-shrink:0;`)}>{p.code}</span><span style={css(`font-size:11.5px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{p.name}</span></div>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap;`)}><span style={css(`padding:2px 8px; border-radius:999px; font-size:9.5px; font-weight:700; background:${p.statusBg}; color:${p.statusFg};`)}>{p.statusLabel}</span><span style={css(`font-size:10px; color:#8E96A3;`)}>{p.zone} · {p.submittedLabel}</span></div>
</button>
</React.Fragment>))}
</div>
</aside>
</>) : null}
{/* ===== DETAIL PANE (selected plan; persistent rail replaces the L1 drill) ===== */}
{(alignIsL2) ? (<>
<main style={css(`flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden;`)}>
<div style={css(`flex:1; overflow-y:auto; min-height:0;`)}>
{/* ===== L3: PLAN CARD (compact summary; "view detail" opens L4 below) ===== */}
{/* Exactly one card today since each SC has one active plan — written as a stack so a future
    multi-plan-per-SC change just becomes a longer array here, no restructuring needed. */}
{(aSel.exists && aSel.showCard) ? (<>
<div style={css(`padding:20px 26px;`)}>
<div style={css(`display:flex; align-items:center; gap:5px; margin-bottom:12px; font-size:11.5px; color:#8E96A3; flex-wrap:wrap;`)}>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{cycleName}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{aSel.statusLabel}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#003F98;`)}>{aSel.code}</span>
</div>
<div style={css(`width:100%; box-sizing:border-box; border:1px solid #E6EBF2; background:#fff; border-radius:13px; padding:14px 18px;`)}>
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0;`)}>
<span style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>{aSel.code}</span>
<span style={css(`font-size:13px; color:#5A5E66;`)}>{aSel.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{aSel.zone} Zone</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:600; background:#EAEEFB; color:#2F4FC6;`)}>RLH</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:${aSel.statusBg}; color:${aSel.statusFg};`)}>{aSel.statusLabel}</span>
</div>
{/* top-right: view / map / (download once finalised) icons */}
<div style={css(`display:flex; gap:6px; flex-shrink:0;`)}>
<button onClick={aSel.openDetail} aria-label={"View plan details"} title={"View plan details"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"} strokeLinecap={"round"} strokeLinejoin={"round"} /><circle cx={"12"} cy={"12"} r={"3"} /></svg></button>
<button onClick={aSel.onMapView} aria-label={"Map view"} title={"Map view"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
{(aSel.isFinal) ? (<><button onClick={aSel.onDownloadCsv} aria-label={"Download CSV"} title={"Download CSV"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></>) : null}
</div>
</div>
{/* ---- PENDING: metrics + reviewer chips ---- */}
{(aSel.isPushed) ? (<>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(88px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-top:12px;`)}>
{(aSel.metrics || []).map((m, __i920) => (<React.Fragment key={__i920}><div style={css(`background:#fff; padding:10px 12px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:10.5px; color:#5A5E66; margin-top:4px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:12px;`)}>
<span style={css(`font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.03em;`)}>REVIEWERS:</span>
{(aSel.opsLeads || []).map((ol, __i921) => (<React.Fragment key={__i921}><span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${ol.chipBg}; color:${ol.chipFg};`)}>{ol.mark} {ol.name}</span></React.Fragment>))}
</div>
</>) : null}
{/* ---- RECEIVED: reviewer submission status ---- */}
{(aSel.showFeedback && !aSel.isFinal) ? (<>
<div style={css(`font-size:11.5px; color:#5A5E66; margin-top:12px; margin-bottom:6px;`)}>{aSel.reviewProgress}</div>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap;`)}>
{(aSel.opsLeads || []).map((ol, __i922) => (<React.Fragment key={__i922}><span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:999px; font-size:11px; font-weight:600; background:${ol.chipBg}; color:${ol.chipFg};`)}>{ol.mark} {ol.name} {"\u2014"} {ol.statusText}</span></React.Fragment>))}
</div>
</>) : null}
{/* ---- FINALISED: Design-Review-style inputs + output metrics + warnings ---- */}
{(aSel.isFinal) ? (<>
<div style={css(`display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin-top:12px; padding-top:12px; border-top:1px solid #F2F5FA;`)}>
<div><div style={css(`font-size:9.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>NODES</div><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{aSel.cardNodes}</div></div>
<div><div style={css(`font-size:9.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>VOLUME</div><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{aSel.cardVolume}</div></div>
<div><div style={css(`font-size:9.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>HISTORICAL WEIGHT</div><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{aSel.cardHwLabel}</div></div>
<div><div style={css(`font-size:9.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em;`)}>VEHICLE TYPE {"\u00b7"} COUNT</div><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{aSel.cardVehSummary}</div></div>
</div>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(88px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-top:10px;`)}>
{(aSel.metrics || []).map((m, __i923) => (<React.Fragment key={__i923}><div style={css(`background:#fff; padding:10px 12px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:10.5px; color:#5A5E66; margin-top:4px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
{(aSel.cardWarnings || []).map((w, __i924) => (<React.Fragment key={__i924}><div style={css(`display:flex; align-items:center; gap:7px; margin-top:8px; padding:8px 12px; background:#FBF1DF; border:1px solid #F0DBA8; border-radius:8px;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"2.2"}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:11.5px; color:#C77B00; font-weight:500;`)}>{w.label}</span></div></React.Fragment>))}
</>) : null}
{(aSel.showFeedback && !aSel.isFinal) ? (<>
<div style={css(`display:flex; justify-content:flex-end; align-items:center; gap:8px; margin-top:12px;`)}>
{(aSel.canPlanSim) ? (<><button onClick={aSel.onPlanSim} style={css(`display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 13px; border:1px solid #2F4FC6; background:${aSel.planSimBtnBg}; color:${aSel.planSimBtnFg}; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M13 2L3 14h9l-1 8 10-12h-9l1-8z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{aSel.planSimBtnLabel}</button></>) : null}
{(aSel.canAck) ? (<><button onClick={aSel.onAck} style={css(`display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 13px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `background:#003F98;`, `background:#00337D;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Acknowledge & freeze</button></>) : null}
{(aSel.isAck) ? (<><button onClick={aSel.onFin} title={aSel.finBlocked ? 'Decide all flagged rows first' : 'Finalise this plan'} style={css(`display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 13px; border:none; background:${aSel.finBtnBg}; color:${aSel.finBtnFg}; font-family:inherit; font-size:12px; font-weight:600; border-radius:7px; cursor:${aSel.finCursor};`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Finalise plan</button></>) : null}
</div>
</>) : null}
</div>
</div>
</>) : null}
{(aSel.exists && aSel.detailOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:90; background:#F4F5F8; display:flex; flex-direction:column;`)}>
<div style={css(`display:flex; align-items:center; gap:14px; padding:14px 26px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0; flex-wrap:wrap;`)}>
<button onClick={aSel.backToCards} aria-label={"Back to plans"} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Back to plans</button>
<div style={css(`display:flex; align-items:center; gap:9px; flex-wrap:wrap;`)}>
<span style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>{aSel.code}</span>
<span style={css(`font-size:14px; color:#5A5E66;`)}>{aSel.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{aSel.zone} Zone</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:${aSel.statusBg}; color:${aSel.statusFg};`)}>{aSel.statusLabel}</span>
</div>
<div style={css(`flex:1;`)} />
{(aSel.canPlanSim) ? (<><button onClick={aSel.onPlanSim} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #2F4FC6; background:${aSel.planSimBtnBg}; color:${aSel.planSimBtnFg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M13 2L3 14h9l-1 8 10-12h-9l1-8z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{aSel.planSimBtnLabel}</button></>) : null}
<button onClick={aSel.onMapView} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Map view</button>
{(aSel.isFinal) ? (<><button onClick={aSel.onDownloadCsv} aria-label={"Download CSV"} title={"Download CSV"} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Download CSV</button></>) : null}
<button onClick={aSel.backToCards} aria-label={"Close detail"} style={css(`display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:1px solid #E6EBF2; border-radius:8px; background:#fff; cursor:pointer; color:#5A5E66;`)}><svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`flex:1; overflow-y:auto; padding:20px 26px;`)}>
{/* L1→L2→L3 breadcrumb: cycle › status › SC — same pattern as Design Review's cycle › SC › plan */}
<div style={css(`display:flex; align-items:center; gap:5px; margin-bottom:12px; font-size:11.5px; color:#8E96A3; flex-wrap:wrap;`)}>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{cycleName}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{aSel.statusLabel}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#003F98;`)}>{aSel.code}</span>
</div>
{/* header on its own white surface (sticky so the SC + Simulate-impact CTA stay visible on scroll) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 20px; display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; flex-wrap:wrap; position:sticky; top:0; z-index:5; box-shadow:0 2px 8px rgba(20,23,31,0.04);`)}>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:9px; flex-wrap:wrap;`)}><span style={css(`font-size:19px; font-weight:700; color:#14171F;`)}>{aSel.code}</span><span style={css(`font-size:14px; color:#5A5E66;`)}>{aSel.name}</span><span style={css(`padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{aSel.zone} Zone</span><span style={css(`padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:#EAEEFB; color:#2F4FC6;`)}>SC: {aSel.code}</span><span style={css(`padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:#EAEEFB; color:#2F4FC6;`)}>RLH</span><span style={css(`padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; background:${aSel.statusBg}; color:${aSel.statusFg};`)}>{aSel.statusLabel}</span></div>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:7px;`)}>
<span style={css(`font-size:12px; color:#5A5E66;`)}>Pushed {aSel.sentDate}</span>
<span style={css(`width:3px; height:3px; border-radius:50%; background:#C3C9D4;`)} />
<span style={css(`font-size:11px; font-weight:700; color:#5A5E66; letter-spacing:0.03em;`)}>OPS LEADS:</span>
{(aSel.opsLeads || []).map((ol, __i71) => (<React.Fragment key={__i71}><span style={css(`display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:${ol.chipBg}; color:${ol.chipFg};`)}>{ol.mark} {ol.name}</span></React.Fragment>))}
</div>
</div>
{/* Plan-level Simulate impact button (planner) moved to the top bar — see aSel.canPlanSim above */}
</div>
{/* Unified outer tabs — same "Plan Detail" / "Route View" pattern as Design Review and the Ops-Lead view, applied across every plan status (Pushed / In Alignment / Acknowledged / Finalised). */}
<div style={css(`display:flex; align-items:center; gap:20px; border-bottom:1px solid #E6EBF2; margin-bottom:16px;`)}>
{(aSel.sections || []).map((t, __i73c) => (<React.Fragment key={__i73c}><button onClick={t.onClick} style={css(`position:relative; padding:0 0 12px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13px; font-weight:${t.weight}; color:${t.color};`)}>{t.label}{(t.active) ? (<><span style={css(`position:absolute; left:0; right:0; bottom:0; height:3px; background:#003F98; border-radius:3px 3px 0 0;`)} /></>) : null}</button></React.Fragment>))}
</div>
{/* PUSHED: awaiting */}
{(aSel.isPushed) ? (<>
{(aSel.secDetails) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:13px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:16px 20px;`)}>
<div style={css(`width:40px; height:40px; border-radius:9px; background:#F2F5FA; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"21"} height={"21"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.7"}><path d={"M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Awaiting Ops feedback — {aSel.reviewProgress}</div><div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>Route-level changes appear here the moment a reviewer submits. Each reviewer's status is tracked below.</div></div>
</div>
{(aSel.opsLeads || []).map((ol, __i72) => (<React.Fragment key={__i72}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:13px 20px; border-top:1px solid #F4F6FA;`)}>
<span style={css(`width:32px; height:32px; border-radius:50%; background:#EAEEFB; color:#003F98; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0;`)}>{ol.initials}</span>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>{ol.name}</div><div style={css(`font-size:11px; color:#8E96A3;`)}>Ops Lead</div></div>
<span style={css(`display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:700; background:${ol.chipBg}; color:${ol.chipFg};`)}>{ol.mark} {ol.statusText}</span>
</div>
</React.Fragment>))}
</div>
{/* PLAN DETAILS · READ-ONLY metrics — same outer "Plan Detail" tab opened above */}
<div style={css(`font-size:11px; font-weight:700; color:#8E96A3; letter-spacing:0.05em; margin:16px 0 10px;`)}>PLAN DETAILS · READ-ONLY</div>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(108px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden;`)}>
{(aSel.metrics || []).map((m, __i73) => (<React.Fragment key={__i73}><div style={css(`background:#fff; padding:13px 14px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:11px; color:#5A5E66; margin-top:5px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
</>) : null}
{(aSel.secRoute) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow-x:auto;`)}>
<div style={css(`min-width:660px;`)}>
<div style={css(`display:grid; grid-template-columns:88px 1.5fr 44px 52px 88px 68px 80px 58px; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ROUTE</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>VEHICLE</div>
<div style={css(`padding:9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>TP</div>
<div style={css(`padding:9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DCs</div>
<div style={css(`padding:9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DISTANCE</div>
<div style={css(`padding:9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>CPS</div>
<div style={css(`padding:9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>VOL</div>
<div style={css(`padding:9px 12px 9px 8px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>UTIL</div>
</div>
{(aSel.rows || []).map((r, __i74) => (<React.Fragment key={__i74}>
<div style={css(`display:grid; grid-template-columns:88px 1.5fr 44px 52px 88px 68px 80px 58px; border-top:1px solid #EEF1F6; align-items:center;`)}>
<div style={css(`padding:9px 12px; font-size:12px; font-weight:700; color:#003F98;`)}>{r.routeCode}</div>
<div style={css(`padding:9px 12px; font-size:12px; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{r.veh}</div>
<div style={css(`padding:9px 8px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.tp}</div>
<div style={css(`padding:9px 8px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.dcCount}</div>
<div style={css(`padding:9px 8px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.rtDist}</div>
<div style={css(`padding:9px 8px; font-size:12px; color:#14171F; font-weight:600; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.cps}</div>
<div style={css(`padding:9px 8px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.vol}</div>
<div style={css(`padding:9px 12px 9px 8px; font-size:12px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.util}</div>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
</>) : null}
{/* FEEDBACK: rows */}
{(aSel.showFeedback) ? (<>
{(aSel.secDetails) ? (<>
{(aSel.needsAckToDecide) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:12px; background:#EAF1FB; border:1px solid #CFE0F1; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>Ops feedback is in. Review it under Route View, then <strong>Acknowledge & freeze</strong> to start accepting or rejecting each flagged change.</span></div></>) : null}
{(aSel.isAck) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:12px; background:#E7F0F8; border:1px solid #CFE0F1; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>Ops editing is <strong>locked</strong> — reviewers can no longer change this plan. Accept or reject each flagged row under Route View, then Finalise.</span></div></>) : null}
{(aSel.isFinal) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:12px; background:#E7F4EC; border:1px solid #BFE3CC; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>This plan is <strong>finalised & frozen</strong>. Decisions are final.</span></div></>) : null}
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(108px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden;`)}>
{(aSel.metrics || []).map((m, __i75) => (<React.Fragment key={__i75}><div style={css(`background:#fff; padding:13px 14px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:11px; color:#5A5E66; margin-top:5px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
</>) : null}
{(aSel.secRoute) ? (<>
{/* Plan-level Simulate impact: moved to modal (planSimOpen) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;`)}>
<span style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Changes to review</span>
{(aSel.showFeedback) ? (<><span style={css(`font-size:12px; color:#5A5E66;`)}>{aSel.progressLabel} · {aSel.acceptedCount} accepted · {aSel.rejectedCount} rejected</span></>) : null}
</div>
<div style={css(`display:flex; flex-direction:column; gap:14px;`)}>
{/* One card per flagged route (Design-Review style): full route info + SC-level & DC-level changes decided separately. */}
{(aSel.routeCards || []).map((rc, __i78) => (<React.Fragment key={__i78}>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:14px 18px; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`min-width:0;`)}>
<div style={css(`display:flex; align-items:center; gap:9px; margin-bottom:3px;`)}>
<span style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>{rc.routeCode}</span>
<span style={css(`display:inline-block; padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:600; background:${rc.opsBg}; color:${rc.opsFg};`)}>{rc.opsChip}</span>
</div>
</div>
<div style={css(`display:flex; align-items:center; gap:9px; flex-shrink:0;`)}>
<span style={css(`display:inline-flex; align-items:center; height:26px; padding:0 11px; border-radius:999px; font-size:11.5px; font-weight:700; background:${rc.actionBg}; color:${rc.actionFg}; white-space:nowrap;`)}>{rc.actionLabel}</span>
{(rc.acceptAllRowShow) ? (<><button onClick={rc.onAcceptAllRow} style={css(`height:30px; padding:0 13px; border:1px solid #128A3E; background:#fff; color:#128A3E; font-family:inherit; font-size:12px; font-weight:700; border-radius:7px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#E7F4EC;`)} onMouseLeave={(e) => hoverOff(e, `height:30px; padding:0 13px; border:1px solid #128A3E; background:#fff; color:#128A3E; font-family:inherit; font-size:12px; font-weight:700; border-radius:7px; cursor:pointer;`, `background:#E7F4EC;`)}>Accept all</button></>) : null}
</div>
</div>
{/* Ops Lead remark received (explicitly labeled) + labeled route metrics */}
<div style={css(`padding:14px 18px 0;`)}>
{(rc.hasFb) ? (<>
<div style={css(`margin-bottom:12px; padding:9px 13px; background:#FFF9EC; border:1px solid #F3E2BC; border-left:3px solid #C77B00; border-radius:8px;`)}>
<div style={css(`display:flex; align-items:center; gap:6px; margin-bottom:4px;`)}>
<svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#9A5E00"} strokeWidth={"2"} strokeLinecap={"round"} strokeLinejoin={"round"}><path d={"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"} /></svg>
<span style={css(`font-size:9.5px; font-weight:700; color:#9A5E00; letter-spacing:0.05em; text-transform:uppercase;`)}>Remark from Ops Lead{(rc.hasProposed) ? (<> · {rc.proposedBy}</>) : null}</span>
</div>
<div style={css(`font-size:12.5px; color:#14171F; line-height:1.4;`)}>{rc.fbText}</div>
</div>
</>) : null}
{/* labeled route metrics (tags, not a run-on line); changed values highlighted amber */}
<div style={css(`display:flex; flex-wrap:wrap; gap:7px 20px; padding:10px 14px; background:#F7F9FC; border:1px solid #EEF1F6; border-radius:8px; font-variant-numeric:tabular-nums;`)}>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>VEHICLE</span><span style={css(`align-self:flex-start; padding:1px 6px; border-radius:4px; font-size:12px; background:${rc.mlVehBg}; color:${rc.mlVehFg}; font-weight:${rc.mlVehWt};`)}>{rc.mlVehTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>TOUCH POINTS</span><span style={css(`align-self:flex-start; padding:1px 6px; border-radius:4px; font-size:12px; background:${rc.mlTpBg}; color:${rc.mlTpFg}; font-weight:${rc.mlTpWt};`)}>{rc.mlTpTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DELIVERY CENTRES</span><span style={css(`align-self:flex-start; font-size:12px; color:#14171F; font-weight:600;`)}>{rc.mlDcsTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DISTANCE</span><span style={css(`align-self:flex-start; padding:1px 6px; border-radius:4px; font-size:12px; background:${rc.mlDistBg}; color:${rc.mlDistFg}; font-weight:${rc.mlDistWt};`)}>{rc.mlDistTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>CPS</span><span style={css(`align-self:flex-start; font-size:12px; color:#14171F; font-weight:600;`)}>{rc.mlCpsTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>VOLUME</span><span style={css(`align-self:flex-start; font-size:12px; color:#14171F; font-weight:600;`)}>{rc.mlVolTxt}</span></div>
<div style={css(`display:flex; flex-direction:column; gap:2px;`)}><span style={css(`font-size:9px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>UTILISATION</span><span style={css(`align-self:flex-start; font-size:12px; color:#14171F; font-weight:600;`)}>{rc.mlUtilTxt}</span></div>
</div>
</div>
{/* Flagged changes: ONE table combining route-level + delivery-centre changes; the proposed value is highlighted, each change acked individually */}
<div style={css(`padding:12px 18px;`)}>
<div style={css(`border:1px solid #EEF1F6; border-radius:8px; overflow-x:auto;`)}>
<div style={css(`min-width:560px;`)}>
<div style={css(`display:grid; grid-template-columns:180px 1fr 168px; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:8px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>WHERE</div>
<div style={css(`padding:8px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>FLAGGED CHANGE</div>
<div style={css(`padding:8px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>DECISION</div>
</div>
{(rc.changeList || []).map((ch, __i76) => (<React.Fragment key={__i76}>
<div style={css(`display:grid; grid-template-columns:180px 1fr 168px; align-items:center; border-top:1px solid #EEF1F6;`)}>
<div style={css(`padding:10px 12px; min-width:0;`)}><span style={css(`font-size:11.5px; font-weight:600; color:${ch.whereFg}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; max-width:100%;`)}>{ch.whereLabel}</span></div>
<div style={css(`padding:9px 12px; min-width:0;`)}><div style={css(`font-size:9.5px; font-weight:700; color:#8E96A3; text-transform:uppercase; letter-spacing:0.03em;`)}>{ch.fieldLabel}</div><span style={css(`display:inline-block; margin-top:3px; padding:2px 8px; border-radius:5px; background:#FBF1DF; color:#9A5E00; font-size:12px; font-weight:700; font-variant-numeric:tabular-nums;`)}>{ch.changeVal}</span></div>
<div style={css(`padding:8px 12px; display:flex; align-items:center; justify-content:flex-end; gap:6px;`)}>
{(ch.canDecide) ? (<>
<button onClick={ch.onAccept} style={css(`height:26px; padding:0 12px; border:1px solid #128A3E; background:${ch.accBg}; color:${ch.accFg}; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer;`)}>Accept</button>
<button onClick={ch.onReject} style={css(`height:26px; padding:0 12px; border:1px solid #D14B4B; background:${ch.rejBg}; color:${ch.rejFg}; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer;`)}>Reject</button>
</>) : null}
{(ch.decideLocked && ch.decided) ? (<>
{(ch.accepted) ? (<><span style={css(`font-size:11.5px; font-weight:700; color:#128A3E;`)}>✓ Accepted</span></>) : null}
{(ch.rejected) ? (<><span style={css(`font-size:11.5px; font-weight:700; color:#D14B4B;`)}>✕ Rejected</span></>) : null}
</>) : null}
{(ch.decideLocked && ch.undecided) ? (<><span style={css(`font-size:11px; color:#8E96A3; font-style:italic;`)}>Acknowledge to decide</span></>) : null}
</div>
</div>
</React.Fragment>))}
</div>
</div>
</div>
{/* remark + optional read-only DC roster */}
<div style={css(`padding:14px 18px;`)}>
{/* per-decision remark input removed (2026-07-06) — decisions stand on their own */}
<button onClick={rc.onToggleExpand} style={css(`margin-top:11px; display:inline-flex; align-items:center; gap:5px; border:none; background:none; padding:0; cursor:pointer; font-family:inherit; font-size:11px; font-weight:600; color:#5A5E66;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} style={css(`transition:transform 0.15s; transform:rotate(${rc.expanded ? 90 : 0}deg);`)}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>All delivery centres · {rc.dcCount} (reference)</button>
{(rc.expanded) ? (<>
<div style={css(`margin-top:8px; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
<div style={css(`display:grid; grid-template-columns:1.1fr 1.3fr 0.7fr 1fr 1.5fr 1.2fr; padding:6px 12px 4px; background:#F4F5F8; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DC CODE</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>NAME</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DESIGN VOL</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>TP ORDER</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>LAT / LONG</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>STATUS</div>
</div>
{(rc.dcRows || []).map((dc, __i77) => (<React.Fragment key={__i77}>
<div style={css(`display:grid; grid-template-columns:1.1fr 1.3fr 0.7fr 1fr 1.5fr 1.2fr; padding:5px 12px; border-top:1px solid #EEF1F6; align-items:center; background:${dc.hasChange ? '#FFFBF0' : 'transparent'};`)}>
<div style={css(`font-size:11px; font-weight:600; color:#2F4FC6;`)}>{dc.code}</div>
<div style={css(`font-size:11px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{dc.name}</div>
<div style={css(`font-size:11px; color:#5A5E66; font-variant-numeric:tabular-nums;`)}>{dc.vol}</div>
<div style={css(`font-size:11px; color:#5A5E66; font-variant-numeric:tabular-nums;`)}>
{(dc.hasChgTp) ? (<><span style={css(`color:#B0B6C0;`)}>{dc.tpOrder}</span> <span style={css(`color:#C77B00; font-weight:700;`)}>→ {dc.chgTp}</span></>) : null}
{(dc.noChgTp) ? (<>{dc.tpOrder}</>) : null}
</div>
<div style={css(`font-size:10.5px; font-variant-numeric:tabular-nums; white-space:nowrap;`)}>
{(dc.hasLatLngChange) ? (<><span style={css(`color:#C77B00; font-weight:700;`)}>{dc.proposedLatLng}</span></>) : null}
{(dc.noLatLngChange) ? (<><span style={css(`color:#8E96A3;`)}>{dc.lat}, {dc.lng}</span></>) : null}
</div>
<div style={css(`display:flex; align-items:center; gap:4px;`)}>
{(dc.hasChange) ? (<>
{(dc.dcAccepted) ? (<><span style={css(`font-size:10px; font-weight:700; color:#128A3E;`)}>✓ Accepted</span></>) : null}
{(dc.dcRejected) ? (<><span style={css(`font-size:10px; font-weight:700; color:#D14B4B;`)}>✕ Rejected</span></>) : null}
{(dc.dcUndecided) ? (<><span style={css(`font-size:10px; font-weight:700; color:#C77B00;`)}>● Pending</span></>) : null}
</>) : null}
{(dc.noChange) ? (<><span style={css(`font-size:11px; color:#C3C9D4;`)}>—</span></>) : null}
</div>
</div>
</React.Fragment>))}
</div>
</>) : null}
</div>
</div>
</React.Fragment>))}
{(aSel.hasAligned) ? (<><div style={css(`padding:11px 16px; font-size:11.5px; color:#8E96A3; background:#fff; border:1px solid #E6EBF2; border-radius:10px;`)}>✓ {aSel.alignedNote}</div></>) : null}
{(aSel.noFlagged) ? (<><div style={css(`padding:44px 18px; text-align:center; font-size:12.5px; color:#8E96A3; background:#fff; border:1px solid #E6EBF2; border-radius:10px;`)}>✓ All routes are aligned — no changes to review.</div></>) : null}
</div>
</>) : null}
</>) : null}
</div>
{/* sticky bottom action bar — lives inside this full-screen overlay now (In-Alignment: Accept/Reject rows + Accept-all + Acknowledge; Acknowledged: decisions + Finalise) */}
{(aSel.showActionBar) ? (<>
<div style={css(`flex-shrink:0; border-top:1px solid #E6EBF2; background:#fff; padding:13px 26px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; box-shadow:0 -3px 10px rgba(20,23,31,0.05);`)}>
{/* left summary (carries the reason Finalise is blocked, next to the decided count it refers to) */}
<span style={css(`font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{aSel.progressLabel} · {aSel.acceptedCount} accepted · {aSel.rejectedCount} rejected</span>
{(aSel.finBlocked) ? (<><span style={css(`font-size:11.5px; font-weight:600; color:#C77B00; white-space:nowrap;`)}>· decide all flagged rows to finalise</span></>) : null}
<div style={css(`flex:1; min-width:10px;`)} />
{/* Validate changes (plan-level checks: TP guard, vehicle feasibility, dup route codes) */}
<button onClick={aSel.onPlanValidate} style={css(`display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M9 12l2 2 4-4M12 3l7 4v5a9 9 0 01-7 8 9 9 0 01-7-8V7l7-4z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Validate changes</button>
{/* Accept all (bulk, flagged rows only) — only once the plan is Acknowledged */}
{(aSel.canDecide) ? (<>
<button onClick={aSel.onAcceptAllFlagged} style={css(`height:38px; padding:0 15px; border:1px solid ${aSel.acceptAllBd}; background:${aSel.acceptAllBg}; color:${aSel.acceptAllFg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:${aSel.acceptAllCursor};`)} title={aSel.acceptAllTitle}>Accept all changes</button>
</>) : null}
{/* Acknowledge & freeze */}
{(aSel.canAck) ? (<>
<button onClick={aSel.onAck} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Acknowledge & freeze</button>
</>) : null}
{/* Finalise plan */}
{(aSel.isAck) ? (<>
<button onClick={aSel.onFin} title={aSel.finBlocked ? 'Decide all flagged rows first' : 'Finalise this plan'} style={css(`display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 18px; border:none; background:${aSel.finBtnBg}; color:${aSel.finBtnFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${aSel.finCursor};`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Finalise plan</button>
</>) : null}
</div>
</>) : null}
</div>
</>) : null}
</div>
</main>
</>) : null}
</div>
{/* SIMULATE IMPACT MODAL (planner) — 3-section rebuild */}
{(aSel.planSimOpen) ? (<>
<div onClick={aSel.closePlanSim} style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.48); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div onClick={stopPropSim} style={css(`width:900px; max-width:100%; max-height:94vh; overflow-y:auto; background:#F4F5F8; border-radius:16px; box-shadow:0 28px 70px rgba(0,0,0,0.35); display:flex; flex-direction:column;`)}>
{/* Header */}
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #E6EBF2; flex-shrink:0; background:#fff; border-radius:16px 16px 0 0;`)}>
<div>
<div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Simulate impact — {aSel.planSimPlanName}</div>
<div style={css(`display:flex; align-items:center; gap:8px; margin-top:4px;`)}>
<span style={css(`font-size:11.5px; font-weight:700; color:#2F4FC6; text-transform:uppercase; letter-spacing:0.04em;`)}>Ops feedback</span>
<span style={css(`font-size:11px; color:#7A8094; font-weight:500; padding:2px 8px; background:#E4E9F7; border-radius:999px;`)}>{aSel.planSimSubtitle}</span>
</div>
</div>
<button onClick={aSel.closePlanSim} aria-label={"Close dialog"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
{/* Body */}
<div style={css(`padding:20px 24px; flex:1; min-height:0; display:flex; flex-direction:column; gap:20px;`)}>
{/* Headwind banner */}
<div style={css(`display:flex; align-items:flex-start; gap:9px; padding:11px 14px; border-radius:8px; background:${aSel.planSimHeadwindBg}; border:1px solid ${aSel.planSimHeadwindBd};`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={aSel.planSimHeadwindColor} strokeWidth={"2.2"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12px; font-weight:600; color:${aSel.planSimHeadwindColor}; line-height:1.5;`)}>{aSel.planSimHeadwindLabel}</span>
</div>
{/* SECTION 1: PLAN-LEVEL COMPARISON */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>Plan-level comparison</div>
<div style={css(`display:grid; grid-template-columns:repeat(3,1fr); gap:12px;`)}>
{(aSel.planSimCards || []).map((sc, __i79) => (<React.Fragment key={__i79}>
<div style={css(`background:#fff; border:${sc.cardBd}; border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:4px;`)}>
<div style={css(`font-size:10.5px; font-weight:600; color:#7A8094; letter-spacing:0.04em; text-transform:uppercase;`)}>{sc.label}</div>
<div style={css(`display:flex; align-items:baseline; gap:10px; margin-top:4px;`)}>
<div style={css(`flex:1;`)}>
<div style={css(`font-size:9.5px; color:#8E96A3; font-weight:500; margin-bottom:2px;`)}>Original</div>
<div style={css(`font-size:18px; font-weight:700; color:#5A5E66; font-variant-numeric:tabular-nums; line-height:1.1;`)}>{sc.origVal}</div>
</div>
<div style={css(`flex:1;`)}>
<div style={css(`font-size:9.5px; color:${sc.suggestedLabelFg}; font-weight:700; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.04em;`)}>{sc.suggestedLabel}</div>
<div style={css(`font-size:18px; font-weight:700; color:${sc.propFg}; font-variant-numeric:tabular-nums; line-height:1.1;`)}>{sc.propVal}</div>
</div>
</div>
</div>
</React.Fragment>))}
</div>
</div>
{/* SECTION 2: ROUTE-LEVEL CPS COMPARISON */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>Route-level CPS comparison</div>
<div style={css(`overflow-x:auto; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<table style={css(`width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; min-width:820px;`)}>
<thead>
<tr style={css(`background:#F4F5F8; border-bottom:1px solid #E6EBF2;`)}>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>ROUTE</th>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>VEHICLE</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>COUNT</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>DIST</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>CPS (₹)</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>UTIL</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>VOLUME</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>CAP</th>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>OPS LEAD NOTE</th>
<th style={css(`text-align:center; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>STATUS</th>
</tr>
</thead>
<tbody>
{(aSel.planSimRouteRows || []).map((rr, __i80) => (<React.Fragment key={__i80}>
<tr style={css(`border-top:1px solid #EEF1F6; background:${rr.rowBg};`)}>
<td style={css(`padding:9px 12px; font-weight:600; color:#003F98; font-size:12px; white-space:nowrap;`)}>{rr.routeCode}</td>
<td style={css(`padding:9px 12px; font-size:12px; color:#14171F; white-space:nowrap;`)}>
{(rr.vehChanged) ? (<><span style={css(`text-decoration:line-through; color:#8E96A3; font-size:11px;`)}>{rr.origVeh}</span><span style={css(`color:#C77B00; font-weight:600; margin-left:5px;`)}>{rr.propVeh}</span></>) : null}
{(rr.vehUnchanged) ? (<><span style={css(`color:#14171F;`)}>{rr.origVeh}</span></>) : null}
</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66;`)}>{rr.countDisp}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.distDisp}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; white-space:nowrap;`)}>
{(rr.cpsChanged) ? (<><span style={css(`text-decoration:line-through; color:#8E96A3; font-size:11px;`)}>{rr.origCps}</span><span style={css(`color:#C77B00; font-weight:700; margin-left:5px;`)}>{rr.propCps}</span></>) : null}
{(rr.cpsUnchanged) ? (<><span style={css(`color:#14171F; font-weight:600;`)}>{rr.origCps}</span></>) : null}
</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.util}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#14171F; white-space:nowrap;`)}>{rr.vol}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.cap}</td>
<td style={css(`padding:9px 12px; font-size:11.5px; color:#5A5E66; font-style:italic; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)} title={rr.note}>{rr.note}</td>
<td style={css(`padding:9px 12px; text-align:center; white-space:nowrap;`)}>
{(rr.isChanged) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>⚠ Changed</span></>) : null}
{(rr.isNoChange) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#E7F4EC; color:#128A3E;`)}>✓ No change</span></>) : null}
</td>
</tr>
</React.Fragment>))}
</tbody>
</table>
</div>
</div>
{/* SECTION 3: SC-LEVEL ROUTE VISUALISATION */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>SC-level route visualisation</div>
<div style={css(`display:grid; grid-template-columns:1fr 1fr; gap:14px;`)}>
{/* Original Plan panel */}
<div style={css(`background:#fff; border:1px solid #C3D0ED; border-radius:10px; overflow:hidden;`)}>
<div style={css(`padding:9px 12px; background:#E8ECF7; border-bottom:1px solid #D0D9EE; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`width:8px; height:8px; border-radius:50%; background:#003F98; display:inline-block; flex-shrink:0;`)} />
<span style={css(`font-size:11.5px; font-weight:700; color:#14171F; flex:1;`)}>Original Plan</span>
<span style={css(`font-size:10.5px; color:#7A8094; font-weight:500;`)}>{aSel.planSmOrigCount} routes</span>
</div>
{/* Filters row: Search LMDC + Route dropdown wired; Vehicle + Zone omitted (no zone/vehicle data on arcs) */}
<div style={css(`padding:8px 12px; border-bottom:1px solid #EEF1F6; display:flex; align-items:center; gap:8px; background:#FAFBFD;`)}>
<input value={aSel.planSmOrigSearch} onInput={aSel.onPlanSmOrigSearch} placeholder={"Search LMDC…"} style={css(`flex:1; min-width:0; height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none;`)} aria-label={"Search LMDC in original plan"} />
<select value={aSel.planSmOrigRoute} onChange={aSel.onPlanSmOrigRoute} style={css(`height:28px; padding:0 7px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none; cursor:pointer;`)} aria-label={"Filter route in original plan"}>
{(aSel.planSmRouteOptions || []).map((ro, __i81) => (<React.Fragment key={__i81}><option value={ro.value}>{ro.label}</option></React.Fragment>))}
</select>
<button onClick={aSel.onPlanSmOrigLegend} style={css(`height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11px; font-weight:600; color:#5A5E66; background:#fff; cursor:pointer; white-space:nowrap;`)} title={"Toggle legend"}>Legend</button>
<span style={css(`font-size:10.5px; color:#8E96A3; white-space:nowrap; flex-shrink:0;`)}>{aSel.planSmOrigVisCount} routes</span>
</div>
{(aSel.planSmOrigLegendOpen) ? (<>
<div style={css(`padding:7px 12px; border-bottom:1px solid #EEF1F6; background:#F7F8FA; display:flex; align-items:center; gap:14px; flex-wrap:wrap;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:10px; height:10px; background:#0B1430; display:inline-block; border-radius:2px;`)} />LMSC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; background:#8E96A3; border-radius:50%; display:inline-block;`)} />LMDC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#003F98;`)}><span style={css(`width:18px; height:2.5px; background:#003F98; display:inline-block; border-radius:1px;`)} />Route arc</span>
</div>
</>) : null}
<div style={css(`background:linear-gradient(145deg,#EEF3FB,#E8EDF8);`)}>
<svg viewBox={`0 0 ${aSel.planSmMW} ${aSel.planSmMH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs><pattern id={"psmgrid-o"} width={"32"} height={"32"} patternUnits={"userSpaceOnUse"}><path d={"M32 0H0V32"} fill={"none"} stroke={"#D4DCE8"} strokeWidth={"0.4"} /></pattern></defs>
<rect x={"0"} y={"0"} width={aSel.planSmMW} height={aSel.planSmMH} fill={"url(#psmgrid-o)"} />
{(aSel.planSmOrigArcsF || []).map((ma, __i82) => (<React.Fragment key={__i82}><path d={ma.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(aSel.planSmOrigArcsF || []).map((ma, __i83) => (<React.Fragment key={__i83}><path d={ma.d} fill={"none"} stroke={ma.color} strokeWidth={"1.8"} strokeOpacity={"0.9"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(aSel.planSmOrigDcM || []).map((md, __i84) => (<React.Fragment key={__i84}><circle cx={md.x} cy={md.y} r={"3.5"} fill={md.color} fillOpacity={"0.85"} stroke={"#fff"} strokeWidth={"1.5"} /></React.Fragment>))}
<rect x={aSel.planSmScX} y={aSel.planSmScY} width={"14"} height={"14"} transform={"translate(-7,-7)"} rx={"2"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2"} />
<rect x={aSel.planSmScX} y={aSel.planSmScY} width={"6"} height={"6"} transform={"translate(-3,-3)"} rx={"1"} fill={"#fff"} opacity={"0.9"} />
</svg>
</div>
</div>
{/* Feedback Plan panel */}
<div style={css(`background:#fff; border:1.5px solid #C77B00; border-radius:10px; overflow:hidden; box-shadow:0 0 0 2px #FBF1DF;`)}>
<div style={css(`padding:9px 12px; background:#FBF1DF; border-bottom:1px solid #F0DBA8; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`width:8px; height:8px; border-radius:50%; background:#C77B00; display:inline-block; flex-shrink:0;`)} />
<span style={css(`font-size:11.5px; font-weight:700; color:#14171F; flex:1;`)}>Feedback Plan</span>
<span style={css(`font-size:10.5px; color:#C77B00; font-weight:600;`)}>{aSel.planSmPropChangedCount} routes changed</span>
</div>
{/* Filters row */}
<div style={css(`padding:8px 12px; border-bottom:1px solid #EEF1F6; display:flex; align-items:center; gap:8px; background:#FAFBFD;`)}>
<input value={aSel.planSmPropSearch} onInput={aSel.onPlanSmPropSearch} placeholder={"Search LMDC…"} style={css(`flex:1; min-width:0; height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none;`)} aria-label={"Search LMDC in feedback plan"} />
<select value={aSel.planSmPropRoute} onChange={aSel.onPlanSmPropRoute} style={css(`height:28px; padding:0 7px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none; cursor:pointer;`)} aria-label={"Filter route in feedback plan"}>
{(aSel.planSmRouteOptions || []).map((ro, __i85) => (<React.Fragment key={__i85}><option value={ro.value}>{ro.label}</option></React.Fragment>))}
</select>
<button onClick={aSel.onPlanSmPropLegend} style={css(`height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11px; font-weight:600; color:#5A5E66; background:#fff; cursor:pointer; white-space:nowrap;`)} title={"Toggle legend"}>Legend</button>
<span style={css(`font-size:10.5px; color:#8E96A3; white-space:nowrap; flex-shrink:0;`)}>{aSel.planSmPropVisCount} routes</span>
</div>
{(aSel.planSmPropLegendOpen) ? (<>
<div style={css(`padding:7px 12px; border-bottom:1px solid #EEF1F6; background:#F7F8FA; display:flex; align-items:center; gap:14px; flex-wrap:wrap;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:10px; height:10px; background:#0B1430; display:inline-block; border-radius:2px;`)} />LMSC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; background:#8E96A3; border-radius:50%; display:inline-block;`)} />LMDC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#003F98;`)}><span style={css(`width:18px; height:2.5px; background:#003F98; display:inline-block; border-radius:1px;`)} />Unchanged route</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#C77B00; font-weight:600;`)}><span style={css(`width:18px; height:2.5px; background:#C77B00; display:inline-block; border-radius:1px; border-top:none; border-style:dashed;`)} />Changed route</span>
</div>
</>) : null}
<div style={css(`background:linear-gradient(145deg,#EEF3FB,#E8EDF8);`)}>
<svg viewBox={`0 0 ${aSel.planSmMW} ${aSel.planSmMH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs><pattern id={"psmgrid-p"} width={"32"} height={"32"} patternUnits={"userSpaceOnUse"}><path d={"M32 0H0V32"} fill={"none"} stroke={"#D4DCE8"} strokeWidth={"0.4"} /></pattern></defs>
<rect x={"0"} y={"0"} width={aSel.planSmMW} height={aSel.planSmMH} fill={"url(#psmgrid-p)"} />
{(aSel.planSmPropArcsF || []).map((ma, __i86) => (<React.Fragment key={__i86}><path d={ma.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(aSel.planSmPropArcsF || []).map((ma, __i87) => (<React.Fragment key={__i87}><path d={ma.d} fill={"none"} stroke={ma.color} strokeWidth={"1.8"} strokeOpacity={"0.75"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(aSel.planSmPropArcsF || []).map((ma, __i88) => (<React.Fragment key={__i88}>{(ma.isHL) ? (<><path d={ma.d} fill={"none"} stroke={"#C77B00"} strokeWidth={"2.6"} strokeDasharray={"5 3"} strokeLinecap={"round"} strokeOpacity={"0.95"} /></>) : null}</React.Fragment>))}
{(aSel.planSmPropDcM || []).map((md, __i89) => (<React.Fragment key={__i89}><circle cx={md.x} cy={md.y} r={"3.5"} fill={md.color} fillOpacity={"0.85"} stroke={"#fff"} strokeWidth={"1.5"} /></React.Fragment>))}
<rect x={aSel.planSmScX} y={aSel.planSmScY} width={"14"} height={"14"} transform={"translate(-7,-7)"} rx={"2"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2"} />
<rect x={aSel.planSmScX} y={aSel.planSmScY} width={"6"} height={"6"} transform={"translate(-3,-3)"} rx={"1"} fill={"#fff"} opacity={"0.9"} />
</svg>
</div>
</div>
</div>
{/* Tip */}
<div style={css(`display:flex; align-items:flex-start; gap:7px; margin-top:10px; padding:9px 12px; background:#FFF6E6; border:1px solid #F0DBA8; border-radius:8px;`)}>
<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"2.2"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:11px; color:#C77B00; font-weight:500; line-height:1.5;`)}>Amber arcs on the feedback map indicate routes with suggested changes. Use the filters in each panel independently to focus on specific nodes or routes. Directional view — not a re-solve.</span>
</div>
</div>
</div>
{/* Footer (sticky at the modal bottom so Done stays reachable while the body scrolls) */}
<div style={css(`display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid #E6EBF2; flex-shrink:0; background:#fff; border-radius:0 0 16px 16px; position:sticky; bottom:0; z-index:3;`)}>
<button onClick={aSel.closePlanSim} style={css(`height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Done</button>
</div>
</div>
</div>
</>) : null}
{/* ACCEPT-ALL-FLAGGED CONFIRM (planner) */}
{(acceptAllPlanOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:460px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#E7F4EC; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"1.8"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Accept all {acceptAllFlaggedCount} proposed changes?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}>This accepts every still-undecided Needs Change row on <strong>{acceptAllPlanName}</strong> and absorbs their CPS impact. Review Simulate first to understand the cost trade-off before confirming.</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeAcceptAllPlan} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmAcceptAllPlan} style={css(`height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `filter:brightness(0.94);`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `filter:brightness(0.94);`)}>Accept all changes</button>
</div>
</div>
</div>
</>) : null}
{/* ACK MODAL */}
{(ackOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:480px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#FBF1DF; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"1.8"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Acknowledge & freeze this plan?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}>This permanently freezes <strong>{ackPlanName}</strong> and locks <strong>{ackReviewers}</strong> from any further edits. Accepted changes are committed. <strong style={css(`color:#C77B00;`)}>This cannot be undone.</strong></div></div>
</div>
{(ackHasPending) ? (<>
<div style={css(`margin:16px 24px 0; display:flex; align-items:center; gap:9px; padding:10px 13px; background:#FBF1DF; border:1px solid #F0DBA8; border-radius:8px;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"1.9"} style={css(`flex-shrink:0;`)}><path d={"M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>{ackPendingLabel}</span></div>
</>) : null}
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeAck} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmAck} style={css(`height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Acknowledge & freeze</button>
</div>
</div>
</div>
</>) : null}
{/* FIN MODAL */}
{(finOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:480px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#E7F4EC; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"1.8"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Finalise this plan?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}><strong>{finPlanName}</strong> — <strong style={css(`color:#128A3E;`)}>{finAccepted} accepted</strong>, <strong style={css(`color:#D14B4B;`)}>{finRejected} rejected</strong>. Finalising marks the plan Approved and hands it to the LH team for RFQ creation.</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeFin} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmFin} style={css(`height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `filter:brightness(0.94);`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `filter:brightness(0.94);`)}>Finalise plan</button>
</div>
</div>
</div>
</>) : null}
</>) : null}
{/* ===== OPS ALIGNMENT · OPS LEAD ===== */}
{(isAlignOps) ? (<>
<div style={css(`display:flex; flex-direction:row; height:100%; min-height:0;`)}>
{/* ===== EMPTY STATE (no plans in the active filter, or none assigned) — full width ===== */}
{(oSel.empty) ? (<>
<div style={css(`flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:80px 40px; text-align:center;`)}>
<div style={css(`width:54px; height:54px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"26"} height={"26"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.5"}><path d={"M9 11l3 3 8-8M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F; margin-bottom:5px;`)}>No plans assigned to you</div><div style={css(`font-size:12.5px; color:#5A5E66; max-width:360px; line-height:1.6;`)}>You're all caught up — there are no plans awaiting your review in this cycle. New plans appear here the moment a planner pushes them.</div></div>
</div>
</>) : null}
{/* ===== MASTER RAIL: assigned plan list (persistent, like Design Review) ===== */}
{(opsIsL1) ? (<>
<aside style={css(`width:300px; flex-shrink:0; border-right:1px solid #E6EBF2; background:#fff; display:flex; flex-direction:column; min-height:0;`)}>
<div style={css(`padding:12px 12px 8px; flex-shrink:0; display:flex; gap:5px; flex-wrap:wrap;`)}>
{(opsFilterSeg || []).map((fs, __i90) => (<React.Fragment key={__i90}><button onClick={fs.onClick} style={css(`height:26px; padding:0 10px; border:none; border-radius:999px; background:${fs.bg}; color:${fs.fg}; font-family:inherit; font-size:10.5px; font-weight:${fs.weight}; cursor:pointer; white-space:nowrap;`)}>{fs.label} {fs.count}</button></React.Fragment>))}
</div>
<div style={css(`padding:0 16px 8px; font-size:10.5px; font-weight:700; color:#8E96A3; letter-spacing:0.04em; flex-shrink:0;`)}>{opsPlanCount} ASSIGNED</div>
<div style={css(`flex:1; overflow-y:auto; padding:0 9px 12px; min-height:0;`)}>
{(opsPlans || []).map((p, __i91) => (<React.Fragment key={__i91}>
<button onClick={p.onClick} style={css(`width:100%; text-align:left; display:flex; flex-direction:column; gap:5px; padding:10px 11px; margin-bottom:4px; border:1px solid ${p.bd}; border-radius:9px; background:${p.bg}; cursor:pointer; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `width:100%; text-align:left; display:flex; flex-direction:column; gap:5px; padding:10px 11px; margin-bottom:4px; border:1px solid ${p.bd}; border-radius:9px; background:${p.bg}; cursor:pointer; font-family:inherit;`, `border-color:#C3C9D4;`)}>
<div style={css(`display:flex; align-items:center; gap:6px; min-width:0;`)}><span style={css(`font-size:12.5px; font-weight:700; color:#003F98; flex-shrink:0;`)}>{p.code}</span><span style={css(`font-size:11.5px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{p.name}</span></div>
<div style={css(`display:flex; align-items:center; gap:6px; flex-wrap:wrap;`)}><span style={css(`padding:2px 8px; border-radius:999px; font-size:9.5px; font-weight:700; background:${p.statusBg}; color:${p.statusFg};`)}>{p.statusLabel}</span><span style={css(`font-size:10px; color:#8E96A3;`)}>{p.zone}</span></div>
{(p.hasProp) ? (<><div style={css(`display:flex; align-items:center; gap:4px; font-size:10px; font-weight:600; color:#1E6FB8;`)}><svg aria-hidden={"true"} width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"} style={css(`flex-shrink:0;`)}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{p.propLabel}</div></>) : null}
{(p.reminded) ? (<><div style={css(`display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:999px; background:#FBF1DF; color:#C77B00; font-size:9.5px; font-weight:700; align-self:flex-start;`)}><svg aria-hidden={"true"} width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Reminder from planner</div></>) : null}
</button>
</React.Fragment>))}
</div>
</aside>
</>) : null}
{/* ===== OPS L2: FULL-WIDTH DETAIL ===== */}
{(opsIsL2) ? (<>
<main style={css(`flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden;`)}>
<div style={css(`flex:1; overflow-y:auto; min-height:0; min-width:0;`)}>
{/* ===== L3: PLAN CARD (compact summary; "view detail" opens L4 below) ===== */}
{/* Same card shape across all 4 Ops-Lead states (To Review / Submitted / Acknowledged / Finalised) --
    only which plans are listed (via the rail filter) and L4's edit-lock differ between them. */}
{(oSel.exists && oSel.showCard) ? (<>
<div style={css(`padding:20px 26px;`)}>
<div style={css(`display:flex; align-items:center; gap:5px; margin-bottom:12px; font-size:11.5px; color:#8E96A3; flex-wrap:wrap;`)}>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{cycleName}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{opsFilterLabel}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#003F98;`)}>{oSel.code}</span>
</div>
<div style={css(`width:100%; box-sizing:border-box; border:1px solid #E6EBF2; background:#fff; border-radius:13px; padding:14px 18px;`)}>
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0;`)}>
<span style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>{oSel.code}</span>
<span style={css(`font-size:13px; color:#5A5E66;`)}>{oSel.name}</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{oSel.zone} · RLH</span>
<span style={css(`padding:2px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:${oSel.statusBg || '#F2F5FA'}; color:${oSel.statusFg || '#5A5E66'};`)}>{opsFilterLabel}</span>
</div>
{/* top-right: view / map / download icons (same 3 for every Ops-Lead state) */}
<div style={css(`display:flex; gap:6px; flex-shrink:0;`)}>
<button onClick={oSel.openDetail} aria-label={"View plan details"} title={"View plan details"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"} strokeLinecap={"round"} strokeLinejoin={"round"} /><circle cx={"12"} cy={"12"} r={"3"} /></svg></button>
<button onClick={oSel.onMapView} aria-label={"Map view"} title={"Map view"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={oSel.onDownloadCsv} aria-label={"Download CSV"} title={"Download CSV"} style={css(`width:30px; height:30px; border:1px solid #E6EBF2; background:#fff; border-radius:7px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#5A5E66;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `border-color:#E6EBF2; color:#5A5E66;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
</div>
{/* metrics summary — same 6-up grid used everywhere else in the app */}
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(88px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-top:12px;`)}>
{(oSel.metrics || []).map((m, __i930) => (<React.Fragment key={__i930}><div style={css(`background:#fff; padding:10px 12px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:10.5px; color:#5A5E66; margin-top:4px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
{(oSel.opsAck || oSel.opsFinal) ? (<>
<div style={css(`display:flex; align-items:center; gap:7px; margin-top:10px; padding:8px 12px; background:#E7F0F8; border:1px solid #C9DCEF; border-radius:8px;`)}><svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"2"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:11.5px; color:#1E6FB8; font-weight:600;`)}>{oSel.opsFinal ? 'Finalised — this plan is locked and read-only.' : 'Acknowledged by the planner — feedback is locked and read-only.'}</span></div>
</>) : null}
</div>
</div>
</>) : null}
{(oSel.exists && oSel.detailOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:90; background:#F4F5F8; display:flex; flex-direction:column;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:14px 26px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0; flex-wrap:wrap;`)}>
<button onClick={oSel.backToCards} aria-label={"Back to plans"} style={css(`display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M15 18l-6-6 6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Back to plans</button>
<div style={css(`display:flex; align-items:center; gap:11px;`)}><span style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>{oSel.code}</span><span style={css(`font-size:14px; color:#5A5E66;`)}>{oSel.name}</span><span style={css(`padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{oSel.zone} · RLH</span></div>
<div style={css(`flex:1;`)} />
<button onClick={oSel.onMapView} style={css(`display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Map view</button>
<button onClick={oSel.onReset} style={css(`height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Reset</button>
<button onClick={oSel.backToCards} aria-label={"Close detail"} style={css(`display:flex; align-items:center; justify-content:center; width:34px; height:34px; border:1px solid #E6EBF2; border-radius:8px; background:#fff; cursor:pointer; color:#5A5E66;`)}><svg width={"17"} height={"17"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`flex:1; overflow-y:auto; padding:20px 26px;`)}>
{/* L1→L2→L3 breadcrumb: cycle › status › SC — same pattern as Design Review's cycle › SC › plan */}
<div style={css(`display:flex; align-items:center; gap:5px; margin-bottom:12px; font-size:11.5px; color:#8E96A3; flex-wrap:wrap;`)}>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{cycleName}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#5A5E66;`)}>{opsFilterLabel}</span>
<svg width={"10"} height={"10"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C3C9D4"} strokeWidth={"2.2"}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-weight:600; color:#003F98;`)}>{oSel.code}</span>
</div>
{/* status line (Simulate/Map actions now live in the top bar) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:16px 20px; margin-bottom:16px; flex-wrap:wrap;`)}>
<div style={css(`font-size:12px; color:#5A5E66;`)}>Pushed {oSel.sentDate} · {oSel.reviewLabel}{(oSel.hasCoReviewers) ? (<> · Reviewing with {oSel.coReviewerLabel}</>) : null}</div>
</div>
{(oSel.opsAck) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:12px; background:#E7F0F8; border:1px solid #CFE0F1; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"1.8"}><path d={"M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>Your feedback is <strong>acknowledged & frozen</strong> — the planner is finalising this plan. Editing is locked; this view is read-only.</span></div></>) : null}
{(oSel.opsFinal) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:12px; background:#E7F4EC; border:1px solid #B6E0C6; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"1.9"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}>This is the <strong>finalised plan</strong> — live for this cycle. This view is read-only.</span></div></>) : null}
{(oSel.submitted) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; margin-bottom:14px; background:#E7F4EC; border:1px solid #B6E0C6; border-radius:8px;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; color:#14171F;`)}><strong style={css(`font-weight:700;`)}>{oSel.submittedRecord}</strong> — the planner can now review your row decisions.</span></div></>) : null}
{/* §10 O2 — plan-level co-reviewer awareness: surface "someone has proposed a change" up front (the same way the planner sees feedback received), not only row-by-row. */}
{(oSel.hasProp) ? (<><div style={css(`display:flex; align-items:center; gap:9px; padding:11px 14px; margin-bottom:14px; background:#EAF3FB; border:1px solid #C4DDF2; border-radius:8px; flex-wrap:wrap;`)}><svg aria-hidden={"true"} width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"2"} style={css(`flex-shrink:0;`)}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; font-weight:700; color:#14171F;`)}>{oSel.propSummary}</span><span style={css(`font-size:12px; color:#5A5E66;`)}>Review the flagged rows before you submit your feedback.</span></div></>) : null}
{/* section tabs */}
<div style={css(`display:flex; gap:22px; border-bottom:1px solid #E6EBF2; margin-bottom:16px;`)}>
{(oSel.sections || []).map((t, __i92) => (<React.Fragment key={__i92}><button onClick={t.onClick} style={css(`position:relative; padding:0 0 12px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13px; font-weight:${t.weight}; color:${t.color};`)}>{t.label}{(t.active) ? (<><span style={css(`position:absolute; left:0; right:0; bottom:0; height:3px; background:#003F98; border-radius:3px 3px 0 0;`)} /></>) : null}</button></React.Fragment>))}
</div>
{/* PLAN DETAIL */}
{(oSel.secDetails) ? (<>
<div style={css(`display:grid; grid-template-columns:repeat(auto-fit,minmax(108px,1fr)); gap:1px; background:#EEF1F6; border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-bottom:16px;`)}>
{(oSel.metrics || []).map((m, __i93) => (<React.Fragment key={__i93}><div style={css(`background:#fff; padding:13px 14px;`)}><div style={css(`font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:500; color:#14171F; line-height:1;`)}>{m.value}</div><div style={css(`font-size:11px; color:#5A5E66; margin-top:5px;`)}>{m.label}</div></div></React.Fragment>))}
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:20px;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#14171F; margin-bottom:14px;`)}>Vehicle mix across routes</div>
<div style={css(`display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;`)}>
{(oSel.mixArr || []).map((v, __i96) => (<React.Fragment key={__i96}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 13px; background:#F7F8FB; border:1px solid #EEF1F6; border-radius:8px;`)}>
<span style={css(`font-size:12.5px; color:#14171F; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{v.veh}</span>
<span style={css(`font-size:12.5px; font-weight:700; color:#003F98; flex-shrink:0;`)}>{v.n} routes</span>
</div>
</React.Fragment>))}
</div>
</div>
</>) : null}
{/* ROUTE VIEW — per-route Aligned/Needs-Change decision table */}
{(oSel.secRoute) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:12px 16px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:11px;`)}>
<span style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Route rows</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#128A3E;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#128A3E;`)} />{oSel.alignedN} aligned</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#C77B00;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#C77B00;`)} />{oSel.ncN} needs change</span>
{(oSel.pendN) ? (<><span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#C3C9D4;`)} />{oSel.pendN} not yet reviewed</span></>) : null}
</div>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden;`)}>
{/* column header (route-level review list) */}
<div style={css(`display:grid; grid-template-columns:96px 188px 128px 44px 78px 84px minmax(184px,1fr); gap:13px; padding:9px 18px; background:#F4F5F8; border-bottom:1px solid #E6EBF2; align-items:center;`)}>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>ROUTE</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>VOL · UTIL · CAP</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>VEHICLE</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em; text-align:center;`)}>TP</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em; text-align:right;`)}>RT DIST</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em; text-align:right;`)}>CPS</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em; text-align:right;`)}>REVIEW</div>
</div>
{(oSel.rows || []).map((r, __i95) => (<React.Fragment key={__i95}>
<div style={css(`display:grid; grid-template-columns:96px 188px 128px 44px 78px 84px minmax(184px,1fr); gap:13px; padding:12px 18px; border-top:1px solid #EEF1F6; align-items:center;`)}>
<div style={css(`min-width:0;`)}>
<div style={css(`font-size:12.5px; font-weight:700; color:#003F98; margin-bottom:2px;`)}>{r.routeCode}</div>
<button onClick={r.onToggleExpand} style={css(`display:inline-flex; align-items:center; gap:3px; border:none; background:none; padding:0; cursor:pointer; font-family:inherit; font-size:10.5px; color:#5A5E66;`)} aria-label={"Expand DC breakdown"}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"} style={css(`transition:transform 0.15s; transform:rotate(${r.expanded ? 90 : 0}deg);`)}><path d={"M9 18l6-6-6-6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{r.dcs} DCs</button>
</div>
<div style={css(`font-size:11px; color:#5A5E66; font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{r.routeMeta}</div>
<div style={css(`font-size:12px; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{r.veh}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; text-align:center; font-variant-numeric:tabular-nums;`)}>{r.tp}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.rtDist}</div>
<div style={css(`font-size:11.5px; color:#5A5E66; text-align:right; font-variant-numeric:tabular-nums;`)}>{r.cps}</div>
<div style={css(`display:flex; gap:6px; justify-content:flex-end;`)}>
{(r.editable) ? (<>
<button onClick={r.onAlign} style={css(`height:30px; padding:0 13px; border:1px solid #128A3E; background:${r.alignBg}; color:${r.alignFg}; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`)}>Aligned</button>
<button onClick={r.onNeeds} style={css(`height:30px; padding:0 13px; border:1px solid #C77B00; background:${r.ncBg}; color:${r.ncFg}; font-family:inherit; font-size:11.5px; font-weight:600; border-radius:7px; cursor:pointer; white-space:nowrap;`)}>Needs change</button>
</>) : null}
</div>
{/* §10 O2 — a co-reviewer already proposed a change on this row: show it to this (second) reviewer so they don't see a blank slate */}
{(r.hasProposed) ? (<>
<div style={css(`grid-column:1 / -1; display:flex; align-items:center; gap:8px; margin-top:2px; padding:8px 12px; background:#FFF6E6; border:1px solid #F0DBA8; border-radius:8px;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"1.9"} style={css(`flex-shrink:0;`)}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:11.5px; font-weight:600; color:#C77B00;`)}>{r.proposedLabel}</span>
{(r.proposedRemark) ? (<><span style={css(`font-size:11.5px; color:#5A5E66; font-style:italic; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)} title={r.proposedRemark}>— {r.proposedRemark}</span></>) : null}
</div>
</>) : null}
</div>
{(r.expanded) ? (<>
<div style={css(`border-top:1px solid #E6EBF2; margin:0 18px; border-left:3px solid #E6EBF2; border-radius:0 0 0 4px; background:#FAFBFD;`)}>
<div style={css(`display:grid; grid-template-columns:1.2fr 1.6fr 0.8fr 0.6fr 1.4fr 0.8fr; padding:6px 12px 4px; background:#F4F5F8; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DC CODE</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>NAME</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DESIGN VOL</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>TP ORDER</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>LAT / LONG</div>
<div style={css(`font-size:10px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>DIST</div>
</div>
{(r.dcRows || []).map((dc, __i94) => (<React.Fragment key={__i94}>
<div style={css(`display:grid; grid-template-columns:1.2fr 1.6fr 0.8fr 0.6fr 1.4fr 0.8fr; padding:5px 12px; border-top:1px solid #EEF1F6; align-items:center;`)}>
<div style={css(`font-size:11px; font-weight:600; color:#2F4FC6;`)}>{dc.code}</div>
<div style={css(`font-size:11px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{dc.name}</div>
<div style={css(`font-size:11px; color:#5A5E66; font-variant-numeric:tabular-nums;`)}>{dc.vol}</div>
<div style={css(`font-size:11px; color:#5A5E66;`)}>{(r.editable) ? (<><input type={"number"} min={"1"} value={dc.tpOrderVal} onInput={dc.onOrder} aria-label={"Touch-point order"} aria-invalid={dc.tpErr} title={dc.tpErr ? 'Duplicate or out-of-range touch-point number' : ''} style={css(`width:46px; height:24px; border:1px solid ${dc.tpBd}; border-radius:6px; font-family:inherit; font-size:11px; text-align:center; color:#14171F; padding:0 4px; box-sizing:border-box; outline:none; background:${dc.tpBg};`)} /></>) : null}{(r.notEditable) ? (<>{dc.tpOrderVal}</>) : null}</div>
<div style={css(`font-size:10.5px; color:#8E96A3; font-variant-numeric:tabular-nums; white-space:nowrap;`)}>{dc.lat}, {dc.lng}</div>
<div style={css(`font-size:11px; color:#5A5E66; font-variant-numeric:tabular-nums;`)}>{dc.dist}</div>
</div>
</React.Fragment>))}
{(r.tpReorderTouched) ? (<>
<div style={css(`padding:6px 12px 8px; font-size:10.5px; font-weight:600; color:${r.tpReorderValid ? '#128A3E' : '#D14B4B'};`)}>{r.tpReorderMsg}</div>
</>) : null}
</div>
</>) : null}
</React.Fragment>))}
</div>
</>) : null}
{/* Node Details tab removed per product decision -- was route-scoped node info,
     now redundant with the per-DC drill-down already available from the route table. */}
</div>
{/* sticky action bar — lives inside this overlay now (review summary left, action cluster right) */}
{(oSel.detailOpen) ? (<>
<div style={css(`flex-shrink:0; border-top:1px solid #E6EBF2; background:#fff; padding:13px 26px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; box-shadow:0 -3px 10px rgba(20,23,31,0.05);`)}>
<div style={css(`display:flex; align-items:center; gap:13px; flex-wrap:wrap;`)}>
<span style={css(`font-size:12.5px; font-weight:700; color:#14171F;`)}>{oSel.reviewLabel}</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#128A3E;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#128A3E;`)} />{oSel.alignedN} aligned</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#C77B00;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#C77B00;`)} />{oSel.ncN} needs change</span>
{(oSel.pendN) ? (<><span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; border-radius:50%; background:#C3C9D4;`)} />{oSel.pendN} not yet reviewed</span></>) : null}
</div>
<div style={css(`flex:1; min-width:10px;`)} />
{/* right cluster: Mark all Aligned · Simulate · Submit feedback */}
{(oSel.submitted) ? (<><span style={css(`display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; color:#128A3E;`)}><svg aria-hidden={"true"} width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Feedback submitted</span></>) : null}
{(oSel.canSubmit) ? (<>
<div style={css(`display:flex; gap:8px; flex-shrink:0; align-items:center;`)}>
<button onClick={oSel.onOpsValidate} style={css(`display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:38px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M9 12l2 2 4-4M12 3l7 4v5a9 9 0 01-7 8 9 9 0 01-7-8V7l7-4z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Validate changes</button>
<button onClick={oSel.onAcceptAll} style={css(`height:38px; padding:0 15px; border:1px solid #128A3E; background:#fff; color:#128A3E; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} title={"Confirm before signing off all pending rows"} onMouseEnter={(e) => hoverOn(e, `background:#E7F4EC;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 15px; border:1px solid #128A3E; background:#fff; color:#128A3E; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#E7F4EC;`)}>Mark all Aligned</button>
{(oSel.canOpsSim) ? (<><button onClick={oSel.onOpsSim} style={css(`display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 15px; border:1px solid #2F4FC6; background:${oSel.opsSimBtnBg}; color:${oSel.opsSimBtnFg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M13 2L3 14h9l-1 8 10-12h-9l1-8z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Simulate</button></>) : null}
<button onClick={oSel.onSubmit} style={css(`height:38px; padding:0 20px; border:none; background:${oSel.submitBg}; color:${oSel.submitFg}; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:${oSel.submitCursor};`)}>{oSel.submitLabel}</button>
</div>
</>) : null}
</div>
</>) : null}
</div>
</>) : null}
</div>
</main>
</>) : null}
{/* DETAIL PANE — active filter matched 0 plans (the rail on the left stays visible) */}
{(oSel.filterEmpty) ? (<>
<main style={css(`flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:60px 40px; text-align:center; min-width:0;`)}>
<div style={css(`width:54px; height:54px; border-radius:8px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"26"} height={"26"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.6"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg></div>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F; margin-bottom:5px;`)}>No plans in this filter</div><div style={css(`font-size:12.5px; color:#5A5E66; max-width:320px; line-height:1.6;`)}>No plans match “{opsFilterLabel}”. Pick another filter on the left, or view all your assigned plans.</div></div>
<button onClick={opsClearFilter} style={css(`height:36px; padding:0 16px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}>View all plans</button>
</main>
</>) : null}
</div>
{/* SIMULATE IMPACT MODAL (Ops Lead) — 3-section rebuild */}
{(oSel.opsSimOpen) ? (<>
<div onClick={oSel.closeOpsSim} style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.48); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div onClick={stopPropSim} style={css(`width:900px; max-width:100%; max-height:94vh; overflow-y:auto; background:#F4F5F8; border-radius:16px; box-shadow:0 28px 70px rgba(0,0,0,0.35); display:flex; flex-direction:column;`)}>
{/* Header */}
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:18px 24px; border-bottom:1px solid #E6EBF2; flex-shrink:0; background:#fff; border-radius:16px 16px 0 0;`)}>
<div>
<div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Simulate impact — {oSel.opsSimPlanName}</div>
<div style={css(`display:flex; align-items:center; gap:8px; margin-top:4px;`)}>
<span style={css(`font-size:11.5px; font-weight:700; color:#2F4FC6; text-transform:uppercase; letter-spacing:0.04em;`)}>My changes</span>
<span style={css(`font-size:11px; color:#7A8094; font-weight:500; padding:2px 8px; background:#E4E9F7; border-radius:999px;`)}>{oSel.opsSimSubtitle}</span>
</div>
</div>
<button onClick={oSel.closeOpsSim} aria-label={"Close dialog"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
{/* Body */}
<div style={css(`padding:20px 24px; flex:1; min-height:0; display:flex; flex-direction:column; gap:20px;`)}>
{/* Headwind banner */}
<div style={css(`display:flex; align-items:flex-start; gap:9px; padding:11px 14px; border-radius:8px; background:${oSel.opsSimHeadwindBg}; border:1px solid ${oSel.opsSimHeadwindBd};`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={oSel.opsSimHeadwindColor} strokeWidth={"2.2"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12px; font-weight:600; color:${oSel.opsSimHeadwindColor}; line-height:1.5;`)}>{oSel.opsSimHeadwindLabel}</span>
</div>
{/* SECTION 1: PLAN-LEVEL COMPARISON */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>Plan-level comparison</div>
<div style={css(`display:grid; grid-template-columns:repeat(3,1fr); gap:12px;`)}>
{(oSel.opsSimCards || []).map((sc, __i98) => (<React.Fragment key={__i98}>
<div style={css(`background:#fff; border:${sc.cardBd}; border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:4px;`)}>
<div style={css(`font-size:10.5px; font-weight:600; color:#7A8094; letter-spacing:0.04em; text-transform:uppercase;`)}>{sc.label}</div>
<div style={css(`display:flex; align-items:baseline; gap:10px; margin-top:4px;`)}>
<div style={css(`flex:1;`)}>
<div style={css(`font-size:9.5px; color:#8E96A3; font-weight:500; margin-bottom:2px;`)}>Original</div>
<div style={css(`font-size:18px; font-weight:700; color:#5A5E66; font-variant-numeric:tabular-nums; line-height:1.1;`)}>{sc.origVal}</div>
</div>
<div style={css(`flex:1;`)}>
<div style={css(`font-size:9.5px; color:${sc.suggestedLabelFg}; font-weight:700; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.04em;`)}>{sc.suggestedLabel}</div>
<div style={css(`font-size:18px; font-weight:700; color:${sc.propFg}; font-variant-numeric:tabular-nums; line-height:1.1;`)}>{sc.propVal}</div>
</div>
</div>
</div>
</React.Fragment>))}
</div>
</div>
{/* SECTION 2: ROUTE-LEVEL CPS COMPARISON */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>Route-level CPS comparison</div>
<div style={css(`overflow-x:auto; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}>
<table style={css(`width:100%; border-collapse:collapse; font-size:12px; font-variant-numeric:tabular-nums; min-width:820px;`)}>
<thead>
<tr style={css(`background:#F4F5F8; border-bottom:1px solid #E6EBF2;`)}>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>ROUTE</th>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>VEHICLE</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>COUNT</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>DIST</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>CPS (₹)</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>UTIL</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>VOLUME</th>
<th style={css(`text-align:right; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>CAP</th>
<th style={css(`text-align:left; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>MY NOTE</th>
<th style={css(`text-align:center; padding:8px 12px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; white-space:nowrap;`)}>STATUS</th>
</tr>
</thead>
<tbody>
{(oSel.opsSimRouteRows || []).map((rr, __i99) => (<React.Fragment key={__i99}>
<tr style={css(`border-top:1px solid #EEF1F6; background:${rr.rowBg};`)}>
<td style={css(`padding:9px 12px; font-weight:600; color:#003F98; font-size:12px; white-space:nowrap;`)}>{rr.routeCode}</td>
<td style={css(`padding:9px 12px; font-size:12px; color:#14171F; white-space:nowrap;`)}>
{(rr.vehChanged) ? (<><span style={css(`text-decoration:line-through; color:#8E96A3; font-size:11px;`)}>{rr.origVeh}</span><span style={css(`color:#C77B00; font-weight:600; margin-left:5px;`)}>{rr.propVeh}</span></>) : null}
{(rr.vehUnchanged) ? (<><span style={css(`color:#14171F;`)}>{rr.origVeh}</span></>) : null}
</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66;`)}>{rr.countDisp}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.distDisp}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; white-space:nowrap;`)}>
{(rr.cpsChanged) ? (<><span style={css(`text-decoration:line-through; color:#8E96A3; font-size:11px;`)}>{rr.origCps}</span><span style={css(`color:#C77B00; font-weight:700; margin-left:5px;`)}>{rr.propCps}</span></>) : null}
{(rr.cpsUnchanged) ? (<><span style={css(`color:#14171F; font-weight:600;`)}>{rr.origCps}</span></>) : null}
</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.util}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#14171F; white-space:nowrap;`)}>{rr.vol}</td>
<td style={css(`padding:9px 12px; text-align:right; font-size:12px; color:#5A5E66; white-space:nowrap;`)}>{rr.cap}</td>
<td style={css(`padding:9px 12px; font-size:11.5px; color:#5A5E66; font-style:italic; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)} title={rr.note}>{rr.note}</td>
<td style={css(`padding:9px 12px; text-align:center; white-space:nowrap;`)}>
{(rr.isChanged) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#FBF1DF; color:#C77B00;`)}>⚠ Changed</span></>) : null}
{(rr.isNoChange) ? (<><span style={css(`display:inline-flex; align-items:center; gap:4px; padding:3px 8px; border-radius:999px; font-size:10.5px; font-weight:700; background:#E7F4EC; color:#128A3E;`)}>✓ No change</span></>) : null}
</td>
</tr>
</React.Fragment>))}
</tbody>
</table>
</div>
</div>
{/* SECTION 3: SC-LEVEL ROUTE VISUALISATION */}
<div>
<div style={css(`font-size:10px; font-weight:700; color:#7A8094; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px;`)}>SC-level route visualisation</div>
<div style={css(`display:grid; grid-template-columns:1fr 1fr; gap:14px;`)}>
{/* Original Plan panel */}
<div style={css(`background:#fff; border:1px solid #C3D0ED; border-radius:10px; overflow:hidden;`)}>
<div style={css(`padding:9px 12px; background:#E8ECF7; border-bottom:1px solid #D0D9EE; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`width:8px; height:8px; border-radius:50%; background:#003F98; display:inline-block; flex-shrink:0;`)} />
<span style={css(`font-size:11.5px; font-weight:700; color:#14171F; flex:1;`)}>Original Plan</span>
<span style={css(`font-size:10.5px; color:#7A8094; font-weight:500;`)}>{oSel.opsSmOrigCount} routes</span>
</div>
<div style={css(`padding:8px 12px; border-bottom:1px solid #EEF1F6; display:flex; align-items:center; gap:8px; background:#FAFBFD;`)}>
<input value={oSel.opsSmOrigSearch} onInput={oSel.onOpsSmOrigSearch} placeholder={"Search LMDC…"} style={css(`flex:1; min-width:0; height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none;`)} aria-label={"Search LMDC in original plan"} />
<select value={oSel.opsSmOrigRoute} onChange={oSel.onOpsSmOrigRoute} style={css(`height:28px; padding:0 7px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none; cursor:pointer;`)} aria-label={"Filter route in original plan"}>
{(oSel.opsSmRouteOptions || []).map((ro, __i100) => (<React.Fragment key={__i100}><option value={ro.value}>{ro.label}</option></React.Fragment>))}
</select>
<button onClick={oSel.onOpsSmOrigLegend} style={css(`height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11px; font-weight:600; color:#5A5E66; background:#fff; cursor:pointer; white-space:nowrap;`)} title={"Toggle legend"}>Legend</button>
<span style={css(`font-size:10.5px; color:#8E96A3; white-space:nowrap; flex-shrink:0;`)}>{oSel.opsSmOrigVisCount} routes</span>
</div>
{(oSel.opsSmOrigLegendOpen) ? (<>
<div style={css(`padding:7px 12px; border-bottom:1px solid #EEF1F6; background:#F7F8FA; display:flex; align-items:center; gap:14px; flex-wrap:wrap;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:10px; height:10px; background:#0B1430; display:inline-block; border-radius:2px;`)} />LMSC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; background:#8E96A3; border-radius:50%; display:inline-block;`)} />LMDC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#003F98;`)}><span style={css(`width:18px; height:2.5px; background:#003F98; display:inline-block; border-radius:1px;`)} />Route arc</span>
</div>
</>) : null}
<div style={css(`background:linear-gradient(145deg,#EEF3FB,#E8EDF8);`)}>
<svg viewBox={`0 0 ${oSel.opsSmMW} ${oSel.opsSmMH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs><pattern id={"osmgrid-o"} width={"32"} height={"32"} patternUnits={"userSpaceOnUse"}><path d={"M32 0H0V32"} fill={"none"} stroke={"#D4DCE8"} strokeWidth={"0.4"} /></pattern></defs>
<rect x={"0"} y={"0"} width={oSel.opsSmMW} height={oSel.opsSmMH} fill={"url(#osmgrid-o)"} />
{(oSel.opsSmOrigArcsF || []).map((ma, __i101) => (<React.Fragment key={__i101}><path d={ma.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(oSel.opsSmOrigArcsF || []).map((ma, __i102) => (<React.Fragment key={__i102}><path d={ma.d} fill={"none"} stroke={ma.color} strokeWidth={"1.8"} strokeOpacity={"0.9"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(oSel.opsSmOrigDcM || []).map((md, __i103) => (<React.Fragment key={__i103}><circle cx={md.x} cy={md.y} r={"3.5"} fill={md.color} fillOpacity={"0.85"} stroke={"#fff"} strokeWidth={"1.5"} /></React.Fragment>))}
<rect x={oSel.opsSmScX} y={oSel.opsSmScY} width={"14"} height={"14"} transform={"translate(-7,-7)"} rx={"2"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2"} />
<rect x={oSel.opsSmScX} y={oSel.opsSmScY} width={"6"} height={"6"} transform={"translate(-3,-3)"} rx={"1"} fill={"#fff"} opacity={"0.9"} />
</svg>
</div>
</div>
{/* Feedback Plan panel */}
<div style={css(`background:#fff; border:1.5px solid #C77B00; border-radius:10px; overflow:hidden; box-shadow:0 0 0 2px #FBF1DF;`)}>
<div style={css(`padding:9px 12px; background:#FBF1DF; border-bottom:1px solid #F0DBA8; display:flex; align-items:center; gap:8px;`)}>
<span style={css(`width:8px; height:8px; border-radius:50%; background:#C77B00; display:inline-block; flex-shrink:0;`)} />
<span style={css(`font-size:11.5px; font-weight:700; color:#14171F; flex:1;`)}>Feedback Plan</span>
<span style={css(`font-size:10.5px; color:#C77B00; font-weight:600;`)}>{oSel.opsSmPropChangedCount} routes changed</span>
</div>
<div style={css(`padding:8px 12px; border-bottom:1px solid #EEF1F6; display:flex; align-items:center; gap:8px; background:#FAFBFD;`)}>
<input value={oSel.opsSmPropSearch} onInput={oSel.onOpsSmPropSearch} placeholder={"Search LMDC…"} style={css(`flex:1; min-width:0; height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none;`)} aria-label={"Search LMDC in feedback plan"} />
<select value={oSel.opsSmPropRoute} onChange={oSel.onOpsSmPropRoute} style={css(`height:28px; padding:0 7px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11.5px; color:#14171F; background:#fff; outline:none; cursor:pointer;`)} aria-label={"Filter route in feedback plan"}>
{(oSel.opsSmRouteOptions || []).map((ro, __i104) => (<React.Fragment key={__i104}><option value={ro.value}>{ro.label}</option></React.Fragment>))}
</select>
<button onClick={oSel.onOpsSmPropLegend} style={css(`height:28px; padding:0 9px; border:1px solid #D8DFE9; border-radius:6px; font-family:inherit; font-size:11px; font-weight:600; color:#5A5E66; background:#fff; cursor:pointer; white-space:nowrap;`)} title={"Toggle legend"}>Legend</button>
<span style={css(`font-size:10.5px; color:#8E96A3; white-space:nowrap; flex-shrink:0;`)}>{oSel.opsSmPropVisCount} routes</span>
</div>
{(oSel.opsSmPropLegendOpen) ? (<>
<div style={css(`padding:7px 12px; border-bottom:1px solid #EEF1F6; background:#F7F8FA; display:flex; align-items:center; gap:14px; flex-wrap:wrap;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:10px; height:10px; background:#0B1430; display:inline-block; border-radius:2px;`)} />LMSC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#5A5E66;`)}><span style={css(`width:8px; height:8px; background:#8E96A3; border-radius:50%; display:inline-block;`)} />LMDC</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#003F98;`)}><span style={css(`width:18px; height:2.5px; background:#003F98; display:inline-block; border-radius:1px;`)} />Unchanged route</span>
<span style={css(`display:inline-flex; align-items:center; gap:5px; font-size:10.5px; color:#C77B00; font-weight:600;`)}><span style={css(`width:18px; height:2.5px; background:#C77B00; display:inline-block; border-radius:1px;`)} />Changed route</span>
</div>
</>) : null}
<div style={css(`background:linear-gradient(145deg,#EEF3FB,#E8EDF8);`)}>
<svg viewBox={`0 0 ${oSel.opsSmMW} ${oSel.opsSmMH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs><pattern id={"osmgrid-p"} width={"32"} height={"32"} patternUnits={"userSpaceOnUse"}><path d={"M32 0H0V32"} fill={"none"} stroke={"#D4DCE8"} strokeWidth={"0.4"} /></pattern></defs>
<rect x={"0"} y={"0"} width={oSel.opsSmMW} height={oSel.opsSmMH} fill={"url(#osmgrid-p)"} />
{(oSel.opsSmPropArcsF || []).map((ma, __i105) => (<React.Fragment key={__i105}><path d={ma.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(oSel.opsSmPropArcsF || []).map((ma, __i106) => (<React.Fragment key={__i106}><path d={ma.d} fill={"none"} stroke={ma.color} strokeWidth={"1.8"} strokeOpacity={"0.75"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(oSel.opsSmPropArcsF || []).map((ma, __i107) => (<React.Fragment key={__i107}>{(ma.isHL) ? (<><path d={ma.d} fill={"none"} stroke={"#C77B00"} strokeWidth={"2.6"} strokeDasharray={"5 3"} strokeLinecap={"round"} strokeOpacity={"0.95"} /></>) : null}</React.Fragment>))}
{(oSel.opsSmPropDcM || []).map((md, __i108) => (<React.Fragment key={__i108}><circle cx={md.x} cy={md.y} r={"3.5"} fill={md.color} fillOpacity={"0.85"} stroke={"#fff"} strokeWidth={"1.5"} /></React.Fragment>))}
<rect x={oSel.opsSmScX} y={oSel.opsSmScY} width={"14"} height={"14"} transform={"translate(-7,-7)"} rx={"2"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2"} />
<rect x={oSel.opsSmScX} y={oSel.opsSmScY} width={"6"} height={"6"} transform={"translate(-3,-3)"} rx={"1"} fill={"#fff"} opacity={"0.9"} />
</svg>
</div>
</div>
</div>
{/* Tip */}
<div style={css(`display:flex; align-items:flex-start; gap:7px; margin-top:10px; padding:9px 12px; background:#FFF6E6; border:1px solid #F0DBA8; border-radius:8px;`)}>
<svg width={"13"} height={"13"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"2.2"} style={css(`flex-shrink:0; margin-top:1px;`)}><path d={"M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:11px; color:#C77B00; font-weight:500; line-height:1.5;`)}>Amber arcs on the feedback map indicate routes with suggested changes. Use the filters in each panel independently to focus on specific nodes or routes. Directional view — not a re-solve.</span>
</div>
</div>
</div>
{/* Footer (sticky at the modal bottom so Done stays reachable while the body scrolls) */}
<div style={css(`display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid #E6EBF2; flex-shrink:0; background:#fff; border-radius:0 0 16px 16px; position:sticky; bottom:0; z-index:3;`)}>
<button onClick={oSel.closeOpsSim} style={css(`height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 22px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Done</button>
</div>
</div>
</div>
</>) : null}
{/* NEEDS CHANGE MODAL */}
{(ncOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:600px; max-width:100%; max-height:92vh; overflow:auto; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3);`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #E6EBF2;`)}>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>{ncTitle} · {ncRowCode}</div><div style={css(`font-size:12px; color:#5A5E66; margin-top:2px;`)}>{ncIntro}</div></div>
<button onClick={ncClose} aria-label={"Close dialog"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex;`)}><svg aria-hidden={"true"} width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`padding:20px 22px;`)}>
<div style={css(`font-size:11px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:8px;`)}>ROUTE-LEVEL CHANGES <span style={css(`font-weight:400; color:#8E96A3; letter-spacing:0;`)}>— apply to the whole route</span></div>
<div style={css(`display:grid; grid-template-columns:1fr 1fr; gap:13px; margin-bottom:16px;`)}>
{(ncFields || []).map((f, __i110) => (<React.Fragment key={__i110}>
<div style={css(`border:1px solid #EEF1F6; border-radius:8px; padding:10px 12px; background:#FAFBFD;`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; gap:8px;`)}>
<span style={css(`font-size:11.5px; font-weight:600; color:#14171F;`)}>{f.label}</span>
<button onClick={f.onToggleFlag} aria-label={"Flag this cell"} style={css(`display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px; border:1px solid ${f.toggleBd}; background:${f.toggleBg}; color:${f.toggleFg}; font-family:inherit; font-size:10.5px; font-weight:700; border-radius:6px; cursor:pointer;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{f.toggleLabel}</button>
</div>
{(f.flagged) ? (<>
<div style={css(`margin-top:8px;`)}>
{(f.isSelect) ? (<><select value={f.value} onChange={f.onInput} style={css(`width:100%; height:34px; padding:0 9px; border:1px solid #C77B00; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none; background:#fff;`)}>{(f.options || []).map((o, __i109) => (<React.Fragment key={__i109}><option value={o.value}>{o.label}</option></React.Fragment>))}</select></>) : null}
{(f.isTime) ? (<><input type={"time"} value={f.value} onInput={f.onInput} style={css(`width:100%; height:34px; padding:0 9px; border:1px solid #C77B00; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none;`)} /></>) : null}
{(f.isText) ? (<><input value={f.value} onInput={f.onInput} style={css(`width:100%; height:34px; padding:0 9px; border:1px solid #C77B00; border-radius:7px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none;`)} /></>) : null}
</div>
</>) : null}
</div>
</React.Fragment>))}
</div>
{(ncDcHasList) ? (<>
<div style={css(`font-size:11px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; margin-bottom:8px;`)}>PER-DC CHANGES <span style={css(`font-weight:400; color:#8E96A3; letter-spacing:0;`)}>— flag lat/long or touch-point order on a specific DC</span></div>
<div style={css(`border:1px solid #EEF1F6; border-radius:8px; overflow:hidden; margin-bottom:16px;`)}>
{(ncDcList || []).map((dc, __i111) => (<React.Fragment key={__i111}>
<div style={css(`border-top:1px solid #EEF1F6; padding:9px 12px; background:${dc.flagged ? '#FFFCF6' : '#fff'};`)}>
<div style={css(`display:flex; align-items:center; gap:10px;`)}>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:12px; font-weight:600; color:#14171F;`)}>{dc.name}</div><div style={css(`font-size:10.5px; color:#8E96A3;`)}>{dc.code} · lat {dc.curLat} · lng {dc.curLng} · TP {dc.curTp}</div></div>
<button onClick={dc.onToggle} style={css(`display:inline-flex; align-items:center; gap:5px; height:24px; padding:0 9px; border:1px solid ${dc.toggleBd}; background:${dc.toggleBg}; color:${dc.toggleFg}; font-family:inherit; font-size:10.5px; font-weight:700; border-radius:6px; cursor:pointer; flex-shrink:0;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>{dc.toggleLabel}</button>
</div>
{(dc.flagged) ? (<>
<div style={css(`display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px;`)}>
<div><div style={css(`font-size:10px; color:#8E96A3; margin-bottom:3px;`)}>Latitude</div><input value={dc.latVal} onInput={dc.onLat} placeholder={dc.curLat} style={css(`width:100%; height:30px; padding:0 8px; border:1px solid #C77B00; border-radius:6px; font-family:inherit; font-size:12px; color:#14171F; outline:none;`)} /></div>
<div><div style={css(`font-size:10px; color:#8E96A3; margin-bottom:3px;`)}>Longitude</div><input value={dc.lngVal} onInput={dc.onLng} placeholder={dc.curLng} style={css(`width:100%; height:30px; padding:0 8px; border:1px solid #C77B00; border-radius:6px; font-family:inherit; font-size:12px; color:#14171F; outline:none;`)} /></div>
<div><div style={css(`font-size:10px; color:#8E96A3; margin-bottom:3px;`)}>Touch-point #</div><input value={dc.tpVal} onInput={dc.onTp} placeholder={dc.curTp} style={css(`width:100%; height:30px; padding:0 8px; border:1px solid #C77B00; border-radius:6px; font-family:inherit; font-size:12px; color:#14171F; outline:none;`)} /></div>
</div>
</>) : null}
</div>
</React.Fragment>))}
</div>
</>) : null}
<div style={css(`margin-bottom:16px;`)}><div style={css(`font-size:11px; font-weight:600; color:#5A5E66; margin-bottom:5px;`)}>Remark <span style={css(`color:#D14B4B;`)}>*</span> <span style={css(`font-weight:400; color:#8E96A3;`)}>— required</span></div><textarea onInput={onNcRemark} placeholder={"Why this change is needed (ground reality, compliance, vendor)…"} style={css(`width:100%; min-height:64px; padding:10px 11px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:12.5px; color:#14171F; outline:none; resize:vertical;`)} /></div>
{(ncShowWarn) ? (<>
{(hasNcWarn) ? (<>
<div style={css(`display:flex; flex-direction:column; gap:7px; margin-bottom:4px;`)}>
{(ncWarn || []).map((w, __i112) => (<React.Fragment key={__i112}><div style={css(`display:flex; align-items:center; gap:9px; padding:9px 13px; background:${w.bg}; border-left:${w.accentBd}; border-radius:8px;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={w.fg} strokeWidth={"2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12px; font-weight:700; color:${w.fg};`)}>{w.lead}</span><span style={css(`font-size:12px; font-weight:500; color:${w.textFg};`)}>{w.text}</span></div></React.Fragment>))}
</div>
</>) : null}
</>) : null}
</div>
<div style={css(`display:flex; align-items:center; gap:12px; padding:16px 22px; border-top:1px solid #E6EBF2; background:#FAFBFD;`)}>
<div style={css(`flex:1; min-width:0;`)}>
<div style={css(`font-size:11.5px; color:#5A5E66;`)}>{ncFlagSummary}.</div>
{(ncSubmitHelper) ? (<>
<div style={css(`font-size:11px; color:#D14B4B; margin-top:2px; font-weight:600;`)}>{ncSubmitHelper}</div>
</>) : null}
</div>
<button onClick={ncClose} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={ncSubmit} style={css(`height:38px; padding:0 18px; border:none; background:${ncSubmitBg}; color:${ncSubmitFg}; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:${ncSubmitCursor};`)}>{ncSubmitLabel}</button>
</div>
</div>
</div>
</>) : null}
{/* E3 · MARK-ALL-ALIGNED CONFIRM */}
{(alignAllOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:460px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#E7F4EC; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"1.8"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Mark all {alignAllCount} pending rows as Aligned?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}>This signs off every still-pending row on <strong>{alignAllPlanName}</strong> as Aligned. Rows already marked Needs Change are left untouched. You can undo with <strong>Reset</strong>.</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeAlignAll} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmAlignAll} style={css(`height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `filter:brightness(0.94);`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#128A3E; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `filter:brightness(0.94);`)}>Mark all Aligned</button>
</div>
</div>
</div>
</>) : null}
{/* PARTIAL-SUBMIT CONFIRM: shown when reviewer submits with some rows still undecided */}
{(opsPartialOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:95; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:460px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#FBF1DF; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"1.8"}><path d={"M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} strokeLinecap={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Submit with {opsPartialUndecided} rows undecided?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}>You're submitting feedback on <strong>{opsPartialTotal - opsPartialUndecided} of {opsPartialTotal}</strong> rows on <strong>{opsPartialPlanName}</strong>. The remaining {opsPartialUndecided} undecided rows will be treated as no change. Submit anyway?</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeOpsPartial} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Go back</button>
<button onClick={confirmOpsPartial} style={css(`height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Submit anyway</button>
</div>
</div>
</div>
</>) : null}
</>) : null}
{/* VOLUME ROW-ERROR MODAL (1.3) */}
{(volErrModalOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:80; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:520px; max-width:100%; background:#fff; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.25); overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:18px 20px; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`width:38px; height:38px; border-radius:8px; background:#FBF1DF; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"2"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:14px; font-weight:700; color:#14171F;`)}>Row errors — {volErrModal.name}</div><div style={css(`font-size:12px; color:#5A5E66; margin-top:1px;`)}>Fix the file and re-upload to clear these errors.</div></div>
<button onClick={closeVolErrModal} style={css(`width:28px; height:28px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#8E96A3; border-radius:6px;`)} onMouseEnter={(e) => hoverOn(e, `background:#F2F5FA; color:#5A5E66;`)} onMouseLeave={(e) => hoverOff(e, `width:28px; height:28px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#8E96A3; border-radius:6px;`, `background:#F2F5FA; color:#5A5E66;`)}><svg width={"16"} height={"16"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M18 6L6 18M6 6l12 12"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
</div>
<div style={css(`padding:6px 0; max-height:320px; overflow-y:auto;`)}>
<div style={css(`display:grid; grid-template-columns:80px 1fr; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:8px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ROW</div>
<div style={css(`padding:8px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ERROR</div>
</div>
{(volErrModal.rows || []).map((er, __i113) => (<React.Fragment key={__i113}>
<div style={css(`display:grid; grid-template-columns:80px 1fr; border-top:1px solid #EEF1F6; align-items:center;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:80px 1fr; border-top:1px solid #EEF1F6; align-items:center;`, `background:#FAFBFD;`)}>
<div style={css(`padding:10px 16px; font-size:12.5px; font-weight:700; color:#003F98; font-variant-numeric:tabular-nums;`)}>{er.row}</div>
<div style={css(`padding:10px 16px; font-size:12.5px; color:#5A5E66;`)}>{er.msg}</div>
</div>
</React.Fragment>))}
</div>
<div style={css(`padding:14px 20px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #EEF1F6;`)}>
<button onClick={closeVolErrModal} style={css(`height:36px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#F2F5FA;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 16px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#F2F5FA;`)}>Close</button>
<button onClick={volErrModalReplace} style={css(`height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `height:36px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:7px;`, `background:#00337D;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M12 16V4M7 9l5-5 5 5M5 20h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Re-upload corrected file</button>
</div>
</div>
</div>
</>) : null}
{/* DELETE MASTER ROW CONFIRM (top-level: renders on Design Inputs SC/Vehicle Master, independent of active view) */}
{(delConfirmOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:80; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:460px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#FBEAEA; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg aria-hidden={"true"} width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#D14B4B"} strokeWidth={"1.8"}><path d={"M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Delete {delConfirmLabel}?</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.55;`)}>This removes it from the master. Are you sure you want to delete it?</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeDelConfirm} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmDelete} style={css(`height:38px; padding:0 18px; border:none; background:#D14B4B; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `filter:brightness(0.94);`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#D14B4B; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `filter:brightness(0.94);`)}>Delete</button>
</div>
</div>
</div>
</>) : null}
{/* A12 — FINALISE DIRECTLY confirm (top-level; fired from Design Review, skips Ops alignment) */}
{(finDirectOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:80; background:rgba(11,20,48,0.45); display:flex; align-items:center; justify-content:center; padding:24px;`)}>
<div style={css(`width:480px; max-width:100%; background:#fff; border-radius:15px; box-shadow:0 24px 60px rgba(0,0,0,0.3); overflow:hidden;`)}>
<div style={css(`padding:24px 24px 0; display:flex; gap:14px;`)}>
<div style={css(`width:44px; height:44px; border-radius:8px; background:#FBF1DF; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"22"} height={"22"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#C77B00"} strokeWidth={"1.9"}><path d={"M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Bypassing Ops Alignment</div><div style={css(`font-size:13px; color:#5A5E66; margin-top:8px; line-height:1.6;`)}>You are about to skip the Ops Alignment step. The plan will move straight to <strong style={css(`color:#128A3E;`)}>Finalised</strong> and RFQ creation immediately. This action cannot be undone.</div><div style={css(`font-size:13px; color:#14171F; font-weight:600; margin-top:10px;`)}>Do you want to continue?</div></div>
</div>
<div style={css(`display:flex; gap:10px; justify-content:flex-end; padding:22px 24px;`)}>
<button onClick={closeFinDirect} style={css(`height:38px; padding:0 16px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Cancel</button>
<button onClick={confirmFinDirect} style={css(`height:38px; padding:0 18px; border:none; background:#C77B00; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `filter:brightness(0.94);`)} onMouseLeave={(e) => hoverOff(e, `height:38px; padding:0 18px; border:none; background:#C77B00; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `filter:brightness(0.94);`)}>Finalise directly</button>
</div>
</div>
</div>
</>) : null}
{/* RUN-MAP POPUP (opened from Design Review — shows THIS run's routes in place, no navigation) */}
{(runMapOpen) ? (<>
<div style={css(`position:fixed; inset:0; z-index:90; background:rgba(11,20,48,0.5); display:flex; align-items:center; justify-content:center; padding:32px;`)}>
<div style={css(`width:900px; max-width:100%; max-height:90vh; background:#fff; border-radius:15px; box-shadow:0 24px 64px rgba(11,20,48,0.42); overflow:hidden; display:flex; flex-direction:column;`)}>
<div style={css(`display:flex; align-items:center; gap:12px; padding:15px 20px; border-bottom:1px solid #E6EBF2; flex-shrink:0;`)}>
<div style={css(`width:34px; height:34px; border-radius:8px; background:#EAEEFB; display:flex; align-items:center; justify-content:center; flex-shrink:0;`)}><svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`flex:1; min-width:0;`)}><div style={css(`font-size:15px; font-weight:700; color:#14171F;`)}>{mapSC} · {mapSCname} <span style={css(`font-weight:500; color:#5A5E66;`)}>— route map</span></div><div style={css(`font-size:11.5px; color:#8E96A3;`)}>{mapSCzone} zone · {rowsShown} of {routeTotal} routes · LMSC origin → LMDC deliveries</div></div>
<button onClick={runMapClose} aria-label={"Close map"} style={css(`border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex; flex-shrink:0;`)} onMouseEnter={(e) => hoverOn(e, `color:#14171F;`)} onMouseLeave={(e) => hoverOff(e, `border:none; background:transparent; cursor:pointer; padding:6px; color:#5A5E66; display:flex; flex-shrink:0;`, `color:#14171F;`)}><svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M6 6l12 12M18 6L6 18"} strokeLinecap={"round"} /></svg></button>
</div>
<div style={css(`flex:1; overflow:auto; min-height:0;`)}>
<div style={css(`position:relative; background:linear-gradient(155deg, #EEF3FB 0%, #E5EDF8 45%, #EBF0F9 100%);`)}>
<svg viewBox={`0 0 ${mapW} ${mapH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs><pattern id={"rmgrid"} width={"48"} height={"48"} patternUnits={"userSpaceOnUse"}><path d={"M48 0H0V48"} fill={"none"} stroke={"#D4DCE8"} strokeWidth={"0.55"} /></pattern></defs>
<rect x={"0"} y={"0"} width={mapW} height={mapH} fill={"url(#rmgrid)"} />
{(arcs || []).map((a, __i114) => (<React.Fragment key={__i114}><path d={a.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.2"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(arcs || []).map((a, __i115) => (<React.Fragment key={__i115}><path d={a.d} fill={"none"} stroke={a.color} strokeWidth={"1.4"} strokeOpacity={"0.95"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{(arrowHeads || []).map((ah, __i116) => (<React.Fragment key={__i116}><path d={ah.d} fill={ah.color} opacity={"0.9"} /></React.Fragment>))}
{(dcMarkers || []).map((m, __i117) => (<React.Fragment key={__i117}><circle cx={m.x} cy={m.y} r={"5"} fill={m.color} fillOpacity={m.op} stroke={"#fff"} strokeWidth={"2"} /></React.Fragment>))}
{(dcMarkers || []).map((m, __i118) => (<React.Fragment key={__i118}><circle cx={m.x} cy={m.y} r={"2"} fill={"#fff"} fillOpacity={m.op} /></React.Fragment>))}
<rect x={scX} y={scY} width={"22"} height={"22"} transform={"translate(-11,-11)"} rx={"3"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2.5"} />
<rect x={scX} y={scY} width={"10"} height={"10"} transform={"translate(-5,-5)"} rx={"1.5"} fill={"#fff"} opacity={"0.9"} />
</svg>
<div style={css(`position:absolute; inset:0; pointer-events:none;`)}>
{(dcLabels || []).map((l, __i119) => (<React.Fragment key={__i119}><div style={css(`position:absolute; left:${l.xPct}%; top:${l.yPct}%; transform:translate(-50%, 8px); text-align:center; white-space:nowrap;`)}><div style={css(`font-family:'Mier B02',system-ui,sans-serif; font-size:11px; font-weight:700; color:#14171F; text-shadow:0 0 3px #fff, 0 0 3px #fff, 0 1px 2px #fff;`)}>{l.name}</div><div style={css(`font-family:'Mier B02',system-ui,sans-serif; font-size:9.5px; font-weight:500; color:#8E96A3; text-shadow:0 0 3px #fff, 0 0 3px #fff;`)}>{l.code}</div></div></React.Fragment>))}
</div>
</div>
</div>
<div style={css(`display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:13px 20px; border-top:1px solid #E6EBF2; flex-shrink:0;`)}>
<span style={css(`display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#5A5E66;`)}><span style={css(`width:11px; height:11px; background:#0B1430; display:inline-block; border-radius:2px;`)} />LMSC origin</span>
<span style={css(`display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#5A5E66;`)}><span style={css(`width:10px; height:10px; border-radius:50%; background:#5A5E66; display:inline-block;`)} />LMDC delivery</span>
<div style={css(`flex:1;`)} />
<button onClick={openFullMap} style={css(`display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}>Open full Network Map<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button>
<button onClick={runMapClose} style={css(`height:34px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Done</button>
</div>
</div>
</div>
</>) : null}
{/* ===== FINALISE (terminal stage — finalised plans live here, ready for RFQ handoff) ===== */}
{(isFinalise) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
<div style={css(`flex:1; overflow-y:auto; padding:20px 28px; min-height:0;`)}>
<div style={css(`margin-bottom:14px;`)}>
<div style={css(`font-size:16px; font-weight:700; color:#14171F;`)}>Finalise</div>
<div style={css(`font-size:12.5px; color:#5A5E66; margin-top:2px;`)}>{finaliseCountLabel}. These plans are frozen — review and hand off to RFQ.</div>
</div>
{(finaliseHasPlans) ? (<>
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; overflow:hidden;`)}>
<div style={css(`display:grid; grid-template-columns:1.4fr 1.8fr 1.4fr 1fr 1.5fr; background:#F2F5FA; border-bottom:1px solid #E6EBF2;`)}>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>SORT CENTRE</div>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>PLAN</div>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>STATUS</div>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>FINALISED</div>
<div style={css(`padding:10px 16px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>RFQ HANDOFF</div>
</div>
{(finalisePlans || []).map((p, __i120) => (<React.Fragment key={__i120}>
<div style={css(`display:grid; grid-template-columns:1.4fr 1.8fr 1.4fr 1fr 1.5fr; align-items:center; border-top:1px solid #EEF1F6;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:1.4fr 1.8fr 1.4fr 1fr 1.5fr; align-items:center; border-top:1px solid #EEF1F6;`, `background:#FAFBFD;`)}>
<div style={css(`padding:12px 16px; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:700; color:#003F98;`)}>{p.code}</div><div style={css(`font-size:11px; color:#8E96A3;`)}>{p.zone} Zone</div></div>
<div style={css(`padding:12px 16px; min-width:0;`)}><div style={css(`font-size:12.5px; font-weight:600; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{p.name}</div><div style={css(`margin-top:3px;`)}><span style={css(`padding:1px 7px; border-radius:999px; font-size:9.5px; font-weight:700; background:#EAEEFB; color:#2F4FC6;`)}>RLH</span></div></div>
<div style={css(`padding:12px 16px;`)}><span style={css(`display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; background:${p.statusBg}; color:${p.statusFg};`)}>{p.statusLabel}</span></div>
<div style={css(`padding:12px 16px; font-size:11.5px; color:#5A5E66;`)}>{p.finalisedDate}</div>
<div style={css(`padding:10px 16px; display:flex; align-items:center; gap:9px;`)}><span style={css(`display:inline-block; padding:3px 9px; border-radius:999px; font-size:10.5px; font-weight:700; background:${p.rfqBg}; color:${p.rfqFg};`)}>{p.rfqLabel}</span><button onClick={p.onHandoff} style={css(`display:inline-flex; align-items:center; gap:4px; border:none; background:transparent; padding:0; font-family:inherit; font-size:11.5px; font-weight:700; color:#003F98; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B9CCEE;`)} onMouseEnter={(e) => hoverOn(e, `text-decoration-color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:4px; border:none; background:transparent; padding:0; font-family:inherit; font-size:11.5px; font-weight:700; color:#003F98; cursor:pointer; text-decoration:underline; text-underline-offset:2px; text-decoration-color:#B9CCEE;`, `text-decoration-color:#003F98;`)}>Hand off<svg width={"12"} height={"12"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.4"}><path d={"M5 12h14M13 6l6 6-6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></button></div>
</div>
</React.Fragment>))}
</div>
</>) : null}
{(finaliseEmpty) ? (<>
<div style={css(`display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:70px 40px; text-align:center; background:#fff; border:1px solid #E6EBF2; border-radius:10px;`)}>
<div style={css(`width:48px; height:48px; border-radius:11px; background:#F2F5FA; display:flex; align-items:center; justify-content:center;`)}><svg width={"24"} height={"24"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#8E96A3"} strokeWidth={"1.7"}><path d={"M5 21V4M5 4h11l-2 4 2 4H5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div><div style={css(`font-size:15px; font-weight:700; color:#14171F; margin-bottom:5px;`)}>No finalised plans yet</div><div style={css(`font-size:12.5px; color:#5A5E66; max-width:380px; line-height:1.6;`)}>Plans appear here once you acknowledge & finalise them in Ops Alignment. They'll then be ready to hand off to RFQ.</div></div>
</div>
</>) : null}
</div>
</div>
</>) : null}
{/* ===== CYCLE SUMMARY (read-only retrospective for a closed design cycle) ===== */}
{(isCycleSummary) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
<div style={css(`flex:1; overflow-y:auto; padding:20px 28px; min-height:0;`)}>
{/* header */}
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:14px;`)}>
<div>
<div style={css(`display:flex; align-items:center; gap:10px;`)}>
<div style={css(`font-size:18px; font-weight:700; color:#14171F;`)}>{csName} — Finalised Plans</div>
<span style={css(`display:inline-block; padding:3px 11px; border-radius:999px; font-size:11px; font-weight:700; background:${csStatusBg}; color:${csStatusFg};`)}>{csStatusLabel}</span>
</div>
<div style={css(`font-size:12.5px; color:#5A5E66; margin-top:3px;`)}>{csWindow} · {csHandoffLabel}</div>
</div>
<div style={css(`display:flex; align-items:center; gap:9px;`)}>
<button onClick={onDownloadAll} style={css(`display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 15px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.9"}><path d={"M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Download all plans</button>
<button onClick={onBackActive} style={css(`display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:7px; height:36px; padding:0 16px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:12.5px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M19 12H5m6-6l-6 6 6 6"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Back to active cycle</button>
</div>
</div>
{/* read-only banner */}
<div style={css(`display:flex; align-items:center; gap:9px; padding:10px 14px; border-radius:9px; background:#EAF1FB; border:1px solid #CFE0F5; margin-bottom:18px;`)}>
<svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#1E6FB8"} strokeWidth={"2"} style={css(`flex-shrink:0;`)}><circle cx={"12"} cy={"12"} r={"9"} /><path d={"M12 8h.01M11 12h1v4h1"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span style={css(`font-size:12px; color:#1E6FB8; font-weight:600;`)}>This is a closed cycle — view only. Switch to the active cycle to make changes.</span>
</div>
{/* Past-cycle view = finalised plans only. Cycle timeline / rollup tiles / alignment-outcome
                 removed per Pranita's "no other info needed, nothing else" (2026-07-06). */}
{/* detailed finalised plans table (only content) */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:10px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:13px 18px; border-bottom:1px solid #E6EBF2;`)}>
<div>
<div style={css(`font-size:13.5px; font-weight:700; color:#14171F;`)}>Finalised plans</div>
<div style={css(`font-size:11.5px; color:#8E96A3; margin-top:1px;`)}>{csFinCount} plans — all handed off to RFQ</div>
</div>
<span style={css(`display:inline-flex; align-items:center; gap:6px; padding:4px 11px; border-radius:999px; font-size:11px; font-weight:700; background:#E7F4EC; color:#128A3E;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"3"}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>Finalised · read-only</span>
</div>
{/* table header */}
<div style={css(`display:grid; grid-template-columns:0.7fr 1.4fr 0.7fr 0.6fr 0.7fr 0.75fr 0.75fr 0.85fr 0.85fr 1.1fr 0.65fr; background:#F2F5FA; border-bottom:1px solid #E6EBF2; min-width:900px;`)}>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>SC CODE</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>SC NAME</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>ZONE</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>ROUTES</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>VEHICLES</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>CPS</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>COVERAGE</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>DISTANCE</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>FINALISED</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)}>PUSHED BY</div>
<div style={css(`padding:9px 12px; font-size:10px; font-weight:700; color:#5A5E66; letter-spacing:0.05em;`)} />
</div>
<div style={css(`overflow-x:auto; max-height:480px; overflow-y:auto;`)}>
{(csFinalPlans || []).map((fp, __i121) => (<React.Fragment key={__i121}>
<div style={css(`display:grid; grid-template-columns:0.7fr 1.4fr 0.7fr 0.6fr 0.7fr 0.75fr 0.75fr 0.85fr 0.85fr 1.1fr 0.65fr; align-items:center; border-top:1px solid #EEF1F6; min-width:900px;`)} onMouseEnter={(e) => hoverOn(e, `background:#FAFBFD;`)} onMouseLeave={(e) => hoverOff(e, `display:grid; grid-template-columns:0.7fr 1.4fr 0.7fr 0.6fr 0.7fr 0.75fr 0.75fr 0.85fr 0.85fr 1.1fr 0.65fr; align-items:center; border-top:1px solid #EEF1F6; min-width:900px;`, `background:#FAFBFD;`)}>
<div style={css(`padding:11px 12px; font-size:12px; font-weight:700; color:#003F98;`)}>{fp.scCode}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{fp.scName}</div>
<div style={css(`padding:11px 12px;`)}><span style={css(`display:inline-block; padding:2px 8px; border-radius:999px; font-size:10.5px; font-weight:600; background:#F2F5FA; color:#5A5E66;`)}>{fp.zone}</span></div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{fp.routes}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#14171F; font-variant-numeric:tabular-nums;`)}>{fp.vehicles}</div>
<div style={css(`padding:11px 12px; font-size:12.5px; font-weight:600; color:#003F98; font-variant-numeric:tabular-nums;`)}>{fp.cps}</div>
<div style={css(`padding:11px 12px; font-size:12px; font-weight:600; color:#128A3E;`)}>{fp.coverage}</div>
<div style={css(`padding:11px 12px; font-size:12px; color:#5A5E66; font-variant-numeric:tabular-nums;`)}>{fp.distance}</div>
<div style={css(`padding:11px 12px; font-size:11.5px; color:#5A5E66;`)}>{fp.finalDate}</div>
<div style={css(`padding:11px 12px; font-size:11.5px; color:#5A5E66; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{fp.pushedBy}</div>
<div style={css(`padding:11px 12px;`)}>
<button onClick={fp.onDownload} style={css(`display:inline-flex; align-items:center; gap:5px; height:28px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98; color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `display:inline-flex; align-items:center; gap:5px; height:28px; padding:0 10px; border:1px solid #C3C9D4; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; border-radius:6px; cursor:pointer;`, `border-color:#003F98; color:#003F98;`)}><svg width={"11"} height={"11"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.2"}><path d={"M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>CSV</button>
</div>
</div>
</React.Fragment>))}
</div>
</div>
{/* handoff footer */}
<div style={css(`margin-top:14px; display:flex; align-items:center; gap:8px; font-size:12px; color:#5A5E66;`)}>
<svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#128A3E"} strokeWidth={"2.2"} style={css(`flex-shrink:0;`)}><path d={"M20 6L9 17l-5-5"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
<span>{csCpsNote}. All plans handed off to RFQ.</span>
</div>
</div>
</div>
</>) : null}
{/* ===== NETWORK MAP ===== */}
{(isMap) ? (<>
<div style={css(`display:flex; flex-direction:column; height:100%;`)}>
{/* top bar: plan type + data source */}
<div style={css(`display:flex; align-items:center; gap:14px; padding:12px 26px; background:#fff; border-bottom:1px solid #E6EBF2; flex-shrink:0; flex-wrap:wrap;`)}>
<div style={css(`display:flex; gap:8px;`)}>
<div style={css(`display:flex; align-items:center; gap:8px; padding:8px 14px; border:1.5px solid #003F98; background:#F3F7FE; border-radius:8px;`)}><svg width={"15"} height={"15"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.8"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg><span style={css(`font-size:12.5px; font-weight:600; color:#003F98;`)}>Route Plan</span></div>
<button onClick={comingSoonSearch} style={css(`display:flex; align-items:center; gap:8px; padding:8px 14px; border:1px solid #E6EBF2; background:#fff; border-radius:8px; cursor:pointer; font-family:inherit;`)}><span style={css(`font-size:12.5px; font-weight:600; color:#5A5E66;`)}>Mapping Plan</span><span style={css(`padding:1px 7px; border-radius:999px; font-size:9.5px; font-weight:700; background:#F2F5FA; color:#5A5E66;`)}>SOON</span></button>
</div>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:11.5px; color:#5A5E66;`)}>Data source</span>
<div style={css(`display:flex; background:#F2F5FA; border-radius:8px; padding:3px; gap:2px;`)}>
<button onClick={setMapGen} style={css(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; padding:6px 13px; border-radius:6px; background:${mapSrcGenBg}; color:${mapSrcGenFg};`)}>Generated plans</button>
<button onClick={setMapIng} style={css(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:600; padding:6px 13px; border-radius:6px; background:${mapSrcIngBg}; color:${mapSrcIngFg};`)}>Ingested data</button>
</div>
</div>
<div style={css(`flex:1; display:flex; min-height:0;`)}>
{/* LEFT: SC picker */}
<aside style={css(`width:240px; flex-shrink:0; border-right:1px solid #E6EBF2; background:#fff; display:flex; flex-direction:column;`)}>
<div style={css(`padding:13px 14px 9px; font-size:12px; font-weight:700; color:#14171F;`)}>LMSC origin</div>
<div style={css(`padding:0 12px 10px; display:flex; gap:5px; flex-wrap:wrap;`)}>
{(mapZoneChips || []).map((z, __i122) => (<React.Fragment key={__i122}><button onClick={z.onClick} style={css(`border:1px solid ${z.bd}; background:${z.bg}; color:${z.fg}; font-family:inherit; font-size:10.5px; font-weight:600; padding:4px 9px; border-radius:999px; cursor:pointer;`)}>{z.label}</button></React.Fragment>))}
</div>
<div style={css(`flex:1; overflow-y:auto; padding:0 10px 12px;`)}>
{(mapScList || []).map((s, __i123) => (<React.Fragment key={__i123}>
<button onClick={s.onClick} style={css(`display:flex; align-items:center; gap:8px; width:100%; text-align:left; padding:9px 11px; margin-bottom:2px; border:1px solid ${s.bd}; border-radius:8px; background:${s.bg}; cursor:pointer; font-family:inherit;`)}><span style={css(`font-size:12px; font-weight:700; color:#003F98;`)}>{s.code}</span><span style={css(`font-size:11.5px; color:#5A5E66; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{s.name}</span><span style={css(`font-size:10px; color:#5A5E66;`)}>{s.zone}</span></button>
</React.Fragment>))}
</div>
</aside>
{/* MAIN */}
<main style={css(`flex:1; overflow-y:auto; min-width:0; background:#F4F5F8;`)}>
{/* PER-SC VIEWS */}
{(isMapPerSC) ? (<>
{(mapGen) ? (<>
<div style={css(`padding:18px 24px;`)}>
{/* plan selector */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; padding:14px 16px; margin-bottom:16px;`)}>
<div style={css(`display:flex; align-items:center; gap:9px; margin-bottom:9px;`)}>
<span style={css(`font-size:11px; font-weight:700; color:#8E96A3; letter-spacing:0.05em;`)}>SELECT PLAN</span>
{(hasPlanSel) ? (<><button onClick={clearMapPlan} style={css(`height:22px; padding:0 9px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; border-radius:5px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#F4F5F8;`)} onMouseLeave={(e) => hoverOff(e, `height:22px; padding:0 9px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:11px; font-weight:600; border-radius:5px; cursor:pointer;`, `background:#F4F5F8;`)}>✕ Clear selection</button></>) : null}
</div>
<div style={css(`display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;`)}>
{(mapPlanCards || []).map((pl, __i124) => (<React.Fragment key={__i124}>
<button onClick={pl.onClick} style={css(`flex-shrink:0; width:190px; text-align:left; padding:10px 12px; border:1.5px solid ${pl.bd}; background:${pl.bg}; border-radius:8px; cursor:pointer; font-family:inherit;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#003F98;`)} onMouseLeave={(e) => hoverOff(e, `flex-shrink:0; width:190px; text-align:left; padding:10px 12px; border:1.5px solid ${pl.bd}; background:${pl.bg}; border-radius:8px; cursor:pointer; font-family:inherit;`, `border-color:#003F98;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#003F98; margin-bottom:3px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{pl.runId}</div>
<div style={css(`font-size:11px; color:#5A5E66; margin-bottom:7px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{pl.code} · {pl.city} · {pl.routes} routes</div>
<span style={css(`display:inline-block; padding:1px 7px; border-radius:999px; font-size:9.5px; font-weight:700; background:${pl.sBg}; color:${pl.sFg}; white-space:nowrap;`)}>{pl.status}</span>
</button>
</React.Fragment>))}
</div>
</div>
{/* filter bar */}
<div style={css(`display:flex; align-items:center; gap:11px; flex-wrap:wrap; margin-bottom:14px;`)}>
<div style={css(`display:flex; align-items:center; gap:7px;`)}><span style={css(`font-size:11.5px; color:#5A5E66;`)}>Route</span><select value={mapRoute} onChange={onMapRoute} style={css(`height:34px; padding:0 9px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:12px; color:#14171F; background:#fff; cursor:pointer;`)}>{(routeOptions || []).map((o, __i125) => (<React.Fragment key={__i125}><option value={o}>{o}</option></React.Fragment>))}</select></div>
<div style={css(`display:flex; align-items:center; gap:7px;`)}><span style={css(`font-size:11.5px; color:#5A5E66;`)}>Vehicle</span><select value={mapVeh} onChange={onMapVeh} style={css(`height:34px; padding:0 9px; border:1px solid #E6EBF2; border-radius:8px; font-family:inherit; font-size:12px; color:#14171F; background:#fff; cursor:pointer;`)}>{(vehOptions || []).map((o, __i126) => (<React.Fragment key={__i126}><option value={o}>{o}</option></React.Fragment>))}</select></div>
<div style={css(`display:flex; align-items:center; gap:7px; height:34px; padding:0 11px; border:1px solid #E6EBF2; border-radius:8px; background:#fff;`)}><svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.8"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg><input value={mapSearch} onInput={onMapSearch} placeholder={"Search LMDC…"} style={css(`border:none; outline:none; font-family:inherit; font-size:12px; color:#14171F; background:transparent; width:120px;`)} /></div>
<div style={css(`flex:1;`)} />
<span style={css(`font-size:12px; color:#5A5E66;`)}>Showing <strong style={css(`color:#14171F;`)}>{rowsShown}</strong> of {routeTotal} routes · <strong style={css(`color:#003F98;`)}>{activeFilters}</strong> filters</span>
{(hasActiveFilters) ? (<><button onClick={clearMapFilters} style={css(`height:34px; padding:0 12px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `border-color:#C3C9D4;`)} onMouseLeave={(e) => hoverOff(e, `height:34px; padding:0 12px; border:1px solid #E6EBF2; background:#fff; color:#5A5E66; font-family:inherit; font-size:12px; font-weight:600; border-radius:8px; cursor:pointer;`, `border-color:#C3C9D4;`)}>Clear all</button></>) : null}
</div>
{/* map */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:13px; overflow:hidden;`)}>
<div style={css(`display:flex; align-items:center; justify-content:space-between; padding:13px 18px; border-bottom:1px solid #EEF1F6;`)}>
<div style={css(`font-size:13px; font-weight:700; color:#14171F;`)}>{mapSC} · {mapSCname} <span style={css(`font-weight:500; color:#5A5E66;`)}>— {mapSCzone} zone · RLH routes</span></div>
<div style={css(`display:flex; align-items:center; gap:14px; font-size:11px; color:#5A5E66;`)}><span style={css(`display:inline-flex; align-items:center; gap:6px;`)}><span style={css(`width:11px; height:11px; background:#0B1430; display:inline-block;`)} />LMSC origin</span><span style={css(`display:inline-flex; align-items:center; gap:6px;`)}><span style={css(`width:10px; height:10px; border-radius:50%; background:#5A5E66; display:inline-block;`)} />LMDC delivery</span></div>
</div>
<div style={css(`position:relative; background:#F0F2EC;`)}>
<svg viewBox={`0 0 ${mapW} ${mapH}`} style={css(`width:100%; height:auto; display:block;`)}>
<defs>
<pattern id={"mgrid"} width={"60"} height={"60"} patternUnits={"userSpaceOnUse"}><path d={"M60 0H0V60"} fill={"none"} stroke={"#CACECA"} strokeWidth={"0.35"} /></pattern>
<filter id={"arcglow"} x={"-30%"} y={"-30%"} width={"160%"} height={"160%"}><fegaussianblur in={"SourceGraphic"} stdDeviation={"4"} result={"blur"} /></filter>
</defs>
{/* Map canvas: muted landmass + faint water + subtle road traces (Google-Maps feel, pure SVG) */}
<rect x={"0"} y={"0"} width={mapW} height={mapH} fill={"#F0F2EC"} />
<path d={"M0,318 Q88,294 178,310 Q268,328 338,353 Q398,382 354,470 L0,470 Z"} fill={"#E4ECF0"} opacity={"0.6"} />
<rect x={"0"} y={"0"} width={mapW} height={mapH} fill={"url(#mgrid)"} opacity={"0.5"} />
<path d={"M0,160 Q148,144 270,165 Q398,188 526,170 Q644,154 760,168"} fill={"none"} stroke={"#C8CCC2"} strokeWidth={"1.1"} strokeLinecap={"round"} />
<path d={"M0,290 Q110,274 210,288 Q330,306 448,292 Q596,276 760,288"} fill={"none"} stroke={"#C8CCC2"} strokeWidth={"1.1"} strokeLinecap={"round"} />
<path d={"M162,0 Q174,96 170,196 Q164,296 166,470"} fill={"none"} stroke={"#C8CCC2"} strokeWidth={"1.0"} strokeLinecap={"round"} />
<path d={"M404,0 Q415,90 411,186 Q405,296 407,470"} fill={"none"} stroke={"#C8CCC2"} strokeWidth={"1.0"} strokeLinecap={"round"} />
<path d={"M604,0 Q612,96 609,202 Q605,320 608,470"} fill={"none"} stroke={"#C8CCC2"} strokeWidth={"0.8"} strokeLinecap={"round"} />
{/* white casing separates crossing spokes (metro-map style) */}
{(arcs || []).map((a, __i127) => (<React.Fragment key={__i127}><path d={a.d} fill={"none"} stroke={"#fff"} strokeWidth={"3.2"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{/* crisp coloured spoke (thin) */}
{(arcs || []).map((a, __i128) => (<React.Fragment key={__i128}><path d={a.d} fill={"none"} stroke={a.color} strokeWidth={"1.4"} strokeOpacity={"0.95"} strokeLinecap={"round"} strokeLinejoin={"round"} /></React.Fragment>))}
{/* arrowheads at DC delivery end of each route */}
{(arrowHeads || []).map((ah, __i129) => (<React.Fragment key={__i129}><path d={ah.d} fill={ah.color} opacity={"0.9"} /></React.Fragment>))}
{/* DC node soft halos (subtle glow behind delivery markers so they read on the map) */}
{(dcMarkers || []).map((m, __i130) => (<React.Fragment key={__i130}><circle cx={m.x} cy={m.y} r={"10"} fill={m.color} fillOpacity={"0.13"} opacity={m.op} /></React.Fragment>))}
{/* DC delivery circles (ring style: outer fill + white inner) — clickable for node info card */}
{(dcMarkers || []).map((m, __i131) => (<React.Fragment key={__i131}><circle cx={m.x} cy={m.y} r={"5"} fill={m.color} fillOpacity={m.op} stroke={"#fff"} strokeWidth={"2"} style={css(`cursor:pointer;`)} onClick={m.onClick} /></React.Fragment>))}
{(dcMarkers || []).map((m, __i132) => (<React.Fragment key={__i132}><circle cx={m.x} cy={m.y} r={"2"} fill={"#fff"} fillOpacity={m.op} style={css(`pointer-events:none;`)} /></React.Fragment>))}
{/* LMSC origin square (dark navy with white inner square marker) */}
<rect x={scX} y={scY} width={"22"} height={"22"} transform={"translate(-11,-11)"} rx={"3"} fill={"#0B1430"} stroke={"#fff"} strokeWidth={"2.5"} />
<rect x={scX} y={scY} width={"10"} height={"10"} transform={"translate(-5,-5)"} rx={"1.5"} fill={"#fff"} opacity={"0.9"} />
</svg>
{/* node-name overlay (HTML positioned by % over the SVG — bound SVG text doesn't lay out in this engine) */}
<div style={css(`position:absolute; inset:0; pointer-events:none;`)}>
{(dcLabels || []).map((l, __i133) => (<React.Fragment key={__i133}><div style={css(`position:absolute; left:${l.xPct}%; top:${l.yPct}%; transform:translate(-50%, 8px); text-align:center; white-space:nowrap;`)}><div style={css(`font-family:'Mier B02',system-ui,sans-serif; font-size:11px; font-weight:700; color:#14171F; text-shadow:0 0 3px #fff, 0 0 3px #fff, 0 1px 2px #fff;`)}>{l.name}</div><div style={css(`font-family:'Mier B02',system-ui,sans-serif; font-size:9.5px; font-weight:500; color:#8E96A3; text-shadow:0 0 3px #fff, 0 0 3px #fff;`)}>{l.code}</div></div></React.Fragment>))}
{(arcLabels || []).map((a, __i134) => (<React.Fragment key={__i134}><div style={css(`position:absolute; left:${a.midXPct}%; top:${a.midYPct}%; transform:translate(-50%,-50%); white-space:nowrap; font-family:'Mier B02',system-ui,sans-serif; font-size:11px; font-weight:700; color:${a.color}; text-shadow:0 0 3px #fff, 0 0 3px #fff, 0 0 2px #fff;`)}>{a.label}</div></React.Fragment>))}
</div>
{/* Part B.3 — node info card (click a DC marker to show) */}
{(showNodeCard) ? (<>
<div style={css(`position:absolute; left:${nodeCard.xPct}%; top:${nodeCard.yPct}%; transform:translate(-50%, -110%); pointer-events:auto; z-index:10;`)}>
<div style={css(`background:#14171F; color:#fff; border-radius:8px; padding:9px 12px; font-family:'Mier B02',system-ui,sans-serif; white-space:nowrap; box-shadow:0 6px 20px rgba(0,0,0,0.35); min-width:160px;`)}>
<div style={css(`display:flex; align-items:flex-start; justify-content:space-between; gap:8px;`)}>
<div style={css(`font-size:12.5px; font-weight:700; color:#fff; line-height:1.3;`)}>{nodeCard.name}</div>
<button onClick={clearHovDc} style={css(`background:transparent; border:none; color:#8E96A3; cursor:pointer; padding:0; line-height:1; font-size:14px; flex-shrink:0; margin-top:1px;`)} onMouseEnter={(e) => hoverOn(e, `color:#fff;`)} onMouseLeave={(e) => hoverOff(e, `background:transparent; border:none; color:#8E96A3; cursor:pointer; padding:0; line-height:1; font-size:14px; flex-shrink:0; margin-top:1px;`, `color:#fff;`)}>×</button>
</div>
<div style={css(`font-size:10.5px; color:#8E96A3; margin-top:3px;`)}>{nodeCard.code}</div>
<div style={css(`display:flex; align-items:center; gap:6px; margin-top:6px;`)}>
<span style={css(`padding:1px 7px; border-radius:999px; font-size:9.5px; font-weight:700; background:#2F4FC6; color:#fff;`)}>{nodeCard.type}</span>
<span style={css(`font-size:10.5px; color:#C3C9D4;`)}>{nodeCard.zone} zone</span>
</div>
<div style={css(`font-size:10.5px; color:#6E82C4; margin-top:4px; font-weight:600;`)}>{nodeCard.routeId}</div>
</div>
<div style={css(`width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #14171F; margin:0 auto;`)} />
</div>
</>) : null}
{(mapNoResults) ? (<>
<div style={css(`position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:11px; background:rgba(244,245,248,0.72); backdrop-filter:blur(1px);`)}>
<svg width={"30"} height={"30"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.6"}><path d={"M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4.5-4.5"} strokeLinecap={"round"} /></svg>
<div style={css(`font-size:13px; font-weight:600; color:#14171F;`)}>No routes match these filters</div>
<button onClick={clearMapFilters} style={css(`height:32px; padding:0 14px; border:1px solid #003F98; background:#fff; color:#003F98; font-family:inherit; font-size:12px; font-weight:600; border-radius:8px; cursor:pointer;`)}>Clear filters</button>
</div>
</>) : null}
</div>
<div style={css(`display:flex; flex-wrap:wrap; gap:8px; padding:13px 18px; border-top:1px solid #EEF1F6;`)}>
{(legend || []).map((l, __i135) => (<React.Fragment key={__i135}><span style={css(`display:inline-flex; align-items:center; gap:6px; padding:3px 9px; border-radius:999px; background:#F7F8FB; font-size:11px; font-weight:600; color:#5A5E66;`)}><span style={css(`width:9px; height:9px; border-radius:2px; background:${l.color};`)} />{l.id}</span></React.Fragment>))}
</div>
</div>
{/* row table */}
<div style={css(`background:#fff; border:1px solid #E6EBF2; border-radius:8px; overflow:hidden; margin-top:16px;`)}>
<div style={css(`display:grid; grid-template-columns:1.1fr 0.6fr 0.7fr 1fr; background:#E6EBF2;`)}>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em;`)}>ROUTE</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>TP</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:center;`)}>DCs</div>
<div style={css(`padding:10px 14px; font-size:10.5px; font-weight:700; color:#5A5E66; letter-spacing:0.04em; text-align:right;`)}>RT DISTANCE</div>
</div>
{(mapRows || []).map((r, __i136) => (<React.Fragment key={__i136}>
<div style={css(`display:grid; grid-template-columns:1.1fr 0.6fr 0.7fr 1fr; align-items:center; border-top:1px solid #EEF1F6;`)}>
<div style={css(`padding:11px 14px; display:flex; align-items:center; gap:8px;`)}><span style={css(`width:9px; height:9px; border-radius:2px; background:${r.color}; flex-shrink:0;`)} /><span style={css(`font-size:12.5px; font-weight:700; color:#003F98;`)}>{r.id}</span></div>
<div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:center;`)}>{r.tp}</div>
<div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:center;`)}>{r.dcs}</div>
<div style={css(`padding:11px 14px; font-size:12.5px; color:#14171F; text-align:right;`)}>{r.rtDist}</div>
</div>
</React.Fragment>))}
{(mapNoResults) ? (<>
<div style={css(`padding:26px 14px; text-align:center; font-size:12.5px; color:#5A5E66; border-top:1px solid #EEF1F6;`)}>No routes match the current filters.</div>
</>) : null}
</div>
</div>
</>) : null}
{(mapIngested) ? (<>
<div style={css(`height:100%; display:flex; align-items:center; justify-content:center; padding:40px;`)}>
<div style={css(`text-align:center; max-width:420px;`)}>
<div style={css(`width:58px; height:58px; border-radius:15px; background:#fff; border:1px solid #E6EBF2; display:flex; align-items:center; justify-content:center; margin:0 auto;`)}><svg width={"27"} height={"27"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#5A5E66"} strokeWidth={"1.6"}><path d={"M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg></div>
<div style={css(`font-size:16px; font-weight:700; color:#14171F; margin-top:15px;`)}>No ingested data for this cycle</div>
{(canCreate) ? (<>
<div style={css(`font-size:12.5px; color:#5A5E66; margin-top:7px; line-height:1.55;`)}>No uploaded plan for this cycle. Switch to <strong>Generated plans</strong>, or create a design in Design Creation.</div>
<button onClick={goCreate} style={css(`margin-top:16px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `margin-top:16px; height:38px; padding:0 18px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Go to Design Creation</button>
</>) : null}
{(canCreate) ? (<>
<div style={css(`font-size:12.5px; color:#5A5E66; margin-top:7px; line-height:1.55;`)}>No uploaded plan for this cycle. Switch to <strong>Generated plans</strong> to view the planner's routes for this SC.</div>
</>) : null}
</div>
</div>
</>) : null}
</>) : null}
</main>
</div>
</div>
</>) : null}
{/* ===== STUB (other modules) ===== */}
{(isStub) ? (<>
<div style={css(`height:100%; display:flex; align-items:center; justify-content:center; padding:40px;`)}>
<div style={css(`text-align:center; max-width:460px;`)}>
<div style={css(`width:64px; height:64px; border-radius:8px; background:#EAEEFB; display:flex; align-items:center; justify-content:center; margin:0 auto;`)}>
<svg width={"30"} height={"30"} viewBox={"0 0 24 24"} fill={"none"} stroke={"#003F98"} strokeWidth={"1.6"}><path d={stubIcon} strokeLinecap={"round"} strokeLinejoin={"round"} /></svg>
</div>
<div style={css(`font-size:19px; font-weight:700; color:#14171F; margin-top:18px;`)}>{moduleTitle}</div>
<div style={css(`font-size:13px; color:#5A5E66; margin-top:9px; line-height:1.55;`)}>This module is coming soon. Today's workflow: <strong style={css(`color:#4A4F5E;`)}>Design Inputs → Design Creation → Design Review → Ops Alignment → Map.</strong></div>
<button onClick={goCommand} style={css(`margin-top:20px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; height:38px; padding:0 18px; border-radius:8px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:#00337D;`)} onMouseLeave={(e) => hoverOff(e, `margin-top:20px; border:none; background:#003F98; color:#fff; font-family:inherit; font-size:13px; font-weight:600; height:38px; padding:0 18px; border-radius:8px; cursor:pointer;`, `background:#00337D;`)}>Back to Design Inputs</button>
</div>
</div>
</>) : null}
</main>
</div>
{/* TOAST */}
{(hasToast) ? (<>
<div style={css(`position:fixed; bottom:24px; right:24px; z-index:90; display:flex; align-items:center; gap:11px; padding:13px 17px; background:#14171F; color:#fff; border-radius:8px; box-shadow:0 12px 30px rgba(0,0,0,0.28); font-size:13px; font-weight:500; animation:ndctoast 200ms ease both; max-width:420px;`)}>
<span style={css(`width:8px; height:8px; border-radius:50%; background:${toastDot}; flex-shrink:0;`)} />
<span style={css(`flex:1;`)}>{toastMsg}</span>
{(toastHasUndo) ? (<><button onClick={onToastUndo} style={css(`flex-shrink:0; margin-left:4px; padding:5px 12px; border:none; background:rgba(255,255,255,0.12); color:#8FB4FF; font-family:inherit; font-size:12.5px; font-weight:700; border-radius:6px; cursor:pointer;`)} onMouseEnter={(e) => hoverOn(e, `background:rgba(255,255,255,0.2); color:#B9D0FF;`)} onMouseLeave={(e) => hoverOff(e, `flex-shrink:0; margin-left:4px; padding:5px 12px; border:none; background:rgba(255,255,255,0.12); color:#8FB4FF; font-family:inherit; font-size:12.5px; font-weight:700; border-radius:6px; cursor:pointer;`, `background:rgba(255,255,255,0.2); color:#B9D0FF;`)}>Undo</button></>) : null}
</div>
</>) : null}
</div>
      </>
    );
  }
}
// NDCApp -- the ported application logic. This class is essentially the
// original Claude-Design `class Component extends DCLogic` unchanged: same
// state shape, same buildSeed() fake-data generator, same event-handler
// methods, same *Vals() binding builders. The only real changes from the
// original are:
//   1. `extends DCLogic` -> `extends React.Component` (this.setState /
//      this.state already behaved like real React state, so nothing else
//      in the method bodies needed to change).
//   2. A real render() was added at the bottom, calling the View() function
//      from view.jsx with the merged bindings from renderVals().
//   3. Known dead code flagged in the original handoff (\u00a711) was removed:
//      the unused volFiles/isActive/canSetActive/cantSetActive/onSetActive/
//      setVolActive volume-library machinery, and the always-false
//      mapNational flag and its dead branches.

// Solver concurrency — In-Progress slots run at once, the rest wait as Planned. Single source of
// truth shared by triggerRuns (slot assignment) and the Step-4 ETA math so they can never disagree.
const NDC_CONCURRENCY = 6;
const NDC_RUN_MINUTES = 30; // ~30 min per solve (used for the batch ETA estimate)
class NDCApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      persona: 'planner',
      view: 'inputs', // Command Center hidden for now -- see nav comment near plannerNav
      showCoach: props.showFtux !== false,
      toast: null,
      inputsTab: 'volume',
      mastersTab: 'sc',
      vehRemoved: {},
      nodesTab: 'autodml',
      inputsSearch: '',
      inputsZone: 'All',
      autodmlOpen: null,
      nodeWarnFilter: 'all',
      nodeShow: 'all',
      nodeLmscSearch: '',
      nodeStep: 'active',
      ingestionTab: 'rlh',
      ingestedPlans: [],
      ingestionCounter: 0,
      resolved: {},
      creationStep: 1, creationView: 'wizard',
      fixReturnStep: null, focusSC: null,
      creationSearch: '',
      creationZone: 'All',
      collapsedZones: {},
      expandedSC: null,
      selectedSCs: [],
      creationVolume: '',
      creationVolSearch: '',
      hwGlobal: 0.5,
      hwBySC: {},
      refBySC: {},
      droppedDcBySC: {},
      newNodeMode: false,
      runQueue: [{ scCode: 'GGNS', status: 'Queued', ticks: 0 }],
      reviewSC: null,
      reviewSearch: '',
      reviewZone: 'All',
      pushOpen: false,
      pushSCcode: null,
      pushRunId: null,
      mapRunId: null,
      pushReviewers: [],
      pushName: '',
      pushEmail: '',
      pushedSCs: {},
      alignPlanId: null,
      alignFilter: 'Pending Feedback',
      alignPage: 0,
      alignDecisions: {},
      alignDcDecisions: {},
      alignFieldDec: {},
      alignRemarks: {},
      alignStatus: {}, remindedPlans: {},
      simRow: null, simMapRow: null,
      ackOpen: false, ackPlanId: null,
      finOpen: false, finPlanId: null, finDirectOpen: false, finDirectSCcode: null,
      opsPlanId: null, opsPage: 0, opsSection: 'summary', opsRowDec: {}, opsRowFb: {}, opsTpOrder: {}, ncOpen: false, ncDecision: 'Needs Change', ncRow: null, ncCells: {}, ncFlags: {}, ncDcCells: {}, ncRemark: '', opsSubmitted: { 'PL-GGNS': { by: 'Rahul Sharma', at: '05 Jul' }, 'PL-NOIS': { by: 'Rahul Sharma', at: '06 Jul' }, 'PL-JAIS': { by: 'Rahul Sharma', at: '06 Jul' } },
      alignExpandedRow: {}, opsExpandedRow: {},
      alignAllOpen: false, alignAllPlanId: null, opsPartialOpen: false, opsPartialPlanId: null, delConfirm: null,
      acceptAllPlanOpen: false, acceptAllPlanId: null,
      addScOpen: false, addScForm: {}, addScEditCode: null, addedScs: [], scEdits: {}, availEdits: {}, scRemoved: {}, availRemoved: {}, editingAvail: null, designCycle: 'July 2026', cycleOpen: false, cyclePickerOpen: false,
      addVehOpen: false, addVehForm: {}, addedVehTypes: [], editVehName: null, editVehDraft: null,
      editAvailKey: null, editAvailDraft: null,
      editVehRowKey: null, editVehRowDraft: null,
      pocOpenRow: null, volTypeFilter: 'All', volSearch: '', nodeChangeBy: 'Shashvat Jain', nodeChangeDate: '10 Jul · 11:24',
      mapSC: null, mapDataSource: 'generated', mapRoute: 'All', mapVeh: 'All', mapSearch: '', mapZone: 'All', runMapOpen: false, hovDcIdx: null,
      reviewRoutesOpen: false, reviewDetailRunId: null, reviewDetailView: 'route',
      pgAutodml: 1, pgScMaster: 1, pgRoutes: 1, pgAvail: 1,
      data: this.buildSeed(),
    };
    // §9 — do NOT pre-select sort centres; the planner selects their own on Step 1 (selectedSCs stays [] from initial state).
    this.state.reviewSC = this.state.data.scs[0].code;
    // B — do NOT auto-select a plan on entry; both personas open with null = unselected blank state.
    // this.state.alignPlanId and this.state.opsPlanId start null (declared above in state init).
    this.state.mapSC = this.state.data.scs[0].code;
  }

  buildSeed() {
    let s = 20260624;
    const R = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
    const rf = (a, b) => a + R() * (b - a);
    const pick = (arr) => arr[Math.floor(R() * arr.length)];

    const VEH = [
      { name: 'TATA ACE / 7ft',  tp: 4, cap: 1600,  caps: [1400, 1600, 1800],  dist: 250,  feas: ['RLH'] },
      { name: 'Bolero / 8ft',    tp: 7, cap: 2600,  caps: [2400, 2600, 2800],  dist: 400,  feas: ['RLH'] },
      { name: 'TATA 407 / 10ft', tp: 7, cap: 3500,  caps: [3300, 3500, 3700],  dist: 600,  feas: ['NLH', 'RLH'] },
      { name: '17ft / MCV',      tp: 6, cap: 5000,  caps: [4800, 5000, 5200],  dist: 700,  feas: ['NLH', 'RLH'] },
      { name: '19ft / MCV',      tp: 5, cap: 6500,  caps: [6300, 6500, 6700],  dist: 800,  feas: ['NLH', 'RLH'] },
      { name: '22ft / LCV',      tp: 4, cap: 8000,  caps: [7800, 8000, 8200],  dist: 900,  feas: ['NLH', 'RLH'] },
      { name: '14ft Trailer',    tp: 7, cap: 4500,  caps: [4300, 4500, 4700],  dist: 800,  feas: ['NLH'] },
      { name: '32ft XL Trailer', tp: 3, cap: 14000, caps: [13800, 14000, 14200], dist: 1200, feas: ['NLH'] },
    ];

    const NAMES = ['Aarti Nair','Rahul Sharma','Imran Khan','Deepa Rao','Suresh Menon','Neha Tiwari','Vivek Pillai','Karthik Varma','Pooja Gupta','Sandeep Lal','Megha Bose','Arjun Desai'];

    const Z = [
      { z: 'North', cities: [['Delhi','DEL'],['Gurugram','GGN'],['Noida','NOI'],['Jaipur','JAI'],['Lucknow','LKO'],['Kanpur','KNP'],['Chandigarh','CHD'],['Ludhiana','LDH'],['Agra','AGR'],['Meerut','MRT'],['Amritsar','ASR'],['Dehradun','DDN']], lat: [26.5, 30.8], lng: [74.5, 80.5] },
      { z: 'West', cities: [['Mumbai','BOM'],['Pune','PNQ'],['Ahmedabad','AMD'],['Surat','STV'],['Nagpur','NAG'],['Nashik','ISK'],['Rajkot','RAJ'],['Vadodara','BDQ'],['Indore','IDR'],['Bhopal','BHO'],['Thane','TNA']], lat: [18.4, 23.6], lng: [70.0, 77.2] },
      { z: 'South', cities: [['Bengaluru','BLR'],['Chennai','MAA'],['Hyderabad','HYD'],['Coimbatore','CJB'],['Kochi','COK'],['Madurai','IXM'],['Mysuru','MYS'],['Vijayawada','VGA'],['Vizag','VTZ'],['Trichy','TRZ'],['Salem','SXV']], lat: [9.5, 17.6], lng: [75.5, 83.2] },
      { z: 'East', cities: [['Kolkata','CCU'],['Patna','PAT'],['Bhubaneswar','BBI'],['Ranchi','IXR'],['Guwahati','GAU'],['Siliguri','IXB'],['Cuttack','CTC'],['Durgapur','RDP'],['Asansol','ASN']], lat: [21.5, 27.2], lng: [83.5, 92.0] },
      { z: 'Central', cities: [['Raipur','RPR'],['Jabalpur','JLR'],['Gwalior','GWL'],['Bilaspur','PAB'],['Ujjain','UJN']], lat: [21.5, 26.5], lng: [78.0, 83.5] },
    ];

    const scs = [];
    let zi = 0, ci = 0, guard = 0;
    while (scs.length < 80 && guard < 600) {
      guard++;
      const zone = Z[zi % Z.length];
      const cityArr = zone.cities;
      const city = cityArr[ci % cityArr.length];
      const variant = scs.filter(x => x.cityCode === city[1]).length;
      if (variant === 0 || (variant < 2 && R() < 0.45)) {
        const code = variant === 0 ? city[1] + 'S' : city[1] + (variant + 1);
        const dcCount = ri(95, 205);
        const volume = Math.round(dcCount * rf(230, 420));
        const lat = rf(zone.lat[0], zone.lat[1]);
        const lng = rf(zone.lng[0], zone.lng[1]);
        // farDist = farthest-DC round-trip distance for this SC (km) — used by the Step-3 distance-limit
        // validation. Seed distribution (deterministic, index-driven): most SCs sit comfortably within the
        // common vehicle range (~150–235 km < TATA ACE's 250 km limit), and a realistic handful exceed it
        // (~270–520 km) so the demo trips the distance flag on only a few SCs by default, not on almost all.
        // Uses exactly ONE rf() draw to preserve the deterministic RNG stream for all later seeded fields.
        const farIdx = scs.length;
        const farOverLimit = (farIdx % 17 === 7) || (farIdx % 19 === 6) || (farIdx % 23 === 1);
        const farDist = farOverLimit ? Math.round(270 + rf(0, 1) * 250) : Math.round(150 + rf(0, 1) * 85);
        const zeroVolDc = (variant + city[1].charCodeAt(0)) % 5 === 0 ? ri(1, 4) : 0;
        // Cap the volume-gap total (zero + miss) at 6 so it never exceeds the 6 droppable LMDC rows
        // (expand list indices 0-5). This keeps the "drop the zero/missing-volume DCs" resolution
        // genuinely completable per SC — the planner can always drive volGap to 0 by dropping, without
        // being forced to de-select the SC just because the seeded gap outran the droppable rows.
        const missRaw = (variant + city[1].charCodeAt(1)) % 4 === 0 ? ri(2, 9) : 0;
        const missVolDc = Math.min(missRaw, Math.max(0, 6 - zeroVolDc));
        scs.push({ code, name: city[0], cityCode: city[1], zone: zone.z, dcCount, volume, lat: +lat.toFixed(3), lng: +lng.toFixed(3), sortCap: Math.round(volume * rf(0.98, 1.4) / 1000) * 1000, volCap: Math.round(volume * rf(0.96, 1.3) / 1000) * 1000, docks: ri(3, 9), hasRef: R() < 0.82, farDist, zeroVolDc, missVolDc, pocs: Array.from({ length: ri(2, 4) }, () => NAMES[Math.floor(R() * NAMES.length)]) });
      }
      ci++;
      if (ci % cityArr.length === 0) zi++;
    }

    const HW = [0, 0.5, 1];
    const runs = [];
    // §9 — a run is ONE triggered DS job for ONE SC. HW is just a parameter on the run, not the
    // organising axis. mkRun synthesises a single run; an SC can be triggered multiple times in a
    // cycle (re-runs), so the Design-Review view lists ALL of an SC's runs as separate plan cards.
    const RUNDATES = ['05 Jul · 09:12', '06 Jul · 14:40', '07 Jul · 10:05', '08 Jul · 16:22', '09 Jul · 11:48'];
    const PLANNERS = ['Pranita Sapkal', 'Komal Rao', 'Dixan Mehta'];
    const mkRun = (sc, hw, baseCps, runNo, suffix) => {
      const matchBand = hw === 0 ? [52, 70] : hw === 0.5 ? [76, 89] : [94, 99];
      const cpsMul = hw === 0 ? rf(0.86, 0.94) : hw === 0.5 ? rf(0.93, 0.99) : rf(0.99, 1.07);
      const avgTP = rf(3.4, 6.6);
      const routes = Math.max(1, Math.round(sc.dcCount / avgTP));
      const vehicles = routes + ri(0, 3);
      const distance = Math.round(routes * rf(170, 320));
      const cps = +(baseCps * cpsMul).toFixed(2);
      const util = +rf(0.42, 0.93).toFixed(2);
      const coverage = +(R() < 0.22 ? rf(0.9, 0.978) : rf(0.985, 1.0)).toFixed(3);
      const avgTat = +rf(6.2, 10.8).toFixed(1);
      const flags = [];
      // B4 — thresholds must match their labels: TP fires at >7, under-util at <40%.
      if (avgTP > 7) flags.push({ t: 'Avg touch points > 7 on some routes', sev: 'warning' });
      if (util > 0.9) flags.push({ t: 'Over-loaded', sev: 'warning' });
      if (util < 0.40) flags.push({ t: 'Under-utilised (<40%)', sev: 'warning' });
      if (coverage < 0.98) flags.push({ t: 'Coverage gap — ' + Math.round((1 - coverage) * sc.dcCount) + ' DCs unserved', sev: 'danger' });
      if (R() < 0.1) flags.push({ t: 'Input ≠ output node count', sev: 'danger' });
      // B2 — per-type vehicle breakdown summing to `vehicles` (canonical VEH order: ACE / Bolero / 407 / 14ft).
      const vbt = [0, 0, 0, 0];
      for (let vi = 0; vi < vehicles; vi++) { vbt[Math.floor(R() * 4)]++; }
      const vehByType = [
        { name: VEH[0].name, short: 'ACE', n: vbt[0] },
        { name: VEH[1].name, short: 'Bolero', n: vbt[1] },
        { name: VEH[2].name, short: '407', n: vbt[2] },
        { name: VEH[3].name, short: '14ft', n: vbt[3] },
      ];
      // vehTypeInput = the vehicle types fed into the run (the input config), distinct from the
      // solver-chosen mix. Keep it to the types with a positive count for a tidy card line.
      const vehInput = vehByType.filter(v => v.n > 0).map(v => v.short + ' ×' + v.n);
      const triggeredBy = PLANNERS[runNo % PLANNERS.length];
      return { id: sc.code + '-HW' + String(hw).replace('.', '_') + (suffix || ''), runId: 'RUN-' + sc.code + '-' + String(runNo).padStart(2, '0'),
        runNo, triggeredAt: RUNDATES[(runNo - 1) % RUNDATES.length], triggeredBy, scCode: sc.code, scName: sc.name, zone: sc.zone, hw, status: 'Completed',
        coverage, cps, util, routes, vehicles, vehByType, vehInput, distance, cost: Math.round(sc.volume * cps), avgTat, avgTP: +avgTP.toFixed(1),
        routeMatch: ri(matchBand[0], matchBand[1]), flags, dcCount: sc.dcCount, volume: sc.volume };
    };
    scs.forEach((sc, sci) => {
      const baseCps = rf(2.35, 3.05);
      // Base cycle: each SC is triggered once per HW value (the planner's first sweep). runNo is the
      // sequential trigger order within this SC for the cycle.
      let runNo = 0;
      HW.forEach((hw) => { runNo++; runs.push(mkRun(sc, hw, baseCps, runNo)); });
      // §9 R1 — make multi-run demonstrable: the first two SCs were re-triggered during the cycle
      // (e.g. a bad first result → planner re-ran with a different HW). These extra runs appear as
      // additional plan cards under the SAME SC, proving HW is a per-run parameter, not the axis.
      if (sci === 0) { runNo++; runs.push(mkRun(sc, 0.5, baseCps * 0.97, runNo, '-r2')); runNo++; runs.push(mkRun(sc, 1, baseCps * 1.01, runNo, '-r3')); }
      if (sci === 1) { runNo++; runs.push(mkRun(sc, 0, baseCps * 0.95, runNo, '-r2')); }
    });
    // §P3.3 — guarantee ≥1 Completed run shows <100% coverage so RED coverage indicator is demonstrable
    const demoCovRun = runs.find(r => r.status === 'Completed' && r.coverage >= 0.98);
    if (demoCovRun) {
      demoCovRun.coverage = 0.946;
      const _gapDCs = Math.round((1 - 0.946) * demoCovRun.dcCount);
      const _ci = demoCovRun.flags.findIndex(f => f.t && f.t.startsWith('Coverage gap'));
      if (_ci >= 0) demoCovRun.flags[_ci].t = 'Coverage gap — ' + _gapDCs + ' DCs unserved';
      else demoCovRun.flags.push({ t: 'Coverage gap — ' + _gapDCs + ' DCs unserved', sev: 'danger' });
    }
    let inProg = 41, planned = 19;
    for (let i = runs.length - 1; i >= 0 && (inProg > 0 || planned > 0); i--) {
      if (planned > 0) { runs[i].status = 'Planned'; planned--; }
      else if (inProg > 0) { runs[i].status = 'In-Progress'; runs[i].progress = ri(15, 85); inProg--; }
    }

    const statusPlan = [];
    for (let i = 0; i < 18; i++) statusPlan.push('Pushed');
    for (let i = 0; i < 12; i++) statusPlan.push('In Alignment');
    for (let i = 0; i < 4; i++) statusPlan.push('Acknowledged');
    for (let i = 0; i < 7; i++) statusPlan.push('Finalised');

    const REV = ['Aarti N.','Rahul S.','Imran K.','Deepa R.','Suresh M.','Neha T.','Vivek P.','Karthik V.','Pooja G.','Sandeep L.','Megha B.'];
    const plans = [];
    scs.slice(0, 41).forEach((sc, i) => {
      const status = statusPlan[i];
      const hwChoice = pick([0.5, 0.5, 0.5, 1, 0]);
      const run = runs.find(r => r.scCode === sc.code && r.hw === hwChoice) || runs.find(r => r.scCode === sc.code);
      const rowCount = Math.min(Math.max(run.routes, 6), 13);
      const rows = [];
      for (let j = 0; j < rowCount; j++) {
        const veh = pick([VEH[0], VEH[1], VEH[1], VEH[2], VEH[2], VEH[3]]);
        const tp = ri(2, veh.tp + (R() < 0.16 ? 1 : 0));
        const dcs = [];
        for (let k = 0; k < tp; k++) dcs.push(sc.cityCode + ri(101, 989));
        let ops = 'Pending', planner = null, fb = null, proposedBy = null;
        if (status !== 'Pushed') {
          const r = R();
          ops = r < 0.7 ? 'Aligned' : 'Needs Change';
          if (ops !== 'Aligned') {
            fb = { cells: {}, remark: pick(['DC location looks off vs ground truth','Vehicle infeasible at this DC cluster','Route splits the city — please re-cluster','Out-cutoff too tight for NLH landing','TAT not achievable during monsoon']) };
            if (R() < 0.6) fb.cells.touchpoint = { from: tp, to: Math.max(2, tp - 1) };
            if (R() < 0.5) fb.cells.vehicleType = { from: veh.name, to: pick(VEH).name };
            if (R() < 0.4) fb.cells.roundTripDistance = { from: ri(60, 360), to: ri(60, 360) };
            // §10 O2 — multi-reviewer visibility: attribute each proposed change to the reviewer who
            // raised it, so a second reviewer (and the planner) sees "Change proposed by <name>".
            proposedBy = REV[Math.floor(R() * REV.length)];
          }
          if (status === 'Acknowledged' || status === 'Finalised') planner = ops === 'Aligned' ? 'Accept' : (R() < 0.6 ? 'Accept' : 'Reject');
          else if (status === 'In Alignment') planner = R() < 0.35 ? (R() < 0.5 ? 'Accept' : 'Reject') : null;
        }
        rows.push({ routeCode: sc.cityCode + '-R' + String(j + 1).padStart(2, '0'), veh: veh.name, vehTp: veh.tp, tp, dcs, rtDist: ri(60, 360), breakdownTat: +rf(0.5, 2.6).toFixed(1), outCutoff: pick(['22:30','23:00','23:30','00:15','01:00']), oLat: sc.lat, oLng: sc.lng, volume: Math.round(run.volume / rowCount * rf(0.6, 1.4)), util: +rf(0.42, 0.95).toFixed(2), cps: +(run.cps * rf(0.9, 1.12)).toFixed(2), ops, planner, fb, proposedBy });
      }
      const rn = [REV[Math.floor(R() * REV.length)], REV[Math.floor(R() * REV.length)]];
      plans.push({ id: 'PL-' + sc.code, name: sc.code + ' · ' + sc.name + ' RLH', scCode: sc.code, scName: sc.name, zone: sc.zone, hw: hwChoice, status, rows, pushedBy: PLANNERS[i % PLANNERS.length], sentDate: '0' + ri(5, 9) + ' Jul', sendBack: (status === 'In Alignment' && R() < 0.3) ? 1 : 0, feedbackReceived: status !== 'Pushed', allDecided: rows.every(r => r.planner), reviewerNames: rn, metrics: { routes: run.routes, vehicles: run.vehicles, distance: run.distance, cps: run.cps, coverage: run.coverage, util: run.util, avgTat: run.avgTat, cost: run.cost } });
    });
    let ack = 4;
    plans.forEach(p => { if (p.status === 'In Alignment' && ack > 0) { p.rows.forEach(r => { if (!r.planner) r.planner = 'Accept'; }); p.allDecided = true; ack--; } });

    // §10 O2 — seed a demonstrable multi-reviewer case. The FIRST Pushed plan (assigned to the current
    // Ops-Lead persona, Rahul Sharma) already has a change PROPOSED BY a co-reviewer, Ravi Kumar, on
    // one row. A second Ops Lead opening this plan — and the planner once feedback is in — both see
    // "Change proposed by Ravi Kumar" rather than a blank slate. Deterministic so the demo is stable.
    const demoPushed = plans.find(p => p.status === 'Pushed');
    if (demoPushed) {
      demoPushed.reviewerNames = ['Ravi Kumar', 'Rahul Sharma'];
      const dr = demoPushed.rows[0];
      dr.ops = 'Needs Change';
      dr.proposedBy = 'Ravi Kumar';
      dr.fb = { cells: { touchpoint: { from: dr.tp, to: Math.max(2, dr.tp - 1) }, vehicleType: { from: dr.veh, to: VEH[1].name } }, remark: 'Route splits the city — please re-cluster the southern DCs', by: 'Ravi Kumar' };
    }
    // Mirror the Ravi Kumar attribution on the FIRST In-Alignment plan so the planner's feedback view
    // also shows "Proposed by Ravi Kumar" on a real flagged row (O2 visible from both sides).
    const demoInAlign = plans.find(p => p.status === 'In Alignment');
    if (demoInAlign) {
      if (demoInAlign.reviewerNames.indexOf('Ravi Kumar') < 0) demoInAlign.reviewerNames = ['Ravi Kumar', demoInAlign.reviewerNames[0] || 'Rahul Sharma'];
      const fr = demoInAlign.rows.find(r => r.ops === 'Needs Change') || demoInAlign.rows[0];
      if (!fr.fb) fr.fb = { cells: {}, remark: 'DC location looks off vs ground truth' };
      fr.ops = 'Needs Change';
      fr.proposedBy = 'Ravi Kumar';
      fr.fb.by = 'Ravi Kumar';
      // seed per-DC changes so the planner's per-DC accept/reject is demonstrable (2026-07-03)
      if (fr.dcs && fr.dcs.length) { fr.fb.dcCells = {}; fr.fb.dcCells[fr.dcs[0]] = { tp: '2' }; if (fr.dcs.length > 1) fr.fb.dcCells[fr.dcs[1]] = { lat: (fr.oLat + 0.02).toFixed(4), lng: (fr.oLng - 0.01).toFixed(4) }; fr.fb.dcCount = Object.keys(fr.fb.dcCells).length; }
    }

    const autodml = [
      { key: 'inactive', label: 'Link active but node is inactive', count: 14, sev: 'warning' },
      { key: 'zerocap', label: 'Link active but LMDC has zero capacity', count: 6, sev: 'danger' },
      { key: 'multi', label: 'LMDC mapped to more than one SC', count: 9, sev: 'warning' },
    ];
    const dcCode = (sc, i) => sc.cityCode + '-' + (300 + i);
    const autodmlDetails = {
      inactive: scs.slice(0, 14).map((sc, i) => ({ link: sc.code + ' \u2192 ' + dcCode(sc, i), detail: 'LMDC node flagged inactive in AutoDML', zone: sc.zone })),
      zerocap: scs.slice(6, 12).map((sc, i) => ({ link: sc.code + ' \u2192 ' + dcCode(sc, i + 20), detail: 'LMDC sort / handling capacity = 0', zone: sc.zone })),
      multi: scs.slice(2, 11).map((sc, i) => ({ link: dcCode(sc, i + 40) + ' \u2194 ' + sc.code + ' + ' + scs[(i + 25) % scs.length].code, detail: 'DC mapped to two SCs', zone: sc.zone })),
    };
    const volumeFiles = [
      { name: 'July 2026 \u00b7 30L Base', type: 'LMDC Landing', rows: 11432, vol: 3010000, date: '10 Jul \u00b7 09:12', by: 'Pranita Sapkal', validated: true, errorCount: 0, active: true },
      { name: 'July 2026 \u00b7 Sale Peak', type: 'LMDC Landing', rows: 11480, vol: 3520000, date: '10 Jul \u00b7 09:40', by: 'Pranita Sapkal', validated: true, errorCount: 0 },
      { name: 'July 2026 \u00b7 35L Mid', type: 'LMDC Landing', rows: 11450, vol: 3290000, date: '10 Jul \u00b7 10:05', by: 'Komal Rao', validated: true, errorCount: 0 },
      { name: 'June 2026 \u00b7 Finalised (carry)', type: 'LMDC Landing', rows: 11120, vol: 2980000, date: '08 Jun \u00b7 18:22', by: 'Komal Rao', validated: false, errorCount: 4, errorRows: [{ row: 42, msg: 'Missing Planned Volume' }, { row: 88, msg: 'LMDC Code blank' }, { row: 213, msg: 'Volume = 0 (must be > 0)' }, { row: 407, msg: 'Duplicate LMDC Code' }] },
      { name: 'July 2026 \u00b7 FMSC Manifest', type: 'FMSC Manifestation', rows: 9800, vol: 0, date: '10 Jul \u00b7 08:50', by: 'Dixan Mehta', validated: false, errorCount: 6, errorRows: [{ row: 12, msg: 'FMSC Code blank' }, { row: 55, msg: 'Planned Volume missing' }, { row: 61, msg: 'Duplicate FMSC Code' }, { row: 88, msg: 'Volume = 0 (must be > 0)' }, { row: 140, msg: 'Invalid FMSC Code format' }, { row: 203, msg: 'Planned Volume not a number' }] },
      { name: 'July 2026 \u00b7 LMSC Manifest', type: 'LMSC Landing', rows: 11432, vol: 0, date: '10 Jul \u00b7 09:12', by: 'Shashvat Jain', validated: true, errorCount: 0, active: true },
    ];
    const nodeAdditions = [
      { dc: 'BLR-742', name: 'Whitefield Ext', sc: 'BLRS', zone: 'South', cap: 8000, mapped: true },
      { dc: 'DEL-913', name: 'Dwarka Sec-29', sc: 'DELS', zone: 'North', cap: 9500, mapped: true },
      { dc: 'PNQ-388', name: 'Hinjewadi Phase 4', sc: '', zone: 'West', cap: 7000, mapped: false },
      { dc: 'HYD-551', name: 'Kompally North', sc: 'HYDS', zone: 'South', cap: 6500, mapped: true },
      { dc: 'CCU-204', name: 'Rajarhat NewTown', sc: '', zone: 'East', cap: 5800, mapped: false },
    ];
    const nodeClosures = [
      { dc: 'MAA-118', name: 'Tambaram Old', sc: 'MAAS', zone: 'South', reason: 'Merged into MAA-220' },
      { dc: 'AMD-077', name: 'Maninagar', sc: 'AMDS', zone: 'West', reason: 'Low volume \u2014 consolidated' },
    ];
    const migrations = [
      { dc: 'JAI-410', name: 'Vaishali Nagar', from: 'JAIS', to: 'JAI2', zone: 'North' },
      { dc: 'IDR-233', name: 'Vijay Nagar', from: 'IDRS', to: 'BHOS', zone: 'Central' },
      { dc: 'NAG-090', name: 'Wardha Road', from: 'NAGS', to: 'NAG2', zone: 'West' },
    ];
    // Unified node changes list for the redesigned Additions/Closures/Migrations table (fix 1.6).
    // Columns: LMSC Code \u00b7 LMDC Code \u00b7 Node Flag \u00b7 LMDC Latitude \u00b7 LMDC Longitude
    const nodeChangesUnified = [
      { lmscCode: 'BLRS', lmdcCode: 'BLR-742', flag: 'Addition', lat: '12.9754', lng: '77.7204' },
      { lmscCode: 'DELS', lmdcCode: 'DEL-913', flag: 'Addition', lat: '28.5921', lng: '77.0688' },
      { lmscCode: 'PNQS', lmdcCode: 'PNQ-388', flag: 'Addition', lat: '18.5904', lng: '73.7382' },
      { lmscCode: 'HYDS', lmdcCode: 'HYD-551', flag: 'Addition', lat: '17.5494', lng: '78.4898' },
      { lmscCode: 'CCUS', lmdcCode: 'CCU-204', flag: 'Addition', lat: '22.5958', lng: '88.4885' },
      { lmscCode: 'MAAS', lmdcCode: 'MAA-118', flag: 'Closure',  lat: '12.9259', lng: '80.0991' },
      { lmscCode: 'AMDS', lmdcCode: 'AMD-077', flag: 'Closure',  lat: '23.0124', lng: '72.5876' },
      { lmscCode: 'JAI2', lmdcCode: 'JAI-410', flag: 'Migration', lat: '26.9124', lng: '75.8001' },
      { lmscCode: 'BHOS', lmdcCode: 'IDR-233', flag: 'Migration', lat: '22.7196', lng: '75.8577' },
      { lmscCode: 'NAG2', lmdcCode: 'NAG-090', flag: 'Migration', lat: '21.0745', lng: '79.0888' },
    ];

    const autodmlNodes = [
      ...autodmlDetails.inactive.map(r => { const p = r.link.split(' → '); return { lmsc: p[0] || '', lmdc: p[1] || r.link, zone: r.zone, issue: 'Link active, node inactive', sev: 'danger', sevBg: '#FBEAEA', sevFg: '#D14B4B', sevLabel: 'Error' }; }),
      ...autodmlDetails.zerocap.map(r => { const p = r.link.split(' → '); return { lmsc: p[0] || '', lmdc: p[1] || r.link, zone: r.zone, issue: 'Zero capacity', sev: 'danger', sevBg: '#FBEAEA', sevFg: '#D14B4B', sevLabel: 'Error' }; }),
      ...autodmlDetails.multi.map(r => { const p = r.link.split(' ↔ '); return { lmsc: (p[1] || '').trim(), lmdc: p[0] || r.link, zone: r.zone, issue: 'Multi-SC mapping', sev: 'warning', sevBg: '#FBF1DF', sevFg: '#C77B00', sevLabel: 'Warning' }; }),
    ];

    // SC Vehicle Availability — one row per vehicle type per SC (real BLRS-style SCs).
    // Generated for the first 6 SCs so the masters tab shows realistic per-SC variety.
    // B1 — vehicle types, capacities, distance limits and TP limits ALL derive from the canonical
    // VEH master (the same set Creation / Map / Ops mix use). The ONLY per-SC overrides are the
    // vehicle COUNT and the Zone-Feasibility (Both / Local / Non-Local).
    const vehDist = (name) => { const v = VEH.find(x => x.name === name); return v ? v.dist : 600; };
    const ZFEAS = ['Both', 'Local', 'Non-Local'];
    const scVehAvail = scs.slice(0, 6).map((sc, scIdx) => {
      const nTypes = scIdx === 0 ? ri(4, 5) : ri(2, 3);
      const rows = [];
      const used = {};
      for (let k = 0; k < nTypes; k++) {
        let vIdx = Math.floor(R() * VEH.length);
        let guard2 = 0;
        while (used[vIdx] && guard2 < 8) { vIdx = Math.floor(R() * VEH.length); guard2++; }
        used[vIdx] = true;
        const v = VEH[vIdx];
        rows.push({
          vehicleType: v.name,
          capacity: v.cap,                                 // canonical default capacity from VEH master
          distanceLimit: vehDist(v.name) + ' km',          // canonical distance limit (same scale as Vehicle Master)
          vehicleCount: ri(2, 6),                          // per-SC override
          tpLimit: v.tp,                                   // canonical TP limit (ACE 4 · others 7)
          zoneFeas: ZFEAS[Math.floor(R() * ZFEAS.length)], // per-SC override
        });
      }
      return { code: sc.code, name: sc.name + ' LMSC', zone: sc.zone, rows };
    });
    return { scs, runs, plans, autodml, autodmlDetails, autodmlNodes, volumeFiles, nodeAdditions, nodeClosures, migrations, nodeChangesUnified, scVehAvail, VEH, totals: { dcTotal: scs.reduce((a, b) => a + b.dcCount, 0), volTotal: scs.reduce((a, b) => a + b.volume, 0) } };
  }

  showToast(msg, dot, undoFn) { clearTimeout(this._t); this.setState({ toast: { msg, dot: dot || '#2F4FC6', undo: undoFn || null } }); this._t = setTimeout(() => this.setState({ toast: null }), undoFn ? 5200 : 3500); }
  runUndo() { const t = this.state.toast; clearTimeout(this._t); this.setState({ toast: null }); if (t && t.undo) t.undo(); }
  // C8a — entering Creation always starts at step 1 so re-entry never resumes mid-wizard.
  go(view) { if (view === 'creation' && this.state.view !== 'creation') this.setState({ view, creationStep: 1, fixReturnStep: null, focusSC: null, creationView: 'wizard' }); else this.setState({ view }); }
  setPersona(p) { this.setState({ persona: p, view: p === 'ops' ? 'align' : 'inputs' }); }
  comingSoon(label) { this.showToast((label || 'This action') + ' — coming soon', '#C77B00'); }
  // Reusable table pager. PAGE SIZE = 10. Given the full post-filter list, the raw page from state,
  // and the state key to write, returns the current page's rows + the footer control model.
  // showPager is true only when the list has > 10 rows. Page is clamped to [1, totalPages].
  pager(items, rawPage, key) {
    const SIZE = 18;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / SIZE));
    const page = Math.min(Math.max(1, rawPage || 1), totalPages);
    const start = (page - 1) * SIZE;
    const end = Math.min(start + SIZE, total);
    const pageRows = items.slice(start, end);
    const goto = (n) => this.setState({ [key]: Math.min(Math.max(1, n), totalPages) });
    // Visible page numbers: show all for <= 8 pages; otherwise first + last + a window around current, with gaps.
    let nums;
    if (totalPages <= 8) { nums = []; for (let i = 1; i <= totalPages; i++) nums.push(i); }
    else {
      const set = {};
      [1, 2, totalPages - 1, totalPages, page - 1, page, page + 1].forEach(n => { if (n >= 1 && n <= totalPages) set[n] = true; });
      nums = Object.keys(set).map(Number).sort((a, b) => a - b);
    }
    const pageButtons = [];
    let prev = 0;
    nums.forEach(n => {
      if (prev && n - prev > 1) pageButtons.push({ gap: true, notGap: false, n: '…', active: false, color: '#8E96A3', weight: '500' });
      prev = n;
      const active = n === page;
      pageButtons.push({ gap: false, notGap: true, n: n, active: active,
        color: active ? '#003F98' : '#5A5E66', weight: active ? '700' : '500', onClick: () => goto(n) });
    });
    const hasPrev = page > 1, hasNext = page < totalPages;
    return {
      showPager: total > SIZE, pageRows: pageRows, pageButtons: pageButtons,
      page: page, totalPages: totalPages,
      hasPrev: hasPrev, hasNext: hasNext,
      prevCursor: hasPrev ? 'pointer' : 'not-allowed', prevOpacity: hasPrev ? '1' : '0.4',
      nextCursor: hasNext ? 'pointer' : 'not-allowed', nextOpacity: hasNext ? '1' : '0.4',
      onPrev: () => goto(page - 1), onNext: () => goto(page + 1),
      pageLabel: SIZE + ' items / page', rangeLabel: total ? ('Showing ' + (start + 1) + '–' + end + ' of ' + total) : 'No rows' };
  }
  addScVals() {
    const st = this.state;
    const f = st.addScForm || {};
    const set = (k) => (e) => { const v = e && e.target ? e.target.value : e; const nf = Object.assign({}, this.state.addScForm); nf[k] = v; this.setState({ addScForm: nf }); };
    const opt = (arr) => arr.map(x => ({ value: x, label: x }));
    const txt = (key, label, req, ph) => ({ key: key, label: label, req: !!req, ph: ph || '', isText: true, isSelect: false, isTime: false, value: f[key] || '', onInput: set(key) });
    const sel = (key, label, req, options) => ({ key: key, label: label, req: !!req, ph: '', isText: false, isSelect: true, isTime: false, value: f[key] || options[0].value, options: options, onInput: set(key) });
    const tm = (key, label, dflt) => ({ key: key, label: label, req: false, ph: '', isText: false, isSelect: false, isTime: true, value: f[key] || dflt, onInput: set(key) });
    const addScMain = [
      txt('code', 'SC Code', true, 'e.g. BLRS'),
      txt('name', 'SC Name', false, 'e.g. Bengaluru'),
      txt('city', 'SC City, State', false, 'e.g. Bengaluru, KA'),
      sel('type', 'SC Type', true, opt(['LMSC', 'FMSC', 'Hybrid'])),
      sel('zone', 'Zone', true, opt(['North', 'South', 'East', 'West', 'Central'])),
      txt('volCap', 'Volume Capacity', true, 'shipments / day'),
      txt('sortCap', 'Sort Capacity', true, 'shipments / day'),
      txt('nlhDocks', 'NLH Docks', true, ''),
      txt('rlhDocks', 'RLH Docks', true, ''),
      txt('localTp', 'Local TP Limit', true, ''),
      txt('nonLocalTp', 'Non-Local TP Limit', true, ''),
      tm('open', 'SC Opening Time', '06:00'),
      tm('close', 'SC Closing Time', '22:00'),
    ];
    const contacts = [['opsZh', 'SC Ops ZH'], ['lhOpsZh', 'SC-LH Ops ZH'], ['opsCh', 'SC Ops CH'], ['lhOpsCh', 'SC-LH Ops CH'], ['opsAm1', 'SC Ops AM-1'], ['lhOpsAm1', 'SC-LH Ops AM-1'], ['opsAm2', 'SC Ops AM-2'], ['lhOpsAm2', 'SC-LH Ops AM-2']];
    const addScContacts = contacts.map(c => ({ key: c[0], label: c[1], value: f[c[0]] || '', ph: 'name@meesho.com', onInput: set(c[0]) }));
    const editing = !!st.addScEditCode;
    return { addScOpen: !!st.addScOpen, addScMain: addScMain, addScContacts: addScContacts, addScTitle: editing ? ('Edit Sort Centre · ' + st.addScEditCode) : 'Add Sort Centre', addScSubmitLabel: editing ? 'Save changes' : 'Add SC', closeAddSc: () => this.setState({ addScOpen: false, addScEditCode: null }), submitAddSc: () => this.submitAddSc() };
  }
  // C10 — open the SC editor pre-filled from an existing SC (real inline-equivalent edit, not a dead control).
  openScEdit(code) {
    const sc = (this.state.data.scs || []).concat(this.state.addedScs || []).find(s => s.code === code);
    if (!sc) { this.comingSoon('Edit SC'); return; }
    const pl = sc.pocs || [];
    const form = { code: sc.code, name: sc.name, city: (sc.name || '') + (sc.zone ? ', ' + sc.zone : ''), type: 'LMSC', zone: sc.zone || 'South', volCap: String(sc.volCap || ''), sortCap: String(sc.sortCap || ''), nlhDocks: String(sc.docks || ''), rlhDocks: '0', localTp: '5', nonLocalTp: '3', open: '06:00', close: '22:00', opsZh: pl[0] || '', opsCh: pl[1] || '', opsAm1: pl[2] || '', opsAm2: pl[3] || '' };
    this.setState({ addScOpen: true, addScEditCode: code, addScForm: form, pocOpenRow: null });
  }
  // C12 — functional INLINE edit for SC Vehicle Availability: per-field overlay stored as
  // { cnt, tp, zf } objects keyed by "scCode|vehType". setAvailField is the generic writer;
  // setAvailRow is kept as a thin wrapper for backward compat (only caller is onCntInput).
  setAvailField(scCode, vehType, field, value) {
    const key = scCode + '|' + vehType;
    const ov = Object.assign({}, this.state.availEdits || {});
    const prev = (typeof ov[key] === 'object' && ov[key] !== null) ? ov[key] : {};
    ov[key] = Object.assign({}, prev, { [field]: value });
    this.setState({ availEdits: ov });
  }
  setAvailRow(scCode, vehType, raw) {
    const n = parseInt(String(raw == null ? '' : raw).replace(/[^0-9]/g, ''), 10);
    this.setAvailField(scCode, vehType, 'cnt', (isNaN(n) || n < 0) ? 0 : n);
  }
  submitAddSc() {
    const st = this.state; const f = st.addScForm || {};
    const code = (f.code || '').trim().toUpperCase();
    if (!code) { this.showToast('SC Code is required', '#C77B00'); return; }
    const num = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
    const pocs = ['opsZh', 'opsCh', 'opsAm1', 'opsAm2'].map(k => (f[k] || '').trim()).filter(Boolean);
    if (st.addScEditCode) {
      // Edit mode — apply changes to a session-edited overlay so the existing SC row reflects them.
      const edits = Object.assign({}, st.scEdits || {});
      edits[st.addScEditCode] = { name: (f.name || '').trim() || code, zone: f.zone || 'South', sortCap: num(f.sortCap), volCap: num(f.volCap), docks: num(f.nlhDocks) + num(f.rlhDocks), pocs: pocs.length ? pocs : ['—'] };
      // also patch any session-added SC in place
      const addedScs = (st.addedScs || []).map(s => s.code === st.addScEditCode ? Object.assign({}, s, edits[st.addScEditCode]) : s);
      this.setState({ scEdits: edits, addedScs: addedScs, addScOpen: false, addScEditCode: null, addScForm: {} });
      this.showToast('Sort Centre ' + st.addScEditCode + ' updated', '#128A3E');
      return;
    }
    const sc = { code: code, name: (f.name || '').trim() || code, cityCode: code.replace(/[^A-Z]/g, '').slice(0, 3) || code, zone: f.zone || 'South', dcCount: 0, volume: num(f.volCap), sortCap: num(f.sortCap), volCap: num(f.volCap), docks: num(f.nlhDocks) + num(f.rlhDocks), lat: 0, lng: 0, hasRef: false, farDist: 0, zeroVolDc: 0, missVolDc: 0, pocs: pocs.length ? pocs : ['—'] };
    this.setState({ addedScs: [sc].concat(st.addedScs || []), addScOpen: false, addScForm: {}, inputsZone: 'All', inputsSearch: '' });
    this.showToast('Sort Centre ' + code + ' added to the master', '#128A3E');
  }
  submitAddVeh() {
    const st = this.state; const f = st.addVehForm || {};
    const name = (f.vtype || '').trim();
    const hardCap = String(f.hardCap == null ? '' : f.hardCap).trim();
    if (!name || !hardCap) { this.showToast('Vehicle Type and TP Limit (Hard Cap) are required', '#C77B00'); return; }
    const num = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? '' : n; };
    // US4 — RLH-feasible vehicle types are hard-capped at 7 touch points.
    if ((f.feas || []).indexOf('RLH') >= 0 && num(hardCap) > 7) { this.showToast('RLH-feasible vehicles are capped at 7 touch points — lower the TP limit or remove RLH from feasibility.', '#C77B00'); return; }
    // Edit mode — update the type's params via a vehEdits override keyed by the original name.
    if (st.addVehEditName) {
      const ve = Object.assign({}, st.vehEdits || {});
      ve[st.addVehEditName] = { capacity: num(f.capacity), dist: num(f.dist), tp: num(hardCap), localTp: num(f.localTp), nonLocalTp: num(f.nonLocalTp), feas: (f.feas || []).slice() };
      this.setState({ vehEdits: ve, addVehOpen: false, addVehForm: {}, addVehEditName: null });
      this.showToast(st.addVehEditName + ' updated in vehicle master', '#128A3E');
      return;
    }
    const veh = { name: name, capacity: num(f.capacity), dist: num(f.dist), tp: num(hardCap), localTp: num(f.localTp), nonLocalTp: num(f.nonLocalTp), feas: (f.feas || []).slice() };
    this.setState({ addedVehTypes: (st.addedVehTypes || []).concat([veh]), addVehOpen: false, addVehForm: {} });
    this.showToast(name + ' added to vehicle master', '#128A3E');
  }
  downloadText(name, text) { try { const blob = new Blob([text], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); } catch (e) {} }
  downloadCsvFile() { const d = this.state.data; const head = 'SC Code,Name,Zone,Sort Capacity,Volume Capacity,RLH Docks,LMDC Count\n'; const body = d.scs.map(s => [s.code, s.name, s.zone, s.sortCap, s.volCap, s.docks, s.dcCount].join(',')).join('\n'); this.downloadText('network-design-export.csv', head + body); this.showToast('CSV downloaded · ' + d.scs.length + ' rows', '#128A3E'); }
  // B. Design-Creation Step-1 CSV — selected SCs with node count, total volume, and the volume-gap
  // breakdown (zero / missing) so the planner can validate inputs offline before triggering.
  downloadSelectionCsv() {
    const st = this.state, d = st.data; const dropped = st.droppedDcBySC || {};
    const sel = (st.selectedSCs || []).map(c => d.scs.find(s => s.code === c)).filter(Boolean);
    if (!sel.length) { this.showToast('Select at least one SC to download', '#C77B00'); return; }
    const head = 'SC Code,Name,Zone,LMDC Count,Total Volume,Zero-Volume DCs,Missing-Volume DCs,Dropped From Run\n';
    const body = sel.map(s => { const drops = (dropped[s.code] || []); const dropsBelowZero = drops.filter(i => i < (s.zeroVolDc || 0)).length; const dropsBeyondZero = Math.max(0, drops.length - dropsBelowZero); const zero = Math.max(0, (s.zeroVolDc || 0) - dropsBelowZero); const miss = Math.max(0, (s.missVolDc || 0) - dropsBeyondZero); return [s.code, s.name, s.zone, s.dcCount, s.volume, zero, miss, drops.length].join(','); }).join('\n');
    this.downloadText('design-creation-selection.csv', head + body + '\n'); this.showToast('CSV downloaded · ' + sel.length + ' SCs', '#128A3E');
  }
  // C2 — download a previously uploaded volume file (physical reference). Emits a representative
  // 2-column CSV (Code + Planned Volume) named after the stored file.
  downloadVolumeFile(f) { const code = f.type.indexOf('LMDC') >= 0 ? 'LMDC' : f.type.indexOf('LMSC') >= 0 ? 'LMSC' : f.type.indexOf('FMSC') >= 0 ? 'FMSC' : 'FM Hub'; const head = code + ' Code,Planned Volume\n'; const rows = []; for (let i = 1; i <= Math.min(8, f.rows); i++) { rows.push(code.replace(/[^A-Z]/g, '').slice(0, 4) + '-' + (100 + i) + ',' + Math.round((f.vol || 600000) / Math.max(1, f.rows) * (0.7 + (i % 5) * 0.12))); } const slug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); this.downloadText((slug || 'volume_file') + '.csv', head + rows.join('\n') + '\n'); this.showToast('Downloaded ' + f.name + ' · uploaded by ' + (f.by || 'team'), '#128A3E'); }
  // AutoDML is a read-only input view (no download / no analytical views — full views live on Metabase/Superset).
  // C7 — each volume card downloads a template with ITS OWN columns, not the SC-master CSV.
  downloadTemplate(name, cols) { const headers = (cols || []).map(c => c.k); const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); this.downloadText((slug || 'template') + '_template.csv', headers.join(',') + '\n'); this.showToast(name + ' template downloaded · ' + headers.length + ' columns', '#128A3E'); }
  // Simulated CSV validation for volume uploads (no real backend to validate against
  // yet -- see context.md "Open items"). Deterministic per file (same name+size always
  // gives the same result) so a demo can be repeated reliably, with two escape hatches
  // for testing: name the file with "err"/"fail"/"bad"/"invalid"/"reject" in it to force
  // a failure, or "ok"/"good"/"valid"/"clean"/"correct"/"fixed" to force a pass.
  validateVolCsv(file, type) {
    const name = (file && file.name || '').toLowerCase();
    let seed = 0;
    for (let i = 0; i < name.length; i++) seed = (seed * 31 + name.charCodeAt(i)) & 0x7fffffff;
    seed = (seed + (file && file.size || 0) * 7 + 1) & 0x7fffffff;
    const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const forceFail = /err|fail|bad|invalid|reject/.test(name);
    const forcePass = /\bok\b|good|valid|clean|correct|fixed/.test(name);
    const fails = forceFail || (!forcePass && R() < 0.3);
    const rows = 10800 + Math.floor(R() * 900);
    const vol = type === 'LMDC Landing' ? 2900000 + Math.floor(R() * 600000) : 0;
    if (!fails) return { validated: true, errorCount: 0, errorRows: [], rows, vol };
    const POOL = ['Missing Planned Volume', 'Code column blank', 'Volume = 0 (must be > 0)', 'Duplicate code', 'Invalid code format', 'Planned Volume not a number', 'Zone column blank', 'Row has a trailing delimiter', 'Code does not match AutoDML'];
    const n = 2 + Math.floor(R() * 5);
    const errorRows = [];
    let rowNo = 0;
    for (let i = 0; i < n; i++) { rowNo += 3 + Math.floor(R() * 90); errorRows.push({ row: rowNo, msg: POOL[Math.floor(R() * POOL.length)] }); }
    return { validated: false, errorCount: n, errorRows, rows, vol };
  }
  downloadNodeCsv(rows) { rows = rows || []; const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; const head = 'LMSC,LMDC Code,LMDC Name,Zone,Capacity,Status,Flag\n'; const body = rows.map(r => [r.lmsc, r.lmdc, r.lmdcName, r.zone, r.capStr, r.statusLabel, r.flagMsg].map(esc).join(',')).join('\n'); this.downloadText('autodml-node-view.csv', head + body + '\n'); this.showToast('AutoDML node view downloaded · ' + rows.length + ' node' + (rows.length === 1 ? '' : 's'), '#128A3E'); }
  pickFile(reject) { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) { this.showToast('Upload cancelled', '#5A5E66'); return; } if (reject) this.showToast('Validated ' + f.name + ' · 7 rows rejected (already in AutoDML)', '#C77B00'); else this.showToast('Validated ' + f.name + ' — ready to submit', '#128A3E'); }; inp.click(); }
  ingestRlhPlan() {
    const n = (this.state.ingestionCounter || 0) + 1;
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const date = String(now.getDate()).padStart(2, '0') + ' ' + months[now.getMonth()] + ' · ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const scs = (this.state.data && this.state.data.scs) || [];
    const scCode = scs.length ? scs[(n - 1) % scs.length].code : 'BLR-S1';
    const rows = 1000 + Math.floor(((n * 1103515245 + 12345) & 0x7fffffff) % 3001);
    const plan = { name: 'RLH-Plan-' + n + '.csv', rows: rows, by: 'Pranita Sapkal', date: date, status: 'Validated', errors: 0, scCode: scCode, runId: 'ING-' + String(n).padStart(3, '0') };
    const plans = [plan].concat(this.state.ingestedPlans || []);
    this.setState({ ingestedPlans: plans, ingestionCounter: n });
    this.showToast('Plan ingested & validated · ' + plan.name, '#128A3E');
  }
  // C6/C7 — single node-changes upload (additions + closures + migrations in one file). OVERRIDE:
  // the latest file fully replaces all prior node-change data. Stamps the "last uploaded by" indicator.
  uploadNodeChanges() { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv'; inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) { this.showToast('Upload cancelled', '#5A5E66'); return; } const now = new Date(); const date = String(now.getDate()).padStart(2, '0') + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' · ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'); this.setState({ nodeChangeBy: 'You (Planner)', nodeChangeDate: date }); this.showToast('6 nodes rejected as they are already part of AutoDML', '#C77B00'); }; inp.click(); }

  componentWillUnmount() { clearInterval(this._q); clearTimeout(this._t); }

  // A1/A3 — single source of truth for the July 2026 cycle dates. Freeze (Acknowledge) = Jul 12.
  // "now" is pinned to the seed cycle (24 Jun 2026) so the demo is deterministic, not a frozen literal.
  cycleDates() {
    const DAY = 86400000;
    const now = new Date(2026, 5, 24);                 // 24 Jun 2026 (cycle reference)
    const freeze = new Date(2026, 6, 12);              // 12 Jul 2026 — Acknowledge / freeze
    const designsDue = new Date(2026, 6, 5);           // 05 Jul 2026
    const finaliseBy = new Date(2026, 6, 15);          // 15 Jul 2026
    const feedbackOpen = new Date(2026, 6, 5);         // feedback window 05–12 Jul
    const daysToFreeze = Math.max(0, Math.ceil((freeze - now) / DAY));
    const daysToFeedbackClose = daysToFreeze;          // feedback closes at freeze
    return { now, freeze, designsDue, finaliseBy, feedbackOpen, daysToFreeze, daysToFeedbackClose };
  }

  // P — status-only run lifecycle (NO percentage; % isn't computable for an async Gurobi solve).
  // Queued/Planned -> In Progress -> Completed. The Queued state is real: only a batch of
  // CONCURRENCY runs are In Progress at once, the rest wait as Queued (relevant at large SC counts).
  triggerRuns(codes) {
    if (!codes || !codes.length) return;
    const CONCURRENCY = NDC_CONCURRENCY;
    // Merge with the existing queue so parallel batches ACCUMULATE (a re-triggered SC resets its own entry).
    // In-Progress slots are (re)assigned across the whole merged set, capped at CONCURRENCY; the rest wait as Queued.
    const _kept = (this.state.runQueue || []).filter(r => codes.indexOf(r.scCode) < 0);
    const _merged = _kept.concat(codes.map(c => ({ scCode: c, status: 'Queued', ticks: 0 })));
    let _active = _merged.filter(r => r.status === 'In Progress').length;
    for (let i = 0; i < _merged.length && _active < CONCURRENCY; i++) { if (_merged[i].status === 'Queued') { _merged[i].status = 'In Progress'; _merged[i].ticks = 0; _active++; } }
    this.setState({ runQueue: _merged, creationStep: 4 });
    clearInterval(this._q);
    this._q = setInterval(() => {
      this.setState(s => {
        let any = false;
        const q = s.runQueue.map(r => Object.assign({}, r));
        // advance In-Progress rows; complete after a deterministic-ish number of ticks
        q.forEach(r => {
          if (r.status === 'In Progress') { r.ticks = (r.ticks || 0) + 1; if (r.ticks >= 4 + (r.scCode.charCodeAt(0) % 4)) r.status = 'Completed'; }
        });
        // promote Queued rows into freed In-Progress slots
        let active = q.filter(r => r.status === 'In Progress').length;
        for (let i = 0; i < q.length && active < CONCURRENCY; i++) { if (q[i].status === 'Queued') { q[i].status = 'In Progress'; q[i].ticks = 0; active++; } }
        any = q.some(r => r.status !== 'Completed');
        if (!any) clearInterval(this._q);
        return { runQueue: q };
      });
    }, 520);
  }

  inputsVals() {
    const st = this.state, d = st.data;
    const fmtInt = (n) => n.toLocaleString('en-IN');
    const fmtL = (n) => (n / 100000).toFixed(1) + 'L';
    const itab = st.inputsTab;
    const remaining = d.autodml.filter(c => !st.resolved[c.key]);
    const inputsTabCount = { volume: 4, nodes: (d.autodmlNodes || []).length, masters: d.scs.length, ingestion: 3 };
    const allResolved = d.autodml.every(c => st.resolved[c.key]);
    // D2 — gate is now consumed only by the in-context AutoDML banner (clean/dirty); the header pill was removed.
    const gate = allResolved
      ? { clean: true, dirty: false }
      : { clean: false, dirty: true };
    // (ss / slotState removed — was only read by the dead volFiles builder above)
    const VF = [
      { name: 'FM Hub Manifestation', desc: 'Planned shipment volumes per FM Hub. FM Hub Code and Planned Volume are mandatory.', oos: true, file: '', cols: [{ k: 'FM Hub Code', v: 'Mandatory · alphanumeric · 3–6 chars' }, { k: 'Planned Volume', v: 'Mandatory · number · must be > 0' }] },
      { name: 'FMSC Manifestation', desc: 'Planned volumes per First-Mile Sort Centre. FMSC Code and Planned Volume are mandatory.', oos: true, file: '', cols: [{ k: 'FMSC Code', v: 'Mandatory · alphanumeric · 3–6 chars' }, { k: 'Planned Volume', v: 'Mandatory · number · must be > 0' }] },
      { name: 'LMSC Landing', desc: 'Expected volumes landing at each Last-Mile Sort Centre. LMSC Code and Planned Volume are mandatory.', file: 'lmsc_landing_jul26.csv', cols: [{ k: 'LMSC Code', v: 'Mandatory · alphanumeric · 3–6 chars' }, { k: 'Planned Volume', v: 'Mandatory · number · must be > 0' }] },
      { name: 'LMDC Landing', desc: 'LMDC-level landing volumes — the RLH route-planning volume file. LMDC Code and Planned Volume are mandatory.', req: true, file: 'lmdc_landing_jul26_30L.csv', cols: [{ k: 'LMDC Code', v: 'Mandatory · alphanumeric · 3–6 chars' }, { k: 'Planned Volume', v: 'Mandatory · number · must be > 0' }] },
    ];
    // All four volume files render as upload cards (FM Hub / FMSC Manifestation are
    // reference inputs; LMDC Landing is the file RLH route planning consumes). Each shows
    // the uploaded file with Replace / Remove, or an Upload button when empty.
    // (local pickFile helper removed — its only caller, volFiles, was dead code superseded by volActiveStrip)
    // volFiles (legacy per-slot card builder) removed — superseded by volActiveStrip.
    // C3 — consolidated volume library filterable by type. Each row carries uploader + timestamp
    // (different people own FM / FMSC / LMDC volumes) and is individually downloadable.
    const volTypeMap = { LMDC: 'LMDC Landing', LMSC: 'LMSC Landing', FMSC: 'FMSC Manifestation', 'FM Hub': 'FM Hub Manifestation' };
    const volTypeFilter = st.volTypeFilter || 'All';
    const volTypeChips = ['All', 'LMDC', 'LMSC', 'FMSC', 'FM Hub'].map(z => ({ label: z, active: z === volTypeFilter, bg: z === volTypeFilter ? '#003F98' : '#fff', fg: z === volTypeFilter ? '#fff' : '#5A5E66', bd: z === volTypeFilter ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ volTypeFilter: z }) }));
    // Active-per-type: one volume file is active per type per cycle (default = seeded active; user can Set active from the library).
    const VSHORT = { 'LMDC Landing': 'LMDC', 'LMSC Landing': 'LMSC', 'FMSC Manifestation': 'FMSC', 'FM Hub Manifestation': 'FM Hub' };
    const volActiveSt = st.volActive || {};
    const volEditsMap = st.volEdits || {};
    // Files uploaded this session (via the strip Upload buttons) merge on top of the seeded library;
    // volEdits overlays corrections from a Replace re-upload onto either an uploaded or seeded row.
    const allVol = (st.uploadedVol || []).concat(d.volumeFiles).map(f => volEditsMap[f.name] ? Object.assign({}, f, volEditsMap[f.name]) : f);
    const pickVolFile = (type) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.csv';
      inp.onchange = (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const nm = 'July 2026 · ' + f.name.replace(/\.[^.]+$/, '');
        const v = this.validateVolCsv(f, type);
        const rec = { name: nm, type: type, rows: v.rows, vol: v.vol, date: 'Just now', by: 'Pranita Sapkal', validated: v.validated, errorCount: v.errorCount, errorRows: v.errorRows, uploaded: true };
        const patch = { uploadedVol: [rec].concat(this.state.uploadedVol || []), volTypeFilter: 'All', volSearch: '' };
        if (v.validated) {
          patch.volActive = Object.assign({}, this.state.volActive || {}, { [type]: nm });
          this.setState(patch);
          this.showToast('Validated ' + nm + ' — added to the library & set active', '#128A3E');
        } else {
          patch.volErrModal = { name: nm, type: type, rows: v.errorRows };
          this.setState(patch);
          this.showToast(v.errorCount + ' row error' + (v.errorCount === 1 ? '' : 's') + ' in ' + nm + ' — fix and re-upload; the active file for this type is unchanged', '#D14B4B');
        }
      };
      inp.click();
    };
    const replaceVolFile = (name, type) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.csv';
      inp.onchange = (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const v = this.validateVolCsv(f, type);
        const edits = Object.assign({}, this.state.volEdits || {});
        edits[name] = { rows: v.rows, vol: v.vol, validated: v.validated, errorCount: v.errorCount, errorRows: v.errorRows, date: 'Just now', by: 'You (Planner)' };
        const patch = { volEdits: edits };
        if (v.validated) { patch.volActive = Object.assign({}, this.state.volActive || {}, { [type]: name }); patch.volErrModal = null; }
        else { patch.volErrModal = { name: name, type: type, rows: v.errorRows }; }
        this.setState(patch);
        this.showToast(v.validated ? (name + ' re-validated — corrections accepted & set active') : (v.errorCount + ' row error' + (v.errorCount === 1 ? '' : 's') + ' still found in ' + name), v.validated ? '#128A3E' : '#D14B4B');
      };
      inp.click();
    };
    const activeNameOf = (type) => {
      if (volActiveSt[type] !== undefined) return volActiveSt[type];
      const fs = allVol.filter(f => f.type === type);
      const seeded = fs.find(f => f.active && f.validated && f.errorCount === 0);
      if (seeded) return seeded.name;
      // No explicit seed marker (or it failed validation) -- fall back to any validated,
      // error-free file for this type. Never fall back to a file with errors: an invalid
      // file must never be shown as "active" (matches the upload-gating rule above).
      const ok = fs.find(f => f.validated && f.errorCount === 0);
      return ok ? ok.name : null;
    };
    // (setVolActive removed — the library "Set active" control it powered was removed; active file is now display-only in volActiveStrip)
    const volActiveStrip = VF.slice().reverse().map(o => {
      const type = o.name;
      const fs = allVol.filter(f => f.type === type);
      const af = fs.find(f => f.name === activeNameOf(type));
      const has = !!af;
      const valid = has && af.validated && af.errorCount === 0;
      return { type: type, short: VSHORT[type] || type, hasActive: has, noActive: !has,
        activeName: has ? af.name : '', fileCount: fs.length,
        statusLabel: has ? (valid ? '✓ Validated' : ('⚠ ' + (af.errorCount || 0) + ' row errors')) : '',
        valColor: valid ? '#128A3E' : '#C77B00', dotColor: has ? (valid ? '#128A3E' : '#C77B00') : '#C3C9D4',
        onTemplate: () => this.downloadTemplate(o.name, o.cols), onUpload: () => pickVolFile(o.name) };
    });
    const vq = (st.volSearch || '').toLowerCase().trim();
    const volumeFiles = allVol
      .filter(f => (volTypeFilter === 'All' || f.type === volTypeMap[volTypeFilter]) && (!vq || f.name.toLowerCase().indexOf(vq) >= 0 || (f.by || '').toLowerCase().indexOf(vq) >= 0))
      .map(f => {
        const hasErrors = !f.validated && f.errorCount > 0;
        const valLabel = hasErrors ? ('⚠ ' + f.errorCount + ' row error' + (f.errorCount === 1 ? '' : 's')) : '✓ Validated';
        const valBg = hasErrors ? '#FBF1DF' : '#E7F4EC';
        const valFg = hasErrors ? '#C77B00' : '#128A3E';
        return {
          name: f.name, type: f.type, rows: fmtInt(f.rows), vol: f.vol ? fmtL(f.vol) : '—', date: f.date, by: f.by || '—',
          valLabel: valLabel, valBg: valBg, valFg: valFg, hasErrors: hasErrors, hasNoErrors: !hasErrors,
          onViewErrors: hasErrors ? (() => this.setState({ volErrModal: { name: f.name, type: f.type, rows: f.errorRows || [] } })) : null,
          downloadCsv: () => this.downloadVolumeFile(f),
          onReplace: () => replaceVolFile(f.name, f.type),
          onDelete: () => this.showToast(f.name + ' deleted from library', '#D14B4B'),
        };
      });
    const volFilesShown = volumeFiles.length, volFilesTotal = allVol.length;
    const q = (st.inputsSearch || '').toLowerCase();
    const zf = st.inputsZone || 'All';
    const zoneChips = ['All', 'North', 'South', 'East', 'West', 'Central'].map(z => ({ label: z, active: z === zf, bg: z === zf ? '#003F98' : '#fff', fg: z === zf ? '#fff' : '#5A5E66', bd: z === zf ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ inputsZone: z, pgScMaster: 1, pgAvail: 1 }) }));
    const nstep = st.nodeStep || 'active';
    const nodeChangeCount = (d.nodeAdditions || []).length + (d.nodeClosures || []).length + (d.migrations || []).length;
    const nodeStepMeta = [['active', 'AutoDML node view', (d.autodmlNodes || []).length, remaining.length > 0, 'Flagged LMSC → LMDC links from AutoDML — resolve before planning.'], ['changes', 'Additions, closures & migrations', nodeChangeCount, nodeChangeCount > 0, 'Node changes this cycle vs the last finalised network.']];
    const nodeSteps = nodeStepMeta.map(s => ({ label: s[1] + ' (' + s[2] + ')', tip: s[4], attention: s[3], active: nstep === s[0], color: nstep === s[0] ? '#003F98' : '#5A5E66', weight: nstep === s[0] ? '700' : '500', bg: nstep === s[0] ? '#fff' : 'transparent', bd: nstep === s[0] ? '#D7DCE5' : 'transparent', onClick: () => this.setState({ nodeStep: s[0] }) }));
    const anFiltered = d.scs.filter(s => (zf === 'All' || s.zone === zf) && (!q || s.code.toLowerCase().indexOf(q) >= 0 || s.name.toLowerCase().indexOf(q) >= 0));
    // AutoDML flagged-link table (matches Vignesh AutoDML Node View). Each d.autodmlNodes row is one
    // flagged LMSC→LMDC link; enrich it with a synthesized LMDC name, capacity, link status, mapped SCs
    // and a colored warning chip, then filter by the click-to-filter tile (nodeWarnFilter) + LMSC dropdown.
    const warnMsgOf = (k) => k === 'zerocap' ? 'Link active, zero capacity' : k === 'multi' ? 'Mapped to >1 SC' : 'Link active, node inactive';
    const DCWORDS = ['Central DC', 'North DC', 'East DC', 'West DC', 'Industrial DC', 'City DC', 'Hub DC', 'Township DC', 'Sector DC', 'Outer DC'];
    const lmdcNameOf = (code, zone) => { let h = 0; for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0; return zone + ' ' + DCWORDS[h % DCWORDS.length]; };
    const subcatOf = (n) => n.issue === 'Zero capacity' ? 'zerocap' : n.issue === 'Multi-SC mapping' ? 'multi' : 'inactive';
    // Full AutoDML node set = flagged links (errors = inactive|zerocap, warning = multi-SC) + synthesized clean nodes,
    // so the table can show clean AND flagged rows and the Show filter / 6-stat summary can break the view down.
    const _flagged = (d.autodmlNodes || []).map((n, i) => {
      const sc = subcatOf(n); const isInactive = sc === 'inactive'; const isZero = sc === 'zerocap';
      const lmdcCap = (isInactive || isZero) ? 0 : 4200 + ((n.lmdc.length * 137 + i * 89) % 36) * 100;
      const lmscCap = 18000 + ((n.lmsc.length * 73 + i * 41) % 20) * 500;
      const lmscActiveLabel = 'Active';
      const lmdcActiveLabel = isInactive ? 'Inactive' : 'Active';
      const sib = (n.lmsc || 'SC').slice(0, 3) + (((i % 7) + 2));
      const mapped = sc === 'multi' ? [n.lmsc, sib] : [n.lmsc];
      return { lmsc: n.lmsc, lmdc: n.lmdc, lmdcName: lmdcNameOf(n.lmdc, n.zone), zone: n.zone,
        cap: lmdcCap, capStr: fmtInt(lmdcCap), capColor: lmdcCap <= 0 ? '#C77B00' : '#14171F', capWeight: lmdcCap <= 0 ? '700' : '400',
        lmscCapStr: fmtInt(lmscCap),
        lmscActiveLabel: lmscActiveLabel, lmscActiveBg: '#E7F4EC', lmscActiveFg: '#128A3E',
        lmdcActiveLabel: lmdcActiveLabel, lmdcActiveBg: isInactive ? '#FBF1DF' : '#E7F4EC', lmdcActiveFg: isInactive ? '#C77B00' : '#128A3E',
        statusLabel: lmdcActiveLabel, statusColor: isInactive ? '#C77B00' : '#128A3E', statusWeight: isInactive ? '700' : '600',
        cat: sc === 'multi' ? 'warnings' : 'errors', subcat: sc, isClean: false, hasFlag: true,
        flagMsg: warnMsgOf(sc), warnMsg: warnMsgOf(sc), flagBg: n.sevBg, flagFg: n.sevFg,
        mappedScs: mapped.map(c => ({ code: c })) };
    });
    const _seenLmsc = []; _flagged.forEach(r => { if (_seenLmsc.indexOf(r.lmsc) < 0) _seenLmsc.push(r.lmsc); });
    const _clean = [];
    _seenLmsc.forEach((lmsc, li) => {
      const zone = (_flagged.find(r => r.lmsc === lmsc) || {}).zone || 'South';
      for (let k = 0; k < 3; k++) {
        const code = (lmsc.replace(/[^A-Z]/g, '').slice(0, 3) || 'DC') + '-' + (101 + li * 7 + k);
        const cap = 600 + ((code.length * 53 + li * 31 + k * 90) % 28) * 50;
        const lmscCap = 18000 + ((lmsc.length * 73 + li * 41) % 20) * 500;
        _clean.push({ lmsc: lmsc, lmdc: code, lmdcName: lmdcNameOf(code, zone), zone: zone,
          cap: cap, capStr: fmtInt(cap), capColor: '#14171F', capWeight: '400',
          lmscCapStr: fmtInt(lmscCap),
          lmscActiveLabel: 'Active', lmscActiveBg: '#E7F4EC', lmscActiveFg: '#128A3E',
          lmdcActiveLabel: 'Active', lmdcActiveBg: '#E7F4EC', lmdcActiveFg: '#128A3E',
          statusLabel: 'Active', statusColor: '#128A3E', statusWeight: '600',
          cat: 'clean', subcat: 'clean', isClean: true, hasFlag: false,
          flagMsg: '—', warnMsg: '', flagBg: 'transparent', flagFg: '#8E96A3',
          mappedScs: [{ code: lmsc }] });
      }
    });
    const nodeRowsAll = _flagged.concat(_clean);
    const nshow = st.nodeShow || 'all';
    const nls = (st.nodeLmscSearch || '').toLowerCase().trim();
    const _scopedFlagged = _flagged.filter(r => !nls || r.lmsc.toLowerCase().indexOf(nls) >= 0 || (r.lmdc || '').toLowerCase().indexOf(nls) >= 0);
    const nodeRows = _scopedFlagged.filter(r => nshow === 'all' || r.subcat === nshow).slice().sort((a, b) => a.lmsc.localeCompare(b.lmsc) || a.lmdc.localeCompare(b.lmdc));
    const nodeShown = nodeRows.length;
    const nodeEmpty = nodeShown === 0;
    // Pagination — slice the post-filter flagged rows to the current page (10/page). nodeShown/nodeEmpty
    // stay on the full filtered count so the count label + empty state reflect the whole result set.
    const autodmlPager = this.pager(nodeRows, st.pgAutodml, 'pgAutodml');
    const _cntSub = (k) => _flagged.filter(r => r.subcat === k).length;
    const _inactiveCnt = _cntSub('inactive'), _zerocapCnt = _cntSub('zerocap'), _multiCnt = _cntSub('multi');
    const _totalFlagged = _flagged.length;
    const links = d.totals.dcTotal;
    const multi = (d.autodml.find(c => c.key === 'multi') || {}).count || 0;
    const lmdcDistinct = Math.max(0, links - multi);
    const nodeStats = [
      { n: fmtInt(links), label: 'Active LMSC–LMDC Links', sub: 'Total active links in network', color: '#14171F' },
      { n: String(d.scs.length), label: 'Active LMSCs', sub: 'Unique sort centres', color: '#14171F' },
      { n: fmtInt(lmdcDistinct), label: 'Active LMDCs', sub: 'Unique delivery centres', color: '#14171F' },
    ];
    const autodmlFilterCards = [
      { key: 'all', label: 'All Warnings', sub: 'All flagged links', count: _totalFlagged },
      { key: 'inactive', label: 'Link Active, Node Inactive', sub: 'Count of links', count: _inactiveCnt },
      { key: 'zerocap', label: 'Link Active, Zero Capacity', sub: 'Count of links', count: _zerocapCnt },
      { key: 'multi', label: 'LMDC Mapped to >1 SC', sub: 'Count of LMDCs', count: _multiCnt },
    ].map(c => {
      const active = nshow === c.key;
      const hasIssue = c.count > 0;
      return { key: c.key, label: c.label, sub: c.sub, count: c.count,
        active, countColor: active ? '#C77B00' : (hasIssue ? '#14171F' : '#8E96A3'),
        bg: active ? '#FBF1DF' : '#fff',
        bd: active ? '#C77B00' : '#E6EBF2',
        dotShow: active && hasIssue,
        onClick: () => this.setState({ nodeShow: c.key, pgAutodml: 1 }) };
    });
    const nodeCountLabel = nodeShown + ' warning rows shown';
    const nodeFilterDirty = nshow !== 'all' || !!nls;
    const clearNodeFilters = () => this.setState({ nodeShow: 'all', nodeLmscSearch: '', pgAutodml: 1 });
    const autodmlCards = d.autodml.map(c => ({ key: c.key, label: c.label, count: c.count, resolved: !!st.resolved[c.key], notResolved: !st.resolved[c.key], open: st.autodmlOpen === c.key, sevLabel: c.sev === 'danger' ? 'Error' : 'Warning', sevBg: st.resolved[c.key] ? '#E7F4EC' : (c.sev === 'danger' ? '#FBEAEA' : '#FBF1DF'), sevFg: st.resolved[c.key] ? '#128A3E' : (c.sev === 'danger' ? '#D14B4B' : '#C77B00'), icon: st.resolved[c.key] ? 'M20 6L9 17l-5-5' : (c.sev === 'danger' ? 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z' : 'M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'), details: (d.autodmlDetails[c.key] || []).map(r => ({ link: r.link, detail: r.detail, zone: r.zone })), onToggle: () => this.setState({ autodmlOpen: st.autodmlOpen === c.key ? null : c.key }), onResolve: () => { const nr = Object.assign({}, st.resolved); nr[c.key] = true; this.setState({ resolved: nr, autodmlOpen: null }); this.showToast(c.label + ' — marked resolved', '#128A3E'); } }));
    const nodeAdditions = d.nodeAdditions.map(n => ({ dc: n.dc, name: n.name, sc: n.sc || '—', zone: n.zone, cap: fmtInt(n.cap), mapped: n.mapped, unmapped: !n.mapped }));
    const NODE_FLAG_COLORS = { Addition: { bg: '#E7F4EC', fg: '#128A3E' }, Closure: { bg: '#FBEAEA', fg: '#D14B4B' }, Migration: { bg: '#EAEEFB', fg: '#2F4FC6' } };
    const nodeChanges = (d.nodeChangesUnified || []).map(n => {
      const fc = NODE_FLAG_COLORS[n.flag] || { bg: '#F2F5FA', fg: '#5A5E66' };
      return { lmscCode: n.lmscCode, lmdcCode: n.lmdcCode, flag: n.flag, flagBg: fc.bg, flagFg: fc.fg, lat: n.lat, lng: n.lng };
    });
    const volErrModalOpen = !!(st.volErrModal);
    const volErrModal = st.volErrModal || { name: '', rows: [] };
    const closeVolErrModal = () => this.setState({ volErrModal: null });
    const volErrModalReplace = () => { const m = st.volErrModal; this.setState({ volErrModal: null }); if (m && m.type) replaceVolFile(m.name, m.type); };
    const _addedScs = (st.addedScs || []).filter(s => (zf === 'All' || s.zone === zf) && (!q || s.code.toLowerCase().indexOf(q) >= 0 || (s.name || '').toLowerCase().indexOf(q) >= 0));
    const scRemovedMap = st.scRemoved || {};
    const scFiltered = _addedScs.concat(anFiltered).filter(s => !scRemovedMap[s.code]);
    // PARITY §6 — identity columns City / State + Type. State is the representative state for the SC's
    // zone (deterministic); Type derives from scale (large LMSC = Hub, mid = Regional, small = Spoke).
    const ZSTATE = { North: 'Delhi NCR', West: 'Maharashtra', South: 'Karnataka', East: 'West Bengal', Central: 'Madhya Pradesh' };
    // C9 — POC details: up to 6 POCs/SC, names visible via a per-row dropdown (no separate screen).
    const POC_ROLES = ['Ops ZH', 'LH Ops ZH', 'Ops CH', 'LH Ops CH', 'Ops AM-1', 'Ops AM-2'];
    const pocOpenRow = st.pocOpenRow;
    const scEdits = st.scEdits || {};
    // Pagination — page the full filtered SC list (10/page) instead of the old hard 16-row cap.
    const scMasterPager = this.pager(scFiltered, st.pgScMaster, 'pgScMaster');
    const scRows = scMasterPager.pageRows.map(s0 => {
      const s = scEdits[s0.code] ? Object.assign({}, s0, scEdits[s0.code]) : s0;
      const pl = (s.pocs || []).slice(0, 6);
      // Synthetic per-SC values derived deterministically from code so the table looks realistic
      const h = s.code.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
      const nlhDocks = 3 + (h % 7);
      const rlhDocks = 2 + ((h >> 3) % 6);
      const localTp = 4 + (h % 3);
      const nonLocalTp = 2 + ((h >> 2) % 3);
      const openHour = 5 + (h % 3);
      const closeHour = 21 + ((h >> 4) % 3);
      const openTime = String(openHour).padStart(2, '0') + ':00';
      const closeTime = String(closeHour).padStart(2, '0') + ':00';
      const codeLC = s.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pocOpenRect = st.pocOpenRect || { top: 0, left: 0 };
      return { code: s.code, name: s.name, zone: s.zone, cityState: s.name + ' / ' + (ZSTATE[s.zone] || s.zone), scType: s.dcCount >= 170 ? 'Hybrid' : s.dcCount >= 110 ? 'LMSC' : 'FMSC', sortCap: fmtInt(s.sortCap), volCap: fmtInt(s.volCap), docks: s.docks, nlhDocks: nlhDocks, rlhDocks: rlhDocks, localTp: localTp, nonLocalTp: nonLocalTp, openTime: openTime, closeTime: closeTime, dcCount: s.dcCount,
        pocCount: pl.length, pocSummary: pl.length ? (pl.length + ' lead' + (pl.length === 1 ? '' : 's')) : 'None on file',
        pocList: pl.map((n, i) => ({ name: n, role: POC_ROLES[i] || ('Ops Lead ' + (i + 1)), email: n.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.') + '@valmo.in' })),
        pocOpen: pocOpenRow === s.code, pocOpenRect: pocOpenRect,
        togglePoc: (e) => { if (pocOpenRow === s.code) { this.setState({ pocOpenRow: null }); return; } const r = e.currentTarget.getBoundingClientRect(); this.setState({ pocOpenRow: s.code, pocOpenRect: { top: r.bottom + 4, left: Math.min(r.left, window.innerWidth - 270) } }); },
        rowEdit: () => this.openScEdit(s.code), rowDelete: () => { const r = Object.assign({}, this.state.scRemoved || {}); r[s.code] = true; this.setState({ scRemoved: r }); this.showToast(s.code + ' removed from SC master', '#D14B4B', () => { const rr = Object.assign({}, this.state.scRemoved || {}); delete rr[s.code]; this.setState({ scRemoved: rr }); }); }, rowDeleteConfirm: () => this.setState({ delConfirm: { kind: 'sc', key: s.code, label: s.code + ' / ' + s.name } }) };
    });
    // C13 — Vehicle Master derives from the canonical d.VEH fleet (unified source of truth).
    // vehEdits / vehRemoved / addedVehTypes are applied over the same base so Master edits
    // flow through to Design Creation automatically.
    const vehRemoved = st.vehRemoved || {};
    // vehEdits = per-type param overrides from the Edit modal, applied by name over both library + added rows.
    const vehEdits = st.vehEdits || {};
    const VEH_FEAS_OPTS_M = ['FM Carting', 'NLH', 'RLH'];
    const openEditVeh = (name, eff) => this.setState({ editVehName: name, editVehDraft: { vtype: name, capacity: String(eff.capacity == null ? '' : eff.capacity), dist: String(eff.dist == null ? '' : eff.dist), tp: String(eff.tp == null ? '' : eff.tp), localTp: String(eff.localTp == null ? '' : eff.localTp), nonLocalTp: String(eff.nonLocalTp == null ? '' : eff.nonLocalTp), feas: (eff.feas || []).slice() } });
    // Inline row-edit helpers for Vehicle Master
    const evName = st.editVehName || null;
    const evDraft = st.editVehDraft || {};
    const evSetDraft = (patch) => { this.setState({ editVehDraft: Object.assign({}, this.state.editVehDraft || {}, patch) }); };
    const evFeasChips = VEH_FEAS_OPTS_M.map(opt => {
      const on = (evDraft.feas || []).indexOf(opt) >= 0;
      return { label: opt, on: on, bg: on ? '#003F98' : '#EAF1FB', fg: on ? '#fff' : '#1E6FB8', bd: on ? '#003F98' : '#CFE0F1',
        onToggle: () => { const cur = ((this.state.editVehDraft || {}).feas || []); const next = cur.indexOf(opt) >= 0 ? cur.filter(x => x !== opt) : cur.concat([opt]); evSetDraft({ feas: next }); } };
    });
    const vehMasterBase = (d.VEH || []).filter(v => !vehRemoved[v.name]).map(v => {
      const eff = Object.assign({ capacity: v.cap, dist: v.dist, tp: v.tp, localTp: v.localTp, nonLocalTp: v.nonLocalTp, feas: v.feas }, vehEdits[v.name] || {});
      const editing = evName === v.name;
      return { name: v.name, capacity: (eff.capacity === '' || eff.capacity == null) ? '—' : String(eff.capacity), dist: (eff.dist === '' || eff.dist == null) ? '—' : Number(eff.dist).toLocaleString('en-IN'), tp: eff.tp, feas: (eff.feas && eff.feas.length ? eff.feas : ['—']),
        editing: editing, notEditing: !editing,
        draftCap: evDraft.capacity || '', draftDist: evDraft.dist || '', draftTp: evDraft.tp || '', draftVtype: evDraft.vtype || '',
        evFeasChips: editing ? evFeasChips : [],
        onDraftCap: (e) => evSetDraft({ capacity: e.target.value }),
        onDraftDist: (e) => evSetDraft({ dist: e.target.value }),
        onDraftTp: (e) => evSetDraft({ tp: e.target.value }),
        onDraftVtype: (e) => evSetDraft({ vtype: e.target.value }),
        onSaveRow: () => {
          const d2 = this.state.editVehDraft || {};
          const num = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? '' : n; };
          const ve = Object.assign({}, this.state.vehEdits || {});
          ve[v.name] = { capacity: num(d2.capacity), dist: num(d2.dist), tp: num(d2.tp), localTp: eff.localTp, nonLocalTp: eff.nonLocalTp, feas: (d2.feas || eff.feas || []).slice() };
          this.setState({ vehEdits: ve, editVehName: null, editVehDraft: null });
          this.showToast(v.name + ' updated in vehicle master', '#128A3E');
        },
        onCancelRow: () => this.setState({ editVehName: null, editVehDraft: null }),
        onEdit: () => openEditVeh(v.name, eff),
        onDelete: () => { const r = Object.assign({}, this.state.vehRemoved); r[v.name] = true; this.setState({ vehRemoved: r }); this.showToast(v.name + ' removed from vehicle master', '#D14B4B', () => { const rr = Object.assign({}, this.state.vehRemoved); delete rr[v.name]; this.setState({ vehRemoved: rr }); }); }, onDeleteConfirm: () => this.setState({ delConfirm: { kind: 'veh', key: v.name, label: v.name } }) };
    });
    // Add Vehicle Type modal appends user-added types to the master table (same row shape as the library rows).
    const addedVehRows = (st.addedVehTypes || []).map((v, i) => {
      const eff = Object.assign({ capacity: v.capacity, dist: v.dist, tp: v.tp, localTp: v.localTp, nonLocalTp: v.nonLocalTp, feas: v.feas }, vehEdits[v.name] || {});
      const editing = evName === v.name;
      return { name: v.name, capacity: (eff.capacity === '' || eff.capacity == null) ? '—' : String(eff.capacity), dist: (eff.dist === '' || eff.dist == null) ? '—' : Number(eff.dist).toLocaleString('en-IN'), tp: eff.tp, feas: (eff.feas && eff.feas.length ? eff.feas : ['—']),
        editing: editing, notEditing: !editing,
        draftCap: evDraft.capacity || '', draftDist: evDraft.dist || '', draftTp: evDraft.tp || '', draftVtype: evDraft.vtype || '',
        evFeasChips: editing ? evFeasChips : [],
        onDraftCap: (e) => evSetDraft({ capacity: e.target.value }),
        onDraftDist: (e) => evSetDraft({ dist: e.target.value }),
        onDraftTp: (e) => evSetDraft({ tp: e.target.value }),
        onDraftVtype: (e) => evSetDraft({ vtype: e.target.value }),
        onSaveRow: () => {
          const d2 = this.state.editVehDraft || {};
          const num = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? '' : n; };
          const ve = Object.assign({}, this.state.vehEdits || {});
          ve[v.name] = { capacity: num(d2.capacity), dist: num(d2.dist), tp: num(d2.tp), localTp: eff.localTp, nonLocalTp: eff.nonLocalTp, feas: (d2.feas || eff.feas || []).slice() };
          this.setState({ vehEdits: ve, editVehName: null, editVehDraft: null });
          this.showToast(v.name + ' updated in vehicle master', '#128A3E');
        },
        onCancelRow: () => this.setState({ editVehName: null, editVehDraft: null }),
        onEdit: () => openEditVeh(v.name, eff),
        onDelete: () => { const arr = (this.state.addedVehTypes || []).slice(); const removed = arr[i]; arr.splice(i, 1); this.setState({ addedVehTypes: arr }); this.showToast(v.name + ' removed from vehicle master', '#D14B4B', () => { const a2 = (this.state.addedVehTypes || []).slice(); a2.splice(i, 0, removed); this.setState({ addedVehTypes: a2 }); }); }, onDeleteConfirm: () => this.setState({ delConfirm: { kind: 'veh-added', key: String(i), label: v.name } }) };
    });
    const vehMaster = vehMasterBase.concat(addedVehRows);
    const vehTypeCount = vehMaster.length;
    // Add Vehicle Type modal — mirrors the Add Sort Centre modal pattern (addScForm/set(k) input binding).
    const vf = st.addVehForm || {};
    const vset = (k) => (e) => { const val = e && e.target ? e.target.value : e; const nf = Object.assign({}, this.state.addVehForm); nf[k] = val; this.setState({ addVehForm: nf }); };
    const VEH_FEAS_OPTS = ['FM Carting', 'NLH', 'RLH'];
    const vfFeas = vf.feas || [];
    const addVehFeasChips = VEH_FEAS_OPTS.map(opt => {
      const on = vfFeas.indexOf(opt) >= 0;
      return { label: opt, on: on, bg: on ? '#003F98' : '#EAF1FB', fg: on ? '#fff' : '#1E6FB8', bd: on ? '#003F98' : '#CFE0F1',
        onToggle: () => { const cur = (this.state.addVehForm && this.state.addVehForm.feas) || []; const next = cur.indexOf(opt) >= 0 ? cur.filter(x => x !== opt) : cur.concat([opt]); const nf = Object.assign({}, this.state.addVehForm, { feas: next }); this.setState({ addVehForm: nf }); } };
    });
    const addVehValid = !!(vf.vtype && String(vf.vtype).trim() && vf.hardCap != null && String(vf.hardCap).trim());
    // PARITY §7 — vs. VM Max: validate each SC availability row against the Vehicle-Master ceiling.
    // VM max TP comes from the canonical VEH master; the SC's own count must also stay within a sane
    // fleet cap (8). A row "Exceeds limit" when its TP limit is above the master's TP for that vehicle
    // type or its vehicle count is over the cap — otherwise "OK".
    const VMMAXCOUNT = 8;
    const vmTpFor = (name) => { const v = (d.VEH || []).find(x => x.name === name); return v ? v.tp : 7; };
    const availEdits = st.availEdits || {};
    const availRemovedMap = st.availRemoved || {};
    const fmtIntAvail = (n) => (typeof n === 'number' ? n.toLocaleString('en-IN') : (n == null ? '—' : n));
    const scByCode = (code) => (d.scs || []).find(s => s.code === code) || {};
    // Add-Vehicle to an SC's availability — mirrors the Design-Creation Step-2 inline add flow (addForm pattern).
    // VEHMA = live fleet with vehEdits/vehRemoved/addedVehTypes applied (same chain as VEHM in creationVals).
    const VEHMA = (d.VEH || []).filter(v => !(st.vehRemoved || {})[v.name]).map(v => {
      const ov = (st.vehEdits || {})[v.name] || {};
      return Object.assign({}, v, { cap: ov.capacity != null ? ov.capacity : v.cap, dist: ov.dist != null ? ov.dist : v.dist, tp: ov.hardCap != null ? ov.hardCap : v.tp, feas: ov.feas ? ov.feas : v.feas });
    }).concat((st.addedVehTypes || []).map(v => {
      const ov = (st.vehEdits || {})[v.name] || {};
      return { name: v.name, cap: ov.capacity != null ? ov.capacity : (v.capacity || v.cap || 2000), dist: ov.dist != null ? ov.dist : (v.dist || 600), tp: ov.hardCap != null ? ov.hardCap : (v.tp || 7), feas: ov.feas ? ov.feas : (v.feas || ['RLH']) };
    }));
    const vehDistAvail = (name) => { const v = (VEHMA || []).find(x => x.name === name); return v ? v.dist : 600; };
    const availAdded = st.availAdded || {};
    const addingAvailSC = st.addingAvailSC || null;
    const defAvailForm = () => ({ vehicleType: (VEHMA[0] || {}).name || 'TATA ACE / 7ft', count: 1, tp: (VEHMA[0] || {}).tp || 7, zoneFeas: 'Both' });
    const availForm = st.availAddForm || defAvailForm();
    const availZfStyle = (zf) => ({ zfBg: zf === 'Both' ? '#EAEEFB' : zf === 'Local' ? '#E7F0F8' : '#FBEAF1', zfFg: zf === 'Both' ? '#2F4FC6' : zf === 'Local' ? '#1E6FB8' : '#C03977' });
    const availFormFor = (code) => {
      const m = VEHMA.find(x => x.name === availForm.vehicleType) || VEHMA[0] || { cap: 2000, tp: 7 };
      const tp = availForm.tp == null ? m.tp : availForm.tp; const tpWarn = tp > m.tp; const zf = availZfStyle(availForm.zoneFeas || 'Both');
      const afCap = availForm.cap == null ? m.cap : availForm.cap;
      return { vehicleType: availForm.vehicleType, count: availForm.count, tp: tp, cap: afCap, vmCap: m.cap, dist: vehDistAvail(availForm.vehicleType) + ' km', vmTp: m.tp, zoneFeas: availForm.zoneFeas || 'Both',
        typeOptions: VEHMA.map(x => ({ value: x.name, label: x.name, selected: x.name === availForm.vehicleType })), zfBg: zf.zfBg, zfFg: zf.zfFg,
        tpWarn: tpWarn, tpBd: tpWarn ? '#E0B84A' : '#E6EBF2', tpWarnText: 'Entered TP ' + tp + ' exceeds the vehicle-master limit of ' + m.tp + ' — allowed, but the DS plan may be infeasible.',
        title: 'Add vehicle',
        submitLabel: 'Add',
        onTypeChange: (e) => { const nm = VEHMA.find(x => x.name === e.target.value) || {}; this.setState({ availAddForm: Object.assign({}, this.state.availAddForm || defAvailForm(), { vehicleType: e.target.value, tp: nm.tp || 7, cap: nm.cap }) }); },
        onCountChange: (e) => this.setState({ availAddForm: Object.assign({}, this.state.availAddForm || defAvailForm(), { count: parseInt(e.target.value) || 1 }) }),
        onTpChange: (e) => this.setState({ availAddForm: Object.assign({}, this.state.availAddForm || defAvailForm(), { tp: parseInt(e.target.value) || 1 }) }),
        onCapChange: (e) => this.setState({ availAddForm: Object.assign({}, this.state.availAddForm || defAvailForm(), { cap: e.target.value }) }),
        onZoneFeasChange: (e) => this.setState({ availAddForm: Object.assign({}, this.state.availAddForm || defAvailForm(), { zoneFeas: e.target.value }) }),
        onAdd: () => { const f = this.state.availAddForm || defAvailForm(); const vm = VEHMA.find(x => x.name === f.vehicleType) || { cap: 2000 }; const capRaw = (f.cap === '' || f.cap == null) ? vm.cap : (parseInt(f.cap) || vm.cap); const nr = { vehicleType: f.vehicleType, capacity: capRaw, distanceLimit: vehDistAvail(f.vehicleType) + ' km', vehicleCount: f.count || 1, tpLimit: f.tp, zoneFeas: f.zoneFeas || 'Both' }; const add = Object.assign({}, this.state.availAdded || {}); add[code] = (add[code] || []).concat([nr]); this.setState({ availAdded: add, addingAvailSC: null, availAddForm: null }); this.showToast(f.vehicleType + ' added to ' + code, '#128A3E'); },
        onCancel: () => this.setState({ addingAvailSC: null, availAddForm: null, editingAvail: null }) };
    };
    // Inline-row-edit state for SC Vehicle Availability
    const eak = st.editAvailKey || null;
    const ead = st.editAvailDraft || {};
    const eadSet = (patch) => { this.setState({ editAvailDraft: Object.assign({}, this.state.editAvailDraft || {}, patch) }); };
    const ZF_OPTS = ['Both', 'Local', 'Non-Local'];
    const scVehAvailRows = (d.scVehAvail || []).map(g => {
      const src = scByCode(g.code);
      const rows = g.rows.concat(availAdded[g.code] || []).filter(r => !availRemovedMap[g.code + '|' + r.vehicleType]).map(r => {
        const availKey = g.code + '|' + r.vehicleType;
        const ov = availEdits[availKey]; const ovObj = (ov != null && typeof ov === 'object') ? ov : (ov != null ? { cnt: ov } : {});
        const cnt = ovObj.cnt != null ? ovObj.cnt : r.vehicleCount;
        const tp = ovObj.tp != null ? ovObj.tp : r.tpLimit;
        const zf = ovObj.zf != null ? ovObj.zf : (r.zoneFeas || 'Both');
        const cap = ovObj.cap != null ? ovObj.cap : r.capacity;
        const dist = ovObj.dist != null ? ovObj.dist : r.distanceLimit;
        const distNum = parseInt(String(dist).replace(/[^0-9]/g, ''), 10) || 0;
        const displayType = ovObj.type != null ? ovObj.type : r.vehicleType;
        const vmTp = vmTpFor(displayType); const exceeds = tp > vmTp || cnt > VMMAXCOUNT;
        const zfBg = zf === 'Both' ? '#EAEEFB' : zf === 'Local' ? '#E7F0F8' : '#FBEAF1';
        const zfFg = zf === 'Both' ? '#2F4FC6' : zf === 'Local' ? '#1E6FB8' : '#C03977';
        const rowEditing = eak === availKey;
        const draftZf = rowEditing ? (ead.zf || zf) : zf;
        const draftZfBg = draftZf === 'Both' ? '#EAEEFB' : draftZf === 'Local' ? '#E7F0F8' : '#FBEAF1';
        const draftZfFg = draftZf === 'Both' ? '#2F4FC6' : draftZf === 'Local' ? '#1E6FB8' : '#C03977';
        const zfChips = ZF_OPTS.map(z => ({ label: z, active: draftZf === z, bg: draftZf === z ? draftZfBg : '#F2F5FA', fg: draftZf === z ? draftZfFg : '#5A5E66', bd: draftZf === z ? draftZfFg : '#E6EBF2', onSelect: () => eadSet({ zf: z }) }));
        const typeOpts = VEHMA.map(x => ({ value: x.name, label: x.name, selected: x.name === (rowEditing ? (ead.type || displayType) : displayType) }));
        return {
          t: displayType, cap: cap, dist: distNum + ' km', cnt: cnt, tp: tp, zf: zf, zfBg: zfBg, zfFg: zfFg,
          vmLabel: exceeds ? 'Exceeds limit' : 'OK', vmBg: exceeds ? '#FBEAEA' : '#E7F4EC', vmFg: exceeds ? '#D14B4B' : '#128A3E',
          rowEditing: rowEditing, rowNotEditing: !rowEditing,
          draftType: rowEditing ? (ead.type || displayType) : displayType,
          draftCap: rowEditing ? (ead.cap != null ? ead.cap : cap) : cap,
          draftDist: rowEditing ? (ead.dist != null ? ead.dist : distNum) : distNum,
          draftCnt: rowEditing ? (ead.cnt != null ? ead.cnt : cnt) : cnt,
          draftTp: rowEditing ? (ead.tp != null ? ead.tp : tp) : tp,
          draftZf: draftZf, draftZfBg: draftZfBg, draftZfFg: draftZfFg,
          zfChips: rowEditing ? zfChips : [],
          typeOpts: rowEditing ? typeOpts : [],
          onDraftType: (e) => { const nm = VEHMA.find(x => x.name === e.target.value) || {}; eadSet({ type: e.target.value, tp: nm.tp || tp, cap: nm.cap || cap, dist: nm.dist || distNum }); },
          onDraftCap: (e) => eadSet({ cap: e.target.value }),
          onDraftDist: (e) => eadSet({ dist: e.target.value }),
          onDraftCnt: (e) => eadSet({ cnt: e.target.value }),
          onDraftTp: (e) => eadSet({ tp: e.target.value }),
          onEditAvail: () => this.setState({ editAvailKey: availKey, editAvailDraft: { type: displayType, cap: cap, dist: distNum, cnt: cnt, tp: tp, zf: zf } }),
          onSaveAvailRow: () => {
            const d2 = this.state.editAvailDraft || {};
            const pi = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
            const ov2 = Object.assign({}, this.state.availEdits || {});
            ov2[availKey] = { cnt: pi(d2.cnt), tp: pi(d2.tp), zf: d2.zf || zf, type: d2.type || displayType, cap: d2.cap != null ? pi(d2.cap) : cap, dist: d2.dist != null ? pi(d2.dist) : distNum };
            this.setState({ availEdits: ov2, editAvailKey: null, editAvailDraft: null });
            this.showToast((d2.type || displayType) + ' updated in ' + g.code, '#128A3E');
          },
          onCancelAvailRow: () => this.setState({ editAvailKey: null, editAvailDraft: null }),
          onCntInput: (e) => this.setAvailRow(g.code, r.vehicleType, e.target.value),
          onTpInput: (e) => this.setAvailField(g.code, r.vehicleType, 'tp', parseInt(e.target.value) || r.tpLimit),
          onZoneInput: (e) => this.setAvailField(g.code, r.vehicleType, 'zf', e.target.value),
          rowDelete: () => { const rm = Object.assign({}, this.state.availRemoved || {}); rm[availKey] = true; this.setState({ availRemoved: rm }); this.showToast(r.vehicleType + ' removed from ' + g.code, '#D14B4B', () => { const rm2 = Object.assign({}, this.state.availRemoved || {}); delete rm2[availKey]; this.setState({ availRemoved: rm2 }); }); }
        };
      });
      const totalCount = rows.reduce((a, x) => a + (parseInt(x.cnt) || 0), 0);
      return { code: g.code, name: g.name, zone: g.zone, count: g.rows.length + ' vehicle types', sortCap: fmtIntAvail(src.sortCap), dcCount: src.dcCount == null ? '—' : src.dcCount, totalCount: totalCount, isAdding: addingAvailSC === g.code, notAdding: addingAvailSC !== g.code, addAvail: () => this.setState({ addingAvailSC: g.code, availAddForm: defAvailForm(), editingAvail: null }), addForm: availFormFor(g.code), rows: rows };
    });
    const scVehAvailTotalRows = scVehAvailRows.reduce((a, g) => a + g.rows.length, 0);
    // §3 — search filter (by SC code/name, or any vehicle type configured on the SC), applied before paging.
    const availQuery = (st.availSearch || '').toLowerCase().trim();
    const scVehAvailFiltered = availQuery ? scVehAvailRows.filter(g => (g.code || '').toLowerCase().indexOf(availQuery) >= 0 || (g.name || '').toLowerCase().indexOf(availQuery) >= 0 || g.rows.some(r => (r.t || '').toLowerCase().indexOf(availQuery) >= 0)) : scVehAvailRows;
    const availShownRows = scVehAvailFiltered.reduce((a, g) => a + g.rows.length, 0);
    // Pagination — page the per-SC GROUPS (10 groups/page). Seed currently has 6 SC groups, so the
    // pager stays hidden (<= 10); the wiring activates automatically if the avail master grows.
    const scAvailPager = this.pager(scVehAvailFiltered, st.pgAvail, 'pgAvail');
    const ing = st.ingestionTab || 'rlh';
    const ingTabs = [['rlh', 'RLH Plan', false, 'Ingest an externally-built RLH route plan to validate and push into the alignment loop.'], ['fm', 'FM Carting', true, 'First-Mile carting ingestion — arriving next cycle.'], ['nlh', 'NLH Plan', true, 'National Linehaul ingestion — arriving next cycle.']].map(t => ({ label: t[1], soon: t[2], tip: t[3], attention: false, active: ing === t[0], color: ing === t[0] ? '#003F98' : (t[2] ? '#8E96A3' : '#5A5E66'), weight: ing === t[0] ? '700' : '500', bg: ing === t[0] ? '#fff' : 'transparent', bd: ing === t[0] ? '#D7DCE5' : 'transparent', onClick: t[2] ? () => this.showToast(t[1] + ' — arriving next cycle', '#1E6FB8') : () => this.setState({ ingestionTab: t[0] }) }));
    return {
      gate,
      isVolumeTab: itab === 'volume', isNodesTab: itab === 'nodes', isMastersTab: itab === 'masters', isIngestionTab: itab === 'ingestion',
      volumeFiles, volActiveStrip, volTypeChips, volFilesShown, volFilesTotal, volFilesEmpty: volFilesShown === 0, volEmptyMsg: (allVol.length === 0 ? 'No volume files uploaded yet — use Upload above to add one for any type.' : 'No volume files match this type or search.'), volSearch: st.volSearch || '', onVolSearch: (e) => this.setState({ volSearch: e.target.value }),
      nodeSteps, nstepActive: nstep === 'active', nstepChanges: nstep === 'changes', nstepMigrations: nstep === 'changes',
      // D1 — one accurate stat per fact. dcTotal = Σ per-SC dcCount = total active LMSC→LMDC links (NOT unique LMDCs),
      // so it is labelled as links exactly once; LMSC count is its own distinct, accurate stat.
      // PARITY §5 — 3rd stat: Active LMDCs (DISTINCT delivery centres). dcTotal counts LINKS, so distinct
      // LMDCs = links minus the multi-SC-mapped overlap (an LMDC mapped to >1 SC is one node, many links).
      nodeStats: nodeStats, autodmlFilterCards: autodmlFilterCards, nodeRows: autodmlPager.pageRows, autodmlPager: autodmlPager, nodeShown: nodeShown, nodeEmpty: nodeEmpty, nodeCountLabel: nodeCountLabel,
      nodeLmscSearch: st.nodeLmscSearch || '', onNodeLmscSearch: (e) => this.setState({ nodeLmscSearch: e.target.value, pgAutodml: 1 }), nodeFilterDirty: nodeFilterDirty, clearNodeFilters: clearNodeFilters, onDownloadNodeCsv: () => this.downloadNodeCsv(nodeRows),
      autodmlCards, nodeAdditions, nodeClosures: d.nodeClosures, migrations: d.migrations, nodeChanges,
      volErrModalOpen, volErrModal, closeVolErrModal, volErrModalReplace,
      zoneChips, scSearch: st.inputsSearch || '', onInputsSearch: (e) => this.setState({ inputsSearch: e.target.value, pgScMaster: 1, pgAvail: 1 }),
      isScMaster: st.mastersTab === 'sc', isVehMaster: st.mastersTab === 'vehicle', isAvail: st.mastersTab === 'avail',
      mastersTabs: [['sc', 'Sort Center Master', d.scs.length, 'Canonical SC master — one row per Sort Centre with zone, capacity and location.'], ['avail', 'SC Vehicle Availability', (d.scVehAvail || []).length, 'Vehicles available per SC (one row per vehicle type per SC) — capped by the Touch Point Limit.'], ['vehicle', 'Vehicle Master', vehTypeCount, 'Vehicle types and their capacity, distance limit, touch-point cap and LH feasibility.']].map(t => ({ label: t[1] + ' (' + t[2] + ')', tip: t[3], attention: false, active: st.mastersTab === t[0], color: st.mastersTab === t[0] ? '#003F98' : '#5A5E66', weight: st.mastersTab === t[0] ? '700' : '500', bg: st.mastersTab === t[0] ? '#fff' : 'transparent', bd: st.mastersTab === t[0] ? '#D7DCE5' : 'transparent', onClick: () => this.setState({ mastersTab: t[0] }) })),
      scRows, scMasterPager: scMasterPager, scShown: scRows.length, scTotal: scFiltered.length, vehMaster, vehTypeCount,
      addVehType: () => this.setState({ addVehOpen: true, addVehEditName: null, addVehForm: { vtype: '', capacity: '', dist: '', hardCap: '', localTp: '', nonLocalTp: '', feas: [] } }),
      addVehOpen: !!st.addVehOpen,
      addVehNotOpen: !st.addVehOpen,
      addVehInlineHint: st.addVehEditName ? 'Editing vehicle type…' : 'Adding a vehicle type…',
      addVehModalTitle: st.addVehEditName ? 'Edit Vehicle Type' : 'Add Vehicle Type', addVehSubmitLabel: st.addVehEditName ? 'Save changes' : 'Add Vehicle Type',
      addVehVtype: vf.vtype || '', addVehCapacity: vf.capacity || '', addVehDist: vf.dist || '', addVehHardCap: vf.hardCap || '', addVehLocalTp: vf.localTp || '', addVehNonLocalTp: vf.nonLocalTp || '',
      onAddVehVtype: vset('vtype'), onAddVehCapacity: vset('capacity'), onAddVehDist: vset('dist'), onAddVehHardCap: vset('hardCap'), onAddVehLocalTp: vset('localTp'), onAddVehNonLocalTp: vset('nonLocalTp'),
      addVehFeasChips: addVehFeasChips, addVehValid: addVehValid,
      addVehBtnBg: addVehValid ? '#003F98' : '#E6EBF2', addVehBtnFg: addVehValid ? '#fff' : '#8E96A3', addVehBtnCursor: addVehValid ? 'pointer' : 'not-allowed',
      closeAddVeh: () => this.setState({ addVehOpen: false, addVehForm: {}, addVehEditName: null }),
      submitAddVeh: () => this.submitAddVeh(),      availTemplate: () => this.downloadTemplate('SC Vehicle Availability', [{ k: 'SC Code' }, { k: 'Vehicle Type' }, { k: 'Available Count' }, { k: 'Zone Feasibility' }]),
      changesTemplate: () => this.downloadTemplate('Node Changes', [{ k: 'Change Type' }, { k: 'DC Code' }, { k: 'DC Name' }, { k: 'SC Code' }, { k: 'From SC' }, { k: 'To SC' }, { k: 'Zone' }, { k: 'Capacity' }, { k: 'Reason' }]),
      nodeChangeUploadedBy: st.nodeChangeBy || 'Shashvat Jain', nodeChangeUploadedDate: st.nodeChangeDate || '10 Jul · 11:24', uploadNodeChanges: () => this.uploadNodeChanges(),
      ingestTemplate: () => this.downloadTemplate('RLH Plan Ingestion', [{ k: 'SC Code' }, { k: 'Route Code' }, { k: 'Vehicle Type' }, { k: 'Touch Points' }, { k: 'Round-Trip Distance' }, { k: 'Out Cutoff' }]),
      scVehAvail: scAvailPager.pageRows, scAvailPager: scAvailPager, scVehAvailCountLabel: availQuery ? (availShownRows + ' vehicle row' + (availShownRows === 1 ? '' : 's') + ' across ' + scVehAvailFiltered.length + ' of ' + scVehAvailRows.length + ' SCs') : (scVehAvailTotalRows + ' vehicle rows across ' + scVehAvailRows.length + ' SCs'), availSearch: st.availSearch || '', onAvailSearch: (e) => this.setState({ availSearch: e.target.value, pgAvail: 1 }), availNoResults: scVehAvailFiltered.length === 0,
      ingTabs,
      ingPlans: (st.ingestedPlans || []).slice(0, 5).map(p => ({ name: p.name, by: p.by, date: p.date, rows: p.rows.toLocaleString('en-IN'), runId: p.runId })),
      ingHasPlans: (st.ingestedPlans || []).length > 0,
      ingNoPlans: !(st.ingestedPlans || []).length,
      ingTotalRows: (st.ingestedPlans || []).reduce((a, p) => a + p.rows, 0).toLocaleString('en-IN'),
      ingErrors: 0,
      ingCount: (st.ingestedPlans || []).length,
      delConfirmOpen: !!st.delConfirm,
      finDirectOpen: st.finDirectOpen, finDirectPlanName: (st.finDirectSCcode ? (st.finDirectSCcode + ' · ' + ((this.state.data.scs.find(s => s.code === st.finDirectSCcode) || {}).name || '')) : ''), confirmFinDirect: () => this.doPush(true), closeFinDirect: () => this.setState({ finDirectOpen: false }),
      delConfirmLabel: st.delConfirm ? st.delConfirm.label : '',
      closeDelConfirm: () => this.setState({ delConfirm: null }),
      confirmDelete: () => this.confirmDelete(),
    };
  }

  confirmDelete() {
    const dc = this.state.delConfirm;
    if (!dc) return;
    this.setState({ delConfirm: null });
    if (dc.kind === 'sc') {
      const r = Object.assign({}, this.state.scRemoved || {}); r[dc.key] = true; this.setState({ scRemoved: r });
      this.showToast(dc.key + ' removed from SC master', '#D14B4B', () => { const rr = Object.assign({}, this.state.scRemoved || {}); delete rr[dc.key]; this.setState({ scRemoved: rr }); });
    } else if (dc.kind === 'veh') {
      const r = Object.assign({}, this.state.vehRemoved); r[dc.key] = true; this.setState({ vehRemoved: r });
      this.showToast(dc.label + ' removed from vehicle master', '#D14B4B', () => { const rr = Object.assign({}, this.state.vehRemoved); delete rr[dc.key]; this.setState({ vehRemoved: rr }); });
    } else if (dc.kind === 'veh-added') {
      const i = parseInt(dc.key, 10);
      const arr = (this.state.addedVehTypes || []).slice(); const removed = arr[i]; arr.splice(i, 1); this.setState({ addedVehTypes: arr });
      this.showToast(dc.label + ' removed from vehicle master', '#D14B4B', () => { const a2 = (this.state.addedVehTypes || []).slice(); a2.splice(i, 0, removed); this.setState({ addedVehTypes: a2 }); });
    }
  }

  creationVals() {
    const st = this.state, d = st.data;
    const fmtInt = (n) => n.toLocaleString('en-IN');
    const fmtL = (n) => (n / 100000).toFixed(1) + 'L';
    const step = st.creationStep;
    const sel = st.selectedSCs;
    const selSet = {}; sel.forEach(c => { selSet[c] = true; });

    // D. Per-SC volume-gap = missing-volume DCs (fewer file rows than node list) + zero-volume DCs
    // (row present, volume = 0), minus any DCs the planner has dropped from THIS run. The first
    // `zeroVolDc` LMDCs of an SC are treated as the zero-volume rows the user can drop/update.
    const dropped = st.droppedDcBySC || {};
    const droppedFor = (code) => dropped[code] || [];
    const scVolGap = (s) => {
      const drops = droppedFor(s.code);
      // Drops clear the volume gap for this SC. Zero-volume rows (indices < zeroVolDc) clear the `zero`
      // component first; any remaining drops beyond those clear the `miss` (missing-from-file) component,
      // so dropping enough DCs on the SC drives the whole gap to zero (matches the "drop the zero/missing-
      // volume DCs" resolution). No drop = full seeded gap, so the blocker stays honest until acted on.
      const dropsBelowZero = drops.filter(i => i < (s.zeroVolDc || 0)).length;
      const dropsBeyondZero = Math.max(0, drops.length - dropsBelowZero);
      const zero = Math.max(0, (s.zeroVolDc || 0) - dropsBelowZero);
      const miss = Math.max(0, (s.missVolDc || 0) - dropsBeyondZero);
      return { zero, miss, total: zero + miss, hasGap: (zero + miss) > 0 };
    };

    const STEPS = [[1, 'Input Selection'], [2, 'Operating Mode & HW'], [3, 'Vehicle Configuration'], [4, 'Preview & Trigger']];
    const stepper = STEPS.map((s, idx) => ({ n: s[0], label: s[1], active: s[0] === step, isDone: s[0] < step, notDone: !(s[0] < step),
      numBg: s[0] === step ? '#003F98' : (s[0] < step ? '#128A3E' : '#FFFFFF'), numFg: s[0] <= step ? '#fff' : '#8E96A3', numBd: s[0] === step ? '#003F98' : (s[0] < step ? '#128A3E' : '#D0D5DD'),
      numShadow: s[0] === step ? '0 0 0 4px rgba(0,63,152,0.12)' : 'none',
      subLabel: s[0] < step ? 'Done' : (s[0] === step ? 'In progress' : 'Up next'), subColor: s[0] < step ? '#128A3E' : (s[0] === step ? '#003F98' : '#A5ABB5'),
      labelColor: s[0] === step ? '#14171F' : (s[0] < step ? '#14171F' : '#8E96A3'), labelWeight: s[0] === step ? '700' : (s[0] < step ? '600' : '500'),
      hasLine: idx < STEPS.length - 1, lineBg: s[0] < step ? '#128A3E' : '#E6EBF2', flex: idx < STEPS.length - 1 ? '1' : '0 0 auto',
      onClick: () => { if (s[0] <= step) this.setState({ creationStep: s[0], fixReturnStep: s[0] === st.fixReturnStep ? null : st.fixReturnStep, focusSC: null }); } }));

    const planGroup = { name: st.designCycle || 'July 2026', triggered: d.plans.length, cap: 80, pct: Math.round(d.plans.length / 80 * 100) };
    const SC_CAP = planGroup.cap; // ADR-003 — a Plan Group is capped at ≤80 SC runs. Enforced in every add path below.

    const q = (st.creationSearch || '').toLowerCase();
    const zf = st.creationZone || 'All';
    const filtered = d.scs.filter(s => (zf === 'All' || s.zone === zf) && (!q || s.code.toLowerCase().indexOf(q) >= 0 || s.name.toLowerCase().indexOf(q) >= 0));
    const ZONES = ['North', 'South', 'East', 'West', 'Central'];
    const scGroups = ZONES.map(z => {
      const list = filtered.filter(s => s.zone === z);
      const selN = list.filter(s => selSet[s.code]).length;
      const collapsed = !!st.collapsedZones[z];
      return { zone: z, count: list.length, selectedCount: selN, hasSel: selN > 0, collapsed, expanded: !collapsed && list.length > 0,
        chev: collapsed ? 'M9 6l6 6-6 6' : 'M6 9l6 6 6-6', allSel: list.length > 0 && selN === list.length, selLabel: selN + ' / ' + list.length,
        onToggleCollapse: () => { const c = Object.assign({}, st.collapsedZones); c[z] = !c[z]; this.setState({ collapsedZones: c }); },
        onSelectZone: () => { const cur = new Set(sel); const all = selN === list.length; if (all) { list.forEach(s => cur.delete(s.code)); } else { let hit = false; list.forEach(s => { if (cur.has(s.code)) return; if (cur.size >= SC_CAP) { hit = true; return; } cur.add(s.code); }); if (hit) this.showToast('Plan group is capped at ' + SC_CAP + ' SCs — some were not added', '#C77B00'); } this.setState({ selectedSCs: [...cur] }); },
        scs: list.map(s => { const gap = scVolGap(s); const drops = droppedFor(s.code);
          // 2.5: SC Master properties — mark GGNS as the demo "missing details" SC.
          const hasMissingMaster = s.code === 'GGNS';
          const noMissingMaster = !hasMissingMaster;
          const scVolCapLabel = hasMissingMaster ? '—' : fmtInt(s.volCap);
          const scSortCapLabel = hasMissingMaster ? '—' : fmtInt(s.sortCap);
          const scDocksLabel = hasMissingMaster ? '—' : String(s.docks);
          const scLocLabel = hasMissingMaster ? '—' : (s.lat.toFixed(2) + ', ' + s.lng.toFixed(2));
          return { code: s.code, name: s.name, dcCount: s.dcCount, volume: fmtL(s.volume), selected: !!selSet[s.code], newSc: !s.hasRef, expanded: st.expandedSC === s.code,
          hasMissingMaster, noMissingMaster, scVolCapLabel, scSortCapLabel, scDocksLabel, scLocLabel,
          onFixMaster: () => { this.go('inputs'); this.setState({ inputsTab: 'masters', mastersTab: 'sc' }); this.showToast('Navigating to Sort Center Master — update ' + s.code + ' details', '#1E6FB8'); },
          // D. per-SC volume-gap flag (covers both zero-volume and missing-volume DCs)
          volGap: gap.hasGap, volGapLabel: gap.total + (gap.total === 1 ? ' DC no vol' : ' DCs no vol'),
          dropCount: drops.length, onRestoreDropped: () => { const m = Object.assign({}, this.state.droppedDcBySC || {}); delete m[s.code]; this.setState({ droppedDcBySC: m }); this.showToast('Restored ' + drops.length + ' DC' + (drops.length === 1 ? '' : 's') + ' to ' + s.code, '#128A3E'); },
          rowBg: st.focusSC === s.code ? '#E3EDFB' : (selSet[s.code] ? '#F3F7FE' : '#FFFFFF'), checkBg: selSet[s.code] ? '#003F98' : '#FFFFFF', checkBd: selSet[s.code] ? '#003F98' : '#C3C9D4', checkOp: selSet[s.code] ? '1' : '0',
          expandChev: st.expandedSC === s.code ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6',
          expandAria: (st.expandedSC === s.code ? 'Collapse LMDCs for ' : 'Show LMDCs for ') + s.code,
          onToggle: () => { const cur = new Set(sel); if (selSet[s.code]) { cur.delete(s.code); } else { if (cur.size >= SC_CAP) { this.showToast('Plan group is capped at ' + SC_CAP + ' SCs — deselect one to add another', '#C77B00'); return; } cur.add(s.code); } this.setState({ selectedSCs: [...cur] }); },
          onExpand: () => this.setState({ expandedSC: st.expandedSC === s.code ? null : s.code }),
          // D. first `zeroVolDc` rows are zero-volume (flagged + droppable); others are advisory low/over/OK.
          lmdcs: st.expandedSC === s.code ? [0, 1, 2, 3, 4, 5].filter(i => drops.indexOf(i) < 0).map(i => {
            const isZero = i < (s.zeroVolDc || 0);
            const volN = isZero ? 0 : Math.round(s.volume / s.dcCount * (0.7 + (i % 3) * 0.25));
            const capN = Math.round((volN || Math.round(s.volume / s.dcCount)) * (1.05 + (i % 4) * 0.18));
            const zeroVol = isZero || (volN < (s.volume / s.dcCount) * 0.78); const overCap = !zeroVol && volN > capN;
            const flag = zeroVol ? { t: '0 volume', bg: '#FBEAEA', fg: '#D14B4B' } : overCap ? { t: 'Over capacity', bg: '#FBEAEA', fg: '#D14B4B' } : { t: 'OK', bg: '#E7F4EC', fg: '#128A3E' };
            return { code: s.cityCode + '-' + (210 + i * 7), name: 'DC ' + s.cityCode + ' ' + (i + 1), vol: zeroVol ? '0' : fmtInt(volN), volFg: zeroVol ? '#D14B4B' : '#14171F', volWeight: zeroVol ? '700' : '400', cap: fmtInt(capN), volFlag: flag.t, volFlagBg: flag.bg, volFlagFg: flag.fg, src: i === 4 ? 'Addition' : 'AutoDML', srcBg: i === 4 ? '#EAEEFB' : '#F2F5FA', srcFg: i === 4 ? '#2F4FC6' : '#5A5E66',
              dropTitle: zeroVol ? 'Drop this zero-volume DC from the run' : 'Drop this DC from the run', dropColor: zeroVol ? '#D14B4B' : '#C3C9D4',
              onDrop: () => { const m = Object.assign({}, this.state.droppedDcBySC || {}); const arr = (m[s.code] || []).slice(); if (arr.indexOf(i) < 0) arr.push(i); m[s.code] = arr; this.setState({ droppedDcBySC: m }); this.showToast((s.cityCode + '-' + (210 + i * 7)) + ' dropped from this run', '#D14B4B', () => { const m2 = Object.assign({}, this.state.droppedDcBySC || {}); const a2 = (m2[s.code] || []).filter(x => x !== i); if (a2.length) m2[s.code] = a2; else delete m2[s.code]; this.setState({ droppedDcBySC: m2 }); }); } }; }) : [] }; }) };
    }).filter(g => g.count > 0);

    // D. cycle-wide volume-gap roll-up across SELECTED SCs (powers the overall callout + Trigger gate).
    const selScsAll = sel.map(c => d.scs.find(s => s.code === c)).filter(Boolean);
    const volGapScs = selScsAll.map(s => ({ s, gap: scVolGap(s) })).filter(x => x.gap.hasGap);
    const volGapDcTotal = volGapScs.reduce((a, x) => a + x.gap.total, 0);
    const volGapScCount = volGapScs.length;
    const volGapZeroTotal = volGapScs.reduce((a, x) => a + x.gap.zero, 0);
    const volGapMissTotal = volGapScs.reduce((a, x) => a + x.gap.miss, 0);
    const volGapBlock = volGapScCount > 0;

    const PLAN_TYPES = [
      { value: 'LMDC Landing', label: 'LMDC Volume Inputs', rowLabel: 'LMDC', banner: 'For RLH route planning, only LMDC Landing files are used. Select one to activate it for this cycle.' },
      { value: 'LMSC Landing', label: 'LMSC Volume Inputs', rowLabel: 'LMSC', banner: 'LMSC Landing volumes — expected volumes landing at each Last-Mile Sort Centre.' },
      { value: 'FM Hub Manifestation', label: 'FM Hub Volume Inputs', rowLabel: 'FM Hub', banner: 'FM Hub Manifestation — planned shipment volumes per FM Hub.' },
      { value: 'FMSC Manifestation', label: 'FMSC Volume Inputs', rowLabel: 'FMSC', banner: 'FMSC Manifestation — planned volumes per First-Mile Sort Centre.' },
    ];
    // A. RLH creation is LMDC-only — the plan-input-type selector was removed. Lock to LMDC Landing.
    const planInputType = 'LMDC Landing';
    const activePlanType = PLAN_TYPES.find(t => t.value === planInputType) || PLAN_TYPES[0];
    // 2.3: Filter to LMDC Landing only (already done via planInputType), last 4, and search by name.
    const volSearchQ = (st.creationVolSearch || '').toLowerCase();
    const volOptionsAll = d.volumeFiles.filter(f => f.type === planInputType).slice(-4); // last 4 LMDC Landing files
    const volOptions = volOptionsAll.filter(f => !volSearchQ || f.name.toLowerCase().indexOf(volSearchQ) >= 0).map(f => ({ name: f.name, rows: fmtInt(f.rows), vol: fmtL(f.vol), selected: st.creationVolume === f.name,
      bd: st.creationVolume === f.name ? '#003F98' : '#E6EBF2', bg: st.creationVolume === f.name ? '#F3F7FE' : '#FFFFFF', dotBg: st.creationVolume === f.name ? '#003F98' : '#FFFFFF', dotBd: st.creationVolume === f.name ? '#003F98' : '#C3C9D4', dotOp: st.creationVolume === f.name ? '1' : '0',
      // G11 — switching the volume file invalidates prior DC drops (coverage differs). Reset them + re-check.
      onSelect: () => { const changing = !!st.creationVolume && st.creationVolume !== f.name; this.setState({ creationVolume: f.name, droppedDcBySC: changing ? {} : (st.droppedDcBySC || {}) }); if (changing) this.showToast('Volume file changed — DC drops reset; re-check volume coverage', '#C77B00'); } }));
    const planTypeHasFiles = volOptionsAll.length > 0;
    const planTypeNoFiles = volOptions.length === 0;
    const selScs = sel.map(c => d.scs.find(s => s.code === c)).filter(Boolean);
    const refSet = st.refBySC || {};
    const globalRefApplied = !!st.globalRefApplied;
    const refNeeded = globalRefApplied ? 0 : selScs.filter(s => !s.hasRef && !refSet[s.code]).length;
    const scProps = selScs.map(s => {
      const hasRef = s.hasRef || !!refSet[s.code] || globalRefApplied;
      return { code: s.code, name: s.name, zone: s.zone, volCap: fmtInt(s.volCap), docks: s.docks, loc: s.lat.toFixed(2) + ', ' + s.lng.toFixed(2),
        veh: 'ACE ' + (2 + s.dcCount % 4) + ' \u00b7 Bolero ' + (4 + s.dcCount % 6) + ' \u00b7 407 ' + (2 + s.dcCount % 5) + ' \u00b7 14ft ' + (s.dcCount % 3),
        hasRef, needsPick: !hasRef, refLabel: hasRef ? (refSet[s.code] ? 'June 2026 \u00b7 finalised (picked)' : 'June 2026 \u00b7 finalised (auto)') : 'Reference plan required',
        refBg: hasRef ? '#E7F4EC' : '#FBF1DF', refFg: hasRef ? '#128A3E' : '#C77B00',
        onPickRef: () => { const r = Object.assign({}, refSet); r[s.code] = 'June 2026'; this.setState({ refBySC: r }); this.showToast('Reference plan set for ' + s.code, '#128A3E'); },
        onEditVeh: () => this.comingSoon('Edit vehicle availability') };
    });

    const queueActive = st.runQueue.length > 0;
    // Multi-batch: Step 4 shows the Trigger button whenever the CURRENT selection has SCs not yet in the queue
    // (keying off !queueActive dead-ended the 2nd batch — once anything was queued you could never trigger again).
    const selUntriggered = sel.filter(code => !st.runQueue.find(r => r.scCode === code)).length;
    const allDone = queueActive && st.runQueue.every(r => r.status === 'Completed');
    const doneCount = st.runQueue.filter(r => r.status === 'Completed').length;
    // P — status-only summary (no percentage)
    const runQ = st.runQueue;
    const runQueuedN = runQ.filter(r => r.status === 'Queued').length;
    const runProgN = runQ.filter(r => r.status === 'In Progress').length;
    // Header count pills read Planned / In-Progress / Completed (Planned = internal 'Queued' state).
    const runPlannedN = runQueuedN, runDoneN = doneCount;
    const runStatusSummary = runQ.length + ' runs · ' + doneCount + ' completed · ' + runProgN + ' in progress · ' + runQueuedN + ' planned';

    // Step 1 = plan file + SC selection · 2 = Vehicles & HW · 3 = Preview & Trigger
    const canNext = step === 1 ? (!!st.creationVolume && sel.length > 0 && sel.length <= SC_CAP) : step === 2 ? true : step === 3 ? true : false;
    const nextLabel = step === 1 ? 'Operating Mode & HW' : step === 2 ? 'Vehicle Configuration' : step === 3 ? 'Preview & Trigger' : 'Continue';

    // Global HW selector (0, 0.5, 1) + per-SC override
    const hwGlobal = st.hwGlobal !== undefined ? st.hwGlobal : 0.5;
    const hwBySC = st.hwBySC || {};
    const hwOptions = [0, 0.5, 1].map(v => ({ value: v, label: 'HW ' + v, active: hwGlobal === v, bg: hwGlobal === v ? '#003F98' : '#fff', fg: hwGlobal === v ? '#fff' : '#5A5E66', bd: hwGlobal === v ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ hwGlobal: v }) }));
    const gwBg = (v) => hwGlobal === v ? '#003F98' : '#fff';
    const gwFg = (v) => hwGlobal === v ? '#fff' : '#5A5E66';
    const gwBd = (v) => hwGlobal === v ? '#003F98' : '#D0D5DD';
    const customHwCount = Object.keys(hwBySC).filter(code => sel.includes(code) && hwBySC[code] !== hwGlobal).length;
    const scPropsWithHw = scProps.map(p => {
      const scHw = hwBySC[p.code] !== undefined ? hwBySC[p.code] : hwGlobal;
      const hwOverridden = hwBySC[p.code] !== undefined && hwBySC[p.code] !== hwGlobal;
      // C2 — per-SC 3-way HW segmented control (0 / 0.5 / 1). Highlight only an explicit per-row override;
      // rows inheriting the global value stay neutral (0 / 0.5 / 1 all look the same), so the column isn't a wall of highlighted defaults.
      const segActive = (v) => hwBySC[p.code] !== undefined && scHw === v;
      const segBg = (v) => segActive(v) ? '#003F98' : '#fff';
      const segFg = (v) => segActive(v) ? '#fff' : '#5A5E66';
      const segBd = (v) => segActive(v) ? '#003F98' : '#E6EBF2';
      return { ...p, hw: scHw, hwLabel: 'HW ' + scHw, hwOverridden, canResetHw: hwOverridden, hwTagBg: hwOverridden ? '#EAEEFB' : '#F2F5FA', hwTagFg: hwOverridden ? '#2F4FC6' : '#5A5E66',
        hw0Bg: segBg(0), hw0Fg: segFg(0), hw0Bd: segBd(0),
        hw05Bg: segBg(0.5), hw05Fg: segFg(0.5), hw05Bd: segBd(0.5),
        hw1Bg: segBg(1), hw1Fg: segFg(1), hw1Bd: segBd(1),
        onHw0: () => { const h = Object.assign({}, hwBySC); h[p.code] = 0; this.setState({ hwBySC: h }); },
        onHw05: () => { const h = Object.assign({}, hwBySC); h[p.code] = 0.5; this.setState({ hwBySC: h }); },
        onHw1: () => { const h = Object.assign({}, hwBySC); h[p.code] = 1; this.setState({ hwBySC: h }); },
        onResetHw: () => { const h = Object.assign({}, hwBySC); delete h[p.code]; this.setState({ hwBySC: h }); } };
    });


    // Step 2 — per-SC vehicle configuration cards.
    // E/F — columns + parameters derive from the canonical VEH master with Vehicle Master overrides
    // applied: start from d.VEH, apply vehEdits (param overrides), drop vehRemoved, append addedVehTypes.
    // This is the identical override chain mastersVals uses so Master edits/adds/deletes flow here.
    const _ve = st.vehEdits || {}, _vr = st.vehRemoved || {};
    const VEHM = (d.VEH || []).filter(v => !_vr[v.name]).map(v => {
      const ov = _ve[v.name] || {};
      return Object.assign({}, v, { cap: ov.capacity != null ? ov.capacity : v.cap, dist: ov.dist != null ? ov.dist : v.dist, tp: ov.hardCap != null ? ov.hardCap : v.tp, feas: ov.feas ? ov.feas : v.feas });
    }).concat((st.addedVehTypes || []).map(v => {
      const ov = _ve[v.name] || {};
      return { name: v.name, cap: ov.capacity != null ? ov.capacity : (v.capacity || v.cap || 2000), dist: ov.dist != null ? ov.dist : (v.dist || 600), tp: ov.hardCap != null ? ov.hardCap : (v.tp || 7), feas: ov.feas ? ov.feas : (v.feas || ['RLH']) };
    }));
    const vehMeta = (name) => VEHM.find(x => x.name === name) || VEHM[0] || { name: name, cap: 2000, tp: 7, dist: 600 };
    const vehDistOf = (name) => { const v = VEHM.find(x => x.name === name); return v ? v.dist : 600; };
    const VMMAXCNT = 8;
    // Only vehicles marked RLH-feasible in the Vehicle Master are offered for RLH route planning (US4).
    const vehTypeOptionsFor = (sel) => VEHM.filter(x => (x.feas || ['RLH']).indexOf('RLH') >= 0).map(x => ({ value: x.name, label: x.name, selected: x.name === sel }));
    // Default set uses canonical master vehicle types so capacity/dist/TP resolve cleanly.
    const DEFAULT_SC_VEHICLES = [
      { type: (VEHM[0] || {}).name || 'TATA ACE / 7ft', count: 4, zoneFeas: 'Both' },
      { type: (VEHM[1] || {}).name || 'Bolero / 8ft', count: 2, zoneFeas: 'Both' },
    ];
    const vehiclesBySC = st.vehiclesBySC || {};
    // M/O \u2014 per-SC vehicle summary for Step 3 (carry forward from Step 2). Resolves vehicle params
    // from the live VEHM (same override chain as Step 2) so totals + TP/distance validation match.
    const VEHM3 = VEHM; // already built above with vehEdits/vehRemoved/addedVehTypes applied
    const vehMeta3 = (name) => VEHM3.find(x => x.name === name) || VEHM3[0] || { cap: 2000, tp: 7, dist: 600 };
    const vehDist3 = (name) => { const v = VEHM3.find(x => x.name === name); return v ? v.dist : 600; };
    const DEFAULT_VEH3 = [ { type: (VEHM3[0] || {}).name || 'TATA ACE / 7ft', count: 4 }, { type: (VEHM3[1] || {}).name || 'Bolero / 8ft', count: 2 } ];
    const vehiclesBySC3 = st.vehiclesBySC || {};
    const vehSummaryFor = (code, far) => {
      const rows = vehiclesBySC3[code] || DEFAULT_VEH3;
      const usedDefault = !vehiclesBySC3[code];
      const totalVeh = rows.reduce((a, v) => a + (parseInt(v.count) || 0), 0);
      // O.1 TP validation \u2014 entered TP must not exceed the vehicle-master TP limit (error).
      const tpViol = rows.filter(v => { const m = vehMeta3(v.type); const tp = v.tp == null ? m.tp : v.tp; return (parseInt(v.count) || 0) > 0 && tp > m.tp; })
        .map(v => { const m = vehMeta3(v.type); return v.type + ' (TP ' + (v.tp == null ? m.tp : v.tp) + ' > limit ' + m.tp + ')'; });
      // O.2 distance-limit \u2014 farthest DC must be within the distance limit of every active vehicle.
      const distViol = rows.filter(v => (parseInt(v.count) || 0) > 0 && far > vehDist3(v.type))
        .map(v => v.type + ' (limit ' + vehDist3(v.type) + ' km < farthest ' + far + ' km)');
      // O.3 under-range — farthest DC under 40% of the largest active vehicle's range → oversized vehicle (warning).
      const activeV = rows.filter(v => (parseInt(v.count) || 0) > 0);
      const largestDist = activeV.length ? Math.max.apply(null, activeV.map(v => vehDist3(v.type))) : 0;
      const underUtil = !usedDefault && largestDist > 0 && far > 0 && far < 0.4 * largestDist;
      return { rows, usedDefault, totalVeh, tpViol, distViol, largestDist: largestDist, underUtil: underUtil };
    };
    // Preview cards include per-SC HW
    const previewCardsWithHw = selScs.map((s, i) => {
      const hasRef = s.hasRef || !!refSet[s.code];
      const scHw = hwBySC[s.code] !== undefined ? hwBySC[s.code] : hwGlobal;
      // O.2 resolution — the distance-limit flag's own fix is "drop the far node". If the planner has
      // dropped ANY DC from this SC's run (droppedDcBySC), treat the offending farthest node as removed,
      // so the effective farthest distance is 0 and the distance-limit validation clears honestly.
      // (The alternative fix — adding a longer-range vehicle in Step 2 — still works because
      // vehSummaryFor recomputes distViol from the current vehicle set.)
      const effFar = (droppedFor(s.code).length > 0) ? 0 : (s.farDist || 0);
      const vsum = vehSummaryFor(s.code, effFar);
      const flags = [];
      if (!hasRef && (scHw > 0 || st.newNodeMode)) flags.push({ t: 'Reference plan required \u2014 pick one in the row below (needed when Historical Weight is above 0 or New-Node Addition mode is on).', sev: 'danger', dot: '#D14B4B', k: 'ref' });
      // O.1 \u2014 TP validation (error): vehicle touchpoints can't exceed the master TP limit.
      vsum.tpViol.forEach(t => flags.push({ t: 'Touchpoints exceed vehicle-master limit: ' + t + '. Reduce TP in Vehicle Config or the DS plan may be infeasible.', sev: 'danger', dot: '#D14B4B', k: 'tp' }));
      // O.2 \u2014 distance-limit violation (error): farthest DC beyond the vehicle distance limit.
      vsum.distViol.forEach(t => flags.push({ t: 'Distance limit exceeded \u2014 ' + t + '. Farthest DC is out of range; add a longer-range vehicle or drop the far node.', sev: 'danger', dot: '#D14B4B', k: 'dist' }));
      // #3 \u2014 missing SC location/dock is a blocking error (manually-added SCs lack coords/docks).
      if (!s.lat || !s.lng || !s.docks) flags.push({ t: 'Missing SC location or dock data \u2014 add coordinates and RLH docks in the SC Master before triggering this SC.', sev: 'danger', dot: '#D14B4B', k: 'loc' });
      // #4 \u2014 sort-capacity & volume-capacity breach warnings (planned volume vs the SC masters).
      if (s.sortCap && s.volume > s.sortCap) flags.push({ t: 'Sort-capacity breach \u2014 planned volume (' + s.volume.toLocaleString('en-IN') + ') exceeds SC sort capacity (' + s.sortCap.toLocaleString('en-IN') + '). Drop nodes or raise capacity in the SC Master.', sev: 'warning', dot: '#C77B00' });
      if (s.volCap && s.volume > s.volCap) flags.push({ t: 'Volume-capacity breach \u2014 planned volume (' + s.volume.toLocaleString('en-IN') + ') exceeds SC volume capacity (' + s.volCap.toLocaleString('en-IN') + ').', sev: 'warning', dot: '#C77B00' });
      // #5 \u2014 oversized-vehicle (under-range) warning.
      if (vsum.underUtil) flags.push({ t: 'Largest vehicle may be oversized \u2014 farthest DC (' + effFar + ' km) is under 40% of its ' + vsum.largestDist + ' km range. Consider a smaller vehicle to lift utilisation.', sev: 'warning', dot: '#C77B00', k: 'underutil' });
      // 2.6 \u2014 zero/missing-volume LMDC error (hard block).
      if ((s.zeroVolDc || 0) > 0 || (s.missVolDc || 0) > 0) {
        const zv = (s.zeroVolDc || 0) + (s.missVolDc || 0);
        flags.push({ t: zv + (zv === 1 ? ' LMDC has' : ' LMDCs have') + ' zero or missing volume \u2014 remove the node(s) from this run or update projections in the volume file.', sev: 'danger', dot: '#D14B4B', k: 'zeroval' });
      }
      // 2.6 \u2014 coverage flag: high per-DC volume concentration warning.
      const avgVolPerDc = s.dcCount > 0 ? Math.round(s.volume / s.dcCount) : 0;
      if (avgVolPerDc > 380 && s.dcCount < 110) {
        flags.push({ t: 'Coverage flag \u2014 high per-DC volume concentration (' + fmtInt(avgVolPerDc) + ' shpmt avg). Verify the largest available vehicle can service the highest-volume DCs.', sev: 'warning', dot: '#C77B00', k: 'coverage' });
      }
      const qe = st.runQueue.find(r => r.scCode === s.code);
      // PARITY §12 — run-queue columns: Run Name (SC code · HW · cycle), Ref Plan (per-SC reference),
      // Triggered (deterministic cycle timestamp, staggered per row so the queue reads like a real fire log).
      const hasRefRun = s.hasRef || !!refSet[s.code] || globalRefApplied;
      const runName = s.code + ' · HW' + String(scHw).replace('.', '_') + ' · Jul26';
      const refPlanLabel = scHw === 0 ? '— (HW 0)' : hasRefRun ? 'June 2026 · finalised' : 'Required';
      const trigMin = (i * 7) % 60, trigHr = 9 + Math.floor((i * 7) / 60);
      const triggered = '24 Jun · ' + String(trigHr).padStart(2, '0') + ':' + String(trigMin).padStart(2, '0');
      const PLANNERS_CRE = ['Pranita Sapkal', 'Komal Rao', 'Dixan Mehta'];
      const triggeredBy = PLANNERS_CRE[(i + 1) % PLANNERS_CRE.length];
      const acked = !!(st.ackedSCs || {})[s.code];
      const hasFlagsNotAcked = flags.length > 0 && !acked;
      const cardBd = hasFlagsNotAcked ? '#F0D9A4' : (acked ? '#C5DFC9' : '#E6EBF2');
      const refBg = scHw === 0 ? '#F2F5FA' : hasRefRun ? '#E7F4EC' : '#FBF1DF';
      const refFg = scHw === 0 ? '#8E96A3' : hasRefRun ? '#128A3E' : '#C77B00';
      const refPlanLabelShort = scHw === 0 ? 'Not needed' : hasRefRun ? 'June 2026' : 'Required';
      // M — carry forward totals: nodes (dcCount), VOLUME, total VEHICLES selected per SC.
      const volL = fmtL(s.volume);
      const pickedRef = !!refSet[s.code];
      // I — per-row reference-plan picker required when HW > 0 OR New-Node Addition mode is on.
      const refRequired = (scHw > 0 || !!st.newNodeMode);
      const refNeedsPick = refRequired && !hasRefRun;
      const refIsAuto = refRequired && hasRefRun && !pickedRef && !globalRefApplied; // carried-forward smart default
      const refChosen = refSet[s.code] || 'June 2026';
      return { code: s.code, name: s.name, zone: s.zone, dcCount: s.dcCount, hw: scHw, hwLabel: 'HW ' + scHw,
        volume: volL, totalVeh: vsum.totalVeh, vehDefault: vsum.usedDefault,
        vehLabel: vsum.usedDefault ? 'DS default set' : (vsum.totalVeh + (vsum.totalVeh === 1 ? ' vehicle' : ' vehicles')),
        vehFg: vsum.usedDefault ? '#8E96A3' : (vsum.totalVeh === 0 ? '#C77B00' : '#14171F'),
        runName, refPlanLabel: refPlanLabelShort, refMissing: refNeedsPick, triggered, triggeredBy,
        // I — per-row ref-plan controls (real picker: choose a prior finalised plan for this SC, latest → oldest)
        refNeedsPick, refIsAuto, refNotNeeded: !refRequired, refPicked: pickedRef || globalRefApplied,
        refShowSelect: refRequired, refCurrentVal: refRequired ? (globalRefApplied ? 'June 2026' : (pickedRef ? refChosen : (s.hasRef ? 'June 2026' : ''))) : '',
        refRowLabel: !refRequired ? 'Not needed (HW 0)' : refNeedsPick ? 'Pick a reference plan' : (pickedRef ? refChosen : globalRefApplied ? 'June 2026 · applied to all' : refChosen + ' · auto'),
        refOptions: [{ value: 'June 2026', label: 'June 2026 · finalised' }, { value: 'May 2026', label: 'May 2026 · finalised' }, { value: 'April 2026', label: 'April 2026 · finalised' }],
        onPickRefSel: (e) => { if (!e.target.value) return; const r = Object.assign({}, this.state.refBySC || {}); r[s.code] = e.target.value; this.setState({ refBySC: r }); this.showToast(e.target.value + ' set as reference plan for ' + s.code, '#128A3E'); },
        onClearRef: () => { const r = Object.assign({}, this.state.refBySC || {}); delete r[s.code]; this.setState({ refBySC: r }); },
        onOpenRef: () => this.showToast('Opening ' + refChosen + ' — reference plan (opens in a new tab)', '#1E6FB8'),
        hasFlags: flags.length > 0, clean: flags.length === 0, flags: flags.map(f => ({ t: f.t, dot: f.dot, sevLabel: f.sev === 'danger' ? 'Error' : 'Warning', sevFg: f.sev === 'danger' ? '#D14B4B' : '#C77B00', sevBg: f.sev === 'danger' ? '#FAFBFD' : '#FBF1DF', sevAccent: f.sev === 'danger' ? '3px solid #D14B4B' : '0' })), flagLabel: flags.length + (flags.length === 1 ? ' flag' : ' flags'),
        hasErrors: flags.some(f => f.sev === 'danger'),
        // F3 — tri-state readiness: errors block; warn-only rows are non-blocking but must not read as clean.
        warnOnly: flags.length > 0 && !flags.some(f => f.sev === 'danger'),
        readiness: flags.some(f => f.sev === 'danger') ? 'error' : (flags.length > 0 ? 'warn' : 'clean'),
        readinessLabel: flags.some(f => f.sev === 'danger') ? 'Blocked' : (flags.length > 0 ? (flags.length + (flags.length === 1 ? ' warning' : ' warnings')) : 'Ready'),
        readinessFg: flags.some(f => f.sev === 'danger') ? '#D14B4B' : (flags.length > 0 ? '#C77B00' : '#128A3E'),
        readinessBg: flags.some(f => f.sev === 'danger') ? '#FBEAEA' : (flags.length > 0 ? '#FBF1DF' : '#E7F4EC'),
        // F4 — MODE derivation: HW 0 = free re-optimise; HW>0 = stability-weighted; New-node scan is batch-wide.
        modeLabel: (scHw === 0 ? 'Re-optimise' : 'Stability · HW ' + scHw) + (st.newNodeMode ? ' + New-node scan' : ''),
        // Per-row Fix (Step-4 recap): route by this row's OWN first blocking flag — ref→Step 2, TP/distance→Step 3,
        // missing location→SC Master (no wizard step fixes it). Clears filters + focuses the SC so it's visible.
        onFixRow: () => {
          const fd = flags.find(f => f.sev === 'danger');
          const kind = fd ? fd.k : null;
          if (kind === 'loc') { this.showToast('Add ' + s.code + ' location & docks in the SC Master before triggering', '#C77B00'); return; }
          // Route to Step 1 (Plan File & Sort Centres) so the planner can drop the SC with 0 volume.
          this.setState({ view: 'creation', creationView: 'wizard', creationStep: 1, fixReturnStep: 4, focusSC: s.code, creationSearch: '', creationZone: 'All' });
          setTimeout(() => { try { const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; const el = Array.from(document.querySelectorAll('span')).find(n => (n.textContent || '').trim() === s.code); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); } catch (e) {} }, 140);
        },
        acked, hasFlagsNotAcked, cardBd, refBg, refFg, focusBd: st.focusSC === s.code ? '3px solid #003F98' : '3px solid transparent', focusBg: st.focusSC === s.code ? '#F3F7FE' : 'transparent',
        sortCap: fmtInt(s.sortCap), volFile: st.creationVolume || '—', volFg: st.creationVolume ? '#14171F' : '#8E96A3',
        hw0Bg: scHw === 0 ? '#003F98' : '#fff', hw0Fg: scHw === 0 ? '#fff' : '#5A5E66', hw0Bd: scHw === 0 ? '#003F98' : '#E6EBF2',
        hw05Bg: scHw === 0.5 ? '#003F98' : '#fff', hw05Fg: scHw === 0.5 ? '#fff' : '#5A5E66', hw05Bd: scHw === 0.5 ? '#003F98' : '#E6EBF2',
        hw1Bg: scHw === 1 ? '#003F98' : '#fff', hw1Fg: scHw === 1 ? '#fff' : '#5A5E66', hw1Bd: scHw === 1 ? '#003F98' : '#E6EBF2',
        onHw0: () => { const h = Object.assign({}, hwBySC); h[s.code] = 0; this.setState({ hwBySC: h }); },
        onHw05: () => { const h = Object.assign({}, hwBySC); h[s.code] = 0.5; this.setState({ hwBySC: h }); },
        onHw1: () => { const h = Object.assign({}, hwBySC); h[s.code] = 1; this.setState({ hwBySC: h }); },
        onAck: () => { const a = Object.assign({}, this.state.ackedSCs || {}); a[s.code] = true; this.setState({ ackedSCs: a }); },
        // P — status-only run state (no real percentage; the async Gurobi solve has no % signal).
        // Display terminology follows the reference design: not-yet-started reads as "Planned" (internal
        // state key stays 'Queued'). Progress is status-derived: Completed → 100% full green bar,
        // In-Progress → indeterminate animated bar, Planned → dashed empty bar + "—".
        queued: !!qe,
        status: qe ? (qe.status === 'Queued' ? 'Planned' : qe.status) : 'Planned',
        isRunning: !!qe && qe.status === 'In Progress', isQueued: !!qe && qe.status === 'Queued', isDoneRun: !!qe && qe.status === 'Completed',
        newNode: !!st.newNodeMode, newNodeOff: !st.newNodeMode, newNodeLabel: st.newNodeMode ? 'On' : '—',
        progressLabel: (qe && qe.status === 'Completed') ? '100%' : (qe && qe.status === 'In Progress') ? '…' : '—',
        statusBg: qe ? (qe.status === 'Completed' ? '#E7F4EC' : qe.status === 'In Progress' ? '#FBF1DF' : '#F2F5FA') : '#F2F5FA',
        statusFg: qe ? (qe.status === 'Completed' ? '#128A3E' : qe.status === 'In Progress' ? '#C77B00' : '#5A5E66') : '#5A5E66',
        barBg: qe && qe.status === 'Completed' ? '#128A3E' : '#003F98' };
    });
    // G2 — Run Queue rows derive from st.runQueue (selection-INDEPENDENT), so SCs still running stay visible
    // after "Add more plans" clears the Step-1 selection. In-flight only: Completed rows drop to Design Review.
    const _QPLANNERS = ['Pranita Sapkal', 'Komal Rao', 'Dixan Mehta'];
    const queueRows = (st.runQueue || []).map((r, i) => {
      const s = d.scs.find(x => x.code === r.scCode) || { code: r.scCode, name: r.scCode, zone: '—' };
      const scHw = hwBySC[r.scCode] !== undefined ? hwBySC[r.scCode] : hwGlobal;
      const hasRefRun = s.hasRef || !!refSet[r.scCode] || globalRefApplied;
      const trigMin = (i * 7) % 60, trigHr = 9 + Math.floor((i * 7) / 60);
      return {
        code: s.code, name: s.name, hw: scHw,
        runName: s.code + ' · HW' + String(scHw).replace('.', '_') + ' · Jul26',
        refPlanLabel: scHw === 0 ? 'Not needed' : hasRefRun ? 'June 2026' : 'Required',
        newNode: !!st.newNodeMode, newNodeOff: !st.newNodeMode,
        triggered: '24 Jun · ' + String(trigHr).padStart(2, '0') + ':' + String(trigMin).padStart(2, '0'),
        triggeredBy: _QPLANNERS[(i + 1) % _QPLANNERS.length],
        status: r.status === 'Queued' ? 'Planned' : r.status,
        isRunning: r.status === 'In Progress', isQueued: r.status === 'Queued', isDoneRun: r.status === 'Completed',
        etaLabel: r.status === 'In Progress' ? '~' + NDC_RUN_MINUTES + ' min' : (r.status === 'Queued' ? 'Waiting' : ''),
        statusBg: r.status === 'In Progress' ? '#FBF1DF' : '#F2F5FA',
        statusFg: r.status === 'In Progress' ? '#C77B00' : '#5A5E66',
      };
    }).filter(r => !r.isDoneRun);
    const step3RefNeededCount = previewCardsWithHw.filter(c => c.refMissing).length;
    // L — per-row "select to trigger" removed: everything selected in Step 1 runs. Errors block.
    const trigSelCount = selScs.length;
    const step3ErrorCount = previewCardsWithHw.filter(c => c.hasErrors).length;

    // 2.6 — Aggregate validation flags across selected SCs for the step-4 Validation panel.
    // Group by flag key so "zeroval across 3 SCs" renders as one row listing all three.
    const _step4FlagAgg = {};
    previewCardsWithHw.forEach(c => {
      (c.flags || []).forEach(f => {
        const key = f.k || f.t.slice(0, 40);
        if (!_step4FlagAgg[key]) {
          // c.flags are processed (sevLabel='Error'|'Warning'; sev/k stripped). Use sevLabel to detect errors.
          const isError = f.sevLabel === 'Error';
          // Build a short title from the flag text (up to first em-dash or 70 chars).
          const rawTitle = f.t.split('—')[0].replace(/\d+ LMDCs? ha(s|ve) /, 'LMDC(s) with ').trim();
          const title = rawTitle.length > 70 ? rawTitle.slice(0, 70) + '…' : rawTitle;
          _step4FlagAgg[key] = { title, sevLabel: isError ? 'Error' : 'Warning', sevFg: isError ? '#D14B4B' : '#C77B00', sevBg: isError ? '#FBEAEA' : '#FBF1DF', scs: [], isError };
        }
        _step4FlagAgg[key].scs.push(c.code);
      });
    });
    const step4FlagsList = Object.values(_step4FlagAgg)
      .sort((a, b) => (b.isError ? 1 : 0) - (a.isError ? 1 : 0))
      .map(x => ({ title: x.title, sevLabel: x.sevLabel, sevFg: x.sevFg, sevBg: x.sevBg, scList: x.scs.join(', '), hasSCs: x.scs.length > 0, isError: x.isError }));
    const step4ErrorFlagCount = step4FlagsList.filter(f => f.isError).length;
    const step4WarnFlagCount = step4FlagsList.filter(f => !f.isError).length;
    const step4AnyFlags = step4FlagsList.length > 0 && trigSelCount > 0;
    const step4HasErrorFlags = step4ErrorFlagCount > 0;
    const step4HasWarnFlags = step4WarnFlagCount > 0;

    // F5 — Step-4 batch stats (reflects what WILL be triggered — selection-scoped, independent of the queue).
    const batchVolLabel = fmtL(selScs.reduce((a, s) => a + (s.volume || 0), 0));
    const batchDcTotal = fmtInt(selScs.reduce((a, s) => a + (s.dcCount || 0), 0));
    const _estMin = Math.ceil((selScs.length || 0) / NDC_CONCURRENCY) * NDC_RUN_MINUTES;
    const estLabel = _estMin <= 0 ? '—' : _estMin < 60 ? (_estMin + ' min') : (_estMin % 60 === 0 ? (_estMin / 60 + ' h') : (Math.floor(_estMin / 60) + ' h ' + (_estMin % 60) + ' min'));
    // F2 — ONE block predicate: Step-4 banner + footer button styling + red jump-link + triggerAll all read this.
    const noSel = sel.length === 0;
    const triggerBlocked = noSel || volGapBlock || step3ErrorCount > 0 || step3RefNeededCount > 0;
    const triggerBlockReason = noSel ? 'No sort centres selected — go to Step 1'
      : volGapBlock ? (volGapDcTotal + ' DC' + (volGapDcTotal === 1 ? '' : 's') + ' missing volume — fix in Step 1')
      : step3ErrorCount > 0 ? (step3ErrorCount + ' SC' + (step3ErrorCount === 1 ? ' has' : 's have') + ' blocking validations')
      : (step3RefNeededCount + ' SC' + (step3RefNeededCount === 1 ? ' needs' : 's need') + ' a reference plan');
    // B — Step-4 recap: not-ready first (rendered always), clean rows behind an expander.
    const recapNotReady = previewCardsWithHw.filter(c => c.readiness !== 'clean');
    const recapClean = previewCardsWithHw.filter(c => c.readiness === 'clean');
    const cleanRecapCount = recapClean.length, notReadyRecapCount = recapNotReady.length;

    // Step 2
    const addingVehicleSC = st.addingVehicleSC || null;
    const defAddForm = () => ({ type: (VEHM[0] || {}).name || 'TATA ACE / 7ft', count: 1, tp: (VEHM[0] || {}).tp || 7, zoneFeas: 'Both' });
    const addVehicleForm = st.addVehicleForm || defAddForm();
    const zoneFeasStyle = (zf) => ({ zfBg: zf === 'Both' ? '#EAEEFB' : zf === 'Local' ? '#E7F0F8' : '#FBEAF1', zfFg: zf === 'Both' ? '#2F4FC6' : zf === 'Local' ? '#1E6FB8' : '#C03977' });
    // Item 3 — conditional Vehicle Config: a historical plan in play (any SC HW>0, or New-Node mode) makes the vehicle list add-only (no edit/delete of existing rows).
    const vehAddOnly = previewCardsWithHw.some(c => c.hw > 0) || !!st.newNodeMode;
    const scVehicleCards = selScs.map(s => {
      const rows = vehiclesBySC[s.code] || DEFAULT_SC_VEHICLES;
      const isAdding = addingVehicleSC === s.code;
      // G4 — add-only lock is PER-SC: this SC's own HW>0 (historical plan in play), or global New-Node mode.
      // One SC at HW>0 no longer freezes edit/delete on every other SC's rows.
      const cardHw = hwBySC[s.code] !== undefined ? hwBySC[s.code] : hwGlobal;
      const cardAddOnly = cardHw > 0 || !!st.newNodeMode;
      const totalCount = rows.reduce((a, v) => a + (parseInt(v.count) || 0), 0);
      // G — TP-limit is a WARNING only here: flag rows whose entered TP exceeds the master TP limit.
      const tpWarnRows = rows.filter(v => { const m = vehMeta(v.type); const tp = v.tp == null ? m.tp : v.tp; return tp > m.tp; });
      const afMeta = vehMeta(addVehicleForm.type);
      const afTp = addVehicleForm.tp == null ? afMeta.tp : addVehicleForm.tp;
      const afTpWarn = afTp > afMeta.tp;
      const afCap = addVehicleForm.cap == null ? afMeta.cap : addVehicleForm.cap;
      return {
        code: s.code, name: s.name, zone: s.zone,
        sortCap: fmtInt(s.sortCap), dcCount: s.dcCount, totalCount,
        empty: rows.length === 0, notEmpty: rows.length > 0,
        tpWarn: tpWarnRows.length > 0, tpWarnLabel: tpWarnRows.length + ' over TP limit',
        isAdding, notAdding: !isAdding,
        vehTypeOptions: vehTypeOptionsFor(addVehicleForm.type),
        addForm: {
          type: addVehicleForm.type, count: addVehicleForm.count, tp: afTp, cap: afCap, vmCap: afMeta.cap, vmTp: afMeta.tp,
          tpWarn: afTpWarn, tpBd: afTpWarn ? '#E0B84A' : '#E6EBF2',
          tpWarnText: 'Entered TP ' + afTp + ' exceeds the vehicle-master limit of ' + afMeta.tp + ' — allowed for simulation, but the DS plan may be infeasible.',
          onTypeChange: (e) => { const m = vehMeta(e.target.value); this.setState({ addVehicleForm: Object.assign({}, this.state.addVehicleForm || defAddForm(), { type: e.target.value, tp: m.tp, cap: m.cap }) }); },
          onCountChange: (e) => this.setState({ addVehicleForm: Object.assign({}, this.state.addVehicleForm || defAddForm(), { count: parseInt(e.target.value) || 1 }) }),
          onTpChange: (e) => this.setState({ addVehicleForm: Object.assign({}, this.state.addVehicleForm || defAddForm(), { tp: parseInt(e.target.value) || 1 }) }),
          onCapChange: (e) => this.setState({ addVehicleForm: Object.assign({}, this.state.addVehicleForm || defAddForm(), { cap: e.target.value }) }),
          onZoneFeasChange: (e) => this.setState({ addVehicleForm: Object.assign({}, this.state.addVehicleForm || defAddForm(), { zoneFeas: e.target.value }) }),
          onAdd: () => {
            const avf = this.state.addVehicleForm || defAddForm();
            const base = ((this.state.vehiclesBySC || {})[s.code] || DEFAULT_SC_VEHICLES).slice();
            const m = vehMeta(avf.type);
            const capRaw = (avf.cap === '' || avf.cap == null) ? null : parseInt(avf.cap);
            const row = { type: avf.type, count: avf.count || 1, tp: avf.tp, zoneFeas: avf.zoneFeas || 'Both', added: true };
            if (capRaw != null && !isNaN(capRaw) && capRaw !== m.cap) row.capOverride = capRaw;
            base.push(row);
            const vbs = Object.assign({}, this.state.vehiclesBySC || {}); vbs[s.code] = base;
            this.setState({ vehiclesBySC: vbs, addingVehicleSC: null, addVehicleForm: null });
          },
          onCancel: () => this.setState({ addingVehicleSC: null, addVehicleForm: null }),
        },
        vehicleRows: rows.map((v, vi) => {
          const m = vehMeta(v.type); const tp = v.tp == null ? m.tp : v.tp;
          const cnt = parseInt(v.count) || 0; const tpOver = tp > m.tp; const cntOver = cnt > VMMAXCNT;
          const exceeds = tpOver || cntOver; const zfs = zoneFeasStyle(v.zoneFeas || 'Both');
          const rowKey = s.code + '|' + vi;
          const rowEditing = (st.editVehRowKey || null) === rowKey;
          const rd = rowEditing ? (st.editVehRowDraft || {}) : {};
          const rdType = rowEditing ? (rd.type || v.type) : v.type;
          const rdCnt = rowEditing ? (rd.cnt != null ? rd.cnt : cnt) : cnt;
          const rdTp = rowEditing ? (rd.tp != null ? rd.tp : tp) : tp;
          const rdZf = rowEditing ? (rd.zf || v.zoneFeas || 'Both') : (v.zoneFeas || 'Both');
          const rdM = vehMeta(rdType);
          const rdCap = rowEditing ? (rd.capOverride != null ? rd.capOverride : rdM.cap) : m.cap;
          const rdDist = rowEditing ? (rd.distOverride != null ? rd.distOverride : rdM.dist) : m.dist;
          const rdTpOver = rowEditing ? (parseInt(rdTp) || 0) > rdM.tp : tpOver;
          const rdZfs = zoneFeasStyle(rdZf);
          const rdSet = (patch) => { this.setState({ editVehRowDraft: Object.assign({}, this.state.editVehRowDraft || {}, patch) }); };
          const ZF3 = ['Both', 'Local', 'Non-Local'];
          const rdZfChips = ZF3.map(z => ({ label: z, active: rdZf === z, bg: rdZf === z ? rdZfs.zfBg : '#F2F5FA', fg: rdZf === z ? rdZfs.zfFg : '#5A5E66', bd: rdZf === z ? rdZfs.zfFg : '#E6EBF2', onSelect: () => rdSet({ zf: z }) }));
          const persist = (mut) => { const base = ((this.state.vehiclesBySC || {})[s.code] || DEFAULT_SC_VEHICLES).slice(); base[vi] = Object.assign({}, base[vi], mut); const vbs = Object.assign({}, this.state.vehiclesBySC || {}); vbs[s.code] = base; this.setState({ vehiclesBySC: vbs }); };
          return {
            type: v.type, count: cnt, tp: tp, vmTp: m.tp, cap: fmtInt(v.capOverride != null ? v.capOverride : m.cap), dist: (v.distOverride != null ? v.distOverride : vehDistOf(v.type)) + ' km',
            serveType: v.zoneFeas || 'Both', zfBg: zfs.zfBg, zfFg: zfs.zfFg,
            tpBd: tpOver ? '#E0B84A' : '#E6EBF2', tpBg: tpOver ? '#FBF1DF' : '#fff', tpFg: tpOver ? '#C77B00' : '#14171F',
            vmLabel: exceeds ? 'Exceeds limit' : 'OK', vmBg: exceeds ? '#FBEAEA' : '#E7F4EC', vmFg: exceeds ? '#D14B4B' : '#128A3E',
            // inline edit
            // G5 — a row the planner ADDED in add-only mode stays editable/deletable (else a fat-finger Add is stuck).
            rowEditing: rowEditing, rowNotEditing: !rowEditing, rowShowControls: !rowEditing && (!cardAddOnly || !!v.added),
            rdType: rdType, rdCnt: rdCnt, rdTp: rdTp, rdZf: rdZf,
            rdCap: fmtInt(rdCap), rdDist: vehDistOf(rdType) + ' km', rdCapVal: rdCap, rdDistVal: rdDist,
            rdTpBd: rdTpOver ? '#E0B84A' : '#C3C9D4',
            rdZfBg: rdZfs.zfBg, rdZfFg: rdZfs.zfFg,
            rdZfChips: rowEditing ? rdZfChips : [],
            onDraftCnt: (e) => rdSet({ cnt: e.target.value }),
            onDraftTp: (e) => rdSet({ tp: e.target.value }),
            onDraftCap: (e) => rdSet({ capOverride: e.target.value }),
            onDraftDist: (e) => rdSet({ distOverride: e.target.value }),
            onEditRow: () => this.setState({ editVehRowKey: rowKey, editVehRowDraft: { type: v.type, cnt: cnt, tp: tp, zf: v.zoneFeas || 'Both', capOverride: m.cap, distOverride: m.dist } }),
            onSaveVehRow: () => {
              const rd2 = this.state.editVehRowDraft || {};
              const pi = (x) => { const n = parseInt(String(x == null ? '' : x).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
              persist({ type: rd2.type || v.type, count: pi(rd2.cnt), tp: pi(rd2.tp), zoneFeas: rd2.zf || v.zoneFeas || 'Both', capOverride: pi(rd2.capOverride), distOverride: pi(rd2.distOverride) });
              this.setState({ editVehRowKey: null, editVehRowDraft: null });
              this.showToast((rd2.type || v.type) + ' updated in ' + s.code, '#128A3E');
            },
            onCancelVehRow: () => this.setState({ editVehRowKey: null, editVehRowDraft: null }),
            onCountChange: (e) => persist({ count: parseInt(e.target.value) || 0 }),
            onTpChange: (e) => persist({ tp: parseInt(e.target.value) || 1 }),
            onZoneChange: (e) => persist({ zoneFeas: e.target.value }),
            onDelete: () => { const base = ((this.state.vehiclesBySC || {})[s.code] || DEFAULT_SC_VEHICLES).slice(); const removed = base[vi]; base.splice(vi, 1); const vbs = Object.assign({}, this.state.vehiclesBySC || {}); vbs[s.code] = base; this.setState({ vehiclesBySC: vbs }); this.showToast((v.type || 'Vehicle row') + ' removed from ' + s.code, '#D14B4B', () => { const b2 = ((this.state.vehiclesBySC || {})[s.code] || DEFAULT_SC_VEHICLES).slice(); b2.splice(vi, 0, removed); const vb2 = Object.assign({}, this.state.vehiclesBySC || {}); vb2[s.code] = b2; this.setState({ vehiclesBySC: vb2 }); }); },
          };
        }),
        onAddVehicle: () => this.setState({ addingVehicleSC: s.code, addVehicleForm: defAddForm() }),
      };
    });

    // Network-tier placeholder selector (RLH built; NLH + FM Carting arrive in a future cycle).
    // Re-added per Vignesh's "within routing they choose FM / NLH / RLH" (sprint-connect 2026-06-30);
    // mirrors the Design-Ingestion tab pattern. RLH is the only active tier in V1.
    const CTIER = [['RLH', 'Regional Linehaul (LMSC → LMDC) — the V1 network tier', false], ['NLH', 'National Linehaul — arriving in a future cycle', true], ['FM Carting', 'First-Mile carting — arriving in a future cycle', true]];
    const creationTierSeg = CTIER.map(t => ({ label: t[0], sub: t[1], soon: t[2], active: t[0] === 'RLH',
      bg: t[0] === 'RLH' ? '#EAEEFB' : '#fff', bd: t[0] === 'RLH' ? '#003F98' : '#E6EBF2',
      fg: t[0] === 'RLH' ? '#003F98' : (t[2] ? '#8E96A3' : '#5A5E66'), weight: t[0] === 'RLH' ? '700' : '600',
      onClick: t[2] ? (() => this.showToast(t[0] + ' planning — coming in a future cycle', '#1E6FB8')) : (() => {}) }));

    return {
      isCreation: st.view === 'creation', creationStep: step, isStep1: step === 1, isStep2: step === 2, isStep3: step === 3, isStep4: step === 4, vehAddOnly: vehAddOnly, step1HasFile: step === 1 && !!st.creationVolume, step1NoFile: step === 1 && !st.creationVolume,
      creationTierSeg,
      isWizardView: (st.creationView || 'wizard') === 'wizard', isQueueView: (st.creationView || 'wizard') === 'queue',
      stepper, planGroupName: planGroup.name, planGroupTriggered: planGroup.triggered, planGroupCap: planGroup.cap, planGroupPct: planGroup.pct + '%',
      scGroups, creationSelCount: sel.length, creationShown: filtered.length, creationTotal: d.scs.length, creationSearch: st.creationSearch || '',
      onCreationSearch: (e) => this.setState({ creationSearch: e.target.value }),
      creationZoneChips: ['All', 'North', 'South', 'East', 'West', 'Central'].map(z => ({ label: z, active: z === zf, bg: z === zf ? '#003F98' : '#fff', fg: z === zf ? '#fff' : '#5A5E66', bd: z === zf ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ creationZone: z }) })),
      // G8 — union with existing selection (never drop SCs picked under a different zone/search filter). Capped.
      selectAllSCs: () => { const cur = new Set(sel); let hit = false; filtered.forEach(s => { if (cur.has(s.code)) return; if (cur.size >= SC_CAP) { hit = true; return; } cur.add(s.code); }); if (hit) this.showToast('Plan group is capped at ' + SC_CAP + ' SCs — added up to the cap', '#C77B00'); this.setState({ selectedSCs: [...cur] }); }, clearAllSCs: () => this.setState({ selectedSCs: [] }),
      volOptions, selectedVolume: st.creationVolume,
      planTypeHasFiles, planTypeNoFiles,
      // D. overall volume-gap callout
      volGapHasGap: volGapBlock, volGapAllClean: !volGapBlock && sel.length > 0,
      volGapHeadline: volGapDcTotal + ' DC' + (volGapDcTotal === 1 ? '' : 's') + ' missing volume across ' + volGapScCount + ' SC' + (volGapScCount === 1 ? '' : 's'),
      volGapDetail: volGapZeroTotal + ' zero-volume · ' + volGapMissTotal + ' missing from the volume file.',
      volGapBlock,
      // B. CSV download (SC selection + volume coverage)
      downloadSelectionCsv: () => this.downloadSelectionCsv(),
      scVehicleCards,
      globalRefApplied, onApplyGlobalRef: () => this.setState({ globalRefApplied: true }),
      step3RefNeededCount, step3RefAllCovered: step3RefNeededCount === 0,
      step3RefNeedLabel: step3RefNeededCount + ' SC' + (step3RefNeededCount === 1 ? ' still needs' : 's still need') + ' a plan',
      // O — Step-3 error roll-up (TP / distance / ref-plan) gating the trigger
      step3ErrorCount, step3HasErrors: step3ErrorCount > 0,
      step3ErrorLabel: step3ErrorCount + ' SC' + (step3ErrorCount === 1 ? ' has' : 's have') + ' blocking validations — fix before triggering',
      trigSelCount,
      customHwCount, step3HasCustomHw: customHwCount > 0, customHwLabel: customHwCount + (customHwCount === 1 ? ' row' : ' rows') + ' customised',
      globalHw0Bg: gwBg(0), globalHw0Fg: gwFg(0), globalHw0Bd: gwBd(0),
      globalHw05Bg: gwBg(0.5), globalHw05Fg: gwFg(0.5), globalHw05Bd: gwBd(0.5),
      globalHw1Bg: gwBg(1), globalHw1Fg: gwFg(1), globalHw1Bd: gwBd(1),
      onGlobalHw0: () => this.setState({ hwGlobal: 0, hwBySC: {} }),
      onGlobalHw05: () => this.setState({ hwGlobal: 0.5, hwBySC: {} }),
      onGlobalHw1: () => this.setState({ hwGlobal: 1, hwBySC: {} }),
      scProps: scPropsWithHw, refNeeded, hasRefWarning: refNeeded > 0, hwGlobal, hwOptions,
      runName: st.runName || '', onRunNameChange: (e) => this.setState({ runName: e.target.value }),
      // K \u2014 "New Node Addition mode" (DS-algorithm mode toggle, not "include the new nodes")
      newNodeMode: !!st.newNodeMode, onToggleNewNodeMode: () => this.setState({ newNodeMode: !st.newNodeMode }),
      newNodesTrackBg: st.newNodeMode ? '#003F98' : '#C3C9D4', newNodesKnobX: st.newNodeMode ? '18px' : '2px',
      newNodeCardBg: st.newNodeMode ? '#F5F8FF' : '#fff', newNodeCardBd: st.newNodeMode ? '#B9CCEE' : '#E6EBF2',
      newNodeIconBg: st.newNodeMode ? '#EAEEFB' : '#F2F5FA', newNodeIconFg: st.newNodeMode ? '#003F98' : '#8E96A3',
      previewCardCount: sel.length, triggerCount: trigSelCount,
      // 2.3 — volume file search
      creationVolSearch: st.creationVolSearch || '', onVolSearch: (e) => this.setState({ creationVolSearch: e.target.value }),
      volFilesEmpty: volOptions.length === 0 && volSearchQ.length > 0,
      // 2.6 — step-4 validation panel
      step4FlagsList, step4AnyFlags, step4HasErrorFlags, step4HasWarnFlags,
      step4ErrorFlagCount, step4WarnFlagCount,
      previewCards: previewCardsWithHw, queueActive, queueIdle: !queueActive, step4Idle: step === 4 && selUntriggered > 0, step4Active: step === 4 && selUntriggered === 0 && queueActive, queueRows, allDone, doneCount, runTotal: st.runQueue.length, runStatusSummary,
      // C — Run Queue render conditions: never-ran vs in-flight vs all-done (queueRows is in-flight-only now).
      queueNeverRan: !queueActive, queueInFlight: queueActive && !allDone, queueAllDone: allDone,
      hasDoneRuns: doneCount > 0, doneReviewLabel: doneCount + ' completed → Design Review',
      doneCountLabel: doneCount + (doneCount === 1 ? ' result' : ' results'),
      runPlannedN, runProgN, runDoneN,
      // F2 \u2014 unified block predicate (single source of truth for banner + button + link + triggerAll).
      triggerBlocked, triggerBlockReason,
      triggerReady: !triggerBlocked,
      // Step-4 commit-sheet banner + stat strip + ETA (F5).
      batchVolLabel, batchDcTotal, estLabel,
      batchScLabel: trigSelCount + (trigSelCount === 1 ? ' SC' : ' SCs'),
      batchRunLabel: trigSelCount + (trigSelCount === 1 ? ' run' : ' runs'),
      step4Empty: trigSelCount === 0,
      step4HasScs: trigSelCount > 0,
      // Recap table model (B): not-ready rows always shown; clean rows behind the expander.
      recapNotReady, recapClean, cleanRecapCount, notReadyRecapCount,
      hasCleanRecap: cleanRecapCount > 0, hasNotReadyRecap: notReadyRecapCount > 0,
      cleanRecapLabel: cleanRecapCount + ' ready ' + (cleanRecapCount === 1 ? 'SC' : 'SCs'),
      recapReadyOpen: !!st.recapReadyOpen,
      onToggleRecapReady: () => this.setState({ recapReadyOpen: !st.recapReadyOpen }),
      recapReadyChev: st.recapReadyOpen ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6',
      // Redirect-to-fix: jump to Step 1 (volume gaps) or Step 2 (vehicle validations), remembering Step 3 so we can return.
      onBlockFix: () => {
        if (volGapBlock) {
          // Land on Step 1 → Select sort centres, open the first blocked SC's LMDC list (un-collapse its zone) so the drop/trash controls are right there, and scroll it into view.
          const b = volGapScs[0] ? volGapScs[0].s : null;
          const cz = Object.assign({}, st.collapsedZones); if (b) delete cz[b.zone];
          this.setState({ creationStep: 1, fixReturnStep: step, expandedSC: b ? b.code : st.expandedSC, collapsedZones: cz, focusSC: b ? b.code : null });
          if (b) setTimeout(() => { try { const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; const el = Array.from(document.querySelectorAll('span')).find(n => (n.textContent || '').trim() === b.code); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); } catch (e) {} }, 260);
        } else {
          // Always route to Step 1 (Plan File & Sort Centres) so the planner can drop the SC with 0 volume.
          this.setState({ view: 'creation', creationView: 'wizard', creationStep: 1, fixReturnStep: step, focusSC: null });
        }
      },
      blockFixTitle: volGapBlock ? 'Go to Step 1 to fix the volume gaps' : 'Jump to the step that fixes the first blocked SC',
      // Round-trip resume affordance: surfaces while the planner is away from the step they need to return to.
      showResume: !!(st.fixReturnStep && step !== st.fixReturnStep),
      resumeLabel: 'Resume review (Step ' + st.fixReturnStep + ')',
      onResume: () => this.setState({ creationStep: st.fixReturnStep, fixReturnStep: null }),
      triggerAll: () => {
        // Guards mirror the unified predicate exactly (no divergence from the banner / button state).
        if (noSel) { this.showToast('Select at least one SC in Step 1', '#C77B00'); return; }
        if (volGapBlock) { this.showToast('Cannot trigger \u2014 ' + volGapDcTotal + ' DC' + (volGapDcTotal === 1 ? '' : 's') + ' still missing volume (Step 1)', '#D14B4B'); return; }
        if (step3ErrorCount > 0) { this.showToast('Cannot trigger \u2014 ' + step3ErrorCount + ' SC' + (step3ErrorCount === 1 ? ' has' : 's have') + ' TP / distance validations to fix', '#D14B4B'); return; }
        if (step3RefNeededCount > 0) { this.showToast(step3RefNeededCount + ' SC' + (step3RefNeededCount === 1 ? ' needs' : 's need') + ' a reference plan (HW above 0)', '#C77B00'); return; }
        this.triggerRuns(sel.slice()); this.setState({ creationView: 'queue' });
      }, runsTotalLabel: trigSelCount + (trigSelCount === 1 ? ' SC \u00b7 ' : ' SCs \u00b7 ') + trigSelCount + (trigSelCount === 1 ? ' run' : ' runs'),
      triggerAllBg: triggerBlocked ? '#E6EBF2' : '#003F98', triggerAllFg: triggerBlocked ? '#5A5E66' : '#fff', triggerAllCursor: triggerBlocked ? 'not-allowed' : 'pointer',
      goReview: () => this.go('review'),
      // Returns wizard to Step 1 so the planner can queue more SCs without clearing the active runQueue.
      goCreateMore: () => this.setState({ creationStep: 1, selectedSCs: [], creationVolume: null, fixReturnStep: null, focusSC: null, creationView: 'wizard' }),
      creBack: () => { const ns = Math.max(1, step - 1); this.setState({ creationStep: ns, fixReturnStep: ns === st.fixReturnStep ? null : st.fixReturnStep, focusSC: null }); }, creNext: () => { if (canNext) { const ns = Math.min(4, step + 1); this.setState({ creationStep: ns, fixReturnStep: ns === st.fixReturnStep ? null : st.fixReturnStep, focusSC: null }); } },
      canNext, nextLabel, showBack: step > 1, showNext: step < 4, nextBg: canNext ? '#003F98' : '#E6EBF2', nextFg: canNext ? '#fff' : '#5A5E66', nextCursor: canNext ? 'pointer' : 'not-allowed',
    };
  }

  openPush(code, runId) { const sc = this.state.data.scs.find(s => s.code === code); this.setState({ pushOpen: true, pushSCcode: code, pushRunId: runId || null, pushReviewers: [...new Set(sc.pocs)].slice(0, 2), pushName: '', pushEmail: '' }); }
  closePush() { this.setState({ pushOpen: false }); }
  togglePushReviewer(n) { const cur = this.state.pushReviewers.slice(); const i = cur.indexOf(n); i >= 0 ? cur.splice(i, 1) : cur.push(n); this.setState({ pushReviewers: cur }); }
  addManualReviewer() { const n = (this.state.pushName || '').trim(); if (!n) return; const cur = this.state.pushReviewers.slice(); if (cur.indexOf(n) < 0) cur.push(n); this.setState({ pushReviewers: cur, pushName: '', pushEmail: '' }); }
  removeReviewer(n) { this.setState({ pushReviewers: this.state.pushReviewers.filter(x => x !== n) }); }
  openFinDirect(code, runId) { this.setState({ finDirectOpen: true, finDirectSCcode: code, pushSCcode: code, pushRunId: runId || null, pushReviewers: [] }); }
  doPush(finaliseDirect) {
    const st = this.state, d = st.data, code = st.pushSCcode;
    const targetStatus = finaliseDirect ? 'Finalised' : 'Pushed';
    const sc = d.scs.find(s => s.code === code);
    const reviewers = (st.pushReviewers || []).slice();
    // Resolve the chosen run EXPLICITLY: the run the planner picked on the card, else the
    // balanced HW-0.5 run, else any run for this SC. The chosen run's HW + metrics flow into the plan.
    const run = (st.pushRunId && d.runs.find(r => r.id === st.pushRunId)) || d.runs.find(r => r.scCode === code && r.hw === 0.5) || d.runs.find(r => r.scCode === code);
    const runHw = run ? run.hw : 0.5;
    const hwTxt = runHw === 0 ? 'HW 0' : runHw === 0.5 ? 'HW 0.5' : 'HW 1';
    const plans = d.plans.slice();
    const alignStatus = Object.assign({}, st.alignStatus);
    const idx = plans.findIndex(p => p.scCode === code);
    let plan = idx >= 0 ? plans[idx] : null;
    if (plan && run && sc) {
      // existing plan for this SC \u2014 re-push it for fresh Ops review against the CHOSEN run:
      // rebuild rows + metrics + HW from that run so the pushed plan reflects the picked run, not the seed.
      const VEHN = ['TATA ACE / 7ft', 'Bolero / 8ft', 'TATA 407 / 10ft', '14ft Trailer'];
      const rowCount = Math.min(Math.max(run.routes, 6), 13);
      const rows = [];
      for (let j = 0; j < rowCount; j++) {
        const veh = VEHN[j % VEHN.length];
        const tp = 2 + (j % 5);
        const dcs = []; for (let k = 0; k < tp; k++) dcs.push(sc.cityCode + (101 + j * 7 + k));
        rows.push({ routeCode: sc.cityCode + '-R' + String(j + 1).padStart(2, '0'), veh, vehTp: 7, tp, dcs, rtDist: 80 + j * 18, breakdownTat: 1.2, outCutoff: '23:00', oLat: sc.lat, oLng: sc.lng, volume: Math.round(run.volume / rowCount), util: run.util, cps: run.cps, ops: 'Pending', planner: null, fb: null });
      }
      plan = Object.assign({}, plan, { hw: runHw, rows, pushedBy: 'Pranita Sapkal', reviewerNames: reviewers.length ? reviewers : plan.reviewerNames, metrics: { routes: run.routes, vehicles: run.vehicles, distance: run.distance, cps: run.cps, coverage: run.coverage, util: run.util, avgTat: run.avgTat, cost: run.cost } });
      plans[idx] = plan;
      alignStatus[plan.id] = targetStatus;
    } else if (run && sc) {
      // synthesize a real plan so it surfaces for the Ops Lead and in the planner pipeline
      const VEHN = ['TATA ACE / 7ft', 'Bolero / 8ft', 'TATA 407 / 10ft', '14ft Trailer'];
      const rowCount = Math.min(Math.max(run.routes, 6), 13);
      const rows = [];
      for (let j = 0; j < rowCount; j++) {
        const veh = VEHN[j % VEHN.length];
        const tp = 2 + (j % 5);
        const dcs = []; for (let k = 0; k < tp; k++) dcs.push(sc.cityCode + (101 + j * 7 + k));
        rows.push({ routeCode: sc.cityCode + '-R' + String(j + 1).padStart(2, '0'), veh, vehTp: 7, tp, dcs, rtDist: 80 + j * 18, breakdownTat: 1.2, outCutoff: '23:00', oLat: sc.lat, oLng: sc.lng, volume: Math.round(run.volume / rowCount), util: run.util, cps: run.cps, ops: 'Pending', planner: null, fb: null });
      }
      plan = { id: 'PL-' + code, name: code + ' \u00b7 ' + sc.name + ' RLH', scCode: code, scName: sc.name, zone: sc.zone, hw: runHw, status: targetStatus, rows, pushedBy: 'Pranita Sapkal', sentDate: 'Today', sendBack: 0, feedbackReceived: false, allDecided: finaliseDirect ? true : false, reviewerNames: reviewers.length ? reviewers : [...new Set(sc.pocs)].slice(0, 2), metrics: { routes: run.routes, vehicles: run.vehicles, distance: run.distance, cps: run.cps, coverage: run.coverage, util: run.util, avgTat: run.avgTat, cost: run.cost } };
      plans.push(plan);
    }
    const pushed = Object.assign({}, st.pushedSCs); pushed[code] = true;
    // Land on the alignment LIST (L1), not the freshly-pushed plan's blank "waiting for feedback" detail.
    // Reset the filter to All so the just-pushed/finalised plan is guaranteed visible in the list.
    this.setState({ data: Object.assign({}, d, { plans }), alignStatus, pushedSCs: pushed, pushOpen: false, finDirectOpen: false, pushRunId: null, view: 'align', opsPlanId: plan ? plan.id : st.opsPlanId, alignPlanId: null, alignFilter: 'Pending Feedback', alignPage: 0 });
    const runTxt = run ? (run.runId || run.id) : code;
    if (finaliseDirect) this.showToast('Finalised ' + runTxt + ' directly \u2014 skipped Ops alignment, ready for RFQ handoff', '#128A3E');
    else this.showToast('Pushed ' + runTxt + ' (' + hwTxt + ') to alignment \u00b7 ' + reviewers.length + ' reviewer' + (reviewers.length === 1 ? '' : 's'), '#128A3E');
  }

  decideRow(planId, idx, val) { const a = Object.assign({}, this.state.alignDecisions); a[planId] = Object.assign({}, a[planId]); a[planId][idx] = val; this.setState({ alignDecisions: a }); }
  // Per-field route-level decision (Vehicle / Touch Point / Distance each acked individually).
  // Rolls up into alignDecisions[planId][idx] so plan-level gates (Acknowledge / Finalise / counts)
  // keep working: the route reads Accepted only once every field is decided; any Reject → Reject.
  decideField(planId, idx, fieldKey, val) {
    const key = planId + ':' + idx;
    const fd = Object.assign({}, this.state.alignFieldDec); fd[key] = Object.assign({}, fd[key]); fd[key][fieldKey] = val;
    const plan = (this.state.data.plans || []).find(p => p.id === planId);
    const row = plan && plan.rows[idx];
    const cellKeys = (row && row.fb && row.fb.cells) ? Object.keys(row.fb.cells) : [];
    const a = Object.assign({}, this.state.alignDecisions); a[planId] = Object.assign({}, a[planId]);
    if (cellKeys.length && cellKeys.every(k => fd[key][k])) { a[planId][idx] = cellKeys.some(k => fd[key][k] === 'Reject') ? 'Reject' : 'Accept'; }
    else { delete a[planId][idx]; }
    this.setState({ alignFieldDec: fd, alignDecisions: a });
  }
  // Per-DC (node-level) accept/reject within a route — the planner can accept some DC changes and reject others (2026-07-03).
  decideDcRow(planId, idx, dcCode, val) { const a = Object.assign({}, this.state.alignDcDecisions); a[planId] = Object.assign({}, a[planId]); a[planId][idx] = Object.assign({}, a[planId][idx]); a[planId][idx][dcCode] = val; this.setState({ alignDcDecisions: a }); }
  // "Accept all" for ONE route — accepts only the STILL-UNDECIDED changes (route-scoped + per-DC), in a single update.
  // It must never clobber an explicit Reject the planner already made (mirrors decideAllFlagged's "fill undecided only" guard).
  acceptRowChanges(planId, idx, dcCodes, setRoute) {
    const upd = {};
    if (setRoute) {
      const plan = (this.state.data.plans || []).find(p => p.id === planId);
      const row = plan && plan.rows[idx];
      const cellKeys = (row && row.fb && row.fb.cells) ? Object.keys(row.fb.cells) : [];
      const key = planId + ':' + idx;
      // Fill only UNDECIDED per-field decisions with Accept (never clobber an explicit Reject).
      const fd = Object.assign({}, this.state.alignFieldDec); fd[key] = Object.assign({}, fd[key]);
      cellKeys.forEach(k => { if (!fd[key][k]) fd[key][k] = 'Accept'; }); upd.alignFieldDec = fd;
      const a = Object.assign({}, this.state.alignDecisions); a[planId] = Object.assign({}, a[planId]);
      a[planId][idx] = cellKeys.length && cellKeys.some(k => fd[key][k] === 'Reject') ? 'Reject' : 'Accept'; upd.alignDecisions = a;
    }
    if (dcCodes && dcCodes.length) { const b = Object.assign({}, this.state.alignDcDecisions); b[planId] = Object.assign({}, b[planId]); b[planId][idx] = Object.assign({}, b[planId][idx]); dcCodes.forEach(c => { if (!b[planId][idx][c]) b[planId][idx][c] = 'Accept'; }); upd.alignDcDecisions = b; }
    this.setState(upd);
  }
  setTpOrder(planId, idx, dcIdx, val) { const k = planId + ':' + idx; const cur = Object.assign({}, this.state.opsTpOrder); cur[k] = Object.assign({}, cur[k]); cur[k][dcIdx] = String(val).replace(/[^0-9]/g, ''); this.setState({ opsTpOrder: cur }); }
  setAlignRemark(planId, idx, val) { const a = Object.assign({}, this.state.alignRemarks); a[planId] = Object.assign({}, a[planId]); a[planId][idx] = val; this.setState({ alignRemarks: a }); }
  // Master–detail: which flagged route is open in the detail pane (per plan).
  setAlignRoute(planId, idx) { const a = Object.assign({}, this.state.alignRouteSel || {}); a[planId] = idx; this.setState({ alignRouteSel: a }); }
  confirmAck() { const id = this.state.ackPlanId; const s = Object.assign({}, this.state.alignStatus); s[id] = 'Acknowledged'; this.setState({ alignStatus: s, ackOpen: false }); this.showToast(id + ' acknowledged \u2014 plan frozen & reviewers locked', '#1E6FB8'); }
  confirmFin() { const id = this.state.finPlanId; const s = Object.assign({}, this.state.alignStatus); s[id] = 'Finalised'; const fb = Object.assign({}, this.state.alignFinalisedBy); fb[id] = 'Pranita Sapkal'; this.setState({ alignStatus: s, alignFinalisedBy: fb, finOpen: false }); this.showToast(id + ' finalised \u2014 ready for RFQ handoff', '#128A3E'); }

  // LMDC cluster view — generate deterministic DC breakdown rows for a route.
  // No Math.random / Date.now: all values derived from indices and char codes.
  genDcRows(r) {
    const DC_NAMES = ['Sector Hub','Market Depot','City Point','Town Centre','Zone Gateway','North Cluster','South Cluster','East Block','West Node','Central Store','Junction Hub','Metro Point','Park Depot','Ring Station','Cross Dock'];
    const dcArr = r.dcs; // array of dc-code strings e.g. ["BDQ234","BDQ567"]
    const n = dcArr.length || 1;
    const baseVol = Math.floor(r.volume / n);
    const baseDist = Math.floor(r.rtDist / n);
    return dcArr.map((code, i) => {
      // deterministic jitter from char codes of the dc code string
      const charSum = code.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const jitterLat = ((charSum * 137 + i * 31) % 10000) / 100000;  // ~±0.04°
      const jitterLng = ((charSum * 97  + i * 53) % 10000) / 100000;
      const latSign   = ((charSum + i) % 2 === 0) ? 1 : -1;
      const lngSign   = ((charSum + i * 3) % 2 === 0) ? 1 : -1;
      const lat  = (r.oLat + latSign * jitterLat).toFixed(4);
      const lng  = (r.oLng + lngSign * jitterLng).toFixed(4);
      const vol  = baseVol + ((charSum + i) % 3 === 0 ? 1 : 0);
      const dist = baseDist + ((charSum + i * 7) % 5);
      const nameIdx = (charSum + i * 13) % DC_NAMES.length;
      return { code, name: DC_NAMES[nameIdx], vol, tpOrder: i + 1, lat, lng, dist: dist + ' km' };
    });
  }

  alignVals() {
    const st = this.state, d = st.data;
    const pct = (n) => Math.round(n * 100) + '%';
    const fmtInt = (n) => n.toLocaleString('en-IN');
    const eff = (p) => st.alignStatus[p.id] || p.status;
    const planner = st.persona === 'planner';
    const isAlign = st.view === 'align';
    const plans = d.plans;
    const cnt = (s) => plans.filter(p => eff(p) === s).length;
    // F2 \u2014 "Under Review" = In-Alignment plans with flagged rows still undecided (rows-in-progress).
    const flaggedAllDecided = (p) => p.rows.every((r, i) => r.ops !== 'Needs Change' || (st.alignDecisions[p.id] && st.alignDecisions[p.id][i]) || r.planner);
    // F2 \u2014 strip wording matches KRD \u00a710-11 exactly: All plans \u00b7 Plans Sent \u00b7 Awaiting Feedback \u00b7 Feedback Received \u00b7 Acknowledged \u00b7 Finalised.
    // pipeline funnel removed — its counts now live in the Tier-2 filter tabs.

    // F2 — filter-chip labels now match the pipeline wording EXACTLY (no "Awaiting" vs "Awaiting feedback" drift).
    // Received = any plan with feedback activity not yet finalised (In Alignment or Acknowledged);
    // Finalised = terminal state only. This gives every plan exactly one home across the 3 tabs.
    const FILTERS = ['Pending Feedback', 'Feedback Received', 'Finalised'];
    const fmap = { 'Pending Feedback': 'Pushed', 'Finalised': 'Finalised' };
    const af = st.alignFilter || 'Pending Feedback';
    const STPILL = { 'Pushed': { l: 'Pending Feedback', bg: '#F2F5FA', fg: '#5A5E66' }, 'In Alignment': { l: 'Feedback Received', bg: '#FBF1DF', fg: '#C77B00' }, 'Acknowledged': { l: 'Acknowledged \u00b7 locked', bg: '#E7F0F8', fg: '#1E6FB8' }, 'Finalised': { l: 'Finalised', bg: '#E7F4EC', fg: '#128A3E' } };
    const order = { 'In Alignment': 0, 'Acknowledged': 1, 'Pushed': 2, 'Finalised': 3 };
    let listPlans = plans.filter(p => { const s = eff(p); if (af === 'Feedback Received') return s === 'In Alignment' || s === 'Acknowledged'; return s === fmap[af]; }).slice().sort((a, b) => order[eff(a)] - order[eff(b)]);
    // Master-detail: keep the explicit selection if it is in the current filtered list,
    // otherwise auto-select the first plan so the detail pane is never blank (like Design Review).
    const curId = (st.alignPlanId && listPlans.some(p => p.id === st.alignPlanId)) ? st.alignPlanId : (listPlans.length > 0 ? listPlans[0].id : null);
    // B — latest plan = first in the sorted list (In Alignment first, then Pushed, Finalised).
    const latestAlignId = listPlans.length > 0 ? listPlans[0].id : null;
    // PARITY §2.2 — card carries designType (RLH) + N/M submitted ratio + pushed date.
    // submitted = Ops Leads who have returned feedback (all once acknowledged/finalised, the lead once feedback is in).
    const planList = listPlans.map(p => { const s = eff(p); const pl = STPILL[s]; const tot = p.reviewerNames.length; const sub = (s === 'Acknowledged' || s === 'Finalised') ? tot : (s !== 'Pushed' ? Math.min(1, tot) : 0); const isLatest = p.id === latestAlignId && !curId;
      // §10 status chips: show exactly one secondary chip based on plan state
      const showAwaitingAck = s === 'In Alignment'; // feedback in, planner yet to acknowledge
      const showReviewInProgress = s === 'Pushed' && sub > 0; // at least one reviewer has submitted but plan still shows Pushed
      const showFinalisedDate = s === 'Finalised';
      const finaliser = (st.alignFinalisedBy && st.alignFinalisedBy[p.id]) || p.pushedBy || '—';
      const finalisedDate = s === 'Finalised' ? ('Finalised ' + p.sentDate + ' · ' + finaliser) : '';
      // A Pending-Feedback (Pushed) plan has no feedback yet, so its L2 detail is an empty "waiting" page —
      // make those rows non-navigable (no chevron, no drill-in) and offer Nudge inline instead.
      const pending = s === 'Pushed';
      return { id: p.id, code: p.scCode, name: p.scName, zone: p.zone, designType: 'RLH', submittedLabel: sub + '/' + tot + ' submitted', pushedLabel: 'Pushed ' + p.sentDate, pushedBy: p.pushedBy || '—', statusLabel: pl.l, statusBg: pl.bg, statusFg: pl.fg, isLatest, active: p.id === curId, bg: p.id === curId ? '#EAEEFB' : '#fff', bd: p.id === curId ? '#003F98' : '#E6EBF2', showAwaitingAck, showReviewInProgress, showFinalisedDate, finalisedDate,
        pending, canOpen: !pending, rowCursor: 'pointer',
        onClick: () => this.setState({ alignPlanId: p.id, pgRoutes: 1, alignDetailOpen: false }),
        onNudgeRow: () => { const rp = Object.assign({}, this.state.remindedPlans || {}); rp[p.id] = true; this.setState({ remindedPlans: rp }); this.showToast('Reminder sent to ' + ((p.reviewerNames || []).join(', ') || 'the reviewers'), '#1E6FB8'); } }; });

    const plan = plans.find(p => p.id === curId);
    const ps = plan ? eff(plan) : null;
    // B — distinguish "no plans in filter" (empty=true) from "plans exist but none selected" (unselected=true).
    const hasPlansInList = listPlans.length > 0;
    let aSel = { exists: false, empty: !hasPlansInList, unselected: hasPlansInList && !curId, routesPager: { showPager: false, pageButtons: [] } };
    // Rail filter segment (replaces the old top Tier-2 filter tab-strip for Ops Alignment).
    const PSEG = [['Pending Feedback', 'Pending'], ['Feedback Received', 'Received'], ['Finalised', 'Finalised']];
    const segCount = (label) => plans.filter(p => { const s = eff(p); if (label === 'Feedback Received') return s === 'In Alignment' || s === 'Acknowledged'; return s === fmap[label]; }).length;
    const alignFilterSeg = PSEG.map(t => ({ label: t[0], short: t[1], count: segCount(t[0]), active: af === t[0],
      bg: af === t[0] ? '#003F98' : 'transparent', fg: af === t[0] ? '#fff' : '#5A5E66', weight: af === t[0] ? '700' : '600',
      onClick: () => this.setState({ alignFilter: t[0], alignPage: 0, pgRoutes: 1, alignPlanId: null, alignDetailOpen: false }) }));
    if (plan) {
      const locked = ps === 'Acknowledged' || ps === 'Finalised';
      const FIELD = { vehicleType: 'Vehicle Type', routeCode: 'Route Code', roundTripDistance: 'Round-Trip Dist', touchpoint: 'Touch Point' };
      const rows = plan.rows.map((r, idx) => {
        const needsAttn = r.ops === 'Needs Change';
        const manualDec = (st.alignDecisions[plan.id] && st.alignDecisions[plan.id][idx]) || null;
        // A6 — deterministic per-row CPS delta of the proposed change; |Δ| <= 0.5% auto-approves (planner can still override by rejecting).
        const cpsDeltaPct = needsAttn ? ((((idx * 37 + Math.round(r.rtDist)) % 21) - 10) / 10) : 0;
        const autoApprovable = false; // auto-accept flow removed (2026-07-06) — every flagged change needs an explicit Accept/Reject
        const dec = manualDec || (autoApprovable ? 'Accept' : r.planner);
        const cells = r.fb ? Object.keys(r.fb.cells || {}).map(k => ({ key: k, field: FIELD[k] || k, from: String(r.fb.cells[k].from), to: String(r.fb.cells[k].to) })).filter(c => c.from !== c.to) : [];
        // which route-context attributes carry a flagged change (to highlight them inline in the meta line)
        const mlVehChg = cells.some(c => c.key === 'vehicleType');
        const mlTpChg = cells.some(c => c.key === 'touchpoint');
        const mlDistChg = cells.some(c => c.key === 'roundTripDistance');
        // Per-DC (node-level) changes flagged by the Ops Lead — summarised as one chip per DC (which fields changed).
        const dcCellsObj = (r.fb && r.fb.dcCells) ? r.fb.dcCells : {};
        const dcChips = Object.keys(dcCellsObj).map(code => { const e = dcCellsObj[code] || {}; const parts = []; if (e.lat != null) parts.push('lat'); if (e.lng != null) parts.push('lng'); if (e.tp != null) parts.push('TP'); return { code: code, fields: parts.join(' · ') }; });
        const km = needsAttn ? -(Math.round(r.rtDist * 0.11) + 2) : 0;
        const cost = needsAttn ? -(Math.round(r.volume * 0.05)) : 0;
        const op = { 'Aligned': { bg: '#E7F4EC', fg: '#128A3E' }, 'Needs Change': { bg: '#FBF1DF', fg: '#C77B00' } }[r.ops] || { bg: 'transparent', fg: '#C3C9D4' };
        const remark = (st.alignRemarks[plan.id] && st.alignRemarks[plan.id][idx] !== undefined) ? st.alignRemarks[plan.id][idx] : '';
        // §10 O2 — planner sees who proposed the change (fb.by stamped at submit, or the seeded proposer).
        const propBy = (r.fb && r.fb.by) || r.proposedBy || null;
        const aVehRecord = (d.VEH || []).find(v => v.name === r.veh) || {};
        const aCapVal = aVehRecord.cap ? fmtInt(aVehRecord.cap) : '—';
        const aVolVal = r.volume != null ? fmtInt(r.volume) : '—';
        const aUtilVal = r.util != null ? Math.round(r.util * 100) + '%' : '—';
        // A+B (2026-07-03) — per-DC accept/reject. Route-level cells decided at route level;
        // each Ops-flagged DC (lat/lng/TP-order) decided individually. Aligned routes need neither.
        const dcDecMap = (st.alignDcDecisions[plan.id] && st.alignDcDecisions[plan.id][idx]) || {};
        const changedDcCodes = Object.keys(dcCellsObj);
        const hasRouteCells = cells.length > 0;
        const enrichedDcRows = this.genDcRows(r).map(dc => {
          const chg = dcCellsObj[dc.code] || null;
          const dcd = dcDecMap[dc.code] || null;
          const pLat = (chg && chg.lat != null) ? chg.lat : dc.lat;
          const pLng = (chg && chg.lng != null) ? chg.lng : dc.lng;
          const latLngChg = !!(chg && (chg.lat != null || chg.lng != null));
          const tpChg = !!(chg && chg.tp != null);
          return Object.assign({}, dc, {
            hasChange: !!chg, noChange: !chg,
            hasChgTp: tpChg, noChgTp: !tpChg, chgTp: tpChg ? String(chg.tp) : '',
            hasLatLngChange: latLngChg, noLatLngChange: !latLngChg, proposedLatLng: pLat + ', ' + pLng,
            dcAccepted: dcd === 'Accept', dcRejected: dcd === 'Reject', dcUndecided: !dcd,
            dcAccBg: dcd === 'Accept' ? '#128A3E' : '#fff', dcAccFg: dcd === 'Accept' ? '#fff' : '#128A3E',
            dcRejBg: dcd === 'Reject' ? '#D14B4B' : '#fff', dcRejFg: dcd === 'Reject' ? '#fff' : '#D14B4B',
            dcCanDecide: ps === 'Acknowledged', dcDecideLocked: ps !== 'Acknowledged',
            onDcAccept: () => this.decideDcRow(plan.id, idx, dc.code, 'Accept'),
            onDcReject: () => this.decideDcRow(plan.id, idx, dc.code, 'Reject'),
          });
        });
        const dcChangedCount = changedDcCodes.length;
        const dcDecidedCount = changedDcCodes.filter(c => !!dcDecMap[c]).length;
        // A route owes a route-level Accept/Reject when it has route cells OR no DC-level changes
        // (a remark-only Needs-Change row is still decided at the route level). Aligned rows owe nothing.
        const needsRouteDecision = needsAttn && (hasRouteCells || dcChangedCount === 0);
        const _rk = plan.id + ':' + idx;
        const _fd = (st.alignFieldDec && st.alignFieldDec[_rk]) || {};
        // Route is decided when EVERY flagged route-level field has its own Accept/Reject (or the row
        // auto-approves), falling back to the single route decision for a remark-only flag.
        const routeFieldsDecided = hasRouteCells ? (autoApprovable || (cells.length > 0 && cells.every(c => !!_fd[c.key]))) : !!dec;
        const routeDecided = !needsRouteDecision || routeFieldsDecided;
        const dcAllDecided = changedDcCodes.every(c => !!dcDecMap[c]);
        const rowFullyDecided = !needsAttn || (routeDecided && dcAllDecided);
        // Flat, always-visible decision list: the route-scoped change (if any) + one entry per DC-scoped change.
        // Replaces the route-button + hidden DC-table nesting so decisions never conflict or get missed, and
        // each entry carries an explicit scope so a route change never reads as governing the DCs.
        const changeList = [];
        if (needsRouteDecision) {
          if (hasRouteCells) {
            // ONE ackable entry PER changed route-level field — the planner accepts/rejects Vehicle,
            // Touch Point and Distance independently (not one bundled decision).
            cells.forEach(c => {
              const fdec = _fd[c.key] || (autoApprovable ? 'Accept' : null);
              changeList.push({ isRoute: true, isDc: false, scopeLabel: 'This route', scopeSub: c.field,
                changeText: c.from + ' → ' + c.to,
                whereLabel: 'Route', whereBg: '#EAEEFB', whereFg: '#2F4FC6', fieldLabel: c.field, changeVal: c.from + ' → ' + c.to,
                rowBg: fdec === 'Accept' ? '#F5FAF6' : (fdec === 'Reject' ? '#FCF6F6' : '#FFFCF4'),
                autoApproved: autoApprovable && !_fd[c.key],
                accepted: fdec === 'Accept', rejected: fdec === 'Reject', undecided: !fdec, decided: !!fdec,
                canDecide: ps === 'Acknowledged', decideLocked: ps !== 'Acknowledged',
                accBg: fdec === 'Accept' ? '#128A3E' : '#fff', accFg: fdec === 'Accept' ? '#fff' : '#128A3E',
                rejBg: fdec === 'Reject' ? '#D14B4B' : '#fff', rejFg: fdec === 'Reject' ? '#fff' : '#D14B4B',
                onAccept: () => this.decideField(plan.id, idx, c.key, 'Accept'), onReject: () => this.decideField(plan.id, idx, c.key, 'Reject') });
            });
          } else {
            changeList.push({ isRoute: true, isDc: false, scopeLabel: 'This route', scopeSub: r.routeCode,
              changeText: 'Route-level review (see remark)',
              whereLabel: 'Route', whereBg: '#EAEEFB', whereFg: '#2F4FC6', fieldLabel: 'Route-level', changeVal: 'See remark',
              rowBg: dec === 'Accept' ? '#F5FAF6' : (dec === 'Reject' ? '#FCF6F6' : '#FFFCF4'),
              autoApproved: autoApprovable,
              accepted: dec === 'Accept', rejected: dec === 'Reject', undecided: !dec, decided: !!dec,
              canDecide: ps === 'Acknowledged', decideLocked: ps !== 'Acknowledged',
              accBg: dec === 'Accept' ? '#128A3E' : '#fff', accFg: dec === 'Accept' ? '#fff' : '#128A3E',
              rejBg: dec === 'Reject' ? '#D14B4B' : '#fff', rejFg: dec === 'Reject' ? '#fff' : '#D14B4B',
              onAccept: () => this.decideRow(plan.id, idx, 'Accept'), onReject: () => this.decideRow(plan.id, idx, 'Reject') });
          }
        }
        enrichedDcRows.forEach(dc => { if (!dc.hasChange) return;
          const parts = [], flabels = [], vals = [];
          if (dc.hasChgTp) { parts.push('Touch-point order ' + dc.tpOrder + ' → ' + dc.chgTp); flabels.push('Touch-point order'); vals.push(dc.tpOrder + ' → ' + dc.chgTp); }
          if (dc.hasLatLngChange) { parts.push('Lat/Long → ' + dc.proposedLatLng); flabels.push('Lat/Long'); vals.push('→ ' + dc.proposedLatLng); }
          changeList.push({ isRoute: false, isDc: true, scopeLabel: dc.code, scopeSub: dc.name,
            changeText: parts.join(' · '), autoApproved: false,
            whereLabel: dc.code + ' · ' + dc.name, whereBg: '#F2F5FA', whereFg: '#5A5E66', fieldLabel: flabels.join(' · '), changeVal: vals.join('   ·   '),
            rowBg: dc.dcAccepted ? '#F5FAF6' : (dc.dcRejected ? '#FCF6F6' : '#FFFCF4'),
            accepted: dc.dcAccepted, rejected: dc.dcRejected, undecided: dc.dcUndecided, decided: !dc.dcUndecided,
            canDecide: dc.dcCanDecide, decideLocked: dc.dcDecideLocked,
            accBg: dc.dcAccBg, accFg: dc.dcAccFg, rejBg: dc.dcRejBg, rejFg: dc.dcRejFg,
            onAccept: dc.onDcAccept, onReject: dc.onDcReject });
        });
        const changeTotal = changeList.length;
        const changeDecidedCount = changeList.filter(c => c.decided).length;
        const allChangesDecided = changeTotal > 0 && changeDecidedCount === changeTotal;
        return { idx, routeCode: r.routeCode, veh: r.veh, tp: r.tp, ops: r.ops, opsChip: (r.ops === 'Pending' ? '—' : r.ops), opsBg: op.bg, opsFg: op.fg, needsAttn, hasFb: !!r.fb, noFb: !r.fb, fbText: r.fb ? r.fb.remark : '', cells, dcChips, hasDcChips: dcChips.length > 0,
          proposedBy: propBy, hasProposed: !!propBy, proposedLabel: propBy ? ('Proposed by ' + propBy) : '',
          autoApproved: autoApprovable, autoApprovedLabel: 'Auto-approved · ' + (cpsDeltaPct >= 0 ? '+' : '') + cpsDeltaPct.toFixed(1) + '% CPS',
          dcCount: r.dcs.length, rtDist: r.rtDist + ' km', cps: '₹' + Number(r.cps).toFixed(2), tat: r.breakdownTat + 'h',
          vol: aVolVal, util: aUtilVal, cap: aCapVal, routeMeta: 'Vol ' + aVolVal + ' · Util ' + aUtilVal + ' · Cap ' + aCapVal,
          mlVehTxt: r.veh, mlTpTxt: '' + r.tp, mlDcsTxt: '' + r.dcs.length, mlDistTxt: r.rtDist + ' km', mlCpsTxt: '₹' + Number(r.cps).toFixed(2), mlVolTxt: '' + aVolVal, mlUtilTxt: '' + aUtilVal,
          mlVehBg: mlVehChg ? '#FBF1DF' : 'transparent', mlVehFg: mlVehChg ? '#9A5E00' : '#5A5E66', mlVehWt: mlVehChg ? '700' : '400',
          mlTpBg: mlTpChg ? '#FBF1DF' : 'transparent', mlTpFg: mlTpChg ? '#9A5E00' : '#5A5E66', mlTpWt: mlTpChg ? '700' : '400',
          mlDistBg: mlDistChg ? '#FBF1DF' : 'transparent', mlDistFg: mlDistChg ? '#9A5E00' : '#5A5E66', mlDistWt: mlDistChg ? '700' : '400',
          remark, remarkPlaceholder: 'Add a remark for this decision…', onRemark: (e) => this.setAlignRemark(plan.id, idx, e.target.value),
          decision: dec, accepted: dec === 'Accept', rejected: dec === 'Reject', undecided: !dec, locked, notLocked: !locked,
          canDecide: ps === 'Acknowledged', decideLocked: ps !== 'Acknowledged',
          accBg: dec === 'Accept' ? '#128A3E' : '#fff', accFg: dec === 'Accept' ? '#fff' : '#128A3E', rejBg: dec === 'Reject' ? '#D14B4B' : '#fff', rejFg: dec === 'Reject' ? '#fff' : '#D14B4B',
          onAccept: () => this.decideRow(plan.id, idx, 'Accept'), onReject: () => this.decideRow(plan.id, idx, 'Reject'),
          expanded: !!(st.alignExpandedRow && st.alignExpandedRow[plan.id + ':' + idx]),
          onToggleExpand: () => { const k = plan.id + ':' + idx; const cur = Object.assign({}, st.alignExpandedRow); cur[k] = !cur[k]; this.setState({ alignExpandedRow: cur }); },
          dcRows: enrichedDcRows, hasRouteCells, showRouteDecision: needsRouteDecision, noRouteAction: !needsAttn, hasDcChanges: dcChangedCount > 0, dcChangedCount, dcDecidedCount, dcAllDecided, routeDecided, rowFullyDecided,
          dcChangesLabel: dcDecidedCount + '/' + dcChangedCount + ' DC change' + (dcChangedCount === 1 ? '' : 's') + ' decided',
          changeList, changeTotal, hasChanges: needsAttn && changeTotal > 0,
          scChanges: changeList.filter(c => c.isRoute), dcChanges: changeList.filter(c => c.isDc), hasSc: changeList.some(c => c.isRoute), noSc: needsAttn && !changeList.some(c => c.isRoute), hasDc: changeList.some(c => c.isDc), dcChangeCount: changeList.filter(c => c.isDc).length,
          changeProgressLabel: changeDecidedCount + ' of ' + changeTotal + ' decided', allChangesDecided,
          acceptAllRowShow: (ps === 'Acknowledged') && changeDecidedCount < changeTotal,
          onAcceptAllRow: () => this.acceptRowChanges(plan.id, idx, changedDcCodes, needsRouteDecision),
          actionLabel: allChangesDecided ? '✓ All decided' : (changeDecidedCount + '/' + changeTotal + ' decided'),
          actionBg: allChangesDecided ? '#E7F4EC' : '#FBF1DF', actionFg: allChangesDecided ? '#128A3E' : '#C77B00' };
      });
      // C1 — only flagged (Needs Change / Blocker) rows require an Accept/Reject. Aligned rows need none,
      // so the Finalise gate must look only at flagged rows or it can never reach "all decided".
      const flaggedRows = rows.filter(r => r.needsAttn);
      const decidedCount = flaggedRows.filter(r => r.rowFullyDecided).length;
      const autoAligned = rows.length - flaggedRows.length;
      const allDecided = flaggedRows.every(r => r.rowFullyDecided);
      // Master–detail: pick the open route (default first flagged), build the left list + selected route's detail.
      const _selIdx = (st.alignRouteSel && st.alignRouteSel[plan.id] != null && flaggedRows.some(fr => fr.idx === st.alignRouteSel[plan.id])) ? st.alignRouteSel[plan.id] : (flaggedRows.length ? flaggedRows[0].idx : null);
      const routeList = flaggedRows.map(fr => ({ idx: fr.idx, routeCode: fr.routeCode, actionLabel: fr.actionLabel, actionBg: fr.actionBg, actionFg: fr.actionFg, selected: fr.idx === _selIdx, selBg: fr.idx === _selIdx ? '#F3F7FE' : '#fff', selBd: fr.idx === _selIdx ? '#003F98' : 'transparent', onSelect: () => this.setAlignRoute(plan.id, fr.idx) }));
      const _sr = rows.find(r => r.idx === _selIdx) || null;
      const selRoute = _sr ? Object.assign({}, _sr, { scChanges: _sr.changeList.filter(c => c.isRoute), dcChanges: _sr.changeList.filter(c => c.isDc), hasSc: _sr.changeList.some(c => c.isRoute), noSc: !_sr.changeList.some(c => c.isRoute), hasDc: _sr.changeList.some(c => c.isDc), dcChangeCount: _sr.changeList.filter(c => c.isDc).length }) : null;
      // Pagination — render only the current page of route rows (10/page). Gate metrics (flaggedRows,
      // decidedCount, allDecided, accepted/rejected counts) stay computed over the FULL rows so the
      // Acknowledge / Finalise gate never depends on which page is visible.
      // PARITY §2.3 — surface Ops Leads as a labelled field with per-lead acknowledgement status.
      // A lead is "done" once feedback has come back (plan past Pushed); the first lead leads the review,
      // later leads trail deterministically so a realistic ✓ done / ⏳ pending mix shows pre-finalise.
      const fbBack = ps !== 'Pushed';
      const opsLeads = plan.reviewerNames.map((nm, li) => {
        const done = ps === 'Acknowledged' || ps === 'Finalised' ? true : (fbBack && li === 0);
        const initials = nm.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        return { name: nm, done, pending: !done, mark: done ? '✓' : '⏳', statusText: done ? 'Submitted' : 'Awaiting', initials,
          chipBg: done ? '#E7F4EC' : '#F2F5FA', chipFg: done ? '#128A3E' : '#5A5E66' };
      });
      aSel = { exists: true, empty: false, id: plan.id, code: plan.scCode, name: plan.scName, zone: plan.zone, statusLabel: STPILL[ps].l, statusBg: STPILL[ps].bg, statusFg: STPILL[ps].fg,
        sentDate: plan.sentDate, reviewers: plan.reviewerNames.join(', '), opsLeads,
        reviewProgress: opsLeads.filter(o => o.done).length + ' of ' + opsLeads.length + ' submitted', reminded: !!((st.remindedPlans || {})[plan.id]),
        onNudge: () => { const rp = Object.assign({}, this.state.remindedPlans || {}); rp[plan.id] = true; this.setState({ remindedPlans: rp }); this.showToast('Reminder sent to ' + (plan.reviewerNames.join(', ') || 'the reviewers'), '#1E6FB8'); },
        isPushed: ps === 'Pushed', showFeedback: ps !== 'Pushed', isAck: ps === 'Acknowledged', isFinal: ps === 'Finalised', locked, notLocked: !locked,
        // L3 (plan card) <-> L4 (full plan details) toggle. Selecting a different SC in the rail
        // always drops back to L3 (see planList's onClick); the card's "view detail" icon is the
        // only way into L4, with a "Back to plans" link to return -- same pattern as Design Review's
        // run-cards -> full-detail flow.
        detailOpen: !!st.alignDetailOpen, showCard: !st.alignDetailOpen,
        openDetail: () => this.setState({ alignDetailOpen: true }), backToCards: () => this.setState({ alignDetailOpen: false }),
        onMapView: () => this.setState({ mapSC: plan.scCode, view: 'map' }),
        onDownloadCsv: () => { const head = 'Route,Vehicle,Touch Points,Round-Trip Dist (km),Breakdown TAT (h),Out Cutoff,Volume,Utilisation,CPS\n'; const body = plan.rows.map(r => [r.routeCode, r.veh, r.tp, r.rtDist, r.breakdownTat, r.outCutoff, r.volume, Math.round(r.util * 100) + '%', r.cps.toFixed(2)].join(',')).join('\n'); this.downloadText(plan.scCode + '-plan.csv', head + body); this.showToast('CSV downloaded \u00b7 ' + plan.rows.length + ' routes', '#128A3E'); },
        // Finalised-card warnings -- same thresholds/wording as Design Review's validation flags, since
        // this is the same underlying plan just further along the lifecycle (no separate flag data model here).
        cardWarnings: (() => {
          const w = [];
          if (plan.metrics.coverage < 1) w.push({ sev: 'warning', label: 'Coverage gap \u2014 ' + Math.round((1 - plan.metrics.coverage) * plan.rows.reduce((a, r) => a + r.tp, 0)) + ' nodes skipped' });
          const underN = plan.rows.filter(r => r.util < 0.4).length;
          if (underN > 0) w.push({ sev: 'warning', label: underN + ' route' + (underN === 1 ? '' : 's') + ' under-utilised (<40%)' });
          return w;
        })(),
        // Finalised-card inputs strip -- mirrors Design Review's INPUTS row (nodes / volume / HW / vehicle mix).
        cardHwLabel: plan.hw === 0 ? 'HW 0 \u00b7 Re-optimise' : plan.hw === 0.5 ? 'HW 0.5 \u00b7 Balanced' : 'HW 1 \u00b7 Preserve routes',
        cardNodes: fmtInt(plan.rows.reduce((a, r) => a + r.tp, 0)), cardVolume: fmtInt(plan.rows.reduce((a, r) => a + r.volume, 0)),
        cardVehSummary: Object.entries(plan.rows.reduce((m, r) => { m[r.veh] = (m[r.veh] || 0) + 1; return m; }, {})).map(([k, v]) => k + ' \u00d7' + v).join(' \u00b7 '),
        sections: [['details', 'Plan Detail'], ['route', 'Route View']].map(sx => ({ label: sx[1], active: (st.alignSection || 'details') === sx[0], color: (st.alignSection || 'details') === sx[0] ? '#003F98' : '#5A5E66', weight: (st.alignSection || 'details') === sx[0] ? '700' : '600', onClick: () => this.setState({ alignSection: sx[0] }) })),
        secDetails: (st.alignSection || 'details') === 'details', secRoute: (st.alignSection || 'details') === 'route',
        // 2026-07-08 — Accept/Reject now unlocks only AFTER Acknowledge & Freeze, not the moment
        // feedback arrives. While a plan is still In Alignment, the planner can read what Ops
        // flagged and run Simulate, but every row stays view-only until they Acknowledge & Freeze;
        // deciding then happens in the (now-frozen) Acknowledged state, same as before Finalise.
        canDecide: ps === 'Acknowledged', decideLocked: ps !== 'Acknowledged', needsAckToDecide: ps === 'In Alignment',
        showActionBar: ps === 'In Alignment' || ps === 'Acknowledged',
        metrics: [{ label: 'Routes', value: plan.metrics.routes }, { label: 'Vehicles', value: plan.metrics.vehicles }, { label: 'CPS', value: '\u20b9' + plan.metrics.cps.toFixed(2) }, { label: 'Coverage', value: pct(plan.metrics.coverage) }, { label: 'Distance', value: plan.metrics.distance.toLocaleString('en-IN') + ' km' }, { label: 'Avg TAT', value: plan.metrics.avgTat + 'h' }],
        rows: rows, rowCount: rows.length, flaggedCount: flaggedRows.length, alignedCount: autoAligned, hasFlagged: flaggedRows.length > 0, noFlagged: flaggedRows.length === 0, hasAligned: autoAligned > 0, routeList: routeList, selRoute: selRoute, hasSelRoute: !!selRoute, routeCards: flaggedRows, reviewHeadline: flaggedRows.length + ' route' + (flaggedRows.length === 1 ? '' : 's') + ' need a decision', alignedNote: autoAligned + ' of ' + rows.length + ' routes already aligned — no action needed', decidedCount, acceptedCount: rows.filter(r => r.decision === 'Accept').length, rejectedCount: rows.filter(r => r.decision === 'Reject').length, allDecided,
        undecidedFlaggedCount: flaggedRows.filter(r => !r.decision).length,
        canAck: ps === 'In Alignment' && (!!st.opsSubmitted[plan.id] || !!plan.feedbackReceived), canFinalise: ps === 'Acknowledged' && allDecided, finBlocked: ps === 'Acknowledged' && !allDecided,
        finBtnBg: (ps === 'Acknowledged' && allDecided) ? '#128A3E' : '#E6EBF2', finBtnFg: (ps === 'Acknowledged' && allDecided) ? '#fff' : '#5A5E66', finCursor: (ps === 'Acknowledged' && allDecided) ? 'pointer' : 'not-allowed',
        onAck: () => { if (!st.opsSubmitted[plan.id] && !plan.feedbackReceived) { this.showToast('At least one reviewer must submit feedback before you can acknowledge', '#C77B00'); return; } this.setState({ ackOpen: true, ackPlanId: plan.id }); }, onFin: () => { if (ps === 'Acknowledged' && allDecided) this.setState({ finOpen: true, finPlanId: plan.id }); }, progressLabel: decidedCount + ' of ' + flaggedRows.length + ' flagged rows decided · ' + autoAligned + ' auto-aligned',
        onAcceptAllFlagged: () => { const undecN = flaggedRows.filter(r => !r.rowFullyDecided).length; if (undecN === 0) { this.showToast('No undecided flagged changes remaining', '#5A5E66'); return; } this.setState({ acceptAllPlanOpen: true, acceptAllPlanId: plan.id }); },
        acceptAllBg: flaggedRows.some(r => !r.rowFullyDecided) ? '#fff' : '#E6EBF2', acceptAllFg: flaggedRows.some(r => !r.rowFullyDecided) ? '#128A3E' : '#8E96A3', acceptAllBd: flaggedRows.some(r => !r.rowFullyDecided) ? '#128A3E' : '#E6EBF2', acceptAllCursor: flaggedRows.some(r => !r.rowFullyDecided) ? 'pointer' : 'not-allowed', acceptAllTitle: flaggedRows.some(r => !r.rowFullyDecided) ? ('Accept all ' + flaggedRows.filter(r => !r.rowFullyDecided).length + ' undecided changes') : 'All changes decided',
        onPlanValidate: () => {
          // E (2026-07-03) — partial accept/reject can break a route: accepting some DC TP-order changes but not
          // others can leave two DCs at the same touch-point number. Check the effective TP sequence per route.
          const dcDec = (st.alignDcDecisions[plan.id]) || {};
          const tpIssues = [];
          plan.rows.forEach((r, i) => {
            if (r.ops !== 'Needs Change' || !r.fb || !r.fb.dcCells) return;
            const rowDec = dcDec[i] || {}; const dcs = this.genDcRows(r);
            const seq = dcs.map(dc => { const chg = r.fb.dcCells[dc.code]; return (chg && chg.tp != null && rowDec[dc.code] === 'Accept') ? (parseInt(chg.tp) || dc.tpOrder) : dc.tpOrder; });
            const seen = {}; let bad = false; seq.forEach(t => { if (seen[t]) bad = true; seen[t] = true; });
            if (bad) tpIssues.push(r.routeCode);
          });
          const tpOk = plan.rows.every(r => r.tp <= 7); const vehOk = plan.rows.every(r => r.veh); const ncN = plan.rows.filter(r => r.ops === 'Needs Change').length; const seqOk = tpIssues.length === 0;
          const checks = [ (tpOk ? '✓' : '✗') + ' Touch points within guard (' + (tpOk ? 'all ≤7' : 'some exceed 7') + ')', (vehOk ? '✓' : '✗') + ' All vehicles feasible (' + (vehOk ? 'pass' : 'missing vehicle on some rows') + ')', '✓ No duplicate route codes', (seqOk ? '✓ Touch-point order intact' : '✗ Broken TP order after partial accept on ' + tpIssues.join(', ') + ' — reject or fix before finalise'), ncN > 0 ? '⚠ ' + ncN + ' row' + (ncN === 1 ? '' : 's') + ' flagged for change' : '✓ No rows flagged' ];
          this.showToast('Validate · ' + plan.scCode + ' — ' + checks.join(' · '), (tpOk && vehOk && seqOk) ? '#128A3E' : '#C77B00');
        },
        // Plan-level Simulate impact (planner) — aggregated over all Needs Change rows.
        // Gated on ≥1 NC row and plan not yet Finalised.
        ...(() => {
          const ncFlaggedPlan = plan.rows.filter(r => r.ops === 'Needs Change');
          const canPlanSim = ncFlaggedPlan.length > 0 && ps !== 'Finalised';
          if (!canPlanSim) return { canPlanSim: false, planSimBtnBg: '#EAEEFB', planSimBtnFg: '#2F4FC6', planSimBtnLabel: 'Simulate impact', planSimOpen: false, planSimRows: [], planSimSubtitle: '', onPlanSim: () => {}, onPlanSimMap: () => {}, planSimMapBg: '#fff', planSimMapFg: '#2F4FC6', planSimMapLabel: 'Compare on map', planSimMapOpen: false, planSimMapRouteLabel: '', planSmMW: 280, planSmMH: 174, planSmScX: 140, planSmScY: 87, planSmOrigArcs: [], planSmPropArcs: [], planSmOrigDcM: [], planSmPropDcM: [], planSmCapText: '' };
          const m = plan.metrics;
          const nFlagged = ncFlaggedPlan.length;
          const rowFraction = Math.min(1, nFlagged / Math.max(1, plan.rows.length));
          const vehNudge = rowFraction * 0.055, distNudge = rowFraction * 0.038, tpNudge = rowFraction * 0.022;
          const pFmt = (v) => v.toFixed(1) + '%', dFmt = (v) => v.toLocaleString('en-IN') + ' km';
          const dColor = (dd) => dd < 0 ? '#128A3E' : dd > 0 ? '#D14B4B' : '#5A5E66';
          const dSign = (dd, dec) => (dd === 0 ? '—' : (dd > 0 ? '+' : '') + (dec !== undefined ? dd.toFixed(dec) : dd));
          const pR = Math.max(1, Math.round(m.routes   * (1 - tpNudge * 0.5 + vehNudge * 0.3)));
          const pV = Math.max(1, Math.round(m.vehicles * (1 - vehNudge)));
          const pU = Math.min(99, +(m.util + vehNudge * 58 + distNudge * 29).toFixed(1));
          const pD = Math.max(1, Math.round(m.distance * (1 - distNudge * 0.5 + vehNudge * 0.04)));
          const pT = +(m.avgTat + vehNudge * 5.5 - tpNudge * 9).toFixed(1);
          const pC = +(m.cps * (1 - distNudge * 0.4 + vehNudge * 0.15)).toFixed(2);
          const planSimRows = [
            { metric: 'Routes',         original: String(m.routes),        proposed: String(pR),          delta: dSign(pR - m.routes),                    deltaColor: dColor(pR - m.routes) },
            { metric: 'Vehicles',       original: String(m.vehicles),      proposed: String(pV),          delta: dSign(pV - m.vehicles),                  deltaColor: dColor(pV - m.vehicles) },
            { metric: 'Utilisation %',  original: pFmt(m.util),            proposed: pFmt(pU),            delta: dSign(+(pU - m.util).toFixed(1), 1) + '%', deltaColor: dColor(-(pU - m.util)) },
            { metric: 'Total Distance', original: dFmt(m.distance),        proposed: dFmt(pD),            delta: dSign(pD - m.distance, 0).replace(/(\d)(?=(\d{3})+$)/g, '$1,') + ' km', deltaColor: dColor(pD - m.distance) },
            { metric: 'CPS (est.)',     original: '₹' + m.cps.toFixed(2), proposed: '₹' + pC.toFixed(2), delta: dSign(+(pC - m.cps).toFixed(2), 2),       deltaColor: dColor(pC - m.cps) },
          ];
          const planSimMapOpen = !!st.planSimMapOpen;
          const planSC = d.scs.find(s => s.code === plan.scCode);
          const planSRows = plan.rows.map(rr => ({ id: rr.routeCode, veh: rr.veh, tpN: rr.dcs.length, rtDist: rr.rtDist }));
          const firstNcIdx = plan.rows.findIndex(r => r.ops === 'Needs Change');
          const planMm = planSimMapOpen ? (this.buildMiniMap(planSC, planSRows, firstNcIdx >= 0 ? firstNcIdx : 0, 'Aggregate change across flagged routes') || {}) : {};
          // C — headwind callout: CPS delta as signed % for negotiation framing.
          const planCpsOriginal = m.cps;
          const planCpsDelta = +(pC - planCpsOriginal).toFixed(2);
          const planCpsPct = planCpsOriginal > 0 ? +(planCpsDelta / planCpsOriginal * 100).toFixed(1) : 0;
          const planSimCpsHeadwind = planCpsPct;
          const planSimHeadwindPositive = planCpsPct > 0;
          const planSimHeadwindLabel = planCpsPct > 0
            ? 'These changes raise CPS by +' + planCpsPct + '% vs the published design — negotiate before accepting.'
            : planCpsPct < 0
              ? 'These changes improve CPS by ' + planCpsPct + '% vs the published design.'
              : 'No CPS impact from these changes vs the published design.';
          const planSimHeadwindColor = planCpsPct > 0 ? '#C77B00' : '#128A3E';
          const planSimHeadwindBg = planCpsPct > 0 ? '#FBF1DF' : '#E7F4EC';
          const planSimHeadwindBd = planCpsPct > 0 ? '#F0DBA8' : '#B6E0C6';
          // Section 1: 3 plan-level comparison cards (Vehicles, Distance, CPS).
          const planSimCards = (() => {
            const mkCard = (label, origRaw, propRaw, fmt) => {
              const changed = origRaw !== propRaw;
              return {
                label,
                origVal: fmt(origRaw),
                propVal: fmt(propRaw),
                cardBd: changed ? '2px solid #C77B00' : '1px solid #E6EBF2',
                suggestedLabel: changed ? 'Suggested change' : 'Suggested',
                suggestedLabelFg: changed ? '#C77B00' : '#8E96A3',
                propFg: changed ? '#C77B00' : '#5A5E66',
              };
            };
            return [
              mkCard('Total Vehicles', m.vehicles, pV, v => String(v)),
              mkCard('Total Distance (km)', m.distance, pD, v => v.toLocaleString('en-IN')),
              mkCard('Avg CPS (₹)', +m.cps.toFixed(2), pC, v => '₹' + v.toFixed(2)),
            ];
          })();
          // Section 2: route-level CPS rows from plan.rows.
          const planSimRouteRows = plan.rows.map((r, ri) => {
            const isChanged = r.ops === 'Needs Change';
            const fbCells = r.fb ? r.fb.cells : {};
            const origVeh = r.veh;
            const propVeh = (fbCells.vehicleType && fbCells.vehicleType.to) ? String(fbCells.vehicleType.to) : origVeh;
            const vehChanged = propVeh !== origVeh;
            const origCpsVal = +Number(r.cps).toFixed(2);
            const propCpsVal = isChanged ? +(origCpsVal * (1 - distNudge * 0.4 + vehNudge * 0.15)).toFixed(2) : origCpsVal;
            const cpsChanged = isChanged && Math.abs(propCpsVal - origCpsVal) >= 0.01;
            const note = r.fb ? (r.fb.remark || '—') : '—';
            const psVehRecord = (d.VEH || []).find(v => v.name === origVeh) || {};
            const psCapVal = psVehRecord.cap ? fmtInt(psVehRecord.cap) : '—';
            const psVolVal = r.volume != null ? fmtInt(r.volume) : '—';
            const psUtilVal = r.util != null ? Math.round(r.util * 100) + '%' : '—';
            return {
              routeCode: r.routeCode,
              origVeh, propVeh,
              vehChanged, vehUnchanged: !vehChanged,
              countDisp: String(r.dcs ? r.dcs.length : r.tp || 1),
              distDisp: r.rtDist + ' km',
              origCps: '₹' + origCpsVal.toFixed(2),
              propCps: '₹' + propCpsVal.toFixed(2),
              cpsChanged, cpsUnchanged: !cpsChanged,
              note,
              isChanged, isNoChange: !isChanged,
              rowBg: isChanged ? '#FFFBF2' : '#fff',
              vol: psVolVal, util: psUtilVal, cap: psCapVal,
            };
          });
          // Section 3: map filter state. Route dropdown uses route codes from plan.rows.
          const planSmOrigSearch = st.planSmOrigSearch || '';
          const planSmPropSearch = st.planSmPropSearch || '';
          const planSmOrigRoute = st.planSmOrigRoute || 'All';
          const planSmPropRoute = st.planSmPropRoute || 'All';
          const planSmRouteOptions = [{ value: 'All', label: 'All Routes' }].concat(plan.rows.map(r => ({ value: r.routeCode, label: r.routeCode })));
          // Always build map (always visible now — no toggle button).
          const planMmAlways = (this.buildMiniMap(planSC, planSRows, firstNcIdx >= 0 ? firstNcIdx : 0, 'Aggregate change across flagged routes') || {});
          const allOrigArcs = planMmAlways.origArcs || [];
          const allPropArcs = planMmAlways.propArcs || [];
          // Filter arcs by route selection. Search is on DC codes which live in route labels on the arcs;
          // arcs have a `routeCode` property set by buildMiniMap if available; fallback: filter by index.
          const filterArcs = (arcs, routeSel, searchQ) => {
            if (routeSel === 'All' && !searchQ) return arcs;
            return arcs.filter((a, ai) => {
              const routeMatch = routeSel === 'All' || (a.routeCode ? a.routeCode === routeSel : (plan.rows[ai] && plan.rows[ai].routeCode === routeSel));
              const searchMatch = !searchQ || (a.routeCode || '').toLowerCase().includes(searchQ.toLowerCase()) || (plan.rows[ai] && plan.rows[ai].routeCode && plan.rows[ai].routeCode.toLowerCase().includes(searchQ.toLowerCase()));
              return routeMatch && searchMatch;
            });
          };
          const planSmOrigArcsF = filterArcs(allOrigArcs, planSmOrigRoute, planSmOrigSearch);
          const planSmPropArcsF = filterArcs(allPropArcs, planSmPropRoute, planSmPropSearch);
          const ncChangedCount = ncFlaggedPlan.length;
          return {
            canPlanSim: true,
            planSimBtnBg: '#EAEEFB', planSimBtnFg: '#2F4FC6',
            planSimBtnLabel: 'Simulate impact',
            onPlanSim: () => this.setState({ planSimOpen: true, planSimMapOpen: false }),
            closePlanSim: () => this.setState({ planSimOpen: false, planSimMapOpen: false, planSmOrigSearch: '', planSmPropSearch: '', planSmOrigRoute: 'All', planSmPropRoute: 'All', planSmOrigLegendOpen: false, planSmPropLegendOpen: false }),
            planSimPlanName: plan.scCode + ' · ' + plan.scName,
            planSimOpen: !!st.planSimOpen, planSimRows,
            planSimCards,
            planSimRouteRows,
            planSimCpsHeadwind, planSimHeadwindPositive, planSimHeadwindLabel, planSimHeadwindColor, planSimHeadwindBg, planSimHeadwindBd,
            planSimSubtitle: nFlagged + ' Needs Change row' + (nFlagged === 1 ? '' : 's') + ' · indicative, not a re-solve',
            planSimMapOpen: false,
            planSmMW: planMmAlways.MW || 280, planSmMH: planMmAlways.MH || 174, planSmScX: planMmAlways.scX || 140, planSmScY: planMmAlways.scY || 87,
            planSmOrigArcs: allOrigArcs, planSmPropArcs: allPropArcs,
            planSmOrigArcsF, planSmPropArcsF,
            planSmOrigDcM: planMmAlways.origDcMarkers || [], planSmPropDcM: planMmAlways.propDcMarkers || [],
            planSmCapText: 'Aggregate change across ' + nFlagged + ' flagged route' + (nFlagged === 1 ? '' : 's'),
            planSmOrigCount: plan.rows.length,
            planSmPropChangedCount: ncChangedCount,
            planSmOrigSearch, planSmPropSearch,
            planSmOrigRoute, planSmPropRoute,
            planSmRouteOptions,
            planSmOrigVisCount: planSmOrigArcsF.length,
            planSmPropVisCount: planSmPropArcsF.length,
            planSmOrigLegendOpen: !!st.planSmOrigLegendOpen,
            planSmPropLegendOpen: !!st.planSmPropLegendOpen,
            onPlanSmOrigSearch: (e) => this.setState({ planSmOrigSearch: e.target.value }),
            onPlanSmPropSearch: (e) => this.setState({ planSmPropSearch: e.target.value }),
            onPlanSmOrigRoute: (e) => this.setState({ planSmOrigRoute: e.target.value }),
            onPlanSmPropRoute: (e) => this.setState({ planSmPropRoute: e.target.value }),
            onPlanSmOrigLegend: () => this.setState({ planSmOrigLegendOpen: !st.planSmOrigLegendOpen }),
            onPlanSmPropLegend: () => this.setState({ planSmPropLegendOpen: !st.planSmPropLegendOpen }),
          };
        })() };
    }

    const ackPlan = st.ackPlanId ? plans.find(p => p.id === st.ackPlanId) : null;
    const finPlan = st.finPlanId ? plans.find(p => p.id === st.finPlanId) : null;
    const finDec = finPlan ? finPlan.rows.map((r, i) => (st.alignDecisions[finPlan.id] && st.alignDecisions[finPlan.id][i]) || r.planner) : [];
    const ackPending = ackPlan ? ackPlan.rows.filter((r, i) => r.ops === 'Needs Change' && !((st.alignDecisions[ackPlan.id] && st.alignDecisions[ackPlan.id][i]) || r.planner)).length : 0;

    // Master-detail: rail (list) and detail pane both render whenever the filter has plans.
    const alignIsL1 = hasPlansInList;
    const alignIsL2 = hasPlansInList;
    // Pagination for L1 plan list (~12 per page).
    const ALIGN_PER_PAGE = 12;
    const alignPage = typeof st.alignPage === 'number' ? st.alignPage : 0;
    const alignTotalPages = Math.max(1, Math.ceil(listPlans.length / ALIGN_PER_PAGE));
    const alignPageSafe = Math.min(alignPage, alignTotalPages - 1);
    const alignStart = alignPageSafe * ALIGN_PER_PAGE;
    const alignEnd = Math.min(alignStart + ALIGN_PER_PAGE, listPlans.length);
    const planListPage = planList.slice(alignStart, alignEnd);
    const alignShowPager = listPlans.length > ALIGN_PER_PAGE;
    const alignShowingLabel = listPlans.length === 0 ? 'No plans' : ('Showing ' + (alignStart + 1) + '–' + alignEnd + ' of ' + listPlans.length);
    const alignHasPrev = alignPageSafe > 0;
    const alignHasNext = alignPageSafe < alignTotalPages - 1;

    return { isAlign, isAlignPlanner: isAlign && planner, isAlignOps: isAlign && !planner,
      alignIsL1, alignIsL2,
      alignPage: alignPageSafe, alignTotalPages, alignShowPager,
      alignShowingLabel, alignHasPrev, alignHasNext,
      alignPrevPage: () => this.setState({ alignPage: Math.max(0, alignPageSafe - 1) }),
      alignNextPage: () => this.setState({ alignPage: Math.min(alignTotalPages - 1, alignPageSafe + 1) }),
      alignBackToList: () => this.setState({ alignPlanId: null }),
      planList: planList, alignFilterSeg, planCount: listPlans.length, aSel, alignClearFilter: () => this.setState({ alignFilter: 'Pending Feedback', alignPage: 0 }),
      ackOpen: st.ackOpen, ackPlanName: ackPlan ? (ackPlan.scCode + ' \u00b7 ' + ackPlan.scName) : '', ackReviewers: ackPlan ? ackPlan.reviewerNames.join(', ') : '', ackPendingCount: ackPending, ackHasPending: ackPending > 0, ackPendingLabel: ackPending + ' row' + (ackPending === 1 ? '' : 's') + ' still pending \u2014 they will be frozen as-is', confirmAck: () => this.confirmAck(), closeAck: () => this.setState({ ackOpen: false }),
      finOpen: st.finOpen, finPlanName: finPlan ? (finPlan.scCode + ' \u00b7 ' + finPlan.scName) : '', finAccepted: finDec.filter(x => x === 'Accept').length, finRejected: finDec.filter(x => x === 'Reject').length, confirmFin: () => this.confirmFin(), closeFin: () => this.setState({ finOpen: false }),
      // Accept-all-flagged modal bindings
      acceptAllPlanOpen: st.acceptAllPlanOpen,
      acceptAllPlanId: st.acceptAllPlanId,
      acceptAllPlanName: (() => { const p = st.acceptAllPlanId ? plans.find(x => x.id === st.acceptAllPlanId) : null; return p ? (p.scCode + ' \u00b7 ' + p.scName) : ''; })(),
      acceptAllFlaggedCount: (() => { const p = st.acceptAllPlanId ? plans.find(x => x.id === st.acceptAllPlanId) : null; if (!p) return 0; return p.rows.filter((r, i) => r.ops === 'Needs Change' && !((st.alignDecisions[p.id] && st.alignDecisions[p.id][i]) || r.planner)).length; })(),
      confirmAcceptAllPlan: () => this.confirmAcceptAllPlan(), closeAcceptAllPlan: () => this.setState({ acceptAllPlanOpen: false, acceptAllPlanId: null }),
      stopPropSim: (e) => e.stopPropagation() };
  }

  opsDecide(planId, idx, val) { const a = Object.assign({}, this.state.opsRowDec); a[planId] = Object.assign({}, a[planId]); a[planId][idx] = val; this.setState({ opsRowDec: a }); }
  acceptAllOps(planId) { const p = this.state.data.plans.find(x => x.id === planId); const a = Object.assign({}, this.state.opsRowDec); a[planId] = Object.assign({}, a[planId]); p.rows.forEach((r, i) => { const cur = a[planId][i] || 'Pending'; if (cur !== 'Needs Change') a[planId][i] = 'Aligned'; }); this.setState({ opsRowDec: a }); }
  // E3 — confirmed path: only commits the mark-all after the dialog, then shows an undo-able toast.
  confirmAlignAll() { const id = this.state.alignAllPlanId; if (id) { this.acceptAllOps(id); this.showToast('All pending rows marked Aligned · use Reset to undo', '#128A3E'); } this.setState({ alignAllOpen: false }); }
  resetOps(planId) { const a = Object.assign({}, this.state.opsRowDec); a[planId] = {}; this.setState({ opsRowDec: a }); }

  // Planner bulk-accept all undecided flagged (Needs Change) rows for a plan.
  decideAllFlagged(planId) {
    const plan = this.state.data.plans.find(p => p.id === planId); if (!plan) return;
    const a = Object.assign({}, this.state.alignDecisions); a[planId] = Object.assign({}, a[planId]);
    plan.rows.forEach((r, i) => { if (r.ops === 'Needs Change') { const cur = a[planId][i] || r.planner; if (!cur) a[planId][i] = 'Accept'; } });
    // also accept every flagged DC-level change so "Accept all changes" clears the full gate
    const dd = Object.assign({}, this.state.alignDcDecisions); dd[planId] = Object.assign({}, dd[planId]);
    plan.rows.forEach((r, i) => { if (r.ops === 'Needs Change' && r.fb && r.fb.dcCells) { dd[planId][i] = Object.assign({}, dd[planId][i]); Object.keys(r.fb.dcCells).forEach(code => { if (!dd[planId][i][code]) dd[planId][i][code] = 'Accept'; }); } });
    // also fill per-field route-level decisions (Accept, undecided only) so the card reflects the accept-all
    const fd = Object.assign({}, this.state.alignFieldDec);
    plan.rows.forEach((r, i) => { if (r.ops === 'Needs Change' && r.fb && r.fb.cells) { const key = planId + ':' + i; fd[key] = Object.assign({}, fd[key]); Object.keys(r.fb.cells).forEach(k => { if (!fd[key][k]) fd[key][k] = 'Accept'; }); } });
    this.setState({ alignDecisions: a, alignDcDecisions: dd, alignFieldDec: fd });
  }
  confirmAcceptAllPlan() {
    const id = this.state.acceptAllPlanId; if (id) { this.decideAllFlagged(id); this.showToast('All proposed changes accepted', '#128A3E'); }
    this.setState({ acceptAllPlanOpen: false, acceptAllPlanId: null });
  }
  // E2 — opens the "Flag changes" modal. Only flagged cells become feedback.
  openNc(planId, idx) { const r = this.state.data.plans.find(p => p.id === planId).rows[idx]; this.setState({ ncOpen: true, ncDecision: 'Needs Change', ncRow: { planId: planId, idx: idx }, ncCells: { vehicleType: r.veh, routeCode: r.routeCode, rtDist: String(r.rtDist) }, ncFlags: {}, ncDcCells: {}, ncRemark: '' }); }
  closeNc() { this.setState({ ncOpen: false }); }
  setNc(field, val) { const c = Object.assign({}, this.state.ncCells); c[field] = val; this.setState({ ncCells: c }); }
  // E2 \u2014 toggle whether a cell is flagged. Only flagged cells reveal their input + become feedback.
  toggleNcFlag(field) { const f = Object.assign({}, this.state.ncFlags || {}); if (f[field]) delete f[field]; else f[field] = true; this.setState({ ncFlags: f }); }
  // Per-DC (node-scoped) feedback: lat/long + touch-point sequence are flagged PER DC within the route (walkthrough 70:32).
  toggleNcDc(dcCode, seed) { const m = Object.assign({}, this.state.ncDcCells || {}); if (m[dcCode]) { delete m[dcCode]; } else { m[dcCode] = Object.assign({ lat: '', lng: '', tp: '' }, seed || {}); } this.setState({ ncDcCells: m }); }
  setNcDc(dcCode, field, val) { const m = Object.assign({}, this.state.ncDcCells || {}); m[dcCode] = Object.assign({ lat: '', lng: '', tp: '' }, m[dcCode] || {}); m[dcCode][field] = val; this.setState({ ncDcCells: m }); }
  submitNc() {
    const st = this.state, r = st.ncRow;
    const row = st.data.plans.find(p => p.id === r.planId).rows[r.idx];
    const c = st.ncCells || {}, flags = st.ncFlags || {};
    const decision = st.ncDecision || 'Needs Change';
    // E2 \u2014 only FLAGGED route-scoped cells become feedback; map them to the planner-side cell keys.
    const FMAP = { vehicleType: ['vehicleType', row.veh], routeCode: ['routeCode', row.routeCode], rtDist: ['roundTripDistance', String(row.rtDist)] };
    const cells = {};
    Object.keys(FMAP).forEach(field => { if (!flags[field]) return; const [key, orig] = FMAP[field]; const now = c[field]; cells[key] = { from: orig, to: (now !== undefined && String(now) !== '') ? now : orig }; });
    // Per-DC (node-scoped) feedback: lat/long + touch-point order flagged per DC within this route.
    const dcMap = st.ncDcCells || {}; const dcCells = {};
    Object.keys(dcMap).forEach(code => { const v = dcMap[code] || {}; const e = {}; if (v.lat !== '' && v.lat != null) e.lat = v.lat; if (v.lng !== '' && v.lng != null) e.lng = v.lng; if (v.tp !== '' && v.tp != null) e.tp = v.tp; if (Object.keys(e).length) dcCells[code] = e; });
    const dcCount = Object.keys(dcCells).length;
    // \u00a710 O2 \u2014 attribute this proposed change to the current reviewer so co-reviewers + the planner
    // see "Change proposed by <name>". Ops Lead persona = Rahul Sharma in this prototype.
    const reviewerName = st.persona === 'planner' ? 'Pranita Sapkal' : 'Rahul Sharma';
    const fb = { cells, dcCells, dcCount, remark: (st.ncRemark || '').trim() || 'Needs change', by: reviewerName };
    const a = Object.assign({}, st.opsRowFb); a[r.planId] = Object.assign({}, a[r.planId]); a[r.planId][r.idx] = fb;
    // mirror the attribution onto the live row so the Ops-Lead row indicator updates immediately
    const pl = st.data.plans.find(p => p.id === r.planId); if (pl) pl.rows[r.idx].proposedBy = reviewerName;
    this.opsDecide(r.planId, r.idx, decision);
    this.setState({ opsRowFb: a, ncOpen: false });
    this.showToast('Change flagged on ' + row.routeCode + ' \u2014 proposed by ' + reviewerName + ', visible to co-reviewers', '#C77B00');
  }
  submitOpsPlan(planId) {
    // C4 \u2014 live hand-off: write the Ops decisions + cell-flags into the plan rows and flip Pushed \u2192 In Alignment
    // so the planner pipeline + row feedback reflect this session (not a disconnected seed copy).
    const st = this.state, d = st.data;
    const dec = st.opsRowDec[planId] || {};
    const fbMap = st.opsRowFb[planId] || {};
    const plans = d.plans.map(p => {
      if (p.id !== planId) return p;
      const rows = p.rows.map((r, i) => {
        const dv = dec[i];
        // §10 O2 — carry the proposer attribution (fb.by) onto the row so the planner sees who proposed it.
        const fbN = fbMap[i] || r.fb;
        const propN = (fbN && fbN.by) || r.proposedBy || null;
        if (dv === 'Aligned') return Object.assign({}, r, { ops: 'Aligned', fb: null, proposedBy: null });
        if (dv === 'Needs Change') return Object.assign({}, r, { ops: 'Needs Change', fb: fbN || { cells: {}, remark: 'Needs change' }, proposedBy: propN });
        return r; // Pending / untouched rows keep their seeded state
      });
      return Object.assign({}, p, { rows, feedbackReceived: true });
    });
    const alignStatus = Object.assign({}, st.alignStatus); alignStatus[planId] = 'In Alignment';
    // Provenance for the multi-reviewer audit trail — stamp who submitted and when (persists in the panel record).
    const now = new Date(); const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const at = String(now.getDate()).padStart(2, '0') + ' ' + MON[now.getMonth()] + ' · ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const s = Object.assign({}, st.opsSubmitted); s[planId] = { by: 'Rahul Sharma', at: at };
    this.setState({ data: Object.assign({}, d, { plans }), alignStatus, opsSubmitted: s });
    this.showToast('Feedback submitted to planner · recorded ' + at, '#128A3E');
  }

  opsVals() {
    const st = this.state, d = st.data;
    const pct = (n) => Math.round(n * 100) + '%';
    const fmtInt = (n) => n.toLocaleString('en-IN');
    // Keep a plan visible after the Ops Lead submits (it flips Pushed → In Alignment) so the panel retains a
    // record — who submitted, when. D4 — also keep it after the planner acknowledges/finalises: instead of
    // vanishing, a frozen plan stays as a read-only "Locked" record so the POC sees which plans are closed.
    const assigned = d.plans.filter(p => { const s = st.alignStatus[p.id] || p.status; return s === 'Pushed' || !!st.opsSubmitted[p.id] || s === 'Acknowledged' || s === 'Finalised'; });
    const selfName = 'Rahul Sharma'; // current Ops-Lead persona (see ~line 3538); co-reviewers = everyone else on the plan
    // Ops-Lead status of a plan (drives the rail filter segment + the card pill).
    // Four states tied directly to plan lifecycle + this reviewer's own submission --
    // replaces the old row-progress-based "In progress" bucket for a cleaner mental model.
    const opsStatusOf = (p) => {
      const subInfo = st.opsSubmitted[p.id]; const sub = !!subInfo;
      const eS = (st.alignStatus && st.alignStatus[p.id]) || p.status;
      if (eS === 'Finalised') return 'Finalised';
      if (eS === 'Acknowledged') return 'Acknowledged';
      return sub ? 'Submitted' : 'To Review';
    };
    const opsFilter = st.opsFilter || 'To Review';
    const filteredAssigned = assigned.filter(p => opsStatusOf(p) === opsFilter);
    // Master-detail: keep the explicit selection if it's in the filtered list, else auto-select the first
    // so the detail pane is never blank (mirrors Design Review + the planner side).
    const curId = (st.opsPlanId && filteredAssigned.some(p => p.id === st.opsPlanId)) ? st.opsPlanId : (filteredAssigned.length > 0 ? filteredAssigned[0].id : null);
    // B — latest plan = first assigned plan (To review sorts to front via status ordering).
    const latestOpsId = assigned.length > 0 ? assigned[0].id : null;
    const SP = { 'Finalised': { bg: '#E7F4EC', fg: '#128A3E' }, 'Acknowledged': { bg: '#E7F0F8', fg: '#1E6FB8' }, 'Submitted': { bg: '#E7F4EC', fg: '#128A3E' }, 'To Review': { bg: '#F2F5FA', fg: '#5A5E66' } };
    const allOpsPlans = assigned.map(p => {
      const subInfo = st.opsSubmitted[p.id]; const sub = !!subInfo;
      const subBy = (subInfo && subInfo.by) || selfName; const subAt = (subInfo && subInfo.at) || '';
      const dec = st.opsRowDec[p.id] || {};
      const done = p.rows.filter((r, i) => dec[i] && dec[i] !== 'Pending').length;
      // §10 O2 — co-reviewer awareness: count rows already carrying a change proposed by SOMEONE ELSE, so the
      // list tells this reviewer "a co-reviewer has flagged this plan" the same way the planner sees feedback.
      const liveFb = st.opsRowFb[p.id] || {}; const propBy = {};
      p.rows.forEach((r, i) => { const by = (liveFb[i] && liveFb[i].by) || r.proposedBy || null; if (by && by !== selfName) propBy[by] = (propBy[by] || 0) + 1; });
      const propN = Object.keys(propBy).reduce((a, k) => a + propBy[k], 0); const coRev = Object.keys(propBy)[0] || '';
      const status = opsStatusOf(p);
      const isLatest = p.id === latestOpsId && !curId;
      const reminded = !!((st.remindedPlans || {})[p.id]) && !sub;
      return { id: p.id, code: p.scCode, name: p.scName, zone: p.zone, status, isLatest, active: p.id === curId, bg: p.id === curId ? '#EAEEFB' : '#fff', bd: p.id === curId ? '#003F98' : '#E6EBF2', progress: Math.round(done / p.rows.length * 100) + '%', statusLabel: status, statusBg: SP[status].bg, statusFg: SP[status].fg, hasProp: propN > 0 && !sub, propLabel: propN + ' change' + (propN === 1 ? '' : 's') + ' proposed' + (coRev ? ' by ' + coRev.split(' ')[0] : ''), submitted: sub, submittedRecord: sub ? ('Submitted by ' + subBy + (subAt ? ' · ' + subAt : '')) : '', reminded, onClick: () => this.setState({ opsPlanId: p.id, opsDetailOpen: false }) };
    });
    // Reviewer states — To Review / Submitted / Acknowledged / Finalised (plan-lifecycle-tied, see opsStatusOf).
    const opsCnt = (s) => allOpsPlans.filter(p => p.status === s).length;
    const OPSFILTERS = ['To Review', 'Submitted', 'Acknowledged', 'Finalised'];
    const opsPlans = allOpsPlans.filter(p => p.status === opsFilter);

    const plan = d.plans.find(p => p.id === curId);
    const sec = st.opsSection || 'details';
    // B — distinguish "no plans assigned" (empty=true) from "plans exist but none selected" (unselected=true).
    // The rail (list) stays visible whenever ANY plans are assigned; only the DETAIL pane reflects
    // the active filter. `empty` (full-width) fires ONLY when nothing is assigned at all; `filterEmpty`
    // = plans exist but this filter matched none → show an empty detail beside the still-visible rail.
    const noneAssigned = assigned.length === 0;
    const filterEmpty = !noneAssigned && filteredAssigned.length === 0;
    let oSel = { exists: false, empty: noneAssigned, filterEmpty: filterEmpty, unselected: !noneAssigned && !curId };
    if (plan) {
      const dec = st.opsRowDec[plan.id] || {};
      const OP = { 'Aligned': { bg: '#E7F4EC', fg: '#128A3E' }, 'Needs Change': { bg: '#FBF1DF', fg: '#C77B00' } };
      const subInfoSel = st.opsSubmitted[plan.id]; const submitted = !!subInfoSel;
      const subBySel = (subInfoSel && subInfoSel.by) || 'Rahul Sharma'; const subAtSel = (subInfoSel && subInfoSel.at) || '';
      // KRD §11 — editing locks only when the planner acknowledges; submitted-but-not-acknowledged rows stay editable.
      const planStatus = st.alignStatus[plan.id] || plan.status;
      const planLocked = planStatus === 'Acknowledged' || planStatus === 'Finalised';
      const rows = plan.rows.map((r, idx) => { const dv = dec[idx] || 'Pending'; const op = OP[dv];
        // §10 O2 — show a co-reviewer's already-proposed change to THIS (second) reviewer, so opening
        // the plan never shows a blank slate. Prefer live submitted feedback, else the seeded row.
        const liveFb = (st.opsRowFb[plan.id] || {})[idx];
        const propBy = (liveFb && liveFb.by) || r.proposedBy || null;
        const propRemark = (liveFb && liveFb.remark) || (r.fb && r.fb.remark) || '';
        const opStyle = OP[dv] || { bg: 'transparent', fg: '#C3C9D4' };
        const oVehRecord = (d.VEH || []).find(v => v.name === r.veh) || {};
        const oCapVal = oVehRecord.cap ? fmtInt(oVehRecord.cap) : '—';
        const oVolVal = r.volume != null ? fmtInt(r.volume) : '—';
        const oUtilVal = r.util != null ? Math.round(r.util * 100) + '%' : '—';
        // A5 — editable per-node touch-point order overlay + 1..n validation (ops feedback reorder).
        const _tpKey = plan.id + ':' + idx;
        const _tpOrd = (st.opsTpOrder && st.opsTpOrder[_tpKey]) || {};
        const _dcRows0 = this.genDcRows(r).map((dc, di) => Object.assign({}, dc, { tpOrderVal: (_tpOrd[di] != null && _tpOrd[di] !== '' ? _tpOrd[di] : dc.tpOrder), onOrder: (e) => this.setTpOrder(plan.id, idx, di, e.target.value) }));
        const _tpN = _dcRows0.length;
        const _tpNums = _dcRows0.map(x => parseInt(x.tpOrderVal, 10));
        // Per-input validation: flag any DC whose touch-point number is out of range OR shares a number
        // with another DC, so the offending input(s) turn red — not just a summary message.
        const _tpSeen = {}; _tpNums.forEach(n => { if (Number.isInteger(n)) _tpSeen[n] = (_tpSeen[n] || 0) + 1; });
        const _dcRows = _dcRows0.map((dc, di) => { const n = _tpNums[di]; const bad = !Number.isInteger(n) || n < 1 || n > _tpN || _tpSeen[n] > 1; return Object.assign({}, dc, { tpErr: bad, tpNotErr: !bad, tpBd: bad ? '#D14B4B' : '#C3C9D4', tpBg: bad ? '#FCEEEE' : '#fff' }); });
        const _tpN2 = _dcRows.length;
        const _tpTouched = Object.keys(_tpOrd).length > 0;
        const _tpValid = _tpNums.every(x => Number.isInteger(x) && x >= 1 && x <= _tpN) && (new Set(_tpNums)).size === _tpN;
        const _tpMsg = _tpValid ? ('Valid 1–' + _tpN + ' order') : ('Fix the highlighted stops — each needs a unique number 1–' + _tpN);
        return { idx, routeCode: r.routeCode, veh: r.veh, tp: r.tp, dcs: r.dcs.length, rtDist: r.rtDist + ' km', cps: '₹' + Number(r.cps).toFixed(2), decision: dv, decChip: (dv === 'Pending' ? '—' : dv), opsBg: opStyle.bg, opsFg: opStyle.fg, aligned: dv === 'Aligned', notAligned: dv !== 'Aligned', needsChange: dv === 'Needs Change', submitted, editable: !planLocked, alignBg: dv === 'Aligned' ? '#128A3E' : '#fff', alignFg: dv === 'Aligned' ? '#fff' : '#128A3E', ncBg: dv === 'Needs Change' ? '#C77B00' : '#fff', ncFg: dv === 'Needs Change' ? '#fff' : '#C77B00',
          proposedBy: propBy, hasProposed: !!propBy, proposedLabel: propBy ? ('Change proposed by ' + propBy) : '', proposedRemark: propRemark,
          vol: oVolVal, util: oUtilVal, cap: oCapVal, routeMeta: 'Vol ' + oVolVal + ' · Util ' + oUtilVal + ' · Cap ' + oCapVal,
          onAlign: () => this.opsDecide(plan.id, idx, 'Aligned'), onNeeds: () => this.openNc(plan.id, idx),
          expanded: !!(st.opsExpandedRow && st.opsExpandedRow[plan.id + ':' + idx]),
          onToggleExpand: () => { const k = plan.id + ':' + idx; const cur = Object.assign({}, st.opsExpandedRow); cur[k] = !cur[k]; this.setState({ opsExpandedRow: cur }); },
          dcRows: _dcRows, notEditable: planLocked, tpReorderTouched: _tpTouched, tpReorderValid: _tpValid, tpReorderMsg: _tpMsg }; });
      const alignedN = rows.filter(r => r.decision === 'Aligned').length, ncN = rows.filter(r => r.decision === 'Needs Change').length, pendN = rows.filter(r => r.decision === 'Pending').length;
      const mix = {}; plan.rows.forEach(r => { mix[r.veh] = (mix[r.veh] || 0) + 1; }); const mixArr = Object.keys(mix).map(k => ({ veh: k, n: mix[k], pctW: Math.round(mix[k] / plan.rows.length * 100) + '%' }));
      // (per-route "Node Details" list removed with the Node Details tab)
      // §10 O2 — plan-level co-reviewer summary + roster (awareness "the same way" the planner sees feedback received).
      const propRows = rows.filter(r => r.hasProposed && r.proposedBy !== 'Rahul Sharma');
      const propByNames = [...new Set(propRows.map(r => r.proposedBy))].filter(Boolean);
      const oProp = propRows.length;
      const coReviewerLabel = (plan.reviewerNames || []).filter(n => n !== 'Rahul Sharma').join(', ');
      const SECS = [['details', 'Plan Detail'], ['route', 'Route View']];
      oSel = { exists: true, empty: false, id: plan.id, code: plan.scCode, name: plan.scName, zone: plan.zone, sentDate: plan.sentDate, submitted, notSubmitted: !submitted,
        planLocked, opsAck: planStatus === 'Acknowledged', opsFinal: planStatus === 'Finalised',
        detailOpen: !!st.opsDetailOpen, showCard: !st.opsDetailOpen,
        openDetail: () => this.setState({ opsDetailOpen: true }), backToCards: () => this.setState({ opsDetailOpen: false }),
        onDownloadCsv: () => { const head = 'Route,Vehicle,Touch Points,Round-Trip Dist (km),Breakdown TAT (h),Out Cutoff,Volume,Utilisation,CPS\n'; const body = plan.rows.map(r => [r.routeCode, r.veh, r.tp, r.rtDist, r.breakdownTat, r.outCutoff, r.volume, Math.round(r.util * 100) + '%', r.cps.toFixed(2)].join(',')).join('\n'); this.downloadText(plan.scCode + '-plan.csv', head + body); this.showToast('CSV downloaded \u00b7 ' + plan.rows.length + ' routes', '#128A3E'); },
        onDownloadCsv: () => { const head = 'Route,Vehicle,Touch Points,Round-Trip Dist (km),Breakdown TAT (h),Out Cutoff,Volume,Utilisation,CPS\n'; const body = plan.rows.map(r => [r.routeCode, r.veh, r.tp, r.rtDist, r.breakdownTat, r.outCutoff, r.volume, Math.round(r.util * 100) + '%', r.cps.toFixed(2)].join(',')).join('\n'); this.downloadText(plan.scCode + '-plan.csv', head + body); this.showToast('CSV downloaded \u00b7 ' + plan.rows.length + ' routes', '#128A3E'); },
        rows, alignedN, ncN, pendN, rowCount: rows.length, allReviewed: pendN === 0, reviewLabel: (rows.length - pendN) + ' / ' + rows.length + ' reviewed',
        hasProp: oProp > 0 && !submitted, propN: oProp, propSummary: (propByNames.join(' & ') || 'A co-reviewer') + ' proposed ' + oProp + ' change' + (oProp === 1 ? '' : 's') + ' on this plan', coReviewerLabel, hasCoReviewers: coReviewerLabel.length > 0,
        submittedRecord: submitted ? ('Submitted by ' + subBySel + (subAtSel ? ' · ' + subAtSel : '')) : '',
        metrics: [{ label: 'Routes', value: plan.metrics.routes }, { label: 'Vehicles', value: plan.metrics.vehicles }, { label: 'CPS', value: '\u20b9' + plan.metrics.cps.toFixed(2) }, { label: 'Coverage', value: pct(plan.metrics.coverage) }, { label: 'Distance', value: plan.metrics.distance.toLocaleString('en-IN') + ' km' }, { label: 'Avg TAT', value: plan.metrics.avgTat + 'h' }],
        mixArr, secDetails: sec === 'details', secRoute: sec === 'route',
        sections: SECS.map(s => ({ label: s[1], active: sec === s[0], color: sec === s[0] ? '#003F98' : '#5A5E66', weight: sec === s[0] ? '700' : '600', onClick: () => this.setState({ opsSection: s[0] }) })),
        onAcceptAll: () => { if (pendN > 0) this.setState({ alignAllOpen: true, alignAllPlanId: plan.id }); }, acceptAllDisabled: pendN === 0, onReset: () => this.resetOps(plan.id), onMapView: () => this.setState({ mapSC: plan.scCode, view: 'map' }),
        onOpsValidate: () => { const dec = st.opsRowDec[plan.id] || {}; const ncRows = Object.values(dec).filter(v => v === 'Needs Change').length; const tpOk = plan.rows.every(r => r.tp <= 7); const checks = [ (tpOk ? '✓' : '✗') + ' Touch points within guard', ncRows > 0 ? ncRows + ' row' + (ncRows === 1 ? '' : 's') + ' need change — add remarks before submitting' : '✓ No changes flagged', '✓ All vehicles feasible' ]; this.showToast('Validate · ' + plan.scCode + ' — ' + checks.join(' · '), tpOk ? '#128A3E' : '#C77B00'); },
        // Submit remains available until the planner acknowledges; re-submit overwrites the previous stamp (idempotent).
        canSubmit: !planLocked,
        onSubmit: () => { if (pendN > 0) { this.setState({ opsPartialOpen: true, opsPartialPlanId: plan.id }); } else { this.submitOpsPlan(plan.id); } },
        submitLabel: submitted ? 'Update feedback' : 'Submit feedback',
        submitBg: '#003F98', submitFg: '#fff', submitCursor: 'pointer' };
    }

    const c = st.ncCells || {}, ncFlags = st.ncFlags || {};
    // E2 — per-cell flag toggle: only flagged cells reveal an input + become feedback (fewer always-editable fields).
    // Vehicle Type → dropdown of the canonical VEH pool (B1). Out Cutoff → time input.
    const vehPool = (d.VEH || []).map(v => ({ value: v.name, label: v.name }));
    // Route-scoped fields — flagged once for the whole route. Node-scoped fields (lat/long, touch-point) are
    // flagged PER DC in the per-node section below (walkthrough 70:32: route button → open node list → per-DC lat-long/TP).
    // Out-Cutoff + Breakdown-TAT removed from the flaggable set (2026-07-03): Ops doesn't align on
    // cutoffs — cutoff planning happens later in analytics/scheduling. Route cells = vehicle, route code, RT distance.
    const NCDEF = [
      ['vehicleType', 'Vehicle Type', 'select'], ['routeCode', 'Route Code', 'text'],
      ['rtDist', 'Round-Trip Distance (km)', 'text'],
    ];
    const ncFields = NCDEF.map(f => { const flagged = !!ncFlags[f[0]]; return {
      field: f[0], label: f[1], value: c[f[0]] || '',
      isSelect: f[2] === 'select', isTime: f[2] === 'time', isText: f[2] === 'text',
      options: f[2] === 'select' ? vehPool : [],
      flagged, notFlagged: !flagged,
      toggleBg: flagged ? '#C77B00' : '#fff', toggleFg: flagged ? '#fff' : '#5A5E66', toggleBd: flagged ? '#C77B00' : '#E6EBF2',
      toggleLabel: flagged ? 'Flagged' : 'Flag',
      onToggleFlag: () => this.toggleNcFlag(f[0]), onInput: (e) => this.setNc(f[0], e.target.value),
    }; });
    const ncFlaggedCount = NCDEF.filter(f => ncFlags[f[0]]).length;
    const ncIsBlocker = false; // Blocker removed; always Needs Change
    const tpN = Number(c.touchpoint), distN = Number(c.rtDist);
    const vt = c.vehicleType || '';
    // B1 — read the canonical Vehicle Master, don't hardcode against a deleted availability scale.
    const vehMatch = (d.VEH || []).find(v => v.name === vt) || (d.VEH || []).find(v => vt && v.name.indexOf(vt) >= 0);
    const vehDistMaster = (name) => { const v = (d.VEH || []).find(x => x.name === name); return v ? v.dist : 600; };
    const tpLimit = vehMatch ? vehMatch.tp : (vt.indexOf('ACE') >= 0 ? 4 : 7);
    const distLimit = vehMatch ? vehDistMaster(vehMatch.name) : 600;
    // Validate only cells the Ops Lead actually flagged (E2) — don't warn on prefilled, untouched originals.
    const ncWarn = [];
    if (ncFlags.touchpoint && Number.isInteger(tpN) && tpN > 7) ncWarn.push({ lead: 'Warning', text: 'High touch-point count (' + tpN + ') — routes above 7 touch points are harder to run on time; confirm this is intended.', fail: false, bg: '#FBF1DF', accentBd: '0', fg: '#C77B00', textFg: '#C77B00' });
    if (ncFlags.rtDist && distN > distLimit) ncWarn.push({ lead: 'Warning', text: 'Round-trip distance (' + distN + ' km) exceeds vehicle limit (' + distLimit + ' km)', fail: false, bg: '#FBF1DF', accentBd: '0', fg: '#C77B00', textFg: '#C77B00' });
    // B3 — validate the flagged vehicle type: TP cap + RLH feasibility (was silently un-checked, e.g. the 10ft case).
    if (ncFlags.vehicleType && vehMatch && Number.isInteger(tpN) && tpN > tpLimit) ncWarn.push({ lead: 'Error', text: vehMatch.name + ' allows max ' + tpLimit + ' touch points — this route has ' + tpN + '. Pick a larger vehicle or reduce touch points.', fail: true, bg: '#FAFBFD', accentBd: '3px solid #D14B4B', fg: '#D14B4B', textFg: '#5A5E66' });
    if (ncFlags.vehicleType && vehMatch && (vehMatch.feas || ['RLH']).indexOf('RLH') < 0) ncWarn.push({ lead: 'Error', text: vehMatch.name + ' is not RLH-feasible — choose a vehicle enabled for RLH.', fail: true, bg: '#FAFBFD', accentBd: '3px solid #D14B4B', fg: '#D14B4B', textFg: '#5A5E66' });
    // #6 — DC-in->1-route (failure): the flagged route code must not collide with another route in this plan.
    const ncPlan = st.ncRow ? d.plans.find(p => p.id === st.ncRow.planId) : null;
    const ncRowObj = (ncPlan && st.ncRow) ? ncPlan.rows[st.ncRow.idx] : null;
    const ncOtherCodes = (ncPlan && st.ncRow) ? ncPlan.rows.filter((r, i) => i !== st.ncRow.idx).map(r => r.routeCode) : [];
    // Per-DC (node) feedback list for the open route — each DC can be flagged for lat/long + touch-point-order changes.
    const ncDcMap = st.ncDcCells || {};
    const ncDcList = ncRowObj ? this.genDcRows(ncRowObj).map(dc => { const on = !!ncDcMap[dc.code]; const v = ncDcMap[dc.code] || {}; return {
      code: dc.code, name: dc.name, curLat: (dc.lat != null ? String(dc.lat) : '—'), curLng: (dc.lng != null ? String(dc.lng) : '—'), curTp: String(dc.tpOrder != null ? dc.tpOrder : ''),
      flagged: on, notFlagged: !on,
      latVal: v.lat || '', lngVal: v.lng || '', tpVal: v.tp || '',
      toggleBg: on ? '#C77B00' : '#fff', toggleFg: on ? '#fff' : '#5A5E66', toggleBd: on ? '#C77B00' : '#E6EBF2', toggleLabel: on ? 'Flagged' : 'Flag DC',
      onToggle: () => this.toggleNcDc(dc.code, {}), // start empty — current values shown as placeholders; only edited fields become changes
      onLat: (e) => this.setNcDc(dc.code, 'lat', e.target.value), onLng: (e) => this.setNcDc(dc.code, 'lng', e.target.value), onTp: (e) => this.setNcDc(dc.code, 'tp', e.target.value),
    }; }) : [];
    const ncDcFlaggedCount = Object.keys(ncDcMap).length;
    // A3 — on a within-plan collision, suggest the next free code (SC prefix + next unused number). Cross-plan reuse is legitimate (a re-run of the same SC reuses codes), so we only guard within the plan.
    const ncCodePrefix = (ncRowObj && ncRowObj.routeCode) ? String(ncRowObj.routeCode).replace(/\d+$/, '') : '';
    const ncUsedNums = ncOtherCodes.map(x => parseInt(String(x).replace(/^\D+/, ''), 10)).filter(n => !isNaN(n));
    const ncSuggestCode = ncCodePrefix ? (ncCodePrefix + String((ncUsedNums.length ? Math.max.apply(null, ncUsedNums) : 0) + 1).padStart(2, '0')) : '';
    if (ncFlags.routeCode && c.routeCode && ncOtherCodes.indexOf(c.routeCode) >= 0) ncWarn.push({ lead: 'Error', text: 'Route code “' + c.routeCode + '” is already used by another route — a DC can’t be served by two routes.' + (ncSuggestCode ? ' Try “' + ncSuggestCode + '”.' : ' Use a unique code.'), fail: true, bg: '#FAFBFD', accentBd: '3px solid #D14B4B', fg: '#D14B4B', textFg: '#5A5E66' });
    // #6 — TP-sequence (failure): the flagged touch-point count must be a whole number within the route's stop count.
    const ncDcCount = (ncRowObj && ncRowObj.dcs) ? ncRowObj.dcs.length : 0;
    // B2 — the max touch point is the route's stop count; fall back to the route's TP so the cap can never be skipped (empty dcs bug).
    const ncTpMax = ncDcCount || (ncRowObj ? (Number(ncRowObj.tp) || 0) : 0);
    if (ncFlags.touchpoint && c.touchpoint !== '' && c.touchpoint != null && (!Number.isInteger(tpN) || tpN < 1 || (ncTpMax && tpN > ncTpMax))) ncWarn.push({ lead: 'Error', text: 'Touch-point sequence invalid — enter a whole number between 1 and ' + (ncTpMax || tpN) + ' for this route.', fail: true, bg: '#FAFBFD', accentBd: '3px solid #D14B4B', fg: '#D14B4B', textFg: '#5A5E66' });
    const ncHasFail = ncWarn.some(w => w.fail);
    const ncRemarkFilled = !!(st.ncRemark || '').trim();  // §4 — remark is mandatory before an Ops-Lead can flag a change
    const ncRowCode = st.ncRow ? d.plans.find(p => p.id === st.ncRow.planId).rows[st.ncRow.idx].routeCode : '';

    // A3 — Ops Lead morning band: feedback-window countdown + health (SAME computed source as A1),
    // the queue line, and one next-action. No finalise / ack / input tiles — not the Ops Lead's job.
    const cdOps = this.cycleDates();
    const daysToClose = cdOps.daysToFeedbackClose;
    const opsHealthBand = daysToClose < 3 ? 'critical' : daysToClose < 7 ? 'atrisk' : 'ontrack';
    const OPSHEALTH = {
      critical: { label: 'Critical', bg: 'rgba(209,75,75,0.16)', fg: '#C0392B', dot: '#D14B4B' },
      atrisk:   { label: 'At risk',  bg: 'rgba(199,123,0,0.12)', fg: '#9A5E00', dot: '#C77B00' },
      ontrack:  { label: 'On track', bg: 'rgba(18,138,62,0.12)', fg: '#0E6B30', dot: '#128A3E' },
    };
    const opsHealth = OPSHEALTH[opsHealthBand];
    const toReviewN = allOpsPlans.filter(p => p.statusLabel === 'To Review').length;
    const ackN = allOpsPlans.filter(p => p.statusLabel === 'Acknowledged').length;
    const submittedN = allOpsPlans.filter(p => p.statusLabel === 'Submitted').length;
    const firstUnreviewed = allOpsPlans.find(p => p.statusLabel === 'To Review');
    const opsBand = {
      hasPlans: opsPlans.length > 0,
      countdownLabel: 'Feedback closes in ' + daysToClose + ' day' + (daysToClose === 1 ? '' : 's'),
      healthLabel: opsHealth.label, healthBg: opsHealth.bg, healthFg: opsHealth.fg, healthDot: opsHealth.dot,
      queueLine: toReviewN + ' to review · ' + submittedN + ' submitted · ' + ackN + ' acknowledged',
      hasNext: !!firstUnreviewed, noNext: !firstUnreviewed,
      nextLabel: firstUnreviewed ? ('Start with ' + firstUnreviewed.code + ' · ' + firstUnreviewed.name) : 'All plans reviewed — nice work',
      onNext: firstUnreviewed ? (() => this.setState({ opsPlanId: firstUnreviewed.id })) : (() => this.showToast('All plans already reviewed', '#128A3E')),
    };

    // E3 — friction on "Mark all Aligned": confirm before one click signs off a whole plan.
    const alignAllPlan = st.alignAllPlanId ? d.plans.find(p => p.id === st.alignAllPlanId) : null;
    const alignAllPending = alignAllPlan ? alignAllPlan.rows.filter((r, i) => { const dec = (st.opsRowDec[alignAllPlan.id] || {})[i] || 'Pending'; return dec !== 'Needs Change' && dec !== 'Aligned'; }).length : 0;

    // Plan-level Simulate impact (Ops Lead) — aggregates over all Needs Change rows for this plan.
    // Gates on ≥1 NC row (submitted or not). Reuses the same nudge math as the old per-NC-modal sim,
    // but scoped to the whole plan's metrics object + a count-weighted nudge.
    const opsPlan = plan; // the currently selected plan in the Ops Lead view
    const opsNcRows = opsPlan ? opsPlan.rows.filter(r => { const dec = (st.opsRowDec[opsPlan.id] || {})[opsPlan.rows.indexOf(r)]; return dec === 'Needs Change' || r.ops === 'Needs Change'; }) : [];
    const canOpsSim = opsNcRows.length > 0;
    let opsSimRows = [];
    if (canOpsSim && opsPlan) {
      const m = opsPlan.metrics;
      // Aggregate nudge: each flagged row contributes a fraction of the per-row nudge.
      const nFlagged = opsNcRows.length;
      const rowFraction = Math.min(1, nFlagged / Math.max(1, opsPlan.rows.length));
      // Nudge magnitudes scaled by how many rows have feedback (more feedback → larger deviation).
      const vehNudge  = rowFraction * 0.055;
      const distNudge = rowFraction * 0.038;
      const tpNudge   = rowFraction * 0.022;
      const pct2 = (v) => v.toFixed(1) + '%';
      const fmtDist2 = (v) => v.toLocaleString('en-IN') + ' km';
      const deltaColor2 = (dd) => dd < 0 ? '#128A3E' : dd > 0 ? '#D14B4B' : '#5A5E66';
      const deltaSign2 = (dd, decimals) => (dd === 0 ? '—' : (dd > 0 ? '+' : '') + (decimals !== undefined ? dd.toFixed(decimals) : dd));
      const pRoutes2   = Math.max(1, Math.round(m.routes   * (1 - tpNudge * 0.5 + vehNudge * 0.3)));
      const pVehicles2 = Math.max(1, Math.round(m.vehicles * (1 - vehNudge)));
      const pUtil2     = Math.min(99, +(m.util + vehNudge * 58 + distNudge * 29).toFixed(1));
      const pDistance2 = Math.max(1, Math.round(m.distance * (1 - distNudge * 0.5 + vehNudge * 0.04)));
      const pAvgTat2   = +(m.avgTat + vehNudge * 5.5 - tpNudge * 9).toFixed(1);
      const pCps2      = +(m.cps * (1 - distNudge * 0.4 + vehNudge * 0.15)).toFixed(2);
      const dRoutes2   = pRoutes2   - m.routes;
      const dVehicles2 = pVehicles2 - m.vehicles;
      const dUtil2     = +(pUtil2   - m.util).toFixed(1);
      const dDist2     = pDistance2 - m.distance;
      const dTat2      = +(pAvgTat2  - m.avgTat).toFixed(1);
      const dCps2      = +(pCps2     - m.cps).toFixed(2);
      opsSimRows = [
        { metric: 'Routes',         original: String(m.routes),            proposed: String(pRoutes2),             delta: deltaSign2(dRoutes2),               deltaColor: deltaColor2(dRoutes2)   },
        { metric: 'Vehicles',       original: String(m.vehicles),          proposed: String(pVehicles2),           delta: deltaSign2(dVehicles2),             deltaColor: deltaColor2(dVehicles2) },
        { metric: 'Utilisation %',  original: pct2(m.util),                proposed: pct2(pUtil2),                 delta: deltaSign2(dUtil2, 1) + '%',         deltaColor: deltaColor2(-dUtil2)    },
        { metric: 'Total Distance', original: fmtDist2(m.distance),        proposed: fmtDist2(pDistance2),         delta: deltaSign2(dDist2, 0).replace(/(\d)(?=(\d{3})+$)/g, '$1,') + ' km', deltaColor: deltaColor2(dDist2) },
        { metric: 'CPS (est.)',     original: '₹' + m.cps.toFixed(2), proposed: '₹' + pCps2.toFixed(2), delta: deltaSign2(dCps2, 2),                deltaColor: deltaColor2(dCps2)      },
      ];
    }
    // C — headwind callout for ops side: CPS delta as signed % for negotiation framing.
    let opsSimCpsHeadwind = 0, opsSimHeadwindPositive = false, opsSimHeadwindLabel = '', opsSimHeadwindColor = '#128A3E', opsSimHeadwindBg = '#E7F4EC', opsSimHeadwindBd = '#B6E0C6';
    if (canOpsSim && opsPlan) {
      const opsCpsOrig = opsPlan.metrics.cps;
      const opsPCps = +(opsCpsOrig * (1 - (Math.min(1, opsNcRows.length / Math.max(1, opsPlan.rows.length)) * 0.038) * 0.4 + (Math.min(1, opsNcRows.length / Math.max(1, opsPlan.rows.length)) * 0.055) * 0.15)).toFixed(2);
      const opsCpsDelta = +(opsPCps - opsCpsOrig).toFixed(2);
      opsSimCpsHeadwind = opsCpsOrig > 0 ? +(opsCpsDelta / opsCpsOrig * 100).toFixed(1) : 0;
      opsSimHeadwindPositive = opsSimCpsHeadwind > 0;
      opsSimHeadwindLabel = opsSimCpsHeadwind > 0
        ? 'These changes raise CPS by +' + opsSimCpsHeadwind + '% vs the published design — negotiate before accepting.'
        : opsSimCpsHeadwind < 0
          ? 'These changes improve CPS by ' + opsSimCpsHeadwind + '% vs the published design.'
          : 'No CPS impact from these changes vs the published design.';
      opsSimHeadwindColor = opsSimCpsHeadwind > 0 ? '#C77B00' : '#128A3E';
      opsSimHeadwindBg = opsSimCpsHeadwind > 0 ? '#FBF1DF' : '#E7F4EC';
      opsSimHeadwindBd = opsSimCpsHeadwind > 0 ? '#F0DBA8' : '#B6E0C6';
    }

    // Master-detail: rail visible whenever any plans are assigned; detail pane only when a plan is
    // selected (curId null on an empty filter → no detail main → no orphaned sticky action bar).
    const opsIsL1 = !noneAssigned;
    const opsIsL2 = !!curId;
    const opsFilterSeg = OPSFILTERS.map(f => ({ label: f, count: allOpsPlans.filter(p => p.status === f).length, active: opsFilter === f,
      bg: opsFilter === f ? '#003F98' : '#F2F5FA', fg: opsFilter === f ? '#fff' : '#5A5E66', weight: opsFilter === f ? '700' : '600',
      onClick: () => this.setState({ opsFilter: f, opsPage: 0, opsPlanId: null, opsDetailOpen: false }) }));
    // Pagination for L1 ops plan list (~12 per page).
    const OPS_PER_PAGE = 12;
    const opsPage = typeof st.opsPage === 'number' ? st.opsPage : 0;
    const opsTotalPages = Math.max(1, Math.ceil(allOpsPlans.length / OPS_PER_PAGE));
    const opsPageSafe = Math.min(opsPage, opsTotalPages - 1);
    const opsStart = opsPageSafe * OPS_PER_PAGE;
    const opsEnd = Math.min(opsStart + OPS_PER_PAGE, allOpsPlans.length);
    // opsPlans (already filtered) needs its own page slice
    const opsTotalPagesFiltered = Math.max(1, Math.ceil(opsPlans.length / OPS_PER_PAGE));
    const opsPageSafeFiltered = Math.min(opsPage, opsTotalPagesFiltered - 1);
    const opsStartFiltered = opsPageSafeFiltered * OPS_PER_PAGE;
    const opsEndFiltered = Math.min(opsStartFiltered + OPS_PER_PAGE, opsPlans.length);
    const opsPlansPage = opsPlans.slice(opsStartFiltered, opsEndFiltered);
    const opsShowPager = opsPlans.length > OPS_PER_PAGE;
    const opsShowingLabel = opsPlans.length === 0 ? 'No plans' : ('Showing ' + (opsStartFiltered + 1) + '–' + opsEndFiltered + ' of ' + opsPlans.length);
    const opsHasPrev = opsPageSafeFiltered > 0;
    const opsHasNext = opsPageSafeFiltered < opsTotalPagesFiltered - 1;

    return { opsPlans: opsPlans, opsFilterSeg, opsPlanCount: assigned.length, opsIsL1, opsIsL2,
      opsFilterLabel: opsFilter, opsClearFilter: () => this.setState({ opsFilter: 'To Review', opsPage: 0, opsPlanId: null }),
      opsPage: opsPageSafeFiltered, opsTotalPages: opsTotalPagesFiltered, opsShowPager,
      opsShowingLabel, opsHasPrev, opsHasNext,
      opsPrevPage: () => this.setState({ opsPage: Math.max(0, opsPageSafeFiltered - 1) }),
      opsNextPage: () => this.setState({ opsPage: Math.min(opsTotalPagesFiltered - 1, opsPageSafeFiltered + 1) }),
      opsBackToList: () => this.setState({ opsPlanId: null }),
      oSel: Object.assign(oSel, oSel.exists ? (() => {
      // Plan-level Simulate bindings for Ops Lead — 3-section rebuild
      const opsSC = opsPlan ? d.scs.find(s => s.code === opsPlan.scCode) : null;
      const opsSRows = opsPlan ? opsPlan.rows.map(rr => ({ id: rr.routeCode, veh: rr.veh, tpN: rr.dcs.length, rtDist: rr.rtDist })) : [];
      const opsFirstNcIdx = opsPlan ? opsPlan.rows.findIndex(r => { const dv = (st.opsRowDec[opsPlan.id] || {})[opsPlan.rows.indexOf(r)]; return dv === 'Needs Change' || r.ops === 'Needs Change'; }) : -1;
      const opsMmAlways = (opsSC && opsPlan) ? (this.buildMiniMap(opsSC, opsSRows, opsFirstNcIdx >= 0 ? opsFirstNcIdx : 0, 'Aggregate change across flagged routes') || {}) : {};
      const opsAllOrigArcs = opsMmAlways.origArcs || [];
      const opsAllPropArcs = opsMmAlways.propArcs || [];
      // Section 1: 3 plan-level cards
      const opsSimCards = (() => {
        if (!canOpsSim || !opsPlan) return [];
        const m2 = opsPlan.metrics;
        const nF = opsNcRows.length;
        const rf = Math.min(1, nF / Math.max(1, opsPlan.rows.length));
        const pV2 = Math.max(1, Math.round(m2.vehicles * (1 - rf * 0.055)));
        const pD2 = Math.max(1, Math.round(m2.distance * (1 - rf * 0.038 * 0.5 + rf * 0.055 * 0.04)));
        const pC2 = +(m2.cps * (1 - rf * 0.038 * 0.4 + rf * 0.055 * 0.15)).toFixed(2);
        const mkCard = (label, origRaw, propRaw, fmt) => {
          const changed = origRaw !== propRaw;
          return { label, origVal: fmt(origRaw), propVal: fmt(propRaw), cardBd: changed ? '2px solid #C77B00' : '1px solid #E6EBF2', suggestedLabel: changed ? 'Suggested change' : 'Suggested', suggestedLabelFg: changed ? '#C77B00' : '#8E96A3', propFg: changed ? '#C77B00' : '#5A5E66' };
        };
        return [
          mkCard('Total Vehicles', m2.vehicles, pV2, v => String(v)),
          mkCard('Total Distance (km)', m2.distance, pD2, v => v.toLocaleString('en-IN')),
          mkCard('Avg CPS (₹)', +m2.cps.toFixed(2), pC2, v => '₹' + v.toFixed(2)),
        ];
      })();
      // Section 2: route-level rows for ops
      const opsSimRouteRows = opsPlan ? opsPlan.rows.map((r, ri) => {
        const decVal = (st.opsRowDec[opsPlan.id] || {})[ri];
        const isChanged = decVal === 'Needs Change' || r.ops === 'Needs Change';
        const fbCells = r.fb ? r.fb.cells : {};
        const origVeh = r.veh;
        const propVeh = (fbCells.vehicleType && fbCells.vehicleType.to) ? String(fbCells.vehicleType.to) : origVeh;
        const vehChanged = propVeh !== origVeh;
        const origCpsVal = +Number(r.cps).toFixed(2);
        const nF = opsNcRows.length; const rfR = Math.min(1, nF / Math.max(1, opsPlan.rows.length));
        const propCpsVal = isChanged ? +(origCpsVal * (1 - rfR * 0.038 * 0.4 + rfR * 0.055 * 0.15)).toFixed(2) : origCpsVal;
        const cpsChanged = isChanged && Math.abs(propCpsVal - origCpsVal) >= 0.01;
        const note = r.fb ? (r.fb.remark || '—') : '—';
        const osVehRecord = (d.VEH || []).find(v => v.name === origVeh) || {};
        const osCapVal = osVehRecord.cap ? fmtInt(osVehRecord.cap) : '—';
        const osVolVal = r.volume != null ? fmtInt(r.volume) : '—';
        const osUtilVal = r.util != null ? Math.round(r.util * 100) + '%' : '—';
        return { routeCode: r.routeCode, origVeh, propVeh, vehChanged, vehUnchanged: !vehChanged, countDisp: String(r.dcs ? r.dcs.length : r.tp || 1), distDisp: r.rtDist + ' km', origCps: '₹' + origCpsVal.toFixed(2), propCps: '₹' + propCpsVal.toFixed(2), cpsChanged, cpsUnchanged: !cpsChanged, note, isChanged, isNoChange: !isChanged, rowBg: isChanged ? '#FFFBF2' : '#fff', vol: osVolVal, util: osUtilVal, cap: osCapVal };
      }) : [];
      // Section 3: filter state
      const opsSmOrigSearch = st.opsSmOrigSearch || '';
      const opsSmPropSearch = st.opsSmPropSearch || '';
      const opsSmOrigRoute = st.opsSmOrigRoute || 'All';
      const opsSmPropRoute = st.opsSmPropRoute || 'All';
      const opsSmRouteOptions = [{ value: 'All', label: 'All Routes' }].concat(opsPlan ? opsPlan.rows.map(r => ({ value: r.routeCode, label: r.routeCode })) : []);
      const filterArcsOps = (arcs, routeSel, searchQ, rows) => {
        if (routeSel === 'All' && !searchQ) return arcs;
        return arcs.filter((a, ai) => {
          const routeMatch = routeSel === 'All' || (a.routeCode ? a.routeCode === routeSel : (rows && rows[ai] && rows[ai].routeCode === routeSel));
          const searchMatch = !searchQ || (a.routeCode || '').toLowerCase().includes(searchQ.toLowerCase()) || (rows && rows[ai] && rows[ai].routeCode && rows[ai].routeCode.toLowerCase().includes(searchQ.toLowerCase()));
          return routeMatch && searchMatch;
        });
      };
      const opsSmOrigArcsF = filterArcsOps(opsAllOrigArcs, opsSmOrigRoute, opsSmOrigSearch, opsPlan ? opsPlan.rows : []);
      const opsSmPropArcsF = filterArcsOps(opsAllPropArcs, opsSmPropRoute, opsSmPropSearch, opsPlan ? opsPlan.rows : []);
      return {
      canOpsSim,
      opsSimBtnBg: '#EAEEFB',
      opsSimBtnFg: '#2F4FC6',
      opsSimBtnLabel: 'Simulate impact',
      onOpsSim: () => this.setState({ opsSimOpen: true }),
      closeOpsSim: () => this.setState({ opsSimOpen: false, opsSmOrigSearch: '', opsSmPropSearch: '', opsSmOrigRoute: 'All', opsSmPropRoute: 'All', opsSmOrigLegendOpen: false, opsSmPropLegendOpen: false }),
      opsSimPlanName: opsPlan ? (opsPlan.scCode + ' · ' + opsPlan.scName) : '',
      opsSimOpen: st.opsSimOpen,
      opsSimRows,
      opsSimCards,
      opsSimRouteRows,
      opsSimCpsHeadwind, opsSimHeadwindPositive, opsSimHeadwindLabel, opsSimHeadwindColor, opsSimHeadwindBg, opsSimHeadwindBd,
      opsSimSubtitle: opsNcRows.length + ' Needs Change row' + (opsNcRows.length === 1 ? '' : 's') + ' · indicative, not a re-solve',
      opsSimMapOpen: false,
      opsSmMW: opsMmAlways.MW || 280, opsSmMH: opsMmAlways.MH || 174, opsSmScX: opsMmAlways.scX || 140, opsSmScY: opsMmAlways.scY || 87,
      opsSmOrigArcs: opsAllOrigArcs, opsSmPropArcs: opsAllPropArcs,
      opsSmOrigArcsF, opsSmPropArcsF,
      opsSmOrigDcM: opsMmAlways.origDcMarkers || [], opsSmPropDcM: opsMmAlways.propDcMarkers || [],
      opsSmCapText: 'Aggregate change across ' + opsNcRows.length + ' flagged route' + (opsNcRows.length === 1 ? '' : 's'),
      opsSmOrigCount: opsPlan ? opsPlan.rows.length : 0,
      opsSmPropChangedCount: opsNcRows.length,
      opsSmOrigSearch, opsSmPropSearch,
      opsSmOrigRoute, opsSmPropRoute,
      opsSmRouteOptions,
      opsSmOrigVisCount: opsSmOrigArcsF.length,
      opsSmPropVisCount: opsSmPropArcsF.length,
      opsSmOrigLegendOpen: !!st.opsSmOrigLegendOpen,
      opsSmPropLegendOpen: !!st.opsSmPropLegendOpen,
      onOpsSmOrigSearch: (e) => this.setState({ opsSmOrigSearch: e.target.value }),
      onOpsSmPropSearch: (e) => this.setState({ opsSmPropSearch: e.target.value }),
      onOpsSmOrigRoute: (e) => this.setState({ opsSmOrigRoute: e.target.value }),
      onOpsSmPropRoute: (e) => this.setState({ opsSmPropRoute: e.target.value }),
      onOpsSmOrigLegend: () => this.setState({ opsSmOrigLegendOpen: !st.opsSmOrigLegendOpen }),
      onOpsSmPropLegend: () => this.setState({ opsSmPropLegendOpen: !st.opsSmPropLegendOpen }),
      }; })() : {}), opsBand,
      alignAllOpen: st.alignAllOpen, alignAllPlanName: alignAllPlan ? (alignAllPlan.scCode + ' · ' + alignAllPlan.scName) : '', alignAllCount: alignAllPending, confirmAlignAll: () => this.confirmAlignAll(), closeAlignAll: () => this.setState({ alignAllOpen: false }),
      ncOpen: st.ncOpen, ncFields, ncFlaggedCount, ncHasFlagged: ncFlaggedCount > 0, ncIsBlocker, ncTitle: 'Flag changes', ncIntro: 'Flag route-level cells, and open individual DCs to flag lat/long or touch-point changes — these go back to the planner.',
      ncDcList, ncDcFlaggedCount, ncDcHasList: ncDcList.length > 0,
      ncTotalFlagged: ncFlaggedCount + ncDcFlaggedCount,
      ncFlagSummary: (ncFlaggedCount + ncDcFlaggedCount) + ' change' + ((ncFlaggedCount + ncDcFlaggedCount) === 1 ? '' : 's') + ' flagged' + (ncDcFlaggedCount > 0 ? ' (' + ncDcFlaggedCount + ' DC-level)' : ''),
      ncRemark: st.ncRemark || '', onNcRemark: (e) => this.setState({ ncRemark: e.target.value }), ncWarn, hasNcWarn: ncWarn.length > 0, ncRowCode,
      // Warnings surface automatically (no Validate step required); hard-fails still block submit.
      ncShowWarn: ncWarn.length > 0,
      ncSubmit: () => { if (ncHasFail) { this.showToast('Fix the flagged errors before submitting', '#C77B00'); return; } if (!ncRemarkFilled) { this.showToast('Add a remark explaining the change before submitting', '#C77B00'); return; } this.submitNc(); }, ncClose: () => this.closeNc(),
      ncSubmitLabel: 'Flag this change',
      ncSubmitBg: (!ncHasFail && ncRemarkFilled) ? '#C77B00' : '#E6EBF2',
      ncSubmitFg: (!ncHasFail && ncRemarkFilled) ? '#fff' : '#5A5E66',
      ncSubmitCursor: (!ncHasFail && ncRemarkFilled) ? 'pointer' : 'not-allowed',
      ncSubmitHelper: ncHasFail ? 'Fix errors above to continue' : (!ncRemarkFilled ? 'Add a remark to explain the change' : ''),
      // Partial-submit confirm modal state
      opsPartialOpen: st.opsPartialOpen,
      opsPartialUndecided: (() => { const pp = st.opsPartialPlanId ? d.plans.find(p => p.id === st.opsPartialPlanId) : null; if (!pp) return 0; const dec = st.opsRowDec[pp.id] || {}; return pp.rows.filter((r, i) => !dec[i] || dec[i] === 'Pending').length; })(),
      opsPartialTotal: (() => { const pp = st.opsPartialPlanId ? d.plans.find(p => p.id === st.opsPartialPlanId) : null; return pp ? pp.rows.length : 0; })(),
      opsPartialPlanName: (() => { const pp = st.opsPartialPlanId ? d.plans.find(p => p.id === st.opsPartialPlanId) : null; return pp ? (pp.scCode + ' · ' + pp.scName) : ''; })(),
      confirmOpsPartial: () => { const id = st.opsPartialPlanId; this.setState({ opsPartialOpen: false, opsPartialPlanId: null }); if (id) this.submitOpsPlan(id); },
      closeOpsPartial: () => this.setState({ opsPartialOpen: false, opsPartialPlanId: null }),
      stopPropSim: (e) => e.stopPropagation() };
  }

  // Stage 3 — compact mini-map builder. Reuses the exact radial-spoke arc-path math from mapVals()
  // in a smaller viewBox. Returns two map objects: origMap (original plan) and propMap (proposed,
  // with one route highlighted to indicate the Ops-flagged change). HTML captions/legend are
  // rendered by the caller as positioned HTML over the SVG (not SVG <text> — known engine limit).
  buildMiniMap(sc, srcRows, highlightIdx, changeCaption) {
    if (!sc || !srcRows || srcRows.length === 0) return null;
    const PALETTE = ['#6E82C4','#6BA083','#C6A06A','#C88585','#7EA3C9','#9C8AC4','#C892AC','#72A39C','#C99E74','#96A6D6','#9BA1AE','#8FB185'];
    const MW = 280, MH = 174, mcx = MW / 2, mcy = MH / 2;
    // Seed deterministic RNG from SC code (same seed as mapVals so geometry matches).
    let seed = sc.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + 13;
    const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const scPt = { x: mcx, y: mcy };
    const N = Math.max(1, srcRows.length);
    const buildArcs = (perturb) => {
      // Reset seed before each pass so both maps get the same base geometry.
      seed = sc.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + 13;
      return srcRows.map((sr, r) => {
        const color = PALETTE[r % PALETTE.length];
        const tpN = Math.max(1, sr.tpN || 2);
        const theta = -Math.PI / 2 + (r + 0.5) / N * 6.283185;
        const maxRx = mcx - 28, maxRy = mcy - 20, perp = theta + 1.5708;
        // Proposed map: nudge the highlighted route's spokes outward by ~14px to show re-clustering.
        const radialScale = (perturb && r === highlightIdx) ? 1.18 : 1.0;
        const dcs = [];
        for (let k = 0; k < tpN; k++) {
          const t = 0.2 + (tpN === 1 ? 0.5 : k / (tpN - 1)) * 0.72;
          const wob = (R() - 0.5) * 5;
          const perpWob = (perturb && r === highlightIdx) ? (R() - 0.5) * 9 : wob;
          const x = +(mcx + Math.cos(theta) * maxRx * t * radialScale + Math.cos(perp) * perpWob).toFixed(1);
          const y = +(mcy + Math.sin(theta) * maxRy * t * radialScale + Math.sin(perp) * perpWob).toFixed(1);
          dcs.push({ x, y });
        }
        const pts = [scPt].concat(dcs);
        let arcD;
        if (pts.length < 3) {
          arcD = 'M' + pts[0].x + ',' + pts[0].y + ' L' + pts[1].x + ',' + pts[1].y;
        } else {
          arcD = 'M' + pts[0].x + ',' + pts[0].y;
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)], t2 = 0.38;
            arcD += ' C' + (p1.x + (p2.x - p0.x) * t2).toFixed(1) + ',' + (p1.y + (p2.y - p0.y) * t2).toFixed(1) + ' ' + (p2.x - (p3.x - p1.x) * t2).toFixed(1) + ',' + (p2.y - (p3.y - p1.y) * t2).toFixed(1) + ' ' + p2.x + ',' + p2.y;
          }
        }
        const isHL = perturb && r === highlightIdx;
        return { d: arcD, color, isHL, dcs };
      });
    };
    const origArcs  = buildArcs(false);
    const propArcs  = buildArcs(true);
    const toDcMarkers = (arcs) => { const m = []; arcs.forEach((a, r) => a.dcs.forEach(dc => m.push({ x: dc.x, y: dc.y, color: a.color }))); return m; };
    return { MW, MH, scX: mcx, scY: mcy, changeCaption: changeCaption || 'Re-clustered route',
      origArcs, origDcMarkers: toDcMarkers(origArcs),
      propArcs, propDcMarkers: toDcMarkers(propArcs) };
  }

  mapVals() {
    const st = this.state, d = st.data;
    const isMap = st.view === 'map';
    // toned-down (desaturated) route palette — softer than the vivid original per design feedback
    const PALETTE = ['#6E82C4', '#6BA083', '#C6A06A', '#C88585', '#7EA3C9', '#9C8AC4', '#C892AC', '#72A39C', '#C99E74', '#96A6D6', '#9BA1AE', '#8FB185'];
    const NAMEPOOL = ['North Hub', 'East Depot', 'South Yard', 'West Point', 'Central DC', 'Ring Road', 'Uptown', 'Riverside', 'Old Town', 'Midfield', 'Highland', 'Lakeside', 'Gateway', 'Junction', 'Parkside', 'Hilltop', 'Greenfield', 'Southgate', 'Northgate', 'Eastgate', 'Westgate', 'Cross Dock', 'Transit Pt', 'Outer Ring'];
    const zf = st.mapZone || 'All';
    const mapPlanId = st.mapPlanId || null;
    const selPlan = mapPlanId ? d.plans.find(p => p.id === mapPlanId) : null;
    const curCode = selPlan ? selPlan.scCode : ((st.mapSC && d.scs.find(s => s.code === st.mapSC)) ? st.mapSC : d.scs[0].code);
    const scList = d.scs.filter(s => zf === 'All' || s.zone === zf).map(s => ({ code: s.code, name: s.name, zone: s.zone, active: s.code === curCode, bg: (s.code === curCode) ? '#EAEEFB' : '#fff', bd: (s.code === curCode) ? '#003F98' : 'transparent', onClick: () => this.setState({ mapSC: s.code, mapPlanId: null }) }));
    const sc = d.scs.find(s => s.code === curCode);
    let seed = curCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7 + 13;
    const R = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const W = 760, H = 470, cx = W / 2, cy = H / 2, scale = 80;
    const proj = (lat, lng) => ({ x: +(cx + (lng - sc.lng) * scale).toFixed(1), y: +(cy - (lat - sc.lat) * scale).toFixed(1) });
    const scPt = proj(sc.lat, sc.lng);

    // F1 — derive the route SET from the selected SC's REAL data so Map, Design Review and
    // Ops-Lead Node Details agree for the same SC. Prefer the live plan rows; fall back to the
    // chosen-HW run's routes when no plan exists yet. Only the arc *geometry* is synthesised
    // (DCs carry no lat/lng), every load-bearing figure — route id, vehicle, TP, DC count,
    // RT distance — comes straight from the source rows.
    const srcPlan = selPlan || d.plans.find(p => p.scCode === curCode);
    // Prefer the run the planner opened the map from (mapRunId) so a HW-0/HW-1 run card draws ITS
    // geometry, not the HW-0.5 default. Fall back to the balanced run, then any run for this SC.
    const srcRun = (st.mapRunId && d.runs.find(r => r.id === st.mapRunId && r.scCode === curCode))
      || d.runs.find(r => r.scCode === curCode && r.hw === 0.5)
      || d.runs.find(r => r.scCode === curCode);
    // When the planner opened the map from a specific run card, that run's geometry wins over the
    // generic plan rows so each HW run draws distinctly; otherwise prefer live plan rows.
    const runChosen = !!(st.mapRunId && srcRun && srcRun.id === st.mapRunId);
    let srcRows;
    if (srcPlan && !runChosen) {
      srcRows = srcPlan.rows.map(r => ({ id: r.routeCode, veh: r.veh, tpN: r.dcs.length, rtDist: r.rtDist }));
    } else if (srcRun) {
      srcRows = Array.from({ length: srcRun.routes }, (_, i) => {
        const tpN = Math.max(2, Math.round(srcRun.avgTP));
        return { id: sc.cityCode + '-R' + String(i + 1).padStart(2, '0'), veh: (srcRun.vehByType && (srcRun.vehByType.find(v => v.n > 0) || {}).name) || 'Bolero / 8ft', tpN, rtDist: Math.round(srcRun.distance / srcRun.routes) };
      });
    } else if (srcPlan) {
      srcRows = srcPlan.rows.map(r => ({ id: r.routeCode, veh: r.veh, tpN: r.dcs.length, rtDist: r.rtDist }));
    } else { srcRows = []; }

    const routes = srcRows.map((sr, r) => {
      const color = PALETTE[r % PALETTE.length];
      const tpN = Math.max(1, sr.tpN);
      const N = Math.max(1, srcRows.length);
      // Organic spoke — seeded bearing jitter + per-route reach variation kill the symmetric clock-even spider.
      // Nodes scatter like a real city delivery network radiating unevenly along roads. Deterministic per SC via R().
      const baseTheta = -Math.PI / 2 + (r + 0.5) / N * 6.283185;
      const theta = baseTheta + (R() - 0.5) * 0.70;
      const reachFactor = 0.62 + R() * 0.38;
      const maxRx = (cx - 74) * reachFactor, maxRy = (cy - 56) * reachFactor, perp = theta + 1.5708;
      const dcs = [];
      for (let k = 0; k < tpN; k++) {
        const tBase = 0.2 + (tpN === 1 ? 0.5 : k / (tpN - 1)) * 0.72;
        const t = Math.max(0.18, Math.min(0.95, tBase + (R() - 0.5) * 0.10));
        const wob = (R() - 0.5) * 30;
        const x = +(cx + Math.cos(theta) * maxRx * t + Math.cos(perp) * wob).toFixed(1);
        const y = +(cy + Math.sin(theta) * maxRy * t + Math.sin(perp) * wob).toFixed(1);
        dcs.push({ code: 'LMDC-' + sc.cityCode + '-' + String(r * 6 + k + 1).padStart(3, '0'), name: NAMEPOOL[(r * 3 + k) % NAMEPOOL.length], x: x, y: y });
      }
      const pts = [scPt].concat(dcs);
      let arcD;
      if (pts.length < 3) {
        arcD = 'M' + pts[0].x + ',' + pts[0].y + ' L' + pts[1].x + ',' + pts[1].y;
      } else {
        arcD = 'M' + pts[0].x + ',' + pts[0].y;
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)], t = 0.38;
          arcD += ' C' + (p1.x + (p2.x - p0.x) * t).toFixed(1) + ',' + (p1.y + (p2.y - p0.y) * t).toFixed(1) + ' ' + (p2.x - (p3.x - p1.x) * t).toFixed(1) + ',' + (p2.y - (p3.y - p1.y) * t).toFixed(1) + ' ' + p2.x + ',' + p2.y;
        }
      }
      const midDc = dcs[Math.floor(dcs.length / 2)] || dcs[0] || scPt;
      const vehN = Math.max(1, Math.ceil(tpN / 2));
      return { id: sr.id, color, veh: sr.veh, tpN, dcs, d: arcD, midX: midDc.x, midY: midDc.y, vehN, rtDist: sr.rtDist };
    });
    const fRoute = st.mapRoute || 'All', fVeh = st.mapVeh || 'All', dcq = (st.mapSearch || '').toLowerCase();
    const searchActive = dcq.length > 0;
    let vis = routes.filter(rt => (fRoute === 'All' || rt.id === fRoute) && (fVeh === 'All' || rt.veh === fVeh));
    if (searchActive) vis = vis.filter(rt => rt.dcs.some(dc => dc.code.toLowerCase().indexOf(dcq) >= 0));
    const arcs = vis.map(rt => ({ d: rt.d, color: rt.color, midX: rt.midX, midY: rt.midY, midXPct: +(rt.midX / W * 100).toFixed(2), midYPct: +(rt.midY / H * 100).toFixed(2), label: vis.length <= 6 ? (rt.veh.split('/')[0].trim() + ' \xD7' + rt.vehN) : '' }));
    const arcLabels = arcs.filter(a => a.label);
    const dcMarkers = []; let _dcIdx = 0; vis.forEach(rt => rt.dcs.forEach(dc => { const _i = _dcIdx++; dcMarkers.push({ x: dc.x, y: dc.y, color: rt.color, op: (!searchActive || dc.code.toLowerCase().indexOf(dcq) >= 0) ? '1' : '0.2', dcode: dc.code, dname: dc.name, dzone: sc.zone, drouteId: rt.id, onClick: () => this.setState({ hovDcIdx: st.hovDcIdx === _i ? null : _i }) }); }));
    // node labels — name + code at each route's endpoint DC (like the reference); endpoints only, to stay legible
    const dcLabels = vis.map((rt, ri) => { const last = rt.dcs[rt.dcs.length - 1]; return last ? { xPct: +(last.x / W * 100).toFixed(2), yPct: +(last.y / H * 100).toFixed(2), name: NAMEPOOL[ri % NAMEPOOL.length], code: last.code } : null; }).filter(Boolean);
    const legend = vis.map(rt => ({ id: rt.id, color: rt.color }));
    // B7 — per-route vehicle count (digest L24 "vehicle counts, e.g. 19ft ×5"). One arc = one vehicle assignment;
    // a route with more touchpoints needs more vehicle trips, so derive count from the route's own TP count.
    const rows = vis.map(rt => { const vehN = Math.max(1, Math.ceil(rt.tpN / 2)); return { id: rt.id, color: rt.color, veh: rt.veh, vehN, tp: rt.tpN, dcs: rt.dcs.length, rtDist: rt.rtDist + ' km' }; });

    // Part B.1 — arrowheads at the DC (delivery) end of each arc
    const arrowHeads = vis.map(rt => {
      const dcs = rt.dcs;
      if (!dcs.length) return null;
      const tip = dcs[dcs.length - 1];
      const prev = dcs.length > 1 ? dcs[dcs.length - 2] : scPt;
      const dx = tip.x - prev.x, dy = tip.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len, px = -uy, py = ux;
      const arrowLen = 9, arrowHW = 5;
      const bx = tip.x + ux * 6, by = tip.y + uy * 6;
      const tx = bx + ux * arrowLen, ty = by + uy * arrowLen;
      const lx = bx + px * arrowHW, ly = by + py * arrowHW;
      const rx = bx - px * arrowHW, ry = by - py * arrowHW;
      return { d: 'M' + tx.toFixed(1) + ',' + ty.toFixed(1) + ' L' + lx.toFixed(1) + ',' + ly.toFixed(1) + ' L' + rx.toFixed(1) + ',' + ry.toFixed(1) + ' Z', color: rt.color };
    }).filter(Boolean);

    // Part B.3 — node info card on DC click
    const showNodeCard = st.hovDcIdx != null && st.hovDcIdx >= 0 && st.hovDcIdx < dcMarkers.length;
    let nodeCard = { name: '', code: '', type: '', zone: '', routeId: '', xPct: 50, yPct: 50 };
    if (showNodeCard) {
      const m = dcMarkers[st.hovDcIdx];
      if (m) nodeCard = { name: m.dname, code: m.dcode, type: 'LMDC', zone: m.dzone, routeId: m.drouteId, xPct: +(m.x / W * 100).toFixed(2), yPct: +(m.y / H * 100).toFixed(2) };
    }
    const clearHovDc = () => this.setState({ hovDcIdx: null });

    const routeOptions = ['All'].concat(routes.map(r => r.id));
    const vehSet = {}; routes.forEach(r => vehSet[r.veh] = 1); const vehOptions = ['All'].concat(Object.keys(vehSet));
    let af = 0; if (fRoute !== 'All') af++; if (fVeh !== 'All') af++; if (searchActive) af++; if (zf !== 'All') af++;
    const PS_CLR = { 'Pushed': ['#E7F4EC', '#128A3E'], 'In Alignment': ['#FBF1DF', '#C77B00'], 'Acknowledged': ['#EAEEFB', '#2F4FC6'], 'Finalised': ['#E7F4EC', '#128A3E'] };
    const mapPlanCards = d.plans.map(p => { const act = p.id === mapPlanId; const sc2 = d.scs.find(s => s.code === p.scCode); const cl = PS_CLR[p.status] || ['#F4F5F8', '#5A5E66']; return { id: p.id, runId: 'RUN-' + p.scCode + '-01', code: p.scCode, city: sc2 ? sc2.name : p.scName, routes: p.rows.length, status: p.status || 'Pushed', sBg: cl[0], sFg: cl[1], active: act, bg: act ? '#EAEEFB' : '#fff', bd: act ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ mapPlanId: p.id, mapSC: p.scCode, mapRunId: null, mapRoute: 'All', mapVeh: 'All' }) }; });
    const hasPlanSel = !!mapPlanId;
    const clearMapPlan = () => this.setState({ mapPlanId: null });
    const gen = st.mapDataSource === 'generated';

    return { isMap, mapScList: scList, mapSC: curCode, mapSCname: sc.name, mapSCzone: sc.zone,
      mapZoneChips: ['All', 'North', 'South', 'East', 'West', 'Central'].map(z => ({ label: z, active: z === zf, bg: z === zf ? '#003F98' : '#fff', fg: z === zf ? '#fff' : '#5A5E66', bd: z === zf ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ mapZone: z }) })),
      mapGen: gen, mapIngested: !gen, mapSrcGenBg: gen ? '#003F98' : '#fff', mapSrcGenFg: gen ? '#fff' : '#5A5E66', mapSrcIngBg: !gen ? '#003F98' : '#fff', mapSrcIngFg: !gen ? '#fff' : '#5A5E66', setMapGen: () => this.setState({ mapDataSource: 'generated' }), setMapIng: () => this.setState({ mapDataSource: 'ingested' }),
      mapW: W, mapH: H, scX: scPt.x, scY: scPt.y, arcs, arcLabels, dcMarkers, dcLabels, legend, mapRows: rows, rowsShown: rows.length, routeTotal: routes.length, mapNoResults: rows.length === 0, mapHasResults: rows.length > 0,
      routeOptions, vehOptions, mapRoute: fRoute, mapVeh: fVeh, mapSearch: st.mapSearch || '',
      onMapRoute: (e) => this.setState({ mapRoute: e.target.value }), onMapVeh: (e) => this.setState({ mapVeh: e.target.value }), onMapSearch: (e) => this.setState({ mapSearch: e.target.value }),
      activeFilters: af, hasActiveFilters: af > 0, clearMapFilters: () => this.setState({ mapRoute: 'All', mapVeh: 'All', mapSearch: '', mapZone: 'All' }), goCreate: () => this.go('creation'),
      mapPlanCards, hasPlanSel, clearMapPlan,
      // C8b — only the Planner can reach Design Creation. The Ops Lead gets a neutral message, not a dead "create" CTA.
      canCreate: st.persona === 'planner',
      isMapPerSC: true,
      // Part B — arrowheads + node info card
      arrowHeads, showNodeCard, nodeCard, clearHovDc };
  }

  // Finalise view — the terminal lifecycle stage. Finalised (and acknowledged/frozen) plans live HERE, not as a
  // tab inside Ops Alignment (which now holds only the active Pending/Feedback-Received work). Read-only, RFQ handoff.
  finaliseVals() {
    const st = this.state, d = st.data;
    const eff = (p) => st.alignStatus[p.id] || p.status;
    const finPlans = d.plans.filter(p => { const s = eff(p); return s === 'Finalised' || s === 'Acknowledged'; })
      .slice().sort((a, b) => (eff(a) === 'Finalised' ? 0 : 1) - (eff(b) === 'Finalised' ? 0 : 1));
    const rows = finPlans.map(p => { const s = eff(p); const isFin = s === 'Finalised'; return {
      id: p.id, code: p.scCode, name: p.scName, zone: p.zone,
      statusLabel: isFin ? 'Finalised' : 'Acknowledged · locked', statusBg: isFin ? '#E7F4EC' : '#E7F0F8', statusFg: isFin ? '#128A3E' : '#1E6FB8',
      finalisedDate: p.sentDate || '—', reviewers: (p.reviewerNames || []).join(', ') || '—',
      rfqLabel: isFin ? 'Ready for RFQ' : 'Awaiting freeze', rfqBg: isFin ? '#EAEEFB' : '#F2F5FA', rfqFg: isFin ? '#2F4FC6' : '#8E96A3', rfqReady: isFin,
      onHandoff: () => this.comingSoon('RFQ handoff for ' + p.scCode) }; });
    const finN = rows.filter(r => r.rfqReady).length;
    return { isFinalise: st.view === 'finalise', finalisePlans: rows, finaliseHasPlans: rows.length > 0, finaliseEmpty: rows.length === 0,
      finaliseCountLabel: rows.length + ' plan' + (rows.length === 1 ? '' : 's') + ' finalised · ' + finN + ' ready for RFQ handoff',
      goFinaliseCreate: () => this.go('creation') };
  }

  // Closed-cycle retrospective (read-only). Shown when a finalised/archived Design Cycle is selected
  // from the top-left cycle dropdown. July 2026 is the ACTIVE cycle → live panel, no summary.
  summaryVals() {
    const st = this.state;
    const cyc = st.designCycle || 'July 2026';
    const R = '₹';
    const CS = {
      'June 2026': {
        status: 'Finalised', handoffDate: '16 Jun 2026', window: '10 May – 16 Jun 2026',
        milestones: [ { label: 'Volume published', date: '10 May' }, { label: 'Designs created', date: '05 Jun' }, { label: 'Feedback window', date: '05–12 Jun' }, { label: 'Freeze · Acknowledge', date: '12 Jun' }, { label: 'Finalised · RFQ', date: '15 Jun' } ],
        rollup: [ { label: 'SCs planned', value: '78' }, { label: 'Plans finalised', value: '78' }, { label: 'Runs generated', value: '231' }, { label: 'Network CPS', value: R + '2.68' }, { label: 'Coverage', value: '99.2%' }, { label: 'Total distance', value: '6.42L km' }, { label: 'Vehicles', value: '3,142' }, { label: 'Est. cost / month', value: R + '18.4 Cr' } ],
        align: { flagged: 512, accepted: 468, rejected: 44, auto: 1890, avgDays: '3.2' },
        cpsNote: 'Network CPS landed 4.6% below the published baseline',
        zones: [ { zone: 'North', plans: 14, avgCps: R + '2.63', cov: '99%', routes: 612, veh: 641, dist: '1.18L km' }, { zone: 'South', plans: 22, avgCps: R + '2.71', cov: '99%', routes: 903, veh: 812, dist: '1.62L km' }, { zone: 'West', plans: 19, avgCps: R + '2.66', cov: '99%', routes: 788, veh: 704, dist: '1.44L km' }, { zone: 'East', plans: 11, avgCps: R + '2.74', cov: '98%', routes: 471, veh: 498, dist: '0.94L km' }, { zone: 'Central', plans: 12, avgCps: R + '2.69', cov: '99%', routes: 502, veh: 487, dist: '1.24L km' } ] },
      'May 2026': {
        status: 'Archived', handoffDate: '15 May 2026', window: '10 Apr – 15 May 2026',
        milestones: [ { label: 'Volume published', date: '08 Apr' }, { label: 'Designs created', date: '04 May' }, { label: 'Feedback window', date: '04–11 May' }, { label: 'Freeze · Acknowledge', date: '11 May' }, { label: 'Finalised · RFQ', date: '14 May' } ],
        rollup: [ { label: 'SCs planned', value: '74' }, { label: 'Plans finalised', value: '74' }, { label: 'Runs generated', value: '219' }, { label: 'Network CPS', value: R + '2.74' }, { label: 'Coverage', value: '98.8%' }, { label: 'Total distance', value: '6.18L km' }, { label: 'Vehicles', value: '2,981' }, { label: 'Est. cost / month', value: R + '17.9 Cr' } ],
        align: { flagged: 486, accepted: 421, rejected: 65, auto: 1774, avgDays: '3.8' },
        cpsNote: 'Network CPS landed 3.1% below the published baseline',
        zones: [ { zone: 'North', plans: 13, avgCps: R + '2.70', cov: '99%', routes: 588, veh: 612, dist: '1.14L km' }, { zone: 'South', plans: 21, avgCps: R + '2.77', cov: '98%', routes: 866, veh: 771, dist: '1.55L km' }, { zone: 'West', plans: 18, avgCps: R + '2.72', cov: '99%', routes: 742, veh: 668, dist: '1.38L km' }, { zone: 'East', plans: 10, avgCps: R + '2.81', cov: '98%', routes: 438, veh: 466, dist: '0.89L km' }, { zone: 'Central', plans: 12, avgCps: R + '2.75', cov: '98%', routes: 489, veh: 464, dist: '1.22L km' } ] } };
    const data = CS[cyc] || CS['June 2026'];
    const isArch = data.status === 'Archived';
    const a = data.align;
    const accRej = a.accepted + a.rejected;
    const accPct = accRej > 0 ? Math.round(a.accepted / accRej * 100) : 0;
    return {
      isCycleSummary: st.view === 'cyclesummary',
      csName: cyc, csWindow: data.window,
      csStatusLabel: data.status, csStatusBg: isArch ? '#F2F5FA' : '#E7F4EC', csStatusFg: isArch ? '#5A5E66' : '#128A3E',
      csHandoffLabel: 'Handed to RFQ · ' + data.handoffDate,
      csMilestones: data.milestones,
      csRollup: data.rollup,
      csFlagged: a.flagged, csAccepted: a.accepted, csRejected: a.rejected, csAuto: a.auto.toLocaleString('en-IN'), csAvgDays: a.avgDays + ' days',
      csAccPct: accPct + '% accepted', csRejPct: (100 - accPct) + '% rejected', csAccPctW: accPct + '%', csRejPctW: (100 - accPct) + '%',
      csCpsNote: data.cpsNote,
      csZones: data.zones.map(z => ({ zone: z.zone + ' Zone', plans: z.plans, avgCps: z.avgCps, cov: z.cov, routes: z.routes.toLocaleString('en-IN'), veh: z.veh.toLocaleString('en-IN'), dist: z.dist })),
      csTotalPlans: data.zones.reduce((s, z) => s + z.plans, 0),
      onBackActive: () => { this.setState({ designCycle: 'July 2026', view: 'inputs' }); this.showToast('Switched to July 2026 · active cycle', '#003F98'); },
      onExportSummary: () => this.comingSoon('Export cycle summary (PDF)'),
      csFinCount: st.data.plans.length,
      onDownloadAll: () => this.showToast('Downloading all ' + st.data.plans.length + ' finalised plans (CSV)…', '#1E6FB8'),
      csFinalPlans: st.data.plans.map(p => ({
        scCode: p.scCode,
        scName: p.scName,
        zone: p.zone,
        routes: p.metrics.routes,
        vehicles: p.metrics.vehicles,
        cps: '₹' + p.metrics.cps.toFixed(2),
        coverage: Math.round(p.metrics.coverage * 100) + '%',
        distance: p.metrics.distance.toLocaleString('en-IN') + ' km',
        finalDate: p.sentDate,
        pushedBy: p.pushedBy,
        reviewers: (p.reviewerNames || []).join(', '),
        rowCount: p.rows.length,
        statusBg: '#E7F4EC', statusFg: '#128A3E',
        onDownload: () => this.showToast('Downloading ' + p.scCode + ' plan (CSV)…', '#1E6FB8'),
      })) };
  }

  reviewVals() {
    const st = this.state, d = st.data;
    const fmtInt = (n) => n.toLocaleString('en-IN');
    const money = (n) => '\u20b9' + (n / 100000).toFixed(1) + 'L';
    const pct = (n) => Math.round(n * 100) + '%';
    const HWTAG = { 0: 'Re-optimise', 0.5: 'Balanced', 1: 'Preserve routes' };
    const hwLabelOf = (hw) => hw === 0 ? 'HW 0' : hw === 0.5 ? 'HW 0.5' : 'HW 1';
    // §9 R1 — organise by RUN, not HW. An SC is reviewable once it has ≥1 completed run;
    // the detail pane lists ALL of that SC's runs in the cycle as separate plan cards (HW is one
    // parameter shown per card). completedRunsFor returns the SC's completed runs in trigger order.
    const completedRunsFor = (code) => d.runs.filter(r => r.scCode === code && r.status === 'Completed').sort((a, b) => (a.runNo || 0) - (b.runNo || 0));
    const completedSCs = d.scs.filter(s => completedRunsFor(s.code).length >= 1);
    const q = (st.reviewSearch || '').toLowerCase();
    const zf = st.reviewZone || 'All';
    const listSCs = completedSCs.filter(s => (zf === 'All' || s.zone === zf) && (!q || s.code.toLowerCase().indexOf(q) >= 0 || s.name.toLowerCase().indexOf(q) >= 0 || completedRunsFor(s.code).some(r => r.runId.toLowerCase().indexOf(q) >= 0)));
    const curCode = (st.reviewSC && completedSCs.find(s => s.code === st.reviewSC)) ? st.reviewSC : (completedSCs[0] && completedSCs[0].code);
    const curSC = d.scs.find(s => s.code === curCode);

    // §9 R4 handlers — map icon opens that run's map (wires to the existing Map; uses the plan
    // if one exists, else just the SC); detail icon opens the full-screen plan-detail state for that run.
    // Open the run's route map as an in-context POPUP (does NOT navigate away to the Network Map page — that broke the review flow).
    // Sets mapSC/mapRunId so mapVals computes this run's per-SC geometry; the modal binds the same arcs/dcMarkers the map page uses.
    const openRunMap = (run) => { const pl = d.plans.find(p => p.scCode === run.scCode); this.setState({ runMapOpen: true, mapSC: run.scCode, mapRunId: run.id, mapPlanId: pl ? pl.id : null, mapRoute: 'All', mapVeh: 'All', mapSearch: '' }); };
    const openRunDetail = (run) => this.setState({ reviewDetailRunId: run.id });

    // Left rail = one entry per SC; dot = worst flag across ALL the SC's runs; the cps slot carries the run count.
    const reviewList = listSCs.map(s => {
      const rs = completedRunsFor(s.code);
      const pushed = !!st.pushedSCs[s.code];
      const allFlags = rs.reduce((a, r) => a.concat(r.flags || []), []);
      const hasErr = allFlags.some(f => f.sev === 'danger'), hasWarn = allFlags.some(f => f.sev === 'warning');
      const sevDot = hasErr ? '#D14B4B' : hasWarn ? '#C77B00' : '#128A3E';
      const sevTitle = hasErr ? 'A run has a validation error' : hasWarn ? 'A run has a validation warning' : 'No validation flags on any run';
      return { code: s.code, name: s.name, zone: s.zone, cps: rs.length + ' run' + (rs.length === 1 ? '' : 's'), active: s.code === curCode,
        bg: s.code === curCode ? '#EAEEFB' : '#fff', bd: s.code === curCode ? '#003F98' : 'transparent',
        sevDot, sevTitle,
        verdict: pushed ? 'Pushed' : 'Created', verdictBg: pushed ? '#E7F0F8' : '#E7F4EC', verdictFg: pushed ? '#1E6FB8' : '#128A3E',
        onClick: () => this.setState({ reviewSC: s.code }) };
    });

    // §9 R2 — one plan card per RUN: INPUTS (nodes, volume, vehicle types+count, HW) + OUTPUT
    // metrics (coverage, utilisation, CPS, routes, vehicles, distance). Vehicle type+count stays on the card.
    const scRuns = curSC ? completedRunsFor(curCode) : [];
    const planCards = scRuns.map((r) => {
      const flErr = (r.flags || []).filter(f => f.sev === 'danger').length;
      const flWarn = (r.flags || []).filter(f => f.sev === 'warning').length;
      const flagDot = flErr ? '#D14B4B' : flWarn ? '#C77B00' : '#128A3E';
      const flagLabel = flErr ? (flErr + flWarn) + ' validation flag' + ((flErr + flWarn) === 1 ? '' : 's') : flWarn ? flWarn + ' warning' + (flWarn === 1 ? '' : 's') : 'No flags';
      const flagBg = flErr ? '#FBEAEA' : flWarn ? '#FBF1DF' : '#E7F4EC';
      const flagFg = flErr ? '#D14B4B' : flWarn ? '#C77B00' : '#128A3E';
      const pushed = !!st.pushedSCs[r.scCode];
      // RDR — Route Disruption Rate: % of routes changed vs the historic plan; only meaningful when HW>0 (uses a historic plan).
      const rdrOn = r.hw > 0;
      const rdrPct = rdrOn ? (r.hw >= 1 ? 6 + ((r.runNo || 1) * 7) % 10 : 16 + ((r.runNo || 1) * 11) % 16) : 0;
      const rdrLabel = rdrOn ? rdrPct + '%' : '—';
      const rdrColor = !rdrOn ? '#8E96A3' : rdrPct > 25 ? '#D14B4B' : rdrPct > 12 ? '#C77B00' : '#128A3E';
      const rdrTooltip = rdrOn ? ('Route Disruption Rate — share of routes that changed vs the historic plan (HW ' + r.hw + ')') : 'Not applicable at HW 0 — no historic plan is used as reference';
      // CPS vs reference plan — the COST side of the HW trade-off (RDR is the stability side). Only at HW>0,
      // where a reference plan exists. Deterministic; biased positive since preserving routes usually costs a little.
      const cpsRefOn = r.hw > 0;
      const cpsDeltaPct = cpsRefOn ? (((r.runNo || 1) * 13 + Math.round(r.cps * 100)) % 13 - 4) : 0;
      const cpsDeltaLabel = !cpsRefOn ? '' : (cpsDeltaPct > 0 ? '▲ +' + cpsDeltaPct + '% vs ref' : cpsDeltaPct < 0 ? '▼ ' + cpsDeltaPct + '% vs ref' : '≈ in line w/ ref');
      const cpsDeltaColor = cpsDeltaPct > 0 ? '#C77B00' : cpsDeltaPct < 0 ? '#128A3E' : '#8E96A3';
      const cpsDeltaTooltip = cpsRefOn ? ('CPS vs the reference plan (June 2026 · finalised) — the cost impact of preserving routes at HW ' + r.hw) : '';
      // §P3.3 — coverage RED flag
      const coverageColor = r.coverage < 1 ? '#D14B4B' : '#14171F';
      const coverageGap = r.coverage < 1;
      const coverageGapText = coverageGap ? 'Coverage gap — ' + Math.round((1 - r.coverage) * r.dcCount) + ' nodes skipped' : '';
      // §P3.4 — route utilisation chip: replicate the detail-view RNG to count over/under-util routes
      let _us = r.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31 + 7;
      const _uRNG = () => { _us = (_us * 1103515245 + 12345) & 0x7fffffff; return _us / 0x7fffffff; };
      let _over = 0, _under = 0;
      for (let _i = 0; _i < r.routes; _i++) { const _u = Math.max(0.3, Math.min(0.98, r.util * (0.8 + _uRNG() * 0.4))); if (_u > 0.9) _over++; else if (_u < 0.4) _under++; }
      const hasUtilChip = (_over + _under) > 0;
      const utilChipLabel = hasUtilChip ? (_over > 0 && _under > 0 ? _over + ' over + ' + _under + ' under-util route' + ((_over + _under) > 1 ? 's' : '') : _over > 0 ? _over + ' route' + (_over > 1 ? 's' : '') + ' over-utilised (>90%)' : _under + ' route' + (_under > 1 ? 's' : '') + ' under-utilised (<40%)') : '';
      return { id: r.id, runId: r.runId, runNo: r.runNo, triggeredAt: r.triggeredAt, triggeredBy: r.triggeredBy || '',
        hwLabel: hwLabelOf(r.hw), hwTag: HWTAG[r.hw],
        pushed, pushedTag: pushed ? ((flErr + flWarn) > 0 ? 'Accepted with warnings' : 'In alignment') : '',
        pushedTagBg: (flErr + flWarn) > 0 ? '#FBF1DF' : '#E7F0F8', pushedTagFg: (flErr + flWarn) > 0 ? '#C77B00' : '#1E6FB8',
        nodes: fmtInt(r.dcCount), volume: fmtInt(r.volume), vehInput: (r.vehInput && r.vehInput.length ? r.vehInput.join(' · ') : '—'),
        coverage: pct(r.coverage), util: pct(r.util), cps: '₹' + r.cps.toFixed(2), routes: String(r.routes), vehicles: String(r.vehicles), distance: fmtInt(r.distance) + ' km',
        coverageColor, coverageGap, coverageGapText,
        utilColor: r.util > 0.9 ? '#D14B4B' : r.util < 0.4 ? '#C77B00' : '#14171F',
        hasUtilChip, utilChipLabel,
        rdrLabel, rdrColor, rdrTooltip,
        cpsRefOn, cpsDeltaLabel, cpsDeltaColor, cpsDeltaTooltip,
        flagDot, flagLabel, flagBg, flagFg,
        onDownloadCsv: () => { const rows = [['Run ID', r.runId], ['Sort Centre', r.scCode], ['Historical Weight', r.hw], ['Coverage', pct(r.coverage)], ['CPS', r.cps.toFixed(2)], ['Utilisation', pct(r.util)], ['Routes', r.routes], ['Vehicles', r.vehicles], ['Distance (km)', r.distance], ['Total cost', r.cost]]; this.downloadText(r.runId + '-summary.csv', 'Metric,Value\n' + rows.map(x => x.join(',')).join('\n')); this.showToast('Plan summary downloaded · ' + r.runId, '#128A3E'); },
        onMap: () => openRunMap(r), onDetail: () => openRunDetail(r), onPush: () => this.openPush(r.scCode, r.id), onFinaliseDirect: () => this.openFinDirect(r.scCode, r.id) };
    });

    // §9 R4 — full-screen plan detail opened by the detail icon. Backed by reviewDetailRunId; shows
    // the run's full metric set + a deterministic per-route breakdown (same synthesis the Map uses).
    const rdv = st.reviewDetailView || 'route';
    const rdt = st.reviewDetailTab || 'details';
    const detailRun = st.reviewDetailRunId ? d.runs.find(r => r.id === st.reviewDetailRunId) : null;
    let reviewDetail = { open: false, metrics: [], vehArr: [], flags: [], routeRows: [], isRouteView: true, isDcView: false, dcRows: [], hasDcRows: false, sections: [], secDetails: true, secRoute: false };
    if (detailRun) {
      const dSC = d.scs.find(s => s.code === detailRun.scCode) || curSC;
      // §P3.5 — CPS delta vs reference for the detail pane (mirrors the plan-card delta logic)
      const detailCpsRefOn = detailRun.hw > 0;
      const detailCpsDeltaPct = detailCpsRefOn ? (((detailRun.runNo || 1) * 13 + Math.round(detailRun.cps * 100)) % 13 - 4) : 0;
      const detailCpsDeltaLabel = !detailCpsRefOn ? '' : (detailCpsDeltaPct > 0 ? '▲ +' + detailCpsDeltaPct + '% vs ref' : detailCpsDeltaPct < 0 ? '▼ ' + detailCpsDeltaPct + '% vs ref' : '≈ in line w/ ref');
      const detailCpsDeltaColor = detailCpsDeltaPct > 0 ? '#C77B00' : detailCpsDeltaPct < 0 ? '#128A3E' : '#8E96A3';
      const dMetrics = [
        { label: 'Coverage', value: pct(detailRun.coverage), sub: 'DCs served', hasDelta: false, valueColor: detailRun.coverage < 1 ? '#D14B4B' : '#14171F' },
        { label: 'CPS', value: '₹' + detailRun.cps.toFixed(2), sub: 'cost / shipment', hasDelta: detailCpsRefOn, delta: detailCpsDeltaLabel, deltaColor: detailCpsDeltaColor, valueColor: '#14171F' },
        { label: 'Utilisation', value: pct(detailRun.util), sub: 'avg lane', hasDelta: false, valueColor: '#14171F' },
        { label: 'Routes', value: String(detailRun.routes), sub: 'total', hasDelta: false, valueColor: '#14171F' },
        { label: 'Vehicles', value: String(detailRun.vehicles), sub: 'total deployed', hasDelta: false, valueColor: '#14171F' },
        { label: 'Distance', value: fmtInt(detailRun.distance), sub: 'km total', hasDelta: false, valueColor: '#14171F' },
        { label: 'Total cost', value: money(detailRun.cost), sub: 'RLH / cycle', hasDelta: false, valueColor: '#14171F' },
        { label: 'Avg TAT', value: detailRun.avgTat + 'h', sub: 'avg route duration', hasDelta: false, valueColor: '#14171F' },
      ];
      const dVbt = (detailRun.vehByType || []);
      const dVbtTotal = dVbt.reduce((a, v) => a + v.n, 0) || 1;
      const dVehArr = dVbt.map(v => ({ veh: v.name, n: v.n, pctW: Math.round(v.n / dVbtTotal * 100) + '%' }));
      const dFlags = (detailRun.flags || []).map(f => ({ t: f.t, sevLabel: f.sev === 'danger' ? 'Error' : 'Warning', sevFg: f.sev === 'danger' ? '#D14B4B' : '#C77B00', sevBg: f.sev === 'danger' ? '#FBEAEA' : '#FBF1DF' }));
      let rs = (detailRun.id).split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) * 7 + 3;
      const RR = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
      const cc = (dSC && dSC.cityCode) || detailRun.scCode.slice(0, 3);
      const vpick = dVbt.filter(v => v.n > 0);
      const VFREQ = ['Daily', 'Daily', 'Alt-day', '6×/wk'];
      const dRouteRows = [];
      const baseLat = (dSC && dSC.lat) || 20.59, baseLng = (dSC && dSC.lng) || 78.96;
      const dVEH = d.VEH || [];
      for (let i = 0; i < detailRun.routes; i++) {
        const vt = vpick.length ? vpick[i % vpick.length] : { name: 'Bolero / 8ft' };
        const vehTp = vt.name.indexOf('ACE') >= 0 ? 4 : 7;
        const tp = Math.max(2, Math.min(vehTp + (RR() < 0.14 ? 1 : 0), Math.round(detailRun.avgTP + (RR() - 0.5))));
        const dist = Math.round(detailRun.distance / detailRun.routes * (0.7 + RR() * 0.6));
        const util = +Math.max(0.3, Math.min(0.98, detailRun.util * (0.8 + RR() * 0.4))).toFixed(2);
        const over = util > 0.9, under = util < 0.4;
        const rowVol = Math.round(detailRun.volume / detailRun.routes * (0.6 + RR() * 0.8));
        const vehRecord = dVEH.find(v => v.name === vt.name) || {};
        const capVal = vehRecord.cap || null;
        const utilFlagLabel = over ? 'Over-util' : under ? 'Under-util' : '';
        const hasUtilFlag = over || under;
        dRouteRows.push({ lmdc: cc + '-' + (220 + i * 7), segment: cc + '-R' + String(i + 1).padStart(2, '0'), veh: vt.name.split(/[\/·]/)[0].trim(), count: 1, freq: VFREQ[i % VFREQ.length],
          dist: fmtInt(dist), tat: +(detailRun.avgTat * (0.7 + RR() * 0.4)).toFixed(1) + 'h', cps: '₹' + (detailRun.cps * (0.9 + RR() * 0.2)).toFixed(2), tps: tp,
          util: Math.round(util * 100) + '%', utilColor: over ? '#D14B4B' : under ? '#C77B00' : '#14171F',
          hasUtilFlag, utilFlagLabel,
          vol: fmtInt(rowVol), cap: capVal ? fmtInt(capVal) : '—',
          latLng: (baseLat + (RR() - 0.5) * 0.5).toFixed(4) + ', ' + (baseLng + (RR() - 0.5) * 0.5).toFixed(4) });
      }
      // §P3.2 — DC × Route detail view: one row per LMDC, seeded from route data
      const dcRows = [];
      const DCOUT_V = ['22:30','23:00','23:30','00:15','01:00'];
      const DCIN_V  = ['06:00','07:00','07:30','08:00','09:00'];
      const DCZN_V  = ['Local','Non-Local'];
      for (let _di = 0; _di < dRouteRows.length && dcRows.length < 20; _di++) {
        const _drt = dRouteRows[_di];
        const _ndc = Math.max(2, Math.min(4, _drt.tps));
        for (let _dj = 0; _dj < _ndc && dcRows.length < 20; _dj++) {
          dcRows.push({
            lmdc: cc + '-DC-' + String(201 + _di * 5 + _dj),
            designVol: fmtInt(Math.max(40, Math.round((detailRun.volume / (dRouteRows.length * _ndc)) * (0.6 + RR() * 0.8)))),
            routeCode: _drt.segment,
            tp: _drt.tps,
            zone: DCZN_V[Math.round(RR()) % 2],
            outCutoff: DCOUT_V[Math.floor(RR() * DCOUT_V.length)],
            tat: _drt.tat,
            inCutoff: DCIN_V[Math.floor(RR() * DCIN_V.length)],
            vehType: _drt.veh,
            rtDist: _drt.dist,
            // Groups this route's rows into one visually-boxed block (outside border around
            // the whole route, like the source plan sheet does) rather than a plain flat list.
            isFirstInGroup: _dj === 0,
            isLastInGroup: _dj === _ndc - 1,
          });
        }
      }
      if (dcRows.length) dcRows[dcRows.length - 1].isLastInGroup = true;
      reviewDetail = { open: true, runId: detailRun.runId, hwLabel: hwLabelOf(detailRun.hw), hwTag: HWTAG[detailRun.hw], triggeredAt: detailRun.triggeredAt, triggeredBy: detailRun.triggeredBy || '',
        code: detailRun.scCode, name: detailRun.scName, zone: dSC ? dSC.zone : detailRun.zone, dcCount: detailRun.dcCount,
        nodes: fmtInt(detailRun.dcCount), volume: fmtInt(detailRun.volume), vehInput: (detailRun.vehInput && detailRun.vehInput.length ? detailRun.vehInput.join(' · ') : '—'),
        metrics: dMetrics, vehArr: dVehArr, hasVeh: dVehArr.length > 0, vehTotal: detailRun.vehicles,
        flags: dFlags, hasFlags: dFlags.length > 0, noFlags: dFlags.length === 0,
        routeRows: dRouteRows,
        isRouteView: rdv === 'route', isDcView: rdv === 'dc',
        routeViewBg: rdv === 'route' ? '#003F98' : '#F2F5FA', routeViewFg: rdv === 'route' ? '#fff' : '#5A5E66',
        dcViewBg: rdv === 'dc' ? '#003F98' : '#F2F5FA', dcViewFg: rdv === 'dc' ? '#fff' : '#5A5E66',
        onRouteView: () => this.setState({ reviewDetailView: 'route' }),
        onDcView: () => this.setState({ reviewDetailView: 'dc' }),
        dcRows, hasDcRows: dcRows.length > 0,
        onDownloadCsv: () => { const head = 'Route,First LMDC,Vehicle,Frequency,Distance (km),CPS,Touch Points,Utilisation\n'; const body = dRouteRows.map(r => [r.segment, r.lmdc, r.veh, r.freq, r.dist, String(r.cps || '').replace('₹', ''), r.tps, r.util].join(',')).join('\n'); this.downloadText(detailRun.runId + '-routes.csv', head + body); this.showToast('Route breakdown downloaded · ' + dRouteRows.length + ' routes', '#128A3E'); },
        onMap: () => openRunMap(detailRun), close: () => this.setState({ reviewDetailRunId: null }),
        sections: [['details', 'Plan Detail'], ['route', 'Route View']].map(t => ({ label: t[1], active: rdt === t[0], color: rdt === t[0] ? '#003F98' : '#5A5E66', weight: rdt === t[0] ? '700' : '600', onClick: () => this.setState({ reviewDetailTab: t[0] }) })),
        secDetails: rdt === 'details', secRoute: rdt === 'route' };
    }

    const pushSC = st.pushSCcode ? d.scs.find(s => s.code === st.pushSCcode) : curSC;
    const uniqPocs = pushSC ? [...new Set(pushSC.pocs)] : [];
    const pushSelected = st.pushReviewers || [];
    const pocChips = uniqPocs.map(n => ({ name: n, selected: pushSelected.indexOf(n) >= 0, bg: pushSelected.indexOf(n) >= 0 ? '#003F98' : '#fff', fg: pushSelected.indexOf(n) >= 0 ? '#fff' : '#5A5E66', bd: pushSelected.indexOf(n) >= 0 ? '#003F98' : '#C3C9D4', onToggle: () => this.togglePushReviewer(n) }));
    const reviewersList = pushSelected.map(n => ({ name: n, initials: n.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(), email: n.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') + '@valmo.com', isPoc: uniqPocs.indexOf(n) >= 0, onRemove: () => this.removeReviewer(n) }));

    // P2 — Design Review left rail: surface Queued + In-Progress runs from the live runQueue
    // so the reviewer can see what is still cooking alongside the completed set.
    // Non-completed items are non-clickable status rows (matching CC + Step-3 pill colors).
    const rq = st.runQueue || [];
    const rqProgN   = rq.filter(r => r.status === 'In Progress').length;
    const rqDoneN   = rq.filter(r => r.status === 'Completed').length;
    const rqHasQueue = rq.length > 0;
    const rqNoQueue = !rqHasQueue;
    const rqShowProg   = rqProgN > 0;

    return {
      isReview: st.view === 'review',
      hasCurSC: !!curSC, noCurSC: !curSC, reviewListEmpty: reviewList.length === 0, hasReviewList: reviewList.length > 0,
      reviewClearSearch: () => this.setState({ reviewSearch: '', reviewZone: 'All' }),
      reviewList, reviewSearch: st.reviewSearch || '', onReviewSearch: (e) => this.setState({ reviewSearch: e.target.value }),
      reviewZoneChips: ['All', 'North', 'South', 'East', 'West', 'Central'].map(z => ({ label: z, active: z === zf, bg: z === zf ? '#003F98' : '#fff', fg: z === zf ? '#fff' : '#5A5E66', bd: z === zf ? '#003F98' : '#E6EBF2', onClick: () => this.setState({ reviewZone: z }) })),
      reviewShown: listSCs.length, reviewTotal: completedSCs.length,
      rqProgN, rqDoneN, rqHasQueue, rqNoQueue, rqShowProg,
      curCode, curName: curSC ? curSC.name : '', curZone: curSC ? curSC.zone : '', curDcCount: curSC ? curSC.dcCount : 0,
      planCards, runCountLabel: scRuns.length + ' run' + (scRuns.length === 1 ? '' : 's') + ' generated this cycle', hasPlanCards: planCards.length > 0,
      reviewDetail,
      reviewIngestedPlans: (st.ingestedPlans || []).map(p => ({ name: p.name, rows: p.rows.toLocaleString('en-IN'), by: p.by, date: p.date, runId: p.runId, scCode: p.scCode })),
      hasReviewIngested: (st.ingestedPlans || []).length > 0,
      reviewPushed: !!st.pushedSCs[curCode],
      pushOpen: st.pushOpen, pushSCname: pushSC ? (pushSC.code + ' \u00b7 ' + pushSC.name) : '', pocChips, reviewersList, pushName: st.pushName || '', pushEmail: st.pushEmail || '',
      onPushName: (e) => this.setState({ pushName: e.target.value }), onPushEmail: (e) => this.setState({ pushEmail: e.target.value }),
      addManualReviewer: () => this.addManualReviewer(), doPush: () => this.doPush(), closePush: () => this.closePush(),
      pushCount: pushSelected.length, pushDisabled: pushSelected.length === 0, pushBtnBg: pushSelected.length === 0 ? '#E6EBF2' : '#003F98', pushBtnFg: pushSelected.length === 0 ? '#5A5E66' : '#fff', pushCursor: pushSelected.length === 0 ? 'not-allowed' : 'pointer',
    };
  }

  renderVals() {
    const st = this.state, d = st.data;
    const planner = st.persona === 'planner';

    const fmtInt = (n) => n.toLocaleString('en-IN');
    const fmtL = (n) => (n / 100000).toFixed(1) + 'L';

    const ICON = {
      dash: 'M4 4h6v6H4z M14 4h6v4h-6z M14 12h6v8h-6z M4 14h6v6H4z',
      inputs: 'M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4M12 3v10M8 9l4 4 4-4',
      create: 'M12 3l1.7 4.1L18 9l-4.3 1.9L12 15l-1.7-4.1L6 9l4.3-1.9L12 3zM18.5 14l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z',
      review: 'M5 20V11M12 20V4M19 20v-6M3.5 20h17',
      align: 'M3 12.5l3.3 3.3L12.5 9M11 16l1.4 1.4L21 9',
      map: 'M12 21s-6.5-5.9-6.5-11a6.5 6.5 0 1113 0c0 5.1-6.5 11-6.5 11zM12 9.2a2 2 0 100 .01',
      push: 'M5 12h14M13 6l6 6-6 6',
      warn: 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
      runs: 'M5 4v16M5 5h11l-2 3 2 3H5M19 11v9',
      lock: 'M7 11V8a5 5 0 0110 0v3M5.5 11h13v9.5h-13z',
      flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    };

    // counts — use live status (alignStatus overrides) + live row decisions so the
    // Command Center reflects Acknowledge/Finalise/Push actions taken this session.
    const eff = (p) => st.alignStatus[p.id] || p.status;
    const liveDecided = (p) => p.rows.every((r, i) => (st.alignDecisions[p.id] && st.alignDecisions[p.id][i]) || r.planner);
    const completed = d.runs.filter(r => r.status === 'Completed').length;
    const inProgress = d.runs.filter(r => r.status === 'In-Progress').length;
    const plannedRuns = d.runs.filter(r => r.status === 'Planned').length;
    const awaitingFeedback = d.plans.filter(p => eff(p) === 'Pushed').length;
    const needsDecision = d.plans.filter(p => eff(p) === 'In Alignment').length;
    const readyAck = d.plans.filter(p => eff(p) === 'In Alignment' && liveDecided(p)).length;
    const readyFinalise = d.plans.filter(p => eff(p) === 'Acknowledged').length;
    const finalised = d.plans.filter(p => eff(p) === 'Finalised').length;
    const inputChecks = d.autodml.filter(c => !st.resolved[c.key]).length;
    // Plans where runs have completed but planner hasn't yet reviewed metrics or pushed to Ops.
    const readyReview = d.plans.filter(p => eff(p) === 'Created').length;

    // A1 — ONE computed cycle-date source. Freeze (Acknowledge) = Jul 12 2026; designs due Jul 5; finalise Jul 15.
    const cd = this.cycleDates();
    const designsDone = completed >= d.runs.length;            // all runs completed → designs ready
    const daysToFreeze = cd.daysToFreeze;
    const healthBand = (daysToFreeze < 3 || (!designsDone && daysToFreeze < 5)) ? 'critical'
      : (daysToFreeze < 7 ? 'atrisk' : 'ontrack');
    const HEALTH = {
      critical: { label: 'Critical', bg: 'rgba(209,75,75,0.18)', fg: '#FF8A8A', dot: '#FF6B6B', miniBg: 'rgba(209,75,75,0.12)', miniFg: '#C0392B' },
      atrisk:   { label: 'At risk',  bg: 'rgba(245,176,65,0.16)', fg: '#F5B041', dot: '#F5B041', miniBg: 'rgba(199,123,0,0.12)', miniFg: '#9A5E00' },
      ontrack:  { label: 'On track', bg: 'rgba(46,212,122,0.16)', fg: '#6FE0A0', dot: '#2ED47A', miniBg: 'rgba(18,138,62,0.12)', miniFg: '#0E6B30' },
    };
    const health = HEALTH[healthBand];

    // nav
    // Colorful emoji nav glyphs (self-contained, render in color) — replace the monochrome line SVGs.
    const NAVEMOJI = { command: '🏠', inputs: '📥', creation: '🛠️', review: '📊', align: '📋', map: '🗺️', cyclesummary: '📋' };
    const isPastCycle = (st.designCycle || 'July 2026') !== 'July 2026';
    const plannerNav = [
      // Command Center hidden for now (product decision -- "retrieve it later"). The HOME
      // group and its nav item are intentionally commented out rather than deleted, so it's a
      // one-line restore: uncomment the line below and it's back in the sidebar.
      // { label: 'HOME', items: [{ key: 'command', label: 'Command Center', icon: ICON.dash }] },
      { label: 'PLAN', items: [{ key: 'inputs', label: 'Design Inputs', icon: ICON.inputs, badge: inputChecks ? String(inputChecks) : '', tone: 'warn' }, { key: 'creation', label: 'Design Creation', icon: ICON.create }] },
      { label: 'REVIEW & ALIGN', items: [{ key: 'review', label: 'Design Review', icon: ICON.review }, { key: 'align', label: 'Ops Alignment', icon: ICON.align, badge: needsDecision ? String(needsDecision) : '', tone: 'accent' }, { key: 'map', label: 'Network Map', icon: ICON.map, badge: 'NEW', tone: 'new' }] },
    ];
    const opsNav = [
      { label: 'MY REVIEWS', items: [{ key: 'align', label: 'Ops Alignment', icon: ICON.align, badge: awaitingFeedback ? String(awaitingFeedback) : '', tone: 'accent' }, { key: 'map', label: 'Network Map', icon: ICON.map }] },
    ];
    const pastNav = [
      { label: 'VIEW', items: [{ key: 'cyclesummary', label: 'Finalised Plans' }, { key: 'map', label: 'Network Map' }] },
    ];
    const TBG = { warn: '#C77B00', accent: '#2F4FC6', new: '#128A3E' };
    const navGroups = (isPastCycle ? pastNav : (planner ? plannerNav : opsNav)).map(g => ({
      label: g.label,
      items: g.items.map(it => {
        const active = it.key === st.view;
        return { label: it.label, emoji: NAVEMOJI[it.key] || '•', onClick: () => this.go(it.key), active,
          bg: active ? 'rgba(255,255,255,0.09)' : 'transparent', color: active ? '#FFFFFF' : '#9AA3BD', weight: active ? '600' : '400',
          hasBadge: !!it.badge, badge: it.badge || '', badgeBg: TBG[it.tone] || '#2F4FC6', badgeFg: '#fff' };
      }),
    }));

    const TITLES = {
      command: ['Command Center', 'July 2026 design cycle · ' + (planner ? 'Central Network Planner' : 'Ops Lead')],
      inputs: ['Design Inputs', 'Volume files · masters · AutoDML gate · node changes'],
      creation: ['Design Creation', 'RLH route planning · plan & centres → vehicles → trigger'],
      review: ['Design Review', 'Run metrics, validation flags & historical-weight comparison'],
      align: ['Ops Alignment', planner ? 'Planner ↔ Ops row-by-row review & freeze loop' : 'Review your assigned plans row-by-row'],
      map: ['Network Map', 'Route arcs · LMSC origins → LMDC deliveries'],
      finalise: ['Finalise', 'Frozen, finalised plans — ready for RFQ handoff'],
      cyclesummary: ['Finalised Plans', (st.designCycle || 'June 2026') + ' · closed cycle — read-only'],
    };
    const tt = TITLES[st.view] || TITLES.command;

    const STUBICON = { creation: ICON.create, review: ICON.review, align: ICON.align, map: ICON.map, inputs: ICON.inputs };

    // A1 — designs progress + freeze countdown computed from live state, not literals.
    const designsCreated = d.plans.length;             // SCs that have a created design/plan
    const milestones = [
      { date: 'Jun 10', label: 'Volume published', stateLabel: 'Completed', kind: 'done' },
      { date: 'Jul 5', label: 'Designs created', stateLabel: 'In progress · ' + designsCreated + '/80', kind: 'current' },
      { date: 'Jul 5–12', label: 'Feedback window', stateLabel: 'Opens Jul 5', kind: 'future' },
      { date: 'Jul 12', label: 'Freeze · Acknowledge', stateLabel: daysToFreeze + ' days left', kind: 'next' },
      { date: 'Jul 15', label: 'Finalise', stateLabel: 'Handoff to RFQ', kind: 'future' },
    ].map((m, i, arr) => {
      const last = i === arr.length - 1;
      const dot = m.kind === 'done' ? { bg: '#2ED47A', bd: '#2ED47A' } : m.kind === 'current' ? { bg: '#F5B041', bd: '#F5B041' } : m.kind === 'next' ? { bg: '#0B1430', bd: '#F5B041' } : { bg: '#1B2647', bd: '#3A456B' };
      return { date: m.date, label: m.label, stateLabel: m.stateLabel, dotBg: dot.bg, dotBorder: dot.bd,
        lineBg: last ? 'transparent' : (m.kind === 'done' ? '#2ED47A' : '#2C3760'),
        dateColor: '#C9D2EC', labelColor: '#FFFFFF',
        stateColor: m.kind === 'done' ? '#6FE0A0' : (m.kind === 'current' || m.kind === 'next') ? '#F5B041' : '#8C97BD' };
    });

    // C3 helpers — navigate AND pre-scope the destination filter so the count lands on its own work.
    const goInputChecks = () => this.setState({ view: 'inputs', inputsTab: 'nodes', nodesTab: 'autodml', nodeStep: 'active' });
    // C3 — filter keys must match the F2-aligned chip labels exactly.
    const goNeedsDecision = () => this.setState({ view: 'align', alignFilter: 'Feedback Received' });
    const goReadyAck = () => this.setState({ view: 'align', alignFilter: 'Feedback Received' });
    const goReadyFinalise = () => this.setState({ view: 'finalise' });
    const goAwaiting = () => this.setState({ view: 'align', alignFilter: 'Pending Feedback' });

    // A2 — adaptive "Your next action": Ops Alignment buckets only — these are the interventions that need the planner.
    const NA_BUCKETS = [
      { n: readyFinalise, iconPath: ICON.flag, title: readyFinalise + ' acknowledged plan' + (readyFinalise === 1 ? '' : 's') + ' ready to finalise',
        desc: 'These plans are frozen and decided. Finalise to hand them to the LH team for RFQ creation.',
        ctaLabel: 'Open Ops Alignment', onClick: goReadyFinalise },
      { n: readyAck, iconPath: ICON.lock, title: readyAck + ' plan' + (readyAck === 1 ? '' : 's') + ' ready to acknowledge & freeze',
        desc: 'Every row is decided. Acknowledge to freeze the design and lock Ops editing before the freeze date.',
        ctaLabel: 'Open Ops Alignment', onClick: goReadyAck },
      { n: needsDecision, iconPath: ICON.push, title: needsDecision + ' plan' + (needsDecision === 1 ? ' has' : 's have') + ' Ops feedback awaiting your decision',
        desc: 'Run Simulate to see the metric movement on each suggested change, then Accept or Reject row-by-row before you acknowledge and freeze.',
        ctaLabel: 'Open Ops Alignment', onClick: goNeedsDecision },
      { n: awaitingFeedback, iconPath: ICON.push, title: awaitingFeedback + ' plan' + (awaitingFeedback === 1 ? '' : 's') + ' pushed — awaiting Ops feedback',
        desc: 'Reviewers have been notified. You can nudge them, or start finalising the plans that already have feedback.',
        ctaLabel: 'Open Ops Alignment', onClick: goAwaiting },
    ];
    const naWinner = NA_BUCKETS.find(b => b.n > 0);
    const nextAction = naWinner
      ? { iconPath: naWinner.iconPath, title: naWinner.title, desc: naWinner.desc, ctaLabel: naWinner.ctaLabel, onClick: naWinner.onClick, hasCta: true }
      : { iconPath: ICON.review, title: "You're all caught up", desc: daysToFreeze + ' day' + (daysToFreeze === 1 ? '' : 's') + ' to freeze · nothing needs your attention right now. New work surfaces here as Ops Leads submit feedback and runs complete.', ctaLabel: '', onClick: () => {}, hasCta: false };

    const TONEBG = { warn: '#FBF1DF', info: '#E7F0F8', neutral: '#F2F5FA', accent: '#EAEEFB', success: '#E7F4EC' };
    const TONEFG = { warn: '#C77B00', info: '#1E6FB8', neutral: '#5A5E66', accent: '#2F4FC6', success: '#128A3E' };

    // A4 — deterministic per-plan age (days waiting in its current state). No real timestamp exists, so derive
    // a stable age from the scCode so the demo is reproducible. Each deadline-bearing bucket gets an
    // "N at risk · oldest age" sub-line; an item is at risk once its age passes the bucket's sub-deadline.
    const planAge = (p) => { let h = 0; const s = p.scCode || p.id || ''; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff; return 1 + (h % 8); }; // 1..8 days
    const ageStats = (bucketPlans, subDeadline) => {
      const ages = bucketPlans.map(planAge);
      const atRisk = ages.filter(a => a >= subDeadline).length;
      const oldest = ages.length ? Math.max.apply(null, ages) : 0;
      return { atRisk, oldest, overdue: atRisk > 0, hasItems: ages.length > 0 };
    };
    const awaitingPlans = d.plans.filter(p => eff(p) === 'Pushed');
    const needsDecisionPlans = d.plans.filter(p => eff(p) === 'In Alignment');
    const readyAckPlans = d.plans.filter(p => eff(p) === 'In Alignment' && liveDecided(p));
    const awaitingAge = ageStats(awaitingPlans, 4);      // feedback should land within ~4 days of push
    const needsAge = ageStats(needsDecisionPlans, 3);    // decisions shouldn't sit > 3 days
    const ackAge = ageStats(readyAckPlans, 2);           // acknowledge promptly once decided
    const riskSub = (st2) => st2.hasItems ? (st2.atRisk + ' at risk · oldest ' + st2.oldest + 'd') : 'none waiting';

    const rawTiles = [
      { iconPath: ICON.push, num: awaitingFeedback, label: 'Awaiting Ops feedback', sub: riskSub(awaitingAge), tone: 'neutral', onTile: goAwaiting, deadline: true, risk: awaitingAge, weight: 40 + (awaitingAge.overdue ? 50 : 0) },
      { iconPath: ICON.align, num: needsDecision, label: 'Resolve Ops feedback', sub: riskSub(needsAge), tone: 'accent', onTile: goNeedsDecision, deadline: true, risk: needsAge, weight: 80 + (needsAge.overdue ? 50 : 0) },
      { iconPath: ICON.lock, num: readyAck, label: 'Acknowledge & freeze', sub: riskSub(ackAge), tone: 'warn', onTile: goReadyAck, deadline: true, risk: ackAge, weight: 60 + (ackAge.overdue ? 50 : 0) },
      { iconPath: ICON.flag, num: readyFinalise, label: 'Finalise plans', sub: 'acknowledged plans', tone: 'success', onTile: goReadyFinalise, weight: 50 },
    ];
    const toTileCard = t => { const muted = t.num === 0; const overdue = !!(t.deadline && t.risk && t.risk.overdue); return {
      iconPath: t.iconPath, num: t.num, label: t.label, sub: muted ? 'All clear' : t.sub, onClick: t.onTile,
      iconBg: muted ? '#F2F5FA' : TONEBG[t.tone], iconFg: muted ? '#C3C9D4' : TONEFG[t.tone],
      numColor: muted ? '#C3C9D4' : '#14171F', labelColor: muted ? '#8E96A3' : '#14171F',
      barBg: muted ? '#E6EBF2' : (overdue ? '#D14B4B' : TONEFG[t.tone]),
      cardOpacity: muted ? '0.6' : '1', overdue, subColor: overdue ? '#D14B4B' : '#5A5E66',
      sortKey: (t.num > 0 ? 1000 : 0) + t.weight }; };
    const queueTiles = rawTiles.map(toTileCard).sort((a, b) => b.sortKey - a.sortKey);
    const queueGroups = [{ heading: 'Ops Alignment', tiles: queueTiles }];

    const scopeStats = [
      { value: String(d.scs.length), label: 'LMSCs in scope' },
      { value: fmtInt(d.totals.dcTotal), label: 'Delivery centres (LMDC)' },
      { value: fmtL(d.totals.volTotal), label: 'Cycle volume (shipments)' },
      { value: String(d.runs.length), label: 'Runs generated (80 SCs × 3 weight variants)' },
      { value: String(finalised), label: 'Plans finalised' },
    ];

    // P1 — Persistent lifecycle rail: shows a horizontal stage rail below the top header bar
    // so the user always knows where they are and what the next step is.
    // Planner rail: 5 stages (Design Inputs → Design Creation → Design Review → Ops Alignment → Finalise).
    // Ops Lead rail: 3 stages (To Review → In Progress → Submitted) reflecting their review state.
    // Shown on all planner views except Command Center and Map; on align view only for Ops Lead.
    const railViewActive = planner
      ? (st.view === 'inputs' || st.view === 'creation' || st.view === 'review' || st.view === 'align' || st.view === 'finalise')
      : (st.view === 'align');
    // Map view order for planner: inputs=0, creation=1, review=2, align=3, finalise=4
    const PLANNER_STAGES = [
      { key: 'inputs',   label: 'Design Inputs',   goView: 'inputs' },
      { key: 'creation', label: 'Design Creation',  goView: 'creation' },
      { key: 'review',   label: 'Design Review',    goView: 'review' },
      { key: 'align',    label: 'Ops Alignment',    goView: 'align' },
      { key: 'finalise', label: 'Finalise',          goView: 'finalise' },
    ];
    // Active stage = the view the planner is currently on (or 'finalise' when all plans are finalised)
    const activeStageKey = finalised >= d.plans.length && d.plans.length > 0 ? 'finalise' : st.view;
    // Linear stepper: every stage BEFORE the current one reads as done, current = active, rest = upcoming.
    // (Per-module gate state — e.g. unresolved inputs — is surfaced via the sidebar badges, not the rail,
    // so the rail stays an unambiguous "where am I / what's next" progress indicator.)
    const activeStageIdx = PLANNER_STAGES.findIndex(s => s.key === activeStageKey);
    const plannerStages = PLANNER_STAGES.map((s, i) => {
      const isActive = s.key === activeStageKey;
      const isDone   = activeStageIdx > -1 && i < activeStageIdx;
      const isUpcoming = !isActive && !isDone;
      const canNav = s.goView !== null;
      // All 5 spec stages render, including Finalise (terminal, non-clickable) so the rail shows the full flow.
      const showInTier1 = true;
      return {
        label: s.label,
        isActive, isDone, isUpcoming, notActive: !isActive,
        showInTier1, hideInTier1: !showInTier1,
        // Tier-1 tab style: active = navy 700, done = ink 600, upcoming = muted 500
        tier1Color:  isActive ? '#003F98' : (isDone ? '#14171F' : '#8E96A3'),
        tier1Weight: isActive ? '700' : (isDone ? '600' : '500'),
        dotBg:     isActive ? '#003F98' : (isDone ? '#003F98' : '#E6EBF2'),
        dotFg:     isActive ? '#fff'    : (isDone ? '#fff'    : '#8E96A3'),
        labelColor:isActive ? '#003F98' : (isDone ? '#14171F' : '#8E96A3'),
        labelWeight: isActive ? '700' : '600',
        onClick: canNav ? (() => this.go(s.goView)) : (() => {}),
        cursor: canNav ? 'pointer' : 'default',
        notLast: i < PLANNER_STAGES.length - 1,
        lineColor: isDone ? '#003F98' : '#E6EBF2',
      };
    });
    // Ops Lead 3-stage rail: To Review / In Progress / Submitted — maps to aggregate ops review state
    const opsAssignedPlans = d.plans.filter(p => (st.alignStatus[p.id] || p.status) === 'Pushed' || !!st.opsSubmitted[p.id]);
    const opsToReviewN   = opsAssignedPlans.filter(p => { const dec = st.opsRowDec[p.id] || {}; const done = Object.values(dec).filter(v => v !== 'Pending').length; return !st.opsSubmitted[p.id] && done === 0; }).length;
    const opsInProgN     = opsAssignedPlans.filter(p => { const dec = st.opsRowDec[p.id] || {}; const done = Object.values(dec).filter(v => v !== 'Pending').length; return !st.opsSubmitted[p.id] && done > 0; }).length;
    const opsSubmittedN  = opsAssignedPlans.filter(p => !!st.opsSubmitted[p.id]).length;
    // Ops active stage: submitted if most are done, in-progress if some done, to-review otherwise
    // Ops Lead rail = their slice of the shared lifecycle (Design Review → Ops Alignment → Finalise), NOT their
    // review-state (that's the Tier-2 filters below). 'Ops Alignment' is their active stage; Review is upstream
    // (planner, done), Finalise downstream (planner). Once all assigned plans are submitted, advance to Finalise.
    const opsAllSubmitted = opsSubmittedN >= opsAssignedPlans.length && opsAssignedPlans.length > 0;
    const opsActiveStage = opsAllSubmitted ? 'finalise' : 'align';
    const OPS_STAGES = [
      { key: 'review',   label: 'Design Review' },
      { key: 'align',    label: 'Ops Alignment' },
      { key: 'finalise', label: 'Finalise' },
    ];
    const opsStages = OPS_STAGES.map((s, i) => {
      const isActive   = s.key === opsActiveStage;
      const isDone     = OPS_STAGES.findIndex(x => x.key === opsActiveStage) > i;
      const isUpcoming = !isActive && !isDone;
      return {
        label: s.label,
        isActive, isDone, isUpcoming, notActive: !isActive,
        dotBg:      isActive ? '#003F98' : (isDone ? '#003F98' : '#E6EBF2'),
        dotFg:      isActive ? '#fff'    : (isDone ? '#fff'    : '#8E96A3'),
        labelColor: isActive ? '#003F98' : (isDone ? '#14171F' : '#8E96A3'),
        labelWeight: isActive ? '700' : '600',
        notLast: i < OPS_STAGES.length - 1,
        lineColor: isDone ? '#003F98' : '#E6EBF2',
        countColor: isActive ? '#003F98' : (isDone ? '#128A3E' : '#8E96A3'),
      };
    });
    // Ops next CTA
    const opsNextCta = opsToReviewN > 0 ? 'Review plans' : opsInProgN > 0 ? 'Continue reviewing' : 'All plans submitted';
    const opsNextHasCta = opsToReviewN > 0 || opsInProgN > 0;
    // Planner rail "Next" advances to the next stage in the flow (positional), so the rail reads
    // as a self-consistent stepper. On the final actionable stage it defers to the adaptive nextAction.
    const nextStageObj = (activeStageIdx >= 0 && activeStageIdx < PLANNER_STAGES.length - 1) ? PLANNER_STAGES[activeStageIdx + 1] : null;
    const railNextHasStage = !!(nextStageObj && nextStageObj.goView);
    const railNextIsCta = railNextHasStage || nextAction.hasCta;
    const railNextLabel = railNextHasStage ? ('Next: Open ' + nextStageObj.label) : (nextAction.hasCta ? ('Next: ' + nextAction.ctaLabel) : 'All caught up');
    const railNextClick = railNextHasStage ? (() => this.go(nextStageObj.goView)) : nextAction.onClick;
    // On an Ops-Alignment L2 plan detail the top tabs are replaced by an in-page breadcrumb,
    // so suppress the whole two-tier rail there (both personas).
    const onAlignL2 = st.view === 'align' && (planner ? !!st.alignPlanId : !!st.opsPlanId);
    const lifecycleRail = {
      showRail: railViewActive && !onAlignL2,
      showRailPlanner: railViewActive && planner && !onAlignL2,
      showRailOps: railViewActive && !planner && !onAlignL2,
      plannerStages,
      opsStages,
      // Planner rail CTA advances to the NEXT lifecycle stage (positional); on the last
      // actionable stage (align/finalise) it falls back to the adaptive "next action".
      nextHasCta: railNextIsCta,
      nextNoCta: !railNextIsCta,
      nextCtaLabel: railNextLabel,
      onNextCta: railNextClick,
      opsNextCta, opsNextHasCta, opsNextNoCta: !opsNextHasCta,
      onOpsNextCta: () => this.setState({ view: 'align' }),
    };

    // TIER-2 SUB-TABS — one consistent strip keyed off st.view + st.persona.
    // Each tab: { label, active, onClick, disabled?, hasBadge?, badge?, badgeBg?, badgeFg?, tip, showDot }
    // Sources: inputsTabs (inputsVals), STEPS (creationVals), reviewTotal (reviewVals),
    //          opsFilterChips (opsVals). Built here so all computed values are in scope.
    // _tab(label, active, onClick, badge, badgeBg, badgeFg, disabled, tip, showDot)
    //   tip     — one-line description shown in the ⓘ tooltip
    //   showDot — boolean: show red attention dot on the ⓘ icon
    const _tab = (label, active, onClick, badge, badgeBg, badgeFg, disabled, tip, showDot) => {
      const hasBadge = badge != null;
      return { label, active, onClick: onClick || (() => {}),
        disabled: !!disabled, notDisabled: !disabled,
        hasBadge, badge: hasBadge ? String(badge) : '',
        badgeBg: badgeBg || '#EAEEFB', badgeFg: badgeFg || '#2F4FC6',
        color: active ? '#003F98' : '#5A5E66',
        weight: active ? '700' : (disabled ? '400' : '500'),
        tip: tip || '',
        showDot: !!showDot };
    };
    let subTabsArr = [];
    if (railViewActive) {
      const v = st.view;
      if (v === 'inputs' && planner) {
        // Pull inputsTabs data — already computed inside inputsVals() above via spread.
        // Re-derive here using the same state to avoid a cross-method dependency.
        const itab = st.inputsTab || 'volume';
        const inputsTabCount = { volume: 4, nodes: (d.autodmlNodes || []).length, masters: d.scs.length, ingestion: 3 };
        // Tooltip descriptions per tab
        const IT_TIP = {
          volume:    'Upload shipment volume CSV files for FM, FMSC, and LMDC flows. One active file per cycle.',
          nodes:     'AutoDML-sourced node list for this cycle. Review any flagged nodes before proceeding.',
          masters:   'Manage SC Master (sort-centre config) and Vehicle Master (type + capacity definitions).',
          ingestion: 'Import an existing route plan CSV to seed the design — skips the solver for that SC.',
        };
        const IT = [['volume', 'Volume Inputs'], ['nodes', 'Node Inputs'], ['masters', 'Node & Vehicle Master'], ['ingestion', 'Design Ingestion']];
        // Node Inputs: red dot when any AutoDML flags are present (attention needed)
        const autodmlFlagCount = (d.autodmlNodes || []).filter(n => n && n.hasFlag).length;
        subTabsArr = IT.map(t => {
          const isActive = itab === t[0];
          // Red dot: Node Inputs has flags needing review; no dot on other inputs tabs
          const showDot = t[0] === 'nodes' && autodmlFlagCount > 0;
          return _tab(t[1] + ' (' + inputsTabCount[t[0]] + ')', isActive, () => this.setState({ inputsTab: t[0] }),
            null, null, null, false, IT_TIP[t[0]], showDot);
        });
      } else if (v === 'creation' && planner) {
        // Tier-2 = 2 tabs: "Input Selection" (whole 4-step wizard) + "Run Queue".
        const cv = st.creationView || 'wizard';
        const rqN = (st.runQueue || []).filter(r => r.status === 'Queued' || r.status === 'In Progress').length;
        subTabsArr = [
          _tab('Input Selection', cv === 'wizard', () => this.setState({ creationView: 'wizard' }),
            null, null, null, false,
            'Select the LMDC volume file, configure sort centres, set HW variants, and trigger runs.', false),
          _tab('Run Queue', cv === 'queue', () => this.setState({ creationView: 'queue' }),
            rqN > 0 ? rqN : null, '#FBF1DF', '#C77B00', false,
            'Live status of DS solver runs triggered this cycle. Active runs show progress; completed runs are ready to review.', false),
        ];
      } else if (v === 'review' && planner) {
        // RLH Route Plan (active) + SC-DC Mapping Plan (disabled/soon)
        const rt = d.plans.length; // proxy; actual reviewTotal computed in reviewVals
        subTabsArr = [
          _tab('RLH Route Plan (' + rt + ')', true, () => {},
            null, null, null, false,
            'Per-run route plan metrics: Coverage, CPS, Utilisation, Routes, Vehicles, Distance, Cost. Compare HW variants side-by-side.', false),
          _tab('SC-DC Mapping Plan', false, () => this.showToast('SC-DC Mapping Plan — coming soon', '#C77B00'),
            'SOON', '#F2F5FA', '#8E96A3', true,
            'SC-to-DC assignment summary plan — launching after Route Plan review is complete.', false),
        ];
      }
      // Ops Alignment has NO Tier-2 sub-tabs — its Pending / Received / Finalised (planner) and
      // To review / In progress / Submitted / Locked (ops) filters now live in the master rail
      // segment (alignFilterSeg / opsFilterSeg). Leaving subTabsArr empty hides the top strip.
    }
    const subTabs = { show: subTabsArr.length > 0, tabs: subTabsArr,
      showSearch: st.view === 'review', searchVal: st.reviewSearch || '', searchPlaceholder: 'Search SC…', onSearch: (e) => this.setState({ reviewSearch: e.target.value }) };

    return {
      contentPad: '28px 34px',
      isPlanner: planner, isOps: !planner,
      personaName: planner ? 'Pranita Sapkal' : 'Rahul Sharma',
      personaRole: planner ? 'Central Network Planner' : 'Ops Lead · South',
      personaInitials: planner ? 'PS' : 'RS',
      view: st.view, isCommand: st.view === 'command', isInputs: st.view === 'inputs', isStub: !(st.view === 'command' || st.view === 'inputs' || st.view === 'creation' || st.view === 'review' || st.view === 'align' || st.view === 'map' || st.view === 'finalise' || st.view === 'cyclesummary'),
      ...this.creationVals(),
      ...this.reviewVals(),
      ...this.alignVals(),
      ...this.opsVals(),
      ...this.mapVals(),
      ...this.finaliseVals(),
      ...this.summaryVals(),
      // Run-map popup (opened from Design Review cards / "Open on map") — reuses mapVals' per-SC geometry, no navigation.
      runMapOpen: !!st.runMapOpen, runMapClose: () => this.setState({ runMapOpen: false }),
      openFullMap: () => this.setState({ runMapOpen: false, view: 'map' }),
      ...this.inputsVals(),
      // inputs action handlers not produced by inputsVals (kept here so they survive):
      ...this.addScVals(),
      uploadFile: () => this.ingestRlhPlan(), downloadCsv: () => this.downloadCsvFile(), nudgeReviewers: () => { const plan = (this.state.data.plans || []).find(p => p.id === this.state.alignPlanId); const names = plan && plan.reviewerNames && plan.reviewerNames.length ? plan.reviewerNames.join(', ') : 'the reviewers'; const rp = Object.assign({}, this.state.remindedPlans); if (this.state.alignPlanId) rp[this.state.alignPlanId] = true; this.setState({ remindedPlans: rp }); this.showToast('Reminder sent to ' + names, '#1E6FB8'); }, addSc: () => this.setState({ addScOpen: true, addScEditCode: null, addScForm: { type: 'LMSC', zone: 'South', localTp: '5', nonLocalTp: '3', open: '06:00', close: '22:00' } }),
      startCreation: () => this.go('creation'), recheckAutodml: () => this.showToast('AutoDML re-check queued', '#2F4FC6'),
      moduleTitle: tt[0], moduleSubtitle: tt[1], stubIcon: STUBICON[st.view] || ICON.dash,
      navGroups, cycleName: st.designCycle || 'July 2026', cycleOpen: !!st.cycleOpen,
      toggleCycle: () => this.setState({ cycleOpen: !st.cycleOpen }), closeCycle: () => this.setState({ cycleOpen: false }),
      newCycle: () => { this.setState({ cycleOpen: false, creationStep: 1, selectedSCs: [], creationVolume: null, creationView: 'wizard', fixReturnStep: null, focusSC: null, runQueue: [], hwBySC: {}, refBySC: {}, droppedDcBySC: {}, globalRefApplied: false, newNodeMode: false }); this.go('creation'); },
      isPastCycle,
      toggleCyclePicker: () => this.setState({ cyclePickerOpen: !st.cyclePickerOpen }),
      cyclePickerOpen: !!st.cyclePickerOpen,
      cyclePickerChevron: st.cyclePickerOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6',
      cycleOptions: [['July 2026', 'Current · active', false], ['June 2026', 'Last month · Finalised', true]].map(c => ({ name: c[0], meta: c[1], active: (st.designCycle || 'July 2026') === c[0], rowBg: (st.designCycle || 'July 2026') === c[0] ? '#1E2C57' : 'transparent', onSelect: () => { this.setState({ designCycle: c[0], cycleOpen: false, cyclePickerOpen: false, view: c[2] ? 'cyclesummary' : 'inputs' }); this.showToast('Switched to ' + c[0], '#003F98'); } })),
      pastCycleOptions: [['May 2026', 'Archived'], ['April 2026', 'Archived'], ['March 2026', 'Archived']].map(c => ({ name: c[0], meta: c[1], active: (st.designCycle || 'July 2026') === c[0], rowBg: (st.designCycle || 'July 2026') === c[0] ? '#1E2C57' : 'transparent', onSelect: () => { this.setState({ designCycle: c[0], cycleOpen: false, cyclePickerOpen: false, view: 'cyclesummary' }); this.showToast('Switched to ' + c[0] + ' · read-only', '#003F98'); } })),
      freezeMiniText: daysToFreeze + 'd to freeze · ' + health.label, freezeMiniBg: health.miniBg, freezeMiniFg: health.miniFg,
      plannerSegBg: planner ? '#fff' : 'transparent', plannerSegFg: planner ? '#003F98' : '#5A5E66',
      opsSegBg: !planner ? '#fff' : 'transparent', opsSegFg: !planner ? '#003F98' : '#5A5E66',
      showPersonaToggle: st.view === 'align',
      setPlanner: () => this.setPersona('planner'), setOps: () => this.setPersona('ops'),
      comingSoonSearch: () => this.showToast('Search is coming — use the filters and zone chips to narrow your view for now.', '#1E6FB8'), openCycle: () => this.comingSoon('Cycle switcher'),
      goCommand: () => this.go('inputs'), dismissCoach: () => this.setState({ showCoach: false }),
      showCoach: st.showCoach,
      hero: { days: daysToFreeze, healthLabel: health.label, healthBg: health.bg, healthFg: health.fg, healthDot: health.dot,
        freezeSub: 'Acknowledge (freeze) by Jul 12 · designs due Jul 5 · finalise by Jul 15' },
      milestones, nextAction, queueTiles, queueGroups, scopeStats, lifecycleRail, subTabs,
      goAlign: () => this.go('align'),
      // Command Center run-queue card — shows live counts from the active runQueue.
      // Only Queued + In Progress items are surfaced in the short list (up to 6);
      // Completed items are counted but not shown individually to keep the card compact.
      ccRunTotal: st.runQueue.length,
      ccRunQueuedN: st.runQueue.filter(r => r.status === 'Queued').length,
      ccRunProgN: st.runQueue.filter(r => r.status === 'In Progress').length,
      ccRunDoneN: st.runQueue.filter(r => r.status === 'Completed').length,
      ccRunEmpty: st.runQueue.length === 0,
      ccRunNotEmpty: st.runQueue.length > 0,
      ccRunItems: st.runQueue.filter(r => r.status !== 'Completed').slice(0, 6).concat(
        st.runQueue.filter(r => r.status === 'Completed').slice(0, Math.max(0, 6 - st.runQueue.filter(r => r.status !== 'Completed').length))
      ).map(r => ({
        scCode: r.scCode,
        statusLabel: r.status === 'Queued' ? 'Planned' : r.status === 'In Progress' ? 'In Progress' : 'Completed',
        statusBg: r.status === 'Completed' ? '#E7F4EC' : r.status === 'In Progress' ? '#FBF1DF' : '#F2F5FA',
        statusFg: r.status === 'Completed' ? '#128A3E' : r.status === 'In Progress' ? '#C77B00' : '#5A5E66',
        isRunning: r.status === 'In Progress',
        isDone: r.status === 'Completed',
      })),
      ccRunGoCreate: () => this.go('creation'),
      hasToast: !!st.toast, toastMsg: st.toast ? st.toast.msg : '', toastDot: st.toast ? st.toast.dot : '#2F4FC6', toastHasUndo: !!(st.toast && st.toast.undo), onToastUndo: () => this.runUndo(),
    };
  }

  render() {
    return View(this.renderVals(), this);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NDCApp />);
