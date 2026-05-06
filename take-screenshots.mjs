import { chromium, devices } from 'playwright';
import fs from 'fs';

async function takeScreenshots() {
  const browser = await chromium.launch();
  
  // Define the pages we want to capture
  const pagesToCapture = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Clients', path: '/dashboard/clients' },
    { name: 'Messages', path: '/dashboard/messages' },
    { name: 'Billing', path: '/dashboard/billing' },
    { name: 'Settings', path: '/dashboard/settings' }
  ];

  // We need to create a directory for the screenshots if it doesn't exist
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // --- DESKTOP VIEW ---
  console.log('Starting Desktop captures...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const desktopPage = await desktopContext.newPage();
  
  // Login first
  await desktopPage.goto('http://localhost:9876/login');
  await desktopPage.fill('#login-email', 'dr.osei@mentalpath.ca');
  await desktopPage.fill('#login-password', 'demo1234');
  await desktopPage.click('button[type="submit"]');
  await desktopPage.waitForURL('http://localhost:9876/dashboard');

  // Loop through pages
  for (const pageInfo of pagesToCapture) {
    console.log(`Capturing Desktop: ${pageInfo.name}`);
    await desktopPage.goto(`http://localhost:9876${pageInfo.path}`);
    await desktopPage.waitForTimeout(2000); // give UI time to settle
    await desktopPage.screenshot({ path: `screenshots/Desktop_${pageInfo.name}.png` });
  }
  await desktopContext.close();

  // --- MOBILE VIEW ---
  console.log('Starting Mobile captures...');
  const mobileContext = await browser.newContext({
    ...devices['iPhone 13']
  });
  const mobilePage = await mobileContext.newPage();
  
  // Login first for mobile
  await mobilePage.goto('http://localhost:9876/login');
  await mobilePage.fill('#login-email', 'dr.osei@mentalpath.ca');
  await mobilePage.fill('#login-password', 'demo1234');
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL('http://localhost:9876/dashboard');

  // Loop through pages
  for (const pageInfo of pagesToCapture) {
    console.log(`Capturing Mobile: ${pageInfo.name}`);
    await mobilePage.goto(`http://localhost:9876${pageInfo.path}`);
    await mobilePage.waitForTimeout(2000); // give UI time to settle
    await mobilePage.screenshot({ path: `screenshots/Mobile_${pageInfo.name}.png` });
  }
  await mobileContext.close();

  await browser.close();
  console.log('Finished capturing all screenshots!');
}

takeScreenshots().catch(console.error);
