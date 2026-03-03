const styleSheets = new Map();

function processStyles(styles) {
  const displayNoneSelectors = [];
  const customStyles = [];

  styles.forEach((style) => {
    if (style.includes("!important")) {
      customStyles.push(style);
    } else {
      displayNoneSelectors.push(style);
    }
  });

  let finalCss = "";

  if (displayNoneSelectors.length > 0) {
    finalCss +=
      displayNoneSelectors.join(",\n") + " {\n  display: none !important;\n}\n";
  }

  if (customStyles.length > 0) {
    finalCss += customStyles.join("\n");
  }

  return finalCss;
}

function applyStyles(featureKey, styles) {
  if (styleSheets.has(featureKey)) return;

  const cssText = processStyles(styles);

  try {
    const sheet = new CSSStyleSheet();
    sheet.replace(cssText);
    styleSheets.set(featureKey, sheet);

    if (document.adoptedStyleSheets) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    } else {
      throw new Error("adoptedStyleSheets not supported");
    }
  } catch {
    const style = document.createElement("style");
    style.textContent = cssText;
    style.setAttribute("data-feature", featureKey);
    document.head.appendChild(style);
    styleSheets.set(featureKey, style);
  }
}

function removeStyles(featureKey) {
  const styleSheet = styleSheets.get(featureKey);
  if (!styleSheet) return;

  try {
    if (document.adoptedStyleSheets && styleSheet instanceof CSSStyleSheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== styleSheet
      );
    } else {
      throw new Error("adoptedStyleSheets not supported");
    }
  } catch {
    const styleElement = document.querySelector(
      `style[data-feature="${featureKey}"]`
    );
    if (styleElement) {
      styleElement.remove();
    }
  }

  styleSheets.delete(featureKey);
}

function toggleFeatureStyles(featureKey, value, styles) {
  if (typeof value === "string") {
    if (styleSheets.has(featureKey)) {
      removeStyles(featureKey);
    }

    if (value !== "" && value !== "false" && value !== "true") {
      applyStyles(featureKey, styles);
    }
  } else {
    if (value) {
      applyStyles(featureKey, styles);
    } else {
      removeStyles(featureKey);
    }
  }
}
