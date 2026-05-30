// ═══════════════════════════════════════════════════════════
//  Pack Opening — revelação cinematográfica da carta
// ═══════════════════════════════════════════════════════════

const { TOK, tierFor, SMOKE, PAINT, LOGO,
        SmokeLayer, PaintSwoosh, PlayerCard, Btn } = window;
const { useState, useEffect } = React;

function PackOpening({ player, ov, stats, tags, onDismiss }) {
  const t = tierFor(ov);
  const ringCol = t.special ? t.gold : t.col;
  const [phase, setPhase] = useState(0); // 0 bg, 1 smoke, 2 swipe, 3 card, 4 burst, 5 settle, 6 ready
  useEffect(() => {
    const steps = [80, 600, 1100, 1700, 2500, 3100, 3700];
    const timers = steps.map((d, i) => setTimeout(() => setPhase(i), d));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClick = () => { if (phase >= 6) onDismiss && onDismiss(); };

  return (
    <div onClick={handleClick} style={{
      position: 'fixed', inset: 0, zIndex: 9000, overflow: 'hidden',
      background: 'radial-gradient(80% 60% at 50% 50%, rgba(20,4,4,0.92), rgba(0,0,0,0.98))',
      opacity: phase >= 0 ? 1 : 0, transition: 'opacity .35s',
      cursor: phase >= 6 ? 'pointer' : 'default',
    }}>
      {/* fumaça massiva atrás */}
      <div className="lbc-pack-smoke" style={{ position: 'absolute', inset: 0, opacity: phase >= 1 ? 1 : 0, transition: 'opacity .7s' }}>
        <SmokeLayer opacity={0.85} scale="200%" pos="40% 40%" />
        <SmokeLayer opacity={0.6} scale="140%" pos="20% 60%" />
        <SmokeLayer hue={t.hue} opacity={t.lvl >= 3 ? 0.35 : 0.2} scale="180%" pos="60% 30%" drift={false} />
      </div>

      {/* radial color por tier (cresce com a fase) */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(45% 35% at 50% 50%, ${ringCol}${phase >= 3 ? '55' : '20'}, transparent 70%)`, transition: 'all .8s', opacity: phase >= 1 ? 1 : 0 }} />

      {/* swipe diagonal de pincelada branca */}
      <div className="lbc-pack-swipe" style={{ position: 'absolute', top: '50%', left: '-30%', width: '160%', transform: 'translateY(-50%) rotate(-7deg)', opacity: phase >= 2 ? 0 : 0, animation: phase >= 2 ? 'lbcPackSwipe 1.1s cubic-bezier(.4,0,.2,1) forwards' : 'none' }}>
        <img src={PAINT} alt="" style={{ width: '100%', display: 'block', opacity: 0.85 }} />
      </div>

      {/* raios saindo do centro (lvl alto) */}
      {phase >= 3 && t.lvl >= 3 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 1000, height: 1000, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', width: 4, height: 600,
              background: `linear-gradient(${ringCol}, transparent)`,
              transformOrigin: '50% 0',
              transform: `translate(-50%,0) rotate(${i * 30}deg)`,
              opacity: phase >= 4 ? 0.4 : 0, transition: 'opacity .6s',
              filter: `blur(2px) drop-shadow(0 0 8px ${ringCol})`,
            }} />
          ))}
        </div>
      )}

      {/* burst circular */}
      {phase >= 4 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 200, height: 200,
          transform: 'translate(-50%,-50%)', borderRadius: '50%',
          border: `3px solid ${ringCol}`, animation: 'lbcPackBurst 1.1s cubic-bezier(.2,.6,.4,1) forwards',
          boxShadow: `0 0 40px ${ringCol}`,
        }} />
      )}

      {/* a carta */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        animation: phase >= 3 ? 'lbcPackCardIn 1.0s cubic-bezier(.2,.7,.3,1) forwards' : 'none',
        opacity: phase >= 3 ? 1 : 0,
      }}>
        <PlayerCard player={player} ov={ov} stats={stats} tags={tags} S={1.25} />
      </div>

      {/* tier label gigante atrás */}
      {phase >= 5 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          fontFamily: TOK.fNum, fontWeight: 900, fontSize: 220, color: 'transparent',
          WebkitTextStroke: `1px ${ringCol}33`, letterSpacing: 14, whiteSpace: 'nowrap',
          opacity: 0, animation: 'lbcPackTierIn .8s ease-out forwards',
          pointerEvents: 'none', zIndex: -1,
        }}>{t.short}</div>
      )}

      {/* cue de continuar */}
      {phase >= 6 && (
        <div style={{
          position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center',
          fontFamily: TOK.fHud, fontWeight: 600, fontSize: 11, letterSpacing: 4,
          color: '#fff', opacity: 0.85, textTransform: 'uppercase',
          animation: 'lbcPackCue 1.4s ease-in-out infinite',
        }}>
          CLIQUE PARA CONTINUAR
        </div>
      )}

      {/* logo da live canto sup esq */}
      <div style={{ position: 'absolute', top: 24, left: 28, opacity: phase >= 5 ? 0.85 : 0, transition: 'opacity .8s' }}>
        <img src={LOGO} alt="" style={{ height: 42, filter: `drop-shadow(0 0 10px ${TOK.R})` }} />
      </div>

      {/* "OVERALL REVELADO" label topo */}
      {phase >= 5 && (
        <div style={{
          position: 'absolute', top: 36, left: 0, right: 0, textAlign: 'center',
          fontFamily: TOK.fHud, fontWeight: 700, fontSize: 11, letterSpacing: 5,
          color: ringCol, textShadow: `0 0 12px ${ringCol}`,
          opacity: 0, animation: 'lbcPackCue .8s ease-out forwards',
        }}>
          OVERALL REVELADO · {t.name}
        </div>
      )}
    </div>
  );
}

window.PackOpening = PackOpening;
