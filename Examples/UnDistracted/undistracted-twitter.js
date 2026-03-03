'use strict';
/* global chrome */
chrome.runtime.onMessage.addListener(function (message) {
  runContentScript();
});

runContentScript();

function runContentScript() {
  (function attachTabClickListener() {
    function attachClickEvent(observer) {
      const tabs = document.querySelectorAll(
        '[aria-label="Home timeline"] span'
      );
      if (tabs.length === 0) return false;
      tabs.forEach((tab) => {
        const tabContainer = tab.closest('[role="presentation"]');
        if (tab.textContent.includes('For you')) {
          tabContainer.classList.add('for-you');
        } else if (tab.textContent.includes('Following')) {
          tabContainer.classList.add('following');
        }
      });

      const timeline = document.querySelector(
        '[aria-label="Timeline: Your Home Timeline"]'
      );
      const followingTab = document.querySelector(
        '.following [aria-selected="true"]'
      );
      const forYouTab = document.querySelector(
        '.for-you [aria-selected="true"]'
      );

      if (timeline) {
        if (followingTab) {
          timeline.classList.remove('for-you-timeline');
          timeline.classList.add('following-timeline');
        } else if (forYouTab) {
          timeline.classList.remove('following-timeline');
          timeline.classList.add('for-you-timeline');
        }

        (function () {
          chrome.storage.sync.get(
            ['twitterSettings', 'generalSettings'],
            ({ twitterSettings, generalSettings }) => {
              const fromTime =
                generalSettings.disableDuringHours.value.fromTime;
              const toTime = generalSettings.disableDuringHours.value.toTime;

              if (
                generalSettings.disableFilters.value ||
                generalSettings.disableFiltersTemporary.value.active ||
                Number(
                  generalSettings.disableDuringDays.value.split('')[
                    new Date().getDay()
                  ]
                ) ||
                (generalSettings.disableDuringHours.value.active &&
                  (fromTime < toTime
                    ? fromTime <= currentTime && currentTime < toTime
                    : (fromTime <= currentTime && currentTime <= '23:59') ||
                      ('00:00' <= currentTime && currentTime < toTime)))
              ) {
                return;
              }

              // Hide For You
              if (twitterSettings.forYou.value) {
                document
                  .querySelector('.following [aria-selected="false"]')
                  ?.click();
              }
            }
          );
        })();

        observer.disconnect();
        return true;
      }
    }

    function observeDOM() {
      const observer = new MutationObserver(function (mutations) {
        if (attachClickEvent(observer)) {
          observer.disconnect();
        }
      });
      const config = { childList: true, subtree: true };
      observer.observe(document.body, config);
    }
    function init() {
      if (!attachClickEvent()) {
        observeDOM();
      }
    }
    init();
    window.addEventListener('popstate', init);
  })();

  var css = '';
  const currentTime =
    new Date().getHours().toString().padStart(2, '0') +
    ':' +
    new Date().getMinutes().toString().padStart(2, '0');

  chrome.storage.sync.get(
    ['twitterSettings', 'generalSettings'],
    ({ twitterSettings, generalSettings }) => {
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

      // Hide Trends
      if (twitterSettings.trends.value) {
        css += `
      .Trends, [aria-label="Timeline: Trending now"], [href="/explore"], [aria-label="Timeline: Explore"] {
        display: none !important;
      }
      `;
      }

      // Hide For You
      if (twitterSettings.forYou.value) {
        css += `
      .for-you-timeline {
        visibility: hidden !important;
      }

      .for-you {
        display: none !important;
      }
      `;
      }

      // Hide Who To Follow
      if (twitterSettings.whoToFollow.value) {
        css += `
      .wtf-module, [aria-label="Who to follow"] {
        display: none !important;
      }
      `;
      }

      // Hide Topics to follow
      if (twitterSettings.topics.value) {
        css += `
      [aria-label="Timeline: "], [href$="/topics"] {
        display: none !important;
      }
      `;
      }

      // Hide Media
      if (twitterSettings.media.value) {
        css += `
      .AdaptiveMedia, [aria-label="Image"], video {
        display: none !important;
      }
      `;
      }

      // Hide Timeline - Opacity instead of Display to avoid re-trigger of layout drawing and hence slowdown
      if (twitterSettings.timeline.value) {
        css += `
        [role='main']#timeline .stream-container, [aria-label="Timeline: Your Home Timeline"] {
          visibility: hidden !important;
        }
        `;
      }

      // Remove Colors
      if (twitterSettings.color && twitterSettings.color.value) {
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
