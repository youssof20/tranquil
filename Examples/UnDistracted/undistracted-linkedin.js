'use strict';
/* global chrome */
chrome.runtime.onMessage.addListener(function (message) {
  runContentScript();
});

runContentScript();
window.addEventListener('load', runContentScript);

function runContentScript() {
  var css = '';
  const currentTime =
    new Date().getHours().toString().padStart(2, '0') +
    ':' +
    new Date().getMinutes().toString().padStart(2, '0');

  chrome.storage.sync.get(
    ['linkedinSettings', 'generalSettings'],
    ({ linkedinSettings, generalSettings }) => {
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
          generalSettings.disableDuringDays.value.split('')[
            new Date().getDay()
          ],
        ) ||
        (generalSettings.disableDuringHours.value.active &&
          (fromTime < toTime ?
            fromTime <= currentTime && currentTime < toTime
          : (fromTime <= currentTime && currentTime <= '23:59') ||
            ('00:00' <= currentTime && currentTime < toTime)))
      ) {
        return;
      }
      // Hide Feed
      if (linkedinSettings.feed.value) {
        css += `
      #voyager-feed main#main[aria-label='Main Feed'], .scaffold-layout__content main[aria-label="Main Feed"] > div:has([data-finite-scroll-hotkey-context="FEED"]), .scaffold-layout__content main[aria-label="Main Feed"] > div:has(scaffold-finite-scroll__content) {
        display: none !important;
      }
      #voyager-feed main#main[aria-label='Hoofdfeed'], .scaffold-layout__content main[aria-label="Hoofdfeed"] > div:has([data-finite-scroll-hotkey-context="FEED"]), .scaffold-layout__content main[aria-label="Hoofdfeed"] > div:has(scaffold-finite-scroll__content) {
        display: none !important;
      }
      #voyager-feed main#main[aria-label='Hauptfeed'], .scaffold-layout__content main[aria-label="Hauptfeed"] > div:has([data-finite-scroll-hotkey-context="FEED"]), .scaffold-layout__content main[aria-label="Hauptfeed"] > div:has(scaffold-finite-scroll__content) {
        display: none !important;
      }
      #voyager-feed main#main[aria-label='Fil d’actualité principal'], .scaffold-layout__content main[aria-label="Fil d’actualité principal"] > div:has([data-finite-scroll-hotkey-context="FEED"]), .scaffold-layout__content main[aria-label="Fil d’actualité principal"] > div:has(scaffold-finite-scroll__content) {
        display: none !important;
      }

      /*
      Mobile site
      Hide all feeds and then show company feed back
      */
      .feeds .feed-container {
        display: none !important;
      }

      .company-page ~ .feeds .feed-container {
        display: none !important;
      }


      /*
      below taken from "Distraction Free for LinkedIn" extension
      */
      .feed-shared-update-v2:not(section.fixed-full > .feed-shared-update-v2):not(div:not([data-id]) > .occludable-update > .feed-shared-update-v2) {
        visibility: hidden !important;
      }

      div[data-testid="mainFeed"], div[componentkey*="mainFeed"] {
        visibility: hidden !important;
      }

      main > .mb2.artdeco-dropdown--placement-bottom {
        visibility: hidden !important;
      }

      `;
      }

      // Hide Messaging
      if (linkedinSettings.messaging.value) {
        css += `
        #msg-overlay, .msg-overlay-container {
          display: none !important;
        }

      /* for mobile */
        [data-nav-type="MESSAGING"] {
          display: none !important;
        }
      `;
      }

      // Hide LinkedIn News
      if (linkedinSettings.news.value) {
        css += `
        .news-module, #feed-news-module {
          display: none !important;
        }
      `;
      }

      // Hide LinkedIn Likes Comments
      if (linkedinSettings.likesComments.value) {
        css += `
        .update-v2-social-activity, [data-feed-action="socialActionsLabel"], .social-actions-panel, #comment-preview {
          display: none !important;
        }

        /* for mobile */
        .main-feed-activity-card__social-actions, .main-feed-activity-card__social-actions + div {
          display: none !important;
        }
      `;
      }

      // Remove Colors
      if (linkedinSettings.color && linkedinSettings.color.value) {
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
    },
  );
}
