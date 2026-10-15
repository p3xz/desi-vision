import { defineConfig } from "@playwright/test";

/**
 * E2E smoke test config. Chromium runs with a fake camera device so the
 * game can boot its camera + model pipeline without real hardware, and the
 * fake-device permission UI is auto-approved.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    permissions: ["camera"],
    launchOptions: {
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  webServer: {
    // Preview must bind 127.0.0.1 explicitly: the default localhost bind
    // is not reachable on 127.0.0.1 in this environment.
    command: "npm run build && npx vite preview --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
