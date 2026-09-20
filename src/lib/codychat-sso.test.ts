import { describe, expect, it } from "vitest";
import {
  avatarFingerprint,
  buildCodyChatSsoToken,
  isYaarzoLogoutMessage,
  resolveSsoUsername,
  verifyCodyChatSsoToken,
  YAARZO_LOGOUT_MESSAGE_TYPE,
} from "./codychat-sso-core";

const SECRET = "test-sso-secret-for-unit-tests-only";
const USER_ID = "a1b2c3d4-e5f6-4890-a234-567890abcdef";

describe("codychat-sso-core", () => {
  it("builds and verifies a valid token", () => {
    const now = 1_700_000_000;
    const token = buildCodyChatSsoToken(
      {
        sub: USER_ID,
        username: "ranjha",
        avatar: "https://cdn.example.com/a.jpg",
        gender: "other",
        exp: 0,
        avatar_fp: avatarFingerprint("https://cdn.example.com/a.jpg"),
      },
      SECRET,
      now,
    );
    const result = verifyCodyChatSsoToken(token, SECRET, now + 30);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.sub).toBe(USER_ID);
      expect(result.payload.username).toBe("ranjha");
    }
  });

  it("rejects expired token", () => {
    const now = 1_700_000_000;
    const token = buildCodyChatSsoToken(
      { sub: USER_ID, username: "u", avatar: "", gender: "other", exp: 0 },
      SECRET,
      now,
    );
    const result = verifyCodyChatSsoToken(token, SECRET, now + 500);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });

  it("rejects invalid signature", () => {
    const now = 1_700_000_000;
    const token = buildCodyChatSsoToken(
      { sub: USER_ID, username: "u", avatar: "", gender: "other", exp: 0 },
      SECRET,
      now,
    );
    const result = verifyCodyChatSsoToken(`${token}x`, SECRET, now + 10);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_signature");
  });

  it("uses canonical sub id in payload only", () => {
    const name = resolveSsoUsername("new_name", "Display", USER_ID);
    expect(name).toBe("new_name");
    expect(resolveSsoUsername("", "", USER_ID)).toBe(`user_${USER_ID.slice(0, 8)}`);
  });

  it("validates logout postMessage shape and origin", () => {
    expect(
      isYaarzoLogoutMessage(
        { type: YAARZO_LOGOUT_MESSAGE_TYPE, source: "codychat" },
        "https://chat.yaarzo.com",
        ["https://yaarzo.com", "https://www.yaarzo.com"],
      ),
    ).toBe(false);
    expect(
      isYaarzoLogoutMessage(
        { type: YAARZO_LOGOUT_MESSAGE_TYPE, source: "codychat" },
        "https://yaarzo.com",
        ["https://yaarzo.com"],
      ),
    ).toBe(true);
    expect(isYaarzoLogoutMessage({ type: "EVIL" }, "https://yaarzo.com", ["https://yaarzo.com"])).toBe(
      false,
    );
  });

  it("does not expose secrets in token payload", () => {
    const token = buildCodyChatSsoToken(
      { sub: USER_ID, username: "u", avatar: "", gender: "other", exp: 0 },
      SECRET,
      1_700_000_000,
    );
    expect(token).not.toContain(SECRET);
    expect(token.split(".")[0]).not.toContain("service");
  });
});
