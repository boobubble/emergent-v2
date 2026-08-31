# GEO / AI search readiness — yaarzo.com (refresh)

**Score: 56 / 100** · Live 27 Aug 2026  
**Previous: 18 / 100** (landers 500; `/llms.txt` 500)

Correction vs an intermediate GEO note: **`sitemap.xml` is HTTP 200**, not 500.

## What works
- GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended: allowed (`User-agent: *` Allow `/`)
- Homepage + `/lahore-chat-room` + `/about-us` are SSR and quoteable
- `/llms.txt` is a correct **404** — do not invent a file

## Findings
| Severity | Finding |
|----------|---------|
| High | Brand split: `/communities` title still BooBubble |
| High | No Wikipedia / Reddit / YouTube entity for Yaarzo |
| Medium | Homepage “15,240+ members” is not citable against live 0 counters |
| Medium | About-us hashtag headings pollute extractable answers |
| Info | No `/llms.txt` by design until a real file exists |

## Platform (directional)
Google AI Overviews benefit most from restored landers. ChatGPT/Perplexity remain weak without third-party mentions.
