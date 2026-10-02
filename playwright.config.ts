import { defineConfig } from "@playwright/test";

// Playwright does not read Next's env files; load them so the specs see ANTHROPIC_API_KEY.
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/auth/login",
    reuseExistingServer: true,
  },
});
