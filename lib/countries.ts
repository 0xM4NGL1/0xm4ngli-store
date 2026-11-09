const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

let cached: { code: string; name: string }[] | null = null;

/**
 * Build a complete ISO-3166-like country list without shipping a huge static
 * file. `Intl.DisplayNames` returns the code itself for unknown territories, so
 * those are skipped. Operators can narrow destinations in fulfilment.
 */
export function getCountries() {
  if (cached) return cached;
  const countries: { code: string; name: string }[] = [];

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = regionNames.of(code);
      if (name && name !== code) {
        countries.push({ code, name });
      }
    }
  }

  countries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  cached = countries;
  return countries;
}
