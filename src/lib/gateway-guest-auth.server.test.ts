import { describe, expect, it } from "vitest";
import {
  fingerprintGatewaySecret,
  guestAuthExpiryValid,
  guestAuthFieldMeta,
  resolveGatewayGuestSecret,
  signGuestGatewayToken,
} from "./gateway-guest-auth.server";

describe("gateway-guest-auth diagnostics", () => {
  it("fingerprintGatewaySecret is 16 hex chars", () => {
    const fp = fingerprintGatewaySecret("test-secret");
    expect(fp).toMatch(/^[0-9a-f]{16}$/);
    expect(fp).not.toContain("test");
  });

  it("guestAuthFieldMeta reports presence type length only", () => {
    expect(guestAuthFieldMeta("abc")).toEqual({
      present: true,
      type: "string",
      length: 3,
    });
    expect(guestAuthFieldMeta("")).toEqual({
      present: false,
      type: "string",
      length: 0,
    });
  });

  it("guestAuthExpiryValid respects future ISO timestamps", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(guestAuthExpiryValid(future)).toBe(true);
    expect(guestAuthExpiryValid(new Date(Date.now() - 1000).toISOString())).toBe(false);
  });

  it("resolveGatewayGuestSecret prefers GATEWAY_GUEST_SECRET", () => {
    const prevGuest = process.env.GATEWAY_GUEST_SECRET;
    const prevSvc = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.GATEWAY_GUEST_SECRET = "guest-only-secret";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-should-not-be-used";

    const resolved = resolveGatewayGuestSecret();
    expect(resolved.source).toBe("GATEWAY_GUEST_SECRET");
    expect(resolved.secret).toBe("guest-only-secret");

    const visitorId = "visitor_diag";
    const expiresAt = new Date(Date.now() + 3600_000).toISOString();
    const token = signGuestGatewayToken(visitorId, "nick", expiresAt, resolved.secret);
    expect(token.length).toBe(64);

    process.env.GATEWAY_GUEST_SECRET = prevGuest;
    process.env.SUPABASE_SERVICE_ROLE_KEY = prevSvc;
  });
});
