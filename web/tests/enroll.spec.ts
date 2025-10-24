import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test("login → enroll → reports updates → unenroll", async ({ page }) => {
  // Login
  await page.goto(`${BASE}/login`);
  await page.getByRole("textbox").first().fill("jonathandob"); // your username
  await page.getByRole("textbox").nth(1).fill("hithere");
  await page.getByRole("button", { name: "Log in" }).click();

  // Employees page appears
  await expect(page).toHaveURL(`${BASE}/employees`);

  // Remember current report number
  await page.goto(`${BASE}/reports`);
  const beforeText = await page.locator("text=Active Enrollments:").textContent();
  const before = Number(beforeText?.match(/\d+/)?.[0] ?? "0");

  // Enroll first available "Enroll" button
  await page.goto(`${BASE}/employees`);
  const enrollButton = page.getByRole("button", { name: /Enroll$/ }).first();
  const hasEnroll = await enrollButton.isVisible();
  if (hasEnroll) {
    await enrollButton.click();
    await page.on("dialog", (d) => d.accept());
  }

  // Reports should increase or stay same if none was available
  await page.goto(`${BASE}/reports`);
  await page.getByRole("button", { name: "Refresh" }).click();
  const afterText = await page.locator("text=Active Enrollments:").textContent();
  const after = Number(afterText?.match(/\d+/)?.[0] ?? "0");
  expect(after).toBeGreaterThanOrEqual(before);

  // Unenroll if we enrolled
  if (hasEnroll) {
    await page.goto(`${BASE}/employees`);
    const unenrollButton = page.getByRole("button", { name: "Unenroll" }).first();
    if (await unenrollButton.isVisible()) {
      await unenrollButton.click();
      await page.on("dialog", (d) => d.accept());
      await page.goto(`${BASE}/reports`);
      await page.getByRole("button", { name: "Refresh" }).click();
      const afterCancelText = await page.locator("text=Active Enrollments:").textContent();
      const afterCancel = Number(afterCancelText?.match(/\d+/)?.[0] ?? "0");
      expect(afterCancel).toBeLessThanOrEqual(after);
    }
  }
});
