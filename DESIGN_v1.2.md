# Peloton Chronicle v1.2 — Director's Cut visual language

## Positioning

Peloton Chronicle should feel like a serious European cycling annual that has been rebuilt as a modern game. It is retro in editorial language, not retro software: no pixels, CRT effects, fake torn paper, novelty typefaces or deliberately awkward controls.

The identity rests on four layers:

1. **Archive:** warm paper, ink, ruled tables and season stamps.
2. **Sporting press:** strong serif headlines, burgundy mastheads, race posters and compact data captions.
3. **Team identity:** primary and secondary sponsor colors act as jersey stripes throughout the interface.
4. **Modern product quality:** responsive grids, stable hierarchy, readable numeric tables, clear focus states and restrained motion.

## Rarity system

The rarity palette is fixed and must remain consistent everywhere:

- Generational — red
- Legend — gold
- Epic — purple
- Rare — blue
- Uncommon — green
- Common — white with a visible neutral border

Rarity color identifies talent class. Team color identifies sporting organization. The two systems should never compete: team color owns the top jersey stripe; rarity owns the side accent and badge.

## Typography

- Display and historical headings: Georgia / Times-style serif.
- Interface copy, filters and dense statistics: Arial / Helvetica-style sans serif.
- Four practical levels: masthead/page title, section title, body/data, caption.
- Important numbers use tabular alignment and a serif display weight.
- Supporting labels remain uppercase and tracked, but never smaller than required for mobile readability.

## Core surfaces

- Main pages use paper rather than white.
- Cards use a restrained raised-paper shadow and a crisp border.
- Tables use burgundy ink headers, gold rules and alternating paper tones.
- Active tabs use dark wine with a gold underline.
- Buttons stay rectangular and editorial rather than pill-heavy.

## Signature components

### Rider cards

- Sponsor-color jersey stripe across the top.
- Rarity-colored side rule.
- Large current rating.
- Explicit Yx/total career chip.
- Three readable current-season metrics.
- Race-program and terrain specialty in a quiet footer.

### Team cards

- Primary/secondary sponsor stripe.
- Current points emphasized as a sporting value.
- Primary and secondary sponsors visible.
- Director, budget, facilities and attraction shown without opening the profile.

### Grand Tours

- Giro: rose editorial field.
- Tour: yellow editorial field.
- Vuelta: warm red/orange editorial field.
- These are race identities, not rarity colors.

### Le Grand Braquet

- Full editorial cover treatment.
- Strong lead story, clear departments and historical newspaper hierarchy.
- Clickable entities remain visually consistent with the rest of the game.

## Interaction

Motion is limited to subtle card lift, button response, navigation movement and toast entry. The design must remain serious and readable with `prefers-reduced-motion` respected.

## Compatibility

v1.2 changes presentation only. It does not alter:

- save schema
- simulation engine
- route names
- navigation stack
- filters
- profile tabs
- season lifecycle
- market or balance logic
