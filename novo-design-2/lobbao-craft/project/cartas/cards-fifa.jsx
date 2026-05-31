// ═══════════════════════════════════════════════════════════
//  Lobbão Craft — Cartas FIFA TOTY/TOTW (3 variações)
//  GoatCard (TOTY azul+ouro)  ·  TotwCard (preto low-poly)
// ═══════════════════════════════════════════════════════════

const { TOK, TIERS, ATTRS, LOGO } = window;
const SHORT = ATTRS.map(a => a.short);

const G = { hi:'#ffeeb0', mid:'#ffd700', lo:'#9c7220', deep:'#6b4a10' };
const NAVY = { c0:'#00041e', c1:'#0c1d68', c2:'#040933' };

// FIFA-style shield silhouette (top notch + side flares + bottom point)
const SHIELD = 'polygon(47% 1%, 50% 4.2%, 53% 1%, 91% 3%, 100% 11%, 100% 86%, 86% 100%, 14% 100%, 0 86%, 0 11%, 9% 3%)';

// ── shared primitives ──────────────────────────────────────

function Photo({ nick, S=1, gray }) {
  const ini = (nick || '').slice(0, 2);
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', filter: gray?'grayscale(.4) brightness(.85)':'none' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(120% 95% at 56% 26%, rgba(255,255,255,0.07), transparent 62%)' }} />
      <div style={{ position:'absolute', left:'56%', top:'48%', transform:'translate(-50%,-50%)', fontFamily:TOK.fNum, fontWeight:900, fontSize:120*S, color:'rgba(255,255,255,0.045)', letterSpacing:-4, lineHeight:1, pointerEvents:'none' }}>{ini}</div>
      <div style={{ position:'absolute', left:'56%', bottom:'2%', transform:'translateX(-50%)', width:'58%', textAlign:'center' }}>
        <div style={{ width:'46%', aspectRatio:'1', borderRadius:'50%', background:'rgba(255,255,255,0.08)', margin:'0 auto' }} />
        <div style={{ width:'100%', height:60*S, marginTop:6*S, borderRadius:'46% 46% 0 0', background:'rgba(255,255,255,0.08)' }} />
      </div>
      <div style={{ position:'absolute', top:24*S, right:18*S, fontFamily:'monospace', fontSize:9*S, letterSpacing:1, color:'rgba(255,255,255,0.30)' }}>[ foto ]</div>
    </div>
  );
}

function Header({ ov, label, S=1, gold, accent }) {
  const col = gold ? G.hi : accent;
  return (
    <div style={{ position:'absolute', top:22*S, left:24*S, lineHeight:0.82, zIndex:5 }}>
      <div style={{ fontFamily:TOK.fNum, fontWeight:900, fontSize:50*S, color: gold?G.hi:'#fff', textShadow: gold?`0 2px 14px ${G.mid}cc, 0 0 22px ${G.mid}55`:`0 2px 12px ${accent}99`, letterSpacing:-1 }}>{ov}</div>
      <div style={{ fontFamily:TOK.fHud, fontWeight:700, fontSize:9*S, letterSpacing:2.4*S, color: col, marginTop:4*S, textTransform:'uppercase', whiteSpace:'nowrap', textShadow: gold?`0 1px 6px ${G.deep}`:'none' }}>{label}</div>
      <img src={LOGO} alt="" style={{ width:42*S, marginTop:6*S, opacity:0.9, filter:`drop-shadow(0 0 6px ${col}99)` }} />
    </div>
  );
}

function Footer({ player, stats, S=1, accent }) {
  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:`0 ${18*S}px ${16*S}px`, zIndex:5 }}>
      <div style={{ fontFamily:TOK.fNum, fontWeight:900, fontSize:23*S, color:'#fff', textAlign:'center', letterSpacing:1.5*S, textShadow:`0 2px 10px ${accent}88` }}>{player.nick}</div>
      <div style={{ height:1.5, margin:`${8*S}px 0`, background:`linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2*S }}>
        {(stats || []).map((v, i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:TOK.fHud, fontWeight:700, fontSize:8.5*S, color:accent, opacity:0.92, letterSpacing:0.3 }}>{SHORT[i]}</div>
            <div style={{ fontFamily:TOK.fNum, fontWeight:800, fontSize:18*S, color:'#fff' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── FX building blocks ─────────────────────────────────────

function CrystalFan({ cx, cy, count=12, a0=180, a1=360, rMin=50, rMax=130, thin, S=1, op=1 }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const a = a0 + (a1 - a0) * t;
    const len = rMin + (rMax - rMin) * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.5)));
    const w = thin ? 2.5 : 3 + Math.abs(Math.sin(i * 0.9)) * 2.5;
    const o = op * (0.55 + 0.4 * Math.abs(Math.sin(i * 0.83 + 0.3)));
    out.push(
      <div key={i} style={{
        position:'absolute', left:cx, top:cy,
        width: w * S, height: len * S,
        transform: `translateX(-50%) rotate(${a}deg)`,
        transformOrigin: '50% 0',
        background: `linear-gradient(180deg, ${G.hi}, ${G.mid} 40%, ${G.lo})`,
        clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        boxShadow: `0 0 5px ${G.mid}aa`,
        opacity: o,
      }} />
    );
  }
  return out;
}

function ConfettiRain({ count=20, side='left', S=1, slow }) {
  const out = [];
  const xR = side === 'left' ? [4, 42] : side === 'right' ? [58, 96] : [4, 96];
  for (let i = 0; i < count; i++) {
    const x = xR[0] + (xR[1] - xR[0]) * (((i * 37) % 100) / 100);
    const y = (i * 23) % 55 + 3;
    const sz = 3 + (i % 3);
    out.push(
      <div key={i} className="lbc-rain" style={{
        position:'absolute', left:`${x}%`, top:`${y}%`,
        width: sz * S, height: sz * S,
        background: i % 4 === 0 ? G.hi : G.mid,
        clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        boxShadow: `0 0 ${sz * 1.5}px ${G.mid}aa`,
        animationDelay: `${(i * 0.17) % 4}s`,
        animationDuration: `${slow ? 7 : 3 + (i % 3) * 0.6}s`,
      }} />
    );
  }
  return out;
}

function Sparkles({ count=14, color=G.hi, S=1, positions }) {
  const out = [];
  const N = positions ? positions.length : count;
  for (let i = 0; i < N; i++) {
    const [x, y] = positions ? positions[i] : [6 + (i * 29) % 88, 4 + (i * 41) % 72];
    out.push(
      <div key={i} className="lbc-spark2" style={{
        position:'absolute', left:`${x}%`, top:`${y}%`,
        width: 3 * S, height: 3 * S, background: color, borderRadius:'50%',
        boxShadow: `0 0 6px ${color}, 0 0 12px ${color}99`,
        animationDelay: `${(i * 0.17) % 3}s`,
      }} />
    );
  }
  return out;
}

function Bolt({ x, y, len=200, w=34, S=1, delay=0, op=0.95 }) {
  return (
    <div className="lbc-bolt" style={{
      position:'absolute', left:x, top:y, transform:'translateX(-50%)',
      width: w * S, height: len * S,
      background: `linear-gradient(180deg, ${G.hi} 0%, ${G.mid} 30%, ${G.mid} 65%, ${G.lo} 100%)`,
      clipPath: 'polygon(58% 0, 18% 48%, 44% 50%, 22% 100%, 88% 42%, 62% 40%, 82% 0)',
      filter: `drop-shadow(0 0 8px ${G.mid}) drop-shadow(0 0 16px ${G.mid}77)`,
      animationDelay: `${delay}s`,
      opacity: op,
    }} />
  );
}

function SideFlourishes({ S=1 }) {
  const ray = (i, side) => (
    <div key={`${side}${i}`} style={{
      position:'absolute',
      [side === 'l' ? 'left' : 'right']: 0,
      top: `${30 + i * 7}%`,
      width: (10 + i * 2.2) * S, height: 1.6 * S,
      background: `linear-gradient(${side === 'l' ? '90deg' : '270deg'}, ${G.hi}, ${G.lo}, transparent)`,
      opacity: 0.92 - i * 0.08,
      boxShadow: `0 0 4px ${G.mid}99`,
    }} />
  );
  return [0,1,2,3,4,5].flatMap(i => [ray(i,'l'), ray(i,'r')]);
}

function TopChevron({ S=1 }) {
  return (
    <div style={{ position:'absolute', top:10*S, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', gap:1, alignItems:'center', zIndex:4 }}>
      {[0,1].map(i => (
        <div key={i} style={{
          width: 14 * S, height: 7 * S,
          background: G.hi,
          clipPath: 'polygon(50% 0, 100% 100%, 75% 100%, 50% 38%, 25% 100%, 0 100%)',
          opacity: 1 - i * 0.3,
          filter: `drop-shadow(0 0 3px ${G.mid})`,
        }} />
      ))}
    </div>
  );
}

function Corners({ S=1, col=G.hi }) {
  return ['tl','tr','bl','br'].map(c => (
    <div key={c} style={{
      position:'absolute',
      [c[0] === 't' ? 'top' : 'bottom']: 16 * S,
      [c[1] === 'l' ? 'left' : 'right']: 16 * S,
      width: 24 * S, height: 24 * S,
      borderColor: col, borderStyle:'solid', borderWidth:0,
      borderTopWidth: c[0] === 't' ? 1.5 : 0,
      borderBottomWidth: c[0] === 'b' ? 1.5 : 0,
      borderLeftWidth: c[1] === 'l' ? 1.5 : 0,
      borderRightWidth: c[1] === 'r' ? 1.5 : 0,
      [`border${c[0] === 't' ? 'Top' : 'Bottom'}${c[1] === 'l' ? 'Left' : 'Right'}Radius`]: 10 * S,
      opacity: 0.85,
      filter: `drop-shadow(0 0 3px ${col})`,
    }} />
  ));
}

// Gold faceted framework (TOTW v2 — central wireframe like FIFA Dream Lobby ref)
function GoldFramework({ S=1, sz=140 }) {
  const W = sz * S, H = sz * 1.1 * S;
  return (
    <div style={{ position:'absolute', top:'13%', left:'50%', transform:'translateX(-50%)', width: W, height: H, pointerEvents:'none' }}>
      {/* center dark gem (stays centered as anchor) */}
      <div style={{
        position:'absolute', top:'22%', left:'22%', width:'56%', height:'56%',
        background:`linear-gradient(135deg, rgba(255,235,150,0.22), rgba(40,28,8,0.55))`,
        clipPath:'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        boxShadow:`inset 0 0 18px rgba(255,215,0,0.35), 0 4px 16px rgba(0,0,0,0.55)`,
      }} />

      {/* OUTER DIAMOND — shifted LEFT, brings its 4 vertex dots */}
      <div style={{ position:'absolute', inset:0, transform:'translateX(-3%)' }}>
        <div style={{
          position:'absolute', top:'2%', left:'2%', width:'96%', height:'96%',
          border:`1.5px solid ${G.mid}`, transform:'rotate(45deg)',
          boxShadow:`0 0 10px ${G.mid}88, inset 0 0 4px ${G.hi}66`, opacity:0.9,
        }} />
        {[[50,0],[100,50],[50,100],[0,50]].map(([x,y], i) => (
          <div key={i} style={{
            position:'absolute', left:`${x}%`, top:`${y}%`,
            width: 6 * S, height: 6 * S, background: G.hi, borderRadius:'50%',
            transform:'translate(-50%,-50%)',
            boxShadow:`0 0 8px ${G.mid}, 0 0 3px ${G.hi}`,
          }} />
        ))}
      </div>

      {/* INNER SQUARE — shifted RIGHT, brings its 4 midpoint dots */}
      <div style={{ position:'absolute', inset:0, transform:'translateX(22%)' }}>
        <div style={{
          position:'absolute', top:'18%', left:'18%', width:'64%', height:'64%',
          border:`1px solid ${G.hi}`, transform:'rotate(15deg)', opacity:0.7,
          boxShadow:`0 0 6px ${G.mid}55`,
        }} />
        {[[20,30],[80,30],[20,70],[80,70]].map(([x,y], i) => (
          <div key={`m${i}`} style={{
            position:'absolute', left:`${x}%`, top:`${y}%`,
            width: 3 * S, height: 3 * S, background: G.mid, borderRadius:'50%',
            transform:'translate(-50%,-50%)',
            boxShadow:`0 0 4px ${G.mid}`,
          }} />
        ))}
      </div>

      {/* triangular accent removed — was contributing to the diagonal-band feel */}
    </div>
  );
}

// ── frames ─────────────────────────────────────────────────

function ShieldFrameRich({ S=1, bg, children }) {
  return (
    <>
      <div style={{ position:'absolute', inset:0, clipPath:SHIELD, background:`linear-gradient(160deg, ${G.hi} 0%, ${G.mid} 25%, ${G.lo} 50%, ${G.mid} 75%, ${G.hi} 100%)`, filter:`drop-shadow(0 0 22px ${G.mid}66)` }} />
      <div style={{ position:'absolute', inset:5*S, clipPath:SHIELD, background:'#0d0a04' }} />
      <div style={{ position:'absolute', inset:7*S, clipPath:SHIELD, background:`linear-gradient(160deg, ${G.mid}, ${G.deep}, ${G.mid})` }} />
      <div style={{ position:'absolute', inset:8.5*S, clipPath:SHIELD, overflow:'hidden', background: bg }}>
        {children}
      </div>
    </>
  );
}

function ShieldFrameThin({ S=1, bg, children }) {
  return (
    <>
      <div style={{ position:'absolute', inset:0, clipPath:SHIELD, background:`linear-gradient(160deg, ${G.mid}, ${G.deep}, ${G.mid})`, filter:`drop-shadow(0 0 10px ${G.mid}44)` }} />
      <div style={{ position:'absolute', inset:2.5*S, clipPath:SHIELD, background:'#000' }} />
      <div style={{ position:'absolute', inset:4*S, clipPath:SHIELD, background:`linear-gradient(160deg, ${G.lo}, ${G.mid}, ${G.lo})` }} />
      <div style={{ position:'absolute', inset:5.5*S, clipPath:SHIELD, overflow:'hidden', background: bg }}>
        {children}
      </div>
    </>
  );
}

// ── GOAT CARD ──────────────────────────────────────────────

function GoatCard({ player, fx='royal', S=1 }) {
  const W = 290 * S, H = 432 * S;
  const navyBg = `linear-gradient(165deg, ${NAVY.c0} 0%, ${NAVY.c1} 50%, ${NAVY.c2} 100%)`;
  return (
    <div style={{ position:'relative', width:W, height:H, filter:'drop-shadow(0 18px 40px rgba(0,0,0,0.7))' }}>
      <ShieldFrameRich S={S} bg={navyBg}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(120% 70% at 50% 0%, ${G.mid}22, transparent 60%)` }} />

        {fx === 'royal' && (
          <>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(55% 45% at 62% 38%, ${G.mid}44, ${G.mid}1a 35%, transparent 65%)`, mixBlendMode:'screen' }} />
            <CrystalFan cx="76%" cy="22%" count={16} a0={180} a1={355} rMin={55} rMax={185} S={S} />
            <ConfettiRain count={26} side="left" S={S} />
            <Sparkles count={20} S={S} />
            <SideFlourishes S={S} />
          </>
        )}

        {fx === 'storm' && (
          <>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(60% 50% at 50% 38%, ${G.mid}33, transparent 60%)`, mixBlendMode:'screen' }} />
            <Bolt x="24%" y="8%" len={290} w={34} S={S} delay={0} />
            <Bolt x="50%" y="3%" len={340} w={44} S={S} delay={0.5} />
            <Bolt x="76%" y="10%" len={280} w={32} S={S} delay={0.9} />
            <Sparkles count={24} S={S} />
            <SideFlourishes S={S} />
            <div className="lbc-goldpulse" style={{ position:'absolute', inset:0, clipPath:SHIELD, pointerEvents:'none' }} />
          </>
        )}

        {fx === 'gilded' && (
          <>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(70% 55% at 50% 28%, ${G.mid}3a, transparent 60%)` }} />
            <ConfettiRain count={26} side="even" S={S} slow />
            <Sparkles count={28} S={S} />
            <CrystalFan cx="50%" cy="20%" count={8} a0={205} a1={335} rMin={70} rMax={130} thin S={S} op={0.7} />
            <Corners S={S} />
          </>
        )}

        {fx === 'gildedV2' && (
          <>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(70% 55% at 50% 28%, ${G.mid}3a, transparent 60%)` }} />
            <ConfettiRain count={30} side="even" S={S} slow />
            <Sparkles count={32} S={S} />
            <Corners S={S} />
          </>
        )}

        <TopChevron S={S} />

        {/* photo */}
        <div style={{ position:'absolute', top:'9%', left:0, right:0, height:'58%' }}>
          <Photo nick={player.nick} S={S} />
        </div>
        {/* silk navy fade at bottom */}
        <div style={{ position:'absolute', bottom:'-6%', left:'-10%', right:'-10%', height:'46%', background:`radial-gradient(55% 80% at 50% 30%, ${NAVY.c1}cc, transparent 60%)`, filter:'blur(8px)' }} />
        {/* footer fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:`linear-gradient(to top, ${NAVY.c0}f5 38%, transparent)` }} />

        <Header ov={player.ov} label="GOAT" S={S} gold />
        <Footer player={player} stats={player.stats} S={S} accent={G.mid} />
      </ShieldFrameRich>

      {fx === 'gildedV2' && (
        <CrystalFan cx="86%" cy="20%" count={18} a0={50} a1={270} rMin={40} rMax={110} thin S={S} op={0.92} />
      )}
    </div>
  );
}

// ── TOTW CARD (preto informe) ─────────────────────────────

function TotwCard({ player, t, variant='v1', S=1 }) {
  const W = 270 * S, H = 408 * S;
  const blackBg = `linear-gradient(165deg, #0a0a0e 0%, #14141a 50%, #0a0a0e 100%)`;
  // V2 shards: smaller, less rotated, placed in 4 corners to avoid diagonal sweep
  const shards = variant === 'v2' ? [
    { left:'6%',  top:'10%', w:34, h:42, rot: 8,  op:0.16 },
    { left:'76%', top:'12%', w:38, h:48, rot:-10, op:0.18 },
    { left:'4%',  top:'62%', w:32, h:40, rot:-12, op:0.14 },
    { left:'78%', top:'66%', w:36, h:44, rot: 10, op:0.16 },
  ] : [
    { left:'8%',  top:'22%', w:34, h:50, rot: 25, op:0.10 },
    { left:'70%', top:'15%', w:42, h:60, rot:-18, op:0.13 },
    { left:'6%',  top:'58%', w:38, h:42, rot: 55, op:0.09 },
    { left:'66%', top:'46%', w:48, h:58, rot:-30, op:0.11 },
    { left:'30%', top:'76%', w:54, h:42, rot: 14, op:0.08 },
  ];
  // V2 sparkle + streak grids — hand-distributed to avoid modular diagonal lines
  const v2Sparkles = [
    [12,10], [30,18], [48,8],  [66,14], [82,22],
    [8,32],  [22,42], [40,36], [58,30], [74,44], [90,36],
    [14,56], [32,64], [50,58], [68,70], [84,62],
    [22,78], [60,78],
  ];
  const v2Streaks = [
    [18,6],  [38,12], [56,4],  [72,16], [88,8],
    [4,26],  [26,36], [44,28], [62,38], [78,30], [96,38],
    [16,50], [34,60], [52,52], [70,60], [86,54],
    [10,76], [44,74],
  ];
  const streakPositions = variant === 'v2'
    ? v2Streaks
    : Array.from({ length:18 }, (_, i) => [5 + (i * 31) % 90, 6 + (i * 47) % 72]);
  return (
    <div style={{ position:'relative', width:W, height:H, filter:'drop-shadow(0 14px 32px rgba(0,0,0,0.7))' }}>
      <ShieldFrameThin S={S} bg={blackBg}>
        {variant === 'v1' ? (
          <div style={{ position:'absolute', inset:0, opacity:0.6, backgroundImage:`
            linear-gradient(120deg, rgba(255,255,255,0.05) 0%, transparent 28%),
            linear-gradient(240deg, rgba(255,255,255,0.035) 0%, transparent 28%),
            linear-gradient(60deg, transparent 60%, rgba(255,255,255,0.04) 80%, transparent 100%)
          ` }} />
        ) : (
          <div style={{ position:'absolute', inset:0, opacity:0.65, backgroundImage:`
            radial-gradient(80% 60% at 50% 18%, rgba(255,215,0,0.07), transparent 60%),
            radial-gradient(60% 70% at 50% 100%, rgba(0,0,0,0.4), transparent 60%)
          ` }} />
        )}
        {shards.map((p, i) => (
          <div key={i} style={{
            position:'absolute', left:p.left, top:p.top,
            width: p.w * S, height: p.h * S,
            transform:`rotate(${p.rot}deg)`,
            background: variant === 'v2'
              ? `linear-gradient(135deg, ${G.mid}77, ${G.deep}44)`
              : `linear-gradient(135deg, ${G.mid}55, ${G.deep}33)`,
            clipPath: 'polygon(20% 0, 100% 25%, 80% 100%, 0 70%)',
            opacity: p.op,
            border: variant === 'v2' ? `1px solid ${G.mid}88` : `0.5px solid ${G.mid}33`,
            boxShadow: variant === 'v2' ? `0 0 6px ${G.mid}55` : 'none',
          }} />
        ))}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(60% 40% at 50% 28%, ${t.glow}33, transparent 60%)`, mixBlendMode:'screen' }} />
        {variant === 'v2' && <GoldFramework S={S} sz={130} />}
        {variant === 'v2' && <Sparkles positions={v2Sparkles} S={S} />}
        {streakPositions.map(([x, y], i) => (
          <div key={`str${i}`} className="lbc-spark2" style={{
            position:'absolute', left:`${x}%`, top:`${y}%`,
            width: 2 * S, height: (4 + i % 4) * S,
            background: t.col, opacity:0.7,
            clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
            boxShadow: `0 0 4px ${t.col}`,
            animationDelay: `${(i * 0.13) % 2}s`,
          }} />
        ))}
        {/* photo */}
        <div style={{ position:'absolute', top:'9%', left:0, right:0, height:'58%' }}>
          <Photo nick={player.nick} S={S} gray={t.lvl === 0} />
        </div>
        {/* bottom fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'42%', background:`linear-gradient(to top, #000 38%, transparent)` }} />

        <Header ov={player.ov} label={t.short} S={S} accent={t.col} />
        <Footer player={player} stats={player.stats} S={S} accent={t.col} />
      </ShieldFrameThin>
    </div>
  );
}

Object.assign(window, { GoatCard, TotwCard });
