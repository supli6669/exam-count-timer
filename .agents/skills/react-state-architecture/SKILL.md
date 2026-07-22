---
name: react-state-architecture
description: Best practices for React state management, state isolation, Context API optimization, and atomic state design.
---

# React State Architecture Guidelines

Use this skill when designing component state trees, Context providers, or global state stores in React applications.

## Principles
1. **Push State Down**: Keep state as close to where it is used as possible. Never elevate state to parent components unless shared by siblings.
2. **Context Splitting**: Separate dynamic state contexts from action dispatch contexts to prevent mass re-renders.
3. **Derived State**: Calculate values on the fly during render instead of storing redundant state variables.
4. **Immutability**: Always use functional state updates (`setCount(prev => prev + 1)`) to avoid stale closure bugs.
