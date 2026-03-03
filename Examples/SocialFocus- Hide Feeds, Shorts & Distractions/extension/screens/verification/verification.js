const verificationCode = { value: "" };

const verifyEmailButton = queryById("verifyEmail");
const resendCodeButton = queryById("resendCode");
const changeEmail = queryById("changeEmail");
const backButton = document.querySelector("#emailVerification .backButton");

function setVerificationType() {
  browser.storage.local.get(
    getConstNotSyncing.emailVerificationType,
    function (obj) {
      const emailVerificationType =
        obj[getConstNotSyncing.emailVerificationType] ?? "";

      queryById("emailVerification").setAttribute(
        "typeOfVerification",
        emailVerificationType
      );
    }
  );
}

function setEmailToDescription() {
  browser.storage.local.get(
    getConstNotSyncing.temporary_username,
    function (obj) {
      const email = obj[getConstNotSyncing.temporary_username] ?? "";

      document.querySelector(".verification-text").textContent = email;
    }
  );
}

function clearVerificationStore() {
  const verificationType =
    queryById("emailVerification").getAttribute("typeOfVerification");

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

  if (verificationType === "login") {
    showScreen("proLoginScreen");
  }

  if (verificationType === "signUp") {
    showScreen("proSignUpScreen");
  }

  inputBlocksClear();

  verificationCode.value = "";

  document.querySelector(".verification-text").textContent = "";
}

function showVerificationError({ text, isSuccess = false }) {
  if (!isSuccess) {
    queryById("verificationError").innerHTML = text;
    queryById("verificationError").style.display = "block";
  } else {
    queryById("verificationError").innerHTML = "";
    queryById("verificationError").style.display = "none";
  }
}

inputsBlocksHandler(verifyEmailButton, verificationCode);

setVerificationType();
setEmailToDescription();

changeEmail.addEventListener("click", clearVerificationStore);
backButton.addEventListener("click", clearVerificationStore);

verifyEmailButton.addEventListener("click", function () {
  verifyEmailButton.setAttribute("disabled", "");
  browser.storage.local.get(
    [
      getConstNotSyncing.temporary_password,
      getConstNotSyncing.temporary_username,
      getConstNotSyncing.temporary_uuid,
    ],
    function (obj) {
      const email = obj[getConstNotSyncing.temporary_username] ?? "";
      const password = obj[getConstNotSyncing.temporary_password] ?? "";
      const uuid = obj[getConstNotSyncing.temporary_uuid] ?? "";
      const verificationType =
        queryById("emailVerification").getAttribute("typeOfVerification");

      verifyOTPCode(uuid, verificationCode.value)
        .then((result) => {
          if (result.message === "Code verified") {
            showVerificationError({ text: "", isSuccess: true });

            if (verificationType === "signUp") {
              signUpAfterEmailVerified(email, uuid, password);
            }

            if (verificationType === "login") {
              signInHandler(email, password);
            }
          } else {
            if (
              result.error === "Something went wrong" ||
              result.error === "Code expired"
            ) {
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
            }
            showVerificationError({ text: result.error, isSuccess: false });
          }
        })
        .catch((error) => {
          showVerificationError({ text: "Error: " + error, isSuccess: false });
        })
        .finally(() => {
          verifyEmailButton.removeAttribute("disabled");
        });
    }
  );
});

resendCodeButton.addEventListener("click", function () {
  resendCodeButton.setAttribute("disabled", "");

  browser.storage.local.get(getConstNotSyncing.temporary_uuid, function (obj) {
    const uuid = obj[getConstNotSyncing.temporary_uuid] ?? "";

    sendVerificationCode(uuid)
      .then((result) => {
        if (result.message === "Verification code sent") {
          showVerificationError({ text: "", isSuccess: true });
        } else {
          showVerificationError({ text: result.error, isSuccess: false });
        }
      })
      .catch((error) => {
        showVerificationError({ text: "Error: " + error, isSuccess: false });
      })
      .finally(() => {
        resendCodeButton.removeAttribute("disabled");
      });
  });
});
