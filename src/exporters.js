// ═══════════════════════════════════════════════════════════
//  Exporters — gera PDF / PNG das cartas via html2canvas + jspdf
// ═══════════════════════════════════════════════════════════
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Ordem dos tiers de cima pra baixo nas páginas do PDF
const TIER_ORDER = ['GOAT', 'Dream Lobby', 'Bom Player', 'Bagre', 'Melhor Freezar'];

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

async function captureElement(el, scale = 2.5) {
  return html2canvas(el, {
    backgroundColor: null,
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
}

const slug = s => String(s || '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// ═══════════════════════════════════════════════════════════
//  1) Carta individual → PDF A4
// ═══════════════════════════════════════════════════════════
export async function exportCardAsPDF(el, filename = 'cartinha.pdf') {
  const canvas = await captureElement(el, 3);
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  // Fundo escuro
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
//  2) Sessão completa → PDF organizado por tier (1 página por tier)
// ═══════════════════════════════════════════════════════════
export async function exportSessionAsPDFByTier({ cardElements, cards, getTier, sessionDateLabel }) {
  // Agrupar cartas por tier
  const groups = {};
  cards.forEach(c => {
    const t = getTier(c.overall);
    if (!groups[t.name]) groups[t.name] = { tier: t, items: [] };
    groups[t.name].items.push(c);
  });

  // Pré-captura tudo
  const captured = new Map();
  for (const c of cards) {
    const el = cardElements[c.playerId];
    if (el) {
      try {
        captured.set(c.playerId, await captureElement(el, 2));
      } catch (e) { console.warn('captura falhou', c.playerId, e); }
    }
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  let first = true;
  for (const tierName of TIER_ORDER) {
    const group = groups[tierName];
    if (!group || !group.items.length) continue;

    if (!first) pdf.addPage();
    first = false;

    // Fundo
    pdf.setFillColor(22, 17, 15);
    pdf.rect(0, 0, pdfW, pdfH, 'F');

    // Linha colorida no topo (cor do tier)
    const col = group.tier.brd || '#cc1111';
    const [tr, tg, tb] = hexToRgb(col);
    pdf.setFillColor(tr, tg, tb);
    pdf.rect(0, 0, pdfW, 8, 'F');

    // Header
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(36);
    pdf.text(tierName.toUpperCase(), pdfW / 2, 70, { align: 'center' });
    pdf.setTextColor(200, 200, 200);
    pdf.setFontSize(11);
    pdf.text(`${group.items.length} jogador${group.items.length > 1 ? 'es' : ''} • ${sessionDateLabel}`, pdfW / 2, 92, { align: 'center' });

    // Footer
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(9);
    pdf.text('LOBBÃO CRAFT • Ranking Semanal CS2', pdfW / 2, pdfH - 18, { align: 'center' });

    // Grid de cartas
    const items = [...group.items].sort((a, b) => b.overall - a.overall);
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
}

// ═══════════════════════════════════════════════════════════
//  3) Sessão completa → PNG único pra Instagram
// ═══════════════════════════════════════════════════════════
export async function exportSessionAsInstagramImage({ cardElements, cards, sessionDateLabel }) {
  const sorted = [...cards].sort((a, b) => b.overall - a.overall);

  // Captura tudo
  const captured = [];
  for (const c of sorted) {
    const el = cardElements[c.playerId];
    if (!el) continue;
    try {
      captured.push({ card: c, canvas: await captureElement(el, 2) });
    } catch (e) { console.warn('captura falhou', c.playerId, e); }
  }
  if (!captured.length) return;

  const cardW = captured[0].canvas.width;
  const cardH = captured[0].canvas.height;

  // Layout em grid balanceado
  const n = captured.length;
  let cols;
  if (n <= 2) cols = n;
  else if (n <= 4) cols = 2;
  else if (n <= 9) cols = 3;
  else cols = 4;
  const rows = Math.ceil(n / cols);

  // Margens
  const padX = Math.round(cardW * 0.10);
  const padY = Math.round(cardH * 0.06);
  const headerH = Math.round(cardH * 0.30);
  const footerH = Math.round(cardH * 0.14);

  const W = cols * cardW + (cols + 1) * padX;
  const H = headerH + rows * cardH + (rows + 1) * padY + footerH;

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');

  // Background gradient vermelho escuro
  const grd = ctx.createRadialGradient(W / 2, 0, 0, W / 2, H / 2, H);
  grd.addColorStop(0, '#3a0a0a');
  grd.addColorStop(0.5, '#16110f');
  grd.addColorStop(1, '#0a0606');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Glow vermelho no topo
  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.6);
  topGlow.addColorStop(0, 'rgba(204,17,17,0.25)');
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, headerH);

  // Linha vermelha topo
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(0, 0, W, Math.round(cardH * 0.02));

  // Título
  ctx.textAlign = 'center';
  const titleSize = Math.round(cardH * 0.20);
  const subSize = Math.round(cardH * 0.07);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${titleSize}px "Saira Condensed", "Arial Black", Impact, sans-serif`;
  ctx.fillText('LOBBÃO CRAFT', W / 2, headerH * 0.55);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `700 ${subSize}px "Chakra Petch", sans-serif`;
  ctx.fillText(`DOMINGO • ${sessionDateLabel.toUpperCase()} • ${n} CART${n > 1 ? 'AS' : 'A'}`, W / 2, headerH * 0.82);

  // Cartas
  captured.forEach(({ canvas }, i) => {
    const colIdx = i % cols;
    const rowIdx = Math.floor(i / cols);
    const x = padX + colIdx * (cardW + padX);
    const y = headerH + padY + rowIdx * (cardH + padY);
    // sombra
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    ctx.drawImage(canvas, x, y);
    ctx.shadowColor = 'transparent';
  });

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `700 ${Math.round(cardH * 0.05)}px "Chakra Petch", sans-serif`;
  ctx.fillText('#LobbãoCraft • Ranking Semanal CS2', W / 2, H - footerH / 2);

  // Linha vermelha bottom
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(0, H - Math.round(cardH * 0.02), W, Math.round(cardH * 0.02));

  c.toBlob(blob => downloadBlob(blob, `lobbao-${slug(sessionDateLabel)}-instagram.png`), 'image/png', 0.95);
}

// ── util ──
function hexToRgb(hex) {
  const h = (hex || '#cc1111').replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
