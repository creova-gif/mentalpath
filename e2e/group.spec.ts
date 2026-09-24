import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { USER_ID, VALID_TOTP, mockSupabase, signIn } from './support/mockSupabase';

test('practice owner creates a practice, buys seats and invites a clinician', async ({ page }) => {
  let seats = { paid: 0, used: 1, pending: 0 };
  const state = await mockSupabase(page, {
    hasFactor: true,
    rpc: {
      create_practice: (a) => {
        state.tables.practices = [{ id: 'practice-1', name: a.p_name, owner_id: USER_ID }];
        return 'practice-1';
      },
      my_practice_seats: () => [seats],
      practice_overview: () => [{
        clinician_id: USER_ID, first_name: 'Robin', last_name: 'Tremblay', profession: 'psychotherapist', role: 'owner',
        joined_at: new Date().toISOString(), active_clients: 4, sessions_this_month: 9, unsigned_notes: 1,
      }],
      invite_practice_member: () => 'tok123',
    },
    functions: {
      '/billing/checkout-session': () => ({ body: { url: '/checkout-success?session_id=cs_test' } }),
    },
  });
  await signIn(page);
  await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
  await page.getByRole('button', { name: /^verify$/i }).click();
  await expect(page.getByText(/sessions today/i)).toBeVisible();

  await page.getByRole('link', { name: 'Group Practice' }).click();
  await expect(page.getByRole('heading', { name: 'Start a group practice' })).toBeVisible();
  await page.getByLabel('Practice name').fill('Riverside Therapy');
  await page.getByRole('button', { name: 'Create practice' }).click();
  await expect(page.getByRole('heading', { name: 'Riverside Therapy' })).toBeVisible();

  // Owner dashboard shows counts only
  await expect(page.getByRole('cell', { name: '9' })).toBeVisible();
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(' | ')}`)).toEqual([]);

  // No seats yet → subscribe with a seat count
  await page.getByLabel('Number of seats').fill('3');
  await page.getByRole('button', { name: 'Subscribe — $237/month' }).click();
  await expect.poll(() => state.requests.find(r => r.path.endsWith('/billing/checkout-session'))?.body).toEqual({ plan: 'group', seats: 3 });

  // After Stripe confirms, invite by email and get a one-time link
  await page.waitForURL(/checkout-success/);
  seats = { paid: 3, used: 1, pending: 0 };
  await page.goto('/dashboard/group-practice');
  await page.getByLabel(/their email/i).fill('colleague@example.ca');
  await page.getByRole('button', { name: 'Create invite link' }).click();
  await expect(page.getByLabel('Invite link')).toHaveValue(/\/dashboard\/group-practice\?invite=tok123$/);
});

test('invited clinician joins from the link', async ({ page }) => {
  let joined = false;
  const state = await mockSupabase(page, {
    hasFactor: true,
    rpc: {
      accept_practice_invite: (a) => {
        joined = a.p_token === 'tok123';
        state.tables.practices = [{ id: 'practice-1', name: 'Riverside Therapy', owner_id: 'someone-else' }];
        return 'practice-1';
      },
      my_practice_seats: () => [{ paid: 3, used: 2, pending: 0 }],
    },
  });
  await signIn(page);
  await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
  await page.getByRole('button', { name: /^verify$/i }).click();
  await expect(page.getByText(/sessions today/i)).toBeVisible();

  await page.goto('/dashboard/group-practice?invite=tok123');
  await page.getByRole('button', { name: 'Join practice' }).click();
  await expect(page.getByRole('heading', { name: 'Riverside Therapy' })).toBeVisible();
  await expect(page.getByText(/your seat is paid by the practice/i)).toBeVisible();
  expect(joined).toBe(true);
});
