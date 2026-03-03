'use strict';
/* global browser*/
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
    ['instagramSettings', 'generalSettings'],
    ({ instagramSettings, generalSettings }) => {
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
      if (instagramSettings.feed.value) {
        css += `div.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x6s0dn4.x1oa3qoh.x1nhvcw1 {
              display: none !important;
            }
            `;
      }

      // Hide Likes Comments
      if (instagramSettings.likesComments.value) {
        css += `div._ae1h._ae1i._ae1l, div.xvbhtw8.x78zum5.xdt5ytf.x5yr21d.x1n2onr6 {
              display: none !important;
            }
            `;
      }

      // Hide Stories
      if (instagramSettings.stories.value) {
        css += `[data-pagelet="story_tray"] {
              display: none !important;
            }
            `;
      }

      // Block Reels
      if (instagramSettings.reels.value) {
        css += `a[href="/reels/"] {
              display: none !important;
            }
            `;
      }

      // Block Explore
      if (instagramSettings.explore.value) {
        css += `a[href="/explore/"] {
              display: none !important;
            }
            `;
      }

      // Hide Suggested for you
      if (instagramSettings.suggestedForYou.value) {
        css += `div.x9f619.xjbqb8w.x78zum5.x15mokao.x1ga7v0g.x16uus16.xbiv7yw.xqui205.x1e56ztr.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1
        ,div.x6s0dn4.xd18jyu.xso031l.x78zum5.x1q0g3np.x1ejq31n.x18oe1m7.xstzfhl.x1sy0etr.x1y1aw1k.xyri2b.xwxc41k.x1c1uobl
        ,div.x6s0dn4.xd18jyu.xso031l.x78zum5.x1q0g3np.x1ejq31n.x18oe1m7.xstzfhl.x1sy0etr.x1y1aw1k.xyri2b.xwxc41k.x1c1uobl + div
        ,article + div h3
        ,article + div ~ article
        ,article:has(> div:nth-of-type(2)):not(:has(> div:nth-of-type(3))) {
          display: none !important;
        }
        `;
      }

      // Remove Colors
      if (instagramSettings.color && instagramSettings.color.value) {
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
