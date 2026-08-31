# Visual / above-fold — yaarzo.com (refresh)

Live 27 Aug 2026.

## What works
- Guest homepage renders: single H1, Login / Join Free, Yaarzo brand (not BooBubble on `/`)
- CMS landers render real page chrome + H1 (no “Page unavailable” error shell)
- 404 pages: H1 `Page not found` matches status 404

## Findings
| Severity | Finding |
|----------|---------|
| High | Homepage live regions empty (0 posts / first-member copy) vs “15,240+ members” claim |
| Medium | `/communities` list SSR is “Loading…” (CSR) |
| Medium | App routes `/feed` `/chatroom` `/poetry` have little/no SSR H1 |
| Info | Homepage conversion layout still matches a chat product (Start Chatting / Create Account) |
