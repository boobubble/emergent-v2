# Schema / Structured Data — yaarzo.com (refresh)

**Score: 54 / 100** · Live 27 Aug 2026  
**Previous: 28 / 100** (landers 500 → no JSON-LD)

## What works
- Sampled URLs HTTP 200
- Homepage `@graph` parses: `WebSite` + `Organization`
- CMS landers emit `Article` JSON-LD (syntax valid)
- No FAQPage (appropriate — Google FAQ rich results retired)

## Findings
| Severity | Finding |
|----------|---------|
| High | Organization missing `logo` and `sameAs` |
| High | `/blog` and `/blog/yahoo` have no JSON-LD |
| Medium | City hubs and About use `Article` (prefer `WebPage` / `AboutPage` + `BreadcrumbList`) |
| Medium | `/feed` and `/communities` have no JSON-LD |
| Medium | Lahore `Article.image` historically pointed at ibb.co HTML, not a crawlable image |
| Low | Headline vs H1 mismatch on some landers |

Lift vs 28 is restored CMS JSON-LD, not new markup quality.
