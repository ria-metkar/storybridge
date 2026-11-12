export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function addOneMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

/** Returns the billing/shipping period for a date as "YYYY-MM". */
export function periodOf(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Mongo filter matching books in a language pair, in either order. */
export function languagePairFilter({ primary, secondary }) {
  return {
    $or: [
      { 'languages.primary': primary, 'languages.secondary': secondary },
      { 'languages.primary': secondary, 'languages.secondary': primary },
    ],
  };
}
