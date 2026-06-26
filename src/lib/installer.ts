import { supabase } from "@/integrations/supabase/client";

export type InstallMode = "cloud" | "self_hosted";

export interface InstallStatus {
  installed: boolean;
  installed_at?: string;
  license_type?: "envato" | "offline";
  site_name?: string;
  mode?: InstallMode;
  version?: string;
}

/** Auto-detect deployment mode. Lovable Cloud preview/published domains → cloud. */
export function detectInstallMode(): InstallMode {
  if (typeof window === "undefined") return "cloud";
  const host = window.location.hostname;
  if (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "localhost"
  ) {
    return "cloud";
  }
  return "self_hosted";
}

export async function fetchInstallStatus(): Promise<InstallStatus> {
  const { data, error } = await supabase.rpc("get_install_status");
  if (error) return { installed: false };
  return ((data as unknown) as InstallStatus) ?? { installed: false };
}

/** Envato purchase code format: 8-4-4-4-12 hex (UUID-shape). */
export function isValidEnvatoCode(code: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code.trim());
}
/** Offline license format: BOOB-XXXX-XXXX-XXXX-XXXX (alnum). */
export function isValidOfflineKey(code: string): boolean {
  return /^BOOB(-[A-Z0-9]{4}){4}$/i.test(code.trim());
}

export async function completeInstallation(payload: {
  license_type: "envato" | "offline";
  license_key: string;
  site_name: string;
  mode: InstallMode;
}) {
  const { data, error } = await supabase.rpc("complete_installation", { _payload: payload });
  if (error) throw error;
  return data;
}

export async function resetInstallation() {
  const { error } = await supabase.rpc("reset_installation");
  if (error) throw error;
}

export async function bootstrapFirstAdmin() {
  const { error } = await supabase.rpc("bootstrap_first_admin");
  if (error) throw error;
}
