import { describe, it, expect } from "vitest";
import {
  acceptWatchTogetherInvite,
  getWatchInviteResolution,
  registerWatchTogetherInviteHandlers,
  rejectWatchTogetherInvite,
  setWatchInviteResolution,
} from "./watch-together-actions";

describe("watch-together-actions", () => {
  it("routes accept/reject to registered channel handlers", async () => {
    const channelId = "dm:a:b";
    let accepted = false;
    let rejected = false;

    const unregister = registerWatchTogetherInviteHandlers(channelId, {
      acceptInvite: async () => {
        accepted = true;
      },
      rejectInvite: async () => {
        rejected = true;
      },
    });

    await acceptWatchTogetherInvite({ sessionId: "00000000-0000-4000-8000-000000000001", channelId });
    await rejectWatchTogetherInvite({ sessionId: "00000000-0000-4000-8000-000000000002", channelId });

    expect(accepted).toBe(true);
    expect(rejected).toBe(true);
    unregister();
  });

  it("waits for channel handlers before accepting", async () => {
    const channelId = "dm:late:handler";
    let registered = false;

    const unregister = registerWatchTogetherInviteHandlers(channelId, {
      acceptInvite: async () => {
        registered = true;
      },
      rejectInvite: async () => {},
    });

    await acceptWatchTogetherInvite({
      sessionId: "00000000-0000-4000-8000-000000000010",
      channelId,
    });
    expect(registered).toBe(true);
    unregister();
  });

  it("tracks invite resolution states", () => {
    const sessionId = "00000000-0000-4000-8000-000000000099";
    expect(getWatchInviteResolution(sessionId)).toBe("pending");
    setWatchInviteResolution(sessionId, "declined");
    expect(getWatchInviteResolution(sessionId)).toBe("declined");
  });
});
