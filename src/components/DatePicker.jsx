import { useState, useEffect } from 'react';

function DatePicker({ value, onChange }) {
  const date = value ? new Date(value) : new Date();
  
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [day, setDay] = useState(date.getDate());
  const [hour, setHour] = useState(date.getHours());
  const [minute, setMinute] = useState(date.getMinutes());

  // Sync state when value prop changes
  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setYear(newDate.getFullYear());
      setMonth(newDate.getMonth());
      setDay(newDate.getDate());
      setHour(newDate.getHours());
      setMinute(newDate.getMinutes());
    }
  }, [value]);

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const maxDay = getDaysInMonth(year, month);

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    updateDate(newYear, month, day, hour, minute);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    const newMaxDay = getDaysInMonth(year, newMonth);
    const adjustedDay = day > newMaxDay ? newMaxDay : day;
    setDay(adjustedDay);
    updateDate(year, newMonth, adjustedDay, hour, minute);
  };

  const handleDayChange = (e) => {
    const newDay = parseInt(e.target.value);
    setDay(newDay);
    updateDate(year, month, newDay, hour, minute);
  };

  const handleHourChange = (e) => {
    const newHour = parseInt(e.target.value);
    setHour(newHour);
    updateDate(year, month, day, newHour, minute);
  };

  const handleMinuteChange = (e) => {
    const newMinute = parseInt(e.target.value);
    setMinute(newMinute);
    updateDate(year, month, day, hour, newMinute);
  };

  const updateDate = (y, m, d, h, min) => {
    const newDate = new Date(y, m, d, h, min);
    onChange(newDate.toISOString());
  };

  // Get day of week in Vietnamese
  const getDayOfWeek = (y, m, d) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const date = new Date(y, m, d);
    return days[date.getDay()];
  };

  // Generate year options (2020-2100)
  const yearOptions = [];
  for (let y = 2020; y <= 2100; y++) {
    yearOptions.push(y);
  }

  // Generate day options based on selected month/year
  const dayOptions = [];
  for (let d = 1; d <= maxDay; d++) {
    dayOptions.push(d);
  }

  // Generate hour options (0-23)
  const hourOptions = [];
  for (let h = 0; h <= 23; h++) {
    hourOptions.push(h);
  }

  // Generate minute options (0-59)
  const minuteOptions = [];
  for (let m = 0; m <= 59; m++) {
    minuteOptions.push(m);
  }

  return (
    <div className="date-picker">
      <div className="date-picker-row">
        <div className="date-picker-field">
          <label>Năm</label>
          <select
            value={year}
            onChange={handleYearChange}
            className="date-select"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="date-picker-field">
          <label>Tháng</label>
          <select
            value={month}
            onChange={handleMonthChange}
            className="date-select"
          >
            {months.map((m, index) => (
              <option key={index} value={index}>{m}</option>
            ))}
          </select>
        </div>

        <div className="date-picker-field">
          <label>Ngày</label>
          <select
            value={day}
            onChange={handleDayChange}
            className="date-select"
          >
            {dayOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="date-picker-row">
        <div className="date-picker-field">
          <label>Giờ</label>
          <select
            value={hour}
            onChange={handleHourChange}
            className="date-select"
          >
            {hourOptions.map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
            ))}
          </select>
        </div>

        <div className="date-picker-field">
          <label>Phút</label>
          <select
            value={minute}
            onChange={handleMinuteChange}
            className="date-select"
          >
            {minuteOptions.map(m => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="date-preview">
        {getDayOfWeek(year, month, day)}, {String(day).padStart(2, '0')}/{String(month + 1).padStart(2, '0')}/{year} - {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
      </div>
    </div>
  );
}

export default DatePicker;
