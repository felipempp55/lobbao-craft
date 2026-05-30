# Handoff: Lobbão Craft · Navegação, Shell & Telas

## Overview

This handoff covers **everything in the Lobbão Craft site EXCEPT the two custom FIFA TOTY shield cards** (GoatCard + TotwCard) which were delivered separately in `design_handoff_fifa_toty_cards/`.

What's in this package:

- **App shell** — page background, atmospheric smoke layers, header bar, primary navigation tabs
- **6 screens** — Login, Home, Domingo (player rating), Jogadores (roster), Histórico, Atributos, Config
- **Pack Opening** — cinematic card reveal modal triggered after rating a player
- **PlayerCard (rectangular)** — the existing FIFA TOTW-style rectangular card used for the 3 lower tiers (Melhor Freezar, Bagre, Bom Player). Goat + Dream Lobby use the custom shields from the other handoff.
- **Tweaks Panel — Atmosfera** — 3 expressive system-wide controls: Vibe (Lobbão / Estádio / Tático), Fumaça (Limpo / Padrão / Cinema), Pulso (Parado / Vivo / Hype). These reshape the visual identity, not single properties.
- **Reusable primitives** — Panel, SectionLabel, Btn, Field, SmokeLayer, PaintSwoosh
- **Animation system** — CSS keyframes for smoke drift, shine, pulse, sparkle, pop-in, header line, pack reveal sequence
- **Auth + tab routing** — minimal localStorage-based state

## About the Design Files

These are **design references created in HTML/JSX** — prototypes showing the intended look, structure, and behavior. They are **not production code to copy verbatim**.

Recreate the designs in your real codebase using its established patterns (your routing layer, your state library, your styling system, your asset pipeline). Treat the `.jsx` files as source-of-truth blueprints for layer composition, dimensions, colors, animations, and copy — then re-implement in your component conventions.

## Fidelity

**Hi-fi.** All dimensions, colors, font sizes, animation timings, copy strings (in Portuguese-BR), and tier definitions are intentional. Recreate pixel-faithfully.

The Tweaks Panel atmosphere variants in particular are tuned: Estádio should feel like a TOTY stadium reveal (navy + gold), Tático should feel like a cold HUD (cyan + frozen), Lobbão is the live's signature red. Don't water these down.

## Architecture

```
<App>
├── PageBg                      ← fixed bg, smoke layers, vibe overlay (CSS-var driven)
├── Header                      ← brand mark, live name, logout
├── Nav                         ← tab switcher (Home / Domingo / Jogadores / Atributos / Histórico / Config)
├── <main key={tab}>            ← active screen, re-mounts on tab change for fade-in
│   └── one of:
│       ├── LoginScreen         (before auth)
│       ├── HomeScreen          (default after auth)
│       ├── SundayScreen        ← sliders + tag toggles + live card preview + REVELAR triggers PackOpening
│       ├── PlayersScreen       ← grid of all 9 players w/ current cards
│       ├── HistoryScreen       ← collapsible weekly archive
│       ├── AttrsScreen         ← attribute weight reference + tags reference
│       └── ConfigScreen        ← live identity, export, danger zone (logout)
└── TweaksPanel (Atmosfera)     ← floats bottom-right when Tweaks mode is on
```

State is minimal:
- `authed: boolean` (persisted in `localStorage['lbc_auth']`)
- `tab: string` (persisted in `localStorage['lbc_tab']`)
- Tweaks: `{ vibe, fumaca, pulso }` (persisted via `useTweaks` host protocol — replace with your own state lib when porting)

## Screens

### LoginScreen
Centered card with brand logo, "ENTRAR NA LIVE" heading, single Twitch-OAuth-style button. `onLogin` callback flips `authed` to true. Background uses the same atmospheric `PageBg`. Smoke + paint swoosh visible.

### HomeScreen
Hero panel with current week's headline ("DOMINGO 25 MAIO" + "RANKING DA SEMANA"), big call-to-action button → goes to SundayScreen. Below: tier distribution stat strip (count of cards in each tier this week), top-3 cards horizontal scroll. Section labels in Chakra Petch HUD style.

### SundayScreen (the rating tool)
Two-column layout (`grid-template-columns: 1fr 320px`):
- **Left column**: player selector pill row → AttrSlider stack (6 attributes, each with HUD range slider + tier-colored value + weight label) → Tags row (positive in green, negative in red, toggleable).
- **Right column (sticky)**: Live PlayerCard preview that updates as sliders move + overall breakdown panel (base vs. multiplier) + giant "★ REVELAR CARTA" button.
- Clicking REVELAR shows the PackOpening modal.

Overall is calculated as `weighted_avg(stats, weights) * applyMult(tags)`.

### PlayersScreen
Header section ("ELENCO DO LOBBÃO" + "OS JOGADORES"). Below: responsive grid of PlayerCards (`minmax(248px, 1fr)`), each card pops in with staggered delay (`.lbc-pop` keyframe). Each player's card pulls from the most recent session.

### HistoryScreen
Header ("ARQUIVO DE DOMINGOS" + "O HISTÓRICO"). Vertical stack of Panels — one per session — each collapsible. Header row shows date, label, card count, top scorer. Open state reveals a grid of all cards from that session (smaller, `S={0.74}`). The accent line on each panel is colored by the top card's tier.

### AttrsScreen
Header ("FÓRMULA DO OVERALL" + "OS ATRIBUTOS"). 2-column grid of attribute panels — each shows name, short code, weight % (big red number with glow), and a horizontal progress bar. Below: 3-column tag reference grid showing each tag with its polarity sign and multiplier.

### ConfigScreen
Centered 720px column. Three Panels:
1. **IDENTIDADE** — Fields for live name, schedule, ranking day (placeholder data, non-functional).
2. **EXPORTAR** — Two ghost buttons (download PNGs, copy ranking) — non-functional placeholders.
3. **ZONA DE PERIGO** — Two danger buttons: reset week (non-functional), logout (calls `onLogout`).

## Shell components

### `PageBg`
Fixed full-viewport background, `z-index: 0`. Three layers:
1. Page gradient — defaults to `radial-gradient(120% 80% at 50% -10%, #2a0808, #16110f 55%, #0a0606 100%)`. Overridden by `--lbc-page-bg` CSS variable when Vibe tweaks change.
2. Two `SmokeLayer` components — red smoke texture at `30% 20%` (32% opacity, 80% scale) and `70% 80%` (22% opacity, 120% scale, no drift, delayed -7s).
3. Bottom-left cyan whisper — `radial-gradient(circle at 0% 100%, rgba(0,180,220,0.06), transparent 60%)`. Overridable via `--lbc-page-corner`.
4. Vibe accent overlay — empty by default, picked up from `--lbc-vibe-overlay`, with `mix-blend-mode: screen`.

All overrides transition for 0.6s (smooth Vibe changes).

### `SmokeLayer`
Background-image div using `assets/smoke-red.png`. Props: `opacity`, `scale` (CSS bg-size, e.g. `"80%"`), `pos` (CSS bg-position, e.g. `"30% 20%"`), `hue` (optional CSS `hue-rotate`), `drift` (default true — adds the `lbcSmokeDrift` animation), inline `style`.

### `PaintSwoosh`
`<img>` of `assets/paint-swoosh.png` positioned absolutely with rotation, opacity 0.06–0.12. Used as a brushy texture on the rectangular PlayerCard and various sections.

### `Header`
Top bar, `position: sticky; top: 0; z-index: 50`, height ~76px. Layout:
- Gradient bg: `linear-gradient(180deg, #150505, #2a0e0e 55%, #150505)` — overrideable by Vibe.
- Center radial glow: `radial-gradient(circle, rgba(204,17,17,0.35), transparent 70%)` — overrideable by Vibe.
- Logo (`logo-fl1ip.png`, height 40, red glow).
- "LOBBÃO CRAFT" wordmark (Saira Condensed 900, 22px) + "LIVE OFICIAL" tagline (Chakra Petch 600 9px, letter-spacing 3).
- Right: red ghost button "SAIR".
- Bottom animated line: 2px tall, gradient `transparent → red → white → red → transparent`, animates with `lbcHdrLine` keyframe (horizontal sweep).

### `Nav`
Horizontal tabs below header. `display: flex; gap: 0`. Each tab:
- Chakra Petch 700, 11.5px, letter-spacing 1.8, uppercase.
- Padding `14px 22px`.
- Inactive: txt3 color, transparent bg, hover lifts opacity.
- Active: white text, red underline (2px, full width, glow). 

Tabs: `Home / Domingo / Jogadores / Atributos / Histórico / Config`.

### `Panel`
Card container. Props: `accent` (color for top border, default red `#cc1111`), `style`. Renders:
- Background `rgba(20, 8, 8, 0.65)` with `backdrop-filter: blur(6px)`.
- Border `1px solid rgba(255,255,255,0.06)`.
- 2px top border in accent color with subtle glow.
- Border-radius 4px (sharp, almost industrial).

### `SectionLabel`
HUD-style section header. Chakra Petch 700, 11px, letter-spacing 2.5, uppercase, in `txt3` by default or `col` prop.

### `Btn`
Variants: `primary` (red gradient), `success` (green gradient), `danger` (dark red ghost with red border), `ghost` (subtle border).
Sizes: `md` (default), `lg`. 
All caps text, Chakra Petch 700, letter-spacing 1.5, slight gold hover lift.

### `Field`
Labeled text input. Label = SectionLabel style. Input has dark transparent bg, white text, subtle border that brightens on focus.

## Atmosphere Tweaks (the big feature)

The Tweaks Panel exposes three controls. Each is a 3-option segmented radio. They map to `data-vibe`, `data-fumaca`, `data-pulso` attributes on `<html>` and are picked up by CSS selectors.

```js
const [t, setTweak] = useTweaks({ vibe: 'live', fumaca: 'padrao', pulso: 'vivo' });

useEffect(() => {
  document.documentElement.setAttribute('data-vibe',   t.vibe);
  document.documentElement.setAttribute('data-fumaca', t.fumaca);
  document.documentElement.setAttribute('data-pulso',  t.pulso);
}, [t.vibe, t.fumaca, t.pulso]);
```

### Vibe — atmosphere swap (live | estadio | tatico)

**`live` (default)** — signature Lobbão red. No overrides.

**`estadio`** — TOTY stadium vibe. Navy + gold:
```css
[data-vibe="estadio"] {
  --lbc-page-bg: radial-gradient(120% 80% at 50% -10%, #1a2a78, #050a30 55%, #00041e 100%);
  --lbc-page-corner: radial-gradient(circle at 0% 100%, rgba(255,200,80,0.10), transparent 60%);
  --lbc-vibe-overlay: radial-gradient(70% 50% at 60% 18%, rgba(255,215,0,0.10), transparent 60%);
}
[data-vibe="estadio"] header > div:first-child { background: linear-gradient(180deg, #06122c, #0a1c52 55%, #06122c) !important; }
[data-vibe="estadio"] header > div[style*="radial-gradient(circle"] { background: radial-gradient(circle, rgba(255,215,0,0.35), transparent 70%) !important; }
[data-vibe="estadio"] .lbc-hdr-line { background: linear-gradient(90deg, transparent, #ffd700 30%, #ffeeb0 50%, #ffd700 70%, transparent) !important; background-size: 200% 100% !important; }
[data-vibe="estadio"] div[style*="smoke-red"] { filter: hue-rotate(34deg) saturate(0.9) !important; }
```

**`tatico`** — cold HUD. Cyan + dark slate:
```css
[data-vibe="tatico"] {
  --lbc-page-bg: radial-gradient(120% 80% at 50% -10%, #0c1820, #050c12 55%, #02060a 100%);
  --lbc-page-corner: radial-gradient(circle at 0% 100%, rgba(0,200,230,0.12), transparent 60%);
  --lbc-vibe-overlay: linear-gradient(180deg, rgba(0,200,230,0.05), transparent 45%);
}
[data-vibe="tatico"] header > div:first-child { background: linear-gradient(180deg, #050a0e, #0a1218 55%, #050a0e) !important; }
[data-vibe="tatico"] header > div[style*="radial-gradient(circle"] { background: radial-gradient(circle, rgba(0,200,230,0.30), transparent 70%) !important; }
[data-vibe="tatico"] .lbc-hdr-line { background: linear-gradient(90deg, transparent, #00c8e6 30%, #ffffff 50%, #00c8e6 70%, transparent) !important; background-size: 200% 100% !important; }
[data-vibe="tatico"] div[style*="smoke-red"] { filter: hue-rotate(180deg) saturate(0.35) brightness(0.85) !important; }
```

When porting: if your codebase uses CSS Modules / scoped styles, replicate the same data-attribute strategy at the document root. The smoke filter selectors target `div[style*="smoke-red"]` because the prototype uses inline backgrounds — in your codebase, give SmokeLayer a class like `.smoke` and target `.smoke` instead.

### Fumaça — density of the atmospheric layer (limpo | padrao | cinema)

**`padrao` (default)** — no overrides.

**`limpo`** — nearly remove the smoke/paint swoosh effects:
```css
[data-fumaca="limpo"] div[style*="smoke-red"] { opacity: 0.08 !important; }
[data-fumaca="limpo"] img[src*="paint-swoosh"] { opacity: 0.04 !important; }
```

**`cinema`** — boost everything, add a colored glow to the header:
```css
[data-fumaca="cinema"] div[style*="smoke-red"] { filter: saturate(1.35) brightness(1.1); }
[data-fumaca="cinema"] .lbc-page-bg div[style*="smoke-red"] { opacity: 0.7 !important; }
[data-fumaca="cinema"] img[src*="paint-swoosh"] { opacity: 0.22 !important; }
[data-fumaca="cinema"] header { box-shadow: 0 4px 28px rgba(204,17,17,0.35); }
[data-vibe="estadio"][data-fumaca="cinema"] header { box-shadow: 0 4px 28px rgba(255,215,0,0.30); }
[data-vibe="tatico"][data-fumaca="cinema"] header { box-shadow: 0 4px 28px rgba(0,200,230,0.30); }
```

Notice Fumaça interacts with Vibe — Cinema's header glow color depends on the active Vibe. Preserve this when porting.

### Pulso — global animation tempo (parado | vivo | hype)

**`vivo` (default)** — no overrides.

**`parado`** — freeze the atmosphere:
```css
[data-pulso="parado"] .lbc-smoke,
[data-pulso="parado"] .lbc-shine,
[data-pulso="parado"] .lbc-pulse,
[data-pulso="parado"] .lbc-spark,
[data-pulso="parado"] .lbc-hdr-line { animation: none !important; }
[data-pulso="parado"] .lbc-pop,
[data-pulso="parado"] .lbc-screen { animation-duration: 0.001s !important; }
```

**`hype`** — accelerate everything:
```css
[data-pulso="hype"] .lbc-smoke   { animation-duration: 6s   !important; }
[data-pulso="hype"] .lbc-shine   { animation-duration: 2s   !important; }
[data-pulso="hype"] .lbc-pulse   { animation-duration: 1.2s !important; }
[data-pulso="hype"] .lbc-spark   { animation-duration: 1.2s !important; }
[data-pulso="hype"] .lbc-hdr-line{ animation-duration: 2.4s !important; }
[data-pulso="hype"] .lbc-pop     { animation-duration: 0.35s !important; }
```

The three controls compose — `Estádio + Cinema + Hype` is full TOTY pulsating; `Tático + Limpo + Parado` is frozen HUD.

## Animations

Defined in the `<style>` block at the top of `reference/Lobbao Craft.html`:

```css
@keyframes lbcSmokeDrift { 0%{background-position:20% 10%;} 50%{background-position:26% 16%;} 100%{background-position:20% 10%;} }
.lbc-smoke { animation: lbcSmokeDrift 16s ease-in-out infinite; }

@keyframes lbcShine { 0%{transform:translateX(-130%);} 60%,100%{transform:translateX(130%);} }
.lbc-shine { animation: lbcShine 4.5s ease-in-out infinite; }

@keyframes lbcPulse { 0%,100%{opacity:.35;} 50%{opacity:.9;} }
.lbc-pulse { animation: lbcPulse 3s ease-in-out infinite; }

@keyframes lbcSparkle { 0%,100%{opacity:0;transform:scale(.5);} 50%{opacity:1;transform:scale(1.3);} }
.lbc-spark { animation: lbcSparkle 2.2s ease-in-out infinite; }

@keyframes lbcHdrLine { 0%{background-position:0% 0;} 100%{background-position:200% 0;} }
.lbc-hdr-line { animation: lbcHdrLine 5s linear infinite; }

@keyframes lbcPop { 0%{opacity:0;transform:translateY(24px) scale(.94);} 100%{opacity:1;transform:none;} }
.lbc-pop { animation: lbcPop .5s cubic-bezier(.2,.7,.3,1) backwards; }

@keyframes lbcScreen { 0%{opacity:0;transform:translateY(10px);} 100%{opacity:1;transform:none;} }
.lbc-screen { animation: lbcScreen .35s ease-out; }

/* Pack opening sequence */
@keyframes lbcPackSwipe { /* diagonal paint sweep */ }
@keyframes lbcPackCardIn { /* card scales in with 3D rotation */ }
@keyframes lbcPackBurst { /* radial ring expands */ }
@keyframes lbcPackTierIn { /* tier name letter-spacing animation */ }
@keyframes lbcPackCue { /* fade-in cue text */ }
```

All these classes are referenced throughout the prototype (`.lbc-pop` on grid card stagger, `.lbc-screen` on tab transitions, `.lbc-hdr-line` on the header sweep). Preserve the class names — Pulso tweaks target them by exact name.

## Pack Opening sequence

When a user clicks "★ REVELAR CARTA" in SundayScreen, a full-viewport modal mounts. It runs a 7-phase reveal timeline:

| Phase | Delay | What happens |
|---|---|---|
| 0 | 80ms | Black radial background fades in |
| 1 | 600ms | Massive smoke layers fade in (200% scale, 85% opacity); colored radial fades in by tier |
| 2 | 1100ms | Diagonal white paint swoosh sweeps across the screen (`lbcPackSwipe`, 1.1s) |
| 3 | 1700ms | Card scales in with a 3D Y-axis rotation (`lbcPackCardIn`, 1.0s) — for tier ≥ Dream Lobby (lvl ≥ 3), 12 radial gold rays appear behind |
| 4 | 2500ms | Circular burst ring expands from card center (`lbcPackBurst`, 1.1s) |
| 5 | 3100ms | Tier name appears HUGE behind the card (220px, hollow stroked text, `lbcPackTierIn`); top label "OVERALL REVELADO · {tier.name}" fades in; logo top-left fades in |
| 6 | 3700ms | Bottom "CLIQUE PARA CONTINUAR" cue pulses; clicking dismisses the modal |

Pass `player, ov, stats, tags, onDismiss` to PackOpening. The reveal uses the same PlayerCard as everywhere else, just scaled up (`S={1.25}`).

This animation is one of the showstoppers of the app — preserve the timing precisely.

## Design Tokens

```js
const TOK = {
  // Backgrounds
  bg:     '#16110f',  // page deepest
  bgDeep: '#0a0606',  // scrollbar track
  bg2:    '#1a0606',  // panel base before transparency
  // Brand
  R:    '#cc1111',  // signature red
  RG:   '#ff3333',  // red glow
  RDeep:'#660808',  // dark red
  // Text
  txt:  '#ffffff',
  txt2: 'rgba(255,255,255,0.78)',
  txt3: 'rgba(255,255,255,0.55)',
  txt4: 'rgba(255,255,255,0.38)',
  // Borders
  border: 'rgba(255,255,255,0.08)',
  // Status
  ok:  '#33bb55',
  err: '#cc3333',
  // Fonts
  fHud:  "'Chakra Petch', sans-serif",
  fNum:  "'Saira Condensed', 'Arial Black', Impact, sans-serif",
  fBody: "'Rajdhani', sans-serif",
  fHand: "'Permanent Marker', cursive",  // used sparingly for hand-written accents
};
```

Load these Google Fonts at the top:
```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Saira+Condensed:wght@600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Permanent+Marker&display=swap');
```

## Data shape

The site reads from a single `data.jsx` module exporting:
- `TOK` — design tokens (above)
- `TIERS` — 5-tier definitions with name/short/min/max/col/glow/bg
- `tierFor(ov)` — returns the tier for a given overall
- `ATTRS` — 6 player attributes with name, short, weight
- `TAGS` — playstyle tag pool with polarity + multiplier
- `PLAYERS` — 9 sample players
- `SESSIONS` — historical session archive
- `applyMult(baseOv, tags)` — applies tag multipliers to overall

The data file is the **same file** as in the cards handoff — don't duplicate. If you already have your own player/tier model in the real app, map onto it.

Note the tier name updates baked in:
- `freezar.short = 'MELHOR FREEZAR'`
- `bom.name = 'BOM PLAYER'`, `bom.short = 'BOM PLAYER'`
- `dream.short = 'DREAM LOBBY'`

## Card routing reminder

```jsx
function renderCard(player, ov, stats, tags) {
  const tier = tierFor(ov);
  if (tier.id === 'goat')  return <GoatCard player={player} fx="gildedV2" />;
  if (tier.id === 'dream') return <TotwCard player={player} t={tier} variant="v2" />;
  return <PlayerCard player={player} ov={ov} stats={stats} tags={tags} />;
}
```

The rectangular `PlayerCard` (in `components/card.jsx`) is included in THIS handoff. The shield cards are in the other handoff.

## Files

```
design_handoff_site_navigation/
├── README.md                              ← this file
├── components/
│   ├── shell.jsx                          ← PageBg, Header, Nav, Panel, SectionLabel, Btn, Field, SmokeLayer, PaintSwoosh
│   ├── screens-1.jsx                      ← LoginScreen, HomeScreen
│   ├── screens-2.jsx                      ← SundayScreen, PlayersScreen, AttrSlider
│   ├── screens-3.jsx                      ← HistoryScreen, AttrsScreen, ConfigScreen
│   ├── pack.jsx                           ← PackOpening modal
│   ├── card.jsx                           ← PlayerCard (rectangular, for low tiers)
│   └── tweaks-panel.jsx                   ← Tweaks shell + form-control helpers (useTweaks, TweaksPanel, TweakRadio, ...)
├── reference/
│   └── Lobbao Craft.html                  ← full app entry: animations CSS, atmosphere CSS, script imports, root <App>
└── assets/
    ├── logo-fl1ip.png
    ├── smoke-red.png
    └── paint-swoosh.png
```

### Preview locally

The reference HTML imports `data.jsx` from `site/data.jsx`. To preview cleanly, run it in the original prototype project. Or in your real codebase, port the screens one at a time and use this folder as the reference.

## What's intentionally NOT in this handoff

- **GoatCard** and **TotwCard (variant v2)** — see `design_handoff_fifa_toty_cards/`
- **data.jsx** — same file is in the cards handoff; don't double-import. Use one source.
- A persistence/backend layer — the prototype uses localStorage; your real app likely has a DB.
- The Tweaks Panel host protocol details (postMessage activation, persistence keys) — when porting, replace `useTweaks` with your normal state/preferences hook. If you want to preserve the in-page Tweaks UI as a power-user setting, the panel component is general-purpose.
