// js/profile.js — Personal Reading Intelligence Dashboard Controller

document.addEventListener('DOMContentLoaded', () => {
  // 1. Require login
  if (typeof ReadXAuth !== 'undefined' && !ReadXAuth.protectPage()) {
    return;
  }

  const currentUser = typeof ReadXAuth !== 'undefined' ? ReadXAuth.getCurrentUser() : null;
  if (!currentUser) return;

  const profile = ReadXData.getProfile(currentUser.id);
  const stats = ReadXData.getLearningStats(currentUser.id);

  // 2. Profile Hero
  initProfileHero(currentUser, profile);

  // 3. Four Primary Performance Metrics
  renderKeyMetrics(stats);

  // 4. Reading Activity Chart
  initReadingChart(stats);

  // 5. Reading Streak Widget
  renderStreakWidget(stats);

  // 6. Continue Reading Card (Zero-state: Start Reading → library.html)
  renderContinueReadingCard(stats);

  // 7. Learning Progress Bars
  renderLearningProgress(stats);

  // 8. Recent Activity Timeline
  renderRecentActivityTimeline(stats);

  // 9. Reading Pattern
  renderReadingPatterns(stats);

  // 10. READX Preferences Summary
  renderReadXPreferences();
});

/* ============================================================
   1. HERO & PROFILE EDIT FORM
   ============================================================ */
function initProfileHero(currentUser, profile) {
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileDisplayName');
  const emailEl = document.getElementById('profileDisplayEmail');
  const bioEl = document.getElementById('profileDisplayBio');
  const joinedEl = document.getElementById('profileJoinedDate');

  const toggleEditBtn = document.getElementById('toggleEditProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditProfileBtn');
  const editForm = document.getElementById('profileForm');
  const logoutBtn = document.getElementById('profileLogoutBtn');

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const bioInput = document.getElementById('profileBio');

  const displayName = profile.name || currentUser.name || 'ReadX Learner';
  const displayEmail = profile.email || currentUser.email || 'learner@readx.app';
  const displayBio = profile.bio || currentUser.bio || 'Computer Science Student · ReadX Learner';
  const joinedDateStr = profile.joined || currentUser.joined || '2026-08-01';

  if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = displayEmail;
  if (bioEl) bioEl.textContent = displayBio;
  if (joinedEl) {
    const formattedJoined = new Date(joinedDateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    joinedEl.textContent = `Joined ${formattedJoined}`;
  }

  if (nameInput) nameInput.value = displayName;
  if (emailInput) emailInput.value = displayEmail;
  if (bioInput) bioInput.value = displayBio;

  if (toggleEditBtn && editForm) {
    toggleEditBtn.addEventListener('click', () => {
      const isHidden = editForm.style.display === 'none';
      editForm.style.display = isHidden ? 'block' : 'none';
      toggleEditBtn.textContent = isHidden ? 'Hide Form' : 'Edit Profile';
    });
  }

  if (cancelEditBtn && editForm) {
    cancelEditBtn.addEventListener('click', () => {
      editForm.style.display = 'none';
      if (toggleEditBtn) toggleEditBtn.textContent = 'Edit Profile';
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        ...profile,
        id: currentUser.id,
        name: nameInput.value.trim() || displayName,
        email: emailInput.value.trim() || displayEmail,
        bio: bioInput.value.trim() || displayBio
      };

      if (typeof ReadXAuth !== 'undefined') {
        ReadXAuth.updateCurrentUserProfile(updated);
      }
      ReadXData.saveProfile(updated, currentUser.id);

      if (nameEl) nameEl.textContent = updated.name;
      if (emailEl) emailEl.textContent = updated.email;
      if (bioEl) bioEl.textContent = updated.bio;
      if (avatarEl) avatarEl.textContent = updated.name.charAt(0).toUpperCase();

      if (typeof App !== 'undefined' && App.updateNavAvatar) {
        App.updateNavAvatar(updated.name);
      }

      editForm.style.display = 'none';
      if (toggleEditBtn) toggleEditBtn.textContent = 'Edit Profile';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof ReadXAuth !== 'undefined') {
        ReadXAuth.logout();
      }
    });
  }
}

/* ============================================================
   2. KEY METRICS CARDS
   ============================================================ */
function renderKeyMetrics(stats) {
  const sessions = stats.readingSessions || 0;
  const words = stats.wordsRead || 0;
  const accuracy = stats.practiceAccuracy || 0;
  const timeMin = stats.readingTimeMinutes || 0;

  const sessionsEl = document.getElementById('statSessions');
  const wordsEl = document.getElementById('statWords');
  const accuracyEl = document.getElementById('statAccuracy');
  const timeEl = document.getElementById('statReadTime');

  if (sessionsEl) sessionsEl.textContent = sessions;
  
  if (wordsEl) {
    const formattedWords = words >= 1000 ? (words / 1000).toFixed(1) + 'k' : words;
    wordsEl.textContent = formattedWords;
  }

  if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
  
  if (timeEl) {
    const hours = Math.floor(timeMin / 60);
    const mins = timeMin % 60;
    timeEl.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
}

/* ============================================================
   3. READING ACTIVITY CHART (7 DAYS / 30 DAYS)
   ============================================================ */
function initReadingChart(stats) {
  const toggle7 = document.getElementById('chartToggle7');
  const toggle30 = document.getElementById('chartToggle30');

  let activeRange = 7;

  function renderChart() {
    const chartBars = document.getElementById('readingChartBars');
    const chartLabels = document.getElementById('readingChartLabels');
    const emptyState = document.getElementById('chartEmptyState');
    const chartContainer = document.getElementById('readingChartContainer');

    if (!chartBars || !chartLabels) return;

    chartBars.innerHTML = '';
    chartLabels.innerHTML = '';

    const history = stats.readingHistory || {};
    const dates = [];
    const now = new Date();

    for (let i = activeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      dates.push({
        iso,
        dateObj: d,
        minutes: history[iso] || 0
      });
    }

    const totalMinutes = dates.reduce((sum, d) => sum + d.minutes, 0);

    if (totalMinutes === 0) {
      if (chartContainer) chartContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    } else {
      if (chartContainer) chartContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
    }

    const peakMinutes = Math.max(...dates.map(d => d.minutes), 1);

    dates.forEach(item => {
      const barCol = document.createElement('div');
      barCol.className = 'dash-read-col';
      
      const heightPercent = item.minutes > 0 ? Math.max(8, Math.round((item.minutes / peakMinutes) * 100)) : 4;
      
      barCol.innerHTML = `
        <div class="dash-read-bar" style="height:${heightPercent}%" title="${item.iso}: ${item.minutes} mins"></div>
        <span class="dash-read-label">${item.minutes > 0 ? item.minutes + 'm' : ''}</span>
      `;
      chartBars.appendChild(barCol);

      const labelSpan = document.createElement('span');
      if (activeRange === 7) {
        labelSpan.textContent = item.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        labelSpan.textContent = `${item.dateObj.getDate()}/${item.dateObj.getMonth() + 1}`;
      }
      chartLabels.appendChild(labelSpan);
    });
  }

  if (toggle7 && toggle30) {
    toggle7.addEventListener('click', () => {
      activeRange = 7;
      toggle7.classList.add('active');
      toggle30.classList.remove('active');
      renderChart();
    });

    toggle30.addEventListener('click', () => {
      activeRange = 30;
      toggle30.classList.add('active');
      toggle7.classList.remove('active');
      renderChart();
    });
  }

  renderChart();
}

/* ============================================================
   4. READING STREAK WIDGET
   ============================================================ */
function renderStreakWidget(stats) {
  const streak = stats.streak || { current: 0, longest: 0, historyDates: [] };
  const currentStreak = streak.current || 0;
  const longestStreak = streak.longest || 0;

  const countEl = document.getElementById('streakCount');
  const longestEl = document.getElementById('streakLongest');
  const weekDotsEl = document.getElementById('streakWeekDots');

  if (countEl) countEl.textContent = currentStreak;
  if (longestEl) longestEl.textContent = `${longestStreak} days`;

  if (weekDotsEl) {
    weekDotsEl.innerHTML = '';

    const today = new Date();
    const currentDayOfWeek = (today.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDayOfWeek);

    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const history = stats.readingHistory || {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const hasRead = history[iso] && history[iso] > 0;
      const isToday = i === currentDayOfWeek;

      const dayDot = document.createElement('div');
      dayDot.className = `streak-day-dot ${hasRead ? 'active' : ''} ${isToday ? 'today' : ''}`;
      dayDot.innerHTML = `
        <div class="streak-dot-circle">${hasRead ? '✓' : ''}</div>
        <span class="streak-dot-label">${dayLabels[i]}</span>
      `;
      weekDotsEl.appendChild(dayDot);
    }
  }
}

/* ============================================================
   5. CONTINUE READING CARD
   ============================================================ */
function renderContinueReadingCard(stats) {
  const container = document.getElementById('continueReadingContainer');
  if (!container) return;

  const lastItem = stats.continueReading;

  if (lastItem && lastItem.docId) {
    const relativeTime = formatRelativeTime(lastItem.timestamp);
    const progress = lastItem.progress || 10;

    container.innerHTML = `
      <div class="continue-reading-card">
        <div class="continue-card-top">
          <span class="continue-card-tag">CONTINUE READING</span>
          <span class="continue-card-time">Last opened ${relativeTime}</span>
        </div>
        <h3 class="continue-card-title">${escapeHtml(lastItem.title)}</h3>
        <div class="continue-card-bar-row">
          <div class="continue-card-bar">
            <div class="continue-card-fill" style="width: ${progress}%"></div>
          </div>
          <span class="continue-card-pct">${progress}% complete</span>
        </div>
        <div style="margin-top: 0.5rem;">
          <button type="button" class="btn btn-primary btn-sm btn-continue" data-doc-id="${lastItem.docId}">
            Continue Reading →
          </button>
        </div>
      </div>
    `;

    const continueBtn = container.querySelector('.btn-continue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        openDocumentById(lastItem.docId);
      });
    }
  } else {
    // EMPTY STATE — NO UPLOAD BUTTON! Navigates directly to library.html
    container.innerHTML = `
      <div class="dash-empty-state">
        <div class="empty-title">No active reading session</div>
        <p class="empty-quote">"Your reading journey starts here."</p>
        <a href="library.html" class="btn btn-outline btn-sm">Start Reading →</a>
      </div>
    `;
  }
}

function openDocumentById(docId) {
  if (docId.startsWith('upload-')) {
    window.location.href = `upload.html?doc=${docId}`;
  } else {
    window.location.href = `library.html?topic=${docId}`;
  }
}

/* ============================================================
   6. LEARNING PROGRESS BARS BY CATEGORY
   ============================================================ */
function renderLearningProgress(stats) {
  const container = document.getElementById('categoryProgressContainer');
  if (!container) return;

  container.innerHTML = '';

  const uid = ReadXData.getCurrentUserId();
  const uploads = ReadXData.getUploads(uid);
  const topicsCompleted = stats.topicsCompleted || [];

  const categories = [
    { name: 'Data Structures & Algorithms', total: 10, done: 0 },
    { name: 'AI & Machine Learning', total: 8, done: 0 },
    { name: 'My Content', total: Math.max(1, uploads.length), done: 0 }
  ];

  topicsCompleted.forEach(id => {
    const topic = ReadXData.getTopic(id);
    if (topic) {
      if (topic.category?.includes('AI') || topic.category?.includes('Machine')) {
        categories[1].done++;
      } else {
        categories[0].done++;
      }
    } else if (id.startsWith('upload-')) {
      categories[2].done++;
    }
  });

  categories.forEach(cat => {
    const pct = Math.min(100, Math.round((cat.done / cat.total) * 100));

    const row = document.createElement('div');
    row.className = 'dash-cat-row';
    row.innerHTML = `
      <div class="dash-cat-head">
        <span class="dash-cat-name">${cat.name}</span>
        <span class="dash-cat-pct">${pct}%</span>
      </div>
      <div class="dash-cat-bar">
        <div class="dash-cat-fill" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

/* ============================================================
   7. RECENT ACTIVITY TIMELINE
   ============================================================ */
function renderRecentActivityTimeline(stats) {
  const timelineEl = document.getElementById('recentActivityTimeline');
  if (!timelineEl) return;

  timelineEl.innerHTML = '';

  const activities = stats.recentActivity || [];

  if (activities.length === 0) {
    timelineEl.innerHTML = `
      <div class="dash-empty-state">
        <div class="empty-title">No activity yet</div>
        <p class="empty-sub">Your reading and learning activity will appear here.</p>
      </div>
    `;
    return;
  }

  activities.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';

    let actionName = 'Opened';
    if (item.type === 'practice') actionName = 'Practice';
    else if (item.type === 'readAloud') actionName = 'Read Aloud';
    else if (item.type === 'uploaded') actionName = 'Uploaded';
    else if (item.type === 'readx') actionName = 'READX Mode';

    const relativeTime = formatRelativeTime(item.timestamp || item.date);

    el.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-action-row">
          <span class="timeline-action">${actionName}</span>
          <span class="timeline-time">${relativeTime}</span>
        </div>
        <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
        <span class="timeline-detail">${escapeHtml(item.detail || '')}</span>
      </div>
    `;
    timelineEl.appendChild(el);
  });
}

/* ============================================================
   8. READING PATTERNS
   ============================================================ */
function renderReadingPatterns(stats) {
  const container = document.getElementById('readingPatternContainer');
  if (!container) return;

  container.innerHTML = '';

  const sessions = stats.readingSessions || 0;
  const totalMin = stats.readingTimeMinutes || 0;
  const totalWords = stats.wordsRead || 0;
  const readxCount = stats.readxSessionsCount || 0;
  const ttsCount = stats.readAloudUsageCount || 0;

  const avgDuration = sessions > 0 ? Math.round(totalMin / sessions) : 0;
  const avgWords = sessions > 0 ? Math.round(totalWords / sessions) : 0;

  const patternMetrics = [
    {
      label: 'Average Session',
      value: avgDuration > 0 ? `${avgDuration} mins` : '—'
    },
    {
      label: 'Words / Session',
      value: avgWords > 0 ? `${avgWords} words` : '—'
    },
    {
      label: 'READX Sessions',
      value: readxCount
    },
    {
      label: 'Read Aloud Sessions',
      value: ttsCount
    }
  ];

  patternMetrics.forEach(m => {
    const card = document.createElement('div');
    card.className = 'pattern-row';
    card.innerHTML = `
      <span class="pattern-lbl">${m.label}</span>
      <span class="pattern-val">${m.value}</span>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   9. READX PREFERENCES SUMMARY
   ============================================================ */
function renderReadXPreferences() {
  const container = document.getElementById('readxPreferencesContainer');
  const manageBtn = document.getElementById('managePreferencesBtn');

  if (!container) return;

  container.innerHTML = '';

  let settings = {
    font: 'opendyslexic',
    size: 18,
    spacing: 1.8,
    theme: 'warm',
    ruler: false,
    focus: false
  };

  if (typeof App !== 'undefined' && App.getSettings) {
    settings = App.getSettings();
  } else {
    const saved = localStorage.getItem('readx-accessibility-settings');
    if (saved) {
      try { settings = { ...settings, ...JSON.parse(saved) }; } catch (e) {}
    }
  }

  const items = [
    { name: 'Dyslexia Font', val: settings.font === 'opendyslexic' ? 'OpenDyslexic' : (settings.font ? settings.font : 'Default') },
    { name: 'Font Size', val: `${settings.size || 18}px` },
    { name: 'Line Spacing', val: `${settings.spacing || 1.8}×` },
    { name: 'Theme', val: (settings.theme || 'warm').charAt(0).toUpperCase() + (settings.theme || 'warm').slice(1) },
    { name: 'Reading Guide', val: localStorage.getItem('readxRulerEnabled') === 'true' ? 'Active' : 'Off' },
    { name: 'Line Focus', val: localStorage.getItem('readxFocusEnabled') === 'true' ? 'Active' : 'Off' }
  ];

  items.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'pref-row';
    chip.innerHTML = `
      <span class="pref-name">${item.name}</span>
      <span class="pref-val">${item.val}</span>
    `;
    container.appendChild(chip);
  });

  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      if (typeof App !== 'undefined' && App.toggleAccessibility) {
        App.toggleAccessibility();
      } else {
        const panel = document.getElementById('accessibilityPanel');
        if (panel) {
          panel.classList.add('active');
        } else {
          window.location.href = 'library.html';
        }
      }
    });
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'recently';
  const timeMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  if (isNaN(timeMs)) return 'recently';

  const diffSec = Math.floor((Date.now() - timeMs) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  if (diffSec < 172800) return 'yesterday';

  return new Date(timeMs).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
