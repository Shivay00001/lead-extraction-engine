/**
 * Lead Extraction Engine - Generic / Universal Extractor
 * Fallback extractor for ANY website not specifically supported.
 * Scans the entire page for business contact information:
 *   - mailto: links → emails
 *   - tel: links → phone numbers
 *   - Regex patterns for emails and phone numbers in visible text
 *   - Business names from headings, structured data, meta tags
 *   - Addresses from structured data and common patterns
 *
 * Works on: all countries' business directories, yellow pages variants,
 * company websites, chamber of commerce sites, etc.
 */

console.log('[LeadEngine] Generic Extractor Loaded');

class GenericExtractor {
    constructor() {
        this.extractedHashes = new Set();
        this.isAutoScrolling = false;
    }

    async extractLeads() {
        const leads = [];

        // Strategy 1: Extract from structured data (JSON-LD, schema.org)
        const structuredLeads = this.extractFromStructuredData();
        for (const lead of structuredLeads) {
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
            }
        }

        // Strategy 2: Extract from vCard / hCard microformat elements
        const vcardLeads = this.extractFromVCards();
        for (const lead of vcardLeads) {
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
            }
        }

        // Strategy 3: Extract from listing/card patterns common on directories
        const cardLeads = this.extractFromCards();
        for (const lead of cardLeads) {
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
            }
        }

        // Strategy 4: Scan entire page for contact info (emails, phones, addresses)
        if (leads.length === 0) {
            const scanLead = this.scanPageForContacts();
            if (scanLead && !this.extractedHashes.has(scanLead.hash)) {
                leads.push(scanLead);
                this.extractedHashes.add(scanLead.hash);
            }
        }

        if (leads.length > 0) {
            console.log(`[LeadEngine] Generic: Extracted ${leads.length} leads`);
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        } else {
            console.log('[LeadEngine] Generic: No leads found on this page');
        }
    }

    // --- Strategy 1: JSON-LD / Schema.org structured data ---
    extractFromStructuredData() {
        const leads = [];
        try {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    const items = Array.isArray(data) ? data : [data];

                    for (const item of items) {
                        const lead = this.parseSchemaItem(item);
                        if (lead) leads.push(lead);

                        // Handle @graph
                        if (item['@graph']) {
                            for (const graphItem of item['@graph']) {
                                const gLead = this.parseSchemaItem(graphItem);
                                if (gLead) leads.push(gLead);
                            }
                        }
                    }
                } catch (e) { /* skip malformed JSON-LD */ }
            }
        } catch (e) {
            console.error('[LeadEngine] Structured data parse error:', e);
        }
        return leads;
    }

    parseSchemaItem(item) {
        const businessTypes = [
            // Core business types
            'LocalBusiness', 'Organization', 'Store', 'Restaurant', 'Hotel',
            'MedicalBusiness', 'FinancialService', 'ProfessionalService',
            'RealEstateAgent', 'LegalService', 'Dentist', 'Physician',
            'AutoDealer', 'HomeAndConstructionBusiness', 'FoodEstablishment',
            'HealthAndBeautyBusiness', 'SportsActivityLocation', 'LodgingBusiness',
            'EntertainmentBusiness',
            // Extended types
            'Corporation', 'GovernmentOrganization', 'NGO', 'EducationalOrganization',
            'MedicalOrganization', 'Airline', 'InsuranceAgency', 'AccountingService',
            'AutoBodyShop', 'AutoRepair', 'AutoRental', 'AutoWash',
            'Bakery', 'BarOrPub', 'BeautySalon', 'BedAndBreakfast',
            'ChildCare', 'CleaningService', 'DayCamp', 'DryCleaning',
            'ElectronicsStore', 'EmergencyService', 'ExerciseGym', 'Florist',
            'FurnitureStore', 'GasStation', 'GroceryStore', 'HairSalon',
            'HardwareStore', 'HealthClub', 'IceCreamShop', 'InternetCafe',
            'Laundromat', 'Library', 'LiquorStore', 'Locksmith',
            'MedicalClinic', 'MovingCompany', 'NailSalon', 'NightClub',
            'Optician', 'PawnShop', 'PetStore', 'Pharmacy', 'Plumber',
            'RadioStation', 'RecyclingCenter', 'SelfStorage', 'ShoeStore',
            'SkiResort', 'SportingGoodsStore', 'TattooParlor', 'TaxiService',
            'TelevisionStation', 'TennisComplex', 'TireShop', 'TouristInformationCenter',
            'ToyStore', 'TravelAgency', 'VeterinaryCare', 'WholesaleStore',
            'Campground', 'Hostel', 'Motel', 'Resort',
            'Company', 'Startup', 'Agency', 'Consultant',
            'CoworkingSpace', 'ConventionCenter'
        ];

        const type = item['@type'];
        if (!type) return null;

        const typeStr = Array.isArray(type) ? type.join(',') : type;
        const isRelevant = businessTypes.some(bt => typeStr.includes(bt)) ||
                           typeStr.includes('Person');
        if (!isRelevant) return null;

        const name = item.name || '';
        if (!name) return null;

        const phone = item.telephone || '';
        const email = item.email || '';
        const website = item.url || '';
        const address = item.address
            ? (typeof item.address === 'string'
                ? item.address
                : [item.address.streetAddress, item.address.addressLocality,
                   item.address.addressRegion, item.address.postalCode,
                   item.address.addressCountry]
                    .filter(Boolean).join(', '))
            : '';
        const rating = item.aggregateRating?.ratingValue || '';
        const category = typeStr.replace('Schema.org/', '').replace(/([A-Z])/g, ' $1').trim();

        const raw = `${name}${phone}${address}`;
        const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

        return {
            name,
            category,
            address,
            phone,
            website,
            emails: email,
            rating: rating ? String(rating) : '',
            notes: 'From Structured Data (Schema.org)',
            platform: 'generic',
            type: 'B2B/B2C',
            timestamp: Date.now(),
            hash
        };
    }

    // --- Strategy 2: vCard / hCard microformat ---
    extractFromVCards() {
        const leads = [];
        const vcards = document.querySelectorAll('.vcard, .h-card, [itemtype*="schema.org/LocalBusiness"], [itemtype*="schema.org/Organization"]');

        for (const vcard of vcards) {
            try {
                const nameEl = vcard.querySelector('.fn, .org, .p-name, .p-org, [itemprop="name"]');
                const name = nameEl?.innerText?.trim() || '';
                if (!name || name.length < 2) continue;

                const phoneEl = vcard.querySelector('.tel, .p-tel, [itemprop="telephone"], a[href^="tel:"]');
                let phone = phoneEl?.innerText?.trim() || '';
                if (!phone && phoneEl?.href) phone = phoneEl.href.replace('tel:', '');

                const emailEl = vcard.querySelector('.email, .u-email, [itemprop="email"], a[href^="mailto:"]');
                let email = emailEl?.innerText?.trim() || '';
                if (!email && emailEl?.href) email = emailEl.href.replace('mailto:', '');

                const addressEl = vcard.querySelector('.adr, .p-adr, [itemprop="address"]');
                const address = addressEl?.innerText?.trim() || '';

                const websiteEl = vcard.querySelector('.url, .u-url, [itemprop="url"], a[href^="http"]');
                const website = websiteEl?.href || '';

                const raw = `${name}${phone}${address}`;
                const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

                leads.push({
                    name,
                    category: '',
                    address,
                    phone,
                    website,
                    emails: email,
                    rating: '',
                    notes: 'From Microformat Data',
                    platform: 'generic',
                    type: 'B2B/B2C',
                    timestamp: Date.now(),
                    hash
                });

                this.highlightElement(vcard);
            } catch (e) { /* skip */ }
        }

        return leads;
    }

    // --- Strategy 3: Common card/listing patterns on directories ---
    extractFromCards() {
        const leads = [];

        // Common CSS patterns used by business directories worldwide
        // Also covers: dealer/partner/franchise/certification/association/exhibitor/sponsor directories
        const cardSelectors = [
            // Standard directory patterns
            '.listing-item', '.business-card', '.result-card', '.listing-card',
            '.company-card', '.biz-listing', '.search-result', '.directory-item',
            '.provider-card', '.profile-card', '.member-card', '.vendor-card',
            'li.result', 'div.result', '.card[data-business]', '.company-listing',

            // Dealer / Partner / Distributor locators
            '.dealer-card', '.dealer-item', '.partner-card', '.partner-item',
            '.distributor-card', '.reseller-card', '.installer-card',
            '[class*="dealer"]', '[class*="partner"]', '[class*="distributor"]',
            '[class*="reseller"]', '[class*="installer"]', '[class*="contractor"]',
            '.store-locator-result', '.location-card', '.locator-result',

            // Franchise directories
            '.franchise-card', '.franchise-item', '[class*="franchise"]',

            // Certification / Association / Chamber
            '.certified-company', '.member-listing', '.association-member',
            '[class*="certified"]', '[class*="member"]', '[class*="accredited"]',

            // Event exhibitor / sponsor lists
            '.exhibitor-card', '.exhibitor-item', '.sponsor-card', '.sponsor-item',
            '[class*="exhibitor"]', '[class*="sponsor"]', '.speaker-card',

            // VC portfolio / Accelerator / Incubator
            '.portfolio-company', '.portfolio-card', '.cohort-company',
            '[class*="portfolio"]', '[class*="startup"]', '[class*="alumni"]',

            // Customer / Case study / Showcase pages
            '.customer-card', '.client-card', '.case-study-card', '.showcase-item',
            '[class*="customer"]', '[class*="client"]', '[class*="case-study"]',
            '[class*="powered-by"]', '[class*="integration"]',

            // Marketplace seller directories
            '.seller-card', '.shop-card', '.merchant-card', '.store-card',
            '[class*="seller"]', '[class*="merchant"]', '[class*="shop-item"]',

            // Generic catch-all
            '[class*="listing"]', '[class*="business-card"]', '[class*="company"]',
            '[class*="provider"]', '[class*="vendor"]',
            'article', '.entry', '.item', '.card'
        ];

        const cards = document.querySelectorAll(cardSelectors.join(', '));

        for (const card of cards) {
            try {
                // Try to find a name (h2, h3, h4, strong, or link text)
                const nameEl = card.querySelector(
                    'h2, h3, h4, h5, .name, .title, .company-name, .business-name, ' +
                    '[class*="name"], [class*="title"], strong > a, h2 > a, h3 > a'
                );
                const name = nameEl?.innerText?.trim() || '';
                if (!name || name.length < 2 || name.length > 200) continue;

                // Phone
                const phoneEl = card.querySelector('a[href^="tel:"], .phone, [class*="phone"], [class*="tel"]');
                let phone = phoneEl?.innerText?.trim() || '';
                if (!phone && phoneEl?.href) phone = phoneEl.href.replace('tel:', '');

                // Email
                const emailEl = card.querySelector('a[href^="mailto:"], .email, [class*="email"]');
                let email = emailEl?.innerText?.trim() || '';
                if (!email && emailEl?.href) email = emailEl.href.replace('mailto:', '').split('?')[0];

                // Address
                const addrEl = card.querySelector('.address, [class*="address"], [class*="location"], .adr');
                const address = addrEl?.innerText?.trim() || '';

                // Website
                const siteEl = card.querySelector('a[href^="http"]:not([href*="facebook"]):not([href*="twitter"]):not([href*="instagram"])');
                const website = siteEl?.href || '';

                // Rating
                const ratingEl = card.querySelector('[class*="rating"], [class*="star"], .score');
                const rating = ratingEl?.innerText?.trim() || '';

                // Category
                const catEl = card.querySelector('[class*="category"], [class*="type"], .industry');
                const category = catEl?.innerText?.trim() || '';

                // Skip if we only got a name with no contact info
                if (!phone && !email && !website && !address) continue;

                const raw = `${name}${phone}${address}`;
                const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

                leads.push({
                    name,
                    category,
                    address,
                    phone,
                    website,
                    emails: email,
                    rating,
                    notes: '',
                    platform: 'generic',
                    type: 'B2B/B2C',
                    timestamp: Date.now(),
                    hash
                });

                this.highlightElement(card);
            } catch (e) { /* skip individual card errors */ }
        }

        return leads;
    }

    // --- Strategy 4: Full page scan for contacts ---
    scanPageForContacts() {
        try {
            // Gather page title as business name
            const name = document.querySelector('h1')?.innerText?.trim() ||
                         document.title?.split(/[|\-–—]/)[0]?.trim() || '';
            if (!name || name.length < 2) return null;

            // Collect all mailto: links
            const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
            const emails = new Set();
            mailtoLinks.forEach(a => {
                const email = a.href.replace('mailto:', '').split('?')[0];
                if (email && email.includes('@')) emails.add(email);
            });

            // Collect all tel: links
            const telLinks = document.querySelectorAll('a[href^="tel:"]');
            const phones = new Set();
            telLinks.forEach(a => {
                const phone = a.href.replace('tel:', '').trim();
                if (phone && phone.replace(/\D/g, '').length >= 7) phones.add(phone);
            });

            // Regex scan visible body text for emails
            const bodyText = document.body?.innerText || '';
            const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
            const foundEmails = bodyText.match(emailPattern) || [];
            foundEmails.forEach(e => emails.add(e));

            // Regex scan for phone numbers in text
            const phonePattern = /(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/g;
            const foundPhones = bodyText.match(phonePattern) || [];
            foundPhones
                .filter(p => p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15)
                .slice(0, 5)
                .forEach(p => phones.add(p.trim()));

            if (emails.size === 0 && phones.size === 0) return null;

            // Get address from meta or footer
            const addressMeta = document.querySelector('meta[name="geo.placename"]')?.content || '';
            const footerEl = document.querySelector('footer, .footer, #footer');
            const footerText = footerEl?.innerText?.trim()?.substring(0, 200) || '';

            const raw = `${name}${[...phones][0] || ''}${[...emails][0] || ''}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                category: document.querySelector('meta[name="description"]')?.content?.substring(0, 100) || '',
                address: addressMeta || '',
                phone: [...phones][0] || '',
                website: window.location.href,
                emails: [...emails].slice(0, 5).join(', '),
                rating: '',
                notes: phones.size > 1 ? `Other phones: ${[...phones].slice(1, 4).join(', ')}` : '',
                platform: 'generic',
                type: 'B2B/B2C',
                timestamp: Date.now(),
                hash
            };
        } catch (e) {
            console.error('[LeadEngine] Page scan error:', e);
            return null;
        }
    }

    highlightElement(el) {
        el.style.border = '2px solid #f59e0b';
        el.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';

        if (!el.querySelector('.lead-engine-badge')) {
            const badge = document.createElement('div');
            badge.className = 'lead-engine-badge';
            badge.innerText = '✓';
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#f59e0b;color:white;font-size:10px;padding:2px 6px;border-radius:3px;z-index:9999;';
            el.style.position = 'relative';
            el.appendChild(badge);
        }
    }

    async startAutoScroll() {
        if (this.isAutoScrolling) return;
        this.isAutoScrolling = true;
        console.log('[LeadEngine] Generic Auto Scroll Started');

        let lastHeight = 0;
        let sameHeightCount = 0;

        while (this.isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
            this.extractLeads();

            const newHeight = document.body.scrollHeight;
            if (newHeight === lastHeight) {
                sameHeightCount++;
                if (sameHeightCount >= 3) {
                    // Try clicking common "load more" / "next" buttons
                    const loadMore = document.querySelector(
                        'button[class*="more"], a[class*="more"], ' +
                        '[class*="load-more"], [class*="show-more"], ' +
                        'a[rel="next"], .next a, .pagination a.next, ' +
                        'a[aria-label="Next"], button:has(> span:contains("More"))'
                    );
                    if (loadMore) {
                        loadMore.click();
                        await new Promise(r => setTimeout(r, 3000));
                        sameHeightCount = 0;
                    } else {
                        console.log('[LeadEngine] No more content to load');
                        break;
                    }
                }
            } else {
                sameHeightCount = 0;
            }
            lastHeight = newHeight;
        }
        this.isAutoScrolling = false;
    }
}

const extractor = new GenericExtractor();
setTimeout(() => extractor.extractLeads(), 3000);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        extractor.startAutoScroll();
    } else if (event.data.type === 'STOP_AUTO_SCRAPE') {
        extractor.isAutoScrolling = false;
    }
});
