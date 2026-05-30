// ═══════════════════════════════════════════════════════════
//  Shell: Background, Header, Nav, Panel, Btn, Field, etc.
// ═══════════════════════════════════════════════════════════

const { TOK, SMOKE, PAINT, LOGO } = window;

// ── camada de fumaça reutilizável ───────────────────────────
function SmokeLayer({ hue = 0, opacity = 0.5, blend = 'screen', sat = 1.15, scale = '140%', pos = '20% 10%', drift = true, style = {} }) {
  return (
    <div className={drift ? 'lbc-smoke' : ''} style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `url(${SMOKE})`, backgroundSize: scale, backgroundPosition: pos,
      mixBlendMode: blend, filter: `hue-rotate(${hue}deg) saturate(${sat})`,
      opacity, ...style,
    }} />
  );
}

// ── pincelada branca ────────────────────────────────────────
function PaintSwoosh({ style = {}, opacity = 0.9, blur = 0 }) {
  return <img src={PAINT} alt="" style={{ position: 'absolute', pointerEvents: 'none', opacity, filter: blur ? `blur(${blur}px)` : 'none', ...style }} />;
}

// ── fundo da página (sutil, sempre presente) ────────────────
function PageBg() {
  const defaultBg = `radial-gradient(120% 80% at 50% -10%, #2a0808, ${TOK.bg} 55%, ${TOK.bgDeep} 100%)`;
  const defaultCorner = 'radial-gradient(circle at 0% 100%, rgba(0,180,220,0.06), transparent 60%)';
  return (
    <div className="lbc-page-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: `var(--lbc-page-bg, ${defaultBg})`, transition: 'background .6s ease' }} />
      <SmokeLayer opacity={0.32} scale="80%" pos="30% 20%" />
      <SmokeLayer opacity={0.22} scale="120%" pos="70% 80%" drift={false} style={{ animationDelay: '-7s' }} />
      {/* corner whisper */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '40%', height: '40%', background: `var(--lbc-page-corner, ${defaultCorner})`, transition: 'background .6s ease' }} />
      {/* vibe accent overlay (off by default) */}
      <div style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen', background: 'var(--lbc-vibe-overlay, transparent)', transition: 'background .6s ease' }} />
    </div>
  );
}

// ── Header ──────────────────────────────────────────────────
function Header({ onLogout }) {
  return (
    <header style={{ position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${TOK.borderTop}` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0e0404, #1a0606 55%, #0e0404)' }} />
      <SmokeLayer opacity={0.5} scale="60%" pos="10% 20%" />
      <SmokeLayer opacity={0.35} scale="100%" pos="80% 80%" drift={false} />
      <PaintSwoosh style={{ top: -20, right: -60, width: 360, transform: 'rotate(8deg)' }} opacity={0.10} />
      <PaintSwoosh style={{ bottom: -40, left: -40, width: 240, transform: 'rotate(-12deg) scaleX(-1)' }} opacity={0.08} />
      {/* red glow corner */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(204,17,17,0.35), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 26, padding: '18px 30px' }}>
        <img src={LOGO} alt="FL1IP" style={{ height: 56, filter: 'drop-shadow(0 0 12px rgba(204,17,17,0.7))' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 30, letterSpacing: 3, lineHeight: 1, background: `linear-gradient(90deg, ${TOK.R}, #ff6644 45%, #ffffff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>LOBBÃO CRAFT</div>
          <div style={{ fontFamily: TOK.fHud, fontWeight: 500, fontSize: 10, letterSpacing: 3, color: TOK.txt3, marginTop: 4 }}>RANKING SEMANAL · CS2 · LIVE TODOS OS DIAS ÀS 20H</div>
        </div>
        {onLogout && (
          <button onClick={onLogout} style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 11, letterSpacing: 2, color: TOK.txt2, background: 'rgba(0,0,0,0.4)', border: `1px solid ${TOK.border}`, padding: '8px 14px', cursor: 'pointer', textTransform: 'uppercase' }} onMouseDown={e => e.currentTarget.style.background = TOK.RD}>SAIR ↗</button>
        )}
      </div>
      {/* linha vermelha animada inferior */}
      <div className="lbc-hdr-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${TOK.R} 30%, ${TOK.RG} 50%, ${TOK.R} 70%, transparent)`, backgroundSize: '200% 100%' }} />
    </header>
  );
}

// ── Nav (tabs) ──────────────────────────────────────────────
const TABS = [
  { id: 'home',     label: 'HOME',       icon: '◆' },
  { id: 'players',  label: 'JOGADORES',  icon: '☰' },
  { id: 'attrs',    label: 'ATRIBUTOS',  icon: '◇' },
  { id: 'sunday',   label: 'DOMINGO',    icon: '▲' },
  { id: 'hist',     label: 'HISTÓRICO',  icon: '◉' },
  { id: 'config',   label: 'CONFIG',     icon: '⚙' },
];

function Nav({ active, onChange }) {
  return (
    <nav style={{ position: 'relative', background: 'rgba(10,4,4,0.92)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${TOK.border}` }}>
      <div style={{ display: 'flex', gap: 0, padding: '0 22px', overflowX: 'auto' }}>
        {TABS.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: TOK.fHud, fontWeight: 700, fontSize: 11.5, letterSpacing: 2.4,
              color: isActive ? TOK.R : TOK.txt3, transition: 'color .15s',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = TOK.txt2; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = TOK.txt3; }}>
              <span style={{ fontSize: 13, opacity: 0.8 }}>{t.icon}</span>{t.label}
              {isActive && <span style={{ position: 'absolute', left: 14, right: 14, bottom: 0, height: 2, background: TOK.R, boxShadow: `0 0 10px ${TOK.R}` }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── Panel (glass) ───────────────────────────────────────────
function Panel({ children, style = {}, accent }) {
  return (
    <div style={{ position: 'relative', background: TOK.bgPanel, backdropFilter: 'blur(14px)', border: `1px solid ${TOK.border}`, borderTopColor: TOK.borderTop, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', ...style }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent }} />}
      {children}
    </div>
  );
}

// ── SectionLabel ────────────────────────────────────────────
function SectionLabel({ children, col = TOK.R, style = {} }) {
  return <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 10.5, letterSpacing: 2.5, color: col, textTransform: 'uppercase', ...style }}>{children}</div>;
}

// ── Btn ─────────────────────────────────────────────────────
function Btn({ children, onClick, v = 'primary', size = 'md', style = {}, type = 'button' }) {
  const sizes = { xs: { p: '6px 10px', f: 11 }, sm: { p: '8px 14px', f: 12 }, md: { p: '11px 22px', f: 13.5 }, lg: { p: '14px 28px', f: 15 } }[size];
  const variants = {
    primary: { bg: `linear-gradient(180deg, ${TOK.R}, ${TOK.RG})`, c: '#fff', b: `1px solid ${TOK.RG}` },
    success: { bg: 'linear-gradient(180deg, #2a9a55, #1f7a40)', c: '#fff', b: '1px solid #1f7a40' },
    danger:  { bg: 'rgba(204,17,17,0.18)', c: TOK.R, b: `1px solid ${TOK.R}55` },
    ghost:   { bg: 'transparent', c: TOK.txt2, b: `1px solid ${TOK.border}` },
  }[v];
  return (
    <button type={type} onClick={onClick} style={{
      fontFamily: TOK.fHud, fontWeight: 700, fontSize: sizes.f, letterSpacing: 1.6,
      padding: sizes.p, background: variants.bg, color: variants.c, border: variants.b,
      cursor: 'pointer', textTransform: 'uppercase', transition: 'filter .15s, transform .15s',
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.18)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}>{children}</button>
  );
}

// ── Field ───────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <label style={{ display: 'block', ...style }}>
      <div style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 10.5, letterSpacing: 1.8, color: TOK.txt3, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <input type={type} value={value || ''} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px', fontFamily: TOK.fBody, fontSize: 14, color: TOK.txt, background: TOK.bgInput, border: `1px solid ${TOK.border}`, outline: 'none', transition: 'border .15s, box-shadow .15s', boxSizing: 'border-box' }}
        onFocus={e => { e.currentTarget.style.borderColor = TOK.R; e.currentTarget.style.boxShadow = `0 0 0 3px ${TOK.RD}`; }}
        onBlur={e => { e.currentTarget.style.borderColor = TOK.border; e.currentTarget.style.boxShadow = 'none'; }} />
    </label>
  );
}

// ── Stat number (HUD) ───────────────────────────────────────
function StatHud({ value, label, col = TOK.R }) {
  return (
    <Panel style={{ padding: '18px 18px 14px' }} accent={col}>
      <SectionLabel col={col} style={{ marginBottom: 6 }}>{label}</SectionLabel>
      <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 38, color: TOK.txt, lineHeight: 1, letterSpacing: -1, textShadow: `0 0 14px ${col}55` }}>{value}</div>
    </Panel>
  );
}

Object.assign(window, { SmokeLayer, PaintSwoosh, PageBg, Header, Nav, Panel, SectionLabel, Btn, Field, StatHud, TABS });
