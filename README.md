# Lead Extraction Engine

Production-ready Chrome Extension (Manifest V3) for B2B/B2C lead extraction with monetization.

## Project Structure

```
lead-extraction-engine/
├── src/                          # Extension source code
│   ├── manifest.json             # Chrome Extension Manifest V3
│   ├── assets/                   # Icons and images
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   ├── background/               # Service Worker & Core Logic
│   │   ├── service-worker.js     # Message routing, orchestration
│   │   └── license-manager.js    # License validation & limits
│   ├── common/                   # Shared utilities
│   │   ├── db.js                 # IndexedDB storage layer
│   │   └── intelligence.js       # Email guessing logic
│   ├── content/                  # Content scripts
│   │   ├── injector.js           # Platform detection & loader
│   │   └── extractors/           # Platform-specific extractors
│   │       ├── google_maps.js    # PRIMARY
│   │       ├── google_search.js  # PRIMARY
│   │       ├── justdial.js       # PRIMARY
│   │       ├── sulekha.js        # PRIMARY
│   │       ├── indiamart.js      # SECONDARY
│   │       ├── bing_maps.js      # SECONDARY
│   │       ├── apple_maps.js     # SECONDARY
│   │       ├── yelp.js           # SECONDARY
│   │       ├── yellow_pages.js   # SECONDARY
│   │       ├── youtube.js        # SIGNAL-BASED
│   │       ├── instagram.js      # SIGNAL-BASED
│   │       ├── twitter.js        # SIGNAL-BASED
│   │       ├── facebook.js       # SIGNAL-BASED
│   │       ├── naukri.js         # INDIRECT B2B
│   │       ├── indeed.js         # INDIRECT B2B
│   │       └── apna.js           # INDIRECT B2B
│   └── popup/                    # Extension UI
│       ├── index.html            # Popup structure
│       ├── style.css             # Styling
│       └── popup.js              # UI logic & export
├── backend/                      # License validation server
│   └── server.js                 # Express API
└── sample_leads_output.csv       # Sample output format
```

## Installation

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `src` folder

## License Keys (Testing)

| Plan    | Key           | Leads/Month |
|---------|---------------|-------------|
| Free    | (none)        | 50 total    |
| Starter | `STARTER-123` | 500         |
| Pro     | `PRO-456`     | 2,000       |
| Agency  | `AGENCY-789`  | 10,000      |

## Supported Platforms (14)

### Primary (Deep Scrape)

- Google Maps
- Google Search
- Justdial
- Sulekha

### Secondary

- IndiaMART
- Bing Maps
- Apple Maps
- Yelp
- Yellow Pages (Global + India)

### Signal-Based (Limited)

- YouTube (About pages)
- Instagram (Bio only)
- X/Twitter (Profile links)
- Facebook (About section)

### Indirect B2B

- Naukri (Company names)
- Indeed (Company names)
- Apna (Company names)

## Usage

1. Navigate to any supported platform
2. Extension auto-detects and loads extractor
3. Click popup → "Start Extraction"
4. Export via CSV or JSON

## Legal

- No login bypass
- No CAPTCHA bypass
- Public data only
