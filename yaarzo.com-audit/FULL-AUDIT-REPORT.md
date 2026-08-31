# Yaarzo.com — Full SEO Audit (refresh)

**Date:** 27 August 2026 (refresh after P0 5xx recovery)  
**URL:** https://yaarzo.com  
**Business type:** Consumer social / live chat community (programmatic city, country, and interest landers)  
**SEO Health Score: 58 / 100** (was **28**)

Live HTTP recrawl of all 35 sitemap locs plus junk URL, `/llms.txt`, `/blog`, `/blog/yahoo`. Evidence: `yaarzo.com-audit/live-refresh.json`. Homepage Lighthouse lab still 26 Aug 2026. GSC/CrUX/backlinks not connected.

---

## Executive summary

The eligibility floor is restored. **Sitemap 35/35 HTTP 200, 5xx = 0.** Unknown slugs and `/llms.txt` return **404** (`noindex, follow`). `/blog` and `/blog/yahoo` return **200**. CMS landers and trust pages render real titles, H1s, and self-canonicals.

The score is no longer capped by 500s. Remaining drag is **quality and trust**: BooBubble on `/communities`, thin template hubs, homepage empty states vs a “15,240+” claim, an indexed test blog, unfinished legal placeholders, and a **teen 13–16 vs Terms 16+** contradiction.

### Top 5 issues now

1. **YMYL age clash** — `/teen-chat-room` 13–16 vs Terms 16+ and Privacy `[INSERT MINIMUM AGE]`.
2. **BooBubble** still in the `/communities` title.
3. **Thin programmatic cluster** (~10 landers, 180–250 words, shared skeleton).
4. **Homepage social proof vs empty live modules.**
5. **Indexed test blog** (`/blog/yahoo`) with no canonical; `/blog` missing from sitemap.

### Top 5 quick wins

1. Align teen page, Terms, and Privacy on a single minimum age (or noindex the teen page until aligned).
2. Replace BooBubble `site_name` fallbacks with Yaarzo.
3. Noindex or unpublish `/blog/yahoo`; add `/blog` to sitemap only with real posts.
4. Fill or stop claiming “15,240+ members” on the homepage.
5. CNAME `www` to apex; add `nosniff` + Referrer-Policy.

### Category scores

| Category | Weight | Score | Was | Weighted |
|----------|--------|------:|----:|--------:|
| Technical SEO | 22% | 72 | 22 | 15.84 |
| Content Quality | 23% | 54 | 26 | 12.42 |
| On-Page SEO | 20% | 58 | 32 | 11.60 |
| Schema / Structured Data | 10% | 54 | 28 | 5.40 |
| Performance (CWV) | 10% | 48 | 48 | 4.80 |
| AI Search Readiness | 10% | 56 | 18 | 5.60 |
| Images | 5% | 44 | 42 | 2.20 |
| **Health** | **100%** | **58** | **28** | **57.86** |

### Sitemap live

| | Previous | Refresh |
|--|--:|--:|
| Locs | 35 | 35 |
| HTTP 200 | 6 | **35** |
| HTTP 5xx | 29 | **0** |
| HTTP 404 in sitemap | 0 | 0 |
| Unexpected 3xx | 0 | 0 |
| Junk slug | 500 | **404** |
| `/llms.txt` | 500 | **404** |
| `/blog` | 500 | **200** (not in sitemap) |

Doubled `yaarzo.com/yaarzo.com/` canonicals from 24 Aug are **not** in today’s SSR.

---

## Technical SEO — 72

See `findings/technical.md`. 5xx gone. Remaining: www DNS, security headers, blog not in sitemap / weak blog head tags.

## Content Quality — 54

See `findings/content.md`. Crawlable mixed quality: unique homepage + ~15 distinctive landers vs thin hubs, empty proof, legal placeholders, test blog, teen vs Terms.

## On-Page SEO — 58

See `findings/on-page.md`. CMS canonicals match sitemap. App chrome titles and BooBubble remain.

## Schema — 54

See `findings/schema.md`. Homepage WebSite+Organization parse. CMS `Article` restored. Missing logo/sameAs, no blog JSON-LD.

## Performance — 48

See `findings/performance.md`. Homepage lab unchanged. Landers now measurable; not re-run.

## AI Search Readiness — 56

See `findings/geo.md`. Landers quoteable. `/llms.txt` correctly 404. Do not invent `llms.txt`. Sitemap is 200.

## Images — 44

OG PNG still ~1.5 MB. CMS may still hotlink ibb.co on some landers.

## SXO — 58

See `findings/sxo.md`. City landers match intent. Feed/Chatroom titles do not. Teen snippet vs Terms is a trust mismatch.

---

GSC, CrUX, and backlink APIs were not connected. PDF report not generated (offer if needed).
