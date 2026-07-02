import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/l/test-store");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Test Store");
});
