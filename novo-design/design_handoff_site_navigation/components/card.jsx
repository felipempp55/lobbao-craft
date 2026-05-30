// ═══════════════════════════════════════════════════════════
//  PlayerCard final — Direção A (Refino TOTW)
//  Suporta 5 tiers, tags playstyle, fl1ip logo
// ═══════════════════════════════════════════════════════════

const { TOK, TIERS, tierFor, ATTRS, TAGS, SMOKE, PAINT, LOGO,
        SmokeLayer, PaintSwoosh } = window;

// ── photo placeholder com identidade (monograma sutil) ──────
function PhotoPH({ nick, tint = 'rgba(255,255,255,0.10)', grayscale, S = 1 }) {
  const ini = (nick || '').slice(0, 2);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', filter: grayscale ? 'grayscale(0.4) brightness(0.85)' : 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 95% at 56% 26%, rgba(255,255,255,0.07), transparent 62%)' }} />
      {/* monograma marca d'água */}
      <div style={{ position: 'absolute', left: '56%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: TOK.fNum, fontWeight: 900, fontSize: 110 * S, color: 'rgba(255,255,255,0.045)', letterSpacing: -4, lineHeight: 1, pointerEvents: 'none' }}>{ini}</div>
      {/* silhueta */}
      <div style={{ position: 'absolute', left: '56%', bottom: '-2%', transform: 'translateX(-50%)', width: '62%', textAlign: 'center' }}>
        <div style={{ width: '46%', aspectRatio: '1', borderRadius: '50%', background: tint, margin: '0 auto' }} />
        <div style={{ width: '100%', height: 64 * S, marginTop: 7 * S, borderRadius: '46% 46% 0 0', background: tint }} />
      </div>
      <div style={{ position: 'absolute', top: 9 * S, right: 11 * S, fontFamily: 'monospace', fontSize: 9 * S, letterSpacing: 1, color: 'rgba(255,255,255,0.30)' }}>[ foto ]</div>
    </div>
  );
}

// ── tag chip (diamante FIFA style) ──────────────────────────
function TagChip({ tag, tier, S = 1 }) {
  if (!tag) return null;
  const goldenize = tier.lvl >= 3;
  const baseCol = tag.pol === '+' ? '#33bb55' : '#cc4422';
  const fill = goldenize ? `linear-gradient(135deg, ${tier.col}, ${tier.glow})` : `linear-gradient(135deg, ${baseCol}, ${baseCol}cc)`;
  return (
    <div style={{ width: 28 * S, height: 28 * S, transform: 'rotate(45deg)', background: fill, border: `1.5px solid ${goldenize ? tier.col : '#000'}`, boxShadow: `0 2px 8px rgba(0,0,0,0.5), inset 0 0 8px rgba(255,255,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ transform: 'rotate(-45deg)', fontFamily: TOK.fHud, fontWeight: 800, fontSize: 8 * S, letterSpacing: 0.3, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{tag.label.slice(0, 4)}</span>
    </div>
  );
}

// ── PLAYER CARD ─────────────────────────────────────────────
function PlayerCard({ player, ov, stats, tags = [], S = 1 }) {
  const t = tierFor(ov);
  const ringCol = t.special ? t.gold : t.col;
  const W = (248 + t.lvl * 7) * S;
  const H = (382 + t.lvl * 9) * S;
  const tagObjs = tags.map(id => TAGS.find(x => x.id === id)).filter(Boolean);

  return (
    <div style={{ position: 'relative', width: W, height: H, filter: `drop-shadow(0 ${10 + t.lvl * 2}px ${22 + t.lvl * 6}px rgba(0,0,0,${0.55 + t.lvl * 0.05}))` }}>
      {/* corpo */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16 * S, overflow: 'hidden',
        background: `linear-gradient(165deg, ${t.bg[0]}, ${t.bg[1]}, ${t.bg[2]})`,
        border: `${(1.5 + t.lvl * 0.4).toFixed(1)}px solid ${t.col}${t.lvl === 0 ? '55' : ''}`,
        boxShadow: `inset 0 0 ${50 + t.lvl * 10}px rgba(0,0,0,0.7), 0 0 ${8 + t.lvl * 6}px ${t.glow}${['00','33','55','88','aa'][t.lvl]}`,
      }}>
        {/* smoke vermelho da live, tintado ao tier */}
        {t.lvl >= 1 && <SmokeLayer hue={t.hue} opacity={t.lvl === 1 ? 0.36 : t.lvl === 4 ? 0.4 : 0.5} pos="20% 10%" scale="150%" />}
        {/* halo radial topo */}
        {t.lvl >= 1 && <div style={{ position: 'absolute', inset: 0, height: '64%', background: `radial-gradient(110% 80% at 50% 0%, ${t.glow}${['00','22','33','44','4d'][t.lvl]}, transparent 65%)` }} />}

        {/* foto */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '63%' }}>
          <PhotoPH nick={player.nick} grayscale={t.lvl === 0} S={S} />
        </div>

        {/* pincelada branca canto sup. dir. */}
        {t.lvl >= 1 && <PaintSwoosh style={{ top: -26 * S, right: -54 * S, width: 200 * S, transform: 'rotate(8deg)' }} opacity={0.13 + t.lvl * 0.02} />}

        {/* shine sweep */}
        {t.lvl >= 2 && <div className="lbc-shine" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.13) 50%, transparent 62%)' }} />}

        {/* texturas (linhas/grid/losangos) por lvl */}
        {t.lvl === 1 && <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `repeating-linear-gradient(0deg, ${t.col} 0 1px, transparent 1px 4px)` }} />}
        {t.lvl === 2 && <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(${t.col} 1px, transparent 1px), linear-gradient(90deg, ${t.col} 1px, transparent 1px)`, backgroundSize: `${10 * S}px ${10 * S}px` }} />}
        {t.lvl >= 3 && <div style={{ position: 'absolute', inset: 0, opacity: 0.09, backgroundImage: `repeating-linear-gradient(45deg, ${ringCol} 0 1px, transparent 1px 12px), repeating-linear-gradient(-45deg, ${ringCol} 0 1px, transparent 1px 12px)` }} />}

        {/* header: overall + tier + logo da live */}
        <div style={{ position: 'absolute', top: 12 * S, left: 14 * S, lineHeight: 0.82 }}>
          <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: (48 + t.lvl * 3) * S, color: t.score, textShadow: `0 2px 12px ${t.glow}99`, letterSpacing: -1 }}>{ov}</div>
          <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 9 * S, letterSpacing: 2.2 * S, color: ringCol, marginTop: 3 * S, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t.short}</div>
          <img src={LOGO} alt="" style={{ width: 46 * S, marginTop: 6 * S, opacity: 0.95, filter: `drop-shadow(0 0 6px ${t.glow}66)` }} />
        </div>

        {/* tags (lateral esq, verticalmente centradas) */}
        {tagObjs.length > 0 && (
          <div style={{ position: 'absolute', left: 6 * S, top: '36%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 14 * S }}>
            {tagObjs.slice(0, 3).map((tg, i) => <TagChip key={i} tag={tg} tier={t} S={S} />)}
          </div>
        )}

        {/* sparkles ouro (Dream Lobby) */}
        {t.lvl === 3 && (
          <>
            {Array.from({ length: 14 }).map((_, i) => {
              const x = 15 + (i * 37) % 80, y = 8 + (i * 53) % 55;
              return <div key={i} className="lbc-spark" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 3 * S, height: 3 * S, background: ringCol, borderRadius: '50%', boxShadow: `0 0 6px ${ringCol}`, animationDelay: `${i * 0.15}s` }} />;
            })}
          </>
        )}

        {/* aura GOAT: raios + sparkles cyan */}
        {t.lvl === 4 && (
          <>
            {Array.from({ length: 10 }).map((_, i) => {
              const x = 8 + (i * 29) % 86, y = 6 + (i * 41) % 52;
              return <div key={i} className="lbc-spark" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4 * S, height: 4 * S, background: t.col, borderRadius: '50%', boxShadow: `0 0 8px ${t.col}, 0 0 14px ${t.col}99`, animationDelay: `${i * 0.18}s` }} />;
            })}
          </>
        )}

        {/* fade p/ footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '46%', background: `linear-gradient(to top, ${t.bg[0]}f5 42%, transparent)` }} />

        {/* footer stats */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `0 ${14 * S}px ${14 * S}px` }}>
          <div style={{ fontFamily: TOK.fNum, fontWeight: 900, fontSize: 24 * S, color: '#fff', textAlign: 'center', letterSpacing: 1.5 * S, textShadow: `0 2px 10px ${t.glow}77` }}>{player.nick}</div>
          <div style={{ height: 2, margin: `${7 * S}px 0`, background: `linear-gradient(90deg, transparent, ${t.col}, transparent)` }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 * S }}>
            {(stats || []).map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: TOK.fHud, fontWeight: 700, fontSize: 9 * S, color: t.col, opacity: 0.9, letterSpacing: 0.3 }}>{ATTRS[i].short}</div>
                <div style={{ fontFamily: TOK.fNum, fontWeight: 800, fontSize: 19 * S, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* anel interno pulsante (lvl≥3) */}
      {t.lvl >= 3 && <div className="lbc-pulse" style={{ position: 'absolute', inset: 6 * S, borderRadius: 12 * S, border: `1px solid ${ringCol}88`, pointerEvents: 'none' }} />}
      {/* cantos ornamentais (lvl≥3) */}
      {t.lvl >= 3 && ['tl', 'tr', 'bl', 'br'].map(c => (
        <div key={c} style={{
          position: 'absolute',
          [c[0] === 't' ? 'top' : 'bottom']: 4 * S, [c[1] === 'l' ? 'left' : 'right']: 4 * S,
          width: 16 * S, height: 16 * S,
          borderColor: ringCol, borderStyle: 'solid', borderWidth: 0,
          ['border' + (c[0] === 't' ? 'Top' : 'Bottom') + (c[1] === 'l' ? 'Left' : 'Right') + 'Radius']: 11 * S,
          borderTopWidth: c[0] === 't' ? 2 : 0, borderBottomWidth: c[0] === 'b' ? 2 : 0,
          borderLeftWidth: c[1] === 'l' ? 2 : 0, borderRightWidth: c[1] === 'r' ? 2 : 0,
        }} />
      ))}
      {/* losangos laterais (GOAT) */}
      {t.lvl === 4 && [
        { l: -7 * S, t: '25%' }, { r: -7 * S, t: '25%' }, { l: -7 * S, t: '60%' }, { r: -7 * S, t: '60%' },
      ].map((p, i) => (
        <div key={i} style={{ position: 'absolute', width: 14 * S, height: 14 * S, ...p, transform: 'rotate(45deg)', background: t.gold, boxShadow: `0 0 10px ${t.gold}`, border: `1px solid ${t.col}` }} />
      ))}
    </div>
  );
}

Object.assign(window, { PlayerCard, PhotoPH, TagChip });
