---
name: error-boundary-resilience
description: React Error Boundary implementations, error recovery fallbacks, self-healing state resets, and error logging.
---

# Error Boundary & Resilience Guidelines

Use this skill when implementing error boundaries, component crash handling, or fallback UI states in React apps.

## Guidelines
1. **Granular Error Boundaries**: Wrap individual major feature modules (e.g. Timer panel, Soundboard) in separate Error Boundaries so one component crash doesn't bring down the entire app.
2. **Self-Healing Reset Action**: Provide a clear "Try Again" / "Reset View" button inside fallback UIs that clears corrupt state or re-initializes component props.
3. **Log Unhandled Crashes**: Capture unhandled JS errors (`componentDidCatch` or `window.onerror`) and record error messages safely.
4. **Fallback UI Aesthetics**: Design error fallbacks with the same theme tokens and glassmorphism styling as the rest of the application.
