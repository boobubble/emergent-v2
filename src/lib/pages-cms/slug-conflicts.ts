import { slugifyPageSlug, validatePageSlug } from "@/lib/page-slug";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SlugConflictSource = "custom_page" | "reserved" | "redirect";

export async function findSlugConflicts(
  sb: SupabaseClient<Database>,
  rawSlug: string,
  opts?: { excludeCustomPageId?: string },
) {
  const slug = slugifyPageSlug(rawSlug);
  if (!slug) return [{ slug: rawSlug, source: "reserved" as const, message: "Invalid slug." }];

  const conflicts = [];
  const reservedErr = validatePageSlug(slug);
  if (reservedErr) conflicts.push({ slug, source: "reserved" as const, message: reservedErr });

  const [{ data: customPage }, { data: redirect }] = await Promise.all([
    sb.from("custom_pages").select("id, slug").eq("slug", slug).maybeSingle(),
    sb.from("page_redirects").select("from_slug").eq("from_slug", slug).maybeSingle(),
  ]);

  if (customPage && customPage.id !== opts?.excludeCustomPageId) {
    conflicts.push({
      slug,
      source: "custom_page" as const,
      existingId: customPage.id,
      message: `Slug "${slug}" is already used by a page.`,
    });
  }
  if (redirect) {
    conflicts.push({ slug, source: "redirect" as const, message: `Slug "${slug}" is reserved as a redirect source.` });
  }
  return conflicts;
}

export function resolveDuplicateSlug(baseSlug: string, attempt: number): string {
  const slug = slugifyPageSlug(baseSlug);
  if (attempt <= 0) return slug;
  const suffix = `-${attempt + 1}`;
  return `${slug.slice(0, 80 - suffix.length)}${suffix}`;
}
