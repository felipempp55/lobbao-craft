// ═══════════════════════════════════════════════════════════
//  Telas: Login + Home
// ═══════════════════════════════════════════════════════════

const { TOK, TIERS, tierFor, ATTRS, TAGS, PLAYERS, SESSIONS,
        SMOKE, PAINT, LOGO,
        SmokeLayer, PaintSwoosh, PageBg, Panel, SectionLabel, Btn, Field,
        StatHud, PlayerCard } = window;
const { useState } = React;

// ── LOGIN ───────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('');
  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: `radial-gradient(120% 80% at 50% -10%, #2a0808, ${TOK.bg} 55%, ${TOK.bgDeep} 100%)` }}>
      <SmokeLayer opacity={0.5} scale="90%" pos="20% 30%" />
      <SmokeLayer opacity={0.35} scale="140%" pos="80% 70%" drift={false} />
      <PaintSwoosh style={{ top: '12%', left: '-12%', width: 560, transform: 'rotate(-6deg)' }} opacity={0.10} />
      <PaintSwoosh style={{ bottom: '6%', right: '-14%', width: 620, transform: 'rotate(7deg) scaleX(-1)' }} opacity={0.08} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '40%', height: '45%', background: 'radial-gradient(circle at 0% 100%, rgba(0,180,220,0.08), transparent 60%)' }} />

      <Panel style={{ position: 'relative', width: 380, padding: '44px 40px 38px', textAlign: 'center', overflow: 'hidden' }}>
        <SmokeLayer opacity={0.3} scale="120%" pos="50% 0%" />
        <div style={{ position: 'relative' }}>
          <img src={LOGO} alt="FL1IP" style={{ height: 80, filter: 'drop-shadow(0 0 18px rgba(204,17,17,0.8))' }} />
          <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 34, letterSpacing: 3, marginTop: 14, whiteSpace: 'nowrap', background: `linear-gradient(90deg, ${TOK.R}, #ff6644 50%, #fff)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LOBBÃO CRAFT</div>
          <div style={{ fontFamily: TOK.fHud, fontWeight: 500, fontSize: 10, letterSpacing: 3, color: TOK.txt3, marginTop: 8, marginBottom: 30 }}>ACESSO RESTRITO · ADMIN DA LIVE</div>
          <Field label="Senha do Lobbão" type="password" value={pw} onChange={setPw} placeholder="••••••••" style={{ textAlign: 'left', marginBottom: 22 }} />
          <Btn size="lg" style={{ width: '100%' }} onClick={onLogin}>ENTRAR NO LOBBY ▸</Btn>
          <div style={{ fontFamily: TOK.fBody, fontSize: 12, color: TOK.txt4, marginTop: 20 }}>Toda semana tem ranking novo. Bora?</div>
        </div>
      </Panel>
    </div>
  );
}

// ── HOME ────────────────────────────────────────────────────
function HomeScreen({ onGoSunday }) {
  const last = SESSIONS[0];
  const ranked = [...last.cards].sort((a, b) => b.ov - a.ov);
  const pOf = id => PLAYERS.find(p => p.id === id);
  const top = ranked[0];
  const tierCount = TIERS.map(t => ({ t, n: last.cards.filter(c => tierFor(c.ov).id === t.id).length }));
  const avg = Math.round(last.cards.reduce((s, c) => s + c.ov, 0) / last.cards.length);

  return (
    <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '34px 30px 70px' }}>
      {/* hero */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div>
          <SectionLabel>RANKING DA SEMANA · {last.date}</SectionLabel>
          <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 52, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1, lineHeight: 1 }}>O LOBBÃO <span style={{ color: TOK.R }}>FALOU.</span></h1>
          <div style={{ fontFamily: TOK.fBody, fontSize: 16, color: TOK.txt2, marginTop: 8 }}>{last.cards.length} cartas reveladas no último domingo. Confere quem mandou bem (e quem freezou).</div>
        </div>
        <Btn size="lg" onClick={onGoSunday}>▲ AVALIAR DOMINGO</Btn>
      </div>

      {/* stat HUD row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        <StatHud label="JOGADORES" value={last.cards.length} col={TOK.R} />
        <StatHud label="MÉDIA GERAL" value={avg} col="#33bb55" />
        <StatHud label="MAIOR OVERALL" value={top.ov} col={tierFor(top.ov).col} />
        <StatHud label="DOMINGOS" value={SESSIONS.length} col="#ffd700" />
      </div>

      {/* destaque: carta do top + pódio */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 30, alignItems: 'start' }}>
        <div>
          <SectionLabel style={{ marginBottom: 14 }}>★ CARTA DA SEMANA</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PlayerCard player={pOf(top.playerId)} ov={top.ov} stats={top.stats} tags={top.tags} S={1.05} />
          </div>
        </div>

        <div>
          <SectionLabel style={{ marginBottom: 14 }}>CLASSIFICAÇÃO COMPLETA</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranked.map((c, i) => {
              const p = pOf(c.playerId), t = tierFor(c.ov);
              return (
                <Panel key={c.playerId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px' }} accent={t.col}>
                  <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 22, color: TOK.txt3, width: 30 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 20, color: TOK.txt, letterSpacing: 0.5 }}>{p.nick}</div>
                    <div style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 9.5, letterSpacing: 2, color: t.col, textTransform: 'uppercase' }}>{t.short}</div>
                  </div>
                  {/* mini stat bars */}
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 26 }}>
                    {c.stats.map((v, j) => (
                      <div key={j} title={ATTRS[j].name} style={{ width: 5, height: `${v}%`, background: `linear-gradient(${t.glow}, ${t.col})`, opacity: 0.85, borderRadius: 1 }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 32, color: t.score, width: 52, textAlign: 'right', textShadow: `0 0 12px ${t.glow}66` }}>{c.ov}</div>
                </Panel>
              );
            })}
          </div>
        </div>
      </div>

      {/* distribuição por tier */}
      <div style={{ marginTop: 36 }}>
        <SectionLabel style={{ marginBottom: 14 }}>DISTRIBUIÇÃO POR TIER</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {tierCount.map(({ t, n }) => (
            <Panel key={t.id} style={{ padding: '16px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${t.col}18, transparent)` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 40, color: t.score, textShadow: `0 0 14px ${t.glow}66` }}>{n}</div>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 9.5, letterSpacing: 1.5, color: t.col, marginTop: 2, textTransform: 'uppercase' }}>{t.short}</div>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 500, fontSize: 8.5, letterSpacing: 1, color: TOK.txt4, marginTop: 3 }}>{t.min}–{t.max}</div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen });
