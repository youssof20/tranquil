'use strict';

const SITE_ORIGINS = {
  youtube: ['*://*.youtube.com/*'],
  reddit: ['*://*.reddit.com/*'],
  instagram: ['*://*.instagram.com/*'],
  twitter: ['*://*.twitter.com/*', '*://*.x.com/*'],
  facebook: ['*://*.facebook.com/*'],
  linkedin: ['*://*.linkedin.com/*']
};

const SITE_ORDER = ['youtube', 'reddit', 'instagram', 'twitter', 'facebook', 'linkedin'];

const SITE_DISPLAY_NAMES = {
  youtube: 'YouTube',
  reddit: 'Reddit',
  instagram: 'Instagram',
  twitter: 'X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn'
};

let recipes = {};
let settings = {};
let pauseIntervalId = null;

function loadSettings() {
  return new Promise(r => chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, r));
}

const INSTAGRAM_DMS_URL = 'https://www.instagram.com/direct/inbox/';

function saveSettings(payload) {
  return new Promise(r => chrome.runtime.sendMessage({ type: 'SET_SETTINGS', payload }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab?.id && tab.url && isSupportedUrl(tab.url)) {
        chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_ATTRIBUTES', payload }).catch(() => {});
        const u = new URL(tab.url);
        const path = (u.pathname || '/').replace(/\/$/, '') || '';
        const instagramDms = payload?.sites?.instagram?.features?.redirect_to_dms;
        const instagramRedirectPaths = ['', '/', '/reels', '/reels/', '/explore', '/explore/', '/home'];
        if (u.hostname.includes('instagram.com') && instagramDms && instagramRedirectPaths.includes(path)) {
          const hasPerm = await ensurePermission('instagram');
          if (hasPerm) {
            chrome.tabs.sendMessage(tab.id, { type: 'FORCE_REDIRECT', target: INSTAGRAM_DMS_URL }).catch(() => {
              chrome.tabs.update(tab.id, { url: INSTAGRAM_DMS_URL });
            });
          } else {
            chrome.tabs.update(tab.id, { url: INSTAGRAM_DMS_URL });
          }
        }
      }
      r();
    });
  }));
}

function isSupportedUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    return h.includes('youtube.com') || h.includes('reddit.com') || h.includes('instagram.com') ||
      h.includes('twitter.com') || h.includes('x.com') || h.includes('facebook.com') || h.includes('linkedin.com');
  } catch (_) { return false; }
}

function loadRecipe(siteId) {
  if (recipes[siteId]) return Promise.resolve(recipes[siteId]);
  return fetch(chrome.runtime.getURL('recipes/' + siteId + '.json'))
    .then(res => res.json())
    .then(data => { recipes[siteId] = data; return data; })
    .catch(() => null);
}

function requestSitePermission(siteId) {
  return new Promise(r => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SITE_PERMISSION', siteId }, resp => r(resp?.granted ?? false));
  });
}

async function ensurePermission(siteId) {
  const origins = SITE_ORIGINS[siteId];
  if (!origins) return true;
  const has = await chrome.permissions.contains({ origins });
  if (has) return true;
  return requestSitePermission(siteId);
}

function getSiteIdFromUrl(url) {
  if (!url) return null;
  try {
    const h = new URL(url).hostname;
    if (h.includes('youtube.com')) return 'youtube';
    if (h.includes('reddit.com')) return 'reddit';
    if (h.includes('instagram.com')) return 'instagram';
    if (h.includes('twitter.com') || h.includes('x.com')) return 'twitter';
    if (h.includes('facebook.com') || h.includes('fb.com') || h.includes('fb.me')) return 'facebook';
    if (h.includes('linkedin.com')) return 'linkedin';
  } catch (_) {}
  return null;
}

const MODE_PRESETS = {
  custom: 'Per-site toggles only.',
  work: 'Hides feeds, sidebars, reels.',
  social: 'Hides feeds/reels, keeps messages.'
};

function renderActiveSite(settings, tabUrl) {
  const el = document.getElementById('active-site');
  const statusDot = document.getElementById('status-dot');
  if (!el) return;
  const siteId = getSiteIdFromUrl(tabUrl);
  const extensionOn = settings?.enabled !== false;
  const siteOn = siteId && settings?.sites?.[siteId]?.enabled !== false;
  const enabled = extensionOn && siteOn;
  if (!siteId) {
    el.textContent = '';
    el.className = 'active-site-inline';
  } else {
    const name = SITE_DISPLAY_NAMES[siteId] || siteId;
    el.textContent = enabled ? name : `Off · ${name}`;
    el.className = 'active-site-inline' + (enabled ? ' active-site-on' : ' active-site-off');
  }
  if (statusDot) {
    statusDot.classList.remove('status-dot--on-site', 'status-dot--active', 'status-dot--off');
    if (enabled) statusDot.classList.add('status-dot--on-site');
    else if (siteId && !enabled) statusDot.classList.add('status-dot--off');
    else statusDot.classList.add('status-dot--active');
    const name = siteId ? (SITE_DISPLAY_NAMES[siteId] || siteId) : '';
    statusDot.title = enabled ? `Active on ${name}` : (siteId ? `Off · ${name}` : 'Open a supported site');
  }
}

function updatePauseUI(pauseUntil) {
  const block = document.getElementById('pause-block');
  const countdown = document.getElementById('pause-countdown');
  const timerEl = document.getElementById('pause-timer');
  const pauseBtn = document.getElementById('pause-btn');
  const statusDot = document.getElementById('status-dot');
  if (!block || !countdown) return;
  const now = Date.now();
  if (statusDot) {
    statusDot.classList.toggle('status-dot--active', pauseUntil <= now);
    statusDot.classList.toggle('status-dot--paused', pauseUntil > now);
  }
  if (pauseUntil > now) {
    block.classList.add('hidden');
    countdown.classList.remove('hidden');
    function tick() {
      const left = Math.max(0, Math.ceil((pauseUntil - Date.now()) / 1000));
      if (left <= 0) {
        if (pauseIntervalId) clearInterval(pauseIntervalId);
        pauseIntervalId = null;
        block.classList.remove('hidden');
        countdown.classList.add('hidden');
        pauseBtn.textContent = 'Pause Tranquil for 10 min';
        pauseBtn.disabled = false;
        return;
      }
      const m = Math.floor(left / 60);
      const s = left % 60;
      timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }
    tick();
    if (!pauseIntervalId) pauseIntervalId = setInterval(tick, 1000);
  } else {
    if (pauseIntervalId) { clearInterval(pauseIntervalId); pauseIntervalId = null; }
    block.classList.remove('hidden');
    countdown.classList.add('hidden');
    pauseBtn.textContent = 'Pause Tranquil for 10 min';
    pauseBtn.disabled = false;
  }
}

function renderPause(settings) {
  const pauseBtn = document.getElementById('pause-btn');
  const frictionEl = document.getElementById('pause-friction');
  const resumeBtn = document.getElementById('resume-now-btn');
  const FRICTION_MS = 3000;
  let frictionTimer = null;

  function startFriction() {
    if (frictionTimer) return;
    frictionEl.classList.remove('hidden');
    frictionEl.style.width = '0%';
    const start = Date.now();
    frictionTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / FRICTION_MS) * 100);
      frictionEl.style.width = pct + '%';
      if (pct >= 100) {
        clearInterval(frictionTimer);
        frictionTimer = null;
        frictionEl.classList.add('hidden');
        chrome.runtime.sendMessage({ type: 'PAUSE_10_MIN' }, () => {
          chrome.storage.session.get(['pauseUntil'], (data) => updatePauseUI(data.pauseUntil || 0));
        });
      }
    }, 50);
  }

  function cancelFriction() {
    if (frictionTimer) {
      clearInterval(frictionTimer);
      frictionTimer = null;
    }
    frictionEl.classList.add('hidden');
    frictionEl.style.width = '0%';
  }

  pauseBtn.addEventListener('mousedown', (e) => { if (e.button === 0) startFriction(); });
  pauseBtn.addEventListener('mouseup', cancelFriction);
  pauseBtn.addEventListener('mouseleave', cancelFriction);
  pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startFriction(); }, { passive: false });
  pauseBtn.addEventListener('touchend', (e) => { e.preventDefault(); cancelFriction(); });
  pauseBtn.addEventListener('touchcancel', cancelFriction);

  resumeBtn.addEventListener('click', () => {
    chrome.storage.session.set({ pauseUntil: 0 }, () => {
      updatePauseUI(0);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id && tabs[0].url && isSupportedUrl(tabs[0].url)) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_ATTRIBUTES', payload: settings }).catch(() => {});
        }
      });
    });
  });
  chrome.storage.session.get(['pauseUntil'], (data) => updatePauseUI(data.pauseUntil || 0));
  const statusDot = document.getElementById('status-dot');
  if (statusDot) statusDot.classList.add('status-dot--active');
}

function refreshHeaderStatus(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    renderActiveSite(settings, tabs[0]?.url ?? null);
  });
}

function renderMaster(settings) {
  const el = document.getElementById('master-toggle');
  el.checked = settings.enabled !== false;
  el.addEventListener('change', () => {
    settings.enabled = el.checked;
    saveSettings(settings);
    refreshHeaderStatus(settings);
  });
}

function renderMode(settings) {
  const el = document.getElementById('mode-select');
  const descEl = document.getElementById('mode-preset-desc');
  el.value = settings.mode || 'custom';
  if (descEl) descEl.textContent = MODE_PRESETS[el.value] || '';
  el.addEventListener('change', () => {
    settings.mode = el.value;
    if (descEl) descEl.textContent = MODE_PRESETS[el.value] || '';
    saveSettings(settings);
  });
}

function renderSites(settings) {
  const list = document.getElementById('sites-list');
  list.innerHTML = '';
  const sites = settings.sites || {};
  for (const siteId of SITE_ORDER) {
    const recipe = recipes[siteId];
    const name = recipe?.meta?.name || siteId;
    const site = sites[siteId] || { enabled: true, features: {} };
    const card = document.createElement('div');
    card.className = 'site-card';
    const defaults = recipe?.defaultFeatures || {};
    const features = { ...defaults, ...(site.features || {}) };
    card.innerHTML = `
      <div class="site-header" data-site="${siteId}">
        <span class="site-name">${name}</span>
        <input type="checkbox" class="site-toggle" data-site="${siteId}" ${site.enabled !== false ? 'checked' : ''}>
      </div>
      <div class="site-features ${site.enabled === false ? 'hidden' : ''}" data-features="${siteId}">
        ${(recipe?.features || []).map(f => `
          <label class="feature-row">
            <span>${f.label}</span>
            <input type="checkbox" data-site="${siteId}" data-feature="${f.id}" ${features[f.id] !== false ? 'checked' : ''}>
          </label>
        `).join('')}
      </div>
    `;
    card.classList.add('is-collapsed');
    list.appendChild(card);

    const header = card.querySelector('.site-header');
    const siteToggle = card.querySelector('.site-toggle');
    const featuresDiv = card.querySelector('.site-features');

    header.addEventListener('click', (e) => {
      if (e.target === siteToggle || siteToggle.contains(e.target)) {
        siteToggle.checked = !siteToggle.checked;
        siteToggle.dispatchEvent(new Event('change'));
      } else {
        card.classList.toggle('is-collapsed');
      }
    });
    siteToggle.addEventListener('change', async () => {
      const enable = siteToggle.checked;
      if (enable) {
        const ok = await ensurePermission(siteId);
        if (!ok) { siteToggle.checked = false; return; }
      }
      if (!settings.sites) settings.sites = {};
      if (!settings.sites[siteId]) settings.sites[siteId] = { enabled: true, features: {} };
      settings.sites[siteId].enabled = enable;
      featuresDiv.classList.toggle('hidden', !enable);
      saveSettings(settings);
      refreshHeaderStatus(settings);
    });

    card.querySelectorAll('.feature-row input').forEach(input => {
      input.addEventListener('change', () => {
        if (!settings.sites[siteId]) settings.sites[siteId] = { enabled: true, features: {} };
        if (!settings.sites[siteId].features) settings.sites[siteId].features = {};
        settings.sites[siteId].features[input.dataset.feature] = input.checked;
        saveSettings(settings);
      });
    });
  }
}

const GITHUB_URL = 'https://github.com/youssof20/tranquil';
const KOFI_URL = 'https://ko-fi.com/youssof20';
const THEME_STORAGE_KEY = 'popupTheme';

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('theme-light', isLight);
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (sun) sun.classList.toggle('hidden', isLight);
  if (moon) moon.classList.toggle('hidden', !isLight);
}

function initTheme() {
  chrome.storage.local.get({ [THEME_STORAGE_KEY]: 'dark' }, (data) => {
    applyTheme(data[THEME_STORAGE_KEY] || 'dark');
  });
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      chrome.storage.local.get({ [THEME_STORAGE_KEY]: 'dark' }, (data) => {
        const next = (data[THEME_STORAGE_KEY] || 'dark') === 'dark' ? 'light' : 'dark';
        chrome.storage.local.set({ [THEME_STORAGE_KEY]: next }, () => applyTheme(next));
      });
    });
  }
}

function initOptionsLink() {
  const opts = document.getElementById('options-link');
  if (opts) opts.addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
  const zaps = document.getElementById('manage-zaps-link');
  if (zaps) zaps.addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
  const github = document.getElementById('github-link');
  if (github) github.addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: GITHUB_URL }); });
  const kofi = document.getElementById('kofi-link');
  if (kofi) kofi.addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: KOFI_URL }); });
}

function renderTimeSaved() {
  const el = document.getElementById('time-saved');
  if (!el) return;
  chrome.storage.local.get({ feedsAvoidedToday: 0 }, (data) => {
    const n = data.feedsAvoidedToday || 0;
    el.textContent = n > 0 ? `Avoided ${n} feed${n === 1 ? '' : 's'} today` : '';
  });
}

async function init() {
  initTheme();
  settings = await loadSettings();
  if (!settings.sites) settings.sites = {};
  for (const siteId of SITE_ORDER) await loadRecipe(siteId);
  const tabs = await new Promise(r => chrome.tabs.query({ active: true, currentWindow: true }, r));
  const tabUrl = tabs[0]?.url || null;
  renderActiveSite(settings, tabUrl);
  renderPause(settings);
  renderMaster(settings);
  renderMode(settings);
  renderSites(settings);
  initOptionsLink();
  renderTimeSaved();
}

init();
