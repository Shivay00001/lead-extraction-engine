/**
 * Lead Extraction Engine - Apna Extractor
 * Extracts COMPANY NAMES ONLY from job listings (no login scraping)
 */

console.log('[LeadEngine] Apna Extractor Loaded');

class ApnaExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.job-card, [data-job], .job-item, article');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Apna: Extracted ${leads.length} company signals`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const companyName = item.querySelector('.company-name, .employer-name, h4, .company')?.innerText?.trim() || '';
            const location = item.querySelector('.location, .job-location')?.innerText?.trim() || '';
            const jobTitle = item.querySelector('.job-title, h3, .title')?.innerText?.trim() || '';
            const salary = item.querySelector('.salary, .ctc')?.innerText?.trim() || '';

            if (!companyName) return null;

            const raw = `apna-${companyName}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: companyName,
                address: location,
                notes: `Hiring: ${jobTitle}. ${salary ? `Salary: ${salary}` : ''}`,
                platform: 'apna',
                type: 'B2B Signal (Hiring)',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.borderLeft = '4px solid #6c5ce7';
        el.style.backgroundColor = 'rgba(108, 92, 231, 0.05)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2500));
            this.extractLeads();
        }
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
    }
}

const extractor = new ApnaExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
