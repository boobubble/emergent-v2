## Goal
In the "Add nominee" dialog, only allow linking to an already-registered BooBubble user. Remove the "External" option entirely, and fix the search so existing members actually appear.

## Changes

### 1. Fix member search (`src/lib/competitions.functions.ts` → `adminSearchProfiles`)
The current query runs through the authenticated user's Supabase client, so RLS on `profiles` filters most rows out — that's why "JD" returns "No members found." Since the caller is already verified as admin via `assertAdmin`, switch the query to the privileged server client (`supabaseAdmin`, loaded inside the handler with `await import("@/integrations/supabase/client.server")`) so admins can search every registered profile by `username` or `display_name`. Keep the same 2-char minimum, sanitized `ilike` filter, and safe column projection (`id, username, display_name, avatar_url, avatar_color, verified`).

### 2. Remove the "External" tab (`src/components/competitions/CompetitorEditorDialog.tsx`)
- Delete the `<Tabs>` / `TabsList` / `external` `TabsContent` block; render only the "Search members" + linked-user card UI.
- Remove the external-only fields (`name`, `photo_url`, `cover_image_url` free-text inputs).
- Keep the "Competition bio" textarea and the shared Details/Featured/Pinned sections as competition-specific overrides.
- Save button becomes disabled until a member is linked (`draft.linked_user_id` is set). Name is auto-derived from the linked profile — no manual entry.
- Drop the `tab`, `setTab`, and related state; simplify `emptyCompetitor` usage accordingly (no code change to the export signature needed).

### 3. No DB / policy changes
`competition_competitors.linked_user_id` is already the field we set. External-only rows already in the DB keep working (read-only); admins just can't create new external nominees from the UI.

## Out of scope
- No changes to competitions list, admin route, or manage dialog.
- No schema migration.
- Existing external nominees are not migrated or deleted.
