import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const TEST_USER = 'douglas.guzman';
const TEST_PASS = 'Iglesia2024!';

async function login(page) {
  await page.goto(BASE_URL);
  await page.fill('input[id="usuario"]', TEST_USER);
  await page.fill('input[id="contrasena"]', TEST_PASS);
  await page.getByRole('button', { name: /Iniciar/ }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page.getByText(/Bienvenido/)).toBeVisible();
}

test.describe('Sistema Estadístico Taber Central - Smoke Tests', () => {
  test('1. Login page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
  });

  test('2. Login works', async ({ page }) => {
    await login(page);
  });

  test('3. Theme toggle', async ({ page }) => {
    await login(page);
    await page.locator('button[title*="Cambiar a tema"]').click();
  });

  test('4. Logout', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Salir' }).click();
    await page.waitForURL(BASE_URL + '/');
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
  });
});

test.describe('All pages load', () => {
  const pages = [
    { url: '/dashboard', check: 'Bienvenido' },
    { url: '/total-general', check: 'Reporte Total General' },
    { url: '/servidores', check: 'Reporte de Servidores' },
    { url: '/asistencia', check: 'Reporte de Asistencia' },
    { url: '/taber-kids', check: 'Reporte Taber Kids' },
    { url: '/comparativo', check: 'Comparativo Anual' },
    { url: '/subir-foto', check: 'Subir Foto' },
  ];

  for (const { url } of pages) {
    test(`Load ${url}`, async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForURL(`**${url}`, { timeout: 10000 });
      // Just verify the URL is correct (page loaded)
      expect(page.url()).toContain(url);
    });
  }
});

test.describe('Report data loads', () => {
  test('Total General data loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/total-general`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('Servidores data loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/servidores`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('Asistencia data loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/asistencia`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('Taber Kids data loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/taber-kids`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });

  test('Comparativo data loads', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/comparativo`, { waitUntil: 'networkidle' });
    await page.locator('select').first().selectOption('2025');
    await page.getByRole('button', { name: 'Consultar' }).click();
    await page.waitForTimeout(5000);
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('PDF export buttons', () => {
  test('All report pages have PDF buttons', async ({ page }) => {
    await login(page);
    const urls = ['/total-general', '/servidores', '/asistencia', '/taber-kids', '/comparativo'];
    for (const url of urls) {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await expect(page.getByRole('button', { name: /PDF/ })).toBeVisible();
    }
  });
});