import { expect, test as setup } from "@playwright/test";
import { pocketbase } from "../services/pocketbase";
import { createUser } from "../lib/user";

setup.describe.configure({ mode: "serial" });

setup.describe("setup", () => {
  setup("create location, product and user", async ({ page }) => {
    const pb = await pocketbase();
    await expect(pb).toBeDefined();

    // Configure mailing
    await pb.settings.update({
      smtp: {
        enabled: true,
        host: "mailhog",
        port: 1025,
      },
    });

    // Create leihbase
    try {
      await pb.collection("leihbase").create({
        name: "Leihbase",
      });
    } catch (err) {
      console.log("Error creating leihbase record", err.response.data);
    }

    // Create test store
    let location;
    try {
      location = await pb.collection("location").create({
        active: true,
        name: "Test Store",
        address: "Example Street 1, Example City",
        email: "location@example.com",
        slug: "test-store",
        opening_hours: {
          tuesday: [
            {
              from: "18:00",
              to: "19:00",
            },
          ],
          friday: [
            {
              from: "17:00",
              to: "19:00",
            },
          ],
        },
      });
    } catch (err) {
      console.log("Error creating test store", err.response.data);
    }

    // Create test user
    createUser();
  });

  // Wait for homepage to load with extra long timeout
  // as Nuxt first needs to finish building
  setup("wait for homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Test Store", { timeout: 30000 });
  });
});
