import { expect } from "@playwright/test";
import { pocketbase } from "../services/pocketbase";
import { waitForClientMount } from "./utils";

/**
 * Navigates to the product page,
 * given a product id
 */
export async function navigateToProductPage(page, productId) {
  await page.goto("/");
  await waitForClientMount(page.getByTestId(`product-card-${productId}`));
  await page.getByTestId(`product-card-${productId}`).click();
  await page.waitForURL(/\/l\/test-store\/p\/(.+)/);
  await expect(page.url()).toContain("/l/test-store/p/");
  await expect(page.getByTestId("product-page-h1")).toBeVisible();
}

/**
 * Creates a new product
 */
export async function createProduct() {
  // Create test product
  const pb = await pocketbase();
  const location = (await pb.collection("location").getFullList()).at(0);
  if (!location) {
    throw new Error("createProduct: couldn't find location");
  }
  try {
    const product = await pb.collection("products").create({
      active: true,
      name: "Test Product",
      location: location.id,
      deposit: 10,
      description: "<p>Lorem ipsum dolor.</p>",
    });
    return product;
  } catch (err) {
    console.log("Error creating test product", err.response.data);
    throw new Error("createProduct: couldn't create product");
  }
}

/**
 * Returns the last created reservation given a product id
 */
export async function getLastProductReservation(productId) {
  const pb = await pocketbase();
  const reservation = await pb
    .collection("reservations")
    .getFirstListItem(`product = '${productId}'`, { sort: "created" });
  return reservation;
}

/**
 * Updates the created reservation given a product id
 */
export async function updateLastProductReservation(productId, data) {
  const pb = await pocketbase();
  const reservation = await getLastProductReservation(productId);
  return await pb.collection("reservations").update(reservation.id, data);
}
