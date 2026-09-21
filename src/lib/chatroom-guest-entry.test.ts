import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseChatroomGuestIntent,
  shouldRedirectSignedOutFromChatroom,
  shouldRequestChatroomHmacSso,
  shouldUseNativeCodyChatGuestEntry,
  canEvaluateChatroomGuestEntry,
} from "./chatroom-guest-entry";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

const confirmedSignedOut = { ready: true, hydrationSlow: false, hydrationError: null };
const pending = { ready: false, hydrationSlow: false, hydrationError: null };
const slow = { ready: false, hydrationSlow: true, hydrationError: null };
const errored = { ready: false, hydrationSlow: false, hydrationError: "network" };

describe("parseChatroomGuestIntent", () => {
  it("accepts guest=1 and rejects absent or other values", () => {
    expect(parseChatroomGuestIntent({ guest: "1" })).toBe(true);
    expect(parseChatroomGuestIntent({ guest: 1 as unknown as string })).toBe(true);
    expect(parseChatroomGuestIntent({})).toBe(false);
    expect(parseChatroomGuestIntent({ guest: "0" })).toBe(false);
  });
});

describe("chatroom guest entry vs HMAC SSO", () => {
  it("uses native CodyChat URL only when confirmed signed-out with guest intent", () => {
    expect(shouldUseNativeCodyChatGuestEntry(confirmedSignedOut, null, true)).toBe(true);
    expect(shouldUseNativeCodyChatGuestEntry(confirmedSignedOut, null, false)).toBe(false);
    expect(shouldUseNativeCodyChatGuestEntry(confirmedSignedOut, { isGuest: false }, true)).toBe(
      false,
    );
  });

  it("redirects signed-out users without guest intent", () => {
    expect(shouldRedirectSignedOutFromChatroom(confirmedSignedOut, null, false)).toBe(true);
    expect(shouldRedirectSignedOutFromChatroom(confirmedSignedOut, null, true)).toBe(false);
  });

  it("requests HMAC SSO for authenticated users regardless of guest query", () => {
    const user = { isGuest: false as const };
    expect(shouldRequestChatroomHmacSso(confirmedSignedOut, user)).toBe(true);
  });

  it("never treats hydration pending/slow/error as guest entry", () => {
    expect(canEvaluateChatroomGuestEntry(pending)).toBe(false);
    expect(canEvaluateChatroomGuestEntry(slow)).toBe(false);
    expect(canEvaluateChatroomGuestEntry(errored)).toBe(false);
    expect(shouldUseNativeCodyChatGuestEntry(slow, null, true)).toBe(false);
    expect(shouldUseNativeCodyChatGuestEntry(errored, null, true)).toBe(false);
    expect(shouldRequestChatroomHmacSso(slow, { isGuest: false })).toBe(false);
  });
});

describe("ContinueAsGuestButton and chatroom route wiring", () => {
  it("navigates to explicit guest intent without nickname dialog", () => {
    const btn = read("src/components/auth/ContinueAsGuestButton.tsx");
    expect(btn).not.toMatch(/openNicknameDialog/);
    expect(btn).not.toMatch(/GuestNicknameDialog/);
    expect(btn).toMatch(/search:\s*\{\s*guest:\s*"1"\s*\}/);
    expect(btn).not.toMatch(/signInAnonymously|loginAsGuest/);
  });

  it("chatroom route uses native guest URL and preserves HMAC SSO for signed-in users", () => {
    const route = read("src/routes/chatroom.tsx");
    expect(route).toMatch(/validateSearch/);
    expect(route).toMatch(/getCodyChatNativeGuestEntryUrl/);
    expect(route).toMatch(/shouldUseNativeCodyChatGuestEntry/);
    expect(route).toMatch(/getCodyChatSsoUrl/);
    expect(route).toMatch(/shouldRequestChatroomHmacSso/);
    expect(route).not.toMatch(/signInAnonymously/);
  });
});
