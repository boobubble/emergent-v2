# Performance / CWV — yaarzo.com (refresh)

**Score: 48 / 100** · Homepage lab 26 Aug 2026 (unchanged). Landers are now HTTP 200 but not re-measured in Lighthouse this pass.

## Lab (Lighthouse 13.4.1, mobile, 5 runs, `tmp-lh-p3a1c`)
| Metric | Best | Median | Worst |
|--------|------|--------|-------|
| Performance score | 78 | 62 | 33 |
| LCP | 2.66s | 2.70s | 5.02s |
| FCP | 2.54s | 2.56s | 5.02s |
| TBT | 0.54s | 2.59s | 5.43s |
| CLS | 0 | 0 | 0 |

## Findings
| Severity | Finding |
|----------|---------|
| High | Median LCP 2.7s (needs improvement vs 2.5s good) |
| High | TBT unstable — INP risk; no CrUX field data |
| Medium | OG PNG `/og/yaarzo-share.png` ~1.5 MB |
| Info | CLS 0 remains a homepage win |
| Info | CMS landers now eligible for lab tests; not run in this refresh |
