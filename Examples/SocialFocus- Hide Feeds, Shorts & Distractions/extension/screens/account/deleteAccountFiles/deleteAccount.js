function showDeleteAccountError(text) {
  queryById("deleteAccountError").innerHTML = text;
  queryById("deleteAccountError").style.display = "block";
}

document
  .querySelector("#submitDeleteAccountButton")
  .addEventListener("click", function () {
    if (isBrowserSafari()) {
      return;
    } else {
      browser.storage.local.get(getConst.userUniqueIdentifier, function (obj) {
        const uuid = obj[getConst.userUniqueIdentifier] ?? "";
        if (uuid) {
          deleteUserFromDb(uuid)
            .then((result) => {
              if (result.message === "User deleted successfully") {
                setToStorage(
                  getConstNotSyncing.pro_usernameData,
                  "",
                  function () {}
                );

                setToStorage(
                  getConstNotSyncing.pro_passwordData,
                  "",
                  function () {}
                );

                setToStorage(getConst.userUniqueIdentifier, "", function () {});

                setToStorageWithoutSync(
                  getConstNotSyncing.isCloudSyncingData,
                  "off"
                );

                document.documentElement.setAttribute("isLogin", "false");
                document.documentElement.setAttribute("isPRO", "false");

                queryById("userLoginEmail").innerHTML = "";

                app_isLogin = "false";
                app_isPRO = "false";

                showScreen("moreScreen");
              } else {
                showDeleteAccountError(result.error);
              }
            })
            .catch((error) => {
              // Handle errors here
              showDeleteAccountError(error);
            });
        }
      });
    }
  });
