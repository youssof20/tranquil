function disabledAdditionalOptions() {
  window.postMessage(
    {
      id: getConst.showNativePlayer,
      action: "setNativeVideoPlayer",
      isShowNativeVideoPlayer: false,
    },
    "*",
  );

  window.postMessage(
    {
      id: getConst.disableAutoplay,
      action: "setVideoAutoPlay",
      isDisableAutoPlay: false,
    },
    "*",
  );

  window.postMessage(
    {
      id: getConst.addSummarizeButtonState,
      action: "addSummarizeButton",
      isAddSummarizeButton: false,
    },
    "*",
  );

  window.postMessage({ type: "SET_VIDEO_QUALITY", videoQuality: "auto" }, "*");

  validateFont("default");
  validateAccentColor("default");
  validateSecondColor("default");
  validatePrimaryColor("default");
  startThumbnailReplacing("hqdefault");
  triggerThumbnailUpdate("hqdefault");
}

function activateAdditionalOptions() {
  browser.storage.local.get(
    [getConst.optionsState, getConst.system],
    function (obj) {
      const optionState = obj[getConst.optionsState] ?? {};
      const systemState = obj[getConst.system] ?? {};
      const summarizeWindowState =
        systemState[getConst.summarizeWindowState] ?? {};

      const videoQuality = optionState[getConst.videoQuality] ?? "auto";
      const isShowNativeVideoPlayer =
        optionState[getConst.showNativePlayer] ?? false;
      const isDisableAutoPlay = optionState[getConst.disableAutoplay] ?? false;
      const isAddSummarizeButton =
        optionState[getConst.addSummarizeButtonState] ?? true;
      const isShowSummarizeWindow =
        summarizeWindowState[getConst.isShowSummarizeWindow] ?? false;
      const fontToSet = optionState["untrap_appearance_font"] ?? "default";
      const accentColorToSet =
        optionState["untrap_appearance_color"] ?? "default";
      const primaryColorToSet =
        optionState["untrap_appearance_primary_bg_color"] ?? "default";

      window.postMessage(
        {
          id: getConst.showNativePlayer,
          action: "setNativeVideoPlayer",
          isShowNativeVideoPlayer,
        },
        "*",
      );

      window.postMessage(
        {
          id: getConst.disableAutoplay,
          action: "setVideoAutoPlay",
          isDisableAutoPlay,
        },
        "*",
      );

      window.postMessage(
        {
          id: getConst.addSummarizeButtonState,
          action: "addSummarizeButton",
          isAddSummarizeButton,
        },
        "*",
      );

      window.postMessage(
        {
          id: getConst.isShowSummarizeWindow,
          action: "showSummarizeWindow",
          isShowSummarizeWindow,
        },
        "*",
      );

      window.postMessage({ type: "SET_VIDEO_QUALITY", videoQuality }, "*");

      validateFont(fontToSet);
      validateAccentColor(accentColorToSet);
      validateSecondColor(accentColorToSet);
      validatePrimaryColor(primaryColorToSet);
    },
  );
}
