import { test, expect } from '@playwright/test';
import { mockSupabase } from './support/mockSupabase';

test('signup creates a real account with profile metadata and no billing fields', async ({ page }) => {
  const state = await mockSupabase(page);
  await page.goto('/onboarding');

  await page.getByPlaceholder('Dr. Jane Smith').fill('Robin Tremblay');
  await page.getByPlaceholder('you@practice.ca').fill('robin@example.ca');
  const continueBtn = page.getByRole('button', { name: 'Continue →' });
  await page.getByPlaceholder('At least 12 characters').fill('short');
  await expect(continueBtn).toBeDisabled();
  await page.getByPlaceholder('At least 12 characters').fill('a long passphrase here');
  await continueBtn.click();

  await page.getByRole('button', { name: /psycho-therapist/i }).click();
  await page.getByRole('button', { name: 'Continue →' }).click();

  await page.getByPlaceholder('RP, PhD').fill('RP');
  await page.getByPlaceholder('CRPO-004821').fill('CRPO-9999');
  await page.getByRole('button', { name: 'CRPO (ON)' }).click();
  await page.getByRole('button', { name: 'Continue →' }).click();

  await expect(page.getByRole('button', { name: /group practice/i })).toBeDisabled();
  await page.getByRole('button', { name: /start free trial/i }).click();
  await page.getByRole('button', { name: /skip and go to dashboard/i }).click();

  await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible();

  const signup = state.requests.find(r => r.path.startsWith('/auth/v1/signup'));
  expect(signup).toBeTruthy();
  const body = signup!.body as { email: string; password: string; data: Record<string, string> };
  expect(body.email).toBe('robin@example.ca');
  expect(body.data).toMatchObject({ first_name: 'Robin', last_name: 'Tremblay', profession: 'psychotherapist', reg_number: 'CRPO-9999' });
  for (const forbidden of ['plan_type', 'is_trial', 'trial_ends_at', 'subscription_status']) {
    expect(body.data).not.toHaveProperty(forbidden);
  }
  // Nothing sensitive is left in browser storage.
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain('a long passphrase here');
  expect(stored).not.toContain('robin@example.ca');
});
