export function formatPrice(cents: number, currency = "EUR", locale = "en-IE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
  locale = "en-IE",
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale = "en-IE") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function percent(value: number, fractionDigits = 0) {
  return new Intl.NumberFormat("en-IE", {
    style: "percent",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function classNames(
  ...values: Array<string | false | null | undefined>
) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1).trimEnd()}…`;
}

export function formatShippingAddress(
  shipping: Record<string, unknown> | null,
): string[] {
  if (!shipping) return [];
  const name = typeof shipping.name === "string" ? shipping.name : "";
  const address =
    shipping.address && typeof shipping.address === "object"
      ? (shipping.address as Record<string, unknown>)
      : {};
  const value = (key: string) =>
    typeof address[key] === "string" ? (address[key] as string) : "";
  const line1 = value("line1");
  const line2 = value("line2");
  const city = [value("postal_code"), value("city")].filter(Boolean).join(" ");
  const region = value("state");
  const country = value("country");
  return [name, line1, line2, city, region, country].filter(Boolean);
}
