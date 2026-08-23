// js/library.js — Library Browse + Interactive Topic Learning Workspace

// Syntax highlighting for Python
function highlightPython(code) {
  return code
    .replace(/(#.*)$/gm, '<span class="cmt">$1</span>')
    .replace(/\b(def|return|if|elif|else|for|while|in|not|and|or|import|from|class|None|True|False|print|lambda|yield|with|as|try|except|finally|raise|pass|break|continue)\b/g, '<span class="kw">$1</span>')
    .replace(/\b([a-z_][a-z0-9_]*)\s*(?=\()/gi, '<span class="fn">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="str">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
}

// Syntax highlighting for Java / C++
function highlightJavaCpp(code) {
  const kwPattern = /\b(int|double|float|char|boolean|void|main|public|private|protected|static|final|class|import|package|new|return|if|else|for|while|do|switch|case|break|continue|default|interface|extends|implements|enum|throw|try|catch|finally|abstract|native|strictfp|synchronized|transient|volatile|long|short|byte|true|false|null|System|std|cout|cin|endl|vector|string|map|set|list|queue|stack|deque|pair|auto|const|sizeof|this|operator|include|using|namespace)\b/g;

  return code
    .replace(/\/\*[\s\S]*?\*\//gm, '<span class="cmt">/*$1*/</span>')
    .replace(/\/\/.*$/gm, '<span class="cmt">//$1</span>')
    .replace(/#.*$/gm, '<span class="cmt">$1</span>')
    .replace(/"(?:[^"\\]|\\.)*"/g, '<span class="str">$1</span>')
    .replace(/'[^'\\]|\\.'/g, '<span class="str">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>')
    .replace(kwPattern, '<span class="kw">$1</span>')
    .replace(/\b(System\.out\.print|System\.out\.printf|System\.out\.println|std::cout|std::cin|std::endl|System\.out)\b/g, '<span class="fn">$1</span>');
}

// CodeEditor module — handles interactive code editing, live backdrop highlight sync, gutter line numbers, copying, and running
const CodeEditor = {
  currentTopicId: null,
  currentLang: 'java',

  init() {
    const textarea = document.getElementById('codeTextarea');
    const backdrop = document.getElementById('codeHighlight');
    const gutter = document.getElementById('codeGutter');

    if (!textarea || !backdrop || !gutter) return;

    textarea.addEventListener('input', this.onInput.bind(this));
    textarea.addEventListener('scroll', this.syncScroll.bind(this));

    const copyBtn = document.getElementById('wsCopyBtn');
    if (copyBtn) copyBtn.addEventListener('click', () => this.copy());

    const runBtn = document.getElementById('wsRunCode');
    if (runBtn) runBtn.addEventListener('click', () => this.run());

    document.querySelectorAll('.ws-code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentLang = tab.dataset.lang || 'java';
        document.querySelectorAll('.ws-code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.refresh();
      });
    });
  },

  setTopic(id) {
    this.currentTopicId = id;
    this.currentLang = 'java';
    document.querySelectorAll('.ws-code-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.lang === 'java');
    });
    this.refresh();
  },

  refresh() {
    const topic = ReadXData.getTopic(this.currentTopicId);
    if (!topic || !topic.workspace || !topic.workspace.code) return;

    const code = topic.workspace.code;
    const source = code[this.currentLang] || code.source || '';
    const highlightFn = this.currentLang === 'python' ? highlightPython : highlightJavaCpp;

    const lines = source.split('\n');
    const highlighted = lines.map(line => `<span class="ws-line">${highlightFn(this.escapeHtml(line))}</span>`).join('\n');
    const gutterNums = lines.map((_, i) => `<span class="ws-ln" aria-hidden="true">${i + 1}</span>`).join('\n');

    const backdrop = document.getElementById('codeHighlight');
    const gutter = document.getElementById('codeGutter');
    const textarea = document.getElementById('codeTextarea');

    if (backdrop) backdrop.innerHTML = highlighted;
    if (gutter) gutter.innerHTML = gutterNums;
    if (textarea) textarea.value = source;

    const inputEl = document.getElementById('wsInput');
    if (inputEl) inputEl.textContent = code.input || 'Default parameters';

    const outputEl = document.getElementById('wsOutput');
    if (outputEl) {
      outputEl.textContent = 'Click Run to execute.';
      outputEl.classList.remove('running');
    }
  },

  onInput() {
    const textarea = document.getElementById('codeTextarea');
    const backdrop = document.getElementById('codeHighlight');
    const gutter = document.getElementById('codeGutter');
    if (!textarea) return;

    const source = textarea.value;
    const highlightFn = this.currentLang === 'python' ? highlightPython : highlightJavaCpp;
    const lines = source.split('\n');
    const highlighted = lines.map(line => `<span class="ws-line">${highlightFn(this.escapeHtml(line))}</span>`).join('\n');
    const gutterNums = lines.map((_, i) => `<span class="ws-ln" aria-hidden="true">${i + 1}</span>`).join('\n');

    if (backdrop) backdrop.innerHTML = highlighted;
    if (gutter) gutter.innerHTML = gutterNums;
    this.syncScroll();
  },

  escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  syncScroll() {
    const textarea = document.getElementById('codeTextarea');
    const backdrop = document.getElementById('codeHighlight');
    if (textarea && backdrop) {
      backdrop.style.top = (-textarea.scrollTop) + 'px';
      backdrop.scrollLeft = textarea.scrollLeft;
    }
  },

  copy() {
    const btn = document.getElementById('wsCopyBtn');
    if (!btn) return;
    const textarea = document.getElementById('codeTextarea');
    const source = textarea ? textarea.value : '';

    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = source;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) this.showCopied(btn);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(source).then(() => this.showCopied(btn)).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  },

  showCopied(btn) {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 1500);
  },

  run() {
    const outputEl = document.getElementById('wsOutput');
    if (!outputEl) return;
    outputEl.classList.add('running');
    outputEl.textContent = 'Executing…';

    const topic = ReadXData.getTopic(this.currentTopicId);
    const code = topic?.workspace?.code;

    setTimeout(() => {
      outputEl.classList.remove('running');
      outputEl.textContent = code?.output || 'Output: [Execution finished with exit code 0]';
    }, 450);
  }
};

// Visualizer module — renders rich interactive visualizations for all 18 topics
const Visualizer = {
  container: null,

  init() {
    this.container = document.getElementById('vizContainer');
  },

  render(topicId) {
    if (!this.container) return;
    const topic = ReadXData.getTopic(topicId);
    if (!topic || !topic.workspace) return;

    const vizType = topic.workspace.code?.viz || topicId;
    this.container.innerHTML = '';

    const renderers = {
      'binary-search': this.renderBinarySearch.bind(this),
      'arrays': this.renderArrays.bind(this),
      'linked-lists': this.renderLinkedLists.bind(this),
      'stack': this.renderStack.bind(this),
      'queue': this.renderQueue.bind(this),
      'recursion': this.renderRecursion.bind(this),
      'sorting': this.renderSorting.bind(this),
      'trees': this.renderTrees.bind(this),
      'graphs': this.renderGraphs.bind(this),
      'dynamic-programming': this.renderDynamicProgramming.bind(this),
      'linear-regression': this.renderLinearRegression.bind(this),
      'logistic-regression': this.renderLogisticRegression.bind(this),
      'classification': this.renderClassification.bind(this),
      'kmeans-clustering': this.renderKMeans.bind(this),
      'neural-networks': this.renderNeuralNetworks.bind(this),
      'activation-functions': this.renderActivationFunctions.bind(this),
      'backpropagation': this.renderBackpropagation.bind(this),
      'overfitting': this.renderOverfitting.bind(this)
    };

    const renderer = renderers[vizType];
    if (renderer) renderer(topic);
    else this.renderPlaceholder(topic);
  },

  renderPlaceholder(topic) {
    this.container.innerHTML = `
      <div class="viz-placeholder">
        <div class="viz-label">${topic.title}</div>
        <p style="color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
          Interactive visual model for ${topic.title}.
        </p>
      </div>
    `;
  },

  renderBinarySearch(topic) {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = 23;
    let low = 0, high = arr.length - 1;
    let step = 0;

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Searching for ' + target + ' in sorted array';

    const legend = document.createElement('div');
    legend.className = 'viz-legend';
    legend.innerHTML = '<span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--copper)"></span> Low / High</span><span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--text-primary)"></span> Midpoint</span><span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--sage)"></span> Target</span>';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Step</button>';

    this.container.append(label, legend, row, controls);

    const render = () => {
      row.innerHTML = '';
      const mid = Math.floor((low + high) / 2);
      arr.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        if (i === mid) el.classList.add('active');
        if (val === target && i === mid) el.classList.add('found');
        if (i < low || i > high) el.style.opacity = '0.35';
        if (i === low) el.style.borderColor = 'var(--copper)';
        if (i === high) el.style.borderColor = 'var(--text-muted)';
        row.appendChild(el);
      });
      const btn = controls.querySelector('#vizStep');
      if (btn) btn.textContent = low <= high && arr[mid] !== target ? 'Next Step' : 'Restart';
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      const mid = Math.floor((low + high) / 2);
      if (arr[mid] === target || low > high) {
        low = 0; high = arr.length - 1; step = 0;
        render();
        return;
      }
      if (target > arr[mid]) low = mid + 1;
      else high = mid - 1;
      step++;
      render();
    });
  },

  renderArrays(topic) {
    const arr = [42, 17, 8, 99, 56, 23, 71, 34];
    let highlightIdx = 0;

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Contiguous Memory Array (O(1) Access)';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Scan Index</button>';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      arr.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.innerHTML = `<span style="font-size:0.6rem;color:var(--text-muted);margin-bottom:2px;">[${i}]</span><span>${val}</span>`;
        if (i === highlightIdx) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      highlightIdx = (highlightIdx + 1) % arr.length;
      render();
    });
  },

  renderLinkedLists(topic) {
    const values = [10, 23, 42, 56, 78];
    let reversed = false;

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Singly Linked List Nodes & Pointers';

    const ll = document.createElement('div');
    ll.className = 'viz-linkedlist';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Reverse Pointers</button>';

    this.container.append(label, ll, controls);

    const render = () => {
      const display = reversed ? [...values].reverse() : values;
      ll.innerHTML = '';
      display.forEach((val, i) => {
        const node = document.createElement('div');
        node.className = 'viz-node';
        const rect = document.createElement('div');
        rect.className = 'viz-node-rect' + (i === 0 ? ' active' : '');
        rect.innerHTML = `<span>${val}</span><span style="font-size:0.6rem;color:var(--text-muted);display:block;">next</span>`;
        node.appendChild(rect);
        if (i < display.length - 1) {
          const arrow = document.createElement('div');
          arrow.className = 'viz-arrow';
          arrow.textContent = '→';
          node.appendChild(arrow);
        } else {
          const nil = document.createElement('div');
          nil.className = 'viz-node-rect';
          nil.style.borderStyle = 'dashed';
          nil.textContent = 'null';
          nil.style.fontSize = '0.7rem';
          node.appendChild(nil);
        }
        ll.appendChild(node);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      reversed = !reversed;
      render();
    });
  },

  renderStack(topic) {
    const pool = [3, 7, 1, 9, 4, 15];
    const stack = [3, 7, 1];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Stack Data Structure (LIFO)';

    const container = document.createElement('div');
    container.className = 'viz-stack';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizPush">Push</button><button class="btn btn-sm btn-outline" id="vizPop">Pop</button>';

    this.container.append(label, container, controls);

    const render = () => {
      container.innerHTML = '';
      if (stack.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem; padding: 1rem;">Stack is empty</div>';
        return;
      }
      for (let i = stack.length - 1; i >= 0; i--) {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.style.width = '120px';
        el.textContent = `${stack[i]} ${i === stack.length - 1 ? '← Top' : ''}`;
        if (i === stack.length - 1) el.classList.add('active');
        container.appendChild(el);
      }
    };

    render();

    controls.querySelector('#vizPush').addEventListener('click', () => {
      if (pool.length > 0) {
        stack.push(pool.shift());
      } else {
        stack.push(Math.floor(Math.random() * 50) + 1);
      }
      render();
    });

    controls.querySelector('#vizPop').addEventListener('click', () => {
      if (stack.length > 0) stack.pop();
      render();
    });
  },

  renderQueue(topic) {
    const queue = [5, 2, 8];
    const pool = [1, 9, 14, 22];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Queue Data Structure (FIFO)';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizEnqueue">Enqueue</button><button class="btn btn-sm btn-outline" id="vizDequeue">Dequeue</button>';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      if (queue.length === 0) {
        row.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem; padding: 1rem;">Queue is empty</div>';
        return;
      }
      queue.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.innerHTML = `<span>${val}</span><span style="font-size:0.6rem;color:var(--text-muted);">${i === 0 ? 'Front' : (i === queue.length - 1 ? 'Rear' : '')}</span>`;
        if (i === 0) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizEnqueue').addEventListener('click', () => {
      queue.push(pool.length > 0 ? pool.shift() : Math.floor(Math.random() * 40) + 1);
      render();
    });

    controls.querySelector('#vizDequeue').addEventListener('click', () => {
      if (queue.length > 0) queue.shift();
      render();
    });
  },

  renderRecursion(topic) {
    let step = 0;
    const treeSteps = [
      'fib(4)',
      'fib(4) ➔ fib(3) + fib(2)',
      'fib(3) ➔ fib(2) + fib(1) ; fib(2) ➔ fib(1) + fib(0)',
      'Base cases reached: fib(1)=1, fib(0)=0',
      'Unwinding: fib(2)=1, fib(3)=2, fib(4)=3'
    ];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Recursion Call Stack & Tree (fib(4))';

    const body = document.createElement('div');
    body.className = 'viz-tree';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Step</button>';

    this.container.append(label, body, controls);

    const render = () => {
      body.innerHTML = '';
      for (let i = 0; i <= step; i++) {
        const row = document.createElement('div');
        row.className = 'viz-tree-row';
        const node = document.createElement('div');
        node.className = 'viz-tree-node' + (i === step ? ' active' : '');
        node.textContent = treeSteps[i];
        row.appendChild(node);
        body.appendChild(row);
      }
      const btn = controls.querySelector('#vizStep');
      if (btn) btn.textContent = step < treeSteps.length - 1 ? 'Next Step' : 'Restart';
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      step = (step + 1) % treeSteps.length;
      render();
    });
  },

  renderSorting(topic) {
    let step = 0;
    const stages = [
      { desc: 'Initial Array', data: [64, 34, 25, 12, 22, 11, 90] },
      { desc: 'Divide: Split into halves', data: [34, 64, 25, 12, 22, 11, 90] },
      { desc: 'Merge & Sort subarrays', data: [25, 34, 64, 11, 12, 22, 90] },
      { desc: 'Final Merged Sorted Array', data: [11, 12, 22, 25, 34, 64, 90] }
    ];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Merge Sort Stages';

    const desc = document.createElement('div');
    desc.style.fontSize = '0.8125rem';
    desc.style.color = 'var(--text-secondary)';
    desc.style.marginBottom = '0.75rem';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Stage</button>';

    this.container.append(label, desc, row, controls);

    const render = () => {
      row.innerHTML = '';
      const cur = stages[step];
      desc.textContent = `${cur.desc} (${step + 1}/${stages.length})`;
      cur.data.forEach(val => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        if (step === stages.length - 1) el.classList.add('found');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      step = (step + 1) % stages.length;
      render();
    });
  },

  renderTrees(topic) {
    let activeNode = 0;
    const nodes = [
      { id: 0, val: 4, name: 'Root (4)' },
      { id: 1, val: 2, name: 'Left (2)' },
      { id: 2, val: 6, name: 'Right (6)' },
      { id: 3, val: 1, name: 'Left.Left (1)' },
      { id: 4, val: 3, name: 'Left.Right (3)' }
    ];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Binary Search Tree Traversal';

    const body = document.createElement('div');
    body.className = 'viz-tree';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Inorder Step</button>';

    this.container.append(label, body, controls);

    const render = () => {
      body.innerHTML = `
        <div class="viz-tree-row">
          <div class="viz-tree-node ${activeNode === 0 ? 'active' : ''}">4</div>
        </div>
        <div class="viz-tree-row">
          <div class="viz-tree-node ${activeNode === 1 ? 'active' : ''}">2</div>
          <div class="viz-tree-line">↙   ↘</div>
          <div class="viz-tree-node ${activeNode === 2 ? 'active' : ''}">6</div>
        </div>
        <div class="viz-tree-row">
          <div class="viz-tree-node ${activeNode === 3 ? 'active' : ''}">1</div>
          <div class="viz-tree-node ${activeNode === 4 ? 'active' : ''}">3</div>
        </div>
      `;
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      activeNode = (activeNode + 1) % nodes.length;
      render();
    });
  },

  renderGraphs(topic) {
    let visitedIdx = 0;
    const bfsOrder = [0, 1, 2, 3];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Graph BFS Traversal';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Visit Next Node</button>';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      [0, 1, 2, 3].forEach(node => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = `Node ${node}`;
        if (bfsOrder.slice(0, visitedIdx + 1).includes(node)) {
          el.classList.add('found');
        }
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      visitedIdx = (visitedIdx + 1) % bfsOrder.length;
      render();
    });
  },

  renderDynamicProgramming(topic) {
    let count = 3;
    const fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'DP Memoization Table (Fibonacci)';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Compute Next Cell</button>';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      fibs.slice(0, count).forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.innerHTML = `<span style="font-size:0.6rem;color:var(--text-muted);">dp[${i}]</span><span>${val}</span>`;
        if (i === count - 1) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      count = count < fibs.length ? count + 1 : 2;
      render();
    });
  },

  renderLinearRegression(topic) {
    let slope = 1.8;
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Linear Regression (y = mx + c Line Fit)';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.875rem;color:var(--text-primary);margin-bottom:0.75rem;">
        Model: ŷ = <span id="lrSlope">${slope.toFixed(2)}</span> · x + 2.50
      </div>
      <div style="color:var(--text-secondary);font-size:0.8125rem;">
        Mean Squared Error (MSE): <span id="lrMse" style="color:var(--sage);font-weight:700;">0.042</span>
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Adjust Gradient Step</button>';

    this.container.append(label, box, controls);

    controls.querySelector('#vizStep').addEventListener('click', () => {
      slope = slope === 1.8 ? 2.05 : (slope === 2.05 ? 1.95 : 1.8);
      const slopeEl = box.querySelector('#lrSlope');
      const mseEl = box.querySelector('#lrMse');
      if (slopeEl) slopeEl.textContent = slope.toFixed(2);
      if (mseEl) mseEl.textContent = (0.042 / (slope === 2.0 ? 2 : 1)).toFixed(3);
    });
  },

  renderLogisticRegression(topic) {
    let prob = 0.85;
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Logistic Regression (Sigmoid Curve Probability)';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.875rem;color:var(--text-primary);margin-bottom:0.5rem;">
        σ(z) = 1 / (1 + e⁻ᶻ) = <span id="logProb">${prob.toFixed(2)}</span>
      </div>
      <div style="font-size:0.8125rem;color:var(--sage);font-weight:600;" id="logClass">
        Decision: Class 1 (Positive Prediction)
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Toggle Input Vector</button>';

    this.container.append(label, box, controls);

    controls.querySelector('#vizStep').addEventListener('click', () => {
      prob = prob > 0.5 ? 0.22 : 0.85;
      const probEl = box.querySelector('#logProb');
      const classEl = box.querySelector('#logClass');
      if (probEl) probEl.textContent = prob.toFixed(2);
      if (classEl) {
        classEl.textContent = prob >= 0.5 ? 'Decision: Class 1 (Positive Prediction)' : 'Decision: Class 0 (Negative Prediction)';
        classEl.style.color = prob >= 0.5 ? 'var(--sage)' : 'var(--copper)';
      }
    });
  },

  renderClassification(topic) {
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Decision Boundary Classification';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div class="viz-array-row">
        <div class="viz-elem found" style="width:100px;">Class A [98%]</div>
        <div class="viz-elem" style="width:100px;opacity:0.4;">Class B [2%]</div>
      </div>
      <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.5rem;">
        Confidence Score: 0.982 · Threshold: 0.50
      </div>
    `;
    this.container.append(label, box);
  },

  renderKMeans(topic) {
    let kStep = 1;
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'K-Means Centroid Convergence (k=3)';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div class="viz-array-row">
        <div class="viz-elem active">Cluster 1 (Centroid μ₁)</div>
        <div class="viz-elem found">Cluster 2 (Centroid μ₂)</div>
        <div class="viz-elem" style="border-color:var(--copper)">Cluster 3 (Centroid μ₃)</div>
      </div>
      <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.75rem;" id="kmStatus">
        Iteration 1: Centroids initialized. Points assigned by Euclidean distance.
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Centroid Iteration</button>';

    this.container.append(label, box, controls);

    controls.querySelector('#vizStep').addEventListener('click', () => {
      kStep = (kStep % 3) + 1;
      const status = box.querySelector('#kmStatus');
      if (status) {
        status.textContent = `Iteration ${kStep}: Centroids recomputed to cluster means. Distance delta < 0.001.`;
      }
    });
  },

  renderNeuralNetworks(topic) {
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Multi-Layer Perceptron (Input → Hidden → Output)';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div class="viz-array-row">
        <div class="viz-elem">x₁ x₂ (Input)</div>
        <div class="viz-arrow">➔</div>
        <div class="viz-elem active">h₁ h₂ h₃ (ReLU)</div>
        <div class="viz-arrow">➔</div>
        <div class="viz-elem found">ŷ (Softmax)</div>
      </div>
      <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.75rem;">
        Forward Pass: a = σ(W · x + b)
      </div>
    `;
    this.container.append(label, box);
  },

  renderActivationFunctions(topic) {
    let fnName = 'ReLU';
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Activation Function Explorer';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.95rem;color:var(--text-primary);margin-bottom:0.5rem;" id="actFormula">
        f(x) = max(0, x)
      </div>
      <div style="font-size:0.8125rem;color:var(--text-secondary);" id="actDesc">
        ReLU: Eliminates vanishing gradient in positive domain. Fast to compute.
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Switch Function (Sigmoid / Tanh / ReLU)</button>';

    this.container.append(label, box, controls);

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (fnName === 'ReLU') {
        fnName = 'Sigmoid';
        box.querySelector('#actFormula').textContent = 'f(x) = 1 / (1 + e⁻ˣ)';
        box.querySelector('#actDesc').textContent = 'Sigmoid: Compresses inputs to (0, 1) probability range.';
      } else if (fnName === 'Sigmoid') {
        fnName = 'Tanh';
        box.querySelector('#actFormula').textContent = 'f(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)';
        box.querySelector('#actDesc').textContent = 'Tanh: Zero-centered output in (-1, 1) range.';
      } else {
        fnName = 'ReLU';
        box.querySelector('#actFormula').textContent = 'f(x) = max(0, x)';
        box.querySelector('#actDesc').textContent = 'ReLU: Eliminates vanishing gradient in positive domain.';
      }
    });
  },

  renderBackpropagation(topic) {
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Forward & Backpropagation Gradient Flow';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div class="viz-array-row">
        <div class="viz-elem">Forward: Loss = L(y, ŷ)</div>
      </div>
      <div class="viz-array-row" style="margin-top:0.5rem;">
        <div class="viz-elem active">Backward: ∂L/∂W = ∂L/∂a · ∂a/∂z · ∂z/∂W</div>
      </div>
    `;
    this.container.append(label, box);
  },

  renderOverfitting(topic) {
    let mode = 'Optimal';
    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Bias-Variance Tradeoff Explorer';

    const box = document.createElement('div');
    box.style.padding = '1rem 0';
    box.innerHTML = `
      <div class="viz-array-row">
        <div class="viz-elem found" id="ofTag">Balanced Fit (Degree 2)</div>
      </div>
      <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.5rem;" id="ofDesc">
        Optimal generalization: Low training error and low validation test error.
      </div>
    `;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Cycle Fit (Underfit / Balanced / Overfit)</button>';

    this.container.append(label, box, controls);

    controls.querySelector('#vizStep').addEventListener('click', () => {
      const tag = box.querySelector('#ofTag');
      const desc = box.querySelector('#ofDesc');
      if (mode === 'Optimal') {
        mode = 'Overfit';
        tag.className = 'viz-elem active';
        tag.textContent = 'Overfitting (Degree 6 Polynomial)';
        desc.textContent = 'High variance: Captures training noise, fails on unseen test data.';
      } else if (mode === 'Overfit') {
        mode = 'Underfit';
        tag.className = 'viz-elem';
        tag.textContent = 'Underfitting (Degree 1 Linear)';
        desc.textContent = 'High bias: Model is too simple to capture the underlying pattern.';
      } else {
        mode = 'Optimal';
        tag.className = 'viz-elem found';
        tag.textContent = 'Balanced Fit (Degree 2)';
        desc.textContent = 'Optimal generalization: Low training error and low test error.';
      }
    });
  }
};

// Main DOM Controller for library.html
document.addEventListener('DOMContentLoaded', () => {
  if (typeof ReadXAuth !== 'undefined' && !ReadXAuth.protectPage()) {
    return;
  }

  const browse = document.getElementById('libraryBrowse');
  const workspace = document.getElementById('libraryWorkspace');
  const grid = document.getElementById('libraryGrid');
  const empty = document.getElementById('libraryEmpty');
  const searchInput = document.getElementById('librarySearch');
  const filterTabs = document.getElementById('libraryFilters');

  let currentFilter = 'all';
  let searchQuery = '';
  let ttsSpeaking = false;
  let activeWorkspaceId = null;

  CodeEditor.init();
  Visualizer.init();

  function renderCards() {
    if (!grid) return;
    const items = ReadXData.library.filter(item => {
      const matchFilter = currentFilter === 'all' || item.category === currentFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        (item.subcategory || '').toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });

    grid.innerHTML = '';

    if (items.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    items.forEach(item => {
      const progress = ReadXData.getReadingProgress(item.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'content-card';
      card.dataset.topicId = item.id;

      const status = progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';
      const statusClass = progress >= 100 ? 'status-done' : progress > 0 ? 'status-active' : 'status-new';

      card.innerHTML = `
        <div class="content-card-meta">
          <span class="content-card-tag">${item.tag || item.subcategory || 'Topic'}</span>
          <span class="content-card-time">${item.readTime}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <div class="content-card-footer">
          <span class="content-card-status ${statusClass}">${status}</span>
          <span class="content-card-indicators">READ · CODE · PRACTICE</span>
        </div>
      `;

      card.addEventListener('click', () => openWorkspace(item.id));
      grid.appendChild(card);
    });
  }

  if (filterTabs) {
    filterTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter || 'all';
      renderCards();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCards();
    });
  }

  function openWorkspace(id) {
    const topic = ReadXData.getTopic(id);
    if (!topic || !topic.workspace) return;

    activeWorkspaceId = id;
    ReadXData.markTopicVisited(id);
    ReadXData.setReadingProgress(id, 100);
    ReadXData.startReadingSession(id, topic.title, 400);

    const catEl = document.getElementById('wsCategory');
    if (catEl) catEl.textContent = topic.category;

    const subCatEl = document.getElementById('wsSubcategory');
    if (subCatEl) subCatEl.textContent = topic.subcategory || topic.tag;

    const titleEl = document.getElementById('wsTitle');
    if (titleEl) {
      titleEl.textContent = topic.title;
      // Expose topic ID on the element so notes.js can read it as a reliable fallback
      titleEl.dataset.topicId = id;
    }

    const summaryEl = document.getElementById('wsSummary');
    if (summaryEl) summaryEl.textContent = topic.desc;

    const complexityEl = document.getElementById('wsComplexity');
    if (complexityEl) {
      if (topic.workspace.complexity) {
        complexityEl.innerHTML = `<strong>Complexity:</strong> ${topic.workspace.complexity}`;
        complexityEl.style.display = 'block';
      } else {
        complexityEl.innerHTML = '';
        complexityEl.style.display = 'none';
      }
    }

    const contentEl = document.getElementById('wsContent');
    if (contentEl) {
      contentEl.innerHTML = topic.workspace.sections.map(s => `
        <section class="ws-section">
          <h3>${s.heading}</h3>
          <p>${s.body}</p>
        </section>
      `).join('');
      chunkSentences(contentEl);
      if (window.ReadXNotes && typeof window.ReadXNotes.updateButtons === 'function') {
        window.ReadXNotes.updateButtons();
      }
    }

    CodeEditor.setTopic(id);

    // Always reset Visualize panel before rendering
    const vizPanel = document.getElementById('visualVisualize');
    const videoPanel = document.getElementById('visualVideo');
    const vizTab = document.querySelector('.ws-visual-tab[data-tab="visualize"]');
    if (vizPanel && videoPanel && vizTab) {
      videoPanel.hidden = true;
      videoPanel.classList.remove('ws-visual-panel--active');
      vizPanel.hidden = false;
      vizPanel.classList.add('ws-visual-panel--active');
      document.querySelectorAll('.ws-visual-tab').forEach(t => t.classList.remove('active'));
      vizTab.classList.add('active');
    }

    // Render visualization AFTER the panel is visible so container has dimensions
    Visualizer.render(id);

    const practiceLink = document.getElementById('wsPracticeLink');
    if (practiceLink) {
      practiceLink.href = topic.workspace.practiceLink || `practice.html?topic=${id}`;
    }

    // Previous / Next topic navigation
    const allTopics = ReadXData.library;
    const currentIndex = allTopics.findIndex(t => t.id === id);
    const prevBtn = document.getElementById('wsPrevTopic');
    const nextBtn = document.getElementById('wsNextTopic');
    if (prevBtn) {
      prevBtn.disabled = currentIndex <= 0;
      prevBtn.onclick = () => { if (currentIndex > 0) openWorkspace(allTopics[currentIndex - 1].id); };
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex >= allTopics.length - 1;
      nextBtn.onclick = () => { if (currentIndex < allTopics.length - 1) openWorkspace(allTopics[currentIndex + 1].id); };
    }

    if (browse) browse.hidden = true;
    if (workspace) workspace.hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL — notes.js reads this to bind the correct topic key
    history.replaceState({ workspace: id }, '', `?topic=${id}`);
  }

  function closeWorkspace() {
    if (workspace) workspace.hidden = true;
    if (browse) browse.hidden = false;

    if ('speechSynthesis' in window) speechSynthesis.cancel();
    ttsSpeaking = false;

    const ttsBtn = document.getElementById('wsToggleTTS');
    if (ttsBtn) ttsBtn.classList.remove('active');

    if (activeWorkspaceId) {
      ReadXData.endReadingSession(activeWorkspaceId, 400);
      activeWorkspaceId = null;
    }

    history.replaceState(null, '', 'library.html');
    renderCards();
  }

  const backBtn = document.getElementById('wsBack');
  if (backBtn) backBtn.addEventListener('click', closeWorkspace);

  // Visual tab switcher
  document.querySelectorAll('.ws-visual-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ws-visual-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      const videoPanel = document.getElementById('visualVideo');
      const vizPanel = document.getElementById('visualVisualize');
      if (videoPanel) {
        videoPanel.hidden = target !== 'video';
        videoPanel.classList.toggle('ws-visual-panel--active', target === 'video');
      }
      if (vizPanel) {
        vizPanel.hidden = target !== 'visualize';
        vizPanel.classList.toggle('ws-visual-panel--active', target === 'visualize');
      }
    });
  });

  // ReadX Mode toggle
  const toggleReadXBtn = document.getElementById('wsToggleReadX');
  if (toggleReadXBtn) {
    toggleReadXBtn.addEventListener('click', () => {
      const comfortBtn = document.getElementById('comfortModeBtn');
      if (comfortBtn) {
        comfortBtn.click();
      } else {
        document.body.classList.toggle('dyslexia-mode');
      }
      toggleReadXBtn.classList.toggle('active', document.body.classList.contains('dyslexia-mode'));
    });
  }

  // Linear Focus Mode toggle
  const toggleFocusBtn = document.getElementById('wsToggleFocus');
  if (toggleFocusBtn) {
    toggleFocusBtn.addEventListener('click', () => {
      const settings = typeof App !== 'undefined' ? App.getSettings() : { readingFocus: false };
      settings.readingFocus = !settings.readingFocus;
      if (typeof App !== 'undefined') App.saveSettings(settings);

      document.body.setAttribute('data-focus', settings.readingFocus ? 'on' : 'off');
      toggleFocusBtn.classList.toggle('active', settings.readingFocus);

      const focusCheck = document.getElementById('setFocusMode');
      if (focusCheck) focusCheck.checked = settings.readingFocus;
    });
  }

  // Read Aloud (TTS) with sentence highlighting
  const toggleTtsBtn = document.getElementById('wsToggleTTS');
  if (toggleTtsBtn) {
    toggleTtsBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) return;
      const sentences = document.querySelectorAll('#wsContent .sentence');

      if (ttsSpeaking) {
        speechSynthesis.cancel();
        ttsSpeaking = false;
        toggleTtsBtn.classList.remove('active');
        sentences.forEach(s => s.classList.remove('tts-active'));
        return;
      }

      const texts = Array.from(sentences).map(s => s.textContent.trim()).filter(Boolean);
      if (!texts.length) return;

      speechSynthesis.cancel();
      ttsSpeaking = true;
      toggleTtsBtn.classList.add('active');
      let idx = 0;

      function speakNext() {
        if (idx >= texts.length || !ttsSpeaking) {
          ttsSpeaking = false;
          toggleTtsBtn.classList.remove('active');
          sentences.forEach(s => s.classList.remove('tts-active'));
          return;
        }
        sentences.forEach(s => s.classList.remove('tts-active'));
        if (sentences[idx]) {
          sentences[idx].classList.add('tts-active');
        }

        const utt = new SpeechSynthesisUtterance(texts[idx]);
        utt.rate = 0.95;
        utt.onend = () => {
          idx++;
          speakNext();
        };
        utt.onerror = () => {
          if (ttsSpeaking) {
            idx++;
            speakNext();
          }
        };
        speechSynthesis.speak(utt);
      }
      speakNext();
    });
  }

  function chunkSentences(container) {
    container.querySelectorAll('p').forEach(p => {
      const text = p.textContent;
      const parts = text.match(/[^.!?]+[.!?]+/g) || [text];
      p.innerHTML = parts.map(s => `<span class="sentence">${s.trim()} </span>`).join('');
    });
  }

  window.addEventListener('popstate', (e) => {
    if (e.state?.workspace) openWorkspace(e.state.workspace);
    else closeWorkspace();
  });

  const topicParam = new URLSearchParams(window.location.search).get('topic');
  renderCards();
  if (topicParam && ReadXData.getTopic(topicParam)) {
    openWorkspace(topicParam);
  }
});
