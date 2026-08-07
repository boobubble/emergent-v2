import { describe, it, expect } from "vitest";
import { renderTemplate, buildTemplateVars, computeSeoScore, deriveContentStatus } from "./template-engine";

describe("renderTemplate", () => {
  it("replaces variables", () => {
    const vars = buildTemplateVars({ brand: "Yaarzo", city: "Lahore", primary_keyword: "Lahore chat room" });
    expect(renderTemplate("{primary_keyword} | {brand}", vars)).toBe("Lahore chat room | Yaarzo");
  });
});

describe("deriveContentStatus", () => {
  it("detects empty and complete content", () => {
    expect(deriveContentStatus("")).toBe("empty");
    expect(deriveContentStatus(`<p>${"word ".repeat(40)}</p>`)).toBe("complete");
  });
});

describe("computeSeoScore", () => {
  it("scores optimized pages higher", () => {
    const good = computeSeoScore({
      meta_title: "Lahore Chat Room Online Free Today Join",
      meta_description: "Join free Lahore chat rooms on Yaarzo. Meet people, make friends, and chat online with locals every day.",
      h1: "Lahore Chat Room",
      primary_keyword: "Lahore chat room",
      content: "<p>" + "content ".repeat(50) + "</p>",
      noindex: false,
    });
    expect(good).toBeGreaterThan(computeSeoScore({ content: "" }));
  });
});
