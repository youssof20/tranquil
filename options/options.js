'use strict';

document.getElementById('clear-zaps-btn').addEventListener('click', () => {
  chrome.storage.local.get({ customHides: {} }, (data) => {
    const total = Object.values(data.customHides || {}).reduce((n, arr) => n + (Array.isArray(arr) ? arr.length : 0), 0);
    chrome.storage.local.set({ customHides: {} }, () => {
      const el = document.getElementById('clear-zaps-result');
      el.textContent = total > 0 ? `Cleared ${total} custom hide${total === 1 ? '' : 's'}. Reload the page to show elements again.` : 'No custom hides stored.';
      setTimeout(() => { el.textContent = ''; }, 5000);
    });
  });
});

document.getElementById('copy-btn').addEventListener('click', () => {
  chrome.storage.sync.get(null, (data) => {
    const str = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    navigator.clipboard.writeText(str).then(() => alert('Config copied to clipboard.'));
  });
});

document.getElementById('import-btn').addEventListener('click', () => {
  const raw = document.getElementById('import-area').value.trim();
  if (!raw) return;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(raw))));
    chrome.storage.sync.set(data, () => {
      alert('Config imported. Reload your tabs for changes to apply.');
    });
  } catch (e) {
    alert('Invalid config string.');
  }
});
