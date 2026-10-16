# Abiapoint — Local Business Discovery for Abia State

**Track:** Frontend Development  
**Week:** 1 — Foundations  
**Stack:** HTML5, CSS3, vanilla JavaScript  
**Status:** Week 1 prototype; demo listings are not verified businesses.

## Idea one-pager

### Target user
Residents, visitors and people searching for local services in Abia State, Nigeria, especially around Aba, Umuahia, Ohafia, Arochukwu and Isiala Ngwa.

### Problem
It can be difficult to discover local services and small businesses without searching across several social platforms or relying only on word of mouth. People need a simple directory that organizes businesses by category and location.

### Solution
Abiapoint is a responsive local-business discovery directory. Users can search listings, filter by service category and location, save favourites, and try adding a business to a local demo directory.

### Core flow
Open directory → search/filter by category or location → inspect a listing → save a favourite or suggest a business.

### Data source
Local JavaScript sample data for Week 1. User-added demo listings and favourites are stored in the browser with `localStorage`. Seed listings are fictional demonstration examples and must be replaced with verified information before any public launch.

### In scope
- Responsive directory home screen.
- Search by business name, category, location or description.
- Category chips and location filter.
- Sorting by name.
- Business suggestion form with validation and helpful error messages.
- Favourite toggles persisted in browser storage.
- Empty search state and mobile navigation.

### Out of scope
- User accounts and authentication.
- Backend/database and cross-device synchronization.
- Verified ratings, reviews or business verification.
- Payments, bookings, messaging and maps.
- Public submission moderation.

### Top 3 risks
1. **Unverified listings:** clearly mark sample content and replace it with permissioned, accurate business data.
2. **Limited data persistence:** localStorage is browser-specific; plan a backend or approved data source later.
3. **Mobile usability/accessibility:** test narrow screens, keyboard access, contrast and form errors before submission.

## Run locally
No package installation is required. Open `index.html` in a modern browser, or run a simple local server from this folder:


## Week 1 interactions
1. Search input, category filters, location filter and name sorting update the directory.
2. “Suggest a business” opens a form; required fields are validated and clear inline messages appear for invalid input.
3. Saved favourites and newly added demo entries persist in the current browser using localStorage.
4. Responsive mobile navigation opens and closes.

## Three-week work plan
- **Week 1 — Foundations:** idea, responsive accessible home screen, search/filter/form interactions, screenshots, repo and initial deployment.
- **Week 2 — Components and data:** refactor repeated listing markup into reusable components (if moving to React or another framework), connect a suitable verified/mock data source, add loading/empty/error states and an issue log.
- **Week 3 — Quality and delivery:** add list/detail views and saved state across views, improve accessibility, write at least three automated tests, deploy and finish documentation.

## Accessibility and testing checklist
- [ ] Test at 320px, 390px, tablet and desktop widths.
- [ ] Navigate all controls using only the keyboard.
- [ ] Check visible focus, form labels and validation messages.
- [ ] Test no-results search and clear-filters action.
- [ ] Test saving/unsaving favourites and reload persistence.
- [ ] Run Lighthouse or WAVE and record the actual results.
- [ ] Capture real mobile and desktop screenshots.

## Week 1 update note
**Week 1 — Michael Avwerosuo Okeme — Frontend — Abiapoint**

- Delivered: responsive local-business directory prototype; [repo URL]; [live URL].
- Changed after feedback: [feedback and response, or “Awaiting mentor feedback”].
- Key technical decisions: HTML/CSS/vanilla JavaScript; local sample data; browser storage for prototype favourites and demo submissions.
- Blockers/risks: demo listings are not verified; no backend; deployment and accessibility checks must be confirmed.
- AI and sources used: ChatGPT assisted with implementating styles. I reviewed and tested the code and will disclose any further assistance and sources used.

## Declaration
This is a Week 1 prototype.
