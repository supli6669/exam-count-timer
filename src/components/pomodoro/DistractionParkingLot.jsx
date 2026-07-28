import { memo, useEffect, useState } from 'react';
import { DISTRACTIONS_STORAGE_KEY } from '../../utils/focusPlanning';

const loadItems = () => {
  try {
    const value = JSON.parse(localStorage.getItem(DISTRACTIONS_STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, 30) : [];
  } catch {
    return [];
  }
};

function DistractionParkingLot() {
  const [items, setItems] = useState(loadItems);
  const [text, setText] = useState('');

  useEffect(() => {
    localStorage.setItem(DISTRACTIONS_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    setItems((current) => [{
      id: `thought-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: value,
      createdAt: Date.now(),
      resolved: false
    }, ...current].slice(0, 30));
    setText('');
  };

  return (
    <section className="distraction-parking-lot" aria-labelledby="distraction-title">
      <div>
        <h3 id="distraction-title">🅿️ Bãi đỗ suy nghĩ</h3>
        <p>Ghi nhanh điều chen ngang rồi quay lại học.</p>
      </div>
      <form onSubmit={addItem}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Mình cần nhớ…"
          maxLength="140"
          aria-label="Ghi lại suy nghĩ gây xao nhãng"
        />
        <button type="submit">Đỗ lại</button>
      </form>
      {items.length > 0 && (
        <ul>
          {items.slice(0, 5).map((item) => (
            <li key={item.id} className={item.resolved ? 'resolved' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={item.resolved}
                  onChange={() => setItems((current) => current.map((entry) => (
                    entry.id === item.id ? { ...entry, resolved: !entry.resolved } : entry
                  )))}
                />
                <span>{item.text}</span>
              </label>
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                aria-label={`Xóa ghi chú ${item.text}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default memo(DistractionParkingLot);
