import type { ListPagesQuery } from "./schemas";
import { DEFAULT_PAGE_SIZE, listPagesQuerySchema } from "./schemas";

export type PaginatedResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function parseListPagesQuery(input: unknown): ListPagesQuery {
  return listPagesQuerySchema.parse(input ?? {});
}

export function normalizeSearchTerm(query: ListPagesQuery): string | undefined {
  const raw = (query.search ?? query.q ?? "").trim();
  return raw || undefined;
}

export function computePagination(total: number, page: number, pageSize: number) {
  const safeSize = pageSize || DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / safeSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = (safePage - 1) * safeSize;
  const to = from + safeSize - 1;
  return { page: safePage, pageSize: safeSize, totalPages, from, to, total: Math.max(total, 0) };
}

export function buildPaginatedResult<T>(
  rows: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const p = computePagination(total, page, pageSize);
  return {
    rows,
    total: p.total,
    page: p.page,
    pageSize: p.pageSize,
    totalPages: p.totalPages,
  };
}

/** Apply list filters onto a Supabase query builder (custom_pages). */
export function applyCustomPagesListFilters<T extends {
  eq: (col: string, val: unknown) => T;
  is: (col: string, val: null) => T;
  or: (expr: string) => T;
  gte: (col: string, val: number) => T;
  lte: (col: string, val: number) => T;
  ilike: (col: string, val: string) => T;
}>(query: T, raw: ListPagesQuery): T {
  let q = query;
  const search = normalizeSearchTerm(raw);
  if (search) {
    const term = `%${search.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
    q = q.or(`title.ilike.${term},slug.ilike.${term},primary_keyword.ilike.${term}`);
  }
  if (raw.page_type) q = q.eq("page_type", raw.page_type);
  if (raw.country_id) q = q.eq("country_id", raw.country_id);
  if (raw.state_id) q = q.eq("state_id", raw.state_id);
  if (raw.city_id) q = q.eq("city_id", raw.city_id);
  if (raw.category_id) q = q.eq("category_id", raw.category_id);
  if (raw.keyword_group_id) q = q.eq("keyword_group_id", raw.keyword_group_id);
  if (raw.template_id) q = q.eq("template_id", raw.template_id);
  if (raw.status) q = q.eq("status", raw.status);
  if (typeof raw.noindex === "boolean") q = q.eq("noindex", raw.noindex);
  if (raw.content_status) q = q.eq("content_status", raw.content_status);
  if (raw.language) q = q.eq("language", raw.language);

  if (raw.missing_h1) q = q.or("h1.is.null,h1.eq.");
  if (raw.missing_meta_title) q = q.or("meta_title.is.null,meta_title.eq.");
  if (raw.missing_meta_description) q = q.or("meta_description.is.null,meta_description.eq.");
  if (raw.missing_primary_keyword) q = q.or("primary_keyword.is.null,primary_keyword.eq.");
  if (raw.missing_internal_links) q = q.eq("internal_link_count", 0);

  if (typeof raw.seo_score_min === "number") q = q.gte("seo_score", raw.seo_score_min);
  if (typeof raw.seo_score_max === "number") q = q.lte("seo_score", raw.seo_score_max);

  return q;
}

export function listSortAscending(query: ListPagesQuery): boolean {
  return query.sortDir === "asc";
}
