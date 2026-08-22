import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import {
  checkConnectionHealth,
  connectBlueskySession,
  createOauthState,
  disconnectPlatform,
  envFlags,
  listFacebookPagesPublic,
  listPinterestBoardsPublic,
  listPublicConnections,
  selectFacebookPage,
  setPinterestBoard,
} from "./social-connections.server";

async function loadStaffRoles(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role as string);
}

async function assertAdmin(userId: string) {
  const roles = await loadStaffRoles(userId);
  if (!roles.includes("super_admin") && !roles.includes("admin")) {
    throw new Error("Forbidden: admin only");
  }
}

async function assertAdminOrModerator(userId: string) {
  const roles = await loadStaffRoles(userId);
  if (roles.length === 0) throw new Error("Forbidden");
  return roles;
}

export const getSocialConnectionsState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    const roles = await assertAdminOrModerator(context.userId);
    const connections = await listPublicConnections();
    return {
      connections,
      env: envFlags(),
      canManageConnections: roles.includes("super_admin") || roles.includes("admin"),
    };
  });

export const startSocialOauth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ platform: z.enum(["facebook", "pinterest"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { authorizeUrl } = await createOauthState({
      platform: data.platform,
      adminUserId: context.userId,
    });
    return { ok: true as const, authorizeUrl };
  });

export const disconnectSocialConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ platform: z.enum(["facebook", "pinterest", "bluesky"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await disconnectPlatform(data.platform);
    return { ok: true as const };
  });

export const pingSocialConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ platform: z.enum(["facebook", "pinterest", "bluesky"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    return checkConnectionHealth(data.platform);
  });

export const listFacebookPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const pages = await listFacebookPagesPublic();
    return { pages };
  });

export const chooseFacebookPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ pageId: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await selectFacebookPage(data.pageId, context.userId);
    return { ok: true as const };
  });

export const listPinterestBoards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const boards = await listPinterestBoardsPublic();
    return { boards };
  });

export const choosePinterestBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({ boardId: z.string().min(1).max(128) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await setPinterestBoard(data.boardId, context.userId);
    return { ok: true as const };
  });

export const connectBlueskyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        identifier: z.string().min(2).max(200),
        appPassword: z.string().min(4).max(200),
        pds: z.string().url().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await connectBlueskySession({
      identifier: data.identifier,
      appPassword: data.appPassword,
      pds: data.pds,
      adminUserId: context.userId,
    });
    return { ok: true as const };
  });
