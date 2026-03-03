/* global chrome */

// Avoid circular
const fallbackUrl = 'https://www.google.com';
var myTimer;

const relatedDomains = {
  facebook: ['facebook.com', 'fb.com'],
  youtube: ['youtube.com', 'youtu.be'],
  twitter: [
    'twitter.com',
    'twimg.com',
    'twttr.net',
    'twttr.com',
    'abs.twimg.com',
  ],
  reddit: ['reddit.com', 'old.reddit.com'],
  netflix: ['netflix.com'],
  linkedin: ['linkedin.com'],
  instagram: ['instagram.com'],
  pinterest: ['pinterest.com'],
};

const allSettings = {
  facebookSettings: {
    blockSite: {
      value: false,
      description: 'Block Facebook',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    feed: {
      value: false,
      description: 'Hide Feed',
      order: 1,
      type: 'switch',
    },
    redirectToFriendsFeed: {
      value: false,
      description: 'Force redirect to Friends feed',
      order: 2,
      type: 'switch',
    },
    likesComments: {
      value: false,
      description: 'Hide Likes and Comments',
      order: 3,
      type: 'switch',
    },
    chatSidebar: {
      value: false,
      description: 'Hide Chat Sidebar',
      order: 4,
      type: 'switch',
    },
    watchFeed: {
      value: false,
      description: 'Hide Watch Feed',
      order: 5,
      type: 'switch',
      enabled: false,
    },
    marketplace: {
      value: false,
      description: 'Hide Marketplace',
      order: 6,
      type: 'switch',
    },
    stories: {
      value: false,
      description: 'Hide Stories',
      order: 7,
      type: 'switch',
    },
    reel: {
      value: false,
      description: 'Hide Video and Reels',
      order: 8,
      type: 'switch',
      paid: true,
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 9,
      type: 'switch',
      paid: true,
    },
  },
  youtubeSettings: {
    blockSite: {
      value: false,
      description: 'Block YouTube',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    recommendations: {
      value: false,
      description: 'Hide Recommendations',
      order: 1,
      type: 'switch',
    },
    redirectToSubscriptions: {
      value: false,
      description: 'Force redirect to my subscriptions',
      order: 2,
      type: 'switch',
    },
    breakingNews: {
      value: false,
      description: 'Hide Breaking News',
      order: 3,
      type: 'switch',
    },
    sidebar: {
      value: false,
      description: 'Hide Sidebar',
      order: 4,
      type: 'switch',
    },
    comments: {
      value: false,
      description: 'Hide Comments',
      order: 5,
      type: 'switch',
    },
    thumbnail: {
      value: '0',
      description: 'Blur/Hide Thumbnails',
      order: 6,
      type: 'switch-multi',
    },
    upNext: {
      value: false,
      description: 'Hide Up Next Suggestions',
      order: 7,
      type: 'switch',
    },
    shorts: {
      value: false,
      description: 'Hide Shorts',
      order: 8,
      type: 'switch',
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 9,
      type: 'switch',
      paid: true,
    },
  },
  twitterSettings: {
    blockSite: {
      value: false,
      description: 'Block Twitter',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    timeline: {
      value: false,
      description: 'Hide Timeline',
      order: 1,
      type: 'switch',
    },
    forYou: {
      value: false,
      description: 'Hide For You Timeline',
      order: 2,
      type: 'switch',
    },
    trends: {
      value: false,
      description: 'Hide Trends',
      order: 3,
      type: 'switch',
    },
    whoToFollow: {
      value: false,
      description: 'Hide Who to follow',
      order: 4,
      type: 'switch',
    },
    topics: {
      value: false,
      description: 'Hide Topics to follow',
      order: 5,
      type: 'switch',
      enabled: false,
    },
    media: {
      value: false,
      description: 'Hide all media',
      order: 6,
      type: 'switch',
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 7,
      type: 'switch',
      paid: true,
    },
  },
  redditSettings: {
    blockSite: {
      value: false,
      description: 'Block Reddit',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    hideComments: {
      value: false,
      description: 'Hide comments (old.reddit only)',
      order: 1,
      type: 'switch',
      // enabled: false
    },
    hideFrontPageFeed: {
      value: false,
      description: 'Hide Front page feed (old.reddit only)',
      order: 2,
      type: 'switch',
      // enabled: false
    },
    popular: {
      value: false,
      description: 'Block r/popular',
      type: 'switch',
      order: 3,
      enabled: false,
    },
    all: {
      value: false,
      description: 'Block r/all',
      type: 'switch',
      order: 4,
      enabled: false,
    },
    allowed: {
      value: '0',
      description: 'Allow',
      order: 5,
      type: 'switch-multi',
      paid: true,
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 6,
      type: 'switch',
      paid: true,
    },
  },
  netflixSettings: {
    blockSite: {
      value: false,
      description: 'Block Netflix',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    hideAllShowMyAndContinue: {
      value: false,
      description: 'Hide Recommendations',
      order: 1,
      type: 'switch',
    },
    hideContinueWatching: {
      value: false,
      description: 'Hide Continue Watching',
      type: 'switch',
      order: 2,
    },
    hideMyList: {
      value: false,
      description: 'Hide My List',
      type: 'switch',
      order: 3,
    },
  },
  linkedinSettings: {
    blockSite: {
      value: false,
      description: 'Block LinkedIn',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    feed: {
      value: false,
      description: 'Hide Feed',
      order: 1,
      type: 'switch',
    },
    messaging: {
      value: false,
      description: 'Hide Messaging popup',
      order: 2,
      type: 'switch',
    },
    news: {
      value: false,
      description: 'Hide LinkedIn News',
      order: 3,
      type: 'switch',
    },
    likesComments: {
      value: false,
      description: 'Hide Likes and Comments',
      order: 4,
      type: 'switch',
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 5,
      type: 'switch',
      paid: true,
    },
  },
  instagramSettings: {
    blockSite: {
      value: false,
      description: 'Block Instagram',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    feed: {
      value: false,
      description: 'Hide Feed',
      order: 1,
      type: 'switch',
    },
    likesComments: {
      value: false,
      description: 'Hide Likes and Comments',
      order: 2,
      type: 'switch',
    },
    stories: {
      value: false,
      description: 'Hide Stories',
      order: 3,
      type: 'switch',
    },
    reels: {
      value: false,
      description: 'Block Reels',
      order: 4,
      type: 'switch',
    },
    explore: {
      value: false,
      description: 'Block Explore',
      order: 5,
      type: 'switch',
    },
    suggestedForYou: {
      value: false,
      description: 'Hide Suggested for you',
      order: 6,
      type: 'switch',
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 7,
      type: 'switch',
      paid: true,
    },
  },
  pinterestSettings: {
    blockSite: {
      value: false,
      description: 'Block Pinterest',
      order: 0,
      type: 'switch',
      customClass: 'red-setting',
    },
    feed: {
      value: false,
      description: 'Hide All Feed',
      order: 1,
      type: 'switch',
    },
    searchSuggestions: {
      value: false,
      description: 'Hide Search Suggestions',
      order: 2,
      type: 'switch',
    },
    sidebar: {
      value: false,
      description: 'Hide Sidebar',
      order: 3,
      type: 'switch',
    },
    color: {
      value: false,
      description: 'Remove Colors',
      order: 4,
      type: 'switch',
      paid: true,
    },
  },
  generalSettings: {
    disableFilters: {
      value: false,
      description: 'Pause all filters',
      type: 'switch',
      enabled: false,
      order: 1,
    },
    disableFiltersTemporary: {
      value: { active: false, pauseTime: 5, endTimestamp: '' },
      description: 'Pause for',
      type: 'switch-with-meta',
      order: 2,
    },
    disableDuringHours: {
      value: { active: false, fromTime: '', toTime: '' },
      description: 'Pause during',
      type: 'switch-with-time-period',
      order: 3,
    },
    disableDuringDays: {
      value: '0000000',
      description: 'Pause on',
      type: 'checkbox-list',
      paid: true,
      order: 4,
    },
    customSitesToBlock: {
      value: { active: false, customURLList: [] },
      description: 'Block list',
      type: 'text-list',
      order: 5,
    },
    customRedirectURL: {
      value: 'zone.undistracted.app',
      description: 'Redirect to',
      type: 'text',
      order: 6,
    },
    password: {
      value: { active: false, password: '' },
      description: 'Lock Settings',
      type: 'text-switch',
      paid: true,
      order: 7,
    },
    payment: {
      type: 'payment',
      order: 8,
      enabled: true,
    },
    communicateToDev: {
      buttonList: [
        {
          title: 'Rate & Review',
          action: 'redirect',
          iconColor: 'orange',
          to: 'https://chrome.google.com/webstore/detail/undistracted/pjjgklgkfeoeiebjogplpnibpfnffkng/reviews',
        },
        {
          title: '',
          action: 'notice',
          iconColor: 'yellow',
          to: 'https://www.undistracted.app/notice',
        },
        {
          title: 'Contact Developer',
          action: 'mail',
          iconColor: 'blue',
          to: `developer@undistracted.app?subject=Feedback&body=Version: ${
            chrome.runtime.getManifest().version
          } %0AScreenshot (if applicable): `,
        },
      ],
      type: 'button-list',
      order: 9,
    },
  },
};

function setLaunchPages(reason, _previousVersion = '') {
  if (reason === 'update') {
    if (chrome.runtime.getManifest().version === '3.1') {
      chrome.tabs.create({ url: 'https://www.undistracted.app/updated' });
    }
  }
}

function loadStorageToLocal(callbackOnLoad) {
  chrome.storage.sync.get(
    [
      'twitterSettings',
      'youtubeSettings',
      'facebookSettings',
      'redditSettings',
      'netflixSettings',
      'linkedinSettings',
      'instagramSettings',
      'pinterestSettings',
      'generalSettings',
    ],
    (storageData) => {
      if (storageData.twitterSettings) {
        Object.keys(storageData.twitterSettings).forEach((filterKey) => {
          allSettings.twitterSettings[filterKey].value =
            storageData.twitterSettings[filterKey].value;
        });
      }
      if (storageData.youtubeSettings) {
        Object.keys(storageData.youtubeSettings).forEach((filterKey) => {
          allSettings.youtubeSettings[filterKey].value =
            storageData.youtubeSettings[filterKey].value;
        });
      }
      if (storageData.facebookSettings) {
        Object.keys(storageData.facebookSettings).forEach((filterKey) => {
          allSettings.facebookSettings[filterKey].value =
            storageData.facebookSettings[filterKey].value;
        });
      }
      if (storageData.redditSettings) {
        Object.keys(storageData.redditSettings).forEach((filterKey) => {
          allSettings.redditSettings[filterKey].value =
            storageData.redditSettings[filterKey].value;
        });
      }
      if (storageData.netflixSettings) {
        Object.keys(storageData.netflixSettings).forEach((filterKey) => {
          allSettings.netflixSettings[filterKey].value =
            storageData.netflixSettings[filterKey].value;
        });
      }
      if (storageData.linkedinSettings) {
        Object.keys(storageData.linkedinSettings).forEach((filterKey) => {
          allSettings.linkedinSettings[filterKey].value =
            storageData.linkedinSettings[filterKey].value;
        });
      }
      if (storageData.instagramSettings) {
        Object.keys(storageData.instagramSettings).forEach((filterKey) => {
          allSettings.instagramSettings[filterKey].value =
            storageData.instagramSettings[filterKey].value;
        });
      }
      if (storageData.pinterestSettings) {
        Object.keys(storageData.pinterestSettings).forEach((filterKey) => {
          allSettings.pinterestSettings[filterKey].value =
            storageData.pinterestSettings[filterKey].value;
        });
      }
      if (storageData.generalSettings) {
        Object.keys(storageData.generalSettings).forEach((filterKey) => {
          if (
            filterKey === 'customSitesToBlock' &&
            Array.isArray(allSettings.generalSettings.customSitesToBlock.value)
          ) {
            allSettings.generalSettings.customSitesToBlock.value = {
              active: false,
              customURLList: [],
            };
          } else if (
            filterKey === 'disableFiltersTemporary' &&
            !(
              'pauseTime' in
              allSettings.generalSettings.disableFiltersTemporary.value
            )
          ) {
            allSettings.generalSettings.disableFiltersTemporary.value.pauseTime = 5;
          } else {
            if (allSettings.generalSettings[filterKey])
              allSettings.generalSettings[filterKey].value =
                storageData.generalSettings[filterKey].value;
          }
        });
      }
      callbackOnLoad && callbackOnLoad();
    }
  );
}

function rootDomain(url) {
  return url
    .match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim)[0]
    .split('://')
    .reverse()[0]
    .split('www.')
    .reverse()[0];
}

function safeRedirectOnBlock(tabId, redirectUrl, fallbackUrl, safeCheckUrls) {
  const redirectUrlRootDomain = rootDomain(redirectUrl);
  const safeRedirectUrl = safeCheckUrls.some((i) =>
    redirectUrlRootDomain.includes(i)
  )
    ? fallbackUrl
    : redirectUrl;
  chrome.tabs.update(
    tabId,
    {
      url: safeRedirectUrl,
    },
    () => {
      return;
    }
  );
}

function startTimer() {
  const { active, endTimestamp } =
    allSettings.generalSettings.disableFiltersTemporary.value;
  const remainingTime = endTimestamp - Date.now();
  if (!active || remainingTime <= 0) {
    return endTimer();
  }
  if (remainingTime > 0) {
    myTimer = setTimeout(endTimer, remainingTime);
  }
}
function endTimer() {
  allSettings.generalSettings.disableFiltersTemporary.value.endTimestamp = '';
  allSettings.generalSettings.disableFiltersTemporary.value.active = false;
  chrome.storage.sync.set(
    {
      generalSettings: allSettings.generalSettings,
    },
    clearTimeout(myTimer)
  );
}

loadStorageToLocal(startTimer);

/* Set storage as empty on installing */
chrome.runtime.onInstalled.addListener((details) => {
  /* Launch welcome / install  */
  setLaunchPages(details && details.reason, details && details.previousVersion);

  /* Get data from local if already there on updates */
  loadStorageToLocal(() => {
    chrome.storage.sync.set({
      twitterSettings: allSettings.twitterSettings,
      youtubeSettings: allSettings.youtubeSettings,
      facebookSettings: allSettings.facebookSettings,
      redditSettings: allSettings.redditSettings,
      netflixSettings: allSettings.netflixSettings,
      linkedinSettings: allSettings.linkedinSettings,
      instagramSettings: allSettings.instagramSettings,
      pinterestSettings: allSettings.pinterestSettings,
      generalSettings: allSettings.generalSettings,
    });
  });
});

/* Load settings in script on chrome start */
chrome.runtime.onStartup.addListener(() => {
  loadStorageToLocal();
});

/* Listen to changes in settings and transmit to all open tabs for live update */
chrome.storage.onChanged.addListener((changes, _namespace) => {
  const [filterCategory, bothChanges] = Object.entries(changes)[0];
  const newSettings = bothChanges.newValue;
  const oldTimerActive =
    allSettings.generalSettings.disableFiltersTemporary.value.active;
  allSettings[filterCategory] = newSettings;

  // Handle disableFiltersTemporary toggle
  if (
    filterCategory === 'generalSettings' &&
    newSettings.disableFiltersTemporary.value.active !== oldTimerActive
  ) {
    if (allSettings.generalSettings.disableFiltersTemporary.value.active) {
      startTimer();
    } else {
      endTimer();
    }
  }
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, 'refresh');
    });
  });
});

// Fallback for Reddit
chrome.webNavigation.onHistoryStateUpdated.addListener(
  ({ frameId, tabId, url }) => {
    handleDomainBlocking(frameId, tabId, url);
  },
  { url: [{ hostContains: 'reddit.com' }] }
);

// Blocking custom websites
chrome.webNavigation.onBeforeNavigate.addListener(({ frameId, tabId, url }) => {
  handleDomainBlocking(frameId, tabId, url);
});

function handleDomainBlocking(frameId, tabId, url) {
  if (frameId === 0) {
    const {
      twitterSettings,
      youtubeSettings,
      facebookSettings,
      redditSettings,
      netflixSettings,
      linkedinSettings,
      instagramSettings,
      pinterestSettings,
      generalSettings,
    } = allSettings;
    const urlDomain = rootDomain(url);
    const redirectUrl =
      'https://' +
      generalSettings.customRedirectURL.value.trim().split('://').reverse()[0];
    const currentTime =
      new Date().getHours().toString().padStart(2, '0') +
      ':' +
      new Date().getMinutes().toString().padStart(2, '0');
    const fromTime = generalSettings.disableDuringHours.value.fromTime;
    const toTime = generalSettings.disableDuringHours.value.toTime;

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

    if (
      facebookSettings.blockSite.value &&
      relatedDomains.facebook.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      ) &&
      !url.includes('adsmanager.')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.facebook
      );
    } else if (
      facebookSettings.redirectToFriendsFeed.value &&
      relatedDomains.facebook.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      ) &&
      url.split('.com')[1] == '/' &&
      !url.includes('adsmanager.')
    ) {
      safeRedirectOnBlock(
        tabId,
        'https://www.facebook.com/?filter=friends&sk=h_chr',
        fallbackUrl,
        ['https://www.facebook.com/?filter=friends&sk=h_chr']
      );
    } else if (
      youtubeSettings.blockSite.value &&
      relatedDomains.youtube.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      ) &&
      !url.includes('music.') &&
      !url.includes('studio.')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.youtube
      );
    } else if (
      youtubeSettings.redirectToSubscriptions.value &&
      relatedDomains.youtube.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      ) &&
      url.split('.com')[1] == '/' &&
      !url.includes('music.') &&
      !url.includes('studio.')
    ) {
      safeRedirectOnBlock(
        tabId,
        'https://www.youtube.com/feed/subscriptions',
        fallbackUrl,
        ['https://www.youtube.com/feed/subscriptions']
      );
    } else if (
      twitterSettings.blockSite.value &&
      (relatedDomains.twitter.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      ) ||
        urlDomain == 'x.com')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.twitter
      );
    } else if (
      redditSettings.blockSite.value &&
      relatedDomains.reddit.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.reddit
      );
    } else if (
      netflixSettings.blockSite.value &&
      relatedDomains.netflix.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.netflix
      );
    } else if (
      linkedinSettings.blockSite.value &&
      relatedDomains.linkedin.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.linkedin
      );
    } else if (
      instagramSettings.blockSite.value &&
      relatedDomains.instagram.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.instagram
      );
    } else if (
      pinterestSettings.blockSite.value &&
      relatedDomains.pinterest.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.pinterest
      );
    } else if (
      generalSettings.customSitesToBlock.value.active &&
      generalSettings.customSitesToBlock.value.customURLList
        .map((customURL) => rootDomain(customURL))
        .some((i) => i === urlDomain || urlDomain.endsWith('.' + i))
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        generalSettings.customSitesToBlock.value.customURLList.map(
          (customURL) => rootDomain(customURL)
        )
      );
    }
    // reddit posts only or posts+subs only
    else if (
      relatedDomains.reddit.some(
        (i) => i === urlDomain || urlDomain.endsWith('.' + i)
      )
    ) {
      const isRedditPost = url.includes('/comments/');
      const isAllowedSubreddit =
        /^https:\/\/www\.reddit\.com\/r\/(?!popular|all|random|randomnsfw|mod|friends|home)\w+\/?$/.test(
          url
        );

      if (redditSettings.allowed.value === '1' && !isRedditPost) {
        safeRedirectOnBlock(
          tabId,
          redirectUrl,
          fallbackUrl,
          relatedDomains.reddit
        );
      } else if (
        redditSettings.allowed.value === '2' &&
        !isRedditPost &&
        !isAllowedSubreddit
      ) {
        safeRedirectOnBlock(
          tabId,
          redirectUrl,
          fallbackUrl,
          relatedDomains.reddit
        );
      }
    }
    // facebook marketplace
    else if (
      facebookSettings.marketplace.value &&
      url.includes('facebook.com/marketplace')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.reddit
      );
    }
    // facebook reels
    else if (facebookSettings.reel.value && url.includes('facebook.com/reel')) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.reddit
      );
    }
    // youtube shorts
    else if (
      youtubeSettings.shorts.value &&
      url.includes('youtube.com/shorts')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.youtube
      );
    }
    // instagram reels
    else if (
      instagramSettings.reels.value &&
      url.includes('instagram.com/reels')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.instagram
      );
    }
    // instagram explore
    else if (
      instagramSettings.explore.value &&
      url.includes('instagram.com/explore')
    ) {
      safeRedirectOnBlock(
        tabId,
        redirectUrl,
        fallbackUrl,
        relatedDomains.instagram
      );
    }
  }
}
chrome.runtime.onMessageExternal.addListener(
  (request, _sender, sendResponse) => {
    if (request.action === 'getHasPaid') {
      chrome.storage.local.get('hasPaid', (data) => {
        sendResponse({ success: true, hasPaid: data.hasPaid || false });
      });
      return true;
    }
  }
);

var injectInstagramScript = () => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    var allPerms = await chrome.permissions.getAll();
    var instagramPermission = allPerms.origins.some((str) =>
      str.includes('instagram')
    );
    if (
      instagramPermission &&
      changeInfo.status &&
      changeInfo.status == 'loading' &&
      tab.url &&
      tab.url.includes('instagram.com')
    ) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['undistracted-instagram.js'],
      });
    }
  });
};
injectInstagramScript();

var injectXScript = () => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    var allPerms = await chrome.permissions.getAll();
    var xPermission = allPerms.origins.some((str) => str.includes('x'));
    if (
      xPermission &&
      changeInfo.status &&
      changeInfo.status == 'loading' &&
      tab.url &&
      tab.url.includes('x.com')
    ) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['undistracted-twitter.js'],
      });
    }
  });
};
injectXScript();

var injectPinterestScript = () => {
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    var allPerms = await chrome.permissions.getAll();
    var pinterestPermission = allPerms.origins.some((str) =>
      str.includes('pinterest')
    );

    if (
      pinterestPermission &&
      changeInfo.status &&
      changeInfo.status == 'complete' &&
      tab.url &&
      tab.url.includes('pinterest.com')
    ) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['undistracted-pinterest.js'],
      });
    }
  });
};
injectPinterestScript();
