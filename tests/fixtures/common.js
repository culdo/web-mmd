import { test as base } from "@playwright/test";

export const test = base.extend({

    page: async ({ baseURL, page }, use, testInfo) => {
        // print console log of client browser
        page.on('console', msg => {
            console.log(`[${testInfo.titlePath}] ${msg.text()}`);
        });
        page.on('pageerror', err => {
            console.log(`[${testInfo.titlePath}] ${err.stack}`);
        });
        await use(page)
        await page.close();
    },
});