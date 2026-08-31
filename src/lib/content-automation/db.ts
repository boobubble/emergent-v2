import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  automation_enabled: boolean;
  updated_at: string | null;
};

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const { data, error } = await db()
    .from("automation_settings")
    .select("id, blog_posts_per_day, static_pages_per_day, automation_enabled, updated_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    return {
      id: 1,
      blog_posts_per_day: 2,
      static_pages_per_day: 5,
      automation_enabled: true,
      updated_at: null,
    };
  }
  return data as AutomationSettings;
}

export function pausedResponse() {
  return Response.json({ skipped: true, reason: "Automation is paused" });
}
