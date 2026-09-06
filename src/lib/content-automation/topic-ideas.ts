import { db } from "@/lib/content-automation/db";
import { mergeKeywords, type KeywordSaveMode } from "@/lib/content-automation/parse-keyword-research";

export type IdeaStatus = "pending" | "published";
export type IdeaType = "blog" | "page";

export type NormalizedIdea = {
  id: number;
  type: IdeaType;
  identifier: string;
  grouping: string;
  status: IdeaStatus;
  keywords: string | null;
  baseName: string | null;
  generationReady: boolean;
};

type BlogIdeaRow = {
  id: number;
  title: string;
  category_slug: string;
  keywords: string | null;
  generation_ready?: boolean | null;
};

type PageIdeaRow = {
  id: number;
  slug: string;
  section: string;
  base_name: string;
  keywords: string | null;
  generation_ready?: boolean | null;
};

function emptyToNull(value?: string | null): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed ? trimmed : null;
}

function asStatus(published: boolean): IdeaStatus {
  return published ? "published" : "pending";
}

async function fetchBlogIdeas(statusFilter?: IdeaStatus): Promise<NormalizedIdea[]> {
  let ideas: BlogIdeaRow[] | null = null;
  let ideasError: { message: string } | null = null;
  {
    const res = await db()
      .from("blog_topic_ideas")
      .select("id, title, category_slug, keywords, generation_ready")
      .order("created_at", { ascending: true });
    if (res.error && /generation_ready|schema cache|column/i.test(res.error.message)) {
      const fallback = await db()
        .from("blog_topic_ideas")
        .select("id, title, category_slug, keywords")
        .order("created_at", { ascending: true });
      ideas = (fallback.data ?? []) as BlogIdeaRow[];
      ideasError = fallback.error;
    } else {
      ideas = (res.data ?? []) as BlogIdeaRow[];
      ideasError = res.error;
    }
  }
  const { data: posts, error: postsError } = await db().from("blog_posts").select("title");
  if (ideasError) throw new Error(ideasError.message);
  if (postsError) throw new Error(postsError.message);

  const publishedTitles = new Set(
    (posts ?? []).map((p: { title: string }) => (p.title ?? "").trim()),
  );

  const rows: NormalizedIdea[] = (ideas ?? []).map((row) => ({
    id: row.id,
    type: "blog",
    identifier: row.title,
    grouping: row.category_slug,
    status: asStatus(publishedTitles.has(row.title.trim())),
    keywords: emptyToNull(row.keywords),
    baseName: null,
    generationReady: Boolean(row.generation_ready),
  }));

  rows.sort((a, b) => Number(b.generationReady) - Number(a.generationReady));

  if (!statusFilter) return rows;
  return rows.filter((r) => r.status === statusFilter);
}

async function fetchPageIdeas(statusFilter?: IdeaStatus): Promise<NormalizedIdea[]> {
  let ideas: PageIdeaRow[] | null = null;
  let ideasError: { message: string } | null = null;
  {
    const res = await db()
      .from("static_page_ideas")
      .select("id, slug, section, base_name, keywords, generation_ready")
      .order("created_at", { ascending: true });
    if (res.error && /generation_ready|schema cache|column/i.test(res.error.message)) {
      const fallback = await db()
        .from("static_page_ideas")
        .select("id, slug, section, base_name, keywords")
        .order("created_at", { ascending: true });
      ideas = (fallback.data ?? []) as PageIdeaRow[];
      ideasError = fallback.error;
    } else {
      ideas = (res.data ?? []) as PageIdeaRow[];
      ideasError = res.error;
    }
  }
  const { data: pages, error: pagesError } = await db().from("custom_pages").select("slug");
  if (ideasError) throw new Error(ideasError.message);
  if (pagesError) throw new Error(pagesError.message);

  const publishedSlugs = new Set((pages ?? []).map((p: { slug: string }) => p.slug));

  const rows: NormalizedIdea[] = (ideas ?? []).map((row) => ({
    id: row.id,
    type: "page",
    identifier: row.slug,
    grouping: row.section,
    status: asStatus(publishedSlugs.has(row.slug)),
    keywords: emptyToNull(row.keywords),
    baseName: row.base_name ?? null,
    generationReady: Boolean(row.generation_ready),
  }));

  rows.sort((a, b) => Number(b.generationReady) - Number(a.generationReady));

  if (!statusFilter) return rows;
  return rows.filter((r) => r.status === statusFilter);
}

export async function listTopicIdeas(opts: {
  type?: string;
  status?: string;
}): Promise<NormalizedIdea[]> {
  const statusFilter =
    opts.status === "pending" || opts.status === "published" ? opts.status : undefined;
  const type = opts.type === "blog" || opts.type === "page" ? opts.type : undefined;

  if (type === "blog") return fetchBlogIdeas(statusFilter);
  if (type === "page") return fetchPageIdeas(statusFilter);

  const [blog, page] = await Promise.all([
    fetchBlogIdeas(statusFilter),
    fetchPageIdeas(statusFilter),
  ]);
  return [...blog, ...page];
}

export type BlogIdeaInput = {
  type: "blog";
  title?: string;
  categorySlug?: string;
  metaDescription?: string;
  keywords?: string | null;
};

export type PageIdeaInput = {
  type: "page";
  slug?: string;
  section?: string;
  baseName?: string;
  lookupCity?: string | null;
  lookupCountryHint?: string | null;
  keywords?: string | null;
};

export type TopicIdeaInput = BlogIdeaInput | PageIdeaInput | Record<string, unknown>;

function isBlogItem(item: TopicIdeaInput): item is BlogIdeaInput {
  return (item as { type?: string }).type === "blog";
}

function isPageItem(item: TopicIdeaInput): item is PageIdeaInput {
  return (item as { type?: string }).type === "page";
}

export async function upsertTopicIdeas(items: TopicIdeaInput[]) {
  const blogRows = items
    .filter(isBlogItem)
    .map((item) => ({
      title: String(item.title ?? "").trim(),
      category_slug: String(item.categorySlug ?? "").trim(),
      meta_description: item.metaDescription ? String(item.metaDescription).trim() : null,
      keywords: emptyToNull(item.keywords),
    }))
    .filter((row) => row.title && row.category_slug);

  const pageRows = items
    .filter(isPageItem)
    .map((item) => ({
      slug: String(item.slug ?? "").trim(),
      section: String(item.section ?? "").trim(),
      base_name: String(item.baseName ?? "").trim(),
      lookup_city: item.lookupCity ? String(item.lookupCity).trim() : null,
      lookup_country_hint: item.lookupCountryHint ? String(item.lookupCountryHint).trim() : null,
      keywords: emptyToNull(item.keywords),
    }))
    .filter((row) => row.slug && row.section && row.base_name);

  const skipped = items.length - blogRows.length - pageRows.length;
  let blogUpserted = 0;
  let pageUpserted = 0;

  if (blogRows.length > 0) {
    const { error, data } = await db()
      .from("blog_topic_ideas")
      .upsert(blogRows, { onConflict: "title" })
      .select("title");
    if (error) throw new Error(error.message);
    blogUpserted = data?.length ?? blogRows.length;
  }

  if (pageRows.length > 0) {
    const { error, data } = await db()
      .from("static_page_ideas")
      .upsert(pageRows, { onConflict: "slug" })
      .select("slug");
    if (error) throw new Error(error.message);
    pageUpserted = data?.length ?? pageRows.length;
  }

  return { blogUpserted, pageUpserted, skipped };
}

export class IdeaNotFoundError extends Error {
  constructor(titleOrId: string) {
    super(`No matching pending item found for '${titleOrId}'`);
    this.name = "IdeaNotFoundError";
  }
}

export async function updateIdeaKeywords(opts: {
  type: IdeaType;
  id: number;
  keywords: string;
  mode?: KeywordSaveMode;
}) {
  const mode: KeywordSaveMode = opts.mode === "append" ? "append" : "replace";
  const table = opts.type === "blog" ? "blog_topic_ideas" : "static_page_ideas";
  const selectCols =
    opts.type === "blog" ? "id, title, keywords" : "id, slug, base_name, keywords";

  const { data: row, error: fetchError } = await db()
    .from(table)
    .select(selectCols)
    .eq("id", opts.id)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);
  if (!row) throw new IdeaNotFoundError(String(opts.id));

  const typed = row as {
    id: number;
    title?: string;
    slug?: string;
    base_name?: string;
    keywords: string | null;
  };
  const next = mergeKeywords(typed.keywords, opts.keywords, mode);
  const { data, error } = await db()
    .from(table)
    .update({ keywords: emptyToNull(next) })
    .eq("id", opts.id)
    .select(selectCols)
    .single();
  if (error) throw new Error(error.message);

  const saved = data as typeof typed;
  return {
    type: opts.type,
    id: saved.id,
    identifier: opts.type === "blog" ? String(saved.title ?? "") : String(saved.slug ?? ""),
    baseName: opts.type === "page" ? saved.base_name ?? null : null,
    keywords: emptyToNull(saved.keywords) ?? next,
    previousKeywords: emptyToNull(typed.keywords),
    mode,
  };
}

export async function getTopicIdeaById(
  type: IdeaType,
  id: number,
): Promise<NormalizedIdea | null> {
  const ideas = await listTopicIdeas({ type });
  return ideas.find((idea) => idea.id === id) ?? null;
}

/** Marks idea ready for the existing publish pipeline. Does not publish. */
export async function markIdeaGenerationReady(type: IdeaType, id: number): Promise<NormalizedIdea> {
  const table = type === "blog" ? "blog_topic_ideas" : "static_page_ideas";
  const { error } = await db()
    .from(table)
    .update({ generation_ready: true })
    .eq("id", id);
  if (error) {
    if (/generation_ready|schema cache|column/i.test(error.message)) {
      throw new Error(
        "Database is missing generation_ready. Apply migration 20260906140000_idea_generation_ready.sql.",
      );
    }
    throw new Error(error.message);
  }
  const idea = await getTopicIdeaById(type, id);
  if (!idea) throw new IdeaNotFoundError(String(id));
  return idea;
}
