/**
 * Game Launch Service — server side.
 *
 * Mints a short-lived HMAC-signed session token that external games use
 * to identify the launching user. Reusable for every registered game.
 *
 * Token format (JWT-style, HS256):
 *   base64url(header).base64url(payload).base64url(signature)
 *
 * Payload claims:
 *   sub          userId
 *   username
 *   displayName
 *   avatar
 *   iat          issued-at (epoch seconds)
 *   exp          expires-at (epoch seconds, iat + TTL)
 *   gid          gameId
 *   nonce        random 128-bit hex
 *
 * The external game verifies the signature with the same shared secret.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createHmac, randomBytes } from "crypto";

const TTL_SECONDS = 600; // 10 minutes

const InputSchema = z.object({
  gameId: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/i, "invalid gameId"),
});

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export const mintGameSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const secret = process.env.GAME_LAUNCH_HMAC_SECRET;
    if (!secret) throw new Error("GAME_LAUNCH_HMAC_SECRET not configured");

    const { supabase, userId } = context;

    // Fetch only non-sensitive display fields. RLS applies.
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: userId,
      username: profile?.username ?? null,
      displayName:
        (profile as { display_name?: string | null } | null)?.display_name ??
        profile?.username ??
        null,

      avatar: profile?.avatar_url ?? null,
      iat: now,
      exp: now + TTL_SECONDS,
      gid: data.gameId,
      nonce: randomBytes(16).toString("hex"),
    };

    const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
    const sig = createHmac("sha256", secret).update(signingInput).digest();
    const token = `${signingInput}.${b64url(sig)}`;

    return { token, expiresAt: payload.exp };
  });
