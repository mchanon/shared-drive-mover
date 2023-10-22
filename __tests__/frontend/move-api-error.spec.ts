import { expect, test } from "playwright-test-coverage";

import { setup } from "../test-utils/stub-endpoints";

test("works with an API error", async ({ page }) => {
  await page.goto("/");
  await setup(page);

  await page.evaluate(() => {
    window._endpointStubs.listSharedDrives = [
      {
        status: "success",
        value: { status: "success", response: [] },
      },
      {
        status: "success",
        value: { status: "success", response: [] },
      },
    ];
    window._endpointStubs.move = [
      {
        status: "success",
        value: { status: "error", type: "DriveAPIError" },
      },
    ];
  });

  await expect(
    page.getByText("Shared drive mover", { exact: true }),
  ).toBeVisible();
  await page.getByText("Continue").click();
  await page.getByText("My Drive").click();
  await page.getByText("Continue").click();
  await page.getByText("My Drive").click();
  await page.getByText("Continue").click();
  await expect(
    page.getByText(
      'contents of the folder "My Drive" into the folder "My Drive"',
    ),
  ).toBeVisible();
  await page.getByText("Move", { exact: true }).click();
  await expect(page.getByText("Confirmation", { exact: true })).toBeVisible();
  await expect(
    page.getByText("An error occurred", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("An error occurred in Google Drive"),
  ).toBeVisible();
});
