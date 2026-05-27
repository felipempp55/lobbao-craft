import { useState, useEffect, useRef } from "react";
// ═══ BRAND COLORS ════════════════════════════════════════════
const R  = '#cc1111';
const RG = '#dd1100';
const RD = 'rgba(200,17,17,0.15)';
// ═══ TIERS ═══════════════════════════════════════════════════
const TIERS = [
  { name:'Bronze',   min:0,  max:70, lbl:'BRONZE',
    bg:'linear-gradient(170deg,#0f0500 0%,#3a1806 30%,#521f07 55%,#3a1806 80%,#0f0500 100%)',
    brd:'#b87333',glow:'#d07020',txt:'#f0a055',score:'#ffbb44',pat:'rgba(200,120,40,0.06)' },
  { name:'Prata',    min:71, max:80, lbl:'PRATA',
    bg:'linear-gradient(170deg,#070c16 0%,#1a2b3e 30%,#283c55 55%,#1a2b3e 80%,#070c16 100%)',
    brd:'#c8d8e8',glow:'#a0b5cc',txt:'#ddeeff',score:'#f5f9ff',pat:'rgba(180,205,230,0.04)' },
  { name:'Ouro',     min:81, max:90, lbl:'OURO',
    bg:'linear-gradient(170deg,#0e0800 0%,#3d2600 30%,#5e3a00 55%,#3d2600 80%,#0e0800 100%)',
    brd:'#ffd700',glow:'#ffaa00',txt:'#ffe880',score:'#fff100',pat:'rgba(255,190,0,0.06)' },
  { name:'Diamante', min:91, max:99, lbl:'GOAT',
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
  at.forEach(a => { if(sc[a.id] !== undefined){ t += (sc[a.id]/10)*(a.weight/100); w += a.weight; } });
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&family=Permanent+Marker&display=swap');
*{box-sizing:border-box;}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#2a1515;border-radius:3px}
input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;cursor:pointer;border:2px solid #080404}
.lbc-nav-btn:hover{color:#e04444!important}
.lbc-ppl-pick{transition:all .2s!important}
.lbc-ppl-pick:hover{border-color:#cc1111!important;background:rgba(200,17,17,0.08)!important;transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,17,17,0.14)!important}
.lbc-btn:hover:not(:disabled){filter:brightness(1.18);transform:translateY(-1px)}
.lbc-btn:active:not(:disabled){transform:translateY(0)}
@keyframes lbcShine{0%,100%{left:-130%}40%,60%{left:160%}}
@keyframes lbcGem{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:1;transform:scale(2.2)}}
@keyframes lbcFloat{0%,100%{transform:translateX(-50%) translateY(0px)}50%{transform:translateX(-50%) translateY(-6px)}}
@keyframes lbcHdr{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes lbcReveal{from{opacity:0;transform:scale(.88) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
`;
// ═══ FONTS ═══════════════════════════════════════════════════
const F  = "'Rajdhani','Segoe UI',sans-serif";
const FO = "'Orbitron','Arial Black',sans-serif";
const FM = "'Permanent Marker','Impact',cursive";
// ═══ FL1IP LOGO ══════════════════════════════════════════════
const FL1IP = ({ size = 1, opacity = 1 }) => (
  <span style={{fontFamily:FM, fontSize:22*size, letterSpacing:1*size, opacity}}>
    <span style={{color:'#fff', WebkitTextStroke:`${1*size}px rgba(0,0,0,0.7)`}}>FL</span>
    <span style={{color:R,     WebkitTextStroke:`${1*size}px rgba(0,0,0,0.7)`}}>1</span>
    <span style={{color:'#fff', WebkitTextStroke:`${1*size}px rgba(0,0,0,0.7)`}}>IP</span>
  </span>
);
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
      padding:size==='xs'?'4px 10px':size==='sm'?'6px 14px':'9px 20px',
      fontSize:size==='xs'?11:size==='sm'?12:13.5,
      fontWeight:700, fontFamily:F, letterSpacing:.8, textTransform:'uppercase',
      transition:'all .15s', ...style,
    }}>{children}</button>
  );
};
const Field = ({ label, value, onChange, type='text', placeholder='' }) => (
  <div style={{marginBottom:14}}>
    {label && <label style={{fontSize:10.5,color:'#5a3030',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:1.8,fontFamily:F,fontWeight:700}}>{label}</label>}
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{background:'rgba(15,4,4,0.85)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'9px 12px',color:'#f0e8e8',fontSize:13,fontFamily:F,width:'100%',boxSizing:'border-box',outline:'none',transition:'border-color .2s, box-shadow .2s'}}
      onFocus={e => { e.target.style.borderColor='rgba(200,17,17,.5)'; e.target.style.boxShadow='0 0 0 3px rgba(200,17,17,.1)'; }}
      onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
    />
  </div>
);
const Panel = ({ children, style={} }) => (
  <div style={{
    background:'rgba(255,255,255,0.027)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
    border:'1px solid rgba(255,255,255,0.07)', borderTop:'1px solid rgba(255,100,100,0.1)',
    borderRadius:14, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', ...style,
  }}>{children}</div>
);
const SectionLabel = ({ children, color='#5a3030' }) => (
  <div style={{fontSize:10.5,fontWeight:700,letterSpacing:2.5,color,textTransform:'uppercase',fontFamily:F,marginBottom:12}}>{children}</div>
);
// ═══ PLAYER CARD ═════════════════════════════════════════════
const PlayerCard = ({ player, card, attrs, scale=1, reveal=false }) => {
  const t = getTier(card.overall);
  const isDestaque = card.overall >= 90;
  const W = (isDestaque ? 278 : 260) * scale;
  const H = (isDestaque ? 418 : 400) * scale;
  const sa = attrs.slice(0, 6);
  const isDia = t.name === 'Diamante';
  const isGold = t.name === 'Ouro';
  const isSilv = t.name === 'Prata';
  const bA = isDestaque ? 'bb' : '55';

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
  // 3D overflow: foto Destaque é mais alta, cabeça estoura acima da borda
  const photoH   = (isDestaque ? 375 : 220) * scale;
  const photoBtm = (isDestaque ? 72  : 68 ) * scale;
  const S = scale; // atalho

  return (
    <div style={{
      width:W, height:H, position:'relative', flexShrink:0,
      animation: reveal ? 'lbcReveal .5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
    }}>
      <style>{`
        @keyframes lbcFloat{0%,100%{transform:translateX(-50%) translateY(0px)}50%{transform:translateX(-50%) translateY(-${6*S}px)}}
        @keyframes lbcPulseBlue{0%,100%{opacity:.28}50%{opacity:.75}}
        @keyframes lbcBorderGlow{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>

      {/* ══ CAMADA 1: fundo do card (overflow:hidden) ══ */}
      <div style={{
        position:'absolute',inset:0,borderRadius:16*S,background:effBg,overflow:'hidden',zIndex:1,
        border:`${(isDestaque?3:2.5)*S}px solid ${isDestaque?effBrd:t.brd+'88'}`,
        boxShadow: isDestaque
          ? `0 0 ${28*S}px ${dGlow}77,0 0 ${65*S}px ${dGlow}38,0 0 ${28*S}px ${t.glow}cc,0 0 ${70*S}px ${t.glow}66,0 0 ${110*S}px ${t.glow}33,inset 0 0 ${55*S}px rgba(0,0,0,.85),inset 0 0 ${28*S}px ${dGlow}14,inset 0 0 ${32*S}px rgba(0,180,255,0.28)`
          : `0 0 ${18*S}px ${t.glow}33,0 0 ${40*S}px ${t.glow}15,inset 0 0 ${42*S}px rgba(0,0,0,.62)`,
      }}>
        {/* BG texture */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',
          backgroundImage: isDestaque
            ? `repeating-linear-gradient(45deg,rgba(200,160,32,.042) 0px,rgba(200,160,32,.042) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(200,160,32,.042) 0px,rgba(200,160,32,.042) 1px,transparent 1px,transparent 26px)`
            : `repeating-linear-gradient(0deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 7px)`,
        }}/>
        {/* Top glow */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:H*(isDestaque?.55:.45),pointerEvents:'none',
          background:`radial-gradient(ellipse 80% 60% at 50% 0%,${effGlow}${isDestaque?'30':'18'} 0%,transparent 70%)`,
        }}/>
        {/* Shine sweep */}
        {(isGold||isDia||isSilv||isDestaque) && (
          <div style={{position:'absolute',top:0,bottom:0,width:'50%',pointerEvents:'none',
            background:isDestaque?`linear-gradient(100deg,transparent 20%,${dGlow}1e 50%,transparent 80%)`:`linear-gradient(100deg,transparent 20%,${t.glow}1a 50%,transparent 80%)`,
            animation:`lbcShine ${isDestaque||isDia?2.8:isGold?4:5}s ease-in-out infinite`,
          }}/>
        )}
        {/* Destaque: losangos flutuantes */}
        {isDestaque && dDiamonds.map((d,i) => (
          <div key={i} style={{position:'absolute',top:d.top,left:d.left,right:d.right,pointerEvents:'none',
            width:d.sz*S,height:d.sz*S,background:`rgba(212,160,48,${d.op})`,
            border:`1px solid rgba(212,160,48,${Math.min(1,d.op*2.2)})`,
            transform:`rotate(${d.rot}deg)`,boxShadow:`0 0 ${d.sz*S}px rgba(212,160,48,${d.op})`,
          }}/>
        ))}
        {/* Destaque: linha acento dourado */}
        {isDestaque && (
          <div style={{position:'absolute',top:96*S,left:12*S,right:12*S,height:1,pointerEvents:'none',
            background:`linear-gradient(90deg,transparent,${dBrd}99,${t.glow}88,${dBrd}99,transparent)`,
          }}/>
        )}
        {/* Gems ciano Diamante */}
        {isDia && [{p:'8% 14%',s:5},{p:'22% 7%',s:4},{p:'37% 12%',s:6},{p:'12% 29%',s:3},{p:'50% 5%',s:4},{p:'5% 42%',s:3}].map((g,i) => {
          const [top,right]=g.p.split(' ');
          return <div key={i} style={{position:'absolute',top,right,width:g.s*S,height:g.s*S,borderRadius:'50%',
            background:'radial-gradient(circle,#ffffff,#00ccff)',
            boxShadow:`0 0 ${g.s*3*S}px #00aaff,0 0 ${g.s*6*S}px #0055ff`,
            animation:`lbcGem ${1.5+i*.4}s ease-in-out infinite`,animationDelay:`${i*.28}s`}}/>;
        })}
        {/* Destaque: anel interno azul pulsante (efeito cristal) */}
        {isDestaque && (
          <div style={{
            position:'absolute',inset:`${5*S}px`,borderRadius:12*S,background:'transparent',pointerEvents:'none',
            border:`2px solid rgba(0,210,255,0.75)`,
            boxShadow:`inset 0 0 ${24*S}px rgba(0,180,255,0.40),inset 0 0 ${55*S}px rgba(0,100,255,0.20), 0 0 ${22*S}px rgba(0,210,255,0.50)`,
            animation:'lbcBorderGlow 3s ease-in-out infinite',
          }}/>
        )}
        {/* Destaque: segundo anel interno dourado */}
        {isDestaque && (
          <div style={{
            position:'absolute',inset:`${13*S}px`,borderRadius:7*S,background:'transparent',pointerEvents:'none',
            border:`1px solid rgba(200,160,32,0.25)`,
            animation:'lbcBorderGlow 4s ease-in-out infinite',animationDelay:'.8s',
          }}/>
        )}
      </div>


      {/* ══ ORNAMENTOS LATERAIS (losangos na borda) ══ */}
      {isDestaque && <>
        <div style={{position:'absolute',left:-5*S,top:'42%',transform:'translateY(-50%) rotate(45deg)',
          width:11*S,height:11*S,zIndex:9,pointerEvents:'none',
          background:`linear-gradient(135deg,#ffe066,${dBrd})`,
          boxShadow:`0 0 ${15*S}px ${dGlow},0 0 ${9*S}px ${t.glow}aa`,
        }}/>
        <div style={{position:'absolute',right:-5*S,top:'42%',transform:'translateY(-50%) rotate(45deg)',
          width:11*S,height:11*S,zIndex:9,pointerEvents:'none',
          background:`linear-gradient(135deg,#ffe066,${dBrd})`,
          boxShadow:`0 0 ${15*S}px ${dGlow},0 0 ${9*S}px ${t.glow}aa`,
        }}/>
        <div style={{position:'absolute',bottom:-5*S,left:'50%',transform:'translateX(-50%) rotate(45deg)',
          width:11*S,height:11*S,zIndex:9,pointerEvents:'none',
          background:`linear-gradient(135deg,#ffe066,${dBrd})`,
          boxShadow:`0 0 ${15*S}px ${dGlow},0 0 ${9*S}px ${t.glow}aa`,
        }}/>
      </>}

      {/* ══ AURA GOAT — raios + orbe no canto superior direito ══ */}
      {isDestaque && (
        <>
          {/* Orbe pulsante — canto superior direito */}
          <div style={{
            position:'absolute', top:-20*S, right:-20*S,
            width:130*S, height:130*S, borderRadius:'50%',
            background:`radial-gradient(circle at 50% 50%, ${dGlow}55 0%, ${dGlow}22 45%, transparent 70%)`,
            zIndex:2, pointerEvents:'none',
            animation:'lbcBorderGlow 2.8s ease-in-out infinite',
          }}/>
          <div style={{
            position:'absolute', top:0, right:0,
            width:68*S, height:68*S, borderRadius:'50%',
            background:`radial-gradient(circle at 50% 50%, ${t.glow}44 0%, transparent 65%)`,
            zIndex:2, pointerEvents:'none',
            animation:'lbcPulseBlue 2.1s ease-in-out infinite',
            animationDelay:'0.4s',
          }}/>
          {/* Raios em diagonal cima-direita, saindo para fora da carta */}
          {[
            {angle: 92, len:115, w:2,   op:0.50},
            {angle:108, len:100, w:1.5, op:0.46},
            {angle:122, len:110, w:1.5, op:0.52},
            {angle:135, len:125, w:2.5, op:0.60},
            {angle:148, len:105, w:1.5, op:0.50},
            {angle:162, len:112, w:1.5, op:0.52},
            {angle:175, len:95,  w:1,   op:0.40},
            {angle:188, len:82,  w:1,   op:0.30},
          ].map((r,i) => (
            <div key={`ray${i}`} style={{
              position:'absolute', right:32*S, top:32*S,
              width:r.len*S, height:r.w*S,
              background:`linear-gradient(to right, transparent, ${dBrd}ee)`,
              transformOrigin:'right center',
              transform:`rotate(${r.angle}deg)`,
              zIndex:2, pointerEvents:'none',
              opacity:r.op,
            }}/>
          ))}
          {/* Cintilações douradas ao redor da âncora */}
          {[
            {top:28, right:26, s:4.5, d:'0s'},
            {top:14, right:48, s:3,   d:'0.55s'},
            {top:44, right:18, s:3.5, d:'0.3s'},
            {top:18, right:66, s:2.5, d:'0.8s'},
            {top:50, right:42, s:2.5, d:'0.15s'},
            {top: 8, right:30, s:2,   d:'1.1s'},
          ].map((sp,i) => (
            <div key={`spark${i}`} style={{
              position:'absolute', top:sp.top*S, right:sp.right*S,
              width:sp.s*S, height:sp.s*S, borderRadius:'50%',
              background:`radial-gradient(circle, #ffffff, ${dGlow})`,
              boxShadow:`0 0 ${sp.s*2*S}px ${dGlow}ee, 0 0 ${sp.s*6*S}px ${dGlow}77`,
              zIndex:5, pointerEvents:'none',
              animation:`lbcGem ${1.4+i*.38}s ease-in-out infinite`,
              animationDelay:sp.d,
            }}/>
          ))}
          {/* Cintilações AZUIS — lado esquerdo, altura média da carta */}
          {[
            {top:165, left:14, s:4,   d:'0.2s'},
            {top:195, left:30, s:3,   d:'0.7s'},
            {top:148, left:8,  s:2.5, d:'1.0s'},
            {top:220, left:48, s:3.5, d:'0.4s'},
            {top:242, left:18, s:2.5, d:'0.9s'},
            {top:178, left:58, s:2,   d:'0.1s'},
          ].map((sp,i) => (
            <div key={`bspark${i}`} style={{
              position:'absolute', top:sp.top*S, left:sp.left*S,
              width:sp.s*S, height:sp.s*S, borderRadius:'50%',
              background:`radial-gradient(circle, #ffffff, ${t.glow})`,
              boxShadow:`0 0 ${sp.s*2*S}px ${t.glow}ff, 0 0 ${sp.s*7*S}px ${t.glow}88`,
              zIndex:5, pointerEvents:'none',
              animation:`lbcGem ${1.3+i*.36}s ease-in-out infinite`,
              animationDelay:sp.d,
            }}/>
          ))}
        </>
      )}

      {/* ══ TAG ICONS — coluna esquerda, estilo FIFA ══ */}
      {(() => {
        const cardTags = card.tags || {};
        const iconDefs = [
          {id:'baiter',    emoji:'🫣', label:'Baiter',    color:'#ff4444', brd:'#cc2222'},
          {id:'tiltado',   emoji:'😡', label:'Tiltado',   color:'#ff7700', brd:'#cc4400'},
          {id:'mutadinho', emoji:'🔇', label:'Mutado',    color:'#99aacc', brd:'#6677aa'},
          {id:'genteboa',  emoji:'👍', label:'Gente boa', color:'#44ee88', brd:'#22aa55'},
          {id:'esforçado', emoji:'💪', label:'Esforçado', color:'#ffd700', brd:'#bb8800'},
        ];
        const active = iconDefs.filter(d => cardTags[d.id]);
        if(!active.length) return null;
        const sz  = 30*S;
        const gap = 7*S;
        const totalH = active.length * sz + (active.length-1) * gap;
        const areaTop = (isDestaque ? 100 : 88) * S;
        const areaBot = (isDestaque ? 90  : 80) * S;
        const areaH   = H - areaTop - areaBot;
        const startY  = areaTop + Math.max(0, (areaH - totalH) / 2);
        return active.map((d, i) => (
          <div key={`ti${i}`} style={{
            position:'absolute',
            left: 8*S,
            top: startY + i*(sz+gap),
            width:sz, height:sz,
            zIndex:4, pointerEvents:'none',
            borderRadius:'50%',
            background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.20) 0%, rgba(0,0,0,0.80) 100%)',
            border:`${1.5*S}px solid ${d.brd}bb`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: sz * 0.50,
            backdropFilter:'blur(6px)',
            boxShadow:`0 0 ${12*S}px ${d.color}88, 0 0 ${6*S}px ${d.color}55, inset 0 0 ${6*S}px rgba(0,0,0,0.55)`,
          }}>{d.emoji}</div>
        ));
      })()}

      {/* ══ FOTO — z=3, estoura para fora no topo ══ */}
      {(player.photoClean||player.photo) ? (
        <img src={player.photoClean||player.photo} alt="" style={{
          position:'absolute', bottom:photoBtm, left:'50%',
          height:photoH, maxWidth:'100%',
          objectFit:player.photoClean?'contain':'cover',
          objectPosition:'top center',
          borderRadius:player.photoClean?0:8*S,
          filter:`drop-shadow(0 ${-3*S}px ${(isDestaque?24:13)*S}px ${effGlow}${isDestaque?'ee':'bb'})`,
          animation:'lbcFloat 4s ease-in-out infinite',
          zIndex:3,
        }}/>
      ) : (
        <div style={{position:'absolute',bottom:photoBtm,left:'50%',transform:'translateX(-50%)',
          width:100*S,height:isDestaque?152*S:140*S,borderRadius:8*S,
          background:`${effBrd}0e`,border:`${1.5*S}px dashed ${effBrd}30`,
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:38*S,opacity:.3,zIndex:3}}>👤</div>
      )}

      {/* ══ HEADER (overall + logo) — z=4 ══ */}
      <div style={{position:'absolute',top:(isDestaque?16:10)*S,left:13*S,right:13*S,
        display:'flex',justifyContent:'space-between',alignItems:'flex-start',zIndex:4}}>
        <div>
          <div style={{fontSize:(isDestaque?62:58)*S,fontWeight:900,lineHeight:1,color:effScore,letterSpacing:-2*S,fontFamily:FO,
            textShadow:`0 0 ${14*S}px ${effGlow},0 0 ${28*S}px ${effGlow}66,0 0 ${55*S}px ${effGlow}22`}}>
            {card.overall}
          </div>
          <div style={{fontSize:8*S,fontWeight:700,letterSpacing:2.5*S,color:effTxt,textTransform:'uppercase',fontFamily:F,
            borderTop:`${1*S}px solid ${effBrd}55`,paddingTop:2*S,marginTop:1*S}}>
            {t.lbl}
          </div>
        </div>
      </div>


      {/* ══ FADE — z=6 ══ */}
      <div style={{position:'absolute',bottom:90*S,left:0,right:0,height:70*S,pointerEvents:'none',zIndex:6,
        background:`linear-gradient(0deg,rgba(4,4,18,0.75) 0%,transparent 100%)`,
      }}/>
      {/* ══ STATS FOOTER — z=7 — degradê baixo opaco → cima transparente ══ */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:7,
        background:`linear-gradient(0deg, rgba(4,4,18,0.96) 0%, rgba(4,4,18,0.55) 55%, rgba(4,4,18,0.08) 100%)`,
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderTop:`${(isDestaque?2:1.5)*S}px solid ${effBrd}${isDestaque?'55':'28'}`,
        padding:`${14*S}px ${8*S}px ${13*S}px`,
      }}>
        {/* Nick */}
        <div style={{
          textAlign:'center', fontSize:17*S, fontWeight:800,
          color:'#ffffff', fontFamily:F, letterSpacing:.8*S,
          marginBottom:6*S,
          textShadow:`0 2px 8px rgba(0,0,0,.95), 0 0 ${16*S}px ${effGlow}55`,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
        }}>
          {player.nick||'???'}
        </div>
        {/* Linha separadora */}
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${effBrd}77,transparent)`,marginBottom:8*S}}/>
        {/* 6 atributos em linha */}
        <div style={{display:'flex',justifyContent:'space-around',alignItems:'flex-end'}}>
          {sa.map((a,i) => (
            <div key={a.id} style={{textAlign:'center',flex:1,
              borderRight: i<sa.length-1 ? `1px solid ${effBrd}22` : 'none',
            }}>
              <div style={{fontSize:8*S,fontWeight:700,color:effTxt,opacity:.75,
                textTransform:'uppercase',letterSpacing:.3*S,fontFamily:F,marginBottom:3*S,
                textShadow:'0 1px 4px rgba(0,0,0,.8)'}}>
                {a.name.slice(0,3)}
              </div>
              <div style={{fontSize:18*S,fontWeight:900,color:effScore,fontFamily:FO,lineHeight:1,
                textShadow:`0 2px 6px rgba(0,0,0,.9), 0 0 ${8*S}px ${effGlow}88`}}>
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
const HomeTab = ({ players, sessions, attrs }) => {
  const last  = [...sessions].sort((a,b) => b.date.localeCompare(a.date))[0];
  const total = sessions.reduce((s,ss) => s+(ss.cards?.length||0), 0);
  const Stat  = ({ v, label, c=R, icon }) => (
    <Panel style={{flex:1,minWidth:110,padding:'18px 20px'}}>
      <div style={{fontSize:10,color:'#5a3030',textTransform:'uppercase',letterSpacing:2,fontFamily:F,fontWeight:700,marginBottom:8}}>{icon} {label}</div>
      <div style={{fontSize:32,fontWeight:900,color:c,fontFamily:FO,textShadow:`0 0 20px ${c}55`}}>{v}</div>
    </Panel>
  );
  return (
    <div>
      <SectionLabel>📊 Visão Geral</SectionLabel>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
        <Stat v={players.length}  label="Jogadores" icon="👥"/>
        <Stat v={sessions.length} label="Domingos"  c="#ffd700" icon="🎮"/>
        <Stat v={total}           label="Cartinhas" c="#ff8c00" icon="🃏"/>
        <Stat v={attrs.length}    label="Atributos" c="#44dd88" icon="⚙️"/>
      </div>
      {last ? (
        <div>
          <SectionLabel>🏆 Último Domingo — {new Date(last.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</SectionLabel>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            {[...(last.cards||[])].sort((a,b) => b.overall-a.overall).map(c => {
              const p = players.find(pl => pl.id===c.playerId);
              return p ? <PlayerCard key={c.playerId} player={p} card={c} attrs={attrs} scale={0.72}/> : null;
            })}
          </div>
        </div>
      ) : (
        <Panel style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:52,marginBottom:14}}>🎮</div>
          <div style={{fontSize:15,color:'#6a3535',fontFamily:F,fontWeight:600}}>Nenhum domingo realizado ainda.</div>
          <div style={{fontSize:12,color:'#3a2020',marginTop:6,fontFamily:F}}>Cadastre jogadores e inicie a primeira sessão!</div>
        </Panel>
      )}
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
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <SectionLabel>👥 Jogadores ({players.length})</SectionLabel>
        <Btn onClick={() => openForm()}>+ Adicionar</Btn>
      </div>
      {open && (
        <Panel style={{marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:'#f0dada',marginBottom:18,fontFamily:F,letterSpacing:.5}}>
            {editId ? '✏️ Editar' : '➕ Novo'} Jogador
          </div>
          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:210}}>
              <Field label="Nick na Live"    value={form.nick}   onChange={v => setForm(f=>({...f,nick:v}))}/>
              <Field label="Nick GamersCLub" value={form.gcNick} onChange={v => setForm(f=>({...f,gcNick:v}))} placeholder="Opcional"/>
              <div style={{marginTop:4}}>
                <label style={{fontSize:10.5,color:'#5a3030',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:1.8,fontFamily:F,fontWeight:700}}>Foto</label>
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
                    <div style={{fontSize:10,color:'#5a3030',marginBottom:6,fontFamily:F,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase'}}>Original</div>
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
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(148px,1fr))',gap:12}}>
        {players.map(p => (
          <Panel key={p.id} style={{padding:16,textAlign:'center'}}>
            {(p.photoClean || p.photo)
              ? <img src={p.photoClean||p.photo} style={{width:70,height:92,objectFit:p.photoClean?'contain':'cover',borderRadius:8,background:'rgba(0,0,0,.4)'}}/>
              : <div style={{width:70,height:92,borderRadius:8,background:'rgba(20,5,5,.7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto',border:'1px solid rgba(255,255,255,0.06)'}}>👤</div>
            }
            <div style={{fontWeight:700,marginTop:10,fontSize:14,color:'#f0e8e8',fontFamily:F}}>{p.nick}</div>
            {p.gcNick && <div style={{fontSize:10.5,color:'#5a3535',marginTop:2,fontFamily:F}}>{p.gcNick}</div>}
            <div style={{display:'flex',gap:7,justifyContent:'center',marginTop:11}}>
              <Btn onClick={() => openForm(p)} v="ghost"  size="xs">✏️</Btn>
              <Btn onClick={() => del(p.id)}   v="danger" size="xs">🗑️</Btn>
            </div>
          </Panel>
        ))}
      </div>
      {!players.length && !open && (
        <Panel style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:44,marginBottom:12}}>👥</div>
          <div style={{fontSize:14,color:'#6a3535',fontFamily:F,fontWeight:600}}>Nenhum jogador cadastrado.</div>
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
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <SectionLabel>⚙️ Atributos</SectionLabel>
        <span style={{fontSize:13,color:total===100?'#44dd88':'#ff8844',fontWeight:700,fontFamily:F}}>
          Peso total: {total}% {total===100?'✅':'⚠️'}
        </span>
      </div>
      <Panel style={{marginBottom:16}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
          <div style={{flex:1,minWidth:160,marginBottom:0}}>
            <Field label="Nome do Atributo" value={form.name} onChange={v => setForm(f=>({...f,name:v}))}/>
          </div>
          <div style={{width:95,marginBottom:0}}>
            <Field label="Peso %" value={form.weight} onChange={v => setForm(f=>({...f,weight:v}))} type="number"/>
          </div>
          <div style={{paddingBottom:1,display:'flex',gap:7}}>
            <Btn onClick={save}>{editId ? '✔ Salvar' : '+ Adicionar'}</Btn>
            {editId && <Btn onClick={() => { setEditId(null); setForm({name:'',weight:'10'}); }} v="danger">✕</Btn>}
          </div>
        </div>
      </Panel>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {attrs.map(a => (
          <Panel key={a.id} style={{padding:'12px 16px',borderRadius:10}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{flex:1,fontWeight:700,color:'#f0e8e8',fontSize:14,fontFamily:F}}>{a.name}</div>
              <div style={{fontSize:12.5,color:R,fontWeight:700,width:38,textAlign:'right',fontFamily:FO}}>{a.weight}%</div>
              <div style={{width:80,height:4,background:'rgba(255,255,255,0.07)',borderRadius:2}}>
                <div style={{width:`${Math.min(100,a.weight)}%`,height:'100%',background:`linear-gradient(90deg,#880000,${R})`,borderRadius:2}}/>
              </div>
              <Btn onClick={() => { setForm({name:a.name,weight:String(a.weight)}); setEditId(a.id); }} v="ghost"  size="xs">✏️</Btn>
              <Btn onClick={() => setAttrs(attrs.filter(x => x.id!==a.id))}                             v="danger" size="xs">🗑️</Btn>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};
// ═══ DOMINGO ═════════════════════════════════════════════════
const TAGS = [
  {id:'baiter',    label:'Baiter',    type:'neg'},
  {id:'tiltado',   label:'Tiltado',   type:'neg'},
  {id:'mutadinho', label:'Mutadinho', type:'neg'},
  {id:'genteboa',  label:'Gente boa', type:'pos'},
  {id:'esforçado', label:'Esforçado', type:'pos'},
];
const SundayTab = ({ players, attrs, sessions, setSessions }) => {
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [cards,   setCards]   = useState([]);
  const [scoring, setScoring] = useState(null);
  const [scores,  setScores]  = useState({});
  const [tags,    setTags]    = useState({});
  const [preview, setPreview] = useState(null);

  const baseOverall = scoring ? calc(scores, attrs) : 0;
  const negCount = TAGS.filter(t => t.type==='neg' && tags[t.id]).length;
  const posCount = TAGS.filter(t => t.type==='pos' && tags[t.id]).length;
  const mult = posCount > negCount ? 1.2 : negCount > posCount ? 0.9 : 1.0;
  const overall = Math.min(99, Math.round(baseOverall * mult));
  const tier = getTier(overall);

  const toggleTag = id => setTags(t => ({...t, [id]: !t[id]}));
  const start = p => { setScoring(p); setScores(Object.fromEntries(attrs.map(a => [a.id,5]))); setTags({}); setPreview(null); };
  const gen   = () => {
    if(!scoring) return;
    const c  = {playerId:scoring.id, scores:{...scores}, overall, tags:{...tags}};
    const nc = [...cards.filter(x => x.playerId!==scoring.id), c];
    setCards(nc); setPreview({card:c, player:scoring}); setScoring(null);
  };
  const saveSess = () => {
    if(!cards.length) return;
    setSessions([...sessions.filter(s => s.date!==date), {id:Date.now().toString(),date,cards:[...cards]}]);
    alert(`✅ Sessão salva com ${cards.length} cartinha${cards.length>1?'s':''}!`);
  };
  const ratedIds = cards.map(c => c.playerId);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <SectionLabel>🎮 Sessão Domingo</SectionLabel>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{background:'rgba(15,4,4,.85)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,padding:'8px 12px',color:'#f0e8e8',fontSize:13,fontFamily:F,outline:'none'}}/>
          <Btn onClick={saveSess} v="success" disabled={!cards.length}>💾 Salvar Sessão ({cards.length})</Btn>
        </div>
      </div>
      {scoring && (
        <Panel style={{marginBottom:20,borderColor:`${tier.brd}40`,boxShadow:`0 0 30px ${tier.glow}22`}}>
          <div style={{display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-start'}}>
            <div style={{flexShrink:0}}>
              <SectionLabel color={tier.txt}>Prévia ao Vivo</SectionLabel>
              <PlayerCard player={scoring} card={{scores,overall}} attrs={attrs} scale={0.88}/>
            </div>
            <div style={{flex:1,minWidth:260}}>
              {/* Header: nome + overall */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <div style={{fontSize:18,fontWeight:700,color:'#f0e8e8',fontFamily:F,letterSpacing:.5}}>{scoring.nick}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:6}}>
                  <div style={{fontSize:28,fontWeight:900,color:tier.score,textShadow:`0 0 15px ${tier.glow}`,fontFamily:FO}}>
                    {overall}
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:tier.txt,fontFamily:F}}>{tier.lbl}</span>
                  {mult !== 1.0 && (
                    <span style={{fontSize:11,fontWeight:700,fontFamily:F,letterSpacing:.5,
                      color: mult > 1 ? '#44dd88' : '#ff6655',
                      background: mult > 1 ? 'rgba(68,221,136,0.12)' : 'rgba(255,80,80,0.12)',
                      border: `1px solid ${mult > 1 ? 'rgba(68,221,136,0.3)' : 'rgba(255,80,80,0.3)'}`,
                      borderRadius:5, padding:'2px 6px',
                    }}>
                      {mult > 1 ? '▲' : '▼'} {mult > 1 ? '+20%' : '-10%'}
                    </span>
                  )}
                </div>
              </div>
              {/* Tags comportamentais */}
              <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:18}}>
                {TAGS.map(tag => {
                  const on = !!tags[tag.id];
                  const neg = tag.type === 'neg';
                  const activeColor = neg ? '#ff5555' : '#44dd88';
                  const activeBg   = neg ? 'rgba(255,60,60,0.18)' : 'rgba(68,221,136,0.18)';
                  const activeBrd  = neg ? 'rgba(255,60,60,0.45)' : 'rgba(68,221,136,0.45)';
                  return (
                    <button key={tag.id} onClick={() => toggleTag(tag.id)} style={{
                      background: on ? activeBg : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${on ? activeBrd : 'rgba(255,255,255,0.1)'}`,
                      borderRadius:20, padding:'4px 12px',
                      color: on ? activeColor : '#4a3535',
                      fontSize:11.5, fontWeight:700, fontFamily:F, letterSpacing:.6,
                      cursor:'pointer', transition:'all .15s',
                      boxShadow: on ? `0 0 10px ${activeColor}44` : 'none',
                    }}>
                      {on ? (neg ? '💀' : '✨') : (neg ? '💀' : '✨')} {tag.label}
                    </button>
                  );
                })}
              </div>
              {attrs.map(a => (
                <div key={a.id} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:13,color:'#8a7070',fontFamily:F,fontWeight:600}}>{a.name}</span>
                    <span style={{fontSize:14,fontWeight:700,color:R,fontFamily:FO}}>{Number(scores[a.id]??5).toFixed(1)}</span>
                  </div>
                  <input type="range" min="0" max="10" step="0.5" value={scores[a.id]??5}
                    onChange={e => setScores(s => ({...s,[a.id]:Number(e.target.value)}))}
                    style={{width:'100%',background:`linear-gradient(90deg,${tier.brd} ${(scores[a.id]??5)*10}%,rgba(255,255,255,.1) ${(scores[a.id]??5)*10}%)`,accentColor:tier.brd}}/>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:9.5,color:'#3a2020',marginTop:2,fontFamily:F}}>
                    <span>0</span><span>5</span><span>10</span>
                  </div>
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <Btn onClick={gen} v="success">✨ Gerar Cartinha</Btn>
                <Btn onClick={() => setScoring(null)} v="danger">✕ Cancelar</Btn>
              </div>
            </div>
          </div>
        </Panel>
      )}
      {preview && !scoring && (
        <Panel style={{marginBottom:20,textAlign:'center',padding:'24px 20px'}}>
          <div style={{fontSize:15,color:'#44dd88',marginBottom:16,fontWeight:700,fontFamily:F,letterSpacing:.5}}>
            ✅ Cartinha de {preview.player.nick} gerada!
          </div>
          <div style={{display:'flex',justifyContent:'center'}}>
            <PlayerCard player={preview.player} card={preview.card} attrs={attrs} scale={1.05} reveal/>
          </div>
        </Panel>
      )}
      {!players.length ? (
        <Panel style={{textAlign:'center',padding:'40px 20px'}}>
          <div style={{fontSize:44,marginBottom:12}}>👥</div>
          <div style={{fontSize:14,color:'#6a3535',fontFamily:F,fontWeight:600}}>Cadastre jogadores primeiro.</div>
        </Panel>
      ) : (
        <>
          {players.filter(p => !ratedIds.includes(p.id)).length > 0 && (
            <div style={{marginBottom:24}}>
              <SectionLabel>⏳ Aguardando avaliação ({players.filter(p=>!ratedIds.includes(p.id)).length})</SectionLabel>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {players.filter(p => !ratedIds.includes(p.id)).map(p => (
                  <button key={p.id} className="lbc-ppl-pick" onClick={() => start(p)} style={{
                    background:'rgba(255,255,255,0.027)',border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:10,padding:'10px 16px',cursor:'pointer',
                    color:'#f0e8e8',fontSize:13,fontWeight:700,fontFamily:F,letterSpacing:.5,
                    display:'flex',alignItems:'center',gap:9,
                  }}>
                    {(p.photoClean||p.photo)
                      ? <img src={p.photoClean||p.photo} style={{width:30,height:30,borderRadius:'50%',objectFit:'cover'}}/>
                      : <span style={{fontSize:18}}>👤</span>}
                    {p.nick}
                  </button>
                ))}
              </div>
            </div>
          )}
          {ratedIds.length > 0 && (
            <div>
              <SectionLabel color="#44dd88">✅ Avaliados ({ratedIds.length})</SectionLabel>
              <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                {players.filter(p => ratedIds.includes(p.id)).map(p => {
                  const c = cards.find(x => x.playerId===p.id);
                  return c ? (
                    <div key={p.id} style={{cursor:'pointer'}} onClick={() => setPreview({card:c,player:p})}>
                      <PlayerCard player={p} card={c} attrs={attrs} scale={0.65}/>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
// ═══ HISTÓRICO ═══════════════════════════════════════════════
const HistoryTab = ({ sessions, players, attrs }) => {
  const sorted = [...sessions].sort((a,b) => b.date.localeCompare(a.date));
  const [selId, setSelId] = useState(null);
  const sess = sorted.find(s => s.id===selId) || sorted[0];
  if(!sessions.length) return (
    <Panel style={{textAlign:'center',padding:'40px 20px'}}>
      <div style={{fontSize:44,marginBottom:12}}>📊</div>
      <div style={{fontSize:14,color:'#6a3535',fontFamily:F,fontWeight:600}}>Nenhuma sessão salva ainda.</div>
    </Panel>
  );
  return (
    <div>
      <SectionLabel>📊 Histórico</SectionLabel>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:22}}>
        {sorted.map(s => (
          <button key={s.id} onClick={() => setSelId(s.id)} style={{
            background: sess?.id===s.id ? RD : 'rgba(255,255,255,0.027)',
            border:`1px solid ${sess?.id===s.id?'rgba(200,17,17,.4)':'rgba(255,255,255,0.07)'}`,
            borderRadius:8, padding:'7px 16px', cursor:'pointer',
            color: sess?.id===s.id ? '#ff6655' : '#6a4040',
            fontSize:12.5, fontWeight:700, fontFamily:F, letterSpacing:.5, transition:'all .2s',
          }}>
            {new Date(s.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}
            <span style={{marginLeft:6,opacity:.55,fontSize:11}}>({s.cards?.length||0})</span>
          </button>
        ))}
      </div>
      {sess && (
        <>
          <div style={{fontSize:13,color:'#6a4040',marginBottom:18,fontFamily:F,fontWeight:600}}>
            {new Date(sess.date+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
          </div>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            {[...(sess.cards||[])].sort((a,b) => b.overall-a.overall).map(c => {
              const p = players.find(pl => pl.id===c.playerId);
              return p ? <PlayerCard key={c.playerId} player={p} card={c} attrs={attrs} scale={0.85}/> : null;
            })}
          </div>
        </>
      )}
    </div>
  );
};
// ═══ CONFIG ══════════════════════════════════════════════════
const ConfigTab = ({ apiKey, setApiKey }) => {
  const [key, setKey] = useState(apiKey);
  const [ok,  setOk]  = useState(false);
  const save = () => { setApiKey(key); setOk(true); setTimeout(() => setOk(false), 2500); };
  return (
    <div>
      <SectionLabel>🔧 Configurações</SectionLabel>
      <Panel style={{maxWidth:500,marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:'#f0dada',marginBottom:12,fontFamily:F}}>🖼️ Remove.bg — Remoção de Fundo</div>
        <p style={{fontSize:12.5,color:'#5a3535',marginBottom:16,lineHeight:1.75,fontFamily:F}}>
          Crie uma conta gratuita em{' '}
          <a href="https://www.remove.bg/api" target="_blank" rel="noreferrer" style={{color:R}}>remove.bg</a>
          {' '}(50 fotos/mês grátis) e cole sua API key abaixo.
        </p>
        <Field label="API Key do remove.bg" value={key} onChange={setKey} placeholder="Ex: abc123XYZ..."/>
        <Btn onClick={save} v={ok?'success':'primary'}>{ok ? '✅ Salvo!' : '💾 Salvar API Key'}</Btn>
      </Panel>
      <Panel style={{maxWidth:500}}>
        <div style={{fontSize:14,fontWeight:700,color:'#f0dada',marginBottom:16,fontFamily:F}}>🏅 Faixas de Rating</div>
        {TIERS.map(t => (
          <div key={t.name} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:t.brd,boxShadow:`0 0 8px ${t.glow}`,flexShrink:0}}/>
            <div style={{width:80,fontWeight:700,color:t.txt,fontSize:13.5,fontFamily:F}}>{t.name}</div>
            <div style={{fontSize:12,color:'#5a3535',width:90,fontFamily:F}}>{t.min}–{t.max} pts</div>
            <div style={{flex:1,height:5,background:'rgba(255,255,255,0.06)',borderRadius:3}}>
              <div style={{width:`${((t.max-t.min)/99)*100}%`,height:'100%',background:`linear-gradient(90deg,${t.glow}88,${t.brd})`,borderRadius:3,boxShadow:`0 0 6px ${t.glow}66`}}/>
            </div>
          </div>
        ))}
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
      background:'#070404', minHeight:'100vh',
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
            <img src="/logo.png" alt="" style={{width:64,height:64,objectFit:'contain',
              filter:`drop-shadow(0 0 14px ${R}aa)`}}
              onError={e=>{e.target.style.display='none';}}/>
          </div>
          <div style={{fontSize:26,fontWeight:900,fontFamily:FO,letterSpacing:3,
            background:`linear-gradient(90deg,${R},#ff6644,#ffffff)`,
            WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            LOBBÃO CRAFT
          </div>
          <div style={{fontSize:10,color:'#3a1515',letterSpacing:4,fontWeight:700,
            textTransform:'uppercase',marginTop:6}}>
            Ranking Semanal · CS2
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
          <div style={{fontSize:11,fontWeight:700,letterSpacing:2.5,color:'#5a3030',
            textTransform:'uppercase',marginBottom:22,textAlign:'center'}}>
            🔐 Área Restrita
          </div>

          {/* Campo Login */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10.5,color:'#5a3030',display:'block',marginBottom:6,
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
            <label style={{fontSize:10.5,color:'#5a3030',display:'block',marginBottom:6,
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
            width:'100%',padding:'11px',
            background:`linear-gradient(135deg,#990000,${R})`,
            border:'1px solid rgba(200,50,50,0.4)',
            borderRadius:8,color:'#fff',fontSize:13.5,fontWeight:700,
            fontFamily:F,letterSpacing:1,textTransform:'uppercase',
            cursor:'pointer',transition:'all .15s',
          }}>
            Entrar
          </button>
        </div>

        <div style={{textAlign:'center',marginTop:18,fontSize:10.5,color:'#2a1515',fontWeight:600,letterSpacing:1}}>
          FL1IP · Lobbão CS2
        </div>
      </div>
    </div>
  );
};
// ═══ APP ═════════════════════════════════════════════════════
export default function App() {
  const [tab,      setTab]      = useState('home');
  const [players,  setPlayers]  = useState([]);
  const [attrs,    setAttrs]    = useState(DATTRS);
  const [sessions, setSessions] = useState([]);
  const [apiKey,   setApiKey]   = useState('');
  const [loaded,   setLoaded]   = useState(false);
  const [authed,   setAuthed]   = useState(false);
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
  const sp = v => { setPlayers(v);  sv('lbc2_p', v); };
  const sa = v => { setAttrs(v);    sv('lbc2_a', v); };
  const ss = v => { setSessions(v); sv('lbc2_s', v); };
  const sk = v => { setApiKey(v);   sv('lbc2_k', v); };
  if(!loaded) return (
    <div style={{background:'#070404',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <FL1IP size={2.2}/>
        <div style={{marginTop:16,fontSize:11,letterSpacing:4,fontWeight:900,fontFamily:FO,color:'#cc3333',textShadow:`0 0 20px ${R}`}}>
          CARREGANDO...
        </div>
      </div>
    </div>
  );
  if(!authed) return <LoginScreen onLogin={() => setAuthed(true)}/>;
  const logout = () => { sv('lbc2_auth', false); setAuthed(false); };
  const TABS = [
    {id:'home',    icon:'🏠', label:'Home'},
    {id:'players', icon:'👥', label:'Jogadores'},
    {id:'attrs',   icon:'⚙️', label:'Atributos'},
    {id:'sunday',  icon:'🎮', label:'Domingo'},
    {id:'history', icon:'📊', label:'Histórico'},
    {id:'config',  icon:'🔧', label:'Config'},
  ];
  return (
    <div style={{background:'#070404',minHeight:'100vh',color:'#f0e8e8',display:'flex',flexDirection:'column'}}>
      <div style={{
        background:'linear-gradient(90deg,#050101,#0f0303,#050101)',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        padding:'12px 20px', display:'flex', alignItems:'center', gap:16,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:1.5,
          background:`linear-gradient(90deg,transparent,${R},#ff4422,${R},transparent)`,
          backgroundSize:'200% 100%', animation:'lbcHdr 3s linear infinite'}}/>
        <div style={{position:'absolute',top:0,right:0,width:200,height:'100%',
          background:'radial-gradient(ellipse 80% 120% at 100% 50%,rgba(180,10,10,0.12) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:4,filter:`drop-shadow(0 0 8px ${R}66)`}}>
          <FL1IP size={1.35}/>
        </div>
        <div style={{width:1,height:32,background:'rgba(200,17,17,0.2)',flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:900,fontFamily:FO,letterSpacing:2.5,
            background:`linear-gradient(90deg,${R},#ff6644,#ffffff)`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            LOBBÃO CRAFT
          </div>
          <div style={{fontSize:9.5,color:'#3a1515',letterSpacing:4,fontFamily:F,fontWeight:700,textTransform:'uppercase',marginTop:1}}>
            Ranking Semanal · CS2
          </div>
        </div>
        <button onClick={logout} title="Sair" style={{
          background:'none',border:'1px solid rgba(200,17,17,0.15)',borderRadius:7,
          padding:'5px 10px',cursor:'pointer',color:'#3a1515',fontSize:11,
          fontFamily:F,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
          transition:'all .2s',flexShrink:0,
        }}
          onMouseEnter={e=>{e.target.style.borderColor='rgba(200,17,17,.4)';e.target.style.color='#cc4444';}}
          onMouseLeave={e=>{e.target.style.borderColor='rgba(200,17,17,0.15)';e.target.style.color='#3a1515';}}
        >🚪 Sair</button>
      </div>
      <div style={{background:'rgba(8,3,3,.94)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(200,17,17,0.08)',display:'flex',overflowX:'auto',padding:'0 8px'}}>
        {TABS.map(t => (
          <button key={t.id} className="lbc-nav-btn" onClick={() => setTab(t.id)} style={{
            background:'none', border:'none', cursor:'pointer',
            padding:'11px 15px', fontSize:11.5, fontWeight:700, fontFamily:F, letterSpacing:1.5,
            color: tab===t.id ? R : '#4a2525',
            borderBottom: tab===t.id ? `2px solid ${R}` : '2px solid transparent',
            textTransform:'uppercase', transition:'color .2s', whiteSpace:'nowrap',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <span style={{fontSize:13}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,padding:20,overflowY:'auto'}}>
        {tab==='home'    && <HomeTab    players={players} sessions={sessions} attrs={attrs}/>}
        {tab==='players' && <PlayersTab players={players} setPlayers={sp} apiKey={apiKey}/>}
        {tab==='attrs'   && <AttrsTab   attrs={attrs} setAttrs={sa}/>}
        {tab==='sunday'  && <SundayTab  players={players} attrs={attrs} sessions={sessions} setSessions={ss}/>}
        {tab==='history' && <HistoryTab sessions={sessions} players={players} attrs={attrs}/>}
        {tab==='config'  && <ConfigTab  apiKey={apiKey} setApiKey={sk}/>}
      </div>
    </div>
  );
}
