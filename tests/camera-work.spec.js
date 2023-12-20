const { expect } = require('@playwright/test');
const { test } = require('./fixtures/common');

async function playToTime(page, time) {
    await page.keyboard.down(" ")
    await expect(async () => {
        const currentTime = await page.locator('#player').evaluate((el) => el.currentTime)
        console.log(`currentTime: ${currentTime}`)
        expect(currentTime).toBeGreaterThan(time)
    }).toPass()
    await page.keyboard.down(" ")
}

test("create beat", async ({ page }) => {
    await page.goto("/")
    await page.getByLabel("camera mode").selectOption({ label: "Composition" })
    
    await playToTime(page, 3)
    await page.keyboard.down("a")
    await page.keyboard.down("a")
    await expect(page.getByText("1A", { exact: true })).toHaveCount(1)
})

test("delete beat", async ({ page }) => {
    await page.goto("/")
    await page.getByLabel("camera mode").selectOption({ label: "Composition" })

    await expect(page.getByText("1A", { exact: true })).toBeAttached()
    await page.keyboard.down("Delete")
    await expect(page.getByText("1A", { exact: true })).not.toBeAttached()
})

test("cut jumping using Arrow keys", async ({ page }) => {
    await page.goto("/")
    await page.getByLabel("camera mode").selectOption({ label: "Composition" })
  
    await expect(page.getByText("1A", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowRight")
    await expect(page.getByText("1B", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowRight")
    await expect(page.getByText("1C", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowRight")
    await expect(page.getByText("1D", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowLeft")
    await expect(page.getByText("1C", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowLeft")
    await expect(page.getByText("1B", { exact: true })).toHaveClass(/goal/)

    await page.keyboard.down("ArrowLeft")
    await expect(page.getByText("1A", { exact: true })).toHaveClass(/goal/)
})
