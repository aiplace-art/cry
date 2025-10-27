const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Navigating to Hyper Chat...');
  await page.goto('http://localhost:8080/variant-2/hyper-chat-competitive.html');
  await page.waitForTimeout(2000);

  console.log('\n✨ Checking for animated AI logos...\n');

  // Check header logo
  const headerLogo = await page.locator('.ai-assistant-btn').first();
  const headerExists = await headerLogo.count() > 0;
  console.log(`1️⃣ Header animated logo: ${headerExists ? '✅ FOUND' : '❌ MISSING'}`);

  // Check sidebar logo
  const sidebarLogo = await page.locator('.ai-logo-sidebar');
  const sidebarExists = await sidebarLogo.count() > 0;
  console.log(`2️⃣ Sidebar animated logo: ${sidebarExists ? '✅ FOUND' : '❌ MISSING'}`);

  // Check welcome screen logo
  const welcomeLogo = await page.locator('.ai-logo-welcome');
  const welcomeExists = await welcomeLogo.count() > 0;
  console.log(`3️⃣ Welcome screen animated logo: ${welcomeExists ? '✅ FOUND' : '❌ MISSING'}`);

  // Check video elements
  const videos = await page.locator('.ai-video');
  const videoCount = await videos.count();
  console.log(`4️⃣ Video elements: ${videoCount} found`);

  // Check pulse animations
  const pulses = await page.locator('.ai-pulse');
  const pulseCount = await pulses.count();
  console.log(`5️⃣ Pulse animations: ${pulseCount} found`);

  console.log('\n📸 Taking screenshots...\n');

  // Screenshot of full page
  await page.screenshot({
    path: 'docs/screenshots/animated-logo-verification.png',
    fullPage: true
  });
  console.log('✅ Screenshot saved: docs/screenshots/animated-logo-verification.png');

  console.log('\n🎯 Verification complete!');

  await browser.close();
})();
