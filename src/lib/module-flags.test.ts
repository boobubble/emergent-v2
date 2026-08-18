import { describe, expect, it } from "vitest";
import { DEFAULT_MODULE_FLAGS, mergeModuleFlags } from "@/lib/app-settings";

describe("module flag defaults", () => {
  it("keeps communities enabled and blog/pages disabled by default", () => {
    expect(DEFAULT_MODULE_FLAGS.communities).toBe(true);
    expect(DEFAULT_MODULE_FLAGS.blog).toBe(false);
    expect(DEFAULT_MODULE_FLAGS.pages).toBe(false);
  });

  it("merges persisted modules without dropping unrelated keys", () => {
    const merged = mergeModuleFlags({
      communities: false,
      wallet: false,
    });
    expect(merged.communities).toBe(false);
    expect(merged.wallet).toBe(false);
    expect(merged.blog).toBe(false);
    expect(merged.pages).toBe(false);
    expect(merged.feed).toBe(true);
  });
});
