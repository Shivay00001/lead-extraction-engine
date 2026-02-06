/**
 * Lead Extraction Engine - Indeed Extractor
 * Extracts COMPANY NAMES ONLY from job listings (no login scraping)
 */

console.log('[LeadEngine] Indeed Extractor Loaded');

class IndeedExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];
        const items = document.querySelectorAll('.jobsearch-ResultsList > li, .job_seen_beacon, [data-jk]');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Indeed: Extracted ${leads.length} company signals`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const companyName = item.querySelector('.companyName, [data-testid="company-name"], .company')?.innerText?.trim() || '';
            const location = item.querySelector('.companyLocation, [data-testid="text-location"]')?.innerText?.trim() || '';
            const jobTitle = item.querySelector('.jobTitle, [data-testid="job-title"]')?.innerText?.trim() || '';
            const salary = item.querySelector('.salary-snippet, .estimated-salary')?.innerText?.trim() || '';

            if (!companyName) return null;

            const raw = `indeed-${companyName}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: companyName,
                address: location,
                notes: `Hiring: ${jobTitle}. ${salary ? `Salary: ${salary}` : ''}`,
                platform: 'indeed',
                type: 'B2B Signal (Hiring)',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.borderLeft = '4px solid #2164f3';
        el.style.backgroundColor = 'rgba(33, 100, 243, 0.05)';
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;

        while (this.isAutoScrolling) {
            this.extractLeads();

            const nextPage = document.querySelector('a[data-testid="pagination-page-next"], a[aria-label="Next Page"]');
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

const extractor = new IndeedExtractor();
setTimeout(() => extractor.extractLeads(), 2000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') extractor.stopAutoScroll();
});
