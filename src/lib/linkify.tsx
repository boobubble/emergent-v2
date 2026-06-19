import type { ReactNode } from "react";

// Only http(s) URLs are linkified. `www.` is auto-prefixed to https://.
// Anything else (javascript:, data:, file:, vbscript:, etc.) is rendered as plain text.
const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/gi;

/** Return a safe http(s) URL string, or null if the candidate is unsafe. */
function safeHref(raw: string): string | null {
  let candidate = raw.trim();
  if (!candidate) return null;
  // Strip leading control chars / zero-width that could mask the scheme
  candidate = candidate.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F]/g, "");
  if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
  // Quick scheme allowlist before we hand to URL()
  if (!/^https?:\/\//i.test(candidate)) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Convert URLs in a string to clickable anchors that open in a new tab.
 * Dangerous protocols (javascript:, data:, vbscript:, file:, etc.) are
 * never made clickable — they fall through as plain text.
 */
export function linkify(text: string, keyPrefix = "l"): ReactNode[] {
  if (!text) return [];
  const out: ReactNode[] = [];
  let lastIdx = 0;
  let i = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    const raw = m[0];
    const href = safeHref(raw);
    if (start > lastIdx) out.push(text.slice(lastIdx, start));
    if (href) {
      out.push(
        <a
          key={`${keyPrefix}-${i++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow ugc external"
          className="underline underline-offset-2 decoration-current/60 hover:decoration-current font-medium break-all [color:inherit]"
        >
          {raw}
        </a>
      );
    } else {
      // Unsafe scheme — render as plain text so it can't be clicked.
      out.push(raw);
    }
    lastIdx = start + raw.length;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out;
}
