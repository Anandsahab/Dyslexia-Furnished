// js/profile.js — personal learning dashboard

document.addEventListener('DOMContentLoaded', () => {
  const profile = ReadXData.getProfile();
  const stats = ReadXData.getLearningStats();

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const form = document.getElementById('profileForm');

  nameInput.value = profile.name;
  emailInput.value = profile.email;
  document.getElementById('profileDisplayName').textContent = profile.name;
  document.getElementById('profileDisplayEmail').textContent = profile.email;
  document.getElementById('profileDisplayBio').textContent = profile.bio || 'ReadX learner';
  document.getElementById('profileAvatar').textContent = profile.name.charAt(0).toUpperCase();

  function setStat(id, value, numeric) {
    const el = document.getElementById(id);
    el.textContent = value;
    el.setAttribute('data-count', String(numeric));
  }

  setStat('statTopics', stats.topicsCompleted, stats.topicsCompleted);
  setStat('statSessions', stats.readingSessions, stats.readingSessions);
  setStat('statAccuracy', stats.practiceAccuracy + '%', stats.practiceAccuracy);
  setStat('statQuestions', stats.questionsAttempted, stats.questionsAttempted);
  const wordsNumeric = stats.wordsRead >= 1000
    ? Math.round((stats.wordsRead / 1000) * 10) / 10
    : stats.wordsRead;
  setStat('statWords',
    stats.wordsRead >= 1000 ? (stats.wordsRead / 1000).toFixed(1) + 'k' : stats.wordsRead,
    wordsNumeric);
  setStat('statReadTime', stats.readingTimeMinutes + 'm', stats.readingTimeMinutes);

  setStat('perfAccuracy', stats.practiceAccuracy + '%', stats.practiceAccuracy);
  setStat('perfAttempted', stats.questionsAttempted, stats.questionsAttempted);
  setStat('perfCorrect', stats.questionsCorrect, stats.questionsCorrect);

  const recentEl = document.getElementById('recentActivity');
  stats.recentActivity.forEach(item => {
    const el = document.createElement('div');
    el.className = 'activity-item';
    const sub = item.type === 'practice'
      ? `${item.accuracy}% practice accuracy`
      : `${item.progress || 100}% read`;
    el.innerHTML = `
      <div class="activity-icon">${item.type === 'practice' ? 'Q' : 'R'}</div>
      <div class="activity-info">
        <h4>${item.topic}</h4>
        <span>${sub}</span>
      </div>
      <span class="activity-time">${formatDate(item.date)}</span>
    `;
    recentEl.appendChild(el);
  });

  const catEl = document.getElementById('categoryProgress');
  Object.entries(stats.categoryProgress).forEach(([cat, pct]) => {
    const row = document.createElement('div');
    row.className = 'dash-cat-row';
    row.innerHTML = `
      <div class="dash-cat-head">
        <span class="dash-cat-name">${cat}</span>
        <span class="dash-cat-pct">${pct}%</span>
      </div>
      <div class="dash-cat-bar">
        <div class="dash-cat-fill" data-fill="${pct}" style="width:0%"></div>
      </div>
    `;
    catEl.appendChild(row);
  });

  const revEl = document.getElementById('revisionTopics');
  (stats.topicsNeedingRevision || []).forEach(topic => {
    const li = document.createElement('li');
    li.textContent = topic;
    revEl.appendChild(li);
  });

  const chartEl = document.getElementById('readingChart');
  const maxMin = Math.max(...stats.readingHistory.map(r => r.minutes), 1);
  stats.readingHistory.forEach(item => {
    const col = document.createElement('div');
    col.className = 'dash-read-col';
    col.innerHTML = `
      <div class="dash-read-bar" style="height:${(item.minutes / maxMin) * 64}px"></div>
      <span class="dash-read-label">${item.minutes}m</span>
    `;
    chartEl.appendChild(col);
  });

  const histEl = document.getElementById('readingHistory');
  stats.readingHistory.forEach(item => {
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
      <div class="activity-icon">R</div>
      <div class="activity-info">
        <h4>${item.topic}</h4>
        <span>${item.minutes} min reading session</span>
      </div>
      <span class="activity-time">${formatDate(item.date)}</span>
    `;
    histEl.appendChild(el);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: nameInput.value.trim() || profile.name,
      email: emailInput.value.trim() || profile.email
    };
    ReadXData.saveProfile(updated);
    document.getElementById('profileDisplayName').textContent = updated.name;
    document.getElementById('profileDisplayEmail').textContent = updated.email;
    document.getElementById('profileAvatar').textContent = updated.name.charAt(0).toUpperCase();
    if (typeof App !== 'undefined' && App.updateNavAvatar) {
      App.updateNavAvatar(updated.name);
    }
  });
});

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
