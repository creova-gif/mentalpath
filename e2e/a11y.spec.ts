import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { VALID_TOTP, mockSupabase, signIn, USER_ID } from './support/mockSupabase';

// WCAG 2.2 AA automated checks. Serious/critical violations fail the build;
// the full list is attached to the report for triage.
async function expectNoSeriousViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await test.info().attach(`axe-${label}.json`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
  const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`), label).toEqual([]);
}

test.describe('accessibility — public pages', () => {
  for (const path of ['/', '/login', '/onboarding', '/reset-password', '/contact']) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await mockSupabase(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expectNoSeriousViolations(page, path);
    });
  }
});

test.describe('accessibility — signed in', () => {
  test('MFA enrolment, dashboard, notes editor and settings', async ({ page }) => {
    await mockSupabase(page, {
      hasFactor: false,
      tables: { clients: [{ id: 'client-1', clinician_id: USER_ID, first_name: 'Sam', last_name: 'Rivera', status: 'active', created_at: new Date().toISOString() }] },
    });
    await signIn(page);
    await expect(page.getByRole('heading', { name: /set up two-factor/i })).toBeVisible();
    await expectNoSeriousViolations(page, 'mfa-enrol');

    await page.getByLabel(/6-digit code/i).fill(VALID_TOTP);
    await page.getByRole('button', { name: /^verify$/i }).click();
    await expect(page.getByText(/sessions today/i)).toBeVisible();
    await expectNoSeriousViolations(page, 'dashboard');

    await page.goto('/session-note-editor?clientId=client-1');
    await expect(page.getByText('Sam Rivera').first()).toBeVisible();
    await expectNoSeriousViolations(page, 'note-editor');

    await page.goto('/dashboard/settings?tab=security');
    await expect(page.getByText(/change password/i)).toBeVisible();
    await expectNoSeriousViolations(page, 'settings-security');
  });
});
