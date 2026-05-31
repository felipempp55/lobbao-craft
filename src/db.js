// ═══════════════════════════════════════════════════════════
//  Supabase data layer — Lobbão Craft
//  Wraps tables + storage for players, attrs, sessions, settings
// ═══════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://squpxovcoimbrctctojo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdXB4b3Zjb2ltYnJjdGN0b2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTgyNTYsImV4cCI6MjA5NTgzNDI1Nn0.e81qXflD7KbymAvlCu7S05_0JlrQOr5yILftUNNgkN4';

export const supa = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── helpers ──
const b64ToBlob = (dataUrl) => {
  const [h, dt] = dataUrl.split(',');
  const m = h.match(/:(.*?);/)[1];
  const b = atob(dt);
  const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return new Blob([a], { type: m });
};

// ─ Photos (Storage bucket "player-photos") ─
export async function uploadPhoto(dataUrl, playerId, kind = 'photo') {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl; // já é URL ou null
  const blob = b64ToBlob(dataUrl);
  const ext  = blob.type.includes('png') ? 'png' : 'jpg';
  const path = `${playerId}/${kind}_${Date.now()}.${ext}`;
  const { error } = await supa.storage.from('player-photos').upload(path, blob, {
    contentType: blob.type, cacheControl: '3600', upsert: false,
  });
  if (error) throw error;
  const { data } = supa.storage.from('player-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePhotoByUrl(url) {
  if (!url || !url.includes('/storage/v1/object/public/player-photos/')) return;
  const path = url.split('/player-photos/')[1];
  await supa.storage.from('player-photos').remove([path]);
}

// ─ Players ─
const playerFromRow = (r) => ({
  id: r.id, nick: r.nick, gcNick: r.gc_nick,
  photo: r.photo_url, photoClean: r.photo_clean_url,
});
const playerToRow = (p) => ({
  id: p.id, nick: p.nick, gc_nick: p.gcNick || null,
  photo_url: p.photo || null, photo_clean_url: p.photoClean || null,
});

export async function loadPlayers() {
  const { data, error } = await supa.from('players').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(playerFromRow);
}

export async function upsertPlayer(p) {
  const { error } = await supa.from('players').upsert(playerToRow(p));
  if (error) throw error;
}

export async function deletePlayer(id) {
  const { error } = await supa.from('players').delete().eq('id', id);
  if (error) throw error;
}

// ─ Attrs ─
const attrFromRow = (r) => ({ id: r.id, name: r.name, weight: r.weight });

export async function loadAttrs() {
  const { data, error } = await supa.from('attrs').select('*').order('position');
  if (error) throw error;
  return (data || []).map(attrFromRow);
}

export async function saveAttrs(attrs) {
  // estratégia simples: apaga tudo e re-insere com positions atualizadas
  const { error: delErr } = await supa.from('attrs').delete().neq('id', '__never__');
  if (delErr) throw delErr;
  if (!attrs.length) return;
  const rows = attrs.map((a, i) => ({ id: a.id, name: a.name, weight: a.weight, position: i }));
  const { error } = await supa.from('attrs').insert(rows);
  if (error) throw error;
}

// ─ Sessions (histórico salvo) ─
export async function loadSessions() {
  const { data, error } = await supa.from('sessions').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({ id: r.id, date: r.date, cards: r.cards || [] }));
}

export async function upsertSession(s) {
  const { error } = await supa.from('sessions').upsert({ id: s.id, date: s.date, cards: s.cards });
  if (error) throw error;
}

export async function deleteSession(id) {
  const { error } = await supa.from('sessions').delete().eq('id', id);
  if (error) throw error;
}

// ─ Current session (em andamento) ─
export async function loadCurrentSession() {
  const { data, error } = await supa.from('current_session').select('*').eq('id', 1).single();
  if (error) {
    // se não existe a linha, retorna default
    return { date: new Date().toISOString().split('T')[0], cards: [] };
  }
  return { date: data.date, cards: data.cards || [] };
}

export async function saveCurrentSession(s) {
  const { error } = await supa.from('current_session').upsert({
    id: 1, date: s.date, cards: s.cards, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─ Settings (key/value, ex: API key remove.bg) ─
export async function loadSetting(key, defaultValue = '') {
  const { data, error } = await supa.from('settings').select('value').eq('key', key).maybeSingle();
  if (error) return defaultValue;
  return data?.value ?? defaultValue;
}

export async function saveSetting(key, value) {
  const { error } = await supa.from('settings').upsert({ key, value });
  if (error) throw error;
}

// ─ Migration: localStorage → Supabase ─
const ldRaw = (k, d) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : d; } catch { return d; } };

export async function migrateFromLocalStorageIfNeeded() {
  // Se já migrou antes, não roda de novo
  if (localStorage.getItem('lbc2_migrated_to_supa') === '1') return { migrated: false, reason: 'already' };

  // Se Supabase já tem dados, marca como migrado e sai
  const { count: pCount } = await supa.from('players').select('id', { count: 'exact', head: true });
  const { count: sCount } = await supa.from('sessions').select('id', { count: 'exact', head: true });
  if ((pCount || 0) > 0 || (sCount || 0) > 0) {
    localStorage.setItem('lbc2_migrated_to_supa', '1');
    return { migrated: false, reason: 'supa-has-data' };
  }

  const oldPlayers  = ldRaw('lbc2_p', []);
  const oldAttrs    = ldRaw('lbc2_a', null);
  const oldSessions = ldRaw('lbc2_s', []);
  const oldApiKey   = ldRaw('lbc2_k', '');
  const oldCurrent  = ldRaw('lbc2_current', null);

  if (!oldPlayers.length && !oldSessions.length && !oldAttrs) {
    localStorage.setItem('lbc2_migrated_to_supa', '1');
    return { migrated: false, reason: 'nothing-to-migrate' };
  }

  console.log('🔄 Migrando dados do localStorage para Supabase...');

  // Players (com upload de fotos pro Storage)
  for (const p of oldPlayers) {
    let photoUrl  = p.photo;
    let cleanUrl  = p.photoClean;
    try {
      if (p.photo && p.photo.startsWith('data:'))      photoUrl = await uploadPhoto(p.photo, p.id, 'photo');
      if (p.photoClean && p.photoClean.startsWith('data:')) cleanUrl = await uploadPhoto(p.photoClean, p.id, 'clean');
    } catch (e) { console.warn('Falha ao migrar foto de', p.nick, e); }
    await upsertPlayer({ ...p, photo: photoUrl, photoClean: cleanUrl });
  }

  // Attrs (se tiver custom; senão deixa os defaults serem populados pelo App)
  if (oldAttrs && oldAttrs.length) {
    await saveAttrs(oldAttrs);
  }

  // Sessions
  for (const s of oldSessions) {
    await upsertSession(s);
  }

  // Current session
  if (oldCurrent) {
    await saveCurrentSession(oldCurrent);
  }

  // API key
  if (oldApiKey) {
    await saveSetting('apiKey', oldApiKey);
  }

  localStorage.setItem('lbc2_migrated_to_supa', '1');
  console.log('✅ Migração para Supabase completa!');
  return { migrated: true };
}
