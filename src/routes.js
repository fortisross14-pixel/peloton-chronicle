// Race routes: the terrain a race is actually fought over.
// A sector is a moment where the race can break: a climb, a cobbled stretch, a gravel road.
// difficulty: 1 (barely a bump) – 10 (Arenberg, Sormano). Finish types decide who can win
// from the group that arrives together.

const climb = (km, name, difficulty, length = 2) => ({ km, name, type: 'climb', difficulty, length });
const berg = (km, name, difficulty) => ({ km, name, type: 'cobbled-climb', difficulty, length: 1 });
const pave = (km, name, difficulty) => ({ km, name, type: 'cobbles', difficulty, length: 2 });
const gravel = (km, name, difficulty) => ({ km, name, type: 'gravel', difficulty, length: 5 });

export const FINISH_LABELS = {
  sprint: 'Bunch sprint finish',
  'reduced-sprint': 'Reduced sprint finish',
  'small-group': 'Flat run-in after the last climb',
  uphill: 'Uphill finish',
  summit: 'Summit finish',
  descent: 'Descent to the line',
  velodrome: 'Velodrome finish'
};

export const SECTOR_LABELS = { climb: 'Climb', 'cobbled-climb': 'Cobbled climb', cobbles: 'Cobbled sector', gravel: 'Gravel sector' };

const ROUTES = {
  sanremo: { distance: 289, finish: 'reduced-sprint', sectors: [
    climb(142, 'Passo del Turchino', 3, 6), climb(241, 'Capo Mele', 2, 1), climb(246, 'Capo Cervo', 2, 1), climb(254, 'Capo Berta', 3, 2),
    climb(268, 'Cipressa', 4, 5.6), climb(283, 'Poggio di Sanremo', 5, 3.7)
  ] },
  flanders: { distance: 270, finish: 'small-group', sectors: [
    berg(135, 'Oude Kwaremont (1)', 5), climb(150, 'Kortekeer', 3, 1), berg(156, 'Eikenberg', 4), berg(170, 'Molenberg', 5), climb(185, 'Berg Ten Houte', 4, 1),
    berg(200, 'Oude Kwaremont (2)', 6), berg(203, 'Paterberg (1)', 7), berg(214, 'Koppenberg', 8), berg(218, 'Steenbeekdries', 4), berg(221, 'Taaienberg', 6),
    berg(237, 'Kruisberg', 5), berg(254, 'Oude Kwaremont (3)', 8), berg(257, 'Paterberg (2)', 8)
  ] },
  roubaix: { distance: 259, finish: 'velodrome', sectors: [
    pave(98, 'Troisvilles à Inchy', 4), pave(105, 'Quiévy à Saint-Python', 4), pave(151, 'Haveluy à Wallers', 5), pave(162, "Trouée d'Arenberg", 9),
    pave(168, 'Wallers à Hélesmes', 5), pave(196, 'Orchies', 4), pave(202, 'Auchy-lez-Orchies à Bersée', 5), pave(208, 'Mons-en-Pévèle', 9),
    pave(214, 'Mérignies à Avelin', 3), pave(218, 'Pont-Thibault à Ennevelin', 3), pave(223, 'Templeuve', 4), pave(230, 'Cysoing à Bourghelles', 5),
    pave(234, 'Bourghelles à Wannehain', 4), pave(239, 'Camphin-en-Pévèle', 6), pave(242, "Carrefour de l'Arbre", 9), pave(245, 'Gruson', 4),
    pave(251, 'Willems à Hem', 3), pave(255, 'Roubaix (Espace Charles Crupelandt)', 2)
  ] },
  liege: { distance: 256, finish: 'small-group', sectors: [
    climb(75, 'Côte de La Roche-en-Ardenne', 3, 2.8), climb(120, 'Côte de Saint-Roch', 4, 1), climb(165, 'Côte de Wanne', 5, 2.7), climb(172, 'Côte de Stockeu', 6, 1),
    climb(178, 'Côte de la Haute-Levée', 5, 2.2), climb(192, 'Col du Rosier', 5, 4.4), climb(205, 'Côte de Desnié', 4, 1.6), climb(221, 'Côte de La Redoute', 7, 1.6),
    climb(231, 'Côte des Forges', 5, 1.3), climb(243, 'Côte de la Roche-aux-Faucons', 8, 1.3)
  ] },
  lombardia: { distance: 252, finish: 'descent', sectors: [
    climb(60, 'Colle Gallo', 4, 7), climb(150, 'Madonna del Ghisallo', 6, 8.6), climb(179, 'Colma di Sormano', 9, 7), climb(222, 'Civiglio', 6, 4.2),
    climb(245, 'San Fermo della Battaglia', 6, 2.7)
  ] },
  'worlds-road': { distance: 267, finish: 'small-group', circuit: true, sectors: [
    climb(80, 'Circuit climb (lap 2)', 3), climb(110, 'Circuit climb (lap 4)', 3), climb(140, 'Circuit climb (lap 6)', 4), climb(170, 'Circuit climb (lap 8)', 4),
    climb(200, 'Circuit climb (lap 10)', 5), climb(222, 'Circuit climb (lap 12)', 6), climb(237, 'Circuit climb (lap 13)', 7), climb(252, 'Circuit climb (lap 14)', 7), climb(263, 'Circuit climb (final lap)', 8)
  ] },
  // Olympic road race: smaller national squads, a hard hilly circuit, often won from a small group.
  'olympics-road': { distance: 255, finish: 'small-group', circuit: true, sectors: [
    climb(60, 'Olympic circuit climb (lap 1)', 4, 3), climb(105, 'Olympic circuit climb (lap 3)', 5, 3), climb(150, 'Olympic circuit climb (lap 5)', 6, 3),
    climb(190, 'Olympic circuit climb (lap 7)', 6, 3), climb(218, 'Olympic circuit climb (lap 8)', 7, 3), climb(244, 'Olympic circuit climb (final lap)', 8, 3)
  ] },
  'u23-worlds-road': { distance: 175, finish: 'small-group', circuit: true, sectors: [
    climb(70, 'Circuit climb (lap 3)', 3), climb(100, 'Circuit climb (lap 5)', 4), climb(130, 'Circuit climb (lap 7)', 5), climb(150, 'Circuit climb (lap 8)', 6), climb(171, 'Circuit climb (final lap)', 7)
  ] },
  amstel: { distance: 255, finish: 'small-group', sectors: [
    climb(150, 'Kruisberg', 4, 1), climb(200, 'Eyserbosweg', 5, 1.1), climb(225, 'Keutenberg', 6, 1.2), climb(240, 'Cauberg', 6, 1.2), climb(246, 'Geulhemmerberg', 4, 1), climb(251, 'Bemelerberg', 5, 0.9)
  ] },
  fleche: { distance: 199, finish: 'uphill', finishClimb: 'Mur de Huy', sectors: [
    climb(120, "Côte d'Ereffe", 4, 2.1), climb(140, 'Mur de Huy (1)', 6, 1.3), climb(170, 'Mur de Huy (2)', 6, 1.3), climb(192, 'Côte de Cherave', 5, 1.3)
  ] },
  strade: { distance: 213, finish: 'uphill', finishClimb: 'Via Santa Caterina, Siena', sectors: [
    gravel(18, 'Vidritta', 3), gravel(40, 'Bagnaia', 3), gravel(52, 'Radi', 3), gravel(64, 'La Piana', 4), gravel(80, 'Lucignano d\'Asso', 3),
    gravel(110, 'Monte Sante Marie', 8), gravel(140, 'San Martino in Grania', 5), gravel(160, 'Monteaperti', 5), gravel(186, 'Colle Pinzuto', 7), gravel(196, 'Le Tolfe', 7)
  ] },
  omloop: { distance: 197, finish: 'reduced-sprint', sectors: [
    berg(100, 'Wolvenberg', 4), pave(115, 'Haaghoek', 4), berg(140, 'Molenberg', 5), berg(160, 'Berendries', 5), berg(184, 'Muur-Kapelmuur', 7), berg(188, 'Bosberg', 6)
  ] },
  kuurne: { distance: 195, finish: 'sprint', sectors: [
    berg(120, 'Oude Kwaremont', 6), berg(135, 'Kluisberg', 5), berg(150, 'Nokereberg', 3)
  ] },
  e3: { distance: 208, finish: 'small-group', sectors: [
    berg(110, 'Kapelberg', 4), berg(140, 'Taaienberg', 6), berg(160, 'Paterberg', 7), berg(168, 'Oude Kwaremont', 7), pave(182, 'Karnemelkbeekstraat', 4), berg(192, 'Tiegemberg', 4)
  ] },
  gent: { distance: 253, finish: 'reduced-sprint', sectors: [
    climb(160, 'Scherpenberg', 4, 1), berg(185, 'Kemmelberg (1)', 6), climb(192, 'Monteberg', 5, 1), berg(216, 'Kemmelberg (2)', 7)
  ] },
  dwars: { distance: 185, finish: 'reduced-sprint', sectors: [
    berg(120, 'Knokteberg', 5), pave(140, 'Holleweg', 4), berg(158, 'Hotond', 4), berg(175, 'Nokereberg', 4)
  ] },
  nokere: { distance: 195, finish: 'uphill', finishClimb: 'Nokereberg', sectors: [
    berg(150, 'Nokereberg (1)', 3), berg(173, 'Nokereberg (2)', 3)
  ] },
  brabant: { distance: 165, finish: 'uphill', finishClimb: 'Schavei', sectors: [
    climb(110, 'Moskesstraat', 5, 0.6), climb(130, 'Holstheide', 4, 0.8), climb(145, 'Hertstraat', 5, 0.5), climb(157, 'Wijnpers', 5, 0.6)
  ] },
  'san-sebastian': { distance: 230, finish: 'descent', sectors: [
    climb(115, 'Jaizkibel', 6, 7.9), climb(175, 'Jaizkibel (2)', 7, 7.9), climb(200, 'Erlaitz', 7, 4.5), climb(222, 'Murgil Tontorra', 7, 2.1)
  ] },
  cadel: { distance: 175, finish: 'reduced-sprint', sectors: [
    climb(120, 'Challambra Crescent (1)', 4, 1), climb(145, 'Challambra Crescent (2)', 5, 1), climb(165, 'Challambra Crescent (3)', 5, 1)
  ] },
  quebec: { distance: 201, finish: 'uphill', finishClimb: 'Grande Allée', circuit: true, sectors: [
    climb(110, 'Côte de la Montagne (lap 9)', 4, 0.4), climb(150, 'Côte de la Montagne (lap 12)', 4, 0.4), climb(175, 'Côte de la Montagne (lap 14)', 5, 0.4), climb(194, 'Côte de la Montagne (final lap)', 5, 0.4)
  ] },
  montreal: { distance: 221, finish: 'uphill', finishClimb: 'Avenue du Parc', circuit: true, sectors: [
    climb(120, 'Côte Camillien-Houde (lap 10)', 5, 1.8), climb(170, 'Côte Camillien-Houde (lap 14)', 5, 1.8), climb(200, 'Côte Camillien-Houde (lap 16)', 6, 1.8), climb(215, 'Côte Camillien-Houde (final lap)', 6, 1.8)
  ] },
  eschborn: { distance: 200, finish: 'sprint', sectors: [
    climb(70, 'Großer Feldberg', 5, 10), climb(150, 'Mammolshainer Stich (2)', 5, 0.9), climb(178, 'Mammolshainer Stich (3)', 5, 0.9)
  ] },
  bretagne: { distance: 248, finish: 'reduced-sprint', sectors: [
    climb(140, 'Côte de Ty Marrec', 4, 1), climb(190, 'Côte de Saint-Adrien', 4, 1), climb(225, 'Côte de Ty Marrec (2)', 5, 1)
  ] },
  'paris-tours': { distance: 213, finish: 'small-group', sectors: [
    gravel(160, 'Chemin des vignes (1)', 4), climb(172, 'Côte de Crochu', 4, 0.6), gravel(185, 'Chemin des vignes (2)', 5), climb(195, 'Côte de Rochecorbon', 5, 0.6), gravel(203, 'Chemin des vignes (3)', 5)
  ] },
  piemonte: { distance: 180, finish: 'reduced-sprint', sectors: [
    climb(110, 'Colle della Maddalena', 5, 6), climb(160, 'Salita di Superga', 5, 4)
  ] },
  'u23-flanders': { distance: 175, finish: 'small-group', sectors: [
    berg(110, 'Molenberg', 5), berg(130, 'Berendries', 5), berg(150, 'Oude Kwaremont', 6), berg(160, 'Paterberg', 7)
  ] },
  copenhagen: { distance: 230, finish: 'sprint', sectors: [climb(180, 'Bakkehuset', 2, 0.6)] },
  cyclassics: { distance: 205, finish: 'sprint', sectors: [climb(150, 'Waseberg (1)', 3, 0.7), climb(185, 'Waseberg (2)', 3, 0.7)] },
  'sprint-classic': { distance: 200, finish: 'sprint', sectors: [climb(160, 'Dike climb', 2, 0.5)] }
};

function mulberry(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
function hash(text) { let h = 2166136261; for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const GENERIC_NAMES = ['Côte de la Croix', 'Mur du Moulin', 'Colle San Pietro', 'Alto del Calvario', 'Bergstraat', 'Côte des Vignes', 'Salita del Castello', 'Kapelberg', 'Puerto de la Cruz', 'Côte du Château'];

// Races without a hand-built route get a plausible one from their terrain profile.
function genericRoute(event, year) {
  const random = mulberry(hash(`${event.id}|${year}|route`)), profile = event.stageProfiles?.[0] || 'hilly';
  const distance = Math.round((event.tier === 'u23' ? 165 : 190) + random() * 40);
  const names = [...GENERIC_NAMES].sort(() => random() - 0.5);
  const spread = (count, from, to, make) => Array.from({ length: count }, (_, i) => make(Math.round(from + (to - from) * (count === 1 ? 1 : i / (count - 1))), i));
  if (profile === 'flat') return { distance, finish: 'sprint', sectors: spread(2, distance * 0.55, distance - 30, (km, i) => climb(km, names[i], 2, 1)) };
  if (profile === 'cobbles') return { distance, finish: 'reduced-sprint', sectors: spread(6, distance * 0.55, distance - 18, (km, i) => (i % 2 ? pave(km, `Cobbled sector ${i + 1}`, 4 + Math.round(random() * 3)) : berg(km, names[i], 4 + Math.round(random() * 3)))) };
  if (profile === 'puncheur') return { distance, finish: 'uphill', finishClimb: names[7], sectors: spread(6, distance * 0.5, distance - 10, (km, i) => climb(km, names[i], 4 + Math.round(random() * 2 + i * 0.3), 1)) };
  if (profile === 'mountain') return { distance, finish: random() < 0.5 ? 'summit' : 'descent', finishClimb: names[7], sectors: spread(4, distance * 0.35, distance - 15, (km, i) => climb(km, names[i], 5 + Math.round(random() * 2 + i * 0.6), 8)) };
  return { distance, finish: random() < 0.6 ? 'reduced-sprint' : 'small-group', sectors: spread(5, distance * 0.45, distance - 15, (km, i) => climb(km, names[i], 3 + Math.round(random() * 2 + i * 0.3), 2)) };
}

export function routeForEvent(event, year) {
  const base = ROUTES[event.id] || genericRoute(event, year);
  const sectors = base.sectors.map((sector) => ({ ...sector })).sort((a, b) => a.km - b.km);
  if (['uphill', 'summit'].includes(base.finish)) sectors.push({ km: base.distance, name: base.finishClimb || 'Finishing climb', type: 'climb', difficulty: base.finish === 'summit' ? 8 : 6, length: base.finish === 'summit' ? 8 : 1, finish: true });
  return { distance: base.distance, finish: base.finish, circuit: Boolean(base.circuit), sectors };
}
