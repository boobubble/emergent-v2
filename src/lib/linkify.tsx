import type { ReactNode } from "react";

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,;:!?'"])/gi;

/**
 * Convert URLs found in a string into clickable anchors that open in a new tab.
 * Other text is returned as plain strings, suitable for embedding inside any
 * parent element (already-styled <span>, <div>, etc.).
 */
export function linkify(text: string, keyPrefix = "l"): ReactNode[] {
  if (!text) return [];
  const out: ReactNode[] = [];
  let lastIdx = 0;
  let i = 0;
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0;
    if (start > lastIdx) out.push(text.slice(lastIdx, start));
    const raw = m[0];
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    out.push(
      <a
        key={`${keyPrefix}-${i++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer ugc"
        className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary break-all"
      >
        {raw}
      </a>
    );
    lastIdx = start + raw.length;
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx));
  return out;
}
