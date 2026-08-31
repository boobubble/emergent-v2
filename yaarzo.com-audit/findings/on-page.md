# On-page SEO — yaarzo.com (refresh)

**Score: 58 / 100** · Live 27 Aug 2026  
**Previous: 32 / 100** (capped by 5xx)

## What works
- Homepage title, description, canonical, H1 unique and aligned
- CMS lander titles unique; one H1 each; canonical = sitemap loc
- Competitions title is query-shaped
- 404 pages: `Page Not Found | Yaarzo`, `noindex, follow`, no canonical (correct)

## Findings
| Severity | Finding |
|----------|---------|
| High | `/communities` title `Discover Communities — BooBubble` |
| High | Generic app titles: `/feed` = `Feed`, `/chatroom` = `Chatrooms`, `/poetry` = `Poetry Hub`; those four plus competitions lack an H1 in SSR |
| High | `/teen-chat-room` title/H1 advertise ages 13–16 while Terms say 16+ |
| Medium | `/blog` missing canonical + robots; `/blog/yahoo` indexable test slug with no canonical |
| Info | Doubled `yaarzo.com/yaarzo.com/` canonicals from the 24 Aug crawl are **gone** on this recrawl |
