export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Short relative time for activity feeds, e.g. "5m ago", "3h ago", "2d ago". */
export function formatRelativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];

  let value_ = seconds;
  for (const [amount, unit] of units) {
    if (value_ < amount) {
      return `${Math.floor(value_)}${unit} ago`;
    }
    value_ = value_ / amount;
  }
  return date.toLocaleDateString();
}
