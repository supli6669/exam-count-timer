---
name: micro-animations-gestures
description: Design rules and code patterns for smooth CSS micro-interactions, touch gestures, spring physics, and interactive feedback.
---

# Micro-Animations & Touch Gestures Guidelines

Use this skill when adding hover effects, spring animations, touch swipe controls, or interactive feedback to UI components.

## Guidelines
1. **Spring Easing Curves**: Use `cubic-bezier(0.175, 0.885, 0.32, 1.275)` for bouncy UI feedback and `cubic-bezier(0.16, 1, 0.3, 1)` for fluid transitions.
2. **Snappy Touch Feedback**: Use `:active { transform: scale(0.96); }` for physical button press feel.
3. **Pointer Gesture Hooks**: Handle touch and mouse events seamlessly with unified Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`).
4. **Staggered Entrance**: Apply `animation-delay` increments (e.g. 50ms per item) to grid/list card load-in animations.
