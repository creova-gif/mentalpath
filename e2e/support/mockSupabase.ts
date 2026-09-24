import type { Page, Route, Request } from '@playwright/test';

// A small in-memory stand-in for the Supabase HTTP APIs (GoTrue auth + MFA,
// PostgREST, RPC, Edge Functions) so UI flows can be tested without a live
// project. It models only what the app uses; unknown calls fail loudly.

export const SUPABASE_ORIGIN = 'https://hkhwgbkijepsxtixdmrs.supabase.co';
export const USER_ID = '11111111-1111-4111-8111-111111111111';
export const EMAIL = 'clinician@example.ca';
export const VALID_TOTP = '123456';

type Row = Record<string, unknown>;

export interface MockOptions {
  /** Verified TOTP factor already enrolled? */
  hasFactor?: boolean;
  clinician?: Row;
  tables?: Record<string, Row[]>;
  rpc?: Record<string, (args: Row) => unknown>;
  functions?: Record<string, (req: Request) => { status?: number; body: unknown }>;
}

export interface MockState {
  requests: { method: string; path: string; body: unknown }[];
  tables: Record<string, Row[]>;
  factorVerified: boolean;
}

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function fakeJwt(aal: 'aal1' | 'aal2'): string {
  const now = Math.floor(Date.now() / 1000);
  return [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({
      sub: USER_ID, email: EMAIL, role: 'authenticated', aud: 'authenticated', aal,
      amr: aal === 'aal2' ? [{ method: 'totp', timestamp: now }, { method: 'password', timestamp: now }] : [{ method: 'password', timestamp: now }],
      iat: now, exp: now + 3600, session_id: 'sess-1',
    }),
    Buffer.from('test-signature').toString('base64url'),
  ].join('.');
}

export function defaultClinician(overrides: Row = {}): Row {
  return {
    id: USER_ID, first_name: 'Robin', last_name: 'Tremblay', profession: 'psychotherapist',
    reg_number: 'CRPO-1234', city: 'Toronto, ON', session_rate: 150, hst_exempt: true,
    plan_type: 'solo', plan_cycle: 'monthly', plan_seats: 1, price_per_seat: 49,
    is_trial: true, trial_ends_at: new Date(Date.now() + 5 * 86400000).toISOString(),
    plan_starts_at: new Date().toISOString(), plan_renews_at: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    ai_assist_enabled: false, subscription_status: 'none', stripe_customer_id: null,
    current_period_end: null, cancel_at: null,
    ...overrides,
  };
}

export async function mockSupabase(page: Page, options: MockOptions = {}): Promise<MockState> {
  const state: MockState = {
    requests: [],
    tables: { clinicians: [defaultClinician(options.clinician)], ...(options.tables ?? {}) },
    factorVerified: !!options.hasFactor,
  };
  let aal: 'aal1' | 'aal2' = 'aal1';

  const user = () => ({
    id: USER_ID, email: EMAIL, aud: 'authenticated', role: 'authenticated',
    app_metadata: { provider: 'email' }, user_metadata: {}, created_at: new Date().toISOString(),
    factors: state.factorVerified
      ? [{ id: 'factor-1', factor_type: 'totp', status: 'verified', friendly_name: 'MentalPath', created_at: '', updated_at: '' }]
      : [],
  });
  const session = () => ({
    access_token: fakeJwt(aal), refresh_token: 'refresh-token', token_type: 'bearer',
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: user(),
  });

  // Server-side note functions (the real ones encrypt; here we just store).
  const notes = () => (state.tables.session_notes ??= []);
  const builtinRpc: Record<string, (args: Row) => unknown> = {
    save_session_note: (a) => {
      const fields = {
        client_id: a.p_client_id, session_date: a.p_session_date, session_type: a.p_session_type,
        duration_minutes: a.p_duration_minutes, note_format: a.p_note_format, ai_used: a.p_ai_used,
        section_1: a.p_section_1, section_2: a.p_section_2, section_3: a.p_section_3, section_4: a.p_section_4,
        enc_version: 2,
      };
      const existing = notes().find(n => n.id === a.p_note_id);
      if (existing) { Object.assign(existing, fields); return existing.id; }
      const row = { id: `note-${notes().length + 1}`, clinician_id: USER_ID, is_locked: false, locked_at: null,
        session_number: notes().length + 1, created_at: new Date().toISOString(), ...fields };
      notes().push(row);
      return row.id;
    },
    lock_session_note: (a) => {
      const n = notes().find(r => r.id === a.p_note_id);
      if (n) Object.assign(n, { is_locked: true, is_draft: false, locked_at: new Date().toISOString() });
      return null;
    },
    get_session_note: (a) => notes().filter(r => r.id === a.p_note_id),
    client_retention_until: () => '2036-09-25',
  };

  const json = (route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) =>
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', ...headers }, body: JSON.stringify(body) });

  await page.route(`${SUPABASE_ORIGIN}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    let body: unknown = null;
    try { body = req.postDataJSON(); } catch { body = req.postData(); }
    state.requests.push({ method, path: url.pathname + url.search, body });
    const path = url.pathname;

    // ── Auth ──────────────────────────────────────────────────────────────
    if (path === '/auth/v1/signup') {
      return json(route, { ...user(), user_metadata: (body as Row)?.data ?? {}, identities: [{ id: 'i1' }], confirmation_sent_at: new Date().toISOString() });
    }
    if (path === '/auth/v1/token') {
      const grant = url.searchParams.get('grant_type');
      if (grant === 'password') {
        const creds = body as { email: string; password: string };
        if (creds.password !== 'correct horse battery') return json(route, { error: 'invalid_grant', error_description: 'Invalid login credentials', code: 'invalid_credentials' }, 400);
        aal = 'aal1';
        return json(route, session());
      }
      return json(route, session());
    }
    if (path === '/auth/v1/user') return json(route, user());
    if (path === '/auth/v1/logout') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    if (path === '/auth/v1/recover') return json(route, {});
    if (path === '/auth/v1/factors' && method === 'POST') {
      return json(route, {
        id: 'factor-1', type: 'totp', friendly_name: 'MentalPath',
        totp: { qr_code: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>', secret: 'JBSWY3DPEHPK3PXP', uri: 'otpauth://totp/x' },
      });
    }
    if (/^\/auth\/v1\/factors\/[^/]+$/.test(path) && method === 'DELETE') return json(route, { id: path.split('/').pop() });
    if (/\/auth\/v1\/factors\/[^/]+\/challenge$/.test(path)) return json(route, { id: 'challenge-1', type: 'totp', expires_at: Math.floor(Date.now() / 1000) + 300 });
    if (/\/auth\/v1\/factors\/[^/]+\/verify$/.test(path)) {
      if ((body as Row)?.code !== VALID_TOTP) return json(route, { code: 'mfa_verification_failed', message: 'Invalid TOTP code entered' }, 422);
      state.factorVerified = true;
      aal = 'aal2';
      return json(route, session());
    }

    // ── RPC ───────────────────────────────────────────────────────────────
    const rpc = path.match(/^\/rest\/v1\/rpc\/(\w+)$/);
    if (rpc) {
      const handler = options.rpc?.[rpc[1]] ?? builtinRpc[rpc[1]];
      if (!handler) return json(route, { message: `unmocked rpc ${rpc[1]}` }, 500);
      return json(route, handler((body ?? {}) as Row));
    }

    // ── PostgREST tables ──────────────────────────────────────────────────
    const table = path.match(/^\/rest\/v1\/(\w+)$/)?.[1];
    if (table) {
      const rows = (state.tables[table] ??= []);
      const wantsObject = (req.headers()['accept'] ?? '').includes('vnd.pgrst.object');
      if (method === 'GET' || method === 'HEAD') {
        let result = rows;
        for (const [key, value] of url.searchParams) {
          const m = value.match(/^eq\.(.*)$/);
          if (m && !['select', 'order', 'limit'].includes(key)) result = result.filter(r => String(r[key]) === m[1]);
        }
        const headers = { 'content-range': `0-${Math.max(result.length - 1, 0)}/${result.length}` };
        if (method === 'HEAD') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', ...headers } });
        if (wantsObject) return result[0] ? json(route, result[0], 200, headers) : json(route, { code: 'PGRST116', message: 'no rows' }, 406);
        return json(route, result, 200, headers);
      }
      if (method === 'POST') {
        const inserted = (Array.isArray(body) ? body : [body]).map((r, i) => ({ id: `${table}-${rows.length + i + 1}`, created_at: new Date().toISOString(), ...(r as Row) }));
        rows.push(...inserted);
        return json(route, wantsObject ? inserted[0] : inserted, 201);
      }
      if (method === 'PATCH') {
        const id = url.searchParams.get('id')?.replace(/^eq\./, '');
        for (const r of rows) if (!id || r.id === id) Object.assign(r, body as Row);
        return json(route, [], 200);
      }
    }

    // ── Edge Functions ────────────────────────────────────────────────────
    const fn = path.match(/^\/functions\/v1\/make-server-4d1a502d(\/.*)$/)?.[1];
    if (fn && options.functions?.[fn]) {
      const { status = 200, body: out } = options.functions[fn](req);
      return json(route, out, status);
    }

    return json(route, { message: `unmocked ${method} ${path}` }, 500);
  });

  return state;
}

/** Signs in through the real login form. */
export async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).first().fill(EMAIL);
  await page.locator('#login-password').fill('correct horse battery');
  await page.getByRole('button', { name: /sign in|log in/i }).click();
}
