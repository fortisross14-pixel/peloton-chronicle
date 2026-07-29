# Peloton Chronicle v0.3

A Vite + React modern-era professional road-cycling world simulation. The universe advances by calendar weeks rather than one race at a time, while riders, directors, team organizations, sponsor identities, race editions and completed seasons remain searchable in a permanent historical archive.

## Install and run

Use Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173/`.

## Production build

```bash
npm run build
```

Vite creates the deployable site in `dist/`. The included `vite.config.js` uses relative asset paths, so the build works on GitHub Pages subdirectories and root-domain hosts.

A no-bundler emergency build is also available:

```bash
npm run build:fallback
```

## Publish

### GitHub Pages automatically

1. Create a GitHub repository and push this project to its `main` branch.
2. Open **Settings → Pages** in GitHub.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. The included `.github/workflows/deploy-pages.yml` installs dependencies, runs the automated tests, builds the project and publishes `dist/` after every push to `main`.

### Netlify or Cloudflare Pages

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

### Manual static hosting

Run `npm run build`, then upload the contents of `dist/` to the web root.

## Save architecture

Peloton Chronicle v0.3 does **not** require Neon or another backend. Universes are stored in IndexedDB, with three save drawers and JSON export. Saves remain local to the browser and device. Clearing browser site data deletes local universes, so use **Save & Settings → Export JSON** for external backups.

Existing v0.1/v0.2 universes are upgraded when opened. A new universe is still recommended when testing generation or balance changes because an old save preserves its existing population and prior results.

## v0.3 highlights

- Results filters now rebuild the race browser and automatically select the first matching event. **WorldTour + Grand Tours** shows only Giro, Tour and Vuelta.
- Results-page links now open permanent race pages correctly.
- Race edition history records the GC winner, team, points jersey, mountains jersey, young-rider jersey and number of stages for every year.
- Riders opened from the Riders screen use a complete dedicated page; modal dossiers elsewhere include a link to that full page.
- Rider season records list the exact races won, stage wins grouped by terrain and race, classification jerseys, team/tier, points, race days and Grand Tour results.
- Le Grand Braquet race reports and preseason sections contain clickable rider links.
- Preseason coverage separates championship odds, elite transfers and elite U23 arrivals. Transfer rows include rating, age, rarity, previous ranking and origin/destination team and tier.
- Ending a season now closes the current year without moving time forward. All current results and rankings remain open until **Open next season** is selected.
- Opening the next season performs archiving, aging, retirements, promotions, transfers, sponsor changes, director movement, prospect generation and calendar resets.
- Hall of Fame weights distinguish the Tour, Giro, Vuelta, Monuments and championships. Approximately five Monument wins are comparable to a Tour–Giro double, while stages and secondary races add depth rather than replacing major victories.
- Elite outcome persistence creates occasional multi-Grand-Tour dynasties through permanent event affinity, experience and career quality, while form, fatigue, annual shape, route fit and randomness still allow upsets.

## Core world structure

- 18 active WorldTeams and 16 active ProTeams
- U23 national development programs and a deliberately lightweight continental/free-agent layer
- Fully procedural riders from a broad country and name database
- Separate race preference and stage/terrain specialization
- U23 entry at age 18–19; professional eligibility from age 21; development capped before age 23
- Early-bloomer, stable and late-bloomer curves with generated 9–15-year career lengths
- Target calendars, fatigue, form, protected peaks and race-day accumulation
- Race directors for every team plus agency markets and career progression
- Dynamic sponsors, promotion/relegation, team closures, new projects and changing race prestige
- Locally bundled country flags for consistent browser and Windows rendering
