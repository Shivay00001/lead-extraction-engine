/**
 * Lead Extraction Engine - LinkedIn Extractor
 * Extracts leads from LinkedIn search results, people profiles, and company pages.
 */

console.log('[LeadEngine] LinkedIn Extractor Loaded');

class LinkedInExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];

        // --- Search Results (People) ---
        const searchCards = document.querySelectorAll(
            '.reusable-search__result-container, ' +
            '.entity-result, ' +
            'li.reusable-search__result-container'
        );

        for (const card of searchCards) {
            const lead = this.parseSearchCard(card);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(card);
            }
        }

        // --- Sales Navigator Results ---
        const salesCards = document.querySelectorAll(
            '.artdeco-list__item, ' +
            '[data-anonymize="person-name"]'
        );

        for (const card of salesCards) {
            const lead = this.parseSalesCard(card);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(card);
            }
        }

        // --- Company Pages ---
        const companyInfo = this.parseCompanyPage();
        if (companyInfo && !this.extractedHashes.has(companyInfo.hash)) {
            leads.push(companyInfo);
            this.extractedHashes.add(companyInfo.hash);
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Extracted ${leads.length} LinkedIn leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseSearchCard(card) {
        try {
            const nameEl = card.querySelector(
                '.entity-result__title-text a span[aria-hidden="true"], ' +
                '.entity-result__title-text .t-16, ' +
                '.app-aware-link span[dir="ltr"]'
            );
            const name = nameEl?.innerText?.trim() || '';
            if (!name || name === 'LinkedIn Member') return null;

            const subtitleEl = card.querySelector(
                '.entity-result__primary-subtitle, ' +
                '.entity-result__summary, ' +
                '.subline-level-1'
            );
            const title = subtitleEl?.innerText?.trim() || '';

            const locationEl = card.querySelector(
                '.entity-result__secondary-subtitle, ' +
                '.subline-level-2'
            );
            const location = locationEl?.innerText?.trim() || '';

            const profileLink = card.querySelector(
                'a.app-aware-link[href*="/in/"], ' +
                'a[href*="/in/"]'
            );
            const profileUrl = profileLink?.href?.split('?')[0] || '';

            const raw = `${name}${title}${profileUrl}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: title,
                address: location,
                phone: '',
                website: profileUrl,
                emails: '',
                rating: '',
                notes: 'LinkedIn Search Result',
                platform: 'linkedin',
                type: 'B2B',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] LinkedIn parse error:', e);
            return null;
        }
    }

    parseSalesCard(card) {
        try {
            const nameEl = card.querySelector(
                '[data-anonymize="person-name"], ' +
                '.artdeco-entity-lockup__title'
            );
            const name = nameEl?.innerText?.trim() || '';
            if (!name) return null;

            const titleEl = card.querySelector(
                '[data-anonymize="title"], ' +
                '.artdeco-entity-lockup__subtitle'
            );
            const title = titleEl?.innerText?.trim() || '';

            const companyEl = card.querySelector(
                '[data-anonymize="company-name"]'
            );
            const company = companyEl?.innerText?.trim() || '';

            const raw = `${name}${title}${company}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: `${title}${company ? ' at ' + company : ''}`,
                address: '',
                phone: '',
                website: '',
                emails: '',
                rating: '',
                notes: 'LinkedIn Sales Navigator',
                platform: 'linkedin',
                type: 'B2B',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    parseCompanyPage() {
        try {
            const isCompanyPage = window.location.href.includes('/company/');
            if (!isCompanyPage) return null;

            const nameEl = document.querySelector(
                'h1.org-top-card-summary__title, ' +
                'h1.top-card-layout__title, ' +
                '.org-top-card-summary-info-list + h1'
            );
            const name = nameEl?.innerText?.trim() || '';
            if (!name) return null;

            const industryEl = document.querySelector(
                '.org-top-card-summary-info-list__info-item, ' +
                '.top-card-layout__first-subline'
            );
            const industry = industryEl?.innerText?.trim() || '';

            const websiteEl = document.querySelector(
                'a[data-control-name="top_card_website"], ' +
                '.org-about-us-organization-description a[href*="http"]'
            );
            const website = websiteEl?.href || '';

            const locationEl = document.querySelectorAll(
                '.org-top-card-summary-info-list__info-item'
            );
            const location = locationEl.length > 1 ? locationEl[1]?.innerText?.trim() : '';

            const raw = `${name}${industry}${website}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: industry,
                address: location || '',
                phone: '',
                website,
                emails: '',
                rating: '',
                notes: 'LinkedIn Company Page',
                platform: 'linkedin',
                type: 'B2B',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #0a66c2';
        el.style.backgroundColor = 'rgba(10, 102, 194, 0.08)';

        if (!el.querySelector('.lead-engine-badge')) {
            const badge = document.createElement('div');
            badge.className = 'lead-engine-badge';
            badge.innerText = '✓ EXTRACTED';
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#0a66c2;color:white;font-size:10px;padding:2px 6px;border-radius:3px;z-index:9999;';
            el.style.position = 'relative';
            el.appendChild(badge);
        }
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        console.log('[LeadEngine] LinkedIn Auto Scroll Started');

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));
            this.extractLeads();

            // Check for "No more results"
            const noMore = document.querySelector('.search-no-more-results, .artdeco-empty-state');
            if (noMore) {
                console.log('[LeadEngine] No more results');
                break;
            }

            // Click "Next" button if paginated
            const nextBtn = document.querySelector('button[aria-label="Next"]');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
                await new Promise(r => setTimeout(r, 3000));
            }
        }
        this.isAutoScrolling = false;
    }
}

const extractor = new LinkedInExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        extractor.startAutoScroll();
    } else if (event.data.type === 'STOP_AUTO_SCRAPE') {
        extractor.isAutoScrolling = false;
    }
});
