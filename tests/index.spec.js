// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }, testInfo) => {
  // print console log of client browser
  page.on('console', msg => {
      console.log(`${testInfo.titlePath} Client console: "${msg.text()}"`);
  });
})

test.afterEach(async ({ page }, testInfo) => {
  // close page to save memory
  page.close()
})

test('has loaded', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator("#loading")).not.toBeVisible()
  await expect(page).toHaveScreenshot();
});

test('config saving test', async ({ page }) => {
  await page.goto('/');
  // Default to Untitled preset transition
  await page.getByLabel("camera mode").selectOption({label: "Composition"})
  await expect(page.getByLabel("camera mode")).toHaveValue("Composition")
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue("Composition")
  // Untitled to Untitled(moded) preset transition
  await page.getByLabel("camera mode").selectOption({label: "Creative"})
  await expect(page.getByLabel("camera mode")).toHaveValue("Creative")
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue("Creative")
});
