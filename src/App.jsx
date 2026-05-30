import { useState, useEffect, useRef, useCallback } from "react";
// ═══ BRAND COLORS ════════════════════════════════════════════
const R  = '#cc1111';
const RD = 'rgba(200,17,17,0.15)';
// ═══ TIERS ═══════════════════════════════════════════════════
const TIERS = [
  { name:'Melhor Freezar', min:0,  max:59, lbl:'MELHOR FREEZAR',
    bg:'linear-gradient(170deg,#120000 0%,#2a0505 30%,#3d0808 55%,#2a0505 80%,#120000 100%)',
    brd:'#882222',glow:'#cc2222',txt:'#ff8888',score:'#ffaaaa',pat:'rgba(180,30,30,0.07)' },
  { name:'Bagre',          min:60, max:69, lbl:'BAGRE',
    bg:'linear-gradient(170deg,#060a10 0%,#0f1e30 30%,#162840 55%,#0f1e30 80%,#060a10 100%)',
    brd:'#5588aa',glow:'#6699bb',txt:'#99bbcc',score:'#c0dde8',pat:'rgba(80,130,170,0.05)' },
  { name:'Bom Player',     min:70, max:79, lbl:'BOM PLAYER',
    bg:'linear-gradient(170deg,#021206 0%,#082210 30%,#0d3016 55%,#082210 80%,#021206 100%)',
    brd:'#33bb55',glow:'#44cc66',txt:'#88ffaa',score:'#ccffdd',pat:'rgba(50,200,80,0.05)' },
  { name:'Dream Lobby',    min:80, max:90, lbl:'DREAM LOBBY',
    bg:'linear-gradient(170deg,#0e0800 0%,#3d2600 30%,#5e3a00 55%,#3d2600 80%,#0e0800 100%)',
    brd:'#ffd700',glow:'#ffaa00',txt:'#ffe880',score:'#fff100',pat:'rgba(255,190,0,0.06)' },
  { name:'GOAT',           min:91, max:99, lbl:'GOAT',
    bg:'linear-gradient(170deg,#000420 0%,#000d45 30%,#001575 55%,#000d45 80%,#000420 100%)',
    brd:'#00d4ff',glow:'#00eeff',txt:'#88e8ff',score:'#ffffff',pat:'rgba(0,210,255,0.05)' },
];
const getTier = s => { for(let i=TIERS.length-1;i>=0;i--) if(s>=TIERS[i].min) return TIERS[i]; return TIERS[0]; };
const DATTRS = [
  {id:'kd',     name:'K/D Ratio',    weight:20},
  {id:'dmg',    name:'Dano Médio',   weight:20},
  {id:'util',   name:'Utilitárias',  weight:15},
  {id:'wr',     name:'Win Rate',     weight:25},
  {id:'clutch', name:'Clutch',       weight:10},
  {id:'consist',name:'Consistência', weight:10},
];
// ═══ STORAGE (localStorage) ══════════════════════════════════
const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const ld = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };
// ═══ UTILS ═══════════════════════════════════════════════════
const calc = (sc, at) => {
  let t = 0, w = 0;
  at.forEach(a => { if(sc[a.id] !== undefined){ t += (sc[a.id]/100)*(a.weight/100); w += a.weight; } });
  return w ? Math.min(99, Math.round(t*100/w*99)) : 0;
};
const b64Blob = d => {
  const [h, dt] = d.split(',');
  const m = h.match(/:(.*?);/)[1];
  const b = atob(dt);
  const a = new Uint8Array(b.length);
  for(let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return new Blob([a], {type: m});
};
// ═══ GLOBAL CSS ══════════════════════════════════════════════
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Saira+Condensed:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&family=Permanent+Marker&display=swap');
*{box-sizing:border-box;}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#5a3535;border-radius:3px}
.lbc-ppl-pick{transition:all .2s!important}
.lbc-ppl-pick:hover{border-color:#cc1111!important;background:rgba(200,17,17,0.10)!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,17,17,0.18)!important}
.lbc-btn:hover:not(:disabled){filter:brightness(1.18);transform:translateY(-1px)}
.lbc-btn:active:not(:disabled){transform:translateY(0)}
@keyframes lbcShine{0%,100%{left:-130%}40%,60%{left:160%}}
@keyframes lbcGem{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(2.2)}}
@keyframes lbcReveal{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes lbcRain{0%{transform:translate(0,0) rotate(0deg);opacity:.95}50%{transform:translate(-6px,18px) rotate(140deg);opacity:1}100%{transform:translate(-14px,40px) rotate(280deg);opacity:.25}}
@keyframes lbcSpark2{0%,100%{opacity:.35;transform:scale(.7)}50%{opacity:1;transform:scale(1.25)}}
@keyframes lbcSmokeDrift{0%{background-position:20% 10%}50%{background-position:26% 16%}100%{background-position:20% 10%}}
@keyframes lbcHdrLine{0%{background-position:0% 0}100%{background-position:200% 0}}
@keyframes lbcPop{0%{opacity:0;transform:translateY(24px) scale(.94)}100%{opacity:1;transform:none}}
@keyframes lbcScreen{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@keyframes lbcPackSwipe{0%{transform:translateY(-50%) rotate(-7deg) translateX(-110%);opacity:.9}100%{transform:translateY(-50%) rotate(-7deg) translateX(110%);opacity:0}}
@keyframes lbcPackCardIn{0%{opacity:0;transform:translate(-50%,-50%) scale(.7) rotateY(45deg)}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotateY(0deg)}}
@keyframes lbcPackBurst{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(8);opacity:0}}
@keyframes lbcPackTierIn{0%{opacity:0;letter-spacing:40px}100%{opacity:1;letter-spacing:14px}}
@keyframes lbcPackCue{0%,100%{opacity:.5}50%{opacity:1}}
.lbc-smoke{animation:lbcSmokeDrift 16s ease-in-out infinite}
.lbc-rain{animation:lbcRain 3.6s ease-in-out infinite}
.lbc-spark2{animation:lbcSpark2 2.4s ease-in-out infinite}
.lbc-pop{animation:lbcPop .5s cubic-bezier(.2,.7,.3,1) backwards}
.lbc-screen{animation:lbcScreen .35s ease-out}
/* ── range slider HUD ── */
.lbc-range{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;outline:none;cursor:pointer;background:linear-gradient(90deg,var(--c,#cc1111) var(--p,50%),rgba(255,255,255,0.09) var(--p,50%))}
.lbc-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--c,#cc1111);box-shadow:0 0 10px var(--c,#cc1111),0 2px 6px rgba(0,0,0,.5);cursor:pointer;transition:transform .1s}
.lbc-range::-webkit-slider-thumb:hover{transform:scale(1.18)}
.lbc-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--c,#cc1111);box-shadow:0 0 10px var(--c,#cc1111);cursor:pointer}
/* ── tweaks panel ── */
.twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:rgba(250,249,247,.92);color:#29261b;-webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);border:.5px solid rgba(255,255,255,.6);border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.28);font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
.twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none}
.twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
.twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
.twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overflow-x:hidden;min-height:0}
.twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);user-select:none}
.twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
.twk-seg.dragging .twk-seg-thumb{transition:none}
.twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2}
.twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
.twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
/* ── atmosphere: vibe ── */
.lbc-vibe-overlay{background:transparent;transition:background .6s ease}
[data-vibe="estadio"] .lbc-vibe-overlay{background:radial-gradient(70% 50% at 60% 18%,rgba(255,215,0,0.10),transparent 60%)}
[data-vibe="tatico"]  .lbc-vibe-overlay{background:linear-gradient(180deg,rgba(0,200,230,0.05),transparent 45%)}
[data-vibe="estadio"] .lbc-page-bg{background:radial-gradient(120% 80% at 50% -10%,#1a2a78,#050a30 55%,#00041e 100%)!important}
[data-vibe="estadio"] header>div:first-child{background:linear-gradient(180deg,#06122c,#0a1c52 55%,#06122c)!important}
[data-vibe="estadio"] .lbc-hdr-line{background:linear-gradient(90deg,transparent,#ffd700 30%,#ffeeb0 50%,#ffd700 70%,transparent)!important;background-size:200% 100%!important}
[data-vibe="estadio"] div[style*="smoke-red"]{filter:hue-rotate(34deg) saturate(0.9)!important}
[data-vibe="tatico"] .lbc-page-bg{background:radial-gradient(120% 80% at 50% -10%,#0c1820,#050c12 55%,#02060a 100%)!important}
[data-vibe="tatico"] header>div:first-child{background:linear-gradient(180deg,#050a0e,#0a1218 55%,#050a0e)!important}
[data-vibe="tatico"] .lbc-hdr-line{background:linear-gradient(90deg,transparent,#00c8e6 30%,#ffffff 50%,#00c8e6 70%,transparent)!important;background-size:200% 100%!important}
[data-vibe="tatico"] div[style*="smoke-red"]{filter:hue-rotate(180deg) saturate(0.35) brightness(0.85)!important}
/* ── atmosphere: fumaça ── */
[data-fumaca="limpo"] div[style*="smoke-red"]{opacity:0.08!important}
[data-fumaca="cinema"] div[style*="smoke-red"]{filter:saturate(1.35) brightness(1.1)}
[data-fumaca="cinema"] header{box-shadow:0 4px 28px rgba(204,17,17,0.35)}
[data-vibe="estadio"][data-fumaca="cinema"] header{box-shadow:0 4px 28px rgba(255,215,0,0.30)}
[data-vibe="tatico"][data-fumaca="cinema"] header{box-shadow:0 4px 28px rgba(0,200,230,0.30)}
/* ── atmosphere: pulso ── */
[data-pulso="parado"] .lbc-smoke,[data-pulso="parado"] .lbc-rain,[data-pulso="parado"] .lbc-spark2,[data-pulso="parado"] .lbc-hdr-line{animation:none!important}
[data-pulso="parado"] .lbc-pop,[data-pulso="parado"] .lbc-screen{animation-duration:0.001s!important}
[data-pulso="hype"] .lbc-smoke{animation-duration:6s!important}
[data-pulso="hype"] .lbc-rain{animation-duration:1.8s!important}
[data-pulso="hype"] .lbc-spark2{animation-duration:1.2s!important}
[data-pulso="hype"] .lbc-hdr-line{animation-duration:2.4s!important}
[data-pulso="hype"] .lbc-pop{animation-duration:0.35s!important}
`;
// ═══ FONTS ═══════════════════════════════════════════════════
const F    = "'Rajdhani','Segoe UI',sans-serif";
const FO   = "'Saira Condensed','Arial Black',Impact,sans-serif";
const FHUD = "'Chakra Petch','Segoe UI',sans-serif";
// ═══ BASE COMPONENTS ═════════════════════════════════════════
const Btn = ({ children, onClick, v='primary', size='md', disabled, style={} }) => {
  const vs = {
    primary: {background:`linear-gradient(135deg,#990000,${R})`, border:'1px solid rgba(200,50,50,0.4)', color:'#fff'},
    success: {background:'linear-gradient(135deg,#007740,#00bb55)', border:'1px solid rgba(0,180,80,0.35)', color:'#fff'},
    danger:  {background:'rgba(200,40,40,0.1)', border:'1px solid rgba(200,60,60,0.3)', color:'#ff7777'},
    ghost:   {background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'#8899bb'},
  };
  const s = vs[v] || vs.primary;
  return (
    <button className="lbc-btn" onClick={onClick} disabled={disabled} style={{
      ...s, borderRadius:8, cursor:disabled?'not-allowed':'pointer', opacity:disabled?.5:1,
      padding:size==='xs'?'4px 10px':size==='sm'?'6px 14px':size==='lg'?'14px 28px':'9px 20px',
      fontSize:size==='xs'?11:size==='sm'?12:size==='lg'?15:13.5,
      fontWeight:700, fontFamily:F, letterSpacing:.8, textTransform:'uppercase',
      transition:'all .15s', ...style,
    }}>{children}</button>
  );
};
const Field = ({ label, value, onChange, type='text', placeholder='' }) => (
  <div style={{marginBottom:14}}>
    {label && <label style={{fontSize:10.5,color:'#c09090',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:1.8,fontFamily:F,fontWeight:700}}>{label}</label>}
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{background:'rgba(30,12,12,0.88)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:8,padding:'9px 12px',color:'#f0e8e8',fontSize:13,fontFamily:F,width:'100%',boxSizing:'border-box',outline:'none',transition:'border-color .2s, box-shadow .2s'}}
      onFocus={e => { e.target.style.borderColor='rgba(200,17,17,.6)'; e.target.style.boxShadow='0 0 0 3px rgba(200,17,17,.12)'; }}
      onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.14)'; e.target.style.boxShadow='none'; }}
    />
  </div>
);
const Panel = ({ children, style={}, accent }) => (
  <div style={{
    position:'relative',
    background:'rgba(255,255,255,0.07)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
    border:'1px solid rgba(255,255,255,0.13)', borderTop:'1px solid rgba(255,120,120,0.18)',
    borderRadius:14, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.35)', overflow:'hidden', ...style,
  }}>
    {accent && <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:accent,boxShadow:`0 0 10px ${accent}66`}}/>}
    {children}
  </div>
);
const SectionLabel = ({ children, color='#c09090', style={} }) => (
  <div style={{fontSize:10.5,fontWeight:700,letterSpacing:2.5,color,textTransform:'uppercase',fontFamily:F,marginBottom:12,...style}}>{children}</div>
);
// ═══ SHIELD CARDS (GOAT + DREAM LOBBY) ══════════════════════
const TIER_LEVEL = {'Melhor Freezar':0,'Bagre':1,'Bom Player':2,'Dream Lobby':3,'GOAT':4};
const G_GOLD = { hi:'#ffeeb0', mid:'#ffd700', lo:'#9c7220', deep:'#6b4a10' };
const NAVY   = { c0:'#00041e', c1:'#0c1d68', c2:'#040933' };
const SHIELD = 'polygon(47% 1%, 50% 4.2%, 53% 1%, 91% 3%, 100% 11%, 100% 86%, 86% 100%, 14% 100%, 0 86%, 0 11%, 9% 3%)';

// ── helpers ──
const ConfettiRain = ({ count=20, side='left', S=1, slow }) => {
  const out=[];
  const xR=side==='left'?[4,42]:side==='right'?[58,96]:[4,96];
  for(let i=0;i<count;i++){
    const x=xR[0]+(xR[1]-xR[0])*(((i*37)%100)/100);
    const y=(i*23)%55+3;
    const sz=3+(i%3);
    out.push(<div key={i} className="lbc-rain" style={{position:'absolute',left:`${x}%`,top:`${y}%`,
      width:sz*S,height:sz*S,
      background:i%4===0?G_GOLD.hi:G_GOLD.mid,
      clipPath:'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
      boxShadow:`0 0 ${sz*1.5}px ${G_GOLD.mid}aa`,
      animationDelay:`${(i*0.17)%4}s`,animationDuration:`${slow?7:3+(i%3)*0.6}s`}}/>);
  }
  return out;
};
const ShieldSparkles = ({ count=14, color, S=1 }) => {
  const col=color||G_GOLD.hi;
  const out=[];
  for(let i=0;i<count;i++){
    const x=6+(i*29)%88; const y=4+(i*41)%72;
    out.push(<div key={i} className="lbc-spark2" style={{position:'absolute',left:`${x}%`,top:`${y}%`,
      width:3*S,height:3*S,background:col,borderRadius:'50%',
      boxShadow:`0 0 6px ${col},0 0 12px ${col}99`,
      animationDelay:`${(i*0.17)%3}s`}}/>);
  }
  return out;
};
const ShieldCorners = ({ S=1, col }) => {
  const c=col||G_GOLD.hi;
  return ['tl','tr','bl','br'].map(k=>(
    <div key={k} style={{position:'absolute',
      [k[0]==='t'?'top':'bottom']:16*S,[k[1]==='l'?'left':'right']:16*S,
      width:24*S,height:24*S,borderColor:c,borderStyle:'solid',borderWidth:0,
      borderTopWidth:k[0]==='t'?1.5:0,borderBottomWidth:k[0]==='b'?1.5:0,
      borderLeftWidth:k[1]==='l'?1.5:0,borderRightWidth:k[1]==='r'?1.5:0,
      [`border${k[0]==='t'?'Top':'Bottom'}${k[1]==='l'?'Left':'Right'}Radius`]:10*S,
      opacity:.85,filter:`drop-shadow(0 0 3px ${c})`}}/>
  ));
};
const TopChevron = ({ S=1 }) => (
  <div style={{position:'absolute',top:22*S,left:'50%',transform:'translateX(-50%)',
    display:'flex',flexDirection:'column',gap:1,alignItems:'center',zIndex:4}}>
    {[0,1].map(i=>(
      <div key={i} style={{width:14*S,height:7*S,background:G_GOLD.hi,
        clipPath:'polygon(50% 0, 100% 100%, 75% 100%, 50% 38%, 25% 100%, 0 100%)',
        opacity:1-i*0.3,filter:`drop-shadow(0 0 3px ${G_GOLD.mid})`}}/>
    ))}
  </div>
);
const GoldFramework = ({ S=1, sz=140 }) => {
  const W=sz*S, H=sz*1.1*S;
  return (
    <div style={{position:'absolute',top:'9%',left:'56%',transform:'translateX(-50%)',
      width:W,height:H,pointerEvents:'none'}}>
      <div style={{position:'absolute',top:'22%',left:'22%',width:'56%',height:'56%',
        background:`linear-gradient(135deg,rgba(255,235,150,0.22),rgba(40,28,8,0.55))`,
        clipPath:'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        boxShadow:`inset 0 0 18px rgba(255,215,0,0.35),0 4px 16px rgba(0,0,0,0.55)`}}/>
      <div style={{position:'absolute',inset:0,transform:'translateX(-3%)'}}>
        <div style={{position:'absolute',top:'2%',left:'2%',width:'96%',height:'96%',
          border:`1.5px solid ${G_GOLD.mid}`,transform:'rotate(45deg)',
          boxShadow:`0 0 10px ${G_GOLD.mid}88,inset 0 0 4px ${G_GOLD.hi}66`,opacity:.9}}/>
        {[[50,0],[100,50],[50,100],[0,50]].map(([x,y],i)=>(
          <div key={i} style={{position:'absolute',left:`${x}%`,top:`${y}%`,
            width:6*S,height:6*S,background:G_GOLD.hi,borderRadius:'50%',
            transform:'translate(-50%,-50%)',
            boxShadow:`0 0 8px ${G_GOLD.mid},0 0 3px ${G_GOLD.hi}`}}/>
        ))}
      </div>
      <div style={{position:'absolute',inset:0,transform:'translateX(22%)'}}>
        <div style={{position:'absolute',top:'18%',left:'18%',width:'64%',height:'64%',
          border:`1px solid ${G_GOLD.hi}`,transform:'rotate(15deg)',opacity:.7,
          boxShadow:`0 0 6px ${G_GOLD.mid}55`}}/>
        {[[20,30],[80,30],[20,70],[80,70]].map(([x,y],i)=>(
          <div key={`m${i}`} style={{position:'absolute',left:`${x}%`,top:`${y}%`,
            width:3*S,height:3*S,background:G_GOLD.mid,borderRadius:'50%',
            transform:'translate(-50%,-50%)',
            boxShadow:`0 0 4px ${G_GOLD.mid}`}}/>
        ))}
      </div>
    </div>
  );
};
const ShieldFrameRich = ({ S=1, bg, children }) => (
  <>
    <div style={{position:'absolute',inset:0,clipPath:SHIELD,
      background:`linear-gradient(160deg,${G_GOLD.hi} 0%,${G_GOLD.mid} 25%,${G_GOLD.lo} 50%,${G_GOLD.mid} 75%,${G_GOLD.hi} 100%)`,
      filter:`drop-shadow(0 0 22px ${G_GOLD.mid}66)`}}/>
    <div style={{position:'absolute',inset:5*S,clipPath:SHIELD,background:'#0d0a04'}}/>
    <div style={{position:'absolute',inset:7*S,clipPath:SHIELD,
      background:`linear-gradient(160deg,${G_GOLD.mid},${G_GOLD.deep},${G_GOLD.mid})`}}/>
    <div style={{position:'absolute',inset:8.5*S,clipPath:SHIELD,overflow:'hidden',background:bg}}>
      {children}
    </div>
  </>
);
const ShieldFrameThin = ({ S=1, bg, children }) => (
  <>
    <div style={{position:'absolute',inset:0,clipPath:SHIELD,
      background:`linear-gradient(160deg,${G_GOLD.mid},${G_GOLD.deep},${G_GOLD.mid})`,
      filter:`drop-shadow(0 0 10px ${G_GOLD.mid}44)`}}/>
    <div style={{position:'absolute',inset:2.5*S,clipPath:SHIELD,background:'#000'}}/>
    <div style={{position:'absolute',inset:4*S,clipPath:SHIELD,
      background:`linear-gradient(160deg,${G_GOLD.lo},${G_GOLD.mid},${G_GOLD.lo})`}}/>
    <div style={{position:'absolute',inset:5.5*S,clipPath:SHIELD,overflow:'hidden',background:bg}}>
      {children}
    </div>
  </>
);

// ── tag icons (FIFA Playstyle losangos) — usado em PlayerCard, TotwCard e GoatCard ──
const TAG_ICONS = [
  {id:'baiter',    img:'/isca.png',       label:'Baiter',       color:'#ff4444', brd:'#cc2222'},
  {id:'tiltado',   img:'/bravo.png',      label:'Tiltado',      color:'#ff7700', brd:'#cc4400'},
  {id:'mutadinho', img:'/opcao-mute.png', label:'Mutado',       color:'#99aacc', brd:'#6677aa'},
  {id:'genteboa',  img:'/meditacao.png',  label:'Good Vibes',   color:'#44ee88', brd:'#22aa55'},
  {id:'esforçado', img:'/biceps.png',     label:'Esforçado',    color:'#ffd700', brd:'#bb8800'},
  {id:'deagle',    img:'/revolver.png',   label:'Desert Eagle', color:'#e0a040', brd:'#a06010'},
];
const GOLD_ICON_FILTER = 'brightness(0) invert(1) sepia(1) saturate(5.5) hue-rotate(-10deg) brightness(1.05) drop-shadow(0 1px 2px rgba(0,0,0,0.55))';
const TAG_TIER_STYLES = [
  // lvl 0 — Melhor Freezar (vermelho)
  { bg:'linear-gradient(135deg, rgba(200,95,95,0.95) 0%, rgba(140,50,50,0.95) 100%)', inner:'rgba(255,200,200,0.55)', gold:false },
  // lvl 1 — Bagre (azul-cinza)
  { bg:'linear-gradient(135deg, rgba(170,195,225,0.95) 0%, rgba(115,145,185,0.95) 100%)', inner:'rgba(255,255,255,0.55)', gold:false },
  // lvl 2 — Bom Player (verde)
  { bg:'linear-gradient(135deg, rgba(110,205,140,0.95) 0%, rgba(55,150,90,0.95) 100%)', inner:'rgba(220,255,225,0.55)', gold:false },
  // lvl 3 — Dream Lobby (preto + ícone dourado)
  { bg:'linear-gradient(135deg, rgba(35,22,5,0.97) 0%, rgba(8,5,0,0.97) 100%)', inner:'rgba(255,200,80,0.4)', gold:true },
  // lvl 4 — GOAT (azul + ícone dourado)
  { bg:'linear-gradient(135deg, rgba(22,55,115,0.97) 0%, rgba(5,18,60,0.97) 100%)', inner:'rgba(180,220,255,0.45)', gold:true },
];
const TagIcons = ({ tags, lvl, S=1, cardH, areaTop=95, areaBot=105, leftPx=22 }) => {
  const active = TAG_ICONS.filter(d => (tags||{})[d.id]);
  if(!active.length) return null;
  const ts = TAG_TIER_STYLES[lvl] || TAG_TIER_STYLES[0];
  const iconFilter = ts.gold ? GOLD_ICON_FILTER : `drop-shadow(0 ${1*S}px ${2*S}px rgba(0,0,0,0.45))`;
  const sz = 28*S, gap = 10*S;
  const totalH = active.length * sz + (active.length-1) * gap;
  const areaH  = cardH - (areaTop+areaBot)*S;
  const startY = areaTop*S + Math.max(0, (areaH - totalH) / 2);
  return active.map((d, i) => (
    <div key={`ti${i}`} style={{
      position:'absolute', left: leftPx*S, top: startY + i*(sz+gap),
      width:sz, height:sz, zIndex:6, pointerEvents:'none',
      transform:'rotate(45deg)',
      background: ts.bg,
      border:`${1.5*S}px solid ${d.brd}ee`,
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:`0 0 ${13*S}px ${d.color}99, 0 0 ${6*S}px ${d.color}66, inset 0 0 ${4*S}px ${ts.inner}, inset 0 0 ${2*S}px ${d.color}44`,
    }}>
      <img src={d.img} alt={d.label} style={{
        width:sz*0.66, height:sz*0.66, transform:'rotate(-45deg)',
        objectFit:'contain', filter: iconFilter,
      }}/>
    </div>
  ));
};

// ── GoatCard ──
const GoatCard = ({ player, card, attrs, scale=1 }) => {
  const S=scale;
  const W=290*S, H=432*S;
  const navyBg=`linear-gradient(165deg,${NAVY.c0} 0%,${NAVY.c1} 50%,${NAVY.c2} 100%)`;
  const sa=(attrs||[]).slice(0,6);
  const scores=card?.scores||{};
  return (
    <div style={{position:'relative',width:W,height:H,
      filter:'drop-shadow(0 18px 40px rgba(0,0,0,0.7))',flexShrink:0}}>
      {/* ── Shield border layers ── */}
      <div style={{position:'absolute',inset:0,clipPath:SHIELD,
        background:`linear-gradient(160deg,${G_GOLD.hi} 0%,${G_GOLD.mid} 25%,${G_GOLD.lo} 50%,${G_GOLD.mid} 75%,${G_GOLD.hi} 100%)`,
        filter:`drop-shadow(0 0 22px ${G_GOLD.mid}66)`}}/>
      <div style={{position:'absolute',inset:5*S,clipPath:SHIELD,background:'#0d0a04'}}/>
      <div style={{position:'absolute',inset:7*S,clipPath:SHIELD,
        background:`linear-gradient(160deg,${G_GOLD.mid},${G_GOLD.deep},${G_GOLD.mid})`}}/>

      {/* ── Background layer: navy + halo + decorative (BEHIND fan and photo) ── */}
      <div style={{position:'absolute',inset:8.5*S,clipPath:SHIELD,overflow:'hidden',background:navyBg}}>
        <div style={{position:'absolute',inset:0,
          background:`radial-gradient(70% 55% at 50% 28%,${G_GOLD.mid}3a,transparent 60%)`}}/>
        {/* ── Camada A: cluster de feixes dourados — tamanhos/rotações/posições aleatórias ── */}
        {[
          // big edge beams
          {pos:{top:'12%', left:'-8%' }, w:52, h:260, rot:-26, op:.34, dir:180},
          {pos:{top:'36%', right:'-10%'},w:48, h:240, rot: 24, op:.30, dir:180},
          // medium interior beams
          {pos:{top:'4%',  left:'28%' }, w:34, h:180, rot:-16, op:.24, dir:180},
          {pos:{top:'46%', left:'46%' }, w:38, h:200, rot: 32, op:.26, dir:180},
          {pos:{top:'16%', right:'18%'}, w:30, h:160, rot:-38, op:.22, dir:0  },
          {pos:{top:'58%', left:'6%'  }, w:36, h:170, rot: 14, op:.24, dir:180},
          // shorter accents
          {pos:{top:'24%', left:'22%' }, w:24, h:120, rot: 44, op:.20, dir:180},
          {pos:{top:'70%', left:'58%' }, w:28, h:140, rot:-20, op:.22, dir:0  },
          {pos:{top:'6%',  left:'56%' }, w:26, h:110, rot:- 8, op:.18, dir:180},
          {pos:{top:'62%', right:'28%'}, w:30, h:150, rot: 36, op:.22, dir:180},
          {pos:{top:'72%', left:'28%' }, w:22, h:100, rot:-28, op:.18, dir:0  },
          {pos:{top:'14%', left:'46%' }, w:20, h: 90, rot: 18, op:.16, dir:180},
        ].map((r,i)=>(
          <div key={`ba${i}`} style={{
            position:'absolute', ...r.pos,
            width:r.w*S, height:r.h*S, transform:`rotate(${r.rot}deg)`,
            background:`linear-gradient(${r.dir}deg, ${G_GOLD.mid}66 0%, ${G_GOLD.deep}44 50%, transparent 100%)`,
            border:`1px solid ${G_GOLD.hi}55`, borderTop:'none', borderBottom:'none',
            opacity:r.op, filter:'blur(0.5px)',
          }}/>
        ))}

        {/* ── Camada B: diamantes médios preenchidos com gradient (TOTY shards) ── */}
        {[
          {left:'8%',  top:'18%', w:42, h:54, rot: 14, op:.45},
          {left:'72%', top:'62%', w:46, h:58, rot:-12, op:.48},
          {left:'4%',  top:'58%', w:32, h:42, rot:-22, op:.36},
          {left:'34%', top:'82%', w:30, h:38, rot:  8, op:.34},
          {left:'78%', top:'80%', w:26, h:34, rot: 20, op:.32},
        ].map((p,i)=>(
          <div key={`mfd${i}`} style={{
            position:'absolute', left:p.left, top:p.top,
            width:p.w*S, height:p.h*S, transform:`rotate(${p.rot}deg)`,
            background:`linear-gradient(135deg,${G_GOLD.hi}dd 0%,${G_GOLD.mid}aa 35%,${G_GOLD.deep}66 75%,transparent 100%)`,
            clipPath:'polygon(20% 0, 100% 25%, 80% 100%, 0 70%)',
            border:`1px solid ${G_GOLD.mid}cc`, opacity:p.op,
            boxShadow:`0 0 ${p.w*0.3*S}px ${G_GOLD.mid}77, inset 0 0 ${p.w*0.2*S}px ${G_GOLD.hi}55`,
          }}/>
        ))}

        {/* ── Camada C: gems pequenas brilhantes ── */}
        {[
          {left:'22%', top:'8%',  s:7,  op:.75},
          {left:'58%', top:'10%', s:6,  op:.65},
          {left:'40%', top:'14%', s:7,  op:.70},
          {left:'14%', top:'48%', s:6,  op:.60},
          {left:'18%', top:'76%', s:7,  op:.65},
          {left:'52%', top:'92%', s:5,  op:.55},
          {left:'88%', top:'88%', s:6,  op:.60},
          {left:'30%', top:'30%', s:5,  op:.50},
        ].map((p,i)=>(
          <div key={`gg${i}`} style={{
            position:'absolute', left:p.left, top:p.top,
            width:p.s*S, height:p.s*S, transform:'rotate(45deg)',
            background:`linear-gradient(135deg,${G_GOLD.hi},${G_GOLD.mid} 60%,${G_GOLD.deep})`,
            border:`0.5px solid ${G_GOLD.hi}cc`, opacity:p.op,
            boxShadow:`0 0 ${p.s*1.5*S}px ${G_GOLD.mid}99, 0 0 ${p.s*3*S}px ${G_GOLD.mid}44`,
          }}/>
        ))}
        <ConfettiRain count={30} side="even" S={S} slow/>
        <ShieldSparkles count={32} S={S}/>
        <ShieldCorners S={S}/>
        <TopChevron S={S}/>
      </div>

      {/* ── Burst dourado no canto superior direito — vaza pra fora da carta ── */}
      {/* glow point na origem */}
      <div style={{position:'absolute',top:-12*S,right:-12*S,
        width:90*S,height:90*S,borderRadius:'50%',
        background:`radial-gradient(circle,${G_GOLD.hi}aa 0%,${G_GOLD.mid}66 28%,${G_GOLD.mid}22 55%,transparent 75%)`,
        pointerEvents:'none',filter:'blur(2px)'}}/>
      {[
        // beams altos (vazam pra cima)
        {top:-46*S, right:18*S,  w:6*S, h:175*S, rot: 10, op:.96},
        {top:-36*S, right:42*S,  w:5*S, h:152*S, rot: -2, op:.86},
        {top:-30*S, right:66*S,  w:7*S, h:158*S, rot: 16, op:.82},
        // beams médios
        {top:-16*S, right:22*S,  w:4*S, h:118*S, rot: 22, op:.72},
        {top:-12*S, right:90*S,  w:5*S, h:122*S, rot: -6, op:.76},
        // acentos finos
        {top: -6*S, right:54*S,  w:3*S, h: 88*S, rot:  6, op:.62},
        {top: -8*S, right:112*S, w:4*S, h: 82*S, rot:-12, op:.55},
        {top: -3*S, right:34*S,  w:3*S, h: 70*S, rot: 30, op:.50},
        // spill pra direita (mais horizontais)
        {top: 18*S, right:-18*S, w:5*S, h: 95*S, rot: 65, op:.72},
        {top: 38*S, right:-26*S, w:4*S, h: 82*S, rot: 78, op:.58},
      ].map((b,i)=>(
        <div key={`brs${i}`} style={{
          position:'absolute', top:b.top, right:b.right,
          width:b.w, height:b.h,
          transform:`rotate(${b.rot}deg)`, transformOrigin:'50% 0%',
          background:`linear-gradient(180deg,${G_GOLD.hi} 0%,${G_GOLD.mid} 35%,${G_GOLD.deep} 75%,transparent 100%)`,
          boxShadow:`0 0 8px ${G_GOLD.hi}aa, 0 0 18px ${G_GOLD.mid}88`,
          opacity:b.op,
          pointerEvents:'none',
        }}/>
      ))}

      {/* ── Top layer: photo + fades + header + footer, clipped to inner shield ── */}
      <div style={{position:'absolute',inset:8.5*S,clipPath:SHIELD,overflow:'hidden',pointerEvents:'none'}}>
        {/* tag icons — coluna esquerda */}
        <TagIcons tags={card?.tags} lvl={4} S={S} cardH={H-17*S} areaTop={100} areaBot={150} leftPx={14}/>
        {/* photo — solid top, dissolves into the footer at the bottom */}
        <div style={{position:'absolute',top:'14%',left:0,right:0,bottom:'18%',overflow:'hidden'}}>
          {(player.photoClean||player.photo) ?
            <img src={player.photoClean||player.photo} alt="" style={{position:'absolute',bottom:0,left:'50%',
              transform:'translateX(-50%)',height:'100%',objectFit:'contain',objectPosition:'center bottom',
              maskImage:'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)',
              WebkitMaskImage:'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)',
              filter:`drop-shadow(0 -4px 22px ${G_GOLD.mid}66)`}}/> :
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:FO,fontWeight:900,fontSize:80*S,color:'rgba(255,255,255,0.045)'}}>{(player.nick||'').slice(0,2)}</div>
          }
        </div>
        {/* silk navy fade — softens transition between photo bottom and footer */}
        <div style={{position:'absolute',bottom:'-6%',left:'-10%',right:'-10%',height:'46%',
          background:`radial-gradient(55% 80% at 50% 30%,${NAVY.c1}cc,transparent 60%)`,filter:'blur(8px)'}}/>
        {/* footer dark fade — solid floor */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'38%',
          background:`linear-gradient(to top,${NAVY.c0} 52%,${NAVY.c0}cc 78%,transparent)`}}/>
        {/* header — strict left-align with flex */}
        <div style={{position:'absolute',top:22*S,left:24*S,lineHeight:.82,zIndex:5,
          display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
          <div style={{fontFamily:FO,fontWeight:900,fontSize:50*S,color:G_GOLD.hi,
            textShadow:`0 2px 14px ${G_GOLD.mid}cc,0 0 22px ${G_GOLD.mid}55`,letterSpacing:-1}}>{card?.overall??0}</div>
          <div style={{fontFamily:FHUD,fontWeight:700,fontSize:9*S,letterSpacing:2.4*S,color:G_GOLD.hi,
            marginTop:4*S,textTransform:'uppercase',whiteSpace:'nowrap',
            textShadow:`0 1px 6px ${G_GOLD.deep}`}}>GOAT</div>
        </div>
        {/* footer */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:`0 ${18*S}px ${20*S}px`,zIndex:5}}>
          <div style={{fontFamily:FO,fontWeight:900,fontSize:23*S,color:'#fff',textAlign:'center',
            letterSpacing:1.5*S,textShadow:`0 2px 10px ${G_GOLD.mid}88`}}>{player.nick||'???'}</div>
          {/* FL1IP logo destacada entre o nome e os stats */}
          <div style={{display:'flex',alignItems:'center',gap:10*S,margin:`${4*S}px 0 ${-6*S}px`}}>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${G_GOLD.mid}77)`}}/>
            <img src="/logo.png" alt="" style={{height:46*S,opacity:.96,display:'block',
              filter:`drop-shadow(0 0 14px ${G_GOLD.hi}cc)`}}
              onError={e=>{e.target.style.display='none'}}/>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G_GOLD.mid}77,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:2*S}}>
            {sa.map((a,i)=>(
              <div key={a.id} style={{textAlign:'center'}}>
                <div style={{fontFamily:FHUD,fontWeight:700,fontSize:8.5*S,color:G_GOLD.mid,opacity:.92,letterSpacing:.3}}>{a.name.slice(0,3).toUpperCase()}</div>
                <div style={{fontFamily:FO,fontWeight:800,fontSize:18*S,color:'#fff'}}>{Math.round(scores[a.id]??0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── TotwCard (Dream Lobby) ──
const TotwCard = ({ player, card, attrs, scale=1 }) => {
  const S=scale;
  const W=270*S, H=408*S;
  const t=getTier(card?.overall??0);
  const blackBg=`linear-gradient(165deg,#0a0a0e 0%,#14141a 50%,#0a0a0e 100%)`;
  const sa=(attrs||[]).slice(0,6);
  const scores=card?.scores||{};
  const shards=[
    {left:'6%', top:'10%',w:34,h:42,rot: 8, op:.16},
    {left:'76%',top:'12%',w:38,h:48,rot:-10,op:.18},
    {left:'4%', top:'62%',w:32,h:40,rot:-12,op:.14},
    {left:'78%',top:'66%',w:36,h:44,rot: 10,op:.16},
  ];
  const v2Sparkles=[[12,10],[30,18],[48,8],[66,14],[82,22],[8,32],[22,42],[40,36],[58,30],[74,44],[90,36],[14,56],[32,64],[50,58],[68,70],[84,62],[22,78],[60,78]];
  const v2Streaks=[[18,6],[38,12],[56,4],[72,16],[88,8],[4,26],[26,36],[44,28],[62,38],[78,30],[96,38],[16,50],[34,60],[52,52],[70,60],[86,54],[10,76],[44,74]];
  return (
    <div style={{position:'relative',width:W,height:H,
      filter:'drop-shadow(0 14px 32px rgba(0,0,0,0.7))',flexShrink:0}}>
      <ShieldFrameThin S={S} bg={blackBg}>
        <div style={{position:'absolute',inset:0,opacity:.65,
          backgroundImage:`radial-gradient(80% 60% at 50% 18%,rgba(255,215,0,0.07),transparent 60%),radial-gradient(60% 70% at 50% 100%,rgba(0,0,0,0.4),transparent 60%)`}}/>
        {shards.map((p,i)=>(
          <div key={i} style={{position:'absolute',left:p.left,top:p.top,
            width:p.w*S,height:p.h*S,transform:`rotate(${p.rot}deg)`,
            background:`linear-gradient(135deg,${G_GOLD.mid}77,${G_GOLD.deep}44)`,
            clipPath:'polygon(20% 0, 100% 25%, 80% 100%, 0 70%)',
            opacity:p.op,border:`1px solid ${G_GOLD.mid}88`,
            boxShadow:`0 0 6px ${G_GOLD.mid}55`}}/>
        ))}
        <div style={{position:'absolute',inset:0,
          background:`radial-gradient(60% 40% at 50% 28%,${t.glow}33,transparent 60%)`,
          mixBlendMode:'screen'}}/>
        <GoldFramework S={S} sz={120}/>
        {v2Sparkles.map(([x,y],i)=>(
          <div key={`sp${i}`} className="lbc-spark2" style={{position:'absolute',left:`${x}%`,top:`${y}%`,
            width:3*S,height:3*S,background:G_GOLD.hi,borderRadius:'50%',
            boxShadow:`0 0 6px ${G_GOLD.mid},0 0 12px ${G_GOLD.mid}99`,
            animationDelay:`${(i*0.17)%3}s`}}/>
        ))}
        {v2Streaks.map(([x,y],i)=>(
          <div key={`st${i}`} className="lbc-spark2" style={{position:'absolute',left:`${x}%`,top:`${y}%`,
            width:2*S,height:(4+i%4)*S,background:t.glow,opacity:.7,
            clipPath:'polygon(50% 0, 100% 100%, 0 100%)',
            boxShadow:`0 0 4px ${t.glow}`,
            animationDelay:`${(i*0.13)%2}s`}}/>
        ))}
        {/* tag icons — coluna esquerda */}
        <TagIcons tags={card?.tags} lvl={3} S={S} cardH={H-11*S} areaTop={95} areaBot={140} leftPx={14}/>
        {/* photo — extends to the footer, top + bottom mask fade so it rises from below */}
        <div style={{position:'absolute',top:'14%',left:0,right:0,bottom:'18%',overflow:'hidden'}}>
          {(player.photoClean||player.photo) ?
            <img src={player.photoClean||player.photo} alt="" style={{position:'absolute',bottom:0,left:'50%',
              transform:'translateX(-50%)',height:'100%',objectFit:'contain',objectPosition:'center bottom',
              maskImage:'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)',
              WebkitMaskImage:'linear-gradient(to bottom, #000 0%, #000 75%, transparent 100%)',
              filter:`drop-shadow(0 -4px 18px ${t.glow}55)`}}/> :
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:FO,fontWeight:900,fontSize:80*S,color:'rgba(255,255,255,0.045)'}}>{(player.nick||'').slice(0,2)}</div>
          }
        </div>
        {/* dark footer fade — stronger black floor so the photo dissolves into it */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'38%',
          background:`linear-gradient(to top,#000 52%,rgba(0,0,0,0.55) 78%,transparent)`}}/>
        {/* header */}
        <div style={{position:'absolute',top:22*S,left:24*S,lineHeight:.82,zIndex:5}}>
          <div style={{fontFamily:FO,fontWeight:900,fontSize:50*S,color:'#fff',
            textShadow:`0 2px 12px ${t.glow}99`,letterSpacing:-1}}>{card?.overall??0}</div>
          <div style={{fontFamily:FHUD,fontWeight:700,fontSize:10*S,letterSpacing:2.4*S,color:t.score,
            marginTop:5*S,textTransform:'uppercase',lineHeight:1.1}}>
            <div>DREAM</div>
            <div>LOBBY</div>
          </div>
        </div>
        {/* footer */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:`0 ${18*S}px ${20*S}px`,zIndex:5}}>
          <div style={{fontFamily:FO,fontWeight:900,fontSize:23*S,color:'#fff',textAlign:'center',
            letterSpacing:1.5*S,textShadow:`0 2px 10px ${t.glow}88`}}>{player.nick||'???'}</div>
          {/* FL1IP logo destacada entre o nome e os stats */}
          <div style={{display:'flex',alignItems:'center',gap:10*S,margin:`${4*S}px 0 ${-6*S}px`}}>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${G_GOLD.mid}77)`}}/>
            <img src="/logo.png" alt="" style={{height:46*S,opacity:.96,display:'block',
              filter:`drop-shadow(0 0 14px ${t.glow}cc)`}}
              onError={e=>{e.target.style.display='none'}}/>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G_GOLD.mid}77,transparent)`}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:2*S}}>
            {sa.map((a,i)=>(
              <div key={a.id} style={{textAlign:'center'}}>
                <div style={{fontFamily:FHUD,fontWeight:700,fontSize:8.5*S,color:t.score,opacity:.92,letterSpacing:.3}}>{a.name.slice(0,3).toUpperCase()}</div>
                <div style={{fontFamily:FO,fontWeight:800,fontSize:18*S,color:'#fff'}}>{Math.round(scores[a.id]??0)}</div>
              </div>
            ))}
          </div>
        </div>
      </ShieldFrameThin>
    </div>
  );
};

// ── roteador de carta ──
const AnyCard = ({ player, card, attrs, scale=1, reveal=false }) => {
  const lvl = TIER_LEVEL[getTier(card?.overall??0).name] ?? 0;
  if(lvl===4) return <GoatCard player={player} card={card} attrs={attrs} scale={scale}/>;
  if(lvl===3) return <TotwCard player={player} card={card} attrs={attrs} scale={scale}/>;
  return <PlayerCard player={player} card={card} attrs={attrs} scale={scale} reveal={reveal}/>;
};

// ═══ PLAYER CARD ═════════════════════════════════════════════
const PlayerCard = ({ player, card, attrs, scale=1, reveal=false }) => {
  const t = getTier(card.overall);
  const lvl = TIER_LEVEL[t.name] ?? 0;
  const isDestaque = lvl === 4;
  const CARD_W = [248,254,260,268,278];
  const CARD_H = [382,390,400,408,418];
  const W = CARD_W[lvl] * scale;
  const H = CARD_H[lvl] * scale;
  const sa = attrs.slice(0, 6);

  // Destaque: gold theme overrides tier colors
  const dBrd = '#c8a020', dGlow = '#d4a030', dScore = '#ffd700', dTxt = '#e8c870';
  const dBg  = 'linear-gradient(170deg,#020a18 0%,#050e28 30%,#081540 55%,#050e28 80%,#020a18 100%)';
  const effBrd   = isDestaque ? dBrd   : t.brd;
  const effGlow  = isDestaque ? dGlow  : t.glow;
  const effScore = isDestaque ? dScore : t.score;
  const effTxt   = isDestaque ? dTxt   : t.txt;
  const effBg    = isDestaque ? dBg    : t.bg;

  const dDiamonds = [
    {top:'10%',left:'7%',sz:14,rot:20,op:.18},{top:'18%',right:'9%',sz:10,rot:45,op:.22},
    {top:'6%',left:'42%',sz:7,rot:30,op:.15},{top:'28%',right:'5%',sz:9,rot:55,op:.14},
    {top:'14%',left:'28%',sz:5,rot:15,op:.12},{top:'32%',left:'10%',sz:8,rot:40,op:.10},
  ];
  const PHOTO_H   = [200, 215, 232, 252, 280];
  const PHOTO_BTM = [90,  92,  95,  97,  100];
  const photoH   = PHOTO_H[lvl]   * scale;
  const photoBtm = PHOTO_BTM[lvl] * scale;
  const S = scale;

  return (
    <div style={{
      width:W, height:H, position:'relative', flexShrink:0,
      animation: reveal ? 'lbcReveal .5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
    }}>
      <style>{`
        @keyframes lbcPulseBlue{0%,100%{opacity:.28}50%{opacity:.75}}
        @keyframes lbcBorderGlow{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>

      {/* ══ CAMADA 1: fundo do card ══ */}
      <div style={{
        position:'absolute',inset:0,borderRadius:16*S,background:effBg,overflow:'hidden',zIndex:1,
        border:`${[1.5,2,2,2.5,3][lvl]*S}px solid ${
          isDestaque ? effBrd : lvl>=2 ? t.brd : lvl===1 ? t.brd+'88' : t.brd+'55'
        }`,
        boxShadow: isDestaque
          ? `0 0 ${28*S}px ${dGlow}77,0 0 ${65*S}px ${dGlow}38,0 0 ${28*S}px ${t.glow}cc,0 0 ${70*S}px ${t.glow}66,0 0 ${110*S}px ${t.glow}33,inset 0 0 ${55*S}px rgba(0,0,0,.85),inset 0 0 ${28*S}px ${dGlow}14,inset 0 0 ${32*S}px rgba(0,180,255,0.28)`
          : lvl===3 ? `0 0 ${22*S}px ${t.glow}77,0 0 ${50*S}px ${t.glow}44,inset 0 0 ${45*S}px rgba(0,0,0,.72)`
          : lvl===2 ? `0 0 ${14*S}px ${t.glow}55,0 0 ${30*S}px ${t.glow}28,inset 0 0 ${38*S}px rgba(0,0,0,.68)`
          : lvl===1 ? `0 0 ${8*S}px ${t.glow}33,inset 0 0 ${30*S}px rgba(0,0,0,.60)`
          :           `inset 0 0 ${22*S}px rgba(0,0,0,.50)`,
      }}>
        {/* Textura — lvl0: nenhuma | lvl1: linhas | lvl2: grade | lvl3+: losango */}
        {lvl >= 1 && (
          <div style={{position:'absolute',inset:0,pointerEvents:'none',
            backgroundImage: isDestaque
              ? `repeating-linear-gradient(45deg,rgba(200,160,32,.042) 0px,rgba(200,160,32,.042) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(200,160,32,.042) 0px,rgba(200,160,32,.042) 1px,transparent 1px,transparent 26px)`
              : lvl===3 ? `repeating-linear-gradient(45deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 22px),repeating-linear-gradient(-45deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 22px)`
              : lvl===2 ? `repeating-linear-gradient(0deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 10px),repeating-linear-gradient(90deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 10px)`
              :           `repeating-linear-gradient(0deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 7px)`,
          }}/>
        )}
        {/* Glow topo — lvl1+ */}
        {lvl >= 1 && (
          <div style={{position:'absolute',top:0,left:0,right:0,height:H*(isDestaque?.55:.45),pointerEvents:'none',
            background:`radial-gradient(ellipse 80% 60% at 50% 0%,${effGlow}${isDestaque?'30':lvl===3?'24':lvl===2?'1a':'10'} 0%,transparent 70%)`,
          }}/>
        )}
        {/* Shine sweep — lvl2+ */}
        {lvl >= 2 && (
          <div style={{position:'absolute',top:0,bottom:0,width:'50%',pointerEvents:'none',
            background:`linear-gradient(100deg,transparent 20%,${effGlow}${isDestaque?'1e':'16'} 50%,transparent 80%)`,
            animation:`lbcShine ${isDestaque?2.8:lvl===3?3.5:5}s ease-in-out infinite`,
          }}/>
        )}
        {/* Losangos flutuantes — lvl3+ */}
        {lvl >= 3 && dDiamonds.map((d,i)=>(
          <div key={i} style={{position:'absolute',top:d.top,left:d.left,right:d.right,pointerEvents:'none',
            width:d.sz*S,height:d.sz*S,
            background:`rgba(${isDestaque?'212,160,48':'255,195,0'},${d.op})`,
            border:`1px solid rgba(${isDestaque?'212,160,48':'255,195,0'},${Math.min(1,d.op*2.2)})`,
            transform:`rotate(${d.rot}deg)`,
            boxShadow:`0 0 ${d.sz*S}px rgba(${isDestaque?'212,160,48':'255,180,0'},${d.op})`,
          }}/>
        ))}
        {/* Linha acento — lvl3+ */}
        {lvl >= 3 && (
          <div style={{position:'absolute',top:96*S,left:12*S,right:12*S,height:1,pointerEvents:'none',
            background:`linear-gradient(90deg,transparent,${effBrd}99,${effGlow}88,${effBrd}99,transparent)`,
          }}/>
        )}
        {/* ══ Dream Lobby: elementos internos extras ══ */}
        {lvl === 3 && !isDestaque && <>
          {/* Frame interno */}
          <div style={{position:'absolute',inset:`${10*S}px`,borderRadius:9*S,background:'transparent',pointerEvents:'none',
            border:`1px solid ${t.brd}44`,
            boxShadow:`inset 0 0 ${18*S}px ${t.glow}16`}}/>
          {/* Gems no meio das bordas do frame interno (não nos cantos) */}
          {[
            {top:10*S,  left:'50%', transform:'translateX(-50%)'},
            {bottom:10*S,left:'50%',transform:'translateX(-50%)'},
            {top:'50%', left:10*S,  transform:'translateY(-50%)'},
            {top:'50%', right:10*S, transform:'translateY(-50%)'},
          ].map((pos,i)=>(
            <div key={`ifg${i}`} style={{position:'absolute',...pos,pointerEvents:'none',
              width:5*S,height:5*S,borderRadius:'50%',
              background:`radial-gradient(circle,${t.score},${t.brd})`,
              boxShadow:`0 0 ${8*S}px ${t.glow}bb,0 0 ${4*S}px ${t.glow}77`}}/>
          ))}
          {/* Losango central de fundo */}
          <div style={{position:'absolute',top:'10%',left:'50%',
            width:95*S,height:95*S,pointerEvents:'none',
            transform:'translateX(-50%) rotate(45deg)',
            background:`radial-gradient(ellipse at center,${t.glow}1c 0%,${t.brd}0e 50%,transparent 70%)`,
            border:`1px solid ${t.brd}1c`}}/>
          {/* Linha acento inferior */}
          <div style={{position:'absolute',bottom:92*S,left:14*S,right:14*S,height:1,pointerEvents:'none',
            background:`linear-gradient(90deg,transparent,${effBrd}66,${effGlow}55,${effBrd}66,transparent)`}}/>
          {/* Ticks laterais centrais */}
          <div style={{position:'absolute',left:8*S,top:'42%',pointerEvents:'none',
            width:6*S,height:6*S,background:t.brd,borderRadius:1*S,
            transform:'translateY(-50%) rotate(45deg)',
            boxShadow:`0 0 ${8*S}px ${t.glow}aa`}}/>
          <div style={{position:'absolute',right:8*S,top:'42%',pointerEvents:'none',
            width:6*S,height:6*S,background:t.brd,borderRadius:1*S,
            transform:'translateY(-50%) rotate(45deg)',
            boxShadow:`0 0 ${8*S}px ${t.glow}aa`}}/>
        </>}
        {/* Gems cyan — GOAT only */}
        {isDestaque && [{p:'8% 14%',s:5},{p:'22% 7%',s:4},{p:'37% 12%',s:6},{p:'12% 29%',s:3},{p:'50% 5%',s:4},{p:'5% 42%',s:3}].map((g,i)=>{
          const [top,right]=g.p.split(' ');
          return <div key={i} style={{position:'absolute',top,right,width:g.s*S,height:g.s*S,borderRadius:'50%',
            background:'radial-gradient(circle,#ffffff,#00ccff)',
            boxShadow:`0 0 ${g.s*3*S}px #00aaff,0 0 ${g.s*6*S}px #0055ff`,
            animation:`lbcGem ${1.5+i*.4}s ease-in-out infinite`,animationDelay:`${i*.28}s`}}/>;
        })}
        {/* Anel pulsante — lvl3: dourado | GOAT: azul+dourado */}
        {lvl === 3 && (
          <div style={{position:'absolute',inset:`${5*S}px`,borderRadius:12*S,background:'transparent',pointerEvents:'none',
            border:`1px solid ${t.brd}55`,animation:'lbcBorderGlow 4.5s ease-in-out infinite'}}/>
        )}
        {isDestaque && <>
          <div style={{position:'absolute',inset:`${5*S}px`,borderRadius:12*S,background:'transparent',pointerEvents:'none',
            border:`2px solid rgba(0,210,255,0.75)`,
            boxShadow:`inset 0 0 ${24*S}px rgba(0,180,255,0.40),inset 0 0 ${55*S}px rgba(0,100,255,0.20),0 0 ${22*S}px rgba(0,210,255,0.50)`,
            animation:'lbcBorderGlow 3s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:`${13*S}px`,borderRadius:7*S,background:'transparent',pointerEvents:'none',
            border:`1px solid rgba(200,160,32,0.25)`,
            animation:'lbcBorderGlow 4s ease-in-out infinite',animationDelay:'.8s'}}/>
        </>}
      </div>

      {/* ══ GOAT: losangos nos cantos da borda ══ */}
      {isDestaque && [
        {top:5*S,left:5*S},{top:5*S,right:5*S},{bottom:5*S,left:5*S},{bottom:5*S,right:5*S},
      ].map((pos,i)=>(
        <div key={`cd${i}`} style={{position:'absolute',...pos,zIndex:9,pointerEvents:'none',
          width:9*S,height:9*S,
          background:`linear-gradient(135deg,#ffe599,${dBrd})`,
          transform:'rotate(45deg)',
          boxShadow:`0 0 ${14*S}px ${effGlow},0 0 ${8*S}px ${t.glow}99`,
        }}/>
      ))}
      {/* ══ Dream Lobby: cantos curvos ornamentados (fora do overflow:hidden) ══ */}
      {lvl === 3 && !isDestaque && <>
        <div style={{position:'absolute',top:0,left:0,width:40*S,height:40*S,zIndex:9,pointerEvents:'none',
          borderTop:`${2.5*S}px solid ${t.score}cc`,borderLeft:`${2.5*S}px solid ${t.score}cc`,
          borderTopLeftRadius:16*S,filter:`drop-shadow(0 0 ${6*S}px ${t.glow}bb)`}}/>
        <div style={{position:'absolute',top:0,right:0,width:40*S,height:40*S,zIndex:9,pointerEvents:'none',
          borderTop:`${2.5*S}px solid ${t.score}cc`,borderRight:`${2.5*S}px solid ${t.score}cc`,
          borderTopRightRadius:16*S,filter:`drop-shadow(0 0 ${6*S}px ${t.glow}bb)`}}/>
        <div style={{position:'absolute',bottom:0,left:0,width:40*S,height:40*S,zIndex:9,pointerEvents:'none',
          borderBottom:`${2.5*S}px solid ${t.score}cc`,borderLeft:`${2.5*S}px solid ${t.score}cc`,
          borderBottomLeftRadius:16*S,filter:`drop-shadow(0 0 ${6*S}px ${t.glow}bb)`}}/>
        <div style={{position:'absolute',bottom:0,right:0,width:40*S,height:40*S,zIndex:9,pointerEvents:'none',
          borderBottom:`${2.5*S}px solid ${t.score}cc`,borderRight:`${2.5*S}px solid ${t.score}cc`,
          borderBottomRightRadius:16*S,filter:`drop-shadow(0 0 ${6*S}px ${t.glow}bb)`}}/>
      </>}

      {/* ══ Losangos laterais + inferior — lvl3+ ══ */}
      {lvl >= 3 && [-1,1].map((side,i)=>(
        <div key={`sd${i}`} style={{
          position:'absolute',[side<0?'left':'right']:-5*S,top:'42%',
          transform:'translateY(-50%) rotate(45deg)',
          width:(isDestaque?11:8)*S,height:(isDestaque?11:8)*S,zIndex:9,pointerEvents:'none',
          background:isDestaque?`linear-gradient(135deg,#ffe066,${dBrd})`:`linear-gradient(135deg,${t.score},${t.brd})`,
          boxShadow:`0 0 ${15*S}px ${effGlow},0 0 ${9*S}px ${t.glow}aa`,
        }}/>
      ))}
      {lvl >= 3 && (
        <div style={{position:'absolute',bottom:-5*S,left:'50%',transform:'translateX(-50%) rotate(45deg)',
          width:(isDestaque?11:8)*S,height:(isDestaque?11:8)*S,zIndex:9,pointerEvents:'none',
          background:isDestaque?`linear-gradient(135deg,#ffe066,${dBrd})`:`linear-gradient(135deg,${t.score},${t.brd})`,
          boxShadow:`0 0 ${15*S}px ${effGlow},0 0 ${9*S}px ${t.glow}aa`,
        }}/>
      )}

      {/* ══ AURA GOAT — raios + orbes + sparkles ══ */}
      {isDestaque && <>
        <div style={{position:'absolute',top:-20*S,right:-20*S,width:130*S,height:130*S,borderRadius:'50%',
          background:`radial-gradient(circle at 50% 50%, ${dGlow}55 0%, ${dGlow}22 45%, transparent 70%)`,
          zIndex:2,pointerEvents:'none',animation:'lbcBorderGlow 2.8s ease-in-out infinite'}}/>
        <div style={{position:'absolute',top:0,right:0,width:68*S,height:68*S,borderRadius:'50%',
          background:`radial-gradient(circle at 50% 50%, ${t.glow}44 0%, transparent 65%)`,
          zIndex:2,pointerEvents:'none',animation:'lbcPulseBlue 2.1s ease-in-out infinite',animationDelay:'0.4s'}}/>
        {[{angle:92,len:115,w:2,op:.50},{angle:108,len:100,w:1.5,op:.46},{angle:122,len:110,w:1.5,op:.52},
          {angle:135,len:125,w:2.5,op:.60},{angle:148,len:105,w:1.5,op:.50},{angle:162,len:112,w:1.5,op:.52},
          {angle:175,len:95,w:1,op:.40},{angle:188,len:82,w:1,op:.30},
        ].map((r,i)=>(
          <div key={`ray${i}`} style={{position:'absolute',right:32*S,top:32*S,
            width:r.len*S,height:r.w*S,
            background:`linear-gradient(to right, transparent, ${dBrd}ee)`,
            transformOrigin:'right center',transform:`rotate(${r.angle}deg)`,
            zIndex:2,pointerEvents:'none',opacity:r.op}}/>
        ))}
        {[{top:28,right:26,s:4.5,d:'0s'},{top:14,right:48,s:3,d:'0.55s'},{top:44,right:18,s:3.5,d:'0.3s'},
          {top:18,right:66,s:2.5,d:'0.8s'},{top:50,right:42,s:2.5,d:'0.15s'},{top:8,right:30,s:2,d:'1.1s'},
        ].map((sp,i)=>(
          <div key={`spark${i}`} style={{position:'absolute',top:sp.top*S,right:sp.right*S,
            width:sp.s*S,height:sp.s*S,borderRadius:'50%',
            background:`radial-gradient(circle,#ffffff,${dGlow})`,
            boxShadow:`0 0 ${sp.s*2*S}px ${dGlow}ee,0 0 ${sp.s*6*S}px ${dGlow}77`,
            zIndex:5,pointerEvents:'none',
            animation:`lbcGem ${1.4+i*.38}s ease-in-out infinite`,animationDelay:sp.d}}/>
        ))}
        {[{top:165,left:14,s:4,d:'0.2s'},{top:195,left:30,s:3,d:'0.7s'},{top:148,left:8,s:2.5,d:'1.0s'},
          {top:220,left:48,s:3.5,d:'0.4s'},{top:242,left:18,s:2.5,d:'0.9s'},{top:178,left:58,s:2,d:'0.1s'},
        ].map((sp,i)=>(
          <div key={`bspark${i}`} style={{position:'absolute',top:sp.top*S,left:sp.left*S,
            width:sp.s*S,height:sp.s*S,borderRadius:'50%',
            background:`radial-gradient(circle,#ffffff,${t.glow})`,
            boxShadow:`0 0 ${sp.s*2*S}px ${t.glow}ff,0 0 ${sp.s*7*S}px ${t.glow}88`,
            zIndex:5,pointerEvents:'none',
            animation:`lbcGem ${1.3+i*.36}s ease-in-out infinite`,animationDelay:sp.d}}/>
        ))}
      </>}

      {/* ══ Dream Lobby: sparkles dourados distribuídos pela carta ══ */}
      {lvl === 3 && !isDestaque && <>
        {[
          /* topo direito */
          {top:24,right:18,s:3.0,d:'0s'},   {top:10,right:46,s:2.0,d:'0.5s'},
          {top:44,right:12,s:2.5,d:'0.8s'}, {top:8, right:64,s:1.5,d:'0.3s'},
          /* topo esquerdo / centro-topo */
          {top:18,left:72, s:1.5,d:'1.0s'}, {top:38,left:108,s:2.0,d:'0.6s'},
          {top:10,left:134,s:1.5,d:'1.4s'},
          /* meio direito */
          {top:105,right:18,s:2.0,d:'0.9s'},{top:148,right:44,s:1.5,d:'1.2s'},
          {top:182,right:14,s:2.5,d:'0.7s'},{top:165,right:66,s:1.5,d:'0.2s'},
          /* meio esquerdo */
          {top:118,left:28,s:2.0,d:'0.4s'}, {top:158,left:52,s:1.5,d:'1.3s'},
          {top:200,left:30,s:2.0,d:'0.1s'},
          /* baixo-médio (acima do rodapé ~315px) */
          {top:230,right:30,s:2.0,d:'0.95s'},{top:258,left:18,s:1.5,d:'0.35s'},
          {top:248,right:58,s:1.5,d:'1.1s'}, {top:288,left:66,s:1.5,d:'0.75s'},
          {top:278,right:22,s:2.0,d:'1.3s'}, {top:305,left:110,s:1.5,d:'0.5s'},
        ].map((sp,i)=>(
          <div key={`dlsp${i}`} style={{
            position:'absolute', top:sp.top*S,
            ...(sp.left!==undefined ? {left:sp.left*S} : {right:sp.right*S}),
            width:sp.s*S, height:sp.s*S, borderRadius:'50%',
            background:`radial-gradient(circle,#ffffff,${t.glow})`,
            boxShadow:`0 0 ${sp.s*2.5*S}px ${t.glow}ee,0 0 ${sp.s*5*S}px ${t.glow}55`,
            zIndex:5, pointerEvents:'none',
            animation:`lbcGem ${1.5+i*.28}s ease-in-out infinite`,animationDelay:sp.d}}/>
        ))}
      </>}

      {/* ══ TAG ICONS — coluna esquerda, estilo FIFA Playstyle (losango) ══ */}
      <TagIcons tags={card.tags} lvl={lvl} S={S} cardH={H} areaTop={isDestaque?110:95} areaBot={isDestaque?115:105}/>

      {/* ══ FOTO — wrapper clipa laterais na primeira borda interna (anel em inset:5*S em lvl>=3) ══ */}
      <div style={{
        position:'absolute', top:-150*S,
        left:  (lvl>=3 ? 5 : 0)*S,
        right: (lvl>=3 ? 5 : 0)*S,
        bottom:(lvl>=3 ? 5 : 0)*S,
        overflow:'hidden',
        borderRadius:(lvl>=3 ? 12 : 16)*S,
        zIndex:3, pointerEvents:'none',
      }}>
        {(player.photoClean||player.photo) ? (
          <img src={player.photoClean||player.photo} alt="" style={{
            position:'absolute', bottom:photoBtm, left:'56%',
            height:photoH, maxWidth:'100%',
            objectFit:player.photoClean?'contain':'cover',
            objectPosition:'top center',
            borderRadius:player.photoClean?0:8*S,
            filter: lvl===0
              ? `grayscale(35%) brightness(0.85) drop-shadow(0 0 ${6*S}px ${effGlow}44)`
              : `drop-shadow(0 ${-3*S}px ${[6,10,14,18,24][lvl]*S}px ${effGlow}${['77','99','bb','cc','ee'][lvl]})`,
            transform: 'translateX(-50%)',
          }}/>
        ) : (
          <div style={{position:'absolute',bottom:photoBtm,left:'56%',transform:'translateX(-50%)',
            width:100*S,height:140*S,borderRadius:8*S,
            background:`${effBrd}0e`,border:`${1.5*S}px dashed ${effBrd}30`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:38*S,opacity:.3}}>👤</div>
        )}
      </div>

      {/* ══ HEADER (overall + logo) — z=4 ══ */}
      <div style={{position:'absolute',top:[8,10,10,12,16][lvl]*S,left:13*S,right:13*S,
        display:'flex',justifyContent:'space-between',alignItems:'flex-start',zIndex:4}}>
        <div>
          <div style={{
            fontSize:[40,44,48,52,56][lvl]*S,
            fontWeight:900,lineHeight:1,color:effScore,letterSpacing:-2*S,fontFamily:FO,
            textShadow: lvl===0 ? 'none'
              : lvl===1 ? `0 0 ${8*S}px ${effGlow}55`
              : `0 0 ${14*S}px ${effGlow},0 0 ${28*S}px ${effGlow}66,0 0 ${55*S}px ${effGlow}22`,
          }}>
            {card.overall}
          </div>
          <div style={{fontSize:8*S,fontWeight:700,letterSpacing:2.5*S,color:effTxt,textTransform:'uppercase',fontFamily:F,
            borderTop: lvl>=2 ? `${1*S}px solid ${effBrd}55` : 'none',
            paddingTop:2*S,marginTop:1*S}}>
            {t.lbl}
          </div>
        </div>
      </div>


      {/* ══ FADE — z=6 ══ */}
      <div style={{position:'absolute',bottom:95*S,left:0,right:0,height:75*S,pointerEvents:'none',zIndex:6,
        background:`linear-gradient(0deg,rgba(4,4,18,0.82) 0%,transparent 100%)`,
      }}/>
      {/* ══ STATS FOOTER — z=7 ══ */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:7,
        background: lvl===0
          ? `linear-gradient(0deg,rgba(8,2,2,0.98) 0%,rgba(8,2,2,0.78) 55%,rgba(8,2,2,0.10) 100%)`
          : `linear-gradient(0deg,rgba(4,4,18,0.97) 0%,rgba(4,4,18,0.65) 55%,rgba(4,4,18,0.12) 100%)`,
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderTop:`${[1,1.5,1.5,2,2][lvl]*S}px solid ${effBrd}${['22','33','44','55','55'][lvl]}`,
        padding:`${10*S}px ${10*S}px ${18*S}px`,
      }}>
        <div style={{
          textAlign:'center', fontSize:21*S, fontWeight:900,
          color: lvl===0 ? '#cc8888' : '#ffffff',
          fontFamily:F, letterSpacing:1.4*S,
          textShadow: lvl===0 ? 'none' : `0 2px 8px rgba(0,0,0,.95), 0 0 ${16*S}px ${effGlow}${['','','44','55','55'][lvl]}`,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
          textTransform:'uppercase',
        }}>
          {player.nick||'???'}
        </div>
        {/* FL1IP logo destacada entre o nome e os stats */}
        <div style={{display:'flex',alignItems:'center',gap:10*S,margin:`${3*S}px 0 ${-6*S}px`}}>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${effBrd}88)`}}/>
          <img src="/logo.png" alt="" style={{height:38*S,opacity:.93,display:'block',
            filter:`drop-shadow(0 0 10px ${effGlow}aa)`}}
            onError={e=>{e.target.style.display='none'}}/>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${effBrd}88,transparent)`}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-around',alignItems:'flex-end'}}>
          {sa.map((a,i)=>(
            <div key={a.id} style={{textAlign:'center',flex:1,
              borderRight:i<sa.length-1?`1px solid ${effBrd}22`:'none',
            }}>
              <div style={{fontSize:9*S,fontWeight:700,color:effTxt,opacity:.85,
                textTransform:'uppercase',letterSpacing:.4*S,fontFamily:F,marginBottom:3*S,
                textShadow:'0 1px 4px rgba(0,0,0,.85)'}}>
                {a.name.slice(0,3)}
              </div>
              <div style={{fontSize:19*S,fontWeight:900,color:effScore,fontFamily:FO,lineHeight:1,
                textShadow:`0 2px 6px rgba(0,0,0,.9), 0 0 ${8*S}px ${effGlow}${lvl>=2?'88':'44'}`}}>
                {Math.round(card.scores?.[a.id]??0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// ═══ HOME ════════════════════════════════════════════════════
const StatHud = ({ value, label, col=R }) => (
  <Panel accent={col} style={{padding:'18px 18px 14px'}}>
    <div style={{fontFamily:FHUD,fontWeight:700,fontSize:10.5,letterSpacing:2.5,color:col,textTransform:'uppercase',marginBottom:6}}>{label}</div>
    <div style={{fontFamily:FO,fontWeight:900,fontSize:38,color:'#f0e8e8',lineHeight:1,letterSpacing:-1,textShadow:`0 0 14px ${col}55`}}>{value}</div>
  </Panel>
);

const HomeTab = ({ players, sessions, attrs, onGoSunday }) => {
  const last = [...sessions].sort((a,b) => b.date.localeCompare(a.date))[0];
  if(!last) return (
    <Panel style={{textAlign:'center',padding:'40px 20px',maxWidth:540,margin:'40px auto'}}>
      <div style={{fontSize:52,marginBottom:14}}>🎮</div>
      <div style={{fontSize:15,color:'#c09090',fontFamily:F,fontWeight:600}}>Nenhum domingo realizado ainda.</div>
      <div style={{fontSize:12,color:'#907070',marginTop:6,fontFamily:F}}>Cadastre jogadores e inicie a primeira sessão!</div>
    </Panel>
  );
  const ranked = [...(last.cards||[])].sort((a,b) => b.overall - a.overall);
  const top = ranked[0];
  const topPlayer = top ? players.find(p => p.id === top.playerId) : null;
  const avg = ranked.length ? Math.round(ranked.reduce((s,c) => s + c.overall, 0) / ranked.length) : 0;
  const tierCount = TIERS.map(t => ({ t, n: ranked.filter(c => getTier(c.overall).name === t.name).length }));
  const dateLabel = new Date(last.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      {/* hero */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20,marginBottom:28}}>
        <div style={{flex:1,minWidth:280}}>
          <div style={{fontFamily:FHUD,fontWeight:700,fontSize:10.5,letterSpacing:2.5,color:'#c09090',textTransform:'uppercase'}}>
            RANKING DA SEMANA · {dateLabel}
          </div>
          <h1 style={{fontFamily:FO,fontWeight:900,fontSize:52,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1,lineHeight:1}}>
            O LOBBÃO <span style={{color:R}}>FALOU.</span>
          </h1>
          <div style={{fontFamily:F,fontSize:16,color:'#c09090',marginTop:8}}>
            {ranked.length} cartas reveladas no último domingo. Confere quem mandou bem (e quem freezou).
          </div>
        </div>
        {onGoSunday && <Btn size="lg" onClick={onGoSunday}>▲ AVALIAR DOMINGO</Btn>}
      </div>
      {/* stat HUD row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:32}}>
        <StatHud label="JOGADORES"     value={ranked.length}                              col={R}/>
        <StatHud label="MÉDIA GERAL"   value={avg}                                        col="#33bb55"/>
        <StatHud label="MAIOR OVERALL" value={top?.overall ?? 0}                          col={top ? getTier(top.overall).brd : R}/>
        <StatHud label="DOMINGOS"      value={sessions.length}                            col="#ffd700"/>
      </div>
      {/* destaque: top card + ranking list */}
      <div style={{display:'grid',gridTemplateColumns:'minmax(260px,300px) 1fr',gap:30,alignItems:'start'}}>
        <div className="lbc-pop">
          <SectionLabel style={{marginBottom:14}}>★ CARTA DA SEMANA</SectionLabel>
          <div style={{display:'flex',justifyContent:'center'}}>
            {topPlayer && <AnyCard player={topPlayer} card={top} attrs={attrs} scale={1.0}/>}
          </div>
        </div>
        <div>
          <SectionLabel style={{marginBottom:14}}>CLASSIFICAÇÃO COMPLETA</SectionLabel>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {ranked.map((c, i) => {
              const p = players.find(pl => pl.id === c.playerId);
              const t = getTier(c.overall);
              if(!p) return null;
              return (
                <div key={c.playerId} className="lbc-pop" style={{animationDelay:`${i*0.06}s`}}>
                  <Panel accent={t.brd} style={{display:'flex',alignItems:'center',gap:16,padding:'12px 18px'}}>
                    <div style={{fontFamily:FO,fontWeight:900,fontSize:22,color:'#907070',width:30,flexShrink:0}}>{String(i+1).padStart(2,'0')}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:FO,fontWeight:800,fontSize:20,color:'#f0e8e8',letterSpacing:.5}}>{p.nick}</div>
                      <div style={{fontFamily:FHUD,fontWeight:600,fontSize:9.5,letterSpacing:2,color:t.brd,textTransform:'uppercase',marginTop:2}}>{t.lbl}</div>
                    </div>
                    <div style={{display:'flex',gap:3,alignItems:'flex-end',height:26,flexShrink:0}}>
                      {(attrs||[]).slice(0,6).map((a) => {
                        const v = c.scores?.[a.id] ?? 0;
                        return <div key={a.id} title={`${a.name}: ${Math.round(v)}`} style={{width:5,height:`${Math.max(8,v)}%`,background:`linear-gradient(${t.glow},${t.brd})`,opacity:.85,borderRadius:1}}/>;
                      })}
                    </div>
                    <div style={{fontFamily:FO,fontWeight:900,fontSize:32,color:t.score,width:52,textAlign:'right',textShadow:`0 0 12px ${t.glow}66`,flexShrink:0}}>{c.overall}</div>
                  </Panel>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* distribuição por tier */}
      <div style={{marginTop:36}}>
        <SectionLabel style={{marginBottom:14}}>DISTRIBUIÇÃO POR TIER</SectionLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
          {tierCount.map(({t,n}, i) => (
            <div key={t.name} className="lbc-pop" style={{animationDelay:`${i*0.05}s`}}>
              <Panel style={{padding:'16px 14px',textAlign:'center'}}>
                <div style={{position:'absolute',inset:0,background:`linear-gradient(180deg,${t.brd}22,transparent)`,pointerEvents:'none'}}/>
                <div style={{position:'relative'}}>
                  <div style={{fontFamily:FO,fontWeight:900,fontSize:40,color:t.score,textShadow:`0 0 14px ${t.glow}66`,lineHeight:1}}>{n}</div>
                  <div style={{fontFamily:FHUD,fontWeight:700,fontSize:9.5,letterSpacing:1.5,color:t.brd,marginTop:5,textTransform:'uppercase'}}>{t.lbl}</div>
                  <div style={{fontFamily:FHUD,fontWeight:500,fontSize:8.5,letterSpacing:1,color:'#806060',marginTop:3}}>{t.min}–{t.max}</div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// ═══ PLAYERS ═════════════════════════════════════════════════
const PlayersTab = ({ players, setPlayers, apiKey }) => {
  const [open,       setOpen]       = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState({nick:'',gcNick:''});
  const [photo,      setPhoto]      = useState(null);
  const [photoClean, setPhotoClean] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState('');
  const fRef = useRef();
  const openForm = (p=null) => {
    setEditId(p?.id||null);
    setForm({nick:p?.nick||'',gcNick:p?.gcNick||''});
    setPhoto(p?.photo||null);
    setPhotoClean(p?.photoClean||null);
    setErr(''); setOpen(true);
  };
  const handleFile = e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => { setPhoto(r.result); setPhotoClean(null); };
    r.readAsDataURL(f);
  };
  const removeBg = async () => {
    if(!photo) return;
    if(!apiKey) { setErr('⚠️ Configure a API key na aba Config!'); return; }
    setLoading(true); setErr('');
    try {
      const blob = b64Blob(photo);
      const fd   = new FormData();
      fd.append('image_file', blob, 'p.jpg');
      fd.append('size', 'auto');
      const resp = await fetch('https://api.remove.bg/v1.0/removebg', {
        method:'POST', headers:{'X-Api-Key':apiKey}, body:fd,
      });
      if(!resp.ok) { setErr(`Erro ${resp.status}: verifique a API key.`); return; }
      const out = await resp.blob();
      const rd  = new FileReader();
      rd.onload = () => setPhotoClean(rd.result);
      rd.readAsDataURL(out);
    } catch(e) { setErr('Erro: '+e.message); }
    finally    { setLoading(false); }
  };
  const save = () => {
    if(!form.nick.trim()) { setErr('Nick é obrigatório!'); return; }
    if(editId)
      setPlayers(players.map(p => p.id===editId ? {...p,...form,photo:photo||p.photo,photoClean:photoClean||p.photoClean} : p));
    else
      setPlayers([...players, {id:Date.now().toString(),...form,photo,photoClean}]);
    setOpen(false);
  };
  const del = id => { if(confirm('Remover jogador?')) setPlayers(players.filter(p => p.id!==id)); };
  return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      {/* hero */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:20,marginBottom:28}}>
        <div>
          <SectionLabel style={{marginBottom:0}}>ELENCO DO LOBBÃO · {players.length} JOGADOR{players.length===1?'':'ES'}</SectionLabel>
          <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>OS <span style={{color:R}}>JOGADORES</span></h1>
        </div>
        <Btn size="lg" onClick={()=>openForm()}>+ ADICIONAR JOGADOR</Btn>
      </div>
      {open && (
        <Panel style={{marginBottom:24,padding:24}}>
          <SectionLabel style={{marginBottom:18}}>{editId ? '✏️ EDITAR JOGADOR' : '➕ NOVO JOGADOR'}</SectionLabel>
          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:210}}>
              <Field label="Nick na Live"    value={form.nick}   onChange={v => setForm(f=>({...f,nick:v}))}/>
              <Field label="Nick GamersCLub" value={form.gcNick} onChange={v => setForm(f=>({...f,gcNick:v}))} placeholder="Opcional"/>
              <div style={{marginTop:4}}>
                <label style={{fontSize:10.5,color:'#c09090',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:1.8,fontFamily:F,fontWeight:700}}>Foto</label>
                <input ref={fRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  <Btn onClick={() => fRef.current?.click()} v="ghost" size="sm">📷 Selecionar</Btn>
                  {photo && !photoClean && (
                    <Btn onClick={removeBg} v="success" size="sm" disabled={loading}>
                      {loading ? '⏳ Removendo...' : '✨ Remover Fundo'}
                    </Btn>
                  )}
                  {photoClean && <span style={{color:'#44dd88',fontSize:12.5,fontFamily:F,fontWeight:600}}>✅ Fundo removido!</span>}
                </div>
              </div>
              {err && <div style={{color:'#ff7755',fontSize:12,marginTop:10,fontFamily:F}}>{err}</div>}
              <div style={{display:'flex',gap:8,marginTop:18}}>
                <Btn onClick={save} v="success">💾 Salvar</Btn>
                <Btn onClick={() => setOpen(false)} v="danger">✕ Cancelar</Btn>
              </div>
            </div>
            {(photo || photoClean) && (
              <div style={{display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
                {photo && (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#c09090',marginBottom:6,fontFamily:F,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase'}}>Original</div>
                    <img src={photo} style={{width:90,height:120,objectFit:'cover',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)'}}/>
                  </div>
                )}
                {photoClean && (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#44dd88',marginBottom:6,fontFamily:F,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase'}}>Sem fundo ✨</div>
                    <img src={photoClean} style={{width:90,height:120,objectFit:'contain',borderRadius:8,border:'1px solid rgba(68,221,136,.2)',background:'rgba(0,0,0,.5)'}}/>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:16}}>
        {players.map((p,i) => (
          <div key={p.id} className="lbc-pop" style={{animationDelay:`${i*0.05}s`}}>
            <Panel style={{padding:18,textAlign:'center'}}>
              <div style={{width:90,height:120,margin:'0 auto',borderRadius:10,overflow:'hidden',
                background:'linear-gradient(170deg,#1a0606,#0a0404)',border:'1px solid rgba(255,255,255,0.08)',
                position:'relative',boxShadow:`0 4px 14px rgba(0,0,0,0.5)`}}>
                {(p.photoClean || p.photo) ? (
                  <img src={p.photoClean||p.photo} alt="" style={{width:'100%',height:'100%',
                    objectFit:p.photoClean?'contain':'cover',background:'rgba(0,0,0,.3)'}}/>
                ) : (
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
                    fontFamily:FO,fontWeight:900,fontSize:34,color:'rgba(255,255,255,0.15)',letterSpacing:-1}}>
                    {(p.nick||'??').slice(0,2).toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{fontFamily:FO,fontWeight:800,marginTop:12,fontSize:17,color:'#f0e8e8',letterSpacing:.5}}>{p.nick}</div>
              {p.gcNick && <div style={{fontFamily:FHUD,fontSize:10,color:'#907070',marginTop:2,letterSpacing:1,textTransform:'uppercase'}}>{p.gcNick}</div>}
              <div style={{display:'flex',gap:6,justifyContent:'center',marginTop:12}}>
                <Btn onClick={() => openForm(p)} v="ghost"  size="xs">✏️ Editar</Btn>
                <Btn onClick={() => del(p.id)}   v="danger" size="xs">🗑️</Btn>
              </div>
            </Panel>
          </div>
        ))}
      </div>
      {!players.length && !open && (
        <Panel style={{textAlign:'center',padding:'40px 20px',maxWidth:540,margin:'40px auto'}}>
          <div style={{fontSize:44,marginBottom:12}}>👥</div>
          <div style={{fontSize:14,color:'#c09090',fontFamily:F,fontWeight:600}}>Nenhum jogador cadastrado.</div>
          <div style={{fontSize:12,color:'#907070',marginTop:6,fontFamily:F}}>Clique em "+ Adicionar Jogador" pra começar.</div>
        </Panel>
      )}
    </div>
  );
};
// ═══ ATTRS ═══════════════════════════════════════════════════
const AttrsTab = ({ attrs, setAttrs }) => {
  const [form,   setForm]   = useState({name:'',weight:'10'});
  const [editId, setEditId] = useState(null);
  const total = attrs.reduce((s,a) => s+Number(a.weight), 0);
  const save = () => {
    if(!form.name.trim()) return;
    const w = Math.max(1, Math.min(100, Number(form.weight)||10));
    if(editId) {
      setAttrs(attrs.map(a => a.id===editId ? {...a,name:form.name,weight:w} : a));
      setEditId(null);
    } else {
      setAttrs([...attrs, {id:Date.now().toString(),name:form.name,weight:w}]);
    }
    setForm({name:'',weight:'10'});
  };
  const totalCol = total===100 ? '#33bb55' : '#ff8844';
  return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      {/* hero */}
      <div style={{marginBottom:28}}>
        <SectionLabel style={{marginBottom:0}}>FÓRMULA DO OVERALL</SectionLabel>
        <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>OS <span style={{color:R}}>ATRIBUTOS</span></h1>
        <div style={{fontFamily:F,fontSize:15,color:'#c09090',marginTop:8,maxWidth:620}}>
          Cada atributo pesa diferente no overall. A soma dos pesos é <span style={{fontFamily:FO,fontWeight:800,color:totalCol}}>{total}%</span> {total===100?'✅':'⚠️ (ideal: 100%)'}. Ajuste como o Lobbão valoriza cada skill.
        </div>
      </div>

      {/* form de novo atributo */}
      <Panel style={{padding:'18px 22px',marginBottom:20}}>
        <SectionLabel style={{marginBottom:14}}>{editId ? '✏️ EDITAR ATRIBUTO' : '+ NOVO ATRIBUTO'}</SectionLabel>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div style={{flex:1,minWidth:180}}>
            <Field label="Nome do Atributo" value={form.name} onChange={v => setForm(f=>({...f,name:v}))}/>
          </div>
          <div style={{width:110}}>
            <Field label="Peso %" value={form.weight} onChange={v => setForm(f=>({...f,weight:v}))} type="number"/>
          </div>
          <div style={{paddingBottom:14,display:'flex',gap:8}}>
            <Btn onClick={save} v="success">{editId ? '✔ Salvar' : '+ Adicionar'}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setForm({name:'',weight:'10'}); }} v="ghost">✕ Cancelar</Btn>}
          </div>
        </div>
      </Panel>

      {/* grid de atributos */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:36}}>
        {attrs.map((a,i) => (
          <div key={a.id} className="lbc-pop" style={{animationDelay:`${i*0.05}s`}}>
            <Panel accent={R} style={{padding:'18px 20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FO,fontWeight:800,fontSize:20,color:'#f0e8e8',letterSpacing:.5}}>{a.name}</div>
                  <div style={{fontFamily:FHUD,fontWeight:600,fontSize:10,letterSpacing:2,color:'#907070',textTransform:'uppercase',marginTop:2}}>
                    SIGLA · {a.name.slice(0,3).toUpperCase()}
                  </div>
                </div>
                <div style={{fontFamily:FO,fontWeight:900,fontSize:32,color:R,textShadow:`0 0 12px ${R}55`,letterSpacing:-1}}>{a.weight}%</div>
              </div>
              <div style={{height:6,marginTop:14,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(100,(a.weight/25)*100)}%`,background:`linear-gradient(90deg,${R},#ff6644)`,borderRadius:3,boxShadow:`0 0 6px ${R}66`}}/>
              </div>
              <div style={{display:'flex',gap:6,marginTop:14,justifyContent:'flex-end'}}>
                <Btn onClick={() => { setForm({name:a.name,weight:String(a.weight)}); setEditId(a.id); }} v="ghost"  size="xs">✏️ Editar</Btn>
                <Btn onClick={() => { if(confirm(`Remover "${a.name}"?`)) setAttrs(attrs.filter(x => x.id!==a.id)); }} v="danger" size="xs">🗑️</Btn>
              </div>
            </Panel>
          </div>
        ))}
      </div>

      {/* tags reference */}
      <SectionLabel style={{marginBottom:14}}>TAGS DE ESTILO · MULTIPLICADORES</SectionLabel>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
        {TAGS.map((tg,i) => {
          const isPos = tg.type==='pos';
          const col = isPos ? '#33bb55' : '#ff7755';
          return (
            <div key={tg.id} className="lbc-pop" style={{animationDelay:`${i*0.04}s`}}>
              <Panel style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                <div style={{fontFamily:FO,fontWeight:900,fontSize:22,color:col,width:24,textAlign:'center'}}>{isPos?'+':'−'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:FO,fontWeight:800,fontSize:16,color:'#f0e8e8'}}>{tg.label}</div>
                  <div style={{fontFamily:FHUD,fontWeight:600,fontSize:9.5,letterSpacing:1.5,color:'#907070'}}>×{isPos?'1.1':'0.9'}</div>
                </div>
              </Panel>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// ═══ PACK OPENING ════════════════════════════════════════════
const PackOpening = ({ player, card, attrs, onDismiss }) => {
  const [phase, setPhase] = useState(0);
  const t = getTier(card?.overall??0);
  const lvl = TIER_LEVEL[t.name]??0;
  const ringCol = lvl>=3 ? G_GOLD.mid : t.glow;
  useEffect(()=>{
    const steps=[80,600,1100,1700,2500,3100,3700];
    const timers=steps.map((d,i)=>setTimeout(()=>setPhase(i),d));
    return ()=>timers.forEach(clearTimeout);
  },[]);
  const handleClick=()=>{ if(phase>=6) onDismiss&&onDismiss(); };
  return (
    <div onClick={handleClick} style={{
      position:'fixed',inset:0,zIndex:9000,overflow:'hidden',
      background:'radial-gradient(80% 60% at 50% 50%,rgba(20,4,4,0.92),rgba(0,0,0,0.98))',
      opacity:phase>=0?1:0,transition:'opacity .35s',
      cursor:phase>=6?'pointer':'default',
    }}>
      {/* fumaça */}
      <div style={{position:'absolute',inset:0,opacity:phase>=1?1:0,transition:'opacity .7s'}}>
        <div className="lbc-smoke" style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'200%',backgroundPosition:'40% 40%',opacity:.85,mixBlendMode:'screen'}}/>
        <div style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'140%',backgroundPosition:'20% 60%',opacity:.6,mixBlendMode:'screen'}}/>
        <div style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'180%',backgroundPosition:'60% 30%',
          opacity:lvl>=3?.35:.2,mixBlendMode:'screen',
          filter:lvl>=3?'hue-rotate(34deg)':'none'}}/>
      </div>
      {/* radial de cor */}
      <div style={{position:'absolute',inset:0,
        background:`radial-gradient(45% 35% at 50% 50%,${ringCol}${phase>=3?'55':'20'},transparent 70%)`,
        transition:'all .8s',opacity:phase>=1?1:0}}/>
      {/* pincelada branca */}
      <div style={{position:'absolute',top:'50%',left:'-30%',width:'160%',
        transform:'translateY(-50%) rotate(-7deg)',
        animation:phase>=2?'lbcPackSwipe 1.1s cubic-bezier(.4,0,.2,1) forwards':'none',
        opacity:phase>=2?1:0}}>
        <img src="/paint-swoosh.png" alt="" style={{width:'100%',display:'block',opacity:.85}}/>
      </div>
      {/* raios (tier alto) */}
      {phase>=3&&lvl>=3&&(
        <div style={{position:'absolute',top:'50%',left:'50%',width:1000,height:1000,
          transform:'translate(-50%,-50%)',pointerEvents:'none'}}>
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} style={{position:'absolute',top:'50%',left:'50%',
              width:4,height:600,background:`linear-gradient(${ringCol},transparent)`,
              transformOrigin:'50% 0',transform:`translate(-50%,0) rotate(${i*30}deg)`,
              opacity:phase>=4?.4:0,transition:'opacity .6s',
              filter:`blur(2px) drop-shadow(0 0 8px ${ringCol})`}}/>
          ))}
        </div>
      )}
      {/* burst ring */}
      {phase>=4&&(
        <div style={{position:'absolute',top:'50%',left:'50%',width:200,height:200,
          transform:'translate(-50%,-50%)',borderRadius:'50%',
          border:`3px solid ${ringCol}`,animation:'lbcPackBurst 1.1s cubic-bezier(.2,.6,.4,1) forwards',
          boxShadow:`0 0 40px ${ringCol}`}}/>
      )}
      {/* carta */}
      <div style={{position:'absolute',top:'50%',left:'50%',
        animation:phase>=3?'lbcPackCardIn 1.0s cubic-bezier(.2,.7,.3,1) forwards':'none',
        opacity:phase>=3?1:0}}>
        <AnyCard player={player} card={card} attrs={attrs} scale={1.2}/>
      </div>
      {/* tier gigante atrás */}
      {phase>=5&&(
        <div style={{position:'absolute',top:'50%',left:'50%',
          transform:'translate(-50%,-50%)',
          fontFamily:FO,fontWeight:900,fontSize:220,color:'transparent',
          WebkitTextStroke:`1px ${ringCol}33`,letterSpacing:14,whiteSpace:'nowrap',
          opacity:0,animation:'lbcPackTierIn .8s ease-out forwards',
          pointerEvents:'none',zIndex:-1}}>{t.lbl}</div>
      )}
      {/* cue continuar */}
      {phase>=6&&(
        <div style={{position:'absolute',bottom:48,left:0,right:0,textAlign:'center',
          fontFamily:FHUD,fontWeight:600,fontSize:11,letterSpacing:4,
          color:'#fff',opacity:.85,textTransform:'uppercase',
          animation:'lbcPackCue 1.4s ease-in-out infinite'}}>
          CLIQUE PARA CONTINUAR
        </div>
      )}
      {/* logo */}
      <div style={{position:'absolute',top:24,left:28,opacity:phase>=5?.85:0,transition:'opacity .8s'}}>
        <img src="/logo.png" alt="" style={{height:42,filter:`drop-shadow(0 0 10px ${R})`}}
          onError={e=>{e.target.style.display='none'}}/>
      </div>
      {/* label topo */}
      {phase>=5&&(
        <div style={{position:'absolute',top:36,left:0,right:0,textAlign:'center',
          fontFamily:FHUD,fontWeight:700,fontSize:11,letterSpacing:5,
          color:ringCol,textShadow:`0 0 12px ${ringCol}`,
          opacity:0,animation:'lbcPackCue .8s ease-out forwards'}}>
          OVERALL REVELADO · {t.lbl}
        </div>
      )}
    </div>
  );
};
// ═══ DOMINGO ═════════════════════════════════════════════════
const TAGS = [
  {id:'baiter',    label:'Baiter',    type:'neg'},
  {id:'tiltado',   label:'Tiltado',   type:'neg'},
  {id:'mutadinho', label:'Mutadinho', type:'neg'},
  {id:'genteboa',  label:'Good Vibes',   type:'pos'},
  {id:'esforçado', label:'Esforçado',    type:'pos'},
  {id:'deagle',    label:'Desert Eagle', type:'pos'},
];
const SundayTab = ({ players, attrs, sessions, setSessions }) => {
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [cards,   setCards]   = useState([]);
  const [scoring, setScoring] = useState(null);
  const [scores,  setScores]  = useState({});
  const [tags,    setTags]    = useState({});
  const [preview,  setPreview]  = useState(null);
  const [packOpen, setPackOpen] = useState(null); // {card, player}

  const baseOverall = scoring ? calc(scores, attrs) : 0;
  const negCount = TAGS.filter(t => t.type==='neg' && tags[t.id]).length;
  const posCount = TAGS.filter(t => t.type==='pos' && tags[t.id]).length;
  const mult = posCount > negCount ? 1.1 : negCount > posCount ? 0.9 : 1.0;
  const overall = Math.min(99, Math.round(baseOverall * mult));
  const tier = getTier(overall);

  const toggleTag = id => setTags(t => ({...t, [id]: !t[id]}));
  const start = p => { setScoring(p); setScores(Object.fromEntries(attrs.map(a => [a.id,50]))); setTags({}); setPreview(null); };
  const gen   = () => {
    if(!scoring) return;
    const c  = {playerId:scoring.id, scores:{...scores}, overall, tags:{...tags}};
    const nc = [...cards.filter(x => x.playerId!==scoring.id), c];
    setCards(nc); setPreview({card:c, player:scoring}); setScoring(null);
    setPackOpen({card:c, player:scoring});
  };
  const saveSess = () => {
    if(!cards.length) return;
    setSessions([...sessions.filter(s => s.date!==date), {id:Date.now().toString(),date,cards:[...cards]}]);
    alert(`✅ Sessão salva com ${cards.length} cartinha${cards.length>1?'s':''}!`);
  };
  const ratedIds = cards.map(c => c.playerId);
  const dateLabel = date ? new Date(date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'}).toUpperCase() : '';
  return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      {/* hero */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:20,marginBottom:24}}>
        <div>
          <SectionLabel style={{marginBottom:0}}>AVALIAÇÃO DE DOMINGO · {dateLabel}</SectionLabel>
          <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>MONTAR A <span style={{color:R}}>CARTA</span></h1>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{background:'rgba(15,4,4,.85)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:8,padding:'10px 14px',color:'#f0e8e8',fontSize:13,fontFamily:F,outline:'none'}}/>
          <Btn onClick={saveSess} v="success" disabled={!cards.length}>💾 Salvar Sessão ({cards.length})</Btn>
        </div>
      </div>

      {!players.length ? (
        <Panel style={{textAlign:'center',padding:'40px 20px',maxWidth:540,margin:'40px auto'}}>
          <div style={{fontSize:44,marginBottom:12}}>👥</div>
          <div style={{fontSize:14,color:'#c09090',fontFamily:F,fontWeight:600}}>Cadastre jogadores primeiro.</div>
        </Panel>
      ) : !scoring ? (
        <>
          {/* seletor de jogador */}
          <SectionLabel style={{marginBottom:14}}>QUEM TÁ NA MIRA?</SectionLabel>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:30}}>
            {players.map(p => {
              const rated = ratedIds.includes(p.id);
              return (
                <button key={p.id} onClick={()=>start(p)} className="lbc-ppl-pick" style={{
                  fontFamily:FHUD,fontWeight:700,fontSize:12,letterSpacing:1.4,padding:'10px 16px',
                  background: rated ? 'rgba(68,221,136,0.12)' : 'rgba(255,255,255,0.05)',
                  color: rated ? '#44dd88' : '#f0e8e8',
                  border: `1px solid ${rated ? 'rgba(68,221,136,0.4)' : 'rgba(255,255,255,0.13)'}`,
                  cursor:'pointer',textTransform:'uppercase',transition:'all .15s',
                  display:'flex',alignItems:'center',gap:9,borderRadius:8,
                }}>
                  {(p.photoClean||p.photo)
                    ? <img src={p.photoClean||p.photo} alt="" style={{width:24,height:24,borderRadius:'50%',objectFit:'cover'}}/>
                    : <span style={{fontSize:14}}>👤</span>}
                  {p.nick}{rated && <span style={{fontSize:11}}>✓</span>}
                </button>
              );
            })}
          </div>

          {ratedIds.length > 0 && (
            <>
              <SectionLabel color="#44dd88" style={{marginBottom:14}}>✅ AVALIADOS NESTA SESSÃO · {ratedIds.length}</SectionLabel>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:18,justifyItems:'center',marginBottom:24}}>
                {players.filter(p => ratedIds.includes(p.id)).map((p,i) => {
                  const c = cards.find(x => x.playerId===p.id);
                  return c ? (
                    <div key={p.id} className="lbc-pop" style={{animationDelay:`${i*0.05}s`,cursor:'pointer'}} onClick={() => setPreview({card:c,player:p})}>
                      <AnyCard player={p} card={c} attrs={attrs} scale={0.74}/>
                    </div>
                  ) : null;
                })}
              </div>
            </>
          )}
        </>
      ) : (
        // ── modo edição: 2 colunas (sliders | preview sticky) ──
        <div style={{display:'grid',gridTemplateColumns:'1fr minmax(280px,340px)',gap:30,alignItems:'start'}}>
          {/* coluna esquerda — sliders + tags */}
          <div>
            <Panel style={{padding:'22px 26px',marginBottom:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16,flexWrap:'wrap',gap:8}}>
                <SectionLabel style={{marginBottom:0}}>ATRIBUTOS · {scoring.nick}</SectionLabel>
                <Btn onClick={() => setScoring(null)} v="ghost" size="xs">✕ Trocar jogador</Btn>
              </div>
              {attrs.map(a => {
                const v = scores[a.id]??50;
                const at = getTier(v);
                return (
                  <div key={a.id} style={{marginBottom:18}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:7}}>
                      <div style={{fontFamily:FHUD,fontWeight:700,fontSize:12.5,letterSpacing:1,color:'#f0e8e8',textTransform:'uppercase'}}>
                        {a.name} <span style={{color:'#806060',fontSize:10,letterSpacing:.5}}>· peso {a.weight}%</span>
                      </div>
                      <div style={{fontFamily:FO,fontWeight:900,fontSize:26,color:at.score,textShadow:`0 0 10px ${at.glow}55`,minWidth:44,textAlign:'right'}}>{Math.round(v)}</div>
                    </div>
                    <input type="range" className="lbc-range" min="0" max="100" step="1" value={v}
                      onChange={e => setScores(s => ({...s,[a.id]:Number(e.target.value)}))}
                      style={{'--c':tier.brd,'--p':`${v}%`,width:'100%'}}/>
                  </div>
                );
              })}
            </Panel>

            <Panel style={{padding:'20px 26px'}}>
              <SectionLabel style={{marginBottom:14}}>TAGS DE ESTILO <span style={{color:'#806060',fontWeight:500,letterSpacing:1}}>· ajustam o multiplicador</span></SectionLabel>
              <div style={{display:'flex',flexWrap:'wrap',gap:9}}>
                {TAGS.map(tag => {
                  const on = !!tags[tag.id];
                  const neg = tag.type === 'neg';
                  const col = neg ? '#ff7755' : '#33bb55';
                  return (
                    <button key={tag.id} onClick={()=>toggleTag(tag.id)} style={{
                      fontFamily:FHUD,fontWeight:700,fontSize:11.5,letterSpacing:1,padding:'8px 14px',
                      background: on ? `${col}22` : 'rgba(255,255,255,0.04)',
                      color: on ? col : '#907070',
                      border: `1px solid ${on ? col : 'rgba(255,255,255,0.13)'}`,
                      cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all .15s',borderRadius:6,
                    }}>
                      <span style={{fontSize:13,fontWeight:900}}>{neg?'−':'+'}</span>{tag.label}
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* coluna direita — preview ao vivo (sticky) */}
          <div style={{position:'sticky',top:20}}>
            <SectionLabel style={{marginBottom:14,textAlign:'center'}}>PREVIEW AO VIVO</SectionLabel>
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <AnyCard player={scoring} card={{scores,overall,tags}} attrs={attrs} scale={0.92}/>
            </div>
            <Panel style={{padding:'14px 18px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:F,fontSize:13,color:'#c09090',marginBottom:6}}>
                <span>Overall base</span>
                <span style={{fontFamily:FO,fontWeight:800,fontSize:16,color:'#f0e8e8'}}>{baseOverall}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:F,fontSize:13,color:'#c09090',marginBottom:6}}>
                <span>Multiplicador tags</span>
                <span style={{fontFamily:FO,fontWeight:800,fontSize:16,color: mult>1 ? '#44dd88' : mult<1 ? '#ff7755' : '#907070'}}>×{mult.toFixed(2)}</span>
              </div>
              <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',marginTop:8,paddingTop:8,
                display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                <span style={{fontFamily:FHUD,fontWeight:700,fontSize:11,letterSpacing:2,color:tier.brd,textTransform:'uppercase'}}>{tier.lbl}</span>
                <span style={{fontFamily:FO,fontWeight:900,fontSize:32,color:tier.score,textShadow:`0 0 14px ${tier.glow}77`,letterSpacing:-1}}>{overall}</span>
              </div>
            </Panel>
            <Btn onClick={gen} v="success" size="lg" style={{width:'100%'}}>★ REVELAR CARTA</Btn>
          </div>
        </div>
      )}

      {preview && !scoring && (
        <Panel style={{marginTop:20,textAlign:'center',padding:'24px 20px'}}>
          <div style={{fontSize:15,color:'#44dd88',marginBottom:16,fontWeight:700,fontFamily:F,letterSpacing:.5}}>
            ✅ Cartinha de {preview.player.nick} gerada!
          </div>
          <div style={{display:'flex',justifyContent:'center'}}>
            <AnyCard player={preview.player} card={preview.card} attrs={attrs} scale={1.05} reveal/>
          </div>
          <div style={{marginTop:16}}>
            <Btn onClick={()=>setPreview(null)} v="ghost" size="sm">✕ Fechar</Btn>
          </div>
        </Panel>
      )}
      {packOpen && (
        <PackOpening player={packOpen.player} card={packOpen.card} attrs={attrs}
          onDismiss={()=>setPackOpen(null)}/>
      )}
    </div>
  );
};
// ═══ HISTÓRICO ═══════════════════════════════════════════════
const HistoryTab = ({ sessions, players, attrs }) => {
  const sorted = [...sessions].sort((a,b) => b.date.localeCompare(a.date));
  const [openId, setOpenId] = useState(sorted[0]?.id || null);
  if(!sessions.length) return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      <div style={{marginBottom:28}}>
        <SectionLabel style={{marginBottom:0}}>ARQUIVO DE DOMINGOS</SectionLabel>
        <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>O <span style={{color:R}}>HISTÓRICO</span></h1>
      </div>
      <Panel style={{textAlign:'center',padding:'40px 20px',maxWidth:540,margin:'40px auto'}}>
        <div style={{fontSize:44,marginBottom:12}}>📊</div>
        <div style={{fontSize:14,color:'#c09090',fontFamily:F,fontWeight:600}}>Nenhuma sessão salva ainda.</div>
        <div style={{fontSize:12,color:'#907070',marginTop:6,fontFamily:F}}>Avalie um domingo e salve a sessão pra começar a montar o histórico.</div>
      </Panel>
    </div>
  );
  return (
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 6px 70px'}}>
      <div style={{marginBottom:28}}>
        <SectionLabel style={{marginBottom:0}}>ARQUIVO DE DOMINGOS</SectionLabel>
        <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>O <span style={{color:R}}>HISTÓRICO</span></h1>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {sorted.map((s,i) => {
          const ranked = [...(s.cards||[])].sort((a,b)=>b.overall-a.overall);
          const top = ranked[0];
          const topPlayer = top ? players.find(p => p.id===top.playerId) : null;
          const isOpen = openId === s.id;
          const topTier = top ? getTier(top.overall) : null;
          const dateLong = new Date(s.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
          const weekday  = new Date(s.date+'T12:00').toLocaleDateString('pt-BR',{weekday:'long'});
          return (
            <div key={s.id} className="lbc-pop" style={{animationDelay:`${i*0.05}s`}}>
              <Panel accent={topTier?.brd || R} style={{padding:0}}>
                <button onClick={()=>setOpenId(isOpen?null:s.id)} style={{
                  width:'100%',display:'flex',alignItems:'center',gap:18,padding:'18px 24px',
                  background:'transparent',border:'none',cursor:'pointer',textAlign:'left',color:'inherit',
                }}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:FO,fontWeight:900,fontSize:22,color:'#f0e8e8',letterSpacing:.5}}>{dateLong}</div>
                    <div style={{fontFamily:FHUD,fontWeight:600,fontSize:10.5,letterSpacing:1.5,color:'#907070',textTransform:'uppercase',marginTop:3}}>
                      {weekday} · {ranked.length} cart{ranked.length===1?'a':'as'}{topPlayer && top ? ` · top: ${topPlayer.nick} (${top.overall})` : ''}
                    </div>
                  </div>
                  <div style={{fontFamily:FHUD,fontWeight:700,fontSize:18,color:R,transform:isOpen?'rotate(90deg)':'none',transition:'transform .2s'}}>▸</div>
                </button>
                {isOpen && (
                  <div style={{padding:'0 24px 26px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:18,justifyItems:'center',paddingTop:6}}>
                      {ranked.map((c,j) => {
                        const p = players.find(pl => pl.id===c.playerId);
                        if(!p) return null;
                        return (
                          <div key={c.playerId} className="lbc-pop" style={{animationDelay:`${j*0.04}s`}}>
                            <AnyCard player={p} card={c} attrs={attrs} scale={0.74}/>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Panel>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// ═══ CONFIG ══════════════════════════════════════════════════
const ConfigTab = ({ apiKey, setApiKey, onLogout }) => {
  const [key, setKey] = useState(apiKey);
  const [ok,  setOk]  = useState(false);
  const save = () => { setApiKey(key); setOk(true); setTimeout(() => setOk(false), 2500); };
  const resetWeek = () => {
    if(confirm('Resetar a sessão em andamento? (não apaga histórico)')) localStorage.removeItem('lbc2_current');
  };
  return (
    <div style={{maxWidth:780,margin:'0 auto',padding:'14px 6px 70px'}}>
      <div style={{marginBottom:28}}>
        <SectionLabel style={{marginBottom:0}}>PREFERÊNCIAS DA LIVE</SectionLabel>
        <h1 style={{fontFamily:FO,fontWeight:900,fontSize:44,color:'#f0e8e8',margin:'6px 0 0',letterSpacing:-1}}>CONFIG</h1>
      </div>

      <Panel style={{padding:'24px 26px',marginBottom:16}}>
        <SectionLabel style={{marginBottom:16}}>IDENTIDADE</SectionLabel>
        <Field label="Nome da live" value="FL1IP" onChange={()=>{}}/>
        <Field label="Horário da live" value="Todos os dias às 20h" onChange={()=>{}}/>
        <Field label="Dia do ranking" value="Domingo" onChange={()=>{}}/>
      </Panel>

      <Panel style={{padding:'24px 26px',marginBottom:16}}>
        <SectionLabel style={{marginBottom:14}}>REMOVE.BG · REMOÇÃO DE FUNDO</SectionLabel>
        <p style={{fontSize:13,color:'#c09090',marginBottom:16,lineHeight:1.7,fontFamily:F}}>
          Crie uma conta gratuita em{' '}
          <a href="https://www.remove.bg/api" target="_blank" rel="noreferrer" style={{color:R,textDecoration:'none',borderBottom:`1px solid ${R}55`}}>remove.bg</a>
          {' '}(50 fotos/mês grátis) e cole sua API key abaixo.
        </p>
        <Field label="API Key do remove.bg" value={key} onChange={setKey} placeholder="Ex: abc123XYZ..."/>
        <Btn onClick={save} v={ok?'success':'primary'}>{ok ? '✅ Salvo!' : '💾 Salvar API Key'}</Btn>
      </Panel>

      <Panel style={{padding:'24px 26px',marginBottom:16}}>
        <SectionLabel style={{marginBottom:14}}>FAIXAS DE RATING</SectionLabel>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {TIERS.map(t => (
            <div key={t.name} style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:t.brd,boxShadow:`0 0 10px ${t.glow}`,flexShrink:0}}/>
              <div style={{minWidth:130,fontFamily:FHUD,fontWeight:700,fontSize:11,letterSpacing:2,color:t.brd,textTransform:'uppercase'}}>{t.lbl}</div>
              <div style={{fontFamily:FHUD,fontSize:11,color:'#806060',width:80,letterSpacing:1}}>{t.min}–{t.max} pts</div>
              <div style={{flex:1,height:5,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:`${((t.max-t.min)/99)*100}%`,height:'100%',background:`linear-gradient(90deg,${t.glow}88,${t.brd})`,boxShadow:`0 0 6px ${t.glow}66`}}/>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel style={{padding:'24px 26px',marginBottom:16}}>
        <SectionLabel style={{marginBottom:14}}>ATMOSFERA</SectionLabel>
        <p style={{fontSize:13,color:'#c09090',marginBottom:0,lineHeight:1.7,fontFamily:F}}>
          Ajuste vibe, fumaça e pulso no botão flutuante <span style={{fontSize:14}}>🌫️</span> no canto inferior direito.
          Três presets — <b style={{color:'#f0e8e8'}}>Lobbão · Estádio · Tático</b> — trocam a paleta inteira via CSS.
        </p>
      </Panel>

      <Panel accent="#ff7755" style={{padding:'24px 26px'}}>
        <SectionLabel color="#ff7755" style={{marginBottom:14}}>ZONA DE PERIGO</SectionLabel>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Btn v="danger" onClick={resetWeek}>⟲ Resetar Semana</Btn>
          {onLogout && <Btn v="danger" onClick={onLogout}>↗ Sair da Conta</Btn>}
        </div>
      </Panel>
    </div>
  );
};
// ═══ LOGIN ═══════════════════════════════════════════════════
const AUTH_USER = 'flip';
const AUTH_PASS = '9975';
const LoginScreen = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err,  setErr]  = useState('');
  const [shake, setShake] = useState(false);
  const tryLogin = () => {
    if(user.trim().toLowerCase() === AUTH_USER && pass === AUTH_PASS) {
      sv('lbc2_auth', true);
      onLogin();
    } else {
      setErr('Login ou senha incorretos.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };
  const onKey = e => { if(e.key === 'Enter') tryLogin(); };
  return (
    <div style={{
      background:'#130e0e', minHeight:'100vh',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:F, position:'relative', overflow:'hidden',
    }}>
      {/* BG glow */}
      <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',
        width:500,height:300,borderRadius:'50%',pointerEvents:'none',
        background:`radial-gradient(ellipse, ${R}18 0%, transparent 70%)`}}/>
      <div style={{position:'absolute',bottom:'10%',left:'20%',
        width:200,height:200,borderRadius:'50%',pointerEvents:'none',
        background:`radial-gradient(ellipse, rgba(0,200,255,0.07) 0%, transparent 70%)`}}/>

      <div style={{
        width:'100%', maxWidth:360, padding:'0 20px',
        animation: shake ? 'lbcShake .5s ease' : 'none',
      }}>
        <style>{`
          @keyframes lbcShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
          @keyframes lbcLoginPulse{0%,100%{box-shadow:0 0 18px ${R}44}50%{box-shadow:0 0 36px ${R}88}}
        `}</style>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:36}}>
          <div style={{marginBottom:10}}>
            <img src="/logo.png" alt="" style={{height:80,objectFit:'contain',
              filter:`drop-shadow(0 0 18px ${R}aa)`}}
              onError={e=>{e.target.style.display='none';}}/>
          </div>
          <div style={{fontSize:26,fontWeight:900,fontFamily:FO,letterSpacing:3,
            background:`linear-gradient(90deg,${R},#ff6644,#ffffff)`,
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            LOBBÃO CRAFT
          </div>
          <div style={{fontFamily:FHUD,fontSize:10,color:'#907070',letterSpacing:3,fontWeight:500,
            textTransform:'uppercase',marginTop:6}}>
            Acesso Restrito · Admin da Live
          </div>
        </div>

        {/* Card de login */}
        <div style={{
          background:'rgba(255,255,255,0.027)',
          border:'1px solid rgba(200,17,17,0.20)',
          borderTop:'1px solid rgba(255,100,100,0.15)',
          borderRadius:16, padding:'28px 24px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.6)',
          animation:'lbcLoginPulse 3s ease-in-out infinite',
        }}>

          {/* Campo Login */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10.5,color:'#c09090',display:'block',marginBottom:6,
              textTransform:'uppercase',letterSpacing:1.8,fontWeight:700}}>Login</label>
            <input
              type="text" value={user} onChange={e=>setUser(e.target.value)} onKeyDown={onKey}
              autoFocus autoComplete="username"
              placeholder="seu login"
              style={{width:'100%',background:'rgba(15,4,4,0.85)',
                border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,
                padding:'10px 14px',color:'#f0e8e8',fontSize:14,fontFamily:F,
                outline:'none',boxSizing:'border-box',transition:'border-color .2s'}}
              onFocus={e=>{e.target.style.borderColor=`rgba(200,17,17,.5)`;e.target.style.boxShadow='0 0 0 3px rgba(200,17,17,.1)';}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}
            />
          </div>

          {/* Campo Senha */}
          <div style={{marginBottom:22}}>
            <label style={{fontSize:10.5,color:'#c09090',display:'block',marginBottom:6,
              textTransform:'uppercase',letterSpacing:1.8,fontWeight:700}}>Senha</label>
            <input
              type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={onKey}
              autoComplete="current-password"
              placeholder="••••"
              style={{width:'100%',background:'rgba(15,4,4,0.85)',
                border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,
                padding:'10px 14px',color:'#f0e8e8',fontSize:14,fontFamily:F,
                outline:'none',boxSizing:'border-box',transition:'border-color .2s'}}
              onFocus={e=>{e.target.style.borderColor=`rgba(200,17,17,.5)`;e.target.style.boxShadow='0 0 0 3px rgba(200,17,17,.1)';}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}
            />
          </div>

          {err && (
            <div style={{color:'#ff6655',fontSize:12.5,textAlign:'center',
              marginBottom:16,fontWeight:600}}>⚠️ {err}</div>
          )}

          <button onClick={tryLogin} className="lbc-btn" style={{
            width:'100%',padding:'14px',
            background:`linear-gradient(180deg,${R},#dd1100)`,
            border:'1px solid #dd1100',
            borderRadius:8,color:'#fff',fontSize:15,fontWeight:700,
            fontFamily:FHUD,letterSpacing:1.6,textTransform:'uppercase',
            cursor:'pointer',transition:'all .15s',
          }}>
            Entrar no Lobby ▸
          </button>
        </div>

        <div style={{textAlign:'center',marginTop:20,fontSize:12,color:'#806060',fontFamily:F}}>
          Toda semana tem ranking novo. Bora?
        </div>
      </div>
    </div>
  );
};
// ═══ TWEAKS PANEL ════════════════════════════════════════════
function useTweaks(defaults) {
  const [values, setValues] = useState(defaults);
  const setTweak = useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues(prev => ({ ...prev, ...edits }));
  }, []);
  return [values, setTweak];
}
function TweakRow({ label, children }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      {label && <div style={{fontSize:11,fontWeight:500,color:'rgba(41,38,27,.72)'}}>{label}</div>}
      {children}
    </div>
  );
}
function TweakSection({ label }) {
  return <div style={{fontSize:10,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',color:'rgba(41,38,27,.45)',padding:'8px 0 0'}}>{label}</div>;
}
function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}
function TweakRadio({ label, value, options, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;
  const opts = options.map(o => typeof o === 'object' ? o : { value: o, label: o });
  const maxLen = opts.reduce((m, o) => Math.max(m, String(o.label).length), 0);
  const fitsAsSegs = maxLen <= ({ 2: 16, 3: 10 }[opts.length] ?? 0);
  if (!fitsAsSegs) return <TweakSelect label={label} value={value} options={opts} onChange={onChange}/>;
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const i = Math.floor(((clientX - r.left - 2) / (r.width - 4)) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => { if (!trackRef.current) return; const v = segAt(ev.clientX); if (v !== valueRef.current) onChange(v); };
    const up   = () => { setDragging(false); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup',   up);
  };
  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{left:`calc(2px + ${idx} * (100% - 4px) / ${n})`,width:`calc((100% - 4px) / ${n})`}}/>
        {opts.map(o => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>{o.label}</button>
        ))}
      </div>
    </TweakRow>
  );
}
function TweaksPanel({ title = 'Atmosfera', children }) {
  const [open, setOpen] = useState(false);
  const dragRef  = useRef(null);
  const offRef   = useRef({ x: 16, y: 16 });
  const PAD = 16;
  const clamp = useCallback(() => {
    const el = dragRef.current; if (!el) return;
    const maxR = Math.max(PAD, window.innerWidth  - el.offsetWidth  - PAD);
    const maxB = Math.max(PAD, window.innerHeight - el.offsetHeight - PAD);
    offRef.current = { x: Math.min(maxR, Math.max(PAD, offRef.current.x)), y: Math.min(maxB, Math.max(PAD, offRef.current.y)) };
    el.style.right  = offRef.current.x + 'px';
    el.style.bottom = offRef.current.y + 'px';
  }, []);
  useEffect(() => {
    if (!open) return;
    clamp();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(clamp);
      ro.observe(document.documentElement);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', clamp);
    return () => window.removeEventListener('resize', clamp);
  }, [open, clamp]);
  const onDrag = e => {
    const el = dragRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startR = window.innerWidth  - r.right;
    const startB = window.innerHeight - r.bottom;
    const move = ev => { offRef.current = { x: startR - (ev.clientX - sx), y: startB - (ev.clientY - sy) }; clamp(); };
    const up   = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
  };
  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} title="Atmosfera" style={{
          position:'fixed',right:16,bottom:16,zIndex:2147483646,
          width:44,height:44,borderRadius:'50%',
          border:'1px solid rgba(255,255,255,0.15)',
          background:'rgba(10,4,4,0.92)',backdropFilter:'blur(14px)',
          cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:`0 0 18px rgba(204,17,17,0.22),0 2px 8px rgba(0,0,0,0.6)`,transition:'all .2s',
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(204,17,17,0.18)';e.currentTarget.style.borderColor='rgba(204,17,17,0.45)';e.currentTarget.style.boxShadow='0 0 22px rgba(204,17,17,0.45)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(10,4,4,0.92)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)';e.currentTarget.style.boxShadow='0 0 18px rgba(204,17,17,0.22)';}}>
          🌫️
        </button>
      )}
      {open && (
        <div ref={dragRef} className="twk-panel" style={{right:offRef.current.x,bottom:offRef.current.y}}>
          <div className="twk-hd" onMouseDown={onDrag}>
            <b>{title}</b>
            <button className="twk-x" type="button" onMouseDown={e=>e.stopPropagation()} onClick={()=>setOpen(false)}>✕</button>
          </div>
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  );
}
// ═══ APP ═════════════════════════════════════════════════════
export default function App() {
  const [tab,      setTab]      = useState('home');
  const [players,  setPlayers]  = useState([]);
  const [attrs,    setAttrs]    = useState(DATTRS);
  const [sessions, setSessions] = useState([]);
  const [apiKey,   setApiKey]   = useState('');
  const [loaded,   setLoaded]   = useState(false);
  const [authed,   setAuthed]   = useState(false);
  const [tweak,    setTweak]    = useTweaks({vibe:'live',fumaca:'padrao',pulso:'vivo'});
  useEffect(() => {
    if(!document.getElementById('lbc-gcss')) {
      const s = document.createElement('style');
      s.id = 'lbc-gcss';
      s.textContent = GCSS;
      document.head.appendChild(s);
    }
    setAuthed(!!ld('lbc2_auth', false));
    setPlayers(ld('lbc2_p', []));
    setAttrs(ld('lbc2_a', DATTRS));
    setSessions(ld('lbc2_s', []));
    setApiKey(ld('lbc2_k', ''));
    setLoaded(true);
  }, []);
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute('data-vibe',   tweak.vibe);
    r.setAttribute('data-fumaca', tweak.fumaca);
    r.setAttribute('data-pulso',  tweak.pulso);
  }, [tweak.vibe, tweak.fumaca, tweak.pulso]);
  const sp = v => { setPlayers(v);  sv('lbc2_p', v); };
  const sa = v => { setAttrs(v);    sv('lbc2_a', v); };
  const ss = v => { setSessions(v); sv('lbc2_s', v); };
  const sk = v => { setApiKey(v);   sv('lbc2_k', v); };
  if(!loaded) return (
    <div style={{background:'#130e0e',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <img src="/logo.png" alt="FL1IP" style={{height:90,filter:`drop-shadow(0 0 22px ${R}aa)`}}
          onError={e=>{e.target.style.display='none'}}/>
        <div style={{marginTop:20,fontSize:11,letterSpacing:4,fontWeight:900,fontFamily:FO,color:'#cc3333',textShadow:`0 0 20px ${R}`}}>
          CARREGANDO...
        </div>
      </div>
    </div>
  );
  if(!authed) return <LoginScreen onLogin={() => setAuthed(true)}/>;
  const logout = () => { sv('lbc2_auth', false); setAuthed(false); };
  const TABS = [
    {id:'home',    icon:'◆', label:'HOME'},
    {id:'players', icon:'☰', label:'JOGADORES'},
    {id:'attrs',   icon:'◇', label:'ATRIBUTOS'},
    {id:'sunday',  icon:'▲', label:'DOMINGO'},
    {id:'history', icon:'◉', label:'HISTÓRICO'},
    {id:'config',  icon:'⚙', label:'CONFIG'},
  ];
  return (
    <div style={{background:'#0a0606',minHeight:'100vh',color:'#f0e8e8',display:'flex',flexDirection:'column',position:'relative'}}>
      {/* ── PageBg fumaça ── */}
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}>
        <div className="lbc-page-bg" style={{position:'absolute',inset:0,background:`radial-gradient(120% 80% at 50% -10%,#2a0808,#16110f 55%,#0a0606 100%)`}}/>
        <div className="lbc-smoke" style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'80%',backgroundPosition:'30% 20%',
          opacity:.32,mixBlendMode:'screen'}}/>
        <div className="lbc-smoke" style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'120%',backgroundPosition:'70% 80%',
          opacity:.22,mixBlendMode:'screen',animationDelay:'-7s'}}/>
        <div style={{position:'absolute',left:0,bottom:0,width:'40%',height:'40%',
          background:'radial-gradient(circle at 0% 100%,rgba(0,180,220,0.06),transparent 60%)'}}/>
        {/* vibe accent overlay — driven by [data-vibe] CSS */}
        <div className="lbc-vibe-overlay" style={{position:'absolute',inset:0,mixBlendMode:'screen',pointerEvents:'none'}}/>
      </div>
      {/* ── Header ── */}
      <header style={{position:'relative',overflow:'hidden',borderBottom:'1px solid rgba(255,255,255,0.07)',zIndex:10,flexShrink:0}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,#0e0404,#1a0606 55%,#0e0404)'}}/>
        <div className="lbc-smoke" style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'60%',backgroundPosition:'10% 20%',
          opacity:.5,mixBlendMode:'screen'}}/>
        <div style={{position:'absolute',inset:0,
          backgroundImage:'url(/smoke-red.png)',backgroundSize:'100%',backgroundPosition:'80% 80%',
          opacity:.35,mixBlendMode:'screen'}}/>
        <div style={{position:'absolute',top:-60,right:-60,width:280,height:280,
          background:'radial-gradient(circle,rgba(204,17,17,0.35),transparent 70%)',pointerEvents:'none'}}/>
        <img src="/paint-swoosh.png" alt="" style={{position:'absolute',top:-20,right:-60,width:360,
          transform:'rotate(8deg)',opacity:.10,pointerEvents:'none'}}
          onError={e=>{e.target.style.display='none'}}/>
        <img src="/paint-swoosh.png" alt="" style={{position:'absolute',bottom:-40,left:-40,width:240,
          transform:'rotate(-12deg) scaleX(-1)',opacity:.08,pointerEvents:'none'}}
          onError={e=>{e.target.style.display='none'}}/>
        <div style={{position:'relative',display:'flex',alignItems:'center',gap:20,padding:'14px 24px'}}>
          <img src="/logo.png" alt="FL1IP" style={{height:56,filter:`drop-shadow(0 0 14px ${R}cc)`}}
            onError={e=>{e.target.style.display='none'}}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:FO,fontWeight:900,fontSize:26,letterSpacing:3,lineHeight:1,
              background:`linear-gradient(90deg,${R},#ff6644 45%,#ffffff)`,
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>LOBBÃO CRAFT</div>
            <div style={{fontFamily:FHUD,fontWeight:500,fontSize:10,letterSpacing:3,color:'rgba(255,255,255,0.45)',marginTop:3}}>
              RANKING SEMANAL · CS2 · LIVE TODOS OS DIAS ÀS 20H
            </div>
          </div>
          <button onClick={logout} style={{
            fontFamily:FHUD,fontWeight:600,fontSize:11,letterSpacing:2,
            color:'rgba(255,255,255,0.55)',background:'rgba(0,0,0,0.4)',
            border:'1px solid rgba(255,255,255,0.10)',padding:'8px 14px',cursor:'pointer',
            textTransform:'uppercase',transition:'all .2s',flexShrink:0,
          }}
            onMouseEnter={e=>{e.currentTarget.style.color='#ff4444';e.currentTarget.style.borderColor='rgba(200,17,17,.4)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.55)';e.currentTarget.style.borderColor='rgba(255,255,255,0.10)';}}>
            SAIR ↗
          </button>
        </div>
        {/* linha animada */}
        <div className="lbc-hdr-line" style={{position:'absolute',bottom:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${R} 30%,#ff4422 50%,${R} 70%,transparent)`,
          backgroundSize:'200% 100%',animation:'lbcHdrLine 4s linear infinite'}}/>
      </header>
      {/* ── Nav ── */}
      <nav style={{position:'relative',background:'rgba(10,4,4,0.92)',backdropFilter:'blur(14px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',zIndex:10,flexShrink:0}}>
        <div style={{display:'flex',gap:0,padding:'0 16px',overflowX:'auto'}}>
          {TABS.map(t => {
            const isActive = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                position:'relative',display:'flex',alignItems:'center',gap:7,
                padding:'13px 16px',background:'transparent',border:'none',cursor:'pointer',
                fontFamily:FHUD,fontWeight:700,fontSize:11,letterSpacing:2.2,
                color:isActive?R:'rgba(255,255,255,0.45)',transition:'color .15s',
                textTransform:'uppercase',whiteSpace:'nowrap',
              }}
                onMouseEnter={e=>{if(!isActive)e.currentTarget.style.color='rgba(255,255,255,0.78)';}}
                onMouseLeave={e=>{if(!isActive)e.currentTarget.style.color='rgba(255,255,255,0.45)';}}>
                <span style={{fontSize:11,opacity:.8}}>{t.icon}</span>{t.label}
                {isActive && <span style={{position:'absolute',left:12,right:12,bottom:0,height:2,
                  background:R,boxShadow:`0 0 10px ${R}`}}/>}
              </button>
            );
          })}
        </div>
      </nav>
      <div style={{flex:1,padding:'18px 22px',overflowY:'auto',position:'relative',zIndex:1}}>
        <div key={tab} className="lbc-screen">
          {tab==='home'    && <HomeTab    players={players} sessions={sessions} attrs={attrs} onGoSunday={()=>setTab('sunday')}/>}
          {tab==='players' && <PlayersTab players={players} setPlayers={sp} apiKey={apiKey}/>}
          {tab==='attrs'   && <AttrsTab   attrs={attrs} setAttrs={sa}/>}
          {tab==='sunday'  && <SundayTab  players={players} attrs={attrs} sessions={sessions} setSessions={ss}/>}
          {tab==='history' && <HistoryTab sessions={sessions} players={players} attrs={attrs}/>}
          {tab==='config'  && <ConfigTab  apiKey={apiKey} setApiKey={sk} onLogout={logout}/>}
        </div>
      </div>
      <TweaksPanel>
        <TweakSection label="Atmosfera"/>
        <TweakRadio label="Vibe" value={tweak.vibe}
          options={[{value:'live',label:'Lobbão'},{value:'estadio',label:'Estádio'},{value:'tatico',label:'Tático'}]}
          onChange={v=>setTweak('vibe',v)}/>
        <TweakRadio label="Fumaça" value={tweak.fumaca}
          options={[{value:'limpo',label:'Limpo'},{value:'padrao',label:'Padrão'},{value:'cinema',label:'Cinema'}]}
          onChange={v=>setTweak('fumaca',v)}/>
        <TweakRadio label="Pulso" value={tweak.pulso}
          options={[{value:'parado',label:'Parado'},{value:'vivo',label:'Vivo'},{value:'hype',label:'Hype'}]}
          onChange={v=>setTweak('pulso',v)}/>
      </TweaksPanel>
    </div>
  );
}
