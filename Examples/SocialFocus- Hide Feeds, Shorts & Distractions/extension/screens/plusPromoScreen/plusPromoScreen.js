const promoScreenGetPlusButton = document.querySelector(
  "#plusPromoScreen .proButton"
);

promoScreenGetPlusButton.addEventListener("click", () => {
  browser.storage.local.get(
    [getConstNotSyncing.pro_usernameData, getConst.userUniqueIdentifier],
    function (obj) {
      const userName = obj[getConstNotSyncing.pro_usernameData] ?? "";
      const uuid = obj[getConst.userUniqueIdentifier] ?? "";
      const encodeUUID = encodeURIComponent(uuid);

      if (!uuid) {
        if (isBrowserSafari()) {
          window.open("socialfocus://");
        } else {
          showScreen("proSignUpScreen");

          setToStorageWithoutSync(
            getConstNotSyncing.isGetUnlimitedProPlanNonAuth,
            true
          );
        }
      } else {
        const encodedEmail = encodeURIComponent(userName);

        const redirectUrl = isBrowserSafari()
          ? `socialfocus://`
          : `https://socialfocus.app/offer/?email=${encodedEmail}&uuid=${encodeUUID}`;

        window.open(redirectUrl, "_blank");
      }
    }
  );
});
