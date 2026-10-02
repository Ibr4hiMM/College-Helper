import { defineConfig } from "@playwright/test";

// Supabase vars come from .env.local (Playwright doesn't read Next's env files).
// Anthropic vars are pinned below on the app's env, so they win over .env.local.
try {
  process.loadEnvFile(".env.local");
} catch {}

const MOCK_PORT = process.env.E2E_MOCK_PORT ?? "4011";
const APP_PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  workers: 1,
  use: { baseURL: `http://localhost:${APP_PORT}`, trace: "on-first-retry" },
  webServer: [
    {
      command: "node e2e/mock-anthropic.mjs",
      port: Number(MOCK_PORT),
      env: { E2E_MOCK_PORT: MOCK_PORT },
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npx next start -p ${APP_PORT}`,
      url: `http://localhost:${APP_PORT}/auth/login`,
      timeout: 300_000,
      reuseExistingServer: false,
      env: {
        ANTHROPIC_BASE_URL: `http://localhost:${MOCK_PORT}/v1`,
        ANTHROPIC_API_KEY: "e2e-mock",
      },
    },
  ],
});
