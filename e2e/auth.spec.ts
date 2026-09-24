import { test, expect } from '@playwright/test';
import { EMAIL, VALID_TOTP, mockSupabase, signIn } from './support/mockSupabase';

test.describe('sign-in and MFA', () => {
  test('rejects a wrong password without a demo fallback', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/login');
    await page.getByLabel(/work email/i).fill(EMAIL);
    await page.locator('#login-password').fill('wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('first sign-in requires TOTP enrolment before the dashboard', async ({ page }) => {
    const state = await mockSupabase(page, { hasFactor: false });
    await signIn(page);

    await expect(page.getByRole('heading', { name: /set up two-factor authentication/i })).toBeVisible();
    await expect(page.getByRole('img', { name: /qr code/i })).toBeVisible();

    await page.getByLabel(/6-digit code/i).fill('000000');
    await page.getByRole('button', { name: /^verify$/i }).click();
    await expect(page.getByText(/that code didn’t work/i)).toBeVisible();

    await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
    await page.getByRole('button', { name: /^verify$/i }).click();
    await expect(page.getByRole('heading', { name: /robin/i })).toBeVisible();
    expect(state.requests.some(r => r.path.startsWith('/auth/v1/factors') && r.method === 'POST')).toBe(true);
  });

  test('returning user with a factor gets a challenge, not enrolment', async ({ page }) => {
    await mockSupabase(page, { hasFactor: true });
    await signIn(page);
    await expect(page.getByRole('heading', { name: /two-factor verification/i })).toBeVisible();
    await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
    await page.getByRole('button', { name: /^verify$/i }).click();
    await expect(page.getByText(/sessions today/i)).toBeVisible();
  });

  test('forgot password sends a reset email without revealing whether the account exists', async ({ page }) => {
    const state = await mockSupabase(page);
    await page.goto('/login');
    await page.getByRole('button', { name: /forgot password/i }).click();
    await expect(page.getByText(/enter your email above/i)).toBeVisible();
    await page.getByLabel(/work email/i).fill('anyone@example.ca');
    await page.getByRole('button', { name: /forgot password/i }).click();
    await expect(page.getByText(/if an account exists/i)).toBeVisible();
    expect(state.requests.find(r => r.path.startsWith('/auth/v1/recover'))).toBeTruthy();
  });

  test('reset-password page rejects a missing or expired link', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/reset-password');
    await expect(page.getByRole('alert')).toContainText(/invalid or has expired/i);
  });

  test('protected routes redirect signed-out visitors to login', async ({ page }) => {
    await mockSupabase(page);
    await page.goto('/dashboard/clients');
    await expect(page).toHaveURL(/\/login$/);
  });
});
