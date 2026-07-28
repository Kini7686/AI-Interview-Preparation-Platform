import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      AUTH_SECRET:
        process.env.AUTH_SECRET ??
        "playwright-test-secret-at-least-32-chars",
      AUTH_URL: process.env.AUTH_URL ?? baseURL,
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://postgres:postgres@127.0.0.1:5432/ai_interview?schema=public",
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ?? "test-google-id",
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ?? "test-google-secret",
      AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY ?? "re_test_key",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "Auth <test@example.com>",
    },
  },
});
