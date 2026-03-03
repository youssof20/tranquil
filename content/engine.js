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
    if (!settings?.enabled || !site?.enabled) {
      for (const rule of recipe.rules) {
        const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
        rootEl.removeAttribute(attr);
      }
      const style = document.getElementById('tranquil-recipe-style');
      if (style) style.textContent = '';
      return;
    }
    const defaults = recipe.defaultFeatures || {};
    const features = { ...defaults, ...(site.features || {}) };
    const enabled = (id) => features[id] !== false;

    for (const rule of recipe.rules) {
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      if (enabled(rule.featureId)) rootEl.setAttribute(attr, 'true');
      else rootEl.removeAttribute(attr);
    }

    let style = document.getElementById('tranquil-recipe-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'tranquil-recipe-style';
      (document.head || root).appendChild(style);
    }
    let css = '';
    for (const rule of recipe.rules) {
      if (!enabled(rule.featureId)) continue;
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      if (rule.selectors && rule.selectors.length) {
        const sel = rule.selectors.map(s => 'html[' + attr + '="true"] ' + s.trim()).join(',\n');
        css += sel + ' { display: none !important; }\n';
      }
    }
    if (recipe.reflow) {
      for (const reflow of recipe.reflow) {
        const allHidden = reflow.whenHidden.every(id => enabled(id));
        if (allHidden && reflow.css) css += reflow.css + '\n';
      }
    }
    style.textContent = css;
  }

  function setupQuietTitle() {
    const stripNotifications = () => {
      const t = document.title;
      const cleaned = t.replace(/^\s*\(\d+\)\s*/, '').trim();
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
      if (!siteId) { sendResponse({ ok: false }); return true; }
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

  function injectShadowStyle(hostSelector, css) {
    const host = document.querySelector(hostSelector);
    if (host?.shadowRoot) {
      let style = host.shadowRoot.getElementById('tranquil-shadow-style');
      if (!style) {
        style = document.createElement('style');
        style.id = 'tranquil-shadow-style';
        host.shadowRoot.appendChild(style);
      }
      style.textContent = css.replace(/html\[(data-tranquil-[^\]]+)\]/g, ':host-context(html[$1])');
    }
  }

  function applyShadowStyles(recipe, settings, siteId, rootEl) {
    if (!recipe?.rules) return;
    const site = settings?.sites?.[siteId];
    if (!settings?.enabled || !site?.enabled) return;
    const defaults = recipe.defaultFeatures || {};
    const features = { ...defaults, ...(site.features || {}) };
    const enabled = (id) => features[id] !== false;
    let css = '';
    for (const rule of recipe.rules) {
      if (!enabled(rule.featureId) || !rule.selectors?.length) continue;
      const attr = rule.attribute || ('data-tranquil-' + rule.featureId.replace(/_/g, '-'));
      const sel = rule.selectors.map(s => 'html[' + attr + '="true"] ' + s.trim()).join(', ');
      css += sel + ' { display: none !important; }\n';
    }
    if (css) {
      injectShadowStyle('ytd-app', css);
      injectShadowStyle('shreddit-app', css);
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

  run();
})();
