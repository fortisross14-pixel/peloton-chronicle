export function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < String(value).length; index += 1) {
    hash ^= String(value).charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function randInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

export function weightedPick(random, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = random() * total;
  for (const entry of entries) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.value;
  }
  return entries.at(-1)?.value;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function shuffle(random, input) {
  const values = [...input];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0));
}

export function titleCase(value) {
  return String(value).replace(/(^|[-_\s])\w/g, (match) => match.toUpperCase()).replaceAll('_', ' ');
}

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function countryFlag(code) {
  const map = {
    BEL:'BE', BRN:'BH', FRA:'FR', USA:'US', GBR:'GB', GER:'DE', ESP:'ES', SUI:'CH', AUS:'AU', NED:'NL', UAE:'AE', NOR:'NO', KAZ:'KZ', ITA:'IT', HUN:'HU',
    JPN:'JP', KOR:'KR', CHN:'CN', MAS:'MY', RSA:'ZA', RWA:'RW', ERI:'ER', MAR:'MA', KEN:'KE', NZL:'NZ', COL:'CO', CAN:'CA', MEX:'MX', ECU:'EC',
    DEN:'DK', POR:'PT', SLO:'SI', POL:'PL', CZE:'CZ', AUT:'AT', CRO:'HR', ROU:'RO', IRL:'IE', SWE:'SE', FIN:'FI', LUX:'LU', SVK:'SK', LTU:'LT', EST:'EE',
    GRE:'GR', TUR:'TR', ISR:'IL', ARG:'AR', BRA:'BR', CHI:'CL', VEN:'VE', URU:'UY', UKR:'UA'
  };
  const raw = String(code || '').toUpperCase();
  const normalized = map[raw] || raw;
  if (!/^[A-Z]{2}$/.test(normalized)) return '<span class="flag-badge unknown" title="Unknown nation">🌐</span>';
  const base = import.meta.env?.BASE_URL || './';
  return `<span class="flag-badge" title="${raw}"><img src="${base}flags/${normalized.toLowerCase()}.png" alt="${raw} flag" loading="lazy"><small>${raw}</small></span>`;
}

export function uniqueId(prefix, random) {
  return `${prefix}-${Math.floor(random() * 1e9).toString(36)}`;
}
