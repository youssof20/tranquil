// MARK: - Main Screen

// Expand Neccessary Section

function expandNeccessarySection() {
  getCurrentTab().then((tabs) => {
    const currentUrl = tabs[0].url;
    let currentHostName;

    if (
      currentUrl.includes("www.google.com") ||
      currentUrl.includes("www.bing.com")
    ) {
      currentHostName = "youtube";
    } else if (currentUrl.includes("facebook")) {
      currentHostName = "facebook";
    } else if (currentUrl.includes("netflix.")) {
      currentHostName = "netflix";
    } else if (currentUrl.includes("instagram.")) {
      currentHostName = "instagram";
    } else if (currentUrl.includes("youtube.")) {
      currentHostName = "youtube";
    } else if (currentUrl.includes("linkedin.")) {
      currentHostName = "linkedin";
    } else if (currentUrl.includes("twitter.") || currentUrl.includes("x.")) {
      currentHostName = "twitter";
    } else if (currentUrl.includes("reddit.")) {
      currentHostName = "reddit";
    } else if (currentUrl.includes("mail.google.")) {
      currentHostName = "gmail";
    } else if (currentUrl.includes("news.ycombinator.")) {
      currentHostName = "hacker-news";
    } else if (currentUrl.includes("twitch.")) {
      currentHostName = "twitch";
    } else if (currentUrl.includes("pinterest.")) {
      currentHostName = "pinterest";
    } else if (currentUrl.includes("tiktok.")) {
      currentHostName = "tikTok";
    } else if (currentUrl.includes("bsky.app")) {
      currentHostName = "blueSky";
    } else {
      currentHostName = "youtube";
    }

    setSectionStyles(currentHostName);
    createDailyLimitOptions(currentHostName, true);
  });
}

function createOption(optionObject) {
  const optionName = getLocalizedOptionName(optionObject.name);
  const optionId = optionObject.id;
  const optionDefaultValue = optionObject.defaultValue;
  // const radios = optionObject.radios;

  // Create Option Wrapper

  const optionWrapper = document.createElement("div");
  optionWrapper.classList.add("optionWrapper");

  // Create Label

  const label = document.createElement("label");
  label.className = "label";
  label.setAttribute("for", optionId);

  // Create Label span

  const labelSpan = document.createElement("span");
  labelSpan.className = "labelSpan";
  labelSpan.innerHTML = optionName;

  // Control Element

  let controlElement;
  if (optionObject.type == "groupTitle") {
  } else if (optionObject.type === "select") {
    const selectContainer = document.createElement("div");
    selectContainer.classList.add("selectContainer");

    const chevron = document.createElement("i");
    chevron.classList.add("fa-solid");
    chevron.classList.add("fa-caret-down");

    const select = document.createElement("select");
    select.classList.add("selectSelect");
    select.id = optionObject.id;

    browser.storage.local.get(optionId, function (obj) {
      const selectValue = obj[optionId] ?? optionDefaultValue;

      for (const selectOption of optionObject.selects) {
        var opt = document.createElement("option");
        opt.value = selectOption.id;
        opt.innerHTML = getLocalizedOptionName(selectOption.name);
        if (selectOption.id == selectValue) {
          opt.setAttribute("selected", "");
        }
        select.appendChild(opt);
      }
    });

    selectContainer.appendChild(select);
    selectContainer.appendChild(chevron);

    controlElement = selectContainer;
  } else if (optionObject.type === "checkbox") {
    // If normal option

    // Create Switch Label

    const switchLabel = document.createElement("label");
    switchLabel.classList.add("switchLabel");
    switchLabel.classList.add("switch");

    // Create Hidden Checkbox

    const checkboxInput = document.createElement("input");
    checkboxInput.className = "formCheckbox";
    checkboxInput.id = optionId;
    checkboxInput.setAttribute("type", "checkbox");
    browser.storage.local.get(optionId, function (obj) {
      const value = obj[optionId] ?? optionDefaultValue;
      checkboxInput.checked = value;
    });

    // Create Visible Checkbox

    const slider = document.createElement("span");
    slider.classList.add("slider", "round");

    switchLabel.appendChild(checkboxInput);
    switchLabel.appendChild(slider);

    controlElement = switchLabel;
  }

  label.appendChild(labelSpan);
  label.appendChild(controlElement);

  optionWrapper.appendChild(label);

  return optionWrapper;
}

// Generate Settings

function generateSettingsController() {
  getCurrentTab().then((tabs) => {
    getCategoriesFromExtension().then((inputCategories) => {
      // Clean for case when user changing lang

      queryById("activeCategoryButtonList").innerHTML = "";
      queryById("categoryPickerList").innerHTML = "";
      queryById("settingsContainerDefault").innerHTML = "";

      for (const category of inputCategories) {
        // Fill Options

        const categoryName = getLocalizedCategoryName(category.categoryName);
        const categoryGroups = category.categoryGroups;
        const categoryId = category.categoryId;

        if (categoryGroups == null || categoryGroups.length == 0) {
          continue;
        }

        // Category Picker List

        const newCategory = document.createElement("div");
        newCategory.innerHTML = categoryName;
        newCategory.classList.add("category");
        newCategory.setAttribute("categoryId", categoryId);
        queryById("categoryPickerList").appendChild(newCategory);

        // Category Picked

        const newCategory2 = document.createElement("div");
        newCategory2.innerHTML = categoryName;
        newCategory2.classList.add("pickedCategory");
        newCategory2.setAttribute("categoryId", categoryId);
        queryById("activeCategoryButtonList").appendChild(newCategory2);

        // Create Section

        const collapsibleSection = document.createElement("div");
        collapsibleSection.className = "collapsibleSection";
        collapsibleSection.setAttribute("categoryId", categoryId);

        for (const group of categoryGroups) {
          const groupObject = group;
          const groupOptions = groupObject.options;

          if (groupOptions.length == 0) {
            continue;
          }

          // Create Group

          const collapsibleSectionBody = document.createElement("div");
          collapsibleSectionBody.className = "settingsGroup";

          if (categoryGroups.length > 1) {
            // Add Label for group

            const groupTitleWrapper = document.createElement("div");
            groupTitleWrapper.classList.add("optionsGroupTitle");
            groupTitleWrapper.innerHTML = getLocalizedGroupName(
              groupObject.groupName
            );

            collapsibleSectionBody.appendChild(groupTitleWrapper);
          }

          // Create Group Body
          const settingsGroupBody = document.createElement("div");
          settingsGroupBody.className = "settingsGroupBody";

          collapsibleSectionBody.appendChild(settingsGroupBody);

          for (const option in groupOptions) {
            const optionObject = createOption(groupOptions[option]);
            settingsGroupBody.appendChild(optionObject);
            // Group Title
          }

          collapsibleSection.appendChild(collapsibleSectionBody);
        }

        queryById("settingsContainerDefault").appendChild(collapsibleSection);
      }

      expandNeccessarySection();

      // MARK: - Changge Category

      const categoriesButtons = querySelectorAll(
        "#categoryPickerList .category"
      );

      for (const category of categoriesButtons) {
        category.onclick = function () {
          const previousAttr = queryById("mainScreen").getAttribute(
            "displayingCategoryId"
          );

          setSectionStyles(category.getAttribute("categoryId"), previousAttr);
          createDailyLimitOptions(category.getAttribute("categoryId"), false);

          queryById("mainScreen").setAttribute(
            "categorypickerisshowing",
            false
          );

          // Trigger a scroll to the top to remove the previously scrolled content from the old category.
          var scrollableDiv = document.getElementById("settingsContainer");
          scrollableDiv.scrollTop = 0;
        };
      }

      // MARK: - Checkbox Click

      const checkboxes = document.querySelectorAll(
        "#mainScreen .optionWrapper .switchLabel"
      );

      for (const checkbox of checkboxes) {
        checkbox.onclick = function () {
          const categoryId = queryById("mainScreen").getAttribute(
            "displayingCategoryId"
          );
          event.preventDefault();
          const hiddenInput = checkbox.parentElement.querySelector(
            "#mainScreen .formCheckbox"
          );
          const checkboxId = hiddenInput.id;

          browser.storage.local.get(
            [
              checkboxId,
              getConst.settingsStylesArray,
              getConst.settingsStylesArrayMobile,
            ],
            function (obj) {
              isDesktopDeepCheck().then((isDesktopState) => {
                let optionSettings = null;
                const settingsStylesArrayDesktop =
                  obj[getConst.settingsStylesArray] ?? [];
                const settingsStylesArrayMobile =
                  obj[getConst.settingsStylesArrayMobile] ?? [];

                const settingsStylesArray = isDesktopState
                  ? settingsStylesArrayDesktop
                  : settingsStylesArrayMobile;

                if (settingsStylesArray.length) {
                  optionSettings = settingsStylesArray.find(
                    (item) => item.settings_id === checkboxId
                  );
                }
                const currentCheckbox = findOptionById(
                  checkboxId,
                  inputCategories
                );

                const stylesArray = validateStylesArray(
                  optionSettings,
                  currentCheckbox.styles,
                  false
                );

                const defaultValue = findOptionById(
                  checkboxId,
                  inputCategories
                ).defaultValue;

                // Check if exist
                if (defaultValue != null) {
                  const status = obj[checkboxId] ?? defaultValue;
                  hiddenInput.checked = status ? false : true;

                  setToStorage(checkboxId, !status, function () {
                    if (
                      currentCheckbox.dependsWithOption &&
                      !checkboxId.includes("hacker-news")
                    ) {
                      const optionOnWhichDepend = findOptionById(
                        currentCheckbox.dependsWithOption
                      );

                      browser.storage.local.get(
                        optionOnWhichDepend.id,
                        function (obj) {
                          const optionOnWhichDependValue =
                            obj[optionOnWhichDepend.id] ?? false;

                          cssPassToContentScript(
                            checkboxId,
                            stylesArray,
                            optionOnWhichDependValue
                          );
                        }
                      );
                    } else if (
                      stylesArray &&
                      stylesArray.length &&
                      !checkboxId.includes("hacker-news")
                    ) {
                      cssPassToContentScript(checkboxId, stylesArray, status);
                    } else {
                      sendCommand(checkboxId);
                    }
                  });

                  if (
                    checkboxId === `socialFocus_${categoryId}_master_toggle`
                  ) {
                    masterToggleHandler(categoryId, !status);
                  }
                }
              });
            }
          );
        };
      }

      // MARK: - Select Daily Limit Option Change
      const dailyLimitSelects = document.querySelectorAll(
        "#settingsContainer .selectSelect#socialFocus_daily_limit"
      );

      for (const select of dailyLimitSelects) {
        select.onchange = function () {
          const categoryId = queryById("mainScreen").getAttribute(
            "displayingCategoryId"
          );
          setBlockingSiteTimer(select.value, categoryId);

          setToStorage(getConst.dailyLimitDuration[categoryId], select.value);
          sendCommand(getConst.dailyLimitDuration[categoryId], select.value);

          browser.storage.local.get(
            getConst.dailyLimitLastedTime[categoryId],
            function (obj) {
              const dailyLimitLastedTime =
                obj[getConst.dailyLimitLastedTime[categoryId]];

              setToStorage(
                getConst.dailyLimitLastedTime[categoryId],
                dailyLimitLastedTime ?? 0
              );
              sendCommand(
                getConst.dailyLimitLastedTime[categoryId],
                dailyLimitLastedTime ?? 0
              );
            }
          );

          // логіка сетапу dailyLimitLastedTime if undefined set to 0
        };
      }

      // Click on row with select
      const itemsWithSelect = querySelectorAll(
        "#settingsContainer .optionWrapper:has(select)"
      );

      for (const index in itemsWithSelect) {
        const item = itemsWithSelect[index];

        item.onclick = function () {
          showDropdown(item.querySelector("select"));
        };
      }
    });
  });
}

// MARK: - Opening Timer Screen

// Generate durations

function generateDurationsList() {
  browser.storage.local.get(
    [getConst.openingTimerValueData, getConst.openingTimerIsActiveData],
    function (obj) {
      const openingTimerIsActive = obj[getConst.openingTimerIsActiveData];

      const selected = obj[getConst.openingTimerValueData] ?? 1;

      const durationSelect = queryById("openingTimerDurationSelect");

      const max = 601;

      for (var i = 1; i < max; i++) {
        const option = document.createElement("option");
        option.value = i;

        var displayString = "";

        displayString += i;

        if (i == selected) {
          option.selected = true;

          if (openingTimerIsActive == true) {
            queryById("launchDelayState").setAttribute("active", "");
          }
        }

        option.innerHTML = displayString;

        durationSelect.appendChild(option);
      }

      if (openingTimerIsActive == true) {
        queryById("openingTimer-bottomButtons").setAttribute("active", "");
      }
    }
  );
}

generateDurationsList();

// Set Message

function getMessage() {
  browser.storage.local.get(getConst.openingTimerMessageData, function (obj) {
    const message = obj[getConst.openingTimerMessageData] ?? "";

    if (message != "") {
      queryById("openingTimerMessage").value = message;
    }
  });
}

getMessage();

// MARK: - Password Locking Screen

// Set buttons states

function setButtonStates() {
  browser.storage.local.get(
    [
      getConst.passwordLockingIsActiveData,
      getConst.passwordLockingPasswordData,
      getConst.passwordLockingPromptData,
    ],
    function (obj) {
      const passwordLockingIsActive = obj[getConst.passwordLockingIsActiveData];
      const passwordLockingPassword = obj[getConst.passwordLockingPasswordData];
      const passwordLockingPrompt = obj[getConst.passwordLockingPromptData];

      if (passwordLockingIsActive == true) {
        queryById("passwordProtectionStatusInfo").setAttribute("active", "");

        queryById("protectPasswordTextField").value = passwordLockingPassword;
        queryById("protectPassword2TextField").value = passwordLockingPassword;
        queryById("passwordPromptTextField").value = passwordLockingPrompt;

        queryById("passwordLocking-bottomButtons").setAttribute("active", "");
      }
    }
  );
}

setButtonStates();

// Reset

function password_generateDurationsList() {
  browser.storage.local.get(
    getConst.passwordLockingResetPeriodData,
    function (obj) {
      const selected = obj[getConst.passwordLockingResetPeriodData] ?? 9;

      const durationSelect = queryById("passwordResetPeriodSelect");

      // Clear old

      durationSelect.innerHTML = "";

      for (resetVariant of resetDurationVariants) {
        const option = document.createElement("option");
        option.value = resetVariant.id;
        option.innerHTML = resetVariant.label[app_language];

        if (resetVariant.id == selected) {
          option.selected = true;
        }

        durationSelect.appendChild(option);
      }
    }
  );
}

// MARK: - Password Reset Screen

browser.storage.local.get(
  [
    getConst.passwordLockingResetPeriodData,
    getConstNotSyncing.extensionLanguage,
  ],
  function (obj) {
    const passwordLockingResetPeriod =
      obj[getConst.passwordLockingResetPeriodData] ?? 9;
    const languageFromStorage =
      obj[getConstNotSyncing.extensionLanguage] ?? "auto";

    let currentExtensionLanguage;

    if (languageFromStorage == "auto") {
      const userLocale = getLangCodeByBrowser();

      if (langSelectHasValue(userLocale)) {
        currentExtensionLanguage = userLocale;
      } else {
        currentExtensionLanguage = "en";
      }
    } else {
      currentExtensionLanguage = languageFromStorage;
    }

    if (passwordLockingResetPeriod != 0) {
      const foundObject = resetDurationVariants.find(
        (obj) => obj.id == passwordLockingResetPeriod
      );

      if (foundObject) {
        queryById("resetPeriodDisplayLabel").innerHTML =
          foundObject.label[currentExtensionLanguage];

        // Get the current date
        const currentDate = new Date();

        // Amount of time to add in minutes
        const minutesToAdd = foundObject.amountInMin;

        // Calculate the new date by adding minutes
        const newDate = new Date(currentDate.getTime() + minutesToAdd * 60000);

        // Format the new date
        const formattedDate = newDate.toLocaleString();

        // Set Formatted Date
        queryById("resetDateDisplayLabel").innerHTML = formattedDate;
      }
    }
  }
);

// MARK: - Password Unlocking Screen

// Show buttons if can

browser.storage.local.get(
  [
    getConst.passwordLockingPromptData,
    getConst.passwordLockingResetPeriodData,
    getConst.passwordLockingResetFinalDateData,
    getConst.passwordLockingResetIsActiveData,
  ],
  function (obj) {
    const currentDate = new Date();

    const passwordLockingPrompt = obj[getConst.passwordLockingPromptData] ?? "";
    const passwordLockingResetPeriod =
      obj[getConst.passwordLockingResetPeriodData] ?? 9;
    const passwordLockingResetFinalDate =
      obj[getConst.passwordLockingResetFinalDateData] ?? currentDate;
    const passwordLockingResetIsActive =
      obj[getConst.passwordLockingResetIsActiveData] ?? false;

    if (passwordLockingPrompt != "") {
      queryById("passwordUnlockingShowPromptButton").style.display = "block";
    }

    if (passwordLockingResetPeriod != 0) {
      const normalPasswordLockingResetFinalDate = new Date(
        passwordLockingResetFinalDate
      );

      if (passwordLockingResetIsActive) {
        if (currentDate < normalPasswordLockingResetFinalDate) {
          queryById("passwordUnlockingResetDateDisplaying").style.display =
            "block";
          queryById("passwordUnlockingResetDateDisplaying").innerHTML =
            "Password Reset Date: " +
            normalPasswordLockingResetFinalDate.toLocaleString();
        }
      } else {
        queryById("passwordUnlockingResetPasswordButton").style.display =
          "block";
      }
    }
  }
);

// MARK: - More Screen

// Set extension theme

function setExtensionTheme() {
  browser.storage.local.get(
    getConstNotSyncing.extensionThemeData,
    function (obj) {
      const data = obj[getConstNotSyncing.extensionThemeData] ?? "auto";

      queryById("extensionThemeSelect").value = data;
      document.documentElement.setAttribute("theme", data);
    }
  );
}

setExtensionTheme();

// Set iCloud Syncing

function setIcloudSyncing() {
  browser.storage.local.get(
    [getConst.userUniqueIdentifier, getConstNotSyncing.isCloudSyncingData],
    function (obj) {
      const uuid = obj[getConst.userUniqueIdentifier] ?? "";
      const data = obj[getConstNotSyncing.isCloudSyncingData] ?? "off";

      if (uuid) {
        queryById("iCloudSyncingSelect").value = data;
      } else {
        queryById("iCloudSyncingSelect").value = "off";
      }
    }
  );
}

setIcloudSyncing();

// Set My Other Apps Block showing

function setMyOtherAppsShowing() {
  browser.storage.local.get(getConst.myOtherAppsData, function (obj) {
    const data = obj[getConst.myOtherAppsData] ?? "showing";

    document.documentElement.setAttribute("myOtherApps", data);

    queryById("moreScreen").setAttribute(
      "isShowMyApp",
      data === "hide" ? false : true
    );
  });
}

setMyOtherAppsShowing();

// Set Login State

function setLoginState() {
  browser.storage.local.get(
    [getConstNotSyncing.pro_usernameData, getConst.userUniqueIdentifier],
    function (obj) {
      const userName = obj[getConstNotSyncing.pro_usernameData] ?? "";
      const uuid = obj[getConst.userUniqueIdentifier] ?? "";

      if (uuid != "" && !isBrowserSafari()) {
        queryById("userLoginEmail").innerHTML = userName;
        document.documentElement.setAttribute("isLogin", "true");
        app_isLogin = "true";
      }
    }
  );
}

setLoginState();

function setEmailPasswordFromStorage() {
  browser.storage.local.get(
    [getConstNotSyncing.pro_usernameData],
    function (obj) {
      const username = obj[getConstNotSyncing.pro_usernameData] ?? "";

      if (!isBrowserSafari()) {
        queryById("accountManageEmail").value = username;
      }
    }
  );
}

setEmailPasswordFromStorage();

// MARK: - Set is Pro to html

if (!isBrowserSafari()) {
  browser.storage.local.get(getConstNotSyncing.isUserPro, function (obj) {
    const isPro = obj[getConstNotSyncing.isUserPro] ?? false;

    if (isPro) {
      document.documentElement.setAttribute("isPRO", "true");
    } else {
      document.documentElement.setAttribute("isPRO", "false");
    }
  });
}

// MARK: - Shortcuts Screen

// Set shortcut

function setShortcut() {
  browser.storage.local.get(getConst.shortcuts[0], function (obj) {
    const data = obj[getConst.shortcuts[0]] ?? null;

    if (data != null) {
      queryById("setHotkeyButton").innerHTML = data.join("+").toUpperCase();
      querySelector(".hotKeyWrapper").classList.add("setted");
    }
  });
}

// MARK: - Browser Specific Things

function setBrowserBasedLinks() {
  // Rate Link

  const rateLink = document.querySelector(".dynamic-rate-link");

  if (rateLink) {
    if (app_browser == "safari") {
      rateLink.setAttribute(
        "href",
        "https://apps.apple.com/app/id1661093205?action=write-review"
      );
    } else if (app_browser == "firefox") {
      rateLink.setAttribute(
        "href",
        "https://addons.mozilla.org/firefox/addon/socialfocus/"
      );
    } else if (app_browser == "edge") {
      rateLink.setAttribute(
        "href",
        "https://microsoftedge.microsoft.com/addons/detail/socialfocus-hide-distrac/dkkbdagpdnmdakbbchbicnfcoifbdlfc"
      );
    } else {
      rateLink.setAttribute(
        "href",
        "https://chromewebstore.google.com/detail/socialfocus/abocjojdmemdpiffeadpdnicnlhcndcg"
      );
    }
  }

  // SocialFocus Link

  const socialFocusLink = document.querySelector(".dynamic-socialfocus-link");

  if (socialFocusLink) {
    if (app_browser == "safari") {
      socialFocusLink.setAttribute(
        "href",
        "https://apps.apple.com/app/untrap-for-youtube/id1637438059"
      );
    } else if (app_browser == "firefox") {
      socialFocusLink.setAttribute(
        "href",
        "https://addons.mozilla.org/firefox/addon/untrap-for-youtube/"
      );
    } else if (app_browser == "edge") {
      socialFocusLink.setAttribute(
        "href",
        "https://microsoftedge.microsoft.com/addons/detail/untrap-for-youtube/ngnefladcohhmmibccafkdbcijjoppdo"
      );
    } else {
      socialFocusLink.setAttribute(
        "href",
        "https://chromewebstore.google.com/detail/enboaomnljigfhfjfoalacienlhjlfil"
      );
    }
  }
}

function setSectionStyles(attr, previousAttr) {
  browser.storage.local.get(
    `socialFocus_${attr}_master_toggle`,
    function (obj) {
      const master_toggle = obj[`socialFocus_${attr}_master_toggle`] ?? false;

      const root = document.body;

      const styles = getComputedStyle(root);

      const categoryPickedPopupColor = styles.getPropertyValue(
        "--primary-color-on-primary-background"
      );

      if (previousAttr) {
        const collapsibleSection = document.querySelector(
          `#mainScreen .collapsibleSection[categoryId="${previousAttr}"]`
        );

        const pickedCategory = document.querySelector(
          `#mainScreen #activeCategoryButtonList .pickedCategory[categoryId="${previousAttr}"]`
        );

        const categoryPickedPopup = document.querySelector(
          `#mainScreen .optionCategorySelector .categoryPickerPopup .category[categoryId="${previousAttr}"]`
        );

        collapsibleSection.style.display = "none";
        pickedCategory.style.display = "none";
        categoryPickedPopup.style.color = "#fff";
      }

      const section = queryById("mainScreen");
      section.setAttribute("displayingCategoryId", attr);

      const collapsibleSection = document.querySelector(
        `#mainScreen .collapsibleSection[categoryId="${attr}"]`
      );

      const pickedCategory = document.querySelector(
        `#mainScreen #activeCategoryButtonList .pickedCategory[categoryId="${attr}"]`
      );

      const categoryPickedPopup = document.querySelector(
        `#mainScreen .optionCategorySelector .categoryPickerPopup .category[categoryId="${attr}"]`
      );

      collapsibleSection.style.display = "block";
      pickedCategory.style.display = "block";
      categoryPickedPopup.style.color = categoryPickedPopupColor;

      masterToggleHandler(attr, master_toggle);
    }
  );
}

function masterToggleHandler(currentHostName, checkedValue) {
  const currentCollapsibleSection = document.querySelector(
    `#mainScreen .collapsibleSection[categoryId="${currentHostName}"]`
  );

  const settingsGroup = currentCollapsibleSection.querySelectorAll(
    ".settingsGroup:not(:has(input[id*=master_toggle]))"
  );

  for (const group of settingsGroup) {
    if (checkedValue) {
      group.style.display = "none";
    } else {
      group.style.display = "block";
    }
  }
}

function cssPassToContentScript(id, styles, checkedValue) {
  getTabs().then((tabs) => {
    for (const tabIndex in tabs) {
      browser.storage.local.get(id, function (obj) {
        const value = obj[id] ?? checkedValue;
        browser.tabs.sendMessage(tabs[tabIndex].id, {
          id,
          styles,
          checkedValue: value,
          type: "toggle",
        });
      });
    }
  });
}

function initializeOptionsUpdatesSchedule(isPro) {
  browser.storage.local.get(
    [
      getConst.scheduleUpdateWeekDay,
      getConst.scheduleUpdateHour,
      getConst.extensionInitDate,
    ],
    function (obj) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("ru-RU");

      let scheduledDay = obj[getConst.scheduleUpdateWeekDay] ?? null;
      let scheduledHour = obj[getConst.scheduleUpdateHour] ?? null;
      const storedInitDate = obj[getConst.extensionInitDate] ?? formattedDate;

      if (scheduledDay === null || scheduledHour === null) {
        const formattedTime = now.toTimeString().slice(0, 5);

        const randomDay = Math.floor(Math.random() * 7);
        const currentHour = now.getHours();

        setToStorage(getConst.scheduleUpdateWeekDay, randomDay);
        setToStorage(getConst.scheduleUpdateHour, currentHour);

        setToStorage(getConst.extensionInitDate, storedInitDate);
        setToStorage(getConst.extensionInitTime, formattedTime);

        requestForNewOptionsForDb();
      }

      const [day, month, year] = storedInitDate.split(".");
      const baseDate = new Date(`${year}-${month}-${day}`);

      let nextScheduledDate;

      if (isPro) {
        nextScheduledDate = new Date(baseDate);
        nextScheduledDate.setDate(baseDate.getDate() + 1);
      } else {
        const baseDayOfWeek = baseDate.getDay();
        let daysToAdd = (scheduledDay - baseDayOfWeek + 7) % 7;
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }

        nextScheduledDate = new Date(baseDate);
        nextScheduledDate.setDate(baseDate.getDate() + daysToAdd);
      }

      const formattedNextDate = nextScheduledDate.toLocaleDateString("ru-RU");
      setToStorage(getConst.nextDateForUpdate, formattedNextDate);
    }
  );
}

function updateOptionsFromServer(isPro) {
  browser.storage.local.get(
    [getConst.scheduleUpdateHour, getConst.nextDateForUpdate],
    async function (obj) {
      const nextDateToUpdateStr = obj[getConst.nextDateForUpdate] ?? null;
      const scheduleHour = obj[getConst.scheduleUpdateHour] ?? null;

      if (nextDateToUpdateStr === null || scheduleHour === null) {
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();

      const currentDate = now.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const [currDay, currMonth, currYear] = currentDate.split(".");
      const currentDateObj = new Date(`${currYear}-${currMonth}-${currDay}`);

      const [nextDay, nextMonth, nextYear] = nextDateToUpdateStr.split(".");
      const nextUpdateDateObj = new Date(`${nextYear}-${nextMonth}-${nextDay}`);

      if (isPro) {
        if (
          currentDateObj >= nextUpdateDateObj &&
          currentHour >= scheduleHour
        ) {
          await requestForNewOptionsForDb().then(() => {
            setToStorage(getConst.extensionInitDate, currentDate);
          });
        }
      } else {
        if (
          currentDateObj >= nextUpdateDateObj &&
          currentHour >= scheduleHour
        ) {
          await requestForNewOptionsForDb().then(() => {
            setToStorage(getConst.extensionInitDate, currentDate);
          });
        }
      }
    }
  );
}

function requestForNewOptionsForDb() {
  return new Promise((resolve) => {
    browser.storage.local.get(
      [
        getConst.settingsStylesArray,
        getConst.settingsStylesArrayMobile,
        getConst.currentVersionOnSettingsRelease,
      ],
      async function (obj) {
        try {
          const isDesktopState = await isDesktopDeepCheck();
          const desktopOptionStylesFromServer =
            obj[getConst.settingsStylesArray] ?? [];
          const mobileOptionStylesFromServer =
            obj[getConst.settingsStylesArrayMobile] ?? [];
          const currentVersionOfRelease =
            obj[getConst.currentVersionOnSettingsRelease] ?? "";

          const optionStylesFromServer = isDesktopState
            ? desktopOptionStylesFromServer
            : mobileOptionStylesFromServer;

          if (optionStylesFromServer.length) {
            const options = await getPartialOptionsSettings(
              currentVersionOfRelease
            );

            const { releases, version_release } = options;

            if (releases.length) {
              const updatedDesktop = [...desktopOptionStylesFromServer];
              const updatedMobile = [...mobileOptionStylesFromServer];

              releases.forEach((item) => {
                if (item.is_mobile) {
                  const index = updatedMobile.findIndex(
                    (opt) => opt.settings_id === item.id
                  );

                  if (index !== -1) {
                    updatedMobile[index] = {
                      ...updatedMobile[index],
                      styles: item.styles,
                    };
                  }
                } else {
                  const index = updatedDesktop.findIndex(
                    (opt) => opt.settings_id === item.id
                  );
                  if (index !== -1) {
                    updatedDesktop[index] = {
                      ...updatedDesktop[index],
                      styles: item.styles,
                    };
                  }
                }
              });

              setToStorage(
                getConst.settingsStylesArrayMobile,
                updatedMobile,
                function () {}
              );

              setToStorage(
                getConst.settingsStylesArray,
                updatedDesktop,
                function () {}
              );

              setToStorage(
                getConst.currentVersionOnSettingsRelease,
                version_release,
                function () {}
              );
            }

            resolve();
          } else {
            const deskTopSettingsFromServer = [];
            const mobileStorageFromServer = [];

            const options = await getOptionsSettings(false);

            const { settings, current_version } = options;

            if (settings && settings.length) {
              settings.forEach((item) => {
                if (item.is_mobile) {
                  mobileStorageFromServer.push(item);
                } else {
                  deskTopSettingsFromServer.push(item);
                }
              });

              setToStorage(
                getConst.settingsStylesArrayMobile,
                mobileStorageFromServer,
                function () {}
              );

              setToStorage(
                getConst.settingsStylesArray,
                deskTopSettingsFromServer,
                function () {}
              );

              setToStorage(
                getConst.currentVersionOnSettingsRelease,
                current_version,
                function () {}
              );
            }

            resolve();
          }
        } catch (error) {
          console.error("Error:", error);
          resolve();
        }
      }
    );
  });
}

browser.storage.local.get(getConst.userUniqueIdentifier, function (obj) {
  const uuid = obj[getConst.userUniqueIdentifier] ?? "";

  if (uuid) {
    // checkForSpecialUsers(userName);
    if (!isBrowserSafari()) {
      requestUserFromDb(uuid)
        .then((result) => {
          if (result.user.isPaddlePro === 1 || result.user.isApplePro === 1) {
            app_isPRO = "true";
            setToStorage(getConstNotSyncing.isUserPro, true);
            initializeOptionsUpdatesSchedule(true);
            updateOptionsFromServer(true);
          } else {
            app_isPRO = "false";
            setToStorage(getConstNotSyncing.isUserPro, false);
            initializeOptionsUpdatesSchedule(false);
            updateOptionsFromServer(false);
          }
        })
        .catch((error) => {
          console.error(error);
          app_isPRO = "false";
          setToStorage(getConstNotSyncing.isUserPro, false);
          initializeOptionsUpdatesSchedule(false);
          updateOptionsFromServer(false);
        })
        .finally(() => {
          document.documentElement.setAttribute("isPRO", app_isPRO);

          tryToSyncFromServer();
        });
    } else {
      tryToSyncFromServer();
    }
  } else {
    initializeOptionsUpdatesSchedule(false);
    updateOptionsFromServer(false);
  }
});
