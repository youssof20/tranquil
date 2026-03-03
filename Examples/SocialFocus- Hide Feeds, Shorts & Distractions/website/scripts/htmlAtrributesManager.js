// MARK: - Set Site Attribute
const currentHref = window.location.href;
const websiteObject = getSiteInfo();
const hackerNewsOptionsWithVerticalLinesList = [
  "socialFocus_hacker-news_navigation_hide_new",
  "socialFocus_hacker-news_navigation_hide_past",
  "socialFocus_hacker-news_navigation_hide_comments",
  "socialFocus_hacker-news_navigation_hide_ask",
  "socialFocus_hacker-news_navigation_hide_show",
  "socialFocus_hacker-news_navigation_hide_jobs",
  "socialFocus_hacker-news_post_hide_hide_button",
  "socialFocus_hacker-news_navigation_hide_submit",
];

const EXTEND_MAP = {
  socialFocus_instagram_feed_hide_suggested_posts: (stylesArray) => [
    ...stylesArray,
    `article[suggestedPost="true"] > div`,
  ],
  socialFocus_twitch_hide_following: (stylesArray) => [
    ...stylesArray,
    `button[hideFollow="true"]`,
  ],
  socialFocus_twitch_hide_subscribe_button: (stylesArray) => [
    ...stylesArray,
    `button[hideSubscribe="true"]`,
  ],
};

let isMobile = false;

if (isUserAgentMobile()) {
  isMobile = true;
} else {
  isMobile = false;
}

function extendsOptionsIdStyles(optionId, value, stylesArray) {
  const stylesArrayExtender = EXTEND_MAP[optionId];
  if (!stylesArrayExtender) return;

  const newStylesArray = stylesArrayExtender(stylesArray);
  toggleFeatureStyles(optionId, value, newStylesArray);
}

// Start observer by desktop and mobile tags

var detectInterval = setInterval(function () {
  // Check mobile selectors

  for (const selector of websiteObject.mobileSelectorCheck) {
    if (selector != "") {
      const checkSelect = document.querySelector(selector);
      if (checkSelect) {
        isMobile = true;
        clearInterval(detectInterval);
        break;
      }
    }
  }

  // Check desktop selectors

  for (const selector of websiteObject.desktopSelectorCheck) {
    if (selector != "") {
      const checkSelect = document.querySelector(selector);
      if (checkSelect) {
        isMobile = false;
        clearInterval(detectInterval);
        break;
      }
    }
  }
}, 10);

setTimeout(function () {
  clearInterval(detectInterval);
}, 5000);

// MARK: - Set options values to HTML

function validateSingleOption(option) {
  browser.storage.local.get(
    [
      getConst.settingsStylesArray,
      getConst.settingsStylesArrayMobile,
      `socialFocus_${websiteObject.name}_master_toggle`,
    ],
    function (obj) {
      let optionSettings = null;

      const settingsStylesArrayDesktop =
        obj[getConst.settingsStylesArray] ?? [];
      const settingsStylesArrayMobile =
        obj[getConst.settingsStylesArrayMobile] ?? [];
      const masterToggle =
        obj[`socialFocus_${websiteObject.name}_master_toggle`] ?? false;

      const settingsStylesArray = !isMobile
        ? settingsStylesArrayDesktop
        : settingsStylesArrayMobile;

      if (settingsStylesArray.length) {
        optionSettings = settingsStylesArray.find(
          (item) => item.settings_id === option.id
        );

        if (!optionSettings) {
          optionSettings = option;
        }
      } else {
        optionSettings = option;
      }

      const stylesArray = validateStylesArray(optionSettings, [], false);

      const optionId = option.id;
      const optionDefault = option.defaultValue;

      if (masterToggle) {
        masterToggleValidateHandler(masterToggle);
      } else {
        browser.storage.local.get(optionId, function (optionObj) {
          const value = optionObj[optionId] ?? optionDefault;

          if (option.dependsWithOption) {
            const optionOnWhichDepend = getAllOptions(categories).find(
              (item) => item.id === option.dependsWithOption
            );

            browser.storage.local.get(optionOnWhichDepend.id, function (obj) {
              const optionOnWhichDependValue =
                obj[optionOnWhichDepend.id] ?? false;

              toggleFeatureStyles(
                optionId,
                optionOnWhichDependValue,
                stylesArray
              );
            });
          } else {
            if (stylesArray && stylesArray.length) {
              if (EXTEND_MAP.hasOwnProperty(optionId)) {
                extendsOptionsIdStyles(optionId, value, stylesArray);
              } else {
                toggleFeatureStyles(optionId, value, stylesArray);
              }
            }
          }

          if (optionId === "socialFocus_instagram_feed_hide_suggested_posts") {
            hideSuggestedPostInstagram(value);
          }

          if (optionId === "socialFocus_twitch_hide_following") {
            hideTwitchActionButtons(followTranslations, optionId, value);
          }

          if (optionId === "socialFocus_twitch_hide_subscribe_button") {
            hideTwitchActionButtons(subscribeTranslations, optionId, value);
          }

          if (hackerNewsOptionsWithVerticalLinesList.includes(optionId)) {
            setTimeout(() => {
              formatHackerNewsNavigationElements(optionId, value);
            });
          }

          if (
            optionId ===
              `socialFocus_${websiteObject.name}_daily_limit_show_timer_draggable` &&
            !isMobile
          ) {
            if (value) {
              createTimerModal({ isDesktop: true, isInit: true });
            } else {
              removeTimerModal();
            }
          }

          if (
            optionId ===
              `socialFocus_${websiteObject.name}_daily_limit_show_timer` &&
            isMobile
          ) {
            if (value) {
              createTimerModal({ isDesktop: false, isInit: true });
            } else {
              removeTimerModal();
            }
          }

          if (option.id === "socialFocus_reddit_header_hide_trending_today") {
            handleRedditTrendingToday(true, value, isMobile);
          }

          if (option.id === "socialFocus_reddit_hide_trending_today") {
            handleRedditTrendingToday(true, value, isMobile);
          }
        });
      }
    }
  );
}

function setAttributesToSettingsDiv() {
  if (websiteObject) {
    document
      .querySelector("html")
      .setAttribute("socialFocus_site_is", websiteObject.name);
  }

  for (const option of getAllOptions(getWebsiteCategoriesFromWebsite())) {
    const optionId = option.id;
    const optionDefault = option.defaultValue;
    browser.storage.local.get(optionId, function (obj) {
      const value = obj[optionId] ?? optionDefault;

      // Set in HTML

      document.documentElement.setAttribute(optionId, value);

      if (hackerNewsOptionsWithVerticalLinesList.includes(optionId)) {
        setTimeout(() => {
          formatHackerNewsNavigationElements(optionId, value);
        });
      }

      if (
        optionId ===
          `socialFocus_${websiteObject.name}_daily_limit_show_timer_draggable` &&
        !isMobile
      ) {
        if (value) {
          createTimerModal({ isDesktop: true, isInit: true });
        } else {
          removeTimerModal();
        }
      }

      if (
        optionId ===
          `socialFocus_${websiteObject.name}_daily_limit_show_timer` &&
        isMobile
      ) {
        if (value) {
          createTimerModal({ isDesktop: false, isInit: true });
        } else {
          removeTimerModal();
        }
      }
    });
  }
}

function applyAllSettings() {
  getWebsiteCategoriesFromWebsite().then((categories) => {
    for (const option of getAllOptions(categories)) {
      validateSingleOption(option);
    }
  });
}

function disableAllSettings() {
  getWebsiteCategoriesFromWebsite().then((categories) => {
    for (const option of getAllOptions(categories)) {
      const optionId = option.id;

      toggleFeatureStyles(optionId, false, []);
    }
  });
}

function setInitialExtensionState() {
  browser.storage.local.get(
    [getConstNotSyncing.extensionIsEnabledData],
    function (obj) {
      const isExtensionEnable =
        obj[getConstNotSyncing.extensionIsEnabledData] ?? true;

      if (isExtensionEnable) {
        applyAllSettings();
      }
    }
  );
}

if (currentHref.includes("news.ycombinator.com")) {
  setAttributesToSettingsDiv();
} else {
  setInitialExtensionState();
}

function masterToggleValidateHandler(attribute) {
  if (attribute) {
    masterToggleOn();
  } else {
    masterToggleOff();
  }
}

function masterToggleOn() {
  getWebsiteCategoriesFromWebsite().then((categories) => {
    for (const option of getAllOptions(categories)) {
      const optionId = option.id;

      if (optionId.includes(`socialFocus_${websiteObject.name}`)) {
        toggleFeatureStyles(optionId, false, []);

        if (optionId.includes("socialFocus_hacker-news"))
          if (hackerNewsOptionsWithVerticalLinesList.includes(optionId)) {
            setTimeout(() => {
              formatHackerNewsNavigationElements(optionId, false);
            });
          }

        removeTimerModal();

        if (optionId.includes("socialFocus_reddit")) {
          handleRedditTrendingToday(
            true,
            false,
            isMobile,
            "socialFocus_reddit_header_hide_trending_today"
          );

          handleRedditTrendingToday(
            true,
            false,
            isMobile,
            "socialFocus_reddit_hide_trending_today"
          );
        }
      }
    }
  });
}

function masterToggleOff() {
  getWebsiteCategoriesFromWebsite().then((categories) => {
    for (const option of getAllOptions(categories)) {
      const optionId = option.id;
      if (optionId.includes(`socialFocus_${websiteObject.name}`)) {
        validateSingleOption(option);
      }
    }
  });
}

// MARK: - Update in html

function updateSettingAttribute(settingId, attribute, styles) {
  const currentLocation = window.location.href;

  if (
    styles &&
    styles.length &&
    !currentLocation.includes("news.ycombinator.com")
  ) {
    if (EXTEND_MAP.hasOwnProperty(settingId)) {
      extendsOptionsIdStyles(settingId, attribute, styles);
    } else {
      toggleFeatureStyles(settingId, attribute, styles);
    }
  }
  // Set in html

  if (currentLocation.includes("news.ycombinator.com")) {
    document.documentElement.setAttribute(settingId, attribute);
  }

  // Special for facebook feed posts

  if (
    settingId == "socialFocus_facebook_feed_hide_sponsored_posts" ||
    settingId == "socialFocus_facebook_feed_hide_group_posts" ||
    settingId == "socialFocus_facebook_feed_hide_section_people_you_may_know" ||
    settingId ==
      "socialFocus_facebook_feed_hide_section_reels_and_short_videos" ||
    settingId == "socialFocus_facebook_feed_hide_suggested_groups" ||
    settingId == "socialFocus_facebook_feed_hide_posts_from_people_to_follow"
  ) {
    triggerFilterFacebookPosts();
  }

  if (hackerNewsOptionsWithVerticalLinesList.includes(settingId)) {
    formatHackerNewsNavigationElements(settingId, attribute);
  }

  if (
    settingId ==
      `socialFocus_${websiteObject.name}_daily_limit_show_timer_draggable` &&
    !isMobile
  ) {
    if (attribute) {
      createTimerModal({ isDesktop: true, isInit: false });
    } else {
      removeTimerModal();
    }
  }

  if (
    settingId == `socialFocus_${websiteObject.name}_daily_limit_show_timer` &&
    isMobile
  ) {
    if (attribute) {
      createTimerModal({ isDesktop: false, isInit: false });
    } else {
      removeTimerModal();
    }
  }

  if (settingId == `socialFocus_${websiteObject.name}_master_toggle`) {
    browser.storage.local.get(
      [
        `socialfocus_${websiteObject.name}_dailylimitduration`,
        `socialfocus_${websiteObject.name}_dailylimitlastedtime`,
      ],
      function (obj) {
        const dailyLimitDuration =
          obj[`socialfocus_${websiteObject.name}_dailylimitduration`] ?? false;

        const dailyLimitLastedTime =
          obj[`socialfocus_${websiteObject.name}_dailylimitlastedtime`] ??
          false;

        if (!currentLocation.includes("news.ycombinator.com"))
          masterToggleValidateHandler(attribute);

        if (
          !attribute &&
          dailyLimitDuration !== "noLimit" &&
          dailyLimitDuration !== null &&
          dailyLimitLastedTime !== null
        ) {
          stopTimer();
          startSiteBlockingTimer(websiteObject.name);
        }
      }
    );
  }

  if (settingId === "socialFocus_instagram_feed_hide_suggested_posts") {
    hideSuggestedPostInstagram(attribute);
  }

  if (settingId === "socialFocus_twitch_hide_following") {
    hideTwitchActionButtons(followTranslations, settingId, attribute);
  }

  if (settingId === "socialFocus_twitch_hide_subscribe_button") {
    hideTwitchActionButtons(subscribeTranslations, settingId, attribute);
  }

  if (settingId === "socialFocus_reddit_header_hide_trending_today") {
    handleRedditTrendingToday(
      false,
      attribute,
      isMobile,
      "socialFocus_reddit_header_hide_trending_today"
    );
  }

  if (settingId === "socialFocus_reddit_hide_trending_today") {
    handleRedditTrendingToday(
      false,
      attribute,
      isMobile,
      "socialFocus_reddit_hide_trending_today"
    );
  }

  if (settingId === "socialFocus_youtube_hide_shorts") {
    hideMenuTabs();
  }
}

browser.storage.onChanged.addListener((changes) => {
  if (changes[getConstNotSyncing.extensionIsEnabledData]) {
    const newValue =
      changes[getConstNotSyncing.extensionIsEnabledData].newValue;

    if (newValue) {
      applyAllSettings();
    } else {
      disableAllSettings();
    }
  }
});

// MARK: - Receive Requests from popup

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Toggle
  if (message.type == "toggle") {
    const objectId = message.id;
    const stylesArray = message.styles ?? [];

    browser.storage.local.get(objectId, function (obj) {
      if (currentHref.includes("news.ycombinator.com")) {
        const defaultObject = findOptionById(
          objectId,
          getWebsiteCategoriesFromWebsite()
        );
        const currentValue = obj[objectId] ?? defaultObject.defaultValue;
        updateSettingAttribute(objectId, currentValue, []);
      } else {
        getWebsiteCategoriesFromWebsite().then((categories) => {
          const defaultObject = findOptionById(objectId, categories);
          const currentValue = obj[objectId] ?? defaultObject.defaultValue;
          updateSettingAttribute(objectId, currentValue, stylesArray);
        });
      }
    });
  } else if (message.type == "checkSelectors") {
    sendResponse({ isDesktop: !isMobile });
  }
});
