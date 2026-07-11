import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Post-Installation Setup Wizard — server functions.
 *
 * These endpoints are intentionally UNAUTHENTICATED because they run once,
 * before any user exists. Every write is guarded by a strict server-side
 * check: no super_admin role must currently exist. Once an owner is
 * created (and first_run_completed is set), all endpoints refuse further
 * writes.
 */

async function assertWizardOpen() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if ((count ?? 0) > 0) throw new Error("Setup wizard is disabled: Super Admin already exists.");

  const { data: firstRun } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "first_run_completed")
    .maybeSingle();
  if ((firstRun?.value as any)?.completed === true) {
    throw new Error("Setup wizard is disabled: first-run setup already completed.");
  }
}

export const getOwnerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ count: superCount, error: rolesErr }, { data: install }, { data: firstRun }] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin"),
    supabaseAdmin.rpc("get_install_status"),
    supabaseAdmin.from("app_settings").select("value").eq("key", "first_run_completed").maybeSingle(),
  ]);

  if (rolesErr) {
    return { hasOwner: false, installed: false, firstRunCompleted: false, error: rolesErr.message };
  }

  const installed = !!(install as any)?.installed;
  const firstRunCompleted = (firstRun?.value as any)?.completed === true;
  return { hasOwner: (superCount ?? 0) > 0, installed, firstRunCompleted };
});

const CommunityInput = z.object({
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  language: z.string().trim().min(2).max(10).default("en"),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
  currency: z.string().trim().min(2).max(8).default("USD"),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  faviconUrl: z.string().trim().url().max(500).optional().or(z.literal("")).default(""),
  homepage: z.enum(["welcome", "hero"]).default("welcome"),
});

/**
 * Save community info + homepage selection + seed missing default settings.
 * Only allowed while wizard is open (no owner + first_run not completed).
 */
export const saveCommunitySetup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CommunityInput.parse(data))
  .handler(async ({ data }) => {
    await assertWizardOpen();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Overwrite community info + homepage selection (user-chosen).
    const now = new Date().toISOString();
    const writes = [
      {
        key: "community",
        value: {
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          language: data.language,
          timezone: data.timezone,
          currency: data.currency,
          logo_url: data.logoUrl || null,
          favicon_url: data.faviconUrl || null,
        },
        updated_at: now,
      },
      {
        key: "homepage",
        value: { default: data.homepage },
        updated_at: now,
      },
    ];

    const { error: upErr } = await supabaseAdmin
      .from("app_settings")
      .upsert(writes as any, { onConflict: "key" });
    if (upErr) throw new Error(`Failed to save community info: ${upErr.message}`);

    // Seed defaults ONLY when missing (never overwrite existing values).
    const defaults: Record<string, any> = {
      chat_defaults: { slow_mode_sec: 0, allow_media: true, allow_links: true },
      feed_defaults: { allow_comments: true, allow_reactions: true, default_visibility: "public" },
      wallet_defaults: { starting_balance: 0, daily_bonus: 10, currency: data.currency },
      xp_defaults: { post: 5, comment: 2, reaction: 1, daily_login: 10 },
      notification_defaults: { email: true, push: true, in_app: true },
      gamification_defaults: { enabled: true, level_curve: "linear" },
    };

    const keys = Object.keys(defaults);
    const { data: existing } = await supabaseAdmin
      .from("app_settings")
      .select("key")
      .in("key", keys);
    const have = new Set((existing ?? []).map((r: any) => r.key));
    const toInsert = keys
      .filter((k) => !have.has(k))
      .map((k) => ({ key: k, value: defaults[k], updated_at: now }));
    if (toInsert.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("app_settings").insert(toInsert as any);
      if (insErr) throw new Error(`Failed to seed defaults: ${insErr.message}`);
    }

    return { ok: true, seeded: toInsert.map((r) => r.key) };
  });

const CreateOwnerInput = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(200),
});

export const createOwner = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreateOwnerInput.parse(data))
  .handler(async ({ data }) => {
    await assertWizardOpen();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingUsername } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("username", data.username)
      .maybeSingle();
    if (existingUsername) throw new Error("Username is already taken.");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        username: data.username,
        full_name: data.fullName,
        display_name: data.fullName,
      },
    });
    if (createErr || !created?.user) {
      throw new Error(createErr?.message || "Failed to create user.");
    }
    const userId = created.user.id;

    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: userId, username: data.username, display_name: data.fullName } as any,
        { onConflict: "id" }
      );

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "super_admin" as any });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(`Failed to grant super_admin: ${roleErr.message}`);
    }

    // Mark first-run permanently completed so the wizard can never run again.
    const now = new Date().toISOString();
    await supabaseAdmin.from("app_settings").upsert(
      {
        key: "first_run_completed",
        value: { completed: true, completed_at: now, owner_id: userId },
        updated_at: now,
      } as any,
      { onConflict: "key" }
    );

    return { ok: true, userId, email: data.email };
  });
