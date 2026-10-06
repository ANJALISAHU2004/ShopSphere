const PRICE_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

/** Formats a server-provided price as Indian rupees. */
export function formatPrice(value) {
  return PRICE_FORMATTER.format(value);
}

/** Formats an ISO timestamp as a local date without adding a timezone. */
export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
