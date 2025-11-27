document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('search-btn');
  const locationInput = document.getElementById('location-input');
  const companyList = document.getElementById('company-list');
  let map = null;
  let markers = [];
  let userLat = 23.0225; // Default: Ahmedabad
  let userLng = 72.5714; // Default: Ahmedabad

  // Initialize Map
  function initMap(lat, lng) {
    if (map) {
      map.setView([lat, lng], 13);
    } else {
      map = L.map('map').setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    }
    
    // Clear existing markers
    clearMarkers();

    // Add User Marker (Blue)
    const userIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    marker.bindPopup("<b>Search Location</b>").openPopup();
    markers.push(marker);
  }

  function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
  }

  // Add Company Marker (Red)
  function addCompanyMarker(lat, lng, name, address) {
    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
    marker.bindPopup(`<b>${name}</b><br>${address}`);
    markers.push(marker);
  }

  // Generate Emails
  function generateEmails(name, website) {
    let domain = "";
    if (website) {
      try {
        const url = new URL(website.startsWith('http') ? website : `http://${website}`);
        domain = url.hostname.replace('www.', '');
      } catch (e) {
        // Fallback if URL parsing fails, try simple string manipulation
        domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      }
    } else {
      // Try to guess domain from name (very basic)
      domain = name.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
    }

    if (!domain) return [];

    return [
      `hr@${domain}`,
      `careers@${domain}`,
      `info@${domain}`,
      `contact@${domain}`
    ];
  }

  // Fetch IP Location
  async function getUserLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        userLat = data.latitude;
        userLng = data.longitude;
        locationInput.value = data.city || "";
        initMap(userLat, userLng);
        // Auto search on load if we have location
        searchITCompanies(userLat, userLng);
      } else {
        initMap(userLat, userLng); // Fallback
      }
    } catch (error) {
      console.error("Location fetch failed", error);
      initMap(userLat, userLng); // Fallback
    }
  }

  // Search Place (Nominatim)
  async function searchPlace() {
    const query = locationInput.value;
    if (!query) return;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        initMap(lat, lon);
        searchITCompanies(lat, lon);
      } else {
        alert("Location not found!");
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("Error searching location.");
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = "Search";
    }
  }

  // Search IT Companies (Overpass)
  async function searchITCompanies(lat, lng) {
    companyList.innerHTML = '<li class="placeholder">Scanning for IT companies...</li>';
    
    // Overpass Query
    const query = `[out:json];node["office"="it"](around:3000,${lat},${lng});out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const companies = data.elements;

      companyList.innerHTML = "";

      if (companies.length === 0) {
        companyList.innerHTML = '<li class="placeholder">No IT companies found nearby.</li>';
        return;
      }

      companies.forEach(company => {
        const name = company.tags.name || "Unknown IT Company";
        const address = [
          company.tags['addr:street'],
          company.tags['addr:city'], 
          company.tags['addr:postcode']
        ].filter(Boolean).join(", ") || "Address not available";
        
        const website = company.tags.website || "";
        const emails = generateEmails(name, website);

        // Add to Map
        addCompanyMarker(company.lat, company.lon, name, address);

        // Add to List
        const li = document.createElement('li');
        
        let emailHtml = '';
        if (emails.length > 0) {
          emailHtml = `<div class="email-list">
            ${emails.slice(0, 2).map(e => `<span class="email-tag">${e}</span>`).join('')}
          </div>`;
        }

        li.innerHTML = `
          <span class="company-name">${name}</span>
          <span class="company-details">📍 ${address}</span>
          ${website ? `<span class="company-details">🌐 <a href="${website}" target="_blank">${website}</a></span>` : ''}
          ${emailHtml}
        `;
        
        // Add click listener to center map
        li.addEventListener('click', () => {
            map.setView([company.lat, company.lon], 16);
        });

        companyList.appendChild(li);
      });

    } catch (error) {
      console.error("Overpass API failed", error);
      companyList.innerHTML = '<li class="placeholder">Error fetching company data.</li>';
    }
  }

  // Event Listeners
  searchBtn.addEventListener('click', searchPlace);
  locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPlace();
  });

  // Start
  getUserLocation();
});
