'use strict';

(function () {
  const DMS_URL = 'https://www.instagram.com/direct/inbox/';
  const REDIRECT_PATHS = ['', '/', '/reels', '/reels/', '/explore', '/explore/', '/home'];

  function shouldRedirectToDMs() {
    const path = (window.location.pathname || '/').replace(/\/$/, '') || '';
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

  function tryRedirect() {
    shouldRedirectToDMs().then(function (go) {
      if (go) window.location.replace(DMS_URL);
    });
  }

  tryRedirect();
  window.addEventListener('popstate', tryRedirect);
})();
