# Week 2 — Feedback response and issue log

## Week 1 feedback response

No mentor feedback text was supplied while this Week 2 update was prepared. 
| Awaiting mentor feedback | No mentor feedback was available to act on when Week 2 work began.  |

## Issue log (initial 6 entries + redesign entries)

| ID | Issue / bug | Options considered | Resolution | Status / how to verify |
|---|---|---|---|---|
| ABIA-01 | Business data was embedded directly in `script.js`, making data and rendering tightly coupled. | Keep inline array; move records to JSON; use a remote API. | Moved the fictional demo records to `data/businesses.json` and load with `fetch`. | Done — run via local server and check the network request. |
| ABIA-02 | The page did not show a distinct loading state while data was being prepared. | Spinner only; text status; skeleton cards. | Added a clear loading panel and status announcement. | Done — reload using a local server. |
| ABIA-03 | A missing/bad data file could leave the directory blank. | Silent fallback; crash; friendly error with retry. | Added response checks, JSON shape validation, a friendly error panel, and retry button. | Done — temporarily rename the JSON file to test, then restore it. |
| ABIA-04 | Repeated business-card markup was built inside the list renderer. | Duplicate templates; one reusable card renderer. | Added `BusinessCard` and `BusinessList` rendering functions. | Done — confirm multiple records use the same template. |
| ABIA-05 | Search results with zero matches needed a clear state distinct from fetch errors. | Show blank grid; show an empty-state message; show all records. | Kept a dedicated “No matches” state separate from fetch errors. | Done — search for a phrase that does not exist. |
| ABIA-06 | Local browser storage may be blocked or contain malformed JSON. | Trust storage; let the page crash; use defensive parsing and fallback. | Added defensive JSON parsing and storage writes that handle failures without crashing. | Done — clear/alter storage and retest. |
| ABIA-07 | Cards used emoji and CSS shapes in place of photographs, so the directory did not feel real. | Keep shapes; AI-generated images; real stock photography with credits. | Photo-led cards using real Pexels photographs (no AI images), with alt text, credits and a clear "illustrative stock photo" label. | Done — check cards, details dialog and footer credits. |
| ABIA-08 | Hotlinked photos can fail to load (offline, blocked or removed). | Ignore; show broken images; fall back to a plain tile. | A capture-phase `error` listener adds a `no-photo` tile; the layout stays intact. | Done — block `images.pexels.com` in DevTools and reload. |
| ABIA-09 | Two categories (Home Services, Professional Services) lacked a well-matched photo. | Use unrelated photos; leave blank; source Nigerian photos from Unsplash. | Added two Nigerian Unsplash photos with photographer credits; every listing and every category fallback now has a photo. | Done — the Home Services photo is a general tradesman portrait; replace if a closer match is found. |
| ABIA-10 | Opening status could mislead for unverified or fictional listings. | Show for all; compute in the visitor's timezone; show only for verified listings in Africa/Lagos time. | `openStatus()` runs only when `verified` and `hours` exist and uses Africa/Lagos time. Demo flags are labelled as placeholders. | Done — confirm unverified cards show no status. |
| ABIA-11 | Location-aware search needs device location, which may be denied or unsupported. | Require location; ask on load; optional button with fallback. | Optional "Near me" button, a toast on failure, and an 80 km guard for visitors outside Abia. | Partly tested — the denied case was tested; test the allowed case on a phone. |
| ABIA-12 | Orange text on cream has low contrast. | Use orange for all text; darker orange for text; orange only on buttons. | Orange is used for buttons and large italic headings; small orange text uses `#A94A12`. | Needs a Lighthouse or contrast-checker pass. |
| ABIA-13 | The hero photo shows a market in Jos, not Abia. | Keep it; leave it plain; replace with an Abia photo. | Kept for now with an accurate alt text; replace when an Abia photo is available. | Open. |

