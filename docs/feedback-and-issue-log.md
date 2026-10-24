# Week 2 — Feedback response and issue log

## Week 1 feedback response

No mentor feedback text was supplied while this Week 2 update was prepared. Do not claim mentor feedback was received. Use the table below to record each actual comment when it arrives.

| Feedback received | Change made / reason not changed | Evidence |
|---|---|---|
| Awaiting mentor feedback | No mentor feedback was available to act on when Week 2 work began. | Update this row with the actual comment and a commit/URL when received. |

## Issue log (initial 6 entries)

| ID | Issue / bug | Options considered | Resolution | Status / how to verify |
|---|---|---|---|---|
| ABIA-01 | Business data was embedded directly in `script.js`, making data and rendering tightly coupled. | Keep inline array; move records to JSON; use a remote API. | Moved the fictional demo records to `data/businesses.json` and load with `fetch`. | Done — run via local server and check the network request. |
| ABIA-02 | The page did not show a distinct loading state while data was being prepared. | Spinner only; text status; skeleton cards. | Added a clear loading panel and status announcement. | Done — reload using a local server. |
| ABIA-03 | A missing/bad data file could leave the directory blank. | Silent fallback; crash; friendly error with retry. | Added response checks, JSON shape validation, a friendly error panel, and retry button. | Done — temporarily rename the JSON file to test, then restore it. |
| ABIA-04 | Repeated business-card markup was built inside the list renderer. | Duplicate templates; one reusable card renderer. | Added `BusinessCard` and `BusinessList` rendering functions. | Done — confirm multiple records use the same template. |
| ABIA-05 | Search results with zero matches needed a clear state distinct from fetch errors. | Show blank grid; show an empty-state message; show all records. | Kept a dedicated “No matches” state separate from fetch errors. | Done — search for a phrase that does not exist. |
| ABIA-06 | Local browser storage may be blocked or contain malformed JSON. | Trust storage; let the page crash; use defensive parsing and fallback. | Added defensive JSON parsing and storage writes that handle failures without crashing. | Done — clear/alter storage and retest. |

## Test notes to complete before submission

- [ ] Load data using `python -m http.server 8000` and confirm cards appear.
- [ ] Search for `tailor`, choose Aba, and choose Fashion.
- [ ] Search for a nonexistent phrase and verify the empty state.
- [ ] Temporarily rename `data/businesses.json`, reload, and verify friendly error + retry; restore the filename afterwards.
- [ ] Add a demo listing, refresh, and confirm it persists in the same browser.
- [ ] Save a favourite, refresh, and confirm the saved state remains.
- [ ] Check browser console for errors.
