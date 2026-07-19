## Mehfil Phase 2 — Battles, Feed Widget, Admin, AI Assist

Building on Phase 1 (schema, discovery, category, detail, compose). All Phase 2 work reuses existing systems — no duplicate Competition/Feed/Notifications infra.

### 1. Poetry Battles (reuse Competition Engine)

- **Schema (migration):**
  - Add `competition_type` value `poetry_battle` and columns `mehfil_category_id`, `mehfil_theme`, `max_entries`, `auto_enroll_rules jsonb` on `competitions` (nullable; backward compatible).
  - Add `battle_competition_id` on `mehfil_poems` (already have `competition_id` — reuse).
  - Trigger `mehfil_auto_enroll_battle()`: on `mehfil_poems` status → `published`, if there is an **active battle** matching category + `opt_in_battle=true` on poem, insert a row into `competition_participants` referencing the poem's author, storing `mehfil_poem_id`.
  - Add `mehfil_poem_id uuid` (nullable, FK) on `competition_participants` so a battle participant can render a poetry card.
- **Server functions** (`src/lib/mehfil-battles.functions.ts`):
  - `listActiveBattles()`, `getBattle(slug)`, `listBattleEntries(id)` — thin wrappers over existing `listCompetitions*` filtered by `type='poetry_battle'`.
- **Routes:**
  - `/mehfil/challenges` — list active/upcoming/ended battles (reuse `CompetitionCard`-style UI adapted for poetry).
  - Battle detail reuses `/competitions/$slug` — the existing detail page renders a poetry-card variant when `type === 'poetry_battle'` (small conditional inside existing render, not a fork).
- **Live Arena:** update the existing arena renderer to render `PoemCard` (compact) when a participant carries `mehfil_poem_id`. No new page.
- **Winner flow:** existing winner pipeline already awards XP/coins/badge/notification/feed. Add hook: when a `poetry_battle` competition finalizes, insert into `mehfil_hall_of_fame` and emit `poetry_battle_win` via `gamify()`.

### 2. Compose — Battle Opt-in
- Checkbox "Enter this into the active [Category] Battle" in `mehfil.compose.tsx`, shown only when an active battle exists for the chosen category. Persists `opt_in_battle` on poem → trigger auto-enrolls.

### 3. Feed Trending Widget
- New component `src/components/feed/MehfilTrendingWidget.tsx` — premium horizontal-scroll card carousel with top 5 trending poems, deep link to `/mehfil`.
- Inject into existing Feed list at every Nth item (from `MehfilSettings.trending_widget_frequency`, default 5). One-line insertion in the existing Feed render loop — no rebuild.
- Data source: reuse `getMehfilDiscovery().sections.trending`.

### 4. Admin (`/admin/mehfil`)
Single tabbed admin page:
- **Poetry** — list/search/filter, publish/unpublish/feature/pick, delete.
- **Categories** — CRUD.
- **Challenges (Battles)** — inline form; creates a `competitions` row with `type='poetry_battle'` via existing `adminSaveCompetition`. No new save path.
- **Featured / Editor's Pick** — toggle columns already on `mehfil_poems`.
- **Reports** — reuse `reports` table filtered by target_type `mehfil_poem`.
- **Leaderboard / Hall of Fame** — read-only viewers.
- **Settings** — form bound to `MehfilSettings` in `app_settings`.

Wire into `AdminNav.ts`.

### 5. AI Assist (Lovable AI Gateway)
- Server function `assistPoemAI({ action, text, targetLang? })` in `src/lib/mehfil-ai.functions.ts`, `.middleware([requireSupabaseAuth])`, using `createLovableAiGatewayProvider` + `google/gemini-3.5-flash`.
- Actions: `improve`, `continue`, `translate`, `beautify`, `urdu_style`, `hindi_style`, `english_style`. Each is a system-prompt preset around `generateText`.
- UI: replace the "AI Assist coming Phase 2" placeholder in compose with a real panel of 7 buttons — each calls the fn and streams result into a diff/preview above the body textarea (accept / discard).
- Gated by `MehfilSettings.ai_assist_enabled`.

### 6. Leaderboard + Hall of Fame Pages
- `/mehfil/leaderboard` — periods Today/Week/Month/All Time, read from `mehfil_writer_stats` + windowed aggregates over `reactions`/`mehfil_poem_reads`.
- `/mehfil/hall-of-fame` — read `mehfil_hall_of_fame` grouped by weekly/monthly/yearly.

### 7. Gamification wiring (already partially done)
- Emit `poetry_battle_join` (compose w/ opt-in), `poetry_battle_win` (finalize hook), `poetry_featured` (admin toggle), `poetry_upvote` (existing reaction path — add mapping in `gamify` router).

### 8. Realtime
- Subscribe to `mehfil_poems`, `reactions` (filter by poem ids on screen), and `mehfil_writer_stats` in the relevant pages using the existing supabase realtime client — no new infra.

---

### Execution order (this turn)

1. Migration: battle columns + trigger + HoF hook + `poetry_battle` competition type.
2. Server fns: `mehfil-battles.functions.ts`, `mehfil-ai.functions.ts`, extend `mehfil.functions.ts` for admin CRUD.
3. Routes: `/mehfil/challenges`, `/mehfil/leaderboard`, `/mehfil/hall-of-fame`, `/admin/mehfil`.
4. Components: `MehfilTrendingWidget`, AI Assist panel, battle opt-in in compose.
5. Feed injection + Live Arena + Competition detail conditional renders.
6. AdminNav entry.

Everything remains backward compatible; existing competition, feed, XP, wallet, notification pipelines are untouched.
