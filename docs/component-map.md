# Abiapoint component map — Week 2

This project remains framework-free HTML/CSS/JavaScript. Components are reusable JavaScript rendering functions, not React components.

| Component/function | Responsibility | Inputs/data |
|---|---|---|
| `BusinessCard(business)` | Renders one listing card and save button | One business object plus favourite state |
| `BusinessList(items)` | Renders the list by reusing `BusinessCard` | Array of business records |
| `StatusPanel({title, message, action, actionId})` | Consistent status panel for loading/error feedback | Status copy and optional retry action |
| `getFilteredBusinesses()` | Search, location/category filtering, sorting | Search/filter controls and shared state |
| `renderBusinesses()` | Updates count, list, and empty-state visibility | Filtered records and loading/error state |
| `loadBusinesses()` | Fetches JSON asynchronously, checks response/data shape, handles errors | `./data/businesses.json` |
| `categoryStyle(category)` | Reuses icon/visual mapping for listing categories | Category name |

## State ownership

Shared directory state is held in one `state` object because search, category controls, loading/error feedback, and the list must stay in sync. Form fields remain in the form; favourites and community entries persist in `localStorage` for this browser only.

## Sketch / component boundaries

```text
App / page
├── Header + navigation
├── Hero + SearchBar (HTML controls)
├── DirectorySection
│   ├── CategoryFilter controls
│   ├── ResultsBar + Sort control
│   ├── LoadingState / ErrorState / EmptyState
│   └── BusinessList
│       └── BusinessCard × N
├── CommunitySection
└── SuggestBusinessDialog + Toast
```
