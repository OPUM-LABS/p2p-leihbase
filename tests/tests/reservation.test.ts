import { test, expect } from "@playwright/test";
import { waitForClientMount } from "../lib/utils";
import { login } from "../lib/login";
import {
  createProduct,
  getLastProductReservation,
  navigateToProductPage,
  updateLastProductReservation,
} from "../lib/product";

async function reserve(page, startIndex, endIndex) {
  // Click reserve
  await waitForClientMount(page.getByTestId("reserve-button"));
  await page.getByTestId("reserve-button").click();
  // Reserve
  await expect(page.getByTestId("opening-hours")).toBeVisible();
  // enter start
  await page.getByTestId("start-input").click();
  await expect(page.getByTestId("start-input-calendar")).toBeVisible();
  await page
    .getByTestId("start-input-calendar")
    .locator("shadow=calendar-month >> td button:not([aria-disabled=true])")
    .nth(startIndex)
    .click();
  // enter end
  await page.getByTestId("end-input").click();
  await expect(page.getByTestId("end-input-calendar")).toBeVisible();
  await page
    .getByTestId("end-input-calendar")
    .locator("shadow=calendar-month >> td button:not([aria-disabled=true])")
    .nth(endIndex)
    .click();
  // submit
  await page.getByTestId("reserve-submit").click();
}

test.describe("reservation", () => {
  test("visitor can reserve a product", async ({ page }) => {
    const product = await createProduct();

    await navigateToProductPage(page, product.id);

    // Click reserve (logged out)
    await waitForClientMount(page.getByTestId("reserve-button"));
    await page.getByTestId("reserve-button").click();
    await expect(page).toHaveURL("/signup");

    // Signup
    await page.getByTestId("name-input").fill("John2");
    await page.getByTestId("email-input").fill("john2@example.com");
    await page.getByTestId("password-input").fill("123456789");
    await page.getByTestId("tac-checkbox").check();
    await page.getByTestId("submit-button").click();
    await page.waitForURL(/\/l\/test-store\/p\/(.+)/);

    // Reserve
    await expect(page.url()).toContain("/l/test-store/p/");
    await reserve(page, 0, 1);

    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });

  test("user can't reserve the same product twice", async ({ page }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await reserve(page, 2, 3);
    await expect(page.getByTestId("reservation-form-error")).toBeVisible();
  });

  test("user can reserve same product when first reservation is cancelled", async ({
    page,
  }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    await updateLastProductReservation(product.id, { cancelled: true });
    await reserve(page, 2, 3);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });

  test("user can reserve the same product when first reservation is in the past", async ({
    page,
  }) => {
    const product = await createProduct();
    await login(page);
    await navigateToProductPage(page, product.id);
    await reserve(page, 0, 1);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
    const reservation = await getLastProductReservation(product.id);
    await updateLastProductReservation(product.id, {
      start: new Date(
        new Date(reservation.start).setDate(
          new Date(reservation.start).getDate() - 7
        )
      ),
      end: new Date(
        new Date(reservation.end).setDate(
          new Date(reservation.end).getDate() - 7
        )
      ),
    });
    await reserve(page, 2, 3);
    await expect(page.getByTestId("opening-hours")).toBeHidden();
  });
});
