import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";
import {
  avatarFingerprint,
  buildCodyChatSsoToken,
  resolveSsoUsername,
} from "./codychat-sso-core";
import { getCodyChatPublicBaseUrl } from "./codychat-public-url";

export class CodyChatSsoDeniedError extends Error {
  readonly code = "CHAT_ACCESS_DENIED" as const;
  constructor(message = "Chat access is not available for this account.") {
    super(message);
    this.name = "CodyChatSsoDeniedError";
  }
}

async function assertChatAccessAllowed(
  supabaseAdmin: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> },
  userId: string,
): Promise<void> {
  const { data: isBanned, error: banError } = await supabaseAdmin.rpc("is_user_banned", {
    _user_id: userId,
  });
  if (banError) {
    throw new Error("Unable to verify account status.");
  }
  if (isBanned === true) {
    throw new CodyChatSsoDeniedError();
  }
}

export const getCodyChatSsoUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("chat.message")])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };

    const secret = process.env.CODYCHAT_SSO_SECRET?.trim();
    if (!secret) {
      throw new Error("CodyChat SSO is not configured.");
    }

    const chatBase = getCodyChatPublicBaseUrl();

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    await assertChatAccessAllowed(supabaseAdmin, userId);

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, avatar_url, gender")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      throw new Error("Yaarzo profile not found.");
    }

    const username = resolveSsoUsername(
      profile.username,
      profile.display_name,
      userId,
    );
    const avatar = profile.avatar_url?.trim() || "";
    const gender = profile.gender?.trim() || "other";

    const token = buildCodyChatSsoToken(
      {
        sub: userId,
        username,
        avatar,
        gender,
        exp: 0,
        avatar_fp: avatar ? avatarFingerprint(avatar) : "",
      },
      secret,
    );

    return {
      url: `${chatBase}/yaarzo-sso.php?token=${encodeURIComponent(token)}`,
    };
  });
