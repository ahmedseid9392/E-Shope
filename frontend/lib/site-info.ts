/**
 * Single source of truth for the store's public contact details, so the
 * footer, /contact and /about pages never drift out of sync. Placeholder
 * values — replace with the real business details before launch.
 */
export const SITE_INFO = {
  legalName: "E-Shope",
  email: "eshope4321@gmail.com",
  phone: "+251 944519392",
  address: {
    line: "Bole Road, Friendship Building, 4th Floor",
    city: "Addis Ababa",
    country: "Ethiopia",
  },
  hours: "Mon–Sat, 9:00 AM – 6:00 PM (EAT)",
};

/** A Google Maps search link needs no API key and works for any address. */
export function mapsDirectionsUrl(): string {
  const query = `${SITE_INFO.address.line}, ${SITE_INFO.address.city}, ${SITE_INFO.address.country}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
