---
name: testing-component-harness
description: Component unit & integration testing patterns (Vitest, React Testing Library), user event simulations, and mock APIs.
---

# Testing & Component Harness Guidelines

Use this skill when writing unit tests, component integration tests, mocking audio/browser APIs, or verifying UI interactions.

## Guidelines
1. **User-Centric Testing**: Query DOM elements by accessible roles (`getByRole('button', { name: /start/i })`) rather than implementation details or CSS selectors.
2. **Mock Web APIs**: Provide clean mocks for `AudioContext`, `Notification`, `localStorage`, and `ServiceWorker` in test environments.
3. **Simulate User Events**: Use `@testing-library/user-event` to simulate realistic click, tab, typing, and keyboard navigation events.
4. **Timer Mocks**: Use fake timers (`vi.useFakeTimers()`) to test countdowns, timeouts, and interval progression instantaneously without real-time waiting.
