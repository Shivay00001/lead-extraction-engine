/**
 * Lead Extraction Engine - Apple Maps (Web) Extractor
 */
import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Apple Maps Extractor Loaded');

class AppleMapsExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.place-card, .search-result-item, [data-place-id]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Apple Maps: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.place-name, .title, h1, h2')?.innerText?.trim() || '';
            const category = item.querySelector('.category, .place-type')?.innerText?.trim() || '';
            const address = item.querySelector('.address, .place-address')?.innerText?.trim() || '';
            const phone = item.querySelector('.phone, a[href^="tel:"]')?.innerText?.trim() || '';
            const website = item.querySelector('a[href*="http"]:not([href*="apple.com"])')?.href || '';

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
                platform: 'apple_maps',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #555';
        el.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    }
}

const extractor = new AppleMapsExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.extractLeads();
});
