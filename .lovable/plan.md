# Competition Page Premium Community Expansion

Reuses existing Feed / PostCard / reactions / realtime / competitions engine. No new post system, no duplicate storage. Extends the meme integration that already added `posts.category` + `posts.competition_id` + `posts.nominee_id`.

## 1. Data — one small migration

Extend the existing `posts.category` values to include the four Fun Zone types (values only; column already exists):

- `meme`
- `fan_art`
- `poster`
- `fan_edit`

Extend `mehfil_hall_of_fame` … *(reuse `competition_awards` instead — it already exists).* Add three award kinds to `competition_awards.award_type`:

- `meme_of_battle`
- `fan_art_winner`
- `best_campaign_poster`

Each row already stores `post_id`/`user_id`/`competition_id`/`stats jsonb` — no schema change required beyond allowing the new enum-like strings (it's `text`).

Admin toggles under `app_settings.modules`:

- `funZone` (master, default on)
- `funZoneMemes`, `funZoneFanArts`, `funZonePosters`, `funZoneFanEdits` (default on)
- `battleRecap` (default on)
- `autoAwards` (default on — controls automatic Meme/Fan Art/Poster picks on finish)

## 2. Feed Composer (`src/components/feed/Composer.tsx`)

Replace the single "😂 Meme" chip with a **Post Type** dropdown that appears alongside the existing Post/Poll/Confess modes:

```
Type: [ Normal | 😂 Meme | 🎨 Fan Art | 📸 Poster | 🎥 Fan Edit ]
```

- Selecting anything other than Normal sets `posts.category` to the matching key.
- The existing Related Competition + Supported Nominee selectors show for ALL four fun types (not just meme). Same insert path.

## 3. Fun Zone section (`src/components/competitions/FunZone.tsx` — new)

Compact block mounted on `src/routes/competitions.$slug.tsx` between the poll/nominees and the current Trending Memes carousel. Four cards in a horizontal snap row:

```text
┌ 😂 Memes ┐ ┌ 🎨 Fan Arts ┐ ┌ 📸 Posters ┐ ┌ 🎥 Fan Edits ┐
│ thumb    │ │ thumb       │ │ thumb      │ │ thumb        │
│ 128 posts│ │ 24 posts    │ │ 12 posts   │ │ 7 posts      │
│ 2m ago   │ │ 15m ago     │ │ 1h ago     │ │ 3h ago       │
└View all →┘ └View all →   ┘ └View all → ┘ └View all →   ┘
```

- One query: `posts_safe` where `competition_id=<id>` grouped by `category` → count, latest `created_at`, latest thumbnail. Ranked by engagement inside each bucket for the thumbnail.
- Each card links to `/competitions/$slug/fun/$type` (new route below) which reuses `PostCard`.
- Realtime channel filtered by `competition_id` refreshes counts/thumbs — reuses the pattern from `CompetitionMemesCarousel`.
- Individual cards hidden by their module flag; whole block hidden by `funZone`.

The existing Trending Memes carousel stays; Fun Zone sits above it as the entry-point summary.

## 4. Filtered listing route (`src/routes/competitions.$slug.fun.$type.tsx` — new)

- Accepts `type ∈ {memes,fan-arts,posters,fan-edits}`.
- Renders header ("😂 Memes for Battle X"), reuses `PostCard` list from `posts_safe` filtered by competition + category.
- Optional `?nominee=<id>` filter reused.
- Existing `/competitions/$slug/memes` route stays as an alias → redirects to `/fun/memes`.

## 5. Auto awards on competition finish

Reuse the existing "competition finish" server flow (wherever `competitions.status → 'completed'` is transitioned + winners inserted into `competition_awards`). Extend that server fn to also compute:

- Meme of the Battle
- Fan Art Winner
- Best Campaign Poster

Ranking SQL against `posts_safe`:

```sql
score = reaction_count*2 + comment_count*3
      + coalesce((extract(epoch from (now()-created_at))/-86400.0), 0)
```

For each of the three categories, pick the top row where `competition_id=<id> AND category=<key>` and insert into `competition_awards` with the new `award_type` string. Tie → newest wins.

If `autoAwards` module flag is off, skip. If a category has zero posts, no award is created.

## 6. Battle Recap page (`src/routes/competitions.$slug.recap.tsx` — new)

Public, SEO-friendly. Read-only. Rendered automatically for competitions with `status='completed'`; the competition page shows a big "View Battle Recap" CTA once completed.

Sections:

- Podium (Winner / Runner-up / Third from `competition_awards`).
- Stat grid: total votes (`competition_votes` count), participants (`competition_competitors` count), reactions/comments (aggregated from `posts_safe` filtered by competition), duration, prize.
- 🏆 Fun Zone Winners cards: Meme / Fan Art / Poster (each reusing `PostCard`).
- 🔥 Most Active Supporter — top user by combined votes cast + comments authored on this competition's posts.
- ⭐ Most Shared Post — highest engagement post overall for the competition.
- Voting timeline — small sparkline built from grouped `competition_votes.created_at` by day (Recharts, already in project).
- Top 5 Moments — top 5 posts by engagement across all Fun Zone categories.

Lazy-loaded — the route is a separate file, so it code-splits automatically.

## 7. Hall of Fame update (`src/routes/competitions.hall-of-fame.tsx`)

Each Hall of Fame card gains a small "Fun Zone winners" strip under the podium row, reading the three new `competition_awards` rows for that competition. Existing layout untouched otherwise. Link → the new Recap page.

## 8. Realtime

- Fun Zone block and per-type list already share the `postgres_changes` filter `competition_id=eq.<id>` used by `CompetitionMemesCarousel`. No new channels.
- Recap page is read-once (competition already finished); no realtime needed.

## 9. Admin

Add toggle rows in `src/routes/admin.modules.tsx` for the new flags, next to the existing `competitionMemes` group.

## Files touched

- Migration — `posts.category` value docs (no DDL) + `competition_awards.award_type` values allowed.
- `src/lib/app-settings.tsx` — new module flags.
- `src/lib/admin-modules.ts` — register toggles.
- `src/components/feed/Composer.tsx` — post-type dropdown (replaces meme-only chip).
- `src/components/competitions/FunZone.tsx` — new summary block.
- `src/components/competitions/BattleRecap*.tsx` — new recap widgets.
- `src/routes/competitions.$slug.tsx` — mount FunZone + Recap CTA.
- `src/routes/competitions.$slug.fun.$type.tsx` — new filtered listing route.
- `src/routes/competitions.$slug.recap.tsx` — new recap route.
- `src/routes/competitions.hall-of-fame.tsx` — Fun Zone winners strip.
- Server fn that finalises competitions — extend to write three new awards.
- `src/routes/admin.modules.tsx` — new toggles.

## Backward compatibility

- No column removals; `category` stays optional and existing meme posts keep working.
- Existing `/competitions/:slug/memes` route redirects into new fun route.
- `competition_awards` already used for podium — adding new `award_type` strings is additive.

Ready to implement on approval.
