function injectHeadingIds(html) {
  if (!html) return html;
  const used = /* @__PURE__ */ new Set();
  return html.replace(/<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    const attrStr = attrs || "";
    const existingId = /\sid\s*=\s*["']([^"']+)["']/i.exec(attrStr);
    if (existingId) {
      used.add(existingId[1]);
      return full;
    }
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    if (!text) return full;
    const base = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "section";
    let id = base, n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return `<${tag}${attrStr} id="${id}">${inner}</${tag}>`;
  });
}
export {
  injectHeadingIds as i
};
