const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    console.log('Page loaded');
  } catch (error) {
    console.error('Error during Puppeteer execution:', error.message);
  } finally {
    await browser.close();
  }
})();
