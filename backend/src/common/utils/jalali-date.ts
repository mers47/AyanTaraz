/**
 * Jalali (Persian) ↔ Gregorian date conversion utilities.
 *
 * Used by the consultation module so that Persian date strings sent from the
 * frontend (e.g. "۱۴۰۵/۰۳/۱۵") are stored as real Gregorian Date objects in the
 * database, instead of the previous `new Date()` (now) simulation.
 *
 * The conversion algorithm is the Borkowski astronomical Jalali calendar
 * conversion (identical to the one used by jalaali-js).
 */

// Convert Persian (East-Arabic) and Arabic-Indic digits to ASCII digits.
function normalizeDigits(s: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  let out = '';
  for (const ch of s) {
    const pi = persian.indexOf(ch);
    if (pi >= 0) { out += String(pi); continue; }
    const ai = arabic.indexOf(ch);
    if (ai >= 0) { out += String(ai); continue; }
    out += ch;
  }
  return out;
}

// Integer division — truncates toward zero.
function div(a: number, b: number): number {
  return ~~(a / b);
}

// Mathematical modulo — non-negative result when b > 0.
function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

// Jalaali years that begin a new 33-year leap cycle (Borkowski algorithm).
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178,
];

interface JalCalResult {
  gy: number; // Gregorian year of Farvardin 1
  march: number; // Gregorian day of month (March) of Farvardin 1
}

// Compute the Gregorian date of Farvardin 1 for a given Jalaali year.
function jalCalShort(jy: number): JalCalResult {
  const gy = jy + 621;
  let leapJ = -14;
  let jp = BREAKS[0];
  let jump = 0;
  for (let i = 1; i < BREAKS.length; i += 1) {
    const jm = BREAKS[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  return { gy, march };
}

// Convert a Gregorian date to a Julian Day number.
function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

// Convert a Julian Day number to a Gregorian date.
function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

// Convert a Jalaali date to a Julian Day number.
function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCalShort(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

// Convert a Jalaali date to a Gregorian date.
function toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  return d2g(j2d(jy, jm, jd));
}

export interface JalaliDate {
  jy: number; // Jalaali year
  jm: number; // Jalaali month (1-12)
  jd: number; // Jalaali day (1-31)
}

/**
 * Parse a Persian/Jalaali date string (with optional Persian digits) like
 * "1405/03/15" or "۱۴۰۵/۰۳/۱۵" and return a JavaScript Date (local midnight).
 * Returns null if the string cannot be parsed.
 */
export function parseJalaliDate(input: string): Date | null {
  if (!input || typeof input !== 'string') return null;
  const norm = normalizeDigits(input.trim()).replace(/[\u061b\u200c\u200f]/g, '');
  const m = norm.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (!m) return null;
  const jy = parseInt(m[1], 10);
  const jm = parseInt(m[2], 10);
  const jd = parseInt(m[3], 10);
  if (!jy || !jm || !jd) return null;
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
  const g = toGregorian(jy, jm, jd);
  // Local midnight of the Gregorian date.
  return new Date(g.gy, g.gm - 1, g.gd, 0, 0, 0, 0);
}

/**
 * Combine a Jalaali date string and a time string (e.g. "10:00", "14:30") into a
 * single JavaScript Date. Returns null if the date can't be parsed; falls back
 * to 09:00 if the time string is invalid.
 */
export function parseJalaliDateTime(dateInput: string, timeInput: string): Date | null {
  const base = parseJalaliDate(dateInput);
  if (!base) return null;
  const t = normalizeDigits((timeInput || '').trim());
  const m = t.match(/(\d{1,2}):(\d{2})/);
  let hours = 9;
  let minutes = 0;
  if (m) {
    hours = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    minutes = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  }
  base.setHours(hours, minutes, 0, 0);
  return base;
}
