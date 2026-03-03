// MARK: - Specify Browser

var browser = browser || chrome;

// MARK: - Special variable

const channelPageUrlPart1 = "youtube.com/@";
const channelPageUrlPart2 = "youtube.com/channel";

// MARK: - System Design Methods

function queryById(name) {
  return document.getElementById(name);
}

function querySelector(selector) {
  return document.querySelector(selector);
}

function querySelectorAll(selector) {
  return document.querySelectorAll(selector);
}

function isUserAgentMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function getSecondsFromMinutes(seconds) {
  const SECONDS_IN_MINUTE = 60;

  return Number(seconds * SECONDS_IN_MINUTE);
}

function inputBlocksClear() {
  const inputs = document.querySelectorAll(".verification-input");

  inputs.forEach((input) => {
    input.value = "";
  });
}

function inputsBlocksHandler(verifyEmailButton, verificationCode) {
  const inputs = document.querySelectorAll(".verification-input");

  function updateVerificationCode() {
    verificationCode.value = Array.from(inputs)
      .map((input) => input.value)
      .join("");

    if (verifyEmailButton) {
      if (verificationCode.value.length == 6) {
        verifyEmailButton.removeAttribute("disabled");
      } else {
        verifyEmailButton.setAttribute("disabled", "");
      }
    }
  }

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;

      // Allow only single digit
      if (value.length > 1) {
        e.target.value = value.slice(0, 1);
      }

      // Move to next input if current is filled, or blur if last input
      if (value.length === 1) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        } else {
          input.blur(); // Remove focus from last input
        }
      }

      // Validate input
      if (value && !/^[0-9]$/.test(value)) {
        e.target.value = "";
      }

      updateVerificationCode();
    });

    input.addEventListener("keydown", (e) => {
      // Move to previous input on backspace if empty
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }

      // If the input has a value and a digit key is pressed, clear the input first
      if (input.value && /^[0-9]$/.test(e.key)) {
        input.value = ""; // Clear the existing value before new input
      }

      if (e.key === "Backspace") {
        setTimeout(updateVerificationCode, 0);
      }
    });

    // Handle paste event
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
      if (pastedData.length) {
        for (let i = 0; i < inputs.length && i < pastedData.length; i++) {
          inputs[i].value = pastedData[i];
          if (i < inputs.length - 1 && i < pastedData.length - 1) {
            inputs[i + 1].focus();
          } else {
            inputs[i].blur();
          }
        }
      }

      updateVerificationCode();
    });
  });
}
