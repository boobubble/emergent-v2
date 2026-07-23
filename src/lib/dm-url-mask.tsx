// Client-side DM URL masking: fetches the allow/block domain lists once
// (cached in React Query) and returns a mask() helper. Only used to render
// receiver-facing text; the sender's stored message is never modified.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUrlAllowList } from "@/lib/trust-safety.functions";
import { useMemo } from "react";

const URL_RE = /https?:\/\/[^\s<>]+/gi;

function hostAllowed(host: string, allowed: Set<string>, blocked: Set<string>): boolean {
  const h = host.toLowerCase();
  for (const d of blocked) if (h === d || h.endsWith("." + d)) return false;
  if (allowed.size === 0) return true;
  for (const d of allowed) if (h === d || h.endsWith("." + d)) return true;
  return false;
}

export function useDmUrlMask() {
  const fetchList = useServerFn(getUrlAllowList);
  const q = useQuery({
    queryKey: ["url-allow-list"],
    queryFn: () => fetchList(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
  const mask = useMemo(() => {
    const allowed = new Set(q.data?.allowed ?? []);
    const blocked = new Set(q.data?.blocked ?? []);
    return (text: string): string => {
      if (!text) return text;
      return text.replace(URL_RE, (url) => {
        try {
          const host = new URL(url).hostname;
          return hostAllowed(host, allowed, blocked) ? url : "**************";
        } catch {
          return url;
        }
      });
    };
  }, [q.data]);
  return mask;
}
