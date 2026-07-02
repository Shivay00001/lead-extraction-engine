/**
 * Lead Extraction Engine - Content Injector
 * Detects current platform and runs extractor directly.
 * Supports 200+ platforms with a generic fallback for any unknown site.
 */

const PLATFORMS = [
    // ═══════════════════════════════════════════════
    // PRIMARY — Google, Maps, Search
    // ═══════════════════════════════════════════════
    { name: 'google_maps', pattern: /google\..*\/maps/ },
    { name: 'google_search', pattern: /google\..*\/search/ },

    // ═══════════════════════════════════════════════
    // INDIA DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'justdial', pattern: /justdial\.com/ },
    { name: 'sulekha', pattern: /sulekha\.com/ },
    { name: 'indiamart', pattern: /indiamart\.com/ },
    { name: 'tradeindia', pattern: /tradeindia\.com/ },
    { name: 'exportersindia', pattern: /exportersindia\.com/ },
    { name: 'generic', pattern: /msmedatabank\.in|udyamregistration\.gov\.in/ },   // MSME Directory
    { name: 'generic', pattern: /gem\.gov\.in/ },                                   // GeM
    { name: 'generic', pattern: /mca\.gov\.in/ },                                   // MCA
    { name: 'generic', pattern: /startupindia\.gov\.in/ },                          // Startup India
    { name: 'generic', pattern: /investindia\.gov\.in/ },                           // Invest India

    // ═══════════════════════════════════════════════
    // MAJOR B2B LEAD DATABASES
    // ═══════════════════════════════════════════════
    { name: 'linkedin', pattern: /linkedin\.com/ },
    { name: 'b2b_database', pattern: /apollo\.io/ },
    { name: 'b2b_database', pattern: /zoominfo\.com/ },
    { name: 'b2b_database', pattern: /lusha\.com/ },
    { name: 'b2b_database', pattern: /cognism\.com/ },
    { name: 'b2b_database', pattern: /rocketreach\.co/ },
    { name: 'b2b_database', pattern: /uplead\.com/ },
    { name: 'b2b_database', pattern: /seamless\.ai/ },
    { name: 'b2b_database', pattern: /lead411\.com/ },
    { name: 'b2b_database', pattern: /salesintel\.io/ },
    { name: 'b2b_database', pattern: /kaspr\.io/ },
    { name: 'b2b_database', pattern: /adapt\.io/ },
    { name: 'b2b_database', pattern: /contactout\.com/ },
    { name: 'b2b_database', pattern: /clearbit\.com/ },
    { name: 'b2b_database', pattern: /fullcontact\.com/ },
    { name: 'b2b_database', pattern: /peopledatalabs\.com/ },
    { name: 'b2b_database', pattern: /leadiq\.com/ },
    { name: 'b2b_database', pattern: /prospeo\.io/ },
    { name: 'b2b_database', pattern: /skrapp\.io/ },
    { name: 'b2b_database', pattern: /getprospect\.com/ },
    { name: 'b2b_database', pattern: /swordfish\.ai/ },
    { name: 'b2b_database', pattern: /targetron\.com/ },
    { name: 'b2b_database', pattern: /tomba\.io/ },
    { name: 'b2b_database', pattern: /anymailfinder\.com/ },
    { name: 'b2b_database', pattern: /findthatlead\.com/ },
    { name: 'b2b_database', pattern: /leadgibbon\.com/ },

    // ═══════════════════════════════════════════════
    // EMAIL FINDERS & VERIFIERS
    // ═══════════════════════════════════════════════
    { name: 'b2b_database', pattern: /hunter\.io/ },
    { name: 'b2b_database', pattern: /snov\.io/ },
    { name: 'b2b_database', pattern: /voilanorbert\.com/ },
    { name: 'b2b_database', pattern: /skymem\.info/ },

    // ═══════════════════════════════════════════════
    // COMPANY DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'yelp', pattern: /yelp\.(com|co\.uk|de|fr|it|es|ca|com\.au)/ },
    { name: 'yellow_pages', pattern: /yellowpages\.(com|in|co\.uk|ca|com\.au|co\.za|co\.nz|sg|my|ph|hk)/ },
    { name: 'yellow_pages', pattern: /pagesjaunes\.fr/ },
    { name: 'yellow_pages', pattern: /gelbeseiten\.de/ },
    { name: 'yellow_pages', pattern: /paginegialle\.it/ },
    { name: 'yellow_pages', pattern: /paginasamarillas\.es/ },
    { name: 'yellow_pages', pattern: /yell\.com/ },
    { name: 'directory', pattern: /bbb\.org/ },                     // Better Business Bureau
    { name: 'directory', pattern: /manta\.com/ },
    { name: 'directory', pattern: /hotfrog\.(com|co\.uk|com\.au|de)/ },
    { name: 'directory', pattern: /brownbook\.net/ },
    { name: 'directory', pattern: /cylex\.(com|de|fr|co\.uk|us)/ },
    { name: 'directory', pattern: /kompass\.com/ },
    { name: 'directory', pattern: /europages\.com/ },
    { name: 'directory', pattern: /thomasnet\.com/ },
    { name: 'directory', pattern: /industrynet\.com/ },
    { name: 'directory', pattern: /macraes\.com/ },                  // MacRAE'S Blue Book
    { name: 'directory', pattern: /merchantcircle\.com/ },
    { name: 'directory', pattern: /alignable\.com/ },
    { name: 'directory', pattern: /foursquare\.com/ },
    { name: 'directory', pattern: /dnb\.com/ },                      // Dun & Bradstreet
    { name: 'directory', pattern: /dataaxle\.com/ },
    { name: 'directory', pattern: /globaldatabase\.com/ },
    { name: 'directory', pattern: /owler\.com/ },
    { name: 'directory', pattern: /trustpilot\.com/ },
    { name: 'bing_maps', pattern: /bing\.com\/maps/ },
    { name: 'apple_maps', pattern: /maps\.apple\.com/ },

    // ═══════════════════════════════════════════════
    // REAL ESTATE
    // ═══════════════════════════════════════════════
    { name: 'zillow', pattern: /zillow\.com/ },
    { name: 'real_estate', pattern: /realtor\.com/ },
    { name: 'real_estate', pattern: /loopnet\.com/ },
    { name: 'real_estate', pattern: /crexi\.com/ },
    { name: 'real_estate', pattern: /redfin\.com/ },
    { name: 'real_estate', pattern: /trulia\.com/ },

    // ═══════════════════════════════════════════════
    // HEALTHCARE
    // ═══════════════════════════════════════════════
    { name: 'healthcare', pattern: /healthgrades\.com/ },
    { name: 'healthcare', pattern: /vitals\.com/ },
    { name: 'healthcare', pattern: /webmd\.com\/.*doctor/ },
    { name: 'healthcare', pattern: /zocdoc\.com/ },

    // ═══════════════════════════════════════════════
    // LEGAL
    // ═══════════════════════════════════════════════
    { name: 'legal', pattern: /avvo\.com/ },
    { name: 'legal', pattern: /findlaw\.com/ },
    { name: 'legal', pattern: /martindale\.com/ },

    // ═══════════════════════════════════════════════
    // HOME SERVICES
    // ═══════════════════════════════════════════════
    { name: 'home_services', pattern: /angi\.com|angieslist\.com/ },
    { name: 'home_services', pattern: /thumbtack\.com/ },
    { name: 'home_services', pattern: /houzz\.com/ },
    { name: 'home_services', pattern: /homeadvisor\.com/ },

    // ═══════════════════════════════════════════════
    // HOSPITALITY & RESTAURANTS
    // ═══════════════════════════════════════════════
    { name: 'hospitality', pattern: /tripadvisor\.(com|co\.uk|in|de|fr)/ },
    { name: 'hospitality', pattern: /opentable\.com/ },
    { name: 'hospitality', pattern: /resy\.com/ },
    { name: 'hospitality', pattern: /zomato\.com/ },
    { name: 'hospitality', pattern: /booking\.com/ },
    { name: 'hospitality', pattern: /hotels\.com/ },
    { name: 'hospitality', pattern: /expedia\.(com|co\.in)/ },

    // ═══════════════════════════════════════════════
    // MANUFACTURING & B2B MARKETPLACES
    // ═══════════════════════════════════════════════
    { name: 'manufacturing', pattern: /alibaba\.com/ },
    { name: 'manufacturing', pattern: /aliexpress\.com/ },
    { name: 'manufacturing', pattern: /made-in-china\.com/ },
    { name: 'manufacturing', pattern: /globalsources\.com/ },
    { name: 'manufacturing', pattern: /ec21\.com/ },
    { name: 'manufacturing', pattern: /ecplaza\.net/ },
    { name: 'manufacturing', pattern: /hktdc\.com/ },
    { name: 'manufacturing', pattern: /go4worldbusiness\.com/ },
    { name: 'manufacturing', pattern: /eworldtrade\.com/ },
    { name: 'manufacturing', pattern: /dhgate\.com/ },
    { name: 'manufacturing', pattern: /tradekey\.com/ },
    { name: 'manufacturing', pattern: /ecvv\.com/ },
    { name: 'manufacturing', pattern: /globalspec\.com/ },
    { name: 'manufacturing', pattern: /exporthub\.com/ },

    // ═══════════════════════════════════════════════
    // STARTUP & INVESTMENT DATABASES
    // ═══════════════════════════════════════════════
    { name: 'startup_db', pattern: /crunchbase\.com/ },
    { name: 'startup_db', pattern: /wellfound\.com|angel\.co/ },
    { name: 'startup_db', pattern: /dealroom\.co/ },
    { name: 'startup_db', pattern: /tracxn\.com/ },
    { name: 'startup_db', pattern: /cbinsights\.com/ },
    { name: 'startup_db', pattern: /pitchbook\.com/ },
    { name: 'startup_db', pattern: /f6s\.com/ },
    { name: 'startup_db', pattern: /betalist\.com/ },
    { name: 'startup_db', pattern: /producthunt\.com/ },
    { name: 'startup_db', pattern: /launchingnext\.com/ },
    { name: 'startup_db', pattern: /startupblink\.com/ },
    { name: 'startup_db', pattern: /startus-insights\.com/ },

    // ═══════════════════════════════════════════════
    // AGENCY DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'agency', pattern: /clutch\.co/ },
    { name: 'agency', pattern: /goodfirms\.co/ },
    { name: 'agency', pattern: /designrush\.com/ },
    { name: 'agency', pattern: /techbehemoths\.com/ },
    { name: 'agency', pattern: /topdevelopers\.co/ },
    { name: 'agency', pattern: /agencyspotter\.com/ },
    { name: 'agency', pattern: /sortlist\.(com|co)/ },

    // ═══════════════════════════════════════════════
    // SOFTWARE / SAAS DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'software_dir', pattern: /g2\.com/ },
    { name: 'software_dir', pattern: /capterra\.com/ },
    { name: 'software_dir', pattern: /getapp\.com/ },
    { name: 'software_dir', pattern: /trustradius\.com/ },
    { name: 'software_dir', pattern: /alternativeto\.net/ },
    { name: 'software_dir', pattern: /sourceforge\.net/ },

    // ═══════════════════════════════════════════════
    // AI COMPANY DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'software_dir', pattern: /futurepedia\.io/ },
    { name: 'software_dir', pattern: /theresanaiforthat\.com/ },

    // ═══════════════════════════════════════════════
    // E-COMMERCE & STORE DISCOVERY
    // ═══════════════════════════════════════════════
    { name: 'ecommerce', pattern: /shopify\.com/ },
    { name: 'ecommerce', pattern: /etsy\.com/ },
    { name: 'ecommerce', pattern: /amazon\.(com|co\.uk|de|in|co\.jp|fr|it|es|ca|com\.au)/ },
    { name: 'ecommerce', pattern: /ebay\.(com|co\.uk|de|fr)/ },
    { name: 'ecommerce', pattern: /faire\.com/ },
    { name: 'ecommerce', pattern: /storeleads\.app/ },
    { name: 'ecommerce', pattern: /myip\.ms/ },

    // ═══════════════════════════════════════════════
    // TECHNOLOGY INTELLIGENCE
    // ═══════════════════════════════════════════════
    { name: 'tech_intel', pattern: /builtwith\.com/ },
    { name: 'tech_intel', pattern: /wappalyzer\.com/ },
    { name: 'tech_intel', pattern: /similarweb\.com/ },
    { name: 'tech_intel', pattern: /semrush\.com/ },
    { name: 'tech_intel', pattern: /ahrefs\.com/ },
    { name: 'tech_intel', pattern: /netcraft\.com/ },
    { name: 'tech_intel', pattern: /publicwww\.com/ },
    { name: 'tech_intel', pattern: /securitytrails\.com/ },
    { name: 'tech_intel', pattern: /viewdns\.info/ },
    { name: 'tech_intel', pattern: /dnslytics\.com/ },

    // ═══════════════════════════════════════════════
    // FREELANCERS & TALENT
    // ═══════════════════════════════════════════════
    { name: 'freelance', pattern: /upwork\.com/ },
    { name: 'freelance', pattern: /fiverr\.com/ },
    { name: 'freelance', pattern: /toptal\.com/ },
    { name: 'freelance', pattern: /behance\.net/ },
    { name: 'freelance', pattern: /dribbble\.com/ },

    // ═══════════════════════════════════════════════
    // JOBS — FIND COMPANIES ACTIVELY SPENDING
    // ═══════════════════════════════════════════════
    { name: 'naukri', pattern: /naukri\.com/ },
    { name: 'indeed', pattern: /indeed\.(com|co\.in|co\.uk|ca|com\.au)/ },
    { name: 'jobs', pattern: /glassdoor\.(com|co\.in|co\.uk)/ },
    { name: 'jobs', pattern: /remoteok\.com/ },
    { name: 'jobs', pattern: /weworkremotely\.com/ },
    { name: 'apna', pattern: /apna\.co/ },

    // ═══════════════════════════════════════════════
    // GOVERNMENT & PUBLIC RECORDS
    // ═══════════════════════════════════════════════
    { name: 'government', pattern: /opencorporates\.com/ },
    { name: 'government', pattern: /sec\.gov\/cgi-bin\/browse-edgar/ },
    { name: 'government', pattern: /data\.gov/ },
    { name: 'government', pattern: /usaspending\.gov/ },
    { name: 'government', pattern: /sam\.gov/ },
    { name: 'government', pattern: /grants\.gov/ },
    { name: 'government', pattern: /ted\.europa\.eu/ },              // EU Tenders
    { name: 'government', pattern: /ungm\.org/ },

    // ═══════════════════════════════════════════════
    // EVENTS & CONFERENCES
    // ═══════════════════════════════════════════════
    { name: 'events', pattern: /eventbrite\.(com|co\.uk)/ },
    { name: 'events', pattern: /10times\.com/ },
    { name: 'events', pattern: /eventseye\.com/ },
    { name: 'events', pattern: /tsnn\.com/ },

    // ═══════════════════════════════════════════════
    // SOCIAL PLATFORMS
    // ═══════════════════════════════════════════════
    { name: 'youtube', pattern: /youtube\.com/ },
    { name: 'instagram', pattern: /instagram\.com/ },
    { name: 'twitter', pattern: /(twitter\.com|x\.com)/ },
    { name: 'facebook', pattern: /facebook\.com/ },
    { name: 'social', pattern: /reddit\.com/ },
    { name: 'social', pattern: /tiktok\.com/ },
    { name: 'social', pattern: /pinterest\.com/ },

    // ═══════════════════════════════════════════════
    // DEVELOPER ECOSYSTEMS
    // ═══════════════════════════════════════════════
    { name: 'developer', pattern: /github\.com/ },
    { name: 'developer', pattern: /gitlab\.com/ },
    { name: 'developer', pattern: /stackoverflow\.com/ },

    // ═══════════════════════════════════════════════
    // APP MARKETPLACES & CRM ECOSYSTEMS
    // ═══════════════════════════════════════════════
    { name: 'marketplace', pattern: /appexchange\.salesforce\.com/ },
    { name: 'marketplace', pattern: /ecosystem\.hubspot\.com/ },
    { name: 'marketplace', pattern: /marketplace\.zoho\.com/ },
    { name: 'marketplace', pattern: /marketplace\.atlassian\.com/ },
    { name: 'marketplace', pattern: /apps\.shopify\.com/ },
    { name: 'marketplace', pattern: /wordpress\.org\/plugins/ },

    // ═══════════════════════════════════════════════
    // FRANCHISE DIRECTORIES
    // ═══════════════════════════════════════════════
    { name: 'directory', pattern: /franchise\.org/ },
    { name: 'directory', pattern: /franchisedirect\.com/ },
    { name: 'directory', pattern: /franchisegator\.com/ },

    // ═══════════════════════════════════════════════
    // DATA PROVIDERS & PUBLIC DATASETS
    // ═══════════════════════════════════════════════
    { name: 'generic', pattern: /kaggle\.com/ },
    { name: 'generic', pattern: /data\.world/ },

    // ═══════════════════════════════════════════════
    // SEARCH ENGINES
    // ═══════════════════════════════════════════════
    { name: 'google_search', pattern: /bing\.com\/search/ },
    { name: 'google_search', pattern: /search\.brave\.com/ },
    { name: 'google_search', pattern: /duckduckgo\.com/ },
    { name: 'google_search', pattern: /yandex\.(com|ru)/ },

    // ═══════════════════════════════════════════════
    // GENERIC FALLBACK — matches any URL as last resort
    // Catches: chamber of commerce, association directories,
    // conference attendee pages, franchise dirs, certification
    // holders, procurement portals, dealer locators, etc.
    // ═══════════════════════════════════════════════
    { name: 'generic', pattern: /.*/ }
];

let currentPlatform = null;
let extractedHashes = new Set();
let isAutoScrolling = false;

const detectPlatform = () => {
    const url = window.location.href;
    for (const p of PLATFORMS) {
        if (p.pattern.test(url)) return p.name;
    }
    return null;
};

// ═══════════════════════════════════════════════════════════════
// SELECTORS — platform-specific and category-specific
// ═══════════════════════════════════════════════════════════════

const SELECTORS = {
    // ── Google Maps ──
    google_maps: {
        items: 'div[role="article"], .Nv2PK',
        name: '.fontHeadlineSmall, .qBF1Pd',
        category: 'button[jsaction*="category"], .W4Efsd:nth-child(1)',
        address: 'button[jsaction*="address"], .W4Efsd:nth-child(2)',
        phone: 'button[jsaction*="phone"]',
        website: 'a[data-item-id="authority"]',
        rating: 'span[aria-label*="rating"], .MW4etd'
    },

    // ── Google Search ──
    google_search: {
        items: '.g, .v7W49e > div',
        name: 'h3',
        website: 'a',
        snippet: '.VwiC3b, .MUFisb'
    },

    // ── India Directories ──
    justdial: {
        items: '.cntanr, .result-card, .store-details, .resultbox_info',
        name: '.lng_cont_name, .jcn, .store-name, .resultbox_title_anchor',
        category: '.cont_fl_no, .resultbox_subtitle',
        address: '.cont_fl_addr, .address-info, .resultbox_address',
        phone: '.contact-info, a[href^="tel:"], [data-href*="tel:"], [onclick*="tel:"], .resultbox_phone, .callcontent',
        rating: '.green-box, .rating, .resultbox_totalrate'
    },
    indiamart: {
        items: '.m-card, .lst_cl, .product-card, .card',
        name: '.company-name, .nme, .companyname, .lcname',
        address: '.cloc, .location, .lcity',
        phone: 'a[href^="tel:"], .phn, .cpn, .pns_h, .boPN, [class*="mobile"], [class*="phone"]',
        notes: '.prc, .price'
    },
    tradeindia: {
        items: '.product-card, .company-card, .srp-card',
        name: '.company-name, h3 a, .co-name',
        address: '.location, .address',
        phone: 'a[href^="tel:"], .phone',
        category: '.product-name, .category'
    },
    exportersindia: {
        items: '.listing-card, .product-card',
        name: '.company-name, h3 a',
        address: '.location, .address',
        phone: 'a[href^="tel:"]'
    },

    // ── LinkedIn ──
    linkedin: {
        items: '.reusable-search__result-container, .entity-result, li.reusable-search__result-container, .artdeco-list__item',
        name: '.entity-result__title-text a span[aria-hidden="true"], .entity-result__title-text .t-16, .app-aware-link span[dir="ltr"]',
        category: '.entity-result__primary-subtitle, .entity-result__summary, .subline-level-1',
        address: '.entity-result__secondary-subtitle, .subline-level-2'
    },

    // ── B2B Databases (generic for most SaaS lead platforms) ──
    b2b_database: {
        items: 'tr[data-row], .person-card, .contact-card, .result-row, [class*="person"], [class*="contact"], tbody tr, .list-item, .search-result',
        name: '[class*="name"], .person-name, .contact-name, td:first-child a, h3 a, h4 a',
        category: '[class*="title"], [class*="role"], .job-title, td:nth-child(2)',
        address: '[class*="location"], [class*="company"], td:nth-child(3)',
        phone: 'a[href^="tel:"], [class*="phone"]',
        website: 'a[href^="http"]'
    },

    // ── Yelp ──
    yelp: {
        items: '.container__09f24__FeTO6, .arrange-unit, [class*="searchResult"], li[class*="border"]',
        name: 'a[class*="business-name"], h3 a, .css-19v1rkv',
        category: '.css-11bijt4, .priceCategory',
        address: '.css-e81eai, .secondaryAttributes address',
        phone: '.css-1p9ibgf, a[href^="tel:"]',
        rating: '[aria-label*="star rating"], .i-stars',
        website: 'a[href*="/biz_redir"]'
    },

    // ── Yellow Pages (all variants worldwide) ──
    yellow_pages: {
        items: '.listing, .result, .search-result, .business-card, .organic, .v-card, .info, .search-results .srp-listing',
        name: '.business-name a, .n a, h3 a, h2 a, .listing-name, .biz-name, .dockable .business-name',
        phone: '.phones, .phone, a[href^="tel:"], .primary-phone, .phone-number',
        address: '.adr, .address, .street-address, .locality, .listing-address',
        category: '.categories a, .category, .tag, .listing-cat',
        website: 'a.track-visit-website, a[class*="website"], a[data-analytics*="website"]',
        rating: '.result-rating, .rating, [class*="star"]'
    },

    // ── Zillow ──
    zillow: {
        items: '.ldb-agent-card, [data-test="agent-card"], .agent-info-card, .professional-card, .agent-card',
        name: '.ldb-agent-card-name, [data-test="agent-name"], .agent-name, h3, h4',
        phone: '.ldb-agent-card-phone, [data-test="agent-phone"], .agent-phone, a[href^="tel:"]',
        rating: '.ldb-agent-card-review-count, [data-test="agent-rating"], .agent-rating',
        category: '.ldb-agent-card-brokerage, .agent-brokerage, .brokerage-name',
        address: '.ldb-agent-card-location, .agent-location'
    },

    // ── Real Estate (Realtor, LoopNet, Crexi) ──
    real_estate: {
        items: '.agent-list-card, .agent-card, .broker-card, .property-card, [data-testid*="agent"], .listing-card',
        name: '.agent-name, .broker-name, h3 a, [data-testid="agent-name"]',
        phone: 'a[href^="tel:"], .agent-phone, [data-testid="agent-phone"]',
        category: '.agent-group, .office-name, .brokerage',
        address: '.agent-address, .office-address, .location',
        website: 'a[href^="http"]',
        rating: '.agent-rating, [class*="rating"]'
    },

    // ── Healthcare ──
    healthcare: {
        items: '.provider-card, .doctor-card, .profile-card, [data-testid*="provider"], .results-card',
        name: '.provider-name, .doctor-name, h3 a, [data-testid="provider-name"]',
        category: '.specialty, .provider-specialty, [data-testid="specialty"]',
        address: '.provider-address, .practice-location, [data-testid="address"]',
        phone: 'a[href^="tel:"], .provider-phone, [data-testid="phone"]',
        rating: '.provider-rating, [class*="rating"], [data-testid="rating"]'
    },

    // ── Legal ──
    legal: {
        items: '.lawyer-card, .attorney-card, .profile-blurb, [data-testid*="attorney"], .search-result',
        name: '.lawyer-name, .attorney-name, h3 a, [data-testid="attorney-name"]',
        category: '.practice-area, .specialty, [data-testid="practice-area"]',
        address: '.lawyer-address, .location, [data-testid="location"]',
        phone: 'a[href^="tel:"], .lawyer-phone',
        rating: '[class*="rating"], [data-testid="rating"]'
    },

    // ── Home Services ──
    home_services: {
        items: '.provider-card, .pro-card, [data-testid*="pro"], .search-result-card',
        name: '.pro-name, .provider-name, h3 a, [data-testid="pro-name"]',
        category: '.pro-category, .service-type, [data-testid="category"]',
        address: '.pro-location, .service-area, [data-testid="location"]',
        phone: 'a[href^="tel:"], .pro-phone',
        rating: '[class*="rating"], .pro-rating, [data-testid="rating"]'
    },

    // ── Hospitality ──
    hospitality: {
        items: '.listing_title, .property-card, .restaurant-card, [data-testid*="property"], .search-result, .result-card',
        name: '.property-title, .listing-title, h3 a, [data-testid="property-name"], .restaurant-name',
        category: '.property-type, .cuisine-type, [data-testid="type"]',
        address: '.property-address, .listing-location, [data-testid="address"]',
        phone: 'a[href^="tel:"], [data-testid="phone"]',
        rating: '[class*="rating"], .review-score, [data-testid="rating"]',
        website: 'a[href^="http"]'
    },

    // ── Manufacturing / B2B Marketplaces ──
    manufacturing: {
        items: '.product-card, .company-card, .supplier-card, .item-card, [data-role="product"]',
        name: '.company-name, .supplier-name, h3 a, .product-title a',
        category: '.product-type, .main-product, .category',
        address: '.company-location, .supplier-location, .country',
        phone: 'a[href^="tel:"], .contact-phone',
        website: 'a.company-url, a[href^="http"]'
    },

    // ── Startup Databases ──
    startup_db: {
        items: '.component--list-row, [class*="search-result"], .company-card, .startup-card, [data-entity-type], .result-card, li.results',
        name: '.component--field-formatter a, .entity-name, .company-name, h3 a, [data-testid="entity-name"]',
        category: '.component--field-formatter:nth-child(2), .industry, .category, [data-testid="industry"]',
        address: '.location-card, .location, [data-testid="location"]',
        website: 'a[href^="http"]',
        notes: '.description, .summary, .tagline'
    },

    // ── Agency Directories ──
    agency: {
        items: '.provider-card, .provider, .company-card, [data-testid*="provider"], .result-card, .profile-card',
        name: '.company-name, .provider-name, h3 a, [data-testid="company-name"]',
        category: '.service-line, .focus-area, [data-testid="service"]',
        address: '.company-location, .hq-location, [data-testid="location"]',
        phone: 'a[href^="tel:"]',
        rating: '[class*="rating"], .reviews-count, [data-testid="rating"]',
        website: 'a.website-link, a[href^="http"]'
    },

    // ── Software Directories ──
    software_dir: {
        items: '.product-listing, .product-card, [data-testid*="product"], .search-result, .card',
        name: '.product-name, h3 a, [data-testid="product-name"]',
        category: '.product-category, .category-badge, [data-testid="category"]',
        rating: '[class*="rating"], .star-rating, [data-testid="rating"]',
        website: 'a[href^="http"]',
        notes: '.product-description, .short-description'
    },

    // ── E-commerce ──
    ecommerce: {
        items: '.s-result-item, .listing-card, .shop-card, [data-testid*="result"], .search-result',
        name: '.s-line-clamp-2, h3 a, .shop-name, [data-testid="product-title"]',
        category: '.a-color-secondary, .shop-category',
        address: '.a-row .a-size-base, .location',
        website: 'a[href^="http"]',
        rating: '[class*="rating"], .a-icon-alt'
    },

    // ── Technology Intelligence ──
    tech_intel: {
        items: '.result-card, .site-card, .domain-card, [data-testid*="result"], .search-result, tr',
        name: '.domain-name, .site-name, h3 a, td:first-child a',
        category: '.tech-name, .category, td:nth-child(2)',
        website: 'a[href^="http"]',
        notes: '.description, .tech-details'
    },

    // ── Freelance Platforms ──
    freelance: {
        items: '.freelancer-card, .profile-card, [data-testid*="profile"], .search-result',
        name: '.freelancer-name, .profile-name, h3 a, [data-testid="name"]',
        category: '.freelancer-title, .headline, [data-testid="title"]',
        address: '.freelancer-location, .location, [data-testid="location"]',
        rating: '[class*="rating"], .job-success, [data-testid="rating"]',
        website: 'a[href^="http"]'
    },

    // ── Job Boards ──
    jobs: {
        items: '.job-listing, .jobCard, [data-testid*="job"], .result-card, .job_seen_beacon',
        name: '.company-name, .employer-name, [data-testid="company-name"]',
        category: '.job-title, [data-testid="job-title"]',
        address: '.job-location, [data-testid="location"]',
        website: 'a[href^="http"]'
    },

    // ── Government / Public Records ──
    government: {
        items: '.entity-card, .result-card, .search-result, tr, .company-result',
        name: '.entity-name, .company-name, h3 a, td:first-child a',
        category: '.entity-type, .industry, td:nth-child(2)',
        address: '.entity-address, .location, td:nth-child(3)',
        website: 'a[href^="http"]'
    },

    // ── Events ──
    events: {
        items: '.event-card, .search-result, [data-testid*="event"], .eds-event-card',
        name: '.event-title, .eds-event-card__formatted-name--is-clamped, h3 a',
        category: '.event-category, .eds-text-bs, [data-testid="category"]',
        address: '.event-location, .card-text--truncated__one, [data-testid="location"]',
        website: 'a[href^="http"]'
    },

    // ── Social Platforms ──
    social: {
        items: '.search-result, [data-testid*="result"], .Post, article',
        name: 'h3, [data-testid="title"], .author-name',
        category: '.subtitle, [data-testid="subtitle"]',
        website: 'a[href^="http"]'
    },

    // ── Developer Ecosystems ──
    developer: {
        items: '.repo-list-item, [data-testid*="result"], .org-card, .project-card',
        name: '.repo-list-item h3, .org-name, h3 a',
        category: '.repo-language-color + span, .org-description',
        website: 'a[href^="http"]',
        notes: '.repo-list-item p, .description'
    },

    // ── App Marketplaces ──
    marketplace: {
        items: '.app-card, .listing-card, [data-testid*="app"], .search-result',
        name: '.app-name, .listing-title, h3 a',
        category: '.app-category, .listing-category',
        rating: '[class*="rating"], .star-rating',
        website: 'a[href^="http"]'
    },

    // ── Business Directories (generic catch for BBB, Manta, etc.) ──
    directory: {
        items: '.listing, .result, .search-result, .business-card, .organic, .v-card, .card, .info, article, .result-card, [class*="listing"]',
        name: '.business-name a, h3 a, h2 a, .listing-name, .biz-name, .company-name, [class*="name"] a',
        phone: '.phones, .phone, a[href^="tel:"], .primary-phone, [class*="phone"]',
        address: '.adr, .address, .street-address, .locality, [class*="address"]',
        category: '.categories a, .category, .tag, [class*="category"]',
        website: 'a[class*="website"], a[href^="http"]',
        rating: '.result-rating, .rating, [class*="star"], [class*="rating"]'
    },

    // ── Generic Fallback (works on ANY site) ──
    generic: {
        items: '.listing-item, .business-card, .result-card, .listing-card, .company-card, .search-result, .directory-item, .provider-card, .profile-card, article, .entry, .item, li.result, div.result, .card, tr, [class*="listing"], [class*="result"]',
        name: 'h2, h3, h4, h5, .name, .title, .company-name, .business-name, [class*="name"], [class*="title"], strong > a, h2 > a, h3 > a',
        phone: 'a[href^="tel:"], .phone, [class*="phone"], [class*="tel"]',
        address: '.address, [class*="address"], [class*="location"], .adr',
        website: 'a[href^="http"]',
        rating: '[class*="rating"], [class*="star"], .score',
        category: '[class*="category"], [class*="type"], .industry'
    }
};

const extractFromElement = (item, selectors) => {
    try {
        const getText = (sel) => item.querySelector(sel)?.innerText?.trim() || '';
        const getAttr = (sel, attr) => item.querySelector(sel)?.[attr] || '';

        const decodeJustdialPhone = (element) => {
            // Justdial classic icon font mapping
            const iconMap = {
                'icon-ji': '9', 'icon-lk': '8', 'icon-nm': '7', 'icon-po': '6',
                'icon-rq': '5', 'icon-ts': '4', 'icon-vu': '3', 'icon-xw': '2',
                'icon-yz': '1', 'icon-zy': '1', 'icon-acb': '0', 'icon-dc': '+',
                'icon-fe': '(', 'icon-hg': ')', 'icon-ba': '-'
            };
            const icons = element.querySelectorAll('[class*="icon-"]');
            let phone = '';
            icons.forEach(icon => {
                const cls = Array.from(icon.classList).find(c => c.startsWith('icon-'));
                if (cls && iconMap[cls]) phone += iconMap[cls];
            });
            return phone;
        };

        const getPhone = (sel) => {
            // 1. Try Justdial Icon Font Decoder First
            if (currentPlatform === 'justdial') {
                const jdPhone = decodeJustdialPhone(item);
                if (jdPhone && jdPhone.length >= 10) return jdPhone;
            }

            const els = item.querySelectorAll(sel);
            for (const el of els) {
                // 2. Check explicitly for tel: in href or data-href or onclick
                const html = el.outerHTML;
                const telMatch = html.match(/tel:([0-9+\s.-]+)/);
                if (telMatch) return telMatch[1].replace(/[^\d+]/g, '');

                // 3. Try standard innerText
                const text = el.innerText?.trim();
                if (text && !text.toLowerCase().includes('check') && !text.toLowerCase().includes('view')) {
                    const digits = text.replace(/\D/g, '');
                    // Valid phone number length anywhere in the world is 7-15
                    if (digits.length >= 7 && digits.length <= 15) {
                        return text;
                    }
                }
            }

            // 4. Aggressive Fallback: Scan entire item's raw HTML
            const html = item.innerHTML;
            
            // Indian standard
            const inMatch = html.match(/(?:\+91[-.\s]?)?[6-9]\d{9}/);
            if (inMatch) return inMatch[0];
            
            // US/Canada standard
            const usMatch = html.match(/(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}/);
            if (usMatch) return usMatch[0];
            
            // Global pattern
            const intlMatch = html.match(/(?:\+?\d{1,4}[\s.-]?\(?\d{1,5}\)?[\s.-]?\d{1,5}[\s.-]?\d{1,5}[\s.-]?\d{0,5})/);
            if (intlMatch) {
                const digits = intlMatch[0].replace(/\D/g, '');
                if (digits.length >= 7 && digits.length <= 15) return intlMatch[0];
            }

            return '';
        };

        const name = getText(selectors.name);
        if (!name) return null;

        const lead = {
            name,
            category: selectors.category ? getText(selectors.category) : '',
            address: selectors.address ? getText(selectors.address) : '',
            phone: selectors.phone ? getPhone(selectors.phone) : '',
            website: selectors.website ? getAttr(selectors.website, 'href') : '',
            rating: selectors.rating ? getText(selectors.rating) : '',
            notes: selectors.notes ? getText(selectors.notes) : '',
            platform: currentPlatform,
            type: 'B2B/B2C',
            timestamp: Date.now()
        };

        // Create hash for deduplication
        const raw = `${lead.name}${lead.phone}${lead.address}`;
        lead.hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

        return lead;
    } catch (e) {
        console.error('[LeadEngine] Parse error:', e);
        return null;
    }
};

const highlightElement = (el) => {
    el.style.border = '2px solid #00c853';
    el.style.backgroundColor = 'rgba(0, 200, 83, 0.1)';

    if (!el.querySelector('.lead-engine-badge')) {
        const badge = document.createElement('div');
        badge.className = 'lead-engine-badge';
        badge.innerText = '✓';
        badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#00c853;color:white;font-size:10px;padding:2px 6px;border-radius:3px;z-index:9999;';
        el.style.position = 'relative';
        el.appendChild(badge);
    }
};

const extractLeads = () => {
    const selectors = SELECTORS[currentPlatform] || SELECTORS['generic'];
    if (!selectors) {
        console.log('[LeadEngine] No selectors for platform:', currentPlatform);
        return;
    }

    const items = document.querySelectorAll(selectors.items);
    const leads = [];

    items.forEach(item => {
        const lead = extractFromElement(item, selectors);
        if (lead && !extractedHashes.has(lead.hash)) {
            leads.push(lead);
            extractedHashes.add(lead.hash);
            highlightElement(item);
        }
    });

    if (leads.length > 0) {
        console.log(`[LeadEngine] Extracted ${leads.length} new leads`);
        showToast(`Extracted ${leads.length} leads...`, 'info');

        chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads }, (response) => {
            if (response && response.success) {
                console.log(`[LeadEngine] Saved ${response.saved} leads`);
                if (response.saved > 0) {
                    showToast(`Saved ${response.saved} leads!`, 'success');
                }
            } else if (response && response.reason) {
                console.warn(`[LeadEngine] Save blocked: ${response.reason}`);
                showToast(`Limit reached or Plan locked`, 'error');
                showBanner(response.reason);
            }
        });
    }
};

const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const clickRevealButtons = () => {
    let clickCount = 0;
    // Look for generic reveal buttons
    const buttons = document.querySelectorAll('button, a, span, div.contact-btn, div.boPN');
    for (const btn of buttons) {
        if (btn.hasAttribute('data-lead-clicked')) continue;
        
        const text = (btn.innerText || '').toLowerCase();
        const classes = (btn.className || '').toLowerCase();
        
        // Match texts like 'view mobile', 'show number', etc. OR IndiaMART specific classes (.boPN)
        if (
            ((text.includes('view') || text.includes('show') || text.includes('click')) && 
            (text.includes('number') || text.includes('mobile') || text.includes('phone') || text.includes('contact'))) ||
            classes.includes('bopn') || classes.includes('view-number')
        ) {
            try {
                btn.click();
                btn.setAttribute('data-lead-clicked', 'true');
                clickCount++;
            } catch(e) {}
        }
    }
    if (clickCount > 0) {
        console.log(`[LeadEngine] Clicked ${clickCount} reveal buttons`);
    }
    return clickCount;
};

const startAutoScroll = () => {
    if (isAutoScrolling) return;
    isAutoScrolling = true;
    console.log('[LeadEngine] Auto-scroll started');

    const scroll = async () => {
        while (isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            
            // 1. Click reveal buttons (like IndiaMART's "View Mobile Number")
            clickRevealButtons();
            
            // 2. Wait for AJAX/Network requests to bring the real numbers
            await new Promise(r => setTimeout(r, 2500 + Math.random() * 1000));
            
            // 3. Now extract!
            extractLeads();
        }
    };
    scroll();
};

const stopAutoScroll = () => {
    isAutoScrolling = false;
    console.log('[LeadEngine] Auto-scroll stopped');
};

const showBanner = (reason) => {
    if (document.getElementById('lead-engine-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'lead-engine-banner';
    banner.innerHTML = `
        <div style="position:fixed;top:10px;right:10px;background:#1e293b;color:white;padding:12px 20px;border-radius:8px;z-index:999999;font-family:system-ui;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <strong>LeadEngine</strong>: ${reason === 'LIMIT_REACHED' ? 'Limit reached! Upgrade plan.' : 'Platform locked.'}
        </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 5000);
};

// Listen for messages from popup
window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') startAutoScroll();
    else if (event.data.type === 'STOP_AUTO_SCRAPE') stopAutoScroll();
    else if (event.data.type === 'MANUAL_EXTRACT') extractLeads();
});

// Initialize
const init = () => {
    currentPlatform = detectPlatform();
    if (!currentPlatform) {
        console.log('[LeadEngine] No supported platform detected');
        return;
    }

    console.log(`[LeadEngine] Detected platform: ${currentPlatform}`);

    chrome.runtime.sendMessage({ type: 'CHECK_EXTRACTION_PERMISSION', platform: currentPlatform }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn('[LeadEngine] Error:', chrome.runtime.lastError);
            return;
        }

        if (response && response.allowed) {
            console.log('[LeadEngine] Extraction allowed');
            setTimeout(extractLeads, 3000); // Initial extraction after page loads
        } else {
            console.warn('[LeadEngine] Extraction locked:', response?.reason);
            showBanner(response?.reason || 'PLATFORM_LOCKED');
        }
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
