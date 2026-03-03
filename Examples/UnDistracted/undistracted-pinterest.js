'use strict';
/* global chrome */
chrome.runtime.onMessage.addListener(function (message) {
  runContentScript();
});
runContentScript();

let observer = new MutationObserver(() => {
  if (document.querySelector('.appContent')) {
    runContentScript();
    observer.disconnect();
  }
});

observer.observe(document.body, {
  subtree: true,
  attributes: true,
});

function runContentScript() {
  var css = '';
  const currentTime =
    new Date().getHours().toString().padStart(2, '0') +
    ':' +
    new Date().getMinutes().toString().padStart(2, '0');

  chrome.storage.sync.get(
    ['pinterestSettings', 'generalSettings'],
    ({ pinterestSettings, generalSettings }) => {
      const fromTime = generalSettings.disableDuringHours.value.fromTime;
      const toTime = generalSettings.disableDuringHours.value.toTime;
      // Remove existing and add new
      var existingStyle = document.getElementById('undistracted-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      if (
        generalSettings.disableFilters.value ||
        generalSettings.disableFiltersTemporary.value.active ||
        Number(
          generalSettings.disableDuringDays.value.split('')[new Date().getDay()]
        ) ||
        (generalSettings.disableDuringHours.value.active &&
          (fromTime < toTime
            ? fromTime <= currentTime && currentTime < toTime
            : (fromTime <= currentTime && currentTime <= '23:59') ||
              ('00:00' <= currentTime && currentTime < toTime)))
      ) {
        return;
      }

      // Hide Feed
      if (pinterestSettings.feed.value) {
        css += `[data-test-id*="homefeed"] #homefeed, [data-test-id*="homefeed"] > .masonryContainer {
              display: none !important;
            }
            `;
      }

      // Hide Search
      if (pinterestSettings.searchSuggestions.value) {
        css += `[data-test-id='search-story-suggestions-container'] {
              display: none !important;
            }
            `;
      }

      // Hide Sidebar
      if (pinterestSettings.sidebar.value) {
        css += `[data-test-id='pinterest-logo-home-button'] ~ * {
              display: none !important;
        }
        `;
      }

      // Remove Colors
      if (pinterestSettings.color && pinterestSettings.color.value) {
        css += `
      html {
        filter: saturate(0) !important;
      }
      `;
      }

      var style = document.createElement('style');
      style.setAttribute('id', 'undistracted-style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    }
  );
}
