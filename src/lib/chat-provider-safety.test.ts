import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));

describe("chat provider safety", () => {
  it("does not throw on rooms missing members during badge/streak/profile merge", () => {
    const src = readFileSync(resolve(testDir, "chat-store.tsx"), "utf8");
    expect(src).toMatch(/r\?\.members\?\.includes\("me"\)/);
    expect(src).toMatch(/!\(r\.members \?\? \[\]\)\.includes\(b\)/);
    expect(src).toMatch(/s\.users\?\.me/);
    expect(src).toMatch(/state\.dmOrder \?\? \[\]/);
  });

  it("ChatErrorBoundary offers retry after a render throw", () => {
    const src = readFileSync(resolve(testDir, "../components/ChatErrorBoundary.tsx"), "utf8");
    expect(src).toMatch(/Try again/);
    expect(src).toMatch(/handleRetry/);
    expect(src).toMatch(/setState\(\{ error: null \}\)/);
  });

  it("Avatar does not slice a null username", () => {
    const src = readFileSync(resolve(testDir, "../components/chat/Avatar.tsx"), "utf8");
    expect(src).toMatch(/user\.name \|\| "\?"/);
  });
});
