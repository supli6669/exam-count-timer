/**
 * Utility for exporting exams to iCalendar (.ics) format
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook
 */

/**
 * Format a Date object or ISO string to UTC format required by iCalendar: YYYYMMDDTHHMMSSZ
 */
function formatICalDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escapes text for iCalendar format
 */
function escapeICalText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an .ics string for a single exam or an array of exams
 */
export function generateICalContent(examsInput) {
  const exams = Array.isArray(examsInput) ? examsInput : [examsInput];
  const nowStr = formatICalDate(new Date());

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Exam Countdown Timer//VN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch Thi Exam Countdown'
  ];

  exams.forEach(exam => {
    const startDate = new Date(exam.datetime);
    if (isNaN(startDate.getTime())) return;

    // Default duration 2 hours for an exam
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const startStr = formatICalDate(startDate);
    const endStr = formatICalDate(endDate);
    const summary = escapeICalText(`Lịch thi: ${exam.subject}`);
    const description = escapeICalText(
      `Môn thi: ${exam.subject}\nPhân loại: ${exam.category || 'Chung'}\nGhi chú: Nhắc nhở từ ứng dụng Exam Countdown Timer`
    );

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:exam-${exam.id || Date.now()}@examcountdowntimer`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:Nhắc nhở: Ngày mai thi ${escapeICalText(exam.subject)}!`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Downloads a generated .ics file directly in the browser
 */
export function downloadICalFile(exams, filename = 'lich-thi.ics') {
  const icsData = generateICalContent(exams);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
