---
name: dark-light-theme-engine
description: Best practices for HSL/OKLCH color token systems, dark/light theme switching without FOUC, and custom color presets.
---

# Dark & Light Theme Engine Guidelines

Use this skill when designing color token systems, theme switches, or custom user color palettes.

## Guidelines
1. **CSS Custom Properties**: Define theme variables on `:root` and `[data-theme="..."]` selectors for zero-JS CSS theme switching.
2. **OKLCH / HSL Color Space**: Express primary colors in HSL (`hsl(217, 91%, 60%)`) or OKLCH to calculate hover, glow, and border alpha layers dynamically.
3. **Prevent FOUC**: Read saved theme preference from `localStorage` in an inline script inside `<head>` before body render to avoid flash of unstyled theme.
4. **System Preference Sync**: Listen to `window.matchMedia('(prefers-color-scheme: dark)')` to respect operating system theme preferences automatically.
