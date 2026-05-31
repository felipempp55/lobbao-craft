// ═══════════════════════════════════════════════════════════
//  Telas: Histórico + Atributos + Config
// ═══════════════════════════════════════════════════════════

const { TOK, TIERS, tierFor, ATTRS, TAGS, PLAYERS, SESSIONS,
        SmokeLayer, Panel, SectionLabel, Btn, Field, PlayerCard } = window;
const { useState } = React;

// ── HISTÓRICO ───────────────────────────────────────────────
function HistoryScreen() {
  const [open, setOpen] = useState(SESSIONS[0].id);
  const pOf = id => PLAYERS.find(p => p.id === id);
  return (
    <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '34px 30px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>ARQUIVO DE DOMINGOS</SectionLabel>
        <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 44, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1 }}>O <span style={{ color: TOK.R }}>HISTÓRICO</span></h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SESSIONS.map(s => {
          const isOpen = open === s.id;
          const ranked = [...s.cards].sort((a, b) => b.ov - a.ov);
          const top = ranked[0];
          return (
            <Panel key={s.id} style={{ overflow: 'hidden' }} accent={tierFor(top.ov).col}>
              <button onClick={() => setOpen(isOpen ? null : s.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 24, color: TOK.txt, letterSpacing: 0.5 }}>{s.date}</div>
                  <div style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 10.5, letterSpacing: 1.5, color: TOK.txt3, textTransform: 'uppercase', marginTop: 2 }}>{s.label} · {s.cards.length} cartas · top: {pOf(top.playerId).nick} ({top.ov})</div>
                </div>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 18, color: TOK.R, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>▸</div>
              </button>
              {isOpen && (
                <div style={{ padding: '0 22px 26px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 22, justifyItems: 'center', paddingTop: 8 }}>
                    {ranked.map((c, i) => (
                      <div key={c.playerId} className="lbc-pop" style={{ animationDelay: `${i * 0.05}s` }}>
                        <PlayerCard player={pOf(c.playerId)} ov={c.ov} stats={c.stats} tags={c.tags} S={0.74} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ── ATRIBUTOS ───────────────────────────────────────────────
function AttrsScreen() {
  const total = ATTRS.reduce((s, a) => s + a.weight, 0);
  return (
    <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '34px 30px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>FÓRMULA DO OVERALL</SectionLabel>
        <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 44, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1 }}>OS <span style={{ color: TOK.R }}>ATRIBUTOS</span></h1>
        <div style={{ fontFamily: TOK.fBody, fontSize: 15, color: TOK.txt2, marginTop: 8, maxWidth: 560 }}>Cada atributo pesa diferente no overall. A soma dos pesos é {total}%. Ajuste como o Lobbão valoriza cada skill.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {ATTRS.map(a => (
          <Panel key={a.id} style={{ padding: '20px 22px' }} accent={TOK.R}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 22, color: TOK.txt, letterSpacing: 0.5 }}>{a.name}</div>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 10, letterSpacing: 2, color: TOK.txt3, textTransform: 'uppercase', marginTop: 2 }}>SIGLA · {a.short}</div>
              </div>
              <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 34, color: TOK.R, textShadow: `0 0 12px ${TOK.R}55` }}>{a.weight}%</div>
            </div>
            <div style={{ height: 6, marginTop: 14, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(a.weight / 25) * 100}%`, background: `linear-gradient(90deg, ${TOK.R}, #ff6644)`, borderRadius: 3 }} />
            </div>
          </Panel>
        ))}
      </div>

      {/* tags reference */}
      <SectionLabel style={{ margin: '34px 0 14px' }}>TAGS DE ESTILO · MULTIPLICADORES</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {TAGS.map(tg => {
          const col = tg.pol === '+' ? TOK.ok : TOK.err;
          return (
            <Panel key={tg.id} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 22, color: col, width: 30 }}>{tg.pol}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 17, color: TOK.txt }}>{tg.name}</div>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 600, fontSize: 9.5, letterSpacing: 1.5, color: TOK.txt3 }}>×{tg.mult}</div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

// ── CONFIG ──────────────────────────────────────────────────
function ConfigScreen({ onLogout }) {
  return (
    <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '34px 30px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>PREFERÊNCIAS DA LIVE</SectionLabel>
        <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 44, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1 }}>CONFIG</h1>
      </div>

      <Panel style={{ padding: '24px 26px', marginBottom: 16 }}>
        <SectionLabel style={{ marginBottom: 16 }}>IDENTIDADE</SectionLabel>
        <Field label="Nome da live" value="FL1IP" onChange={() => {}} style={{ marginBottom: 16 }} />
        <Field label="Horário da live" value="Todos os dias às 20h" onChange={() => {}} style={{ marginBottom: 16 }} />
        <Field label="Dia do ranking" value="Domingo" onChange={() => {}} />
      </Panel>

      <Panel style={{ padding: '24px 26px', marginBottom: 16 }}>
        <SectionLabel style={{ marginBottom: 16 }}>EXPORTAR</SectionLabel>
        <div style={{ fontFamily: TOK.fBody, fontSize: 14, color: TOK.txt2, marginBottom: 16 }}>Gere as cartas da semana em formato pronto pra mandar no grupo do WhatsApp.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn v="ghost">↓ BAIXAR CARTAS (PNG)</Btn>
          <Btn v="ghost">⧉ COPIAR RANKING</Btn>
        </div>
      </Panel>

      <Panel style={{ padding: '24px 26px' }}>
        <SectionLabel style={{ marginBottom: 16 }} col={TOK.err}>ZONA DE PERIGO</SectionLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn v="danger">⟲ RESETAR SEMANA</Btn>
          <Btn v="danger" onClick={onLogout}>↗ SAIR DA CONTA</Btn>
        </div>
      </Panel>
    </div>
  );
}

Object.assign(window, { HistoryScreen, AttrsScreen, ConfigScreen });
