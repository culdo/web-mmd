// @ts-check
const { test, expect } = require('@playwright/test');

test('has loaded', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator("#loading")).not.toBeVisible()
  await expect(page).toHaveScreenshot();
});
