# Peloton Chronicle v0.3 — QA Report

## Automated checks passed

Nine automated tests cover:

- Creation of 18 active WorldTeams, 16 active ProTeams, U23 programs, selected continental teams, more than 1,000 riders and directors for every organization
- Weekly progression resolving every race due inside the selected calendar window
- Stage winners, top-ten classifications, points/mountains/young-rider jersey identities and exact rider result records
- Stateful Results filtering: WorldTour + Grand Tours returns Giro, Tour and Vuelta without retaining an unrelated selected race
- Navigation output for Results, Calendar, Races, Riders, Teams, Directors and Statistics
- Permanent race links and dedicated rider pages with complete season breakdowns
- End-of-year closure that leaves the current year and all results open
- Explicit next-season opening that archives the old year and resets the new calendar
- Five consecutive seasons with one roster assignment per active rider, no duplicate roster IDs, no rider older than 22 trapped in U23, and exactly 18 WorldTeams/16 ProTeams after lifecycle changes
- Hall of Fame weighting that makes a Tour–Giro double comparable to an elite five-Monument career

## Balance validation

A separate 12-season seeded simulation produced repeated elite champions without deterministic monopolies:

- One rider accumulated seven Grand Tour victories across his career
- Maximum Tour victories by one rider: four
- Maximum Giro victories by one rider: four
- Maximum Vuelta victories by one rider: three
- Several other riders still won individual editions

This confirms that generational all-round Grand Tour specialists can form historically significant dynasties, while annual shape, form, fatigue, route suitability, targeting and race randomness continue to create turnover and surprises.

## Build verification

- Application and engine modules pass Node syntax validation
- `npm test` passes all nine tests
- Static fallback build copies source modules and all 53 local flag images
- Vite is configured with relative production asset paths
- GitHub Pages workflow is included

## Known boundaries

- Saves remain local IndexedDB saves rather than Neon/cloud saves
- Continental cycling is intentionally a lightweight feeder and free-agent layer rather than a complete international calendar
- Women’s cycling and Olympic road events remain future modules
- Historical data created in earlier versions cannot retroactively contain jersey or exact stage-detail fields that were not stored at the time
