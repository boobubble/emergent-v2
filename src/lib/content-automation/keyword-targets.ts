import { db } from "@/lib/content-automation/db";
import { KEYWORD_TYPES, SEARCH_INTENTS, type KeywordType, type SearchIntent } from "@/lib/content-automation/seo-types";

export type KeywordTargetRow = {
  id: string;
  keyword: string;
  keyword_type: KeywordType;
  search_volume: number | null;
  seo_difficulty: number | null;
  competition: number | null;
  cpc: number | null;
  search_intent: SearchIntent | null;
  parent_keyword: string | null;
  related_keywords: string[];
  questions: string[];
  notes: string | null;
  target_content_type: "blog" | "page" | "any" | null;
  target_url: string | null;
  target_content_id: string | null;
  status: string;
  cluster?: string | null;
  sources?: string[];
  paid_difficulty?: number | null;
  last_import_batch_id?: string | null;
};

const HEADER_ALIASES: Record<string, string> = {
  keyword: "keyword",
  keywords: "keyword",
  "search volume": "search_volume",
  volume: "search_volume",
  sv: "search_volume",
  "seo difficulty": "seo_difficulty",
  "keyword difficulty": "seo_difficulty",
  kd: "seo_difficulty",
  sd: "seo_difficulty",
  competition: "competition",
  cpc: "cpc",
  "cost per click": "cpc",
  intent: "search_intent",
  "search intent": "search_intent",
  type: "keyword_type",
  "keyword type": "keyword_type",
  parent: "parent_keyword",
  "parent keyword": "parent_keyword",
  related: "related_keywords",
  "related keywords": "related_keywords",
  questions: "questions",
  notes: "notes",
  "content type": "target_content_type",
  "target content type": "target_content_type",
  url: "target_url",
  "target url": "target_url",
  cluster: "cluster",
  topic: "cluster",
  group: "cluster",
  "paid difficulty": "paid_difficulty",
  pd: "paid_difficulty",
  "paid kd": "paid_difficulty",
  trend: "trend",
  "keyword ideas": "keyword",
  query: "keyword",
  "search term": "keyword",
  "primary keyword": "parent_keyword",
};

function normHeader(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[_]+/g, " ");
  return HEADER_ALIASES[key] ?? key.replace(/\s+/g, "_");
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function parseNumber(value: string): number | null {
  const n = Number(String(value).replace(/[,$%]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseList(value: string): string[] {
  return value
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntent(value: string): SearchIntent | null {
  const v = value.trim().toLowerCase();
  return (SEARCH_INTENTS as readonly string[]).includes(v) ? (v as SearchIntent) : null;
}

function parseKeywordType(value: string): KeywordType {
  const v = value.trim().toLowerCase();
  if (v === "long tail" || v === "longtail") return "long-tail";
  if ((KEYWORD_TYPES as readonly string[]).includes(v)) return v as KeywordType;
  if (/\?/.test(v) || v === "question") return "question";
  return "primary";
}

export type ParsedKeywordRow = {
  keyword: string;
  keyword_type: KeywordType;
  search_volume: number | null;
  seo_difficulty: number | null;
  competition: number | null;
  cpc: number | null;
  search_intent: SearchIntent | null;
  parent_keyword: string | null;
  related_keywords: string[];
  questions: string[];
  notes: string | null;
  target_content_type: "blog" | "page" | "any" | null;
  target_url: string | null;
  cluster?: string | null;
  sources?: string[];
  paid_difficulty?: number | null;
};

export function parseKeywordCsv(text: string): { rows: ParsedKeywordRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());
  const errors: string[] = [];
  if (lines.length < 2) return { rows: [], errors: ["CSV needs a header row and at least one keyword row."] };

  const headers = splitCsvLine(lines[0]).map(normHeader);
  const metricHeaders = new Set([
    "search_volume", "seo_difficulty", "competition", "cpc", "paid_difficulty",
    "search_intent", "keyword_type", "parent_keyword", "related_keywords",
    "questions", "notes", "target_content_type", "target_url", "cluster", "trend",
  ]);
  if (!headers.includes("keyword")) {
    const first = headers[0];
    if (first && !metricHeaders.has(first)) headers[0] = "keyword";
  }
  const keywordIdx = headers.findIndex((h) => h === "keyword");
  if (keywordIdx < 0) return { rows: [], errors: ["CSV is missing a Keyword column."] };

  const rows: ParsedKeywordRow[] = [];
  const seen = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (cols[idx] ?? "").trim() : "";
    };
    const keyword = get("keyword");
    if (!keyword) {
      errors.push(`Row ${i + 1}: empty keyword`);
      continue;
    }
    const explicitType = get("keyword_type");
    const keyword_type = explicitType
      ? parseKeywordType(explicitType)
      : keyword.split(/\s+/).length >= 4
        ? "long-tail"
        : "secondary";
    const key = `${keyword.toLowerCase()}::${keyword_type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const contentTypeRaw = get("target_content_type").toLowerCase();
    rows.push({
      keyword,
      keyword_type,
      search_volume: parseNumber(get("search_volume")),
      seo_difficulty: parseNumber(get("seo_difficulty")),
      competition: parseNumber(get("competition")),
      cpc: parseNumber(get("cpc")),
      search_intent: parseIntent(get("search_intent")),
      parent_keyword: get("parent_keyword") || null,
      related_keywords: parseList(get("related_keywords")),
      questions: parseList(get("questions")),
      notes: get("notes") || (get("trend") ? `trend:${get("trend")}` : null),
      target_content_type:
        contentTypeRaw === "blog" || contentTypeRaw === "page" || contentTypeRaw === "any"
          ? contentTypeRaw
          : null,
      target_url: get("target_url") || null,
      cluster: get("cluster") || null,
      paid_difficulty: parseNumber(get("paid_difficulty")),
    });
  }
  return { rows, errors };
}

export async function listKeywordTargets(limit = 200): Promise<KeywordTargetRow[]> {
  const { data, error } = await db()
    .from("seo_keyword_targets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as KeywordTargetRow[];
}

function mergeMetric<T>(current: T | null | undefined, incoming: T | null | undefined): T | null {
  if (incoming == null) return current ?? null;
  if (current == null) return incoming;
  return current;
}

export async function upsertKeywordTargets(rows: ParsedKeywordRow[], batchId?: string) {
  if (rows.length === 0) return { upserted: 0, merged: 0, created: 0 };
  const now = new Date().toISOString();
  let upserted = 0;
  let merged = 0;
  let created = 0;
  const typeRank: Record<string, number> = { primary: 3, secondary: 2, "long-tail": 1, question: 1 };
  for (const row of rows) {
    const { data: matches } = await db()
      .from("seo_keyword_targets")
      .select("*")
      .ilike("keyword", row.keyword)
      .limit(8);
    const existing =
      (matches ?? []).find((m) => m.keyword_type === row.keyword_type)
      ?? (matches ?? [])[0]
      ?? null;
    const nextType =
      existing && (typeRank[row.keyword_type] || 0) > (typeRank[existing.keyword_type] || 0)
        ? row.keyword_type
        : (existing?.keyword_type || row.keyword_type);
    const sources = [...new Set([
      ...((existing?.sources as string[] | undefined) ?? []),
      ...(row.sources ?? []),
    ])];
    const payload = {
      keyword: existing?.keyword || row.keyword,
      keyword_type: nextType,
      search_volume: mergeMetric(existing?.search_volume, row.search_volume),
      seo_difficulty: mergeMetric(existing?.seo_difficulty, row.seo_difficulty),
      competition: mergeMetric(existing?.competition, row.competition),
      cpc: mergeMetric(existing?.cpc, row.cpc),
      paid_difficulty: mergeMetric(existing?.paid_difficulty, row.paid_difficulty ?? null),
      search_intent: existing?.search_intent || row.search_intent,
      parent_keyword: existing?.parent_keyword || row.parent_keyword,
      related_keywords: [...new Set([
        ...((existing?.related_keywords as string[] | undefined) ?? []),
        ...row.related_keywords,
      ])].slice(0, 40),
      questions: existing?.questions ?? row.questions ?? [],
      notes: existing?.notes || row.notes,
      target_content_type: existing?.target_content_type || row.target_content_type,
      target_url: existing?.target_url || row.target_url,
      cluster: existing?.cluster || row.cluster || null,
      sources,
      last_import_batch_id: batchId ?? existing?.last_import_batch_id ?? null,
      updated_at: now,
      status: existing?.status || "pending",
    };
    if (existing?.id) {
      const { error } = await db().from("seo_keyword_targets").update(payload).eq("id", existing.id);
      if (error) throw new Error(error.message);
      merged++;
    } else {
      const { error } = await db().from("seo_keyword_targets").insert({ ...payload, status: "pending" });
      if (error && /duplicate|unique/i.test(error.message)) {
        await db()
          .from("seo_keyword_targets")
          .update(payload)
          .eq("keyword", row.keyword)
          .eq("keyword_type", row.keyword_type);
        merged++;
      } else if (error) {
        throw new Error(error.message);
      } else {
        created++;
      }
    }
    upserted++;
  }
  return { upserted, merged, created };
}

export async function insertKeywordImportBatch(row: {
  source: string;
  sources: string[];
  keywords_found: number;
  clusters_found: number;
  duplicates_removed: number;
  new_count: number;
  merged_count: number;
  opportunities_created: number;
  payload?: Record<string, unknown>;
}) {
  const { data, error } = await db()
    .from("seo_keyword_import_batches")
    .insert({
      source: row.source,
      sources: row.sources,
      keywords_found: row.keywords_found,
      clusters_found: row.clusters_found,
      duplicates_removed: row.duplicates_removed,
      new_count: row.new_count,
      merged_count: row.merged_count,
      opportunities_created: row.opportunities_created,
      payload: row.payload ?? {},
    })
    .select("id")
    .maybeSingle();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return null;
    throw new Error(error.message);
  }
  return data?.id as string | undefined;
}

export async function updateKeywordImportBatch(
  id: string,
  patch: Partial<{
    new_count: number;
    merged_count: number;
    opportunities_created: number;
    payload: Record<string, unknown>;
  }>,
) {
  const { error } = await db().from("seo_keyword_import_batches").update(patch).eq("id", id);
  if (error && !/does not exist|schema cache/i.test(error.message)) throw new Error(error.message);
}

export async function listKeywordImportBatches(limit = 20) {
  const { data, error } = await db()
    .from("seo_keyword_import_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function updateKeywordTarget(id: string, patch: Partial<KeywordTargetRow>) {
  const { data, error } = await db()
    .from("seo_keyword_targets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as KeywordTargetRow | null;
}

export function inferIntentFromText(text: string): SearchIntent {
  const t = text.toLowerCase();
  if (/\b(how to|what is|why|guide|tips|learn)\b/.test(t)) return "informational";
  if (/\b(best|vs|versus|review|compare|alternative)\b/.test(t)) return "commercial";
  if (/\b(join|sign up|signup|download|buy|pricing)\b/.test(t)) return "transactional";
  if (/\b(chat room|city|country|india|pakistan|london|karachi|delhi)\b/.test(t)) return "local";
  if (/\byaarzo\b/.test(t)) return "navigational";
  return "mixed";
}

export function splitKeywordBlob(raw: string | null | undefined): {
  primary: string;
  secondary: string[];
  longTail: string[];
} {
  const parts = String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unique: string[] = [];
  for (const p of parts) {
    if (!unique.some((u) => u.toLowerCase() === p.toLowerCase())) unique.push(p);
  }
  const primary = unique[0] ?? "";
  const rest = unique.slice(1);
  const longTail = rest.filter((k) => k.split(/\s+/).length >= 4);
  const secondary = rest.filter((k) => k.split(/\s+/).length < 4);
  return { primary, secondary, longTail };
}
