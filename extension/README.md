# IT Company Finder Scraper - Complete Setup Guide

This project consists of two parts that work together:
1.  **Chrome Extension**: The user interface that runs in your browser.
2.  **Backend Server**: A Node.js script that scrapes real data from Google and other directories.

---

## 🚀 Step 1: Prerequisites

Before you begin, make sure you have **Node.js** installed on your computer.
- Check if installed: Open terminal/command prompt and type `node -v`.
- If not installed, download it from: [https://nodejs.org/](https://nodejs.org/)

---

## 🛠️ Step 2: Setup the Backend Server (The Scraper)

The extension needs this server to be running to fetch real data.

1.  **Open the Folder**: Go to the `extension` folder on your computer.
2.  **Open Terminal**: Right-click inside the folder and select "Open in Terminal" (or use Command Prompt).
3.  **Install Dependencies**: Run the following commands one by one:

    ```bash
    # Initialize the project (creates package.json)
    npm init -y

    # Install required libraries (Express for API, Puppeteer for scraping, Cors for connection)
    npm install express puppeteer cors
    ```

4.  **Start the Server**:
    ```bash
    node backend-server.js
    ```

    ✅ You should see: `Scraper Server running on http://localhost:3000`
    
    **Keep this terminal window OPEN.** If you close it, the scraper stops working.

---

## 🧩 Step 3: Install the Chrome Extension

1.  Open Google Chrome.
2.  In the address bar, type: `chrome://extensions/` and hit Enter.
3.  **Enable Developer Mode**: Toggle the switch in the top-right corner.
4.  Click the **Load unpacked** button (top-left).
5.  Select the `extension` folder (the same folder where `manifest.json` is located).
6.  The **IT Company Finder** icon should appear in your browser toolbar.

---

## 🔎 Step 4: How to Use

1.  Ensure your **Backend Server** is running (Step 2).
2.  Click the extension icon in Chrome.
3.  Check the status indicator:
    - 🟢 **Connected**: The extension sees your backend server.
    - 🔴 **Disconnected**: The server is not running (Extension will show mock data).
4.  Type a location (e.g., "Vastral", "Gota", "Pune").
5.  Click **Search IT Companies**.
6.  Wait 10-15 seconds for the scraper to fetch results.

---

## ❓ Troubleshooting

**Issue: "Backend: Disconnected" Status**
- Make sure the terminal window with `node backend-server.js` is still open.
- Make sure it says "Server running on http://localhost:3000".
- If you see errors, try restarting the server (Ctrl+C to stop, then `node backend-server.js` to start).

**Issue: No results found**
- The scraper simulates a Google Search. Sometimes Google may block frequent automated requests.
- Try searching for a different location.
- The backend logs (in your terminal) will show if scraping failed.

**Issue: "Puppeteer" errors**
- If scraping crashes, try installing Chrome dependencies manually or restart your computer.
