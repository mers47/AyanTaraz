import { parseJalaliDate, parseJalaliDateTime } from '../src/common/utils/jalali-date';

describe('jalali-date', () => {
  it('parses ASCII Jalaali dates', () => {
    const d = parseJalaliDate('1405/03/15');
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(5); // June (0-based)
    expect(d!.getDate()).toBe(5);
  });

  it('parses Persian-digit Jalaali dates', () => {
    const d = parseJalaliDate('۱۴۰۵/۰۳/۱۵');
    expect(d).not.toBeNull();
    expect(d!.getTime()).toBe(parseJalaliDate('1405/03/15')!.getTime());
  });

  it('parses date + time with Arabic/Persian digits', () => {
    const dt = parseJalaliDateTime('1405/03/15', '10:00');
    expect(dt).not.toBeNull();
    expect(dt!.getHours()).toBe(10);
    expect(dt!.getMinutes()).toBe(0);

    const dtP = parseJalaliDateTime('۱۴۰۵/۰۳/۱۵', '۱۰:۰۰');
    expect(dtP).not.toBeNull();
    expect(dtP!.getHours()).toBe(10);
  });

  it('rejects invalid input', () => {
    expect(parseJalaliDate('not-a-date')).toBeNull();
    expect(parseJalaliDate('')).toBeNull();
    expect(parseJalaliDateTime('bad', '10:00')).toBeNull();
  });
});
