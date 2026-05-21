import { test, expect } from '@playwright/test';

test('landing page loads correctly', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/MentalPath/i);

  // Expect the main heading or specific element
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
});
