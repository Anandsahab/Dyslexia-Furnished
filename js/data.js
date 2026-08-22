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
  // WEEKLY PRACTICE TESTS DATA STRUCTURE (8 SEQUENTIAL WEEKS)
  // ============================================================
  WEEKLY_COOLDOWN_MS: 7 * 24 * 60 * 60 * 1000, // 7 days (604,800,000 ms)

  weeklyTests: {
    'week-01': {
      id: 'week-01',
      weekNumber: 1,
      weekLabel: 'Week 01',
      category: 'DSA',
      title: 'DSA Fundamentals',
      subtitle: 'Time Complexity, Big-O Notation & Memory Layout',
      desc: "Test your understanding of asymptotic analysis, space complexity, and basic data organization.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w01-q1',
          q: 'In a contiguous array in memory, what is the time complexity to access any element by index?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          answer: 0,
          explanation: 'Arrays allocate contiguous memory blocks, allowing direct calculation of memory offsets in constant O(1) time.'
        },
        {
          id: 'w01-q2',
          q: 'What does Big-O notation specifically represent in algorithm analysis?',
          options: [
            'The exact number of CPU cycles required',
            'The upper bound of the growth rate of runtime as input size approaches infinity',
            'The best-case execution performance',
            'The total disk space consumed by the source code'
          ],
          answer: 1,
          explanation: 'Big-O notation describes the asymptotic upper bound, characterizing the worst-case limiting behavior as input size n grows.'
        },
        {
          id: 'w01-q3',
          q: 'What is the time complexity of a loop structure where the control variable doubles on each iteration (i = 1; i < n; i *= 2)?',
          options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
          answer: 1,
          explanation: 'Since the variable doubles in each step, the loop executes log₂(n) times, resulting in O(log n) time complexity.'
        },
        {
          id: 'w01-q4',
          q: 'What is the amortized time complexity of appending an item to a dynamic array (like JavaScript Array or Python list)?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          answer: 0,
          explanation: 'Although array doubling takes O(n) intermittently, geometric resizing makes it occur so infrequently that the average cost per append is amortized O(1).'
        },
        {
          id: 'w01-q5',
          q: 'What is the space complexity of an iterative algorithm that uses three auxiliary integer variables regardless of input size n?',
          options: ['O(n)', 'O(1)', 'O(log n)', 'O(3n)'],
          answer: 1,
          explanation: 'Because memory usage is fixed and does not grow with input size n, the auxiliary space complexity is O(1) constant space.'
        },
        {
          id: 'w01-q6',
          q: 'Which of the following functions exhibits the fastest growth rate as n becomes very large?',
          options: ['O(n³)', 'O(2ⁿ)', 'O(n log n)', 'O(n!)'],
          answer: 3,
          explanation: 'Factorial growth O(n!) grows significantly faster than exponential O(2ⁿ), polynomial O(n³), and linearithmic O(n log n).'
        },
        {
          id: 'w01-q7',
          q: 'What is the time complexity of the recurrence relation T(n) = 2T(n/2) + O(n) according to the Master Theorem?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          answer: 1,
          explanation: 'Here a = 2, b = 2, so n^(log_b a) = n¹. Since f(n) = O(n), this matches Case 2 of the Master Theorem giving T(n) = O(n log n).'
        },
        {
          id: 'w01-q8',
          q: 'What distinguishes an Abstract Data Type (ADT) from a Data Structure?',
          options: [
            'An ADT defines mathematical behavior and operations without implementation details; a data structure is the concrete implementation',
            'ADTs can only be implemented in C++',
            'Data structures do not store values in memory',
            'ADTs always have O(1) complexity for all operations'
          ],
          answer: 0,
          explanation: 'An ADT specifies what operations can be performed (the interface/contract), whereas a data structure provides the concrete data layout and algorithms.'
        },
        {
          id: 'w01-q9',
          q: 'What is the auxiliary space complexity of standard recursive binary search due to call stack frames?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          answer: 1,
          explanation: 'Recursive binary search splits the search interval in half at each step, creating a recursion tree of depth log₂(n) stack frames.'
        },
        {
          id: 'w01-q10',
          q: 'Why does spatial locality benefit arrays over non-contiguous pointer-based structures?',
          options: [
            'Arrays automatically execute in parallel threads',
            'Contiguous elements are loaded together into high-speed CPU cache lines',
            'Arrays use zero memory for metadata',
            'Pointers cannot be cached in modern CPUs'
          ],
          answer: 1,
          explanation: 'Spatial locality means accessing memory brings adjacent elements into CPU cache lines, making subsequent sequential array reads extremely fast.'
        },
        {
          id: 'w01-q11',
          q: 'What is the Big-O worst-case time complexity of finding the maximum element in an unsorted array of size n?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          answer: 2,
          explanation: 'In an unsorted array, every single element must be inspected at least once to ensure no larger value exists, requiring O(n) comparisons.'
        },
        {
          id: 'w01-q12',
          q: 'Which complexity class is considered intractable for large inputs in practical computing?',
          options: ['O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n)'],
          answer: 2,
          explanation: 'Exponential time O(2ⁿ) doubles in computation time with every additional input item, becoming computationally infeasible for large inputs.'
        },
        {
          id: 'w01-q13',
          q: 'What is the Big-Omega (Ω) notation used to describe?',
          options: [
            'Tight bound (exact asymptotic rate)',
            'Asymptotic lower bound (best-case lower limit)',
            'Worst-case upper bound',
            'Average memory consumption'
          ],
          answer: 1,
          explanation: 'Big-Omega (Ω) defines the asymptotic lower bound of an algorithm, representing the minimum resources required.'
        },
        {
          id: 'w01-q14',
          q: 'What happens when a recursive algorithm lacks a proper base case?',
          options: [
            'It terminates instantly with a warning',
            'It enters infinite recursion leading to a Call Stack Overflow',
            'The computer switches to iterative mode',
            'Memory is dynamically converted to a linked list'
          ],
          answer: 1,
          explanation: 'Without a base case, recursive stack frames pile up until the call stack memory limit is breached, throwing a Stack Overflow error.'
        },
        {
          id: 'w01-q15',
          q: 'If Algorithm A runs in 1000n steps and Algorithm B runs in 2n² steps, which algorithm is asymptotically faster as n → ∞?',
          options: [
            'Algorithm A because linear O(n) dominates quadratic O(n²)',
            'Algorithm B because the constant factor is smaller (2 vs 1000)',
            'Both are asymptotically identical',
            'Neither can be determined without knowing hardware specs'
          ],
          answer: 0,
          explanation: 'Asymptotic analysis ignores constant coefficients for large inputs. Linear O(n) always scales better than quadratic O(n²).'
        }
      ]
    },

    'week-02': {
      id: 'week-02',
      weekNumber: 2,
      weekLabel: 'Week 02',
      category: 'DSA',
      title: 'Arrays & Strings',
      subtitle: 'Two-Pointer, Sliding Window, Prefix Sum & String Algorithms',
      desc: "Master linear arrays, string manipulation, sliding windows, and in-place transformations.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w02-q1',
          q: 'What is the time complexity of the Two-Pointer technique to find a pair with a target sum in a sorted array of length n?',
          options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
          answer: 2,
          explanation: 'Starting pointers at opposite ends and moving inward inspects each element at most once, running in linear O(n) time.'
        },
        {
          id: 'w02-q2',
          q: 'In Kadane’s Algorithm for maximum subarray sum, how is the current running sum updated at index i?',
          options: [
            'currSum = max(nums[i], currSum + nums[i])',
            'currSum = currSum * nums[i]',
            'currSum = min(0, currSum + nums[i])',
            'currSum = nums[i] - currSum'
          ],
          answer: 0,
          explanation: 'At each position, we either extend the existing subarray sum (currSum + nums[i]) or start a new subarray at nums[i] if extending is worse.'
        },
        {
          id: 'w02-q3',
          q: 'What is the time complexity to query the sum of any contiguous subarray [L, R] using a precomputed Prefix Sum array?',
          options: ['O(R - L)', 'O(1)', 'O(log n)', 'O(n)'],
          answer: 1,
          explanation: 'The subarray sum is simply prefix[R] - prefix[L-1], which evaluates in constant O(1) time.'
        },
        {
          id: 'w02-q4',
          q: 'In the Sliding Window technique with variable window size on non-negative numbers, when does the left pointer advance?',
          options: [
            'When the window condition is violated (e.g. current window sum exceeds target)',
            'On every single iteration unconditionally',
            'Only when the right pointer reaches the end of the array',
            'Never; sliding windows only use a right pointer'
          ],
          answer: 0,
          explanation: 'The right pointer expands the window to include new elements, and the left pointer contracts the window whenever the valid condition is breached.'
        },
        {
          id: 'w02-q5',
          q: 'How does the Dutch National Flag algorithm sort an array containing only 0s, 1s, and 2s in a single pass?',
          options: [
            'Using 3 pointers (low, mid, high) in O(n) time and O(1) space',
            'Using Merge Sort in O(n log n)',
            'Using a Hash Map with O(n) auxiliary space',
            'By generating all permutations'
          ],
          answer: 0,
          explanation: 'Three pointers partition the array into four regions (0s, 1s, unclassified, 2s) in a single linear O(n) pass with O(1) space.'
        },
        {
          id: 'w02-q6',
          q: 'Why are strings immutable in languages like Java and Python?',
          options: [
            'For thread safety, hashcode caching in HashMaps, and security in system calls',
            'Because arrays cannot hold character data',
            'To prevent any string comparisons from running',
            'To eliminate all string memory consumption'
          ],
          answer: 0,
          explanation: 'Immutability guarantees thread safety, allows safe string pooling, and ensures cached hash codes remain invariant.'
        },
        {
          id: 'w02-q7',
          q: 'What is the optimal auxiliary space to verify if two lowercase English strings of length n are anagrams?',
          options: ['O(1) using a fixed frequency table of size 26', 'O(n) hash map', 'O(n²) matrix', 'O(log n) recursion stack'],
          answer: 0,
          explanation: 'A fixed array of 26 integers tracks character counts. Since 26 is constant, auxiliary space is O(1).'
        },
        {
          id: 'w02-q8',
          q: 'What is the time complexity of the Knuth-Morris-Pratt (KMP) string matching algorithm for text of length N and pattern of length M?',
          options: ['O(N × M)', 'O(N + M)', 'O(N log M)', 'O(2^(N+M))'],
          answer: 1,
          explanation: 'KMP precomputes the Longest Prefix Suffix (LPS) array in O(M) and searches text without backtracking in O(N), yielding O(N + M) total time.'
        },
        {
          id: 'w02-q9',
          q: 'How can you rotate an array of length n by k steps to the right in O(n) time and O(1) extra space?',
          options: [
            'Reverse the whole array, then reverse the first k elements, then reverse the remaining n-k elements',
            'Shift elements one by one k times in O(n × k)',
            'Copy to a temporary array of size n',
            'Sort the array in descending order'
          ],
          answer: 0,
          explanation: 'The 3-reversal algorithm (reverse all, reverse 0..k-1, reverse k..n-1) achieves rotation in O(n) time and O(1) space.'
        },
        {
          id: 'w02-q10',
          q: 'What is the Boyer-Moore Majority Vote Algorithm used for?',
          options: [
            'Finding an element that appears more than ⌊n/2⌋ times in O(n) time and O(1) space',
            'Sorting strings alphabetically',
            'Finding all duplicate elements in an array',
            'Compressing strings using Huffman encoding'
          ],
          answer: 0,
          explanation: 'Boyer-Moore uses a candidate variable and counter to find the majority element (> n/2 occurrences) in linear time and constant space.'
        },
        {
          id: 'w02-q11',
          q: 'In the Longest Substring Without Repeating Characters problem, what is the best achievable time complexity using Sliding Window?',
          options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
          answer: 1,
          explanation: 'Using a sliding window with a hash set or last-seen index table visits each character at most twice, running in O(n) time.'
        },
        {
          id: 'w02-q12',
          q: 'What is the time complexity of building a 2D Prefix Sum matrix of dimensions M × N?',
          options: ['O(M × N)', 'O(M + N)', 'O(M² × N²)', 'O(1)'],
          answer: 0,
          explanation: 'Filling each cell using the 2D inclusion-exclusion recurrence visits all M × N cells once, running in O(M × N) time.'
        },
        {
          id: 'w02-q13',
          q: 'What is the output of run-length encoding on the string "WWWWWWAAAAAAB"?',
          options: ['6W6A1B', 'W6A6B1', '13WAB', 'W6AB6'],
          answer: 0,
          explanation: 'Run-length encoding groups consecutive repeated characters by their counts: 6 "W"s, 6 "A"s, and 1 "B" gives 6W6A1B.'
        },
        {
          id: 'w02-q14',
          q: 'In Cyclic Sort on an array containing distinct numbers from 1 to n, what is the target index for value x?',
          options: ['x - 1', 'x + 1', 'x % 2', 'n - x'],
          answer: 0,
          explanation: 'Since numbers range from 1 to n, placing each value x at index (x - 1) sorts the array in O(n) total swaps.'
        },
        {
          id: 'w02-q15',
          q: 'What is the worst-case time complexity of searching a 2D matrix of size M × N where each row and column is sorted in ascending order?',
          options: ['O(M × N)', 'O(M + N)', 'O(log(M × N))', 'O(1)'],
          answer: 1,
          explanation: 'Starting from the top-right (or bottom-left) corner eliminates either a row or a column on each comparison, taking at most M + N steps: O(M + N).'
        }
      ]
    },

    'week-03': {
      id: 'week-03',
      weekNumber: 3,
      weekLabel: 'Week 03',
      category: 'DSA',
      title: 'Searching & Sorting',
      subtitle: 'Binary Search, Partitioning, Merge Sort, Quick Sort & Stable Sorting',
      desc: "Deep-dive into logarithmic search, divide-and-conquer sorting, and comparison bounds.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w03-q1',
          q: 'What is the maximum number of comparisons Binary Search performs on a sorted array of 1,000,000 elements?',
          options: ['20', '1,000', '500,000', '1,000,000'],
          answer: 0,
          explanation: 'Binary search takes at most ⌊log₂ n⌋ + 1 comparisons. For n = 1,000,000, log₂(1,000,000) ≈ 19.93, requiring at most 20 comparisons.'
        },
        {
          id: 'w03-q2',
          q: 'Why is calculating mid as low + (high - low) / 2 preferred over (low + high) / 2?',
          options: [
            'To prevent integer overflow when low + high exceeds maximum integer limit',
            'Because it runs in hardware floating-point speed',
            'To avoid dividing by zero',
            'Because it handles negative array indices'
          ],
          answer: 0,
          explanation: 'If low and high are very large integers, low + high can exceed 2^31 - 1 and overflow into a negative number. low + (high - low) / 2 avoids this.'
        },
        {
          id: 'w03-q3',
          q: 'What is the time complexity and auxiliary space complexity of standard Merge Sort on an array of size n?',
          options: [
            'Time: O(n log n), Auxiliary Space: O(n)',
            'Time: O(n²), Auxiliary Space: O(1)',
            'Time: O(n log n), Auxiliary Space: O(1)',
            'Time: O(n), Auxiliary Space: O(n log n)'
          ],
          answer: 0,
          explanation: 'Merge sort guarantees O(n log n) comparisons across log n levels but requires O(n) temporary space to merge subarrays.'
        },
        {
          id: 'w03-q4',
          q: 'Under what scenario does Quicksort degrade to its worst-case time complexity of O(n²)?',
          options: [
            'When the pivot chosen is consistently the extreme (smallest or largest) element',
            'When elements are randomly shuffled before partitioning',
            'When all elements are unique and random',
            'When three-way partitioning is applied'
          ],
          answer: 0,
          explanation: 'Picking an extreme pivot (e.g. first element in sorted array) splits subproblems into size n-1 and 0, resulting in n recursive levels and O(n²) time.'
        },
        {
          id: 'w03-q5',
          q: 'What is a "stable" sorting algorithm?',
          options: [
            'An algorithm that never crashes with memory errors',
            'An algorithm that preserves the relative order of elements with equal keys',
            'An algorithm that sorts in O(1) space',
            'An algorithm designed exclusively for multithreaded environments'
          ],
          answer: 1,
          explanation: 'Stability means that if two elements have identical values, their original relative order in the input array is maintained in the sorted output.'
        },
        {
          id: 'w03-q6',
          q: 'Which of the following sorting algorithms is inherently stable?',
          options: ['Merge Sort', 'Heap Sort', 'Standard Quicksort', 'Selection Sort'],
          answer: 0,
          explanation: 'Merge Sort maintains stability during the merge step by preferring left-subarray elements when values are equal.'
        },
        {
          id: 'w03-q7',
          q: 'What is the theoretical lower bound on time complexity for any comparison-based sorting algorithm in the worst case?',
          options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
          answer: 1,
          explanation: 'A comparison decision tree for n items has n! leaves, requiring a minimum tree height of log₂(n!) = Ω(n log n).'
        },
        {
          id: 'w03-q8',
          q: 'How does Counting Sort achieve O(n + k) non-comparison sorting time?',
          options: [
            'By counting the frequency of each distinct integer key in range k and computing prefix positions',
            'By building a binary search tree',
            'By dividing elements into 2 halves recursively',
            'By comparing adjacent pairs repeatedly'
          ],
          answer: 0,
          explanation: 'Counting sort uses direct arithmetic indexing over key range k without pairwise comparisons, running in O(n + k) time.'
        },
        {
          id: 'w03-q9',
          q: 'How can you search for a target value in a Rotated Sorted Array in O(log n) time?',
          options: [
            'Check which half (left or right) is normally sorted, determine if target falls in that range, and discard the other half',
            'Linear search from start to finish',
            'Rotate the array back to normal in O(n) first',
            'Convert to linked list'
          ],
          answer: 0,
          explanation: 'In a rotated sorted array, at least one half [low..mid] or [mid..high] is always sorted, enabling standard binary elimination in O(log n).'
        },
        {
          id: 'w03-q10',
          q: 'What does "Binary Search on Answer Space" mean?',
          options: [
            'Applying binary search over the monotonic range of possible solution values (e.g. minimum capacity/time) using a validator function',
            'Searching only in odd-numbered indices',
            'Randomly guessing answers',
            'Searching in a 3D matrix'
          ],
          answer: 0,
          explanation: 'When feasibility is monotonic (valid for x implies valid for all x > target), we binary search over the feasible answer range.'
        },
        {
          id: 'w03-q11',
          q: 'What is the worst-case time complexity of Insertion Sort and when does its best-case O(n) occur?',
          options: [
            'Worst: O(n²); Best: O(n) when the array is already sorted',
            'Worst: O(n log n); Best: O(1)',
            'Worst: O(n²); Best: O(n²) always',
            'Worst: O(n³); Best: O(n log n)'
          ],
          answer: 0,
          explanation: 'Insertion sort compares and inserts each element. If already sorted, each item makes 1 comparison with no shifts: O(n) time.'
        },
        {
          id: 'w03-q12',
          q: 'What is the average time complexity of Quickselect to find the k-th smallest element in an unsorted array?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
          answer: 0,
          explanation: 'Quickselect only recurses into the partition containing index k, yielding recurrence T(n) = T(n/2) + O(n) = O(n) average time.'
        },
        {
          id: 'w03-q13',
          q: 'What is the time complexity to build a Max-Heap from an unsorted array of n elements using the bottom-up Heapify method?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          answer: 0,
          explanation: 'Bottom-up heapify runs in linear O(n) time because the majority of nodes reside near the bottom with short shift-down paths.'
        },
        {
          id: 'w03-q14',
          q: 'What is the auxiliary space complexity of Heapsort?',
          options: ['O(1) in-place', 'O(n)', 'O(log n)', 'O(n log n)'],
          answer: 0,
          explanation: 'Heapsort sorts directly within the array by swapping root with end and sifting down in-place using O(1) extra space.'
        },
        {
          id: 'w03-q15',
          q: 'What is the difference between Lower Bound and Upper Bound binary search for a value x in a sorted array with duplicates?',
          options: [
            'Lower Bound finds the first element ≥ x; Upper Bound finds the first element > x',
            'Lower Bound sorts descending; Upper Bound sorts ascending',
            'Lower Bound is O(n); Upper Bound is O(log n)',
            'There is no functional difference'
          ],
          answer: 0,
          explanation: 'Lower bound returns iterator/index to first element not less than x (>= x), while Upper bound returns first element strictly greater than x (> x).'
        }
      ]
    },

    'week-04': {
      id: 'week-04',
      weekNumber: 4,
      weekLabel: 'Week 04',
      category: 'DSA',
      title: 'Linked Lists',
      subtitle: 'Fast/Slow Pointers, Cycle Detection, Reversals & LRU Design',
      desc: "Master pointer manipulation, singly/doubly linked lists, cycle detection, and list caching patterns.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w04-q1',
          q: 'In Floyd’s Cycle-Finding Algorithm (Tortoise and Hare), how do the slow and fast pointers advance?',
          options: [
            'Slow advances 1 step; Fast advances 2 steps per iteration',
            'Slow advances 2 steps; Fast advances 4 steps',
            'Both advance 1 step from opposite ends',
            'Slow stays at head; Fast advances randomly'
          ],
          answer: 0,
          explanation: 'By moving fast twice as fast as slow, the gap between them in a cycle decreases by 1 in each step, guaranteeing collision in O(n) time.'
        },
        {
          id: 'w04-q2',
          q: 'After slow and fast pointers meet in a cycle, how do you locate the exact node where the cycle begins?',
          options: [
            'Reset slow pointer to head; move both slow and fast 1 step at a time until they meet at the cycle start',
            'Advance fast pointer until it hits null',
            'Count total nodes and divide by 2',
            'Delete the meeting node'
          ],
          answer: 0,
          explanation: 'Mathematically, the distance from head to cycle entrance equals the distance from meeting point to cycle entrance.'
        },
        {
          id: 'w04-q3',
          q: 'What is the minimum number of pointer variables needed to reverse a Singly Linked List iteratively in-place?',
          options: ['3 (prev, curr, next)', '1', '2', 'n'],
          answer: 0,
          explanation: 'We need `prev` (reversed portion), `curr` (active node), and `next` (to retain remaining list before redirecting curr.next).'
        },
        {
          id: 'w04-q4',
          q: 'What is the time complexity to find the middle node of a Singly Linked List using the Two-Pointer approach?',
          options: ['O(n) in a single pass', 'O(n²)', 'O(log n)', 'O(1)'],
          answer: 0,
          explanation: 'When the fast pointer (2 steps) reaches the end of the list, the slow pointer (1 step) is exactly at the midpoint in one pass.'
        },
        {
          id: 'w04-q5',
          q: 'Which data structures are combined to build an LRU (Least Recently Used) Cache with O(1) get() and O(1) put() operations?',
          options: [
            'Hash Map + Doubly Linked List',
            'Array + Binary Search Tree',
            'Singly Linked List + Stack',
            'Min-Heap + FIFO Queue'
          ],
          answer: 0,
          explanation: 'The Hash Map provides O(1) key-to-node lookup, and the Doubly Linked List enables O(1) node removal and insertion at head/tail.'
        },
        {
          id: 'w04-q6',
          q: 'What is the advantage of using a Dummy (Sentinel) Head node when implementing linked list deletions or insertions?',
          options: [
            'It avoids writing special edge-case checks for operations affecting the head node',
            'It reduces memory usage to zero',
            'It makes random access O(1)',
            'It automatically balances the list'
          ],
          answer: 0,
          explanation: 'A sentinel head guarantees every real node has a preceding node, eliminating conditional edge cases for inserting/deleting at index 0.'
        },
        {
          id: 'w04-q7',
          q: 'How can you find the N-th node from the end of a Singly Linked List in a single pass?',
          options: [
            'Advance first pointer N steps ahead, then move both first and second pointers 1 step together until first reaches null',
            'Reverse the whole list twice',
            'Use binary search on node addresses',
            'Count total nodes then restart from head'
          ],
          answer: 0,
          explanation: 'Maintaining an N-node gap between two pointers means the second pointer arrives at the N-th node from end when the first reaches null.'
        },
        {
          id: 'w04-q8',
          q: 'What is the time and space complexity to merge two sorted Singly Linked Lists of lengths m and n into one sorted list?',
          options: [
            'Time: O(m + n), Space: O(1) by rewiring existing node pointers',
            'Time: O(m × n), Space: O(m + n)',
            'Time: O(m log n), Space: O(1)',
            'Time: O(m + n), Space: O(m + n)'
          ],
          answer: 0,
          explanation: 'Splicing existing node pointers in order takes linear O(m + n) time and O(1) auxiliary space without allocating new nodes.'
        },
        {
          id: 'w04-q9',
          q: 'How can you verify whether a Singly Linked List is a palindrome in O(n) time and O(1) auxiliary space?',
          options: [
            'Find middle node, reverse the second half in-place, compare both halves, and restore list',
            'Store all values in an array and use two pointers in O(n) space',
            'Recursively compare nodes from start and end',
            'Convert to a string and check equality'
          ],
          answer: 0,
          explanation: 'Reversing the second half in-place enables node-by-node comparison with the first half using O(1) extra memory.'
        },
        {
          id: 'w04-q10',
          q: 'What is the time complexity to find the intersection node of two Singly Linked Lists of lengths m and n using two pointers switching heads?',
          options: ['O(m + n) time and O(1) space', 'O(m × n) time', 'O(m log n) time', 'O(1) time'],
          answer: 0,
          explanation: 'Switching pointer A to head B and pointer B to head A upon reaching null ensures both traverse equal total distance (m + n) to meet at intersection.'
        },
        {
          id: 'w04-q11',
          q: 'In a Doubly Linked List with a direct reference to target node p, what is the time complexity to delete p?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          answer: 0,
          explanation: 'Direct access to p.prev and p.next allows updating p.prev.next = p.next and p.next.prev = p.prev in constant O(1) time.'
        },
        {
          id: 'w04-q12',
          q: 'What is a Circular Linked List?',
          options: [
            'A linked list where the last node points back to the head node instead of null',
            'A linked list stored in a circular array buffer',
            'A linked list that only holds prime numbers',
            'A tree with circular references'
          ],
          answer: 0,
          explanation: 'In a circular linked list, the tail node’s next pointer points directly back to the first node, forming a continuous ring.'
        },
        {
          id: 'w04-q13',
          q: 'What is the primary memory disadvantage of a Doubly Linked List compared to a Singly Linked List?',
          options: [
            'Every node requires an extra pointer reference (prev), increasing memory overhead per node',
            'Doubly linked lists cannot store numbers',
            'Nodes must be stored in contiguous memory',
            'Garbage collection cannot free doubly linked lists'
          ],
          answer: 0,
          explanation: 'Storing two pointer addresses (prev and next) per node doubles the pointer memory overhead compared to a singly linked list.'
        },
        {
          id: 'w04-q14',
          q: 'What is the time complexity of Merge Sort on a Singly Linked List of size n?',
          options: ['O(n log n) time and O(log n) stack space', 'O(n²) time', 'O(n) time', 'O(log n) time'],
          answer: 0,
          explanation: 'Merge sort splits list at midpoint with fast/slow pointers in O(n) across log n levels, sorting in O(n log n) without array reallocation.'
        },
        {
          id: 'w04-q15',
          q: 'Why is standard Binary Search impossible to execute in O(log n) time directly on a Singly Linked List?',
          options: [
            'Accessing the midpoint node in a linked list requires linear O(n) traversal',
            'Linked lists cannot be sorted',
            'Pointers cannot be compared mathematically',
            'Recursion is not permitted on linked lists'
          ],
          answer: 0,
          explanation: 'Binary search requires O(1) random access to middle elements. Traversing to mid in a linked list takes O(n), destroying logarithmic performance.'
        }
      ]
    },

    'week-05': {
      id: 'week-05',
      weekNumber: 5,
      weekLabel: 'Week 05',
      category: 'DSA',
      title: 'Stack & Queue',
      subtitle: 'LIFO/FIFO, Monotonic Stacks, Min-Stack & Deque Buffers',
      desc: "Explore linear buffering structures, operator precedence evaluation, and sliding window maximums.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w05-q1',
          q: 'Which operating principle defines a Stack data structure?',
          options: ['LIFO (Last-In, First-Out)', 'FIFO (First-In, First-Out)', 'Random access', 'Priority order'],
          answer: 0,
          explanation: 'A stack operates on Last-In, First-Out, where the most recently pushed element is the first one popped.'
        },
        {
          id: 'w05-q2',
          q: 'How does a Min-Stack achieve O(1) time complexity for getMin()?',
          options: [
            'By maintaining an auxiliary stack that records the running minimum at each state',
            'By scanning the entire stack linearly during getMin()',
            'By keeping the stack sorted after every push in O(n log n)',
            'By using a binary search tree'
          ],
          answer: 0,
          explanation: 'An auxiliary stack (or paired tuple) tracks the current minimum value corresponding to every push, allowing instant O(1) minimum retrieval.'
        },
        {
          id: 'w05-q3',
          q: 'What is the time complexity of finding the Next Greater Element for all items in an array using a Monotonic Stack?',
          options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
          answer: 0,
          explanation: 'Every element is pushed onto the stack exactly once and popped at most once, resulting in an amortized O(n) total operations.'
        },
        {
          id: 'w05-q4',
          q: 'How can a FIFO Queue be implemented using two Stacks (inStack and outStack)?',
          options: [
            'Push to inStack; for dequeue, pop from outStack (if empty, transfer all inStack items to outStack)',
            'Push to both stacks simultaneously and delete randomly',
            'Use one stack for positive numbers and one for negative',
            'Merge both stacks on every operation'
          ],
          answer: 0,
          explanation: 'Pouring inStack into outStack reverses the LIFO order back into FIFO, giving an amortized O(1) cost per operation.'
        },
        {
          id: 'w05-q5',
          q: 'Which algorithm converts an Infix mathematical expression into Postfix notation using an operator stack?',
          options: ['Dijkstra’s Shunting-Yard Algorithm', 'Kadane’s Algorithm', 'Floyd’s Algorithm', 'Kruskal’s Algorithm'],
          answer: 0,
          explanation: 'Edsger Dijkstra’s Shunting-Yard algorithm parses tokens with operator precedence and associativity using an operator stack.'
        },
        {
          id: 'w05-q6',
          q: 'What is the value of the Postfix (RPN) expression "5 3 + 2 *"?',
          options: ['16', '11', '13', '30'],
          answer: 0,
          explanation: '5 and 3 are pushed, then "+" adds them (5 + 3 = 8). 2 is pushed, then "*" multiplies them (8 * 2 = 16).'
        },
        {
          id: 'w05-q7',
          q: 'In a Circular Queue of capacity C implemented with a fixed array, how is the next index calculated for tail?',
          options: ['(tail + 1) % C', 'tail + 1', 'tail * 2', 'tail - 1'],
          answer: 0,
          explanation: 'Modulo arithmetic `(tail + 1) % C` wraps the index back to 0 when it exceeds array bounds.'
        },
        {
          id: 'w05-q8',
          q: 'Which data structure is optimal for solving the Sliding Window Maximum problem in O(n) total time?',
          options: ['Monotonic Decreasing Deque (Double-Ended Queue)', 'Max-Heap (Priority Queue)', 'Singly Linked List', 'Binary Search Tree'],
          answer: 0,
          explanation: 'A monotonic decreasing deque stores indices of candidate maximums in descending value order, giving O(1) max queries and O(n) total time.'
        },
        {
          id: 'w05-q9',
          q: 'In the Valid Parentheses problem ("()[]{}"), what indicates an invalid string when processing a closing bracket?',
          options: [
            'The stack is empty or the top element does not match the closing bracket',
            'The stack contains open brackets',
            'There are more than 4 brackets',
            'The string begins with an opening parenthesis'
          ],
          answer: 0,
          explanation: 'A closing bracket must match the most recently opened bracket on top of stack; mismatch or empty stack means invalid nesting.'
        },
        {
          id: 'w05-q10',
          q: 'What is a Deque (Double-Ended Queue)?',
          options: [
            'A queue that supports insertion and deletion at both the front and rear in O(1) time',
            'A queue that only holds floating-point values',
            'A queue that automatically sorts all elements',
            'A queue that does not allow duplicate entries'
          ],
          answer: 0,
          explanation: 'A Deque allows push_front, pop_front, push_back, and pop_back all in constant O(1) time.'
        },
        {
          id: 'w05-q11',
          q: 'What data structure solves the Largest Rectangle in Histogram problem in O(n) linear time?',
          options: ['Monotonic Increasing Stack of bar indices', '2D Dynamic Programming table', 'Binary Search Tree', 'Priority Queue'],
          answer: 0,
          explanation: 'A monotonic increasing stack tracks indices of increasing heights, computing the largest rectangle bounded by each popped bar in O(n).'
        },
        {
          id: 'w05-q12',
          q: 'In the Daily Temperatures problem, how do you find the number of days until a warmer temperature?',
          options: [
            'Use a monotonic decreasing stack storing indices of temperatures',
            'Sort the temperatures array in ascending order',
            'Use a circular queue',
            'Use binary search on temperature values'
          ],
          answer: 0,
          explanation: 'When a warmer temperature is encountered, indices of colder days are popped and the day difference is recorded.'
        },
        {
          id: 'w05-q13',
          q: 'What is the worst-case space complexity of evaluating a valid nested bracket expression of length n using a stack?',
          options: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'],
          answer: 0,
          explanation: 'For expressions like "((((...))))", all n/2 opening brackets are pushed before any closing brackets, requiring O(n) stack space.'
        },
        {
          id: 'w05-q14',
          q: 'What distinguishes a Priority Queue from a standard FIFO Queue?',
          options: [
            'Elements are dequeued in order of highest/lowest priority rather than insertion order',
            'Priority queues cannot hold strings',
            'Priority queues operate in O(1) space always',
            'Priority queues only work with two elements'
          ],
          answer: 0,
          explanation: 'In a priority queue (typically implemented with a binary heap), the element with highest priority is always served first.'
        },
        {
          id: 'w05-q15',
          q: 'What happens when you execute dequeue() on an empty queue?',
          options: ['Queue Underflow error', 'Queue Overflow error', 'Memory doubling', 'Infinite loop'],
          answer: 0,
          explanation: 'Attempting to remove an element from an empty data structure results in an Underflow condition.'
        }
      ]
    },

    'week-06': {
      id: 'week-06',
      weekNumber: 6,
      weekLabel: 'Week 06',
      category: 'DSA',
      title: 'Recursion & Backtracking',
      subtitle: 'Call Stack Frames, Divide & Conquer, Subsets, Permutations & N-Queens',
      desc: "Understand the recursive stack, state exploration, backtracking pruning, and tree recursion.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w06-q1',
          q: 'What essential component prevents a recursive function from executing infinitely?',
          options: ['Base Case', 'Global counter variable', 'While loop', 'Thread lock'],
          answer: 0,
          explanation: 'A base case defines the termination condition where the function returns a direct value without spawning further recursive calls.'
        },
        {
          id: 'w06-q2',
          q: 'What is Tail Recursion?',
          options: [
            'A recursive function where the recursive call is the very last operation performed before returning',
            'Recursion that only runs on linked lists',
            'Recursion that spawns two branches at every step',
            'A recursive loop that never terminates'
          ],
          answer: 0,
          explanation: 'In tail recursion, the function returns the result of the recursive call directly, enabling compilers to optimize stack frames into an iterative loop.'
        },
        {
          id: 'w06-q3',
          q: 'How many total subsets (power set) exist for a set of n distinct elements?',
          options: ['2ⁿ', 'n!', 'n²', '2n'],
          answer: 0,
          explanation: 'Every element has 2 independent choices (either included or excluded in a subset), giving 2 × 2 × ... = 2ⁿ total subsets.'
        },
        {
          id: 'w06-q4',
          q: 'How many total permutations exist for an array of n distinct elements?',
          options: ['n!', '2ⁿ', 'n²', 'n^n'],
          answer: 0,
          explanation: 'There are n choices for the 1st position, n-1 for the 2nd, down to 1, producing n! (factorial) permutations.'
        },
        {
          id: 'w06-q5',
          q: 'What is the core distinction between standard brute-force search and Backtracking?',
          options: [
            'Backtracking prunes (abandons) invalid partial candidate branches as soon as constraints are violated',
            'Backtracking never uses recursion',
            'Backtracking only works on sorted numbers',
            'Backtracking has O(1) time complexity'
          ],
          answer: 0,
          explanation: 'Backtracking explores candidates recursively and immediately backtracks when a candidate cannot possibly lead to a valid full solution.'
        },
        {
          id: 'w06-q6',
          q: 'In the classic N-Queens puzzle, what constraint must be validated before placing a queen at row r and column c?',
          options: [
            'No other queen exists in the same column, main diagonal (r - c), or anti-diagonal (r + c)',
            'Only that the column is unoccupied',
            'That the board size is an odd number',
            'That the queen is placed on a black square'
          ],
          answer: 0,
          explanation: 'Queens attack along rows, columns, and diagonals. Diagonal conflicts share identical values of (row - col) or (row + col).'
        },
        {
          id: 'w06-q7',
          q: 'What is the minimum number of moves required to solve the Tower of Hanoi puzzle with n disks?',
          options: ['2ⁿ - 1', 'n²', '2n', 'n!'],
          answer: 0,
          explanation: 'The recurrence T(n) = 2T(n-1) + 1 resolves by induction to exactly 2ⁿ - 1 moves.'
        },
        {
          id: 'w06-q8',
          q: 'What is the time complexity of the naive recursive Fibonacci algorithm fib(n) = fib(n-1) + fib(n-2)?',
          options: ['O(2ⁿ)', 'O(n)', 'O(n log n)', 'O(n²)'],
          answer: 0,
          explanation: 'The recursion tree branches into 2 calls at each level of depth n, resulting in exponential O(2ⁿ) time complexity.'
        },
        {
          id: 'w06-q9',
          q: 'In recursive backtracking for combination sum, why is it necessary to "undo" (pop) the added element after returning from recursion?',
          options: [
            'To restore the state of the shared candidate list for subsequent branching choices',
            'To prevent garbage collection errors',
            'Because arrays cannot hold more than 10 items',
            'To clear CPU cache lines'
          ],
          answer: 0,
          explanation: 'Backtracking shares a common path array; popping the choice resets the list so other sibling branches can explore independently.'
        },
        {
          id: 'w06-q10',
          q: 'What is the maximum call stack depth of standard DFS on a graph with V vertices?',
          options: ['O(V)', 'O(V²)', 'O(1)', 'O(log V)'],
          answer: 0,
          explanation: 'In the worst case (a linear path graph), DFS traverses all V vertices before returning, reaching a call stack depth of V.'
        },
        {
          id: 'w06-q11',
          q: 'What is the time complexity of generating all valid combinations of n pairs of balanced parentheses using backtracking?',
          options: ['O(4ⁿ / √n) (Catalan number C_n)', 'O(2ⁿ)', 'O(n!)', 'O(n³)'],
          answer: 0,
          explanation: 'The number of valid parentheses combinations of length 2n is given by the n-th Catalan number C_n ≈ 4ⁿ / (n^(3/2) √π).'
        },
        {
          id: 'w06-q12',
          q: 'In Sudoku solver backtracking, what happens when no digits (1–9) can validly be placed in an empty cell?',
          options: [
            'The function returns false to backtrack to the previous cell and try its next valid number',
            'The board is declared unsolvable immediately',
            'The cell is assigned 0 permanently',
            'The algorithm restarts from cell (0,0)'
          ],
          answer: 0,
          explanation: 'Returning false signals failure of the current branch, causing the caller to backtrack and try alternate numbers in earlier cells.'
        },
        {
          id: 'w06-q13',
          q: 'What information does an activation record (stack frame) contain on the call stack?',
          options: [
            'Return address, function arguments, local variables, and saved CPU registers',
            'The entire operating system kernel',
            'Only the function name string',
            'Global database records'
          ],
          answer: 0,
          explanation: 'Each stack frame stores local function scope, input arguments, saved registers, and the return address to resume after returning.'
        },
        {
          id: 'w06-q14',
          q: 'How does Memoization optimize recursive algorithms with overlapping subproblems?',
          options: [
            'By caching the return values of function calls in a table keyed by input arguments',
            'By converting all numbers to strings',
            'By running recursion in background threads',
            'By eliminating the base case'
          ],
          answer: 0,
          explanation: 'Memoization intercepts repeated recursive calls and returns stored results in O(1) time, turning exponential algorithms into polynomial ones.'
        },
        {
          id: 'w06-q15',
          q: 'What is the master recurrence for Merge Sort?',
          options: ['T(n) = 2T(n/2) + O(n)', 'T(n) = T(n-1) + O(1)', 'T(n) = 2T(n-1) + O(1)', 'T(n) = T(n/2) + O(1)'],
          answer: 0,
          explanation: 'Merge sort divides input into 2 halves (2T(n/2)) and merges them in linear time (O(n)), giving T(n) = 2T(n/2) + O(n).'
        }
      ]
    },

    'week-07': {
      id: 'week-07',
      weekNumber: 7,
      weekLabel: 'Week 07',
      category: 'DSA',
      title: 'Trees & BST',
      subtitle: 'Binary Trees, BST Inorder Traversal, LCA, Height & Trie Prefixes',
      desc: "Explore hierarchical tree architectures, recursive traversals, BST invariants, and prefix tries.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w07-q1',
          q: 'Which tree traversal order visits nodes of a Binary Search Tree (BST) in strictly ascending sorted order?',
          options: ['In-order (Left, Root, Right)', 'Pre-order (Root, Left, Right)', 'Post-order (Left, Right, Root)', 'Level-order (Breadth-First)'],
          answer: 0,
          explanation: 'In a BST, left subtree values are smaller and right subtree values are larger. In-order traversal (Left → Root → Right) yields sorted order.'
        },
        {
          id: 'w07-q2',
          q: 'What is the maximum number of nodes in a binary tree of height h (where height of root is 1)?',
          options: ['2ʰ - 1', '2ʰ', '2ʰ⁺¹', 'h²'],
          answer: 0,
          explanation: 'A full binary tree has 1 + 2 + 4 + ... + 2^(h-1) = 2ʰ - 1 total nodes.'
        },
        {
          id: 'w07-q3',
          q: 'In a balanced Binary Search Tree with n nodes, what is the worst-case time complexity to search, insert, or delete a key?',
          options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
          answer: 0,
          explanation: 'Balanced BSTs (like AVL or Red-Black trees) maintain a height of O(log n), ensuring search, insert, and delete take O(log n) operations.'
        },
        {
          id: 'w07-q4',
          q: 'How do you correctly validate whether a binary tree is a valid Binary Search Tree (BST)?',
          options: [
            'Verify every node value falls strictly within allowed (min_val, max_val) boundaries updated recursively down subtrees',
            'Check only that root.left < root and root.right > root',
            'Count the total leaves',
            'Check if tree height is even'
          ],
          answer: 0,
          explanation: 'Checking immediate children is insufficient; all descendants in the left subtree must be less than the root, requiring recursive (min, max) range tracking.'
        },
        {
          id: 'w07-q5',
          q: 'How do you find the Lowest Common Ancestor (LCA) of two nodes p and q in a Binary Search Tree (BST)?',
          options: [
            'If both values are smaller than root, go left; if both greater, go right; otherwise current root is the LCA split point',
            'Traverse every node with BFS and pick the last one',
            'Calculate the sum of all node values',
            'Convert to linked list'
          ],
          answer: 0,
          explanation: 'In a BST, the first node whose value lies between p and q (min(p,q) <= root.val <= max(p,q)) is the Lowest Common Ancestor.'
        },
        {
          id: 'w07-q6',
          q: 'What is the time complexity of Level-Order Traversal on a binary tree with n nodes using a Queue?',
          options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
          answer: 0,
          explanation: 'Level-order traversal visits every node and enqueues its children exactly once, running in linear O(n) time and O(n) space.'
        },
        {
          id: 'w07-q7',
          q: 'What is the definition of the diameter of a binary tree?',
          options: [
            'The length of the longest path between any two nodes in the tree (which may or may not pass through the root)',
            'The number of nodes at the bottom level',
            'The maximum value stored in the tree',
            'The total number of leaf nodes'
          ],
          answer: 0,
          explanation: 'The diameter is the maximum path distance between any two nodes, calculated at each node as (left_height + right_height).'
        },
        {
          id: 'w07-q8',
          q: 'What makes an AVL Tree self-balancing?',
          options: [
            'For every node, the height difference (balance factor) between left and right subtrees is at most 1, restored via rotations',
            'All leaf nodes must be at identical depth',
            'Nodes are colored red or black',
            'It only allows 2 children per tree'
          ],
          answer: 0,
          explanation: 'AVL trees maintain strict balance by ensuring |height(left) - height(right)| ≤ 1 at every node, executing rotations when violated.'
        },
        {
          id: 'w07-q9',
          q: 'What is the time complexity to insert a word of length L into a Trie (Prefix Tree)?',
          options: ['O(L)', 'O(N × L)', 'O(2ᴸ)', 'O(log N)'],
          answer: 0,
          explanation: 'Trie insertion traverses down L character child pointers, creating nodes when absent, taking exactly O(L) time regardless of dictionary size.'
        },
        {
          id: 'w07-q10',
          q: 'In a binary tree, what is the relationship between the number of leaf nodes L and nodes with two children N₂ in a full binary tree?',
          options: ['L = N₂ + 1', 'L = N₂', 'L = 2 × N₂', 'L = N₂ - 1'],
          answer: 0,
          explanation: 'By the handshaking theorem on trees, any strictly binary tree has exactly 1 more leaf than internal nodes with two children: L = N₂ + 1.'
        },
        {
          id: 'w07-q11',
          q: 'Which traversal sequence uniquely reconstructs a binary tree when paired with In-order traversal?',
          options: ['Pre-order or Post-order traversal', 'Level-order only with duplicate values', 'Leaf node list only', 'Tree height only'],
          answer: 0,
          explanation: 'Pre-order (or Post-order) identifies the root node, and In-order determines the boundary between left and right subtrees.'
        },
        {
          id: 'w07-q12',
          q: 'What is the height of a degenerate (skewed) binary tree containing n nodes?',
          options: ['O(n)', 'O(log n)', 'O(1)', 'O(√n)'],
          answer: 0,
          explanation: 'When every node has only one child, the tree becomes functionally equivalent to a linear linked list of height n.'
        },
        {
          id: 'w07-q13',
          q: 'What is the Inorder Successor of a node in a Binary Search Tree if the node has a right child?',
          options: [
            'The minimum (leftmost) node in the right subtree',
            'The maximum node in the left subtree',
            'The immediate parent node',
            'The root node'
          ],
          answer: 0,
          explanation: 'If a right child exists, the next larger value in sorted order is the smallest (leftmost) element within the right subtree.'
        },
        {
          id: 'w07-q14',
          q: 'How does a Trie efficiently support prefix search (startsWith) queries?',
          options: [
            'By traversing down child pointers for prefix characters; if all characters exist, the prefix is present',
            'By scanning all dictionary words with regex',
            'By sorting all words in reverse',
            'By computing MD5 hashes'
          ],
          answer: 0,
          explanation: 'Words sharing common prefixes share identical parent nodes in the tree, allowing prefix lookup in O(prefix_length) time.'
        },
        {
          id: 'w07-q15',
          q: 'What is the space complexity to serialize a binary tree of n nodes into a string representation using preorder traversal?',
          options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
          answer: 0,
          explanation: 'Preorder serialization stores every node value and null markers for empty children, taking O(n) total characters/space.'
        }
      ]
    },

    'week-08': {
      id: 'week-08',
      weekNumber: 8,
      weekLabel: 'Week 08',
      category: 'DSA',
      title: 'Graphs & Algorithms',
      subtitle: 'BFS/DFS, Topological Sort, Dijkstra, Disjoint Sets & MST',
      desc: "Master graph representations, level-order reachability, topological dependencies, and shortest path trees.",
      questionCount: 15,
      durationMinutes: 20,
      questions: [
        {
          id: 'w08-q1',
          q: 'What is the time complexity of Breadth-First Search (BFS) on a graph with V vertices and E edges represented as an Adjacency List?',
          options: ['O(V + E)', 'O(V × E)', 'O(V²)', 'O(E log V)'],
          answer: 0,
          explanation: 'BFS visits every vertex once (O(V)) and scans all outgoing edges in the adjacency list once (O(E)), giving O(V + E) total time.'
        },
        {
          id: 'w08-q2',
          q: 'When is an Adjacency List preferred over an Adjacency Matrix for graph storage?',
          options: [
            'When the graph is sparse (E ≪ V²) and memory efficiency is crucial',
            'When the graph is dense (E ≈ V²)',
            'When querying edge existence between (u, v) must be O(1)',
            'When edge weights are negative'
          ],
          answer: 0,
          explanation: 'An adjacency matrix uses O(V²) space regardless of edges, while an adjacency list uses O(V + E) space, which is far more efficient for sparse graphs.'
        },
        {
          id: 'w08-q3',
          q: 'What property must a directed graph possess to have a valid Topological Ordering?',
          options: [
            'It must be a Directed Acyclic Graph (DAG)',
            'It must contain at least one directed cycle',
            'It must be strongly connected',
            'All vertices must have even degree'
          ],
          answer: 0,
          explanation: 'Topological sorting linearizes vertices such that every directed edge u → v appears with u before v. This is impossible if cycles exist.'
        },
        {
          id: 'w08-q4',
          q: 'How does Kahn’s Algorithm for Topological Sort detect cycles in a directed graph?',
          options: [
            'If the total count of processed vertices in the queue is strictly less than V',
            'If the queue size ever exceeds 2',
            'If initial in-degrees are all 0',
            'By checking edge weight signs'
          ],
          answer: 0,
          explanation: 'Vertices in a cycle never reach an in-degree of 0 and cannot enter the queue. If processed count < V, a cycle exists.'
        },
        {
          id: 'w08-q5',
          q: 'What is the time complexity of Dijkstra’s Shortest Path Algorithm using an Adjacency List and Min-Heap (Priority Queue)?',
          options: ['O((V + E) log V)', 'O(V²)', 'O(V × E)', 'O(E²)'],
          answer: 0,
          explanation: 'Extracting min-distance vertices takes O(V log V) and updating distances for all edges takes O(E log V), yielding O((V + E) log V).'
        },
        {
          id: 'w08-q6',
          q: 'Why does standard Dijkstra’s algorithm fail or loop infinitely on graphs with negative edge weights?',
          options: [
            'Dijkstra greedily assumes once a vertex distance is finalized, no shorter path can be found, which is violated by negative edges',
            'Heaps cannot store negative numbers',
            'Adjacency lists crash on negative weights',
            'Vertices cannot be visited twice'
          ],
          answer: 0,
          explanation: 'Dijkstra assumes paths grow monotonically. A negative edge can decrease the cost of an already finalized node, invalidating greedy decisions.'
        },
        {
          id: 'w08-q7',
          q: 'Which algorithm finds Single-Source Shortest Paths in graphs containing negative edge weights and detects negative cycles?',
          options: ['Bellman-Ford Algorithm', 'Dijkstra’s Algorithm', 'Kruskal’s Algorithm', 'Prim’s Algorithm'],
          answer: 0,
          explanation: 'Bellman-Ford relaxes all E edges V-1 times in O(V × E) time, correctly handling negative weights and detecting negative cycles on the V-th pass.'
        },
        {
          id: 'w08-q8',
          q: 'In Disjoint Set Union (DSU / Union-Find) with Path Compression and Union by Rank, what is the amortized time complexity per operation?',
          options: ['O(α(V)) (Inverse Ackermann, practically O(1))', 'O(log V)', 'O(V)', 'O(1) strictly'],
          answer: 0,
          explanation: 'Path compression and union by rank reduce tree heights so drastically that operations run in nearly constant O(α(V)) time.'
        },
        {
          id: 'w08-q9',
          q: 'What is the primary difference between Kruskal’s and Prim’s algorithms for finding a Minimum Spanning Tree (MST)?',
          options: [
            'Kruskal’s sorts all edges globally and uses DSU; Prim’s grows a single connected tree from a start vertex using a priority queue',
            'Kruskal’s only works on directed graphs',
            'Prim’s cannot handle positive weights',
            'Kruskal’s has exponential time complexity'
          ],
          answer: 0,
          explanation: 'Kruskal’s is an edge-centric greedy algorithm using Union-Find, while Prim’s is a vertex-centric greedy algorithm growing connected components.'
        },
        {
          id: 'w08-q10',
          q: 'How many edges are contained in a Minimum Spanning Tree of a connected graph with V vertices?',
          options: ['V - 1', 'V', 'V + 1', 'V × (V - 1) / 2'],
          answer: 0,
          explanation: 'A tree spanning V vertices is connected and acyclic, meaning it has exactly V - 1 edges.'
        },
        {
          id: 'w08-q11',
          q: 'In DFS cycle detection on a directed graph, what indicates the presence of a cycle?',
          options: [
            'Encountering a neighbor vertex currently in the active recursion call stack (Gray / in-progress state)',
            'Visiting any already completed black node',
            'Reaching a leaf node',
            'Reaching a node with in-degree 0'
          ],
          answer: 0,
          explanation: 'A back-edge pointing to a vertex currently active in the execution recursion stack (Gray node) confirms a directed cycle.'
        },
        {
          id: 'w08-q12',
          q: 'What is the time complexity of the Floyd-Warshall algorithm for All-Pairs Shortest Paths on a graph with V vertices?',
          options: ['O(V³)', 'O(V² log V)', 'O(V + E)', 'O(V × E)'],
          answer: 0,
          explanation: 'Floyd-Warshall uses three nested loops over all vertices (k, i, j) to update shortest paths, taking O(V³) time.'
        },
        {
          id: 'w08-q13',
          q: 'What is a Bipartite Graph?',
          options: [
            'A graph whose vertices can be divided into two disjoint sets such that every edge connects vertices in different sets (2-colorable)',
            'A graph with exactly two edges',
            'A graph containing only even-weight edges',
            'A graph with two disconnected components'
          ],
          answer: 0,
          explanation: 'A graph is bipartite if it contains no odd-length cycles and can be colored with 2 colors such that no adjacent vertices share a color.'
        },
        {
          id: 'w08-q14',
          q: 'What is the time complexity of finding connected components in an undirected graph of size M × N (Number of Islands problem)?',
          options: ['O(M × N)', 'O(M² × N²)', 'O(2ᴹ⁺ᴺ)', 'O(log(M × N))'],
          answer: 0,
          explanation: 'A single BFS, DFS, or DSU pass visits each grid cell a constant number of times: O(M × N) linear time.'
        },
        {
          id: 'w08-q15',
          q: 'What is the time complexity of Tarjan’s Algorithm for finding Strongly Connected Components (SCCs) in a directed graph?',
          options: ['O(V + E)', 'O(V²)', 'O(V × E)', 'O(E log V)'],
          answer: 0,
          explanation: 'Tarjan’s algorithm uses a single DFS pass with discovery times and low-link values to partition the graph into SCCs in O(V + E) time.'
        }
      ]
    }
  },

  getWeeklyTest(weekId) {
    return this.weeklyTests[weekId] || null;
  },

  getAllWeeklyTests() {
    return Object.values(this.weeklyTests);
  },

  // ============================================================
  // SEQUENTIAL WEEKLY PROGRESSION & 7-DAY COOLDOWN ENGINE
  // ============================================================
  getWeeklyProgression(userId) {
    const uid = userId || this.getCurrentUserId();
    const progressionKey = this.getUserStorageKey('weekly_progression', uid);
    const attemptsKey = this.getUserStorageKey('weekly-tests', uid);

    const savedProgression = localStorage.getItem(progressionKey);
    const savedAttempts = localStorage.getItem(attemptsKey);
    const attempts = savedAttempts ? JSON.parse(savedAttempts) : [];

    const weekSequence = Object.keys(this.weeklyTests); // ['week-01' ... 'week-08']
    let completedWeeks = {};

    if (savedProgression) {
      try {
        const parsed = JSON.parse(savedProgression);
        if (parsed && parsed.completedWeeks) {
          completedWeeks = { ...parsed.completedWeeks };
        }
      } catch (e) {
        console.error('Error parsing weekly progression', e);
      }
    }

    // Cross-reference with recorded test attempts
    attempts.forEach(att => {
      if (att.weekId && !completedWeeks[att.weekId]) {
        completedWeeks[att.weekId] = {
          weekId: att.weekId,
          score: att.score,
          total: att.total,
          percentage: att.percentage,
          completedAt: att.timestamp || (att.date ? new Date(att.date).getTime() : Date.now()),
          timeFormatted: att.timeFormatted
        };
      }
    });

    // Find sequential progression index
    let lastCompletedWeekIndex = -1;
    for (let i = 0; i < weekSequence.length; i++) {
      const wid = weekSequence[i];
      if (completedWeeks[wid]) {
        lastCompletedWeekIndex = i;
      } else {
        break; // Strict sequential: stop at first uncompleted week
      }
    }

    const completedCount = lastCompletedWeekIndex + 1;
    const allCompleted = completedCount >= weekSequence.length;

    let currentWeekId = allCompleted ? weekSequence[weekSequence.length - 1] : weekSequence[completedCount];
    let isLocked = false;
    let nextUnlockTimestamp = 0;
    let remainingCooldownMs = 0;
    let lastCompletedInfo = null;

    if (completedCount > 0 && !allCompleted) {
      const lastCompletedId = weekSequence[lastCompletedWeekIndex];
      lastCompletedInfo = completedWeeks[lastCompletedId];
      const completedAt = lastCompletedInfo.completedAt || Date.now();
      nextUnlockTimestamp = completedAt + this.WEEKLY_COOLDOWN_MS;

      const now = Date.now();
      if (now < nextUnlockTimestamp) {
        isLocked = true;
        remainingCooldownMs = nextUnlockTimestamp - now;
      } else {
        isLocked = false;
        remainingCooldownMs = 0;
      }
    } else if (allCompleted) {
      isLocked = false;
      const lastCompletedId = weekSequence[weekSequence.length - 1];
      lastCompletedInfo = completedWeeks[lastCompletedId];
    }

    return {
      weekSequence,
      completedWeeks,
      completedCount,
      allCompleted,
      currentWeekId,
      isLocked,
      lastCompletedInfo,
      nextUnlockTimestamp,
      remainingCooldownMs
    };
  },

  canStartWeeklyTest(weekId, userId) {
    const prog = this.getWeeklyProgression(userId);
    const test = this.weeklyTests[weekId];

    if (!test) {
      return { allowed: false, reason: 'Invalid weekly test ID.' };
    }

    // If test is already completed, disallow retake
    if (prog.completedWeeks[weekId]) {
      return {
        allowed: false,
        reason: `${test.weekLabel} is already completed. Your next test unlocks sequentially.`,
        isCompleted: true
      };
    }

    // Must be the immediate current sequential week
    if (prog.currentWeekId !== weekId) {
      return {
        allowed: false,
        reason: `Please complete earlier weekly tests first. Weekly tests must be completed in order.`
      };
    }

    // Check if 7-day cooldown is active
    if (prog.isLocked) {
      return {
        allowed: false,
        reason: `${test.weekLabel} is locked. Available in ${this.formatRemainingCooldown(prog.remainingCooldownMs)}.`,
        isLocked: true,
        remainingCooldownMs: prog.remainingCooldownMs,
        nextUnlockTimestamp: prog.nextUnlockTimestamp
      };
    }

    return { allowed: true };
  },

  formatRemainingCooldown(ms) {
    if (!ms || ms <= 0) return '0s';
    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (mins > 0 || hours > 0 || days > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  },

  getWeeklyTestStats(userId) {
    const uid = userId || this.getCurrentUserId();
    const prog = this.getWeeklyProgression(uid);
    const attemptsKey = this.getUserStorageKey('weekly-tests', uid);
    const saved = localStorage.getItem(attemptsKey);
    const attempts = saved ? JSON.parse(saved) : [];

    const completedCount = prog.completedCount;
    if (completedCount === 0) {
      return {
        completedCount: 0,
        averageScore: 0,
        bestScore: 0,
        attempts: []
      };
    }

    const completedValues = Object.values(prog.completedWeeks);
    const totalPct = completedValues.reduce((acc, a) => acc + (a.percentage || Math.round((a.score / a.total) * 100)), 0);
    const avgPct = Math.round(totalPct / completedValues.length);
    const bestPct = Math.max(...completedValues.map(a => a.percentage || Math.round((a.score / a.total) * 100)));

    return {
      completedCount,
      averageScore: avgPct,
      bestScore: bestPct,
      attempts
    };
  },

  recordWeeklyTestResult(weekId, score, total, timeTakenSeconds, answers, userId) {
    const uid = userId || this.getCurrentUserId();
    const attemptsKey = this.getUserStorageKey('weekly-tests', uid);
    const progressionKey = this.getUserStorageKey('weekly_progression', uid);

    const saved = localStorage.getItem(attemptsKey);
    const attempts = saved ? JSON.parse(saved) : [];

    const test = this.getWeeklyTest(weekId);
    const title = test ? `${test.weekLabel} · ${test.title}` : `Weekly Test (${weekId})`;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const now = Date.now();

    const timeFormatted = `${Math.floor(timeTakenSeconds / 60).toString().padStart(2, '0')}:${(timeTakenSeconds % 60).toString().padStart(2, '0')}`;

    const newAttempt = {
      id: 'wt_' + now,
      weekId,
      title,
      score,
      total,
      percentage: pct,
      timeTakenSeconds,
      timeFormatted,
      answers: answers || [],
      timestamp: now,
      date: new Date(now).toISOString()
    };

    attempts.push(newAttempt);
    localStorage.setItem(attemptsKey, JSON.stringify(attempts));

    // Update progression storage with exact completion timestamp
    const savedProg = localStorage.getItem(progressionKey);
    let progression = savedProg ? JSON.parse(savedProg) : { completedWeeks: {} };
    if (!progression.completedWeeks) progression.completedWeeks = {};

    progression.completedWeeks[weekId] = {
      weekId,
      score,
      total,
      percentage: pct,
      timeFormatted,
      completedAt: now,
      nextUnlockTimestamp: now + this.WEEKLY_COOLDOWN_MS
    };

    localStorage.setItem(progressionKey, JSON.stringify(progression));

    // Update overall learning stats
    const stats = this.getLearningStats(uid);
    stats.questionsAttempted = (stats.questionsAttempted || 0) + total;
    stats.questionsCorrect = (stats.questionsCorrect || 0) + score;
    stats.questionsIncorrect = Math.max(0, stats.questionsAttempted - stats.questionsCorrect);
    stats.practiceAccuracy = stats.questionsAttempted > 0 ? Math.round((stats.questionsCorrect / stats.questionsAttempted) * 100) : 0;

    // Recalculate weekly test summary in learning stats
    const weeklySummary = this.getWeeklyTestStats(uid);
    stats.weeklyTests = {
      completedCount: weeklySummary.completedCount,
      averageScore: weeklySummary.averageScore,
      bestScore: weeklySummary.bestScore
    };

    this.saveLearningStats(stats, uid);

    // Add to recent activity timeline
    this.addRecentActivity({
      type: 'practice',
      title: `Weekly Test: ${test ? test.weekLabel + ' · ' + test.category : 'Week Test'}`,
      detail: `Score: ${score}/${total} (${pct}%) · ${timeFormatted}`,
      timestamp: now
    }, uid);

    return newAttempt;
  },

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
      detail: `${Math.round((score / total) * 100)}% accuracy (${score}/${total})`,
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

