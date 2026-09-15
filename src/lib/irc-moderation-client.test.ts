import { describe, expect, it } from "vitest";
import { buildModerationFrame, toIrcNick } from "./irc-moderation-client";

describe("irc-moderation-client", () => {
  it("toIrcNick sanitizes display names", () => {
    expect(toIrcNick("mohit")).toBe("mohit");
    expect(toIrcNick("Ada Lovelace")).toBe("Ada_Lovelace");
    expect(toIrcNick("   ")).toBe("");
  });

  it("buildModerationFrame uses moderation.* type", () => {
    expect(
      buildModerationFrame({
        action: "mute",
        room: "yaarzo-global",
        targetNick: "bob",
        reason: "spam",
      }),
    ).toEqual({
      type: "moderation.mute",
      action: "mute",
      room: "yaarzo-global",
      targetNick: "bob",
      reason: "spam",
    });
  });
});
