/**
 * Blog-only HTML sanitizer. Independent of CMS page sanitizer so alignment
 * classes and image attrs can be allow-listed without opening Custom Pages XSS.
 */

const VOID_OK = new Set(["br", "hr", "img"]);

const ALLOWED = new Set([
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "a",
  "br",
  "hr",
  "pre",
  "code",
  "img",
]);

const ATTR_OK = new Set([
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "class",
  "loading",
  "decoding",
  "data-align",
  "data-decorative",
  "data-optimized",
  "data-bytes",
]);

const ALLOWED_CLASSES = new Set([
  "yz-blog-img",
  "yz-blog-img-left",
  "yz-blog-img-center",
  "yz-blog-img-right",
]);

const ALIGN_OK = new Set(["left", "center", "right"]);

export function isSafeBlogUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^\s*javascript:/i.test(v) || /^\s*data:/i.test(v) || /^\s*vbscript:/i.test(v)) return false;
  if (v.startsWith("/") || v.startsWith("./") || v.startsWith("../")) return true;
  if (/^https?:\/\//i.test(v)) return true;
  return false;
}

function filterClasses(value: string): string {
  return value
    .split(/\s+/)
    .filter((cls) => cls && ALLOWED_CLASSES.has(cls))
    .join(" ");
}

function escAttr(value: string): string {
  return String(value).replace(/"/g, "&quot;");
}

function sanitizeOpenTag(tag: string, rawAttrs: string): string {
  const name = tag.toLowerCase() === "h1" ? "h2" : tag.toLowerCase();
  if (!ALLOWED.has(name)) return "";
  const attrs: string[] = [];
  let src = "";
  let align = "";
  const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawAttrs))) {
    const attr = m[1].toLowerCase();
    if (attr.startsWith("on") || attr === "style") continue;
    if (!ATTR_OK.has(attr)) continue;
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    if ((attr === "href" || attr === "src") && !isSafeBlogUrl(value)) continue;
    if (attr === "class") {
      const filtered = filterClasses(value);
      if (!filtered) continue;
      attrs.push(`class="${escAttr(filtered)}"`);
      continue;
    }
    if (attr === "data-align") {
      if (!ALIGN_OK.has(value)) continue;
      align = value;
      attrs.push(`data-align="${value}"`);
      continue;
    }
    if (attr === "data-decorative") {
      if (value !== "true") continue;
      attrs.push('data-decorative="true"');
      continue;
    }
    if (attr === "data-optimized") {
      if (value !== "true" && value !== "unavailable") continue;
      attrs.push(`data-optimized="${value}"`);
      continue;
    }
    if (attr === "data-bytes") {
      if (!/^\d{1,12}$/.test(value)) continue;
      attrs.push(`data-bytes="${value}"`);
      continue;
    }
    if (attr === "width" || attr === "height") {
      if (!/^\d{1,4}$/.test(value)) continue;
      attrs.push(`${attr}="${value}"`);
      continue;
    }
    if (attr === "loading") {
      if (value !== "lazy" && value !== "eager") continue;
      attrs.push(`loading="${value}"`);
      continue;
    }
    if (attr === "decoding") {
      if (value !== "async" && value !== "auto" && value !== "sync") continue;
      attrs.push(`decoding="${value}"`);
      continue;
    }
    if (attr === "src") src = value;
    attrs.push(`${attr}="${escAttr(value)}"`);
  }

  if (name === "img") {
    if (!src) return "";
    const classAttr = attrs.find((a) => a.startsWith("class="));
    if (!align) {
      if (classAttr?.includes("yz-blog-img-left")) align = "left";
      else if (classAttr?.includes("yz-blog-img-right")) align = "right";
      else align = "center";
    }
    if (!attrs.some((a) => a.startsWith("data-align="))) {
      attrs.push(`data-align="${align}"`);
    }
    const wanted = `yz-blog-img yz-blog-img-${align}`;
    const classIdx = attrs.findIndex((a) => a.startsWith("class="));
    if (classIdx >= 0) attrs[classIdx] = `class="${wanted}"`;
    else attrs.push(`class="${wanted}"`);
    if (!attrs.some((a) => a.startsWith("alt="))) attrs.push('alt=""');
    if (!attrs.some((a) => a.startsWith("decoding="))) attrs.push('decoding="async"');
  }

  if (name === "a" && attrs.some((a) => a.startsWith('target="_blank"'))) {
    if (!attrs.some((a) => a.startsWith("rel="))) {
      attrs.push('rel="noopener noreferrer"');
    }
  }
  const attrStr = attrs.length ? ` ${attrs.join(" ")}` : "";
  if (VOID_OK.has(name)) return `<${name}${attrStr}>`;
  return `<${name}${attrStr}>`;
}

function applyImageLoading(html: string): string {
  let index = 0;
  return html.replace(/<img\b([^>]*)>/gi, (_full, rawAttrs: string) => {
    const first = index++ === 0;
    const loading = first ? "eager" : "lazy";
    let attrs = String(rawAttrs);
    if (/\sloading=/i.test(attrs)) {
      attrs = attrs.replace(/\sloading=("[^"]*"|'[^']*'|[^\s>]+)/i, ` loading="${loading}"`);
    } else {
      attrs += ` loading="${loading}"`;
    }
    return `<img${attrs}>`;
  });
}

/** Strip unsafe markup. Body h1 is demoted to h2 so the article title stays the only H1. */
export function sanitizeBlogHtml(html: string): string {
  let out = html ?? "";
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g, (full, tag: string, attrs: string) => {
    const rawName = tag.toLowerCase();
    const name = rawName === "h1" ? "h2" : rawName;
    const closing = full.trimStart().startsWith("</");
    if (closing) {
      if (name === "h1") return "</h2>";
      return ALLOWED.has(name) && !VOID_OK.has(name) ? `</${name}>` : "";
    }
    const selfClosing = /\/>\s*$/.test(full);
    const open = sanitizeOpenTag(rawName, attrs || "");
    if (!open) return "";
    if (selfClosing && !VOID_OK.has(name) && name !== "h2") {
      return `${open}</${name}>`;
    }
    return open;
  });
  return applyImageLoading(out);
}

export function blogHtmlHasBodyH1(html: string): boolean {
  return /<h1\b/i.test(html);
}
