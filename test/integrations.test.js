import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWebhookUrl } from '../src/utils/integrations.js';
import { mapTodoistTasks, parseTaskImport } from '../src/utils/taskAdapters.js';

test('allows only http and https webhook URLs', () => {
  assert.equal(normalizeWebhookUrl('javascript:alert(1)'), '');
  assert.equal(normalizeWebhookUrl('ftp://example.com/hook'), '');
  assert.equal(normalizeWebhookUrl('https://example.com/hook'), 'https://example.com/hook');
});

test('maps active Todoist tasks into the local task model', () => {
  const tasks = mapTodoistTasks([
    { content: 'Ôn chương 3', due: { date: '2026-08-01' }, priority: 4 },
    { content: 'Đã xong', checked: true },
    { title: 'Làm đề', estimated_pomodoros: 3, priority: 2 }
  ]);

  assert.deepEqual(tasks, [
    {
      text: 'Ôn chương 3',
      deadline: '2026-08-01',
      estPomodoros: 1,
      urgent: true,
      important: true
    },
    {
      text: 'Làm đề',
      deadline: '',
      estPomodoros: 3,
      urgent: false,
      important: true
    }
  ]);
  assert.equal(parseTaskImport('{"items":[{"content":"Đọc sách"}]}')[0].text, 'Đọc sách');
});
