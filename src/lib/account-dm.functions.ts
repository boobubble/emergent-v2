import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROLE_RANK: Record<string, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
};

function dmChannelFor(meId: string, peerId: string): string {
  return "dm:" + [meId, peerId].sort().join(":");
}

// Delete the caller's own account (auth + all data). Super admins are blocked.
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Safety: do not let super_admins self-delete (use staff workflow).
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if ((roles ?? []).some((r) => r.role === "super_admin")) {
      throw new Error("Super admins cannot self-delete. Ask another super admin.");
    }

    const { error: cascadeErr } = await supabaseAdmin.rpc("delete_user_cascade", { _user: userId });
    if (cascadeErr) throw new Error(cascadeErr.message);

    const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (dErr) throw new Error(dErr.message);

    return { ok: true };
  });

// Delete a DM conversation (both sides). Gated by app_settings.dm_chat_delete.min_role.
export const deleteMyDmConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { peerId: string }) => {
    if (!input || typeof input.peerId !== "string" || !UUID_RE.test(input.peerId)) {
      throw new Error("Invalid peer id");
    }
    return { peerId: input.peerId };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Look up min role from settings (default: user / everyone).
    const { data: setting } = await supabaseAdmin
      .from("app_settings")
      .select("value")
      .eq("key", "dm_chat_delete")
      .maybeSingle();
    const minRoleRaw = (setting?.value as { min_role?: string } | null)?.min_role ?? "user";
    const minRank = ROLE_RANK[minRoleRaw] ?? 0;

    // Caller's highest rank.
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const myRank = (roles ?? []).reduce(
      (acc, r) => Math.max(acc, ROLE_RANK[r.role as string] ?? 0),
      0,
    );
    if (myRank < minRank) {
      throw new Error("You don't have permission to delete DM chats.");
    }

    const channelId = dmChannelFor(userId, data.peerId);

    // Wipe messages + read receipts for this channel.
    const { error: mErr } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("channel_id", channelId);
    if (mErr) throw new Error(mErr.message);

    await supabaseAdmin.from("dm_reads").delete().eq("channel_id", channelId);

    return { ok: true, channelId };
  });
