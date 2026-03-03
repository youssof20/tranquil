# Community Recipes

When a site changes its HTML (e.g. LinkedIn updates a class, Reddit ships a new layout), Tranquil’s selectors can stop matching. **You can fix it here.**

## How to submit a selector fix

1. **Fork the repo** and open a new branch.
2. **Add or edit a file** in this folder:
   - Either a **patch file** (e.g. `linkedin-feed-2025.patch`) that describes the JSON changes for `recipes/linkedin.json`, or
   - A **snippet** (e.g. `reddit-new-feed-selectors.md`) with the new CSS selectors and the feature they belong to (e.g. `hide_feed`, `hide_comments`).
3. **Open a Pull Request** with a short description: which site, what broke, and the new selectors or rule.

Maintainers will review and merge into the main `recipes/` so everyone benefits.

## Recipe format (reference)

Recipes live in `recipes/<site>.json`. Each **rule** has:

- `featureId`: e.g. `hide_feed`, `hide_comments`
- `attribute`: optional; defaults to `data-tranquil-<feature-id>`
- `selectors`: array of CSS selectors (without the `html[data-tranquil-...]` prefix; the engine adds that)

Example:

```json
{
  "featureId": "hide_feed",
  "attribute": "data-tranquil-hide-feed",
  "selectors": [
    ".old-selector-that-broke",
    ".new-selector-from-inspection"
  ]
}
```

Thanks for helping keep Tranquil working for everyone.
