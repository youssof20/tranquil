'use strict';

(function () {
  let lastContextTarget = null;

  function getRootNode(el) {
    return el && el.getRootNode ? el.getRootNode() : (el && el.ownerDocument);
  }

  function isShadowRoot(node) {
    return node && node.nodeType === 11;
  }

  function getPathStep(el) {
    const parent = el.parentNode;
    if (!parent) return null;
    if (isShadowRoot(parent)) {
      const host = parent.host;
      const childIndex = Array.from(parent.children).indexOf(el);
      const hostParent = host.parentNode;
      const hostIndex = hostParent && !isShadowRoot(hostParent)
        ? Array.from(hostParent.children).filter(c => c.tagName === host.tagName).indexOf(host)
        : 0;
      return { type: 'shadow', hostTag: host.tagName.toLowerCase(), hostIndex, childIndex };
    }
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    const index = siblings.indexOf(el);
    return { type: 'child', tag: el.tagName.toLowerCase(), index };
  }

  function pathFromRoot(el) {
    const path = [];
    let current = el;
    while (current && current !== document.body) {
      const step = getPathStep(current);
      if (step) path.unshift(step);
      const parent = current.parentNode;
      if (isShadowRoot(parent)) current = parent.host;
      else current = parent && parent !== document ? parent : null;
    }
    return path;
  }

  function findElementByPath(root, path) {
    if (!path.length) return root;
    let current = root;
    for (const step of path) {
      if (!current) return null;
      if (step.type === 'shadow') {
        const candidates = Array.from(current.children).filter(c => c.tagName && c.tagName.toLowerCase() === step.hostTag);
        const host = candidates[step.hostIndex];
        if (!host || !host.shadowRoot) return null;
        current = host.shadowRoot.children[step.childIndex];
      } else {
        const children = Array.from(current.children).filter(c => c.tagName && c.tagName.toLowerCase() === step.tag);
        current = children[step.index];
      }
    }
    return current;
  }

  function applyZapStyle(root, selector, css) {
    const appendTarget = (root === document || root === document.documentElement) ? document.head : root;
    if (!appendTarget) return;
    let style = appendTarget.querySelector && appendTarget.querySelector('style[data-tranquil-zap]');
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('data-tranquil-zap', '');
      style.textContent = css;
      appendTarget.appendChild(style);
    } else {
      style.textContent += css;
    }
  }

  function hideElement(el) {
    const root = getRootNode(el);
    const id = 'tranquil-zap-' + Math.random().toString(36).slice(2, 10);
    el.setAttribute('data-tranquil-zap-id', id);
    const sel = '[data-tranquil-zap-id="' + id + '"]';
    const css = sel + ' { display: none !important; }\n';
    applyZapStyle(root, sel, css);
  }

  function applyStoredZaps(origin) {
    chrome.storage.local.get({ customHides: {} }, (data) => {
      const entries = data.customHides[origin];
      if (!entries || !Array.isArray(entries)) return;
      const root = document.body;
      if (!root) return;
      entries.forEach(({ path }) => {
        const el = findElementByPath(root, path);
        if (el && !el.hasAttribute('data-tranquil-zap-id')) hideElement(el);
      });
    });
  }

  function onContextMenu(e) {
    lastContextTarget = e.target;
  }

  function initContextMenu() {
    document.addEventListener('contextmenu', onContextMenu, true);
  }

  function observeBodyForNewNodes(origin) {
    const body = document.body;
    if (!body) return;
    let debounceTimer = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => applyStoredZaps(origin), 150);
    });
    observer.observe(body, { childList: true, subtree: true });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type !== 'ZAP_ELEMENT') return;
    if (!lastContextTarget) {
      sendResponse({ ok: false });
      return;
    }
    const path = pathFromRoot(lastContextTarget);
    const origin = window.location.origin;
    chrome.storage.local.get({ customHides: {} }, (data) => {
      if (!data.customHides[origin]) data.customHides[origin] = [];
      data.customHides[origin].push({ path });
      chrome.storage.local.set(data);
      hideElement(lastContextTarget);
      sendResponse({ ok: true });
    });
    return true;
  });

  const origin = window.location.origin;
  if (document.body) {
    initContextMenu();
    applyStoredZaps(origin);
    observeBodyForNewNodes(origin);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initContextMenu();
      applyStoredZaps(origin);
      observeBodyForNewNodes(origin);
    });
  }
})();
