# Peloton Chronicle v0.4 — QA Report

## Automated checks passed

Eleven automated tests cover:

- Creation of the modern world structure: 18 WorldTeams, 16 ProTeams, development programs, lightweight continental teams, procedural riders and directors
- Weekly progression and complete resolution of every due race
- Stage winners, classifications, jersey identities and exact per-rider result records
- Stateful Results filtering and permanent race navigation
- Rider pages with complete annual win breakdowns
- A hard December 31 season stop that does not advance the year
- An explicit next-year action that alone performs archiving, aging, transfers, sponsor changes and calendar reset
- Five-season roster and tier continuity
- Hall of Fame weighting between Grand Tour and Monument careers
- Automatic reconstruction of missing first-season race, stage and jersey details in upgraded saves
- Full team and director pages containing exact annual victory lists

## Migration validation

A simulated v0.3 save was deliberately damaged by retaining annual totals while deleting its detailed race, stage and jersey arrays. Opening it through the v0.4 upgrader rebuilt every missing detail from the stored race editions, with the repaired array counts matching the original totals.

## Build verification

- Application and engine modules pass Node syntax validation
- `npm test` passes all eleven tests
- Static fallback build includes source modules and all locally bundled flags
- Vite remains configured with relative production asset paths
- GitHub Pages workflow remains included

## Known boundaries

- Saves remain local IndexedDB saves rather than Neon/cloud saves
- Continental cycling remains a lightweight feeder/free-agent layer
- Women’s cycling and Olympic road events remain future modules
- A detail can only be reconstructed when the corresponding historical race edition still exists in the save

## v0.6 regression

- 12/12 automated tests pass.
- Grand Tour runner-up gap capped at six minutes; top-ten gap bounded to a modern plausible range.
- Tour winner receives at least 1,300 UCI points before stage and jersey additions.
- Rolling and calendar-year ranking ledgers survive save upgrades.
