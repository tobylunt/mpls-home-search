# Minneapolis Home Fieldguide

A separate React + Leaflet home-buying guide, inspired by `../mpls-rentals`.

## Run

```sh
npm ci
npm run dev
npm run build
npm test
```

The map, criteria and comparison tabs share filters and assessments. Criteria priorities, descriptions, weights and budget are editable. Notes, favorites and assessments persist in localStorage for the current browser/origin. JSON backup and validated restore transfer edits between devices; CSV exports the filtered comparison table. No collaborative backend is included. Visitors do not see the owner's local edits automatically.

## Sources and limitations

The 26 seed properties, quoted reactions, historical prices and reported statuses come from the user's [October 28, 2026 shared chat](https://chatgpt.com/share/6ae3ac2e-a27c-83ea-837d-3a71ec763fbf). These are unverified leads and architectural references, not a current listing feed. Seven were reported sold. Listing URLs are copied from the chat, not independently authenticated. The Virginia Avenue record explicitly preserves the earlier mismatch warning. No mismatched search photographs are reused.

25 addresses matched the US Census current street-range geocoder on October 29, 2026. Matched addresses and coordinates are retained in `src/properties.json`. Pins are approximate street-range interpolations. 1472 Bridgeview Avenue remains unlocated. Geocoding verifies approximate location only, not listing claims.

The search brief uses the user's stated quiet-street and architectural-interest must-haves and strict under-$1 million price threshold. Preferences and their starting weights are editable proposals. Unknown assessments remain unknown; bonus points cannot outweigh a failed must-have. Reported prices at the budget boundary do not pass an under-budget constraint. Sold references remain visible for inspiration regardless of rubric results.

Map tiles are loaded from OpenStreetMap under its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). Google Fonts loads DM Sans and Libre Caslon Display; system fallbacks work offline. Map tiles require internet. Notes are never sent to either service.

## Publication

The private Site identity is in `.openai/hosting.json`; production assets are in `dist`. The original rental project remains unchanged. Publishing updates the seeded guide; browser edits must be deliberately incorporated into source to become shared defaults. Private hosting is owner-only until access is configured.

## Validation

Six unit tests cover missing evidence, hard-gate failure, preference coverage, budget boundary, unknown price, and backup validation. Browser QA covered desktop and 390px mobile layouts, filtering, rubric updates, note persistence through reload, and JSON backup/restore.
