(function () {
  let videoPlayer = null;

  const videoControlsConfig = {
    attributes: true,
    attributeFilter: ["controls"],
  };

  const videoRenderConfig = {
    childList: true,
    subtree: true,
  };

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "setNativeVideoPlayer") {
      const isShowNativeVideoPlayer = message.isShowNativeVideoPlayer;

      validateShowNativePlayer(isShowNativeVideoPlayer);
    }
  });

  window.addEventListener("message", (event) => {
    if (event.data.action === "setNativeVideoPlayer") {
      const isShowNativeVideoPlayer = event.data.isShowNativeVideoPlayer;

      validateShowNativePlayer(isShowNativeVideoPlayer);
    }
  });

  function validateShowNativePlayer(isShowNativeVideoPlayer) {
    if (isShowNativeVideoPlayer) {
      videoRenderObserver.observe(document.body, videoRenderConfig);
    } else {
      if (videoPlayer) {
        videoPlayer.controls = false;
      }

      videoRenderObserver.disconnect();
      videoControlsObserver.disconnect();
    }
  }

  const videoRenderObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      browser.storage.local.get(getConst.optionsState, function (obj) {
        const optionState = obj[getConst.optionsState] ?? {};
        const isShowNativeVideoPlayer =
          optionState[getConst.showNativePlayer] ?? false;

        const youtubeVideoPlayer = document.querySelector("video");

        if (youtubeVideoPlayer) {
          videoPlayer = youtubeVideoPlayer;

          if (isShowNativeVideoPlayer && youtubeVideoPlayer) {
            videoPlayer.controls = true;
            videoControlsObserver.observe(videoPlayer, videoControlsConfig);
          }
        }
      });
    });
  });

  const videoControlsObserver = new MutationObserver((records) => {
    records.forEach((mutation) => {
      const video = mutation.target;

      if (video.controls !== true) {
        video.controls = true;
      }
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    browser.storage.local.get(getConst.optionsState, function (obj) {
      const optionState = obj[getConst.optionsState] ?? {};
      const showNativeVideoPlayer =
        optionState[getConst.showNativePlayer] ?? false;

      if (showNativeVideoPlayer) {
        videoRenderObserver.observe(document.body, videoRenderConfig);
      }
    });
  });
})();
