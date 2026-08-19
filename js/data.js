// js/data.js — shared content data & localStorage persistence

const ReadXData = {
  STORAGE_KEYS: {
    profile: 'readx-profile',
    uploads: 'readx-uploads',
    progress: 'readx-progress',
    learningStats: 'readx-learning-stats',
    readingProgress: 'readx-reading-progress',
    topicVisits: 'readx-topic-visits'
  },

  get library() {
    return typeof ReadXTopics !== 'undefined' ? ReadXTopics.list : [];
  },

  articles: {
    'binary-search': {
      title: 'Understanding Binary Search',
      category: 'Computer Science Core',
      desc: 'A fundamental algorithm that demonstrates the power of divide and conquer in computer science.',
      sections: [
        { id: 'intro', title: 'Introduction' },
        { id: 'how-it-works', title: 'How It Works' },
        { id: 'complexity', title: 'Time Complexity' },
        { id: 'implementation', title: 'Implementation Notes' }
      ],
      content: `
        <h2 id="intro">Introduction</h2>
        <p>In computer science, binary search, also known as half-interval search, logarithmic search, or binary chop, is a search algorithm that finds the position of a target value within a sorted array. Binary search compares the target value to the middle element of the array. If they are not equal, the half in which the target cannot lie is eliminated and the search continues on the remaining half.</p>
        <p>Binary search is one of the most important algorithms in computer science. It appears in countless applications — from database indexing to game development, from version control systems to machine learning hyperparameter tuning.</p>

        <h2 id="how-it-works">How It Works</h2>
        <p>The algorithm maintains two pointers, low and high, representing the current search interval. At each step, it computes the midpoint and compares the middle element to the target. If the target is smaller, the search continues in the left half; if larger, in the right half. This process repeats until the target is found or the interval is empty.</p>
        <p>Consider searching for the value 23 in the sorted array [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]. The first midpoint is index 4 (value 16). Since 23 > 16, we discard the left half. The new midpoint is index 7 (value 56). Since 23 < 56, we search the left portion and find 23 at index 5.</p>

        <h2 id="complexity">Time Complexity</h2>
        <p>Binary search runs in logarithmic time in the worst case, making O(log n) comparisons, where n is the number of elements in the array. Each comparison eliminates half of the remaining elements. For an array of one million elements, binary search requires at most 20 comparisons — compared to up to one million for linear search.</p>
        <p>However, the array must be sorted first to apply binary search. The cost of sorting is O(n log n), which means binary search is most beneficial when searching the same dataset multiple times.</p>

        <h2 id="implementation">Implementation Notes</h2>
        <p>When implementing binary search, it is crucial to avoid integer overflow when calculating the midpoint. A naive implementation might calculate the middle index as (low + high) / 2. If the bounds are large enough, their sum could exceed the maximum representable integer. The safest approach is: mid = low + (high - low) / 2.</p>
        <p>There are numerous variations of binary search, including finding the first or last occurrence of a target, searching in rotated sorted arrays, and applying binary search on the answer space for optimization problems.</p>
      `
    },
    'dynamic-programming': {
      title: 'Introduction to Dynamic Programming',
      category: 'Algorithms',
      desc: 'A systematic method for solving complex problems by breaking them into overlapping subproblems.',
      sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'memoization', title: 'Memoization vs Tabulation' },
        { id: 'classic-problems', title: 'Classic Problems' }
      ],
      content: `
        <h2 id="overview">Overview</h2>
        <p>Dynamic programming (DP) is both a mathematical optimization method and a computer programming method. It solves complex problems by breaking them down into simpler subproblems. It is applicable when subproblems overlap — that is, when the same subproblems are solved multiple times during the computation.</p>
        <p>Two key properties define a problem suitable for dynamic programming: optimal substructure (the optimal solution can be constructed from optimal solutions of subproblems) and overlapping subproblems (the same subproblems are solved repeatedly).</p>

        <h2 id="memoization">Memoization vs Tabulation</h2>
        <p>Memoization is a top-down approach where we use recursion and cache results of subproblems in a table. Tabulation is a bottom-up approach where we solve all smaller subproblems first and build up to the final answer. Both achieve the same time complexity but differ in space usage and implementation style.</p>
        <p>For the Fibonacci sequence, naive recursion recalculates fib(n-2) many times. With memoization, each fib(k) is computed exactly once, reducing time complexity from O(2^n) to O(n).</p>

        <h2 id="classic-problems">Classic Problems</h2>
        <p>Common DP problems include the knapsack problem, longest common subsequence, edit distance, coin change, and matrix chain multiplication. Each demonstrates how identifying the right subproblem structure leads to elegant, efficient solutions.</p>
        <p>The knapsack problem asks: given items with weights and values, select items to maximize total value without exceeding a weight capacity. The DP solution builds a table where dp[i][w] represents the maximum value using the first i items with capacity w.</p>
      `
    },
    'graph-traversal': {
      title: 'Graph Traversal: BFS and DFS',
      category: 'Graph Theory',
      desc: 'Two fundamental strategies for exploring graph structures in computer science.',
      sections: [
        { id: 'graphs', title: 'Graph Representations' },
        { id: 'bfs', title: 'Breadth-First Search' },
        { id: 'dfs', title: 'Depth-First Search' }
      ],
      content: `
        <h2 id="graphs">Graph Representations</h2>
        <p>Graphs can be represented using adjacency lists or adjacency matrices. An adjacency list stores, for each vertex, a list of its neighbors — efficient for sparse graphs. An adjacency matrix uses a 2D array where entry (i,j) indicates whether an edge exists between vertices i and j.</p>

        <h2 id="bfs">Breadth-First Search</h2>
        <p>BFS explores a graph level by level, starting from a source vertex. It uses a queue data structure: dequeue a vertex, process it, and enqueue all unvisited neighbors. BFS finds shortest paths in unweighted graphs and is used in social network analysis, web crawling, and GPS navigation.</p>
        <p>Time complexity is O(V + E) where V is the number of vertices and E is the number of edges, assuming adjacency list representation.</p>

        <h2 id="dfs">Depth-First Search</h2>
        <p>DFS explores as far as possible along each branch before backtracking. It uses a stack (or recursion). DFS is used for topological sorting, detecting cycles, finding connected components, and solving maze problems. Like BFS, it runs in O(V + E) time.</p>
      `
    },
    'sorting-algorithms': {
      title: 'Sorting Algorithms Compared',
      category: 'Algorithms',
      desc: 'A comparative study of major sorting algorithms and their practical trade-offs.',
      sections: [
        { id: 'comparison', title: 'Complexity Comparison' },
        { id: 'merge', title: 'Merge Sort' },
        { id: 'quick', title: 'Quicksort' }
      ],
      content: `
        <h2 id="comparison">Complexity Comparison</h2>
        <p>Sorting is one of the most studied problems in computer science. Merge sort, quicksort, and heap sort all achieve O(n log n) average time complexity, but differ in stability, space requirements, and cache performance.</p>

        <h2 id="merge">Merge Sort</h2>
        <p>Merge sort divides the array in half recursively, sorts each half, and merges the sorted halves. It guarantees O(n log n) in all cases and is stable, but requires O(n) auxiliary space. It performs well on linked lists and external sorting.</p>

        <h2 id="quick">Quicksort</h2>
        <p>Quicksort picks a pivot element, partitions the array so elements smaller than the pivot are on the left, and recursively sorts both partitions. Average case is O(n log n) with O(log n) space, but worst case degrades to O(n²) with poor pivot choices. In practice, quicksort is often the fastest due to excellent cache locality.</p>
      `
    },
    'neural-networks': {
      title: 'Neural Networks Fundamentals',
      category: 'Deep Learning',
      desc: 'Understanding the building blocks of modern artificial intelligence systems.',
      sections: [
        { id: 'perceptron', title: 'The Perceptron' },
        { id: 'activation', title: 'Activation Functions' },
        { id: 'training', title: 'Training with Backpropagation' }
      ],
      content: `
        <h2 id="perceptron">The Perceptron</h2>
        <p>A neural network is composed of layers of interconnected nodes called neurons. Each neuron computes a weighted sum of its inputs, adds a bias term, and passes the result through an activation function. The simplest unit is the perceptron — a single neuron that can learn linear decision boundaries.</p>
        <p>Stacking multiple layers creates a multi-layer perceptron (MLP), which can approximate any continuous function given sufficient neurons — this is the universal approximation theorem.</p>

        <h2 id="activation">Activation Functions</h2>
        <p>Activation functions introduce non-linearity, enabling networks to learn complex patterns. ReLU (Rectified Linear Unit) is the most common: f(x) = max(0, x). Sigmoid and tanh are used in output layers for classification and in LSTM gates. Softmax converts raw scores into probability distributions over classes.</p>

        <h2 id="training">Training with Backpropagation</h2>
        <p>Networks learn by minimizing a loss function that measures prediction error. Backpropagation computes gradients of the loss with respect to each weight using the chain rule, enabling gradient descent to update weights iteratively. Modern frameworks like PyTorch and TensorFlow automate this process through automatic differentiation.</p>
      `
    },
    'gradient-descent': {
      title: 'Gradient Descent Optimization',
      category: 'Machine Learning',
      desc: 'The optimization engine behind virtually every machine learning model.',
      sections: [
        { id: 'concept', title: 'The Core Idea' },
        { id: 'variants', title: 'Variants' },
        { id: 'learning-rate', title: 'Learning Rate' }
      ],
      content: `
        <h2 id="concept">The Core Idea</h2>
        <p>Gradient descent iteratively adjusts model parameters in the direction of steepest descent of the loss function. Imagine standing on a hilly landscape in fog — you feel the slope under your feet and take a step downhill. Repeat until you reach a valley (local minimum).</p>
        <p>Mathematically, each parameter θ is updated as: θ = θ - α · ∇L(θ), where α is the learning rate and ∇L(θ) is the gradient of the loss.</p>

        <h2 id="variants">Variants</h2>
        <p>Batch gradient descent uses the entire dataset for each update — accurate but slow. Stochastic gradient descent (SGD) uses one sample at a time — fast but noisy. Mini-batch SGD balances both, typically using 32–256 samples per batch. Adam and RMSprop are adaptive optimizers that adjust learning rates per parameter.</p>

        <h2 id="learning-rate">Learning Rate</h2>
        <p>The learning rate is the most important hyperparameter. Too large and training diverges; too small and convergence is painfully slow. Learning rate schedules — step decay, cosine annealing, warm restarts — help navigate the loss landscape effectively.</p>
      `
    },
    'transformers': {
      title: 'Transformer Architecture Explained',
      category: 'NLP',
      desc: 'The architecture revolutionizing natural language processing and beyond.',
      sections: [
        { id: 'attention', title: 'Self-Attention' },
        { id: 'architecture', title: 'Encoder-Decoder Structure' },
        { id: 'impact', title: 'Impact and Applications' }
      ],
      content: `
        <h2 id="attention">Self-Attention</h2>
        <p>The key innovation of transformers is the self-attention mechanism. For each token in a sequence, self-attention computes a weighted sum of all other tokens, where weights indicate relevance. This allows the model to capture relationships regardless of distance — "The animal didn't cross the street because it was too tired" correctly links "it" to "animal."</p>
        <p>Multi-head attention runs several attention operations in parallel, each learning different relationship types — syntactic, semantic, positional.</p>

        <h2 id="architecture">Encoder-Decoder Structure</h2>
        <p>The original transformer uses an encoder stack (processes input) and decoder stack (generates output). BERT uses only the encoder for understanding tasks. GPT uses only the decoder for generation. Both rely on positional encodings to inject sequence order information, since attention itself is permutation-invariant.</p>

        <h2 id="impact">Impact and Applications</h2>
        <p>Transformers have become the dominant architecture in NLP and are expanding into computer vision (ViT), protein folding (AlphaFold), and code generation. Their ability to parallelize training on modern hardware makes them scalable to billions of parameters.</p>
      `
    },
    'decision-trees': {
      title: 'Decision Trees and Random Forests',
      category: 'Machine Learning',
      desc: 'Interpretable tree-based models and their powerful ensemble extensions.',
      sections: [
        { id: 'trees', title: 'Decision Trees' },
        { id: 'splitting', title: 'Splitting Criteria' },
        { id: 'forests', title: 'Random Forests' }
      ],
      content: `
        <h2 id="trees">Decision Trees</h2>
        <p>A decision tree recursively splits the feature space using simple rules. Each internal node tests a feature threshold; each leaf node predicts a class or value. Trees are highly interpretable — you can trace the exact path that led to any prediction.</p>

        <h2 id="splitting">Splitting Criteria</h2>
        <p>For classification, splits maximize information gain (reduction in entropy) or minimize Gini impurity. For regression, splits minimize variance within child nodes. Pruning prevents overfitting by removing branches that don't improve validation performance.</p>

        <h2 id="forests">Random Forests</h2>
        <p>Random forests build many decision trees on bootstrapped samples of the data, each considering a random subset of features at each split. Predictions are aggregated by majority vote (classification) or averaging (regression). This reduces variance and typically outperforms single trees significantly.</p>
      `
    }
  },

  quizzes: {
    'dsa-basics': {
      title: 'DSA Fundamentals',
      category: 'DSA',
      desc: 'Test your understanding of core data structures and algorithms.',
      questions: [
        {
          q: 'What is the time complexity of binary search on a sorted array of n elements?',
          options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
          answer: 1,
          explanation: 'Binary search halves the search space with each comparison, resulting in O(log n) time complexity.'
        },
        {
          q: 'Which data structure is most appropriate for implementing BFS?',
          options: ['Stack', 'Queue', 'Heap', 'Hash Map'],
          answer: 1,
          explanation: 'BFS processes nodes level by level, which requires a FIFO structure — a queue.'
        },
        {
          q: 'Dynamic programming is applicable when a problem has:',
          options: ['Greedy choice property only', 'Optimal substructure and overlapping subproblems', 'No recursive structure', 'Constant space requirements'],
          answer: 1,
          explanation: 'DP requires optimal substructure (optimal solution built from optimal subproblems) and overlapping subproblems (same subproblems solved repeatedly).'
        },
        {
          q: 'Which sorting algorithm guarantees O(n log n) worst-case time and is stable?',
          options: ['Quicksort', 'Heapsort', 'Merge sort', 'Bubble sort'],
          answer: 2,
          explanation: 'Merge sort always runs in O(n log n) and preserves the relative order of equal elements (stable sort).'
        },
        {
          q: 'In a graph with V vertices and E edges, what is the time complexity of DFS using an adjacency list?',
          options: ['O(V²)', 'O(V + E)', 'O(E log V)', 'O(V × E)'],
          answer: 1,
          explanation: 'DFS visits each vertex once and examines each edge once, giving O(V + E) with adjacency list representation.'
        }
      ]
    },
    'ai-ml-core': {
      title: 'AI/ML Core Concepts',
      category: 'AI/ML',
      desc: 'Assess your knowledge of machine learning fundamentals and neural networks.',
      questions: [
        {
          q: 'What does the learning rate control in gradient descent?',
          options: ['Number of epochs', 'Step size during parameter updates', 'Batch size', 'Number of hidden layers'],
          answer: 1,
          explanation: 'The learning rate (α) determines how large each parameter update step is: θ = θ - α·∇L.'
        },
        {
          q: 'Which activation function is most commonly used in hidden layers of modern networks?',
          options: ['Sigmoid', 'Tanh', 'ReLU', 'Linear'],
          answer: 2,
          explanation: 'ReLU (f(x) = max(0,x)) is the default choice due to computational efficiency and reduced vanishing gradient problems.'
        },
        {
          q: 'What is the key innovation of the Transformer architecture?',
          options: ['Recurrent connections', 'Self-attention mechanism', 'Convolutional filters', 'Decision tree ensembles'],
          answer: 1,
          explanation: 'Transformers replace recurrence with self-attention, enabling parallel processing and capturing long-range dependencies.'
        },
        {
          q: 'Random forests reduce overfitting primarily by:',
          options: ['Using deeper trees', 'Averaging predictions from many decorrelated trees', 'Removing all features', 'Increasing learning rate'],
          answer: 1,
          explanation: 'Ensemble averaging of many trees trained on random subsets reduces variance without increasing bias significantly.'
        },
        {
          q: 'Backpropagation is used to:',
          options: ['Initialize weights randomly', 'Compute loss gradients for weight updates', 'Normalize input data', 'Select activation functions'],
          answer: 1,
          explanation: 'Backpropagation efficiently computes gradients of the loss function with respect to all network weights using the chain rule.'
        }
      ]
    }
  },
  // ============================================================
  // USER-SCOPED DATA & LIVE TRACKING ENGINE
  // ============================================================

  getCurrentUserId() {
    if (typeof ReadXAuth !== 'undefined' && ReadXAuth.getCurrentUser) {
      const user = ReadXAuth.getCurrentUser();
      if (user && user.id) return user.id;
    }
    return 'usr_guest';
  },

  getUserStorageKey(baseKey, userId) {
    const uid = userId || this.getCurrentUserId();
    return `readx_user_${uid}_${baseKey}`;
  },

  getProfile(userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('profile', uid);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }

    if (typeof ReadXAuth !== 'undefined') {
      const u = ReadXAuth.getCurrentUser();
      if (u && u.id === uid) {
        return {
          id: u.id,
          name: u.name || 'ReadX Learner',
          email: u.email || 'user@readx.app',
          joined: u.joined || '2026-01-15',
          bio: u.bio || 'Computer Science student · ReadX learner'
        };
      }
    }

    return {
      id: uid,
      name: 'ReadX Learner',
      email: 'user@readx.app',
      joined: new Date().toISOString().split('T')[0],
      bio: 'ReadX learner'
    };
  },

  saveProfile(profile, userId) {
    const uid = userId || profile?.id || this.getCurrentUserId();
    const key = this.getUserStorageKey('profile', uid);
    localStorage.setItem(key, JSON.stringify(profile));
  },

  getLearningStats(userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('learning-stats', uid);
    const saved = localStorage.getItem(key);
    
    const defaults = {
      readingSessions: 0,
      wordsRead: 0,
      readingTimeMinutes: 0,
      documentsOpened: 0,
      documentsCompleted: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      questionsIncorrect: 0,
      practiceAccuracy: 0,
      topicsPracticed: [],
      topicsCompleted: [],
      readxSessionsCount: 0,
      readAloudUsageCount: 0,
      lineFocusUsageCount: 0,
      readingGuideUsageCount: 0,
      recentActivity: [],
      readingHistory: {},
      continueReading: null,
      streak: {
        current: 0,
        longest: 0,
        historyDates: []
      }
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed,
          readingHistory: parsed.readingHistory || {},
          recentActivity: parsed.recentActivity || [],
          streak: { ...defaults.streak, ...(parsed.streak || {}) }
        };
      } catch (e) {
        console.error('Error parsing user learning stats', e);
      }
    }

    return defaults;
  },

  saveLearningStats(stats, userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('learning-stats', uid);
    localStorage.setItem(key, JSON.stringify(stats));
  },

  getTopic(id) {
    if (typeof ReadXTopics !== 'undefined') return ReadXTopics.getTopic(id);
    return null;
  },

  markTopicVisited(id) {
    const uid = this.getCurrentUserId();
    const visitsKey = this.getUserStorageKey('topic-visits', uid);
    const visits = JSON.parse(localStorage.getItem(visitsKey) || '[]');
    if (!visits.includes(id)) visits.push(id);
    localStorage.setItem(visitsKey, JSON.stringify(visits));
    this.markArticleRead(id, 8);
  },

  getUploads(userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('uploads', uid);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  },

  saveUploads(uploads, userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('uploads', uid);
    localStorage.setItem(key, JSON.stringify(uploads));
  },

  getProgress(userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('progress', uid);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {
      articlesRead: [],
      totalReadTime: 0,
      quizAttempts: [],
      lastActive: null
    };
  },

  saveProgress(progress, userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('progress', uid);
    localStorage.setItem(key, JSON.stringify(progress));
  },

  getReadingProgress(articleId, userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('reading-progress', uid);
    const saved = localStorage.getItem(key);
    const all = saved ? JSON.parse(saved) : {};
    return all[articleId] || 0;
  },

  setReadingProgress(articleId, percent, userId) {
    const uid = userId || this.getCurrentUserId();
    const key = this.getUserStorageKey('reading-progress', uid);
    const saved = localStorage.getItem(key);
    const all = saved ? JSON.parse(saved) : {};
    const clamped = Math.min(100, Math.max(all[articleId] || 0, percent));
    all[articleId] = clamped;
    localStorage.setItem(key, JSON.stringify(all));

    const stats = this.getLearningStats(uid);
    const topic = this.getTopic(articleId) || this.getUploads(uid).find(u => u.id === articleId);
    if (topic) {
      stats.continueReading = {
        docId: articleId,
        title: topic.title || topic.filename || 'Document',
        progress: clamped,
        timestamp: Date.now()
      };
      if (clamped >= 90 && !stats.topicsCompleted.includes(articleId)) {
        stats.topicsCompleted.push(articleId);
        stats.documentsCompleted = stats.topicsCompleted.length;
      }
      this.saveLearningStats(stats, uid);
    }
  },

  markArticleRead(articleId, readTimeMin) {
    const uid = this.getCurrentUserId();
    const progress = this.getProgress(uid);
    if (!progress.articlesRead.includes(articleId)) {
      progress.articlesRead.push(articleId);
    }
    progress.totalReadTime = (progress.totalReadTime || 0) + (readTimeMin || 5);
    progress.lastActive = new Date().toISOString();
    this.saveProgress(progress, uid);
  },

  // ACTIVE READING SESSION LOGIC
  startReadingSession(docId, docTitle, wordCount = 0, type = 'read') {
    const uid = this.getCurrentUserId();
    const stats = this.getLearningStats(uid);
    
    const now = Date.now();
    const sessionInfo = {
      sessionId: 'sess_' + now,
      docId: docId || 'general',
      title: docTitle || 'Document',
      startTime: now,
      wordCount: wordCount || 0,
      type
    };

    sessionStorage.setItem(`readx_active_session_${uid}`, JSON.stringify(sessionInfo));

    stats.documentsOpened = (stats.documentsOpened || 0) + 1;
    stats.continueReading = {
      docId: docId || 'general',
      title: docTitle || 'Document',
      progress: this.getReadingProgress(docId, uid) || 10,
      timestamp: now
    };

    this.addRecentActivity({
      type: 'opened',
      title: docTitle || 'Document',
      detail: 'Opened reader session',
      timestamp: now
    }, uid);

    this.saveLearningStats(stats, uid);
    return sessionInfo;
  },

  endReadingSession(docId, wordCount = 0) {
    const uid = this.getCurrentUserId();
    const sessionStr = sessionStorage.getItem(`readx_active_session_${uid}`);
    if (!sessionStr) return;

    try {
      const session = JSON.parse(sessionStr);
      sessionStorage.removeItem(`readx_active_session_${uid}`);

      const now = Date.now();
      const elapsedMs = Math.max(0, now - session.startTime);
      const elapsedMinutes = elapsedMs >= 5000 ? Math.max(1, Math.round(elapsedMs / 60000)) : 0;
      
      const stats = this.getLearningStats(uid);
      stats.readingSessions = (stats.readingSessions || 0) + 1;
      stats.readingTimeMinutes = (stats.readingTimeMinutes || 0) + elapsedMinutes;

      const wordsToAdd = wordCount || session.wordCount || 0;
      stats.wordsRead = (stats.wordsRead || 0) + wordsToAdd;

      const todayStr = new Date().toISOString().split('T')[0];
      stats.readingHistory[todayStr] = (stats.readingHistory[todayStr] || 0) + Math.max(1, elapsedMinutes);

      this.recalculateStreak(stats, todayStr);
      this.saveLearningStats(stats, uid);
    } catch (e) {
      console.error('Error ending reading session', e);
    }
  },

  recalculateStreak(stats, todayStr) {
    if (!stats.streak) {
      stats.streak = { current: 0, longest: 0, historyDates: [] };
    }
    const history = stats.readingHistory || {};
    const datesWithActivity = Object.keys(history).filter(d => history[d] > 0).sort();

    stats.streak.historyDates = datesWithActivity;

    if (datesWithActivity.length === 0) {
      stats.streak.current = 0;
      stats.streak.longest = 0;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let current = 0;
    
    const todayISO = checkDate.toISOString().split('T')[0];
    let hasActivityNearNow = false;

    if (history[todayISO] && history[todayISO] > 0) {
      hasActivityNearNow = true;
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayISO = checkDate.toISOString().split('T')[0];
      if (history[yesterdayISO] && history[yesterdayISO] > 0) {
        hasActivityNearNow = true;
      }
    }

    if (hasActivityNearNow) {
      checkDate = new Date(today);
      if (!history[todayISO]) {
        checkDate.setDate(checkDate.getDate() - 1);
      }
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (history[dStr] && history[dStr] > 0) {
          current++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    stats.streak.current = current;
    stats.streak.longest = Math.max(stats.streak.longest || 0, current, datesWithActivity.length);
  },

  recordTopicPractice(topicId, score, total, topicTitle) {
    const uid = this.getCurrentUserId();
    const stats = this.getLearningStats(uid);

    const questionsTotal = (stats.questionsAttempted || 0) + total;
    const questionsCorrect = (stats.questionsCorrect || 0) + score;
    const questionsIncorrect = questionsTotal - questionsCorrect;
    const accuracy = questionsTotal > 0 ? Math.round((questionsCorrect / questionsTotal) * 100) : 0;

    stats.questionsAttempted = questionsTotal;
    stats.questionsCorrect = questionsCorrect;
    stats.questionsIncorrect = questionsIncorrect;
    stats.practiceAccuracy = accuracy;

    const title = topicTitle || (this.getTopic(topicId)?.title) || topicId;
    if (!stats.topicsPracticed.includes(title)) {
      stats.topicsPracticed.push(title);
    }
    if (accuracy >= 80 && !stats.topicsCompleted.includes(title)) {
      stats.topicsCompleted.push(title);
    }

    this.addRecentActivity({
      type: 'practice',
      title: title,
      detail: `${Math.round((score/total)*100)}% accuracy (${score}/${total})`,
      timestamp: Date.now()
    }, uid);

    this.saveLearningStats(stats, uid);
  },

  recordFeatureUse(featureName, docTitle) {
    const uid = this.getCurrentUserId();
    const stats = this.getLearningStats(uid);

    if (featureName === 'readAloud') {
      stats.readAloudUsageCount = (stats.readAloudUsageCount || 0) + 1;
      this.addRecentActivity({
        type: 'readAloud',
        title: docTitle || 'Read Aloud',
        detail: 'Text-to-speech audio active',
        timestamp: Date.now()
      }, uid);
    } else if (featureName === 'readx') {
      stats.readxSessionsCount = (stats.readxSessionsCount || 0) + 1;
      this.addRecentActivity({
        type: 'readx',
        title: 'READX Mode',
        detail: 'Toggled adaptive accessibility layout',
        timestamp: Date.now()
      }, uid);
    } else if (featureName === 'lineFocus') {
      stats.lineFocusUsageCount = (stats.lineFocusUsageCount || 0) + 1;
    } else if (featureName === 'readingGuide') {
      stats.readingGuideUsageCount = (stats.readingGuideUsageCount || 0) + 1;
    }

    this.saveLearningStats(stats, uid);
  },

  recordDocumentUpload(title, ext, words = 0) {
    const uid = this.getCurrentUserId();
    const stats = this.getLearningStats(uid);

    this.addRecentActivity({
      type: 'uploaded',
      title: title,
      detail: `${(ext || 'DOCUMENT').toUpperCase()} file ${words > 0 ? '· ' + words + ' words' : ''}`,
      timestamp: Date.now()
    }, uid);

    this.saveLearningStats(stats, uid);
  },

  addRecentActivity(activityObj, userId) {
    const uid = userId || this.getCurrentUserId();
    const stats = this.getLearningStats(uid);

    const newActivity = {
      id: 'act_' + Date.now(),
      type: activityObj.type || 'opened',
      title: activityObj.title || 'Action',
      detail: activityObj.detail || '',
      timestamp: activityObj.timestamp || Date.now(),
      date: new Date().toISOString()
    };

    stats.recentActivity = stats.recentActivity || [];
    stats.recentActivity.unshift(newActivity);
    stats.recentActivity = stats.recentActivity.slice(0, 10);
    this.saveLearningStats(stats, uid);
  },

  getAllLibraryItems() {
    const uid = this.getCurrentUserId();
    const uploads = this.getUploads(uid).map(u => ({
      id: u.id,
      title: u.title,
      category: 'My Content',
      tag: 'Uploaded',
      readTime: u.readTime || '5 min',
      desc: u.desc || 'Your uploaded document.',
      excerpt: u.excerpt || (u.content ? u.content.substring(0, 120) + '...' : 'Original document preserved.'),
      isUpload: true
    }));
    return [...this.library, ...uploads];
  },

  getArticle(id) {
    if (this.articles[id]) return this.articles[id];
    const uid = this.getCurrentUserId();
    const upload = this.getUploads(uid).find(u => u.id === id);
    if (upload) {
      if (upload.isReadable === false || !upload.content || !upload.content.trim()) {
        return {
          title: upload.title,
          category: 'My Content',
          desc: 'Unable to extract readable content from this file.',
          sections: [{ id: 'content', title: 'Content' }],
          content: '<div class="empty-state"><p>This file type can be uploaded, but READX cannot extract readable content from it yet.</p></div>'
        };
      }
      const raw = upload.content.trim();
      const formattedContent = raw.startsWith('<') ? raw : `<p>${raw.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      return {
        title: upload.title,
        category: 'My Content',
        desc: upload.desc || 'Your uploaded document.',
        sections: [{ id: 'content', title: 'Content' }],
        content: formattedContent
      };
    }
    return null;
  }
};

