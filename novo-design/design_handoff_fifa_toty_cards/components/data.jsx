// ═══════════════════════════════════════════════════════════
//  Lobbão Craft — Mock data + tokens
// ═══════════════════════════════════════════════════════════

// — paths
const ASSETS = '../assets/';
const SMOKE  = ASSETS + 'smoke-red.png';
const PAINT  = ASSETS + 'paint-swoosh.png';
const LOGO   = ASSETS + 'logo-fl1ip.png';

// — tokens (cor + tipo)
const TOK = {
  bg:       '#16110f',
  bgDeep:   '#0a0606',
  bgPanel:  'rgba(255,255,255,0.055)',
  bgInput:  'rgba(15,4,4,0.85)',
  R:        '#cc1111',   // brand red
  RG:       '#dd1100',
  RD:       'rgba(204,17,17,0.15)',
  border:   'rgba(255,255,255,0.13)',
  borderTop:'rgba(255,120,120,0.18)',
  txt:      '#f0e8e8',
  txt2:     '#c09090',
  txt3:     '#907070',
  txt4:     '#806060',
  ok:       '#44dd88',
  err:      '#ff7755',
  warn:     '#ff8844',
  fHud:     "'Chakra Petch', 'Segoe UI', sans-serif",
  fNum:     "'Saira Condensed', 'Arial Black', Impact, sans-serif",
  fBody:    "'Rajdhani', 'Segoe UI', sans-serif",
};

// — 5 tiers (DESIGN.md §3.2)
const TIERS = [
  { id:'freezar', name:'MELHOR FREEZAR', short:'MELHOR FREEZAR',
    min:0, max:59, lvl:0, hue:0,
    col:'#882222', glow:'#cc2222', score:'#ffaaaa',
    bg:['#120000','#3d0808','#120000'] },
  { id:'bagre',   name:'BAGRE', short:'BAGRE',
    min:60, max:69, lvl:1, hue:200,
    col:'#5588aa', glow:'#6699bb', score:'#c0dde8',
    bg:['#060a10','#162840','#060a10'] },
  { id:'bom',     name:'BOM PLAYER', short:'BOM PLAYER',
    min:70, max:79, lvl:2, hue:120,
    col:'#33bb55', glow:'#44cc66', score:'#ccffdd',
    bg:['#021206','#0d3016','#021206'] },
  { id:'dream',   name:'DREAM LOBBY', short:'DREAM LOBBY',
    min:80, max:90, lvl:3, hue:35,
    col:'#ffd700', glow:'#ffaa00', score:'#fff100',
    bg:['#0e0800','#5e3a00','#0e0800'] },
  { id:'goat',    name:'GOAT', short:'GOAT',
    min:91, max:99, lvl:4, hue:200, special:true,
    col:'#00d4ff', glow:'#00eeff', score:'#ffffff', gold:'#ffd700',
    bg:['#00041e','#001575','#00041e'] },
];
const tierFor = ov => TIERS.find(t => ov >= t.min && ov <= t.max) || TIERS[0];

// — atributos
const ATTRS = [
  { id:'kd',  name:'Mira',          short:'K/D', weight:22 },
  { id:'dan', name:'Dano',          short:'DAN', weight:18 },
  { id:'uti', name:'Utility',       short:'UTI', weight:16 },
  { id:'win', name:'Vitórias',      short:'WIN', weight:18 },
  { id:'clu', name:'Clutch',        short:'CLU', weight:14 },
  { id:'con', name:'Consistência',  short:'CON', weight:12 },
];

// — playstyle tags (DESIGN.md §5.6)
const TAGS = [
  { id:'baiter',  name:'Baiter',       pol:'-', mult:0.9, label:'BAITER' },
  { id:'tilt',    name:'Tiltado',      pol:'-', mult:0.9, label:'TILTADO' },
  { id:'mute',    name:'Mutadinho',    pol:'-', mult:0.9, label:'MUTE' },
  { id:'vibes',   name:'Good Vibes',   pol:'+', mult:1.1, label:'VIBES' },
  { id:'esf',     name:'Esforçado',    pol:'+', mult:1.1, label:'ESF.' },
  { id:'deagle',  name:'Desert Eagle', pol:'+', mult:1.1, label:'DEAGLE' },
];

// — jogadores
const PLAYERS = [
  { id:'p1', nick:'FL1IP',   ov:95, stats:[97,94,92,98,88,93], tags:['vibes','deagle'] },
  { id:'p2', nick:'KENZIM',  ov:88, stats:[92,86,84,90,82,86], tags:['esf'] },
  { id:'p3', nick:'BRUNAO',  ov:86, stats:[87,85,83,89,80,82], tags:['vibes','esf'] },
  { id:'p4', nick:'GABS',    ov:76, stats:[78,74,80,72,70,75], tags:['esf'] },
  { id:'p5', nick:'TINHO',   ov:72, stats:[75,70,72,74,68,69], tags:[] },
  { id:'p6', nick:'NEGUIM',  ov:67, stats:[64,68,72,66,60,65], tags:['baiter'] },
  { id:'p7', nick:'ZICA',    ov:64, stats:[60,65,58,70,55,62], tags:['tilt'] },
  { id:'p8', nick:'MUTADO',  ov:52, stats:[48,52,60,46,40,55], tags:['mute','tilt'] },
];

// — sessões
const SESSIONS = [
  { id:'s2', date:'25 maio 2026', label:'Domingo passado',
    cards: PLAYERS.slice(0,7).map(p => ({ playerId:p.id, ov:p.ov, stats:p.stats, tags:p.tags })) },
  { id:'s1', date:'18 maio 2026', label:'Há 2 domingos',
    cards: [
      { playerId:'p1', ov:93, stats:[95,92,90,96,86,90], tags:['vibes'] },
      { playerId:'p2', ov:85, stats:[88,84,82,86,80,84], tags:['esf'] },
      { playerId:'p3', ov:83, stats:[85,82,80,86,78,80], tags:['vibes'] },
      { playerId:'p4', ov:74, stats:[76,72,78,70,68,73], tags:[] },
      { playerId:'p7', ov:62, stats:[58,62,56,68,52,60], tags:['tilt','baiter'] },
      { playerId:'p8', ov:48, stats:[44,48,55,42,38,52], tags:['mute'] },
    ] },
];

// — calculadora (DESIGN.md §9)
const calc = (sc, at = ATTRS) => {
  let t = 0, w = 0;
  at.forEach(a => {
    if (sc[a.id] !== undefined) {
      t += (sc[a.id] / 100) * (a.weight / 100);
      w += a.weight;
    }
  });
  return w ? Math.min(99, Math.round((t * 100 / w) * 99)) : 0;
};

const applyMult = (ov, tagIds) => {
  let pos = 0, neg = 0;
  tagIds.forEach(id => {
    const t = TAGS.find(x => x.id === id);
    if (!t) return;
    if (t.pol === '+') pos++; else neg++;
  });
  const m = pos > neg ? 1.1 : neg > pos ? 0.9 : 1.0;
  return Math.min(99, Math.round(ov * m));
};

Object.assign(window, {
  TOK, TIERS, tierFor, ATTRS, TAGS, PLAYERS, SESSIONS, calc, applyMult,
  ASSETS, SMOKE, PAINT, LOGO,
});
