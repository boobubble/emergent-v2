/**
 * Keep a page's own title-like fields as close variants of one core title.
 * H1 may stay locale-flavored; <title> / og:title should not be unrelated slogans.
 */
import { stripSeoTitleSuffix } from "@/lib/pages-cms/anchor-label";

export function shortTitleCore(metaTitle: string, fallback: string): string {
  const core = stripSeoTitleSuffix(metaTitle || fallback);
  return core || fallback;
}

export function coherentGeneratedTitles(input: {
  metaTitle: string;
  h1?: string | null;
  baseName: string;
}): {
  title: string;
  meta_title: string;
  og_title: string;
  h1: string;
} {
  const fallbackH1 = `${input.baseName.replace(/\b\w/g, (c) => c.toUpperCase())} Chat Room`;
  const meta = (input.metaTitle || "").replace(/\s+/g, " ").trim() || `${fallbackH1} | Yaarzo`;
  const short = shortTitleCore(meta, fallbackH1);
  const h1 = (input.h1 || "").trim() || short;
  return {
    title: `${short} | Yaarzo`,
    meta_title: meta,
    og_title: meta,
    h1,
  };
}
