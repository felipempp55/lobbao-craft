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
  { name:'Diamante', min:91, max:99, lbl:'DIAMANTE',
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
  const W = 260*scale, H = 400*scale;
  const isDia = t.name==='Diamante', isGold = t.name==='Ouro', isSilv = t.name==='Prata';
  const gems = isDia ? [
    {p:'8% 14%',s:5},{p:'22% 7%',s:4},{p:'37% 12%',s:6},
    {p:'12% 29%',s:3},{p:'50% 5%',s:4},{p:'5% 42%',s:3},
  ] : [];
  const corners = [
    {t:8,l:8,sides:['Top','Left']},{t:8,r:8,sides:['Top','Right']},
    {b:8,l:8,sides:['Bottom','Left']},{b:8,r:8,sides:['Bottom','Right']},
  ];
  return (
    <div style={{
      width:W, height:H, position:'relative', borderRadius:16*scale, background:t.bg,
      border:`${2.5*scale}px solid ${t.brd}`, flexShrink:0,
      boxShadow:[
        `0 0 ${18*scale}px ${t.glow}44`, `0 0 ${45*scale}px ${t.glow}22`,
        `0 0 ${90*scale}px ${t.glow}0e`, `inset 0 0 ${45*scale}px rgba(0,0,0,.65)`,
        `inset 0 ${2*scale}px ${25*scale}px ${t.glow}16`,
      ].join(','),
      overflow:'hidden',
      animation: reveal ? 'lbcReveal .5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
    }}>
      <style>{`@keyframes lbcFloat{0%,100%{transform:translateX(-50%) translateY(0px)}50%{transform:translateX(-50%) translateY(-${6*scale}px)}}`}</style>
      {/* Stripe pattern */}
      <div style={{position:'absolute',inset:0,backgroundImage:`repeating-linear-gradient(0deg,${t.pat} 0px,${t.pat} 1px,transparent 1px,transparent 7px)`,pointerEvents:'none'}}/>
      {/* Top glow */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:H*.45,background:`radial-gradient(ellipse 80% 55% at 50% 0%,${t.glow}18 0%,transparent 70%)`,pointerEvents:'none'}}/>
      {/* Corner ornaments */}
      {corners.map((c, i) => {
        const pos = {position:'absolute'};
        if(c.t !== undefined) pos.top    = c.t*scale;
        if(c.b !== undefined) pos.bottom = c.b*scale;
        if(c.l !== undefined) pos.left   = c.l*scale;
        if(c.r !== undefined) pos.right  = c.r*scale;
        const bs = {};
        c.sides.forEach(s => { bs[`border${s}`] = `${2*scale}px solid ${t.brd}70`; });
        return <div key={i} style={{...pos, width:22*scale, height:22*scale, ...bs}}/>;
      })}
      {/* Shine sweep */}
      {(isGold || isDia || isSilv) && (
        <div style={{position:'absolute',top:0,bottom:0,width:'50%',pointerEvents:'none',
          background:`linear-gradient(100deg,transparent 20%,${t.glow}1a 50%,transparent 80%)`,
          animation:`lbcShine ${isGold?4:isSilv?5:2.5}s ease-in-out infinite`}}/>
      )}
      {/* Diamond gems */}
      {gems.map((g, i) => (
        <div key={i} style={{
          position:'absolute', top:g.p.split(' ')[0], right:g.p.split(' ')[1],
          width:g.s*scale, height:g.s*scale, borderRadius:'50%',
          background:'radial-gradient(circle,#ffffff,#00ccff)',
          boxShadow:`0 0 ${g.s*3*scale}px #00aaff,0 0 ${g.s*6*scale}px #0055ff`,
          animation:`lbcGem ${1.5+i*.4}s ease-in-out infinite`, animationDelay:`${i*.28}s`,
        }}/>
      ))}
      {/* Score */}
      <div style={{position:'absolute',top:13*scale,left:15*scale,fontSize:62*scale,fontWeight:900,lineHeight:1,
        color:t.score,letterSpacing:-3*scale,fontFamily:FO,
        textShadow:`0 0 ${14*scale}px ${t.glow},0 0 ${28*scale}px ${t.glow}66,0 0 ${55*scale}px ${t.glow}22`}}>
        {card.overall}
      </div>
      {/* Tier label */}
      <div style={{position:'absolute',top:82*scale,left:15*scale,fontSize:8.5*scale,fontWeight:700,
        letterSpacing:3*scale,color:t.txt,textTransform:'uppercase',
        textShadow:`0 0 ${6*scale}px ${t.glow}`,fontFamily:F,
        borderTop:`${1*scale}px solid ${t.brd}55`,paddingTop:3*scale}}>
        {t.lbl}
      </div>
      {/* Nick */}
      <div style={{position:'absolute',top:13*scale,right:13*scale,fontSize:15*scale,fontWeight:700,
        color:t.txt,textAlign:'right',textTransform:'uppercase',letterSpacing:1.2*scale,
        lineHeight:1.2,maxWidth:140*scale,textShadow:`0 0 ${8*scale}px ${t.glow}`,fontFamily:F}}>
        {player.nick || '???'}
      </div>
      {/* Photo */}
      {(player.photoClean || player.photo) ? (
        <img src={player.photoClean || player.photo} alt="" style={{
          position:'absolute', bottom:68*scale, left:'50%', height:222*scale, maxWidth:'95%',
          objectFit: player.photoClean ? 'contain' : 'cover',
          borderRadius: player.photoClean ? 0 : 8*scale,
          filter:`drop-shadow(0 0 ${13*scale}px ${t.glow}bb)`,
          animation:'lbcFloat 4s ease-in-out infinite',
        }}/>
      ) : (
        <div style={{position:'absolute',bottom:72*scale,left:'50%',transform:'translateX(-50%)',
          width:100*scale,height:140*scale,borderRadius:8*scale,
          background:`${t.brd}0e`,border:`${1.5*scale}px dashed ${t.brd}30`,
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:38*scale,opacity:.3}}>👤</div>
      )}
      {/* Photo fade */}
      <div style={{position:'absolute',bottom:62*scale,left:0,right:0,height:55*scale,
        background:'linear-gradient(0deg,rgba(0,0,0,.75) 0%,transparent 100%)',pointerEvents:'none'}}/>
      {/* FL1IP watermark */}
      <div style={{position:'absolute',bottom:67*scale,right:10*scale,opacity:.45,lineHeight:1}}>
        <FL1IP size={0.38*scale}/>
      </div>
      {/* Stats bar */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,
        background:'linear-gradient(0deg,rgba(0,0,0,.93),rgba(0,0,0,.65))',
        padding:`${9*scale}px ${8*scale}px ${11*scale}px`,
        display:'flex',justifyContent:'space-around',alignItems:'center',
        borderTop:`${1.5*scale}px solid ${t.brd}40`,backdropFilter:'blur(6px)'}}>
        {attrs.slice(0,6).map(a => (
          <div key={a.id} style={{textAlign:'center'}}>
            <div style={{fontSize:15*scale,fontWeight:700,color:t.score,lineHeight:1,
              textShadow:`0 0 ${5*scale}px ${t.glow}`,fontFamily:FO}}>
              {Math.round(card.scores?.[a.id] ?? 0)}
            </div>
            <div style={{fontSize:6.5*scale,color:t.txt,opacity:.6,marginTop:2*scale,
              textTransform:'uppercase',letterSpacing:1*scale,fontFamily:F}}>
              {a.name.slice(0,5)}
            </div>
          </div>
        ))}
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
const SundayTab = ({ players, attrs, sessions, setSessions }) => {
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [cards,   setCards]   = useState([]);
  const [scoring, setScoring] = useState(null);
  const [scores,  setScores]  = useState({});
  const [preview, setPreview] = useState(null);
  const overall = scoring ? calc(scores, attrs) : 0;
  const tier    = getTier(overall);
  const start = p => { setScoring(p); setScores(Object.fromEntries(attrs.map(a => [a.id,5]))); setPreview(null); };
  const gen   = () => {
    if(!scoring) return;
    const c  = {playerId:scoring.id, scores:{...scores}, overall:calc(scores,attrs)};
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
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:8}}>
                <div style={{fontSize:18,fontWeight:700,color:'#f0e8e8',fontFamily:F,letterSpacing:.5}}>{scoring.nick}</div>
                <div style={{fontSize:28,fontWeight:900,color:tier.score,textShadow:`0 0 15px ${tier.glow}`,fontFamily:FO}}>
                  {overall} <span style={{fontSize:12,fontWeight:600,color:tier.txt,fontFamily:F}}>{tier.lbl}</span>
                </div>
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
// ═══ APP ═════════════════════════════════════════════════════
export default function App() {
  const [tab,      setTab]      = useState('home');
  const [players,  setPlayers]  = useState([]);
  const [attrs,    setAttrs]    = useState(DATTRS);
  const [sessions, setSessions] = useState([]);
  const [apiKey,   setApiKey]   = useState('');
  const [loaded,   setLoaded]   = useState(false);
  useEffect(() => {
    if(!document.getElementById('lbc-gcss')) {
      const s = document.createElement('style');
      s.id = 'lbc-gcss';
      s.textContent = GCSS;
      document.head.appendChild(s);
    }
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
        <div>
          <div style={{fontSize:17,fontWeight:900,fontFamily:FO,letterSpacing:2.5,
            background:`linear-gradient(90deg,${R},#ff6644,#ffffff)`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            LOBBÃO CRAFT
          </div>
          <div style={{fontSize:9.5,color:'#3a1515',letterSpacing:4,fontFamily:F,fontWeight:700,textTransform:'uppercase',marginTop:1}}>
            Ranking Semanal · CS2
          </div>
        </div>
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
