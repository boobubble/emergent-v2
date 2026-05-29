import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";

/**
 * Lightweight hook to read/write a single JSON key in app_settings.
 * Keeps admin modules schema-free and lazy.
 */
export function useAdminSetting<T extends Record<string, any>>(key: string, defaults: T) {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });
  const [values, setValues] = useState<T>(defaults);

  useEffect(() => {
    if (!data) return;
    const v = (data[key] as Partial<T>) || {};
    setValues({ ...defaults, ...v });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key, value: values } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof T>(k: K, v: T[K]) => setValues((s) => ({ ...s, [k]: v }));
  const patch = (partial: Partial<T>) => setValues((s) => ({ ...s, ...partial }));

  return { values, set, patch, save: () => mut.mutate(), saving: mut.isPending };
}
