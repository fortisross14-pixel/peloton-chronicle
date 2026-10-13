// Rider personalities: one mental trait and one physical trait ("the Rebel Bull").
// Together they decide how a career unfolds and how a rider races:
//   development curve, ups and downs from year to year, career length, injury and illness
//   risk, recovery, which races he aims for, where he is strongest, how he copes with three
//   weeks, with big occasions and with pressure, and how often he attacks.
// Every effect is small on its own; together they give each rider a recognisable story.

export const MENTAL_TRAITS = {
  serious: {
    label: 'Serious', blurb: 'A consummate professional: prepared, steady and almost never has an off day.',
    dayVar: 0.85, crisis: 0.7, attack: 0.9, shapeSpread: 0.6, careerYears: 1, dev: 'stable'
  },
  rebel: {
    label: 'Rebel', blurb: 'Brilliant when the mood takes him, but hard to keep focused — three weeks is a long time.',
    dayVar: 1.45, crisis: 1.4, attack: 1.45, shapeSpread: 2.6, careerYears: -1, gtWeek2: -1, gtWeek3: -2.5
  },
  virtuoso: {
    label: 'Virtuoso', blurb: 'Pure flair: lives for the one-day classics, the solo attack and the fast descent.',
    dayVar: 1.15, attack: 1.3, oneDay: 2, descend: 3, shapeSpread: 1.2
  },
  warrior: {
    label: 'Warrior', blurb: 'Suffers better than anyone and is at his best when the race turns brutal.',
    dayVar: 0.9, crisis: 0.6, attack: 1.1, gtWeek3: 1.2, injuryWeeks: 0.8
  },
  showman: {
    label: 'Showman', blurb: 'Raises his game for the biggest stages and the brightest lights, and coasts through the rest.',
    dayVar: 1.1, attack: 1.25, bigRace: 1.5, minorRace: -1.5
  },
  calculator: {
    label: 'Calculator', blurb: 'Reads the race like a chess board: waits, follows, and times his effort to the metre.',
    dayVar: 0.85, crisis: 0.85, attack: 0.75, finish: 1.5, tt: 1
  },
  nervous: {
    label: 'Nervous', blurb: 'Freezes under the spotlight but is dangerous when nobody is watching him.',
    dayVar: 1.25, crisis: 1.2, crash: 1.25, bigRace: -2, minorRace: 1
  },
  hungry: {
    label: 'Hungry', blurb: 'Wants everything, now: attacks from afar, wins early, and may burn out early too.',
    dayVar: 1.1, attack: 1.3, minorRace: 1, shapeSpread: 1.3, careerYears: -1, dev: 'early-bloomer'
  }
};

export const PHYSICAL_TRAITS = {
  bull: {
    label: 'Bull', blurb: 'Immensely strong and almost unbreakable; a long career if he wants it.',
    profile: { flat: 1.5, cobbles: 2, cobbledClimb: 1, tt: 1, climb: -1 }, injury: 0.45, illness: 0.6, careerYears: 2, recovery: 6, dev: 'late-bloomer',
    terrains: { cobbles: 3, rouleur: 3, 'time-trialist': 2, sprinter: 1.5 }
  },
  crystal: {
    label: 'Crystal', blurb: 'Extraordinary talent in a fragile body: every crash could be the one.',
    all: 1.5, injury: 2.1, illness: 1.6, careerYears: -3, dev: 'early-bloomer',
    terrains: { climber: 1.5, puncheur: 1.5, 'all-rounder': 1.2 }
  },
  diesel: {
    label: 'Diesel', blurb: 'Slow to warm up, impossible to stop: the longer the race, the stronger he gets.',
    profile: { climb: 0.5, tt: 1, punch: -2, sprint: -2 }, gtWeek2: 0.5, gtWeek3: 1.5, careerYears: 1, dev: 'late-bloomer',
    terrains: { 'time-trialist': 3, climber: 2, 'all-rounder': 2.5, rouleur: 1.5 }
  },
  spark: {
    label: 'Spark', blurb: 'Explosive: a devastating kick on short climbs and in the sprint, less so on long ones.',
    profile: { punch: 3, sprint: 2, hill: 1, climb: -2, tt: -1 }, gtWeek3: -1.5, dev: 'early-bloomer',
    terrains: { puncheur: 3.5, sprinter: 3, 'all-rounder': 1 }
  },
  feather: {
    label: 'Featherweight', blurb: 'Built for the high mountains, blown about on the cobbles and in the wind.',
    profile: { climb: 1.5, hill: 0.5, cobbles: -4, cobbledClimb: -2, flat: -1.5, tt: -1.5 }, crash: 1.15,
    terrains: { climber: 4, puncheur: 1, 'all-rounder': 1 }
  },
  engine: {
    label: 'Engine', blurb: 'A high-effort machine: recovers overnight and can race the whole calendar.',
    profile: { tt: 1, flat: 1 }, recovery: 12, gtWeek3: 1, careerYears: 1,
    terrains: { 'all-rounder': 2, rouleur: 2, 'time-trialist': 1.5, climber: 1.2 }
  },
  natural: {
    label: 'Natural', blurb: 'Gifted from day one: wins young, and the peak comes early.',
    all: 0.8, careerYears: -1, shapeSpread: 0.8, dev: 'early-bloomer',
    terrains: { 'all-rounder': 1.5, climber: 1.2, puncheur: 1.2, sprinter: 1.2 }
  }
};

const NONE = { mental: null, physical: null };
export function personalityOf(rider) {
  const p = rider?.personality || NONE;
  return { mental: MENTAL_TRAITS[p.mental] || null, physical: PHYSICAL_TRAITS[p.physical] || null };
}
export function personalityLabel(rider) {
  const { mental, physical } = personalityOf(rider);
  return mental && physical ? `${mental.label} ${physical.label}` : '';
}
export function personalityNickname(rider) { const label = personalityLabel(rider); return label ? `the ${label}` : ''; }

// Numeric effects with defaults, merged from both traits.
export function traitEffects(rider) {
  const { mental: m, physical: p } = personalityOf(rider);
  const get = (t, key, fallback) => (t && t[key] != null ? t[key] : fallback);
  return {
    dayVar: get(m, 'dayVar', 1),
    crisis: get(m, 'crisis', 1),
    attack: get(m, 'attack', 1),
    shapeSpread: get(m, 'shapeSpread', 1) * get(p, 'shapeSpread', 1),
    careerYears: get(m, 'careerYears', 0) + get(p, 'careerYears', 0),
    gtWeek2: get(m, 'gtWeek2', 0) + get(p, 'gtWeek2', 0),
    gtWeek3: get(m, 'gtWeek3', 0) + get(p, 'gtWeek3', 0),
    injury: get(p, 'injury', 1),
    injuryWeeks: get(m, 'injuryWeeks', 1),
    illness: get(p, 'illness', 1),
    crash: get(m, 'crash', 1) * get(p, 'crash', 1),
    recovery: get(p, 'recovery', 0),
    bigRace: get(m, 'bigRace', 0),
    minorRace: get(m, 'minorRace', 0),
    oneDay: get(m, 'oneDay', 0)
  };
}
// Race-day strength bonus on a terrain profile in a given event.
export function personalityRaceBonus(rider, profile, event) {
  const { mental: m, physical: p } = personalityOf(rider);
  if (!m && !p) return 0;
  let bonus = (p?.all || 0) + (p?.profile?.[profile] || 0);
  if (m) {
    if (profile === 'descend') bonus += m.descend || 0;
    if (profile === 'tt') bonus += m.tt || 0;
    if (['sprint', 'punch'].includes(profile)) bonus += m.finish || 0;
    const prestige = event?.prestige || 70;
    if (prestige >= 88) bonus += m.bigRace || 0; else if (prestige < 75) bonus += m.minorRace || 0;
    if (event && (event.stageProfiles?.length || 1) === 1 && !['championship'].includes(event.kind)) bonus += m.oneDay || 0;
  }
  return bonus;
}
// What the traits say about a career, in plain words for the rider page.
export function personalityNotes(rider) {
  const e = traitEffects(rider), { mental: m, physical: p } = personalityOf(rider);
  if (!m || !p) return [];
  const notes = [];
  notes.push(['Injuries', e.injury <= 0.6 ? 'Rarely hurt' : e.injury >= 1.8 ? 'Very injury-prone' : e.crash > 1.1 ? 'Crashes often' : 'Normal']);
  notes.push(['Career', e.careerYears >= 2 ? 'Long' : e.careerYears <= -2 ? 'Short' : 'Normal length']);
  notes.push(['Year to year', e.shapeSpread >= 2 ? 'Ups and downs' : e.shapeSpread <= 0.7 ? 'Very steady' : 'Normal']);
  const weekThree = e.gtWeek3;
  notes.push(['Third week', weekThree >= 2 ? 'Gets stronger' : weekThree <= -1.5 ? 'Fades' : 'Holds on']);
  notes.push(['Big occasions', e.bigRace >= 2 ? 'Rises to them' : e.bigRace <= -1 ? 'Feels the pressure' : 'Unaffected']);
  const best = Object.entries(p.profile || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k]) => ({ flat: 'flat', cobbles: 'cobbles', cobbledClimb: 'cobbled climbs', tt: 'time trials', climb: 'long climbs', punch: 'short climbs', sprint: 'sprints', hill: 'hills' }[k] || k));
  if (best.length) notes.push(['Physical edge', best.slice(0, 2).join(', ')]);
  return notes;
}
// Programme preference multipliers by trait.
export const PROGRAM_BIAS = {
  diesel: { 'grand-tour': 1.8 }, engine: { 'grand-tour': 1.3, 'stage-hunter': 1.3 }, spark: { monuments: 1.6, 'stage-hunter': 1.4, 'grand-tour': 0.6 },
  bull: { monuments: 1.5 }, feather: { 'grand-tour': 1.6, monuments: 0.5 }, virtuoso: { monuments: 1.8 }, showman: { 'grand-tour': 1.2, monuments: 1.2 },
  rebel: { 'grand-tour': 0.7, 'stage-hunter': 1.5 }, warrior: { 'grand-tour': 1.4 }, hungry: { 'stage-hunter': 1.3 }
};
// Picks a personality. `prefer` (optional) nudges the choice toward a development profile,
// so a save's existing riders get traits that match the careers they already have.
export function choosePersonality(random, terrain, { prefer = null } = {}) {
  const pick = (table, weightOf) => { const entries = Object.entries(table).map(([key, t]) => [key, weightOf(t)]); const total = entries.reduce((s, [, w]) => s + w, 0); let roll = random() * total; for (const [key, w] of entries) { roll -= w; if (roll <= 0) return key; } return entries.at(-1)[0]; };
  const devMatch = (t) => (prefer && t.dev ? (t.dev === prefer ? 2.5 : 0.5) : 1);
  const physical = pick(PHYSICAL_TRAITS, (t) => (t.terrains?.[terrain] || 0.6) * devMatch(t) * (t === PHYSICAL_TRAITS.crystal ? 0.6 : 1));
  const mental = pick(MENTAL_TRAITS, (t) => devMatch(t));
  return { mental, physical };
}
// Development profile implied by a new rider's traits.
export function developmentFromPersonality(random, personality) {
  const m = MENTAL_TRAITS[personality.mental], p = PHYSICAL_TRAITS[personality.physical];
  const votes = { 'early-bloomer': 1, stable: 1.4, 'late-bloomer': 1 };
  if (p?.dev) votes[p.dev] += 2.2;
  if (m?.dev) votes[m.dev] += 1.2;
  const total = Object.values(votes).reduce((a, b) => a + b, 0); let roll = random() * total;
  for (const [key, w] of Object.entries(votes)) { roll -= w; if (roll <= 0) return key; }
  return 'stable';
}
