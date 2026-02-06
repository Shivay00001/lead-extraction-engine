# Lead Extraction Engine - Setup Instructions

## Prerequisites

- Google Chrome (v88+)
- Node.js (optional, for license backend)

---

## Step 1: Load the Extension

1. Open Chrome and navigate to:

   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **Load unpacked**

4. Select this folder:

   ```
   C:\Users\shiva\.gemini\antigravity\scratch\lead-extraction-engine\src
   ```

5. The extension icon will appear in your toolbar

---

## Step 2: Activate a License (Optional)

Free plan gives you 50 leads with Google Search only.

To unlock all platforms:

1. Click the extension icon
2. Enter a license key:
   - `STARTER-123` → 500 leads/month
   - `PRO-456` → 2,000 leads/month
   - `AGENCY-789` → 10,000 leads/month
3. Click **Activate**

---

## Step 3: Start Extracting Leads

1. Go to any supported platform:
   - <https://www.google.com/maps> (search for businesses)
   - <https://www.justdial.com>
   - <https://www.sulekha.com>
   - <https://www.yelp.com>

2. The extension auto-detects the platform

3. Click the extension icon and press **Start Extraction**

4. Watch as leads are highlighted and extracted

---

## Step 4: Export Your Leads

1. Click the extension icon
2. Choose export format:
   - **Export CSV** → Opens in Excel/Sheets
   - **JSON** → For developers/APIs

---

## Running the License Backend (Optional)

If you want to run the license validation server:

```bash
cd backend
npm install express
node server.js
```

Server runs at `http://localhost:3000`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Extension not loading | Check manifest.json syntax |
| No leads extracted | Scroll page first to load content |
| "Platform Locked" | Upgrade to paid plan |
| Limit reached | Wait for monthly reset or upgrade |

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/manifest.json` | Extension configuration |
| `src/background/license-manager.js` | Edit plan limits here |
| `src/content/extractors/*.js` | Platform-specific logic |
| `src/popup/popup.js` | UI and export logic |

---

## Support

For issues with DOM selectors (if platforms update their HTML), edit the corresponding extractor file in `src/content/extractors/`.
