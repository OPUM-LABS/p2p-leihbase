import { test, expect } from "@playwright/test";
import { waitForHydration, waitForClientMount } from "../lib/utils";
import { login } from "../lib/login";

test.describe("profile", () => {
  test("can reach profile", async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await waitForHydration(page);
    await expect(page.getByTestId("profile-h1")).toBeVisible();
  });
  test("has screenshot", async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await expect(page).toHaveScreenshot("profile-page.png");
  });
});
