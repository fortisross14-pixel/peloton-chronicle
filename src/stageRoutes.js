// Stage-race routes. Every Grand Tour edition is drawn fresh each year from its own identity:
// how many time-trial kilometres, how many mountain stages and summit finishes, where the
// queen stage sits. Some years suit time-triallists, others pure climbers.
// Week-long races build their stages from the race's terrain profile.

const CLIMBS = {
  tour: {
    big: ['Col du Galibier', "Alpe d'Huez", 'Col du Tourmalet', 'Mont Ventoux', 'Col de la Madeleine', "Col d'Izoard", 'Col de la Loze', 'Plateau de Beille', 'Hautacam', 'Col du Granon', 'Puy de Dôme', "Col d'Aubisque", 'Col de la Croix de Fer', 'Pla d’Adet', 'Col du Glandon', 'Luz Ardiden', 'La Planche des Belles Filles', 'Grand Colombier', 'Col de Joux Plane', 'Isola 2000', 'Cime de la Bonette', 'Col de Peyresourde'],
    small: ['Col de Portet-d’Aspet', 'Col de la Colombière', 'Col des Aravis', 'Col de Mente', 'Côte de Domancy', 'Col du Grand Ballon', 'Col de la Schlucht', 'Côte de Laffrey', 'Col de Manse', 'Mûr-de-Bretagne', 'Col du Platzerwasel', 'Côte de Saint-Nizier', 'Col de la Croix Morand', 'Côte de Gorron', 'Col du Pas de Peyrol', 'Côte de Cadoudal']
  },
  giro: {
    big: ['Passo dello Stelvio', 'Passo del Mortirolo', 'Monte Zoncolan', 'Passo di Gavia', 'Tre Cime di Lavaredo', 'Blockhaus', 'Passo Giau', 'Colle delle Finestre', 'Etna', 'Monte Grappa', 'Passo Fedaia', 'Sestriere', 'Passo Pordoi', 'Passo San Pellegrino', 'Prati di Tivo', 'Campo Imperatore', 'Santuario di Oropa', 'Livigno', 'Passo del Tonale', 'Colle dell’Agnello'],
    small: ['Passo del Bocco', 'Muro di Ca’ del Poggio', 'Passo della Cisa', 'Valico di Chiunzi', 'Passo della Futa', 'Forcella Staulanza', 'Passo Duran', 'Passo Manghen', 'Colle San Carlo', 'Montevergine', 'Passo del Turchino', 'Colle di Tenda', 'Muro di Guardiagrele', 'Valico di Monte Sacro']
  },
  vuelta: {
    big: ["Alto de l'Angliru", 'Lagos de Covadonga', 'Bola del Mundo', 'La Covatilla', 'Sierra Nevada', 'Cuitu Negru', 'Peñas Blancas', 'Xorret de Catí', 'La Farrapona', 'Alto de Moncalvillo', 'Javalambre', 'Alto de La Cubilla', 'Picón Blanco', 'Alto de Velefique', 'Calar Alto', 'Alto del Gamoniteiro', 'Puerto de Ancares', 'Valdelinares'],
    small: ['Alto de El Morredero', 'Puerto de Navacerrada', 'Alto de la Morcuera', 'Puerto de Cotos', 'Alto de San Miguel', 'Puerto de Orduña', 'Alto de Urkiola', 'Alto del Vivero', 'Puerto de Pajares', 'Collado de la Llama', 'Mirador de Ézaro', 'Valdepeñas de Jaén', 'Alto de Montjuïc', 'Puerto de Almáchar']
  },
  CH: { big: ['Crans-Montana', 'Grimsel Pass', 'Furka Pass', 'Gotthard Pass', 'Albula Pass', 'Flüela Pass', 'Leukerbad', 'Oberalp Pass'], small: ['Hauenstein', 'Col des Mosses', 'Brünig Pass', 'Saanenmöser', 'Ibergeregg', 'Sattelegg'] },
  FR: { big: ['Col de la Croix de Fer', 'Mont Ventoux', 'Col de la Colombière', 'Plateau de Solaison', 'Col du Mont Cenis', 'La Toussuire', 'Col de la Loze', 'Superdévoluy'], small: ['Côte de Mouxy', 'Col de l’Épine', 'Côte de Chambéry-le-Vieux', 'Col du Granier', 'Mont Saxonnex', 'Col des Saisies', 'Côte de la Croix-Neuve'] },
  IT: { big: ['Monte Petrano', 'Sassotetto', 'Prati di Tivo', 'Monte Carpegna', 'Passo Lanciano', 'Terminillo'], small: ['Muro di Ca’ del Poggio', 'San Luca', 'Montelupone', 'Recanati', 'Colle Bellavista', 'Valico di Chiunzi'] },
  ES: { big: ['La Molina', 'Vallter 2000', 'Port Ainé', 'Lagos de Covadonga', 'Alto de Arrate', 'Puerto de Cotos', 'La Camperona'], small: ['Coll de Sentigosa', 'Alto de Jaizkibel', 'Collado de Bareiro', 'Puerto de Orduña', 'Coll de Santigosa', 'Alto de Ibardin'] },
  default: { big: ['Summit of the Range', 'High Pass', 'Mountain Observatory', 'Ski Station Summit', 'Pass of the Clouds', 'Monastery Climb', 'Upper Plateau', 'Glacier Road'], small: ['Chapel Climb', 'Village Wall', 'Vineyard Rise', 'Castle Hill', 'Quarry Climb', 'Water Tower Hill', 'Old Mill Hill', 'Ridge Road'] }
};

const GT_IDENTITY = {
  tour: { mountains: [6, 9], summitShare: 0.5, ttKm: [25, 75], hillyShare: 0.35, special: 'cobbles', specialChance: 0.35, lastStage: [['flat', 0.8], ['itt', 0.2]] },
  giro: { mountains: [7, 10], summitShare: 0.55, ttKm: [25, 70], hillyShare: 0.5, special: 'gravel', specialChance: 0.35, lastStage: [['flat', 0.65], ['itt', 0.35]] },
  vuelta: { mountains: [7, 10], summitShare: 0.75, ttKm: [15, 45], hillyShare: 0.55, special: null, specialChance: 0, lastStage: [['flat', 1]] }
};

export const STAGE_TYPE_LABELS = { flat: 'Flat stage', hilly: 'Hilly stage', mountain: 'Mountain stage', itt: 'Individual time trial', cobbles: 'Cobbled stage', gravel: 'Gravel stage' };
export const CLIMB_CATEGORY_LABEL = { 0: 'HC', 1: 'Cat. 1', 2: 'Cat. 2', 3: 'Cat. 3', 4: 'Cat. 4' };

function mulberry(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
function hash(text) { let h = 2166136261; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const between = (random, [min, max]) => min + Math.floor(random() * (max - min + 1));
function categoryFor(difficulty) { return difficulty >= 9 ? 0 : difficulty >= 7 ? 1 : difficulty >= 5 ? 2 : difficulty >= 3 ? 3 : 4; }

// Draws climb names without repeating within one edition.
function namer(random, pool) {
  const big = [...pool.big].sort(() => random() - 0.5), small = [...pool.small].sort(() => random() - 0.5); let b = 0, s = 0;
  return (isBig) => (isBig ? big[b++ % big.length] : small[s++ % small.length]);
}
const climb = (km, name, difficulty, length) => ({ km: Math.round(km), name, type: 'climb', difficulty, length, category: categoryFor(difficulty) });

function buildStage(type, random, name, options = {}) {
  const { queen = false, summit = false, ttKm = 30, mountainTt = false } = options;
  if (type === 'itt') {
    const sectors = mountainTt ? [climb(ttKm, name(true), 7, 9)] : [];
    return { type, profile: 'time-trial', distance: ttKm, finish: 'itt', sectors, mountainTt };
  }
  if (type === 'flat') {
    const distance = 165 + Math.round(random() * 55);
    const sectors = random() < 0.6 ? [climb(distance * (0.3 + random() * 0.4), name(false), 1 + Math.round(random()), 1.5)] : [];
    return { type, profile: 'flat', distance, finish: 'sprint', sectors, sprintKm: Math.round(distance * 0.55) };
  }
  if (type === 'cobbles') {
    const distance = 165 + Math.round(random() * 30), count = 6 + Math.floor(random() * 6);
    const sectors = Array.from({ length: count }, (_, i) => ({ km: Math.round(distance * 0.45 + (distance * 0.5) * (i / count)), name: `Cobbled sector ${count - i}`, type: 'cobbles', difficulty: 3 + Math.round(random() * 4), length: 2 }));
    return { type, profile: 'cobbles', distance, finish: 'reduced-sprint', sectors, sprintKm: Math.round(distance * 0.35) };
  }
  if (type === 'gravel') {
    const distance = 160 + Math.round(random() * 40), count = 4 + Math.floor(random() * 4);
    const sectors = Array.from({ length: count }, (_, i) => ({ km: Math.round(distance * 0.4 + (distance * 0.52) * (i / count)), name: `Strada bianca ${i + 1}`, type: 'gravel', difficulty: 4 + Math.round(random() * 3), length: 5 }));
    return { type, profile: 'hilly', distance, finish: random() < 0.5 ? 'uphill' : 'small-group', sectors, sprintKm: Math.round(distance * 0.3) };
  }
  if (type === 'hilly') {
    const distance = 160 + Math.round(random() * 50), count = 3 + Math.floor(random() * 4), punchy = random() < 0.35;
    // The last climbs come late and hurt: hilly days belong to puncheurs and breakaways, not pure sprinters.
    const sectors = Array.from({ length: count }, (_, i) => climb(distance * (0.3 + 0.62 * (i / Math.max(1, count - 1))), name(false), Math.min(7, 3 + Math.round(random() * 2 + i * 0.25 + (i >= count - 2 ? 1.5 : 0))), 1 + random() * 3));
    const finish = punchy ? 'uphill' : random() < 0.3 ? 'reduced-sprint' : 'small-group';
    if (finish === 'uphill') sectors.push({ ...climb(distance, name(false), 5, 1), finish: true });
    return { type, profile: 'puncheur', distance, finish, sectors, sprintKm: Math.round(distance * 0.45) };
  }
  // Mountain stage: a ladder of climbs, the hardest saved for last; the queen stage adds one more.
  const distance = (queen ? 175 : 140) + Math.round(random() * 45), count = (queen ? 4 : 2) + Math.floor(random() * 3);
  const sectors = [];
  for (let i = 0; i < count; i += 1) {
    const last = i === count - 1, position = last ? (summit ? distance : distance - 12 - Math.round(random() * 20)) : distance * (0.25 + 0.6 * (i / Math.max(1, count - 1)));
    const difficulty = last ? (queen ? 10 : 8 + Math.round(random())) : 5 + Math.round(random() * 3 + (queen ? 1 : 0));
    const sector = climb(position, name(difficulty >= 7), Math.min(10, difficulty), 6 + random() * 12);
    if (last && summit) sector.finish = true;
    sectors.push(sector);
  }
  return { type, profile: 'mountain', distance, finish: summit ? 'summit' : 'descent', sectors, queen, sprintKm: Math.round(distance * (0.15 + random() * 0.15)) };
}

function gtPlan(event, year) {
  const random = mulberry(hash(`${event.id}|${year}|grand-tour-route`)), id = GT_IDENTITY[event.id], pool = CLIMBS[event.id];
  const name = namer(random, pool);
  // This edition's character: some years are time-trial heavy, some are for pure climbers.
  const ttWeight = random(), mountainWeight = random();
  const mountainCount = id.mountains[0] + Math.round(mountainWeight * (id.mountains[1] - id.mountains[0]));
  const ittCount = 1 + (ttWeight > 0.45 ? 1 : 0) + (ttWeight > 0.85 ? 1 : 0);
  const ttTotal = Math.round(id.ttKm[0] + ttWeight * (id.ttKm[1] - id.ttKm[0]));
  const types = Array(21).fill(null);
  const lastRoll = random(); let acc = 0; for (const [type, p] of id.lastStage) { acc += p; if (lastRoll <= acc) { types[20] = type; break; } }
  types[20] ??= 'flat';
  // Time trials: an opener or prologue, one mid-race, sometimes one in the final week.
  const ttSlots = [random() < 0.3 ? 0 : 6 + Math.floor(random() * 3), 12 + Math.floor(random() * 3), 18 + Math.floor(random() * 2)];
  let placedItt = types[20] === 'itt' ? 1 : 0;
  for (const slot of ttSlots) { if (placedItt >= ittCount) break; if (!types[slot]) { types[slot] = 'itt'; placedItt += 1; } }
  // Mountains: weighted toward the final week, at least one in each week.
  const mountainSlots = [15, 16, 17, 18, 19, 13, 14, 10, 11, 8, 4, 5, 3, 7, 9, 12].filter((slot) => !types[slot]);
  const chosen = [mountainSlots.find((s) => s >= 15), mountainSlots.find((s) => s >= 9 && s <= 14), mountainSlots.find((s) => s >= 3 && s <= 8)].filter((s) => s != null);
  for (const slot of mountainSlots) { if (chosen.length >= mountainCount) break; if (!chosen.includes(slot) && random() < 0.75) chosen.push(slot); }
  for (const slot of chosen) types[slot] = 'mountain';
  if (id.special && random() < id.specialChance) { const slot = [2, 3, 4, 5, 8].find((s) => !types[s]); if (slot != null) types[slot] = id.special; }
  for (let i = 0; i < 21; i += 1) if (!types[i]) types[i] = random() < id.hillyShare ? 'hilly' : 'flat';
  // The queen stage: the last big mountain day before the finale.
  const mountainIndexes = types.map((t, i) => (t === 'mountain' ? i : -1)).filter((i) => i >= 0);
  const queen = [...mountainIndexes].reverse().find((i) => i >= 15 && i <= 19) ?? mountainIndexes.at(-1);
  const ittKm = Array(21).fill(0); const ittIdx = types.map((t, i) => (t === 'itt' ? i : -1)).filter((i) => i >= 0);
  ittIdx.forEach((i, n) => { ittKm[i] = i === 0 && ittIdx.length > 1 ? 8 + Math.round(random() * 8) : Math.max(12, Math.round((ttTotal - (ittIdx[0] === 0 && ittIdx.length > 1 ? 12 : 0)) / Math.max(1, ittIdx.length - (ittIdx[0] === 0 && ittIdx.length > 1 ? 1 : 0)))); });
  const stages = types.map((type, i) => {
    const stage = buildStage(type, random, name, { queen: i === queen, summit: i === queen || random() < id.summitShare, ttKm: ittKm[i], mountainTt: type === 'itt' && event.id === 'giro' && random() < 0.25 });
    return { number: i + 1, ...stage, restAfter: i === 8 || i === 14, queen: i === queen, title: stageTitle(stage) };
  });
  return { stages, character: { ttKm: stages.filter((s) => s.type === 'itt').reduce((sum, s) => sum + s.distance, 0), mountainStages: stages.filter((s) => s.type === 'mountain').length, summitFinishes: stages.filter((s) => s.finish === 'summit').length } };
}

function stageTitle(stage) {
  if (stage.type === 'itt') return stage.mountainTt ? `Mountain time trial to ${stage.sectors[0].name}` : `Individual time trial · ${stage.distance} km`;
  if (stage.type === 'mountain') { const last = stage.sectors.at(-1); return stage.finish === 'summit' ? `Summit finish · ${last.name}` : `Over ${last.name}`; }
  return STAGE_TYPE_LABELS[stage.type];
}

const PROFILE_TO_TYPE = { flat: 'flat', hilly: 'hilly', puncheur: 'hilly', mountain: 'mountain', 'time-trial': 'itt', cobbles: 'cobbles' };
function weekPlan(event, year) {
  const random = mulberry(hash(`${event.id}|${year}|stage-route`)), name = namer(random, CLIMBS[event.country] || CLIMBS.default);
  const profiles = event.stageProfiles || [];
  const lastMountain = profiles.lastIndexOf('mountain');
  const stages = profiles.map((profile, i) => {
    const type = PROFILE_TO_TYPE[profile] || 'hilly';
    const stage = buildStage(type, random, name, { queen: i === lastMountain, summit: i === lastMountain || random() < 0.5, ttKm: 10 + Math.round(random() * 20) });
    return { number: i + 1, ...stage, restAfter: false, queen: i === lastMountain && profiles.length >= 5, title: stageTitle(stage) };
  });
  return { stages, character: { ttKm: stages.filter((s) => s.type === 'itt').reduce((sum, s) => sum + s.distance, 0), mountainStages: stages.filter((s) => s.type === 'mountain').length, summitFinishes: stages.filter((s) => s.finish === 'summit').length } };
}

const PLAN_CACHE = new Map();
export function stagePlanForEvent(event, year) {
  const key = `${event.id}|${year}|${(event.stageProfiles || []).join(',')}`;
  if (!PLAN_CACHE.has(key)) PLAN_CACHE.set(key, GT_IDENTITY[event.id] ? gtPlan(event, year) : weekPlan(event, year));
  return PLAN_CACHE.get(key);
}
// Legacy terrain keys for the rest of the game (labels, targeting, history).
export function stageProfilesForYear(event, year) {
  if (!GT_IDENTITY[event.id]) return event.stageProfiles;
  return gtPlan(event, year).stages.map((stage) => stage.profile);
}
