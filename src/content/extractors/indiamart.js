/**
 * Lead Extraction Engine - IndiaMART Extractor
 */

console.log('[LeadEngine] IndiaMART Extractor Loaded');

class IndiaMartExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];
        // Extract from product listings and search results
        const items = document.querySelectorAll('.m-card, .lst_cl, .product-card');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.company-name, .nme, .companyname')?.innerText || '';
            const location = item.querySelector('.cloc, .location')?.innerText || '';
            const price = item.querySelector('.prc, .price')?.innerText || '';

            if (!name) return null;

            const raw = `${name}${location}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                address: location,
                notes: `Price context: ${price}`,
                platform: 'indiamart',
                type: 'D2C/Supplier',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #6c2c91';
        el.style.boxShadow = '0 0 10px rgba(108, 44, 145, 0.3)';
    }
}

const extractor = new IndiaMartExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        window.scrollTo(0, document.body.scrollHeight);
    }
});
