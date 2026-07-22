## Goal

Combine `/competitions/hall-of-fame` and `/poetry/hall-of-fame` into a single, richer showcase at `/hall-of-fame` so visitors see every champion (competition winners + poetry battle laureates) in one place, with filters to narrow by type. Keep the existing data sources and reuse both existing card designs — nothing gets rebuilt.

## User-facing changes

1. **New unified page** at `/hall-of-fame`:
   - Hero (Trophy + tagline "Every champion. Every craft.")
   - Summary stats strip: total champions, competitions won, poetry battles won, current year winners
   - Tabs: **All · Competitions · Poetry**
   - Filter chips: Year, Category (competition or poetry), Rank (1st/2nd/3rd)
   - Search box (by winner username / competition or poem title)
   - Grouped by Year → then by type
   - Reuses the existing competition winner card and poetry winner card designs verbatim (no visual rebuild)

2. **Old routes become redirects**:
   - `/competitions/hall-of-fame` → `/hall-of-fame?tab=competitions`
   - `/poetry/hall-of-fame` → `/hall-of-fame?tab=poetry`
   - Preserves shared links and SEO (301-style client redirect with canonical set to the new URL).

3. **Nav wiring**:
   - Competitions index page link → `/hall-of-fame?tab=competitions`
   - Poetry `MehfilShell` "Hall of Fame" link → `/hall-of-fame?tab=poetry`
   - Add a top-level "Hall of Fame" entry point (optional secondary nav / homepage explore area — same slot competitions Hall link currently occupies).

4. **SEO**: one canonical page with strong metadata:
   - Title: "Hall of Fame — Champions of Competitions & Poetry"
   - OG/Twitter meta + JSON-LD `CollectionPage` describing the combined archive

## Technical plan

### Files to create
- `src/routes/hall-of-fame.tsx` — unified page. Fetches both sources in parallel using existing server functions:
  - `listHallOfFame` from `src/lib/competitions.functions.ts`
  - `getMehfilHallOfFame` (currently defined inline in `poetry.hall-of-fame.tsx`) — move to `src/lib/mehfil.functions.ts` so both the new page and the redirect stub can import it cleanly.
- Reuses existing UI primitives (Badge, Button) and lucide icons; no new components needed.

### Files to edit
- `src/routes/competitions.hall-of-fame.tsx` — replace body with a tiny `<Navigate to="/hall-of-fame" search={{ tab: "competitions" }} replace />` redirect. Keep the file so old bookmarks resolve.
- `src/routes/poetry.hall-of-fame.tsx` — same treatment (redirect to `/hall-of-fame?tab=poetry`). Move the inline `getMehfilHallOfFame` server fn to the shared lib first.
- `src/routes/competitions.index.tsx` — update the "Hall of Fame" Link `to` to `/hall-of-fame` with `search={{ tab: "competitions" }}`.
- `src/components/mehfil/MehfilShell.tsx` — update the "Hall of Fame" Link the same way (`/hall-of-fame` + `?tab=poetry`).
- `src/lib/mehfil.functions.ts` — export `getMehfilHallOfFame`.

### Data shape (unified in-memory only, no DB changes)
Each row is normalized in the page component into:
```ts
{ kind: "competition" | "poetry",
  year: number, rank: number,
  profile: { username, display_name?, avatar_url? } | null,
  title: string,         // competition.name OR poem.title
  linkTo: string,        // /competitions/$slug or /poetry/$slug
  linkParams: { slug: string },
  category?: { name, color? },
  stats: { votes?, share?, prize?, awardedAt } }
```
This lets one shared card render either kind while preserving the existing look of each variant (kind toggles the accent color / icon set).

### No DB changes
Both `competition_awards`-driven data and `mehfil_hall_of_fame` remain untouched. No migrations, no RLS edits.

### Guest access
`/hall-of-fame` is a public read-only page. Add `"/hall-of-fame"` to `READ_ONLY_PUBLIC_APP_PREFIXES` in `src/routes/__root.tsx` so unauthenticated visitors are not redirected.

### Verification
- Typecheck the new/edited files.
- Manually walk: `/hall-of-fame` renders both data sets; tab switching works; old URLs redirect and land on the right tab; guest access works.

## Out of scope
- No new database columns, tables, or policies.
- No changes to how winners are awarded or computed.
- No redesign of the winner card visuals — reused as-is.