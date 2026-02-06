/**
 * Lead Extraction Engine - Bing Maps Extractor
 */
import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Bing Maps Extractor Loaded');

class BingMapsExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.taskCard, .lpc_card, .entity-card, [data-entityid]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Bing Maps: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.lpc_title, .entity-title, h2')?.innerText?.trim() || '';
            const rating = item.querySelector('.ratingValue, .stars')?.innerText?.trim() || '';
            const category = item.querySelector('.entity-categories, .lpc_categories')?.innerText?.trim() || '';
            const address = item.querySelector('.lpc_addr, .entity-address')?.innerText?.trim() || '';
            const phone = item.querySelector('.lpc_phone, a[href^="tel:"]')?.innerText?.trim() || '';
            const website = item.querySelector('a.lpc_website, a[data-click="website"]')?.href || '';

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
                platform: 'bing_maps',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #00a4ef';
        el.style.backgroundColor = 'rgba(0, 164, 239, 0.1)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        const scrollContainer = document.querySelector('.listContainer, .lpc_scroll');
        const target = scrollContainer || window;

        while (this.isAutoScrolling) {
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            } else {
                window.scrollTo(0, document.body.scrollHeight);
            }
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
            this.extractLeads();
        }
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
    }
}

const extractor = new BingMapsExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
