import { s as src_default } from "../_libs/isomorphic-dompurify.mjs";
function esc(s) {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function exportAs(format, pages) {
  if (format === "json") {
    return { name: "pages.json", mime: "application/json", body: JSON.stringify(pages, null, 2) };
  }
  if (format === "xml") {
    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<pages>`,
      ...pages.map((p) => [
        `  <page>`,
        `    <slug>${esc(p.slug)}</slug>`,
        `    <title>${esc(p.title)}</title>`,
        `    <layout>${esc(p.layout ?? "boxed")}</layout>`,
        `    <status>${esc(p.status ?? "draft")}</status>`,
        `    <meta_description>${esc(p.meta_description ?? "")}</meta_description>`,
        `    <content><![CDATA[${p.content ?? ""}]]></content>`,
        `  </page>`
      ].join("\n")),
      `</pages>`
    ].join("\n");
    return { name: "pages.xml", mime: "application/xml", body: xml };
  }
  if (format === "html") {
    const html = pages.map((p) => `<!-- slug: ${esc(p.slug)} -->
<article>
<h1>${esc(p.title)}</h1>
${p.content}
</article>`).join("\n\n<hr/>\n\n");
    return { name: "pages.html", mime: "text/html", body: html };
  }
  if (format === "md") {
    const md = pages.map((p) => {
      const fm = [
        `---`,
        `slug: ${p.slug}`,
        `title: ${JSON.stringify(p.title)}`,
        p.layout ? `layout: ${p.layout}` : null,
        p.tags?.length ? `tags: [${p.tags.map((t) => JSON.stringify(t)).join(", ")}]` : null,
        `status: ${p.status ?? "draft"}`,
        `---`
      ].filter(Boolean).join("\n");
      const body = htmlToMarkdown(p.content ?? "");
      return `${fm}

# ${p.title}

${body}`;
    }).join("\n\n---\n\n");
    return { name: "pages.md", mime: "text/markdown", body: md };
  }
  const txt = pages.map((p) => `=== ${p.title} (${p.slug}) ===
${stripTags(p.content ?? "")}`).join("\n\n");
  return { name: "pages.txt", mime: "text/plain", body: txt };
}
function parseImport(format, raw) {
  if (format === "json") {
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed : [parsed]).map(normalize);
  }
  if (format === "xml") {
    const pages = [];
    const blocks = raw.match(/<page>[\s\S]*?<\/page>/g) ?? [];
    for (const b of blocks) {
      pages.push(normalize({
        slug: pick(b, "slug"),
        title: pick(b, "title"),
        layout: pick(b, "layout") || "boxed",
        status: pick(b, "status") || "draft",
        meta_description: pick(b, "meta_description") || null,
        content: pickCdata(b, "content") || ""
      }));
    }
    return pages;
  }
  if (format === "md") {
    return raw.split(/\n---\n/).map((chunk) => {
      const fm = chunk.match(/^---\n([\s\S]*?)\n---/);
      const meta = {};
      if (fm) {
        for (const line of fm[1].split("\n")) {
          const m = line.match(/^(\w+):\s*(.*)$/);
          if (m) meta[m[1]] = m[2].trim();
        }
      }
      const body = chunk.replace(/^---\n[\s\S]*?\n---\n*/, "");
      return normalize({
        slug: meta.slug || "page",
        title: (meta.title || "Page").replace(/^"|"$/g, ""),
        layout: meta.layout || "boxed",
        status: meta.status || "draft",
        content: markdownToHtml(body)
      });
    }).filter((p) => p.title && p.slug);
  }
  if (format === "html") {
    const articles = raw.split(/<hr\s*\/?>/i);
    return articles.map((html, i) => {
      const slugMatch = html.match(/<!--\s*slug:\s*([^\s]+)\s*-->/);
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      return normalize({
        slug: slugMatch?.[1] ?? `imported-${i + 1}`,
        title: stripTags(titleMatch?.[1] ?? `Imported ${i + 1}`),
        content: html.replace(/<!--\s*slug:[^>]*-->/g, "").trim()
      });
    }).filter((p) => p.content);
  }
  return raw.split(/\n=== /).map((chunk, i) => {
    const m = chunk.match(/^(.*?)\s*\(([^)]+)\)\s*===\n([\s\S]*)$/) ?? chunk.match(/^===\s*(.*?)\s*\(([^)]+)\)\s*===\n([\s\S]*)$/);
    if (m) return normalize({ slug: m[2], title: m[1], content: `<p>${esc(m[3]).replace(/\n+/g, "</p><p>")}</p>` });
    return normalize({ slug: `imported-${i + 1}`, title: `Imported ${i + 1}`, content: `<p>${esc(chunk)}</p>` });
  }).filter((p) => p.title);
}
function normalize(p) {
  return {
    slug: String(p.slug ?? "page"),
    title: String(p.title ?? "Untitled"),
    content: String(p.content ?? ""),
    excerpt: p.excerpt ?? null,
    layout: p.layout ?? "boxed",
    sidebar_left: p.sidebar_left ?? "none",
    sidebar_right: p.sidebar_right ?? "none",
    tags: Array.isArray(p.tags) ? p.tags.slice(0, 20).map(String) : [],
    status: p.status === "published" ? "published" : "draft",
    featured: !!p.featured,
    meta_title: p.meta_title ?? null,
    meta_description: p.meta_description ?? null,
    meta_keywords: p.meta_keywords ?? null,
    og_title: p.og_title ?? null,
    og_description: p.og_description ?? null,
    og_image: p.og_image ?? null,
    canonical_url: p.canonical_url ?? null,
    noindex: !!p.noindex,
    nofollow: !!p.nofollow
  };
}
function pick(src, tag) {
  const m = src.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}
function pickCdata(src, tag) {
  const m = src.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  return m ? m[1] : pick(src, tag);
}
function stripTags(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim();
}
function htmlToMarkdown(html) {
  return html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n").replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n").replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n").replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*").replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)").replace(/<img [^>]*src="([^"]+)"[^>]*\/?>/gi, "![]($1)").replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n").replace(/<\/?(ul|ol)[^>]*>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n\n").replace(/<\/?p[^>]*>/gi, "").replace(/<[^>]+>/g, "").trim();
}
function markdownToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  let inList = false;
  for (const ln of lines) {
    const h = ln.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h${h[1].length}>${esc(h[2])}</h${h[1].length}>`);
      continue;
    }
    if (/^-\s+/.test(ln)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMd(ln.replace(/^-\s+/, ""))}</li>`);
      continue;
    }
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
    if (ln.trim()) out.push(`<p>${inlineMd(ln)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}
function inlineMd(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}
function downloadFile(name, mime, body) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function detectFormatFromName(name) {
  const n = name.toLowerCase();
  if (n.endsWith(".json")) return "json";
  if (n.endsWith(".xml")) return "xml";
  if (n.endsWith(".html") || n.endsWith(".htm")) return "html";
  if (n.endsWith(".md") || n.endsWith(".markdown")) return "md";
  return "txt";
}
function sanitizeHtml(html) {
  return src_default.sanitize(html ?? "", { USE_PROFILES: { html: true } });
}
export {
  detectFormatFromName as a,
  downloadFile as d,
  exportAs as e,
  parseImport as p,
  sanitizeHtml as s
};
