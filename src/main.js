import { PlaywrightCrawler } from 'crawlee';
import fs from 'fs';

const crawler = new PlaywrightCrawler({
    headless: false,
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 180,

    async requestHandler({ page, request, log }) {
        log.info(`Opening Amazon product page: ${request.url}`);

        // Wait for full page load
        await page.waitForTimeout(10000);

        // Step 1: Click location popover
        const locationButton = await page.waitForSelector('#nav-global-location-popover-link', { timeout: 15000 });
        await locationButton.click();
        log.info("Clicked location popover.");
        await page.waitForTimeout(5000);

        // Step 2: Enter ZIP code
        const zipInput = await page.waitForSelector('#GLUXZipUpdateInput', { timeout: 15000 });
        await zipInput.fill('10001');
        log.info("Entered ZIP code: 10001");
        await page.waitForTimeout(5000);

        // Step 3: Click Apply button
        const applyButton = await page.waitForSelector('#GLUXZipUpdate', { timeout: 15000 });
        await applyButton.click();
        log.info("Clicked Apply.");
        await page.waitForTimeout(5000);

        // Step 4: Close confirmation popover
        const closeButton = await page.waitForSelector("button[data-action='a-popover-close']", { timeout: 15000 });
        await closeButton.click();
        log.info("Closed location popover.");
        await page.waitForTimeout(10000);

        // Step 5: Check Merch on Demand logo
        const hasMerchLogo = await page.content();
        if (!hasMerchLogo.includes("https://m.media-amazon.com/images/G/01/Merch/logo/amazon_merch_on_demand_logo2x._CB650496796_.png")) {
            log.warning("Skipping: 'Merch on Demand' logo not found.");
            return;
        }

        // Step 6: Extract product data
        const data = {};

        try { data.brand = await page.locator('#bylineInfo').textContent(); } catch {}
        try { data.title = (await page.locator('#productTitle').textContent())?.trim(); } catch {}
        try { data.soldInLastMonth = (await page.locator('#social-proofing-faceout-title-tk_bought').textContent())?.trim(); } catch {}

        // Price
        try {
            const symbol = (await page.locator('.a-price-symbol').textContent())?.trim() || '';
            const whole = (await page.locator('.a-price-whole').textContent())?.replace('.', '').trim() || '';
            const fraction = (await page.locator('.a-price-fraction').textContent())?.trim() || '';
            data.price = `${symbol}${whole}.${fraction}`;
        } catch {}

        try { data.image = await page.locator('#landingImage').getAttribute('src'); } catch {}
        try { data.about = (await page.locator('#feature-bullets').textContent())?.trim(); } catch {}

        // Product details
        try {
            const detailsText = await page.locator('#detailBulletsWrapper_feature_div').textContent();
            const cleanText = detailsText.replace(/\s+/g, ' ').trim();

            const dateMatch = cleanText.match(/Date First Available\s*:\s*(.*?)(?= ASIN|$)/);
            const asinMatch = cleanText.match(/ASIN\s*:\s*(.*?)(?= Best Sellers Rank|$)/);
            const rankMatch = cleanText.match(/#([\d,]+)/);

            data.dateFirstAvailable = dateMatch ? dateMatch[1].trim() : 'N/A';
            data.asin = asinMatch ? asinMatch[1].trim() : 'N/A';
            data.bestSellersRank = rankMatch ? `#${rankMatch[1]}` : 'N/A';
        } catch {}

        // Step 7: Save to JSON
        fs.writeFileSync('amazon_product.json', JSON.stringify(data, null, 2));
        log.info("✅ Data saved to amazon_product.json");

        // Wait 10 sec before closing
        await page.waitForTimeout(10000);
    }
});

// Run crawler for this product
await crawler.run(['https://www.amazon.com/dp/B0D7QQ6F1W']);
