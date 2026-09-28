const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../evidence/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Edge for Phase 3 (Sales Workspace) verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Authenticate as Sales Rep
  console.log('🔑 1. Logging in as Sales Rep at /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('#email', 'sales@distributor.com');
  await page.type('#password', 'Sales123!');
  await page.click('button[type="submit"]');

  // Wait for redirect to /sales
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('   Redirected successfully to:', page.url());
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-phase3-sales-queue.png') });

  // 2. Navigate to All Orders
  console.log('📋 2. Navigating to Sales Orders (/sales/orders)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const orderLink = links.find((a) => a.textContent && a.textContent.includes('All client orders'));
    if (orderLink) orderLink.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-phase3-sales-orders.png') });

  // 3. Navigate to Customer Accounts
  console.log('👥 3. Navigating to Customer Accounts (/sales/customers)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const custLink = links.find((a) => a.textContent && a.textContent.includes('Customer accounts'));
    if (custLink) custLink.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-phase3-sales-customers.png') });

  await browser.close();
  console.log('✅ Phase 3 (Sales Workspace) screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during Phase 3 screenshot capture:', err);
  process.exit(1);
});
