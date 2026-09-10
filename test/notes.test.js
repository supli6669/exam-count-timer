import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateNotes } from '../src/utils/notes.js';

test('merging thoughts preserves notes, original text, resolved status and dates without duplicates', () => {
  const notes = [{ id: 'note-1', title: 'Bài học', content: 'Nội dung', pinned: true }];
  const thoughts = [{ id: 't1', text: '  Nhớ nộp bài\nngày mai', createdAt: 100, resolved: true }];
  const before = structuredClone({ notes, thoughts });
  const merged = consolidateNotes(notes, thoughts, 200);
  assert.deepEqual(merged[0], notes[0]);
  assert.equal(merged[1].content, thoughts[0].text);
  assert.equal(merged[1].updatedAt, 100);
  assert.ok(merged[1].tags.includes('Đã xử lý'));
  assert.deepEqual(consolidateNotes(merged, thoughts, 300), merged);
  assert.deepEqual({ notes, thoughts }, before);
});

test('malformed legacy thoughts are ignored and missing timestamps receive a valid fallback', () => {
  assert.deepEqual(consolidateNotes(null, null), []);
  const notes = consolidateNotes([], [null, {}, { text: ' ' }, { text: 'Ghi nhớ', createdAt: 'bad' }], 123);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].updatedAt, 123);
});
