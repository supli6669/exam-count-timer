---
name: network-resilience-retry
description: Exponential backoff retry patterns, fetch timeouts, offline action queues, and optimistic UI updates.
---

# Network Resilience & Retry Guidelines

Use this skill when handling asynchronous network requests, API retries, fetch timeouts, or offline synchronization.

## Guidelines
1. **Exponential Backoff**: Retry failed network requests with exponential delays (1s, 2s, 4s) + random jitter to prevent server thundering herds.
2. **Fetch Abort Control**: Always pass `AbortSignal.timeout(5000)` to fetch calls to prevent hanging pending promises.
3. **Optimistic UI**: Update local UI state immediately upon user action, then rollback gracefully if the network request fails.
4. **Offline Queue Sync**: Queue mutation requests in IndexedDB when offline and flush the queue upon `window.addEventListener('online', ...)`.
