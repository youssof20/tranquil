'use strict';

const DEFAULT_SYNC = {
  enabled: true,
  pauseUntil: 0,
  quietTitle: false,
  sites: {
    youtube: { enabled: true, features: {} },
    reddit: { enabled: true, features: {} },
    instagram: { enabled: true, features: {} },
    twitter: { enabled: true, features: {} },
    facebook: { enabled: true, features: {} },
    linkedin: { enabled: true, features: {} }
  },
  mode: 'custom' // work | social | custom
};

const SITE_ORIGINS = {
  youtube: ['*://*.youtube.com/*'],
  reddit: ['*://*.reddit.com/*'],
  instagram: ['*://*.instagram.com/*'],
  twitter: ['*://*.twitter.com/*', '*://*.x.com/*'],
  facebook: ['*://*.facebook.com/*'],
  linkedin: ['*://*.linkedin.com/*']
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (data) => {
    if (Object.keys(data).length === 0) {
      chrome.storage.sync.set(DEFAULT_SYNC);
    }
  });
  chrome.storage.session.set({ pauseUntil: 0, focusModeActive: false });
  updateDnrRules();
  updateBadge();
  chrome.contextMenus.create({
    id: 'tranquil-zap',
    title: 'Tranquil: Hide this element',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'tranquil-zap' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'ZAP_ELEMENT' }).catch(() => {});
  }
});

function updateBadge() {
  chrome.storage.session.get(['pauseUntil'], (session) => {
    const paused = (session?.pauseUntil || 0) > Date.now();
    if (paused) {
      chrome.action.setBadgeText({ text: 'P' });
      chrome.action.setBadgeBackgroundColor({ color: '#eab308' });
      return;
    }
    chrome.storage.sync.get(['enabled', 'mode'], (sync) => {
      if (sync.enabled && sync.mode === 'work') {
        chrome.action.setBadgeText({ text: 'W' });
        chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync') updateDnrRules();
  if (area === 'sync' || area === 'session') updateBadge();
});

async function updateDnrRules() {
  const { enabled, sites } = await chrome.storage.sync.get(['enabled', 'sites']);
  const rules = [];
  let id = 1;
  if (!enabled) {
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: await getDynamicRuleIds() });
    return;
  }
  const hasYoutube = await chrome.permissions.contains({ origins: SITE_ORIGINS.youtube });
  if (hasYoutube && sites?.youtube?.enabled) {
    const f = sites.youtube.features || {};
    if (f.redirect_home) {
      rules.push({
        id: id++,
        priority: 1,
        action: { type: 'redirect', redirect: { url: 'https://www.youtube.com/feed/subscriptions' } },
        condition: {
          regexFilter: '^https://(www\\.)?youtube\\.com/(\\?.*)?$',
          resourceTypes: ['main_frame']
        }
      });
    }
    if (f.hide_trending) {
      rules.push({
        id: id++,
        priority: 1,
        action: { type: 'redirect', redirect: { url: 'https://www.youtube.com' } },
        condition: {
          regexFilter: '^https://[^/]*youtube\\.com/feed/(trending|explore)',
          resourceTypes: ['main_frame']
        }
      });
    }
  }
  const hasInstagram = await chrome.permissions.contains({ origins: SITE_ORIGINS.instagram });
  if (hasInstagram && sites?.instagram?.enabled) {
    const f = sites.instagram.features || {};
    const dmsUrl = 'https://www.instagram.com/direct/inbox/';
    if (f.redirect_to_dms) {
      rules.push({
        id: id++,
        priority: 1,
        action: { type: 'redirect', redirect: { url: dmsUrl } },
        condition: { regexFilter: '^https://[^/]*instagram\\.com/(\\?.*)?$', resourceTypes: ['main_frame'] }
      });
      rules.push({
        id: id++,
        priority: 1,
        action: { type: 'redirect', redirect: { url: dmsUrl } },
        condition: { regexFilter: '^https://[^/]*instagram\\.com/reels', resourceTypes: ['main_frame'] }
      });
      rules.push({
        id: id++,
        priority: 1,
        action: { type: 'redirect', redirect: { url: dmsUrl } },
        condition: { regexFilter: '^https://[^/]*instagram\\.com/explore', resourceTypes: ['main_frame'] }
      });
    } else {
      if (f.hide_reels) {
        rules.push({
          id: id++,
          priority: 1,
          action: { type: 'redirect', redirect: { url: 'https://www.instagram.com/' } },
          condition: { regexFilter: '^https://[^/]*instagram\\.com/reels', resourceTypes: ['main_frame'] }
        });
      }
      if (f.hide_explore) {
        rules.push({
          id: id++,
          priority: 1,
          action: { type: 'redirect', redirect: { url: 'https://www.instagram.com/' } },
          condition: { regexFilter: '^https://[^/]*instagram\\.com/explore', resourceTypes: ['main_frame'] }
        });
      }
    }
  }
  const removeIds = await getDynamicRuleIds();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules: rules
  });
}

async function getDynamicRuleIds() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  return existing.map(r => r.id);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'REQUEST_SITE_PERMISSION') {
    const origins = SITE_ORIGINS[msg.siteId];
    if (origins) {
      chrome.permissions.request({ origins }, (granted) => {
        sendResponse({ granted });
      });
    } else {
      sendResponse({ granted: false });
    }
    return true;
  }
  if (msg.type === 'PAUSE_10_MIN') {
    const pauseUntil = Date.now() + 10 * 60 * 1000;
    chrome.storage.session.set({ pauseUntil }, () => {
      updateBadge();
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(null, sendResponse);
    return true;
  }
  if (msg.type === 'SET_SETTINGS') {
    chrome.storage.sync.set(msg.payload, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'FEED_AVOIDED') {
    const today = new Date().toDateString();
    chrome.storage.local.get({ feedsAvoidedToday: 0, feedsAvoidedDate: '' }, (data) => {
      const count = data.feedsAvoidedDate === today ? (data.feedsAvoidedToday || 0) + 1 : 1;
      chrome.storage.local.set({ feedsAvoidedToday: count, feedsAvoidedDate: today }, () => sendResponse({ ok: true }));
    });
    return true;
  }
});
