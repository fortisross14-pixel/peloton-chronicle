# Peloton Chronicle v1.5

A Vite + React modern-era professional road-cycling world simulation. The universe advances by calendar weeks while riders, directors, team organizations, sponsors, race editions and completed seasons remain searchable in a permanent historical archive.



## v1.5 calendar, condition and classification model

- **Visible condition:** Race shape, fatigue, recent 28-day workload and mandatory recovery are shown on rider profiles.
- **Protected calendars:** planned and actual starts cannot overlap; elite riders use smaller programmes with recovery buffers, and a Grand Tour requires a clean preparation window.
- **Real fatigue:** race load is added by duration, terrain and Recovery skill. Week-long races require recovery and Grand Tours impose mandatory rest.
- **Race shape:** sensible racing builds sharpness, while one or two inactive months progressively remove it. Freshness without preparation is no longer an advantage.
- **Specialist scaling:** specialists retain 100% of the annual ceiling in core skills and 90% in secondary skills. All-rounders receive 95% across every skill as the price of versatility.
- **Distinct jerseys:** points favors sprint attributes and flat placings; mountains favors climbing attributes and mountain placings. A double is restricted to an exceptional Generational all-rounder.
- **Youth rule:** the young-rider classification is limited to age 23 or younger.
- **Grand Tour protection:** stage upsets remain possible, but Rare and lower riders have a severe three-week GC consistency disadvantage.
- **Team award:** the best-three-rider team classification is stored for the team, director and every selected rider on the winning team.
- **Clear license movement:** Market marks promotions with an up arrow and relegations with a down arrow.
- **CI reliability:** the focused and five-season test suites run as separate GitHub Actions steps.

The detailed rules are in `CONDITION_MODEL_v1.5.md`. Ten-seed deterministic results are in `QA_CONDITION_BALANCE_v1.5.md`.

## v1.4.2 official-result consistency and newsprint presentation

- **One result source:** current-season rider totals, the race programme, year cards and UCI points now reconcile against the official `eventResults` and UCI award ledger.
- **Actual starts cannot disappear:** the Current season tab merges planned targets with every race in which the rider actually started. A Giro winner therefore appears even when the race was not in the original target list.
- **Exact event points:** completed programme rows show the UCI points earned in that race; annual cards group the season total by contributing event.
- **Archive repair:** v1.4.1 saves rebuild the active season from permanent race results and update an already-created current-year season card.
- **Correct starts:** every selected rider receives a race start; the previous top-ten-only start counter is removed.
- **Used-newsprint layer:** the generated Peloton Chronicle annual masthead and compressed newsprint texture are bundled locally, with no external asset dependency.
- **More period-appropriate typography:** Baskerville/Palatino-style editorial stacks, serif body copy, paper-form controls and stronger printed-table contrast replace the remaining generic web-dashboard feel.

The consistency regression deliberately removes the Giro from its winner's planned targets and confirms that the official win, annual record, career total and UCI points remain identical across the relevant screens.


## v1.3 rider skill model

- **Rarity fixes base talent:** Generational 95–100, Legend 90–95, Epic 85–90, Rare 80–85, Uncommon 70–80 and Common 50–69.
- **Base skill never changes:** the value assigned at spawn remains fixed through retirement.
- **Season ceiling is mathematical:** `base skill × annual multiplier`, where the multiplier combines the career curve and deterministic yearly shape and is capped between 0.70 and 1.02. The displayed current rating is the average after specialty scaling.
- **Nine visible skills:** speed, acceleration, power, climbing, endurance, recovery, bike control, strategy and mental strength.
- **Specialization scales talent:** specialists preserve 100% of the season ceiling in core skills and 90% in secondary skills; all-rounders receive 95% across all nine skills.
- **Stage results use skill blends:** mountain, flat, hilly, puncheur, time-trial and cobbled stages each weight the relevant skills differently.
- **Race preference remains separate:** Grand Tour, one-week, Monument and stage-hunter preferences affect preparation and race suitability, not the underlying skill average.
- **Condition is contextual:** form, fatigue, targeting, team support, facilities and director quality affect race-day performance without changing the displayed annual rating.
- **Rider overview expanded:** full skill grid, fixed base skill, exact annual factor and current average are now visible.
- **Existing saves upgrade:** old base values are proportionally mapped into the new rarity bands and receive deterministic skills without losing history.

The original skill foundation is documented in `SKILL_MODEL_v1.3.md`; the final specialist scaling and condition rules are in `CONDITION_MODEL_v1.5.md`.

## v1.2 Director's Cut visual release

- **Retro-serious identity:** a mid-century European cycling annual interpreted with modern spacing, responsiveness and interaction—not pixel art or a faux-old software interface.
- **Fixed rarity language:** Generational red, Legend gold, Epic purple, Rare blue, Uncommon green and Common white across cards, profiles and market records.
- **Stronger editorial hierarchy:** refined masthead, issue-style page headers, consistent display/body type scales and clearer supporting copy.
- **Modern card system:** rebuilt rider, team and director cards with sponsor stripes, stronger ratings, readable career chips, larger statistics and more disciplined spacing.
- **Grand Tour identity:** Giro, Tour and Vuelta receive distinct editorial hero treatments while retaining the same navigation and data.
- **Sponsor branding:** team primary/secondary colors now read more clearly across cards, profile heroes and finance panels.
- **Data clarity:** larger tables, stronger numeric alignment, improved row states, clearer filters and more legible mobile layouts.
- **Magazine and Hall of Fame presentation:** Le Grand Braquet and historical pages now feel like premium cycling annual features rather than generic lists.
- **Restrained motion:** subtle lift, focus and toast transitions provide a modern-game feel without breaking the archival tone.
- **No navigation changes:** routes, tabs, filters, save compatibility and simulation behavior remain unchanged.

The full visual language is documented in `DESIGN_v1.2.md`. Validation is summarized in `QA_REPORT_v1.2.md`.

## v1.1 systems expansion

- **Controlled elite population:** exactly 3 active Generational riders, 9 Legends and 18 Epics. A replacement prospect appears only when an elite rider retires.
- **Elite scouting:** riders with 90+ potential are pulled into WorldTour projects as they approach their prime. Elite riders already established in WorldTour cannot casually fall into ProSeries because of ordinary roster filling.
- **Selective transfer market:** happiness, salary versus market value, contract status, facilities, results, director quality and team ambition determine movement. Elite transfer windows are deliberately small.
- **Sponsor economy:** every active team has a primary naming sponsor and secondary maillot sponsor, each with size, money, attraction and colors. Sponsor exits can strengthen or weaken the entire project.
- **Team finances:** sponsor income and prize money fund rider salaries, director salaries and facilities investment. Team pages show the full annual projection.
- **Facilities:** levels run from 1–10, decay over time and use a sharply nonlinear upgrade cost near the elite end.
- **Director market:** directors have salaries, contracts and happiness. They can be dismissed, hired from agencies or poached, but cannot switch appointments twice inside two seasons.
- **Tier movement:** WorldTour/ProSeries and ProSeries/Continental promotion and relegation are recorded in the preseason Chronicle.
- **Working filters and sorting:** rider rarity/tier filters and team tier filters are stateful; teams can be sorted by points, budget, facilities, attraction, reputation or director ability.
- **Navigation history:** rider, team, director and race pages return to the actual source screen rather than always returning to a generic list.
- **Clear participation statuses:** targets distinguish not disputed, team not invited, rider not selected and finished outside the recorded top 20.
- **Le Grand Braquet preseason:** curated elite signings, elite prospects, retirements, sponsor changes, director appointments and promotion/relegation replace the previous unstructured transfer dump.

The functional and technical rules are documented in `MECHANICS_v1.1.md`. Deterministic system results are in `QA_SYSTEMS_v1.1.md`.

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

Peloton Chronicle v1.5 does **not** require Neon or another backend. Universes are stored in IndexedDB, with three save drawers and JSON export. Saves remain local to the browser and device. Clearing browser site data deletes local universes, so use **Save & Settings → Export JSON** for external backups.

Existing older universes are upgraded when opened. A new universe is still recommended when testing generation or balance changes because an old save preserves its existing population and prior results.

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
- Early-bloomer, stable and late-bloomer curves with retirement targets from age 28, most commonly 30–33
- Target calendars, fatigue, form, protected peaks and race-day accumulation
- Race directors for every team plus agency markets and career progression
- Dynamic sponsors, promotion/relegation, team closures, new projects and changing race prestige
- Locally bundled country flags for consistent browser and Windows rendering

## v0.7 ranking and timing update

- Adds a dedicated UCI Rankings page with rolling 52-week and current-calendar-year tables.
- Uses result-class point scales: Tour GC 1,300; Giro/Vuelta GC 1,100; Monuments 800; Tour stages 210, with points also awarded down the classification.
- Team rankings total the best 20 rider scores.
- Compresses simulated stage-race gaps into modern plausible ranges so a routine runner-up is not tens of minutes behind.
- Existing v0.4 saves rebuild their point ledger from archived editions on first load.


## v0.7 market and team-building model

- Rider movement is driven by contracts, salary versus market value, happiness, team results, facilities, team tier, director quality and sponsor-backed budget.
- Elite unhappy or underpaid riders can be poached before their contracts expire.
- High-budget teams that miss expectations become more aggressive in the following preseason.
- Directors are reviewed at the start of each season and can be fired, hired from agencies or poached from another team. Elite directors are actively pulled toward WorldTour projects rather than remaining indefinitely in Continental teams.
- Training facilities decay gradually and ambitious teams invest to restore them. Facilities affect rider performance and payroll capacity.
- The Market screen is redesigned for mobile and clearly separates headline elite transfers, director changes, professional moves and sponsor changes.

## v0.8 profile and balance polish

- Rider pages now use Overview, Current season and History tabs.
- Rider overview identifies the generated career year and displays the annual development curve.
- Current season lists every target and its result/status.
- History summarizes wins by competition level before the exact annual archive.
- Team and director pages now use the same three-tab navigation.
- UCI rankings can be filtered by current tier.
- Almanac seasons include Tour, Giro and Vuelta champions with clickable entities.
- Simulation preserves the screen currently being viewed.
- Grand Tour achievements carry substantially more Hall of Fame weight.
- Exceptional riders receive more cross-specialty flexibility, while specialists retain an advantage.
- WorldTour recruitment places a stronger premium on 90+ potential riders.


## v0.9 balance update

- Rider current-season plans are grouped chronologically by month.
- Retirement targets now begin at 28, with most riders targeting ages 30–33 and elite riders sometimes lasting longer.
- Grand Tour GC strongly rewards sustained ability, team support, recovery and Grand Tour suitability; low-rated riders can still win stages but are now extraordinarily unlikely to win the overall classification.
- Grand Tour gaps are more competitive rather than clustering at the cap.
- Classics repeat-win pressure limits implausible four-year totals while preserving elite specialist dynasties.
- Generational riders receive a small number of cross-program targets so Merckx/Pogačar-style careers can emerge.
- See `QA_BALANCE_v0.9.md` for deterministic test notes.


## v1.0 final polish

- Final deterministic narrative-balance pass for dynasties, rivals, interrupted peaks and elite-team recruitment.
- Refined generational longevity and repeat-major experience without hard caps on Grand Tours or Monuments.
- Complete typography, spacing, link-state, card, table and mobile consistency audit.
- The visual system remains an old European cycling almanac: cream stock, burgundy ink, brass accents and editorial serif display type.
- See `QA_BALANCE_v1.0.md` for the final fixed-seed benchmark.
