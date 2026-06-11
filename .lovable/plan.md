# Multilingual (i18n) System

This is a very large change. To do it safely without breaking existing modules, I'll deliver it in **two clearly separated layers**: (1) a complete i18n **infrastructure** wired into the whole app immediately, and (2) a **progressive key migration** of UI strings. Layer 1 ships now end-to-end; Layer 2 starts with the highest-traffic surfaces and continues incrementally so nothing breaks.

## Layer 1 — Infrastructure (this PR)

### Stack
- `i18next` + `react-i18next` + `i18next-browser-languagedetector` + `i18next-http-backend` (lazy-load JSON per language from `/locales/{lng}/{ns}.json`).
- No backend changes required. Optional column `preferred_language` on `profiles` (nullable text) — only added if you confirm; otherwise persisted in `localStorage` for everyone.

### Files added
- `src/i18n/index.ts` — init, detector order: `querystring → localStorage → cookie → navigator`, fallback `en`, namespaces split by area.
- `src/i18n/languages.ts` — supported language registry (code, name, native name, flag, dir). Adding a new language = one entry + a JSON file.
- `src/i18n/LanguageProvider.tsx` — provider that:
  - applies `<html lang dir>` (RTL for `ar`, `he`, `fa`, `ur`),
  - syncs to `profiles.preferred_language` for logged-in users (only if column exists; otherwise localStorage only),
  - respects admin "auto-detect" toggle.
- `src/components/LanguageSwitcher.tsx` — reusable dropdown (flag + native name), used in:
  - desktop header,
  - mobile menu,
  - `account.tsx` (User Settings).
- `public/locales/{en,hi,es,fr,de,pt,ar}/common.json` — seed translations for shared keys (`common.*`, `nav.*`, `auth.*`, `errors.*`, `empty.*`, plus the module headings listed in the brief).
- Mounted in `src/routes/__root.tsx` (wrapped above existing providers).

### Admin
- New route `src/routes/admin.languages.tsx` with toggles stored in `app_settings` (existing table, no schema change) under key `i18n`:
  - `enabled` (master switch),
  - `default_language`,
  - `auto_detect`,
  - `supported_languages[]`,
  - `ai_translation_enabled` (flag only; no AI call yet).
- Added to `AdminNav`.

### RTL
- `dir` attribute flips on `<html>`; `src/styles.css` gets a small `[dir="rtl"]` block for icon/margin mirroring. Tailwind logical utilities (`ms-`, `me-`, `ps-`, `pe-`) used in new code; existing classes left alone.

### User-generated content
- `src/components/TranslateButton.tsx` — small inline button rendered next to chat messages / post bodies / comments. Disabled with tooltip "AI translation coming soon" until `ai_translation_enabled` is on. Wiring stub only — no AI calls.

### Performance
- Only the active namespace + language JSON is fetched (HTTP backend, lazy). Suspense fallback inherits existing skeletons.

## Layer 2 — Key migration (starts now, continues incrementally)

To avoid breakage, I migrate hardcoded strings file-by-file using `t('namespace.key')`. In this PR I migrate:
- Global nav / header / mobile menu,
- Auth screen (login / signup labels + errors),
- Feed composer buttons + empty states,
- Common buttons (Send, Cancel, Save, Delete, Loading…),
- Admin Languages page itself.

Everything else keeps its current English strings and renders normally. Subsequent turns can migrate Feed cards, Chatroom, Profile, Games, Confessions, Polls, Wallet, Leaderboards, Missions, full Admin, etc. — each migration is mechanical and isolated.

## Explicit non-goals (per your "do not break" rules)
- No edits to backend logic, edge functions, RLS, or auto-generated Supabase files.
- No rewrites of existing working modules — only string substitutions.
- No DB migration unless you opt in to the `profiles.preferred_language` column. Default plan = localStorage only.

## Confirm before I build
1. **DB column** for logged-in users' language: **add `profiles.preferred_language`** or **localStorage only**?
2. **Initial seed languages** — proceed with the 7 in the brief (en, hi, es, fr, de, pt, ar)?
3. **Migration scope this turn** — OK with the Layer-2 list above (nav, auth, composer, common, admin-languages), continuing other modules in follow-up turns?