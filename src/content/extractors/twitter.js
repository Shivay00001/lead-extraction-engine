/**
 * Lead Extraction Engine - X (Twitter) Business Profile Extractor
 * Extracts public contact links from business profiles
 */

console.log('[LeadEngine] X/Twitter Extractor Loaded');

class TwitterExtractor {
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
            console.log(`[LeadEngine] X/Twitter: Extracted ${leads.length} lead`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseProfile() {
        try {
            // Profile name
            const displayName = document.querySelector('[data-testid="UserName"] span')?.innerText?.trim() || '';
            const handle = document.querySelector('[data-testid="UserName"] div:last-child span')?.innerText?.trim() || '';

            // Bio
            const bio = document.querySelector('[data-testid="UserDescription"]')?.innerText?.trim() || '';

            // Extract emails from bio
            const emailMatch = bio.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            const emails = emailMatch ? [...new Set(emailMatch)] : [];

            // Website link
            const websiteEl = document.querySelector('[data-testid="UserUrl"] a');
            const website = websiteEl?.href || '';

            // Location
            const location = document.querySelector('[data-testid="UserProfileHeader_Items"] span[data-testid="UserLocation"]')?.innerText?.trim() || '';

            // Followers as signal strength
            const followersEl = document.querySelector('a[href$="/verified_followers"] span, a[href$="/followers"] span');
            const followers = followersEl?.innerText?.trim() || '';

            if (!displayName || (!website && emails.length === 0)) return null;

            const raw = `${displayName}${handle}${website}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: displayName,
                handle,
                emails: emails.join(', '),
                website,
                address: location,
                notes: `Followers: ${followers}. Bio: ${bio.substring(0, 100)}`,
                platform: 'twitter',
                type: 'B2B/B2C Signal',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] X/Twitter Parse Error:', e);
            return null;
        }
    }
}

const extractor = new TwitterExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.extractLeads();
});
