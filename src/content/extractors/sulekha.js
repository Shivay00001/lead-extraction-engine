/**
 * Lead Extraction Engine - Sulekha Extractor
 */
import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Sulekha Extractor Loaded');

class SulekhaExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.card-body, .merchant-card, .listing-item, .sresult');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Sulekha: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('.merchant-name, .name, h2, h3')?.innerText?.trim() || '';
            const rating = item.querySelector('.rating, .stars')?.innerText?.trim() || '';
            const category = item.querySelector('.category, .service-type')?.innerText?.trim() || '';
            const address = item.querySelector('.address, .location')?.innerText?.trim() || '';
            const phone = item.querySelector('.phone, .contact-number, a[href^="tel:"]')?.innerText?.trim() || '';
            const website = item.querySelector('a[href*="http"]')?.href || '';

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
                platform: 'sulekha',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Sulekha Parse Error:', e);
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #f59e0b';
        el.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        el.style.position = 'relative';

        let badge = el.querySelector('.lead-engine-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'lead-engine-badge';
            badge.innerText = '✓ EXTRACTED';
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#f59e0b;color:white;font-size:9px;padding:2px 6px;border-radius:3px;z-index:9999;font-weight:bold;';
            el.appendChild(badge);
        }
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        console.log('[LeadEngine] Sulekha: Starting Auto Scroll');

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));
            this.extractLeads();

            // Check for "Load More" button
            const loadMore = document.querySelector('.load-more, .show-more, button[data-action="loadmore"]');
            if (loadMore) {
                loadMore.click();
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
    }
}

const extractor = new SulekhaExtractor();
setTimeout(() => extractor.extractLeads(), 2500);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
