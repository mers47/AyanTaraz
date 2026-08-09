export function normalizeIranPhone(value: unknown): string {
  if (typeof value !== 'string') return '';

  let phone = value
    .trim()
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[\s\-().]/g, '');

  if (phone.startsWith('00')) {
    phone = '+' + phone.slice(2);
  }

  if (phone.startsWith('98')) {
    phone = '+' + phone;
  }

  if (phone.startsWith('09') && phone.length === 11) {
    phone = '+98' + phone.slice(1);
  }

  return phone;
}
