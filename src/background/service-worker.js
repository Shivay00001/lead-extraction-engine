import { licenseManager } from './license-manager.js';
import { saveLead, getLeadCount, getAllLeads, clearLeads } from '../common/db.js';
import { cleanAddressField, formatPhoneNumber, extractPhoneNumbers } from '../common/intelligence.js';

/**
 * Lead Extraction Engine - Background Service Worker
 */

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Lead Extraction Engine Installed');
    await licenseManager.init();
});

/**
 * Sanitize a lead before saving:
 * - If phone is empty but address contains a phone number, extract it
 * - Format all phone numbers consistently
 */
const sanitizeLead = (lead) => {
    // If phone is empty, try to extract from address
    if (!lead.phone && lead.address) {
        const { cleanAddress, phones } = cleanAddressField(lead.address);
        if (phones.length > 0) {
            lead.phone = phones[0];
            lead.address = cleanAddress;
        }
    }

    // If phone exists but is not formatted, format it
    if (lead.phone) {
        lead.phone = formatPhoneNumber(lead.phone);
    }

    // Also check category field for phone numbers (Google Maps sometimes puts them there)
    if (!lead.phone && lead.category) {
        const catPhones = extractPhoneNumbers(lead.category);
        if (catPhones.length > 0) {
            lead.phone = formatPhoneNumber(catPhones[0]);
        }
    }

    return lead;
};

// Handle messages from Popup and Content Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            switch (message.type) {
                case 'VALIDATE_LICENSE':
                    const validationResult = await licenseManager.validateLicense(message.key);
                    sendResponse(validationResult);
                    break;

                case 'GET_PLAN_INFO':
                    await licenseManager.init();
                    sendResponse(licenseManager.getPlanInfo());
                    break;

                case 'CHECK_EXTRACTION_PERMISSION':
                    await licenseManager.init();
                    const permission = licenseManager.canExtract(message.platform);
                    sendResponse(permission);
                    break;

                case 'SAVE_LEADS':
                    const leads = message.leads;
                    let savedCount = 0;
                    for (const lead of leads) {
                        // Check limit before each save
                        const canStore = licenseManager.canExtract(lead.platform);
                        if (!canStore.allowed) {
                            sendResponse({ success: false, reason: canStore.reason, saved: savedCount });
                            return;
                        }

                        // Sanitize phone/address before saving
                        const cleanedLead = sanitizeLead(lead);
                        const saved = await saveLead(cleanedLead);
                        if (saved) {
                            await licenseManager.incrementUsage();
                            savedCount++;
                        }
                    }
                    sendResponse({ success: true, saved: savedCount });
                    break;

                case 'GET_ALL_LEADS':
                    const allLeads = await getAllLeads();
                    sendResponse({ leads: allLeads });
                    break;

                case 'GET_LEAD_COUNT':
                    const count = await getLeadCount();
                    sendResponse({ count });
                    break;

                case 'CLEAR_LEADS':
                    await clearLeads();
                    // Reset usage count in license manager
                    licenseManager.usageCount = 0;
                    await chrome.storage.local.set({ usageCount: 0 });
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Background Error:', error);
            sendResponse({ error: error.message });
        }
    })();
    return true; // Keep channel open for async response
});
