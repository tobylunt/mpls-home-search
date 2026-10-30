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

## Sources and photos

The original chat supplied 26 candidates. The October 29, 2026 audit retained 23 address/photo matches and removed Turnpike, Kyle and Orchard. Each retained photo was followed from an exact-address listing gallery, downloaded and visually inspected. Listing URLs now point to the checked property detail pages; photo credits appear in the detail view. See `docs/listing-verification.json` for per-property evidence, source URLs, corrections and exclusion reasons.

Verification uses full property-detail pages returned by the web reader (sometimes cached), or direct HTTP pages, not search-image matches. Some real-estate sites block raw automated requests with 403/429 even when the web reader returns their complete listing. This establishes the address/gallery match, not a guarantee of future access or real-time MLS availability. Ewing’s original 404 was replaced with its Redfin detail page. Summit was rechecked October 30, 2026: Zillow explicitly lists Active at $975,000; it is included in Purchase leads.

Ten records are sold references. Prices and statuses were corrected where supported; no rendered photo is generated, Street View, or a visual-search substitute. Local photos keep cards independent of third-party hotlink behavior. Photo credits identify the listing publisher/MLS; no ownership of the photographs is claimed.

The remaining map pins use the US Census street-range geocoder checked October 29, 2026. Coordinates are approximate; Bridgeview remains unlocated. OpenFreeMap Positron vector tiles render through MapLibre inside Leaflet, with standard OpenStreetMap as a fallback if the vector map fails. The map requires internet. Google Fonts supplies DM Sans and Libre Caslon Display. Notes are not sent to map or font services.

The rubric retains the quiet-street and architectural-interest must-haves and the strict under-$1 million price threshold. Unknown assessments remain unknown; bonus points cannot outweigh a failed must-have. Saved notes for removed listings remain in backups, but those listings and saved counts no longer appear in the app.

## Publication

The private Site identity is in `.openai/hosting.json`; production assets are in `dist`. The original rental project remains unchanged. Publishing updates the seeded guide; browser edits must be deliberately incorporated into source to become shared defaults. Private hosting is owner-only until access is configured.

## Validation

Unit tests cover missing evidence, hard-gate failure, preference coverage, budget boundary, unknown price, backup validation, photo provenance/assets, and preserving notes for removed listings. Browser QA covered desktop and 390px mobile layouts, filtering, rubric updates, note persistence through reload, and JSON backup/restore.

## Shortlist updates

October 30, 2026: Keston marked Top tier and moved first in default order. Woodlawn and Cedar removed at the user’s request; 21 properties remain. Historical notes for these IDs remain restorable from backups.

October 30, 2026: Added Thomas and James with inspected listing photos and Census map coordinates; 23 properties now. James uses September listing facts; both additions are leads rather than guarantees of current availability. Thomas is marketed as a teardown/new-build opportunity.

October 30, 2026: Added 4528 Upton Avenue S, the green Tudor opposite Beard’s Plaisance, as a sold reference ($820,000, July 16, 2026). Listing photo inspected and Census coordinates matched. 24 properties now.

October 30, 2026: Added 1880 Jefferson Avenue, active at $659,900, with inspected listing photograph and Census coordinates. 25 properties now.
