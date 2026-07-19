# Mehfil Phase 3 — Profile, Live Arena, Detail Rendering, Realtime

Reuses every existing surface. No new business logic.

## 1. Profile Mehfil section
- New component `src/components/mehfil/ProfileMehfilSection.tsx`:
  - Loads `mehfil_writer_stats` + last 6 published poems for the profile.
  - Renders: writer rank badge, poems count, upvotes, reads, battle wins, HoF count, recent poems grid, HoF entries strip.
- New server fn `getMehfilProfileSection(userId)` in `src/lib/mehfil.functions.ts` (publishable-key client, public data only).
- Inject the section into the existing profile page (`src/routes/u.$username.tsx`) below existing achievements — a single import + `<ProfileMehfilSection userId={profile.id} />`.

## 2. Competition Detail — Poetry card rendering
- Detect `competition.type === 'poetry_battle'` in `src/routes/competitions.$slug.tsx`.
- When true, render `PoemCard` for each participant (joined via `mehfil_poem_id`) instead of the nominee card. Existing voting UI reused.
- New server fn `getPoetryBattleEntries(competitionId)` in `src/lib/mehfil-battles.functions.ts` (already partially exists; add ranking).

## 3. Live Arena — Poetry Battle support
- Update `src/routes/live-arena.tsx` / arena card:
  - If competition `type === 'poetry_battle'`, swap the nominee thumbnail for a `PoemCard` compact variant showing title + first 2 lines + author.
- No new pages, no new state — just a conditional branch in the existing card renderer.

## 4. Realtime
- Extend the existing Supabase realtime hook usage:
  - `useMehfilPoemRealtime(poemId)` in `src/lib/mehfil-realtime.ts` — subscribes to `mehfil_poems` UPDATE for that poem (upvote_count, comment_count, read_count).
  - Wire into `src/routes/mehfil.$slug.tsx` so counts tick live.
  - Battle leaderboard: `useBattleRankingRealtime(competitionId)` subscribing to `competition_participants` for the battle detail page.

## Backward compatibility
- No schema changes.
- All new code is additive; existing competitions/profile continue to render exactly as before when `type !== 'poetry_battle'`.

## Files created
- `src/components/mehfil/ProfileMehfilSection.tsx`
- `src/lib/mehfil-realtime.ts`

## Files edited (surgical)
- `src/lib/mehfil.functions.ts` — add `getMehfilProfileSection`
- `src/lib/mehfil-battles.functions.ts` — expose ranked entries helper
- `src/routes/u.$username.tsx` — mount the profile section
- `src/routes/competitions.$slug.tsx` — poetry-battle branch
- `src/routes/live-arena.tsx` — poetry-battle card branch
- `src/routes/mehfil.$slug.tsx` — realtime hook

Approve to proceed.
