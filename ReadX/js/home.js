/* ============================================================
   js/home.js — READX LANDING PAGE INTERACTIVE CONTROLS
   ============================================================ */

(function () {
  'use strict';

  // --- Topic Data for DSA Workspace Preview ---
  const TOPICS_DATA = {
    'binary-search': {
      name: 'BINARY SEARCH',
      category: 'SEARCHING',
      java: `int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      cpp: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      console: [
        { text: '> Compiling BinarySearch.java...', type: 'system' },
        { text: '> Executing binarySearch(arr, 23)...', type: 'system' },
        { text: 'Array: [2, 5, 8, 12, 16, 23, 38, 56, 72]', type: 'info' },
        { text: 'Target: 23', type: 'info' },
        { text: 'Step 1: mid = index 4 (val: 16). 23 > 16 -> search right.', type: 'info' },
        { text: 'Step 2: mid = index 6 (val: 38). 23 < 38 -> search left.', type: 'info' },
        { text: 'Step 3: mid = index 5 (val: 23). Found target!', type: 'info' },
        { text: 'Result: Index 5 (Value: 23)', type: 'success' },
        { text: 'Process finished in 28ms.', type: 'system' }
      ],
      vizType: 'array'
    },
    'arrays': {
      name: 'ARRAYS',
      category: 'DATA STRUCTURES',
      java: `// Initialize integer array of size 5
int[] arr = new int[5];
arr[0] = 10;
arr[1] = 20;
arr[2] = 30;

// O(1) Access
int value = arr[1]; // returns 20`,
      cpp: `// Initialize integer array of size 5
int arr[5] = {10, 20, 30, 0, 0};

// O(1) Access
int value = arr[1]; // returns 20`,
      console: [
        { text: '> Compiling ArrayDemo.java...', type: 'system' },
        { text: '> Running ArrayDemo...', type: 'system' },
        { text: 'Array allocated at memory block: 0x7ffd', type: 'info' },
        { text: 'Accessing arr[1]...', type: 'info' },
        { text: 'Value retrieved: 20', type: 'success' },
        { text: 'Time complexity: O(1)', type: 'info' },
        { text: 'Process finished in 12ms.', type: 'system' }
      ],
      vizType: 'arrayAccess'
    },
    'linked-lists': {
      name: 'LINKED LISTS',
      category: 'DATA STRUCTURES',
      java: `class Node {
    int data;
    Node next;
    Node(int d) {
        data = d;
        next = null;
    }
}

// Inserting a node at start
Node head = new Node(10);
Node temp = new Node(20);
temp.next = head;
head = temp;`,
      cpp: `struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

// Inserting a node at start
Node* head = new Node(10);
Node* temp = new Node(20);
temp->next = head;
head = temp;`,
      console: [
        { text: '> Compiling LinkedListDemo.java...', type: 'system' },
        { text: '> Running LinkedListDemo...', type: 'system' },
        { text: 'Created Node(10) at heap address: 0x8a10', type: 'info' },
        { text: 'Created Node(20) at heap address: 0x8a24', type: 'info' },
        { text: 'Linking Node(20) -> Node(10)', type: 'info' },
        { text: 'List: [20] -> [10] -> NULL', type: 'success' },
        { text: 'Process finished in 18ms.', type: 'system' }
      ],
      vizType: 'linked'
    },
    'recursion': {
      name: 'RECURSION',
      category: 'ALGORITHMS',
      java: `int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      cpp: `int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
      console: [
        { text: '> Compiling RecursionDemo.java...', type: 'system' },
        { text: '> Running fibonacci(4)...', type: 'system' },
        { text: 'fib(4) calls fib(3) + fib(2)', type: 'info' },
        { text: '  fib(3) calls fib(2) + fib(1)', type: 'info' },
        { text: '    fib(2) calls fib(1) + fib(0) -> returns 1', type: 'info' },
        { text: '  fib(3) returns 2', type: 'info' },
        { text: 'Result: 3', type: 'success' },
        { text: 'Max stack depth reached: 4', type: 'info' },
        { text: 'Process finished in 22ms.', type: 'system' }
      ],
      vizType: 'recursion'
    },
    'trees': {
      name: 'TREES',
      category: 'DATA STRUCTURES',
      java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

// In-order traversal
void inorder(TreeNode root) {
    if (root == null) return;
    inorder(root.left);
    System.out.print(root.val + " ");
    inorder(root.right);
}`,
      cpp: `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// In-order traversal
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}`,
      console: [
        { text: '> Compiling TreeTraversal.java...', type: 'system' },
        { text: '> Running inorder(Root)...', type: 'system' },
        { text: 'Tree Structure: [Root: 10] left:[5] right:[15]', type: 'info' },
        { text: 'Traversing Left Subtree...', type: 'info' },
        { text: 'Output: 5 10 15', type: 'success' },
        { text: 'Nodes visited: 3', type: 'info' },
        { text: 'Process finished in 15ms.', type: 'system' }
      ],
      vizType: 'tree'
    },
    'graphs': {
      name: 'GRAPHS',
      category: 'DATA STRUCTURES',
      java: `class Graph {
    int V;
    LinkedList<Integer>[] adj;
    
    Graph(int v) {
        V = v;
        adj = new LinkedList[v];
        for (int i = 0; i < v; ++i)
            adj[i] = new LinkedList();
    }
    
    void addEdge(int v, int w) {
        adj[v].add(w);
    }
}`,
      cpp: `class Graph {
    int V;
    list<int>* adj;
public:
    Graph(int V) {
        this->V = V;
        adj = new list<int>[V];
    }
    void addEdge(int v, int w) {
        adj[v].push_back(w);
    }
};`,
      console: [
        { text: '> Compiling GraphDemo.java...', type: 'system' },
        { text: '> Running GraphDemo...', type: 'system' },
        { text: 'Created graph with 4 vertices.', type: 'info' },
        { text: 'Added edges: (0,1), (0,2), (1,2), (2,0), (2,3), (3,3)', type: 'info' },
        { text: 'Graph representation: Adjacency List', type: 'info' },
        { text: 'Graph validation complete.', type: 'success' },
        { text: 'Process finished in 32ms.', type: 'system' }
      ],
      vizType: 'graph'
    }
  };

  document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // 1. HERO SECTION: LIVE READING DEMONSTRATION & ANIMATION
    // ============================================================
    const heroLiveCard = document.getElementById('heroLiveCard');
    const tabStandard = document.getElementById('tabStandard');
    const tabReadX = document.getElementById('tabReadX');
    const heroReadAloudBtn = document.getElementById('heroReadAloudBtn');
    const heroPlayIcon = document.getElementById('heroPlayIcon');
    const heroPlayText = document.getElementById('heroPlayText');
    const heroProgressCount = document.getElementById('heroProgressCount');
    const heroProgressBar = document.getElementById('heroProgressBar');
    const heroSentences = document.querySelectorAll('#heroTextContainer .live-sentence');
    const totalSentences = heroSentences.length;

    let activeSentenceIndex = 0;
    let heroAnimInterval = null;
    let isReadXMode = false;
    let isSpeaking = false;
    let synth = window.speechSynthesis;
    let utterance = null;

    // Set standard mode initially
    function setStandardMode() {
      isReadXMode = false;
      stopHeroCycling();
      stopSpeech();
      heroLiveCard.classList.remove('readx-mode-active', 'focus-active');
      heroSentences.forEach(s => s.classList.remove('focused-sentence'));
      tabStandard.classList.add('active');
      tabReadX.classList.remove('active');
      heroPlayIcon.textContent = '▶';
      heroPlayText.textContent = 'Read Aloud';
      heroReadAloudBtn.classList.remove('speaking-active');
      heroProgressCount.textContent = '01';
      heroProgressBar.style.width = '0%';
    }

    // Set ReadX mode and start cycling
    function setReadXMode() {
      isReadXMode = true;
      heroLiveCard.classList.add('readx-mode-active');
      tabStandard.classList.remove('active');
      tabReadX.classList.add('active');

      // Focus Mode activates shortly after typography transition
      setTimeout(() => {
        if (!isReadXMode) return;
        heroLiveCard.classList.add('focus-active');
        activeSentenceIndex = 0;
        highlightSentence(activeSentenceIndex);
        startHeroCycling();
      }, 1000);
    }

    function highlightSentence(index) {
      heroSentences.forEach((s, idx) => {
        s.classList.toggle('focused-sentence', idx === index);
      });
      heroProgressCount.textContent = String(index + 1).padStart(2, '0');
      heroProgressBar.style.width = `${((index + 1) / totalSentences) * 100}%`;

      // If speak mode is active, read the sentence
      if (isSpeaking) {
        speakText(heroSentences[index].textContent);
      }
    }

    function cycleSentence() {
      activeSentenceIndex = (activeSentenceIndex + 1) % totalSentences;
      highlightSentence(activeSentenceIndex);
    }

    function startHeroCycling() {
      stopHeroCycling();
      if (!isSpeaking) {
        // Cycle every 3 seconds if not reading aloud (letting speech end event handle transition otherwise)
        heroAnimInterval = setInterval(cycleSentence, 3000);
      }
    }

    function stopHeroCycling() {
      if (heroAnimInterval) {
        clearInterval(heroAnimInterval);
        heroAnimInterval = null;
      }
    }

    function speakText(text) {
      if (!synth) return;
      synth.cancel();

      utterance = new SpeechSynthesisUtterance(text);
      // Premium matching rate
      utterance.rate = 1.0;
      
      utterance.onend = function () {
        if (isSpeaking && isReadXMode) {
          // Once speech finishes, go to the next sentence
          setTimeout(() => {
            if (isSpeaking && isReadXMode) {
              cycleSentence();
            }
          }, 400);
        }
      };

      utterance.onerror = function () {
        isSpeaking = false;
        heroPlayIcon.textContent = '▶';
        heroPlayText.textContent = 'Read Aloud';
        heroReadAloudBtn.classList.remove('speaking-active');
      };

      synth.speak(utterance);
    }

    function stopSpeech() {
      isSpeaking = false;
      if (synth) {
        synth.cancel();
      }
      heroPlayIcon.textContent = '▶';
      heroPlayText.textContent = 'Read Aloud';
      heroReadAloudBtn.classList.remove('speaking-active');
    }

    // Tab switcher events
    tabStandard.addEventListener('click', setStandardMode);
    tabReadX.addEventListener('click', setReadXMode);

    // Read Aloud click event
    heroReadAloudBtn.addEventListener('click', function () {
      if (!isReadXMode) {
        // Toggle to ReadX first
        setReadXMode();
        setTimeout(() => {
          triggerSpeech();
        }, 1100);
      } else {
        triggerSpeech();
      }
    });

    function triggerSpeech() {
      if (isSpeaking) {
        stopSpeech();
        startHeroCycling();
      } else {
        isSpeaking = true;
        heroPlayIcon.textContent = '■';
        heroPlayText.textContent = 'Pause';
        heroReadAloudBtn.classList.add('speaking-active');
        stopHeroCycling();
        speakText(heroSentences[activeSentenceIndex].textContent);
      }
    }

    // Manual sentence click to focus
    heroSentences.forEach((sentence) => {
      sentence.addEventListener('click', function () {
        if (!isReadXMode) {
          setReadXMode();
          setTimeout(() => {
            activeSentenceIndex = parseInt(this.getAttribute('data-s-idx'), 10);
            highlightSentence(activeSentenceIndex);
          }, 1100);
        } else {
          activeSentenceIndex = parseInt(this.getAttribute('data-s-idx'), 10);
          highlightSentence(activeSentenceIndex);
          if (isSpeaking) {
            speakText(this.textContent);
          }
        }
      });
    });

    // Auto trigger ReadX adaptation shortly after load for visual wow-factor
    setTimeout(setReadXMode, 2200);


    // ============================================================
    // 2. SECTION 2: COMPARATIVE CARD LAYER TOGGLES
    // ============================================================
    const diffReadXCard = document.getElementById('diffReadXCard');
    const diffPills = document.querySelectorAll('.diff-interactive-pills .diff-pill');
    const diffSentences = document.querySelectorAll('#diffTextContainer .diff-sentence');
    const diffProgressFill = document.getElementById('diffProgressFill');
    const diffProgressText = document.getElementById('diffProgressText');
    const diffFooterLabel = document.getElementById('diffFooterLabel');
    const diffProgressWrap = document.getElementById('diffProgressWrap');

    let diffFocusIndex = 0;
    let diffFocusInterval = null;

    // Setup initial layer classes
    diffPills.forEach(pill => {
      const layer = pill.getAttribute('data-layer');
      diffReadXCard.classList.add(`has-${layer}`);
    });

    // Pill click handler
    diffPills.forEach(pill => {
      pill.addEventListener('click', function () {
        const layer = this.getAttribute('data-layer');
        this.classList.toggle('active');
        const isActive = this.classList.contains('active');

        if (isActive) {
          diffReadXCard.classList.add(`has-${layer}`);
        } else {
          diffReadXCard.classList.remove(`has-${layer}`);
        }

        // Handle specific layer toggle side effects
        if (layer === 'focus') {
          if (isActive) {
            startDiffCycling();
          } else {
            stopDiffCycling();
            diffSentences.forEach(s => s.classList.remove('diff-focused'));
          }
        }

        if (layer === 'listen') {
          if (isActive) {
            diffFooterLabel.textContent = '▶ Read Aloud Active · 1.0x';
            diffFooterLabel.classList.add('copper-text');
            diffProgressWrap.style.opacity = '1';
          } else {
            diffFooterLabel.textContent = 'Read Aloud Inactive';
            diffFooterLabel.classList.remove('copper-text');
            diffProgressWrap.style.opacity = '0';
          }
        }
      });
    });

    function cycleDiffSentence() {
      diffFocusIndex = (diffFocusIndex + 1) % diffSentences.length;
      diffSentences.forEach((s, idx) => {
        s.classList.toggle('diff-focused', idx === diffFocusIndex);
      });
      diffProgressText.textContent = `0${diffFocusIndex + 1} / 02`;
      diffProgressFill.style.width = `${((diffFocusIndex + 1) / 2) * 100}%`;
    }

    function startDiffCycling() {
      stopDiffCycling();
      diffSentences.forEach((s, idx) => {
        s.classList.toggle('diff-focused', idx === diffFocusIndex);
      });
      diffFocusInterval = setInterval(cycleDiffSentence, 3500);
    }

    function stopDiffCycling() {
      if (diffFocusInterval) {
        clearInterval(diffFocusInterval);
        diffFocusInterval = null;
      }
    }

    // Start comparative focus cycling
    startDiffCycling();


    // ============================================================
    // 3. SECTION 3: INTERACTIVE CAPABILITY WIDGETS
    // ============================================================
    // Typography Slider
    const typoSizeSlider = document.getElementById('typoSizeSlider');
    const typoPreviewText = document.getElementById('typoPreviewText');
    const typoSizeVal = document.getElementById('typoSizeVal');

    if (typoSizeSlider) {
      typoSizeSlider.addEventListener('input', function () {
        const val = this.value;
        typoSizeVal.textContent = `${val}px`;
        typoPreviewText.style.fontSize = `${val}px`;
        typoPreviewText.style.lineHeight = `${1.2 + (val / 32)}`; // Scale line height slightly
      });
    }

    // Listen Play Button Waveform Simulator
    const listenPlayBtn = document.getElementById('listenPlayBtn');
    const listenPreview = document.querySelector('.listen-audio-preview');
    let listenSpeaking = false;

    if (listenPlayBtn) {
      listenPlayBtn.addEventListener('click', function () {
        listenSpeaking = !listenSpeaking;
        if (listenSpeaking) {
          this.textContent = '■';
          listenPreview.classList.add('playing-active');
          // Speak mock sentence to make it actually do something cool
          if (synth) {
            synth.cancel();
            const ut = new SpeechSynthesisUtterance('Assistive layout reduces reading fatigue.');
            ut.onend = () => {
              listenSpeaking = false;
              this.textContent = '▶';
              listenPreview.classList.remove('playing-active');
            };
            synth.speak(ut);
          }
        } else {
          this.textContent = '▶';
          listenPreview.classList.remove('playing-active');
          if (synth) synth.cancel();
        }
      });
    }

    // Adapt Theme swatches
    const themePreviewBox = document.getElementById('themePreviewBox');
    const swatchBtns = document.querySelectorAll('.theme-swatches .swatch-btn');

    swatchBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const theme = this.getAttribute('data-theme');
        
        swatchBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        themePreviewBox.setAttribute('data-theme-preview', theme);
      });
    });

    // Set initial preview box theme
    themePreviewBox.setAttribute('data-theme-preview', 'warm');


    // ============================================================
    // 4. SECTION 4: DSA WORKSPACE PREVIEW
    // ============================================================
    const topicItems = document.querySelectorAll('.topic-list .topic-item');
    const wsTopicCategory = document.getElementById('wsTopicCategory');
    const wsTopicName = document.getElementById('wsTopicName');
    const wsCodeBlock = document.getElementById('workspaceCodeBlock');
    const langTabs = document.querySelectorAll('.code-lang-selector .lang-tab');
    const wsRunBtn = document.getElementById('wsRunBtn');
    const wsVisualizeBtn = document.getElementById('wsVisualizeBtn');
    const workspaceConsole = document.getElementById('workspaceConsole');
    const workspaceViz = document.getElementById('workspaceViz');
    const workspaceVizBody = document.getElementById('workspaceVizBody');
    const closeVizBtn = document.getElementById('closeVizBtn');

    let currentTopicId = 'binary-search';
    let currentLang = 'java';

    function updateWorkspace() {
      if (typeof TOPICS_DATA === 'undefined') return;
      const data = TOPICS_DATA[currentTopicId];
      if (!data) return;

      if (wsTopicName) wsTopicName.textContent = data.name;
      if (wsTopicCategory) wsTopicCategory.textContent = data.category;
      if (wsCodeBlock) wsCodeBlock.textContent = data[currentLang];
      
      // Reset output console
      if (workspaceConsole) {
        workspaceConsole.innerHTML = `<div class="console-line console-system">> Ready. Click 'Run Code' to execute.</div>`;
      }
      if (workspaceViz) {
        workspaceViz.setAttribute('hidden', '');
      }
    }

    topicItems.forEach(item => {
      item.addEventListener('click', function () {
        topicItems.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        currentTopicId = this.getAttribute('data-topic');
        updateWorkspace();
      });
    });

    langTabs.forEach(tab => {
      tab.addEventListener('click', function () {
        langTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        currentLang = this.getAttribute('data-lang');
        updateWorkspace();
      });
    });

    // Run Code Simulation
    if (wsRunBtn) {
      wsRunBtn.addEventListener('click', function () {
        if (typeof TOPICS_DATA === 'undefined') return;
        const data = TOPICS_DATA[currentTopicId];
        if (!data) return;

        if (workspaceConsole) workspaceConsole.innerHTML = '';
        let logIndex = 0;

        function printNextLine() {
          if (logIndex < data.console.length) {
            const log = data.console[logIndex];
            const div = document.createElement('div');
            div.className = `console-line console-${log.type}`;
            div.textContent = log.text;
            if (workspaceConsole) {
              workspaceConsole.appendChild(div);
              workspaceConsole.scrollTop = workspaceConsole.scrollHeight;
            }

            logIndex++;
            setTimeout(printNextLine, 350);
          }
        }

        printNextLine();
      });
    }

    // Close Visualizer Overlay
    if (closeVizBtn) {
      closeVizBtn.addEventListener('click', function () {
        if (workspaceViz) workspaceViz.setAttribute('hidden', '');
      });
    }

    // Visualize Button: Animate Algorithm Steps
    if (wsVisualizeBtn) {
      wsVisualizeBtn.addEventListener('click', function () {
        if (workspaceViz) workspaceViz.removeAttribute('hidden');
        if (workspaceVizBody) workspaceVizBody.innerHTML = '';

        if (typeof TOPICS_DATA === 'undefined') return;
        const data = TOPICS_DATA[currentTopicId];
        if (!data) return;

        if (data.vizType === 'array') {
          runBinarySearchViz();
        } else if (data.vizType === 'linked') {
          runLinkedListViz();
        } else if (data.vizType === 'arrayAccess') {
          runArrayAccessViz();
        } else if (data.vizType === 'recursion') {
          runRecursionViz();
        } else if (data.vizType === 'tree') {
          runTreeTraversalViz();
        } else {
          runGenericGraphViz();
        }
      });
    }


    // Array Binary Search Visualization
    function runBinarySearchViz() {
      const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72];
      const target = 23;
      
      const arrayContainer = document.createElement('div');
      arrayContainer.className = 'viz-array';
      
      arr.forEach(num => {
        const el = document.createElement('div');
        el.className = 'viz-element';
        el.textContent = num;
        arrayContainer.appendChild(el);
      });

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'Initializing binary search for target = 23';

      workspaceVizBody.appendChild(arrayContainer);
      workspaceVizBody.appendChild(instruction);

      const items = arrayContainer.children;

      // Step 1: Check Mid 16
      setTimeout(() => {
        instruction.textContent = 'Step 1: Check mid element index 4 (Value: 16). 16 < 23 -> Discard left half.';
        items[4].classList.add('active-check');
        for (let i = 0; i < 4; i++) items[i].classList.add('eliminated');
      }, 1500);

      // Step 2: Check Mid 38
      setTimeout(() => {
        items[4].classList.remove('active-check');
        items[4].classList.add('eliminated');
        instruction.textContent = 'Step 2: Check mid element index 6 (Value: 38). 38 > 23 -> Discard right half.';
        items[6].classList.add('active-check');
        for (let i = 7; i < arr.length; i++) items[i].classList.add('eliminated');
      }, 3500);

      // Step 3: Match 23
      setTimeout(() => {
        items[6].classList.remove('active-check');
        items[6].classList.add('eliminated');
        instruction.textContent = 'Step 3: Check mid element index 5 (Value: 23). Match found!';
        items[5].classList.add('found');
      }, 5500);
    }

    // Linked List insert at head visualization
    function runLinkedListViz() {
      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'viz-nodes';

      const n1 = document.createElement('div');
      n1.className = 'viz-node';
      n1.textContent = '10';

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'List Head points to Node(10)';

      nodesContainer.appendChild(n1);
      workspaceVizBody.appendChild(nodesContainer);
      workspaceVizBody.appendChild(instruction);

      // Step 2: Allocate Node 20
      setTimeout(() => {
        instruction.textContent = 'Allocating new Node(20) at head...';
        const n2 = document.createElement('div');
        n2.className = 'viz-node';
        n2.textContent = '20';
        nodesContainer.insertBefore(n2, n1);
      }, 1800);

      // Step 3: Connect nodes
      setTimeout(() => {
        instruction.textContent = 'Link completed: Node(20) -> Node(10) -> NULL';
        nodesContainer.children[0].classList.add('traversed');
        nodesContainer.children[1].classList.add('traversed');
      }, 3600);
    }

    // Array O(1) Access visualization
    function runArrayAccessViz() {
      const arr = [10, 20, 30, 0, 0];
      const arrayContainer = document.createElement('div');
      arrayContainer.className = 'viz-array';
      
      arr.forEach(num => {
        const el = document.createElement('div');
        el.className = 'viz-element';
        el.textContent = num;
        arrayContainer.appendChild(el);
      });

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'Memory array allocated at index 0 to 4.';

      workspaceVizBody.appendChild(arrayContainer);
      workspaceVizBody.appendChild(instruction);

      setTimeout(() => {
        instruction.textContent = 'Accessing index 1 directly via address offsets in O(1)...';
        arrayContainer.children[1].classList.add('found');
      }, 1500);
    }

    // Recursion Stack Trace Visualization
    function runRecursionViz() {
      const stackContainer = document.createElement('div');
      stackContainer.style.display = 'flex';
      stackContainer.style.flexDirection = 'column-reverse';
      stackContainer.style.gap = '6px';
      stackContainer.style.minWidth = '140px';
      stackContainer.style.marginBottom = '1.5rem';

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'Calling fibonacci(4)...';

      workspaceVizBody.appendChild(stackContainer);
      workspaceVizBody.appendChild(instruction);

      const frames = ['fib(4)', 'fib(3)', 'fib(2)', 'fib(1)'];
      frames.forEach((frame, idx) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'viz-element';
          div.style.width = '100%';
          div.style.height = '34px';
          div.textContent = frame;
          stackContainer.appendChild(div);
          instruction.textContent = `Call stack grows: pushed ${frame}`;
        }, (idx + 1) * 1200);
      });

      setTimeout(() => {
        instruction.textContent = 'Base case reached: returning values and popping stack...';
        const children = stackContainer.children;
        children[children.length - 1].classList.add('found');
      }, 6000);
    }

    // Tree in-order traversal
    function runTreeTraversalViz() {
      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'viz-nodes';

      const nLeft = document.createElement('div');
      nLeft.className = 'viz-node';
      nLeft.textContent = '5';

      const nRoot = document.createElement('div');
      nRoot.className = 'viz-node';
      nRoot.textContent = '10';

      const nRight = document.createElement('div');
      nRight.className = 'viz-node';
      nRight.textContent = '15';

      nodesContainer.appendChild(nLeft);
      nodesContainer.appendChild(nRoot);
      nodesContainer.appendChild(nRight);

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'Starting In-order Traversal (Left -> Root -> Right)';

      workspaceVizBody.appendChild(nodesContainer);
      workspaceVizBody.appendChild(instruction);

      setTimeout(() => {
        instruction.textContent = 'Traversing left node (5)...';
        nLeft.classList.add('active-check');
      }, 1500);

      setTimeout(() => {
        nLeft.classList.remove('active-check');
        nLeft.classList.add('found');
        instruction.textContent = 'Visiting root node (10)...';
        nRoot.classList.add('active-check');
      }, 3200);

      setTimeout(() => {
        nRoot.classList.remove('active-check');
        nRoot.classList.add('found');
        instruction.textContent = 'Traversing right node (15)...';
        nRight.classList.add('active-check');
      }, 4800);

      setTimeout(() => {
        nRight.classList.remove('active-check');
        nRight.classList.add('found');
        instruction.textContent = 'Traversal finished. Output: 5, 10, 15';
      }, 6200);
    }

    // Graph viz simulator
    function runGenericGraphViz() {
      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'viz-nodes';

      const v1 = document.createElement('div');
      v1.className = 'viz-node';
      v1.textContent = '0';

      const v2 = document.createElement('div');
      v2.className = 'viz-node';
      v2.textContent = '1';

      const v3 = document.createElement('div');
      v3.className = 'viz-node';
      v3.textContent = '2';

      nodesContainer.appendChild(v1);
      nodesContainer.appendChild(v2);
      nodesContainer.appendChild(v3);

      const instruction = document.createElement('div');
      instruction.className = 'viz-instruction';
      instruction.textContent = 'Building Graph Adjacency List vertices...';

      workspaceVizBody.appendChild(nodesContainer);
      workspaceVizBody.appendChild(instruction);

      setTimeout(() => {
        v1.classList.add('traversed');
        instruction.textContent = 'Connecting edge 0 -> 1';
      }, 1500);

      setTimeout(() => {
        v2.classList.add('traversed');
        instruction.textContent = 'Connecting edge 1 -> 2';
      }, 3000);
    }


    // ============================================================
    // 5. SECTION 5: PRACTICE QUIZ PREVIEW
    // ============================================================
    const quizOptions = document.querySelectorAll('#practiceQuizOptions .quiz-option');
    const quizResultOverlay = document.getElementById('quizResultOverlay');
    const resetQuizBtn = document.getElementById('resetQuizBtn');

    quizOptions.forEach(option => {
      option.addEventListener('click', function () {
        if (!quizResultOverlay) return;
        // Prevent multiple clicks
        if (!quizResultOverlay.hasAttribute('hidden')) return;

        const isCorrect = this.getAttribute('data-correct') === 'true';

        if (isCorrect) {
          this.classList.add('revealed-correct');
          // Update message in overlay
          const scoreEl = quizResultOverlay.querySelector('.result-score');
          const labelEl = quizResultOverlay.querySelector('.result-label');
          const msgEl = quizResultOverlay.querySelector('.result-msg');
          if (scoreEl) scoreEl.textContent = '4 / 5';
          if (labelEl) labelEl.textContent = '80% Accuracy';
          if (msgEl) msgEl.textContent = 'Mastery level achieved! Excellent job.';
        } else {
          this.classList.add('selected-wrong');
          // Highlight correct option
          quizOptions.forEach(opt => {
            if (opt.getAttribute('data-correct') === 'true') {
              opt.classList.add('revealed-correct');
            }
          });
          const scoreEl = quizResultOverlay.querySelector('.result-score');
          const labelEl = quizResultOverlay.querySelector('.result-label');
          const msgEl = quizResultOverlay.querySelector('.result-msg');
          if (scoreEl) scoreEl.textContent = '3 / 5';
          if (labelEl) labelEl.textContent = '60% Accuracy';
          if (msgEl) msgEl.textContent = 'Keep practicing! Review Binary Search complexity to master this topic.';
        }

        // Show result overlay after a short delay
        setTimeout(() => {
          if (quizResultOverlay) quizResultOverlay.removeAttribute('hidden');
        }, 800);
      });
    });

    if (resetQuizBtn) {
      resetQuizBtn.addEventListener('click', function () {
        if (quizResultOverlay) quizResultOverlay.setAttribute('hidden', '');
        quizOptions.forEach(opt => {
          opt.classList.remove('revealed-correct', 'selected-wrong');
        });
      });
    }


    // ============================================================
    // 6. SECTION 6: DRAG AND DROP ZONE SIMULATION
    // ============================================================
    const dropZone = document.getElementById('homeDropZone');

    if (dropZone) {
      dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.borderColor = 'var(--accent)';
      });

      dropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
      });

      dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.borderColor = 'var(--sage)';
        const titleEl = this.querySelector('.drop-title');
        const formatsEl = this.querySelector('.drop-formats');
        
        if (titleEl) titleEl.textContent = 'FILE RECEIVED';
        if (formatsEl) formatsEl.textContent = 'Processing document content...';

        setTimeout(() => {
          window.location.href = 'upload.html';
        }, 1200);
      });
    }

    // Scroll to top robust delegation fallback
    document.body.addEventListener('click', function (e) {
      const btn = e.target.closest('#scrollTopBtn');
      if (btn) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Immediate fallback in case of scroll-behavior smooth blocking/lagging
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });

  });

})();
