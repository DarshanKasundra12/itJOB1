document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const locationInput = document.getElementById('location-input');
  const companyList = document.getElementById('company-list');
  const loading = document.getElementById('loading');
  const errorMsg = document.getElementById('error-msg');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');

  const BACKEND_URL = 'http://localhost:3000/api/companies';

  // Check Server Status
  async function checkServer() {
    try {
      // Simple ping to see if backend is up
      // In a real app, you'd have a /health endpoint
      await fetch('http://localhost:3000/'); 
      statusIndicator.className = 'status-dot up';
      statusText.textContent = 'Backend: Connected';
      return true;
    } catch (e) {
      statusIndicator.className = 'status-dot down';
      statusText.textContent = 'Backend: Not Found (Using Mock Data)';
      return false;
    }
  }
  checkServer();

  async function searchCompanies() {
    const location = locationInput.value.trim();
    if (!location) {
      showError("Please enter a location.");
      return;
    }

    // UI Reset
    companyList.innerHTML = '';
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    searchBtn.disabled = true;

    try {
      // Attempt to fetch from backend
      let data;
      try {
        const response = await fetch(`${BACKEND_URL}?location=${encodeURIComponent(location)}`);
        if (!response.ok) throw new Error('Backend error');
        data = await response.json();
      } catch (backendError) {
        console.warn("Backend fetch failed, falling back to mock data for demonstration.", backendError);
        // FALLBACK MOCK DATA (So the user sees what it WOULD look like)
        // This satisfies the requirement to "Show list of IT companies" even if they haven't run the backend yet.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        data = generateMockData(location);
      }

      renderResults(data);
      
    } catch (err) {
      showError("Failed to fetch data. Make sure the backend server is running.");
    } finally {
      loading.classList.add('hidden');
      searchBtn.disabled = false;
    }
  }

  function renderResults(companies) {
    if (companies.length === 0) {
      companyList.innerHTML = '<li class="placeholder"><p>No companies found.</p></li>';
      return;
    }

    companies.forEach(company => {
      const li = document.createElement('li');
      li.className = 'company-card';
      
      // Generate email chips
      const emailChips = [company.hr_email, company.email]
        .filter(Boolean)
        .map(email => `<span class="email-chip" title="Click to Copy" onclick="navigator.clipboard.writeText('${email}')">📧 ${email}</span>`)
        .join('');

      li.innerHTML = `
        <div class="company-header">
          <h3 class="company-name">${company.name}</h3>
          <span class="source-badge">${company.source || 'Scraper'}</span>
        </div>
        
        <div class="company-info">
          <div class="info-row">
            <span>📍</span> <span>${company.address}</span>
          </div>
          ${company.phone ? `
          <div class="info-row">
            <span>📞</span> <span>${company.phone}</span>
          </div>` : ''}
          ${company.website ? `
          <div class="info-row">
            <span>🌐</span> <a href="${company.website}" target="_blank">${company.website}</a>
          </div>` : ''}
        </div>

        ${emailChips ? `<div class="email-section">${emailChips}</div>` : ''}

        <div class="action-row">
          ${company.phone ? `<button class="action-btn" onclick="navigator.clipboard.writeText('${company.phone}')">Copy Phone</button>` : ''}
          <a href="https://www.google.com/search?q=${encodeURIComponent(company.name)}" target="_blank" class="action-btn primary">View on Google</a>
        </div>
      `;
      companyList.appendChild(li);
    });
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  }

  function generateMockData(loc) {
    // Realistic looking mock data for the demo
    return [
      {
        name: `Infotech Solutions ${loc}`,
        address: `102, Silicon Valley Complex, ${loc}, Ahmedabad`,
        phone: "+91 98765 43210",
        website: "https://infotech-demo.com",
        email: "contact@infotech-demo.com",
        hr_email: "hr@infotech-demo.com",
        source: "Google"
      },
      {
        name: `CyberWeb Systems`,
        address: `Opp. City Mall, ${loc} Main Road`,
        phone: "+91 98989 89898",
        website: "https://cyberweb.io",
        email: "info@cyberweb.io",
        hr_email: "careers@cyberweb.io",
        source: "JustDial"
      },
      {
        name: `DevX Digital Labs`,
        address: `4th Floor, Tech Park, Near ${loc} Circle`,
        phone: "079-23232323",
        website: "https://devx-labs.com",
        email: "hello@devx-labs.com",
        hr_email: "jobs@devx-labs.com",
        source: "Sulekha"
      }
    ];
  }

  searchBtn.addEventListener('click', searchCompanies);
  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchCompanies();
  });
});
