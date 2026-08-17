// js/main.js

const ReadingAssist = {
  sentences: [],
  
  init() {
    this.isReadingPage = !!document.querySelector('.reading-article');
    
    if (this.isReadingPage) {
      this.chunkText();
      this.initRuler();
      this.initSentenceFocus();
      this.initFocusHighlight();
      this.injectTTSControls();
      this.initProgress();
    }
  },

  chunkText() {
    const contentAreas = document.querySelectorAll('.reading-content');
    contentAreas.forEach(area => {
      if (area.dataset.chunked === 'true') return;
      area.dataset.chunked = 'true';
      
      const paragraphs = area.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.innerHTML;
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        let newHTML = '';
        sentences.forEach(s => {
          if(s.trim().length > 0) {
            newHTML += `<span class="sentence">${s}</span> `;
          }
        });
        p.innerHTML = newHTML;
      });
    });

    this.sentences = Array.from(document.querySelectorAll('.reading-content .sentence'));
  },

  initRuler() {
    const ruler = document.createElement('div');
    ruler.className = 'reading-ruler';
    ruler.innerHTML = '<div class="ruler-band" id="rulerBand"></div>';
    document.body.appendChild(ruler);

    const band = document.getElementById('rulerBand');
    
    document.addEventListener('mousemove', (e) => {
      if (document.body.classList.contains('dyslexia-mode') && document.body.getAttribute('data-focus') === 'on') {
        document.body.classList.add('ruler-active');
        band.style.top = e.clientY + 'px';
      } else {
        document.body.classList.remove('ruler-active');
      }
    });

    document.addEventListener('touchstart', (e) => {
      if (document.body.classList.contains('dyslexia-mode') && document.body.getAttribute('data-focus') === 'on') {
        document.body.classList.add('ruler-active');
        band.style.top = e.touches[0].clientY + 'px';
      }
    });
  },

  initSentenceFocus() {
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('dyslexia-mode')) return;
      
      const sentence = e.target.closest('.sentence');
      if (sentence) {
        const wasFocused = sentence.classList.contains('focused');
        this.sentences.forEach(s => s.classList.remove('focused'));
        
        if (!wasFocused) {
          sentence.classList.add('focused');
          document.body.classList.add('sentence-focus-active');

          // If Read Aloud is running, continue from the newly active sentence
          if (this.tts && this.tts.isActive()) {
            const idx = this.sentences.indexOf(sentence);
            if (idx !== -1) this.tts.readFrom(idx);
          }
        } else {
          document.body.classList.remove('sentence-focus-active');
        }
      } else {
        this.sentences.forEach(s => s.classList.remove('focused'));
        document.body.classList.remove('sentence-focus-active');
      }

      this.updateFocusBar();
    });
  },

  initFocusHighlight() {
    const bar = document.createElement('div');
    bar.className = 'focus-highlight';
    bar.id = 'focusHighlight';
    document.body.appendChild(bar);
    this.focusBar = bar;

    let scrollTimer = null;
    const reposition = () => {
      const focused = this.sentences.find(s => s.classList.contains('focused'));
      if (focused) this.setFocusBarPos(focused);
    };

    window.addEventListener('scroll', () => {
      if (!this.focusBar || !this.focusBar.classList.contains('visible')) return;
      this.focusBar.classList.add('scrolling');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (this.focusBar) this.focusBar.classList.remove('scrolling');
      }, 120);
      requestAnimationFrame(reposition);
    }, { passive: true });

    window.addEventListener('resize', () => requestAnimationFrame(() => this.updateFocusBar()));
  },

  setFocusBarPos(sentence) {
    const bar = this.focusBar;
    if (!bar || !sentence) return;
    const rect = sentence.getBoundingClientRect();
    const gap = 10; // 8-12px gap between sentence and its highlight bar
    bar.style.top = (rect.bottom + gap) + 'px';
    bar.style.left = rect.left + 'px';
    bar.style.width = rect.width + 'px';
  },

  updateFocusBar() {
    const bar = this.focusBar;
    if (!bar) return;
    bar.classList.remove('scrolling');

    const inFocusMode = document.body.classList.contains('dyslexia-mode') &&
      document.body.getAttribute('data-focus') === 'on' &&
      document.body.classList.contains('sentence-focus-active');
    const focused = this.sentences.find(s => s.classList.contains('focused'));

    if (!inFocusMode || !focused) {
      bar.classList.remove('visible');
      return;
    }

    if (!bar.classList.contains('visible')) {
      // Appear already in place — no transition from the corner on first show
      bar.style.transition = 'none';
      this.setFocusBarPos(focused);
      void bar.offsetWidth;
      bar.style.transition = '';
      bar.classList.add('visible');
    } else {
      // Animate smoothly to the newly active sentence
      this.setFocusBarPos(focused);
    }
  },

  injectTTSControls() {
    const header = document.querySelector('.reading-article header');
    if (!header) return;

    const ttsHTML = `
      <div class="tts-controls-container" id="ttsControls">
        <button class="tts-btn" id="btnToggleTTS">▶ Read Aloud</button>
        <button class="tts-btn" id="btnStopTTS" style="display:none">■ Stop</button>
        <div style="width:1px; height:16px; background:var(--border-color); margin: 0 4px;"></div>
        <select class="tts-select" id="ttsSpeed">
          <option value="0.75">0.75x</option>
          <option value="1" selected>1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
        </select>
        <span class="tts-timer" id="ttsTimer">0:00 / 0:00</span>
        <div class="tts-progress-track" id="ttsProgressTrack" aria-hidden="true">
          <div class="tts-progress-fill" id="ttsProgressFill"></div>
        </div>
      </div>
    `;

    header.insertAdjacentHTML('afterend', ttsHTML);

    this.bindTTS();
  },

  bindTTS() {
    const btnToggle = document.getElementById('btnToggleTTS');
    const btnStop = document.getElementById('btnStopTTS');
    const speedSelect = document.getElementById('ttsSpeed');
    const timerEl = document.getElementById('ttsTimer');
    const trackEl = document.getElementById('ttsProgressTrack');
    const fillEl = document.getElementById('ttsProgressFill');

    if (!('speechSynthesis' in window)) {
      btnToggle.textContent = "TTS Not Supported";
      btnToggle.disabled = true;
      return;
    }

    const CHARS_PER_SEC = 14;

    const controller = this.tts = {
      currentIndex: 0,
      isSpeaking: false,
      isPaused: false,
      elapsedMs: 0,
      totalMs: 0,
      durations: [],
      tickTimer: null,
      lastTick: 0,

      estimateMs(text, rate) {
        return Math.max(800, (text.length / (CHARS_PER_SEC * (rate || 1))) * 1000);
      },

      computeDurations() {
        const rate = parseFloat(speedSelect.value) || 1;
        this.durations = this.sentences.map(s => this.estimateMs(s.innerText, rate));
        this.totalMs = this.durations.reduce((a, b) => a + b, 0);
      },

      fmt(ms) {
        const s = Math.max(0, Math.floor(ms / 1000));
        return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      },

      updateUI() {
        const pct = this.totalMs ? Math.min(100, (this.elapsedMs / this.totalMs) * 100) : 0;
        fillEl.style.width = pct + '%';
        timerEl.textContent = this.fmt(this.elapsedMs) + ' / ' + this.fmt(this.totalMs);
        btnToggle.textContent = (this.isSpeaking && !this.isPaused) ? '⏸ Pause' : '▶ Read Aloud';
        btnStop.style.display = this.isSpeaking ? 'flex' : 'none';
        if (this.isSpeaking) trackEl.classList.add('visible');
      },

      startTicking() {
        if (this.tickTimer) return;
        this.lastTick = performance.now();
        this.tickTimer = setInterval(() => {
          if (!this.isSpeaking || this.isPaused) return;
          const now = performance.now();
          this.elapsedMs += now - this.lastTick;
          this.lastTick = now;
          if (this.elapsedMs >= this.totalMs) this.elapsedMs = this.totalMs;
          this.updateUI();
        }, 200);
      },

      stopTicking() {
        if (this.tickTimer) {
          clearInterval(this.tickTimer);
          this.tickTimer = null;
        }
      },

      clearHighlights() {
        this.sentences.forEach(s => s.classList.remove('tts-active'));
      },

      playSentence(index) {
        if (!this.isSpeaking) return;
        if (index >= this.sentences.length) {
          this.stop();
          return;
        }

        this.currentIndex = index;
        const el = this.sentences[index];
        const text = el.innerText;
        const utterance = this.utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(speedSelect.value) || 1;

        this.clearHighlights();
        el.classList.add('tts-active');

        const rect = el.getBoundingClientRect();
        if (rect.bottom > window.innerHeight || rect.top < 100) {
          window.scrollBy({ top: rect.top - 200, behavior: 'smooth' });
        }

        utterance.onend = () => {
          if (this.isSpeaking) {
            this.currentIndex++;
            this.playSentence(this.currentIndex);
          }
        };

        utterance.onerror = () => {
          if (this.isSpeaking) this.stop();
        };

        speechSynthesis.speak(utterance);
      },

      start() {
        speechSynthesis.cancel();
        this.clearHighlights();
        this.computeDurations();
        this.isSpeaking = true;
        this.isPaused = false;

        const focusedIndex = this.sentences.findIndex(s => s.classList.contains('focused'));
        if (focusedIndex !== -1) {
          this.currentIndex = focusedIndex;
          this.elapsedMs = 0;
        } else {
          this.currentIndex = 0;
          this.elapsedMs = 0;
        }

        this.startTicking();
        this.updateUI();
        this.playSentence(this.currentIndex);
      },

      // Continue from the newly active sentence while already reading
      readFrom(index) {
        if (!this.isSpeaking) return;
        speechSynthesis.cancel();
        this.clearHighlights();
        this.currentIndex = index;
        this.playSentence(this.currentIndex);
      },

      pause() {
        if (!this.isSpeaking || this.isPaused) return;
        speechSynthesis.pause();
        this.isPaused = true;
        this.stopTicking();
        this.updateUI();
      },

      resume() {
        if (!this.isSpeaking || !this.isPaused) return;
        speechSynthesis.resume();
        this.isPaused = false;
        this.lastTick = performance.now();
        this.startTicking();
        this.updateUI();
      },

      toggle() {
        if (!this.isSpeaking) { this.start(); return; }
        if (this.isPaused) this.resume();
        else this.pause();
      },

      stop() {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.elapsedMs = 0;
        this.utterance = null;
        this.stopTicking();
        this.clearHighlights();
        trackEl.classList.remove('visible');
        timerEl.textContent = '0:00 / 0:00';
        fillEl.style.width = '0%';
        btnToggle.textContent = '▶ Read Aloud';
        btnStop.style.display = 'none';
      },

      isActive() { return this.isSpeaking; }
    };

    btnToggle.addEventListener('click', () => controller.toggle());
    btnStop.addEventListener('click', () => controller.stop());

    speedSelect.addEventListener('change', () => {
      if (!controller.isSpeaking) return;
      controller.computeDurations();
      if (!controller.isPaused) {
        speechSynthesis.cancel();
        controller.playSentence(controller.currentIndex);
      } else {
        controller.updateUI();
      }
    });
  },

  initProgress() {
    const container = document.getElementById('readingProgressContainer');
    const bar = document.getElementById('readingProgressBar');
    const text = document.getElementById('readingProgressText');
    
    if (!container || !bar || !text) return;

    window.addEventListener('scroll', () => {
      if (!document.body.classList.contains('dyslexia-mode')) {
        container.classList.remove('visible');
        return;
      }
      
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        container.classList.add('visible');
      } else {
        container.classList.remove('visible');
      }

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollY / totalHeight) * 100));
      
      bar.style.width = progress + '%';
      text.textContent = Math.round(progress) + '%';
    });
  }
};


const App = {
  defaultSettings: {
    letterSpacing: '0.04', // Wide
    textSize: '18',
    readingWidth: 'comfortable',
    theme: 'warm',
    readingFocus: false
  },

  init() {
    this.injectSharedComponents();
    this.initComfortToggle();
    this.initSettingsPanel();
    this.initScrollToTop();
    ReadingAssist.init();
  },

  injectSharedComponents() {
    const isComfortOn = localStorage.getItem('readx-dyslexia-mode') === 'true';
    const currentUser = (typeof ReadXAuth !== 'undefined') ? ReadXAuth.getCurrentUser() : null;
    const profile = currentUser || (typeof ReadXData !== 'undefined' ? ReadXData.getProfile() : { name: 'R' });
    const isLoggedIn = !!currentUser;
    const avatarLetter = (profile.name || 'R').charAt(0).toUpperCase();

    const authActionHTML = isLoggedIn
      ? `<a href="profile.html" class="nav-avatar" id="navAvatar" title="Profile (${profile.name})" aria-label="Profile (${profile.name})">${avatarLetter}</a>`
      : `<a href="login.html" class="nav-login-btn" id="navLoginBtn">Login</a>`;

    const mobileLinksHTML = isLoggedIn
      ? `
        <a href="index.html">Home</a>
        <a href="library.html">Library</a>
        <a href="upload.html">My Content</a>
        <a href="practice.html">Practice</a>
        <a href="profile.html">Profile (${profile.name})</a>
        <a href="#" id="mobileLogoutLink" style="color: #E8A598;">Logout</a>
      `
      : `
        <a href="index.html">Home</a>
        <a href="library.html">Library</a>
        <a href="upload.html">My Content</a>
        <a href="practice.html">Practice</a>
        <a href="login.html">Login</a>
      `;

    const navHTML = `
      <nav class="navbar">
        <div class="container nav-container">
          <div class="nav-logo">
            <a href="index.html">READX</a>
          </div>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <div class="nav-links" id="navLinks">
            ${mobileLinksHTML}
          </div>
          <div class="nav-actions" style="display:flex; align-items:center; gap:0.75rem; position:relative;">
            <button class="comfort-toggle-btn ${isComfortOn ? 'active' : ''}" id="comfortModeBtn" aria-pressed="${isComfortOn}" aria-label="ReadX Mode">
              <span class="desktop-text-container">
                <span class="toggle-icon-wrapper">
                  <svg class="toggle-icon-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="desktop-text">ReadX Mode</span>
              </span>
              <span class="mobile-text">Aa</span>
            </button>

            <button class="settings-icon-btn" id="comfortSettingsBtn" aria-label="Reading accessibility settings" style="display: ${isComfortOn ? 'flex' : 'none'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            
            <div class="settings-panel" id="comfortSettingsPanel" hidden>
              <div class="settings-header">
                <h3>Personalize your reading</h3>
                <p>Adjust the experience to what feels comfortable for you.</p>
              </div>
              
              <div class="settings-section-label">TEXT</div>
              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Letter Spacing</label>
                  <span id="valLetterSpacing">0.04em</span>
                </div>
                <input type="range" id="setLetterSpacing" min="0" max="0.06" step="0.02" value="0.04">
                <div class="settings-slider-ticks">
                  <span>Normal</span>
                  <span>Wide</span>
                </div>
              </div>

              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Text Size</label>
                  <span id="valTextSize">18px</span>
                </div>
                <input type="range" id="setTextSize" min="16" max="24" step="1" value="18">
                <div class="settings-slider-ticks">
                  <span>A-</span>
                  <span>A+</span>
                </div>
              </div>

              <div class="settings-divider"></div>
              
              <div class="settings-section-label">LAYOUT</div>
              <div class="settings-group">
                <label>Reading Width</label>
                <div class="segmented-control" id="setWidthControl">
                  <button class="seg-btn" data-val="narrow">Narrow</button>
                  <button class="seg-btn" data-val="comfortable">Comfortable</button>
                  <button class="seg-btn" data-val="wide">Wide</button>
                </div>
              </div>

              <div class="settings-divider"></div>

              <div class="settings-section-label">APPEARANCE</div>
              <div class="settings-group">
                <label>Theme</label>
                <div class="segmented-control" id="setThemeControl">
                  <button class="seg-btn" data-val="light">Light</button>
                  <button class="seg-btn" data-val="dark">Dark</button>
                  <button class="seg-btn" data-val="warm">Warm</button>
                </div>
              </div>

              <div class="settings-divider"></div>

              <div class="settings-section-label">FOCUS</div>
              <div class="settings-group" style="flex-direction:row; justify-content:space-between; align-items:center;">
                <label style="margin:0;">Reading Focus</label>
                <label class="toggle-switch">
                  <input type="checkbox" id="setFocusMode">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <button class="settings-reset-btn" id="btnResetSettings">Reset to recommended</button>
            </div>

            ${authActionHTML}
          </div>
        </div>
      </nav>
    `;

    const footerAuthHTML = isLoggedIn
      ? `<a href="profile.html">Profile</a><a href="#" id="footerLogoutLink">Logout</a>`
      : `<a href="login.html">Login</a><a href="signup.html">Sign Up</a>`;

    const footerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="site-footer-grid">
            <div class="site-footer-brand">
              <div class="site-footer-logo">READX</div>
              <p class="site-footer-tagline">Assistive reading platform for personalized digital learning.</p>
            </div>
            <div class="site-footer-col">
              <span class="site-footer-col-label">Product</span>
              <a href="library.html">Library</a>
              <a href="upload.html">My Content</a>
              <a href="practice.html">Practice</a>
            </div>
            <div class="site-footer-col">
              <span class="site-footer-col-label">Account</span>
              ${footerAuthHTML}
              <a href="index.html">Home</a>
            </div>
          </div>
          <div class="site-footer-bottom">
            <span>&copy; 2026 ReadX. All rights reserved.</span>
          </div>
        </div>
      </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    this.setActiveNavLink();
    this.initMobileNav();
    this.initAuthListeners();

    // Scroll event listener for sticky shrink effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      const handleScroll = () => {
        if (window.scrollY > 15) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initialize on load
    }
  },

  initAuthListeners() {
    const mobileLogout = document.getElementById('mobileLogoutLink');
    if (mobileLogout) {
      mobileLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof ReadXAuth !== 'undefined') ReadXAuth.logout();
      });
    }

    const footerLogout = document.getElementById('footerLogoutLink');
    if (footerLogout) {
      footerLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof ReadXAuth !== 'undefined') ReadXAuth.logout();
      });
    }
  },

  initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  },

  setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  updateNavAvatar(name) {
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar && name) {
      navAvatar.textContent = name.charAt(0).toUpperCase();
      navAvatar.setAttribute('title', `Profile (${name})`);
      navAvatar.setAttribute('aria-label', `Profile (${name})`);
    }
  },

  initComfortToggle() {
    const btn = document.getElementById('comfortModeBtn');
    const settingsBtn = document.getElementById('comfortSettingsBtn');
    if (!btn) return;
    
    const applyMasterState = (isOn) => {
      btn.setAttribute('aria-pressed', isOn);
      if (isOn) {
        document.body.classList.add('dyslexia-mode');
        btn.classList.add('active');
        settingsBtn.style.display = 'flex';
        this.applySettingsToDOM(this.getSettings()); 
      } else {
        document.body.classList.remove('dyslexia-mode');
        btn.classList.remove('active');
        settingsBtn.style.display = 'none';

        if (ReadingAssist.tts) ReadingAssist.tts.stop();
        ReadingAssist.sentences.forEach(s => s.classList.remove('focused'));
        document.body.classList.remove('sentence-focus-active');
        ReadingAssist.updateFocusBar();

        const panel = document.getElementById('comfortSettingsPanel');
        if (panel) panel.setAttribute('hidden', '');
        settingsBtn.classList.remove('active-gear');
      }
    };

    const isComfortOn = localStorage.getItem('readx-dyslexia-mode') === 'true';
    applyMasterState(isComfortOn);

    btn.addEventListener('click', () => {
      const currentState = localStorage.getItem('readx-dyslexia-mode') === 'true';
      const newState = !currentState;
      localStorage.setItem('readx-dyslexia-mode', newState);
      applyMasterState(newState);
      
      if (!newState && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    });
  },

  getSettings() {
    const saved = localStorage.getItem('readx-accessibility-settings');
    if (saved) return JSON.parse(saved);
    return { ...this.defaultSettings };
  },

  saveSettings(settings) {
    localStorage.setItem('readx-accessibility-settings', JSON.stringify(settings));
    this.applySettingsToDOM(settings);
  },

  applySettingsToDOM(settings) {
    const root = document.documentElement;
    
    root.style.setProperty('--user-font-size', settings.textSize + 'px');
    root.style.setProperty('--user-letter-spacing', settings.letterSpacing + 'em');
    
    let widthVal = '70ch';
    if (settings.readingWidth === 'narrow') widthVal = '55ch';
    if (settings.readingWidth === 'wide') widthVal = '100ch';
    root.style.setProperty('--user-reading-width', widthVal);

    document.body.setAttribute('data-theme', settings.theme);
    document.body.setAttribute('data-focus', settings.readingFocus ? 'on' : 'off');

    // Keep the focus highlight in sync when focus mode is toggled
    if (typeof ReadingAssist.updateFocusBar === 'function') ReadingAssist.updateFocusBar();
    
    // Update live labels if UI is open
    const valSpacing = document.getElementById('valLetterSpacing');
    const valSize = document.getElementById('valTextSize');
    if (valSpacing) valSpacing.textContent = settings.letterSpacing + 'em';
    if (valSize) valSize.textContent = settings.textSize + 'px';
  },

  initSettingsPanel() {
    const settingsBtn = document.getElementById('comfortSettingsBtn');
    const panel = document.getElementById('comfortSettingsPanel');
    if (!settingsBtn || !panel) return;

    const populateUI = (settings) => {
      document.getElementById('setLetterSpacing').value = settings.letterSpacing;
      document.getElementById('setTextSize').value = settings.textSize;
      
      document.querySelectorAll('#setWidthControl .seg-btn').forEach(b => {
        if (b.dataset.val === settings.readingWidth) b.classList.add('active');
        else b.classList.remove('active');
      });
      
      document.querySelectorAll('#setThemeControl .seg-btn').forEach(b => {
        if (b.dataset.val === settings.theme) b.classList.add('active');
        else b.classList.remove('active');
      });
      
      document.getElementById('setFocusMode').checked = settings.readingFocus;
    };

    populateUI(this.getSettings());

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        settingsBtn.setAttribute('aria-expanded', 'true');
        settingsBtn.classList.add('active-gear');
        populateUI(this.getSettings()); // ensure UI matches data
      } else {
        panel.setAttribute('hidden', '');
        settingsBtn.setAttribute('aria-expanded', 'false');
        settingsBtn.classList.remove('active-gear');
      }
    });

    document.addEventListener('click', (e) => {
      if (!panel.hasAttribute('hidden') && !panel.contains(e.target) && !settingsBtn.contains(e.target)) {
        panel.setAttribute('hidden', '');
        settingsBtn.setAttribute('aria-expanded', 'false');
        settingsBtn.classList.remove('active-gear');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hasAttribute('hidden')) {
        panel.setAttribute('hidden', '');
        settingsBtn.setAttribute('aria-expanded', 'false');
        settingsBtn.classList.remove('active-gear');
        settingsBtn.focus();
      }
    });

    const updateSetting = (key, value) => {
      const s = this.getSettings();
      s[key] = value;
      this.saveSettings(s);
    };

    document.getElementById('setLetterSpacing').addEventListener('input', (e) => updateSetting('letterSpacing', e.target.value));
    document.getElementById('setTextSize').addEventListener('input', (e) => updateSetting('textSize', e.target.value));
    
    document.getElementById('setFocusMode').addEventListener('change', (e) => updateSetting('readingFocus', e.target.checked));

    document.querySelectorAll('#setWidthControl .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#setWidthControl .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSetting('readingWidth', btn.dataset.val);
      });
    });

    document.querySelectorAll('#setThemeControl .seg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#setThemeControl .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSetting('theme', btn.dataset.val);
      });
    });
    
    const resetBtn = document.getElementById('btnResetSettings');
    resetBtn.addEventListener('click', () => {
      this.saveSettings(this.defaultSettings);
      populateUI(this.defaultSettings);
    });
  },

  initScrollToTop() {
    if (document.getElementById('scrollTopBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    document.body.appendChild(btn);

    let ticking = false;
    const toggleVisibility = () => {
      if (window.scrollY >= 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggleVisibility();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
