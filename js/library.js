// js/library.js — library browse + in-page topic workspace

// Syntax highlighting for Python
function highlightPython(code) {
  return code
    .replace(/(#.*)$/gm, '<span class="cmt">$1</span>')
    .replace(/\b(def|return|if|elif|else|for|while|in|not|and|or|import|from|class|None|True|False|print)\b/g, '<span class="kw">$1</span>')
    .replace(/\b([a-z_][a-z0-9_]*)\s*(?=\()/gi, '<span class="fn">$1</span>')
    .replace(/(".*?"|'.*?')/g, '<span class="str">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
}

// Syntax highlighting for Java / C++
function highlightJavaCpp(code) {
  const kwPattern = /\b(int|double|float|char|boolean|void|main|public|private|protected|static|final|class|import|package|new|return|if|else|for|while|do|switch|case|break|continue|default|interface|extends|implements|enum|throw|try|catch|finally|abstract|native|strictfp|synchronized|transient|volatile|long|short|byte|true|false|null|System|std|cout|cin|endl|vector|string|map|set|list|queue|stack|deque|pair|auto|const|sizeof|this|operator)\b/g;

  return code
    .replace(/\/\*[\s\S]*?\*\//gm, '<span class="cmt">/*$1*/</span>')
    .replace(/\/\/.*$/gm, '<span class="cmt">//$1</span>')
    .replace(/\/#.*$/gm, '<span class="cmt">//$1</span>')
    .replace(/"(?:[^"\\]|\\.)*"/g, '<span class="str">$1</span>')
    .replace(/'[^'\\]|\\.'/g, '<span class="str">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>')
    .replace(kwPattern, '<span class="kw">$1</span>')
    .replace(/\b(System\.out\.print|System\.out\.printf|System\.out\.println|std::cout|std::cin|std::endl|System\.out)\b/g, '<span class="fn">$1</span>');
}

// CodeEditor module — manages the overlay textarea + highlighted backdrop + line numbers
const CodeEditor = {
  currentTopicId: null,
  currentLang: 'java',

  init() {
    const textarea = document.getElementById('codeTextarea');
    const backdrop = document.getElementById('codeHighlight');
    const gutter = document.getElementById('codeGutter');

    if (!textarea || !backdrop || !gutter) return;

    textarea.addEventListener('input', this.syncScroll.bind(this));
    textarea.addEventListener('scroll', this.syncScroll.bind(this));

    document.getElementById('wsCopyBtn').addEventListener('click', () => this.copy());
    document.getElementById('wsRunCode').addEventListener('click', () => this.run());

    document.querySelectorAll('.ws-code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentLang = tab.dataset.lang;
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

    document.getElementById('wsInput').textContent = code.input || '';
    document.getElementById('wsOutput').textContent = 'Click Run to execute.';
    document.getElementById('wsOutput').classList.remove('running');
  },

  escapeHtml(text) {
    return text
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
    const topic = ReadXData.getTopic(this.currentTopicId);
    if (!topic) return;
    const code = topic.workspace.code;
    const source = code[this.currentLang] || code.source || '';

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
    outputEl.textContent = 'Running…';

    const topic = ReadXData.getTopic(this.currentTopicId);
    const code = topic?.workspace?.code;

    setTimeout(() => {
      outputEl.classList.remove('running');
      outputEl.textContent = code?.output || 'Execution complete.';
    }, 600);
  }
};

// Visualizer module — renders interactive DSA visualizations
const Visualizer = {
  container: null,

  init() {
    this.container = document.getElementById('vizContainer');
  },

  render(topicId) {
    if (!this.container) return;
    const topic = ReadXData.getTopic(topicId);
    if (!topic || !topic.workspace) return;

    const vizType = topic.workspace.code?.viz;
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
      'dynamic-programming': this.renderDynamicProgramming.bind(this)
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
          Interactive visualization coming soon for this topic.
        </p>
      </div>
    `;
  },

  renderBinarySearch(topic) {
    const arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const target = 23;
    let low = 0, high = arr.length - 1;
    let step = 0;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Step</button>';

    const legend = document.createElement('div');
    legend.className = 'viz-legend';
    legend.innerHTML = '<span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--text-primary)"></span> Current</span><span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--copper)"></span> Mid</span><span class="viz-legend-item"><span class="viz-legend-dot" style="background:var(--sage)"></span> Found</span>';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Searching for ' + target;

    this.container.append(label, legend, row);
    this.container.appendChild(controls);

    const render = () => {
      row.innerHTML = '';
      const mid = Math.floor((low + high) / 2);
      arr.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        if (i === mid) el.classList.add('active');
        if (val === target) el.classList.add('found');
        if (i < low || i > high) el.style.opacity = '0.4';
        if (i === low) el.style.borderColor = 'var(--copper)';
        if (i === high) el.style.borderColor = 'var(--text-muted)';
        row.appendChild(el);
      });

      controls.querySelector('#vizStep').textContent = step < 3 ? 'Next Step' : 'Restart';
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (low > high) {
        low = 0; high = arr.length - 1; step = 0;
        render();
        return;
      }
      const mid = Math.floor((low + high) / 2);
      if (arr[mid] === target) {
        step++;
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
    let sorted = false;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Find Max</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Array elements';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      arr.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        if (i === highlightIdx) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (highlightIdx < arr.length - 1) {
        highlightIdx++;
        render();
      } else {
        highlightIdx = 0;
        sorted = !sorted;
        const display = sorted ? [...arr].sort((a, b) => a - b) : arr;
        arr.sort((a, b) => a - b);
        highlightIdx = 0;
        render();
      }
    });
  },

  renderLinkedLists(topic) {
    const values = [10, 23, 42, 56, 78];
    let reversed = false;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Reverse</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Linked List';

    const ll = document.createElement('div');
    ll.className = 'viz-linkedlist';

    this.container.append(label, ll, controls);

    const render = () => {
      const display = reversed ? [...values].reverse() : values;
      ll.innerHTML = '';
      display.forEach((val, i) => {
        const node = document.createElement('div');
        node.className = 'viz-node';
        const rect = document.createElement('div');
        rect.className = 'viz-node-rect' + (i === 0 ? ' active' : '');
        rect.textContent = val;
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
          nil.style.padding = '0.25rem 0.5rem';
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
    const items = [3, 7, 1, 9, 4];
    const stack = [];

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizPush">Push</button><button class="btn btn-sm btn-outline" id="vizPop">Pop</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Stack (LIFO)';

    const container = document.createElement('div');
    container.className = 'viz-stack';

    this.container.append(label, container, controls);

    const render = () => {
      container.innerHTML = '';
      if (stack.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem;">Stack is empty</div>';
        return;
      }
      for (let i = stack.length - 1; i >= 0; i--) {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(stack[i]);
        if (i === stack.length - 1) el.classList.add('active');
        container.appendChild(el);
      }
    };

    render();

    controls.querySelector('#vizPush').addEventListener('click', () => {
      if (items.length > 0) {
        stack.push(items.shift());
        render();
      }
    });

    controls.querySelector('#vizPop').addEventListener('click', () => {
      stack.pop();
      render();
    });
  },

  renderQueue(topic) {
    const items = [5, 2, 8, 1, 9];
    const queue = [];

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizEnqueue">Enqueue</button><button class="btn btn-sm btn-outline" id="vizDequeue">Dequeue</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Queue (FIFO)';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      if (queue.length === 0) {
        row.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem;">Queue is empty</div>';
        return;
      }
      queue.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        if (i === 0) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizEnqueue').addEventListener('click', () => {
      if (items.length > 0) {
        queue.push(items.shift());
        render();
      }
    });

    controls.querySelector('#vizDequeue').addEventListener('click', () => {
      queue.shift();
      render();
    });
  },

  renderRecursion(topic) {
    const n = 7;
    const steps = [];
    for (let i = 0; i <= n; i++) steps.push(`fib(${i}) = ${this.fib(i)}`);

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Step Through</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Fibonacci Recursion Tree (n=7)';

    const body = document.createElement('div');
    body.className = 'viz-tree';

    this.container.append(label, body, controls);

    let step = 0;
    const render = () => {
      body.innerHTML = '';
      for (let i = 0; i <= step && i <= n; i++) {
        const item = document.createElement('div');
        item.className = 'viz-tree-row';
        const node = document.createElement('div');
        node.className = 'viz-tree-node active';
        node.textContent = steps[i];
        item.appendChild(node);
        body.appendChild(item);
      }
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (step < n) step++;
      else step = 0;
      render();
    });
  },

  fib(n) {
    if (n <= 1) return n;
    return this.fib(n - 1) + this.fib(n - 2);
  },

  renderSorting(topic) {
    const arr = [64, 34, 25, 12, 22, 11, 90];
    const display = [...arr].sort((a, b) => a - b);
    let step = 0;
    const phases = ['Initial: [64, 34, 25, 12, 22, 11, 90]', 'Merge: [34, 64, 25, 12, 22, 11, 90]', 'Merge: [25, 34, 64, 12, 22, 11, 90]', 'Sorted: [12, 11, 22, 25, 34, 64, 90]', 'Final: [11, 12, 22, 25, 34, 64, 90]'];

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Step</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Merge Sort Visualization';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    const desc = document.createElement('div');
    desc.style.fontSize = '0.8125rem';
    desc.style.color = 'var(--text-secondary)';
    desc.style.marginBottom = '1rem';

    this.container.append(label, desc, row, controls);

    const render = () => {
      row.innerHTML = '';
      const currentPhase = phases[step];
      const nums = currentPhase.match(/\[([\d,\s]+)\]/)[1].split(',').map(s => parseInt(s.trim()));
      desc.textContent = currentPhase;
      nums.forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = String(val);
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      step = (step + 1) % phases.length;
      render();
    });
  },

  renderTrees(topic) {
    const tree = [4, 2, 6, 1, 3];
    const order = [];
    const labels = ['Root', 'Left', 'Right', 'Left.Left', 'Left.Right'];

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Inorder Traversal</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Binary Tree';

    const body = document.createElement('div');
    body.className = 'viz-tree';

    this.container.append(label, body, controls);

    let step = 0;
    const render = () => {
      body.innerHTML = '';
      const top = document.createElement('div');
      top.className = 'viz-tree-row';
      const root = document.createElement('div');
      root.className = 'viz-tree-node' + (step >= 1 ? ' active' : '');
      root.textContent = tree[0];
      top.appendChild(root);
      body.appendChild(top);

      const mid = document.createElement('div');
      mid.className = 'viz-tree-row';
      const l = document.createElement('div');
      l.className = 'viz-tree-node' + (step >= 2 ? ' active' : '');
      l.textContent = tree[1];
      const r = document.createElement('div');
      r.className = 'viz-tree-node' + (step >= 3 ? ' active' : '');
      r.textContent = tree[2];
      const line = document.createElement('div');
      line.className = 'viz-tree-line';
      line.textContent = '↙     ↘';
      mid.appendChild(l);
      mid.appendChild(line);
      mid.appendChild(r);
      body.appendChild(mid);

      const bottom = document.createElement('div');
      bottom.className = 'viz-tree-row';
      const ll = document.createElement('div');
      ll.className = 'viz-tree-node' + (step >= 4 ? ' active' : '');
      ll.textContent = tree[3];
      const lr = document.createElement('div');
      lr.className = 'viz-tree-node' + (step >= 5 ? ' active' : '');
      lr.textContent = tree[4];
      bottom.appendChild(ll);
      bottom.appendChild(lr);
      body.appendChild(bottom);
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (step < 5) step++;
      else step = 0;
      render();
    });
  },

  renderGraphs(topic) {
    const nodes = [0, 1, 2, 3];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3]];
    const traversal = [0, 1, 2, 3];
    let visited = [];

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">BFS Step</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Graph (BFS Traversal)';

    const body = document.createElement('div');
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.alignItems = 'center';
    body.style.gap = '1rem';

    this.container.append(label, body, controls);

    const render = () => {
      body.innerHTML = '';
      const row = document.createElement('div');
      row.className = 'viz-array-row';
      nodes.forEach(val => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.textContent = `Node ${val}`;
        if (visited.includes(val)) el.classList.add('active');
        if (visited.includes(val)) el.style.background = 'var(--sage)';
        if (visited.includes(val)) el.style.color = 'var(--surface-primary)';
        row.appendChild(el);
      });
      body.appendChild(row);

      const edgeLabel = document.createElement('div');
      edgeLabel.className = 'viz-label';
      let edgeText = edges.map(e => `${e[0]}→${e[1]}`).join(', ');
      edgeLabel.textContent = 'Edges: ' + edgeText;
      body.appendChild(edgeLabel);
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (visited.length < traversal.length) {
        visited.push(traversal[visited.length]);
        render();
      } else {
        visited = [];
        render();
      }
    });
  },

  renderDynamicProgramming(topic) {
    const n = 10;
    const fibValues = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    let computed = 0;

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    controls.innerHTML = '<button class="btn btn-sm btn-outline" id="vizStep">Next Fib</button>';

    const label = document.createElement('div');
    label.className = 'viz-label';
    label.textContent = 'Fibonacci with Memoization (n=10)';

    const row = document.createElement('div');
    row.className = 'viz-array-row';

    this.container.append(label, row, controls);

    const render = () => {
      row.innerHTML = '';
      fibValues.slice(0, computed + 1).forEach((val, i) => {
        const el = document.createElement('div');
        el.className = 'viz-elem';
        el.innerHTML = `<div style="font-size:0.65rem;color:var(--text-muted);">fib(${i})</div><div>${val}</div>`;
        if (i === computed) el.classList.add('active');
        row.appendChild(el);
      });
    };

    render();

    controls.querySelector('#vizStep').addEventListener('click', () => {
      if (computed < fibValues.length - 1) {
        computed++;
        render();
      } else {
        computed = 0;
        render();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Protect page: require login
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

  CodeEditor.init();
  Visualizer.init();

  function renderCards() {
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
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

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

  filterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderCards();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCards();
  });

  function openWorkspace(id) {
    const topic = ReadXData.getTopic(id);
    if (!topic || !topic.workspace) return;

    ReadXData.markTopicVisited(id);
    ReadXData.setReadingProgress(id, 100);

    document.getElementById('wsCategory').textContent = topic.category;
    document.getElementById('wsSubcategory').textContent = topic.subcategory || topic.tag;
    document.getElementById('wsTitle').textContent = topic.title;
    document.getElementById('wsSummary').textContent = topic.desc;

    const complexityEl = document.getElementById('wsComplexity');
    if (complexityEl && topic.workspace.complexity) {
      complexityEl.innerHTML = `<strong>Complexity:</strong> ${topic.workspace.complexity}`;
    } else if (complexityEl) {
      complexityEl.innerHTML = '';
    }

    const contentEl = document.getElementById('wsContent');
    contentEl.innerHTML = topic.workspace.sections.map(s => `
      <section class="ws-section">
        <h3>${s.heading}</h3>
        <p>${s.body}</p>
      </section>
    `).join('');

    chunkSentences(contentEl);

    CodeEditor.setTopic(id);
    Visualizer.render(id);

    // Switch visual tab to "visualize" by default if available
    const vizPanel = document.getElementById('visualVisualize');
    const videoPanel = document.getElementById('visualVideo');
    const vizTab = document.querySelector('.ws-visual-tab[data-tab="visualize"]');
    if (topic.workspace.code?.viz && vizPanel && videoPanel && vizTab) {
      videoPanel.hidden = true;
      videoPanel.classList.remove('ws-visual-panel--active');
      vizPanel.hidden = false;
      vizPanel.classList.add('ws-visual-panel--active');
      document.querySelectorAll('.ws-visual-tab').forEach(t => t.classList.remove('active'));
      vizTab.classList.add('active');
    }

    document.getElementById('wsPracticeLink').href = topic.workspace.practiceLink || `practice.html?topic=${id}`;

    browse.hidden = true;
    workspace.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState({ workspace: id }, '', `?topic=${id}`);
  }

  function closeWorkspace() {
    workspace.hidden = true;
    browse.hidden = false;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    ttsSpeaking = false;
    history.replaceState(null, '', 'library.html');
    renderCards();
  }

  document.getElementById('wsBack').addEventListener('click', closeWorkspace);

  // Visual tab switching (Video / Visualize)
  document.querySelectorAll('.ws-visual-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ws-visual-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('visualVideo').hidden = target !== 'video';
      document.getElementById('visualVideo').classList.toggle('ws-visual-panel--active', target === 'video');
      document.getElementById('visualVisualize').hidden = target !== 'visualize';
      document.getElementById('visualVisualize').classList.toggle('ws-visual-panel--active', target === 'visualize');
    });
  });

  document.getElementById('wsToggleReadX').addEventListener('click', () => {
    const btn = document.getElementById('comfortModeBtn');
    if (btn) btn.click();
    document.getElementById('wsToggleReadX').classList.toggle('active',
      document.body.classList.contains('dyslexia-mode'));
  });

  document.getElementById('wsToggleFocus').addEventListener('click', () => {
    const settings = App.getSettings();
    settings.readingFocus = !settings.readingFocus;
    App.saveSettings(settings);
    document.body.setAttribute('data-focus', settings.readingFocus ? 'on' : 'off');
    document.getElementById('wsToggleFocus').classList.toggle('active', settings.readingFocus);
    const focusCheck = document.getElementById('setFocusMode');
    if (focusCheck) focusCheck.checked = settings.readingFocus;
  });

  document.getElementById('wsToggleTTS').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    const btn = document.getElementById('wsToggleTTS');
    const sentences = document.querySelectorAll('#wsContent .sentence');

    if (ttsSpeaking) {
      speechSynthesis.cancel();
      ttsSpeaking = false;
      btn.classList.remove('active');
      sentences.forEach(s => s.classList.remove('tts-active'));
      return;
    }

    const texts = Array.from(sentences).map(s => s.textContent);
    if (!texts.length) return;

    ttsSpeaking = true;
    btn.classList.add('active');
    let idx = 0;

    function speakNext() {
      if (idx >= texts.length || !ttsSpeaking) {
        ttsSpeaking = false;
        btn.classList.remove('active');
        return;
      }
      sentences.forEach(s => s.classList.remove('tts-active'));
      sentences[idx]?.classList.add('tts-active');
      const utt = new SpeechSynthesisUtterance(texts[idx]);
      utt.onend = () => { idx++; speakNext(); };
      speechSynthesis.speak(utt);
    }
    speakNext();
  });

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
  if (topicParam && ReadXData.getTopic(topicParam)) openWorkspace(topicParam);
});
