import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CORE_MODULE_DEFAULTS } from "@/lib/module-flags";

interface ModulesRow {
  value?: Record<string, unknown> | null;
}

export async function isCommunitiesModuleEnabled(): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "modules")
    .maybeSingle<ModulesRow>();

  const raw = (data?.value ?? {}) as Record<string, unknown>;
  const flag = raw.communities;
  if (typeof flag === "boolean") return flag;
  return CORE_MODULE_DEFAULTS.communities;
}
