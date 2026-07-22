---
name: canvas-chart-visualization
description: High-performance HTML5 Canvas and SVG charting, particle visualizers, 60fps animations, and DPR scaling.
---

# Canvas & Chart Visualization Guidelines

Use this skill when building data visualizers, progress rings, canvas particle effects, or interactive charts.

## Guidelines
1. **Device Pixel Ratio (DPR) Scaling**: Always scale HTML5 Canvas context by `window.devicePixelRatio` to maintain crisp rendering on Retina/HiDPI displays.
2. **Animation Loop**: Use `requestAnimationFrame` for continuous rendering loops and store the animation frame ID to clean up on unmount (`cancelAnimationFrame`).
3. **Offscreen Canvas**: Render static gridlines or complex background graphics onto an offscreen canvas to avoid redraw overhead.
4. **SVG vs Canvas**: Use SVG for crisp vector charts with <100 elements; use HTML5 Canvas for dynamic visualizers or high-density particle animations.
