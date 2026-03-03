let intervalId = null;

document.addEventListener("DOMContentLoaded", () => {
  if (websiteObject) {
    initSiteTimeSpendLimit(websiteObject.name);
  }
});

function initSiteTimeSpendLimit(websiteName) {
  const limitDurationKey = getConst.dailyLimitDuration[websiteName];
  const lastedTimeKey = getConst.dailyLimitLastedTime[websiteName];
  const currentDate = getConst.dailyCurrentDate[websiteName];

  const dateNow = formatDate();

  browser.storage.local.get(
    [limitDurationKey, lastedTimeKey, currentDate],
    function (obj) {
      const dailyLimitDuration = obj[limitDurationKey];
      let dailyLimitLastedTime = obj[lastedTimeKey];
      const dailyLimitCurrentDate = obj[currentDate];

      if (dailyLimitDuration !== undefined) {
        browser.storage.local.set({
          [getConst.dailyCurrentDate[websiteName]]: dateNow,
        });
      }

      if (dailyLimitCurrentDate !== dateNow) {
        dailyLimitLastedTime = 0;

        browser.storage.local.set({
          [getConst.dailyLimitLastedTime[websiteName]]: 0,
        });
      }

      checkIfLastedTimeLessThanLimitDuration(
        dailyLimitLastedTime,
        dailyLimitDuration,
        websiteName
      );
    }
  );
}

function stopTimer() {
  clearInterval(intervalId);
}

function startSiteBlockingTimer(websiteName) {
  const limitDurationKey = getConst.dailyLimitDuration[websiteName];
  const lastedTimeKey = getConst.dailyLimitLastedTime[websiteName];
  const masterToggleKey = `socialFocus_${websiteName}_master_toggle`;

  intervalId = setInterval(() => {
    browser.storage.local.get(
      [limitDurationKey, lastedTimeKey, masterToggleKey],
      function (obj) {
        const dailyLimitDuration = obj[limitDurationKey];
        let dailyLimitLastedTime = obj[lastedTimeKey];
        const masterToggleAttribute = obj[masterToggleKey];

        if (dailyLimitDuration === "noLimit" || masterToggleAttribute) {
          stopTimer();
        } else {
          dailyLimitLastedTime++;
          browser.storage.local.set({
            [getConst.dailyLimitLastedTime[websiteName]]: dailyLimitLastedTime,
          });
        }

        if (dailyLimitLastedTime >= getSecondsFromMinutes(dailyLimitDuration)) {
          blockingSite();
        }
      }
    );
  }, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startBlockingSite") {
    blockingSite();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startBlockingSiteTimer") {
    stopTimer();
    startSiteBlockingTimer(websiteObject.name);
  }
});

function blockingSite() {
  stopTimer();

  const element = document.querySelector("body");

  if (element) {
    (async () => {
      const replaceContent = await getBlockingContent();
      element.innerHTML = replaceContent;
    })();
  }
}

function formatDate() {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function checkIfLastedTimeLessThanLimitDuration(
  lastedTime,
  limitDuration,
  websiteName
) {
  if (
    limitDuration !== undefined &&
    lastedTime !== undefined &&
    limitDuration !== "noLimit"
  ) {
    if (lastedTime < getSecondsFromMinutes(limitDuration)) {
      startSiteBlockingTimer(websiteName);
    } else {
      blockingSite();
    }
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === "visible") {
    browser.storage.local.get(
      [
        getConst.dailyLimitDuration[websiteObject.name],
        getConst.dailyLimitLastedTime[websiteObject.name],
      ],

      function (obj) {
        const dailyLimitDuration =
          obj[getConst.dailyLimitDuration[websiteObject.name]];
        const dailyLimitLastedTime =
          obj[getConst.dailyLimitLastedTime[websiteObject.name]];

        checkIfLastedTimeLessThanLimitDuration(
          dailyLimitLastedTime,
          dailyLimitDuration,
          websiteObject.name
        );
      }
    );
  } else {
    stopTimer();
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange);
