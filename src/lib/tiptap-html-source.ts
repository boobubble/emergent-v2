export type HtmlSourceApplyResult = { ok: true } | { ok: false; error: string };

export type HtmlSourceEditor = {
  commands: {
    setContent: (content: string, options?: { emitUpdate?: boolean }) => boolean;
  };
};

const PARSE_ERROR =
  "That HTML could not be parsed. Fix it before switching back to the visual editor.";
const APPLY_ERROR =
  "The editor could not load that HTML. Fix it before switching back to the visual editor.";

/** Reject obviously broken markup before TipTap setContent. */
export function parseHtmlSource(html: string): { ok: true; html: string } | { ok: false; error: string } {
  const trimmed = html.replace(/^\uFEFF/, "");
  if (typeof DOMParser === "undefined") return { ok: true, html: trimmed };
  try {
    const doc = new DOMParser().parseFromString(trimmed, "text/html");
    if (doc.querySelector("parsererror")) return { ok: false, error: PARSE_ERROR };
    return { ok: true, html: trimmed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error && err.message ? err.message : PARSE_ERROR,
    };
  }
}

export function applyHtmlSource(
  editor: HtmlSourceEditor | null,
  html: string,
): HtmlSourceApplyResult {
  const parsed = parseHtmlSource(html);
  if (!parsed.ok) return parsed;
  if (!editor) return { ok: false, error: "Editor is not ready." };
  try {
    const applied = editor.commands.setContent(parsed.html.trim() ? parsed.html : "<p></p>", {
      emitUpdate: true,
    });
    if (applied === false) return { ok: false, error: APPLY_ERROR };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error && err.message ? err.message : APPLY_ERROR,
    };
  }
}
