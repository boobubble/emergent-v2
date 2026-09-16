import { describe, expect, it } from "vitest";
import {
  ircPmChannelForNick,
  ircPmPeerId,
  isIrcPmChannel,
  parseIrcPmChannel,
  shouldUseIrcPm,
} from "./irc-pm-utils";

describe("irc-pm-utils", () => {
  it("builds IRC PM channel ids", () => {
    expect(ircPmChannelForNick("JD")).toBe("ircpm:JD");
    expect(isIrcPmChannel("ircpm:JD")).toBe(true);
    expect(parseIrcPmChannel("ircpm:Guest-Arman")).toBe("Guest-Arman");
  });

  it("routes guest and IRC-only peers to IRC PM", () => {
    expect(
      shouldUseIrcPm({
        selfIsGuest: true,
        peerIsGuest: false,
        peerIsIrcOnly: false,
        peerIsRegisteredUuid: true,
      }),
    ).toBe(true);
    expect(
      shouldUseIrcPm({
        selfIsGuest: false,
        peerIsGuest: false,
        peerIsIrcOnly: true,
        peerIsRegisteredUuid: false,
      }),
    ).toBe(true);
    expect(
      shouldUseIrcPm({
        selfIsGuest: false,
        peerIsGuest: false,
        peerIsIrcOnly: false,
        peerIsRegisteredUuid: true,
      }),
    ).toBe(false);
  });

  it("uses stable IRC peer ids", () => {
    expect(ircPmPeerId("max")).toBe("irc:max");
  });
});
