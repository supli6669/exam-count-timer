---
name: custom-hooks-library
description: Collection of reusable custom React hooks (useDebounce, useLocalStorage, useEventListener, useIntersectionObserver, useAudio).
---

# Custom React Hooks Library Guidelines

Use this skill when refactoring repeated stateful logic into custom React hooks.

## Key Hooks Patterns
1. **`useDebounce`**: Delay expensive filter operations or search API calls until user stops typing.
2. **`useLocalStorage`**: Sync React component state automatically with browser `localStorage` with JSON parsing safety.
3. **`useEventListener`**: Safely bind global window/DOM event listeners with automatic cleanup on unmount.
4. **`useIntersectionObserver`**: Lazy load offscreen content or trigger animations when elements scroll into view.
