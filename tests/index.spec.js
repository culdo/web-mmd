// @ts-check
const { expect } = require('@playwright/test');
const { test } = require('./fixtures/common');

test('has loaded', async ({ page }) => {
  await expect(page).toHaveScreenshot();
});

test('changing camera mode with saving config', async ({ page }) => {
  // Default to Untitled preset transition
  await page.getByLabel("camera mode").selectOption({ label: "Composition" })
  await expect(page.locator(".root > div.title")).toHaveText("Controls")
  await expect(page).toHaveScreenshot();
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue("Composition")

  // Untitled to Untitled(moded) preset transition
  await page.getByLabel("camera mode").selectOption({ label: "Motion File" })
  await expect(page.locator(".root > div.title")).toHaveText("Controls")
  await expect(page).toHaveScreenshot();
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue("Motion File")
});
