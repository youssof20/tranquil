function showLogInError(text) {
  queryById("logInError").innerHTML = text;
  queryById("logInError").style.display = "block";
}

const loginSubmitButtonElement = queryById("logInButton");

function signInHandler(email, password) {
  serverLogIn(email, password)
    .then((signInResult) => {
      // Handle result
      if (signInResult.message == "Login") {
        // Set to storage
        setToStorage(
          getConstNotSyncing.pro_usernameData,
          email,
          function () {}
        );
        setToStorage(
          getConstNotSyncing.pro_passwordData,
          password,
          function () {}
        );
        setToStorage(
          getConst.userUniqueIdentifier,
          signInResult.uuid,
          function () {}
        );

        // Update isLogin state
        document.documentElement.setAttribute("isLogin", "true");
        app_isLogin = "true";

        // Update isPRO state

        if (signInResult.isPRO === 1) {
          document.documentElement.setAttribute("isPRO", "true");
          app_isPRO = "true";
        } else {
          document.documentElement.setAttribute("isPRO", "false");
          app_isPRO = "false";
        }

        // Set to Log Out Info
        queryById("userLoginEmail").innerHTML = email;

        // Back to More Screen
        showScreen("moreScreen");

        // Clean
        queryById("proLoginEmail").value = "";
        queryById("proLoginPassword").value = "";
        queryById("logInError").style.display = "none";
        setToStorageWithoutSync(
          getConstNotSyncing.temporary_username,
          "",
          function () {}
        );
        setToStorageWithoutSync(
          getConstNotSyncing.temporary_password,
          "",
          function () {}
        );
        setToStorageWithoutSync(
          getConstNotSyncing.temporary_uuid,
          "",
          function () {}
        );
        setToStorageWithoutSync(
          getConstNotSyncing.isShowVerificationScreen,
          false,
          function () {}
        );
        setToStorageWithoutSync(
          getConstNotSyncing.emailVerificationType,
          "",
          function () {}
        );

        // Set fields
        setEmailPasswordFromStorage();

        // Try to sync
        tryToSyncFromServer();

        loginSubmitButtonElement.removeAttribute("disabled");
      } else if (signInResult.message === "Your email not verified") {
        sendVerificationCode(signInResult.uuid)
          .then((result) => {
            if (result.message === "Verification code sent") {
              setToStorageWithoutSync(
                getConstNotSyncing.temporary_username,
                email,
                function () {}
              );
              setToStorageWithoutSync(
                getConstNotSyncing.temporary_password,
                password,
                function () {}
              );
              setToStorageWithoutSync(
                getConstNotSyncing.temporary_uuid,
                signInResult.uuid,
                function () {}
              );
              setToStorageWithoutSync(
                getConstNotSyncing.isShowVerificationScreen,
                true,
                function () {}
              );
              setToStorageWithoutSync(
                getConstNotSyncing.emailVerificationType,
                "login",
                function () {}
              );

              showScreen("emailVerification");

              loginSubmitButtonElement.removeAttribute("disabled");

              queryById("emailVerification").setAttribute(
                "typeOfVerification",
                "login"
              );

              document.querySelector(".verification-text").textContent = email;
            } else {
              showLogInError(result.error);
              loginSubmitButtonElement.removeAttribute("disabled");
            }
          })
          .catch((error) => {
            showLogInError("Error: " + error);
            loginSubmitButtonElement.removeAttribute("disabled");
          });
      } else {
        showLogInError(signInResult.message);
        loginSubmitButtonElement.removeAttribute("disabled");
      }
    })
    .catch((error) => {
      console.error(error);
      // Handle errors here
      showLogInError("Error: " + error.message);
      loginSubmitButtonElement.removeAttribute("disabled");
    });
}

document
  .querySelector(".logInForm")
  .addEventListener("submit", function (event) {
    // Prevent the default form submission behavior

    event.preventDefault();

    if (isBrowserSafari()) {
      return;
    } else {
      loginSubmitButtonElement.setAttribute("disabled", "");

      const email = queryById("proLoginEmail").value;
      const password = queryById("proLoginPassword").value;

      signInHandler(email, password);
    }
  });
