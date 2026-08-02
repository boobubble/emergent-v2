import type { SeoGlobal } from "./types";

/** True when PostgREST reports seo_global is absent from the schema cache. */
export function isSeoGlobalTableMissing(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  if (e?.code === "PGRST205") return true;
  return /could not find the table.*seo_global/i.test(e?.message ?? "");
}

type SeoGlobalClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: number) => {
        maybeSingle: () => Promise<{ data: SeoGlobal | null; error: unknown }>;
      };
    };
  };
};

/**
 * Load row id=1 from seo_global. Returns null when the table is unavailable
 * so public routes can fall back to hardcoded / white-label metadata.
 */
export async function loadSeoGlobal(client: SeoGlobalClient): Promise<SeoGlobal | null> {
  const { data, error } = await client.from("seo_global").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (isSeoGlobalTableMissing(error)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[seo] seo_global table unavailable — using fallback metadata");
      }
      return null;
    }
    throw new Error((error as { message?: string }).message ?? "Failed to load seo_global");
  }
  return data;
}
