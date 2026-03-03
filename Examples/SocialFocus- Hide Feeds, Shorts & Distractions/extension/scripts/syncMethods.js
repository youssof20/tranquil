// MARK: - Fetch From Server

// Sync from server if outdated

function setOptionsFromString(options) {
  const optionsObjectsArray = JSON.parse(options);

  for (object of optionsObjectsArray) {
    const objID = object.id;
    const objValue = object.value;

    setToStorageWithoutSync(objID, objValue);
  }

  // Hide Syncing Popup

  queryById("syncMessage").style.display = "none";
}

function tryToSyncFromServer() {
  browser.storage.local.get(
    getConstNotSyncing.isCloudSyncingData,
    function (obj) {
      const isCloudSyncing =
        obj[getConstNotSyncing.isCloudSyncingData] ?? "off";

      if (
        app_isPRO == "true" &&
        app_isLogin == "true" &&
        isCloudSyncing == "on"
      ) {
        getCategoriesFromExtension().then((inputCategories) => {
          // Detect if Desktop or Mobile

          const containsMobileId = getAllOptions(inputCategories).some(
            (obj) =>
              obj.id === "socialFocus_linkedin_bottomBar_hide_button_home"
          );

          var fields = [];

          if (containsMobileId) {
            fields = [
              "socialfocus_LastSettingsModified",
              "socialfocus_FeaturesSettings",
              "socialfocus_MobileSettings",
            ];
          } else {
            fields = [
              "socialfocus_LastSettingsModified",
              "socialfocus_FeaturesSettings",
              "socialfocus_DesktopSettings",
            ];
          }

          // Fetch neccessary data from server

          browser.storage.local.get(
            [
              getConst.userUniqueIdentifier,
              getConstNotSyncing.pro_passwordData,
              getConstNotSyncing.lastSyncingDateData,
            ],
            function (obj) {
              const uuid = obj[getConst.userUniqueIdentifier] ?? "";
              const password = obj[getConstNotSyncing.pro_passwordData] ?? "";

              serverFetchSettings(uuid, password, fields)
                .then((result) => {
                  // Check by last synced data

                  const lastSync =
                    obj[getConstNotSyncing.lastSyncingDateData] ?? "0";

                  if (
                    Number(result.socialfocus_LastSettingsModified) >
                    Number(lastSync)
                  ) {
                    // Set data from storage to current

                    if (result.socialfocus_MobileSettings != null) {
                      setOptionsFromString(result.socialfocus_MobileSettings);
                    }

                    if (result.socialfocus_FeaturesSettings != null) {
                      setOptionsFromString(result.socialfocus_FeaturesSettings);
                    }

                    if (result.socialfocus_DesktopSettings != null) {
                      setOptionsFromString(result.socialfocus_DesktopSettings);
                    }

                    // Reload PopUp

                    let date = Date.now();
                    let lastSync = date.toString();

                    setToStorageWithoutSync(
                      getConstNotSyncing.lastSyncingDateData,
                      lastSync,
                      function () {
                        location.reload();
                      }
                    );
                  }
                })
                .catch((error) => {
                  // Handle errors here
                });
            }
          );
        });
      }
    }
  );
}

// MARK: - Update on Server

function updateSettingsStringInCloud() {
  if (app_isPRO == "true") {
    var mobileSettings = "";
    var desktopSettings = "";
    var featuresSettings = "";

    let date = Date.now();
    let lastModified = date.toString();

    browser.storage.local.get(
      [
        getConstNotSyncing.isCloudSyncingData,
        getConst.userUniqueIdentifier,
        getConstNotSyncing.pro_passwordData,
        ...getFeaturesArrayOfObjectIds(),
      ],
      function (obj) {
        const uuid = obj[getConst.userUniqueIdentifier] ?? "";
        const password = obj[getConstNotSyncing.pro_passwordData] ?? "";

        const isCloudSyncing =
          obj[getConstNotSyncing.isCloudSyncingData] ?? "off";

        if (isCloudSyncing == "on") {
          // Collect features list

          let featuresArrayOfObjects = [];

          for (featureObject of getFeaturesArrayOfObjectIds()) {
            const id = featureObject;
            const value = obj[featureObject];

            featuresArrayOfObjects.push({ id: id, value: value });
          }

          featuresSettings = JSON.stringify(featuresArrayOfObjects);

          // Collect options string

          getCategoriesFromExtension().then((inputCategories) => {
            let arrayOfOptionsIds = [];

            for (checkbox of getAllOptions(inputCategories)) {
              arrayOfOptionsIds.push(checkbox.id);
            }

            browser.storage.local.get(arrayOfOptionsIds, function (obj) {
              let optionsArrayOfObjects = [];
              let isMobileOptions = false;

              for (optionsObject of arrayOfOptionsIds) {
                const id = optionsObject;
                const value = obj[optionsObject];

                optionsArrayOfObjects.push({ id: id, value: value });

                if (id == "socialFocus_linkedin_bottomBar_hide_button_home") {
                  isMobileOptions = true;
                }
              }

              if (isMobileOptions) {
                mobileSettings = JSON.stringify(optionsArrayOfObjects);
              } else {
                desktopSettings = JSON.stringify(optionsArrayOfObjects);
              }

              // Send to server

              serverUpdateSettings(
                uuid,
                password,
                featuresSettings,
                desktopSettings,
                mobileSettings,
                lastModified
              )
                .then((result) => {
                  if (result == "Updated") {
                    setToStorageWithoutSync(
                      getConstNotSyncing.lastSyncingDateData,
                      lastModified,
                      function () {}
                    );
                  }
                })
                .catch((error) => {
                  // Handle errors here
                });
            });
          });
        }
      }
    );
  }
}
