import { describe, it, expect, vi, beforeEach } from "vitest";
import { shouldLog, throttleKey } from "./throttle";

describe("logger throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows first log and blocks duplicate within 60s", () => {
    const key = throttleKey("test error", "error");
    expect(shouldLog(key)).toBe(true);
    expect(shouldLog(key)).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(shouldLog(key)).toBe(true);
  });
});

describe("buildDmChannel integration", () => {
  it("rejects invalid ids for remote channels", async () => {
    const { dmChannelFor, isRemoteDmChannel } = await import("../dm-utils");
    expect(dmChannelFor("me", "550e8400-e29b-41d4-a716-446655440000")).toBeNull();
    expect(isRemoteDmChannel("dm:bot-gamebot", "550e8400-e29b-41d4-a716-446655440000")).toBe(false);
  });
});
