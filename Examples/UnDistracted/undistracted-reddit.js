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
    ['redditSettings', 'generalSettings'],
    ({ redditSettings, generalSettings }) => {
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

      // Hide Comments
      if (redditSettings.hideComments.value) {
        css += `
      .commentarea, .CommentTree, .CommentsPage__tools {
        display: none !important;
      }
      `;
      }

      // Hide Front Page
      if (redditSettings.hideFrontPageFeed.value) {
        css += `
        iframe[name*='subreddit":""'] ~ div #siteTable {
        display: none !important;
      }

      .PostsList {
        display: none !important;
      }

      .CommunityHeader ~ .PostsList {
        display: unset;
      }

      `;
      }

      // Hide Popular
      if (redditSettings.popular.value) {
        css += `
      a[href$='/r/popular/'] {
        display: none !important;
      }
      `;
      }

      // Hide All
      if (redditSettings.all.value) {
        css += `
      a[href$='/r/all/'] {
        display: none !important;
      }
      `;
      }

      // Remove Colors
      if (redditSettings.color && redditSettings.color.value) {
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
