function showSignUpError(text) {
  queryById("signUpError").innerHTML = text;
  queryById("signUpError").style.display = "block";
}

function signUpAfterEmailVerified(email, uuid, password) {
  requestUserFromDb(uuid).then((result) => {
    // Set to storage
    setToStorage(getConstNotSyncing.pro_usernameData, email, function () {});
    setToStorage(getConstNotSyncing.pro_passwordData, password, function () {});

    setToStorage(getConst.userUniqueIdentifier, uuid, function () {});
    // Update isLogin state
    document.documentElement.setAttribute("isLogin", "true");
    app_isLogin = "true";
    // Update isPRO state
    if (result.user.isPRO === 1) {
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
    queryById("proSignUpEmail").value = "";
    queryById("proSignUpPassword").value = "";
    queryById("signUpError").style.display = "none";
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
  });
}

document
  .querySelector(".signUpForm")
  .addEventListener("submit", function (event) {
    // Prevent the default form submission behavior

    event.preventDefault();

    if (isBrowserSafari()) {
      return;
    } else {
      const signUpSubmitButtonElement = queryById("signUpButton");

      const email = queryById("proSignUpEmail").value;

      const password = queryById("proSignUpPassword").value;
      const confirmPassword = queryById("proSignUpConfirmPassword").value;

      signUpSubmitButtonElement.setAttribute("disabled", "");

      if (password === confirmPassword) {
        serverSignUp(email, password)
          .then((signUpResult) => {
            if (signUpResult.message === "Created") {
              sendVerificationCode(signUpResult.uuid)
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
                      getConstNotSyncing.isShowVerificationScreen,
                      true,
                      function () {}
                    );
                    setToStorageWithoutSync(
                      getConstNotSyncing.temporary_uuid,
                      signUpResult.uuid,
                      function () {}
                    );
                    setToStorageWithoutSync(
                      getConstNotSyncing.emailVerificationType,
                      "signUp",
                      function () {}
                    );

                    showScreen("emailVerification");

                    queryById("emailVerification").setAttribute(
                      "typeOfVerification",
                      "signUp"
                    );

                    signUpSubmitButtonElement.removeAttribute("disabled");

                    document.querySelector(".verification-text").textContent =
                      email;
                  } else {
                    showSignUpError(result.error);
                    signUpSubmitButtonElement.removeAttribute("disabled");
                  }
                })
                .catch((error) => {
                  showSignUpError("Error: " + error);
                  signUpSubmitButtonElement.removeAttribute("disabled");
                });
            } else {
              showSignUpError(signUpResult.message);
              signUpSubmitButtonElement.removeAttribute("disabled");
            }
          })
          .catch((error) => {
            // Handle errors here
            showSignUpError("Error: " + error);
            signUpSubmitButtonElement.removeAttribute("disabled");
          });
      } else {
        showSignUpError("Error: Password does not match the confirm password");
        signUpSubmitButtonElement.removeAttribute("disabled");
      }
    }
  });
