/**
 * Lead Extraction Engine - Simple IndexedDB Wrapper
 */

const DB_NAME = 'LeadEngineDB';
const DB_VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('leads')) {
                const store = db.createObjectStore('leads', { keyPath: 'hash' });
                store.createIndex('platform', 'platform', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveLead = async (lead) => {
    const db = await initDB();
    const tx = db.transaction('leads', 'readwrite');
    const store = tx.objectStore('leads');

    // Check if exists
    const existing = await new Promise((resolve) => {
        const req = store.get(lead.hash);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });

    if (!existing) {
        return new Promise((resolve, reject) => {
            const req = store.add(lead);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }
    return false; // Already exists (deduplicated)
};

export const getLeadCount = async () => {
    const db = await initDB();
    const tx = db.transaction('leads', 'readonly');
    const store = tx.objectStore('leads');
    return new Promise((resolve) => {
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
    });
};

export const getAllLeads = async () => {
    const db = await initDB();
    const tx = db.transaction('leads', 'readonly');
    const store = tx.objectStore('leads');
    return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });
};

export const setSetting = async (key, value) => {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    return new Promise((resolve) => {
        const req = store.put({ key, value });
        req.onsuccess = () => resolve(true);
    });
};

export const getSetting = async (key) => {
    const db = await initDB();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    return new Promise((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
    });
};
