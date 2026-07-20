import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMehfilSettings } from "@/lib/mehfil-admin.functions";
import { MEHFIL_SETTINGS_DEFAULTS, type MehfilSettings } from "@/lib/mehfil-types";

/**
 * Shared reader for the admin-branded Poetry Hub label + full Poetry Hub settings.
 * The URL segment stays `/mehfil` — only presentational strings change.
 */
export function useMehfilSettings(): MehfilSettings {
  const fetchSettings = useServerFn(getMehfilSettings);
  const { data } = useQuery({
    queryKey: ["mehfil", "settings"],
    queryFn: () => fetchSettings(),
    staleTime: 5 * 60_000,
  });
  return data ?? MEHFIL_SETTINGS_DEFAULTS;
}

export function useMehfilLabel(): string {
  return useMehfilSettings().module_name || MEHFIL_SETTINGS_DEFAULTS.module_name;
}
