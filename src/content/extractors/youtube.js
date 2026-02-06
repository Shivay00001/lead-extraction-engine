/**
 * Lead Extraction Engine - YouTube About Page Extractor
 * Extracts business emails from channel "About" pages only
 */

console.log('[LeadEngine] YouTube About Extractor Loaded');

class YouTubeAboutExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];

        // Only works on channel "About" pages
        if (!window.location.href.includes('/about')) {
            console.log('[LeadEngine] YouTube: Navigate to channel About page');
            return;
        }

        const lead = this.parseAboutPage();
        if (lead && !this.extractedHashes.has(lead.hash)) {
            leads.push(lead);
            this.extractedHashes.add(lead.hash);
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] YouTube: Extracted ${leads.length} lead`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseAboutPage() {
        try {
            const channelName = document.querySelector('#channel-name, yt-formatted-string.ytd-channel-name')?.innerText?.trim() || '';
            const description = document.querySelector('#description-container, #description')?.innerText?.trim() || '';

            // Extract email from description or links
            const emailMatch = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            const emails = emailMatch ? [...new Set(emailMatch)] : [];

            // Extract business links
            const links = document.querySelectorAll('#link-list-container a, #primary-links a');
            const businessLinks = [];
            links.forEach(link => {
                const href = link.href || '';
                if (href && !href.includes('youtube.com')) {
                    businessLinks.push(href);
                }
            });

            const subscriberCount = document.querySelector('#subscriber-count')?.innerText?.trim() || '';
            const location = document.querySelector('#details-container .yt-formatted-string')?.innerText?.trim() || '';

            if (!channelName || emails.length === 0) return null;

            const raw = `${channelName}${emails[0]}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name: channelName,
                emails: emails.join(', '),
                website: businessLinks[0] || '',
                socialLinks: businessLinks.join(', '),
                notes: `Subscribers: ${subscriberCount}. ${location}`,
                platform: 'youtube',
                type: 'B2B Signal',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] YouTube Parse Error:', e);
            return null;
        }
    }
}

const extractor = new YouTubeAboutExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') extractor.extractLeads();
});
