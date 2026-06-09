// Tiny country helper — ISO 3166-1 alpha-2 code → flag emoji.
// No external data, no fonts: builds the flag from regional-indicator code points.
export function flagFromCode(code: string | null | undefined): string {
  if (!code) return "";
  const c = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x1f1e6 - 65;
  return String.fromCodePoint(c.charCodeAt(0) + A, c.charCodeAt(1) + A);
}

/** Best-effort detect country code from browser locale (e.g. "en-US" -> "US"). */
export function detectCountryCode(): string {
  try {
    const langs = [navigator.language, ...(navigator.languages || [])];
    for (const l of langs) {
      const m = /-([A-Za-z]{2})\b/.exec(l || "");
      if (m) return m[1].toUpperCase();
    }
  } catch { /* ignore */ }
  return "";
}

// Compact short list — covers ~95% of users; the picker still accepts any 2-letter ISO code.
export const COUNTRY_OPTIONS: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Turkey" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "NZ", name: "New Zealand" },
];
