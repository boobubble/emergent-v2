import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

async function requireAdmin(context: any) {
  const { data: ok } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (!ok) throw new Error("Forbidden");
}

// Split a SQL script into individual statements while respecting dollar-quoted
// blocks (functions) and single-line comments. Good enough for the schema/data
// files we emit from admin_export_schema_sql + our INSERT stream.
export function splitSqlStatements(sql: string): string[] {
  const out: string[] = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let dollarTag: string | null = null;
  while (i < sql.length) {
    const ch = sql[i];
    const next2 = sql.substr(i, 2);
    // line comment
    if (!inSingle && !dollarTag && next2 === "--") {
      const eol = sql.indexOf("\n", i);
      const stop = eol === -1 ? sql.length : eol;
      buf += sql.slice(i, stop);
      i = stop;
      continue;
    }
    // dollar-quoted block start/end
    if (!inSingle) {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        const tag = m[0];
        if (dollarTag === null) dollarTag = tag;
        else if (dollarTag === tag) dollarTag = null;
        buf += tag;
        i += tag.length;
        continue;
      }
    }
    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      buf += ch;
      i++;
      continue;
    }
    if (!inSingle && !dollarTag && ch === ";") {
      const stmt = buf.trim();
      if (stmt) out.push(stmt);
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

// Same splitter as splitSqlStatements, but also returns the 1-based line
// number where each statement started in the original source. Used by the
// backup validator so it can report file + line on restore failures.
export function splitSqlStatementsWithLines(sql: string): { text: string; startLine: number }[] {
  const out: { text: string; startLine: number }[] = [];
  let buf = "";
  let bufStartLine = 1;
  let line = 1;
  let bufHasContent = false;
  let i = 0;
  let inSingle = false;
  let dollarTag: string | null = null;
  const pushChar = (ch: string) => {
    if (!bufHasContent && ch.trim() !== "") {
      bufStartLine = line;
      bufHasContent = true;
    }
    buf += ch;
    if (ch === "\n") line++;
  };
  while (i < sql.length) {
    const ch = sql[i];
    const next2 = sql.substr(i, 2);
    if (!inSingle && !dollarTag && next2 === "--") {
      const eol = sql.indexOf("\n", i);
      const stop = eol === -1 ? sql.length : eol;
      for (let k = i; k < stop; k++) pushChar(sql[k]);
      i = stop;
      continue;
    }
    if (!inSingle) {
      const m = sql.slice(i).match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        const tag = m[0];
        if (dollarTag === null) dollarTag = tag;
        else if (dollarTag === tag) dollarTag = null;
        for (let k = 0; k < tag.length; k++) pushChar(tag[k]);
        i += tag.length;
        continue;
      }
    }
    if (!dollarTag && ch === "'") {
      inSingle = !inSingle;
      pushChar(ch);
      i++;
      continue;
    }
    if (!inSingle && !dollarTag && ch === ";") {
      const stmt = buf.trim();
      if (stmt) out.push({ text: stmt, startLine: bufStartLine });
      buf = "";
      bufHasContent = false;
      i++;
      continue;
    }
    pushChar(ch);
    i++;
  }
  const tail = buf.trim();
  if (tail) out.push({ text: tail, startLine: bufStartLine });
  return out;
}

export const restoreDatabaseSql = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) =>
    z.object({
      sql: z.string().min(1).max(50_000_000),
      phase: z.enum(["schema", "data", "full"]).default("full"),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const stmts = splitSqlStatements(data.sql);
    let ok = 0;
    let failed = 0;
    const errors: { stmt: string; message: string }[] = [];
    // Execute in batches to keep individual RPC payloads reasonable.
    for (const stmt of stmts) {
      const { error } = await (context.supabase as any).rpc("admin_exec_sql", { _sql: stmt });
      if (error) {
        failed++;
        if (errors.length < 25) errors.push({ stmt: stmt.slice(0, 160), message: error.message });
      } else {
        ok++;
      }
    }
    return { ok, failed, total: stmts.length, errors };
  });

export const getStorageBucketNames = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.listBuckets();
    return (data ?? []).map((b) => b.name);
  });

export const purgeExpiredBackups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await (context.supabase as any).rpc("backup_history_purge_expired");
    if (error) throw new Error(error.message);
    return { removed: (data as unknown as number) ?? 0 };
  });
