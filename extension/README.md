# IT Company Scraper - Chrome Extension & Backend

This project contains two parts:
1. **Chrome Extension**: The frontend UI that runs in your browser.
2. **Backend Server**: A Node.js + Puppeteer script that scrapes data.

## Part 1: Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this `extension` folder.

## Part 2: Run the Backend Scraper

The extension needs a backend to do the scraping.

1. **Install Node.js** if you haven't already (https://nodejs.org/).
2. Open a terminal/command prompt.
3. Navigate to this folder (where `backend-server.js` is).
4. Initialize the project and install dependencies:
   ```bash
   npm init -y
   npm install express puppeteer cors
   ```
5. Start the server:
   ```bash
   node backend-server.js
   ```
6. The server will start on `http://localhost:3000`.

## Usage

1. Ensure the backend server is running.
2. Open the Chrome Extension popup.
3. Type a location (e.g., "Vastral").
4. Click **Search**.
5. The extension will send a request to your local backend, which will scrape Google/Directories and return the results.

**Note**: If the backend is not running, the extension will show a "Backend: Disconnected" status and use mock data for demonstration purposes.
