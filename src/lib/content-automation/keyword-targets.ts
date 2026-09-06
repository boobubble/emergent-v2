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
};

export function parseKeywordCsv(text: string): { rows: ParsedKeywordRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim());
  const errors: string[] = [];
  if (lines.length < 2) return { rows: [], errors: ["CSV needs a header row and at least one keyword row."] };

  const headers = splitCsvLine(lines[0]).map(normHeader);
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
    const keyword_type = parseKeywordType(get("keyword_type"));
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
      notes: get("notes") || null,
      target_content_type:
        contentTypeRaw === "blog" || contentTypeRaw === "page" || contentTypeRaw === "any"
          ? contentTypeRaw
          : null,
      target_url: get("target_url") || null,
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

export async function upsertKeywordTargets(rows: ParsedKeywordRow[]) {
  if (rows.length === 0) return { upserted: 0 };
  const now = new Date().toISOString();
  const payload = rows.map((row) => ({ ...row, updated_at: now, status: "pending" }));
  const { error, data } = await db()
    .from("seo_keyword_targets")
    .upsert(payload, { onConflict: "seo_keyword_targets_keyword_type_uidx" })
    .select("id");
  if (error) {
    // Unique index name may not work as onConflict — fall back to insert-or-skip loop.
    let upserted = 0;
    for (const row of payload) {
      const { error: oneError } = await db().from("seo_keyword_targets").insert(row);
      if (oneError && /duplicate|unique/i.test(oneError.message)) {
        await db()
          .from("seo_keyword_targets")
          .update(row)
          .eq("keyword", row.keyword)
          .eq("keyword_type", row.keyword_type);
        upserted++;
      } else if (!oneError) {
        upserted++;
      } else {
        throw new Error(oneError.message);
      }
    }
    return { upserted };
  }
  return { upserted: data?.length ?? rows.length };
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
