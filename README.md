# Peloton Chronicle v0.4

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

Peloton Chronicle v0.4 does **not** require Neon or another backend. Universes are stored in IndexedDB, with three save drawers and JSON export. Saves remain local to the browser and device. Clearing browser site data deletes local universes, so use **Save & Settings → Export JSON** for external backups.

Existing v0.1/v0.2 universes are upgraded when opened. A new universe is still recommended when testing generation or balance changes because an old save preserves its existing population and prior results.

## v0.4 highlights

- **End of year is now a hard season stop.** Simulation finishes on December 31 of the current year, preserves the complete race desk and displays a dedicated season-review front page. Only the explicit **Move to next year** action archives and resets the calendar.
- The year-end review shows the world number one, leading team, race/stage leaders and the Giro, Tour and Vuelta podiums at a glance.
- Older v0.1–v0.3 saves automatically reconstruct missing opening-year race, stage and jersey details from permanent race editions. Totals such as “11 stages” now recover the exact races and profiles whenever those editions exist in the save.
- Rider yearly records group stage victories by profile and jersey victories by classification, for example **Mountains ×7 — Vuelta a España; Volta a Catalunya**.
- Teams now have dedicated full pages with sponsor lineage, current roster and an exact annual list of races, stages and jerseys won.
- Race directors now have dedicated full pages with appointment-by-appointment annual results and exact victories under each team.
- Team and director cards open their full pages directly; modal dossiers reached from other screens retain an **Open full details** action.
- Existing permanent race pages continue to show GC, points, mountains and young-rider winners for every edition.
- Results filters, race links, weekly simulation and the balanced elite-career model from v0.3 remain intact.

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
