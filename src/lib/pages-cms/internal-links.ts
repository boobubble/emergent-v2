import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Sb = SupabaseClient<Database>;

/** Recount canonical page_internal_links into custom_pages.internal_link_count (+ optional JSON cache). */
export async function recalculateInternalLinkCount(
  sb: Sb,
  pageId: string,
  opts?: { refreshJsonCache?: boolean },
): Promise<number> {
  const { data: links, error } = await sb
    .from("page_internal_links")
    .select("id, anchor_text, target_url, target_page_id, sort_order, is_manual")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const count = links?.length ?? 0;
  // Do NOT set updated_at here. custom_pages trigger preserves editorial lastmod
  // when only internal_link_count / internal_links_json (derived cache) change.
  const patch: Record<string, unknown> = {
    internal_link_count: count,
  };
  if (opts?.refreshJsonCache) {
    patch.internal_links_json = links ?? [];
  }

  const { error: upErr } = await sb.from("custom_pages").update(patch as never).eq("id", pageId);
  if (upErr) throw new Error(upErr.message);
  return count;
}
