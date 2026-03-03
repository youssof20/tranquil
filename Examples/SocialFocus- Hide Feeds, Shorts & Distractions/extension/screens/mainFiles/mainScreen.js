(function () {
  addEventListener("load", (event) => {
    if (isBrowserSafari()) {
      return;
    } else {
      browser.storage.local.get(getConst.userUniqueIdentifier, function (obj) {
        const uuid = obj[getConst.userUniqueIdentifier] ?? "";

        if (uuid) {
          requestUserFromDb(uuid)
            .then((result) => {
              if (
                result.user.isPaddlePro === 1 ||
                result.user.isApplePro === 1
              ) {
                app_isPRO = "true";
              } else {
                app_isPRO = "false";
              }
            })
            .catch((error) => {
              console.error(error);
              app_isPRO = "false";
            })
            .finally(() => {
              document.documentElement.setAttribute("isPRO", app_isPRO);
              tryToSyncFromServer();
            });
        }
      });
    }
  });

  // MARK: - Category Picker

  queryById("activeCategoryButton").onclick = function () {
    var isShowing = queryById("mainScreen").getAttribute(
      "categoryPickerIsShowing"
    );
    queryById("mainScreen").setAttribute(
      "categoryPickerIsShowing",
      isShowing == "false"
    );
  };

  // MARK: - Router

  function showUnlockScreen() {
    queryById("unlockPasswordTextField").classList.remove("error");
    queryById("unlockPasswordTextField").value = "";
    queryById("wrongProtectionPasswordError").style.display = "none";
    showScreen("unlockScreen");
  }

  // MARK: - Power Button

  function blockExtensionListener(changes) {
    if (changes[getConstNotSyncing.extensionIsEnabledData]) {
      const { newValue } = changes[getConstNotSyncing.extensionIsEnabledData];

      document.documentElement.setAttribute("disabled", !newValue);
    }
  }

  function onOffClickHandler(turnType, element) {
    browser.storage.onChanged.removeListener(blockExtensionListener);

    const blockTimeInMinutes = +element.dataset.value;

    const popUp = document.querySelector(
      `#mainScreen .turn${turnType}PickerPopup`
    );

    popUp.removeAttribute("active");

    if (blockTimeInMinutes !== 0) {
      browser.storage.onChanged.addListener(blockExtensionListener);
    }

    extensionBlockTimerHandler(blockTimeInMinutes, turnType);

    if (turnType === "Off") {
      setToStorage(
        getConstNotSyncing.extensionBlockTime,
        blockTimeInMinutes,
        function () {
          sendCommand(
            getConstNotSyncing.extensionBlockTime,
            blockTimeInMinutes
          );
        }
      );
    }

    if (turnType === "On") {
      setToStorage(
        getConstNotSyncing.extensionEnableTime,
        blockTimeInMinutes,
        function () {
          sendCommand(
            getConstNotSyncing.extensionEnableTime,
            blockTimeInMinutes
          );
        }
      );
    }
  }

  // Set State

  const plusButtons = document.querySelectorAll(".proButton");
  const mainScreenPlusButton = document.querySelector("#mainScreen .proButton");

  function validateGradientColor() {
    const maxNumberOfGradient = 16;
    browser.storage.local.get(
      [getConst.gradientIndex, getConst.gradientCurrentDate],
      function (obj) {
        let gradientIndex = obj[getConst.gradientIndex] ?? 0;
        const gradientCurrentDate = obj[getConst.gradientCurrentDate] ?? "";
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split("T")[0];

        if (gradientCurrentDate !== currentDateString) {
          gradientIndex++;

          if (gradientIndex > maxNumberOfGradient) {
            gradientIndex = 1;
          }

          setToStorage(
            getConst.gradientCurrentDate,
            currentDateString,
            function () {}
          );

          setToStorage(getConst.gradientIndex, gradientIndex, function () {});
        }
        plusButtons.forEach((item) => {
          item.setAttribute("gradient", `${gradientIndex}`);
        });
      }
    );
  }

  validateGradientColor();

  mainScreenPlusButton.addEventListener("click", () => {
    showScreen("plusPromoScreen");
  });

  browser.storage.local.get(
    getConstNotSyncing.extensionIsEnabledData,
    function (obj) {
      const globalDefault = true;
      const status =
        obj[getConstNotSyncing.extensionIsEnabledData] ?? globalDefault;

      document.documentElement.setAttribute("disabled", status != true);
    }
  );

  browser.storage.onChanged.addListener(blockExtensionListener);

  // Click

  queryById("powerButton").onclick = function () {
    browser.storage.local.get(
      getConstNotSyncing.extensionIsEnabledData,
      function (obj) {
        const globalDefault = true;
        const status =
          obj[getConstNotSyncing.extensionIsEnabledData] ?? globalDefault;

        if (status) {
          const turnOffPopUp = document.querySelector(
            "#mainScreen .turnOffPickerPopup"
          );
          const isVisible = turnOffPopUp.hasAttribute("active");

          if (isVisible) {
            turnOffPopUp.removeAttribute("active");
          } else {
            turnOffPopUp.setAttribute("active", "");
          }
        } else {
          const turnOnPopUp = document.querySelector(
            "#mainScreen .turnOnPickerPopup"
          );
          const isVisible = turnOnPopUp.hasAttribute("active");

          if (isVisible) {
            turnOnPopUp.removeAttribute("active");
          } else {
            turnOnPopUp.setAttribute("active", "");
          }
        }
      }
    );
  };

  // Select time for block or enable extension

  const turnOffElements = document
    .querySelector(".turnOffPickerPopup")
    .querySelectorAll(".turnOffElement");

  for (const element of turnOffElements) {
    element.onclick = () => onOffClickHandler("Off", element);
  }

  const turnOnElements = document
    .querySelector(".turnOnPickerPopup")
    .querySelectorAll(".turnOnElement");

  for (const element of turnOnElements) {
    element.onclick = () => onOffClickHandler("On", element);
  }
})();
