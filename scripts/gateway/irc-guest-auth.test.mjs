import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signGuestGatewayToken,
  verifyGuestGatewayToken,
  diagnoseGuestGatewayToken,
  fingerprintGatewaySecret,
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
    assert.deepEqual(
      diagnoseGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret),
      { valid: false, reason: "EXPIRED" },
    );
  });

  it("diagnoseGuestGatewayToken reports precise failure reasons", () => {
    const visitorId = "visitor_abc123";
    const nickname = "Ranjha";
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    const token = signGuestGatewayToken(visitorId, nickname, expiresAt, secret);

    assert.deepEqual(
      diagnoseGuestGatewayToken({ visitorId, nickname, expiresAt, token }, secret),
      { valid: true, reason: "OK" },
    );
    assert.equal(diagnoseGuestGatewayToken({ visitorId, nickname, expiresAt, token }, "").reason, "MISSING_SECRET");
    assert.equal(
      diagnoseGuestGatewayToken({ visitorId: "", nickname, expiresAt, token }, secret).reason,
      "MISSING_FIELDS",
    );
    assert.equal(
      diagnoseGuestGatewayToken({ visitorId: "bad", nickname, expiresAt, token }, secret).reason,
      "BAD_VISITOR",
    );
    assert.equal(
      diagnoseGuestGatewayToken({ visitorId, nickname, expiresAt, token: "00" }, secret).reason,
      "HMAC_MISMATCH",
    );
  });

  it("fingerprintGatewaySecret returns 16 hex chars without exposing secret", () => {
    const fp = fingerprintGatewaySecret(secret);
    assert.match(fp, /^[0-9a-f]{16}$/);
    assert.notEqual(fp, secret);
  });
});
