import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page with branding', async ({ page }) => {
    // Check for FREEZINO branding
    await expect(page.locator('text=FREEZINO')).toBeVisible();
    await expect(page.locator('text=Казино-симулятор против игровой зависимости')).toBeVisible();
  });

  test('should show Google login button', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Войти через Google")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('should display educational disclaimers', async ({ page }) => {
    await expect(page.locator('text=Это не настоящее казино')).toBeVisible();
    await expect(page.locator('text=Используются только виртуальные деньги')).toBeVisible();
    await expect(page.locator('text=Цель - образовательная')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Freezino/i);
  });

  test('Google login button should have correct attributes', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Войти через Google")');

    // Check button has Google icon
    const svg = loginButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that elements are still visible
    await expect(page.locator('text=FREEZINO')).toBeVisible();
    await expect(page.locator('button:has-text("Войти через Google")')).toBeVisible();
  });
});
