---
name: web-vitals-monitoring
description: Core Web Vitals tracking (LCP, INP, CLS), custom performance timing marks, and real user metrics logging.
---

# Web Vitals & Performance Monitoring Guidelines

Use this skill when measuring Core Web Vitals (Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift) or timing performance bottlenecks.

## Guidelines
1. **Performance Mark & Measure**: Use `performance.mark('start-timer-calc')` and `performance.measure()` to benchmark expensive calculations empirically.
2. **INP (Interaction to Next Paint)**: Keep all main-thread event handlers under 50ms to ensure top-grade INP scores.
3. **CLS Prevention**: Avoid injecting dynamic DOM banners above existing content without reserved space.
4. **Console Warning in Dev**: Log performance warnings in development when a render or computation takes >16ms.
