export const formatPrice = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);

export const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value)) : '—';

export const formatPeriod = (period) => {
  const [y, m] = period.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
};

export const ageRange = (book) => `Ages ${book.ageMin}–${book.ageMax}`;
