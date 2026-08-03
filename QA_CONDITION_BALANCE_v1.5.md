# Peloton Chronicle v1.5 — Condition and Jersey Balance QA

Fixed-seed benchmark across **10 universes**, **30 Grand Tours**, and the full professional calendar.

## Calendar and condition

- Actual overlapping rider starts: **0**
- Riders above 21 race days in any rolling 28-day window: **0**
- Maximum race days in a rolling 28-day window: **21**
- Maximum elite-rider starts in one season: **14**
- Maximum elite-rider race days in one season: **70**
- Maximum starts for any rider: **26**
- Maximum race days for any rider: **81**

## Grand Tour outcomes

- Points and mountains won by the same rider: **0/30**
- Youth winners older than 23: **0/30**
- Grand Tours won below Epic rarity: **0/30**
- Maximum stages won by one rider in one Grand Tour: **7**
- Mountain stages won by incompatible profiles: **2/210 (1.0%)**
- Flat stages won by incompatible profiles: **0/210 (0.0%)**

## Interpretation

The test is designed to catch the reported failure mode: overlapping calendars, riders entering a Grand Tour after impossible workloads, ordinary riders sweeping every terrain, combined points/mountains dominance, and over-age youth winners. Rare outliers remain possible in one-day racing, but the deterministic Grand Tour sample keeps stage and jersey outcomes profile-specific.

Full seed-by-seed output is available in `QA_CONDITION_BALANCE_RAW_v1.5.json`.
