# Technical SEO — yaarzo.com

**Score: 72 / 100** · Live 27 Aug 2026 after P0 5xx recovery (commit `b0809284` / baseline `82bdd7fe`)  
**Previous: 22 / 100** (29/35 sitemap HTTP 500)

Do **not** re-open the 5xx work. Live recrawl of all 35 sitemap locs: **35 × 200, 0 × 5xx**.

---

## Category breakdown

| Category | Status | Score | Notes |
|----------|--------|------:|-------|
| Crawlability | **pass** | 94 | robots + sitemap valid; all locs 200; unknown URLs 404 |
| Indexability | **warn** | 78 | Self-canonicals clean; `/blog` and thin app hubs still messy |
| Security | **warn** | 58 | HTTPS + HSTS only; www DNS still broken |
| URL Structure | **pass** | 84 | Clean paths; `/chatrooms` is 307 not 301 |
| Mobile | **pass** | 88 | Viewport + responsive SSR homepage |
| Core Web Vitals | **warn** | 48 | Homepage lab LCP ~2.7s; CMS TTFB 2–5s |
| Structured Data | **warn** | 62 | Homepage + landers have JSON-LD; blog/app do not |
| JS Rendering | **pass** | 84 | Homepage and CMS landers SSR; app hubs thinner |
| IndexNow | **fail** | 15 | Not implemented |
| **Technical SEO** | **warn** | **72** | Eligibility restored; remaining High = DNS + TTFB + headers |

---

## What works

- HTTPS apex is live (`Server: Vercel`). Apex A record: `yaarzo.com` → `216.198.79.1` (dns.google Status 0).
- HSTS on HTML/XML/txt: `Strict-Transport-Security: max-age=63072000`.
- `https://yaarzo.com/robots.txt` **200**, `text/plain; charset=utf-8`, `Cache-Control: public, max-age=3600`:

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://yaarzo.com/sitemap.xml
```

- `https://yaarzo.com/sitemap.xml` **200**, `application/xml; charset=utf-8`, `urlset` 0.9, **35 unique HTTPS locs**, lastmod on all, 5,991 bytes. No duplicate locs. `/chatrooms` and `/welcome` are **not** in the sitemap.
- **Sitemap HTTP: 35/35 = 200, 0 3xx, 0 4xx, 0 5xx, 0 noindex.** Captured 2026-08-27T08:53:23Z.
- Unknown slug `https://yaarzo.com/this-slug-should-not-exist-xyz-404` → **404**. Alternate probe `/__yaarzo-nonexistent-route-test__` → **404**.
- `https://yaarzo.com/llms.txt` → **404**. No body. Do not invent llms.txt content.
- Homepage `https://yaarzo.com/` **200**, SSR HTML ~79 KB, `index, follow`, canonical `https://yaarzo.com/`, og:url same, viewport present, JSON-LD `WebSite` + `Organization`.
- Every sitemap loc has a matching self-canonical. **No `https://yaarzo.com/yaarzo.com/...` doubling** on this crawl (that 24 Aug issue is gone).
- Trust pages restored: `/about-us`, `/privacy-policy`, `/terms-conditions`, `/contact-us` all **200** with unique titles and self-canonicals.
- CMS landers restored (examples): `/lahore-chat-room`, `/chennai-chat-room`, `/india-chat-room` **200** with unique titles and crawlable body copy.
- Auth surfaces correctly noindexed: `/login`, `/wallet`, `/account` → `noindex, nofollow`.
- Aliases excluded from sitemap: `/chatrooms` **307** → `/chatroom`; `/welcome` **301** → `/`.
- `/blog/` is the trailing-slash alias (framework **307** → `/blog`). Canonical public URL is `/blog` **200**.

---

## Findings

| Severity | Finding | Evidence |
|----------|---------|----------|
| High | `www.yaarzo.com` still does not serve. Live `https://www.yaarzo.com/` fetch **timed out**; dns.google A lookup for `www.yaarzo.com` also timed out while apex `yaarzo.com` resolved to `216.198.79.1`. | No 301 to apex observed. |
| High | CMS lander TTFB is 2–5s on a sequential GET. That puts LCP over 2.5s before the first byte of HTML finishes. | `/rawalpindi-chat-room` 4850 ms; `/chat-rooms-without-registration-2026` 4338 ms; `/mumbai-chat-room` 4240 ms; `/karachi-girls-chat-room` 3568 ms. App hubs are 245–640 ms. |
| High | Security headers besides HSTS are absent on HTML. Not a ranking crisis, but clickjacking / MIME sniffing / referrer leakage are unaddressed. | Homepage response: `Strict-Transport-Security: max-age=63072000` only. No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. |
| Medium | `/blog` is public 200, indexable, **missing canonical and robots meta**, and **absent from the 35-URL sitemap**. | Title `Blog — Yaarzo`; `canonicals: []`; `robotsMeta: null`; 2,920 bytes. |
| Medium | `/blog/yahoo` is a test post, **index, follow**, **no canonical**. | Title `yahoo — Yaarzo Blog`; 2,266 bytes. |
| Medium | Thin app shells are in the sitemap and indexable, competing with the homepage for “chatroom / feed / poetry” queries. | `/feed` title `Feed` (10.7 KB); `/chatroom` title `Chatrooms` (15.5 KB); `/poetry` title `Poetry Hub` (4.6 KB); `/communities` title `Discover Communities — BooBubble` (23.8 KB). All `index, follow` + self-canonical. |
| Medium | `/chatrooms` permanent alias uses **307** (temporary). Google may recrawl the alias instead of consolidating as firmly as a 301. | `307 Location: /chatroom`. `/welcome` already uses 301. |
| Low | IndexNow is not implemented. Bing/Yandex/Naver will wait on crawl rather than push. | `/.well-known/indexnow-key.txt` **404**; `/indexnow-key.txt` **404**. No IndexNow code in repo. |
| Low | robots.txt has no AI-crawler policy. Search is allowed; training crawlers (GPTBot, Google-Extended, Bytespider) are also allowed by default. | Only `User-agent: *`. |
| Info | `/llms.txt` is **404**. That is the expected state unless a real file is added. Do not invent contents. Optional for GEO / Lighthouse Agentic Browsing, not a crawl defect. | Live 404. |
| Info | Homepage HTML `Cache-Control: public, max-age=0, must-revalidate` (Vercel MISS). Correct for SSR; HTML is not CDN-cached. | curl 27 Aug 08:50 UTC. |
| Info | Sitemap `<priority>` and `<changefreq>` on all 35 locs. Google ignores both. | — |
| Info | No live 5xx observed. Do not recommend re-fixing the P0 5xx path. | 35/35 sitemap 200; junk slug 404; `/llms.txt` 404. |

**No Critical issues.**

---

## Evidence tables

### robots.txt / sitemap

| URL | Status | Type | Notes |
|-----|-------:|------|-------|
| `https://yaarzo.com/robots.txt` | 200 | `text/plain; charset=utf-8` | Allow `/`, Disallow `/api/`, Sitemap declared. HSTS present. |
| `https://yaarzo.com/sitemap.xml` | 200 | `application/xml; charset=utf-8` | 35 unique locs, ~6 KB, `max-age=60`. |
| `https://yaarzo.com/sitemap_index.xml` | 404 | HTML 404 page | Not declared; expected. |
| `https://yaarzo.com/llms.txt` | 404 | — | No file. |
| `https://yaarzo.com/.well-known/indexnow-key.txt` | 404 | — | No IndexNow. |

### Homepage headers (GET `https://yaarzo.com/`)

```
HTTP/1.1 200 OK
Cache-Control: public, max-age=0, must-revalidate
Content-Type: text/html; charset=utf-8
Server: Vercel
Strict-Transport-Security: max-age=63072000
X-Vercel-Cache: MISS
```

SSR `<head>` (raw HTML, not JS-injected):

- `<html lang="en">`
- viewport `width=device-width, initial-scale=1, viewport-fit=cover`
- title `Yaarzo – Free Online Chatrooms, Make Friends & Communities`
- robots `index, follow`
- canonical `https://yaarzo.com/`
- og:url `https://yaarzo.com/`
- JSON-LD `@graph`: `WebSite`, `Organization`

### Sitemap loc status + canonicals (all 200, none doubled)

| Path | ms | Title | Canonical | robots |
|------|---:|-------|-----------|--------|
| `/` | 398 | Yaarzo – Free Online Chatrooms… | `https://yaarzo.com/` | index, follow |
| `/chatroom` | 245 | Chatrooms | `https://yaarzo.com/chatroom` | index, follow |
| `/communities` | 482 | Discover Communities — BooBubble | `https://yaarzo.com/communities` | index, follow |
| `/competitions` | 268 | Community Competitions — Live, Trending & Upcoming | `https://yaarzo.com/competitions` | index, follow |
| `/poetry` | 640 | Poetry Hub | `https://yaarzo.com/poetry` | index, follow |
| `/feed` | 296 | Feed | `https://yaarzo.com/feed` | index, follow |
| `/about-us` | 2896 | About Yaarzo \| A Social Network Built for Real Connections | `https://yaarzo.com/about-us` | index, follow |
| `/privacy-policy` | 2755 | Privacy Policy \| How Yaarzo Protects Your Data | `https://yaarzo.com/privacy-policy` | index, follow |
| `/terms-conditions` | 1992 | Terms & Conditions \| Yaarzo Platform Rules | `https://yaarzo.com/terms-conditions` | index, follow |
| `/contact-us` | 1984 | Contact Us \| Yaarzo | `https://yaarzo.com/contact-us` | index, follow |
| `/lahore-chat-room` | 2540 | Lahore Chat Room \| Free Online Lahore Chat Room on Yaarzo | `https://yaarzo.com/lahore-chat-room` | index, follow |
| (remaining 24 CMS landers) | 1927–4850 | Unique titles | Self-canonical matching loc | index, follow |

Full loc list is the live urlset: homepage + 5 app hubs + 4 trust + 25 CMS landers.

### Homepage vs app routes

| URL | Status | SSR character | Indexable? | vs homepage |
|-----|-------:|---------------|------------|-------------|
| `/` | 200 | Marketing landing, H1, long copy, JSON-LD | Yes | Primary |
| `/feed` | 200 | App shell; “Sign in to post…”; title `Feed` | Yes | Thin duplicate intent |
| `/chatroom` | 200 | Live lobby HTML; title `Chatrooms`; no H1 in SSR | Yes | Product URL; weaker SEO head |
| `/communities` | 200 | Directory + “Loading…”; leftover **BooBubble** title | Yes | Brand leak |

### Trailing slash / aliases

| URL | Status | Location | Verdict |
|-----|-------:|----------|---------|
| `/blog` | 200 | — | Canonical blog index |
| `/blog/` | 307 (framework) | `/blog` | Correct normalize |
| `/chatrooms` | 307 | `/chatroom` | Prefer 301 |
| `/welcome` | 301 | `/` | Correct |
| `/signup` | 307 | `/login` | Auth |

### www / HTTP

| Check | Result |
|-------|--------|
| `https://yaarzo.com/` | 200 |
| `yaarzo.com` A | `216.198.79.1` |
| `https://www.yaarzo.com/` | **timeout / no response** (same as prior “does not resolve”) |
| `http://yaarzo.com/` | Followed fetch returned the HTTPS homepage; HSTS will upgrade browsers after first HTTPS visit. Explicit 301 hop not captured in this pass. |

### Core Web Vitals (not re-labbed this hour)

Prior homepage Lighthouse 13.4.1 mobile (5 runs, `tmp-lh-p3a1c`): median LCP **2.70s** (needs improvement), CLS **0**, TBT unstable. No CrUX/PSI field data connected. New risk: CMS TTFB 2–5s will fail LCP on landers even if homepage is close to 2.5s.

INP is the interactivity metric (FID is not used). Lab TBT is a weak INP proxy only.

---

## Recommendations (no code in this audit)

1. **DNS:** CNAME or A/AAAA `www.yaarzo.com` to the Vercel apex and **301** `https://www.yaarzo.com/*` → `https://yaarzo.com/*`.
2. **TTFB:** Cache or speed the CMS `$slug` SSR path. Landers at 2–5s TTFB cannot hit LCP ≤ 2.5s.
3. **Headers:** Add `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `frame-ancestors` (CSP) or `X-Frame-Options`. HSTS can later add `includeSubDomains` once www exists.
4. **Blog:** Emit a self-canonical + robots on `/blog`; add `/blog` to the sitemap only if it stays a real index. Keep `/blog/yahoo` out until it is a real article (or noindex it).
5. **App hubs:** Either give `/feed`, `/chatroom`, `/poetry`, `/communities` unique crawlable titles/descriptions/H1, or noindex the thin shells and drop them from the sitemap (homepage already covers the queries).
6. **`/chatrooms`:** Change 307 → 301.
7. **IndexNow:** Optional later for Bing/Yandex. Not a Google ranking item.
8. **`/llms.txt`:** Leave 404 unless you publish a real file. Do not stub invented copy.

---

## Score movement vs previous 22

| Then (pre-P0) | Now |
|---------------|-----|
| 29/35 sitemap HTTP 500 | 35/35 HTTP 200, **0 5xx** |
| Unknown URLs 500 | Unknown URLs **404** |
| `/llms.txt` 500 | `/llms.txt` **404** |
| `/blog` 500 | `/blog` **200** |
| Doubled `yaarzo.com/yaarzo.com/` canonicals (24 Aug) | **Not present** on 35/35 locs |
| `www` DNS missing | Still missing |
| HSTS-only headers | Unchanged |

The 22 → **72** jump is eligibility (Google can recrawl the landers). Remaining gap to 85+ is www DNS, lander TTFB, blog canonical/sitemap, and thin indexable app shells — not another 5xx repair.
