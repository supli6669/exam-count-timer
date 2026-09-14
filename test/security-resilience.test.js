import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateBackupJSON } from '../src/utils/storage.js';
import { restoreBackup } from '../src/utils/backup.js';
import { createSafeStorage } from '../src/utils/persistence.js';
import { parseSpotifyUrl, isSafeBackground } from '../src/utils/urls.js';
import { generateICalContent } from '../src/utils/icsExport.js';
import { filterActiveExams } from '../src/utils/examTime.js';
import { migrateStudyData } from '../src/utils/focusPlanning.js';

function memoryStorage() {
  const values = new Map();
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

test('Spotify accepts only genuine HTTPS Spotify resource URLs', () => {
  assert.match(parseSpotifyUrl('https://open.spotify.com/playlist/abc123?si=test'), /^https:\/\/open.spotify.com\/embed\/playlist\/abc123/);
  for (const url of ['javascript:spotify.com/embed/evil', 'https://evil.com/spotify.com/embed/playlist/a', 'https://open.spotify.com.evil.com/embed/playlist/a', 'http://open.spotify.com/playlist/a', 'https://user@open.spotify.com/playlist/a', '<iframe src="https://open.spotify.com/embed/playlist/a">']) assert.equal(parseSpotifyUrl(url), '');
  assert.equal(isSafeBackground('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeBackground('data:image/png;base64,YQ=='), true);
});

test('production CSP defaults to self and limits third-party media', async () => {
  const [html, deployment] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8')
  ]);
  const policy = html.match(/Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
  for (const directive of ["default-src 'self'", "connect-src 'self'", "object-src 'none'", "frame-src https://open.spotify.com"]) {
    assert.ok(policy.includes(directive), `Missing ${directive}`);
  }
  assert.ok(deployment.includes("frame-ancestors 'none'"));
  assert.ok(deployment.includes('Permissions-Policy'));
});

test('backup rejects malformed collections and nested records before writing', () => {
  for (const data of [null, [], {}, { exams_countdown_list: null }, { exams_general_tasks: '[null]' }, { exams_general_tasks: [{ id: 'x', text: {} }] }, { exam_countdown_notes: [{ id: 'n', title: 'N', content: 'x', updatedAt: 1, tags: {} }] }, { app_leitner_flashcards: [{ id: 'f', question: 'q', answer: 'a', box: 99 }] }, { pomodoro_work: '0' }]) assert.equal(validateBackupJSON(data).valid, false);
  assert.equal(validateBackupJSON({ exams_countdown_list: '[]', exams_general_tasks: '[{"id":"x","text":"task"}]', pomodoro_work: '25' }).valid, true);
});

test('restore rolls back all app data after quota failure, leaves unrelated keys untouched', () => {
  const storage = memoryStorage();
  storage.setItem('exams_countdown_list', 'old exams');
  storage.setItem('exams_general_tasks', 'old tasks');
  storage.setItem('unrelated', 'keep');
  const before = new Map(storage.values);
  const write = storage.setItem;
  storage.setItem = (key, value) => { if (value === 'FAIL') throw new Error('Quota'); write(key, value); };
  assert.throws(() => restoreBackup({ exams_countdown_list: '[]', exams_general_tasks: 'FAIL' }, storage));
  assert.deepEqual(storage.values, before);
  restoreBackup({ exams_countdown_list: [] }, storage);
  assert.equal(storage.getItem('exams_countdown_list'), '[]');
  assert.equal(storage.getItem('exams_general_tasks'), null);
  assert.equal(storage.getItem('unrelated'), 'keep');
});

test('failed persistence keeps latest data available for export without crashing', () => {
  const storage = memoryStorage();
  let blocked = true;
  const safe = createSafeStorage(() => { if (blocked) throw new Error('Blocked'); return storage; });
  assert.equal(safe.getItem('notes'), null);
  assert.equal(safe.setItem('notes', 'latest'), false);
  assert.equal(safe.getItem('notes'), 'latest');
  blocked = false;
  assert.equal(safe.setItem('notes', 'latest'), true);
  assert.equal(storage.getItem('notes'), 'latest');
});

test('calendar export cannot inject event properties through CRLF or IDs', () => {
  const result = generateICalContent({ id: 'a\r\nATTENDEE:evil', subject: 'Math\r\nATTENDEE:evil', datetime: '2026-09-14T10:00:00Z' });
  assert.equal(result.includes('\r\nATTENDEE:'), false);
  assert.equal(generateICalContent([null]).includes('BEGIN:VEVENT'), false);
});

test('expired exams retain tasks; malformed legacy entries do not crash migration', () => {
  const exam = { id: 'old', datetime: '2020-01-01', tasks: [{ id: 't', text: 'unfinished' }] };
  assert.deepEqual(filterActiveExams([exam], true), [exam]);
  assert.deepEqual(migrateStudyData([null, { id: 'x', tasks: [null] }], [null]).exams[0].tasks, []);
});
