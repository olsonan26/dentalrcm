import { runTest } from "./auth";

runTest("Claims Page Screenshots", async (helper) => {
  const { page } = helper;

  // Go to claims page
  await helper.goto("/claims");
  await page.waitForTimeout(2500);

  // Screenshot 1: Claims list with new features
  await page.screenshot({ path: "tmp/claims_list.png", fullPage: false });
  console.log("Screenshot 1: Claims list");

  // Click on a claim to open detail
  const claimRow = page.locator("tr").filter({ hasText: "CLM-2026-0004" });
  if ((await claimRow.count()) > 0) {
    await claimRow.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "tmp/claims_detail.png", fullPage: false });
    console.log("Screenshot 2: Claim detail with tabs");

    // Click AI Scrub tab
    const scrubTab = page.locator('[role="tab"]').filter({ hasText: "AI Scrub" });
    if ((await scrubTab.count()) > 0) {
      await scrubTab.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: "tmp/claims_scrub.png", fullPage: false });
      console.log("Screenshot 3: AI scrub tab");
    }
  }

  // Close sheet and click New Claim
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  const newClaimBtn = page.locator("button").filter({ hasText: "New Claim" });
  if ((await newClaimBtn.count()) > 0) {
    await newClaimBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "tmp/claims_create.png", fullPage: false });
    console.log("Screenshot 4: Create claim dialog");
  }
}).catch(() => process.exit(1));
