const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../evidence/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Edge for Phase 4 (Admin Workspace) verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Authenticate as Platform Admin
  console.log('🔑 1. Logging in as Admin at /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('#email', 'admin@distributor.com');
  await page.type('#password', 'Admin123!');
  await page.click('button[type="submit"]');

  // Wait for redirect to /admin
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('   Redirected successfully to:', page.url());
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-phase4-admin-inventory.png') });

  // 2. Navigate to Global Order Ledger
  console.log('📋 2. Navigating to Global Order Ledger (/admin/orders)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const orderLink = links.find((a) => a.textContent && a.textContent.includes('Global order ledger'));
    if (orderLink) orderLink.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-phase4-admin-orders.png') });

  // 3. Navigate to Catalog Management
  console.log('📦 3. Navigating to Catalog Management (/admin/catalog)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const catLink = links.find((a) => a.textContent && a.textContent.includes('Catalog management'));
    if (catLink) catLink.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-phase4-admin-catalog.png') });

  // 4. Navigate to System Audit Logs
  console.log('🔍 4. Navigating to System Audit Logs (/admin/audit)...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside a'));
    const auditLink = links.find((a) => a.textContent && a.textContent.includes('System audit logs'));
    if (auditLink) auditLink.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-phase4-admin-audit.png') });

  await browser.close();
  console.log('✅ Phase 4 (Admin Workspace) screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during Phase 4 screenshot capture:', err);
  process.exit(1);
});
