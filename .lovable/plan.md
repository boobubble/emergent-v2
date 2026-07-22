## Competition Meme Integration — Automatic (Feed-owned)

Memes stay in the Feed. Competition pages read Feed posts through filters. No separate composer, no duplication.

### 1. Data (single migration)

Add three columns to `public.posts` — Feed keeps ownership of the row:

- `category text` (nullable, e.g. `'meme'`). Indexed.
- `competition_id uuid` → `competitions(id)` on delete set null. Indexed.
- `nominee_id uuid` → `competition_competitors(id)` on delete set null. Indexed.

Extend `posts_safe` view to expose these three columns (currently masks only `owner_id`). RLS already lets anyone read public posts — no policy changes needed.

Three admin toggles under `app_settings.modules` (extend the existing `ModulesFlags`):

- `competitionMemes` (default on) — master switch.
- `nomineeMemeTagging` (default on) — nominee dropdown in composer + count on nominee card.
- `trendingMemeSection` (default on) — carousel on competition page.

### 2. Feed Composer (`src/components/feed/Composer.tsx`)

- Add a new `ModeChip` "😂 Meme" next to Post / Poll / Confess. Selecting it sets `category = 'meme'` (all other modes leave it null).
- When mode is `meme`, render an inline optional panel:
  - **Related Competition**: `<Popover>` typeahead calling `listActiveCompetitions({ query })`. Selected competition shown as removable chip.
  - **Supported Nominee**: appears only after a competition is chosen (and `nomineeMemeTagging` is on). Loads that competition's competitors via existing supabase query. Optional.
- Insert path unchanged — same `posts.insert` call, just spread `{ category: 'meme', competition_id, nominee_id }` when set. Media/text validation, XP, coins, hashtags all reused.
- Skipping both selectors yields a normal Feed meme (category=meme, no competition).

### 3. Competition page (`src/routes/competitions.$slug.tsx`)

New section rendered above/beside participants when `settings.modules.trendingMemeSection` is on:

**😂 Trending Battle Memes** — horizontal carousel, max 10.

- New helper `listCompetitionMemes(competitionId, { limit, nomineeId? })` in `src/lib/competition-memes.functions.ts` reading from `posts_safe`, filtered by `category='meme'` + `competition_id`, ordered by `(reaction_count + comment_count) DESC, created_at DESC`.
- Renders compact meme thumbnails (image/video) linking to the existing `/feed/$slug` permalink — so likes/comments/shares reuse `PostCard`.
- "View all →" links to `/feed?competition=<id>&category=meme`.

Nominee cards (`PremiumNomineeCards`): show `😂 Memes (N)` pill using per-nominee counts fetched in the same batch. Click filters the carousel + navigates to `/feed?competition=<id>&nominee=<id>&category=meme`.

### 4. Filtered Feed view

`src/routes/feed.index.tsx` reads `?competition=`, `?nominee=`, `?category=meme` search params and applies them to its existing query. Header shows a chip "Showing memes for <Competition>" with a clear button. No new route.

### 5. Realtime

Reuse existing `postgres_changes` subscription on `posts` inside `feed.index.tsx` and add a channel on the competition page filtered by `competition_id=eq.<id>` so the carousel refreshes when a new meme lands or reactions change. Rankings already update via existing reaction realtime.

### 6. Admin (`src/routes/admin.modules.tsx` or the closest existing modules screen)

Add three `ToggleRow`s in the Competition section wired to `modules.competitionMemes`, `modules.nomineeMemeTagging`, `modules.trendingMemeSection`. Reuse `updateSetting` server function.

### Files touched

- `supabase/migration` — new columns, indexes, updated `posts_safe`.
- `src/lib/app-settings.tsx` — extend `ModulesFlags` defaults.
- `src/lib/feed-types.ts` — extend `FeedPost` with new fields.
- `src/components/feed/Composer.tsx` — meme mode + selectors.
- `src/lib/competition-memes.functions.ts` — new server fn.
- `src/components/competitions/CompetitionMemesCarousel.tsx` — new.
- `src/components/competitions/PremiumNomineeCards.tsx` — meme count pill.
- `src/routes/competitions.$slug.tsx` — mount carousel.
- `src/routes/feed.index.tsx` — filter chips + query param wiring.
- `src/routes/admin.modules.tsx` — three toggles.

Ready to implement on approval.
