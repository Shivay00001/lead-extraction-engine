/**
 * Lead Extraction Engine - Popup Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
    updateUI();

    // Activate License
    document.getElementById('activate-btn').addEventListener('click', async () => {
        const key = document.getElementById('license-key').value.trim();
        const msgEl = document.getElementById('license-msg');

        if (!key) return;

        chrome.runtime.sendMessage({ type: 'VALIDATE_LICENSE', key }, (response) => {
            if (response && response.success) {
                msgEl.innerText = `Activated: ${response.plan}`;
                msgEl.className = 'msg success';
                updateUI();
            } else {
                msgEl.innerText = response ? response.message : 'Error';
                msgEl.className = 'msg error';
            }
        });
    });

    // Start Scraping
    document.getElementById('start-btn').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        window.postMessage({ type: 'START_AUTO_SCRAPE' }, '*');
                    }
                });
            }
        });
    });

    // Export CSV
    document.getElementById('export-csv').addEventListener('click', async () => {
        chrome.runtime.sendMessage({ type: 'GET_ALL_LEADS' }, (response) => {
            if (!response || !response.leads || response.leads.length === 0) {
                alert('No leads to export. Extract some leads first!');
                return;
            }

            const leads = response.leads;
            const headers = ['Name', 'Category', 'Phone', 'Website', 'Address', 'Emails', 'Platform', 'Type', 'Notes'];
            const csvRows = [headers.join(',')];

            for (const l of leads) {
                const values = [
                    `"${(l.name || '').replace(/"/g, '""')}"`,
                    `"${(l.category || '').replace(/"/g, '""')}"`,
                    `"${(l.phone || '').replace(/"/g, '""')}"`,
                    `"${(l.website || '').replace(/"/g, '""')}"`,
                    `"${(l.address || '').replace(/"/g, '""')}"`,
                    `"${(l.emails || '').replace(/"/g, '""')}"`,
                    `"${(l.platform || '').replace(/"/g, '""')}"`,
                    `"${(l.type || '').replace(/"/g, '""')}"`,
                    `"${(l.notes || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(values.join(','));
            }

            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Export JSON
    document.getElementById('export-json').addEventListener('click', async () => {
        chrome.runtime.sendMessage({ type: 'GET_ALL_LEADS' }, (response) => {
            if (!response || !response.leads || response.leads.length === 0) {
                alert('No leads to export. Extract some leads first!');
                return;
            }

            const blob = new Blob([JSON.stringify(response.leads, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads_export_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
});

async function updateUI() {
    chrome.runtime.sendMessage({ type: 'GET_PLAN_INFO' }, (info) => {
        if (!info) return;

        document.getElementById('usage-count').innerText = info.usage || 0;
        document.getElementById('limit-total').innerText = info.limit || 50;

        const badge = document.getElementById('plan-badge');
        badge.innerText = info.planName || 'Free Trial';
        badge.className = `badge ${(info.planId || 'free').toLowerCase()}`;

        const progress = ((info.usage || 0) / (info.limit || 50)) * 100;
        document.getElementById('progress-fill').style.width = `${Math.min(100, progress)}%`;
    });
}
