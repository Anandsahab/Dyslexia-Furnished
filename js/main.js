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
      
      const elements = area.querySelectorAll('p, h1, h2, h3, h4, li, td, th, figcaption, blockquote');
      elements.forEach(el => {
        if (el.querySelector('.sentence')) return;
        const text = el.innerHTML;
        if (text.includes('<img') || text.includes('<table') || text.includes('<iframe')) return;
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        let newHTML = '';
        sentences.forEach(s => {
          if (s.trim().length > 0) {
            newHTML += `<span class="sentence">${s}</span> `;
          }
        });
        if (newHTML) el.innerHTML = newHTML;
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
    this.initGlobalLoader();
    this.injectSharedComponents();
    this.initComfortToggle();
    this.initSettingsPanel();
    this.initScrollToTop();
    ReadingAssist.init();
  },

  initGlobalLoader() {
    let loader = document.getElementById('rxLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'rxLoader';
      loader.className = 'rx-loader';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML = `
        <div class="rx-loader-inner">
          <span class="rx-lettermark">R<span class="rx-accent">x</span></span>
          <div class="rx-glow-bar"></div>
        </div>
      `;
      document.body.prepend(loader);
    }

    // Determine navigation context
    const isReload = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.type === 'reload') ||
                     (performance.navigation && performance.navigation.type === 1);

    let isInternalNav = false;
    try {
      isInternalNav = !isReload && sessionStorage.getItem('readx-nav-type') === 'internal';
      sessionStorage.removeItem('readx-nav-type');
    } catch (e) {
      isInternalNav = false;
    }

    // 200ms for internal navbar navigation, 2000ms for initial load / refresh / direct URL access
    const MIN_VISIBLE_MS = isInternalNav ? 200 : 2000;
    const fadeOutCleanupMs = isInternalNav ? 280 : 500;

    if (isInternalNav && loader) {
      loader.classList.add('fast-fade');
    }

    const startTime = performance.now();
    let pageReady = false;
    let dismissed = false;

    const dismissLoader = () => {
      if (dismissed || !loader) return;
      dismissed = true;
      loader.classList.add('loaded');
      setTimeout(() => {
        if (loader && loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, fadeOutCleanupMs);
    };

    const tryDismiss = () => {
      if (!pageReady || dismissed) return;
      const elapsedTime = performance.now() - startTime;
      const remainingTime = Math.max(0, MIN_VISIBLE_MS - elapsedTime);
      setTimeout(dismissLoader, remainingTime);
    };

    const onPageReady = () => {
      pageReady = true;
      tryDismiss();
    };

    if (document.readyState === 'complete') {
      onPageReady();
    } else {
      window.addEventListener('load', onPageReady);
      // Safety fallback so page is never blocked indefinitely (e.g. 5s max)
      setTimeout(onPageReady, 5000);
    }
  },

  injectSharedComponents() {
    const isComfortOn = localStorage.getItem('readx-dyslexia-mode') === 'true';
    const currentUser = (typeof ReadXAuth !== 'undefined') ? ReadXAuth.getCurrentUser() : null;
    const profile = currentUser || (typeof ReadXData !== 'undefined' ? ReadXData.getProfile() : { name: 'R' });
    const isLoggedIn = !!currentUser;

    let avatarLetter = 'R';
    if (typeof ReadXAuth !== 'undefined' && ReadXAuth.getAvatarInitial) {
      avatarLetter = ReadXAuth.getAvatarInitial();
    } else {
      const rawName = (currentUser && (currentUser.name || currentUser.email)) || profile.name || 'R';
      avatarLetter = (rawName.trim().charAt(0) || 'R').toUpperCase();
    }

    const userName = (currentUser && (currentUser.name || currentUser.email)) || profile.name || 'User';

    const authActionHTML = isLoggedIn
      ? `<a href="profile.html" class="nav-avatar" id="navAvatar" title="Profile (${userName})" aria-label="Profile (${userName})">${avatarLetter}</a>`
      : `<a href="login.html" class="nav-login-btn" id="navLoginBtn">Login</a>`;

    const mobileLinksHTML = `
      <a href="index.html">Home</a>
      <a href="library.html">Library</a>
      <a href="upload.html">My Content</a>
      <a href="practice.html">Practice</a>
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
              
              <div class="settings-section-label">TYPOGRAPHY</div>
              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Font Size</label>
                  <span id="valTextSize">18px</span>
                </div>
                <input type="range" id="setTextSize" min="14" max="28" step="1" value="18">
              </div>

              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Letter Spacing</label>
                  <span id="valLetterSpacing">0.05em</span>
                </div>
                <input type="range" id="setLetterSpacing" min="0" max="0.20" step="0.01" value="0.05">
              </div>

              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Word Spacing</label>
                  <span id="valWordSpacing">0.12em</span>
                </div>
                <input type="range" id="setWordSpacing" min="0" max="0.30" step="0.02" value="0.12">
              </div>

              <div class="settings-group">
                <div class="settings-label-row">
                  <label>Line Height</label>
                  <span id="valLineHeight">1.8</span>
                </div>
                <input type="range" id="setLineHeight" min="1.2" max="2.5" step="0.1" value="1.8">
              </div>

              <div class="settings-group">
                <label>Font Family</label>
                <div class="segmented-control" id="setFontControl">
                  <button class="seg-btn" data-val="'OpenDyslexic', 'Lexend', sans-serif">OpenDyslexic</button>
                  <button class="seg-btn" data-val="'Lexend', sans-serif">Lexend</button>
                  <button class="seg-btn" data-val="'Inter', sans-serif">Inter</button>
                </div>
              </div>

              <div class="settings-divider"></div>

              <div class="settings-section-label">APPEARANCE</div>
              <div class="settings-group">
                <label>Theme / Contrast</label>
                <div class="segmented-control" id="setThemeControl">
                  <button class="seg-btn" data-val="warm">Warm</button>
                  <button class="seg-btn" data-val="light">Light</button>
                  <button class="seg-btn" data-val="dark">Dark</button>
                </div>
              </div>

              <div class="settings-divider"></div>

              <div class="settings-section-label">FOCUS & GUIDES</div>
              <div class="settings-group" style="flex-direction:row; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <label style="margin:0;">Line Focus Bar</label>
                <label class="toggle-switch">
                  <input type="checkbox" id="setFocusMode">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="settings-group" style="flex-direction:row; justify-content:space-between; align-items:center;">
                <label style="margin:0;">Reading Guide Ruler</label>
                <label class="toggle-switch">
                  <input type="checkbox" id="setRulerMode">
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

    // Intercept clicks on links for navigation context tracking & auth protection
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.includes('://') || href.startsWith('javascript:')) return;

      // Mark internal navigation context
      try {
        sessionStorage.setItem('readx-nav-type', 'internal');
      } catch (err) {}

      const pathPart = href.split('?')[0].split('#')[0];
      const protectedPages = ['library.html', 'upload.html'];

      if (protectedPages.includes(pathPart) && typeof ReadXAuth !== 'undefined' && !ReadXAuth.isLoggedIn()) {
        e.preventDefault();
        window.location.href = `login.html?redirect=${encodeURIComponent(href)}`;
      }
    });
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

  defaultSettings: {
    textSize: 18,
    letterSpacing: 0.05,
    wordSpacing: 0.12,
    lineHeight: 1.8,
    fontFamily: "'OpenDyslexic', 'Lexend', sans-serif",
    theme: 'warm',
    readingWidth: 'comfortable',
    readingFocus: false,
    rulerEnabled: false
  },

  getSettings() {
    const saved = localStorage.getItem('readx-accessibility-settings');
    if (saved) return { ...this.defaultSettings, ...JSON.parse(saved) };
    return { ...this.defaultSettings };
  },

  saveSettings(settings) {
    localStorage.setItem('readx-accessibility-settings', JSON.stringify(settings));
    this.applySettingsToDOM(settings);
  },

  applySettingsToDOM(settings) {
    const root = document.documentElement;
    const s = { ...this.defaultSettings, ...settings };
    
    root.style.setProperty('--user-font-size', s.textSize + 'px');
    root.style.setProperty('--user-letter-spacing', s.letterSpacing + 'em');
    root.style.setProperty('--user-word-spacing', s.wordSpacing + 'em');
    root.style.setProperty('--user-line-height', s.lineHeight);
    root.style.setProperty('--user-font-family', s.fontFamily);
    
    let widthVal = '70ch';
    if (s.readingWidth === 'narrow') widthVal = '55ch';
    if (s.readingWidth === 'wide') widthVal = '100ch';
    root.style.setProperty('--user-reading-width', widthVal);

    document.body.setAttribute('data-theme', s.theme || 'warm');
    document.body.setAttribute('data-focus', s.readingFocus ? 'on' : 'off');
    document.body.setAttribute('data-ruler', s.rulerEnabled ? 'on' : 'off');

    localStorage.setItem('readxRulerEnabled', s.rulerEnabled ? 'true' : 'false');
    localStorage.setItem('readxFocusEnabled', s.readingFocus ? 'true' : 'false');

    // Keep active text elements in sync immediately
    document.querySelectorAll('.text-readx, .rx-text-overlay-panel').forEach(el => {
      el.style.fontSize = s.textSize + 'px';
      el.style.letterSpacing = s.letterSpacing + 'em';
      el.style.wordSpacing = s.wordSpacing + 'em';
      el.style.lineHeight = s.lineHeight;
      el.style.fontFamily = s.fontFamily;
    });

    if (typeof ReadingAssist.updateFocusBar === 'function') ReadingAssist.updateFocusBar();
    
    const valSpacing = document.getElementById('valLetterSpacing');
    const valSize = document.getElementById('valTextSize');
    const valWordSpacing = document.getElementById('valWordSpacing');
    const valLineHeight = document.getElementById('valLineHeight');

    if (valSpacing) valSpacing.textContent = s.letterSpacing + 'em';
    if (valSize) valSize.textContent = s.textSize + 'px';
    if (valWordSpacing) valWordSpacing.textContent = s.wordSpacing + 'em';
    if (valLineHeight) valLineHeight.textContent = s.lineHeight;
  },

  initSettingsPanel() {
    const settingsBtn = document.getElementById('comfortSettingsBtn');
    const panel = document.getElementById('comfortSettingsPanel');
    if (!settingsBtn || !panel) return;

    const populateUI = (settings) => {
      const s = { ...this.defaultSettings, ...settings };
      if (document.getElementById('setLetterSpacing')) document.getElementById('setLetterSpacing').value = s.letterSpacing;
      if (document.getElementById('setTextSize')) document.getElementById('setTextSize').value = s.textSize;
      if (document.getElementById('setWordSpacing')) document.getElementById('setWordSpacing').value = s.wordSpacing;
      if (document.getElementById('setLineHeight')) document.getElementById('setLineHeight').value = s.lineHeight;
      
      document.querySelectorAll('#setFontControl .seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === s.fontFamily);
      });

      document.querySelectorAll('#setThemeControl .seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === s.theme);
      });
      
      if (document.getElementById('setFocusMode')) document.getElementById('setFocusMode').checked = s.readingFocus;
      if (document.getElementById('setRulerMode')) document.getElementById('setRulerMode').checked = s.rulerEnabled;
    };

    populateUI(this.getSettings());

    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        settingsBtn.setAttribute('aria-expanded', 'true');
        settingsBtn.classList.add('active-gear');
        populateUI(this.getSettings());
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

    if (document.getElementById('setLetterSpacing')) {
      document.getElementById('setLetterSpacing').addEventListener('input', (e) => updateSetting('letterSpacing', parseFloat(e.target.value)));
    }
    if (document.getElementById('setTextSize')) {
      document.getElementById('setTextSize').addEventListener('input', (e) => updateSetting('textSize', parseInt(e.target.value, 10)));
    }
    if (document.getElementById('setWordSpacing')) {
      document.getElementById('setWordSpacing').addEventListener('input', (e) => updateSetting('wordSpacing', parseFloat(e.target.value)));
    }
    if (document.getElementById('setLineHeight')) {
      document.getElementById('setLineHeight').addEventListener('input', (e) => updateSetting('lineHeight', parseFloat(e.target.value)));
    }
    if (document.getElementById('setFocusMode')) {
      document.getElementById('setFocusMode').addEventListener('change', (e) => updateSetting('readingFocus', e.target.checked));
    }
    if (document.getElementById('setRulerMode')) {
      document.getElementById('setRulerMode').addEventListener('change', (e) => updateSetting('rulerEnabled', e.target.checked));
    }

    document.querySelectorAll('#setFontControl .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#setFontControl .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSetting('fontFamily', btn.dataset.val);
      });
    });

    document.querySelectorAll('#setThemeControl .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#setThemeControl .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSetting('theme', btn.dataset.val);
      });
    });
    
    const resetBtn = document.getElementById('btnResetSettings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.saveSettings(this.defaultSettings);
        populateUI(this.defaultSettings);
      });
    }
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
