import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn } from "./router-CYWPFaDK.mjs";
import { g as getMehfilSettings } from "./mehfil-admin.functions-BntRjkJU.mjs";
import { M as MEHFIL_SETTINGS_DEFAULTS } from "./mehfil-types-okfUX99d.mjs";
function useMehfilSettings() {
  const fetchSettings = useServerFn(getMehfilSettings);
  const { data } = useQuery({
    queryKey: ["mehfil", "settings"],
    queryFn: () => fetchSettings(),
    staleTime: 5 * 6e4
  });
  return data ?? MEHFIL_SETTINGS_DEFAULTS;
}
function useMehfilLabel() {
  return useMehfilSettings().module_name || MEHFIL_SETTINGS_DEFAULTS.module_name;
}
export {
  useMehfilSettings as a,
  useMehfilLabel as u
};
