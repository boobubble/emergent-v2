import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

const GENERIC_ANCHORS = new Set([
  "click here", "read more", "learn more", "here", "this", "more",
  "this page", "this article", "click", "link",
]);

const targetSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().max(200).nullable().optional(),
  url: z.string().min(1).max(500),
  description: z.string().max(1000).nullable().optional(),
  keywords: z.array(z.string().max(80)).max(40).optional(),
  category: z.string().max(80).nullable().optional(),
  type: z.enum(["blog","tool","game","feed_page","poll","hashtag","community_page","help_page","announcement","seo_page"]),
  priority: z.number().int().min(1).max(10).optional(),
  is_cornerstone: z.boolean().optional(),
  is_active: z.boolean().optional(),
  source_table: z.string().max(80).nullable().optional(),
  source_id: z.string().uuid().nullable().optional(),
});

// ---------- LIST ----------
export const listLinkTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("internal_link_targets")
      .select("*")
      .order("is_cornerstone", { ascending: false })
      .order("priority", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- UPSERT ----------
export const upsertLinkTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      ...data,
      keywords: data.keywords ?? [],
      priority: data.priority ?? 5,
      is_cornerstone: data.is_cornerstone ?? false,
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from("internal_link_targets")
      .upsert(row, { onConflict: "url" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- DELETE ----------
export const deleteLinkTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("internal_link_targets")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- AUTO-SYNC TARGETS from existing content ----------
export const syncLinkTargets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rows: any[] = [];

    // a) Published custom pages -> seo_page or help_page
    const { data: pages } = await supabaseAdmin
      .from("custom_pages")
      .select("id, slug, title, excerpt, meta_description, meta_keywords, category, is_cornerstone, link_priority, status")
      .eq("status", "published")
      .limit(2000);
    for (const p of pages ?? []) {
      const type = (p.category === "help" ? "help_page" : "seo_page") as "help_page" | "seo_page";
      const kw = (p.meta_keywords ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
      rows.push({
        title: p.title || p.slug,
        slug: p.slug,
        url: `/p/${p.slug}`,
        description: p.excerpt || p.meta_description || null,
        keywords: kw,
        category: p.category,
        type,
        priority: p.link_priority ?? 5,
        is_cornerstone: !!p.is_cornerstone,
        is_active: true,
        source_table: "custom_pages",
        source_id: p.id,
      });
    }

    // b) Hashtags
    const { data: tags } = await supabaseAdmin
      .from("hashtags")
      .select("tag, usage_count")
      .order("usage_count", { ascending: false })
      .limit(200);
    for (const t of tags ?? []) {
      const tag = String(t.tag).toLowerCase();
      rows.push({
        title: `#${tag}`,
        slug: tag,
        url: `/hashtags/${tag}`,
        description: `Posts tagged #${tag}`,
        keywords: [tag, `#${tag}`],
        category: "hashtag",
        type: "hashtag" as const,
        priority: Math.min(10, 1 + Math.floor(Math.log2((t.usage_count ?? 1) + 1))),
        is_cornerstone: false,
        is_active: true,
        source_table: "hashtags",
        source_id: null,
      });
    }

    // c) Static feature pages
    const STATIC: { title: string; url: string; type: any; keywords: string[]; description: string }[] = [
      { title: "Chatrooms", url: "/chatroom", type: "community_page", keywords: ["chat", "chatroom", "rooms"], description: "Live community chatrooms" },
      { title: "Social Feed", url: "/feed", type: "feed_page", keywords: ["feed", "posts", "social"], description: "Community social feed" },
      { title: "Games", url: "/games", type: "game", keywords: ["games", "play", "mini games"], description: "Mini games and competitions" },
      { title: "Find Friends", url: "/find-friends", type: "community_page", keywords: ["friends", "online friends"], description: "Find people to chat with" },
      { title: "Confessions", url: "/confessions", type: "community_page", keywords: ["confessions", "anonymous"], description: "Anonymous community confessions" },
      { title: "Leaderboard", url: "/leaderboard", type: "community_page", keywords: ["leaderboard", "top users"], description: "Top users leaderboard" },
    ];
    for (const s of STATIC) {
      rows.push({ ...s, slug: s.url.replace(/^\//, ""), priority: 7, is_cornerstone: false, is_active: true, category: null, source_table: "static", source_id: null });
    }

    // Upsert all
    let inserted = 0;
    for (const r of rows) {
      const { error } = await supabaseAdmin
        .from("internal_link_targets")
        .upsert({ ...r, updated_at: new Date().toISOString() }, { onConflict: "url" });
      if (!error) inserted++;
    }
    return { ok: true, count: inserted, total: rows.length };
  });

// ---------- LIST LINKABLE PAGES (for bulk picker) ----------
export const listLinkablePages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("custom_pages")
      .select("id, slug, title, content, status")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title || p.slug,
      url: `/p/${p.slug}`,
      content: (p.content as string) ?? "",
    }));
  });

// ---------- SUGGEST LINKS (rule-based) ----------
function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ");
}

// Find natural anchor candidates in plain text. Returns matches per target.
function findMatches(text: string, target: { title: string; keywords: string[] }) {
  const candidates = new Set<string>();
  if (target.title) candidates.add(target.title);
  for (const k of target.keywords ?? []) if (k && k.length >= 3) candidates.add(k);

  const matches: { anchor: string; index: number }[] = [];
  for (const cand of candidates) {
    if (GENERIC_ANCHORS.has(cand.toLowerCase())) continue;
    const escaped = cand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ anchor: m[0], index: m.index });
    }
  }
  return matches;
}

// Roughly detect if a position falls inside a "forbidden" region:
// h1-h3, code, pre, blockquote, a, table, img. We work on raw HTML and
// flag offsets inside such tags. For markdown content, headings (lines
// starting with #) and code fences are also flagged.
function buildForbiddenRanges(html: string): [number, number][] {
  const ranges: [number, number][] = [];
  const re = /<(h1|h2|h3|code|pre|blockquote|a|table|img|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  // self-closing img/a-less variations
  const re2 = /<(img|br|hr)\b[^>]*\/?>/gi;
  while ((m = re2.exec(html)) !== null) ranges.push([m.index, m.index + m[0].length]);
  // markdown headings & fences
  const lines = html.split("\n");
  let offset = 0;
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      ranges.push([offset, offset + line.length + 1]);
      inFence = !inFence;
    } else if (inFence) {
      ranges.push([offset, offset + line.length + 1]);
    } else if (/^#{1,3}\s/.test(line)) {
      ranges.push([offset, offset + line.length + 1]);
    }
    offset += line.length + 1;
  }
  return ranges;
}

const inRanges = (idx: number, ranges: [number, number][]) =>
  ranges.some(([a, b]) => idx >= a && idx < b);

export const suggestLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      content: z.string().min(1).max(200_000),
      contentType: z.string().max(40).optional(),
      excludeUrl: z.string().max(500).optional(),
      maxSuggestions: z.number().int().min(1).max(50).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: targets, error } = await supabaseAdmin
      .from("internal_link_targets")
      .select("*")
      .eq("is_active", true)
      .limit(2000);
    if (error) throw new Error(error.message);

    const html = data.content;
    const plain = stripHtml(html);
    const forbidden = buildForbiddenRanges(html);

    type Sug = {
      target_id: string;
      target_url: string;
      title: string;
      type: string;
      anchor_text: string;
      context_snippet: string;
      relevance_score: number;
      reason: string;
      offset: number;
    };
    const suggestions: Sug[] = [];

    // Priority order weights
    const TYPE_WEIGHT: Record<string, number> = {
      seo_page: 10, blog: 8, tool: 7, game: 6, community_page: 6,
      poll: 5, hashtag: 4, help_page: 4, feed_page: 3, announcement: 2,
    };

    const perTargetCount: Record<string, number> = {};

    for (const t of targets ?? []) {
      if (data.excludeUrl && t.url === data.excludeUrl) continue;
      const matches = findMatches(plain, { title: t.title, keywords: t.keywords ?? [] });
      for (const m of matches) {
        if (GENERIC_ANCHORS.has(m.anchor.toLowerCase())) continue;
        // Map plain-text index back is approximate; use the html match instead
        const htmlIdx = html.toLowerCase().indexOf(m.anchor.toLowerCase());
        if (htmlIdx === -1 || inRanges(htmlIdx, forbidden)) continue;

        const start = Math.max(0, htmlIdx - 60);
        const end = Math.min(html.length, htmlIdx + m.anchor.length + 60);
        const snippet = stripHtml(html.slice(start, end)).replace(/\s+/g, " ").trim();

        const baseScore = (TYPE_WEIGHT[t.type] ?? 3) + (t.is_cornerstone ? 4 : 0) + (t.priority ?? 5) / 2;
        suggestions.push({
          target_id: t.id,
          target_url: t.url,
          title: t.title,
          type: t.type,
          anchor_text: m.anchor,
          context_snippet: snippet,
          relevance_score: Math.round(baseScore * 10) / 10,
          reason: t.is_cornerstone
            ? `Cornerstone ${t.type.replace("_", " ")} matched anchor "${m.anchor}"`
            : `Matched anchor "${m.anchor}" for ${t.type.replace("_", " ")}`,
          offset: htmlIdx,
        });
      }
    }

    // Sort by score desc
    suggestions.sort((a, b) => b.relevance_score - a.relevance_score);

    // Enforce limits: max 3 per target, dedupe overlapping anchors near each other
    const usedAnchors = new Set<string>();
    const filtered: Sug[] = [];
    for (const s of suggestions) {
      perTargetCount[s.target_id] = perTargetCount[s.target_id] ?? 0;
      if (perTargetCount[s.target_id] >= 3) continue;
      const dedupeKey = `${s.anchor_text.toLowerCase()}@${Math.floor(s.offset / 300)}`;
      if (usedAnchors.has(dedupeKey)) continue;
      usedAnchors.add(dedupeKey);
      perTargetCount[s.target_id]++;
      filtered.push(s);
      if (filtered.length >= (data.maxSuggestions ?? 30)) break;
    }

    return filtered.map(({ offset: _o, ...rest }) => rest);
  });

// ---------- APPLY APPROVED LINKS ----------
const applyItemSchema = z.object({
  target_url: z.string().min(1).max(500),
  anchor_text: z.string().min(1).max(120),
});

export const applyLinksToPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      pageId: z.string().uuid(),
      approved: z.array(applyItemSchema).min(1).max(50),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: page, error } = await supabaseAdmin
      .from("custom_pages")
      .select("id, content")
      .eq("id", data.pageId)
      .single();
    if (error || !page) throw new Error(error?.message ?? "Page not found");

    let content = page.content as string;
    const forbidden = buildForbiddenRanges(content);
    const appliedAnchors = new Set<string>();
    let applied = 0;

    for (const item of data.approved) {
      if (appliedAnchors.has(item.anchor_text.toLowerCase())) continue;
      const escaped = item.anchor_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      const match = re.exec(content);
      if (!match) continue;
      if (inRanges(match.index, forbidden)) continue;
      // Skip if anchor is already inside an existing <a>
      const before = content.slice(Math.max(0, match.index - 200), match.index);
      if (/<a\b[^>]*$/i.test(before)) continue;
      const link = `<a href="${item.target_url}" data-internal-link="1">${match[0]}</a>`;
      content = content.slice(0, match.index) + link + content.slice(match.index + match[0].length);
      appliedAnchors.add(item.anchor_text.toLowerCase());
      applied++;
    }

    const { error: upErr } = await supabaseAdmin
      .from("custom_pages")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", data.pageId);
    if (upErr) throw new Error(upErr.message);
    return { ok: true, applied };
  });

// ---------- ORPHANS ----------
export const getOrphanReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pages } = await supabaseAdmin
      .from("custom_pages")
      .select("id, slug, title, content, status")
      .eq("status", "published")
      .limit(1000);
    const { data: targets } = await supabaseAdmin
      .from("internal_link_targets")
      .select("url, title, type")
      .eq("is_active", true)
      .limit(2000);

    const incoming: Record<string, number> = {};
    const outgoing: Record<string, number> = {};
    for (const p of pages ?? []) {
      const out = (p.content as string).match(/href="(\/[^"]+)"/g) ?? [];
      outgoing[`/p/${p.slug}`] = out.length;
      for (const h of out) {
        const url = h.match(/href="([^"]+)"/)?.[1];
        if (url) incoming[url] = (incoming[url] ?? 0) + 1;
      }
    }

    const report = (targets ?? []).map((t) => ({
      url: t.url,
      title: t.title,
      type: t.type,
      incoming: incoming[t.url] ?? 0,
      outgoing: outgoing[t.url] ?? 0,
    }));
    return {
      orphans: report.filter((r) => r.incoming === 0).sort((a, b) => a.outgoing - b.outgoing),
      lowLinks: report.filter((r) => r.incoming > 0 && r.incoming < 3),
      total: report.length,
    };
  });

// ---------- ANALYTICS ----------
export const getLinkAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data: clicks } = await supabaseAdmin
      .from("internal_link_clicks")
      .select("target_url, anchor_text, created_at")
      .gte("created_at", since)
      .limit(20000);

    const byUrl: Record<string, number> = {};
    const byAnchor: Record<string, number> = {};
    for (const c of clicks ?? []) {
      byUrl[c.target_url] = (byUrl[c.target_url] ?? 0) + 1;
      if (c.anchor_text) byAnchor[c.anchor_text] = (byAnchor[c.anchor_text] ?? 0) + 1;
    }
    const top = (obj: Record<string, number>) =>
      Object.entries(obj).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count).slice(0, 20);

    return {
      totalClicks: clicks?.length ?? 0,
      windowDays: 30,
      topUrls: top(byUrl),
      topAnchors: top(byAnchor),
    };
  });

// ---------- PUBLIC click tracking ----------
export const trackLinkClick = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      target_url: z.string().min(1).max(500),
      source_url: z.string().max(500).optional(),
      anchor_text: z.string().max(200).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("internal_link_targets")
      .select("id")
      .eq("url", data.target_url)
      .maybeSingle();
    await supabaseAdmin.from("internal_link_clicks").insert({
      target_id: target?.id ?? null,
      target_url: data.target_url,
      source_url: data.source_url ?? null,
      anchor_text: data.anchor_text ?? null,
    });
    return { ok: true };
  });
