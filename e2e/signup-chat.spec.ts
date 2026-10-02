import { expect, test } from "@playwright/test";

// Prerequisite: Supabase "Confirm email" is OFF, so sign-up returns a session and lands on /chat.
// Each run leaves one e2e+<timestamp> user behind; delete them from the Auth dashboard when needed.
// Supabase rejects example.com as an invalid address, so default to example.org (override with E2E_EMAIL_DOMAIN).
// Arabic is the default locale; the specs switch to English first for stable labels.
const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

test("sign up, chat, log out, log back in", async ({ page }) => {
  const email = `e2e+${Date.now()}@${process.env.E2E_EMAIL_DOMAIN ?? "example.org"}`;
  const password = "e2e-password-1";

  await page.context().addCookies([
    { name: "NEXT_LOCALE", value: "en", url: "http://localhost:3000" },
  ]);
  await page.goto("/auth/sign-up");
  await page.getByLabel("University").selectOption({ label: "King Saud University" });
  await page.getByLabel("Major").selectOption({ label: "Computer Science" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Repeat password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByRole("definition").filter({ hasText: "King Saud University" })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "Computer Science" })).toBeVisible();

  await page.getByLabel("Your message").fill("What is my major?");
  await page.keyboard.press("Enter");
  await expect(page.getByText("What is my major?")).toBeVisible();

  if (hasKey) {
    const reply = page.locator("article").first();
    await expect(reply).not.toBeEmpty({ timeout: 60_000 });
    await expect(reply).toContainText(/computer science/i, { timeout: 60_000 });
  } else {
    // Scoped to main: Next's route announcer is also an alert.
    await expect(page.locator("main [role=alert]")).toContainText("isn't available");
  }

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/chat$/);
});

test("logged out: /chat redirects and /api/chat is 401", async ({ page, request }) => {
  await page.goto("/chat");
  await expect(page).toHaveURL(/\/auth\/login$/);
  const res = await request.post("/api/chat", { data: { messages: [] } });
  expect(res.status()).toBe(401);
});
