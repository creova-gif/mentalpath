// End-to-end checks against a real GoTrue + PostgREST + Postgres stack with all
// migrations applied (see stack.sh). Uses the same supabase-js client as the app.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { legacyEncrypt, reencryptLegacyNotes } from '../../scripts/reencrypt-legacy-notes.mjs';

const URL_ = process.env.SUPABASE_URL;
const SECRET = process.env.JWT_SECRET;
assert.ok(URL_ && SECRET, 'run via supabase/integration/stack.sh');

function sign(payload) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64({ iss: 'supabase', iat: 1700000000, exp: 4102444800, ...payload });
  const sig = crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}
const ANON = sign({ role: 'anon' });
const SERVICE = sign({ role: 'service_role' });

const client = (key = ANON) => createClient(URL_, key, { auth: { persistSession: false, autoRefreshToken: false } });
const service = client(SERVICE);

// RFC 6238 TOTP (SHA-1, 30s, 6 digits) — what an authenticator app computes.
function totp(base32Secret, now = Date.now()) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of base32Secret.replace(/=+$/, '')) bits += alphabet.indexOf(c).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 1000 / 30)));
  const h = crypto.createHmac('sha1', key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

async function newClinician(metadata = {}) {
  const sb = client();
  const email = `clin-${crypto.randomUUID().slice(0, 8)}@example.test`;
  const { data, error } = await sb.auth.signUp({
    email, password: 'correct horse battery staple',
    options: { data: { first_name: 'Test', last_name: 'Clinician', profession: 'psychologist', ...metadata } },
  });
  assert.ifError(error);
  assert.ok(data.session, 'autoconfirm returns a session');
  return { sb, user: data.user, email };
}

async function upgradeToAal2(sb) {
  const { data: enrolled, error } = await sb.auth.mfa.enroll({ factorType: 'totp' });
  assert.ifError(error);
  const { error: verifyError } = await sb.auth.mfa.challengeAndVerify({ factorId: enrolled.id, code: totp(enrolled.totp.secret) });
  assert.ifError(verifyError);
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  assert.equal(aal.currentLevel, 'aal2');
}

test('signup creates the clinician profile with a server-controlled trial', async () => {
  const { sb, user } = await newClinician({ plan_type: 'group', is_trial: 'false', trial_ends_at: '2999-01-01' });
  const { data, error } = await sb.from('clinicians').select('first_name, profession, plan_type, is_trial, trial_ends_at, subscription_status').eq('id', user.id).single();
  assert.ifError(error);
  assert.equal(data.first_name, 'Test');
  assert.equal(data.profession, 'psychologist');
  assert.equal(data.plan_type, 'solo');
  assert.equal(data.is_trial, true);
  const days = (new Date(data.trial_ends_at) - Date.now()) / 86400000;
  assert.ok(days > 6 && days < 8, `7-day trial, got ${days}`);
  assert.equal(data.subscription_status, 'none');
});

test('passwords shorter than 12 characters are rejected', async () => {
  const { error } = await client().auth.signUp({ email: `short-${Date.now()}@example.test`, password: 'short-pw' });
  assert.ok(error, 'expected an error');
});

test('without MFA the clinician sees their profile but no clinical data', async () => {
  const { sb, user } = await newClinician();
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  assert.equal(aal.currentLevel, 'aal1');
  const { error } = await sb.from('clients').insert({ clinician_id: user.id, first_name: 'A', last_name: 'B' });
  assert.ok(error, 'AAL1 insert must fail');
  assert.match(error.message, /row-level security/);
  const { data: profile } = await sb.from('clinicians').select('id').eq('id', user.id);
  assert.equal(profile.length, 1);
});

test('full clinical flow: MFA → client → note → lock → amendment → audit', async () => {
  const { sb, user } = await newClinician();
  await upgradeToAal2(sb);

  const { data: c, error: ce } = await sb.from('clients').insert({ clinician_id: user.id, first_name: 'Sam', last_name: 'Rivera' }).select('id').single();
  assert.ifError(ce);

  const { data: noteId, error: ne } = await sb.rpc('save_session_note', {
    p_note_id: null, p_client_id: c.id, p_session_date: '2026-09-24', p_session_type: 'video',
    p_duration_minutes: 50, p_note_format: 'dap', p_ai_used: false,
    p_section_1: 'Client reported improved sleep.', p_section_2: 'Stable.', p_section_3: 'Continue CBT.', p_section_4: null,
  });
  assert.ifError(ne);

  // Stored ciphertext, never plaintext
  const { data: raw } = await service.from('session_notes').select('section_1, enc_version, session_number').eq('id', noteId).single();
  assert.equal(raw.enc_version, 2);
  assert.ok(!raw.section_1.includes('improved sleep'), 'section must be encrypted at rest');
  assert.equal(raw.session_number, 1);

  // Browser roles cannot write note content directly
  const { error: directWrite } = await sb.from('session_notes').update({ section_1: 'plaintext' }).eq('id', noteId);
  assert.ok(directWrite, 'direct content writes must be refused');

  const { data: read, error: re } = await sb.rpc('get_session_note', { p_note_id: noteId });
  assert.ifError(re);
  assert.equal(read[0].section_1, 'Client reported improved sleep.');

  const { error: le } = await sb.rpc('lock_session_note', { p_note_id: noteId });
  assert.ifError(le);
  const { error: editLocked } = await sb.rpc('save_session_note', {
    p_note_id: noteId, p_client_id: c.id, p_session_date: '2026-09-24', p_session_type: 'video',
    p_duration_minutes: 50, p_note_format: 'dap', p_ai_used: false,
    p_section_1: 'rewritten', p_section_2: null, p_section_3: null, p_section_4: null,
  });
  assert.match(editLocked?.message ?? '', /cannot be modified/);

  const { error: ae } = await sb.from('session_note_amendments').insert({ note_id: noteId, body: 'Correction.', reason: 'typo' });
  assert.ifError(ae);

  const { data: audit } = await sb.from('audit_log').select('action, table_name').order('id');
  const actions = audit.map((a) => `${a.table_name}:${a.action}`);
  for (const expected of ['clients:INSERT', 'session_notes:INSERT', 'session_notes:NOTE_ACCESSED', 'session_notes:NOTE_LOCKED', 'session_note_amendments:INSERT']) {
    assert.ok(actions.includes(expected), `missing ${expected} in ${actions}`);
  }
  const { error: forge } = await sb.from('audit_log').insert({ clinician_id: user.id, action: 'FAKE', table_name: 'x' });
  assert.ok(forge, 'audit log must not be writable');
});

test('tenant isolation through the API', async () => {
  const a = await newClinician();
  const b = await newClinician();
  await upgradeToAal2(a.sb);
  await upgradeToAal2(b.sb);
  const { data: ca } = await a.sb.from('clients').insert({ clinician_id: a.user.id, first_name: 'Only', last_name: 'Alice' }).select('id').single();

  const { data: seen } = await b.sb.from('clients').select('id');
  assert.equal(seen.length, 0);
  const { data: probe } = await b.sb.rpc('get_session_note', { p_note_id: crypto.randomUUID() });
  assert.equal(probe.length, 0);
  const { error: ref } = await b.sb.from('appointments').insert({ clinician_id: b.user.id, client_id: ca.id, scheduled_at: new Date().toISOString() });
  assert.match(ref?.message ?? '', /Client not found/);
  const { error: steal } = await b.sb.from('clients').insert({ clinician_id: a.user.id, first_name: 'x', last_name: 'y' });
  assert.ok(steal);
});

test('browsers cannot grant themselves a plan; anon sees nothing', async () => {
  const { sb, user } = await newClinician();
  for (const patch of [{ plan_type: 'group' }, { is_trial: false }, { subscription_status: 'active' }, { stripe_customer_id: 'cus_x' }]) {
    const { error } = await sb.from('clinicians').update(patch).eq('id', user.id);
    assert.ok(error, `update ${Object.keys(patch)[0]} must fail`);
  }
  const { error: okProfile } = await sb.from('clinicians').update({ city: 'Toronto' }).eq('id', user.id);
  assert.ifError(okProfile);

  const anon = client();
  const { data: clients } = await anon.from('clients').select('id');
  assert.equal(clients.length, 0);
  const { error: kv } = await anon.from('kv_store_4d1a502d').select('*');
  assert.ok(kv);
});

test('billing: Starter limit after the trial, Stripe events idempotent, AI metering atomic', async () => {
  const { sb, user } = await newClinician();
  await upgradeToAal2(sb);
  await service.from('clinicians').update({ trial_ends_at: new Date(Date.now() - 86400000).toISOString() }).eq('id', user.id);
  const { data: plan } = await sb.rpc('current_plan');
  assert.equal(plan, 'starter');
  const first = await sb.from('clients').insert({ clinician_id: user.id, first_name: 'One', last_name: 'C' });
  assert.ifError(first.error);
  const second = await sb.from('clients').insert({ clinician_id: user.id, first_name: 'Two', last_name: 'C' });
  assert.equal(second.error?.hint, 'PLAN_LIMIT');

  const id = `evt_${crypto.randomUUID()}`;
  assert.equal((await service.rpc('record_stripe_event', { p_id: id, p_type: 'x' })).data, true);
  assert.equal((await service.rpc('record_stripe_event', { p_id: id, p_type: 'x' })).data, false);
  const { error: browserEvt } = await sb.rpc('record_stripe_event', { p_id: 'evt_2', p_type: 'x' });
  assert.ok(browserEvt);

  const results = await Promise.all(Array.from({ length: 8 }, () => service.rpc('consume_ai_assist', { p_clinician: user.id, p_limit: 5 })));
  const granted = results.filter((r) => r.data >= 0).length;
  assert.equal(granted, 5, 'exactly the limit is granted under concurrency');
});

test('legacy browser-encrypted notes are migrated to envelope encryption, locked ones included', async () => {
  const { sb, user } = await newClinician();
  await upgradeToAal2(sb);
  const { data: c } = await sb.from('clients').insert({ clinician_id: user.id, first_name: 'Leg', last_name: 'Acy' }).select('id').single();
  const { data: row, error } = await service.from('session_notes').insert({
    clinician_id: user.id, client_id: c.id, session_date: '2025-01-10', note_format: 'soap',
    section_1: await legacyEncrypt('Legacy subjective text.', user.id), section_2: null, section_3: null, section_4: null,
    enc_version: 1, is_locked: true,
  }).select('id').single();
  assert.ifError(error);

  const logs = [];
  const result = await reencryptLegacyNotes(service, { log: (m) => logs.push(m) });
  assert.ok(result.migrated >= 1, logs.join('\n'));
  assert.ok(!result.failed.includes(row.id));

  const { data: raw } = await service.from('session_notes').select('enc_version, is_locked, section_1').eq('id', row.id).single();
  assert.equal(raw.enc_version, 2);
  assert.equal(raw.is_locked, true);
  assert.match(raw.section_1, /BEGIN PGP MESSAGE/);
  const { data: read } = await sb.rpc('get_session_note', { p_note_id: row.id });
  assert.equal(read[0].section_1, 'Legacy subjective text.');

  // service role export returns plaintext; browsers cannot call it
  const { data: exported } = await service.rpc('export_session_notes', { p_clinician: user.id });
  assert.ok(exported.some((n) => n.section_1 === 'Legacy subjective text.'));
  const { error: browserExport } = await sb.rpc('export_session_notes', { p_clinician: user.id });
  assert.ok(browserExport);
});
