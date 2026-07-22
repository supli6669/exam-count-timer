---
name: i18n-localization
description: Dynamic multi-language support, locale-aware date/time formatting, RTL layout compatibility, and translation fallback patterns.
---

# Internationalization (i18n) & Localization Guidelines

Use this skill when supporting multiple languages (e.g. Vietnamese, English), formatting currency/dates, or supporting RTL layouts.

## Guidelines
1. **Intl Browser APIs**: Use native `Intl.DateTimeFormat` and `Intl.NumberFormat` instead of heavy external formatting libraries.
2. **Translation Key Fallbacks**: Always provide an English/Vietnamese default fallback string if a translation key is missing.
3. **Pluralization Rules**: Use `Intl.PluralRules` or structured translation dictionaries to format plural counts correctly across languages.
4. **Layout Mirroring**: Use CSS Logical Properties (`margin-inline-start`, `padding-block`) to support RTL (Right-to-Left) languages smoothly.
