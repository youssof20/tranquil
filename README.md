# Tranquil – All-in-One Distraction Remover

One extension to remove distractions across **YouTube**, **Reddit**, **Instagram**, **X (Twitter)**, **Facebook**, and **LinkedIn**. Lightweight, permission-light, and maintainable at $0 cost.

*No tracking. No server. No “access all websites” at install—you grant access only to the sites you enable.*

---

## How it works

- **Declarative Net Request (DNR)** for redirects and blocking (e.g. Instagram home → DMs, YouTube Trending). The browser applies rules before the page loads; we never read or modify request bodies.
- **CSS attribute toggles** for hiding: the extension sets `data-tranquil-*` attributes on `<html>`. A single injected stylesheet hides elements when the attribute is present (e.g. `html[data-tranquil-hide-feed="true"] .feed { display: none !important; }`). No heavy DOM walking—just one attribute update and the browser does the rest.
- **SPA-aware**: We listen for `yt-navigate-finish` (YouTube) and `popstate` so when you move from Home to a video or to Reddit comments, we re-apply settings without a full reload.
- **Shadow DOM**: We inject the same hide rules into known shadow roots (e.g. `ytd-app`, `shreddit-app`) using `:host-context(html[data-tranquil-*])` so hiding still works when sites move UI into Web Components.

This keeps Tranquil **zero-latency** and **privacy-friendly**: no content scripts reading your feed, no analytics, no cloud.

---

## Features

- **Per-site toggles**: Enable Tranquil only on the sites you choose. Host permission is requested only when you turn a site on.
- **Per-feature toggles**: Hide feed, sidebar, comments, Shorts, end screen, trending, etc. Same UI groups across sites (Feed, Comments, Extras).
- **Pause for 10 min**: One click to pause; countdown and “Resume Now” in the popup. Badge shows **P** when paused.
- **Work mode badge**: When mode is “Work”, the extension icon shows a **W** so you see at a glance that Tranquil is in focus mode.
- **Active site indicator**: Popup shows “Active on YouTube” (or “Off on …”) for the current tab.
- **YouTube**: Center player when sidebar is hidden; hide feed, Shorts, end screen, trending; optional redirect home → Subscriptions.
- **Instagram “Messages only”**: Redirect home, Reels, and Explore to DMs. Toggling it on sends you to DMs immediately (no reload).
- **Zap (element picker)**: Right-click → “Tranquil: Hide this element”. Shadow-DOM aware; re-applies on infinite scroll.
- **Quiet title**: Strip unread count from the tab title (e.g. “(3) YouTube” → “YouTube”).
- **Live toggles**: Change a setting in the popup and the current tab updates instantly—no refresh.
- **Export / Import**: Copy your config from Options and restore it on another device.

## Install

1. Clone or download this repo.
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the `tranquil` folder.
3. Add icons: place `icon16.png`, `icon32.png`, and `icon48.png` in the `icons/` folder (or keep the minimal placeholders).

## Permissions

- **storage**: Save your toggles (sync across devices) and Zap list.
- **declarativeNetRequest**: Redirect or block URLs (e.g. Trending, Reels, Explore) without reading page content.
- **scripting**, **contextMenus**: For Zap and optional scripts.
- **Host access** (optional): Requested only when you enable a site (e.g. YouTube) in the popup. No “access all websites” at install.

## Privacy

Tranquil runs **entirely on your device**. No backend server; no data sent to us. Settings are stored in Chrome’s sync storage (Google account) or locally. Open source so you can audit the code.

## Development

- **Recipes**: Edit JSON in `recipes/` (e.g. `youtube.json`) to change selectors or add features. Use `data-tranquil-*` attributes; the engine injects one stylesheet per page.
- **Center player**: In `recipes/youtube.json`, the `reflow` block adds `margin: 0 auto` and `max-width: 100%` for the main column when the sidebar is hidden.
- **Community recipes**: If a site changes and selectors break, open a PR with your fix. See [community-recipes/README.md](community-recipes/README.md) for how to submit new selectors or patches.

## License

Open source (MIT or your choice). Use and adapt freely.
