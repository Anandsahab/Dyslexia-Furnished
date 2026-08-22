// js/practice.js — Topic Practice & 8-Week Sequential Practice Test Controller

const TOPIC_QUIZ_MAP = {
  dsa: 'dsa-basics',
  ml: 'ai-ml-core',
  'binary-search': 'dsa-basics',
  arrays: 'dsa-basics',
  'linked-lists': 'dsa-basics',
  stack: 'dsa-basics',
  queue: 'dsa-basics',
  recursion: 'dsa-basics',
  sorting: 'dsa-basics',
  trees: 'dsa-basics',
  graphs: 'dsa-basics',
  'dynamic-programming': 'dsa-basics',
  'linear-regression': 'ai-ml-core',
  'logistic-regression': 'ai-ml-core',
  classification: 'ai-ml-core',
  'kmeans-clustering': 'ai-ml-core',
  'neural-networks': 'ai-ml-core',
  'activation-functions': 'ai-ml-core',
  backpropagation: 'ai-ml-core',
  overfitting: 'ai-ml-core'
};

document.addEventListener('DOMContentLoaded', () => {
  // Hub containers
  const categoriesEl = document.getElementById('quizCategories');
  const categoryGrid = document.getElementById('categoryGrid');
  const weeklyPracticeSection = document.getElementById('weeklyPracticeSection');
  const sectionPractice = document.querySelector('.section-practice');

  // Topic Quiz elements
  const topicActiveEl = document.getElementById('quizActive');
  const topicResultEl = document.getElementById('quizResult');
  const quizCategoryLabel = document.getElementById('quizCategoryLabel');
  const quizProgressText = document.getElementById('quizProgressText');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizQuestionNum = document.getElementById('quizQuestionNum');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizRetryBtn = document.getElementById('quizRetryBtn');
  const quizBackBtn = document.getElementById('quizBackBtn');

  // Weekly Test Featured Card elements
  const startWeeklyBtn = document.getElementById('startWeeklyTestBtn');
  const weeklyBestScoreBadge = document.getElementById('weeklyBestScoreBadge');
  const weeklyBestScoreVal = document.getElementById('weeklyBestScoreVal');
  const weeklyWeekBadge = document.getElementById('weeklyWeekBadge');
  const weeklyTitle = document.getElementById('weeklyTitle');
  const weeklyDesc = document.getElementById('weeklyDesc');
  const weeklyMetaQuestions = document.getElementById('weeklyMetaQuestions');
  const weeklyMetaDuration = document.getElementById('weeklyMetaDuration');
  const weeklyLockStatusBadge = document.getElementById('weeklyLockStatusBadge');
  const weeklyCooldownBox = document.getElementById('weeklyCooldownBox');
  const cooldownTimerDisplay = document.getElementById('cooldownTimerDisplay');
  const weeklyCompletedNotice = document.getElementById('weeklyCompletedNotice');
  const weeklyCompNoticeTitle = document.getElementById('weeklyCompNoticeTitle');
  const weeklyCompNoticeScore = document.getElementById('weeklyCompNoticeScore');
  const weeklyRoadmapTrack = document.getElementById('weeklyRoadmapTrack');

  // Weekly Test Active elements
  const weeklyActiveEl = document.getElementById('weeklyTestActive');
  const wtHeaderTitle = document.getElementById('wtHeaderTitle');
  const wtCategoryLabel = document.getElementById('wtCategoryLabel');
  const wtTimerDisplay = document.getElementById('wtTimerDisplay');
  const wtTimerBadge = document.getElementById('wtTimerBadge');
  const wtProgressCount = document.getElementById('wtProgressCount');
  const wtProgressFill = document.getElementById('wtProgressFill');
  const wtNavPills = document.getElementById('wtNavPills');
  const wtQuestionNum = document.getElementById('wtQuestionNum');
  const wtAnsweredStatus = document.getElementById('wtAnsweredStatus');
  const wtQuestionText = document.getElementById('wtQuestionText');
  const wtOptionsContainer = document.getElementById('wtOptionsContainer');
  const wtPrevBtn = document.getElementById('wtPrevBtn');
  const wtNextBtn = document.getElementById('wtNextBtn');
  const wtSubmitBtn = document.getElementById('wtSubmitBtn');

  // Weekly Test Result elements
  const weeklyResultEl = document.getElementById('weeklyTestResult');
  const wtResultTitle = document.getElementById('wtResultTitle');
  const wtResultScoreMain = document.getElementById('wtResultScoreMain');
  const wtResultPctMain = document.getElementById('wtResultPctMain');
  const wtResultSummaryMsg = document.getElementById('wtResultSummaryMsg');
  const wtMetricScore = document.getElementById('wtMetricScore');
  const wtMetricPct = document.getElementById('wtMetricPct');
  const wtMetricCorrect = document.getElementById('wtMetricCorrect');
  const wtMetricIncorrect = document.getElementById('wtMetricIncorrect');
  const wtMetricTime = document.getElementById('wtMetricTime');
  const wtReviewAnswersBtn = document.getElementById('wtReviewAnswersBtn');
  const wtTryAgainBtn = document.getElementById('wtTryAgainBtn');
  const wtBackToPracticeBtn = document.getElementById('wtBackToPracticeBtn');

  // Weekly Test Review elements
  const weeklyReviewEl = document.getElementById('weeklyTestReview');
  const wtReviewHeading = document.getElementById('wtReviewHeading');
  const wtReviewList = document.getElementById('wtReviewList');
  const filterAllBtn = document.getElementById('filterAllBtn');
  const filterCorrectBtn = document.getElementById('filterCorrectBtn');
  const filterIncorrectBtn = document.getElementById('filterIncorrectBtn');
  const countAll = document.getElementById('countAll');
  const countCorrect = document.getElementById('countCorrect');
  const countIncorrect = document.getElementById('countIncorrect');
  const wtReviewBackToResultBtn = document.getElementById('wtReviewBackToResultBtn');
  const wtReviewBackToPracticeBtn = document.getElementById('wtReviewBackToPracticeBtn');

  // ============================================================
  // WEEKLY TEST & PROGRESSION STATE
  // ============================================================
  let currentWeeklyTest = null;
  let weeklyIndex = 0;
  let weeklyUserAnswers = [];
  let weeklyTimerInterval = null;
  let weeklyRemainingSeconds = 0;
  let weeklyTotalSeconds = 1200; // 20 minutes default
  let weeklyIsSubmitted = false;
  let lastTestResultData = null;
  let activeReviewFilter = 'all';
  let progressionCooldownInterval = null;

  // Initialize Progression UI
  initWeeklyProgressionUI();

  // ============================================================
  // TOPIC PRACTICE INITIALIZATION (PRESERVED)
  // ============================================================
  let currentQuiz = null;
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let sourceTopic = null;

  if (categoryGrid && typeof ReadXData !== 'undefined' && ReadXData.quizzes) {
    categoryGrid.innerHTML = '';
    Object.entries(ReadXData.quizzes).forEach(([id, quiz]) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'quiz-category-card';
      card.innerHTML = `
        <span class="text-label">${quiz.category}</span>
        <h3>${quiz.title}</h3>
        <p>${quiz.desc} · ${quiz.questions.length} questions</p>
      `;
      card.addEventListener('click', () => startTopicQuiz(id));
      categoryGrid.appendChild(card);
    });
  }

  function startTopicQuiz(id) {
    if (typeof ReadXData === 'undefined' || !ReadXData.quizzes || !ReadXData.quizzes[id]) return;
    currentQuiz = { id, ...ReadXData.quizzes[id] };
    currentIndex = 0;
    score = 0;
    answered = false;

    if (categoriesEl) categoriesEl.hidden = true;
    if (sectionPractice) sectionPractice.hidden = true;
    if (weeklyPracticeSection) weeklyPracticeSection.hidden = true;
    if (weeklyActiveEl) weeklyActiveEl.hidden = true;
    if (weeklyResultEl) weeklyResultEl.hidden = true;
    if (weeklyReviewEl) weeklyReviewEl.hidden = true;
    if (topicResultEl) topicResultEl.hidden = true;
    if (topicActiveEl) topicActiveEl.hidden = false;

    renderTopicQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderTopicQuestion() {
    const q = currentQuiz.questions[currentIndex];
    const total = currentQuiz.questions.length;

    if (quizCategoryLabel) quizCategoryLabel.textContent = currentQuiz.category;
    if (quizProgressText) quizProgressText.textContent = `${currentIndex + 1} / ${total}`;
    if (quizProgressFill) quizProgressFill.style.width = `${((currentIndex / total) * 100)}%`;
    if (quizQuestionNum) quizQuestionNum.textContent = `Question ${currentIndex + 1}`;
    if (quizQuestion) quizQuestion.textContent = q.q;

    if (quizOptions) {
      quizOptions.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.innerHTML = `<span class="quiz-option-key">${String.fromCharCode(65 + i)}</span><span>${escapeHtml(opt)}</span>`;
        btn.addEventListener('click', () => selectTopicAnswer(i, btn));
        quizOptions.appendChild(btn);
      });
    }

    if (quizFeedback) {
      quizFeedback.className = 'quiz-feedback';
      quizFeedback.textContent = '';
    }
    if (quizNextBtn) quizNextBtn.disabled = true;
    answered = false;
  }

  function selectTopicAnswer(index, btn) {
    if (answered) return;
    answered = true;

    const q = currentQuiz.questions[currentIndex];
    const isCorrect = index === q.answer;
    if (isCorrect) score++;

    if (quizOptions) {
      quizOptions.querySelectorAll('.quiz-option').forEach((opt, i) => {
        opt.disabled = true;
        if (i === q.answer) opt.classList.add('correct');
        else if (i === index && !isCorrect) opt.classList.add('incorrect');
      });
    }

    if (quizFeedback) {
      quizFeedback.className = `quiz-feedback visible ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
      quizFeedback.textContent = q.explanation;
    }

    if (quizNextBtn) quizNextBtn.disabled = false;
  }

  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      currentIndex++;
      if (currentIndex >= currentQuiz.questions.length) {
        showTopicResult();
      } else {
        renderTopicQuestion();
      }
    });
  }

  function showTopicResult() {
    if (topicActiveEl) topicActiveEl.hidden = true;
    if (topicResultEl) topicResultEl.hidden = false;

    const total = currentQuiz.questions.length;
    const pct = Math.round((score / total) * 100);

    const resScore = document.getElementById('resultScore');
    const resMsg = document.getElementById('resultMessage');

    if (resScore) resScore.textContent = `${score}/${total}`;
    if (resMsg) {
      resMsg.textContent =
        pct >= 80 ? `Excellent work on ${currentQuiz.title}!` :
        pct >= 60 ? `Good effort on ${currentQuiz.title}. Review the topics and try again.` :
        `Keep studying ${currentQuiz.category} topics and retake the quiz.`;
    }

    if (typeof ReadXData !== 'undefined' && ReadXData.recordTopicPractice) {
      ReadXData.recordTopicPractice(sourceTopic || currentQuiz.id, score, total, currentQuiz.title);
    }
  }

  if (quizRetryBtn) {
    quizRetryBtn.addEventListener('click', () => {
      if (currentQuiz) startTopicQuiz(currentQuiz.id);
    });
  }

  if (quizBackBtn) {
    quizBackBtn.addEventListener('click', () => {
      returnToPracticeHub();
    });
  }

  // ============================================================
  // SEQUENTIAL WEEKLY PROGRESSION CONTROLLER (8 WEEKS)
  // ============================================================
  function initWeeklyProgressionUI() {
    if (typeof ReadXData === 'undefined' || !ReadXData.getWeeklyProgression) return;

    clearInterval(progressionCooldownInterval);
    const prog = ReadXData.getWeeklyProgression();
    const activeTest = ReadXData.getWeeklyTest(prog.currentWeekId) || ReadXData.getWeeklyTest('week-01');

    // Update Best Score Badge
    const stats = ReadXData.getWeeklyTestStats();
    if (stats && stats.completedCount > 0 && weeklyBestScoreBadge && weeklyBestScoreVal) {
      weeklyBestScoreVal.textContent = `${stats.bestScore}%`;
      weeklyBestScoreBadge.style.display = 'inline-flex';
    } else if (weeklyBestScoreBadge) {
      weeklyBestScoreBadge.style.display = 'none';
    }

    if (!activeTest) return;

    // Render active test details in featured card
    if (weeklyWeekBadge) weeklyWeekBadge.textContent = `${activeTest.weekLabel.toUpperCase()} · ${activeTest.category}`;
    if (weeklyTitle) weeklyTitle.textContent = activeTest.title.toUpperCase();
    if (weeklyDesc) weeklyDesc.textContent = activeTest.desc;
    if (weeklyMetaQuestions) weeklyMetaQuestions.innerHTML = `<strong>${activeTest.questions.length}</strong> Questions`;
    if (weeklyMetaDuration) weeklyMetaDuration.innerHTML = `<strong>${activeTest.durationMinutes || 20}</strong> Minutes`;

    // Render Timeline Roadmap Track (Weeks 01–08)
    renderRoadmapTrack(prog);

    if (prog.allCompleted) {
      if (weeklyLockStatusBadge) {
        weeklyLockStatusBadge.textContent = 'ALL COMPLETED ✓';
        weeklyLockStatusBadge.className = 'weekly-lock-status-badge status-completed';
      }
      if (weeklyCooldownBox) weeklyCooldownBox.style.display = 'none';
      if (weeklyCompletedNotice) {
        weeklyCompletedNotice.style.display = 'flex';
        if (weeklyCompNoticeTitle) weeklyCompNoticeTitle.textContent = 'Curriculum Completed!';
        if (weeklyCompNoticeScore) weeklyCompNoticeScore.textContent = `All ${prog.completedCount} weekly tests completed successfully.`;
      }
      if (startWeeklyBtn) {
        startWeeklyBtn.disabled = true;
        startWeeklyBtn.className = 'btn btn-outline btn-lg weekly-start-btn btn-completed';
        startWeeklyBtn.innerHTML = 'CURRICULUM COMPLETED ✓';
      }
      return;
    }

    if (prog.isLocked) {
      // Currently in 7-day cooldown
      if (weeklyLockStatusBadge) {
        weeklyLockStatusBadge.textContent = '🔒 LOCKED';
        weeklyLockStatusBadge.className = 'weekly-lock-status-badge status-locked';
      }

      if (weeklyCooldownBox) weeklyCooldownBox.style.display = 'block';

      // Show completion notice of the previous week
      if (prog.lastCompletedInfo && weeklyCompletedNotice) {
        weeklyCompletedNotice.style.display = 'flex';
        const prevTest = ReadXData.getWeeklyTest(prog.lastCompletedInfo.weekId);
        if (weeklyCompNoticeTitle) {
          weeklyCompNoticeTitle.textContent = `${prevTest ? prevTest.weekLabel : 'Previous Test'} Completed ✓`;
        }
        if (weeklyCompNoticeScore) {
          weeklyCompNoticeScore.textContent = `Score: ${prog.lastCompletedInfo.percentage}% (${prog.lastCompletedInfo.score}/${prog.lastCompletedInfo.total})`;
        }
      }

      // Update cooldown timer countdown
      const updateCooldown = () => {
        const now = Date.now();
        const remainingMs = prog.nextUnlockTimestamp - now;

        if (remainingMs <= 0) {
          clearInterval(progressionCooldownInterval);
          initWeeklyProgressionUI(); // Auto-unlock immediately!
        } else {
          if (cooldownTimerDisplay) {
            cooldownTimerDisplay.textContent = ReadXData.formatRemainingCooldown(remainingMs);
          }
          if (startWeeklyBtn) {
            startWeeklyBtn.disabled = true;
            startWeeklyBtn.className = 'btn btn-outline btn-lg weekly-start-btn btn-locked';
            startWeeklyBtn.innerHTML = `🔒 LOCKED · AVAILABLE IN ${ReadXData.formatRemainingCooldown(remainingMs)}`;
          }
        }
      };

      updateCooldown();
      progressionCooldownInterval = setInterval(updateCooldown, 1000);
    } else {
      // Test is AVAILABLE to take
      if (weeklyLockStatusBadge) {
        weeklyLockStatusBadge.textContent = 'AVAILABLE';
        weeklyLockStatusBadge.className = 'weekly-lock-status-badge status-unlocked';
      }
      if (weeklyCooldownBox) weeklyCooldownBox.style.display = 'none';
      if (weeklyCompletedNotice) weeklyCompletedNotice.style.display = 'none';

      if (startWeeklyBtn) {
        startWeeklyBtn.disabled = false;
        startWeeklyBtn.className = 'btn btn-primary btn-lg weekly-start-btn';
        startWeeklyBtn.textContent = 'START TEST →';
      }
    }
  }

  function renderRoadmapTrack(prog) {
    if (!weeklyRoadmapTrack || typeof ReadXData === 'undefined') return;
    weeklyRoadmapTrack.innerHTML = '';

    const allTests = ReadXData.getAllWeeklyTests();
    allTests.forEach((t) => {
      const isCompleted = !!prog.completedWeeks[t.id];
      const isCurrent = (t.id === prog.currentWeekId);
      const isLocked = !isCompleted && (!isCurrent || prog.isLocked);

      const pill = document.createElement('div');
      pill.className = `roadmap-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''} ${isLocked ? 'step-locked' : ''}`;

      let icon = isCompleted ? '✓' : (isLocked ? '🔒' : '●');
      let statusText = isCompleted
        ? `${prog.completedWeeks[t.id].percentage}%`
        : (isCurrent && !prog.isLocked ? 'Ready' : 'Locked');

      pill.innerHTML = `
        <div class="roadmap-step-icon">${icon}</div>
        <div class="roadmap-step-info">
          <span class="roadmap-step-week">${t.weekLabel}</span>
          <span class="roadmap-step-name">${escapeHtml(t.title)}</span>
          <span class="roadmap-step-status">${statusText}</span>
        </div>
      `;

      weeklyRoadmapTrack.appendChild(pill);
    });
  }

  if (startWeeklyBtn) {
    startWeeklyBtn.addEventListener('click', () => {
      const prog = ReadXData.getWeeklyProgression();
      startWeeklyTest(prog.currentWeekId);
    });
  }

  // ============================================================
  // WEEKLY TEST EXECUTION ENGINE
  // ============================================================
  function startWeeklyTest(weekId) {
    if (typeof ReadXData === 'undefined' || !ReadXData.getWeeklyTest) return;

    // Strict security & progression validation check
    const check = ReadXData.canStartWeeklyTest(weekId);
    if (!check.allowed) {
      alert(check.reason || 'This weekly test cannot be started at this time.');
      return;
    }

    const test = ReadXData.getWeeklyTest(weekId);
    if (!test) return;

    currentWeeklyTest = test;
    weeklyIndex = 0;
    weeklyUserAnswers = new Array(test.questions.length).fill(null);
    weeklyIsSubmitted = false;
    weeklyTotalSeconds = (test.durationMinutes || 20) * 60;
    weeklyRemainingSeconds = weeklyTotalSeconds;

    // View Switching
    if (categoriesEl) categoriesEl.hidden = true;
    if (sectionPractice) sectionPractice.hidden = true;
    if (weeklyPracticeSection) weeklyPracticeSection.hidden = true;
    if (topicActiveEl) topicActiveEl.hidden = true;
    if (topicResultEl) topicResultEl.hidden = true;
    if (weeklyResultEl) weeklyResultEl.hidden = true;
    if (weeklyReviewEl) weeklyReviewEl.hidden = true;
    if (weeklyActiveEl) weeklyActiveEl.hidden = false;

    // Header info
    if (wtCategoryLabel) wtCategoryLabel.textContent = `${test.weekLabel.toUpperCase()} · ${test.category}`;
    if (wtHeaderTitle) wtHeaderTitle.textContent = test.title;

    // Initialize Timer
    clearInterval(weeklyTimerInterval);
    updateTimerDisplay();
    weeklyTimerInterval = setInterval(() => {
      weeklyRemainingSeconds--;
      updateTimerDisplay();
      if (weeklyRemainingSeconds <= 0) {
        clearInterval(weeklyTimerInterval);
        autoSubmitOnTimeUp();
      }
    }, 1000);

    // Build Question Navigator Pills
    renderNavPills();

    // Render Current Question
    renderWeeklyQuestion();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateTimerDisplay() {
    if (!wtTimerDisplay) return;
    const mins = Math.floor(Math.max(0, weeklyRemainingSeconds) / 60);
    const secs = Math.max(0, weeklyRemainingSeconds) % 60;
    wtTimerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (wtTimerBadge) {
      wtTimerBadge.classList.remove('timer-warning', 'timer-danger');
      if (weeklyRemainingSeconds <= 120) {
        wtTimerBadge.classList.add('timer-danger');
      } else if (weeklyRemainingSeconds <= 300) {
        wtTimerBadge.classList.add('timer-warning');
      }
    }
  }

  function renderNavPills() {
    if (!wtNavPills || !currentWeeklyTest) return;
    wtNavPills.innerHTML = '';

    currentWeeklyTest.questions.forEach((_, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'q-nav-pill';
      pill.textContent = idx + 1;
      pill.setAttribute('aria-label', `Go to question ${idx + 1}`);

      pill.addEventListener('click', () => {
        weeklyIndex = idx;
        renderWeeklyQuestion();
      });

      wtNavPills.appendChild(pill);
    });

    updateNavPillsState();
  }

  function updateNavPillsState() {
    if (!wtNavPills) return;
    const pills = wtNavPills.querySelectorAll('.q-nav-pill');
    pills.forEach((pill, idx) => {
      pill.classList.remove('current', 'answered');
      if (idx === weeklyIndex) {
        pill.classList.add('current');
      } else if (weeklyUserAnswers[idx] !== null) {
        pill.classList.add('answered');
      }
    });
  }

  function renderWeeklyQuestion() {
    if (!currentWeeklyTest) return;
    const q = currentWeeklyTest.questions[weeklyIndex];
    const total = currentWeeklyTest.questions.length;

    if (wtProgressCount) wtProgressCount.textContent = `${weeklyIndex + 1} of ${total}`;
    if (wtProgressFill) {
      const pct = ((weeklyIndex + 1) / total) * 100;
      wtProgressFill.style.width = `${pct}%`;
    }

    if (wtQuestionNum) wtQuestionNum.textContent = `Question ${String(weeklyIndex + 1).padStart(2, '0')}`;
    if (wtAnsweredStatus) {
      const isAnswered = weeklyUserAnswers[weeklyIndex] !== null;
      wtAnsweredStatus.textContent = isAnswered ? 'Answered ✓' : 'Not Answered';
      wtAnsweredStatus.className = `wt-answered-status ${isAnswered ? 'status-answered' : 'status-pending'}`;
    }

    if (wtQuestionText) wtQuestionText.textContent = q.q;

    // Render Options
    if (wtOptionsContainer) {
      wtOptionsContainer.innerHTML = '';
      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option weekly-quiz-option';
        const isSelected = weeklyUserAnswers[weeklyIndex] === optIdx;
        if (isSelected) btn.classList.add('selected');

        btn.innerHTML = `
          <span class="quiz-option-key">${String.fromCharCode(65 + optIdx)}</span>
          <span class="quiz-option-text">${escapeHtml(optText)}</span>
        `;

        btn.addEventListener('click', () => {
          selectWeeklyOption(optIdx);
        });

        wtOptionsContainer.appendChild(btn);
      });
    }

    // Navigation Buttons State
    if (wtPrevBtn) wtPrevBtn.disabled = (weeklyIndex === 0);
    if (wtNextBtn) {
      if (weeklyIndex === total - 1) {
        wtNextBtn.textContent = 'Review / Finish →';
      } else {
        wtNextBtn.textContent = 'Next Question →';
      }
    }

    updateNavPillsState();
  }

  function selectWeeklyOption(optIdx) {
    if (weeklyIsSubmitted) return;
    weeklyUserAnswers[weeklyIndex] = optIdx;

    if (wtOptionsContainer) {
      const btns = wtOptionsContainer.querySelectorAll('.weekly-quiz-option');
      btns.forEach((b, i) => {
        b.classList.toggle('selected', i === optIdx);
      });
    }

    if (wtAnsweredStatus) {
      wtAnsweredStatus.textContent = 'Answered ✓';
      wtAnsweredStatus.className = 'wt-answered-status status-answered';
    }
    updateNavPillsState();
  }

  if (wtPrevBtn) {
    wtPrevBtn.addEventListener('click', () => {
      if (weeklyIndex > 0) {
        weeklyIndex--;
        renderWeeklyQuestion();
      }
    });
  }

  if (wtNextBtn) {
    wtNextBtn.addEventListener('click', () => {
      if (currentWeeklyTest && weeklyIndex < currentWeeklyTest.questions.length - 1) {
        weeklyIndex++;
        renderWeeklyQuestion();
      } else if (weeklyIndex === currentWeeklyTest.questions.length - 1) {
        promptSubmitWeeklyTest();
      }
    });
  }

  if (wtSubmitBtn) {
    wtSubmitBtn.addEventListener('click', () => {
      promptSubmitWeeklyTest();
    });
  }

  function promptSubmitWeeklyTest() {
    if (weeklyIsSubmitted || !currentWeeklyTest) return;
    const total = currentWeeklyTest.questions.length;
    const answeredCount = weeklyUserAnswers.filter(a => a !== null).length;
    const unansweredCount = total - answeredCount;

    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.\n\nAre you sure you want to submit the weekly test now?`
      );
      if (!confirmSubmit) return;
    }

    submitWeeklyTest();
  }

  function autoSubmitOnTimeUp() {
    if (weeklyIsSubmitted) return;
    alert('Time is up! Your weekly test will be submitted automatically.');
    submitWeeklyTest();
  }

  function submitWeeklyTest() {
    if (weeklyIsSubmitted || !currentWeeklyTest) return;
    weeklyIsSubmitted = true;
    clearInterval(weeklyTimerInterval);

    if (wtSubmitBtn) wtSubmitBtn.disabled = true;

    const total = currentWeeklyTest.questions.length;
    let correctCount = 0;
    let incorrectCount = 0;

    const answersDetail = currentWeeklyTest.questions.map((q, i) => {
      const selected = weeklyUserAnswers[i];
      const isCorrect = selected === q.answer;
      if (isCorrect) correctCount++;
      else if (selected !== null) incorrectCount++;

      return {
        questionId: q.id,
        questionText: q.q,
        options: q.options,
        correctAnswer: q.answer,
        userAnswer: selected,
        isCorrect: isCorrect,
        isAnswered: selected !== null,
        explanation: q.explanation
      };
    });

    const score = correctCount;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const timeTakenSeconds = Math.max(1, weeklyTotalSeconds - Math.max(0, weeklyRemainingSeconds));
    const timeFormatted = `${Math.floor(timeTakenSeconds / 60).toString().padStart(2, '0')}:${(timeTakenSeconds % 60).toString().padStart(2, '0')}`;

    // Record via ReadXData storage engine
    if (typeof ReadXData !== 'undefined' && ReadXData.recordWeeklyTestResult) {
      ReadXData.recordWeeklyTestResult(
        currentWeeklyTest.id,
        score,
        total,
        timeTakenSeconds,
        answersDetail
      );
    }

    lastTestResultData = {
      test: currentWeeklyTest,
      score,
      total,
      percentage,
      correctCount,
      incorrectCount,
      unansweredCount: total - (correctCount + incorrectCount),
      timeTakenSeconds,
      timeFormatted,
      answersDetail
    };

    showWeeklyResults(lastTestResultData);
  }

  function showWeeklyResults(data) {
    if (weeklyActiveEl) weeklyActiveEl.hidden = true;
    if (weeklyReviewEl) weeklyReviewEl.hidden = true;
    if (weeklyResultEl) weeklyResultEl.hidden = false;

    if (wtResultTitle) wtResultTitle.textContent = `${data.test.weekLabel} · ${data.test.title}`;
    if (wtResultScoreMain) wtResultScoreMain.textContent = `${data.score} / ${data.total}`;
    if (wtResultPctMain) wtResultPctMain.textContent = `${data.percentage}%`;

    if (wtMetricScore) wtMetricScore.textContent = `${data.score} / ${data.total}`;
    if (wtMetricPct) wtMetricPct.textContent = `${data.percentage}%`;
    if (wtMetricCorrect) wtMetricCorrect.textContent = data.correctCount;
    if (wtMetricIncorrect) wtMetricIncorrect.textContent = data.incorrectCount;
    if (wtMetricTime) wtMetricTime.textContent = data.timeFormatted;

    if (wtResultSummaryMsg) {
      if (data.percentage >= 90) {
        wtResultSummaryMsg.textContent = `Mastery level achieved! Outstanding understanding of ${data.test.category} concepts.`;
      } else if (data.percentage >= 75) {
        wtResultSummaryMsg.textContent = `Great job! You have a solid grasp of this week’s curriculum.`;
      } else if (data.percentage >= 50) {
        wtResultSummaryMsg.textContent = `Good effort. Review the explanations to reinforce key concepts.`;
      } else {
        wtResultSummaryMsg.textContent = `Completed. Review the answer explanations to prepare for upcoming material.`;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Result view buttons
  if (wtReviewAnswersBtn) {
    wtReviewAnswersBtn.addEventListener('click', () => {
      showWeeklyReview();
    });
  }

  if (wtTryAgainBtn) {
    wtTryAgainBtn.addEventListener('click', () => {
      // Retake is strictly locked during 7-day cooldown as per rules
      const prog = ReadXData.getWeeklyProgression();
      if (prog.isLocked) {
        alert(`Weekly test completed. Next weekly test unlocks in ${ReadXData.formatRemainingCooldown(prog.remainingCooldownMs)}.`);
        showWeeklyReview();
      } else {
        returnToPracticeHub();
      }
    });
  }

  if (wtBackToPracticeBtn) {
    wtBackToPracticeBtn.addEventListener('click', () => {
      returnToPracticeHub();
    });
  }

  // ============================================================
  // REVIEW ANSWERS ENGINE
  // ============================================================
  function showWeeklyReview() {
    if (!lastTestResultData) return;
    if (weeklyResultEl) weeklyResultEl.hidden = true;
    if (weeklyActiveEl) weeklyActiveEl.hidden = true;
    if (weeklyReviewEl) weeklyReviewEl.hidden = false;

    if (wtReviewHeading) {
      wtReviewHeading.textContent = `Review Answers · ${lastTestResultData.test.weekLabel} ${lastTestResultData.test.category}`;
    }

    if (countAll) countAll.textContent = lastTestResultData.total;
    if (countCorrect) countCorrect.textContent = lastTestResultData.correctCount;
    if (countIncorrect) countIncorrect.textContent = lastTestResultData.incorrectCount;

    activeReviewFilter = 'all';
    updateFilterTabsUI();
    renderReviewList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateFilterTabsUI() {
    if (filterAllBtn) filterAllBtn.classList.toggle('active', activeReviewFilter === 'all');
    if (filterCorrectBtn) filterCorrectBtn.classList.toggle('active', activeReviewFilter === 'correct');
    if (filterIncorrectBtn) filterIncorrectBtn.classList.toggle('active', activeReviewFilter === 'incorrect');
  }

  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
      activeReviewFilter = 'all';
      updateFilterTabsUI();
      renderReviewList();
    });
  }

  if (filterCorrectBtn) {
    filterCorrectBtn.addEventListener('click', () => {
      activeReviewFilter = 'correct';
      updateFilterTabsUI();
      renderReviewList();
    });
  }

  if (filterIncorrectBtn) {
    filterIncorrectBtn.addEventListener('click', () => {
      activeReviewFilter = 'incorrect';
      updateFilterTabsUI();
      renderReviewList();
    });
  }

  function renderReviewList() {
    if (!wtReviewList || !lastTestResultData) return;
    wtReviewList.innerHTML = '';

    const answers = lastTestResultData.answersDetail;
    const filtered = answers.map((item, originalIdx) => ({ item, originalIdx })).filter(({ item }) => {
      if (activeReviewFilter === 'correct') return item.isCorrect;
      if (activeReviewFilter === 'incorrect') return !item.isCorrect;
      return true;
    });

    if (filtered.length === 0) {
      wtReviewList.innerHTML = `
        <div class="review-empty-state">
          <p>No questions match the selected filter (${activeReviewFilter}).</p>
        </div>
      `;
      return;
    }

    filtered.forEach(({ item, originalIdx }) => {
      const card = document.createElement('div');
      card.className = `review-question-card ${item.isCorrect ? 'rev-card-correct' : 'rev-card-incorrect'}`;

      const statusBadgeHTML = item.isCorrect
        ? `<span class="review-status-badge badge-correct">Correct ✓</span>`
        : `<span class="review-status-badge badge-incorrect">${item.isAnswered ? 'Incorrect ✗' : 'Unanswered ⊘'}</span>`;

      let optionsHTML = '';
      item.options.forEach((optText, optIdx) => {
        const isUserChoice = item.userAnswer === optIdx;
        const isCorrectChoice = item.correctAnswer === optIdx;

        let optClass = 'review-opt';
        let badgeHTML = '';

        if (isCorrectChoice) {
          optClass += ' opt-correct-target';
          badgeHTML = '<span class="rev-opt-tag tag-correct">Correct Answer ✓</span>';
        } else if (isUserChoice) {
          optClass += ' opt-user-incorrect';
          badgeHTML = '<span class="rev-opt-tag tag-incorrect">Your Answer ✗</span>';
        }

        optionsHTML += `
          <div class="${optClass}">
            <div class="rev-opt-left">
              <span class="quiz-option-key">${String.fromCharCode(65 + optIdx)}</span>
              <span class="rev-opt-text">${escapeHtml(optText)}</span>
            </div>
            ${badgeHTML}
          </div>
        `;
      });

      card.innerHTML = `
        <div class="review-card-header">
          <div class="review-q-num">Question ${originalIdx + 1} of ${answers.length}</div>
          ${statusBadgeHTML}
        </div>
        <h4 class="review-q-text" style="font-size:1.05rem; margin:0.5rem 0 1rem;">${escapeHtml(item.questionText)}</h4>
        <div class="review-options-list">
          ${optionsHTML}
        </div>
        <div class="review-explanation-box">
          <div class="explanation-label">Explanation:</div>
          <p class="explanation-text">${escapeHtml(item.explanation)}</p>
        </div>
      `;

      wtReviewList.appendChild(card);
    });
  }

  if (wtReviewBackToResultBtn) {
    wtReviewBackToResultBtn.addEventListener('click', () => {
      if (lastTestResultData) showWeeklyResults(lastTestResultData);
    });
  }

  if (wtReviewBackToPracticeBtn) {
    wtReviewBackToPracticeBtn.addEventListener('click', () => {
      returnToPracticeHub();
    });
  }

  function returnToPracticeHub() {
    clearInterval(weeklyTimerInterval);
    if (wtSubmitBtn) wtSubmitBtn.disabled = false;
    if (weeklyActiveEl) weeklyActiveEl.hidden = true;
    if (weeklyResultEl) weeklyResultEl.hidden = true;
    if (weeklyReviewEl) weeklyReviewEl.hidden = true;
    if (topicActiveEl) topicActiveEl.hidden = true;
    if (topicResultEl) topicResultEl.hidden = true;

    if (categoriesEl) categoriesEl.hidden = false;
    if (sectionPractice) sectionPractice.hidden = false;
    if (weeklyPracticeSection) weeklyPracticeSection.hidden = false;

    initWeeklyProgressionUI();
    history.replaceState(null, '', 'practice.html');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle URL Query Params e.g. practice.html?topic=binary-search
  const params = new URLSearchParams(window.location.search);
  const topicParam = params.get('topic');
  if (topicParam) {
    const quizId = TOPIC_QUIZ_MAP[topicParam];
    if (quizId && ReadXData.quizzes && ReadXData.quizzes[quizId]) {
      sourceTopic = topicParam;
      startTopicQuiz(quizId);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
