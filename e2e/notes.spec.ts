import { test, expect } from '@playwright/test';
import { USER_ID, VALID_TOTP, mockSupabase, signIn } from './support/mockSupabase';

const CLIENT = { id: 'client-1', clinician_id: USER_ID, first_name: 'Sam', last_name: 'Rivera', status: 'active', created_at: new Date().toISOString() };

test('note editor saves drafts to the server only and locks notes', async ({ page }) => {
  const state = await mockSupabase(page, {
    hasFactor: true,
    tables: { clients: [CLIENT] },
  });
  await signIn(page);
  await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
  await page.getByRole('button', { name: /^verify$/i }).click();
  await expect(page.getByText(/sessions today/i)).toBeVisible();

  await page.goto('/session-note-editor?clientId=client-1');
  await expect(page.getByText('Sam Rivera').first()).toBeVisible();

  // No pre-filled sample clinical content
  const data = page.getByLabel(/client presentation/i);
  await expect(data).toHaveValue('');
  await data.fill('Client reported improved sleep this week.');

  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect.poll(() => state.tables.session_notes?.length ?? 0).toBe(1);
  const saved = state.tables.session_notes![0];
  expect(saved).toMatchObject({ client_id: 'client-1', section_1: 'Client reported improved sleep this week.', enc_version: 2, is_locked: false });
  // Notes are written only through the server-side function, never the table
  expect(state.requests.some(r => r.path.startsWith('/rest/v1/session_notes') && ['POST', 'PATCH', 'DELETE'].includes(r.method))).toBe(false);

  // Draft text never touches browser storage
  const stored = await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage));
  expect(stored).not.toContain('improved sleep');

  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: /lock & finalise/i }).click();
  await expect(page.getByText(/^Locked · /)).toBeVisible();
  expect(state.requests.some(r => r.path === '/rest/v1/rpc/lock_session_note')).toBe(true);
  expect(state.tables.session_notes![0].is_locked).toBe(true);
  await expect(page.getByRole('heading', { name: 'Amendments' })).toBeVisible();
});

test('AI assist asks for consent before sending anything', async ({ page }) => {
  const state = await mockSupabase(page, { hasFactor: true, tables: { clients: [CLIENT] } });
  await signIn(page);
  await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
  await page.getByRole('button', { name: /^verify$/i }).click();
  await expect(page.getByText(/sessions today/i)).toBeVisible();

  await page.goto('/session-note-editor?clientId=client-1');
  await page.getByLabel(/client presentation/i).fill('Some text');
  await page.getByRole('button', { name: /ai assist/i }).click();
  await expect(page.getByRole('dialog', { name: /before you turn on ai note assist/i })).toBeVisible();
  await page.getByRole('button', { name: 'Not now' }).click();
  expect(state.requests.some(r => r.path.includes('ai-note-assist'))).toBe(false);
});
