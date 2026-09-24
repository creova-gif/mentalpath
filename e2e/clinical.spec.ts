import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { USER_ID, VALID_TOTP, mockSupabase, signIn } from './support/mockSupabase';

const CLIENT = { id: 'client-1', clinician_id: USER_ID, first_name: 'Sam', last_name: 'Rivera', status: 'active', created_at: new Date().toISOString() };

async function enterDashboard(page: Page) {
  await signIn(page);
  await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
  await page.getByRole('button', { name: /^verify$/i }).click();
  await expect(page.getByText(/sessions today/i)).toBeVisible();
}

async function noSeriousA11y(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
    .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);
}

test('PHQ-9 is recorded, scored by the server and flags item 9', async ({ page }) => {
  const state = await mockSupabase(page, {
    hasFactor: true,
    tables: { clients: [CLIENT], outcome_measures: [] },
    onInsert: {
      // Stand-in for the outcome_measures_score() trigger
      outcome_measures: (r) => {
        const items = r.item_scores as number[];
        const total = items.reduce((a, b) => a + b, 0);
        return { ...r, total_score: total, severity: total <= 14 ? 'moderate' : 'severe', risk_flag: items[8] > 0 };
      },
    },
  });
  await enterDashboard(page);
  await page.getByRole('link', { name: 'Outcome Measures' }).click();
  await page.getByRole('combobox', { name: 'Client' }).selectOption('client-1');

  const answers = [2, 2, 2, 2, 2, 1, 1, 1, 1];
  const items = page.locator('fieldset');
  await expect(items).toHaveCount(9);
  for (let i = 0; i < 9; i++) await items.nth(i).getByRole('radio').nth(answers[i]).check();
  await expect(page.getByRole('alert')).toContainText(/item 9/i);
  await expect(page.getByText('Score 14/27 — Moderate')).toBeVisible();
  await noSeriousA11y(page);

  await page.getByRole('button', { name: 'Save result' }).click();
  await expect(page.getByRole('cell', { name: /14\/27/ })).toBeVisible();
  const saved = state.tables.outcome_measures[0];
  expect(saved).toMatchObject({ client_id: 'client-1', instrument: 'PHQ-9', item_scores: answers, total_score: 14, risk_flag: true });

  // GAD-7 has 7 items
  await page.getByRole('radio', { name: 'GAD-7' }).click();
  await expect(items).toHaveCount(7);
});

test('session prep shows real upcoming sessions with history and balances', async ({ page }) => {
  const soon = new Date(Date.now() + 3 * 3600_000).toISOString();
  await mockSupabase(page, {
    hasFactor: true,
    tables: {
      clients: [CLIENT],
      appointments: [{ id: 'appt-1', client_id: 'client-1', scheduled_at: soon, duration_minutes: 50, session_type: 'video', status: 'scheduled', clients: { first_name: 'Sam', last_name: 'Rivera' } }],
      session_notes: [{ id: 'note-1', client_id: 'client-1', session_date: '2026-09-10', note_format: 'dap', is_locked: false }],
      outcome_measures: [
        { id: 'm1', client_id: 'client-1', instrument: 'GAD-7', administered_on: '2026-09-01', item_scores: [], total_score: 15, severity: 'severe', risk_flag: false },
        { id: 'm2', client_id: 'client-1', instrument: 'GAD-7', administered_on: '2026-09-10', item_scores: [], total_score: 8, severity: 'mild', risk_flag: false },
      ],
      invoices: [{ id: 'inv-1', client_id: 'client-1', amount: 150, status: 'pending' }],
    },
  });
  await enterDashboard(page);
  await page.getByRole('link', { name: 'Session Prep' }).click();
  await expect(page.getByRole('heading', { name: /Sam Rivera/ })).toBeVisible();
  await expect(page.getByText('Session 2')).toBeVisible();
  await expect(page.getByRole('link', { name: 'open note' })).toHaveAttribute('href', '/session-note-editor?noteId=note-1');
  await expect(page.getByText(/GAD-7 8\/21/)).toBeVisible();
  await expect(page.getByText(/-7 meaningful improvement/)).toBeVisible();
  await expect(page.getByText(/1 · \$150/)).toBeVisible();
  await noSeriousA11y(page);
});

test('insurance receipt prints provider registration and client details', async ({ page }) => {
  await mockSupabase(page, {
    hasFactor: true,
    tables: {
      clients: [CLIENT],
      invoices: [{ id: 'inv-1', invoice_number: 'INV-0007', client_name: 'Sam Rivera', date: `${new Date().getFullYear()}-01-15`, sessions: 1, amount: 150, status: 'paid', paid_at: new Date().toISOString(), notes: null }],
    },
  });
  await enterDashboard(page);
  await page.getByRole('link', { name: 'Insurance Receipts' }).click();
  await expect(page.getByRole('cell', { name: 'INV-0007', exact: true })).toBeVisible();
  await noSeriousA11y(page);

  const popupPromise = page.waitForEvent('popup');
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: 'Print receipt INV-0007' }).click();
  const popup = await popupPromise;
  await popup.evaluate(() => { window.print = () => {}; });
  const html = await popup.content();
  for (const s of ['Official receipt', 'INV-0007', 'Sam Rivera', 'Robin Tremblay', '#CRPO-1234', '$150.00']) expect(html).toContain(s);
});
