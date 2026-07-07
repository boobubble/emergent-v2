// Auto-bundled at build time. Every migration file under supabase/migrations/
// is inlined here as a raw string via Vite's glob import. This lets the
// installer apply the full schema without a Supabase CLI.
//
// The list is sorted by filename (timestamp prefix) so migrations run in the
// same order Supabase would run them.

const raw = import.meta.glob("../../supabase/migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface BundledMigration {
  /** Filename only, e.g. "20260522094209_xxx.sql" — the migration key. */
  name: string;
  /** Full SQL text. */
  sql: string;
}

export const BUNDLED_MIGRATIONS: BundledMigration[] = Object.entries(raw)
  .map(([path, sql]) => ({
    name: path.split("/").pop() || path,
    sql: sql as string,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const BUNDLED_MIGRATION_COUNT = BUNDLED_MIGRATIONS.length;
