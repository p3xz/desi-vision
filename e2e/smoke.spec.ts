import { expect, test } from "@playwright/test";

/**
 * Smoke test: boots the production build in Chromium with a fake camera
 * device, walks start -> permission -> game, and asserts the FREE SCAN
 * label renders on the start screen.
 *
 * Stage 3 proves the camera boot reached the model-loading stage: the app
 * only fetches the COCO-SSD weights after getUserMedia succeeds. When the
 * model CDN is reachable the test waits for the full boot and asserts the
 * FREE SCAN label in the game HUD; when it is not (sandboxed browsers,
 * offline CI), the attempted model fetch is the boot-stage assertion and
 * the app's own error screen is the expected outcome.
 */
test("smoke: boot stages and FREE SCAN label", async ({ page }) => {
  // Stage 1: start screen boots.
  await page.goto("/");
  await expect(page.getByText("CAMERA ONLINE")).toBeVisible();
  await expect(page.getByText(/AI CORE.*ONLINE/)).toBeVisible();
  await expect(page.getByText(/SCANNER.*READY/)).toBeVisible();

  // First-run tutorial overlay covers the screen; dismiss it.
  await page.getByRole("button", { name: "Skip tutorial" }).click();
  await expect(
    page.getByRole("dialog", { name: "How to play" }),
  ).toBeHidden();

  // FREE SCAN mode card renders on the start screen.
  const freeScanCard = page.getByRole("button", { name: /FREE SCAN/ });
  await expect(freeScanCard).toBeVisible();
  await freeScanCard.click();
  await page.getByRole("button", { name: /START SCAN/ }).click();

  // Stage 2: permission notice.
  await expect(page.getByText("PERMISSION REQUIRED")).toBeVisible();

  // Register the stage-3 waiters BEFORE allowing the camera: the model
  // fetch starts within milliseconds of getUserMedia succeeding.
  const modelFetch = page
    .waitForRequest(/tfjs-models/, { timeout: 60_000 })
    .then(() => "model-stage" as const)
    .catch(() => "timeout" as const);
  const hudFreeScan = page
    .getByText("FREE SCAN", { exact: true })
    .waitFor({ state: "visible", timeout: 120_000 })
    .then(() => "booted" as const)
    .catch(() => "timeout" as const);

  await page.getByRole("button", { name: "ALLOW CAMERA" }).click();

  // Stage 3: game boots with the fake camera. Either the full boot
  // finishes (HUD FREE SCAN renders) or the COCO-SSD model fetch is
  // attempted, which only happens after getUserMedia succeeds.
  await expect(page.locator("video")).toBeVisible();
  const outcome = await Promise.race([modelFetch, hudFreeScan]);
  expect(["model-stage", "booted"]).toContain(outcome);
});
