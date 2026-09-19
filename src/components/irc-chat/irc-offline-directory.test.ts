import { describe, expect, it } from "vitest";
import type { RemoteProfile } from "@/lib/use-remote-profiles";
import type { IrcChatMember } from "@/lib/irc-chat";
import {
  collectIrcOnlineRegisteredUserIds,
  filterIrcOnlineMembers,
  listOfflineRegisteredProfiles,
} from "./irc-offline-directory";

const REG_A = "00000000-0000-4000-8000-000000000001";
const REG_B = "00000000-0000-4000-8000-000000000002";
const REG_C = "00000000-0000-4000-8000-000000000003";

function profile(id: string, username: string, extra?: Partial<RemoteProfile>): RemoteProfile {
  return {
    id,
    username,
    bio: null,
    about_me: null,
    avatar_url: null,
    avatar_color: "220 48% 42%",
    xp: 0,
    level: 1,
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
    ...extra,
  };
}

function member(nick: string, userId: string, isGuest?: boolean): IrcChatMember {
  return { nick, userId, isGuest };
}

describe("irc-offline-directory", () => {
  it("IRC-online registered user appears in online set, not offline list", () => {
    const members = { lobby: [member("Alice", REG_A)] };
    const onlineIds = collectIrcOnlineRegisteredUserIds(members, null);
    expect(onlineIds.has(REG_A.toLowerCase())).toBe(true);

    const offline = listOfflineRegisteredProfiles(
      { [REG_A]: profile(REG_A, "Alice"), [REG_B]: profile(REG_B, "Bob") },
      onlineIds,
      "",
    );
    expect(offline.some((r) => r.userId === REG_A)).toBe(false);
    expect(offline.some((r) => r.userId === REG_B)).toBe(true);
  });

  it("registered profile absent from IRC online set appears offline", () => {
    const onlineIds = collectIrcOnlineRegisteredUserIds({}, null);
    const offline = listOfflineRegisteredProfiles(
      { [REG_C]: profile(REG_C, "Carol") },
      onlineIds,
      "",
    );
    expect(offline).toHaveLength(1);
    expect(offline[0]?.username).toBe("Carol");
  });

  it("does not fabricate guest IRC users into offline directory", () => {
    const raw = {
      guest1: profile("not-a-uuid", "guest-12345", {}),
    };
    const offline = listOfflineRegisteredProfiles(raw, new Set(), "");
    expect(offline).toHaveLength(0);
  });

  it("does not duplicate a registered user in offline when they are IRC-online", () => {
    const members = { lobby: [member("Alice", REG_A)] };
    const onlineIds = collectIrcOnlineRegisteredUserIds(members, REG_A);
    const offline = listOfflineRegisteredProfiles(
      { [REG_A]: profile(REG_A, "Alice") },
      onlineIds,
      "",
    );
    expect(offline).toHaveLength(0);
  });

  it("Supabase profile status/presence cannot mark someone online (offline list ignores status)", () => {
    const onlineIds = new Set<string>();
    const offline = listOfflineRegisteredProfiles(
      {
        [REG_A]: profile(REG_A, "Alice", { status: "online", last_seen: new Date().toISOString() }),
      },
      onlineIds,
      "",
    );
    expect(offline).toHaveLength(1);
    expect(onlineIds.has(REG_A.toLowerCase())).toBe(false);
  });

  it("self application user id is treated as IRC-online registered without NAMES row", () => {
    const onlineIds = collectIrcOnlineRegisteredUserIds({}, REG_B);
    expect(onlineIds.has(REG_B.toLowerCase())).toBe(true);
    const offline = listOfflineRegisteredProfiles(
      { [REG_B]: profile(REG_B, "Bob") },
      onlineIds,
      "",
    );
    expect(offline).toHaveLength(0);
  });

  it("excludes bots from offline directory", () => {
    const offline = listOfflineRegisteredProfiles(
      { [REG_A]: profile(REG_A, "BotUser", { is_bot: true }) },
      new Set(),
      "",
    );
    expect(offline).toHaveLength(0);
  });

  it("filterIrcOnlineMembers matches mapped profile username", () => {
    const members = [member("IRC_Nick", REG_A)];
    const profiles = { [REG_A]: profile(REG_A, "AliceProfile") };
    expect(filterIrcOnlineMembers(members, "alice", profiles)).toHaveLength(1);
    expect(filterIrcOnlineMembers(members, "zzz", profiles)).toHaveLength(0);
  });
});
