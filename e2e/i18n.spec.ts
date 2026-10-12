import { test, expect } from '@playwright/test';
import { EMAIL, USER_ID, VALID_TOTP, mockSupabase } from './support/mockSupabase';

test('the app runs in French end to end, with <html lang> set', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('mentalpath_language', 'fr'); });
  await mockSupabase(page, {
    hasFactor: true,
    tables: { clients: [{ id: 'client-1', clinician_id: USER_ID, first_name: 'Sam', last_name: 'Rivera', status: 'active', created_at: new Date().toISOString() }] },
  });
  await page.goto('/login');
  await page.getByLabel('Courriel professionnel').fill(EMAIL);
  await page.locator('#login-password').fill('correct horse battery');
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.getByLabel('Code à 6 chiffres').fill(VALID_TOTP);
  await page.getByRole('button', { name: /vérifier/i }).click();
  await expect(page.getByText("Séances aujourd'hui")).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');

  await page.getByRole('link', { name: 'Mesures des résultats' }).click();
  await expect(page.getByRole('heading', { name: 'Mesures des résultats' })).toBeVisible();

  await page.goto('/session-note-editor?clientId=client-1');
  await expect(page.getByRole('button', { name: 'Enregistrer le brouillon' })).toBeVisible();
  await expect(page.getByText('DAP — Données · Analyse · Plan')).toBeVisible();

  await page.goto('/faq');
  await expect(page.getByRole('heading', { name: 'Foire aux questions' })).toBeVisible();
});
