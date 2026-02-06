/**
 * Lead Extraction Engine - Content Injector
 * Detects current platform and runs extractor directly
 */

const PLATFORMS = [
    // PRIMARY
    { name: 'google_maps', pattern: /google\..*\/maps/ },
    { name: 'google_search', pattern: /google\..*\/search/ },
    { name: 'justdial', pattern: /justdial\.com/ },
    { name: 'sulekha', pattern: /sulekha\.com/ },

    // SECONDARY
    { name: 'indiamart', pattern: /indiamart\.com/ },
    { name: 'bing_maps', pattern: /bing\.com\/maps/ },
    { name: 'apple_maps', pattern: /maps\.apple\.com/ },
    { name: 'yelp', pattern: /yelp\.com/ },
    { name: 'yellow_pages', pattern: /yellowpages\.(com|in|co\.uk)/ },

    // SIGNAL-BASED
    { name: 'youtube', pattern: /youtube\.com\/(c\/|channel\/|@).*\/about/ },
    { name: 'instagram', pattern: /instagram\.com\/[^\/]+\/?$/ },
    { name: 'twitter', pattern: /(twitter\.com|x\.com)\/[^\/]+\/?$/ },
    { name: 'facebook', pattern: /facebook\.com\/[^\/]+\/(about|info)/ },

    // INDIRECT B2B
    { name: 'naukri', pattern: /naukri\.com/ },
    { name: 'indeed', pattern: /indeed\.(com|co\.in)/ },
    { name: 'apna', pattern: /apna\.co/ }
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

// Generic extractor selectors per platform
const SELECTORS = {
    google_maps: {
        items: 'div[role="article"], .Nv2PK',
        name: '.fontHeadlineSmall, .qBF1Pd',
        category: 'button[jsaction*="category"], .W4Efsd:nth-child(1)',
        address: 'button[jsaction*="address"], .W4Efsd:nth-child(2)',
        phone: 'button[jsaction*="phone"]',
        website: 'a[data-item-id="authority"]',
        rating: 'span[aria-label*="rating"], .MW4etd'
    },
    google_search: {
        items: '.g, .v7W49e > div',
        name: 'h3',
        website: 'a',
        snippet: '.VwiC3b, .MUFisb'
    },
    justdial: {
        items: '.cntanr, .result-card, .store-details',
        name: '.lng_cont_name, .jcn, .store-name',
        category: '.cont_fl_no',
        address: '.cont_fl_addr, .address-info',
        phone: '.contact-info, a[href^="tel:"]',
        rating: '.green-box, .rating'
    },
    indiamart: {
        items: '.m-card, .lst_cl, .product-card',
        name: '.company-name, .nme, .companyname',
        address: '.cloc, .location',
        notes: '.prc, .price'
    }
};

const extractFromElement = (item, selectors) => {
    try {
        const getText = (sel) => item.querySelector(sel)?.innerText?.trim() || '';
        const getAttr = (sel, attr) => item.querySelector(sel)?.[attr] || '';

        const name = getText(selectors.name);
        if (!name) return null;

        const lead = {
            name,
            category: selectors.category ? getText(selectors.category) : '',
            address: selectors.address ? getText(selectors.address) : '',
            phone: selectors.phone ? getText(selectors.phone) : '',
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
    const selectors = SELECTORS[currentPlatform];
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

const startAutoScroll = () => {
    if (isAutoScrolling) return;
    isAutoScrolling = true;
    console.log('[LeadEngine] Auto-scroll started');

    const scroll = async () => {
        while (isAutoScrolling) {
            window.scrollTo(0, document.body.scrollHeight);
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
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
