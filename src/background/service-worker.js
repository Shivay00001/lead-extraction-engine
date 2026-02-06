import { licenseManager } from './license-manager.js';
import { saveLead, getLeadCount, getAllLeads } from '../common/db.js';

/**
 * Lead Extraction Engine - Background Service Worker
 */

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Lead Extraction Engine Installed');
    await licenseManager.init();
});

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

                        const saved = await saveLead(lead);
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
