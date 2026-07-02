/**
 * Lead Extraction Engine - Email & Phone Intelligence Utility
 */

export const guessEmails = (name, website) => {
    if (!website) return [];

    try {
        const domain = new URL(website).hostname.replace('www.', '');
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!domain || domain.includes('google.com')) return [];

        const commonPrefixes = ['info', 'sales', 'contact', 'admin', 'hello', 'support'];
        const guessed = commonPrefixes.map(p => `${p}@${domain}`);

        // Name-based guesses if name is short/simple
        if (cleanName.length > 2 && cleanName.length < 15) {
            guessed.push(`${cleanName}@${domain}`);
        }

        return guessed;
    } catch (e) {
        return [];
    }
};

export const verifyEmail = async (email) => {
    // PRODUCTION: Real email verification would happen here
    // For now, we return a simulated status
    return { email, verified: true, score: 0.8 };
};

/**
 * Extracts all phone numbers from a text string.
 * Supports international formats: +91 12345 67890, (800) 555-1234, 078200 33111, 1800 102 4647, etc.
 */
export const extractPhoneNumbers = (text) => {
    if (!text) return [];
    
    // Aggressive pattern to catch anything that looks like a phone number
    // Allows +, brackets, spaces, dots, dashes, and requires 7-15 digits total
    const phonePattern = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g;
    
    // A simpler global catch-all pattern for international numbers
    const globalPattern = /(?:[-+() ]*\d){7,15}/g;

    const candidates = [];
    
    const matches = text.match(globalPattern) || [];
    candidates.push(...matches);

    // Filter: only keep strings with 7 to 15 digits (real phone numbers)
    // and remove ones that look like dates or IDs
    return candidates
        .map(c => c.trim())
        .filter(c => {
            const digits = c.replace(/\D/g, '');
            // Must be between 7 and 15 digits
            if (digits.length < 7 || digits.length > 15) return false;
            // Reject if it looks like a date (e.g. 20230514)
            if (digits.length === 8 && (digits.startsWith('19') || digits.startsWith('20'))) return false;
            return true;
        });
};

/**
 * Formats a phone number into a consistent international-style format.
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Strip everything except digits and leading '+'
    let isPlus = phone.trim().startsWith('+');
    let digits = phone.replace(/\D/g, '');
    
    if (digits.length < 7 || digits.length > 15) return phone; // Return as-is if invalid length

    // --- India ---
    // 10 digits starting with 6-9
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    // 91 + 10 digits
    if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits[2])) {
        return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    // 0 + 10 digits
    if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits[1])) {
        return `+91 ${digits.slice(1, 6)} ${digits.slice(6)}`;
    }
    // Toll-free India (1800)
    if (digits.startsWith('1800') && digits.length >= 10 && digits.length <= 11) {
        return digits.replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3');
    }

    // --- US/Canada ---
    // 10 digits
    if (digits.length === 10 && /^[2-9]/.test(digits)) {
        return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    // 1 + 10 digits
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // --- UK ---
    // UK formats (e.g. 44 + 10 digits, or 0 + 10 digits)
    if (digits.length === 12 && digits.startsWith('44')) {
        return `+44 ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('07')) { // UK Mobile
        return `+44 ${digits.slice(1, 5)} ${digits.slice(5)}`;
    }

    // --- Generic International Formatting ---
    // If it has a country code (either it had a + originally, or it's longer than 10 digits)
    if (isPlus || digits.length > 10) {
        // Guess country code length (usually 1-3 digits)
        let ccLen = digits.length > 12 ? 3 : (digits.length > 11 ? 2 : 1);
        // Force UK/India check fallback
        if (digits.startsWith('91') || digits.startsWith('44')) ccLen = 2;
        
        const cc = digits.slice(0, ccLen);
        const rest = digits.slice(ccLen);
        
        // Format the rest nicely (e.g. split into groups of 3-4)
        if (rest.length === 10) {
            return `+${cc} ${rest.slice(0,5)} ${rest.slice(5)}`;
        } else if (rest.length === 9) {
            return `+${cc} ${rest.slice(0,4)} ${rest.slice(4)}`;
        } else if (rest.length === 8) {
            return `+${cc} ${rest.slice(0,4)} ${rest.slice(4)}`;
        } else {
            // Just add a space after CC
            return `+${cc} ${rest}`;
        }
    }

    // --- Local numbers (no country code detected) ---
    if (digits.length === 8) {
        return `${digits.slice(0,4)} ${digits.slice(4)}`;
    }
    if (digits.length === 9) {
        return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    }

    // Ultimate fallback: Just add dashes/spaces to make it readable
    return phone;
};

/**
 * Separates phone numbers from an address/text field.
 * Returns { cleanAddress, phones }
 */
export const cleanAddressField = (text) => {
    if (!text) return { cleanAddress: '', phones: [] };

    const phones = extractPhoneNumbers(text);
    let cleanAddress = text;
    for (const ph of phones) {
        cleanAddress = cleanAddress.replace(ph, '');
    }
    // Clean up leftover separators
    cleanAddress = cleanAddress
        .replace(/[·•|,]\s*$/g, '')
        .replace(/\s*[·•|]\s*$/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    return {
        cleanAddress,
        phones: phones.map(formatPhoneNumber)
    };
};

/**
 * Extracts emails found directly in text (from mailto: links, visible text, etc.)
 */
export const extractEmailsFromText = (text) => {
    if (!text) return [];
    const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailPattern) || [];
    return [...new Set(matches)]; // Deduplicate
};
