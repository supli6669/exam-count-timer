---
name: pwa-offline-storage
description: Best practices and code patterns for Progressive Web Apps (PWA), Service Worker caching, offline state synchronization, and IndexedDB/LocalStorage management.
---

# PWA & Offline-First Storage Guidelines

Use this skill when implementing Service Workers, offline mode support, LocalStorage/IndexedDB data persistence, or background synchronization in web apps.

## 1. Service Worker Caching Strategies

### Core Cache Patterns
- **App Shell (Cache First / Stale-While-Revalidate)**: Cache static assets (`index.html`, bundle JS, CSS, web fonts) for instant offline loading.
- **Audio & Media Assets (Cache First with Fallback)**: Store synthesized sound assets and icons in dedicated Cache Storage (`v1-audio-cache`).
- **Dynamic API/Network (Network First)**: Fallback to cached state if network request fails or times out (>3 seconds).

### Service Worker Lifecycle Safety
- Handle `skipWaiting()` and `clientsClaim()` cleanly on service worker updates.
- Notify users when a new PWA update is available with a unobtrusive toast refresh prompt.

---

## 2. Robust Client-Side Persistence

### LocalStorage vs IndexedDB Strategy
- **LocalStorage**: Keep small key-value user preferences (<100KB), such as active art theme, dark mode state, or simple timer volume settings.
- **IndexedDB / Dexie.js**: Use for larger structured datasets (e.g. historical exam timer logs, custom audio soundboard presets, tags).

### Data Integrity & Migration
- Always wrap `JSON.parse()` in a safe try-catch with default fallback values.
- Version your storage schemas (`STORAGE_KEY_V2`) to handle breaking structure updates gracefully without corrupting user data.

---

## 3. Web Notifications & Background State

### Notification API Best Practices
- Request notification permissions only in response to explicit user interaction (e.g. toggling notification switch in settings modal).
- Provide visual status indicator when system notifications are blocked or unsupported in browser.
- Include action buttons and custom icons in notifications:
  ```js
  new Notification("Exam Timer Complete!", {
    body: "Great job! Take a 5-minute break.",
    icon: "/icons/icon-192.png",
    vibrate: [200, 100, 200]
  });
  ```
