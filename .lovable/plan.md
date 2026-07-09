
# Enterprise Backup Extensions

All additions layer on top of the existing Backup Center. No existing button, download, ZIP layout, or restore path changes.

## 1. Verification (post-backup)

After the Full Backup ZIP is produced (still in-browser), re-open it with JSZip and check:
- ZIP parses without error
- Presence: `manifest.json`, `backup-info.json`, `database/database.sql`, `database/schema.sql`, `database/data.sql`, `database/stats.json`, `media-manifest.json`
- Each present file has size > 0
- `database.sql` starts with the expected header comment
- `backup-info.json` parses and contains `app_version`, `generated_at`, `total_tables`, `total_rows_exported`

Render a small "Verification" panel under the Full Backup card:
`✓ Backup Verified` (green) or `Verification Failed — <first missing/broken item>` (red). Toast only fires on success once verification passes.

## 2. Checksums

Compute SHA-256 and MD5 of the final ZIP blob in the browser (SubtleCrypto for SHA-256; small JS MD5 helper we add to `src/lib/hash.ts`). Write a companion file `checksums.json` alongside the download containing both hashes plus filename + byte size. Also display them in the verification panel with a copy button.

## 3. Optional Encryption

Add a checkbox `Encrypt backup (AES-256)` next to the Full Backup button and a password input that only appears when checked. On Full Backup with encryption:
- derive key with PBKDF2-SHA256 (200k iters, random salt)
- encrypt the ZIP bytes with AES-GCM (random IV)
- output `backup_<date>_full.zip.enc` containing `{ salt, iv, ciphertext }` (packed binary)
- also write `checksums.json` for the encrypted file
- never store the password

Restore accepts either the plain `.zip` or the `.zip.enc`; when encrypted, prompt for the password before continuing.

## 4. One-click Restore (extend existing)

Keep the current restore entry point. When a Full Backup ZIP is uploaded, detect `/database/*.sql` and run in order via a new server function `restoreDatabaseSql`:
1. `schema.sql` (statements split on `;` end-of-line, executed via new admin RPC)
2. `data.sql`
Then continue with the existing storage bucket + media file upload flow, plus a new `settings.json` write when present.

Progress panel gains new phases: Validating → Schema → Data → Buckets → Media → Done.

Because Cloud does not expose arbitrary `EXECUTE`, we add one SECURITY DEFINER admin RPC `admin_exec_sql(_sql text)` that runs a single statement, guarded by `is_admin(auth.uid())`. The server function batches statements and calls it. Documented clearly as admin-only.

## 5. Pre-restore Safety

Before executing, show a confirmation dialog listing:
- Current app version (from `APP_VERSION`) vs backup `app_version`
- Backup generated_at, total_tables, total_rows_exported
- ZIP size (MB)
- Warnings when versions differ or when tables in the backup don't exist in the current DB
- Estimated restore time (rough: 1s per 500 rows + 1s per 20 media files)

Restore only proceeds when the user clicks `Confirm Restore`.

## 6. Dry Run (Validate Backup)

New button `Validate Backup` (outline) on the Restore card. Runs verification steps only, without touching the database or storage:
- ZIP integrity
- Checksums match `checksums.json` if present
- All required files present and non-empty
- `schema.sql` parses at least one `CREATE TABLE`
- `backup-info.json` version compatibility check
- Storage bucket list compared against current project's buckets (missing/extra reported)

Renders a validation report card with pass/fail per check.

## 7. Backup History

New table `public.backup_history` (admin-only RLS) with columns for filename, size, type (`full`/`quick`/`media`/`database`), sha256, md5, verified, encrypted, generated_at, generated_by, expires_at, notes.

Each successful download inserts a row via `recordBackupHistory` server fn. History card lists rows with columns per spec and action buttons:
- Download — only for rows that carry a re-download token (see below)
- Verify Again — re-runs checksum against a re-uploaded file
- Restore — opens the file picker prefilled
- Delete — removes the row

Note on "Download": we do not persist backup blobs server-side (they can be many GB and Cloud storage is not sized for that). The action is enabled only if the admin re-uploads or if the row was created for a backup that also lives in an admin-selected storage bucket (opt-in). This is called out in the UI.

## 8. Retention

Settings row in `app_settings` (key `backup_retention`) with values `7d | 30d | 90d | forever`. A cron endpoint at `src/routes/api/public/backup-retention.ts` deletes rows in `backup_history` past their `expires_at` (computed from the retention setting at insert time). UI is a small `<Select>` on the Backup page.

## 9. Health Dashboard

New card at the top of the Backup page reading from `backup_history` + live counts:
- Latest backup (name + age)
- Latest verification status
- Latest restore test date (from a new column `last_restore_test_at`)
- Latest checksum status
- Total tables / total rows (from `admin_list_public_tables`)
- Database size (via new RPC `admin_db_size()` calling `pg_database_size`)
- Media size (sum from bucket listing)
- App version

## 10. Preserved

Untouched: existing Quick Backup, JSON Backup, Media Backup, Full Backup logic, ZIP internal structure (only adds `/checksums.json` when downloaded and `/database/*` which already exists), existing Restore behavior, existing UI cards. All new UI is additive.

---

## Technical Notes (for the developer)

- Files to add:
  - `src/lib/hash.ts` — SHA-256 (SubtleCrypto) + tiny MD5
  - `src/lib/backup-crypto.ts` — PBKDF2 + AES-GCM helpers
  - `src/lib/backup-verify.ts` — pure ZIP verification helpers
  - `src/lib/backup-history.functions.ts` — record / list / delete / mark-verified / mark-restored
  - `src/lib/backup-restore.functions.ts` — `restoreDatabaseSql`, `applyAppSettings`, `getDbSize`
  - `src/components/admin/BackupHealthCard.tsx`
  - `src/components/admin/BackupHistoryTable.tsx`
  - `src/components/admin/BackupVerificationPanel.tsx`
  - `src/components/admin/PreRestoreDialog.tsx`
  - `src/routes/api/public/backup-retention.ts`

- Migration:
  - `public.backup_history` table + RLS (`is_admin` only) + GRANTS
  - `public.admin_exec_sql(_sql text)` — SECURITY DEFINER, `is_admin` guard, EXECUTE via `EXECUTE _sql`
  - `public.admin_db_size()` — returns `pg_database_size(current_database())`
  - `public.app_settings` row seed for `backup_retention` default `30d`
  - Retention purge SQL function `public.backup_history_purge_expired()`

- `admin_exec_sql` is deliberately powerful and admin-only. It's the only way to actually apply a schema/data restore on Cloud, and the plan wires the button to it. The user should acknowledge this before we ship — surfaced in the pre-restore dialog with a red warning.

- Existing `admin.backup.tsx` gains: health card at top, extended options on Full Backup card (encryption checkbox + password), verification panel below the button, validate-backup button on the Restore card, backup history card at bottom. All existing cards remain byte-identical.
