import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signGuestGatewayToken,
  verifyGuestGatewayToken,
} from "./irc-guest-auth.cjs";

describe("irc-guest-auth", () => {
  const secret = "test-secret-key";

  it("signs and verifies guest gateway tokens", () => {
    const visitorId = "visitor_abc123";
    const nickname = "Ranjha";
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    const token = signGuestGatewayToken(visitorId, nickname, expiresAt, secret);
    assert.equal(
      verifyGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret),
      true,
    );
  });

  it("rejects expired tokens", () => {
    const visitorId = "visitor_abc123";
    const nickname = "Ranjha";
    const expiresAt = new Date(Date.now() - 1000).toISOString();
    const token = signGuestGatewayToken(visitorId, nickname, expiresAt, secret);
    assert.equal(
      verifyGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret),
      false,
    );
  });
});
