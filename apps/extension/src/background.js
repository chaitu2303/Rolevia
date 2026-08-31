// Background Script for Rolevia Extension
const API_BASE_URL = 'https://careeros-iota.vercel.app';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Rolevia Extension Installed");
});

// Secure API Gateway
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      // In Manifest V3, host_permissions allow cross-origin requests.
      // Cookies for the domain are automatically attached if we don't omit them.
      // We don't use 'include' because extension fetch defaults to sending cookies for the requested domain.
    });
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('UNAUTHORIZED');
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_AUTH') {
    apiFetch('/api/auth/session')
      .then(data => sendResponse({ authenticated: !!data?.user, user: data?.user }))
      .catch(err => sendResponse({ authenticated: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'ANALYZE_JOB') {
    apiFetch('/api/jobs/analyze', {
      method: 'POST',
      body: JSON.stringify({ text: request.text, sourceType: 'TEXT' })
    })
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  
  if (request.action === 'GET_PROFILE') {
    apiFetch('/api/profile/facts')
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'APPLY_TRACKER') {
    apiFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        company: request.company,
        roleTitle: request.roleTitle,
        status: 'APPLIED'
      })
    })
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
