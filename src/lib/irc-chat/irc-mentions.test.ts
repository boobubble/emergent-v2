import { describe, expect, it } from "vitest";
import {
  applyMentionInsertion,
  buildIrcMentionCandidates,
  filterMentionCandidates,
  findActiveMentionToken,
  splitTextMentionParts,
} from "./mentions";
import type { IrcChatMember } from "./types";

const MEMBERS: IrcChatMember[] = [
  { nick: "Ranjha", userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
  { nick: "irc_only", userId: "irc:stranger" },
];

const PROFILES = {
  "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa": {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    username: "ranjha",
    bio: null,
    about_me: null,
    avatar_url: null,
    avatar_color: "#000",
    xp: 0,
    level: 1,
    streak: 0,
    longest_streak: 0,
    status: "online",
    last_seen: null,
    gender: null,
    country_code: null,
    show_country_flag: null,
    show_guest_badge: null,
    birthday: null,
    hide_birth_year: null,
    is_bot: null,
    is_official: null,
  },
};

describe("irc mentions", () => {
  it("finds active mention token at caret", () => {
    const text = "Hello @ra world";
    const token = findActiveMentionToken(text, 9);
    expect(token?.query).toBe("ra");
    expect(token?.start).toBe(6);
  });

  it("filters registered username and IRC nick", () => {
    const candidates = buildIrcMentionCandidates(MEMBERS, PROFILES);
    const filtered = filterMentionCandidates(candidates, "ra");
    expect(filtered.some((c) => c.mentionKey === "ranjha")).toBe(true);
    const ircOnly = filterMentionCandidates(candidates, "irc");
    expect(ircOnly.some((c) => c.mentionKey === "irc_only")).toBe(true);
  });

  it("replaces only active mention token", () => {
    const token = findActiveMentionToken("Hey @ra ok", 7)!;
    const { nextText, nextCaret } = applyMentionInsertion("Hey @ra ok", 7, token, "ranjha");
    expect(nextText).toBe("Hey @ranjha  ok");
    expect(nextCaret).toBe("Hey @ranjha ".length);
  });

  it("highlights known mentions only", () => {
    const known = new Set(["ranjha"]);
    const parts = splitTextMentionParts("Hi @ranjha and @unknown", known, new Set());
    expect(parts.filter((p) => p.type === "mention" && p.known).length).toBe(1);
    expect(parts.some((p) => p.type === "mention" && !p.known)).toBe(true);
  });
});
