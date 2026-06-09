All four groups are in scope. To keep each turn shippable and reviewable, I'll deliver in 4 sequential turns. After each turn, you confirm and I move on.

## Batch 1 — User-facing (fully working)
Profile + register:
- Gender required on register (male/female/other) and on guest auto-login (random or "other")
- Birthday on register, with "hide year" toggle (stored as date + show_year boolean)
- Country flag near nickname (auto-detect + manual override), per-user toggle on/off
- Show guest-vs-registered tag near nickname, per-user toggle
- Avatar ring color already keys off gender (blue/pink/gray) — verify + extend to feed/DM/members panel everywhere

Sounds:
- New `sound_prefs` on profile: public_chat, private_chat, notifications, username_mention, calls (5 toggles)
- Wire into existing sound playback sites; default all on

Birthday reminders:
- Server fn that returns friends whose birthday is today; small widget on feed sidebar; one notification per friend per day

Chatroom moderation:
- Kick / ban / mute buttons in member list & profile popup, visible only when staff
- Uses existing user_bans + user_mutes tables; adds room kick (transient leave + 5-min rejoin block)

## Batch 2 — Admin quick wins
- Admin → Users: edit username inline (with validation trigger we already have)
- Admin → Roles: "Staff permissions" toggle matrix — which roles can kick / ban / mute / delete msg in chatrooms (new `app_settings.staff_permissions`)
- Admin → Login Background: strip all other options, leave only "Live chatroom blur" on/off
- Admin → Welcome Page Links: edit destination + visibility for each feature card on /welcome (Feed→/feed, Chatrooms→/groups, etc.), toggle on/off
- Admin → Chat Emojis: upload custom emojis / stickers / animated gif emojis (new `custom_emojis` table, storage bucket, picker integration)

## Batch 3 — Admin panel new sections (scaffolded routes)
Create real routes (sidebar entries + AdminPageHeader + Card placeholders + 1-2 working pieces each where trivial):
- Dashboard: Live Stats, Server Health, Active Users Today, Revenue, Quick Actions
- Users: Activity Logs, Login History, Device History, Notes, Email Verification, Verification Badges, Import/Export, Bulk Actions
- Roles: Permission Builder (drag-drop), Custom Roles, Permission Matrix, Role Clone
- Content: Blog, FAQ, Announcements, Popups, Banners, CMS, Homepage Builder
- Email: SMTP, Template Editor, Bulk Sender, Push, Notification Templates
- Monetization: Ad Manager, Affiliate, Premium Plans, Subscriptions, Coupons
- SEO: Robots.txt, Sitemap, Redirects, Slugs, Meta Templates, Schema
- Security: Login Attempts, 2FA, Sessions, IP Lists, API Keys, Logs
- Moderation: Audit Logs, Chat Logs, Deleted Recovery, Spam, Auto Rules, Bulk Tools
- Storage: File Manager, Storage Usage, Image Optim, Media Cleaner
- Backup: One-click Backup/Restore, DB Backup, Maintenance Mode, Cache, Cleanup
- Automation: Cron, Scheduled Posts/Announcements/Notifications, Auto Rewards
- Analytics: User Growth, Room, Feed, Game, Reward, Ad, Export
- Localization: Languages, Translations, Currency, Timezone
- Dev Tools: Env Vars, API/Webhooks, Feature Flags, Modules, Debug Logs, System Info

Each is a real route with header + "coming soon" Card; sidebar groups updated. Functional wiring follows on demand.

## Batch 4 — CodeCanyon packaging
- /admin/setup-wizard (multi-step first-run)
- /admin/demo (one-click import / reset / sample data)
- /admin/updates (version checker, changelog viewer, auto-update stub)
- /admin/license (license activation form)
- /admin/health (env checker, requirements checker, health check)
- /admin/docs (Documentation, Video Guide, API Docs, Hooks, Branding)
- One-click theme import/export, settings import/export
- Demo Credentials page

## Technical notes
- All new DB tables: GRANT + RLS + service_role per platform rules
- Sound prefs & UI toggles stored on `profiles`
- Country flag uses emoji from ISO code (no image deps)
- Custom emojis bucket: public, admin-only write
- Welcome links stored in `app_settings.welcome_links`
- Staff permissions stored in `app_settings.staff_permissions` and read by chatroom UI

## What's NOT in scope
- Real Stripe/Paddle integration for Premium Plans (UI only)
- Real SMTP delivery (settings form only)
- Real backup engine (UI + manifest only — actual DB dumps need infra)

---

Starting Batch 1 right after you approve. Reply "go" to begin, or tell me to reorder.