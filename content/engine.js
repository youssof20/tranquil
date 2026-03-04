'use strict';

(function () {
  const root = document.documentElement;
  let currentSiteId = null;
  let currentRecipe = null;

  function getSiteId() {
    const h = window.location.hostname;
    if (h.includes('youtube.com')) return 'youtube';
    if (h.includes('reddit.com')) return 'reddit';
    if (h.includes('instagram.com')) return 'instagram';
    if (h.includes('twitter.com') || h.includes('x.com')) return 'twitter';
    if (h.includes('facebook.com') || h.includes('fb.com') || h.includes('fb.me')) return 'facebook';
    if (h.includes('linkedin.com')) return 'linkedin';
    if (h.includes('amazon.')) return 'amazon';
    return null;
  }

  function loadRecipe(siteId, cb) {
    const url = chrome.runtime.getURL('recipes/' + siteId + '.json');
    fetch(url)
      .then(r => r.json())
      .then(cb)
      .catch(() => cb(null));
  }

  function applyRecipe(recipe, settings, siteId, rootEl) {
    if (!recipe || !recipe.rules) return;
    const site = settings?.sites?.[siteId];
    const isEnabled = settings?.enabled && site?.enabled !== false;

    if (!isEnabled) {
      for (const rule of recipe.rules) {
        const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
        rootEl.removeAttribute(attr);
      }
      rootEl.removeAttribute('data-tranquil-grayscale');
      const style = document.getElementById('tranquil-recipe-style');
      if (style) style.textContent = '';
      return;
    }

    const defaults = recipe.defaultFeatures || {};
    const features = { ...defaults, ...(site?.features || {}) };
    const isFeatureEnabled = (id) => features[id] !== false;

    // Apply Grayscale
    if (settings.grayscaleMode || features.grayscale) {
      rootEl.setAttribute('data-tranquil-grayscale', 'true');
    } else {
      rootEl.removeAttribute('data-tranquil-grayscale');
    }

    for (const rule of recipe.rules) {
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      if (isFeatureEnabled(rule.featureId)) rootEl.setAttribute(attr, 'true');
      else rootEl.removeAttribute(attr);
    }

    let style = document.getElementById('tranquil-recipe-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tranquil-recipe-style';
      (document.head || root).appendChild(style);
    }
    let css = '';

    // Grayscale CSS
    css += 'html[data-tranquil-grayscale="true"] { filter: grayscale(1) !important; }\n';

    for (const rule of recipe.rules) {
      if (!isFeatureEnabled(rule.featureId)) continue;
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      if (rule.selectors && rule.selectors.length) {
        const sel = rule.selectors.map(s => 'html[' + attr + '="true"] ' + s.trim()).join(',\n');
        css += sel + ' { display: none !important; }\n';
      }
    }
    if (recipe.reflow) {
      for (const reflow of recipe.reflow) {
        const allHidden = reflow.whenHidden.every(id => isFeatureEnabled(id));
        if (allHidden && reflow.css) css += reflow.css + '\n';
      }
    }
    style.textContent = css;
  }

  function setupQuietTitle() {
    const stripNotifications = () => {
      const t = document.title;
      // Strip numbers like (3) or dots like • at the start of the title
      const cleaned = t.replace(/^\s*(\(\d+\)|•|[\(]\d+[\)])\s*/, '').trim();
      if (cleaned && cleaned !== t) document.title = cleaned;
    };
    stripNotifications();
    const titleEl = document.querySelector('title');
    if (titleEl) {
      const titleObserver = new MutationObserver(stripNotifications);
      titleObserver.observe(titleEl, { childList: true, characterData: true, subtree: true });
    }
  }

  function run() {
    const siteId = getSiteId();
    if (!siteId) return;
    currentSiteId = siteId;

    Promise.all([
      new Promise(resolve => chrome.storage.sync.get(null, resolve)),
      new Promise(resolve => chrome.storage.session.get(['pauseUntil', 'focusModeActive'], resolve))
    ]).then(([sync, session]) => runWithSettings(sync, session)).catch(() => {});
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'UPDATE_ATTRIBUTES' && msg.payload) {
      const siteId = getSiteId();
      if (!siteId) {
        // If we're on an unsupported site, we still want to acknowledge the message
        sendResponse({ ok: true, unsupported: true });
        return true;
      }
      if (!currentRecipe) {
        loadRecipe(siteId, (recipe) => {
          currentRecipe = recipe;
          applyRecipe(recipe, msg.payload, siteId, root);
          applyShadowStyles(recipe, msg.payload, siteId, root);
          if (msg.payload.quietTitle) setupQuietTitle();
          sendResponse({ ok: true });
        });
      } else {
        applyRecipe(currentRecipe, msg.payload, siteId, root);
        applyShadowStyles(currentRecipe, msg.payload, siteId, root);
        if (msg.payload.quietTitle) setupQuietTitle();
        sendResponse({ ok: true });
      }
      return true;
    }
    if (msg.type === 'FORCE_REDIRECT' && msg.target) {
      try {
        window.location.href = msg.target;
        sendResponse({ ok: true });
      } catch (e) { sendResponse({ ok: false }); }
      return true;
    }
  });

  function applyShadowStyles(recipe, settings, siteId, rootEl) {
    if (!recipe?.rules) return;
    const site = settings?.sites?.[siteId];
    const isEnabled = settings?.enabled && site?.enabled !== false;
    if (!isEnabled) return;

    const defaults = recipe.defaultFeatures || {};
    const features = { ...defaults, ...(site?.features || {}) };
    const isFeatureEnabled = (id) => features[id] !== false;

    let css = '';
    for (const rule of recipe.rules) {
      if (!isFeatureEnabled(rule.featureId) || !rule.selectors?.length) continue;
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      const sel = rule.selectors.map(s => ':host-context(html[' + attr + '="true"]) ' + s.trim()).join(', ');
      css += sel + ' { display: none !important; }\n';
    }
    if (css) {
      const shadowHosts = ['ytd-app', 'shreddit-app', 'reddit-sidebar', 'faceplate-tracker'];
      for (const hostName of shadowHosts) {
        const hosts = document.querySelectorAll(hostName);
        for (const host of hosts) {
          if (host.shadowRoot) {
            let style = host.shadowRoot.getElementById('tranquil-shadow-style');
            if (!style) {
              style = document.createElement('style');
              style.id = 'tranquil-shadow-style';
              host.shadowRoot.appendChild(style);
            }
            style.textContent = css;
          }
        }
      }
    }
  }

  function runWithSettings(sync, session) {
    const siteId = getSiteId();
    if (!siteId) return;
    currentSiteId = siteId;
    const paused = (session?.pauseUntil || 0) > Date.now();
    if (!sync?.enabled || paused) {
      loadRecipe(siteId, (recipe) => {
        if (recipe) applyRecipe(recipe, { ...sync, sites: { [siteId]: { enabled: false } } }, siteId, root);
      });
      return;
    }
    loadRecipe(siteId, (recipe) => {
      currentRecipe = recipe;
      try {
        applyRecipe(recipe, sync, siteId, root);
        applyShadowStyles(recipe, sync, siteId, root);
        if (sync.quietTitle) setupQuietTitle();
        if (root.getAttribute('data-tranquil-hide-feed') === 'true' && !window.__tranquil_feed_counted) {
          window.__tranquil_feed_counted = true;
          chrome.runtime.sendMessage({ type: 'FEED_AVOIDED' }).catch(() => {});
        }
      } catch (e) {}
    });
  }

  window.addEventListener('yt-navigate-finish', () => {
    Promise.all([
      new Promise(r => chrome.storage.sync.get(null, r)),
      new Promise(r => chrome.storage.session.get(['pauseUntil'], r))
    ]).then(([sync, session]) => runWithSettings(sync, session)).catch(() => {});
  });
  window.addEventListener('popstate', () => {
    Promise.all([
      new Promise(r => chrome.storage.sync.get(null, r)),
      new Promise(r => chrome.storage.session.get(['pauseUntil'], r))
    ]).then(([sync, session]) => runWithSettings(sync, session)).catch(() => {});
  });

  function setupUrlObserver() {
    let lastUrl = window.location.href;
    let timeout = null;
    const observer = new MutationObserver(() => {
      if (timeout) return;
      timeout = requestAnimationFrame(() => {
        const url = window.location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          run();
        }
        timeout = null;
      });
    });
    // Limit observation to head (for title/meta) and body child changes
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  run();
  setupUrlObserver();
})();
