import { describe, expect, it } from "vitest";
import { isNaturalAnchor, placeNameFromLabel, stripSeoTitleSuffix } from "./anchor-label";
import { cityAnchors, pickAnchor } from "./phase4c-priority";
import { labelForRelatedTarget } from "./related-chat-rooms";

describe("anchor-label", () => {
  it("strips SEO title suffixes before cityAnchors so labels stay natural", () => {
    const h1 = "Faisalabad Chat Room | Free Chat & Community – Yaarzo";
    const city = placeNameFromLabel(h1, "faisalabad-chat-room");
    expect(city).toBe("Faisalabad");
    const variants = cityAnchors(city);
    expect(variants).toEqual(["Faisalabad chat room", "chat in Faisalabad", "Faisalabad rooms"]);
    expect(variants.every((v) => !v.includes("|"))).toBe(true);
    expect(pickAnchor(variants, "islamabad-chat-room:faisalabad-chat-room")).not.toMatch(/Yaarzo rooms/i);
  });

  it("rejects dumped meta titles as stored anchors", () => {
    expect(isNaturalAnchor("Faisalabad Chat Room | Free Chat & Community – Yaarzo rooms")).toBe(false);
    expect(isNaturalAnchor("Faisalabad Chat Room")).toBe(true);
    expect(stripSeoTitleSuffix("Multan Chat Room – Free Gupshup & Community on Yaarzo")).toBe(
      "Multan Chat Room",
    );
  });
});

describe("labelForRelatedTarget", () => {
  it("does not append cityAnchors suffixes onto a full SEO H1", () => {
    const label = labelForRelatedTarget(
      {
        slug: "faisalabad-chat-room",
        title: "Faisalabad chat room | Yaarzo",
        h1: "Faisalabad Chat Room | Free Chat & Community – Yaarzo",
        page_type: "city",
      },
      null,
      "islamabad-chat-room:faisalabad-chat-room",
    );
    expect(label).not.toMatch(/\|/);
    expect(label.toLowerCase()).not.toContain("yaarzo rooms");
    expect(label.toLowerCase()).toMatch(/faisalabad/);
  });

  it("keeps a clean stored anchor_text", () => {
    expect(
      labelForRelatedTarget(
        { slug: "multan-chat-room", title: "Multan Chat Room", page_type: "city" },
        "chat in Multan",
        "salt",
      ),
    ).toBe("chat in Multan");
  });
});
