import { expect } from "@playwright/test";
import { waitForHydration } from "./utils";

export async function login(
  page,
  email = "test@example.com",
  password = "testtest"
) {
  await page.goto("/login");
  await waitForHydration(page);
  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill(password);
  await page.getByTestId("submit-button").click();
  await page.waitForURL(/\/profile/);
  await expect(page).toHaveURL("/profile");
}
