import { describe, expect, it } from "vitest";
import {
  PHASE4C_ALL_PRIORITY,
  buildDifferentiatedContent,
  planPriorityInternalLinks,
  similarity,
  normalizeCity,
  pickAnchor,
  cityAnchors,
} from "./phase4c-priority";

describe("phase4c priority helpers", () => {
  it("covers the approved priority slug set", () => {
    expect(PHASE4C_ALL_PRIORITY).toContain("lahore-chat-room");
    expect(PHASE4C_ALL_PRIORITY).toContain("pakistan-chat-room");
    expect(PHASE4C_ALL_PRIORITY).toContain("india-chat-room");
    expect(PHASE4C_ALL_PRIORITY).toContain("hyderabad-india-chat-room");
    expect(PHASE4C_ALL_PRIORITY).toContain("girls-chat-room");
    expect(PHASE4C_ALL_PRIORITY).toHaveLength(17);
  });

  it("varies city openings and includes nearby/safety blocks", () => {
    const karachi = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "karachi-chat-room",
        city_name: "Karachi",
        state_name: "Sindh",
        country_name: "Pakistan",
      },
      {
        hubSlug: "pakistan-chat-room",
        hubLabel: "Pakistan chat room",
        siblings: [
          { slug: "lahore-chat-room", name: "Lahore", anchor: "Lahore rooms" },
          { slug: "islamabad-chat-room", name: "Islamabad", anchor: "chat in Islamabad" },
        ],
      },
    );
    const islamabad = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "islamabad-chat-room",
        city_name: "Islamabad",
        state_name: "Islamabad Capital Territory",
        country_name: "Pakistan",
      },
      {
        hubSlug: "pakistan-chat-room",
        hubLabel: "Pakistan chat room",
        siblings: [{ slug: "rawalpindi-chat-room", name: "Rawalpindi", anchor: "Rawalpindi chat room" }],
      },
    );
    expect(karachi.intro).not.toEqual(islamabad.intro);
    expect(karachi.content).toContain("data-block=\"nearby\"");
    expect(karachi.content).toContain("data-block=\"safety\"");
    expect(karachi.content).toContain("/pakistan-chat-room");
    expect(karachi.faq.length).toBeGreaterThanOrEqual(3);
    expect(karachi.cta.label.toLowerCase()).toContain("karachi");
    expect(karachi.content.toLowerCase()).not.toMatch(/\d+\s*(users|members|online)/);
  });

  it("builds country hub and category scaffolds without fabricated stats", () => {
    const hub = buildDifferentiatedContent(
      { page_type: "country", slug: "pakistan-chat-room", country_name: "Pakistan" },
      {
        priorityCities: [
          { slug: "lahore-chat-room", title_hint: "Lahore chat room" },
          { slug: "karachi-chat-room", title_hint: "Karachi chat room" },
        ],
      },
    );
    const cat = buildDifferentiatedContent(
      {
        page_type: "category",
        slug: "dating-chat-room",
        category_name: "Dating Chat",
      },
      {},
    );
    expect(hub.content).toContain("lahore-chat-room");
    expect(hub.content.toLowerCase()).not.toMatch(/\b(top.?ranked|#1|number one)\b/);
    expect(hub.content.toLowerCase()).toContain("does not invent");
    expect(cat.intro.toLowerCase()).toContain("dating");
    expect(cat.content).toContain("data-block=\"safety\"");
  });

  it("plans conservative links: city→hub, hub→cities, limited siblings, categories", () => {
    const cityNameBySlug = {
      "lahore-chat-room": "Lahore",
      "karachi-chat-room": "Karachi",
      "islamabad-chat-room": "Islamabad",
      "rawalpindi-chat-room": "Rawalpindi",
      "faisalabad-chat-room": "Faisalabad",
      "multan-chat-room": "Multan",
      "delhi-chat-room": "Delhi",
      "mumbai-chat-room": "Mumbai",
      "bengaluru-chat-room": "Bengaluru",
      "hyderabad-india-chat-room": "Hyderabad",
      "chennai-chat-room": "Chennai",
      "kolkata-chat-room": "Kolkata",
    };
    const categoryNameBySlug = {
      "girls-chat-room": "Girls Chat",
      "dating-chat-room": "Dating Chat",
      "friendship-chat-room": "Friendship Chat",
    };
    const links = planPriorityInternalLinks({ cityNameBySlug, categoryNameBySlug });
    expect(links.some((l) => l.from === "lahore-chat-room" && l.to === "pakistan-chat-room")).toBe(true);
    expect(links.some((l) => l.from === "pakistan-chat-room" && l.to === "lahore-chat-room")).toBe(true);
    expect(links.some((l) => l.from === "mumbai-chat-room" && l.to === "india-chat-room")).toBe(true);
    expect(links.some((l) => l.from === "girls-chat-room" && l.to === "pakistan-chat-room")).toBe(true);
    const lahoreOut = links.filter((l) => l.from === "lahore-chat-room");
    // hub + up to 3 siblings + 2 categories
    expect(lahoreOut.length).toBeLessThanOrEqual(6);
    expect(lahoreOut.length).toBeGreaterThanOrEqual(4);
  });

  it("avoids identical exact-match anchors for every city hop", () => {
    const a = pickAnchor(cityAnchors("Lahore"), "pakistan-chat-roomlahore-chat-room");
    const b = pickAnchor(cityAnchors("Karachi"), "pakistan-chat-roomkarachi-chat-room");
    expect(a.toLowerCase()).toContain("lahore");
    expect(b.toLowerCase()).toContain("karachi");
  });

  it("normalized city similarity drops when openings/notes differ", () => {
    const a = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "karachi-chat-room",
        city_name: "Karachi",
        state_name: "Sindh",
        country_name: "Pakistan",
      },
      { hubSlug: "pakistan-chat-room", hubLabel: "Pakistan chat room", siblings: [] },
    );
    const b = buildDifferentiatedContent(
      {
        page_type: "city",
        slug: "multan-chat-room",
        city_name: "Multan",
        state_name: "Punjab",
        country_name: "Pakistan",
      },
      { hubSlug: "pakistan-chat-room", hubLabel: "Pakistan chat room", siblings: [] },
    );
    const sim = similarity(normalizeCity(a.content, "Karachi"), normalizeCity(b.content, "Multan"));
    expect(sim).toBeLessThan(0.95);
  });
});
