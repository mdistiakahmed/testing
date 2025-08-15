import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';
import path from 'path';

const CRAWL_ROOT_URLS = [
    'https://www.amazon.com/s?i=fashion-novelty&rh=p_6%3AATVPDKIKX0DER&s=featured&page=1&hidden-keywords=Lightweight%2C+Classic+fit%2C+Double-needle+sleeve+and+bottom+hem+-Longsleeve+-Raglan+-Vneck+-Tanktop&xpid=OIoi58_gtAvEm&qid=1754230177&ref=sr_pg_2',
];
const MAX_PAGE_COUNT = 1;
const asinPattern = /\/dp\/([A-Z0-9]{10})/;
const ZIP_CODE = '10001'; // Change location ZIP code

const allAsins = new Set();
let locationChanged = false; // Flag to track location setup

function getNextPageUrl(currentUrl, pageCount) {
    return currentUrl.replace(`page=${pageCount}`, `page=${pageCount + 1}`);
}

function saveAsinsToFile(asins) {
    const sorted = [...asins].sort();
    const filePath = path.join('./storage/datasets', 'asins.json');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2));
    console.log(`✅ Saved ${sorted.length} ASINs to ${filePath}`);
}

const discoveryCrawler = new PlaywrightCrawler({
    headless: true,
    requestHandlerTimeoutSecs: 180,
    maxRequestRetries: 1,
    maxRequestsPerCrawl: 9999,

    async requestHandler({ page, request, log, crawler }) {
        const { url, userData } = request;
        const pageCount = userData.pageCount || 1;

        log.info(`🔍 Processing page ${pageCount}: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        log.info("Wait for 10 seconds before doing anything...");
        await page.waitForTimeout(10000);

       // ===== Change Location Only Once =====
        if (!locationChanged) {
            try {
                const locationButton = await page.waitForSelector('#nav-global-location-popover-link', { timeout: 10000 });
                await locationButton.click();
                log.info("Clicked location popover");
                await page.waitForTimeout(2000);

                const zipInput = await page.waitForSelector('#GLUXZipUpdateInput', { timeout: 10000 });
                await zipInput.fill(ZIP_CODE);
                log.info(`Entered ZIP code: ${ZIP_CODE}`);
                await page.waitForTimeout(1000);

                const applyButton = await page.waitForSelector('#GLUXZipUpdate', { timeout: 10000 });
                await applyButton.click();
                log.info("Clicked Apply");

                const closeButton = await page.waitForSelector("button[data-action='a-popover-close']", { timeout: 10000 });
                await closeButton.click();
                log.info("Closed location popover");
                await page.waitForTimeout(3000);

                locationChanged = true; // Set flag to true so we don’t do it again
            } catch (e) {
                log.warning("Location change step skipped (maybe popup not present)");
            }
        }

        log.info("Waiting 5 seconds before start scrapping....");
        await page.waitForTimeout(5000);

        // ===== Extract ASINs =====
        const hrefs = await page.$$eval('a[href]', links => links.map(a => a.getAttribute('href')));
        const pageAsins = new Set();
        hrefs.forEach(href => {
            const match = href?.match(asinPattern);
            if (match) pageAsins.add(match[1]);
        });

        log.info(`Found ${pageAsins.size} ASINs on page ${pageCount}`);
        pageAsins.forEach(a => allAsins.add(a));

        // ===== Next page =====
        if (pageCount < MAX_PAGE_COUNT && pageAsins.size > 0) {
            log.info("⏱ Waiting 30 seconds before next page...");
            await page.waitForTimeout(30000);
            await crawler.addRequests([
                { url: getNextPageUrl(url, pageCount), userData: { pageCount: pageCount + 1 } }
            ]);
        }
    }
});

// Run discovery
(async () => {
    console.log('🚀 Starting ASIN discovery with location change (once)...');
    await discoveryCrawler.run(
        CRAWL_ROOT_URLS.map(url => ({ url, userData: { pageCount: 1 } }))
    );
    console.log(`🎯 Total unique ASINs found: ${allAsins.size}`);
    saveAsinsToFile(allAsins);
})();
