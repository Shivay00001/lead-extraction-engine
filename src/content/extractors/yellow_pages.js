/**
 * Lead Extraction Engine - Yellow Pages Extractor (Global + India)
 */
import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Yellow Pages Extractor Loaded');

class YellowPagesExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        // Works for yellowpages.com, yellowpages.in, and similar
        const items = document.querySelectorAll('.result, .listing, .business-card, .organic, [data-lid]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Yellow Pages: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.business-name, .n, a.business-name')?.innerText?.trim() || '';
            const category = item.querySelector('.categories, .cat')?.innerText?.trim() || '';
            const address = item.querySelector('.address, .adr, .street-address')?.innerText?.trim() || '';
            const phone = item.querySelector('.phones, .phone, a[href^="tel:"]')?.innerText?.trim() || '';
            const website = item.querySelector('a.track-visit-website, a[href*="http"]:not([href*="yellowpages"])')?.href || '';

            if (!name) return null;

            const guessedEmails = website ? guessEmails(name, website) : [];
            const raw = `${name}${phone}${address}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category,
                address,
                phone,
                website,
                emails: guessedEmails.join(', '),
                platform: 'yellow_pages',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #ffcc00';
        el.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            this.extractLeads();

            const nextPage = document.querySelector('a.next, a[rel="next"], .pagination a:last-child');
            if (nextPage && nextPage.href) {
                nextPage.click();
                await new Promise(r => setTimeout(r, 3000));
            } else {
                break;
            }
        }
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
    }
}

const extractor = new YellowPagesExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
