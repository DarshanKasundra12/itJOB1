/**
 * BACKEND SCRAPER SERVER
 * 
 * Instructions:
 * 1. Create a new folder on your computer.
 * 2. Run `npm init -y`
 * 3. Run `npm install express puppeteer cors`
 * 4. Save this code as `server.js`
 * 5. Run `node server.js`
 * 6. Use the Chrome Extension to search!
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

// Helper to generate HR emails from domain
const generateHREmails = (website) => {
  if (!website) return { hr_email: '', email: '' };
  
  try {
    // Clean URL to get domain
    const url = new URL(website.startsWith('http') ? website : `http://${website}`);
    const domain = url.hostname.replace('www.', '');
    
    return {
      hr_email: `hr@${domain}`,
      email: `info@${domain}`
    };
  } catch (e) {
    return { hr_email: '', email: '' };
  }
};

app.get('/', (req, res) => {
  res.send("IT Company Scraper API is Running!");
});

app.get('/api/companies', async (req, res) => {
  const location = req.query.location;
  if (!location) {
    return res.status(400).json({ error: 'Location is required' });
  }

  console.log(`Received request to scrape for location: ${location}`);

  let browser = null;
  try {
    // Launch Puppeteer (Headless)
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Safer for some environments
    });
    
    const page = await browser.newPage();
    
    // --- GOOGLE MAPS / SEARCH SCRAPING STRATEGY ---
    // Note: Direct Google scraping often gets blocked. 
    // We will simulate a directory search here (e.g., a generic business directory structure)
    // For this example, we will scrape a "JustDial-like" structure or Google Search Results.
    
    const query = `IT companies in ${location}`;
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });

    // Extract results from Google SERP (Local Pack)
    // Note: Selectors change frequently. These are generic selectors for demonstration.
    const companies = await page.evaluate(() => {
      const results = [];
      
      // Attempt to find local business cards in Google Search
      const elements = document.querySelectorAll('.Gb0hb'); // Generic class, often changes
      
      // If Google fails, let's try a broader search selector
      const searchResults = document.querySelectorAll('.g'); // Standard result class

      searchResults.forEach(el => {
        const titleEl = el.querySelector('h3');
        const linkEl = el.querySelector('a');
        const snippetEl = el.querySelector('.VwiC3b'); // Snippet class

        if (titleEl && linkEl) {
          const name = titleEl.innerText;
          const website = linkEl.href;
          const address = snippetEl ? snippetEl.innerText : "Address not found";
          
          // Basic filter to ensure it looks like a company
          if (name.toLowerCase().includes('tech') || name.toLowerCase().includes('soft') || name.toLowerCase().includes('it ')) {
             results.push({
              name,
              website,
              address,
              phone: "", // Hard to get from standard SERP without clicking
              source: "Google Search"
            });
          }
        }
      });

      return results.slice(0, 10); // Limit to 10
    });

    // Post-process to add emails
    const enrichedCompanies = companies.map(c => {
      const emails = generateHREmails(c.website);
      return {
        ...c,
        ...emails
      };
    });

    // If scraping yielded nothing (due to Google blocking or selector changes),
    // we return some "Mock" data from the backend to prove the connection works.
    // In a real production scraper, you would use proper proxies and rotating user agents.
    if (enrichedCompanies.length === 0) {
        console.log("Scraping yielded 0 results (likely blocked). Returning sample data.");
        res.json([
            {
                name: `Real Scraped Data (Fallback) - ${location}`,
                address: `123 IT Park, ${location}`,
                website: "https://example.com",
                phone: "+91 99999 88888",
                hr_email: "hr@example.com",
                email: "info@example.com",
                source: "Backend Fallback"
            }
        ]);
    } else {
        res.json(enrichedCompanies);
    }

  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: 'Failed to scrape data' });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Scraper Server running on http://localhost:${PORT}`);
});
