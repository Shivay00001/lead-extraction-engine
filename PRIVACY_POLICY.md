# Privacy Policy for Lead Extraction Engine

**Last Updated: July 4, 2026**

This Privacy Policy describes how the "Lead Extraction Engine" Chrome Extension ("the Extension") handles your data. 

## 1. Data Collection and Usage
The Extension is designed to extract business contact information (leads) from publicly available directories and websites you visit. 
- **All extraction happens locally:** The Extension reads the content of the web pages you are actively visiting solely for the purpose of identifying and formatting business leads.
- **Local Storage Only:** The extracted data is stored entirely on your local machine using your browser's built-in local storage (`IndexedDB` and `chrome.storage.local`).
- **No Data Collection:** We do not collect, transmit, store, or process any of your personal data, web history, or extracted leads on any remote servers. Your data never leaves your device unless you manually export it to a CSV file.

## 2. Third-Party Services and Analytics
We do not use any third-party tracking, analytics, or remote code within the Extension. We do not sell, rent, or share your data with any third parties because we do not have access to your data.

## 3. Permissions Justification
- **Storage / Unlimited Storage:** Required to save your extracted leads locally on your computer so you can review and export them later.
- **ActiveTab & Scripting:** Required to read the DOM (HTML) of the active directory page you want to extract leads from.
- **Host Permissions (`<all_urls>`):** Required because business directories exist on thousands of different domains globally, and the universal fallback engine must be able to parse contact data from any public directory the user chooses to scrape.

## 4. Changes to this Policy
If we make significant changes to this Privacy Policy, we will update the "Last Updated" date at the top of this page.

## 5. Contact
For any questions regarding this Privacy Policy, please open an issue on our GitHub repository:
https://github.com/Shivay00001/lead-extraction-engine/issues
