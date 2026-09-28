const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../evidence/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Edge for Phase 2 (Buyer Workspace) verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Authenticate via real login form
  console.log('🔑 1. Logging in via credentials form at /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('#email', 'buyer@apexcorp.com');
  await page.type('#password', 'Buyer123!');
  await page.click('button[type="submit"]');

  // Wait for redirect to /buyer/catalog
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('   Redirected successfully to:', page.url());
  await page.waitForSelector('table', { timeout: 10000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-phase2-buyer-catalog.png') });

  // 2. Add an item and capture Cart Drawer
  console.log('🛒 2. Adding item to requisition cart and capturing slide-over drawer...');
  const addBtn = await page.$('tbody tr:first-child button:last-child');
  if (addBtn) {
    await addBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
  }
  // Click Purchase cart in sidebar
  const cartBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    return buttons.find((b) => b.textContent && b.textContent.includes('Purchase cart'));
  });
  if (cartBtn && cartBtn.click) {
    await cartBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-phase2-buyer-cart-drawer.png') });

    // Close drawer
    const closeBtn = await page.$('button[aria-label="Close cart"], .fixed button:has(svg)');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  // 3. Navigate to My Orders via sidebar click
  console.log('📋 3. Navigating to Buyer Orders (/buyer/orders)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const orderLink = links.find((a) => a.textContent && a.textContent.includes('My orders'));
    if (orderLink) orderLink.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-phase2-buyer-orders.png') });

  // 4. Navigate to Credit & Invoices via sidebar click
  console.log('💳 4. Navigating to Credit & Invoices (/buyer/invoices)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const invLink = links.find((a) => a.textContent && a.textContent.includes('Credit & invoices'));
    if (invLink) invLink.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-phase2-buyer-invoices.png') });

  await browser.close();
  console.log('✅ Phase 2 (Buyer Workspace) screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during Phase 2 screenshot capture:', err);
  process.exit(1);
});
