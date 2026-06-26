import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Tables that are safe to snapshot. Keep this list explicit so we never
// accidentally export auth/internal data.
const BACKUP_TABLES = [
  "profiles",
  "app_settings",
  "posts",
  "comments",
  "reactions",
  "hashtags",
  "messages",
  "confessions",
  "confession_replies",
  "feedback_reports",
  "feedback_comments",
  "feedback_votes",
  "custom_pages",
  "url_rules",
  "word_filters",
  "trio_rooms",
  "user_roles",
  "user_chat_themes",
  "user_feed_themes",
  "chat_themes",
  "feed_themes",
] as const;

type TableSnapshot = { table: string; rows: any[]; count: number; truncated: boolean };

async function requireAdmin(context: any) {
  const { data: ok } = await context.supabase.rpc("has_role", {
    _user_id: context.userId, _role: "admin",
  });
  if (!ok) throw new Error("Forbidden");
}

export const backupDatabase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const MAX_ROWS = 5000;
    const tables: TableSnapshot[] = [];
    for (const t of BACKUP_TABLES) {
      try {
        const { data, error, count } = await supabaseAdmin
          .from(t as any)
          .select("*", { count: "exact" })
          .limit(MAX_ROWS);
        if (error) {
          tables.push({ table: t, rows: [], count: 0, truncated: false });
          continue;
        }
        tables.push({
          table: t,
          rows: data ?? [],
          count: count ?? (data?.length ?? 0),
          truncated: (count ?? 0) > MAX_ROWS,
        });
      } catch {
        tables.push({ table: t, rows: [], count: 0, truncated: false });
      }
    }
    return {
      version: 1,
      kind: "database",
      generated_at: new Date().toISOString(),
      tables,
    };
  });

export const backupMediaManifest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const out: any[] = [];
    for (const b of buckets ?? []) {
      const files: any[] = [];
      async function walk(prefix: string) {
        const { data } = await supabaseAdmin.storage.from(b.name).list(prefix, {
          limit: 1000, sortBy: { column: "name", order: "asc" },
        });
        for (const item of data ?? []) {
          const full = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) {
            await walk(full);
          } else {
            const { data: pub } = supabaseAdmin.storage.from(b.name).getPublicUrl(full);
            files.push({
              path: full,
              size: (item.metadata as any)?.size ?? null,
              mime: (item.metadata as any)?.mimetype ?? null,
              public_url: b.public ? pub.publicUrl : null,
            });
          }
        }
      }
      try { await walk(""); } catch { /* ignore */ }
      out.push({ name: b.name, public: b.public, files });
    }
    return {
      version: 1,
      kind: "media-manifest",
      generated_at: new Date().toISOString(),
      buckets: out,
    };
  });

export const restoreBackupDryRun = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ summary: z.record(z.string(), z.number()) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    // Restore is intentionally a dry-run: real cloud restore must use a
    // point-in-time snapshot from the database provider. We report what
    // would be touched so the admin can confirm.
    return {
      ok: true,
      dry_run: true,
      tables: Object.entries(data.summary).map(([table, rows]) => ({ table, rows })),
      note: "Restore is recorded for audit only. For a true rollback, request a point-in-time restore.",
    };
  });
