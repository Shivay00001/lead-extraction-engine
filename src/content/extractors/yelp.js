/**
 * Lead Extraction Engine - Yelp Extractor
 */
import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Yelp Extractor Loaded');

class YelpExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        // Yelp search result cards
        const items = document.querySelectorAll('[data-testid="serp-ia-card"], .container__09f24__sHa8F, .businessName__09f24__HG_pC, .list__09f24__ynIEd > li');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Yelp: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('a[href*="/biz/"]')?.innerText?.trim() ||
                item.querySelector('.css-1egxyvc, h3, h4')?.innerText?.trim() || '';
            const rating = item.querySelector('.css-1fdy0l5, [aria-label*="rating"]')?.getAttribute('aria-label') || '';
            const category = item.querySelector('.css-11bijt4, .category')?.innerText?.trim() || '';
            const address = item.querySelector('.css-1e4fdj9, .secondary-attributes')?.innerText?.trim() || '';
            const phone = item.querySelector('.css-1p9ibgf, a[href^="tel:"]')?.innerText?.trim() || '';
            const website = item.querySelector('a[href*="biz_redir"]')?.href || '';

            if (!name) return null;

            const guessedEmails = website ? guessEmails(name, website) : [];
            const raw = `${name}${phone}${address}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category,
                rating,
                address,
                phone,
                website,
                emails: guessedEmails.join(', '),
                platform: 'yelp',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #d32323';
        el.style.backgroundColor = 'rgba(211, 35, 35, 0.05)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2500));
            this.extractLeads();

            // Check pagination
            const nextPage = document.querySelector('a[aria-label="Next"], .next-link');
            if (nextPage && !nextPage.disabled) {
                nextPage.click();
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
    }
}

const extractor = new YelpExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
