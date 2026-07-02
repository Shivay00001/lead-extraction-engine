/**
 * Lead Extraction Engine - Facebook Business Page Extractor
 * Extracts About section info from public business pages only
 */

console.log('[LeadEngine] Facebook About Extractor Loaded');

class FacebookExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];

        // Only works on Facebook business page About sections
        if (!window.location.href.includes('/about')) {
            console.log('[LeadEngine] Facebook: Navigate to page About section');
        }

        const lead = this.parseAboutPage();
        if (lead && !this.extractedHashes.has(lead.hash)) {
            leads.push(lead);
            this.extractedHashes.add(lead.hash);
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Facebook: Extracted ${leads.length} lead`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseAboutPage() {
        try {
            // Page name
            const pageName = document.querySelector('h1')?.innerText?.trim() || '';

            // About section content
            const aboutContent = document.body.innerText || '';

            // Extract email
            const emailMatch = aboutContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            const emails = emailMatch ? [...new Set(emailMatch)].filter(e => !e.includes('facebook.com')) : [];

            // Extract phone
            const phoneMatch = aboutContent.match(/(\+?\d{1,4}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g);
            const phones = phoneMatch ? [...new Set(phoneMatch)].slice(0, 3) : [];

            // Look for website links
            const links = document.querySelectorAll('a[href*="l.facebook.com"]');
            let website = '';
            links.forEach(link => {
                const href = link.href || '';
                if (href && !href.includes('facebook.com') && !href.includes('instagram.com')) {
                    try {
                        const url = new URL(href);
                        website = url.searchParams.get('u') || href;
                    } catch (e) {
                        website = href;
                    }
                }
            });

            // Address from structured data
            const addressEl = document.querySelector('[aria-label*="Address"], [data-key="address"]');
            const address = addressEl?.innerText?.trim() || '';

            // Category
            const categoryEl = document.querySelector('a[href*="/pages/category/"]');
            const category = categoryEl?.innerText?.trim() || '';

            // Likes/Followers as signal
            const likesEl = document.querySelector('[role="main"] span:has-text("like"), [role="main"] span:has-text("follow")');
            const likes = likesEl?.innerText?.trim() || '';

            if (!pageName || (emails.length === 0 && phones.length === 0 && !website)) return null;

            const raw = `${pageName}${emails[0] || phones[0] || website}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: pageName,
                emails: emails.join(', '),
                phone: phones.join(', '),
                website,
                address,
                category,
                notes: likes ? `Engagement: ${likes}` : '',
                platform: 'facebook',
                type: 'B2B/B2C Signal',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Facebook Parse Error:', e);
            return null;
        }
    }
}

const extractor = new FacebookExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.extractLeads();
});
