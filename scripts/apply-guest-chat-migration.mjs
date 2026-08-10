#!/usr/bin/env node
/**
 * Apply ONLY supabase/migrations/20260810093000_guest_chat_messages.sql
 * to Yaarzo production Supabase (aofjhfsecwsrcvvvcfcy).
 * Does not deploy. Does not apply other migrations.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const root = process.cwd();
const EXPECTED_REF = "aofjhfsecwsrcvvvcfcy";
const DELETED_REF = "zemkntcobnppphxiptkn";
const MIGRATION = "supabase/migrations/20260810093000_guest_chat_messages.sql";
const POOLER_FALLBACK_HOST = "aws-1-ap-south-1.pooler.supabase.com";

function loadEnv() {
  const out = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = join(root, file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
      if (!m) continue;
      if (out[m[1]] == null) out[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return out;
}

function refFromUrl(url) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const m = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/i)
      || host.match(/^([a-z0-9]+)\.supabase\.co$/i);
    if (host.startsWith("db.") && m) return m[1];
    if (m && !host.includes("pooler")) return m[1];
    return null;
  } catch {
    return null;
  }
}

function refFromDbUrl(dbUrl) {
  const s = String(dbUrl || "");
  const dbHost = s.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
  if (dbHost) return dbHost[1];
  const poolerUser = s.match(/postgres\.([a-z0-9]+)[:@]/i);
  if (poolerUser && /pooler\.supabase\.com/i.test(s)) return poolerUser[1];
  const any = s.match(/([a-z0-9]+)\.supabase\.co/i);
  return any?.[1] ?? null;
}

function buildPoolerSessionUrl(dbUrl, ref) {
  const u = new URL(dbUrl);
  const password = decodeURIComponent(u.password);
  return {
    host: POOLER_FALLBACK_HOST,
    port: 5432,
    database: "postgres",
    username: `postgres.${ref}`,
    password,
    ssl: "require",
    prepare: false,
    max: 1,
    connect_timeout: 30,
  };
}

const env = loadEnv();
const apiUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const apiRef = refFromUrl(apiUrl);
const projectId = env.SUPABASE_PROJECT_ID || env.VITE_SUPABASE_PROJECT_ID || null;
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL;
const dbRef = refFromDbUrl(dbUrl);

console.log(JSON.stringify({
  tool: "node scripts/apply-guest-chat-migration.mjs",
  expected_ref: EXPECTED_REF,
  deleted_ref_blocked: DELETED_REF,
  api_ref: apiRef,
  project_id_env: projectId,
  db_ref: dbRef,
  has_db_url: !!dbUrl,
  migration: MIGRATION,
}, null, 2));

if (!dbUrl) {
  console.error("ERROR: SUPABASE_DB_URL / DATABASE_URL missing — cannot apply SQL migration.");
  process.exit(2);
}
if ([apiRef, projectId, dbRef].includes(DELETED_REF)) {
  console.error(`ERROR: Refusing deleted/old project ${DELETED_REF}`);
  process.exit(2);
}
if (apiRef && apiRef !== EXPECTED_REF) {
  console.error(`ERROR: SUPABASE_URL ref ${apiRef} != expected Yaarzo production ${EXPECTED_REF}`);
  process.exit(2);
}
if (projectId && projectId !== EXPECTED_REF) {
  console.error(`ERROR: SUPABASE_PROJECT_ID ${projectId} != expected ${EXPECTED_REF}`);
  process.exit(2);
}
if (dbRef && dbRef !== EXPECTED_REF) {
  console.error(`ERROR: DB URL ref ${dbRef} != expected ${EXPECTED_REF}`);
  process.exit(2);
}
if (!apiRef && !projectId && !dbRef) {
  console.error("ERROR: Could not confirm project ref from env.");
  process.exit(2);
}

const migrationSql = readFileSync(join(root, MIGRATION), "utf8");
if (!migrationSql.includes("guest_chat_messages") || !migrationSql.includes("Public read lobby messages")) {
  console.error("ERROR: Migration file does not look like the guest chat migration.");
  process.exit(2);
}

async function openSql() {
  // Prefer direct URL; on IPv6-only ENOTFOUND/ENETUNREACH use known IPv4 pooler session endpoint.
  let sql = postgres(dbUrl, { ssl: "require", prepare: false, max: 1, connect_timeout: 15 });
  try {
    await sql`select 1`;
    return { sql, connection: "direct_SUPABASE_DB_URL" };
  } catch (e) {
    const msg = String(e.message || e);
    try { await sql.end({ timeout: 1 }); } catch {}
    if (!/ENOTFOUND|ENETUNREACH|ECONNREFUSED|timeout/i.test(msg)) throw e;
    console.log(JSON.stringify({
      direct_connect_failed: true,
      reason: msg.slice(0, 160),
      fallback: `${POOLER_FALLBACK_HOST}:5432 session mode`,
    }));
    sql = postgres(buildPoolerSessionUrl(dbUrl, EXPECTED_REF));
    await sql`select 1`;
    return { sql, connection: `pooler_session_${POOLER_FALLBACK_HOST}:5432` };
  }
}

const report = (obj) => console.log(JSON.stringify(obj, null, 2));
const { sql, connection } = await openSql();

try {
  const ping = await sql`
    select current_database() as db, current_user as usr, now() as ts
  `;
  report({ connection_ok: true, connection, database: ping[0].db, user: ping[0].usr, project_ref: EXPECTED_REF });

  const policiesBefore = await sql`
    select pol.polname as name
    from pg_policy pol
    join pg_class c on c.oid = pol.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'messages'
    order by pol.polname
  `;

  console.log("Applying migration...");
  await sql.unsafe(migrationSql);
  console.log("Migration SQL executed.");

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('guest_chat_sessions', 'guest_chat_messages')
    order by table_name
  `;

  const guestPolicies = await sql`
    select c.relname as table_name,
           pol.polname as name,
           CASE pol.polcmd
             WHEN 'r' THEN 'SELECT'
             WHEN 'a' THEN 'INSERT'
             WHEN 'w' THEN 'UPDATE'
             WHEN 'd' THEN 'DELETE'
             WHEN '*' THEN 'ALL'
             ELSE pol.polcmd::text
           END as op,
           pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
           pg_get_expr(pol.polwithcheck, pol.polrelid) as check_expr,
           COALESCE(
             ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY (pol.polroles)),
             ARRAY[]::name[]
           ) as roles
    from pg_policy pol
    join pg_class c on c.oid = pol.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and (
        c.relname in ('guest_chat_messages', 'guest_chat_sessions')
        OR pol.polname ILIKE '%guest%'
        OR pol.polname = 'Public read lobby messages'
      )
    order by c.relname, pol.polname
  `;

  const guestWritePolicies = await sql`
    select c.relname as table_name, pol.polname as name,
           CASE pol.polcmd
             WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL'
             ELSE pol.polcmd::text
           END as op,
           COALESCE(ARRAY(SELECT rolname FROM pg_roles WHERE oid = ANY (pol.polroles)), ARRAY[]::name[]) as roles
    from pg_policy pol
    join pg_class c on c.oid = pol.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('guest_chat_messages', 'guest_chat_sessions')
      and pol.polcmd in ('a', 'w', 'd', '*')
  `;

  const policiesAfter = await sql`
    select pol.polname as name
    from pg_policy pol
    join pg_class c on c.oid = pol.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'messages'
    order by pol.polname
  `;

  const beforeNames = policiesBefore.map((p) => p.name);
  const afterNames = policiesAfter.map((p) => p.name);
  const added = afterNames.filter((n) => !beforeNames.includes(n));
  const removed = beforeNames.filter((n) => !afterNames.includes(n));

  const lobbyPolicy = guestPolicies.find((p) => p.name === "Public read lobby messages");
  const guestReadPolicy = guestPolicies.find((p) => p.name === "Read non-expired guest lobby messages");

  const rls = await sql`
    select c.relname, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in ('guest_chat_messages', 'guest_chat_sessions')
    order by 1
  `;

  const triggers = await sql`
    select event_object_table as table_name, trigger_name
    from information_schema.triggers
    where event_object_schema = 'public'
      and (
        event_object_table in ('guest_chat_messages', 'guest_chat_sessions')
        OR trigger_name ILIKE '%guest_chat%'
      )
    order by 1, 2
  `;

  const authTriggersAdded = await sql`
    select trigger_name, event_object_table, action_statement
    from information_schema.triggers
    where event_object_schema = 'auth'
      and (
        action_statement ILIKE '%guest_chat%'
        OR trigger_name ILIKE '%guest_chat%'
      )
  `;

  const profileTriggersGuest = await sql`
    select trigger_name, event_object_table, action_statement
    from information_schema.triggers
    where event_object_schema = 'public'
      and event_object_table = 'profiles'
      and (
        action_statement ILIKE '%guest_chat%'
        OR trigger_name ILIKE '%guest_chat%'
      )
  `;

  const setting = await sql`
    select key, value
    from public.app_settings
    where key = 'guest_chat'
  `;

  const probeVisitor = `visitor_verify_${Date.now().toString(36)}`;
  let writeProbe = { ok: false };
  try {
    await sql.begin(async (tx) => {
      await tx`
        insert into public.guest_chat_sessions (visitor_id, nickname, display_name, expires_at)
        values (${probeVisitor}, 'Verify', 'Guest-Verify', now() + interval '1 hour')
      `;
      const inserted = await tx`
        insert into public.guest_chat_messages (channel_id, visitor_id, display_name, text, expires_at)
        values ('lobby', ${probeVisitor}, 'Guest-Verify', 'migration verify probe', now() + interval '1 hour')
        returning id, channel_id
      `;
      writeProbe = {
        ok: true,
        path: "postgres_role_write_bypasses_rls_like_service_role",
        inserted_id: inserted[0]?.id,
        channel_id: inserted[0]?.channel_id,
      };
      throw new Error("ROLLBACK_PROBE");
    });
  } catch (e) {
    if (!String(e.message || e).includes("ROLLBACK_PROBE")) {
      writeProbe = { ok: false, error: String(e.message || e) };
    }
  }
  await sql`delete from public.guest_chat_messages where visitor_id = ${probeVisitor}`;
  await sql`delete from public.guest_chat_sessions where visitor_id = ${probeVisitor}`;

  async function anonOp(label, fn) {
    let blocked = null;
    let errMsg = null;
    try {
      await sql.begin(async (tx) => {
        await tx`set local role anon`;
        try {
          await fn(tx);
          blocked = false;
        } catch (err) {
          blocked = true;
          errMsg = String(err.message || err).slice(0, 240);
        }
        throw new Error("ROLLBACK_ANON");
      });
    } catch (e) {
      if (!String(e.message || e).includes("ROLLBACK_ANON") && blocked === null) {
        blocked = "inconclusive";
        errMsg = String(e.message || e).slice(0, 240);
      }
    }
    return { label, blocked, error: errMsg };
  }

  const anonInsert = await anonOp("insert_guest_chat_messages", (tx) => tx`
    insert into public.guest_chat_messages (channel_id, visitor_id, display_name, text, expires_at)
    values ('lobby', 'visitor_anon_probe', 'Guest-X', 'should fail', now() + interval '1 hour')
  `);
  const anonUpdate = await anonOp("update_guest_chat_messages", (tx) => tx`
    update public.guest_chat_messages set text = 'x' where false
  `);
  const anonDelete = await anonOp("delete_guest_chat_messages", (tx) => tx`
    delete from public.guest_chat_messages where false
  `);
  const anonSessionInsert = await anonOp("insert_guest_chat_sessions", (tx) => tx`
    insert into public.guest_chat_sessions (visitor_id, nickname, display_name, expires_at)
    values ('visitor_anon_probe', 'X', 'Guest-X', now() + interval '1 hour')
  `);

  const warnings = [];
  if (removed.length) warnings.push(`Unexpected removed messages policies: ${removed.join(", ")}`);
  const unexpectedAdds = added.filter((n) => n !== "Public read lobby messages");
  if (unexpectedAdds.length) warnings.push(`Unexpected added messages policies: ${unexpectedAdds.join(", ")}`);
  if (guestWritePolicies.length) {
    warnings.push(`Unexpected write policies on guest tables: ${guestWritePolicies.map((p) => `${p.table_name}:${p.name}:${p.op}`).join(", ")}`);
  }
  if (!lobbyPolicy) warnings.push("Missing Public read lobby messages policy");
  else if (!/channel_id\s*=\s*'lobby'/.test(String(lobbyPolicy.using_expr || ""))) {
    warnings.push(`Lobby anon SELECT using_expr unexpected: ${lobbyPolicy.using_expr}`);
  }
  if (!guestReadPolicy) warnings.push("Missing Read non-expired guest lobby messages policy");
  if (!setting[0]) warnings.push("app_settings.guest_chat row missing");
  if (connection.includes("pooler")) {
    warnings.push(`Connected via pooler fallback ${POOLER_FALLBACK_HOST} because direct db.* host is IPv6-only/unreachable from this network.`);
  }

  const verification = {
    "1_guest_chat_messages_exists": tables.some((t) => t.table_name === "guest_chat_messages"),
    "2_guest_chat_config_in_app_settings": !!setting[0],
    "3_expected_rls_policies_present": !!(guestReadPolicy && lobbyPolicy) && rls.every((r) => r.rls_enabled),
    "4_anon_select_only_where_intended": !!(
      guestReadPolicy?.op === "SELECT"
      && lobbyPolicy?.op === "SELECT"
      && guestWritePolicies.length === 0
    ),
    "5_anon_no_direct_write_on_guest_messages": guestWritePolicies.filter((p) => p.table_name === "guest_chat_messages").length === 0
      && anonInsert.blocked === true,
    "6_service_boundary_write_works": writeProbe.ok === true,
    "7_messages_anon_select_lobby_only": !!(
      lobbyPolicy?.op === "SELECT"
      && Array.isArray(lobbyPolicy.roles)
      && lobbyPolicy.roles.includes("anon")
      && /channel_id\s*=\s*'lobby'/.test(String(lobbyPolicy.using_expr || ""))
    ),
    "8_no_auth_profile_trigger_added": triggers.length === 0 && authTriggersAdded.length === 0 && profileTriggersGuest.length === 0,
    "9_registered_user_message_policies_unchanged":
      removed.length === 0 && added.every((n) => n === "Public read lobby messages"),
  };

  report({
    tool: "node scripts/apply-guest-chat-migration.mjs + postgres.js sql.unsafe(single migration file)",
    project_ref: EXPECTED_REF,
    connection,
    migration_applied: true,
    migration_file: MIGRATION,
    created_tables: tables.map((t) => t.table_name),
    rls,
    created_or_expected_policies: guestPolicies,
    guest_write_policies: guestWritePolicies,
    messages_policies_added: added,
    messages_policies_removed: removed,
    guest_chat_setting: setting[0] ?? null,
    service_boundary_write_probe: writeProbe,
    anon_write_probes: { anonInsert, anonUpdate, anonDelete, anonSessionInsert },
    verification,
    warnings,
  });

  const failed = Object.entries(verification).filter(([, v]) => !v);
  if (failed.length) {
    console.error("VERIFICATION_FAILED:", failed.map(([k]) => k).join(", "));
    process.exit(1);
  }
} catch (err) {
  console.error("ERROR applying/verifying migration:");
  console.error(err.message || err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}