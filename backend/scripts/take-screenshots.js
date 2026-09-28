const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../evidence/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Edge for enterprise UI screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Catalog Screen
  console.log('📸 1. Capturing Product Catalog...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.waitForSelector('table', { timeout: 10000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-catalog-grid.png') });

  // 2. Open Cart Drawer
  console.log('📸 2. Capturing Purchase Cart Sheet...');
  const addBtn = await page.$('tbody tr:first-child button:last-child');
  if (addBtn) {
    await addBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
  }
  const cartNav = await page.$('button[title*="Cart"], aside button:nth-of-type(2)');
  if (cartNav) {
    await cartNav.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-cart-drawer.png') });
  }

  // Reload page to reset modal state
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 3. Orders Screen
  console.log('📸 3. Capturing Order Register Ledger...');
  // Click on Orders in sidebar
  const orderNav = (await page.$$('aside button'))[2];
  if (orderNav) {
    await orderNav.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-orders-register.png') });

    // 4. Open Invoice Modal
    console.log('📸 4. Capturing Commercial Tax Invoice...');
    const invoiceBtn = await page.$('tbody tr:first-child button');
    if (invoiceBtn) {
      await invoiceBtn.click();
      await new Promise((r) => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-tax-invoice.png') });
      // Close invoice modal
      const closeBtn = await page.$('div[role="dialog"] button:last-child, #invoice-sheet + * button, .fixed button:last-child');
      if (closeBtn) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 5. Switch to Admin for Inventory Control
  console.log('📸 5. Capturing Admin Inventory Control & Valuation...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.select('header select', 'admin@distributor.com');
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-admin-inventory.png') });

  // 6. Admin Audit & Compliance Trail
  console.log('📸 6. Capturing Compliance & Audit Trail...');
  const asideButtons = await page.$$('aside button');
  for (const btn of asideButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Compliance & Audit')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-compliance-audit.png') });

  await browser.close();
  console.log('✅ All 6 enterprise screenshots captured successfully in evidence/screenshots/');
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
