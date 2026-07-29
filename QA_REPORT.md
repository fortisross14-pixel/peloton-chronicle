# Peloton Chronicle v0.2 — QA Report

## Automated checks passed

- Creates 18 active WorldTeams and 16 active ProTeams
- Includes U23 and selected continental calendars
- Creates more than 1,000 procedural riders and directors for every team
- Advances by one or multiple weeks and resolves every due event
- Produces stage winners, a top-ten final classification and colored-jersey data
- Creates rider, team, director and race-edition historical records
- Renders every major navigation screen without undefined data
- Completes and archives a full season
- Maintains five consecutive seasons with:
  - exactly one roster assignment for every active rider
  - no duplicate roster IDs
  - no rider older than 22 trapped in U23
  - 18 active WorldTeams and 16 active ProTeams after lifecycle changes
  - save size below 12 MB

## Performance observed in Node QA

- Four opening weeks: under one second
- Full opening season: approximately five seconds
- Five-season continuity test: approximately 26–30 seconds

Browser speed varies by computer. Weekly progression is intentionally the normal interaction; the full-season command performs substantially more work in one synchronous operation.

## Build verification

- All simulation and application modules pass Node syntax validation; the React JSX entry is handled by Vite
- Static fallback build includes all 53 bundled flag images
- Vite + React are configured with relative production asset paths
- GitHub Pages workflow is included

## Known boundaries

- Saves are local IndexedDB saves rather than Neon/cloud saves
- The lightweight continental world is intentionally not simulated at professional-calendar depth
- Women’s cycling and Olympic road events remain future modules
- Existing v0.1 saves keep their original generated/seeded population after migration; start a new universe for the fully procedural v0.2 opening world
