#!/usr/bin/env node
// One-off migration: re-encrypts session notes written by the retired browser
// scheme (enc_version = 1) into server-side envelope encryption (enc_version = 2).
// See docs/adr/0001-session-note-storage.md.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/reencrypt-legacy-notes.mjs [--dry-run]
//
// Plaintext exists only in this process's memory and is passed straight to the
// service-role-only reencrypt_legacy_note() function. Nothing is logged but ids.
import { webcrypto as crypto } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const LEGACY_SALT = 'mentalpath-salt';

async function legacyKey(userId) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey('raw', enc.encode(userId), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(LEGACY_SALT), iterations: 100000, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

export async function legacyDecrypt(value, key) {
  if (!value) return null;
  const combined = Buffer.from(value, 'base64');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: combined.subarray(0, 12) }, key, combined.subarray(12));
  return new TextDecoder().decode(plain);
}

/** Test helper: produces a value exactly as the retired browser code did. */
export async function legacyEncrypt(text, userId) {
  const key = await legacyKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return Buffer.concat([iv, ct]).toString('base64');
}

export async function reencryptLegacyNotes(db, { dryRun = false, log = console.log } = {}) {
  const { data: rows, error } = await db.from('session_notes')
    .select('id, clinician_id, section_1, section_2, section_3, section_4')
    .eq('enc_version', 1);
  if (error) throw error;
  const keys = new Map();
  const result = { migrated: 0, failed: [] };
  for (const row of rows ?? []) {
    try {
      if (!keys.has(row.clinician_id)) keys.set(row.clinician_id, await legacyKey(row.clinician_id));
      const key = keys.get(row.clinician_id);
      const sections = await Promise.all([row.section_1, row.section_2, row.section_3, row.section_4].map((v) => legacyDecrypt(v, key)));
      if (!dryRun) {
        const { error: e } = await db.rpc('reencrypt_legacy_note', {
          p_note_id: row.id, p_section_1: sections[0], p_section_2: sections[1], p_section_3: sections[2], p_section_4: sections[3],
        });
        if (e) throw e;
      }
      result.migrated += 1;
    } catch (e) {
      result.failed.push(row.id);
      log(`✗ ${row.id}: ${e.message ?? 'decrypt failed'}`);
    }
  }
  log(`${dryRun ? 'would re-encrypt' : 're-encrypted'} ${result.migrated} note(s); ${result.failed.length} failed`);
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(2);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { failed } = await reencryptLegacyNotes(db, { dryRun: process.argv.includes('--dry-run') });
  process.exit(failed.length ? 1 : 0);
}
