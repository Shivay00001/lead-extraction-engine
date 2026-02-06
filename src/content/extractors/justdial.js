/**
 * Lead Extraction Engine - Justdial Extractor
 */

console.log('[LeadEngine] Justdial Extractor Loaded');

class JustdialExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.cntanr, .result-card'); // Common JD classes

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
            const name = item.querySelector('.lng_cont_name, .jcn')?.innerText || '';
            const rating = item.querySelector('.green-box, .rtng_box')?.innerText || '';
            const category = item.querySelector('.cont_fl_no, .see-more')?.innerText || '';
            const address = item.querySelector('.cont_fl_addr, .ja-addr')?.innerText || '';

            // Justdial often uses icon classes for phone numbers (digit sprites)
            // This is a simplified extraction; real JD extraction often requires OCR or sprite mapping
            // For now, we'll try to get text if available or fallback
            const phone = item.querySelector('.contact-info')?.innerText || 'Check JD';

            if (!name) return null;

            const raw = `${name}${phone}${address}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category,
                rating,
                address,
                phone,
                platform: 'justdial',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #2563eb';
        el.style.position = 'relative';
        const badge = document.createElement('div');
        badge.innerText = 'EXTRACTED';
        badge.style.cssText = 'position:absolute;top:0;right:0;background:#2563eb;color:white;font-size:9px;padding:2px 4px;z-index:10;';
        el.appendChild(badge);
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 3000));
            this.extractLeads();

            // Stop if button "Next" is not found (JD sometimes uses pagination or infinite scroll)
            const nextBtn = document.querySelector('.next-btn, a[rel="next"]');
            if (!nextBtn) {
                // Try scrolling more
                window.scrollBy(0, 1000);
            }
        }
    }
}

const extractor = new JustdialExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.isAutoScrolling = false;
});
