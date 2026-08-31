import { describe, expect, it } from "vitest";
import { canonicalPagePath } from "@/lib/internal-linking-orphans";
import { planPeerBackfillInserts } from "./peer-geo-backfill";
import type { GeoPage } from "./peer-geo-links";

const PK = "country-pk";

function geo(partial: Partial<GeoPage> & Pick<GeoPage, "id" | "slug" | "title">): GeoPage & { content: string; status: string } {
  return {
    page_type: "city",
    category: "pakistan_city",
    country_id: PK,
    city_id: null,
    link_priority: 0,
    h1: null,
    content: "<p>Hello</p>",
    status: "published",
    ...partial,
  };
}

describe("planPeerBackfillInserts", () => {
  it("plans reciprocal canonical /{slug} inserts for orphan geo pages", () => {
    const pages = [
      geo({ id: "karachi", slug: "karachi-chat-room", title: "Karachi", link_priority: 90 }),
      geo({
        id: "pk",
        slug: "pakistan-chat-room",
        title: "Pakistan",
        page_type: "country",
        category: "country",
        link_priority: 100,
        content: `<a href="/chatroom">cta</a>`,
      }),
      geo({ id: "lahore", slug: "lahore-chat-room", title: "Lahore", link_priority: 85 }),
    ];

    const plan = planPeerBackfillInserts({
      pages,
      blogDocs: [],
      graphLinks: [],
      existingKeys: new Set(),
      onlyOrphans: true,
    });

    expect(plan.orphanGeoSlugs).toEqual([
      "karachi-chat-room",
      "lahore-chat-room",
      "pakistan-chat-room",
    ]);
    expect(plan.inserts.every((row) => row.target_url.startsWith("/") && !row.target_url.startsWith("/p/"))).toBe(true);
    expect(plan.inserts.some((row) => row.source_slug === "karachi-chat-room" && row.target_url === "/pakistan-chat-room")).toBe(true);
    expect(plan.inserts.some((row) => row.source_slug === "pakistan-chat-room" && row.target_url === "/karachi-chat-room")).toBe(true);
    expect(plan.pagesTouched.length).toBeGreaterThan(0);
  });

  it("skips inserts that already exist in the graph", () => {
    const pages = [
      geo({ id: "karachi", slug: "karachi-chat-room", title: "Karachi", link_priority: 90 }),
      geo({
        id: "pk",
        slug: "pakistan-chat-room",
        title: "Pakistan",
        page_type: "country",
        category: "country",
        link_priority: 100,
      }),
    ];
    const plan = planPeerBackfillInserts({
      pages,
      blogDocs: [],
      graphLinks: [],
      existingKeys: new Set([`karachi|${canonicalPagePath("pakistan-chat-room")}`]),
      onlyOrphans: false,
    });
    expect(plan.inserts.some((row) => row.page_id === "karachi" && row.target_url === "/pakistan-chat-room")).toBe(false);
  });
});
