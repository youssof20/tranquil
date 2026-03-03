function getLocalizedOptionName(optionObjectName) {
  if (optionObjectName.hasOwnProperty(app_language)) {
    return optionObjectName[app_language];
  } else if (optionObjectName.hasOwnProperty("en")) {
    return optionObjectName.en;
  } else {
    return optionObjectName;
  }
}

function getLocalizedGroupName(groupObjectName) {
  if (groupObjectName.hasOwnProperty(app_language)) {
    return groupObjectName[app_language];
  } else if (groupObjectName.hasOwnProperty("en")) {
    return groupObjectName.en;
  } else {
    return groupObjectName;
  }
}

function getLocalizedCategoryName(categoryObjectName) {
  if (categoryObjectName.hasOwnProperty(app_language)) {
    return categoryObjectName[app_language];
  } else if (categoryObjectName.hasOwnProperty("en")) {
    return categoryObjectName.en;
  } else {
    return categoryObjectName;
  }
}

async function loadSettingsFromJson() {
  try {
    const url =
      window.location.protocol === "chrome-extension:"
        ? "./global/options/social_options.json"
        : browser.runtime.getURL("global/options/social_options.json");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const CATEGORIES = await response.json();
    return CATEGORIES;
  } catch (error) {
    console.error("Json retrieving error", error);
    return [];
  }
}

function findOptionById(id, categories) {
  // Loop through the categories
  for (const category of categories) {
    for (const group of category.categoryGroups) {
      // Check if the group has "options"
      if (group.options) {
        for (const option of group.options) {
          // Check if the option has the given ID
          if (option.id === id) {
            return option;
          }
        }
      }
    }
  }

  return null; // Return null if no element with the given ID is found
}

function getAllOptions(categories) {
  const allOptions = [];

  for (const category of categories) {
    for (const group of category.categoryGroups) {
      // Check if the group has "options"
      if (group.options) {
        allOptions.push(...group.options);
      }
    }
  }

  allOptions.push(OTHER_SETTINGS[0]);

  return allOptions;
  // Loop through the categories
}

function isBrowserSafari() {
  let userAgent = window.navigator.userAgent;

  if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return true;
  } else {
    return false;
  }
}

function isDesktop(href) {
  const desktopUrlParts = ["www.youtube.com"];
  const mobileUrlParts = ["m.youtube.com"];

  if (href.includes(desktopUrlParts) && !href.includes(mobileUrlParts)) {
    return true;
  } else if (!href.includes(desktopUrlParts) && href.includes(mobileUrlParts)) {
    return false;
  } else {
    return true;
  }
}

function validateStylesArray(options, fallback, isTesterMode = false) {
  if (isTesterMode && options?.tester_styles && options.tester_styles.length) {
    return options.tester_styles;
  }
  return options?.styles || fallback;
}
