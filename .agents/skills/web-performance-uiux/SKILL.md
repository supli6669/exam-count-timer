---
name: web-performance-uiux
description: Principles, best practices, and code patterns for building ultra-smooth (60fps), accessible, and stunning modern web applications (React, CSS, UI/UX).
---

# Modern Web UI/UX & Performance Optimization Guidelines

Use this skill when designing web interfaces, optimizing rendering performance, refactoring CSS/React components, or improving visual aesthetics and user experience.

## 1. UI/UX Design & Aesthetics (2026 Standards)

### Color & Elevation
- Use cohesive, dynamic dark/light design tokens (HSL or CSS Custom Properties).
- Combine **Glassmorphism** (`backdrop-filter: blur(12px)`) with subtle borders (`1px solid rgba(255, 255, 255, 0.08)`) and glow effects (`box-shadow: 0 0 20px var(--color-primary-glow)`).
- Avoid flat pure black (`#000000`) for dark mode background; use deep rich slates like `#0a0e17` or `#070913`.

### Responsive Motion & Micro-Interactions
- Keep click/hover interactions snappy (<150ms).
- Active state feedback: `transform: scale(0.97)` or `active:scale-95`.
- Dynamic hover elevation: `transform: translateY(-2px)` with subtle glow transition.
- Use cubic-bezier easing: `cubic-bezier(0.16, 1, 0.3, 1)` for natural fluid motion.

---

## 2. Rendering & Animation Performance (60fps Guarantee)

### Eliminating Layout Thrashing & Reflows
- **GPU-Only Animations**: Only animate `transform` (`translate3d`, `scale`, `rotate`) and `opacity`.
- **Never animate**: `width`, `height`, `top`, `left`, `margin`, `padding` in CSS transitions or keyframes.
- **Batch DOM Reads/Writes**: Avoid querying `offsetHeight`, `getBoundingClientRect()`, `scrollTop` immediately after mutating DOM styles.

### CSS Hardware Acceleration Rules
- Use `will-change: transform, opacity;` on frequently animated elements (or toggle via CSS hover/active states).
- Use `content-visibility: auto;` and `contain: layout style paint;` for large lists or off-screen panels to skip browser paint work.
- Limit heavy `backdrop-filter: blur()` to small sticky headers or active modals, not dynamic moving lists.

---

## 3. React Performance Patterns

### Rendering Efficiency
- **Sub-tree Isolation**: Break rapidly updating state (e.g. countdown timer ticks, clock counters) into isolated leaf components so parent layouts do not re-render.
- **Memoization**: Use `React.memo` for static heavy components and `useCallback`/`useMemo` for handler references passed down dynamic lists.
- **Concurrent React Features**: Use `useTransition` or `useDeferredValue` for heavy filter/search operations to prevent blocking user input typing.
- **List Virtualization**: Virtualize any rendered list over 100 items using `react-window` or custom DOM virtualization.

### Core Web Vitals & CLS Prevention
- Always set explicit width/height or `aspect-ratio` on dynamic cards, images, and media containers to avoid Cumulative Layout Shift.
- Use Skeleton Loaders matching component geometry instead of jarring layout changes when loading data.
