import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('service worker only removes its own caches and ignores external requests', async () => {
  const handlers = {};
  const deleted = [];
  const self = { registration: { scope: 'https://example.test/' }, location: { origin: 'https://example.test' }, clients: { claim: async () => {} }, addEventListener: (name, handler) => { handlers[name] = handler; } };
  vm.runInNewContext(await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    self, URL, Response, Set, Promise,
    caches: { keys: async () => ['other-app-cache', 'exam-countdown-old'], delete: async key => deleted.push(key), open: async () => ({ match: async () => undefined }) },
    fetch: async () => { throw new Error('offline'); }
  });
  let result;
  handlers.activate({ waitUntil: promise => { result = promise; } });
  await result;
  assert.deepEqual(deleted, ['exam-countdown-old']);
  let intercepted = false;
  handlers.fetch({ request: { method: 'GET', url: 'https://external.test/a.js' }, respondWith: () => { intercepted = true; } });
  assert.equal(intercepted, false);
  handlers.fetch({ request: { method: 'GET', url: 'https://example.test/private.json' }, respondWith: () => { intercepted = true; } });
  assert.equal(intercepted, false);
  handlers.fetch({ request: { method: 'GET', url: 'https://example.test/', mode: 'navigate' }, respondWith: promise => { result = promise; } });
  assert.equal((await result).status, 503);
});
