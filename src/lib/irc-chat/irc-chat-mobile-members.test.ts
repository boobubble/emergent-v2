import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  formatMembersInRoomCount,
  memberProfileBioSnippet,
  memberSheetShowsContextList,
  shouldOfferMemberMessage,
  shouldOfferViewProfile,
} from "./irc-chat-mobile-members";
import {
  formatIrcRadioNowPlaying,
  formatIrcRadioSubtitle,
  ircRadioLiveAccessibleLabel,
} from "./irc-chat-radio-present";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("irc-chat mobile members helpers", () => {
  it("formats in-room count", () => {
    expect(formatMembersInRoomCount(0)).toBe("0 in room");
    expect(formatMembersInRoomCount(1)).toBe("1 in room");
    expect(formatMembersInRoomCount(128)).toBe("128 in room");
  });

  it("decides message and profile actions", () => {
    expect(shouldOfferMemberMessage(true)).toBe(false);
    expect(shouldOfferMemberMessage(false)).toBe(true);
    expect(
      shouldOfferViewProfile({
        nick: "alice",
        userId: "550e8400-e29b-41d4-a716-446655440000",
        isGuest: false,
      }),
    ).toBe(true);
    expect(
      shouldOfferViewProfile({
        nick: "guest1",
        userId: "visitor_abc",
        isGuest: true,
      }),
    ).toBe(false);
  });

  it("truncates bio from cached profile only", () => {
    expect(memberProfileBioSnippet(null)).toBeNull();
    expect(
      memberProfileBioSnippet({
        id: "x",
        username: "a",
        bio: "Hello",
        about_me: null,
        avatar_url: null,
        avatar_color: "",
        xp: 0,
        level: 0,
        streak: 0,
        longest_streak: 0,
        status: "offline",
        last_seen: null,
        gender: null,
        country_code: null,
        show_country_flag: null,
        show_guest_badge: null,
        birthday: null,
        hide_birth_year: null,
        is_bot: null,
        is_official: null,
      }),
    ).toBe("Hello");
  });

  it("switches member sheet mode", () => {
    expect(memberSheetShowsContextList(false)).toBe("list");
    expect(memberSheetShowsContextList(true)).toBe("context");
  });
});

describe("irc-chat radio presentation", () => {
  it("formats now playing without fake placeholders", () => {
    expect(formatIrcRadioNowPlaying({ trackTitle: "  Song  " })).toBe("Song");
    expect(formatIrcRadioNowPlaying({ isLive: true, hasTrack: true })).toBe("Live stream");
    expect(formatIrcRadioNowPlaying({})).toBe("Off air");
  });

  it("prefers DJ name over station for subtitle", () => {
    expect(
      formatIrcRadioSubtitle({ djName: "DJ Ranjha", stationName: "Yaarzo" }),
    ).toBe("DJ Ranjha");
    expect(formatIrcRadioSubtitle({ stationName: "Yaarzo" })).toBe("Yaarzo");
  });

  it("live label is not color-only", () => {
    expect(ircRadioLiveAccessibleLabel(true, false)).toContain("Live");
    expect(ircRadioLiveAccessibleLabel(true, true)).toContain("paused");
  });

  it("keeps a single DjPlayerHost in IrcChatApp", () => {
    const src = readFileSync(join(root, "components/irc-chat/IrcChatApp.tsx"), "utf8");
    expect(src.match(/<DjPlayerHost/g)?.length).toBe(1);
  });
});
