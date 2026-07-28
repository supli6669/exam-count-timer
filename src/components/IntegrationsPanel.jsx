import { memo, useState } from 'react';
import {
  loadIntegrationSettings,
  normalizeWebhookUrl,
  postFocusWebhook,
  saveIntegrationSettings
} from '../utils/integrations';
import { parseTaskImport } from '../utils/taskAdapters';

function IntegrationsPanel({ onAddTask }) {
  const [settings, setSettings] = useState(loadIntegrationSettings);
  const [status, setStatus] = useState('');
  const [testing, setTesting] = useState(false);

  const save = () => {
    const next = saveIntegrationSettings(settings);
    setSettings(next);
    setStatus(next.webhookEnabled && !next.webhookUrl
      ? 'Hãy nhập URL http(s) hợp lệ.'
      : 'Đã lưu cài đặt tích hợp.');
  };

  const testWebhook = async () => {
    const safeUrl = normalizeWebhookUrl(settings.webhookUrl);
    if (!safeUrl) {
      setStatus('Webhook URL không hợp lệ.');
      return;
    }
    setTesting(true);
    setStatus('Đang gửi sự kiện thử…');
    try {
      await postFocusWebhook(safeUrl, {
        event: 'focus.integration.test',
        version: 1,
        sentAt: new Date().toISOString(),
        data: { message: 'Kết nối từ Exam Countdown Timer thành công.' }
      }, 0);
      setStatus('Kết nối webhook thành công.');
    } catch (error) {
      setStatus(error?.message || 'Không thể kết nối webhook.');
    } finally {
      setTesting(false);
    }
  };

  const importTasks = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';
    if (!file) return;

    try {
      const tasks = parseTaskImport(await file.text());
      tasks.forEach((task) => {
        onAddTask?.(
          'general',
          task.text,
          task.deadline,
          task.estPomodoros,
          task.urgent,
          task.important
        );
      });
      setStatus(tasks.length
        ? `Đã nhập ${tasks.length} nhiệm vụ vào danh sách chung.`
        : 'Không tìm thấy nhiệm vụ chưa hoàn thành trong tệp.');
    } catch {
      setStatus('Không đọc được tệp JSON. Hãy kiểm tra lại định dạng xuất.');
    }
  };

  return (
    <details className="focus-integrations glass-panel">
      <summary>🔌 Tích hợp & tự động hoá</summary>
      <div className="focus-integrations-body">
        <div>
          <h3>Webhook phiên học</h3>
          <p>Gửi sự kiện khi hoàn thành hoặc ghi nhận một phiên học. Khi mất mạng, sự kiện được xếp hàng và gửi lại.</p>
        </div>
        <label className="focus-integration-toggle">
          <input
            type="checkbox"
            checked={settings.webhookEnabled}
            onChange={(event) => setSettings((current) => ({ ...current, webhookEnabled: event.target.checked }))}
          />
          Bật webhook
        </label>
        <label>
          URL nhận sự kiện
          <input
            type="url"
            inputMode="url"
            placeholder="https://example.com/hooks/focus"
            value={settings.webhookUrl}
            onChange={(event) => setSettings((current) => ({ ...current, webhookUrl: event.target.value }))}
          />
        </label>
        <p className="focus-integration-warning">Không nhập token hoặc thông tin đăng nhập vào URL. Payload chỉ gồm thông tin phiên học bạn đã lưu trong app.</p>
        <div className="focus-integration-actions">
          <button type="button" onClick={save}>Lưu</button>
          <button type="button" onClick={testWebhook} disabled={testing}>Gửi thử</button>
        </div>
        <p role="status" aria-live="polite">{status}</p>
        <div className="focus-integration-divider" />
        <div>
          <h3>Nhập nhiệm vụ từ Todoist / JSON</h3>
          <p>Chọn tệp JSON đã xuất. App chỉ nhập nhiệm vụ chưa hoàn thành, deadline, độ ưu tiên và số Pomodoro ước tính nếu có.</p>
          <label className="focus-import-button">
            Chọn tệp JSON
            <input type="file" accept="application/json,.json" onChange={importTasks} />
          </label>
        </div>
      </div>
    </details>
  );
}

export default memo(IntegrationsPanel);
