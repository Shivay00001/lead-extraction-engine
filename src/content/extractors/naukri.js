/**
 * Lead Extraction Engine - Naukri Extractor
 * Extracts COMPANY NAMES ONLY from job listings (no login scraping)
 */

console.log('[LeadEngine] Naukri Extractor Loaded');

class NaukriExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.jobTuple, .srp-jobtuple, article.jobTuple, [data-job-id]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Naukri: Extracted ${leads.length} company signals`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            // Company name extraction
            const companyName = item.querySelector('.comp-name, .companyInfo .name, a[href*="company-jobs"]')?.innerText?.trim() || '';
            const location = item.querySelector('.loc, .locWdth, .location')?.innerText?.trim() || '';
            const industry = item.querySelector('.industry, .tag')?.innerText?.trim() || '';
            const jobTitle = item.querySelector('.title, .desig, .job-title')?.innerText?.trim() || '';

            if (!companyName) return null;

            const raw = `naukri-${companyName}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: companyName,
                address: location,
                category: industry,
                notes: `Hiring for: ${jobTitle}`,
                platform: 'naukri',
                type: 'B2B Signal (Hiring)',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.borderLeft = '4px solid #4a90d9';
        el.style.backgroundColor = 'rgba(74, 144, 217, 0.05)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2000));
            this.extractLeads();

            const nextPage = document.querySelector('a.fright, a[title="Next"]');
            if (nextPage) {
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

const extractor = new NaukriExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
