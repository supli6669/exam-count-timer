export function rankStudySubjects(exams, now) {
  return exams.filter(exam => new Date(exam.datetime).getTime() > now).map(exam => {
    const days = (new Date(exam.datetime).getTime() - now) / 86400000;
    const level = ['new', 'learning', 'ready'].includes(exam.studyLevel) ? exam.studyLevel : 'learning';
    const tasks = (exam.tasks || []).filter(task => !task.completed);
    const task = [...tasks].sort((a, b) => {
      const due = item => Number.isFinite(Date.parse(item.deadline)) ? Date.parse(item.deadline) : Infinity;
      return Number(Boolean(b.urgent)) - Number(Boolean(a.urgent)) || due(a) - due(b) || Number(a.estPomodoros || 1) - Number(b.estPomodoros || 1);
    })[0];
    const score = 100 / Math.max(0.5, days) + ({ new: 30, learning: 15, ready: 0 })[level];
    const reason = `${days < 1 ? 'Thi trong chưa đầy 1 ngày' : `Còn ${Math.ceil(days)} ngày đến kỳ thi`} · ${{ new: 'chưa nắm bài', learning: 'đang ôn', ready: 'đã khá vững' }[level]}`;
    const action = task?.text || (level === 'ready' ? 'Làm thử 5 câu không nhìn tài liệu, rồi kiểm tra chỗ sai.' : 'Mở đề cương, chọn 1 phần chưa hiểu và làm 3 câu cơ bản.');
    return { exam, task, score, reason, action };
  }).sort((a, b) => b.score - a.score || new Date(a.exam.datetime) - new Date(b.exam.datetime));
}
