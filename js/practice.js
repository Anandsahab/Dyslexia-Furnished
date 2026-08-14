// js/practice.js

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
  const categoryGrid = document.getElementById('categoryGrid');
  const categoriesEl = document.getElementById('quizCategories');
  const activeEl = document.getElementById('quizActive');
  const resultEl = document.getElementById('quizResult');

  let currentQuiz = null;
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let sourceTopic = null;

  Object.entries(ReadXData.quizzes).forEach(([id, quiz]) => {
    const card = document.createElement('button');
    card.className = 'quiz-category-card';
    card.innerHTML = `
      <span class="text-label">${quiz.category}</span>
      <h3>${quiz.title}</h3>
      <p>${quiz.desc} · ${quiz.questions.length} questions</p>
    `;
    card.addEventListener('click', () => startQuiz(id));
    categoryGrid.appendChild(card);
  });

  function startQuiz(id) {
    currentQuiz = { id, ...ReadXData.quizzes[id] };
    currentIndex = 0;
    score = 0;
    answered = false;
    categoriesEl.hidden = true;
    resultEl.hidden = true;
    activeEl.hidden = false;
    renderQuestion();
  }

  function renderQuestion() {
    const q = currentQuiz.questions[currentIndex];
    const total = currentQuiz.questions.length;

    document.getElementById('quizCategoryLabel').textContent = currentQuiz.category;
    document.getElementById('quizProgressText').textContent = `${currentIndex + 1} / ${total}`;
    document.getElementById('quizProgressFill').style.width = ((currentIndex / total) * 100) + '%';
    document.getElementById('quizQuestionNum').textContent = `Question ${currentIndex + 1}`;
    document.getElementById('quizQuestion').textContent = q.q;

    const optionsEl = document.getElementById('quizOptions');
    const feedbackEl = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('quizNextBtn');

    optionsEl.innerHTML = '';
    feedbackEl.className = 'quiz-feedback';
    feedbackEl.textContent = '';
    nextBtn.disabled = true;
    answered = false;

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `<span class="quiz-option-key">${String.fromCharCode(65 + i)}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => selectAnswer(i, btn));
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(index, btn) {
    if (answered) return;
    answered = true;

    const q = currentQuiz.questions[currentIndex];
    const isCorrect = index === q.answer;
    if (isCorrect) score++;

    document.querySelectorAll('.quiz-option').forEach((opt, i) => {
      opt.disabled = true;
      if (i === q.answer) opt.classList.add('correct');
      else if (i === index && !isCorrect) opt.classList.add('incorrect');
    });

    const feedbackEl = document.getElementById('quizFeedback');
    feedbackEl.className = `quiz-feedback visible ${isCorrect ? 'correct-fb' : 'incorrect-fb'}`;
    feedbackEl.textContent = q.explanation;

    document.getElementById('quizNextBtn').disabled = false;
  }

  document.getElementById('quizNextBtn').addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= currentQuiz.questions.length) {
      showResult();
    } else {
      renderQuestion();
    }
  });

  function showResult() {
    activeEl.hidden = true;
    resultEl.hidden = false;

    const total = currentQuiz.questions.length;
    const pct = Math.round((score / total) * 100);

    document.getElementById('resultScore').textContent = `${score}/${total}`;
    document.getElementById('resultMessage').textContent =
      pct >= 80 ? `Excellent work on ${currentQuiz.title}!` :
      pct >= 60 ? `Good effort on ${currentQuiz.title}. Review the topics and try again.` :
      `Keep studying ${currentQuiz.category} topics and retake the quiz.`;

    ReadXData.recordQuizScore(currentQuiz.id, score, total);
    if (sourceTopic && typeof ReadXData.recordTopicPractice === 'function') {
      ReadXData.recordTopicPractice(sourceTopic, score, total);
    }
  }

  document.getElementById('quizRetryBtn').addEventListener('click', () => startQuiz(currentQuiz.id));
  document.getElementById('quizBackBtn').addEventListener('click', () => {
    activeEl.hidden = true;
    resultEl.hidden = true;
    categoriesEl.hidden = false;
    sourceTopic = null;
    history.replaceState(null, '', 'practice.html');
  });

  const params = new URLSearchParams(window.location.search);
  const topicParam = params.get('topic');
  if (topicParam) {
    const quizId = TOPIC_QUIZ_MAP[topicParam];
    if (quizId && ReadXData.quizzes[quizId]) {
      sourceTopic = topicParam;
      startQuiz(quizId);
    }
  }
});
