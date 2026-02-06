/**
 * Lead Extraction Engine - License & Limit Manager
 */

export const PLANS = {
    FREE: {
        id: 'free',
        name: 'Free Trial',
        leadLimit: 50,
        platforms: ['*'],
        features: ['manual_scrape', 'auto_scrape'],
        export: true
    },
    STARTER: {
        id: 'starter',
        name: 'Starter',
        leadLimit: 500,
        platforms: ['*'],
        features: ['*'],
        export: true
    },
    PRO: {
        id: 'pro',
        name: 'Professional',
        leadLimit: 2000,
        platforms: ['*'],
        features: ['*'],
        export: true
    },
    AGENCY: {
        id: 'agency',
        name: 'Agency',
        leadLimit: 10000,
        platforms: ['*'],
        features: ['*'],
        export: true
    }
};

class LicenseManager {
    constructor() {
        this.currentLicense = null;
        this.currentPlan = PLANS.FREE;
        this.usageCount = 0;
    }

    async init() {
        const data = await chrome.storage.local.get(['licenseKey', 'cachedPlan', 'usageCount']);
        this.currentLicense = data.licenseKey || null;
        this.currentPlan = data.cachedPlan ? PLANS[data.cachedPlan.toUpperCase()] : PLANS.FREE;
        this.usageCount = data.usageCount || 0;
    }

    async validateLicense(key) {
        // PRODUCTION: This would call a real backend API
        // For now, implement a simple simulation
        console.log('Validating license:', key);

        // Simulation keys
        const mockKeys = {
            'STARTER-123': 'STARTER',
            'PRO-456': 'PRO',
            'AGENCY-789': 'AGENCY'
        };

        if (mockKeys[key]) {
            const planId = mockKeys[key];
            this.currentLicense = key;
            this.currentPlan = PLANS[planId];
            await chrome.storage.local.set({
                licenseKey: key,
                cachedPlan: planId
            });
            return { success: true, plan: this.currentPlan.name };
        }

        return { success: false, message: 'Invalid License Key' };
    }

    canExtract(platform) {
        // Enforce Lead Limit
        if (this.usageCount >= this.currentPlan.leadLimit) {
            console.warn('Lead limit reached for plan:', this.currentPlan.name);
            return { allowed: false, reason: 'LIMIT_REACHED' };
        }

        // Enforce Platform Access
        if (this.currentPlan.platforms[0] !== '*') {
            if (!this.currentPlan.platforms.includes(platform)) {
                return { allowed: false, reason: 'PLATFORM_LOCKED' };
            }
        }

        return { allowed: true };
    }

    async incrementUsage() {
        this.usageCount++;
        await chrome.storage.local.set({ usageCount: this.usageCount });
        return this.usageCount;
    }

    getPlanInfo() {
        return {
            planId: this.currentPlan.id,
            planName: this.currentPlan.name,
            limit: this.currentPlan.leadLimit,
            usage: this.usageCount,
            remaining: Math.max(0, this.currentPlan.leadLimit - this.usageCount)
        };
    }
}

export const licenseManager = new LicenseManager();
