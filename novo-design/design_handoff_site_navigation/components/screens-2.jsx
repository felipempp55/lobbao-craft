// ═══════════════════════════════════════════════════════════
//  Telas: Domingo (avaliação) + Jogadores
// ═══════════════════════════════════════════════════════════

const { TOK, TIERS, tierFor, ATTRS, TAGS, PLAYERS, SESSIONS,
        SmokeLayer, PaintSwoosh, Panel, SectionLabel, Btn, Field,
        PlayerCard, PackOpening, applyMult } = window;
const { useState, useMemo } = React;

// ── slider de atributo (HUD style) ─────────────────────────
function AttrSlider({ attr, value, onChange }) {
  const t = tierFor(value);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 12.5, letterSpacing: 1, color: TOK.txt, textTransform: 'uppercase' }}>
          {attr.name} <span style={{ color: TOK.txt4, fontSize: 10 }}>· peso {attr.weight}</span>
        </div>
        <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 26, color: t.score, textShadow: `0 0 10px ${t.glow}55`, minWidth: 44, textAlign: 'right' }}>{value}</div>
      </div>
      <input type="range" min="0" max="99" value={value} onChange={e => onChange(+e.target.value)}
        className="lbc-range" style={{ '--p': `${value}%`, '--c': t.col }} />
    </div>
  );
}

// ── DOMINGO ─────────────────────────────────────────────────
function SundayScreen() {
  const [pid, setPid] = useState(PLAYERS[0].id);
  const player = PLAYERS.find(p => p.id === pid);
  const [sc, setSc] = useState(() => Object.fromEntries(ATTRS.map((a, i) => [a.id, player.stats[i]])));
  const [tags, setTags] = useState(player.tags || []);
  const [reveal, setReveal] = useState(null);

  // recalcula ao trocar de jogador
  const selectPlayer = id => {
    const p = PLAYERS.find(x => x.id === id);
    setPid(id);
    setSc(Object.fromEntries(ATTRS.map((a, i) => [a.id, p.stats[i]])));
    setTags(p.tags || []);
  };

  const baseOv = useMemo(() => {
    let t = 0, w = 0;
    ATTRS.forEach(a => { t += (sc[a.id] / 100) * a.weight; w += a.weight; });
    return Math.min(99, Math.round((t / w) * 99));
  }, [sc]);
  const finalOv = applyMult(baseOv, tags);
  const stats = ATTRS.map(a => sc[a.id]);
  const t = tierFor(finalOv);

  const toggleTag = id => setTags(ts => ts.includes(id) ? ts.filter(x => x !== id) : [...ts, id]);

  return (
    <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '34px 30px 70px' }}>
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>AVALIAÇÃO DE DOMINGO · 25 MAIO 2026</SectionLabel>
        <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 44, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1 }}>MONTAR A <span style={{ color: TOK.R }}>CARTA</span></h1>
      </div>

      {/* seletor de jogador */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 26 }}>
        {PLAYERS.map(p => (
          <button key={p.id} onClick={() => selectPlayer(p.id)} style={{
            fontFamily: TOK.fHud, fontWeight: 700, fontSize: 12, letterSpacing: 1, padding: '9px 16px',
            background: p.id === pid ? `linear-gradient(180deg, ${TOK.R}, ${TOK.RG})` : 'rgba(255,255,255,0.05)',
            color: p.id === pid ? '#fff' : TOK.txt2, border: `1px solid ${p.id === pid ? TOK.RG : TOK.border}`,
            cursor: 'pointer', textTransform: 'uppercase', transition: 'all .15s',
          }}>{p.nick}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 36, alignItems: 'start' }}>
        {/* coluna sliders */}
        <div>
          <Panel style={{ padding: '24px 26px', marginBottom: 20 }}>
            <SectionLabel style={{ marginBottom: 18 }}>ATRIBUTOS</SectionLabel>
            {ATTRS.map(a => <AttrSlider key={a.id} attr={a} value={sc[a.id]} onChange={v => setSc(s => ({ ...s, [a.id]: v }))} />)}
          </Panel>

          <Panel style={{ padding: '20px 26px' }}>
            <SectionLabel style={{ marginBottom: 14 }}>TAGS DE ESTILO <span style={{ color: TOK.txt4, fontWeight: 500 }}>· ajustam o multiplicador</span></SectionLabel>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {TAGS.map(tg => {
                const on = tags.includes(tg.id);
                const col = tg.pol === '+' ? '#33bb55' : TOK.err;
                return (
                  <button key={tg.id} onClick={() => toggleTag(tg.id)} style={{
                    fontFamily: TOK.fHud, fontWeight: 700, fontSize: 11.5, letterSpacing: 1, padding: '8px 14px',
                    background: on ? `${col}22` : 'rgba(255,255,255,0.04)',
                    color: on ? col : TOK.txt3, border: `1px solid ${on ? col : TOK.border}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s',
                  }}>
                    <span style={{ fontSize: 13 }}>{tg.pol}</span>{tg.name}
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* coluna preview ao vivo */}
        <div style={{ position: 'sticky', top: 20 }}>
          <SectionLabel style={{ marginBottom: 14, textAlign: 'center' }}>PREVIEW AO VIVO</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <PlayerCard player={player} ov={finalOv} stats={stats} tags={tags} S={1.0} />
          </div>
          {/* breakdown */}
          <Panel style={{ padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: TOK.fBody, fontSize: 13, color: TOK.txt2, marginBottom: 6 }}>
              <span>Overall base</span><span style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 16, color: TOK.txt }}>{baseOv}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: TOK.fBody, fontSize: 13, color: TOK.txt2 }}>
              <span>Multiplicador tags</span><span style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 16, color: finalOv > baseOv ? TOK.ok : finalOv < baseOv ? TOK.err : TOK.txt3 }}>×{(finalOv / (baseOv || 1)).toFixed(2)}</span>
            </div>
          </Panel>
          <Btn v="success" size="lg" style={{ width: '100%' }} onClick={() => setReveal({ player, ov: finalOv, stats, tags })}>★ REVELAR CARTA</Btn>
        </div>
      </div>

      {reveal && <PackOpening {...reveal} onDismiss={() => setReveal(null)} />}
    </div>
  );
}

// ── JOGADORES ───────────────────────────────────────────────
function PlayersScreen() {
  const last = SESSIONS[0];
  const cardFor = id => last.cards.find(c => c.playerId === id);
  return (
    <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '34px 30px 70px' }}>
      <div style={{ marginBottom: 28 }}>
        <SectionLabel>ELENCO DO LOBBÃO</SectionLabel>
        <h1 style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 44, color: TOK.txt, margin: '6px 0 0', letterSpacing: -1 }}>OS <span style={{ color: TOK.R }}>JOGADORES</span></h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 30, justifyItems: 'center' }}>
        {PLAYERS.map((p, i) => {
          const c = cardFor(p.id) || { ov: p.ov, stats: p.stats, tags: p.tags };
          return (
            <div key={p.id} className="lbc-pop" style={{ animationDelay: `${i * 0.06}s` }}>
              <PlayerCard player={p} ov={c.ov} stats={c.stats} tags={c.tags} S={0.96} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SundayScreen, PlayersScreen });
