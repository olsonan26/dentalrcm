import { runTest } from "./auth";

runTest("Batch 5 Screenshots", async (helper) => {
  const { page } = helper;

  // Ensure seed data exists - wait for dashboard to load
  await helper.goto("/dashboard");
  await page.waitForTimeout(4000);

  // Screenshot 1: Enhanced Dashboard header (breadcrumbs, search bar, notification bell)
  await page.screenshot({ path: "tmp/batch5_dashboard_header.png", fullPage: false });

  // Screenshot 2: Appointments Page
  await helper.goto("/appointments");
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "tmp/batch5_appointments.png", fullPage: false });

  // Screenshot 3: Command Menu (press Ctrl+K since we're headless)
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "tmp/batch5_command_menu.png", fullPage: false });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // For the landing page, open a fresh context (not logged in)
  const browser = page.context().browser()!;
  const freshContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const lp = await freshContext.newPage();
  const appUrl = process.env.APP_URL || "http://localhost:4173";

  await lp.goto(appUrl, { waitUntil: "networkidle" });
  await lp.waitForTimeout(2000);

  // Screenshot 4: Landing Hero
  await lp.screenshot({ path: "tmp/batch5_landing_hero.png", fullPage: false });

  // Scroll to Stats section
  await lp.evaluate(() => window.scrollBy(0, 950));
  await lp.waitForTimeout(1000);
  await lp.screenshot({ path: "tmp/batch5_landing_stats.png", fullPage: false });

  // Scroll to Features
  await lp.evaluate(() => window.scrollBy(0, 650));
  await lp.waitForTimeout(1000);
  await lp.screenshot({ path: "tmp/batch5_landing_features.png", fullPage: false });

  // Scroll to testimonials
  await lp.evaluate(() => window.scrollBy(0, 1000));
  await lp.waitForTimeout(1000);
  await lp.screenshot({ path: "tmp/batch5_landing_testimonials.png", fullPage: false });

  // Scroll to pricing
  await lp.evaluate(() => window.scrollBy(0, 900));
  await lp.waitForTimeout(1000);
  await lp.screenshot({ path: "tmp/batch5_landing_pricing.png", fullPage: false });

  await freshContext.close();

  console.log("All Batch 5 screenshots taken!");
}).catch(() => process.exit(1));
