import { inferIntentFromText, parseKeywordCsv, splitKeywordBlob, type ParsedKeywordRow } from "@/lib/content-automation/keyword-targets";
import { normalizeKeyword } from "@/lib/content-automation/cannibalization";
import type { KeywordType, SearchIntent } from "@/lib/content-automation/seo-types";

export const RESEARCH_SOURCES = ["ryrob", "neil_patel", "ubersuggest", "manual"] as const;
export type ResearchSource = (typeof RESEARCH_SOURCES)[number];

export function formatResearchSource(source: string): string {
  if (source === "ryrob") return "RyRob";
  if (source === "neil_patel") return "Neil Patel";
  if (source === "ubersuggest") return "Ubersuggest";
  if (source === "manual") return "Manual";
  return source;
}

const INTENT_LABEL = /\(\s*(informational|navigational|commercial|transactional|local|mixed)\s*\)\s*$/i;
const HEADERISH = /^(keyword|keywords|search volume|volume|seo difficulty|kd|cpc|competition|intent|cluster|topic|group)\b/i;
const URL_ONLY = /^https?:\/\/\S+$/i;
const CLUSTER_HEADER = /^(?:cluster|topic|group|pillar)\s*[:\-–—]\s*(.+)$/i;
const MARKDOWN_HEADER = /^#{1,3}\s+(.+)$/;
const BULLET = /^(?:[-*•]|\d+[.)])\s+(.+)$/;
const ROLE_LINE = /^(primary|secondary|long[- ]?tail|related)\s*[:\-–—]\s*(.+)$/i;

export type ParsedResearchKeyword = {
  keyword: string;
  keyword_type: KeywordType;
  cluster: string | null;
  parent_keyword: string | null;
  search_volume: number | null;
  seo_difficulty: number | null;
  paid_difficulty: number | null;
  competition: number | null;
  cpc: number | null;
  search_intent: SearchIntent | null;
  sources: ResearchSource[];
  related_keywords: string[];
};

export type ParsedResearchCluster = {
  name: string;
  primary: string;
  secondary: string[];
  longTail: string[];
  intent: SearchIntent | null;
  source: ResearchSource;
};

export type ParseResearchResult = {
  source: ResearchSource;
  clusters: ParsedResearchCluster[];
  keywords: ParsedResearchKeyword[];
  duplicatesRemoved: number;
  errors: string[];
};

function normalizeSpaces(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function displayKeyword(value: string): string {
  return normalizeSpaces(value);
}

function isHeaderish(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (HEADERISH.test(t) && !/\s.+\s/.test(t.replace(/[,|\t]/g, " "))) return true;
  if (/^keyword[,|\t]/i.test(t)) return true;
  return false;
}

function looksLikeUrl(value: string): boolean {
  return URL_ONLY.test(value.trim()) || /^www\./i.test(value.trim());
}

function parseLooseNumber(value: string): number | null {
  const n = Number(String(value).replace(/[,$%]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function classifyType(keyword: string, explicit?: string | null): KeywordType {
  const v = String(explicit || "").trim().toLowerCase();
  if (v === "long tail" || v === "longtail" || v === "long-tail") return "long-tail";
  if (v === "secondary") return "secondary";
  if (v === "question" || /\?/.test(keyword)) return "question";
  if (v === "primary") return "primary";
  if (keyword.split(/\s+/).length >= 4) return "long-tail";
  return "secondary";
}

function pickPrimary(keywords: string[], volumes: Map<string, number | null>, clusterName: string): string {
  if (keywords.length === 0) return clusterName;
  const clusterKey = normalizeKeyword(clusterName);
  const scored = keywords.map((k) => {
    const words = k.split(/\s+/).length;
    const vol = volumes.get(normalizeKeyword(k));
    let score = 0;
    if (normalizeKeyword(k) === clusterKey) score += 50;
    if (clusterKey && normalizeKeyword(k).includes(clusterKey.split(" ")[0] || "")) score += 8;
    if (words >= 2 && words <= 4) score += 12;
    if (words === 3) score += 4;
    if (typeof vol === "number") score += Math.min(20, Math.log10(vol + 1) * 6);
    return { k, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.k || keywords[0];
}

function rowFromParts(input: {
  keyword: string;
  type?: KeywordType;
  cluster?: string | null;
  parent?: string | null;
  volume?: number | null;
  difficulty?: number | null;
  paid?: number | null;
  competition?: number | null;
  cpc?: number | null;
  intent?: SearchIntent | null;
  source: ResearchSource;
  related?: string[];
}): ParsedResearchKeyword | null {
  const keyword = displayKeyword(input.keyword);
  if (!keyword || looksLikeUrl(keyword) || isHeaderish(keyword)) return null;
  if (keyword.length > 120) return null;
  const intent = input.intent || inferIntentFromText(`${input.cluster || ""} ${keyword}`);
  return {
    keyword,
    keyword_type: input.type || classifyType(keyword),
    cluster: input.cluster ? displayKeyword(input.cluster) : null,
    parent_keyword: input.parent ? displayKeyword(input.parent) : null,
    search_volume: input.volume ?? null,
    seo_difficulty: input.difficulty ?? null,
    paid_difficulty: input.paid ?? null,
    competition: input.competition ?? null,
    cpc: input.cpc ?? null,
    search_intent: intent,
    sources: [input.source],
    related_keywords: input.related ?? [],
  };
}

function dedupeKeywords(rows: ParsedResearchKeyword[]): { rows: ParsedResearchKeyword[]; removed: number } {
  const map = new Map<string, ParsedResearchKeyword>();
  let removed = 0;
  for (const row of rows) {
    const key = normalizeKeyword(row.keyword);
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, row);
      continue;
    }
    removed++;
    map.set(key, mergeResearchKeywords(existing, row));
  }
  return { rows: [...map.values()], removed };
}

export function mergeResearchKeywords(a: ParsedResearchKeyword, b: ParsedResearchKeyword): ParsedResearchKeyword {
  const sources = [...new Set([...a.sources, ...b.sources])];
  const related = [...a.related_keywords, ...b.related_keywords].filter(Boolean);
  const relatedUnique: string[] = [];
  for (const item of related) {
    if (!relatedUnique.some((u) => normalizeKeyword(u) === normalizeKeyword(item))) relatedUnique.push(item);
  }
  const typeRank: Record<KeywordType, number> = { primary: 3, secondary: 2, "long-tail": 1, question: 1 };
  return {
    keyword: a.keyword,
    keyword_type: typeRank[b.keyword_type] > typeRank[a.keyword_type] ? b.keyword_type : a.keyword_type,
    cluster: a.cluster || b.cluster,
    parent_keyword: a.parent_keyword || b.parent_keyword,
    search_volume: a.search_volume ?? b.search_volume,
    seo_difficulty: a.seo_difficulty ?? b.seo_difficulty,
    paid_difficulty: a.paid_difficulty ?? b.paid_difficulty,
    competition: a.competition ?? b.competition,
    cpc: a.cpc ?? b.cpc,
    search_intent: a.search_intent && a.search_intent !== "mixed" ? a.search_intent : b.search_intent,
    sources,
    related_keywords: relatedUnique.slice(0, 24),
  };
}

function csvFromLooseTable(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const raw = line.replace(/\u00a0/g, " ").trimEnd();
      if (!raw.trim()) return "";
      if (raw.includes("\t")) {
        return raw.split("\t").map((c) => `"${c.trim().replace(/"/g, '""')}"`).join(",");
      }
      if (/\s{2,}/.test(raw) && /\d/.test(raw)) {
        return raw.split(/\s{2,}/).map((c) => `"${c.trim().replace(/"/g, '""')}"`).join(",");
      }
      return raw;
    })
    .filter(Boolean)
    .join("\n");
}

function parseTableLike(text: string, source: ResearchSource): ParseResearchResult {
  const csv = csvFromLooseTable(text);
  const parsed = parseKeywordCsv(csv);
  if (parsed.rows.length === 0) {
    return { source, clusters: [], keywords: [], duplicatesRemoved: 0, errors: parsed.errors };
  }
  const rows = parsed.rows
    .map((row: ParsedKeywordRow) => rowFromParts({
      keyword: row.keyword,
      type: row.keyword_type,
      cluster: row.cluster,
      parent: row.parent_keyword,
      volume: row.search_volume,
      difficulty: row.seo_difficulty,
      paid: row.paid_difficulty,
      competition: row.competition,
      cpc: row.cpc,
      intent: row.search_intent,
      source,
      related: row.related_keywords,
    }))
    .filter((row): row is ParsedResearchKeyword => Boolean(row));
  const deduped = dedupeKeywords(rows);
  return {
    source,
    clusters: [],
    keywords: deduped.rows,
    duplicatesRemoved: deduped.removed + Math.max(0, parsed.rows.length - rows.length),
    errors: parsed.errors.filter((e) => !/empty keyword/i.test(e)),
  };
}

function parseBulletClusters(text: string, source: ResearchSource): ParseResearchResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const clusters: ParsedResearchCluster[] = [];
  const keywords: ParsedResearchKeyword[] = [];
  let currentName = "";
  let currentIntent: SearchIntent | null = null;
  let bucket: string[] = [];
  let rolePrimary: string | null = null;
  let roleSecondary: string[] = [];
  let roleLongTail: string[] = [];
  let skipped = 0;

  const flush = () => {
    const unique: string[] = [];
    for (const item of [...(rolePrimary ? [rolePrimary] : []), ...roleSecondary, ...roleLongTail, ...bucket]) {
      const k = displayKeyword(item);
      if (!k || looksLikeUrl(k)) {
        skipped++;
        continue;
      }
      if (!unique.some((u) => normalizeKeyword(u) === normalizeKeyword(k))) unique.push(k);
      else skipped++;
    }
    if (!currentName && unique.length === 0) {
      bucket = [];
      rolePrimary = null;
      roleSecondary = [];
      roleLongTail = [];
      return;
    }
    const name = currentName || unique[0] || "Untitled cluster";
    const volumes = new Map<string, number | null>();
    const primary = rolePrimary || pickPrimary(unique, volumes, name);
    const rest = unique.filter((k) => normalizeKeyword(k) !== normalizeKeyword(primary));
    const split = splitKeywordBlob([primary, ...rest].join(", "));
    const longTail = roleLongTail.length
      ? roleLongTail.filter((k) => normalizeKeyword(k) !== normalizeKeyword(primary))
      : rest.filter((k) => k.split(/\s+/).length >= 4 || split.longTail.some((x) => normalizeKeyword(x) === normalizeKeyword(k)));
    const secondary = roleSecondary.length
      ? roleSecondary.filter((k) => normalizeKeyword(k) !== normalizeKeyword(primary))
      : rest.filter((k) => !longTail.some((x) => normalizeKeyword(x) === normalizeKeyword(k)));
    const intent = currentIntent || inferIntentFromText(`${name} ${primary}`);
    clusters.push({
      name,
      primary,
      secondary,
      longTail,
      intent,
      source,
    });
    for (const k of unique) {
      const type: KeywordType =
        normalizeKeyword(k) === normalizeKeyword(primary) ? "primary" : k.split(/\s+/).length >= 4 ? "long-tail" : "secondary";
      const row = rowFromParts({
        keyword: k,
        type,
        cluster: name,
        parent: type === "primary" ? null : primary,
        intent,
        source,
        related: unique.filter((x) => normalizeKeyword(x) !== normalizeKeyword(k)).slice(0, 12),
      });
      if (row) keywords.push(row);
    }
    bucket = [];
    rolePrimary = null;
    roleSecondary = [];
    roleLongTail = [];
    currentName = "";
    currentIntent = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (bucket.length || currentName || rolePrimary || roleSecondary.length || roleLongTail.length) flush();
      continue;
    }
    const clusterMatch = line.match(CLUSTER_HEADER) || line.match(MARKDOWN_HEADER);
    if (clusterMatch) {
      if (bucket.length || currentName || rolePrimary || roleSecondary.length || roleLongTail.length) flush();
      const name = clusterMatch[1].replace(INTENT_LABEL, "").trim();
      const intentMatch = clusterMatch[1].match(INTENT_LABEL);
      currentName = name;
      currentIntent = intentMatch ? (intentMatch[1].toLowerCase() as SearchIntent) : null;
      continue;
    }
    if (INTENT_LABEL.test(line) && !BULLET.test(line) && !ROLE_LINE.test(line)) {
      if (bucket.length || currentName || rolePrimary || roleSecondary.length || roleLongTail.length) flush();
      currentName = line.replace(INTENT_LABEL, "").trim();
      const intentMatch = line.match(INTENT_LABEL);
      currentIntent = intentMatch ? (intentMatch[1].toLowerCase() as SearchIntent) : null;
      continue;
    }
    const role = line.match(ROLE_LINE);
    if (role) {
      const kind = role[1].toLowerCase();
      const values = role[2].split(/[,;|]/).map(displayKeyword).filter(Boolean);
      if (kind === "primary" && values[0]) rolePrimary = values[0];
      else if (kind.startsWith("long")) roleLongTail.push(...values);
      else roleSecondary.push(...values);
      continue;
    }
    const bullet = line.match(BULLET);
    if (bullet) {
      if (!currentName && keywords.length === 0 && bucket.length === 0) {
        currentName = "";
      }
      bucket.push(bullet[1]);
      continue;
    }
    if (!currentName && !HEADERISH.test(line) && !looksLikeUrl(line)) {
      currentName = line.replace(INTENT_LABEL, "").trim();
      const intentMatch = line.match(INTENT_LABEL);
      currentIntent = intentMatch ? (intentMatch[1].toLowerCase() as SearchIntent) : null;
      continue;
    }
  }
  if (bucket.length || currentName || rolePrimary || roleSecondary.length || roleLongTail.length) flush();

  const deduped = dedupeKeywords(keywords);
  return {
    source,
    clusters,
    keywords: deduped.rows,
    duplicatesRemoved: skipped + deduped.removed,
    errors: clusters.length === 0 && deduped.rows.length === 0 ? ["No clusters or keywords found."] : [],
  };
}

function parsePlainList(text: string, source: ResearchSource): ParseResearchResult {
  const parts = text
    .replace(/\r\n/g, "\n")
    .split(/[\n,;|]+/)
    .map(displayKeyword)
    .filter(Boolean);
  const rows = parts
    .map((keyword) => rowFromParts({
      keyword,
      type: classifyType(keyword),
      source,
      intent: inferIntentFromText(keyword),
    }))
    .filter((row): row is ParsedResearchKeyword => Boolean(row));
  const deduped = dedupeKeywords(rows);
  return {
    source,
    clusters: [],
    keywords: deduped.rows,
    duplicatesRemoved: Math.max(0, parts.length - deduped.rows.length),
    errors: deduped.rows.length === 0 && text.trim() ? ["No usable keywords found."] : [],
  };
}

function looksLikeTable(text: string): boolean {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  const first = lines[0].toLowerCase();
  if (/\bkeyword\b/.test(first) && /\b(volume|kd|cpc|competition|difficulty)\b/.test(first)) return true;
  const tabby = lines.filter((l) => l.includes("\t")).length;
  return tabby >= Math.min(2, lines.length);
}

export function parseKeywordClusterPaste(text: string): ParseResearchResult {
  const trimmed = text.trim();
  if (!trimmed) return { source: "ryrob", clusters: [], keywords: [], duplicatesRemoved: 0, errors: ["Empty input"] };
  if (looksLikeTable(trimmed)) {
    const table = parseTableLike(trimmed, "ryrob");
    if (table.keywords.length > 0) return table;
  }
  return parseBulletClusters(trimmed, "ryrob");
}

function extractTableBlock(text: string): string {
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((l) =>
    /\bkeyword\b/i.test(l) && /\b(volume|kd|cpc|competition|difficulty)\b/i.test(l),
  );
  return idx >= 0 ? lines.slice(idx).join("\n") : text;
}

export function parseKeywordIdeasPaste(text: string): ParseResearchResult {
  const trimmed = text.trim();
  if (!trimmed) return { source: "neil_patel", clusters: [], keywords: [], duplicatesRemoved: 0, errors: ["Empty input"] };
  const tableBlock = extractTableBlock(trimmed);
  if (looksLikeTable(tableBlock) || /,/.test(tableBlock.split(/\n/)[0] || "")) {
    const table = parseTableLike(tableBlock, "neil_patel");
    if (table.keywords.length > 0) return table;
  }
  return parsePlainList(trimmed, "neil_patel");
}

export function parseAdditionalKeywordsPaste(text: string): ParseResearchResult {
  const trimmed = text.trim();
  if (!trimmed) return { source: "manual", clusters: [], keywords: [], duplicatesRemoved: 0, errors: ["Empty input"] };
  if (looksLikeTable(trimmed)) return { ...parseTableLike(trimmed, "ubersuggest"), source: "ubersuggest" };
  return parsePlainList(trimmed, "manual");
}

export function mergeParseResults(results: ParseResearchResult[]): {
  keywords: ParsedResearchKeyword[];
  clusters: ParsedResearchCluster[];
  sources: ResearchSource[];
  duplicatesRemoved: number;
  keywordsFound: number;
} {
  const usable = results.filter((r) => r.keywords.length > 0 || r.clusters.length > 0);
  let duplicatesRemoved = usable.reduce((n, r) => n + r.duplicatesRemoved, 0);
  const found = usable.reduce((n, r) => n + r.keywords.length, 0);
  let merged: ParsedResearchKeyword[] = [];
  for (const result of usable) {
    for (const row of result.keywords) {
      const key = normalizeKeyword(row.keyword);
      const idx = merged.findIndex((m) => normalizeKeyword(m.keyword) === key);
      if (idx < 0) merged.push(row);
      else {
        duplicatesRemoved++;
        merged[idx] = mergeResearchKeywords(merged[idx], row);
      }
    }
  }
  const clusters: ParsedResearchCluster[] = [];
  for (const result of usable) {
    for (const cluster of result.clusters) {
      if (!clusters.some((c) => normalizeKeyword(c.name) === normalizeKeyword(cluster.name))) {
        clusters.push(cluster);
      }
    }
  }
  return {
    keywords: merged,
    clusters,
    sources: [...new Set(usable.map((r) => r.source))],
    duplicatesRemoved,
    keywordsFound: found,
  };
}

export function analyzeResearchPaste(input: {
  clusterText?: string;
  ideasText?: string;
  extraText?: string;
}) {
  const parsed = [
    input.clusterText?.trim() ? parseKeywordClusterPaste(input.clusterText) : null,
    input.ideasText?.trim() ? parseKeywordIdeasPaste(input.ideasText) : null,
    input.extraText?.trim() ? parseAdditionalKeywordsPaste(input.extraText) : null,
  ].filter((row): row is ParseResearchResult => Boolean(row));
  const merged = mergeParseResults(parsed);
  const summary = summarizeParsedKeywords(merged.keywords);
  return { parsed, merged, summary };
}

export function summarizeParsedKeywords(keywords: ParsedResearchKeyword[]): {
  primary: string[];
  secondary: string[];
  longTail: string[];
} {
  const primary = keywords.filter((k) => k.keyword_type === "primary").map((k) => k.keyword);
  const secondary = keywords.filter((k) => k.keyword_type === "secondary").map((k) => k.keyword);
  const longTail = keywords.filter((k) => k.keyword_type === "long-tail" || k.keyword_type === "question").map((k) => k.keyword);
  const primaries = primary.length ? primary : keywords.slice(0, 3).map((k) => k.keyword);
  return { primary: primaries, secondary, longTail };
}
