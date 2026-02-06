/**
 * Lead Extraction Engine - Instagram Business Profile Extractor
 * Extracts bio contact info from business profiles only
 */

console.log('[LeadEngine] Instagram Bio Extractor Loaded');

class InstagramExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];

        const lead = this.parseProfile();
        if (lead && !this.extractedHashes.has(lead.hash)) {
            leads.push(lead);
            this.extractedHashes.add(lead.hash);
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Instagram: Extracted ${leads.length} lead`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseProfile() {
        try {
            // Profile header
            const name = document.querySelector('header h2, header span')?.innerText?.trim() || '';
            const bioSection = document.querySelector('header section > div:last-child')?.innerText || '';

            // Extract emails from bio
            const emailMatch = bioSection.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            const emails = emailMatch ? [...new Set(emailMatch)] : [];

            // Extract phone from bio
            const phoneMatch = bioSection.match(/(\+?\d{1,4}[\s.-]?)?(\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g);
            const phones = phoneMatch ? [...new Set(phoneMatch)] : [];

            // Extract website link
            const websiteLink = document.querySelector('a[href*="l.instagram.com"]')?.href || '';
            let website = '';
            if (websiteLink) {
                try {
                    const url = new URL(websiteLink);
                    website = url.searchParams.get('u') || websiteLink;
                } catch (e) {
                    website = websiteLink;
                }
            }

            // Follower count as signal strength
            const followersEl = document.querySelector('header section ul li:nth-child(2) span');
            const followers = followersEl?.innerText?.trim() || '';

            // Business category indicator
            const category = document.querySelector('header section > div:first-child > div:last-child')?.innerText?.trim() || '';

            if (!name || (emails.length === 0 && phones.length === 0 && !website)) return null;

            const raw = `${name}${emails[0] || phones[0] || website}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                emails: emails.join(', '),
                phone: phones.join(', '),
                website,
                category,
                notes: `Followers: ${followers}`,
                platform: 'instagram',
                type: 'B2C Signal',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Instagram Parse Error:', e);
            return null;
        }
    }
}

const extractor = new InstagramExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.extractLeads();
});
