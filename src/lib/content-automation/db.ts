import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeAutomationSettings, SEO_ENGINE_DEFAULTS } from "@/lib/content-automation/seo-settings";

/** Untyped service-role client — new automation tables are not in generated Database types yet. */
export function db() {
  return supabaseAdmin as unknown as {
    from: (table: string) => any;
  };
}

export type AutomationSettings = {
  id: number;
  blog_posts_per_day: number;
  static_pages_per_day: number;
  daily_total_limit: number;
  automation_enabled: boolean;
  auto_seo_optimization: boolean;
  auto_internal_linking: boolean;
  two_way_linking: boolean;
  cannibalization_check: boolean;
  broken_link_check: boolean;
  new_page_discovery: boolean;
  content_refresh_enabled: boolean;
  refresh_interval_days: number;
  refresh_type: string;
  auto_update_published: boolean;
  only_update_when_meaningful: boolean;
  minimum_content_change_percent: number;
  keep_previous_versions: boolean;
  max_versions: number;
  pexels_images_enabled: boolean;
  images_per_content: number;
  prefer_landscape_images: boolean;
  image_optimization: boolean;
  image_duplicate_prevention: boolean;
  dry_run_optimization: boolean;
  migration_paused: boolean;
  updated_at: string | null;
};

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const { data, error } = await db()
    .from("automation_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    return normalizeAutomationSettings({
      id: 1,
      ...SEO_ENGINE_DEFAULTS,
      updated_at: null,
    });
  }
  return normalizeAutomationSettings(data);
}

export function pausedResponse() {
  return Response.json({ skipped: true, reason: "Automation is paused" });
}
