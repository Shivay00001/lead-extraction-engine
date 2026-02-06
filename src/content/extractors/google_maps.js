import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Google Maps Extractor Loaded');

class GoogleMapsExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('div[role="article"]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Extracted ${leads.length} new leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.fontHeadlineSmall')?.innerText || '';
            const ratingText = item.querySelector('span[aria-label*="rating"]')?.ariaLabel || '';
            const category = item.querySelector('button[jsaction*="category"]')?.innerText || '';
            const address = item.querySelector('button[jsaction*="address"]')?.innerText || '';
            const phone = item.querySelector('button[jsaction*="phone"]')?.innerText || '';
            const website = item.querySelector('a[data-item-id="authority"]')?.href || '';
            const guessedEmails = website ? guessEmails(name, website) : [];

            if (!name) return null;

            // Simple hash for deduplication
            const raw = `${name}${phone}${address}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category,
                rating: ratingText,
                address,
                phone,
                website,
                emails: guessedEmails.join(', '),
                platform: 'google_maps',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Parse Error:', e);
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #00c853';
        el.style.backgroundColor = 'rgba(0, 200, 83, 0.1)';

        let badge = el.querySelector('.lead-engine-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'lead-engine-badge';
            badge.innerText = 'EXTRACTED';
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#00c853;color:white;font-size:10px;padding:2px 5px;border-radius:3px;z-index:9999;';
            el.style.position = 'relative';
            el.appendChild(badge);
        }
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        console.log('[LeadEngine] Starting Auto Scroll');

        const scrollContainer = document.querySelector('div[role="feed"]');
        if (!scrollContainer) {
            console.error('[LeadEngine] Scroll container not found');
            return;
        }

        while (this.isAutoScrolling) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
            this.extractLeads();

            // Check if end of list
            const endMsg = document.querySelector('.HlvSq');
            if (endMsg && endMsg.innerText.includes('reached the end')) {
                console.log('[LeadEngine] End of list reached');
                break;
            }
        }
        this.isAutoScrolling = false;
    }
}

const extractor = new GoogleMapsExtractor();
// Initial extraction after a short delay
setTimeout(() => extractor.extractLeads(), 3000);

// Listen for commands from popup
window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        extractor.startAutoScroll();
    } else if (event.data.type === 'STOP_AUTO_SCRAPE') {
        extractor.isAutoScrolling = false;
    }
});
