// ═══════════════════════════════════════════════════════════
//  Exporters — gera PDF / PNG das cartas via html-to-image + jspdf
//  Trocamos html2canvas → html-to-image (suporte muito melhor a
//  backdrop-filter, clip-path, filter, drop-shadow das cartas)
// ═══════════════════════════════════════════════════════════
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

const TIER_ORDER = ['GOAT', 'Dream Lobby', 'Bom Player', 'Bagre', 'Melhor Freezar'];
const APP_BG = '#16110f';

// ── helpers ──
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const slug = s => String(s || '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Aguarda imgs carregarem
function waitForImages(el, timeoutMs = 1500) {
  const imgs = Array.from(el.querySelectorAll('img'));
  if (!imgs.length) return Promise.resolve();
  return Promise.race([
    Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        img.addEventListener('load',  () => res(), { once: true });
        img.addEventListener('error', () => res(), { once: true });
      });
    })),
    new Promise(res => setTimeout(res, timeoutMs)),
  ]);
}

// Pequeno delay para garantir DOM/CSS estável
const wait = ms => new Promise(r => setTimeout(r, ms));

// Captura via html-to-image — duas tentativas (com cache bust no retry)
async function captureElement(el, { pixelRatio = 2.5, bg = APP_BG } = {}) {
  await waitForImages(el);
  await wait(60);

  const opts = {
    backgroundColor: bg,
    pixelRatio,
    cacheBust: true,
    skipFonts: false,
    // pula scrollbars e pseudo elementos problemáticos
    filter: (node) => {
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return true;
      // se um elemento tem display:none, ignora
      try {
        if (node.style && node.style.display === 'none') return false;
      } catch {}
      return true;
    },
  };

  try {
    const canvas = await htmlToImage.toCanvas(el, opts);
    if (canvas.width && canvas.height) return canvas;
    throw new Error('canvas vazio');
  } catch (e) {
    console.warn('captura 1 falhou, retry...', e?.message || e);
    await wait(120);
    // Retry: usa toPng + criar canvas manualmente — mais robusto pra alguns navegadores
    const dataUrl = await htmlToImage.toPng(el, { ...opts, cacheBust: true });
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = dataUrl;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return c;
  }
}

// ═══════════════════════════════════════════════════════════
//  1) Carta individual → PDF A4
// ═══════════════════════════════════════════════════════════
export async function exportCardAsPDF(el, filename = 'cartinha.pdf') {
  if (!el) throw new Error('Elemento da carta não encontrado');
  const canvas = await captureElement(el, { pixelRatio: 3, bg: APP_BG });
  if (!canvas.width || !canvas.height) throw new Error('Captura retornou vazia');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  pdf.setFillColor(22, 17, 15);
  pdf.rect(0, 0, pdfW, pdfH, 'F');

  const margin = 50;
  const ratio = Math.min((pdfW - 2 * margin) / canvas.width, (pdfH - 2 * margin) / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  const x = (pdfW - w) / 2;
  const y = (pdfH - h) / 2;

  pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, y, w, h);
  pdf.save(filename);
}

// ═══════════════════════════════════════════════════════════
//  2) Sessão → PDF organizado por tier
// ═══════════════════════════════════════════════════════════
export async function exportSessionAsPDFByTier({ cardElements, cards, getTier, sessionDateLabel }) {
  const groups = {};
  cards.forEach(c => {
    const t = getTier(c.overall);
    if (!groups[t.name]) groups[t.name] = { tier: t, items: [] };
    groups[t.name].items.push(c);
  });

  const captured = new Map();
  const failures = [];
  for (const c of cards) {
    const el = cardElements[c.playerId];
    if (!el) { failures.push(c.playerId); continue; }
    try {
      const canvas = await captureElement(el, { pixelRatio: 2, bg: APP_BG });
      if (canvas.width && canvas.height) captured.set(c.playerId, canvas);
      else failures.push(c.playerId);
    } catch (e) {
      console.warn('captura falhou', c.playerId, e);
      failures.push(c.playerId);
    }
  }
  if (!captured.size) throw new Error('Nenhuma carta foi capturada com sucesso');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  let first = true;
  for (const tierName of TIER_ORDER) {
    const group = groups[tierName];
    if (!group || !group.items.length) continue;
    const drawable = group.items.filter(c => captured.has(c.playerId));
    if (!drawable.length) continue;

    if (!first) pdf.addPage();
    first = false;

    pdf.setFillColor(22, 17, 15);
    pdf.rect(0, 0, pdfW, pdfH, 'F');

    const [tr, tg, tb] = hexToRgb(group.tier.brd || '#cc1111');
    pdf.setFillColor(tr, tg, tb);
    pdf.rect(0, 0, pdfW, 8, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    pdf.text(tierName.toUpperCase(), pdfW / 2, 70, { align: 'center' });
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(11);
    pdf.text(`${drawable.length} jogador${drawable.length > 1 ? 'es' : ''} • ${sessionDateLabel}`, pdfW / 2, 92, { align: 'center' });

    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(9);
    pdf.text('LOBBÃO CRAFT • Ranking Semanal CS2', pdfW / 2, pdfH - 18, { align: 'center' });

    const items = [...drawable].sort((a, b) => b.overall - a.overall);
    const cols = items.length === 1 ? 1 : 2;
    const rows = Math.ceil(items.length / cols);
    const gridTop = 120;
    const gridBottom = pdfH - 40;
    const gridLeft = 30;
    const gridRight = pdfW - 30;
    const cellW = (gridRight - gridLeft) / cols;
    const cellH = (gridBottom - gridTop) / rows;

    items.forEach((c, i) => {
      const canvas = captured.get(c.playerId);
      if (!canvas) return;
      const colIdx = i % cols;
      const rowIdx = Math.floor(i / cols);
      const ratio = Math.min((cellW - 24) / canvas.width, (cellH - 24) / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      const x = gridLeft + colIdx * cellW + (cellW - w) / 2;
      const y = gridTop + rowIdx * cellH + (cellH - h) / 2;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', x, y, w, h);
    });
  }

  pdf.save(`lobbao-${slug(sessionDateLabel)}-por-tier.pdf`);
  if (failures.length) {
    console.warn(`${failures.length} cart${failures.length > 1 ? 'as falharam' : 'a falhou'} na captura`);
  }
}

// ═══════════════════════════════════════════════════════════
//  3) Sessão → PNG único pra Instagram
// ═══════════════════════════════════════════════════════════
export async function exportSessionAsInstagramImage({ cardElements, cards, sessionDateLabel }) {
  const sorted = [...cards].sort((a, b) => b.overall - a.overall);

  const captured = [];
  for (const c of sorted) {
    const el = cardElements[c.playerId];
    if (!el) continue;
    try {
      const canvas = await captureElement(el, { pixelRatio: 1.8, bg: APP_BG });
      if (canvas.width && canvas.height) captured.push({ card: c, canvas });
    } catch (e) {
      console.warn('captura falhou', c.playerId, e);
    }
  }
  if (!captured.length) throw new Error('Nenhuma carta foi capturada com sucesso');

  const cardW = captured[0].canvas.width;
  const cardH = captured[0].canvas.height;

  const n = captured.length;
  let cols;
  if (n <= 2) cols = n;
  else if (n <= 4) cols = 2;
  else if (n <= 9) cols = 3;
  else cols = 4;
  const rows = Math.ceil(n / cols);

  const padX = Math.round(cardW * 0.10);
  const padY = Math.round(cardH * 0.06);
  const headerH = Math.round(cardH * 0.30);
  const footerH = Math.round(cardH * 0.14);

  const W = cols * cardW + (cols + 1) * padX;
  const H = headerH + rows * cardH + (rows + 1) * padY + footerH;

  // Limita tamanho do canvas final
  const MAX_DIM = 6000;
  let scale = 1;
  if (W > MAX_DIM || H > MAX_DIM) scale = Math.min(MAX_DIM / W, MAX_DIM / H);
  const finalW = Math.round(W * scale);
  const finalH = Math.round(H * scale);

  const c = document.createElement('canvas');
  c.width = finalW;
  c.height = finalH;
  const ctx = c.getContext('2d');
  if (scale !== 1) ctx.scale(scale, scale);

  // BG gradient
  const grd = ctx.createRadialGradient(W / 2, 0, 0, W / 2, H / 2, H);
  grd.addColorStop(0, '#3a0a0a');
  grd.addColorStop(0.5, '#16110f');
  grd.addColorStop(1, '#0a0606');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // glow topo
  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.6);
  topGlow.addColorStop(0, 'rgba(204,17,17,0.25)');
  topGlow.addColorStop(1, 'rgba(204,17,17,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, headerH);

  ctx.fillStyle = '#cc1111';
  ctx.fillRect(0, 0, W, Math.round(cardH * 0.02));

  // título
  ctx.textAlign = 'center';
  const titleSize = Math.round(cardH * 0.20);
  const subSize = Math.round(cardH * 0.07);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${titleSize}px "Saira Condensed", "Arial Black", Impact, sans-serif`;
  ctx.fillText('LOBBÃO CRAFT', W / 2, headerH * 0.55);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `700 ${subSize}px "Chakra Petch", sans-serif`;
  ctx.fillText(`DOMINGO • ${sessionDateLabel.toUpperCase()} • ${n} CART${n > 1 ? 'AS' : 'A'}`, W / 2, headerH * 0.82);

  // cartas
  captured.forEach(({ canvas }, i) => {
    const colIdx = i % cols;
    const rowIdx = Math.floor(i / cols);
    const x = padX + colIdx * (cardW + padX);
    const y = headerH + padY + rowIdx * (cardH + padY);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.drawImage(canvas, x, y);
    ctx.shadowColor = 'transparent';
  });

  // footer
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `700 ${Math.round(cardH * 0.05)}px "Chakra Petch", sans-serif`;
  ctx.fillText('#LobbãoCraft • Ranking Semanal CS2', W / 2, H - footerH / 2);

  ctx.fillStyle = '#cc1111';
  ctx.fillRect(0, H - Math.round(cardH * 0.02), W, Math.round(cardH * 0.02));

  const filename = `lobbao-${slug(sessionDateLabel)}-instagram.png`;
  await new Promise((resolve, reject) => {
    try {
      c.toBlob(blob => {
        if (blob) { downloadBlob(blob, filename); resolve(); }
        else {
          try { downloadDataUrl(c.toDataURL('image/png'), filename); resolve(); }
          catch (err) { reject(err); }
        }
      }, 'image/png');
    } catch (err) {
      try { downloadDataUrl(c.toDataURL('image/png'), filename); resolve(); }
      catch (err2) { reject(err2); }
    }
  });
}

// ── util ──
function hexToRgb(hex) {
  const h = (hex || '#cc1111').replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
