// Send Message to background.js
browser.runtime.sendMessage({ command: "getProStatus" }).then((response) => {});

// Listen Messages from background.js

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command == "getProStatusResponse") {
    // Set PRO status to html
    const { isPRO, uuid } = request;

    if (isPRO) {
      document.documentElement.setAttribute("isPRO", "true");
      app_isPRO = "true";
      setToStorage(getConstNotSyncing.isUserPro, true);
    } else {
      document.documentElement.setAttribute("isPRO", "false");
      app_isPRO = "false";
      setToStorage(getConstNotSyncing.isUserPro, false);
    }

    if (uuid) {
      document.documentElement.setAttribute("isLogin", "true");
      app_isLogin = "true";

      // setToStorage(getConstNotSyncing.pro_usernameData, email, function () {});

      setToStorage(getConst.userUniqueIdentifier, uuid, function () {});
    } else {
      document.documentElement.setAttribute("isLogin", "false");
      app_isLogin = "false";

      // setToStorage(getConstNotSyncing.pro_usernameData, "", function () {});
      setToStorage(getConst.userUniqueIdentifier, "", function () {});
    }

    // const el = document.getElementById("proBadge");

    // el.innerHTML = request.isPRO;
  }
});
