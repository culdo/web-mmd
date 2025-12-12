import { expect } from '@playwright/test';
import { test } from './fixtures/common';
import { CameraMode } from '@/app/types/camera';

test('has loaded', async ({ page }) => {
  await expect(page).toHaveScreenshot();
});

test('changing camera mode with saving config', async ({ page }) => {
  // Default to Untitled preset transition
  await page.getByLabel("camera mode").selectOption({ label: "Composition" })
  await expect(page).toHaveTitle("Web MMD")
  await expect(page).toHaveScreenshot();
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue(CameraMode.FIX_FOLLOWING.toString())

  // Untitled to Untitled(moded) preset transition
  await page.getByLabel("camera mode").selectOption({ label: "Motion File" })
  await expect(page).toHaveTitle("Web MMD")
  await expect(page).toHaveScreenshot();
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue(CameraMode.MOTION_FILE.toString())

  // Fixed-follow mode
  await page.getByLabel("camera mode").selectOption({ label: "Fixed Follow" })
  await expect(page).toHaveTitle("Web MMD")
  await expect(page).toHaveScreenshot({maxDiffPixelRatio: 0.1});
  await page.reload()
  await expect(page.getByLabel("camera mode")).toHaveValue(CameraMode.DIRECTOR.toString())
});
