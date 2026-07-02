/**
 * Lead Extraction Engine - Zillow Extractor
 * Extracts real estate agents, agencies, and property managers from Zillow.
 */

console.log('[LeadEngine] Zillow Extractor Loaded');

class ZillowExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];

        // --- Agent Search Results ---
        const agentCards = document.querySelectorAll(
            '.ldb-agent-card, ' +
            '[data-test="agent-card"], ' +
            '.agent-info-card, ' +
            '.professional-card, ' +
            '.agent-card'
        );

        for (const card of agentCards) {
            const lead = this.parseAgentCard(card);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(card);
            }
        }

        // --- Agent Profile Pages ---
        const profileLead = this.parseAgentProfile();
        if (profileLead && !this.extractedHashes.has(profileLead.hash)) {
            leads.push(profileLead);
            this.extractedHashes.add(profileLead.hash);
        }

        // --- Listing Agent Info from Property Details ---
        const listingAgents = document.querySelectorAll(
            '.listing-agent, ' +
            '[data-test="attribution-LISTING_AGENT"], ' +
            '.hdp-agent-card'
        );

        for (const agent of listingAgents) {
            const lead = this.parseListingAgent(agent);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(agent);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Extracted ${leads.length} Zillow leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseAgentCard(card) {
        try {
            const nameEl = card.querySelector(
                '.ldb-agent-card-name, ' +
                '[data-test="agent-name"], ' +
                '.agent-name, ' +
                'h3, h4'
            );
            const name = nameEl?.innerText?.trim() || '';
            if (!name) return null;

            const phoneEl = card.querySelector(
                '.ldb-agent-card-phone, ' +
                '[data-test="agent-phone"], ' +
                '.agent-phone, ' +
                'a[href^="tel:"]'
            );
            let phone = phoneEl?.innerText?.trim() || '';
            if (!phone && phoneEl?.href) {
                phone = phoneEl.href.replace('tel:', '');
            }

            const reviewEl = card.querySelector(
                '.ldb-agent-card-review-count, ' +
                '[data-test="agent-rating"], ' +
                '.agent-rating'
            );
            const rating = reviewEl?.innerText?.trim() || '';

            const companyEl = card.querySelector(
                '.ldb-agent-card-brokerage, ' +
                '.agent-brokerage, ' +
                '.brokerage-name'
            );
            const company = companyEl?.innerText?.trim() || '';

            const locationEl = card.querySelector(
                '.ldb-agent-card-location, ' +
                '.agent-location'
            );
            const location = locationEl?.innerText?.trim() || '';

            const profileLink = card.querySelector('a[href*="/profile/"]');
            const profileUrl = profileLink?.href || '';

            const raw = `${name}${phone}${company}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: company || 'Real Estate Agent',
                address: location,
                phone,
                website: profileUrl,
                emails: '',
                rating,
                notes: 'Zillow Agent',
                platform: 'zillow',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Zillow agent parse error:', e);
            return null;
        }
    }

    parseAgentProfile() {
        try {
            const isProfile = window.location.href.includes('/profile/') ||
                              window.location.href.includes('/myzillow/');
            if (!isProfile) return null;

            const nameEl = document.querySelector(
                'h1.agent-name, ' +
                '[data-test="profile-name"], ' +
                'h1'
            );
            const name = nameEl?.innerText?.trim() || '';
            if (!name) return null;

            const phoneEl = document.querySelector(
                'a[href^="tel:"], ' +
                '[data-test="profile-phone"]'
            );
            let phone = phoneEl?.innerText?.trim() || '';
            if (!phone && phoneEl?.href) {
                phone = phoneEl.href.replace('tel:', '');
            }

            const companyEl = document.querySelector(
                '.agent-brokerage-name, ' +
                '[data-test="profile-brokerage"]'
            );
            const company = companyEl?.innerText?.trim() || '';

            const specialtiesEl = document.querySelector(
                '.agent-specialties, ' +
                '[data-test="profile-specialties"]'
            );
            const specialties = specialtiesEl?.innerText?.trim() || '';

            const raw = `${name}${phone}${company}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: company || 'Real Estate Agent',
                address: '',
                phone,
                website: window.location.href,
                emails: '',
                rating: '',
                notes: specialties ? `Specialties: ${specialties}` : 'Zillow Profile',
                platform: 'zillow',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    parseListingAgent(el) {
        try {
            const nameEl = el.querySelector('span, a, .agent-name');
            const name = nameEl?.innerText?.trim() || '';
            if (!name || name.length < 3) return null;

            const phoneEl = el.querySelector('a[href^="tel:"]');
            let phone = phoneEl?.innerText?.trim() || '';
            if (!phone && phoneEl?.href) {
                phone = phoneEl.href.replace('tel:', '');
            }

            const raw = `${name}${phone}listing`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: 'Listing Agent',
                address: '',
                phone,
                website: '',
                emails: '',
                rating: '',
                notes: 'From Zillow Property Listing',
                platform: 'zillow',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #006aff';
        el.style.backgroundColor = 'rgba(0, 106, 255, 0.08)';

        if (!el.querySelector('.lead-engine-badge')) {
            const badge = document.createElement('div');
            badge.className = 'lead-engine-badge';
            badge.innerText = '✓ EXTRACTED';
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#006aff;color:white;font-size:10px;padding:2px 6px;border-radius:3px;z-index:9999;';
            el.style.position = 'relative';
            el.appendChild(badge);
        }
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        console.log('[LeadEngine] Zillow Auto Scroll Started');

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500));
            this.extractLeads();

            // Pagination
            const nextBtn = document.querySelector(
                'a[aria-label="Next page"], ' +
                'a[title="Next page"], ' +
                '.pagination-next a'
            );
            if (nextBtn) {
                nextBtn.click();
                await new Promise(r => setTimeout(r, 3000));
            } else {
                // No more pages
                break;
            }
        }
        this.isAutoScrolling = false;
    }
}

const extractor = new ZillowExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        extractor.startAutoScroll();
    } else if (event.data.type === 'STOP_AUTO_SCRAPE') {
        extractor.isAutoScrolling = false;
    }
});
