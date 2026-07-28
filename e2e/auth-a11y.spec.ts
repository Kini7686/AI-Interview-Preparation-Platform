import { test, expect } from "@playwright/test";

test.describe("sign-in accessibility (FR-015, SC-005)", () => {
  test("email field is labeled and controls show visible focus", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    const email = page.getByLabel("Email");
    await expect(email).toBeVisible();

    await page.keyboard.press("Tab");
    // First focusable control should receive focus (Google button or skip links)
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();

    await email.focus();
    await expect(email).toBeFocused();
  });

  test("keyboard can reach email submit", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").focus();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: "Email me a sign-in link" }),
    ).toBeFocused();
  });
});
