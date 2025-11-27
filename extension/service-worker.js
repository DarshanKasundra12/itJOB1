// Service Worker
// Manifest V3 requires a service worker, even if it's mostly empty.

chrome.runtime.onInstalled.addListener(() => {
  console.log("IT Company Finder Extension Installed");
});

// You can add background tasks here if needed in the future
