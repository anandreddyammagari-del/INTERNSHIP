const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../../evidence/screenshots');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('#email', 'buyer@apexcorp.com');
  await page.type('#password', 'Buyer123!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // Click 'Add to order' button on the first item
  await page.waitForSelector('table', { timeout: 10000 });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Add to order'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Open cart drawer
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const cartBtn = buttons.find(b => b.textContent && b.textContent.includes('Purchase cart'));
    if (cartBtn) cartBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-phase2-buyer-cart-drawer.png') });
  await browser.close();
  console.log('Cart drawer screenshot captured with items!');
}

run().catch(console.error);
