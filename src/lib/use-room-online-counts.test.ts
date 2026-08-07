import { describe, expect, it } from "vitest";
import { roomOnlineCountsFromMembers } from "@/lib/use-room-online-counts";

describe("roomOnlineCountsFromMembers", () => {
  it("derives counts from room membership", () => {
    expect(
      roomOnlineCountsFromMembers(["lobby", "games"], {
        lobby: ["me", "u1", "u2"],
        games: ["me"],
      }),
    ).toEqual({ lobby: 3, games: 1 });
  });

  it("returns zero for unknown channels", () => {
    expect(roomOnlineCountsFromMembers(["missing"], {})).toEqual({ missing: 0 });
  });
});
