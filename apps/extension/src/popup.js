let cachedProfile = null;
let currentJob = null;

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'CHECK_AUTH' }, (response) => {
    if (response?.authenticated) {
      document.getElementById('user-info').innerText = `Logged in as ${response.user.email}`;
      document.getElementById('main-view').classList.remove('hidden');
      
      // Fetch profile data ahead of time
      chrome.runtime.sendMessage({ action: 'GET_PROFILE' }, (profileRes) => {
        if (profileRes?.success) {
          cachedProfile = profileRes.data.profile;
        }
      });
    } else {
      document.getElementById('user-info').innerText = 'Not logged in';
      document.getElementById('unauth-view').classList.remove('hidden');
    }
  });

  document.getElementById('btn-analyze').addEventListener('click', async () => {
    setStatus('Extracting job description...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB' }, (response) => {
      if (!response || !response.text) {
        setStatus('Could not extract job description from this page.');
        return;
      }
      
      setStatus('Analyzing job with Native Intelligence Engine...');
      chrome.runtime.sendMessage({ action: 'ANALYZE_JOB', text: response.text }, (analyzeRes) => {
        if (analyzeRes?.success) {
          const data = analyzeRes.data;
          currentJob = data;
          
          document.getElementById('job-score').innerText = data.matchAnalysis?.overallScore || '--';
          document.getElementById('job-title').innerText = data.roleTitle || 'Unknown Role';
          document.getElementById('job-company').innerText = data.company || 'Unknown Company';
          
          const missingContainer = document.getElementById('missing-skills-container');
          missingContainer.innerHTML = '';
          (data.matchAnalysis?.missingSkills || []).forEach(skill => {
            const span = document.createElement('span');
            span.className = 'tag missing';
            span.innerText = skill;
            missingContainer.appendChild(span);
          });
          
          document.getElementById('analysis-box').classList.remove('hidden');
          document.getElementById('btn-analyze').classList.add('hidden');
          document.getElementById('btn-autofill').classList.remove('hidden');
          document.getElementById('btn-track').classList.remove('hidden');
          
          setStatus('Analysis complete.');
        } else {
          setStatus('Error: ' + analyzeRes?.error);
        }
      });
    });
  });

  document.getElementById('btn-autofill').addEventListener('click', async () => {
    if (!cachedProfile) {
      setStatus('Profile not loaded yet. Please wait...');
      return;
    }
    
    setStatus('Autofilling verified facts...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL', profileData: cachedProfile }, (response) => {
      if (response) {
        setStatus(`Filled ${response.count} fields. Review sensitive fields manually.`);
      } else {
        setStatus('Could not autofill on this page.');
      }
    });
  });
  document.getElementById('btn-track').addEventListener('click', () => {
    if (!currentJob) return;
    setStatus('Saving to tracker...');
    chrome.runtime.sendMessage({ 
      action: 'APPLY_TRACKER', 
      company: currentJob.company, 
      roleTitle: currentJob.roleTitle 
    }, (res) => {
      if (res?.success) {
        setStatus('Saved to Rolevia Tracker!');
        document.getElementById('btn-track').classList.add('hidden');
      } else {
        setStatus('Failed to save: ' + res?.error);
      }
    });
  });
});

function setStatus(text) {
  document.getElementById('action-status').innerText = text;
}
