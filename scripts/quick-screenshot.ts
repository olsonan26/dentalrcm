import { runTest } from "./auth";

runTest("Quick Screenshot", async (helper) => {
  const { page } = helper;

  await helper.goto("/claims");
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "tmp/claims_page.png", fullPage: false });
  console.log("Claims page screenshot taken");

  // Click on a claim row
  const row = page.locator("tr.cursor-pointer").first();
  if ((await row.count()) > 0) {
    await row.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "tmp/claims_detail_new.png", fullPage: false });
    console.log("Claims detail screenshot taken");
  }
}).catch(() => process.exit(1));
