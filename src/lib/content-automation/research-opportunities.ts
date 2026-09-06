import { detectCannibalization, normalizeKeyword, type InventoryKeywordRow } from "@/lib/content-automation/cannibalization";
import { inferSection, pageSlugFromName } from "@/lib/content-automation/parse-bulk-ideas";
import type { ParsedResearchCluster, ParsedResearchKeyword, ResearchSource } from "@/lib/content-automation/parse-research-paste";
import { inferIntentFromText } from "@/lib/content-automation/keyword-targets";
import type { SearchIntent } from "@/lib/content-automation/seo-types";

export type OpportunityAction = "new_content" | "merge_existing" | "use_as_secondary" | "skip_cannibalization";

export type ContentOpportunity = {
  contentType: "blog" | "page";
  proposedTitle: string;
  slug: string | null;
  section: string | null;
  categorySlug: string | null;
  baseName: string | null;
  lookupCountryHint: string | null;
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  cluster: string | null;
  searchIntent: SearchIntent;
  sources: ResearchSource[];
  searchVolume: number | null;
  seoDifficulty: number | null;
  cpc: number | null;
  action: OpportunityAction;
  cannibalizationStatus: string;
  existingUrl: string | null;
  existingTitle: string | null;
  existingIdeaId: number | null;
  existingIdeaType: "blog" | "page" | null;
  priority: number;
  relatedUrls: string[];
};

export type PendingIdeaRef = {
  id: number;
  type: "blog" | "page";
  identifier: string;
  title: string;
  keywords: string | null;
  status: "pending" | "published";
};

export type ResearchSavePlan = {
  createIdeas: ContentOpportunity[];
  appendToPending: Array<{ id: number; type: "blog" | "page"; keywords: string }>;
  assignKeywords: Array<{ keyword: string; url: string | null; status: "assigned" | "conflict" | "pending" }>;
  skipCount: number;
  newCount: number;
  mergeCount: number;
};

const COUNTRY_HINTS: Array<[RegExp, string]> = [
  [/\b(india|indian|hindi|delhi|mumbai|jaipur|chennai|bangalore|hyderabad|kolkata|pune)\b/i, "India"],
  [/\b(pakistan|pakistani|urdu|lahore|karachi|islamabad|rawalpindi|peshawar|quetta)\b/i, "Pakistan"],
  [/\b(usa|united states|american|new york|los angeles|chicago)\b/i, "United States"],
  [/\b(uk|united kingdom|british|london|manchester)\b/i, "United Kingdom"],
];

function countryFromText(text: string): string | null {
  for (const [re, name] of COUNTRY_HINTS) if (re.test(text)) return name;
  return null;
}

function yaarzoRelevance(text: string): number {
  const t = text.toLowerCase();
  let score = 0;
  if (/\bchat(rooms?)?\b/.test(t)) score += 18;
  if (/\b(friend|community|social|meet)\b/.test(t)) score += 10;
  if (/\b(dating|girls?|teen|poetry|sha(y|i)ari)\b/.test(t)) score += 8;
  if (/\b(india|pakistan|city|country|language)\b/.test(t)) score += 6;
  return score;
}

export function inferOpportunityType(primary: string, intent: SearchIntent): "blog" | "page" {
  const t = primary.toLowerCase();
  if (/\b(how to|what is|why|tips|guide|ways to)\b/.test(t) || intent === "informational") {
    if (!/\bchat rooms?\b/.test(t)) return "blog";
  }
  if (/\bchat rooms?\b/.test(t) || countryFromText(t)) return "page";
  return intent === "informational" ? "blog" : "page";
}

export function scoreOpportunity(input: {
  volume: number | null;
  primary: string;
  intent: SearchIntent;
  action: OpportunityAction;
  longTailCount: number;
}): number {
  let score = 20 + yaarzoRelevance(input.primary);
  if (typeof input.volume === "number") score += Math.min(40, Math.round(Math.log10(input.volume + 1) * 12));
  if (input.intent === "local") score += 8;
  if (input.intent === "informational") score += 4;
  score += Math.min(10, input.longTailCount * 2);
  if (input.action === "skip_cannibalization") score -= 35;
  if (input.action === "merge_existing") score -= 12;
  if (input.action === "use_as_secondary") score -= 8;
  if (input.action === "new_content") score += 10;
  return Math.max(0, Math.min(100, score));
}

function matchExisting(
  primary: string,
  inventory: InventoryKeywordRow[],
  pending: PendingIdeaRef[],
): { inventory?: InventoryKeywordRow; pending?: PendingIdeaRef; similarity: number } {
  const key = normalizeKeyword(primary);
  const pendingHit = pending.find((p) => {
    const hay = `${p.title} ${p.identifier} ${p.keywords || ""}`;
    return normalizeKeyword(hay).includes(key) || keywordLooseMatch(p.title, primary);
  });
  let best: InventoryKeywordRow | undefined;
  let bestSim = 0;
  for (const row of inventory) {
    const sim = Math.max(
      row.primary_keyword && normalizeKeyword(row.primary_keyword) === key ? 1 : 0,
      row.title && normalizeKeyword(row.title) === key ? 0.95 : 0,
      tokenOverlap(primary, row.primary_keyword || row.title || ""),
    );
    if (sim > bestSim) {
      bestSim = sim;
      best = row;
    }
  }
  return { inventory: best, pending: pendingHit, similarity: bestSim };
}

function keywordLooseMatch(a: string, b: string): boolean {
  const na = normalizeKeyword(a);
  const nb = normalizeKeyword(b);
  return Boolean(na && nb && (na === nb || na.includes(nb) || nb.includes(na)));
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalizeKeyword(a).split(" ").filter((w) => w.length > 2));
  const tb = new Set(normalizeKeyword(b).split(" ").filter((w) => w.length > 2));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.max(ta.size, tb.size);
}

export function buildResearchOpportunities(input: {
  keywords: ParsedResearchKeyword[];
  clusters: ParsedResearchCluster[];
  inventory: InventoryKeywordRow[];
  pending: PendingIdeaRef[];
}): ContentOpportunity[] {
  const primaries = input.clusters.length
    ? input.clusters.map((c) => ({
      primary: c.primary,
      secondary: c.secondary,
      longTail: c.longTail,
      cluster: c.name,
      intent: c.intent || inferIntentFromText(c.primary),
      sources: [c.source] as ResearchSource[],
    }))
    : groupLooseKeywords(input.keywords);

  const out: ContentOpportunity[] = [];
  const seen = new Set<string>();
  for (const item of primaries) {
    const key = normalizeKeyword(item.primary);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const metrics = input.keywords.find((k) => normalizeKeyword(k.keyword) === key);
    const intent = item.intent || metrics?.search_intent || inferIntentFromText(item.primary);
    const contentType = inferOpportunityType(item.primary, intent);
    const hits = detectCannibalization({
      keyword: item.primary,
      intent,
      contentType,
      inventory: input.inventory,
    });
    const existing = matchExisting(item.primary, input.inventory, input.pending);
    let action: OpportunityAction = "new_content";
    let status = "No overlap with published inventory.";
    if (hits.some((h) => h.kind === "exact_primary") || existing.similarity >= 0.98) {
      action = existing.pending && existing.pending.status === "pending" ? "merge_existing" : "skip_cannibalization";
      status = hits[0]
        ? `Exact/near-primary overlap with ${hits[0].existing.canonical_url}`
        : `Matches existing ${existing.inventory?.canonical_url || existing.pending?.identifier}`;
    } else if (hits.length > 0 || existing.similarity >= 0.72) {
      action = "use_as_secondary";
      status = hits[0]
        ? `Similar to ${hits[0].existing.canonical_url} (${Math.round(hits[0].similarity * 100)}%)`
        : `Similar to existing content`;
    } else if (existing.pending) {
      action = "merge_existing";
      status = `Attach to pending ${existing.pending.type} "${existing.pending.title}"`;
    }

    const country = countryFromText(`${item.primary} ${item.cluster || ""}`);
    const baseName = item.primary.replace(/\s+chat rooms?$/i, "").trim() || item.primary;
    const slug = contentType === "page" ? pageSlugFromName(baseName) : null;
    const title = contentType === "page"
      ? (/\bchat room\b/i.test(item.primary) ? item.primary.replace(/\bchat rooms\b/i, "Chat Room") : `${baseName} Chat Room`)
      : titleCase(item.primary);

    const relatedUrls = input.inventory
      .filter((row) => tokenOverlap(item.primary, `${row.title} ${row.primary_keyword || ""}`) >= 0.35)
      .slice(0, 5)
      .map((row) => row.canonical_url);

    out.push({
      contentType,
      proposedTitle: titleCase(title),
      slug,
      section: contentType === "page" ? inferSection(country, null) : null,
      categorySlug: contentType === "blog" ? "chatrooms" : null,
      baseName: contentType === "page" ? baseName : null,
      lookupCountryHint: country,
      primaryKeyword: item.primary,
      secondaryKeywords: item.secondary,
      longTailKeywords: item.longTail,
      cluster: item.cluster,
      searchIntent: intent,
      sources: [...new Set([...(metrics?.sources ?? []), ...item.sources])],
      searchVolume: metrics?.search_volume ?? null,
      seoDifficulty: metrics?.seo_difficulty ?? null,
      cpc: metrics?.cpc ?? null,
      action,
      cannibalizationStatus: status,
      existingUrl: existing.inventory?.canonical_url ?? null,
      existingTitle: existing.inventory?.title ?? existing.pending?.title ?? null,
      existingIdeaId: existing.pending?.id ?? null,
      existingIdeaType: existing.pending?.type ?? null,
      priority: scoreOpportunity({
        volume: metrics?.search_volume ?? null,
        primary: item.primary,
        intent,
        action,
        longTailCount: item.longTail.length,
      }),
      relatedUrls,
    });
  }
  return out.sort((a, b) => b.priority - a.priority);
}

function groupLooseKeywords(keywords: ParsedResearchKeyword[]) {
  const scored = keywords.map((k) => {
    let score = yaarzoRelevance(k.keyword);
    if (k.keyword_type === "primary") score += 10;
    if (typeof k.search_volume === "number") score += Math.min(24, Math.log10(k.search_volume + 1) * 8);
    const words = k.keyword.split(/\s+/).length;
    if (words >= 2 && words <= 4) score += 6;
    return { k, score };
  }).sort((a, b) => b.score - a.score);
  const primaries = scored.filter((s) => s.k.keyword_type === "primary");
  const relevant = scored.filter((s) => s.score >= 10);
  const pool = (primaries.length ? primaries : relevant.length ? relevant : scored).slice(0, 12);
  return pool.map(({ k: seed }) => {
    const related = keywords.filter((k) => {
      if (normalizeKeyword(k.keyword) === normalizeKeyword(seed.keyword)) return false;
      if (seed.cluster && k.cluster && normalizeKeyword(seed.cluster) === normalizeKeyword(k.cluster)) return true;
      if (k.parent_keyword && normalizeKeyword(k.parent_keyword) === normalizeKeyword(seed.keyword)) return true;
      return tokenOverlap(seed.keyword, k.keyword) >= 0.45;
    });
    return {
      primary: seed.keyword,
      secondary: related.filter((k) => k.keyword_type === "secondary").map((k) => k.keyword),
      longTail: related.filter((k) => k.keyword_type === "long-tail" || k.keyword_type === "question").map((k) => k.keyword),
      cluster: seed.cluster,
      intent: seed.search_intent || inferIntentFromText(seed.keyword),
      sources: seed.sources,
    };
  });
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export function opportunityKeywords(opp: ContentOpportunity): string {
  return [opp.primaryKeyword, ...opp.secondaryKeywords, ...opp.longTailKeywords]
    .map((k) => k.trim())
    .filter(Boolean)
    .filter((k, i, all) => all.findIndex((x) => normalizeKeyword(x) === normalizeKeyword(k)) === i)
    .join(", ");
}

export function planResearchSave(opportunities: ContentOpportunity[]): ResearchSavePlan {
  const createIdeas: ContentOpportunity[] = [];
  const appendToPending: ResearchSavePlan["appendToPending"] = [];
  const assignKeywords: ResearchSavePlan["assignKeywords"] = [];
  let skipCount = 0;
  let newCount = 0;
  let mergeCount = 0;

  for (const opp of opportunities) {
    const keywords = opportunityKeywords(opp);
    if (opp.action === "skip_cannibalization") {
      skipCount++;
      assignKeywords.push({
        keyword: opp.primaryKeyword,
        url: opp.existingUrl,
        status: "conflict",
      });
      continue;
    }
    if (opp.action === "merge_existing" || (opp.action === "use_as_secondary" && opp.existingIdeaId)) {
      mergeCount++;
      if (opp.existingIdeaId && opp.existingIdeaType) {
        appendToPending.push({ id: opp.existingIdeaId, type: opp.existingIdeaType, keywords });
      } else {
        createIdeas.push(opp);
      }
      assignKeywords.push({
        keyword: opp.primaryKeyword,
        url: opp.existingUrl,
        status: opp.existingUrl ? "assigned" : "pending",
      });
      continue;
    }
    if (opp.action === "use_as_secondary") {
      assignKeywords.push({
        keyword: opp.primaryKeyword,
        url: opp.existingUrl,
        status: opp.existingUrl ? "assigned" : "pending",
      });
      continue;
    }
    newCount++;
    createIdeas.push(opp);
    assignKeywords.push({ keyword: opp.primaryKeyword, url: null, status: "pending" });
  }

  return { createIdeas, appendToPending, assignKeywords, skipCount, newCount, mergeCount };
}
