import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { filterCosmeticsUserIds } from "./cosmetics-store";

const UUID_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const UUID_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("filterCosmeticsUserIds", () => {
  it("keeps UUID ids only", () => {
    expect(filterCosmeticsUserIds([UUID_A])).toEqual([UUID_A]);
  });

  it("ignores non-UUID synthetic and guest ids", () => {
    expect(filterCosmeticsUserIds([
      "bot-spam",
      "bot-gamebot",
      "visitor_abc123",
      "me",
      "",
    ])).toEqual([]);
  });

  it("filters mixed UUID + bot/visitor ids to UUIDs only", () => {
    expect(filterCosmeticsUserIds([
      UUID_A,
      "bot-spam",
      UUID_B,
      "visitor_test",
    ])).toEqual([UUID_A, UUID_B]);
  });

  it("dedupes UUID ids", () => {
    expect(filterCosmeticsUserIds([UUID_A, UUID_A, UUID_B])).toEqual([UUID_A, UUID_B]);
  });

  it("empty input yields empty list", () => {
    expect(filterCosmeticsUserIds([])).toEqual([]);
  });
});

describe("cosmetics-store inventory guard wiring", () => {
  const src = readFileSync(resolve(process.cwd(), "src/lib/cosmetics-store.ts"), "utf8");

  it("filters before user_inventory query and skips schedule for non-UUID", () => {
    expect(src).toMatch(/filterCosmeticsUserIds/);
    expect(src).toMatch(/isUuid\(id\)/);
    expect(src).toMatch(/if \(ids\.length === 0\) return/);
  });
});
