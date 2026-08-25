import type { HomePageMode } from "@/lib/hero-page-config";

/**
 * Where unauthenticated visitors are sent from private routes / logout.
 * The SEO homepage at `/` is the default marketing landing after the
 * `/welcome` merge. `/heropage` stays available when admins select hero mode.
 */
export function landingPathForMode(mode: HomePageMode | null | undefined): string {
  return mode === "hero" ? "/heropage" : "/";
}
