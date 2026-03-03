'use strict';

(function () {
  const DMS_URL = 'https://www.instagram.com/direct/inbox/';
  const REDIRECT_PATHS = ['', '/', '/reels', '/reels/', '/explore', '/explore/', '/home'];

  function getCurrentPath() {
    return (window.location.pathname || '/').replace(/\/$/, '') || '';
  }

  function shouldRedirectToDMs() {
    const path = getCurrentPath();
    if (!REDIRECT_PATHS.includes(path)) return false;
    return new Promise(function (resolve) {
      chrome.storage.session.get(['pauseUntil'], function (session) {
        const paused = (session?.pauseUntil || 0) > Date.now();
        if (paused) { resolve(false); return; }
        chrome.storage.sync.get({ enabled: true, sites: {} }, function (sync) {
          if (!sync.enabled || !sync.sites?.instagram?.enabled) { resolve(false); return; }
          const r = sync.sites.instagram.features?.redirect_to_dms === true;
          resolve(r);
        });
      });
    });
  }

  function checkAndRedirect() {
    shouldRedirectToDMs().then(function (go) {
      if (go) window.location.replace(DMS_URL);
    });
  }

  // 1. Run on initial load
  checkAndRedirect();

  // 2. SPA: Instagram uses pushState/replaceState — they don't fire popstate. Patch them.
  var origPushState = history.pushState;
  var origReplaceState = history.replaceState;
  history.pushState = function () {
    origPushState.apply(this, arguments);
    checkAndRedirect();
  };
  history.replaceState = function () {
    origReplaceState.apply(this, arguments);
    checkAndRedirect();
  };

  // 3. Back/forward
  window.addEventListener('popstate', checkAndRedirect);

  // 4. DOM updates (e.g. in-app nav that doesn't update history immediately, or race conditions)
  var redirectTimeout = null;
  function scheduleRedirectCheck() {
    if (redirectTimeout) clearTimeout(redirectTimeout);
    redirectTimeout = setTimeout(function () {
      redirectTimeout = null;
      checkAndRedirect();
    }, 150);
  }

  function observeBody() {
    var body = document.body;
    if (!body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeBody);
      }
      return;
    }
    var observer = new MutationObserver(scheduleRedirectCheck);
    observer.observe(body, { childList: true, subtree: true });
  }
  observeBody();
})();
