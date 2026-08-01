import type { SeoGlobal, SeoPageRow } from "./types";

export const SEO_EDITABLE_ROUTE_PATHS = ["/", "/welcome", "/heropage"] as const;
export type SeoEditableRoutePath = (typeof SEO_EDITABLE_ROUTE_PATHS)[number];

export type SeoEditTarget = "global" | "route";

export type SeoEditFormValues = {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  index: boolean;
  follow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

export function emptySeoEditForm(): SeoEditFormValues {
  return {
    title: "",
    description: "",
    keywords: "",
    canonicalUrl: "",
    index: true,
    follow: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
  };
}

export function isSeoEditableRow(row: { id: string; routePath: string }): boolean {
  if (row.id === "__global__") return true;
  return (SEO_EDITABLE_ROUTE_PATHS as readonly string[]).includes(row.routePath);
}

export function parseRobotsFlags(robots?: string | null): { index: boolean; follow: boolean } {
  const value = (robots ?? "index,follow").toLowerCase();
  return {
    index: !value.includes("noindex"),
    follow: !value.includes("nofollow"),
  };
}

export function buildRobotsValue(index: boolean, follow: boolean): string {
  return `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}`;
}

export function globalToEditForm(global: SeoGlobal | null): SeoEditFormValues {
  const { index, follow } = parseRobotsFlags(global?.robots);
  const title = global?.default_title ?? "";
  const description = global?.default_description ?? "";
  const ogImage = global?.default_og_image ?? "";
  let canonicalUrl = global?.canonical_domain?.trim() ?? "";
  if (canonicalUrl && !canonicalUrl.startsWith("http")) {
    canonicalUrl = `https://${canonicalUrl.replace(/^\/+/, "")}`;
  }
  return {
    title,
    description,
    keywords: global?.default_keywords ?? "",
    canonicalUrl,
    index,
    follow,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
  };
}

export function pageToEditForm(page: SeoPageRow | null | undefined): SeoEditFormValues {
  if (!page) return emptySeoEditForm();
  const title = page.title ?? "";
  const description = page.description ?? "";
  const ogImage = page.og_image ?? "";
  return {
    title,
    description,
    keywords: page.keywords ?? "",
    canonicalUrl: page.canonical_url ?? "",
    index: !page.noindex,
    follow: !page.nofollow,
    ogTitle: page.og_title ?? title,
    ogDescription: page.og_description ?? description,
    ogImage,
    twitterTitle: page.twitter_title ?? page.og_title ?? title,
    twitterDescription: page.twitter_description ?? page.og_description ?? description,
    twitterImage: page.twitter_image ?? ogImage,
  };
}

export type SeoEditValidation = {
  fieldErrors: Partial<Record<keyof SeoEditFormValues, string>>;
  warnings: string[];
};

export function validateSeoEditForm(values: SeoEditFormValues): SeoEditValidation {
  const fieldErrors: Partial<Record<keyof SeoEditFormValues, string>> = {};
  const warnings: string[] = [];

  if (values.title.length > 60) {
    warnings.push("SEO title is longer than the recommended 60 characters.");
  }
  if (values.description.length > 160) {
    warnings.push("Meta description is longer than the recommended 160 characters.");
  }

  const canonical = values.canonicalUrl.trim();
  if (canonical) {
    try {
      const url = new URL(canonical);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        fieldErrors.canonicalUrl = "Canonical must use http:// or https://";
      }
    } catch {
      fieldErrors.canonicalUrl = "Canonical must be a valid absolute URL";
    }
  }

  return { fieldErrors, warnings };
}

export function editFormToGlobalPatch(values: SeoEditFormValues): Partial<SeoGlobal> {
  const canonical = values.canonicalUrl.trim();
  let canonical_domain: string | null = canonical || null;
  if (canonical) {
    try {
      const url = new URL(canonical);
      canonical_domain = url.origin;
    } catch {
      canonical_domain = canonical;
    }
  }

  const image = values.ogImage.trim() || values.twitterImage.trim() || null;

  return {
    default_title: values.title.trim() || null,
    default_description: values.description.trim() || null,
    default_keywords: values.keywords.trim() || null,
    canonical_domain,
    robots: buildRobotsValue(values.index, values.follow),
    default_og_image: image,
  };
}

export function editFormToPagePatch(
  values: SeoEditFormValues,
  base: Partial<SeoPageRow>,
): Partial<SeoPageRow> {
  return {
    ...base,
    enabled: true,
    title: values.title.trim() || null,
    description: values.description.trim() || null,
    keywords: values.keywords.trim() || null,
    canonical_url: values.canonicalUrl.trim() || null,
    noindex: !values.index,
    nofollow: !values.follow,
    og_title: values.ogTitle.trim() || null,
    og_description: values.ogDescription.trim() || null,
    og_image: values.ogImage.trim() || null,
    twitter_title: values.twitterTitle.trim() || null,
    twitter_description: values.twitterDescription.trim() || null,
    twitter_image: values.twitterImage.trim() || null,
  };
}
