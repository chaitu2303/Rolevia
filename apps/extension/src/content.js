// Content Script for Rolevia Extension
console.log("Rolevia Content Script Loaded");

const SENSITIVE_KEYWORDS = [
  'ssn', 'social security', 'password', 'credit card', 'ethnicity', 
  'disability', 'veteran', 'gender', 'race', 'visa', 'sponsorship'
];

function isSensitiveField(inputElement) {
  const name = (inputElement.name || '').toLowerCase();
  const id = (inputElement.id || '').toLowerCase();
  const label = (inputElement.labels && inputElement.labels.length > 0) 
    ? inputElement.labels[0].innerText.toLowerCase() 
    : '';
  
  const textToScan = `${name} ${id} ${label}`;
  return SENSITIVE_KEYWORDS.some(k => textToScan.includes(k));
}

function getJobDescription() {
  // Simple heuristic for job description extraction
  // Often inside an element with id/class containing "job-description" or "content"
  const potentialContainers = document.querySelectorAll(
    '#content, .job-description, .posting-content, [data-automation-id="jobPostingDescription"]'
  );
  
  if (potentialContainers.length > 0) {
    return Array.from(potentialContainers).map(c => c.innerText).join('\n');
  }
  
  // Fallback to body text, removing scripts/styles
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
  return clone.innerText.slice(0, 10000); // Limit size
}

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

function triggerChangeEvent(element, value) {
  setNativeValue(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function autofillForm(profileData) {
  const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
  let filledCount = 0;
  
  const { basics, skills } = profileData;
  
  inputs.forEach(input => {
    if (isSensitiveField(input)) {
      input.style.border = '2px solid orange';
      input.title = 'Rolevia: Skipped Sensitive Field (Manual Review Required)';
      return;
    }

    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    
    // VERIFIED_AUTOFILL logic
    if ((name.includes('first') && name.includes('name')) || id.includes('firstname')) {
      triggerChangeEvent(input, basics?.name?.split(' ')[0] || '');
      filledCount++;
    } else if ((name.includes('last') && name.includes('name')) || id.includes('lastname')) {
      const parts = basics?.name?.split(' ') || [];
      triggerChangeEvent(input, parts.length > 1 ? parts.slice(1).join(' ') : '');
      filledCount++;
    } else if (name.includes('name') || id.includes('name')) {
      triggerChangeEvent(input, basics?.name || '');
      filledCount++;
    } else if (name.includes('email') || id.includes('email') || input.type === 'email') {
      triggerChangeEvent(input, basics?.email || '');
      filledCount++;
    } else if (name.includes('phone') || id.includes('phone') || input.type === 'tel') {
      triggerChangeEvent(input, basics?.phone || '');
      filledCount++;
    } else if (name.includes('linkedin') || id.includes('linkedin')) {
      triggerChangeEvent(input, basics?.linkedinUrl || '');
      filledCount++;
    } else if (name.includes('github') || id.includes('github')) {
      triggerChangeEvent(input, basics?.githubUrl || '');
      filledCount++;
    } else if (name.includes('portfolio') || name.includes('website')) {
      triggerChangeEvent(input, basics?.portfolioUrl || '');
      filledCount++;
    } else if (input.tagName.toLowerCase() === 'textarea' && (name.includes('cover') || id.includes('cover'))) {
      input.style.border = '2px solid blue';
      input.title = 'Rolevia: Cover Letter / Custom Answer requires manual review.';
    }
  });
  
  return filledCount;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_JOB') {
    const text = getJobDescription();
    sendResponse({ text });
  } else if (request.action === 'AUTOFILL') {
    const count = autofillForm(request.profileData);
    sendResponse({ count });
  }
});
