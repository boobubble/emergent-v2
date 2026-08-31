import { describe, expect, it } from "vitest";
import {
  isCityPage,
  isCountryPage,
  pickPeerPages,
  planPeerLinkEdges,
  sameGeoCluster,
  type GeoPage,
} from "./peer-geo-links";

const PK = "country-pk";
const IN = "country-in";

function page(partial: Partial<GeoPage> & Pick<GeoPage, "id" | "slug" | "title">): GeoPage {
  return {
    page_type: "city",
    category: "pakistan_city",
    country_id: PK,
    city_id: null,
    link_priority: 0,
    h1: null,
    ...partial,
  };
}

const pool: GeoPage[] = [
  page({
    id: "pk",
    slug: "pakistan-chat-room",
    title: "Pakistan Chat Room",
    page_type: "country",
    category: "country",
    country_id: PK,
    link_priority: 100,
  }),
  page({ id: "karachi", slug: "karachi-chat-room", title: "Karachi", link_priority: 90 }),
  page({ id: "lahore", slug: "lahore-chat-room", title: "Lahore", link_priority: 85 }),
  page({ id: "islamabad", slug: "islamabad-chat-room", title: "Islamabad", link_priority: 80 }),
  page({
    id: "in",
    slug: "india-chat-room",
    title: "India Chat Room",
    page_type: "country",
    category: "country",
    country_id: IN,
    link_priority: 100,
  }),
  page({
    id: "delhi",
    slug: "delhi-chat-room",
    title: "Delhi",
    category: "india_city",
    country_id: IN,
    link_priority: 90,
  }),
  page({
    id: "bahrain",
    slug: "bahrain-chat-room",
    title: "Bahrain",
    page_type: "country",
    category: "country",
    country_id: null,
    link_priority: 10,
  }),
];

describe("geo classifiers", () => {
  it("treats category=country with null page_type as a country page", () => {
    expect(isCountryPage({ page_type: null, category: "country" })).toBe(true);
    expect(isCityPage({ page_type: "city", category: "pakistan_city" })).toBe(true);
  });

  it("does not treat India and Pakistan as the same cluster", () => {
    const pk = pool.find((p) => p.slug === "karachi-chat-room")!;
    const delhi = pool.find((p) => p.slug === "delhi-chat-room")!;
    expect(sameGeoCluster(pk, delhi)).toBe(false);
  });
});

describe("pickPeerPages", () => {
  it("for a city, picks the country hub then other cities in the same country", () => {
    const karachi = pool.find((p) => p.slug === "karachi-chat-room")!;
    const peers = pickPeerPages(karachi, pool, { max: 3 });
    expect(peers.map((p) => p.slug)).toEqual([
      "pakistan-chat-room",
      "lahore-chat-room",
      "islamabad-chat-room",
    ]);
    expect(peers.some((p) => p.slug.includes("delhi") || p.slug.includes("india"))).toBe(false);
  });

  it("for a country hub, picks major cities not other countries", () => {
    const pk = pool.find((p) => p.slug === "pakistan-chat-room")!;
    const peers = pickPeerPages(pk, pool, { max: 2 });
    expect(peers.map((p) => p.slug)).toEqual(["karachi-chat-room", "lahore-chat-room"]);
    expect(peers.some((p) => p.slug === "bahrain-chat-room")).toBe(false);
    expect(peers.some((p) => p.slug === "india-chat-room")).toBe(false);
  });

  it("returns no same-country peers for an isolated country page, then falls back to non-geo hubs", () => {
    const bahrain = pool.find((p) => p.slug === "bahrain-chat-room")!;
    const withHubs: GeoPage[] = [
      ...pool,
      page({
        id: "intl",
        slug: "international-chat-room",
        title: "International",
        page_type: "category",
        category: "type",
        country_id: null,
      }),
      page({
        id: "friends",
        slug: "friendship-chat-room",
        title: "Friendship",
        page_type: "category",
        category: "type",
        country_id: null,
      }),
    ];
    const peers = pickPeerPages(bahrain, withHubs);
    expect(peers.map((p) => p.slug)).toEqual(["international-chat-room", "friendship-chat-room"]);
    expect(peers.some((p) => p.slug === "india-chat-room")).toBe(false);
  });

  it("clusters city_subcategory pages with their parent city", () => {
    const girls = page({
      id: "kg",
      slug: "karachi-girls-chat-room",
      title: "Karachi Girls",
      page_type: "static",
      category: "city_subcategory",
      country_id: null,
    });
    const peers = pickPeerPages(girls, [...pool, girls], { max: 3 });
    expect(peers[0]?.slug).toBe("pakistan-chat-room");
    expect(peers.some((p) => p.slug === "karachi-chat-room")).toBe(true);
    expect(peers.some((p) => p.slug === "delhi-chat-room")).toBe(false);
  });
});

describe("planPeerLinkEdges", () => {
  it("adds reciprocal inbound edges so orphans gain incoming links", () => {
    const karachi = pool.find((p) => p.slug === "karachi-chat-room")!;
    const edges = planPeerLinkEdges([karachi], pool, { maxPeers: 2, reciprocal: true });
    const keys = edges.map((e) => `${e.from.slug}→${e.to.slug}`).sort();
    expect(keys).toEqual([
      "karachi-chat-room→lahore-chat-room",
      "karachi-chat-room→pakistan-chat-room",
      "lahore-chat-room→karachi-chat-room",
      "pakistan-chat-room→karachi-chat-room",
    ]);
  });
});
