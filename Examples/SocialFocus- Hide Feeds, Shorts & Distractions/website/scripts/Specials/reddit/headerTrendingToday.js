const sectionWithTrendingBlock = {
  header: "socialFocus_reddit_header_hide_trending_today",
  homepage: "socialFocus_reddit_hide_trending_today",
};

function handleRedditTrendingToday(isInit, checkedValue, isMobile, id) {
  browser.storage.local.get("socialFocus_reddit_master_toggle", function (obj) {
    const masterToogle = obj["socialFocus_reddit_master_toggle"] ?? false;

    function getTrendingTodayContainer() {
      const redditSearch = document.querySelector(
        id === sectionWithTrendingBlock.header
          ? `${isMobile ? "" : "search-hero-input"} reddit-search-${
              isMobile ? "small" : "large"
            }`
          : "header reddit-search-large"
      );

      if (!redditSearch || !redditSearch.shadowRoot) {
        return null;
      }

      return [
        redditSearch.shadowRoot.querySelector(
          `div[data-faceplate-tracking-context] div #reddit-trending-searches-partial-container`
        ),
        redditSearch.shadowRoot.querySelector(
          `div[data-faceplate-tracking-context] div.text-neutral-content-weak`
        ),
      ];
    }

    if (isInit) {
      const observer = new MutationObserver(() => {
        const trendingTodayContainer = getTrendingTodayContainer();

        if (trendingTodayContainer && trendingTodayContainer[0]) {
          observer.disconnect();
          hideCheckRedditTrendingToday(
            masterToogle ? false : checkedValue,
            trendingTodayContainer
          );
        }
      });

      observer.observe(document, { childList: true, subtree: true });
    } else {
      const trendingTodayContainer = getTrendingTodayContainer();

      if (trendingTodayContainer && trendingTodayContainer[0]) {
        hideCheckRedditTrendingToday(
          masterToogle ? false : checkedValue,
          trendingTodayContainer
        );
      }
    }
  });
}

function hideCheckRedditTrendingToday(checkedValue, trendingTodayContainer) {
  for (const sectionToHide of trendingTodayContainer) {
    sectionToHide.style.cssText = checkedValue
      ? "display: none !important;"
      : "display: block !important;";
  }
}

browser.storage.onChanged.addListener((changes, area) => {
  if (changes["socialFocus_reddit_master_toggle"]) {
    const { newValue } = changes["socialFocus_reddit_master_toggle"];

    browser.storage.local.get(
      [
        "socialFocus_reddit_header_hide_trending_today",
        "socialFocus_reddit_hide_trending_today",
      ],
      function (obj) {
        const headerTrendingValue =
          obj["socialFocus_reddit_header_hide_trending_today"] ?? false;
        const trendingValue =
          obj["socialFocus_reddit_hide_trending_today"] ?? false;

        handleRedditTrendingToday(
          false,
          newValue ? false : headerTrendingValue,
          isMobileVersion(),
          "socialFocus_reddit_header_hide_trending_today"
        );

        handleRedditTrendingToday(
          false,
          newValue ? false : trendingValue,
          isMobileVersion(),
          "socialFocus_reddit_hide_trending_today"
        );
      }
    );
  }
});
