// ═══════════════════════════════════════════════════════════
//  Lobbão Craft — 3 direções de PlayerCard (mockup hi-fi)
//  Direção A · Refino TOTW   |  B · CS2 Skin/Wear  |  C · Smoke Drop
// ═══════════════════════════════════════════════════════════

const STAT_LABELS = ['K/D', 'DAN', 'UTI', 'WIN', 'CLU', 'CON'];

// hue = quanto rotacionar a fumaça vermelha base p/ casar com o tier
const TIERS = {
  bagre: {
    name: 'BAGRE', range: '60–69', ov: 64, nick: 'ZICA',
    col: '#5588aa', glow: '#6699bb', score: '#c0dde8',
    bg: ['#070b12', '#152639', '#070b12'], hue: 200,
    wear: 'WELL-WORN', float: '0.41', rarity: 'MIL-SPEC',
    stats: [60, 65, 58, 70, 45, 62], lvl: 1,
  },
  dream: {
    name: 'DREAM LOBBY', range: '80–90', ov: 86, nick: 'BRUNAO',
    col: '#ffd700', glow: '#ffaa00', score: '#fff100',
    bg: ['#0e0800', '#5e3a00', '#0e0800'], hue: 35,
    wear: 'MINIMAL WEAR', float: '0.09', rarity: 'COVERT',
    stats: [87, 85, 83, 89, 48, 80], lvl: 3,
  },
  goat: {
    name: 'GOAT', range: '91–99', ov: 95, nick: 'FL1IP',
    col: '#00d4ff', glow: '#00eeff', score: '#ffffff', gold: '#ffd700',
    bg: ['#00041e', '#001575', '#00041e'], hue: 200,
    wear: 'FACTORY NEW', float: '0.03', rarity: '★ COVERT',
    stats: [96, 94, 92, 97, 88, 93], lvl: 4, special: true,
  },
};

const SMOKE = '../assets/smoke-red.png';
const PAINT = '../assets/paint-swoosh.png';
const LOGO  = '../assets/logo-fl1ip.png';

// ── fumaça tintável ────────────────────────────────────────
function Smoke({ hue = 0, opacity = 0.5, blend = 'screen', sat = 1.15, scale = '150%', drift = true, pos = '0% 0%' }) {
  return (
    <div className={drift ? 'lbc-smoke' : ''} style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `url(${SMOKE})`, backgroundSize: scale,
      backgroundPosition: pos,
      mixBlendMode: blend, filter: `hue-rotate(${hue}deg) saturate(${sat})`,
      opacity,
    }} />
  );
}

// ── pincelada branca ───────────────────────────────────────
function Paint({ style, opacity = 0.9, blur = 0 }) {
  return (
    <img src={PAINT} alt="" style={{
      position: 'absolute', pointerEvents: 'none', opacity,
      filter: blur ? `blur(${blur}px)` : 'none', ...style,
    }} />
  );
}

// ── placeholder de foto (silhueta + label) ─────────────────
function Photo({ inset = 0, tint = 'rgba(255,255,255,0.10)', grayscale = false }) {
  return (
    <div style={{ position: 'absolute', inset, overflow: 'hidden', filter: grayscale ? 'grayscale(0.4) brightness(0.85)' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 95% at 56% 26%, rgba(255,255,255,0.07), transparent 62%)' }} />
      <div style={{ position: 'absolute', left: '56%', bottom: '-2%', transform: 'translateX(-50%)', width: '62%', textAlign: 'center' }}>
        <div style={{ width: '46%', aspectRatio: '1', borderRadius: '50%', background: tint, margin: '0 auto' }} />
        <div style={{ width: '100%', height: '64px', marginTop: '7px', borderRadius: '46% 46% 0 0', background: tint }} />
      </div>
      <div style={{ position: 'absolute', top: 9, right: 11, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.32)' }}>[ foto ]</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DIREÇÃO A — REFINO TOTW
//  Mesma alma FIFA, smoke vermelho + pincelada + tipografia CS2
// ════════════════════════════════════════════════════════════
function CardRefino({ t, S = 1 }) {
  const W = 272 * S, H = 410 * S;
  const goat = t.special;
  const ringCol = goat ? t.gold : t.col;
  return (
    <div style={{ position: 'relative', width: W, height: H, filter: `drop-shadow(0 12px 30px rgba(0,0,0,0.6))` }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16 * S, overflow: 'hidden',
        background: `linear-gradient(165deg, ${t.bg[0]}, ${t.bg[1]}, ${t.bg[2]})`,
        border: `${(2 + t.lvl * 0.3).toFixed(1)}px solid ${t.col}`,
        boxShadow: `inset 0 0 60px rgba(0,0,0,0.7), 0 0 ${14 + t.lvl * 6}px ${t.glow}66`,
      }}>
        {/* smoke vermelho da live, levemente tintado ao tier */}
        <Smoke hue={t.hue} opacity={goat ? 0.42 : 0.5} blend="screen" pos="20% 10%" />
        <div style={{ position: 'absolute', inset: 0, height: '64%', background: `radial-gradient(110% 80% at 50% 0%, ${t.glow}2e, transparent 65%)` }} />

        {/* foto */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '63%' }}>
          <Photo grayscale={t.ov < 60} />
        </div>

        {/* pincelada branca canto sup. dir. */}
        <Paint style={{ top: -26 * S, right: -54 * S, width: 200 * S, transform: 'rotate(8deg)' }} opacity={0.16} />

        {/* shine sweep */}
        {t.lvl >= 2 && <div className="lbc-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.13) 50%, transparent 62%)' }} />}

        {/* header: overall + tier + logo */}
        <div style={{ position: 'absolute', top: 12 * S, left: 14 * S, lineHeight: 0.82 }}>
          <div style={{ fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 58 * S, color: t.score, textShadow: `0 2px 12px ${t.glow}99`, letterSpacing: -1 }}>{t.ov}</div>
          <div style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: 9 * S, letterSpacing: 2.2 * S, color: ringCol, marginTop: 3 * S, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t.name}</div>
          <img src={LOGO} alt="" style={{ width: 50 * S, marginTop: 7 * S, opacity: 0.95, filter: `drop-shadow(0 0 6px ${t.glow}66)` }} />
        </div>

        {/* fade p/ footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '46%', background: `linear-gradient(to top, ${t.bg[0]}f2 42%, transparent)` }} />

        {/* footer stats */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `0 ${14 * S}px ${14 * S}px` }}>
          <div style={{ fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 24 * S, color: '#fff', textAlign: 'center', letterSpacing: 1.5 * S, textShadow: `0 2px 10px ${t.glow}77` }}>{t.nick}</div>
          <div style={{ height: 2, margin: `${7 * S}px 0`, background: `linear-gradient(90deg, transparent, ${t.col}, transparent)` }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 * S }}>
            {t.stats.map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: 9 * S, color: t.col, opacity: 0.9, letterSpacing: 0.3 }}>{STAT_LABELS[i]}</div>
                <div style={{ fontFamily: 'Saira Condensed', fontWeight: 800, fontSize: 20 * S, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* anel interno pulsante (lvl alto) */}
      {t.lvl >= 3 && <div className="lbc-pulse" style={{ position: 'absolute', inset: 6 * S, borderRadius: 12 * S, border: `1px solid ${ringCol}88`, pointerEvents: 'none' }} />}
      {/* cantos ornamentais */}
      {t.lvl >= 3 && ['tl', 'tr', 'bl', 'br'].map(c => (
        <div key={c} style={{
          position: 'absolute', width: 16 * S, height: 16 * S,
          borderColor: ringCol, borderStyle: 'solid', borderWidth: 0,
          [c[0] === 't' ? 'top' : 'bottom']: 4 * S, [c[1] === 'l' ? 'left' : 'right']: 4 * S,
          ['border' + (c[0] === 't' ? 'Top' : 'Bottom') + (c[1] === 'l' ? 'Left' : 'Right') + 'Radius']: 11 * S,
          borderTopWidth: c[0] === 't' ? 2 : 0, borderBottomWidth: c[0] === 'b' ? 2 : 0,
          borderLeftWidth: c[1] === 'l' ? 2 : 0, borderRightWidth: c[1] === 'r' ? 2 : 0,
        }} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DIREÇÃO B — CS2 SKIN / WEAR
//  Item de inventário CS2: cantos chanfrados, float bar,
//  StatTrak counter, faixa de raridade diagonal
// ════════════════════════════════════════════════════════════
function CardSkin({ t, S = 1 }) {
  const W = 276 * S, H = 410 * S;
  const cut = 18 * S;
  const clip = `polygon(${cut}px 0, 100% 0, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, 0 100%, 0 ${cut}px)`;
  return (
    <div style={{ position: 'relative', width: W, height: H, filter: `drop-shadow(0 12px 28px rgba(0,0,0,0.6))` }}>
      {/* borda chanfrada (camada externa = cor do tier) */}
      <div style={{ position: 'absolute', inset: 0, clipPath: clip, background: `linear-gradient(140deg, ${t.col}, ${t.glow})`, boxShadow: `0 0 ${16 + t.lvl * 5}px ${t.glow}55` }} />
      <div style={{ position: 'absolute', inset: 2 * S, clipPath: clip, overflow: 'hidden', background: '#08090c' }}>
        {/* base + smoke vermelho (marca) */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 18%, #15171c, #08090c 70%)' }} />
        <Smoke hue={0} opacity={0.55} blend="screen" pos="40% 30%" />

        {/* grid técnico sutil */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.10, backgroundImage: `linear-gradient(${t.col}40 1px, transparent 1px), linear-gradient(90deg, ${t.col}40 1px, transparent 1px)`, backgroundSize: `${20 * S}px ${20 * S}px` }} />

        {/* top HUD bar */}
        <div style={{ position: 'absolute', top: 12 * S, left: 14 * S, right: 14 * S, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: 11 * S, letterSpacing: 1.5 * S, color: t.col, textShadow: `0 0 8px ${t.glow}99`, whiteSpace: 'nowrap' }}>{t.rarity}</div>
            <div style={{ fontFamily: 'Chakra Petch', fontWeight: 500, fontSize: 8 * S, letterSpacing: 1.5 * S, color: '#8a8f99', marginTop: 2, whiteSpace: 'nowrap' }}>{t.wear}</div>
          </div>
          {/* StatTrak counter */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Chakra Petch', fontWeight: 500, fontSize: 7 * S, letterSpacing: 1, color: '#c9a24a' }}>OVERALL</div>
            <div style={{ display: 'inline-flex', gap: 1, marginTop: 2 }}>
              {String(t.ov).padStart(2, '0').split('').map((d, i) => (
                <span key={i} style={{ fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 26 * S, color: t.score, background: 'rgba(0,0,0,0.55)', border: `1px solid ${t.col}55`, padding: `0 ${4 * S}px`, lineHeight: 1.05, textShadow: `0 0 10px ${t.glow}aa` }}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* foto */}
        <div style={{ position: 'absolute', top: '24%', left: 0, right: 0, height: '46%' }}>
          <Photo grayscale={t.ov < 60} />
        </div>

        {/* crosshair ticks nos cantos internos */}
        {['tl', 'tr', 'bl', 'br'].map(c => (
          <div key={c} style={{ position: 'absolute', [c[0] === 't' ? 'top' : 'bottom']: 40 * S, [c[1] === 'l' ? 'left' : 'right']: 12 * S, width: 9 * S, height: 9 * S, borderColor: `${t.col}aa`, borderStyle: 'solid', borderWidth: 0, borderTopWidth: c[0] === 't' ? 1.5 : 0, borderBottomWidth: c[0] === 'b' ? 1.5 : 0, borderLeftWidth: c[1] === 'l' ? 1.5 : 0, borderRightWidth: c[1] === 'r' ? 1.5 : 0 }} />
        ))}

        {/* float / wear bar */}
        <div style={{ position: 'absolute', left: 14 * S, right: 14 * S, bottom: 92 * S }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Chakra Petch', fontWeight: 500, fontSize: 7 * S, letterSpacing: 1, color: '#7d828c', marginBottom: 3 }}>
            <span>FLOAT</span><span style={{ color: t.col }}>{t.float}</span>
          </div>
          <div style={{ position: 'relative', height: 4 * S, borderRadius: 2, background: 'linear-gradient(90deg,#3aa655,#c8b13a,#c85a3a,#9a3030)' }}>
            <div style={{ position: 'absolute', top: -2 * S, bottom: -2 * S, left: `${parseFloat(t.float) * 100}%`, width: 2 * S, background: '#fff', boxShadow: '0 0 6px #fff' }} />
          </div>
        </div>

        {/* nick + faixa raridade diagonal */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ height: 6 * S, background: `linear-gradient(100deg, ${t.col} 0%, ${t.glow} 55%, ${t.col} 100%)`, transform: 'skewY(-1.2deg)', transformOrigin: 'left' }} />
          <div style={{ background: 'rgba(4,5,8,0.94)', padding: `${8 * S}px ${14 * S}px ${12 * S}px`, backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 22 * S, color: '#fff', letterSpacing: 1.5 * S, marginBottom: 6 * S }}>{t.nick}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>
              {t.stats.map((v, i) => (
                <div key={i} style={{ textAlign: 'center', borderRight: i < 5 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ fontFamily: 'Chakra Petch', fontWeight: 600, fontSize: 7.5 * S, color: t.col, letterSpacing: 0.4 }}>{STAT_LABELS[i]}</div>
                  <div style={{ fontFamily: 'Saira Condensed', fontWeight: 800, fontSize: 18 * S, color: '#fff' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* logo canto */}
      <img src={LOGO} alt="" style={{ position: 'absolute', top: 92 * S, left: 14 * S, width: 42 * S, opacity: 0.85, filter: 'drop-shadow(0 0 4px rgba(204,17,17,0.6))' }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DIREÇÃO C — SMOKE DROP
//  Pôster cinematográfico: fumaça densa + pincelada hero,
//  número gigante, faixa de stats translúcida
// ════════════════════════════════════════════════════════════
function CardSmoke({ t, S = 1 }) {
  const W = 274 * S, H = 412 * S;
  const goat = t.special;
  return (
    <div style={{ position: 'relative', width: W, height: H, filter: `drop-shadow(0 14px 32px rgba(0,0,0,0.65))` }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14 * S, overflow: 'hidden',
        background: `linear-gradient(180deg, #0a0606, ${t.bg[1]}55, #0a0606)`,
        border: `1.5px solid ${t.col}aa`,
        boxShadow: `inset 0 0 80px rgba(0,0,0,0.8), 0 0 ${18 + t.lvl * 5}px ${t.glow}44`,
      }}>
        {/* fumaça densa da marca (sempre vermelha) + halo do tier */}
        <Smoke hue={0} opacity={0.7} blend="screen" scale="170%" pos="30% 20%" />
        <Smoke hue={t.hue} opacity={0.3} blend="screen" scale="150%" pos="70% 80%" drift={false} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(90% 60% at 52% 40%, ${t.glow}22, transparent 70%)` }} />

        {/* foto hero */}
        <div style={{ position: 'absolute', top: '6%', left: 0, right: 0, height: '64%' }}>
          <Photo grayscale={t.ov < 60} />
        </div>

        {/* pincelada branca diagonal hero */}
        <Paint style={{ top: '49%', left: '-14%', width: '118%', transform: 'rotate(-8deg)' }} opacity={0.82} />
        <Paint style={{ top: '40%', left: '-8%', width: '104%', transform: 'rotate(-6deg)' }} opacity={0.13} blur={4} />

        {/* tier label vertical */}
        <div style={{ position: 'absolute', top: 16 * S, right: 12 * S, writingMode: 'vertical-rl', fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: 10 * S, letterSpacing: 4 * S, color: goat ? t.gold : t.col, textShadow: `0 0 10px ${t.glow}` }}>{t.name}</div>

        {/* logo topo esq */}
        <img src={LOGO} alt="" style={{ position: 'absolute', top: 13 * S, left: 14 * S, width: 52 * S, filter: `drop-shadow(0 0 7px ${t.glow}77)` }} />

        {/* número gigante sobrepondo */}
        <div style={{ position: 'absolute', left: 11 * S, bottom: 104 * S, fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 84 * S, lineHeight: 0.8, color: t.score, letterSpacing: -3, textShadow: `0 4px 24px ${t.glow}, 0 2px 4px rgba(0,0,0,0.7)` }}>{t.ov}</div>

        {/* faixa de stats translúcida */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(6,4,4,0.96), rgba(6,4,4,0.6))', backdropFilter: 'blur(10px)', borderTop: `1px solid ${t.col}55`, padding: `${9 * S}px ${14 * S}px ${13 * S}px` }}>
          <div style={{ fontFamily: 'Saira Condensed', fontWeight: 900, fontSize: 25 * S, color: '#fff', letterSpacing: 1.5 * S, marginBottom: 6 * S, textShadow: `0 2px 10px ${t.glow}66` }}>{t.nick}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
            {t.stats.map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Chakra Petch', fontWeight: 600, fontSize: 8 * S, color: t.col, letterSpacing: 0.3 }}>{STAT_LABELS[i]}</div>
                <div style={{ fontFamily: 'Saira Condensed', fontWeight: 800, fontSize: 19 * S, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* foil shine */}
        <div className="lbc-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.10) 50%, transparent 60%)' }} />
      </div>
    </div>
  );
}

Object.assign(window, { TIERS, CardRefino, CardSkin, CardSmoke });
