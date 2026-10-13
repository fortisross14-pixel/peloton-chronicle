# Peloton Chronicle v1.9

A Vite + React modern-era professional road-cycling world simulation. The universe advances by calendar weeks while riders, directors, team organizations, sponsors, race editions and completed seasons remain searchable in a permanent historical archive.




## v1.9.1 Grand Tour race screen

- **Race hub:** a stage race plays on one screen with the GC (with movement), the jerseys and every stage winner. Ordinary stages are revealed one at a time; there are no rest-day stops.
- **Key stage popups:** before every mountain stage, time trial, cobbled or gravel stage the race pauses and offers *Watch live* or *Show result only*.
- **GC marks on the road:** during a live stage the riders who started the day 1st, 2nd and 3rd overall carry badges inside whichever group they ride (dropped riders included), a summary line says where each is, and a ★ marks the rider who would lead the race on current results.
- **Controls on top:** Continue/Pause, 1×/2× and *Jump to the final result* sit in a bar at the top; the top-bar button opens the race screen whenever a race is in progress.
- **Fixed:** the 2× speed setting was reset to 1× on every click and every tick.

## v1.9 race engine, group 3: incidents, balance and saves

- **Crashes, illness and abandons:** riders crash in the bunch, in sprint finales, on descents and on cobbles; most remount, some ride on hurt, some abandon. Stage races add overnight illness. Grand Tours lose roughly 10–15 riders. Abandons appear on results pages and in race radio; a race leader who abandons hands the jersey on.
- **Injuries and comebacks:** injuries keep riders out for days to a whole season, and a long injury late in a career can end it. The rider profile shows the injury and the season list shows each DNF. Le Grand Braquet reports notable injuries, returns to racing and comeback victories.
- **Competitive balance:** WorldTeams operate under a payroll cap and may hold at most three Generational, Legend or Epic riders; stars prefer teams where they can lead, and sharing leadership lowers their happiness.
- **Race reports from the race:** stage-race stories name where the race turned, the decisive move, the margin, the jerseys and the notable abandons.
- **Smaller saves:** saves drop zero and empty values and store race details by race id (both restored on load); old weekly ranking snapshots keep the top ten after recording every rider's career-best ranking; retired riders without a notable career keep totals and wins but not race-by-race breakdowns. A five-season save is about 8 MB (previously about 16 MB), fifteen seasons about 17 MB (previously about 37 MB).
- **Saving no longer replaces the live game state,** which previously forced the full save upgrade to run again after every autosave.
- **Tests:** the balance guard checks abandon rates, that abandoned riders leave the classification and that injured riders sit out; the five-season test checks the elite cap, the compacted save size and a full save-and-load round trip.

## v1.8 race engine, group 2: stage races and Grand Tours

- **Grand Tours redrawn every year** (`src/stageRoutes.js`): each Giro, Tour and Vuelta edition gets its own route from the race's identity — 1–3 time trials totalling 15–75 km, 6–10 mountain stages, a variable number of summit finishes, named climbs (Galibier, Stelvio, Angliru…), rest days and a queen stage. Some years suit time-triallists, others pure climbers. Week-long races build their stages from their terrain.
- **Every stage ridden by the race engine** (`src/stageRace.js`): GC comes from real stage times and finish bonuses; points from finishes and intermediate sprints; mountains from the order over each categorised summit; team classification from the best three riders each day. Fatigue carries between stages and eases on rest days; bad days strike more often in the third week.
- **Team tactics:** each team protects one leader whose domestiques set the pace and pace him back after punctures; sprinters get lead-outs; the leader's team decides how much rope a break gets, and loses control more easily late in the race, so a GC rider minutes down can gamble on a long-range move and become the virtual leader on the road. Breakaways win more often as the race wears on.
- **Individual time trials** are raced rider by rider, with the hot seat changing hands and the GC leader starting last.
- **Full Grand Tour squads:** teams plan their eight-rider Grand Tour squads before the season, spread their leaders across the three races, and protect each squad's preparation month. Fields now start with about 180 riders instead of 50–90.
- **Old patches removed:** repeat-win penalties, compressed time gaps, the points/mountains override, the injected breakaway and the unused Grand Tour tax are gone; condition and race preference now fine-tune results instead of overriding talent.
- **Live stage races:** key stages (mountains, time trials, cobbles, gravel, queen, first and last) play kilometre by kilometre, with the route, groups, virtual leader, race radio, GC and jerseys; other stages show their result. Rest days pause the race. Result pages have stage-by-stage stories.
- **Balance guard extended:** `npm run test:race-balance` now also checks Grand Tour fields, winners, margins, leader changes, breakaway success by week, jersey winners and stage-winner types across ten universes.

## v1.7 race engine, group 1: one-day races

- **Real routes:** Monuments and the main classics are raced over named climbs, cobbled sectors and gravel roads (`src/routes.js`), with the finish type that decides them (bunch sprint, uphill, velodrome, descent...). Milano–Sanremo is now a long race for sprinters and puncheurs decided on the Cipressa and Poggio.
- **Moment-based racing:** `src/raceEngine.js` rides each one-day race kilometre by kilometre. A breakaway forms and builds a lead, the peloton chases (or hesitates), each sector thins the front group, favourites attack in the finale, outsiders get away while the favourites watch each other, chasers organise, and punctures strike on rough roads. Finishing order and time gaps come from that single run.
- **Skill-fit scoring:** one-day results come from how well a rider's skills fit each sector and finish, with specialisation amplified on race day. Repeat-win and terrain-penalty patches no longer apply to one-day races. Riders' race preferences now follow their terrain, and race targeting uses the actual route, so cobbles riders build their seasons around Flanders and Roubaix.
- **Live playback:** Monuments and the Worlds road race replay the real race: route profile, groups on the road with gaps, and race radio. Results pages and the winner screen show how the race unfolded.
- **Faster simulation:** the full save upgrade runs once per loaded save instead of before every race (about 6× faster seasons).
- **Balance guard:** `npm run test:race-balance` simulates one season in ten universes and fails if favourite win rates, breakaway success, winning margins or terrain fit drift out of range.

## v1.6.1 ranking and profile clarity

- The UCI Rankings page now always uses the live rolling 52-week ledger—the same source shown on rider profiles.
- Historical week/year selectors were removed from the interface. Weekly snapshots remain compact internal history for career peaks and No. 1 reigns.
- Added a continuous **All No. 1 reigns** ledger with start week, duration, and maximum points.
- Current rider rankings include career peak rank and peak points.
- Rider development now uses a labelled SVG curve with career year on X and multiplier on Y.
- Race shape and fatigue now appear immediately below the rider profile hero.
- The navigation sidebar was redesigned as an aged-paper cycling annual index.

## v1.6 Chronicle parity expansion

- **Historical weekly rankings:** reopen stored UCI ranking weeks with movement, point changes, peak-rank milestones and upcoming points expiry.
- **My Chronicle:** follow riders, teams, directors, races and nations from any full page; the Results desk surfaces their latest status.
- **Rider parity:** six tabs now cover Overview, Current season, Career, Rivalries, Development and Records.
- **Cycling rivalries:** shared Grand Tours, Monuments, podiums, close battles and direct finishing advantage create organic career rivals.
- **Prospect world:** a dedicated U23 ranking, readiness view and annual graduation-class archive.
- **Nation pages:** current stars, youth pipelines, major honors and emerging golden generations.
- **Cycling-aware generation:** elite nationality probabilities and terrain tendencies reflect cycling tradition without preventing unusual national stars.
- **Editorial intelligence:** Le Grand Braquet adds Ranking Watch, Form & Condition, Record Watch and Rivalry Watch.
- **Result explanations:** major results identify condition, terrain, team and tactical factors rather than presenting an unexplained winner.
- **Compact persistence:** ranking snapshots store references rather than full rider records; the five-season save remains below the 16 MB regression target.

The complete functional design is in `CHRONICLE_PARITY_v1.6.md`; validation is in `QA_REPORT_v1.6.md`.


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

Peloton Chronicle v1.6 does **not** require Neon or another backend. Universes are stored in IndexedDB, with three save drawers and JSON export. Saves remain local to the browser and device. Clearing browser site data deletes local universes, so use **Save & Settings → Export JSON** for external backups.

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

## v2.2.3 — Calendar and race controls separated; past seasons' placings kept

- **Top bar = calendar only:** +1 week, +4 weeks and Next event. Next event takes you to the race's pre-race screen and stops there. While an event is open (before or during the race) the weeks buttons are disabled and the main button only takes you back to it ("Go to Giro d'Italia", "Back to Giro d'Italia · paused") — it never starts or resumes anything.
- **Race controls live in the race screen only:** Simulate (start), Pause / Continue, Skip to the finish, speed.
- Leaving the race screen mid-race pauses it; come back with the top-bar button and press Continue.
- The Stop bar for calendar simulation is gone.
- **Fix:** riders' race-by-race placings for past seasons were wiped when each season closed (only the current season showed). They are now kept. Older saves get their past seasons rebuilt from every race's stored top ten (placings outside the top ten in those seasons can't be recovered). Archived placings are stored compactly so saves stay small.

## v2.2.2 — Pause live races anywhere

- One-day races now have **Pause / Continue** and **Skip to the finish** next to the speed buttons.
- While a race is playing, the top bar has **Pause race / Continue race** on every page, so a Grand Tour can be stopped from anywhere — between stages or in the middle of a live stage.
- The space bar pauses and resumes the race being played.

## v2.2.1 — Stop the simulation at any moment

- +1 week, +4 weeks and Next simulated event now run race by race with a "Simulating …" bar and a **Stop** button. Stopping finishes the race in progress, saves, and leaves you on that week; any simulation button carries on from there.

## v2.2 — Personalities, rivalries, one header

- **Personalities:** every rider has a mental trait (Serious, Rebel, Virtuoso, Warrior, Showman, Calculator, Nervous, Hungry) and a physical trait (Bull, Crystal, Diesel, Spark, Featherweight, Engine, Natural) — "the Rebel Bull". They set the development curve, the year-to-year ups and downs, career length, injury and illness risk, recovery, preferred races, strength by terrain, how the rider copes with the third week and with big occasions, how often he attacks and how much his form swings from day to day. Shown on the rider page, in race stories and rivalry news. Old saves get traits that fit each rider's existing career.
- **Rivalries:** declared during the season from the last two seasons of results (3+ shared podiums — top five in a Grand Tour — in WorldTour races, Worlds or Olympics, one in a race of prestige 86+, each rider ahead at least once). The five strongest are followed at any time; quiet ones end. News when rivals meet again, a "Rivals on the start line" card before showcase races, and a "Rivalry at the top" line when two rivals share the GC podium.
- **One-day races:** the live view marks the three top favourites (Fav 1/2/3) inside the groups, like the GC marks in stage races.
- **Rider page:** a single header (the profile card); Back and Follow sit above the tabs.
- **Hall of Fame:** All / Still racing / Retired filter and a status column.
- Balance: Grand Tour top-end gaps narrowed (the favourite's edge over the third-best counts 55%), a second Grand Tour in a season is ridden on tired legs, and repeat winners of the same race carry more weight of history.

## v2.1 — Fame, prestige ladder, Olympics, old-save upgrade

- **Prestige ladder:** Tour 100 · Olympic road race 95 · Worlds 93 · Giro 92 · Vuelta 90 · Olympic TT 88 · Worlds TT 86 · monuments 87–89 · great classics 80–85 · rest of the WorldTour 70–80 · ProSeries, U23 and continental under 70.
- **Fame** (shown on rider pages and used by the Hall of Fame): every top-10 finish earns a share of the race's win value, which doubles every 5 prestige points (Tour win 10,000; Olympic gold 5,000; Worlds 3,800; Giro 3,300; Vuelta 2,500; a monument about 2,000; a classic about 900). Second place is worth 30%, third 18%. Grand Tour stages and jerseys count too. So: two Tours > three seconds and four thirds in the Tour > two monuments > six seconds in classics.
- **Olympic Games** every four years (2028 Los Angeles, 2032 Brisbane, …): road race and time trial with small national squads; shown with the Worlds showcase setting.
- **Old saves** (v19 and earlier) keep every rider, team and result, and on load are brought onto the current balance: new prestige values, the Olympics added to the calendar, fame rebuilt from the full race history, and the elite tiers rebalanced so each has enough Grand Tour riders (the best young climbers or all-rounders of the tier below step up; surplus older specialists step down; nobody changes team). A news item lists the rating changes.
- New elite prospects are steered toward climbers and all-rounders when a tier is short of stage racers.

## v2.0 — Grand Tour balance pass

Checked with `node scripts/gt-checklist.mjs "" <seeds> <seasons>` (162 Grand Tours, 9 worlds × 6 seasons):

| Check | Before | After |
|---|---|---|
| Most stage wins by one rider (median / max) | 5 / 12 | 3 / 5 |
| Stage wins by the GC winner (median) | 5 | 2 |
| Different stage winners per GT (median) | 12 | 16 |
| Winner leads from stage ≤4 to the end | 31% | 15% |
| Leader changes per GT (median) | 3 | 4 |
| Bunch sprints won by a GC top-10 rider | 32% (all flat stages) | 1% |
| Same rider wins flat, mountain and TT stages in one GT | 9% | 1% |
| GT won by a climber or all-rounder | 70% | 96% |
| Median / 90th pct winning margin | 3:18 / 8:52 | 2:19 / 6:44 |

- Riders keep their speciality on race day: terrain offsets stop a great puncheur or sprinter from out-climbing the climbers or a GC man from winning bunch sprints.
- Bunch sprints are closer and more chaotic; GC men stay out of them; riders who keep winning get marked; sprinters can miss the time cut in the mountains.
- GC contenders lose little on flat and hilly days; the race is decided in the mountains, time trials and on the cobbles.
- A race leader with a big lead, or already three stage wins, rides defensively and gifts stages.
- Early in the race a leader's team hands the jersey to a harmless breakaway rider; riders a few minutes down hunt for it.
- More bad days in the third week; each rider brings a race-long form level.
- Back-to-back winners of the same race carry extra pressure, and multiple winners look for a different Grand Tour.
- Key stages: the playback now stops only before the 3–4 stages where something happens (new leader, big time gains, podium shake-up), picked from the already-simulated race.
- The live stage popup has "← Back to the race" at any time; the stage keeps running in a banner on the race screen and rolls on when it ends.

## v1.9.3 — Live stages in a popup

- The stage-race screen stays on the GC, jerseys and stage winners. A key stage watched live opens in a popup over it, with the route, groups, GC badges, ★ virtual leader and race radio.
- When the stage ends the popup shows the stage result and the new top five, and waits until you close it to go back to the race.
- The final screen leads with the race name and year in large type above the winner.

