'use strict';
/* global chrome */
chrome.runtime.onMessage.addListener(function (message) {
  runContentScript();
});

runContentScript();

function runContentScript() {
  var css = '';
  const currentTime =
    new Date().getHours().toString().padStart(2, '0') +
    ':' +
    new Date().getMinutes().toString().padStart(2, '0');

  chrome.storage.sync.get(
    ['netflixSettings', 'generalSettings'],
    ({ netflixSettings, generalSettings }) => {
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

      // Hide Recommendations
      if (netflixSettings.hideAllShowMyAndContinue.value) {
        const billboardVideo = document.querySelector('.billboard video');

        if (billboardVideo) {
          billboardVideo.pause();
        }

        css += `

        .mainView {
          margin-top: 5em;
        }

        span.notifications div {
          display: none;
        }

        .billboard-row, .lolomoRow:not([data-list-context='continueWatching']):not([data-list-context='queue']) {
        display: none !important;
        }
        `;
      }

      // Hide Continue Watching
      if (netflixSettings.hideContinueWatching.value) {
        css += `
        [data-list-context='continueWatching'] {
          display: none !important;
        }
        `;
      }

      // Hide My List
      if (netflixSettings.hideMyList.value) {
        css += `
        [data-list-context='queue'] {
          display: none !important;
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
