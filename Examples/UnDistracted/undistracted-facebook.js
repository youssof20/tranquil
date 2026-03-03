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
    ['facebookSettings', 'generalSettings'],
    ({ facebookSettings, generalSettings }) => {
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
      if (facebookSettings.feed.value) {
        css += `
      div.x1hc1fzr.x1unhpq9.x6o7n8i {
        display: none !important;
      }

      /* for mobile */
        #screen-root:has([aria-label="Facebook logo"]) > div > div > :nth-child(n+7) {
          display: none !important;
        }
      `;
      }

      // Hide Likes and Comments box
      if (facebookSettings.likesComments.value) {
        css += `
      div.xabvvm4.xeyy32k.x1ia1hqs.x1a2w583.x6ikm8r.x10wlt62 {
        display: none !important;
      }

      /* for mobile */
      div:has(>[aria-label *= "like"]) {
        display: none !important;
      }
      `;
      }

      // Hide Chat Sidebar
      if (facebookSettings.chatSidebar.value) {
        css += `
      .fbChatSidebar, #BuddylistPagelet, [data-pagelet="ChatTab"], [aria-label="New Message"], [aria-label="New message"], [aria-label="Messenger"], [aria-label="Nieuw chatbericht"] {
        display: none !important;
      }

      .x1n2onr6.x1uc6qws.xyen2ro {
        display: none !important;
      }
      `;
      }

      // Hide Marketplace
      if (facebookSettings.marketplace.value) {
        css += `
        [href*="/marketplace/"] {
          display: none !important;
        }

        /* for mobile */
        [aria-label *= "marketplace"] {
          display: none !important;
        }
      `;
      }

      // Hide Video and Reels
      if (facebookSettings.reel.value) {
        css += `
              [href*="/reel/"], [href*="/watch/"] {
                display: none !important;
              }

              [data-type="video"],
              video,
              [role="tab"][aria-label*="reel"],
              [data-is-reels="true"] {
                display: none !important;
              }
                  `;
      }

      // Hide Stories
      if (facebookSettings.stories.value) {
        css += `
        [aria-label="Stories"], [aria-label="Verhalen"], [aria-label="Relacje"] {
          display: none !important;
        }

        /* for mobile */
        #screen-root:has([aria-label="Facebook logo"]) > div > div > :nth-child(6) {
          display: none !important;
        }
        `;
      }

      // Remove Colors
      if (facebookSettings.color && facebookSettings.color.value) {
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
