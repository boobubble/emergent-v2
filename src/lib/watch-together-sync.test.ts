import { describe, it, expect } from "vitest";
import {
  classifyDrift,
  computeDriftSeconds,
  computeExpectedPositionSeconds,
  expectedFromBroadcast,
  expectedFromPlayback,
} from "./watch-together-sync";

describe("watch-together-sync", () => {
  it("computes expected position while playing from updated_at anchor", () => {
    const anchor = "2026-09-14T12:00:00.000Z";
    const now = new Date(anchor).getTime() + 10_000;
    expect(
      computeExpectedPositionSeconds(5_000, true, anchor, now),
    ).toBeCloseTo(15, 1);
  });

  it("does not advance position when paused", () => {
    const anchor = "2026-09-14T12:00:00.000Z";
    const now = new Date(anchor).getTime() + 60_000;
    expect(
      computeExpectedPositionSeconds(42_000, false, anchor, now),
    ).toBeCloseTo(42, 1);
  });

  it("expectedFromBroadcast extrapolates from sentAt", () => {
    const sentAt = 1_000_000;
    expect(expectedFromBroadcast(30, true, sentAt, sentAt + 5_000)).toBeCloseTo(35, 1);
  });

  it("expectedFromPlayback wraps snapshot fields", () => {
    const updatedAt = new Date().toISOString();
    const now = Date.now() + 2_000;
    expect(
      expectedFromPlayback({ positionMs: 1_000, playing: true, updatedAt }, now),
    ).toBeGreaterThan(1);
  });

  it("classifies drift thresholds", () => {
    expect(classifyDrift(0.4)).toBe("none");
    expect(classifyDrift(0.5)).toBe("none");
    expect(classifyDrift(1)).toBe("soft");
    expect(classifyDrift(1.5)).toBe("soft");
    expect(classifyDrift(2)).toBe("hard");
  });

  it("computeDriftSeconds returns expected minus current", () => {
    expect(computeDriftSeconds(10, 8)).toBe(2);
    expect(computeDriftSeconds(8, 10)).toBe(-2);
  });
});
