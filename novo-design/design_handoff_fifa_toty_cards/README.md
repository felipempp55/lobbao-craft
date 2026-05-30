# Handoff: Cartas FIFA TOTY · GOAT & Dream Lobby

## Overview

This handoff covers the FIFA TOTY-style ("Team of the Year") shield card treatment designed for the **two highest tiers** of the Lobbão Craft player-card system:

- **GOAT** (overall 91–99) — flagship card, navy-royal base with gold ornamental shield border, gold crystal fan radiating from upper-right and spilling past the shield, gold confetti dust + sparkles falling across the entire card, ornamental gold corners, top chevron decoration.
- **Dream Lobby** (overall 80–90) — premium TOTW informe-style: black shield with thin gold double border, gold geometric framework centerpiece (outer rotated diamond outline + inner offset square + central dark gem with gold inset glow), low-poly faceted background, gold polygon shards in the four corners, gold sparkle dust + tier-colored particle streaks.

The remaining three tiers (**Melhor Freezar**, **Bagre**, **Bom Player**) are **not part of this handoff** — they keep the existing rectangular FIFA TOTW-style card already implemented in the codebase (`PlayerCard` in `site/card.jsx`).

The two new cards (`GoatCard` and `TotwCard`) live alongside the existing `PlayerCard` and are selected based on tier — the routing logic is the dev's job in your codebase.

## About the Design Files

The files in this bundle are **design references created in HTML/JSX** — prototypes showing the intended look, structure, and behavior. They are **not production code to copy verbatim**.

The task is to **recreate these designs in your real Lobbão Craft codebase** using its established patterns (React, your styling system, your asset pipeline). Treat `components/cards-fifa.jsx` as the source-of-truth blueprint for layer composition, dimensions, colors, and effects — then re-implement in your component conventions (CSS Modules, Tailwind, styled-components, whatever you use).

If your real codebase already uses inline `style={{}}` like the prototype does, you can adapt the JSX more directly. Otherwise extract the inline styles into your design system / token files.

## Fidelity

**Hi-fi.** All dimensions, colors, opacities, animation timings, and asset references in `components/cards-fifa.jsx` are intentional and were iterated on with the user. Recreate pixel-faithfully.

Two FIFA reference images (`reference/toty-goat-inspiration.png`, `reference/totw-dream-inspiration.png`) document the visual targets the user asked for. They were the basis for art direction — match their vibe.

The interactive showcase `reference/Cartas FIFA TOTY.html` shows the cards side-by-side with the existing rectangular tiers so you can see the full 5-tier system reading.

## Components

### `GoatCard` (used when `tier.id === 'goat'`)

**Outer container**: `position: relative; width: 290px; height: 432px; filter: drop-shadow(0 18px 40px rgba(0,0,0,0.7))`. Note: outer container has **`overflow: visible`** — required so the right-side crystal fan can spill past the shield silhouette.

**Layer stack** (back to front):

1. **`ShieldFrameRich`** — the gold-bordered shield. Four stacked `position:absolute` divs, all using the same `clip-path: polygon(...)` shape (see Shield Silhouette below):
   - Layer 1: `inset:0`, background `linear-gradient(160deg, #ffeeb0 0%, #ffd700 25%, #9c7220 50%, #ffd700 75%, #ffeeb0 100%)`, `filter: drop-shadow(0 0 22px rgba(255,215,0,0.4))` — the rich gold border with ornamental highlights.
   - Layer 2: `inset:5px`, background `#0d0a04` — dark engraved channel.
   - Layer 3: `inset:7px`, background `linear-gradient(160deg, #ffd700, #6b4a10, #ffd700)` — thin gold hairline.
   - Layer 4 (content): `inset:8.5px`, `overflow:hidden`, background = navy gradient `linear-gradient(165deg, #00041e 0%, #0c1d68 50%, #040933 100%)`. **All inner card content renders inside this clipped layer.**

2. Inside the content layer (Layer 4):
   - **Top gold radial halo**: `radial-gradient(120% 70% at 50% 0%, rgba(255,215,0,0.13), transparent 60%)`.
   - **Gold radial accent**: `radial-gradient(70% 55% at 50% 28%, rgba(255,215,0,0.23), transparent 60%)`.
   - **`ConfettiRain count={30} side="even" slow`** — 30 gold rhombus particles distributed across the entire card area, animated drifting downward + rotating (see Animations).
   - **`Sparkles count={32}`** — 32 small round gold dots scattered all over, pulsing in/out (see Animations).
   - **`Corners`** — four 24×24px gold L-shaped corner brackets at `top/bottom: 16px, left/right: 16px`, 1.5px borders in `#ffeeb0` with 10px rounded inner corner, slight glow.
   - **`TopChevron`** — two stacked downward-pointing gold chevron shapes at top center (`top:10px, left:50%`), 14×7px each, gradient `polygon(50% 0, 100% 100%, 75% 100%, 50% 38%, 25% 100%, 0 100%)` clip-path, gold fill with drop-shadow glow.
   - **Photo slot**: `top:9%, left:0, right:0, height:58%`. In the prototype this is a placeholder with monogram letters + silhouette; in production this is the player photo.
   - **Navy silk fade** at bottom: `radial-gradient(55% 80% at 50% 30%, #0c1d68cc, transparent 60%)`, `filter: blur(8px)`.
   - **Footer fade**: `linear-gradient(to top, rgba(0,4,30,0.96) 38%, transparent)`.
   - **Header**: top-left, contains:
     - Overall number — `Saira Condensed`, 900 weight, 50px, color `#ffeeb0`, `text-shadow: 0 2px 14px rgba(255,215,0,0.8), 0 0 22px rgba(255,215,0,0.33)`.
     - Tier label `"GOAT"` — `Chakra Petch`, 700 weight, 9px, letter-spacing 2.4px, color `#ffeeb0`, uppercase.
     - Logo `LOGO` — 42px wide, opacity 0.9, drop-shadow gold.
   - **Footer**: bottom area, contains:
     - Player nick — `Saira Condensed` 900, 23px, white, letter-spacing 1.5px, text-shadow gold.
     - Horizontal gold gradient divider line.
     - 6-column stats grid with attribute short codes (`K/D, DAN, UTI, WIN, CLU, CON`) — `Chakra Petch` 700 8.5px gold, and stat value `Saira Condensed` 800 18px white.

3. **`CrystalFan`** (the right-spill effect) — rendered as a **sibling of `ShieldFrameRich`**, *outside the clipped content layer*, so its slivers can extend past the shield border:
   ```
   <CrystalFan cx="86%" cy="20%" count={18} a0={50} a1={270}
               rMin={40} rMax={110} thin op={0.92} />
   ```
   - 18 elongated diamond slivers radiating from `(86% × cardW, 20% × cardH) = (249px, 86px)`.
   - Angle range `50°` → `270°` (CSS rotate convention: 0° = pointing down, CW). This range causes slivers to fan from down-right → right → up-right → up → up-left → left.
   - Length per sliver: `len = rMin + (rMax - rMin) * (0.45 + 0.55 * |sin(i * 1.7 + 0.5)|)` → range 40–110px (varied for organic feel).
   - Width: `2.5px` (thin slivers).
   - Each sliver: gradient `linear-gradient(180deg, #ffeeb0, #ffd700 40%, #9c7220)`, `clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)` (rhombus), 5px gold glow.
   - `transform-origin: 50% 0` (top-center pivot) so rotation radiates outward from the origin point.
   - **Required**: the outer card container must have `overflow: visible` so the slivers visibly cross the shield border into surrounding whitespace. The user explicitly wants this spillage — do not clip.

### `TotwCard variant="v2"` (used when `tier.id === 'dream'`)

**Outer container**: `position:relative; width:270px; height:408px; filter: drop-shadow(0 14px 32px rgba(0,0,0,0.7))`.

**Layer stack**:

1. **`ShieldFrameThin`** — same shield silhouette, thinner gold double border:
   - Layer 1: `inset:0`, background `linear-gradient(160deg, #ffd700, #6b4a10, #ffd700)`, `drop-shadow(0 0 10px rgba(255,215,0,0.27))`.
   - Layer 2: `inset:2.5px`, background `#000`.
   - Layer 3: `inset:4px`, background `linear-gradient(160deg, #9c7220, #ffd700, #9c7220)` — thin gold inner ring.
   - Layer 4 (content): `inset:5.5px`, `overflow:hidden`, background `linear-gradient(165deg, #0a0a0e 0%, #14141a 50%, #0a0a0e 100%)`.

2. Inside content layer:
   - **Base lighting** (v2 version, no diagonal):
     ```
     backgroundImage:
       radial-gradient(80% 60% at 50% 18%, rgba(255,215,0,0.07), transparent 60%),
       radial-gradient(60% 70% at 50% 100%, rgba(0,0,0,0.4), transparent 60%)
     opacity: 0.65
     ```
     **Important**: do NOT add diagonal linear gradients here. An earlier version had `linear-gradient(60deg, ...)` that the user rejected as a visible diagonal band.
   - **4 gold polygon shards** in the corners (small, low rotation to avoid forming a diagonal sweep across the card):
     ```
     [
       { left:'6%',  top:'10%', w:34, h:42, rot:  8, op:0.16 },
       { left:'76%', top:'12%', w:38, h:48, rot:-10, op:0.18 },
       { left:'4%',  top:'62%', w:32, h:40, rot:-12, op:0.14 },
       { left:'78%', top:'66%', w:36, h:44, rot: 10, op:0.16 },
     ]
     ```
     Each: `background: linear-gradient(135deg, rgba(255,215,0,0.47), rgba(107,74,16,0.27))`, `clipPath: polygon(20% 0, 100% 25%, 80% 100%, 0 70%)`, `border: 1px solid rgba(255,215,0,0.53)`, `box-shadow: 0 0 6px rgba(255,215,0,0.33)`.
   - **Tier halo**: `radial-gradient(60% 40% at 50% 28%, rgba(tierGlow,0.2), transparent 60%)`, `mix-blend-mode: screen`. For Dream Lobby, `tierGlow = #ffaa00`.
   - **`GoldFramework sz={130}`** — the centerpiece:
     - Container at `top:13%, left:50%, transform:translateX(-50%); width:130px; height:143px`.
     - **Center dark gem** (stays centered): `top:22%, left:22%, width:56%, height:56%`, `background: linear-gradient(135deg, rgba(255,235,150,0.22), rgba(40,28,8,0.55))`, `clipPath: polygon(50% 0, 100% 50%, 50% 100%, 0 50%)`, `box-shadow: inset 0 0 18px rgba(255,215,0,0.35), 0 4px 16px rgba(0,0,0,0.55)`.
     - **Outer gold diamond wireframe** (shifted slightly LEFT for asymmetry): wrapper `<div style={{position:'absolute', inset:0, transform:'translateX(-3%)'}}>` containing:
       - The diamond: `top:2%, left:2%, width:96%, height:96%`, `border: 1.5px solid #ffd700`, `transform: rotate(45deg)`, `box-shadow: 0 0 10px rgba(255,215,0,0.53), inset 0 0 4px rgba(255,238,176,0.4)`, opacity 0.9.
       - 4 vertex dots at `(50%,0)`, `(100%,50%)`, `(50%,100%)`, `(0,50%)` — each 6×6px `#ffeeb0` circles with 8px gold glow.
     - **Inner square** (shifted RIGHT for asymmetry — user-tuned spacing): wrapper `<div style={{position:'absolute', inset:0, transform:'translateX(22%)'}}>` containing:
       - The square: `top:18%, left:18%, width:64%, height:64%`, `border: 1px solid #ffeeb0`, `transform: rotate(15deg)`, opacity 0.7, `box-shadow: 0 0 6px rgba(255,215,0,0.33)`.
       - 4 midpoint dots at `(20%,30%), (80%,30%), (20%,70%), (80%,70%)` — each 3×3px `#ffd700` with 4px glow.
     - The earlier triangular accent was removed (was contributing to the diagonal feel).
   - **18 gold sparkles** at hand-picked positions (NOT modular math — the modular math created perceived diagonals):
     ```js
     [[12,10], [30,18], [48,8],  [66,14], [82,22],
      [8,32],  [22,42], [40,36], [58,30], [74,44], [90,36],
      [14,56], [32,64], [50,58], [68,70], [84,62],
      [22,78], [60,78]]
     ```
     Each: 3×3px circle, `background:#ffeeb0`, `box-shadow: 0 0 6px #ffd700, 0 0 12px rgba(255,215,0,0.6)`, pulsing animation (see `lbcSpark2` keyframes).
   - **18 tier-colored streaks** at hand-picked positions:
     ```js
     [[18,6],  [38,12], [56,4],  [72,16], [88,8],
      [4,26],  [26,36], [44,28], [62,38], [78,30], [96,38],
      [16,50], [34,60], [52,52], [70,60], [86,54],
      [10,76], [44,74]]
     ```
     Each: 2×4-7px (varying height), background = `tier.col` (Dream: `#ffd700`), opacity 0.7, `clipPath: polygon(50% 0, 100% 100%, 0 100%)` (downward triangle), 4px tier glow, same `lbcSpark2` pulse with staggered delay.
   - **Photo slot**: `top:9%, left:0, right:0, height:58%`. Photo renders behind the gold framework.
   - **Bottom fade**: `linear-gradient(to top, #000 38%, transparent)`, height 42%.
   - **Header**: top-left — overall number 50px (white, with `tier.glow` shadow), tier label `"DREAM LOBBY"` 9px in `tier.col` (`#ffd700`), logo 42px.
   - **Footer**: nick, gold gradient divider, 6-stat grid in tier color + white.

### Shield Silhouette (shared by GoatCard + TotwCard)

The shield clip-path used by all 4 frame layers in both cards:

```css
clip-path: polygon(
  47% 1%, 50% 4.2%, 53% 1%,
  91% 3%, 100% 11%,
  100% 86%, 86% 100%,
  14% 100%, 0 86%,
  0 11%, 9% 3%
);
```

This approximates the FIFA TOTY shield: top center notch + flared shoulders + bottom rounded point. Use it as-is — it was chosen to match the FIFA reference silhouettes.

### Helper components

- **`Photo`** — placeholder photo slot (in production: replace with the player image). Includes monogram letters (first 2 chars of nick) as faint watermark, generic head/shoulders silhouette, and `[ foto ]` corner label.
- **`Header`** — top-left header with overall number + tier label + logo, with two modes: `gold` (for GOAT) and `accent={col}` (for TOTW tiers). See `cards-fifa.jsx` for exact styling.
- **`Footer`** — bottom area with nick (centered, large) + horizontal gradient divider + 6-column stats grid.
- **`CrystalFan`** — radiating diamond-sliver fan, configurable origin point, angle range, length range, count, thickness, opacity.
- **`ConfettiRain`** — animated falling gold rhombus particles with drift + rotation.
- **`Sparkles`** — pulsing dots, accepts either `count` (modular distribution — only safe for visually busy contexts like GOAT) or `positions` (hand-picked array of `[xPct, yPct]` — use this for the Dream Lobby card).
- **`Corners`** — 4 L-shaped corner brackets.
- **`TopChevron`** — pair of downward-pointing gold chevron decorations at top center.
- **`GoldFramework`** — central geometric centerpiece for Dream Lobby (gem + offset wireframes + vertex dots).

## Interactions & Behavior

Cards are **static visual elements** in the prototype — no hover/click states implemented at the card level (clicks are handled by the parent grid in the site, e.g., opening a pack reveal).

**Animations** are continuous CSS keyframes that run for as long as the card is mounted:

```css
@keyframes lbcRain {
  0%   { transform: translate(0,0) rotate(0deg);     opacity: 0.95; }
  50%  { transform: translate(-6px, 18px) rotate(140deg); opacity: 1;    }
  100% { transform: translate(-14px, 40px) rotate(280deg); opacity: 0.25; }
}
.lbc-rain { animation: lbcRain 3.6s ease-in-out infinite; }

@keyframes lbcSpark2 {
  0%, 100% { opacity: 0.35; transform: scale(0.7); }
  50%      { opacity: 1;    transform: scale(1.25); }
}
.lbc-spark2 { animation: lbcSpark2 2.4s ease-in-out infinite; }

@keyframes lbcBolt {
  0%, 100% { opacity: 0.9;  filter: brightness(1);   }
  25%      { opacity: 1;    filter: brightness(1.35); }
  50%      { opacity: 0.55; filter: brightness(0.9);  }
  75%      { opacity: 1;    filter: brightness(1.5);  }
}
.lbc-bolt { animation: lbcBolt 2.8s ease-in-out infinite; }
```

Individual particles get **staggered `animation-delay`** based on their index so they don't all pulse in unison.

## State Management

These are pure presentation components. Inputs:

- `player: { nick, ov, stats, tags, photo? }` — player object (from your existing data model — see `components/data.jsx` for the reference shape).
- `tier: { id, name, short, lvl, col, glow, score, ... }` — tier definition (also in `data.jsx`).
- `S: number = 1` — optional scale multiplier. All dimensions are multiplied by `S` so the card can be rendered at any size. Pass `S={1.05}` for the "card of the week" hero, `S={0.85}` in compact grids.

No internal state.

## Design Tokens

### Gold palette (TOTY)

```js
const G = {
  hi:   '#ffeeb0',  // bright highlight
  mid:  '#ffd700',  // canonical gold
  lo:   '#9c7220',  // dark brassy
  deep: '#6b4a10',  // shadow gold
};
```

### Navy palette (GOAT bg)

```js
const NAVY = {
  c0: '#00041e',  // deepest blue (corners)
  c1: '#0c1d68',  // mid royal blue
  c2: '#040933',  // shadow blue
};
```

### Tier colors (existing — see `components/data.jsx`)

The 5 tiers each have `col`, `glow`, `score` colors used for accents, halos, and overall-number tints. The two custom cards use:

- **Dream Lobby**: `col: '#ffd700', glow: '#ffaa00', score: '#fff100'` — gold/amber palette aligns with TOTW informe.
- **GOAT**: `col: '#00d4ff', glow: '#00eeff', score: '#ffffff', gold: '#ffd700'` — note that in the GOAT shield, the gold border + accents come from the `G` palette above, not from `tier.col`. The cyan in `tier.col` is unused on the GOAT shield card (was used on the prior rectangular GOAT card).

### Typography

```js
const TOK = {
  fHud:  "'Chakra Petch', 'Segoe UI', sans-serif",     // labels, stat headers
  fNum:  "'Saira Condensed', 'Arial Black', Impact, sans-serif",  // overall, nick, stats
  fBody: "'Rajdhani', 'Segoe UI', sans-serif",         // body copy
};
```

Load Google Fonts:
- `Chakra Petch` — weights 400, 500, 600, 700
- `Saira Condensed` — weights 600, 700, 800, 900
- `Rajdhani` — weights 500, 600, 700

### Tier names (updated in this iteration)

```js
freezar.short = 'MELHOR FREEZAR'   // was 'FREEZAR'
bom.name      = 'BOM PLAYER'        // was 'BOM DE JOGO'
bom.short     = 'BOM PLAYER'        // was 'BOM'
dream.short   = 'DREAM LOBBY'       // was 'DREAM'
```

These changes affect labels everywhere `tier.short` or `tier.name` is read — make sure your codebase's tier definitions match.

## Assets

The cards use three image assets (see `assets/`):

- **`logo-fl1ip.png`** — the Lobbão/FL1IP brand mark, rendered top-left in both card headers at 42–46px width with a gold drop-shadow glow.
- **`smoke-red.png`** — large soft red smoke texture used for atmospheric backgrounds (page bg, headers, pack reveal). **Not directly used inside the new shield cards** but referenced by the surrounding system — keep it.
- **`paint-swoosh.png`** — white paint stroke texture used on the rectangular `PlayerCard` (Freezar/Bagre/Bom). **Not used inside the new shield cards** but referenced elsewhere — keep it.

If your codebase already has these (it should — they're existing brand assets), reuse those paths.

## Files

```
design_handoff_fifa_toty_cards/
├── README.md                              ← this file
├── components/
│   ├── cards-fifa.jsx                     ← source of truth: GoatCard, TotwCard, all helpers
│   └── data.jsx                           ← tier definitions, design tokens, player data shape
├── reference/
│   ├── Cartas FIFA TOTY.html              ← interactive showcase — open in browser to see live
│   ├── toty-goat-inspiration.png          ← FIFA TOTY reference the user pointed at
│   └── totw-dream-inspiration.png         ← FIFA Dream Lobby reference
└── assets/
    ├── logo-fl1ip.png
    ├── smoke-red.png
    └── paint-swoosh.png
```

### How to preview the showcase locally

The showcase HTML loads CDN React + Babel and references the JSX files via relative paths. To preview:

```bash
cd design_handoff_fifa_toty_cards/reference/
python3 -m http.server 8000
# open http://localhost:8000/Cartas%20FIFA%20TOTY.html
```

Note: the showcase HTML imports `../site/data.jsx`, `../site/shell.jsx`, `../site/card.jsx`, `../design-canvas.jsx`, and `cards-fifa.jsx` from the original prototype project structure — those paths won't resolve in the handoff folder. Use the showcase HTML in the original prototype project to preview cleanly, or just read `components/cards-fifa.jsx` directly — that's where the actual design lives.

## Tier routing — which card for which tier

In your codebase's card-rendering switch:

```jsx
function renderCard(player, tier) {
  if (tier.id === 'goat')  return <GoatCard player={player} fx="gildedV2" />;
  if (tier.id === 'dream') return <TotwCard player={player} t={tier} variant="v2" />;
  return <PlayerCard player={player} ov={player.ov} stats={player.stats} tags={player.tags} />;
}
```

`fx="gildedV2"` and `variant="v2"` are the final, user-approved variants. The `cards-fifa.jsx` file also contains earlier variants (`fx="royal"`, `fx="storm"`, `fx="gilded"`, `variant="v1"`) — these are dead code you can delete on import, or keep as easy A/B switches.
