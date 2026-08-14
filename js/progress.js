// js/progress.js

document.addEventListener('DOMContentLoaded', () => {
  const progress = ReadXData.getProgress();
  const allItems = ReadXData.getAllLibraryItems();

  document.getElementById('statArticles').textContent = progress.articlesRead.length;
  document.getElementById('statReadTime').textContent = progress.totalReadTime + 'm';

  if (progress.quizAttempts.length > 0) {
    const avg = progress.quizAttempts.reduce((sum, a) => sum + (a.score / a.total), 0) / progress.quizAttempts.length;
    document.getElementById('statQuizAvg').textContent = Math.round(avg * 100) + '%';
    document.getElementById('statQuizSub').textContent = `${progress.quizAttempts.length} attempt${progress.quizAttempts.length > 1 ? 's' : ''}`;
  }

  if (progress.lastActive) {
    const d = new Date(progress.lastActive);
    document.getElementById('statLastActive').textContent = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  // Weekly chart
  const chartEl = document.getElementById('weeklyChart');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activity = [2, 4, 1, 5, 3, 0, progress.articlesRead.length > 0 ? 3 : 0];
  const maxVal = Math.max(...activity, 1);

  days.forEach((day, i) => {
    const col = document.createElement('div');
    col.className = 'chart-bar-col';
    col.innerHTML = `
      <div class="chart-bar" style="height:${(activity[i] / maxVal) * 100}px; opacity:${activity[i] > 0 ? 0.25 : 0.08}"></div>
      <span class="chart-bar-label">${day}</span>
    `;
    chartEl.appendChild(col);
  });

  // Quiz history
  const quizHistory = document.getElementById('quizHistory');
  const quizEmpty = document.getElementById('quizHistoryEmpty');

  if (progress.quizAttempts.length === 0) {
    quizEmpty.hidden = false;
  } else {
    quizEmpty.hidden = true;
    [...progress.quizAttempts].reverse().slice(0, 5).forEach(attempt => {
      const quiz = ReadXData.quizzes[attempt.quizId];
      const pct = Math.round((attempt.score / attempt.total) * 100);
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <div class="activity-icon">${pct}%</div>
        <div class="activity-info">
          <h4>${quiz ? quiz.title : attempt.quizId}</h4>
          <span>${attempt.score}/${attempt.total} correct</span>
        </div>
        <span class="activity-time">${new Date(attempt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      `;
      quizHistory.appendChild(item);
    });
  }

  // Reading history
  const readingHistory = document.getElementById('readingHistory');
  const readingEmpty = document.getElementById('readingHistoryEmpty');

  if (progress.articlesRead.length === 0) {
    readingEmpty.hidden = false;
  } else {
    readingEmpty.hidden = true;
    [...progress.articlesRead].reverse().forEach(id => {
      const item = allItems.find(a => a.id === id);
      if (!item) return;
      const pct = ReadXData.getReadingProgress(id);
      const el = document.createElement('div');
      el.className = 'activity-item';
      el.innerHTML = `
        <div class="activity-icon">${item.category === 'DSA' ? 'DS' : item.category === 'AI/ML' ? 'AI' : 'UP'}</div>
        <div class="activity-info">
          <h4>${item.title}</h4>
          <span>${item.category} · ${pct >= 100 ? 'Completed' : pct + '% read'}</span>
        </div>
        <a href="reader.html?article=${id}" class="btn btn-outline btn-sm">Continue →</a>
      `;
      readingHistory.appendChild(el);
    });
  }
});
