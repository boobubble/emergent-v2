import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getAllSettingsAdmin, updateSetting } from "@/lib/admin.functions";

/**
 * Lightweight hook to read/write a single JSON key in app_settings.
 * Keeps admin modules schema-free and lazy. Uses the admin-only reader
 * so sensitive keys (bots, moderation, AI keys, etc.) are available.
 */
export function useAdminSetting<T extends Record<string, any>>(key: string, defaults: T) {
  const fetchSettings = useServerFn(getAllSettingsAdmin);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["admin-settings-full"], queryFn: () => fetchSettings({}) });
  const [values, setValues] = useState<T>(defaults);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    if (!data) return;
    const v = (data[key] as Partial<T>) || {};
    setValues({ ...defaults, ...v });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mut = useMutation({
    // Always persist the latest state — avoids stale closure after set()/patch().
    mutationFn: (override?: T) =>
      saveSetting({ data: { key, value: override ?? valuesRef.current } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-settings-full"] });
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["guest-chat-public-config"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof T>(k: K, v: T[K]) => setValues((s) => ({ ...s, [k]: v }));
  const patch = (partial: Partial<T>) => setValues((s) => ({ ...s, ...partial }));

  return {
    values,
    set,
    patch,
    // Zero-arg so `onClick={save}` remains valid across admin pages.
    save: () => {
      mut.mutate(valuesRef.current);
    },
    saveAsync: (override?: T) => mut.mutateAsync(override ?? valuesRef.current),
    saving: mut.isPending,
  };
}
