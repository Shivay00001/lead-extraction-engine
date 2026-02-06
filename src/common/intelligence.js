/**
 * Lead Extraction Engine - Email Intelligence Utility
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
