(function () {
  // MARK: - Router

  function setHrefToSubmitButton() {
    browser.storage.local.get(
      [getConstNotSyncing.pro_usernameData, getConst.userUniqueIdentifier],
      function (obj) {
        const userEmail = obj[getConstNotSyncing.pro_usernameData] ?? "";
        const uuid = obj[getConst.userUniqueIdentifier] ?? "";

        const submitButton = document.querySelector(
          ".subScreenInfo .submitButton"
        );

        const encodedEmail = encodeURIComponent(userEmail);
        const encodeUUID = encodeURIComponent(uuid);

        const href = isBrowserSafari()
          ? `socialfocus://`
          : `https://socialfocus.app/offer/?email=${encodedEmail}&uuid=${encodeUUID}`;

        submitButton.setAttribute("href", href);
      }
    );
  }

  setHrefToSubmitButton();

  queryById("fromMoreToImportExport").addEventListener("click", function () {
    createStringWithSettings();
  });

  queryById("extraLinksButton").onclick = function () {
    if (queryById("appLinksWrapper").classList.contains("clicked")) {
      queryById("appLinksWrapper").classList.remove("clicked");
    } else {
      queryById("appLinksWrapper").classList.add("clicked");
    }
  };

  // MARK: - Actions

  // Click on links button

  queryById("appLinksWrapper").addEventListener("click", function () {
    const popUp = document.querySelector("#moreScreen .linksPickerPopup");
    const isVisible = popUp.hasAttribute("active");

    if (isVisible) {
      popUp.removeAttribute("active");
    } else {
      popUp.setAttribute("active", "");
    }
  });

  // Click on row with select

  const itemsWithSelect = querySelectorAll(
    "#moreScreen .popUpMenuList:has(select)"
  );

  for (const index in itemsWithSelect) {
    const item = itemsWithSelect[index];
    item.onclick = function () {
      showDropdown(item.querySelector("select"));
    };
  }

  // Change theme select

  queryById("extensionThemeSelect").onchange = function () {
    const newSelectValue = queryById("extensionThemeSelect").value;

    // Update HTML attribute

    document.documentElement.setAttribute("theme", newSelectValue);

    // Update in storage

    setToStorage(
      getConstNotSyncing.extensionThemeData,
      newSelectValue,
      function () {}
    );
  };

  // Change lang select

  queryById("extensionLanguageSelect").onchange = function () {
    const newSelectValue = queryById("extensionLanguageSelect").value;

    // Update Var

    app_language = newSelectValue;

    // Update in storage

    setToStorage(
      getConstNotSyncing.extensionLanguage,
      newSelectValue,
      function () {
        // Trigger Extension Update

        setLanguage();
      }
    );
  };

  // Change My Other Apps view

  document.querySelector(".popUpMenuListGroupHeaderContainer").onclick =
    function () {
      var isShowing = queryById("moreScreen").getAttribute("isShowMyApp");

      queryById("moreScreen").setAttribute("isShowMyApp", isShowing == "false");

      document.documentElement.setAttribute(
        "myOtherApps",
        isShowing === "true" ? "hide" : "showing"
      );

      setToStorage(
        getConst.myOtherAppsData,
        isShowing === "true" ? "hide" : "showing"
      );
    };

  function accountOptionClick() {
    browser.storage.local.get(getConst.userUniqueIdentifier, function (obj) {
      const uuid = obj[getConst.userUniqueIdentifier] ?? "";

      if (uuid) {
        showScreen("accountManageScreen");
      } else {
        showScreen("proLoginScreen");
      }
    });
  }

  document.querySelector(".profileInfo").onclick = function () {
    if (isBrowserSafari()) {
      return;
    } else {
      accountOptionClick();
    }
  };

  queryById("iCloudSyncingSelect").onchange = function () {
    const newSelectValue = queryById("iCloudSyncingSelect").value;

    browser.storage.local.get(getConst.userUniqueIdentifier, function (obj) {
      const uuid = obj[getConst.userUniqueIdentifier] ?? "";

      if (uuid) {
        if (app_isPRO == "true") {
          setToStorageWithoutSync(
            getConstNotSyncing.isCloudSyncingData,
            newSelectValue,
            function () {
              if (newSelectValue == "on") {
                setToStorageWithoutSync(
                  getConstNotSyncing.lastSyncingDateData,
                  "0",
                  function () {
                    tryToSyncFromServer();
                  }
                );
              }
            }
          );
        } else {
          queryById("iCloudSyncingSelect").value = "off";
          setToStorageWithoutSync(getConstNotSyncing.isCloudSyncingData, "off");
          showScreen("plusPromoScreen");
        }
      } else {
        queryById("iCloudSyncingSelect").value = "off";
        setToStorageWithoutSync(getConstNotSyncing.isCloudSyncingData, "off");
        if (isBrowserSafari()) {
          window.open("socialfocus://");
        } else {
          showScreen("proLoginScreen");
        }
      }
    });
  };

  function setVersionToIdeasBugsLink() {
    browser.storage.local.get(
      getConst.currentVersionOnSettingsRelease,
      function (obj) {
        const ideasBugsButton = document.querySelector("#ideas-bugs-link");

        const releaseVersion =
          obj[getConst.currentVersionOnSettingsRelease] ?? "";

        if (releaseVersion) {
          ideasBugsButton.href = `https://untrap.app/support?version=${releaseVersion}`;
        }
      }
    );
  }

  setVersionToIdeasBugsLink();

  // Remove active state from all tabs

  // function makeUnactiveAllTabs() {
  //   const filterTabs = document.querySelectorAll(
  //     "#moreScreen .segmentedPicker .option"
  //   );

  //   for (const tab of filterTabs) {
  //     tab.removeAttribute("active");
  //   }
  // }

  // Tabs click: Basic, PRO

  // const versionTabs = document.querySelectorAll(
  //   "#moreScreen .segmentedPicker .option"
  // );

  // for (const tab of versionTabs) {
  //   tab.onclick = function () {
  //     makeUnactiveAllTabs();
  //     this.setAttribute("active", "");
  //     const activeTabId = this.getAttribute("data-id");

  //     const allContainers = document.querySelectorAll(
  //       "#moreScreen .feauturesContainer"
  //     );

  //     for (const container of allContainers) {
  //       container.removeAttribute("active");
  //     }

  //     const activeContainer = document.querySelector(
  //       "#moreScreen .feauturesContainer[data-id='" + activeTabId + "']"
  //     );
  //     activeContainer.setAttribute("active", "");
  //   };
  // }
})();
