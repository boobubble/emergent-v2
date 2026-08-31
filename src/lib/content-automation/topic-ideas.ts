import { db } from "@/lib/content-automation/db";

export type IdeaStatus = "pending" | "published";
export type IdeaType = "blog" | "page";

export type NormalizedIdea = {
  type: IdeaType;
  identifier: string;
  grouping: string;
  status: IdeaStatus;
};

type BlogIdeaRow = {
  title: string;
  category_slug: string;
};

type PageIdeaRow = {
  slug: string;
  section: string;
};

function asStatus(published: boolean): IdeaStatus {
  return published ? "published" : "pending";
}

async function fetchBlogIdeas(statusFilter?: IdeaStatus): Promise<NormalizedIdea[]> {
  const [{ data: ideas, error: ideasError }, { data: posts, error: postsError }] = await Promise.all([
    db().from("blog_topic_ideas").select("title, category_slug").order("created_at", { ascending: true }),
    db().from("blog_posts").select("title"),
  ]);
  if (ideasError) throw new Error(ideasError.message);
  if (postsError) throw new Error(postsError.message);

  const publishedTitles = new Set(
    (posts ?? []).map((p: { title: string }) => (p.title ?? "").trim()),
  );

  const rows: NormalizedIdea[] = ((ideas ?? []) as BlogIdeaRow[]).map((row) => ({
    type: "blog",
    identifier: row.title,
    grouping: row.category_slug,
    status: asStatus(publishedTitles.has(row.title.trim())),
  }));

  if (!statusFilter) return rows;
  return rows.filter((r) => r.status === statusFilter);
}

async function fetchPageIdeas(statusFilter?: IdeaStatus): Promise<NormalizedIdea[]> {
  const [{ data: ideas, error: ideasError }, { data: pages, error: pagesError }] = await Promise.all([
    db().from("static_page_ideas").select("slug, section").order("created_at", { ascending: true }),
    db().from("custom_pages").select("slug"),
  ]);
  if (ideasError) throw new Error(ideasError.message);
  if (pagesError) throw new Error(pagesError.message);

  const publishedSlugs = new Set((pages ?? []).map((p: { slug: string }) => p.slug));

  const rows: NormalizedIdea[] = ((ideas ?? []) as PageIdeaRow[]).map((row) => ({
    type: "page",
    identifier: row.slug,
    grouping: row.section,
    status: asStatus(publishedSlugs.has(row.slug)),
  }));

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
};

export type PageIdeaInput = {
  type: "page";
  slug?: string;
  section?: string;
  baseName?: string;
  lookupCity?: string | null;
  lookupCountryHint?: string | null;
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
