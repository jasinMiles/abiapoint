# Abiapoint — Local Business Discovery for Abia State

**Track:** Frontend Development  
**Week:** 2 — Components and data  
**Stack:** HTML5, CSS3, vanilla JavaScript, local JSON mock data  
**Status:** Runnable Week 2 prototype. Directory records are fictional demo listings, not verified businesses.

## Week 2 summary

- Refactored repeated listing markup into reusable `BusinessCard` and `BusinessList` rendering functions.
- Added a `StatusPanel` component for consistent status feedback.
- Loads listing records asynchronously from `data/businesses.json` with `fetch` and `async/await`.
- Handles loading, empty search results, fetch/HTTP/JSON/data-shape errors, and a retry action.
- Keeps search, category, location, and sort controls working over loaded data.
- Keeps community-added demo listings and favourites in defensive `localStorage` helpers.
- Added a component map and feedback/issue log under `docs/`.

## Run locally (required for JSON fetch)

Do not open `index.html` directly as a `file://` URL; browsers commonly block `fetch` from local files. In a terminal, change to the project folder and run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. If Python is unavailable, use the VS Code Live Server extension. No API keys or package installation are required.

## Data source and limitations

`data/businesses.json` is a **mock data source** allowed by the Week 2 brief. The sample records are illustrative and fictional; they are not real or verified businesses in Abia State. `fetch` requests the JSON file and validates the response and required fields. Community entries are stored only in the current browser and are not sent to a server. No secrets/API keys are used.

## Component map

See [`docs/component-map.md`](docs/component-map.md). Main reusable units:

- `BusinessCard(business)` — renders one business card.
- `BusinessList(items)` — reuses the card renderer for all records.
- `StatusPanel(...)` — reusable loading/error status presentation.
- `loadBusinesses()` — asynchronous data fetching and error handling.
- `getFilteredBusinesses()` / `renderBusinesses()` — filtering, sorting, list and state updates.

The app uses vanilla JavaScript functions as components; it does **not** use React or another component framework.

## Loading, empty, and error states

- **Loading:** status panel appears while the JSON request is pending.
- **Empty:** “No matches just yet” appears when filters return zero records.
- **Error:** friendly message appears for network/HTTP/invalid-data problems, with a Retry button.
- **Bad data:** only records with required string fields are accepted; an unusable data file is treated as an error.

## Issue log and Week 1 feedback

See [`docs/feedback-and-issue-log.md`](docs/feedback-and-issue-log.md). Six initial issues and their options/resolutions are recorded. No mentor feedback text was supplied when this update was prepared; record actual feedback when received rather than claiming it was received.

## Existing interactions

1. Search by name, category, location, or description.
2. Filter by location and category; sort by recommended order or name.
3. Save/unsave favourites, persisted in browser storage.
4. Suggest a business with validation; entry persists in this browser only.
5. Responsive mobile navigation.
6. Retry data loading after a fetch error.



## AI assistance disclosure

ChatGPT assisted with styling and review
