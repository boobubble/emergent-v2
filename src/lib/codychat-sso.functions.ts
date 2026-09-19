import { createServerFn } from "@tanstack/react-start";
import { createHmac } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export const getCodyChatSsoUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };

    const secret = process.env.CODYCHAT_SSO_SECRET?.trim();

    if (!secret) {
      throw new Error("CodyChat SSO is not configured.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, avatar_url, gender")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new Error("Yaarzo profile not found.");
    }

    const username =
      profile.username?.trim() ||
      profile.display_name?.trim() ||
      `user_${userId.slice(0, 8)}`;

    const payload = {
      sub: userId,
      username,
      avatar: profile.avatar_url || "",
      gender: profile.gender || "other",
      exp: Math.floor(Date.now() / 1000) + 60,
    };

    const payloadEncoded = base64Url(JSON.stringify(payload));

    const signature = createHmac("sha256", secret)
      .update(payloadEncoded)
      .digest();

    const token = `${payloadEncoded}.${base64Url(signature)}`;

    return {
      url: `https://chat.yaarzo.com/yaarzo-sso.php?token=${encodeURIComponent(
        token
      )}`,
    };
  });