# Peloton Chronicle v0.2

A Vite + React modern-era professional road-cycling world simulation. The universe advances by calendar weeks rather than by manually opening races, while every rider, director, team organization, sponsor identity, race edition and season remains available in the historical archive.

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

Vite creates the deployable site in `dist/`. The included `vite.config.js` uses relative asset paths, so the build works on GitHub Pages subdirectories as well as root-domain hosts.

A no-bundler emergency build is also available:

```bash
npm run build:fallback
```

## Publish

### GitHub Pages automatically

1. Create a GitHub repository and push this project to its `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. The included `.github/workflows/deploy-pages.yml` installs dependencies, runs QA, builds the project and publishes `dist/` after every push to `main`.

### Netlify or Cloudflare Pages

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

### Manual static hosting

Run `npm run build`, then upload the contents of `dist/` to the web root.

## Save architecture

The React source project deliberately does **not** require Neon or another backend. Universes are stored in IndexedDB, with three save drawers and JSON export. Saves remain local to the browser and device. A future cloud-save migration can place the same universe records behind an API without changing the simulation design.

Existing v0.1 saves are upgraded when opened. They retain their original opening riders. Create a new universe to receive the fully procedural v0.2 rider population and career curves.

## v0.2 structure

- Weekly controls: simulate one week, four weeks or the rest of the season
- Results desk with tier/type filters, current-year race details, top ten, stage list and colored jerseys
- Full calendar containing WorldTour, ProSeries, selected continental and U23 races
- Permanent race pages with edition history, winner records, stage records, jersey records and prestige/category evolution
- 18 active WorldTeams and 16 active ProTeams
- Persistent team organizations beneath changing sponsors
- Three-year sporting promotion/relegation, occasional dissolutions and new professional projects
- Fully procedural riders from a broad country/name database
- Separate race preference and stage/terrain specialization
- U23 entry at age 18–19; professional eligibility from age 21; development capped before age 23
- Early-bloomer, stable and late-bloomer career curves with generated 9–15 year career lengths
- Realistic target calendars, form, fatigue, race days and protected peaks
- Race directors for every team plus agency markets and career progression
- Current-season and all-time statistics for riders, directors and teams, filterable by competition tier
- Detailed rider, director and team career dossiers
- **Le Grand Braquet** pre-season, live-season, post-season and archive magazine sections
- Tabular Almanac and curated Hall of Fame lists
- Locally bundled country flags for consistent Windows/browser display
