import { guessEmails } from '../../common/intelligence.js';

console.log('[LeadEngine] Google Search Extractor Loaded');

class GoogleSearchExtractor {
    constructor() {
        this.extractedHashes = new Set();
    }

    async extractLeads() {
        const leads = [];
        // Extract from SERP results (People also ask, Business listings, regular links)
        const items = document.querySelectorAll('.g, .v7W49e > div');

        for (const item of items) {
            const lead = this.parseItem(item);
            if (lead && !this.extractedHashes.has(lead.hash)) {
                leads.push(lead);
                this.extractedHashes.add(lead.hash);
                this.highlightElement(item);
            }
        }

        if (leads.length > 0) {
            chrome.runtime.sendMessage({ type: 'SAVE_LEADS', leads });
        }
    }

    parseItem(item) {
        try {
            const name = item.querySelector('h3')?.innerText || '';
            const website = item.querySelector('a')?.href || '';
            const snippet = item.querySelector('.VwiC3b, .MUFisb')?.innerText || '';

            if (!name || !website) return null;

            // Email extraction from snippet or guess
            const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            let email = emailMatch ? emailMatch[0] : '';

            if (!email && website) {
                const guessed = guessEmails(name, website);
                if (guessed.length > 0) email = `Guessed: ${guessed[0]}`;
            }

            // Phone extraction attempt
            const phoneMatch = snippet.match(/(\+?\d{1,4}[\s-])?(\(?\d{3}\)?[\s-])?\d{3}[\s-]\d{4}/);
            const phone = phoneMatch ? phoneMatch[0] : '';

            const raw = `${name}${website}`;
            const hash = btoa(unescape(encodeURIComponent(raw))).substring(0, 32);

            return {
                name,
                website,
                email,
                phone,
                snippet,
                platform: 'google_search',
                timestamp: Date.now(),
                hash,
                type: email ? 'B2B/B2C' : 'Signal'
            };
        } catch (e) {
            return null;
        }
    }

    highlightElement(el) {
        el.style.borderLeft = '4px solid #4285f4';
        el.style.backgroundColor = 'rgba(66, 133, 244, 0.05)';
    }
}

const extractor = new GoogleSearchExtractor();
setTimeout(() => extractor.extractLeads(), 1500);

window.addEventListener('message', (event) => {
    if (event.data.type === 'START_AUTO_SCRAPE') {
        const next = document.getElementById('pnnext');
        if (next) next.click();
    }
});
