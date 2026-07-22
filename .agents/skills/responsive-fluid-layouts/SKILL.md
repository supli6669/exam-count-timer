---
name: responsive-fluid-layouts
description: Best practices for fluid typography, modern viewport units (dvh, svh), CSS Container Queries, and responsive grid systems.
---

# Responsive & Fluid Layout Guidelines

Use this skill when building mobile-first responsive layouts, container-query cards, or dynamic viewport containers.

## Guidelines
1. **Dynamic Viewport Height**: Use `100dvh` (dynamic viewport height) instead of `100vh` to handle mobile browser address bar collapse.
2. **Container Queries**: Use `@container (min-width: 400px)` for component-driven responsive layouts independent of window size.
3. **CSS Grid Auto-Fit**: Use `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));` for responsive cards without media query bloat.
4. **Fluid Clamp Typography**: Use `font-size: clamp(1rem, 2.5vw, 2rem);` for fluid scaling text across mobile and ultra-wide screens.
