---
name: bundle-optimization-tree-shaking
description: Best practices for bundle size reduction, Vite/Webpack code splitting, lazy loading, and tree-shaking dependencies.
---

# Bundle Optimization & Tree-Shaking Guidelines

Use this skill when optimizing production build sizes, setting up dynamic route imports, or debugging large bundle chunks.

## Guidelines
1. **Dynamic React Code-Splitting**: Use `React.lazy()` and `Suspense` for heavy modals, sub-routes, and secondary feature panels.
2. **Named ESM Imports**: Prefer `import { format } from 'date-fns'` over default library imports to allow bundler tree-shaking.
3. **Analyze Bundle Visualizer**: Audit production output chunk sizes (`rollup-plugin-visualizer` or Vite build reports) to catch duplicate packages.
4. **Preconnect & Prefetch**: Use `<link rel="preconnect">` for critical external assets (e.g. Google Fonts) to eliminate connection setup latency.
