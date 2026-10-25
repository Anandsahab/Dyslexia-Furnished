// js/upload.js

document.addEventListener('DOMContentLoaded', () => {
  // Protect page: require login
  if (typeof ReadXAuth !== 'undefined' && !ReadXAuth.protectPage()) {
    return;
  }

  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('uploadInput');
  const browseBtn = document.getElementById('uploadBrowseBtn');
  const list = document.getElementById('uploadList');
  const empty = document.getElementById('uploadEmpty');
  const errorAlert = document.getElementById('uploadErrorAlert');
  const errorMsg = document.getElementById('uploadErrorMsg');

  // Modal elements
  const modal = document.getElementById('rxReaderModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBtnStandard = document.getElementById('modalBtnStandard');
  const modalBtnReadX = document.getElementById('modalBtnReadX');
  const modalBtnVisual = document.getElementById('modalBtnVisual');
  const modalDocTitle = document.getElementById('modalDocTitle');
  const modalFormatBadge = document.getElementById('modalFormatBadge');
  const modalStandardContainer = document.getElementById('modalStandardContainer');
  const modalReadXContainer = document.getElementById('modalReadXContainer');
  const modalVisualContainer = document.getElementById('modalVisualContainer');
  const modalFooterMeta = document.getElementById('modalFooterMeta');
  const modalTtsBtn = document.getElementById('modalTtsBtn');

  let currentModalItem = null;
  let activeModalMode = 'standard';
  let isModalSpeaking = false;
  let closeLineFocus = () => {};
  let stopSelectionSpeech = () => {};

  // User-scoped persistent accessibility preferences
  function getReadXUserSettings() {
    const defaultSettings = {
      textSize: 18,
      fontFamily: "'OpenDyslexic', 'Lexend', sans-serif",
      theme: 'dark',
      lineHeight: 1.85,
      letterSpacing: 0.04,
      wordSpacing: 0.12,
      rulerEnabled: false,
      readingFocus: false
    };
    try {
      const savedGlobal = localStorage.getItem('readx-accessibility-settings');
      if (savedGlobal) return { ...defaultSettings, ...JSON.parse(savedGlobal) };
      const uid = (typeof ReadXData !== 'undefined' && ReadXData.getCurrentUserId) ? ReadXData.getCurrentUserId() : 'usr_guest';
      const key = `readx_user_${uid}_settings`;
      const savedUser = localStorage.getItem(key);
      if (savedUser) return { ...defaultSettings, ...JSON.parse(savedUser) };
    } catch (e) {
      console.error('Error reading user settings:', e);
    }
    return defaultSettings;
  }

  function saveReadXUserSettings(settings) {
    try {
      const s = { ...getReadXUserSettings(), ...settings };
      localStorage.setItem('readx-accessibility-settings', JSON.stringify(s));
      const uid = (typeof ReadXData !== 'undefined' && ReadXData.getCurrentUserId) ? ReadXData.getCurrentUserId() : 'usr_guest';
      const key = `readx_user_${uid}_settings`;
      localStorage.setItem(key, JSON.stringify(s));
    } catch (e) {
      console.error('Error saving user settings:', e);
    }
    applySettingsToReadXCanvas(settings);
  }

  function applySettingsToReadXCanvas(settings) {
    const s = settings || getReadXUserSettings();
    const container = document.getElementById('modalReadXContainer');
    const canvas = document.getElementById('rxLayoutCCanvas');

    const textSizeStr = typeof s.textSize === 'number' || (!isNaN(parseInt(s.textSize, 10)) && !String(s.textSize).includes('px')) 
      ? s.textSize + 'px' 
      : String(s.textSize || '18px');
    const letterSpacingStr = typeof s.letterSpacing === 'number' || (!isNaN(parseFloat(s.letterSpacing)) && !String(s.letterSpacing).includes('em')) 
      ? s.letterSpacing + 'em' 
      : String(s.letterSpacing || '0.04em');
    const wordSpacingStr = typeof s.wordSpacing === 'number' || (!isNaN(parseFloat(s.wordSpacing)) && !String(s.wordSpacing).includes('em')) 
      ? s.wordSpacing + 'em' 
      : String(s.wordSpacing || '0.12em');
    const lineHeightStr = String(s.lineHeight || '1.85');
    const fontFamilyStr = s.fontFamily || "'OpenDyslexic', 'Lexend', sans-serif";

    // Set CSS variables on document root
    const root = document.documentElement;
    root.style.setProperty('--user-font-size', textSizeStr);
    root.style.setProperty('--user-letter-spacing', letterSpacingStr);
    root.style.setProperty('--user-word-spacing', wordSpacingStr);
    root.style.setProperty('--user-line-height', lineHeightStr);
    root.style.setProperty('--user-font-family', fontFamilyStr);
    root.style.setProperty('--reader-font-size', textSizeStr);
    root.style.setProperty('--reader-letter-spacing', letterSpacingStr);
    root.style.setProperty('--reader-word-spacing', wordSpacingStr);
    root.style.setProperty('--reader-line-height', lineHeightStr);
    root.style.setProperty('--reader-font-family', fontFamilyStr);

    if (container) {
      container.setAttribute('data-theme', s.theme || 'dark');
      container.style.setProperty('--user-font-size', textSizeStr);
      container.style.setProperty('--user-letter-spacing', letterSpacingStr);
      container.style.setProperty('--user-word-spacing', wordSpacingStr);
      container.style.setProperty('--user-line-height', lineHeightStr);
      container.style.setProperty('--user-font-family', fontFamilyStr);
    }

    if (canvas) {
      canvas.style.setProperty('font-size', textSizeStr, 'important');
      canvas.style.setProperty('font-family', fontFamilyStr, 'important');
      canvas.style.setProperty('line-height', lineHeightStr, 'important');
      canvas.style.setProperty('letter-spacing', letterSpacingStr, 'important');
      canvas.style.setProperty('word-spacing', wordSpacingStr, 'important');
    }

    // Direct styling on all rendered document text elements strictly inside ReadX accessible canvas
    const readerTextElements = document.querySelectorAll(`
      #rxLayoutCCanvas,
      #rxLayoutCContent,
      #rxLayoutCContent p,
      #rxLayoutCContent span,
      #rxLayoutCContent li,
      #rxLayoutCContent div,
      #modalReadXContainer .rx-layout-c-text-content,
      #modalReadXContainer .rx-layout-c-text-content p,
      #modalReadXContainer .rx-layout-c-text-content span,
      #modalReadXContainer .rx-layout-c-text-content li,
      #modalReadXContainer .rx-page-block,
      #modalReadXContainer .rx-page-block p,
      #modalReadXContainer .rx-page-block span,
      #modalReadXContainer .rx-page-block li,
      #modalReadXContainer .sentence
    `);

    readerTextElements.forEach(el => {
      el.style.setProperty('font-family', fontFamilyStr, 'important');
      el.style.setProperty('font-size', textSizeStr, 'important');
      el.style.setProperty('letter-spacing', letterSpacingStr, 'important');
      el.style.setProperty('word-spacing', wordSpacingStr, 'important');
      el.style.setProperty('line-height', lineHeightStr, 'important');
    });

    const valLine = document.getElementById('rxValLineHeight');
    if (valLine) valLine.textContent = Number(parseFloat(lineHeightStr)).toFixed(2);
    const valLetter = document.getElementById('rxValLetterSpacing');
    if (valLetter) valLetter.textContent = letterSpacingStr;

    const dot = document.getElementById('rxThemeDot');
    if (dot) {
      if (s.theme === 'warm') dot.style.background = '#F5F1E6';
      else if (s.theme === 'light') dot.style.background = '#FAFAF8';
      else dot.style.background = '#E6C875';
    }

    if (typeof ReadingAssist !== 'undefined' && ReadingAssist.applySettingsToDOM) {
      ReadingAssist.applySettingsToDOM(s);
    }
  }

  // Subscribe to live settings changes from navbar personalize panel & storage
  window.addEventListener('readx:settings-changed', (e) => {
    if (e.detail) applySettingsToReadXCanvas(e.detail);
  });
  window.addEventListener('storage', () => {
    applySettingsToReadXCanvas(getReadXUserSettings());
  });
  window.addEventListener('readx:comfort-change', () => {
    applySettingsToReadXCanvas(getReadXUserSettings());
  });

  // Active session Blob URLs for high-fidelity instant preview
  const activeBlobUrls = new Map();

  // Strict blocklist for ZIP archives and unsafe/executable formats
  const BLOCKED_EXTENSIONS = [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'tgz', 'zipx', 'z', 'cab', 'arj',
    'exe', 'msi', 'bat', 'cmd', 'sh', 'bin', 'apk', 'jar', 'dmg', 'app', 'com', 'scr', 'vbs', 'ps1', 'dll', 'sys'
  ];
  const BLOCKED_MIME_TYPES = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'multipart/x-zip',
    'application/x-rar-compressed',
    'application/x-rar',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable'
  ];

  // Allowed study material and media formats
  const ALLOWED_EXTENSIONS = [
    // Documents
    'pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'html', 'htm', 'json', 'xml', 'log',
    // Presentations
    'ppt', 'pptx',
    // Spreadsheets
    'xls', 'xlsx', 'csv',
    // Images
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp',
    // Audio / Video
    'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac',
    'mp4', 'webm', 'mov', 'ogv', 'avi', 'mkv'
  ];

  function showUploadError(msg) {
    if (errorAlert && errorMsg) {
      errorMsg.textContent = msg;
      errorAlert.style.display = 'flex';
    } else {
      alert(msg);
    }
  }

  function clearUploadError() {
    if (errorAlert) {
      errorAlert.style.display = 'none';
    }
  }

  function renderUploads() {
    const uploads = ReadXData.getUploads();
    list.innerHTML = '';

    if (uploads.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    uploads.forEach(item => {
      const el = document.createElement('div');
      el.className = 'upload-item';
      const hasText = item.hasExtractableText !== false && item.isReadable !== false && Boolean(item.content && item.content.trim());
      const extLabel = (item.ext || 'FILE').toUpperCase();

      el.innerHTML = `
        <div class="upload-item-info">
          <h4>${item.title}</h4>
          <span class="upload-item-tag ${hasText ? 'tag-ready' : 'tag-unsupported'}">
            ${extLabel} · ${hasText ? 'ReadX Ready' : 'Original Only'}
          </span>
          <br>
          <span>Uploaded ${item.date} ${hasText && item.wordCount ? `· ${item.wordCount} words` : ''}</span>
        </div>
        <div class="upload-item-actions">
          <button class="btn btn-primary btn-sm" data-read="${item.id}" data-document-id="${item.id}">Read →</button>
          <button class="btn-ghost" data-delete="${item.id}">Remove</button>
        </div>
      `;
      list.appendChild(el);
    });

    list.querySelectorAll('[data-read]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.read || btn.dataset.documentId;
        openReader(id);
      });
    });

    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.delete;
        deleteDocument(id);
      });
    });
  }

  function deleteDocument(id) {
    if (!id) return;
    const updated = ReadXData.getUploads().filter(u => String(u.id) !== String(id));
    ReadXData.saveUploads(updated);
    renderUploads();
  }

  function openReader(documentId) {
    if (!documentId) return;
    const uploads = ReadXData.getUploads();
    const item = uploads.find(u => String(u.id) === String(documentId));
    if (item) {
      openModal(item);
    } else {
      console.warn('Document not found for ID:', documentId);
    }
  }
  window.openReader = openReader;
  window.openModal = openModal;

  function openModal(item) {
    if (!item) return;
    currentModalItem = item;

    // Record reading session start in user stats
    if (typeof ReadXData !== 'undefined') {
      ReadXData.startReadingSession(item.id, item.title, item.wordCount || 0);
    }

    if (modalDocTitle) {
      modalDocTitle.textContent = item.title || item.filename || 'Document Viewer';
      modalDocTitle.dataset.docId = String(item.id || item.title);
    }
    if (window.ReadXNotes && typeof window.ReadXNotes.updateButtons === 'function') {
      window.ReadXNotes.updateButtons();
    }
    const ext = (item.ext || 'doc').toUpperCase();
    if (modalFormatBadge) modalFormatBadge.textContent = ext;

    const hasText = item.hasExtractableText !== false && item.isReadable !== false && Boolean(item.content && item.content.trim());

    if (modalBtnReadX) {
      if (!hasText) {
        modalBtnReadX.classList.add('disabled');
        modalBtnReadX.title = "READX adaptation isn't available for this file type.";
      } else {
        modalBtnReadX.classList.remove('disabled');
        modalBtnReadX.removeAttribute('title');
      }
    }

    if (modalBtnVisual) {
      if (!hasText) {
        modalBtnVisual.classList.add('disabled');
        modalBtnVisual.title = "Visual Learning isn't available for this file type.";
      } else {
        modalBtnVisual.classList.remove('disabled');
        modalBtnVisual.removeAttribute('title');
      }
    }

    // STEP 1: Render Standard Reading View FIRST
    try {
      renderModalStandardView(item);
    } catch (err) {
      console.error('Error rendering Standard Reading view:', err);
    }

    // STEP 2: Display Modal in Standard Reading Mode FIRST
    switchModalMode('standard');

    const pageMain = document.querySelector('.page-main');
    if (pageMain) pageMain.style.display = 'none';

    if (modal) {
      modal.style.display = 'block';
      document.body.classList.add('rx-reader-open');
      requestAnimationFrame(() => modal.classList.add('active'));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });

    // STEP 3: Deferred initialization of READX accessibility layer
    setTimeout(() => {
      try {
        renderModalReadXView(item, hasText);
      } catch (err) {
        console.error('Error initializing READX view:', err);
      }
    }, 50);
  }

  let isModalPaused = false;
  let speechSentences = [];
  let speechCurrentIndex = 0;
  let selectedSpeechRate = 1.0;
  let selectedVoiceURI = '';

  function updateAudioUiState() {
    const btnTts = document.getElementById('rxBtnTts');
    const modalTtsBtn = document.getElementById('modalTtsBtn');
    const modalTtsStopBtn = document.getElementById('modalTtsStopBtn');

    if (isModalSpeaking) {
      if (isModalPaused) {
        if (btnTts) {
          btnTts.classList.add('active');
          btnTts.innerHTML = '<span>▶️</span> Resume';
        }
        if (modalTtsBtn) modalTtsBtn.textContent = '▶️ Resume';
        if (modalTtsStopBtn) modalTtsStopBtn.style.display = 'inline-flex';
      } else {
        if (btnTts) {
          btnTts.classList.add('active');
          btnTts.innerHTML = '<span>⏸️</span> Pause';
        }
        if (modalTtsBtn) modalTtsBtn.textContent = '⏸️ Pause';
        if (modalTtsStopBtn) modalTtsStopBtn.style.display = 'inline-flex';
      }
    } else {
      if (btnTts) {
        btnTts.classList.remove('active');
        btnTts.innerHTML = '<span>🔊</span> Read Aloud';
      }
      if (modalTtsBtn) modalTtsBtn.textContent = '🔊 Read Aloud';
      if (modalTtsStopBtn) modalTtsStopBtn.style.display = 'none';
    }
  }

  function populateVoiceDropdowns() {
    if (!('speechSynthesis' in window)) return;
    const select = document.getElementById('panelTtsVoiceSelect');
    if (!select) return;
    const voices = window.speechSynthesis.getVoices();
    select.innerHTML = '<option value="">Default System Voice</option>';
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      if (v.voiceURI === selectedVoiceURI) opt.selected = true;
      select.appendChild(opt);
    });
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = populateVoiceDropdowns;
  }

  function stopModalSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isModalSpeaking = false;
    isModalPaused = false;
    speechCurrentIndex = 0;
    const activeSentences = document.querySelectorAll('#modalReadXContainer .sentence');
    activeSentences.forEach(s => s.classList.remove('tts-active'));
    updateAudioUiState();
  }

  function playSentenceAtIndex(idx) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }
    if (!speechSentences || speechSentences.length === 0) return;
    if (idx < 0 || idx >= speechSentences.length) {
      stopModalSpeech();
      return;
    }

    speechCurrentIndex = idx;
    isModalSpeaking = true;
    isModalPaused = false;

    window.speechSynthesis.cancel();

    speechSentences.forEach(s => s.classList.remove('tts-active'));
    const activeEl = speechSentences[idx];
    if (activeEl) {
      activeEl.classList.add('tts-active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const canvasContainer = document.getElementById('rxLayoutCCanvas');
      const focusLine = document.getElementById('rxModalFocusLine');
      const ruler = document.getElementById('rxModalReadingRuler');
      if (canvasContainer && activeEl) {
        const stageRect = canvasContainer.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();
        const relY = Math.max(0, elRect.top - stageRect.top);
        if (focusLine) focusLine.style.top = relY + 'px';
        if (ruler) ruler.style.top = Math.max(0, relY - 12) + 'px';
      }
    }

    const text = activeEl ? (activeEl.innerText || activeEl.textContent) : '';
    if (!text.trim()) {
      playSentenceAtIndex(idx + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = selectedSpeechRate;

    if (selectedVoiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      if (isModalSpeaking && !isModalPaused) {
        if (speechCurrentIndex + 1 < speechSentences.length) {
          playSentenceAtIndex(speechCurrentIndex + 1);
        } else {
          stopModalSpeech();
        }
      }
    };

    utterance.onerror = () => {
      stopModalSpeech();
    };

    updateAudioUiState();
    window.speechSynthesis.speak(utterance);
  }

  function startModalSpeech(fromIndex = 0) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isModalSpeaking && isModalPaused) {
      window.speechSynthesis.resume();
      isModalPaused = false;
      updateAudioUiState();
      return;
    }

    if (isModalSpeaking && !isModalPaused) {
      window.speechSynthesis.pause();
      isModalPaused = true;
      updateAudioUiState();
      return;
    }

    stopModalSpeech();

    if (currentModalItem && typeof ReadXData !== 'undefined' && ReadXData.recordFeatureUse) {
      ReadXData.recordFeatureUse('readAloud', currentModalItem.title);
    }

    const modalReadXContainer = document.getElementById('modalReadXContainer');
    speechSentences = Array.from(document.querySelectorAll('#modalReadXContainer .sentence'));

    if (speechSentences.length === 0) {
      const text = (modalReadXContainer ? modalReadXContainer.textContent : '').trim();
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedSpeechRate;
      utterance.onend = () => stopModalSpeech();
      utterance.onerror = () => stopModalSpeech();
      isModalSpeaking = true;
      isModalPaused = false;
      updateAudioUiState();
      window.speechSynthesis.speak(utterance);
      return;
    }

    playSentenceAtIndex(fromIndex);
  }

  function closeModal() {
    if (!modal) return;
    stopModalSpeech();
    stopSelectionSpeech();
    closeLineFocus();

    const selToolbar = document.getElementById('rxSelectionAiToolbar');
    if (selToolbar) selToolbar.style.display = 'none';
    const aiDrawer = document.getElementById('rxAiResultDrawer');
    if (aiDrawer) aiDrawer.style.display = 'none';

    if (currentModalItem && typeof ReadXData !== 'undefined') {
      ReadXData.endReadingSession(currentModalItem.id, currentModalItem.wordCount || 0);
    }

    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.classList.remove('rx-reader-open');
      const pageMain = document.querySelector('.page-main');
      if (pageMain) pageMain.style.display = '';
    }, 280);
  }

  function switchModalMode(mode) {
    activeModalMode = mode;
    stopSelectionSpeech();
    closeLineFocus();
    const selToolbar = document.getElementById('rxSelectionAiToolbar');
    if (selToolbar) selToolbar.style.display = 'none';
    const modalFooterActions = document.getElementById('modalFooterActions');
    const modalAudioBar = document.getElementById('modalAudioBar');

    // Deactivate all mode buttons
    if (modalBtnStandard) modalBtnStandard.classList.remove('active');
    if (modalBtnReadX) modalBtnReadX.classList.remove('active');
    if (modalBtnVisual) modalBtnVisual.classList.remove('active');

    // Hide all view containers
    if (modalStandardContainer) modalStandardContainer.style.display = 'none';
    if (modalReadXContainer) modalReadXContainer.style.display = 'none';
    if (modalVisualContainer) modalVisualContainer.style.display = 'none';

    stopModalSpeech();

    if (mode === 'standard') {
      if (modalBtnStandard) modalBtnStandard.classList.add('active');
      if (modalStandardContainer) {
        modalStandardContainer.style.display = 'block';
        const stdEls = modalStandardContainer.querySelectorAll('.standard-doc-view, .standard-doc-view *, .rx-page-block, .rx-page-block *');
        stdEls.forEach(el => {
          el.style.removeProperty('font-family');
          el.style.removeProperty('font-size');
          el.style.removeProperty('letter-spacing');
          el.style.removeProperty('word-spacing');
          el.style.removeProperty('line-height');
        });
      }
      if (modalFooterMeta) modalFooterMeta.textContent = 'Standard Reading Mode · Original Document';
      updateDocumentPagination();
    } else if (mode === 'readx') {
      if (modalBtnReadX) modalBtnReadX.classList.add('active');
      if (modalReadXContainer) modalReadXContainer.style.display = 'block';
      if (modalFooterMeta) modalFooterMeta.textContent = 'READX Accessible Mode · Layout C Focus View';

      applySettingsToReadXCanvas(getReadXUserSettings());
      updateDocumentPagination();

      if (currentModalItem && typeof ReadXData !== 'undefined') {
        ReadXData.recordFeatureUse('readx', currentModalItem.title);
      }
    } else if (mode === 'visual') {
      if (modalBtnVisual) modalBtnVisual.classList.add('active');
      if (modalVisualContainer) modalVisualContainer.style.display = 'block';
      if (modalFooterMeta) modalFooterMeta.textContent = 'Visual Learning Mode · Key Concept Cards';

      const pageIndicator = document.getElementById('modalPageIndicator');
      if (pageIndicator) pageIndicator.textContent = 'Concept Cards';
      const prevBtn = document.getElementById('modalPrevPageBtn');
      const nextBtn = document.getElementById('modalNextPageBtn');
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;

      renderVisualLearningView(currentModalItem);

      if (currentModalItem && typeof ReadXData !== 'undefined') {
        ReadXData.recordFeatureUse('visualize', currentModalItem.title);
      }
    }
  }

  function escapeVisualHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let activeVisualSpeechCardIndex = -1;

  async function renderVisualLearningView(item, forceRefresh = false) {
    const workspace = document.getElementById('rxVisualWorkspace');
    if (!workspace) return;

    if (!item) {
      renderVisualEmptyState('No document is currently active.');
      return;
    }

    // Check in-memory session cache
    if (!forceRefresh && item._visualCards) {
      renderVisualCardsContent(item._visualCards);
      return;
    }

    // Extract text content cleanly
    let docText = '';
    if (item.content && item.content.trim()) {
      if (item.content.startsWith('<')) {
        const tmp = document.createElement('div');
        tmp.innerHTML = item.content;
        docText = (tmp.textContent || tmp.innerText || '').trim();
      } else {
        docText = item.content.trim();
      }
    } else {
      const stdDoc = document.getElementById('modalStandardContainer');
      docText = (stdDoc?.textContent || '').trim();
    }

    if (!docText || docText.length < 10) {
      renderVisualEmptyState('This document contains insufficient readable text to generate visual concept cards.');
      return;
    }

    // Cap text to 6,000 characters for optimal and bounded generation
    const textToAnalyze = docText.length > 6000 ? docText.slice(0, 6000) : docText;

    renderVisualLoadingState();

    try {
      const visualData = await ReadXGemini.visualizeContent(textToAnalyze);
      item._visualCards = visualData;
      renderVisualCardsContent(visualData);
    } catch (err) {
      console.error('Visual Learning generation error:', err);
      renderVisualErrorState(err.message || 'Unable to generate concept cards at this time.');
    }
  }

  function renderVisualLoadingState() {
    const workspace = document.getElementById('rxVisualWorkspace');
    if (!workspace) return;
    workspace.innerHTML = `
      <div class="rx-visual-status-card rx-visual-loading" role="status" aria-live="polite">
        <div class="rx-visual-spinner">
          <span class="rx-lettermark">R<span class="rx-accent">x</span></span>
          <div class="rx-glow-bar"></div>
        </div>
        <h3 class="rx-visual-status-title">Generating Visual Learning Concepts...</h3>
        <p class="rx-visual-status-desc">Gemini AI is analyzing your document text to extract key terms, definitions, and dyslexia-accessible explanations.</p>
      </div>
    `;
  }

  function renderVisualEmptyState(msg) {
    const workspace = document.getElementById('rxVisualWorkspace');
    if (!workspace) return;
    workspace.innerHTML = `
      <div class="rx-visual-status-card rx-visual-empty">
        <div class="rx-visual-status-icon">📑</div>
        <h3 class="rx-visual-status-title">No Concept Cards Available</h3>
        <p class="rx-visual-status-desc">${escapeVisualHtml(msg || 'This document does not contain enough readable text content to generate concept cards.')}</p>
        <div class="rx-visual-actions">
          <button type="button" class="btn btn-outline btn-sm" id="rxBtnVisualSwitchReadX">Switch to ReadX Mode</button>
        </div>
      </div>
    `;
    const switchBtn = document.getElementById('rxBtnVisualSwitchReadX');
    if (switchBtn) {
      switchBtn.onclick = () => switchModalMode('readx');
    }
  }

  function renderVisualErrorState(errMsg) {
    const workspace = document.getElementById('rxVisualWorkspace');
    if (!workspace) return;
    workspace.innerHTML = `
      <div class="rx-visual-status-card rx-visual-error" role="alert">
        <div class="rx-visual-status-icon">⚠️</div>
        <h3 class="rx-visual-status-title">Unable to Generate Concept Cards</h3>
        <p class="rx-visual-status-desc">${escapeVisualHtml(errMsg || 'An error occurred while communicating with Gemini AI.')}</p>
        <div class="rx-visual-actions">
          <button type="button" class="btn btn-primary btn-sm" id="rxBtnVisualRetry">🔄 Try Again</button>
          <button type="button" class="btn btn-outline btn-sm" id="rxBtnVisualFallbackReadX">Read Document</button>
        </div>
      </div>
    `;
    const retryBtn = document.getElementById('rxBtnVisualRetry');
    if (retryBtn) {
      retryBtn.onclick = () => renderVisualLearningView(currentModalItem, true);
    }
    const fallbackBtn = document.getElementById('rxBtnVisualFallbackReadX');
    if (fallbackBtn) {
      fallbackBtn.onclick = () => switchModalMode('readx');
    }
  }

  function renderVisualCardsContent(data) {
    const workspace = document.getElementById('rxVisualWorkspace');
    if (!workspace) return;

    const cards = Array.isArray(data.conceptCards) ? data.conceptCards : [];
    if (cards.length === 0) {
      renderVisualEmptyState('No concept cards could be extracted from this document.');
      return;
    }

    const title = data.title || (currentModalItem ? (currentModalItem.title || currentModalItem.filename) : 'Key Concepts');
    const summary = data.summary || '';

    workspace.innerHTML = `
      <div class="rx-visual-header">
        <div class="rx-visual-header-left">
          <span class="rx-visual-pill">✨ Visual Learning</span>
          <h2 class="rx-visual-doc-title">${escapeVisualHtml(title)}</h2>
          ${summary ? `<p class="rx-visual-summary">${escapeVisualHtml(summary)}</p>` : ''}
        </div>
        <div class="rx-visual-header-right">
          <span class="rx-visual-count-badge">${cards.length} Key Concept${cards.length === 1 ? '' : 's'}</span>
          <button type="button" class="btn btn-ghost btn-sm rx-visual-refresh-btn" id="rxBtnVisualRegenerate" title="Regenerate concept cards with Gemini AI">🔄 Refresh</button>
        </div>
      </div>

      <div class="rx-concept-cards-grid">
        ${cards.map((card, idx) => `
          <article class="rx-concept-card" data-card-idx="${idx}" data-card-id="${escapeVisualHtml(card.id || 'card-' + (idx + 1))}">
            <div class="rx-card-top-row">
              <span class="rx-card-num-badge">Concept #${idx + 1}</span>
              <button type="button" class="rx-card-tts-btn" data-tts-idx="${idx}" title="Listen to this concept" aria-label="Listen to concept ${escapeVisualHtml(card.term)}">
                <span>🔊</span> Listen
              </button>
            </div>

            <h3 class="rx-card-term">${escapeVisualHtml(card.term)}</h3>

            <div class="rx-card-section">
              <span class="rx-card-section-label">Source Definition</span>
              <p class="rx-card-definition">${escapeVisualHtml(card.definition)}</p>
            </div>

            <div class="rx-card-section rx-card-section--plain">
              <span class="rx-card-section-label">Plain Explanation</span>
              <p class="rx-card-plain">${escapeVisualHtml(card.plainExplanation)}</p>
            </div>

            ${card.keyTakeaway ? `
              <div class="rx-card-takeaway">
                <span class="rx-takeaway-icon">💡</span>
                <div class="rx-takeaway-body">
                  <strong>Takeaway:</strong> ${escapeVisualHtml(card.keyTakeaway)}
                </div>
              </div>
            ` : ''}

            ${card.sourceQuote ? `
              <div class="rx-card-quote">
                <em>"${escapeVisualHtml(card.sourceQuote)}"</em>
              </div>
            ` : ''}
          </article>
        `).join('')}
      </div>
    `;

    // Hook up refresh button
    const refreshBtn = document.getElementById('rxBtnVisualRegenerate');
    if (refreshBtn) {
      refreshBtn.onclick = () => renderVisualLearningView(currentModalItem, true);
    }

    // Hook up per-card TTS
    workspace.querySelectorAll('.rx-card-tts-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.ttsIdx, 10);
        speakConceptCard(cards[idx], idx, btn);
      };
    });
  }

  function speakConceptCard(card, idx, btnEl) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    // If already speaking this card, stop
    if (window.speechSynthesis.speaking && activeVisualSpeechCardIndex === idx) {
      window.speechSynthesis.cancel();
      activeVisualSpeechCardIndex = -1;
      btnEl.classList.remove('speaking');
      btnEl.innerHTML = '<span>🔊</span> Listen';
      return;
    }

    // Stop any existing speech
    window.speechSynthesis.cancel();
    document.querySelectorAll('.rx-card-tts-btn').forEach(b => {
      b.classList.remove('speaking');
      b.innerHTML = '<span>🔊</span> Listen';
    });

    const speakText = `${card.term}. Definition: ${card.definition}. Plain explanation: ${card.plainExplanation}. ${card.keyTakeaway ? 'Key takeaway: ' + card.keyTakeaway : ''}`;
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = selectedSpeechRate || 1.0;

    activeVisualSpeechCardIndex = idx;
    btnEl.classList.add('speaking');
    btnEl.innerHTML = '<span>⏹️</span> Stop';

    utterance.onend = () => {
      activeVisualSpeechCardIndex = -1;
      btnEl.classList.remove('speaking');
      btnEl.innerHTML = '<span>🔊</span> Listen';
    };

    utterance.onerror = () => {
      activeVisualSpeechCardIndex = -1;
      btnEl.classList.remove('speaking');
      btnEl.innerHTML = '<span>🔊</span> Listen';
    };

    window.speechSynthesis.speak(utterance);
  }

  let currentDocPage = 1;
  let totalDocPages = 1;

  function updateDocumentPagination() {
    const isReadX = activeModalMode === 'readx';
    const activeContainer = isReadX ? document.getElementById('rxLayoutCContent') : document.getElementById('modalStandardContainer');
    const pageIndicator = document.getElementById('modalPageIndicator');
    const prevBtn = document.getElementById('modalPrevPageBtn');
    const nextBtn = document.getElementById('modalNextPageBtn');
    const rxCanvasPrev = document.getElementById('rxCanvasPrevPage');
    const rxCanvasNext = document.getElementById('rxCanvasNextPage');

    if (!activeContainer) {
      totalDocPages = 1;
      currentDocPage = 1;
      if (pageIndicator) pageIndicator.textContent = '1 / 1';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }

    const pageBlocks = activeContainer.querySelectorAll('.rx-page-block');
    totalDocPages = Math.max(1, pageBlocks.length);
    if (currentDocPage > totalDocPages) currentDocPage = totalDocPages;
    if (currentDocPage < 1) currentDocPage = 1;

    if (pageIndicator) pageIndicator.textContent = `${currentDocPage} / ${totalDocPages}`;
    const canPrev = (currentDocPage > 1);
    const canNext = (currentDocPage < totalDocPages);

    if (prevBtn) prevBtn.disabled = !canPrev;
    if (nextBtn) nextBtn.disabled = !canNext;
    if (rxCanvasPrev) rxCanvasPrev.disabled = !canPrev;
    if (rxCanvasNext) rxCanvasNext.disabled = !canNext;
  }

  function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalDocPages) return;
    currentDocPage = pageNum;
    updateDocumentPagination();

    const isReadX = activeModalMode === 'readx';
    const activeContainer = isReadX ? document.getElementById('rxLayoutCContent') : document.getElementById('modalStandardContainer');
    if (!activeContainer) return;

    const pageBlocks = activeContainer.querySelectorAll('.rx-page-block');
    const targetPage = pageBlocks[currentDocPage - 1];
    if (targetPage) {
      targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function initPaginationEvents() {
    const prevBtn = document.getElementById('modalPrevPageBtn');
    const nextBtn = document.getElementById('modalNextPageBtn');
    const rxCanvasPrev = document.getElementById('rxCanvasPrevPage');
    const rxCanvasNext = document.getElementById('rxCanvasNextPage');

    const onPrev = (e) => {
      e.preventDefault();
      goToPage(currentDocPage - 1);
    };
    const onNext = (e) => {
      e.preventDefault();
      goToPage(currentDocPage + 1);
    };

    if (prevBtn) prevBtn.onclick = onPrev;
    if (nextBtn) nextBtn.onclick = onNext;
    if (rxCanvasPrev) rxCanvasPrev.onclick = onPrev;
    if (rxCanvasNext) rxCanvasNext.onclick = onNext;
  }

  function renderModalStandardView(item) {
    modalStandardContainer.innerHTML = '';
    const ext = (item.ext || 'file').toLowerCase();
    const activeUrl = (typeof activeBlobUrls !== 'undefined' && activeBlobUrls.get(item.id)) || item.originalDataUrl || '';
    const filename = item.filename || item.title;

    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <img src="${activeUrl || 'assets/placeholder.svg'}" alt="${filename}">
          <p class="text-caption" style="margin-top:0.75rem; color:var(--text-secondary); font-size:0.875rem;">${filename}</p>
        </div>
      `;
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <h3>🎵 ${filename}</h3>
          <audio controls src="${activeUrl}"></audio>
        </div>
      `;
    } else if (['mp4', 'webm', 'mov', 'ogv', 'avi', 'mkv'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <h3>🎬 ${filename}</h3>
          <video controls src="${activeUrl}" style="max-width:100%; max-height:60vh;"></video>
        </div>
      `;
    } else if (ext === 'pdf') {
      if (activeUrl) {
        modalStandardContainer.innerHTML = `<iframe src="${activeUrl}" class="rx-pdf-frame" title="${filename}"></iframe>`;
      } else if (item.content && item.content.trim()) {
        const formatted = formatExtractedContentToHTML(item.content, filename);
        modalStandardContainer.innerHTML = `
          <div class="standard-doc-view">
            <div class="rx-pdf-banner">
              📄 <strong>PDF Extracted Content:</strong> Showing text extracted from original PDF. Click <strong>READX</strong> above for full dyslexia adaptations.
            </div>
            ${formatted}
          </div>
        `;
      } else {
        renderModalFallback(filename, ext, activeUrl);
      }
    } else if (['json', 'xml', 'css', 'js'].includes(ext)) {
      const safeContent = (item.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      modalStandardContainer.innerHTML = `
        <div>
          <h4 style="margin-bottom:0.75rem;">📄 Code / Structured Document View</h4>
          <pre class="rx-code-block"><code>${safeContent || 'Empty content'}</code></pre>
        </div>
      `;
    } else if (item.content && item.content.trim()) {
      const formatted = (item.content || '').startsWith('<') ? item.content : `<p>${(item.content || '').replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      modalStandardContainer.innerHTML = `
        <div class="standard-doc-view">
          ${formatted}
        </div>
      `;
    } else {
      renderModalFallback(filename, ext, activeUrl);
    }
  }

  function renderModalFallback(filename, ext, dataUrl) {
    modalStandardContainer.innerHTML = `
      <div class="empty-state" style="padding:2.5rem 1.5rem; text-align:center;">
        <span class="text-label" style="display:inline-block; margin-bottom:0.5rem;">Preview Unavailable</span>
        <h4 style="margin-bottom:0.5rem; color:var(--text-primary);">${filename}</h4>
        <p style="max-width:480px; margin:0 auto; color:var(--text-secondary); font-size:0.9375rem;">
          Preview is not natively available for .${ext} files in this browser view, but your original file is preserved.
        </p>
        ${dataUrl ? `<a href="${dataUrl}" download="${filename}.${ext}" class="btn btn-outline btn-sm" style="margin-top:1.25rem;">Download Original File</a>` : ''}
      </div>
    `;
  }

  // Converts extracted text into structured HTML preserving original PDF paragraph structure, line breaks, headings, lists, and layout
  function formatExtractedContentToHTML(rawText, docTitle) {
    if (!rawText || !rawText.trim()) {
      return `<p class="empty-state">No readable text extracted.</p>`;
    }

    const trimmed = rawText.trim();
    if (trimmed.startsWith('<div') || trimmed.startsWith('<table')) {
      return trimmed;
    }

    const pages = trimmed.split(/-- Page Break --|<!-- Page \d+ -->/i);
    let fullHtml = '';

    pages.forEach((pageText, idx) => {
      const pageNum = idx + 1;
      let pageHtml = `<div class="rx-page-block" data-page="${pageNum}">`;
      if (pages.length > 1) {
        pageHtml += `<div class="rx-page-divider-label" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; opacity:0.5; margin:2rem 0 1rem 0; border-top:1px dashed rgba(255,255,255,0.15); padding-top:0.5rem;">Page ${pageNum}</div>`;
      }

      let contentStr = pageText.trim();
      const blocks = contentStr.split(/\n\s*\n/);
      blocks.forEach(block => {
        const cleanBlock = block.trim();
        if (!cleanBlock) return;

        const lines = cleanBlock.split(/\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const firstLine = lines[0];

        if (lines.length === 1 && (/^question\s*\d+/i.test(firstLine) || /^chapter\s*\d+/i.test(firstLine) || /^section\s*\d+/i.test(firstLine) || /^input format/i.test(firstLine) || /^output format/i.test(firstLine) || /^sample input/i.test(firstLine) || /^sample output/i.test(firstLine))) {
          pageHtml += `<h3 class="rx-doc-subheading" style="margin-top:1.6rem; margin-bottom:0.6rem;">${firstLine}</h3>`;
        } else if (/^[A-Z0-9\s:,.\-?]{4,60}$/.test(cleanBlock) && !cleanBlock.endsWith('.') && !cleanBlock.includes('http') && lines.length === 1) {
          pageHtml += `<h2 class="rx-doc-heading" style="margin-top:1.8rem; margin-bottom:0.75rem;">${cleanBlock}</h2>`;
        } else if (/^[\u2022\u25E6\u2023\-*]\s+/.test(cleanBlock)) {
          const itemText = lines.map(l => l.replace(/^[\u2022\u25E6\u2023\-*]\s+/, '')).join('<br>');
          pageHtml += `<ul><li>${itemText}</li></ul>`;
        } else if (/^\d+[\.\)]\s+/.test(cleanBlock)) {
          const itemText = lines.map(l => l.replace(/^\d+[\.\)]\s+/, '')).join('<br>');
          pageHtml += `<ol><li>${itemText}</li></ol>`;
        } else {
          pageHtml += `<p style="margin-bottom:1.4rem;">${lines.join('<br>')}</p>`;
        }
      });

      pageHtml += '</div>';
      fullHtml += pageHtml;
    });

    return fullHtml;
  }

  function wrapSentencesInElement(containerEl) {
    if (!containerEl) return;
    const textNodes = [];

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue && node.nodeValue.trim().length > 0 && (!node.parentNode || !node.parentNode.classList || !node.parentNode.classList.contains('sentence'))) {
          textNodes.push(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE', 'BUTTON'].includes(node.tagName)) {
        node.childNodes.forEach(walk);
      }
    }

    walk(containerEl);

    textNodes.forEach(tn => {
      const text = tn.nodeValue;
      const parts = text.split(/([^.!?]+[.!?]+(?:\s+|$))/g).filter(Boolean);
      if (parts.length > 1) {
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
          if (part.trim().length > 0) {
            const span = document.createElement('span');
            span.className = 'sentence';
            span.textContent = part;
            frag.appendChild(span);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });
        if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
      } else {
        const span = document.createElement('span');
        span.className = 'sentence';
        span.textContent = text;
        if (tn.parentNode) tn.parentNode.replaceChild(span, tn);
      }
    });
  }

  function renderModalReadXView(item, hasText) {
    const canvasContent = document.getElementById('rxLayoutCContent');
    const pageIndicator = document.getElementById('modalPageIndicator');
    const prevBtn = document.getElementById('rxCanvasPrevPage');
    const nextBtn = document.getElementById('rxCanvasNextPage');

    if (!canvasContent) return;

    if (!hasText || !item || !item.content) {
      canvasContent.innerHTML = `
        <div class="empty-state" style="margin-top:3rem;">
          <span class="text-label">Original Document Preserved</span>
          <p>READX text adaptation is unavailable for this binary format. Please view the document under Standard Reading mode.</p>
        </div>
      `;
      return;
    }

    const formattedHtml = formatExtractedContentToHTML(item.content, item.title || item.filename);
    canvasContent.innerHTML = `
      <h1 class="rx-doc-title-header">${item.title || item.filename || 'Document'}</h1>
      ${formattedHtml}
    `;

    wrapSentencesInElement(canvasContent);

    const userSettings = getReadXUserSettings();
    applySettingsToReadXCanvas(userSettings);
    updateDocumentPagination();
    bindBottomToolbarEvents(userSettings);
  }

  function bindBottomToolbarEvents(settings) {
    const btnFontDec = document.getElementById('rxBtnFontDec');
    const btnFontInc = document.getElementById('rxBtnFontInc');
    const btnTheme = document.getElementById('rxBtnTheme');
    const themePopover = document.getElementById('rxThemePopover');
    const btnFontFamily = document.getElementById('rxBtnFontFamily');
    const fontPopover = document.getElementById('rxFontPopover');
    const btnSpacing = document.getElementById('rxBtnSpacing');
    const spacingPopover = document.getElementById('rxSpacingPopover');
    const btnRuler = document.getElementById('rxBtnRuler');
    const btnFocus = document.getElementById('rxBtnFocus');
    const btnTts = document.getElementById('rxBtnTts');

    const rulerOverlay = document.getElementById('rxModalReadingRuler');
    const focusOverlay = document.getElementById('rxModalFocusLine');
    const canvasContainer = document.getElementById('rxLayoutCCanvas');

    let current = { ...settings };

    function closeAllPopovers() {
      if (themePopover) themePopover.hidden = true;
      if (fontPopover) fontPopover.hidden = true;
      if (spacingPopover) spacingPopover.hidden = true;
    }

    function togglePopover(popoverEl) {
      if (!popoverEl) return;
      const isHidden = popoverEl.hidden;
      closeAllPopovers();
      if (isHidden) {
        popoverEl.hidden = false;
        popoverEl.style.left = '50%';
        popoverEl.style.transform = 'translateX(-50%)';

        requestAnimationFrame(() => {
          const modalContainer = document.getElementById('rxReaderModal') || document.body;
          const modalRect = modalContainer.getBoundingClientRect();
          const popoverRect = popoverEl.getBoundingClientRect();

          if (popoverRect.left < modalRect.left + 12) {
            const shiftRight = (modalRect.left + 12) - popoverRect.left;
            popoverEl.style.transform = `translateX(calc(-50% + ${shiftRight}px))`;
          } else if (popoverRect.right > modalRect.right - 12) {
            const shiftLeft = popoverRect.right - (modalRect.right - 12);
            popoverEl.style.transform = `translateX(calc(-50% - ${shiftLeft}px))`;
          }
        });
      }
    }

    if (btnFontDec) {
      btnFontDec.onclick = () => {
        current.textSize = Math.max(14, (current.textSize || 18) - 1);
        saveReadXUserSettings(current);
      };
    }

    if (btnFontInc) {
      btnFontInc.onclick = () => {
        current.textSize = Math.min(32, (current.textSize || 18) + 1);
        saveReadXUserSettings(current);
      };
    }

    if (btnTheme && themePopover) {
      themePopover.onclick = (e) => e.stopPropagation();
      btnTheme.onclick = (e) => {
        e.stopPropagation();
        togglePopover(themePopover);
      };
      themePopover.querySelectorAll('.rx-popover-opt').forEach(opt => {
        opt.onclick = (e) => {
          e.stopPropagation();
          current.theme = opt.dataset.theme || 'dark';
          saveReadXUserSettings(current);
          closeAllPopovers();
        };
      });
    }

    if (btnFontFamily && fontPopover) {
      fontPopover.onclick = (e) => e.stopPropagation();
      btnFontFamily.onclick = (e) => {
        e.stopPropagation();
        togglePopover(fontPopover);
      };
      fontPopover.querySelectorAll('.rx-popover-opt').forEach(opt => {
        opt.onclick = (e) => {
          e.stopPropagation();
          current.fontFamily = opt.dataset.font || 'inherit';
          saveReadXUserSettings(current);
          closeAllPopovers();
        };
      });
    }

    if (btnSpacing && spacingPopover) {
      spacingPopover.onclick = (e) => e.stopPropagation();
      btnSpacing.onclick = (e) => {
        e.stopPropagation();
        togglePopover(spacingPopover);
      };

      const sliderLine = document.getElementById('rxSliderLineHeight');
      const valLine = document.getElementById('rxValLineHeight');
      if (sliderLine) {
        sliderLine.value = current.lineHeight || 1.85;
        if (valLine) valLine.textContent = Number(current.lineHeight || 1.85).toFixed(2);
        sliderLine.oninput = (e) => {
          current.lineHeight = parseFloat(e.target.value);
          if (valLine) valLine.textContent = Number(current.lineHeight).toFixed(2);
          saveReadXUserSettings(current);
        };
      }

      const sliderLetter = document.getElementById('rxSliderLetterSpacing');
      const valLetter = document.getElementById('rxValLetterSpacing');
      if (sliderLetter) {
        sliderLetter.value = current.letterSpacing !== undefined ? current.letterSpacing : 0.04;
        if (valLetter) valLetter.textContent = (current.letterSpacing !== undefined ? current.letterSpacing : 0.04) + 'em';
        sliderLetter.oninput = (e) => {
          current.letterSpacing = parseFloat(e.target.value);
          if (valLetter) valLetter.textContent = current.letterSpacing + 'em';
          saveReadXUserSettings(current);
        };
      }
    }

    if (btnRuler && rulerOverlay) {
      btnRuler.classList.toggle('active', Boolean(current.rulerEnabled));
      rulerOverlay.style.display = current.rulerEnabled ? 'block' : 'none';

      btnRuler.onclick = () => {
        current.rulerEnabled = !current.rulerEnabled;
        btnRuler.classList.toggle('active', current.rulerEnabled);
        rulerOverlay.style.display = current.rulerEnabled ? 'block' : 'none';
        saveReadXUserSettings(current);
      };
    }

    if (btnFocus && focusOverlay) {
      btnFocus.classList.toggle('active', Boolean(current.readingFocus));
      focusOverlay.style.display = current.readingFocus ? 'block' : 'none';

      btnFocus.onclick = () => {
        current.readingFocus = !current.readingFocus;
        btnFocus.classList.toggle('active', current.readingFocus);
        focusOverlay.style.display = current.readingFocus ? 'block' : 'none';
        saveReadXUserSettings(current);
      };
    }

    if (canvasContainer) {
      canvasContainer.onmousemove = (e) => {
        const rect = canvasContainer.getBoundingClientRect();
        const relY = e.clientY - rect.top;
        if (rulerOverlay && current.rulerEnabled) {
          rulerOverlay.style.top = Math.max(0, relY - 24) + 'px';
        }
        if (focusOverlay && current.readingFocus) {
          focusOverlay.style.top = Math.max(0, relY - 12) + 'px';
        }
      };
    }

    if (btnTts) {
      btnTts.classList.toggle('active', isModalSpeaking);
      btnTts.onclick = () => {
        if (isModalSpeaking) {
          stopModalSpeech();
        } else {
          startModalSpeech();
        }
      };
    }

    document.onclick = (e) => {
      if (!e.target.closest('.rx-bar-dropdown-wrapper')) {
        closeAllPopovers();
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllPopovers();
      }
    });
  }

  modalBtnStandard.addEventListener('click', () => switchModalMode('standard'));
  modalBtnReadX.addEventListener('click', () => {
    const hasText = currentModalItem && currentModalItem.hasExtractableText !== false && currentModalItem.isReadable !== false && Boolean(currentModalItem.content && currentModalItem.content.trim());
    if (!hasText) {
      alert("READX adaptation isn't available for this file type.");
      return;
    }
    switchModalMode('readx');
  });
  if (modalBtnVisual) {
    modalBtnVisual.addEventListener('click', () => {
      const hasText = currentModalItem && currentModalItem.hasExtractableText !== false && currentModalItem.isReadable !== false && Boolean(currentModalItem.content && currentModalItem.content.trim());
      if (!hasText) {
        alert("Visual Learning isn't available for this file type.");
        return;
      }
      switchModalMode('visual');
    });
  }

  modalCloseBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (modalTtsBtn) {
    modalTtsBtn.addEventListener('click', () => startModalSpeech());
  }
  const modalTtsStopBtn = document.getElementById('modalTtsStopBtn');
  if (modalTtsStopBtn) {
    modalTtsStopBtn.addEventListener('click', () => stopModalSpeech());
  }

  // Modal Zoom Controls
  let currentZoom = 100;
  const modalZoomOutBtn = document.getElementById('modalZoomOutBtn');
  const modalZoomInBtn = document.getElementById('modalZoomInBtn');
  const modalZoomIndicator = document.getElementById('modalZoomIndicator');

  function updateZoom(newZoom) {
    currentZoom = Math.min(200, Math.max(50, newZoom));
    if (modalZoomIndicator) modalZoomIndicator.textContent = currentZoom + '%';
    const canvas = document.getElementById('rxLayoutCCanvas');
    const std = document.getElementById('modalStandardContainer');
    if (canvas) canvas.style.fontSize = `${(getReadXUserSettings().textSize || 18) * (currentZoom / 100)}px`;
    if (std) std.style.zoom = (currentZoom / 100);
  }

  if (modalZoomOutBtn) {
    modalZoomOutBtn.addEventListener('click', () => updateZoom(currentZoom - 10));
  }
  if (modalZoomInBtn) {
    modalZoomInBtn.addEventListener('click', () => updateZoom(currentZoom + 10));
  }

  initPaginationEvents();
  initSelectionAiToolbar();

  // Contextual Selection Toolbar & Personalised Dyslexia Reading Studio (Works identically in Standard and ReadX modes)
  function initSelectionAiToolbar() {
    const toolbar = document.getElementById('rxSelectionAiToolbar');
    const btnAnalyze = document.getElementById('rxAiBtnAnalyze'); // Focus Line
    const btnSummarize = document.getElementById('rxAiBtnSummarizeDoc'); // Read Aloud
    const drawer = document.getElementById('rxAiResultDrawer');
    const drawerTitle = document.getElementById('rxAiDrawerTitle');
    const drawerQuote = document.getElementById('rxAiDrawerQuote');
    const drawerContent = document.getElementById('rxAiContent');
    const drawerLoading = document.getElementById('rxAiLoading');
    const drawerClose = document.getElementById('rxAiDrawerClose');
    const copyBtn = document.getElementById('rxAiCopyBtn');

    // Dyslexia Focus Line Reading Studio Overlay Elements
    const focusOverlay = document.getElementById('rxLineFocusOverlay');
    const focusBackdrop = document.getElementById('rxLineFocusBackdrop');
    const focusCard = document.getElementById('rxFocusedLineCard');
    const focusTextEl = document.getElementById('rxFocusedLineText');
    const focusCloseBtn = document.getElementById('rxFocusedCloseBtn');
    const focusTtsBtn = document.getElementById('rxFocusedTtsBtn');
    const resetBtn = document.getElementById('rxStudioResetBtn');

    // Studio Customisation Controls
    const fontSelect = document.getElementById('rxStudioFontSelect');
    const fontDecBtn = document.getElementById('rxStudioFontDec');
    const fontIncBtn = document.getElementById('rxStudioFontInc');
    const fontValBadge = document.getElementById('rxStudioFontVal');

    const lineDecBtn = document.getElementById('rxStudioLineDec');
    const lineIncBtn = document.getElementById('rxStudioLineInc');
    const lineValBadge = document.getElementById('rxStudioLineVal');

    const letterDecBtn = document.getElementById('rxStudioLetterDec');
    const letterIncBtn = document.getElementById('rxStudioLetterInc');
    const letterValBadge = document.getElementById('rxStudioLetterVal');

    const wordDecBtn = document.getElementById('rxStudioWordDec');
    const wordIncBtn = document.getElementById('rxStudioWordInc');
    const wordValBadge = document.getElementById('rxStudioWordVal');

    if (!toolbar) return;

    let selectedText = '';
    let currentFocusedText = '';
    let isSelectionSpeaking = false;
    let activeSpeakingBtn = null;
    let sentenceSpans = [];

    // ── Studio Settings & Accessible Color Themes ────────────────────────
    const defaultStudioSettings = {
      fontSize: 24, // in px (range: 16 - 36)
      lineHeight: 2.0, // (range: 1.4 - 2.6)
      letterSpacing: 0.035, // in em (range: 0.0 - 0.15)
      wordSpacing: 0.08, // in em (range: 0.0 - 0.30)
      fontFamily: "'Lexend', sans-serif",
      theme: 'dark'
    };

    let studioSettings = { ...defaultStudioSettings };

    const STUDIO_THEMES = {
      dark: {
        bg: '#1B1E17',
        cardBg: '#23271F',
        text: '#F1EFE7',
        border: 'rgba(138, 149, 96, 0.45)',
        accent: '#C6D19B',
        toolbarBg: 'rgba(0, 0, 0, 0.28)',
        btnBg: 'rgba(138, 149, 96, 0.18)',
        btnText: '#F1EFE7',
        btnBorder: 'rgba(138, 149, 96, 0.35)',
        highlight: 'rgba(198, 209, 155, 0.38)'
      },
      cream: {
        bg: '#FBF9F1',
        cardBg: '#F3EFE4',
        text: '#1D2018',
        border: 'rgba(145, 125, 80, 0.35)',
        accent: '#7A5E2E',
        toolbarBg: 'rgba(235, 227, 214, 0.75)',
        btnBg: 'rgba(145, 125, 80, 0.12)',
        btnText: '#1D2018',
        btnBorder: 'rgba(145, 125, 80, 0.3)',
        highlight: 'rgba(215, 180, 110, 0.38)'
      },
      blue: {
        bg: '#EAF2F8',
        cardBg: '#DFECF5',
        text: '#112333',
        border: 'rgba(70, 115, 160, 0.35)',
        accent: '#205E9E',
        toolbarBg: 'rgba(215, 230, 242, 0.75)',
        btnBg: 'rgba(70, 115, 160, 0.12)',
        btnText: '#112333',
        btnBorder: 'rgba(70, 115, 160, 0.3)',
        highlight: 'rgba(90, 160, 230, 0.35)'
      },
      green: {
        bg: '#ECF5EE',
        cardBg: '#E0ECE2',
        text: '#122A17',
        border: 'rgba(65, 125, 75, 0.35)',
        accent: '#246D36',
        toolbarBg: 'rgba(216, 233, 219, 0.75)',
        btnBg: 'rgba(65, 125, 75, 0.12)',
        btnText: '#122A17',
        btnBorder: 'rgba(65, 125, 75, 0.3)',
        highlight: 'rgba(100, 195, 125, 0.35)'
      }
    };

    function applyStudioSettings() {
      if (!focusCard) return;

      // 1. Update CSS custom variables on card container
      focusCard.style.setProperty('--rx-focus-font-size', `${studioSettings.fontSize}px`);
      focusCard.style.setProperty('--rx-focus-line-height', `${studioSettings.lineHeight}`);
      focusCard.style.setProperty('--rx-focus-letter-spacing', `${studioSettings.letterSpacing}em`);
      focusCard.style.setProperty('--rx-focus-word-spacing', `${studioSettings.wordSpacing}em`);
      focusCard.style.setProperty('--rx-focus-font-family', studioSettings.fontFamily);

      const theme = STUDIO_THEMES[studioSettings.theme] || STUDIO_THEMES.dark;
      focusCard.style.setProperty('--rx-focus-bg', theme.bg);
      focusCard.style.setProperty('--rx-focus-card-bg', theme.cardBg);
      focusCard.style.setProperty('--rx-focus-text', theme.text);
      focusCard.style.setProperty('--rx-focus-border', theme.border);
      focusCard.style.setProperty('--rx-focus-accent', theme.accent);
      focusCard.style.setProperty('--rx-focus-toolbar-bg', theme.toolbarBg);
      focusCard.style.setProperty('--rx-focus-btn-bg', theme.btnBg);
      focusCard.style.setProperty('--rx-focus-btn-text', theme.btnText);
      focusCard.style.setProperty('--rx-focus-btn-border', theme.btnBorder);
      focusCard.style.setProperty('--rx-focus-highlight', theme.highlight);

      // 2. Enforce directly on focusTextEl with !important to defeat any conflicting rules
      if (focusTextEl) {
        focusTextEl.style.setProperty('font-family', studioSettings.fontFamily, 'important');
        focusTextEl.style.setProperty('font-size', `${studioSettings.fontSize}px`, 'important');
        focusTextEl.style.setProperty('line-height', `${studioSettings.lineHeight}`, 'important');
        focusTextEl.style.setProperty('letter-spacing', `${studioSettings.letterSpacing}em`, 'important');
        focusTextEl.style.setProperty('word-spacing', `${studioSettings.wordSpacing}em`, 'important');
        focusTextEl.style.setProperty('color', theme.text, 'important');
      }

      // 3. Keep numeric value indicators synchronized
      if (fontValBadge) fontValBadge.textContent = `${studioSettings.fontSize}px`;
      if (lineValBadge) lineValBadge.textContent = studioSettings.lineHeight.toFixed(1);
      if (letterValBadge) letterValBadge.textContent = `${studioSettings.letterSpacing.toFixed(3)}em`;
      if (wordValBadge) wordValBadge.textContent = `${studioSettings.wordSpacing.toFixed(2)}em`;

      // 4. Update button disabled states when limits are reached
      if (fontDecBtn) fontDecBtn.disabled = studioSettings.fontSize <= 16;
      if (fontIncBtn) fontIncBtn.disabled = studioSettings.fontSize >= 36;
      if (lineDecBtn) lineDecBtn.disabled = studioSettings.lineHeight <= 1.4;
      if (lineIncBtn) lineIncBtn.disabled = studioSettings.lineHeight >= 2.6;
      if (letterDecBtn) letterDecBtn.disabled = studioSettings.letterSpacing <= 0.00;
      if (letterIncBtn) letterIncBtn.disabled = studioSettings.letterSpacing >= 0.15;
      if (wordDecBtn) wordDecBtn.disabled = studioSettings.wordSpacing <= 0.00;
      if (wordIncBtn) wordIncBtn.disabled = studioSettings.wordSpacing >= 0.30;

      // 5. Synchronize font family select dropdown
      if (fontSelect && fontSelect.value !== studioSettings.fontFamily) {
        fontSelect.value = studioSettings.fontFamily;
      }

      // 6. Synchronize active theme swatch
      const swatchesEl = focusCard.querySelectorAll('.rx-studio-swatch');
      swatchesEl.forEach(s => {
        const isCurrent = s.getAttribute('data-theme') === studioSettings.theme;
        s.classList.toggle('active', isCurrent);
        s.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
      });

      // 7. Update footer theme indicator if present
      const presetNameEl = document.getElementById('rxFocusedPresetName');
      if (presetNameEl) {
        const names = { dark: 'Dark Graphite', cream: 'Warm Cream', blue: 'Soft Blue', green: 'Soft Green' };
        presetNameEl.textContent = names[studioSettings.theme] || 'Custom';
      }
    }

    function resetStudioSettings() {
      studioSettings = { ...defaultStudioSettings };
      applyStudioSettings();
    }

    // Prevent toolbar click from clearing the current text selection
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    function hideToolbar() {
      if (toolbar) {
        toolbar.style.display = 'none';
        toolbar.setAttribute('aria-hidden', 'true');
      }
    }

    function updateToolbarPosition() {
      const modalEl = document.getElementById('rxReaderModal');
      if (!modalEl || !modalEl.classList.contains('active')) {
        hideToolbar();
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        hideToolbar();
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        hideToolbar();
        return;
      }

      const anchorNode = selection.anchorNode;
      const anchorEl = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
      if (!anchorEl || anchorEl.closest('#rxSelectionAiToolbar') || anchorEl.closest('#rxAiResultDrawer') || anchorEl.closest('#rxFocusedLineCard')) {
        return;
      }

      const isInsideDoc = anchorEl.closest('#modalStandardContainer') || anchorEl.closest('#modalReadXContainer') || anchorEl.closest('.rx-modal-body') || anchorEl.closest('.standard-doc-view');
      if (!isInsideDoc) {
        hideToolbar();
        return;
      }

      if (isSelectionSpeaking && selectedText && selectedText !== text) {
        stopSelectionSpeech();
      }

      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if ((rect.width === 0 && rect.height === 0) || rect.bottom < 50 || rect.top > window.innerHeight - 20) {
        hideToolbar();
        return;
      }

      toolbar.style.display = 'inline-flex';
      toolbar.removeAttribute('aria-hidden');

      const tbWidth = toolbar.offsetWidth || 230;
      const tbHeight = toolbar.offsetHeight || 38;
      const gap = 10;

      const selCenter = rect.left + (rect.width / 2);
      let left = selCenter - (tbWidth / 2);

      const minLeft = 16;
      const maxLeft = window.innerWidth - tbWidth - 16;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      const modalHeader = document.querySelector('.rx-modal-header');
      const topBoundary = modalHeader ? (modalHeader.getBoundingClientRect().bottom + 8) : 58;
      
      let top = rect.top - tbHeight - gap;
      if (top < topBoundary) {
        top = rect.bottom + gap;
      }

      const maxTop = window.innerHeight - tbHeight - 16;
      top = Math.max(topBoundary, Math.min(top, maxTop));

      toolbar.style.top = `${Math.round(top)}px`;
      toolbar.style.left = `${Math.round(left)}px`;
    }

    document.addEventListener('mouseup', (e) => {
      if (e.target.closest('#rxSelectionAiToolbar') || e.target.closest('#rxAiResultDrawer') || e.target.closest('#rxFocusedLineCard')) return;
      setTimeout(updateToolbarPosition, 30);
    });

    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#rxSelectionAiToolbar') || e.target.closest('#rxAiResultDrawer') || e.target.closest('#rxFocusedLineCard')) return;
      setTimeout(updateToolbarPosition, 80);
    });

    document.addEventListener('keyup', (e) => {
      if (e.target.closest('#rxSelectionAiToolbar') || e.target.closest('#rxAiResultDrawer') || e.target.closest('#rxFocusedLineCard')) return;
      setTimeout(updateToolbarPosition, 30);
    });

    document.addEventListener('selectionchange', () => {
      const modalEl = document.getElementById('rxReaderModal');
      if (modalEl && modalEl.classList.contains('active')) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          hideToolbar();
        }
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('#rxSelectionAiToolbar') && !e.target.closest('#rxAiResultDrawer') && !e.target.closest('#rxFocusedLineCard')) {
        hideToolbar();
      }
    });

    const onScrollOrResize = () => {
      if (toolbar && toolbar.style.display !== 'none') {
        requestAnimationFrame(updateToolbarPosition);
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    const stdContainer = document.getElementById('modalStandardContainer');
    if (stdContainer) stdContainer.addEventListener('scroll', onScrollOrResize, { passive: true });

    const rxContainer = document.getElementById('modalReadXContainer');
    if (rxContainer) rxContainer.addEventListener('scroll', onScrollOrResize, { passive: true });

    const modalBody = document.querySelector('.rx-modal-body');
    if (modalBody) modalBody.addEventListener('scroll', onScrollOrResize, { passive: true });

    // ── Sentence Highlighting Helpers for Read Aloud ─────────────
    function setupSentenceSpans(text) {
      if (!focusTextEl) return;
      const regex = /[^.!?]+(?:[.!?]+["']?(?:\s+|$)|$)/g;
      const matches = text.match(regex);
      if (!matches || matches.length <= 1) {
        focusTextEl.textContent = text;
        sentenceSpans = [];
        return;
      }

      focusTextEl.innerHTML = '';
      sentenceSpans = [];
      let cumulativeLength = 0;

      matches.forEach((sentence, idx) => {
        const span = document.createElement('span');
        span.className = 'rx-focus-sentence';
        span.id = `rxFocusSent_${idx}`;
        span.textContent = sentence;
        span.dataset.start = cumulativeLength;
        span.dataset.end = cumulativeLength + sentence.length;
        cumulativeLength += sentence.length;

        focusTextEl.appendChild(span);
        sentenceSpans.push(span);
      });
    }

    function clearSentenceHighlights() {
      if (focusTextEl && currentFocusedText) {
        focusTextEl.textContent = currentFocusedText;
      }
      sentenceSpans = [];
    }

    // ── Focus Line Studio Opening & Closing ────────────────────────
    function openLineFocus(text) {
      if (isSelectionSpeaking) {
        stopSelectionSpeech();
      }

      if (!text || !text.trim()) return;
      currentFocusedText = text;

      // 1. Subtle blur and dim surrounding reading content
      if (stdContainer) stdContainer.classList.add('rx-reading-dimmed');
      if (rxContainer) rxContainer.classList.add('rx-reading-dimmed');

      // 2. Display selected text exactly in focused card
      if (focusTextEl) {
        focusTextEl.textContent = currentFocusedText;
      }

      // 3. Apply active studio customisations immediately
      applyStudioSettings();

      // 4. Reveal overlay
      if (focusOverlay) {
        focusOverlay.style.display = 'flex';
        focusOverlay.removeAttribute('aria-hidden');
      }

      // 5. Reset card TTS button to idle state
      if (focusTtsBtn) {
        focusTtsBtn.classList.remove('speaking');
        const icon = focusTtsBtn.querySelector('.rx-focused-tts-icon');
        const label = focusTtsBtn.querySelector('.rx-focused-tts-label');
        if (icon) icon.textContent = '🔊';
        if (label) label.textContent = 'Read Aloud';
      }

      hideToolbar();
      if (focusCard) {
        try { focusCard.focus(); } catch (e) {}
      }
    }

    closeLineFocus = function () {
      if (isSelectionSpeaking) {
        stopSelectionSpeech();
      }
      clearSentenceHighlights();

      if (stdContainer) stdContainer.classList.remove('rx-reading-dimmed');
      if (rxContainer) rxContainer.classList.remove('rx-reading-dimmed');

      if (focusOverlay) {
        focusOverlay.style.display = 'none';
        focusOverlay.setAttribute('aria-hidden', 'true');
      }
      if (focusTextEl) {
        focusTextEl.textContent = '';
      }
      currentFocusedText = '';
    };

    // ── Read Aloud Logic (Selected text only) ──────────────────────
    function updateSpeechButtonUI(speaking, btn) {
      if (!btn) return;
      if (btn === focusTtsBtn) {
        const icon = btn.querySelector('.rx-focused-tts-icon');
        const label = btn.querySelector('.rx-focused-tts-label');
        if (speaking) {
          btn.classList.add('speaking');
          btn.setAttribute('aria-label', 'Stop reading aloud');
          if (icon) icon.textContent = '⏹️';
          if (label) label.textContent = 'Stop';
        } else {
          btn.classList.remove('speaking');
          btn.setAttribute('aria-label', 'Read focused text aloud');
          if (icon) icon.textContent = '🔊';
          if (label) label.textContent = 'Read Aloud';
        }
      } else if (btn === btnSummarize) {
        if (speaking) {
          btn.classList.add('speaking');
          btn.setAttribute('aria-label', 'Stop reading aloud');
          btn.innerHTML = '<span class="rx-ai-icon">⏹️</span> Stop';
        } else {
          btn.classList.remove('speaking');
          btn.setAttribute('aria-label', 'Read selected text aloud');
          btn.innerHTML = '<span class="rx-ai-icon">🔊</span> Read Aloud';
        }
      }
    }

    function toggleSelectionSpeech(text, btnEl) {
      if (!text || !text.trim()) return;

      if (isSelectionSpeaking) {
        stopSelectionSpeech();
        return;
      }

      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis is not supported in this browser.');
        return;
      }

      stopModalSpeech();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = selectedSpeechRate || 1.0;

      // Setup non-destructive sentence spans if reading in studio
      if (focusOverlay && focusOverlay.style.display !== 'none' && currentFocusedText === text) {
        setupSentenceSpans(text.trim());
      }

      isSelectionSpeaking = true;
      activeSpeakingBtn = btnEl;
      updateSpeechButtonUI(true, btnEl);

      utterance.onboundary = (e) => {
        if (sentenceSpans.length > 0 && typeof e.charIndex === 'number') {
          const charIdx = e.charIndex;
          sentenceSpans.forEach(span => {
            const start = parseInt(span.dataset.start, 10);
            const end = parseInt(span.dataset.end, 10);
            const isActive = charIdx >= start && charIdx < end;
            span.classList.toggle('rx-focus-active-sentence', isActive);
          });
        }
      };

      utterance.onend = () => {
        isSelectionSpeaking = false;
        updateSpeechButtonUI(false, btnEl);
        clearSentenceHighlights();
        activeSpeakingBtn = null;
      };

      utterance.onerror = () => {
        isSelectionSpeaking = false;
        updateSpeechButtonUI(false, btnEl);
        clearSentenceHighlights();
        activeSpeakingBtn = null;
      };

      window.speechSynthesis.speak(utterance);
    }

    stopSelectionSpeech = function () {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isSelectionSpeaking = false;
      clearSentenceHighlights();
      if (activeSpeakingBtn) {
        updateSpeechButtonUI(false, activeSpeakingBtn);
        activeSpeakingBtn = null;
      }
      if (btnSummarize) updateSpeechButtonUI(false, btnSummarize);
      if (focusTtsBtn) updateSpeechButtonUI(false, focusTtsBtn);
    };

    // ── Studio Control Event Listeners ─────────────────────────────
    // Font Family Selection
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        studioSettings.fontFamily = e.target.value;
        applyStudioSettings();
      });
    }

    // Font Size Adjusters (16px to 36px)
    if (fontDecBtn) {
      fontDecBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.fontSize = Math.max(16, studioSettings.fontSize - 2);
        applyStudioSettings();
      });
    }
    if (fontIncBtn) {
      fontIncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.fontSize = Math.min(36, studioSettings.fontSize + 2);
        applyStudioSettings();
      });
    }

    // Line Height Adjusters (1.4 to 2.6)
    if (lineDecBtn) {
      lineDecBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.lineHeight = Math.max(1.4, Math.round((studioSettings.lineHeight - 0.1) * 10) / 10);
        applyStudioSettings();
      });
    }
    if (lineIncBtn) {
      lineIncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.lineHeight = Math.min(2.6, Math.round((studioSettings.lineHeight + 0.1) * 10) / 10);
        applyStudioSettings();
      });
    }

    // Letter Spacing Adjusters (0.00em to 0.15em)
    if (letterDecBtn) {
      letterDecBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.letterSpacing = Math.max(0.0, Math.round((studioSettings.letterSpacing - 0.01) * 1000) / 1000);
        applyStudioSettings();
      });
    }
    if (letterIncBtn) {
      letterIncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.letterSpacing = Math.min(0.15, Math.round((studioSettings.letterSpacing + 0.01) * 1000) / 1000);
        applyStudioSettings();
      });
    }

    // Word Spacing Adjusters (0.00em to 0.30em)
    if (wordDecBtn) {
      wordDecBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.wordSpacing = Math.max(0.0, Math.round((studioSettings.wordSpacing - 0.02) * 100) / 100);
        applyStudioSettings();
      });
    }
    if (wordIncBtn) {
      wordIncBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        studioSettings.wordSpacing = Math.min(0.30, Math.round((studioSettings.wordSpacing + 0.02) * 100) / 100);
        applyStudioSettings();
      });
    }

    // Contrast / Color Theme Presets
    if (focusCard) {
      const swatches = focusCard.querySelectorAll('.rx-studio-swatch');
      swatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
          e.stopPropagation();
          const chosenTheme = swatch.getAttribute('data-theme');
          if (chosenTheme && STUDIO_THEMES[chosenTheme]) {
            studioSettings.theme = chosenTheme;
            applyStudioSettings();
          }
        });
      });
    }

    // Reset All Studio Settings
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetStudioSettings();
      });
    }

    // Action 1: Focus Line (Replaces Analyze)
    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', (e) => {
        e.stopPropagation();
        const textToFocus = selectedText || (window.getSelection() ? window.getSelection().toString().trim() : '');
        if (!textToFocus) return;
        openLineFocus(textToFocus);
      });
    }

    // Action 2: Read Aloud (Replaces Summarize PDF)
    if (btnSummarize) {
      btnSummarize.addEventListener('click', (e) => {
        e.stopPropagation();
        const textToRead = selectedText || currentFocusedText || (window.getSelection() ? window.getSelection().toString().trim() : '');
        if (!textToRead) return;
        toggleSelectionSpeech(textToRead, btnSummarize);
      });
    }

    // Card Exit and Read Aloud Controls
    if (focusCloseBtn) {
      focusCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLineFocus();
      });
    }

    if (focusBackdrop) {
      focusBackdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLineFocus();
      });
    }

    if (focusTtsBtn) {
      focusTtsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentFocusedText) {
          toggleSelectionSpeech(currentFocusedText, focusTtsBtn);
        }
      });
    }

        // Keyboard Shortcuts: Esc to Exit, Space to Toggle Read Aloud
    document.addEventListener('keydown', (e) => {
      if (focusOverlay && focusOverlay.style.display !== 'none') {
        if (e.key === 'Escape') {
          closeLineFocus();
        } else if (e.key === ' ') {
          const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
          if (activeTag !== 'select' && activeTag !== 'input' && activeTag !== 'textarea') {
            e.preventDefault();
            if (currentFocusedText) {
              toggleSelectionSpeech(currentFocusedText, focusTtsBtn);
            }
          }
        }
      }
    });

    // ── AI Drawer Functionality & Backwards Compatibility ──────────
    async function analyzeSelectedText(text) {
      if (!text) return;
      openAiDrawer('Text Analysis', text);
      try {
        if (drawerLoading) drawerLoading.style.display = 'flex';
        if (drawerContent) drawerContent.innerHTML = '';
        const result = await ReadXGemini.explainConcept(text);
        renderFormattedAiResult(result);
      } catch (err) {
        renderAiError(err.message);
      } finally {
        if (drawerLoading) drawerLoading.style.display = 'none';
      }
    }

    async function summarizeDocument() {
      let docText = '';
      if (currentModalItem && currentModalItem.content && currentModalItem.content.trim()) {
        docText = currentModalItem.content;
      } else {
        const stdDoc = document.getElementById('modalStandardContainer');
        const rxDoc = document.getElementById('rxLayoutCContent');
        docText = (stdDoc?.textContent || rxDoc?.textContent || '').trim();
      }
      if (!docText || docText.length < 10) {
        openAiDrawer('Document Summary', '');
        renderAiError('No readable document content found to summarize.');
        return;
      }
      const docName = (currentModalItem && (currentModalItem.filename || currentModalItem.title)) || 'Document';
      openAiDrawer(`Summary · ${docName}`, docText.slice(0, 160) + '...');
      try {
        if (drawerLoading) drawerLoading.style.display = 'flex';
        if (drawerContent) drawerContent.innerHTML = '';
        const result = await ReadXGemini.summarizeText(docText);
        renderFormattedAiResult(result);
      } catch (err) {
        renderAiError(err.message);
      } finally {
        if (drawerLoading) drawerLoading.style.display = 'none';
      }
    }

    if (typeof window !== 'undefined') {
      window.ReadXSelectionAI = {
        analyzeSelectedText,
        summarizeDocument,
        openAiDrawer,
        closeAiDrawer
      };
    }

    function openAiDrawer(title, quote) {
      if (!drawer) return;
      drawer.style.display = 'flex';
      drawer.removeAttribute('aria-hidden');
      if (drawerTitle) drawerTitle.textContent = title;
      if (drawerQuote) {
        if (quote) {
          drawerQuote.style.display = 'block';
          drawerQuote.textContent = `"${quote.length > 180 ? quote.slice(0, 180) + '...' : quote}"`;
        } else {
          drawerQuote.style.display = 'none';
        }
      }
    }

    function closeAiDrawer() {
      if (drawer) {
        drawer.style.display = 'none';
        drawer.setAttribute('aria-hidden', 'true');
      }
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', closeAiDrawer);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = drawerContent ? drawerContent.textContent : '';
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
          }).catch(() => {});
        }
      });
    }

    function renderFormattedAiResult(rawText) {
      if (!drawerContent || !rawText) return;
      const formatted = rawText
        .replace(/^### (.*$)/gim, '<h4 style="margin:1rem 0 0.4rem; color:var(--text-primary); font-size:1rem; font-weight:700;">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 style="margin:1.2rem 0 0.5rem; color:var(--text-primary); font-size:1.1rem; font-weight:700;">$1</h3>')
        .replace(/^# (.*$)/gim, '<h2 style="margin:1.4rem 0 0.6rem; color:var(--text-primary); font-size:1.2rem; font-weight:700;">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary); font-weight:700;">$1</strong>')
        .replace(/^\* (.*$)/gim, '<li style="margin-bottom:0.4rem; line-height:1.6;">$1</li>')
        .replace(/^- (.*$)/gim, '<li style="margin-bottom:0.4rem; line-height:1.6;">$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/gi, '<ul style="margin:0.6rem 0 1rem; padding-left:1.5rem;">$1</ul>')
        .replace(/\n\n+/g, '</p><p style="margin-bottom:0.9rem; line-height:1.7;">')
        .replace(/\n/g, '<br>');

      drawerContent.innerHTML = `<p style="margin-bottom:0.9rem; line-height:1.7;">${formatted}</p>`;
    }

    function renderAiError(msg) {
      if (!drawerContent) return;
      drawerContent.innerHTML = `
        <div style="padding:1rem; background:rgba(217, 83, 79, 0.1); border:1px solid rgba(217, 83, 79, 0.3); border-radius:8px; color:var(--text-primary); font-size:0.875rem;">
          <strong style="display:block; margin-bottom:0.25rem;">⚠️ AI Request Issue</strong>
          ${msg || 'Unable to process AI request at this time.'}
        </div>
      `;
    }
  }
  // TTS Speed Select
  const modalTtsSpeedSelect = document.getElementById('modalTtsSpeedSelect');
  if (modalTtsSpeedSelect) {
    modalTtsSpeedSelect.addEventListener('change', (e) => {
      selectedSpeechRate = parseFloat(e.target.value) || 1.0;
    });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === 'upload.html' && modal && modal.classList.contains('active')) {
      e.preventDefault();
      closeModal();
    }
  });

  const comfortBtn = document.getElementById('comfortModeBtn');
  if (comfortBtn) {
    comfortBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (modal && modal.classList.contains('active') && currentModalItem) {
          const hasText = currentModalItem.hasExtractableText !== false && currentModalItem.isReadable !== false && Boolean(currentModalItem.content && currentModalItem.content.trim());
          const isComfortOn = localStorage.getItem('readx-dyslexia-mode') === 'true';
          if (isComfortOn && hasText) {
            switchModalMode('readx');
          } else if (!isComfortOn) {
            switchModalMode('standard');
          }
        }
      }, 50);
    });
  }

  function getFileExtension(file) {
    if (!file || !file.name) return '';
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function isArchiveFile(file, ext) {
    if (BLOCKED_EXTENSIONS.includes(ext)) return true;
    if (file.type && BLOCKED_MIME_TYPES.includes(file.type.toLowerCase())) return true;
    return false;
  }

  // Strip RTF control codes to clean readable text
  function extractTextFromRtf(rtfStr) {
    if (!rtfStr) return '';
    let text = rtfStr
      .replace(/\{\\fonttbl[\s\S]*?\}/gi, '')
      .replace(/\{\\colortbl[\s\S]*?\}/gi, '')
      .replace(/\{\\stylesheet[\s\S]*?\}/gi, '')
      .replace(/\{\\info[\s\S]*?\}/gi, '')
      .replace(/\{\\\*[\s\S]*?\}/gi, '');
    text = text.replace(/\\par\b/gi, '\n')
      .replace(/\\line\b/gi, '\n')
      .replace(/\\tab\b/gi, '\t');
    text = text.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch (e) {
        return match;
      }
    });
    text = text.replace(/\\u([0-9]{2,5})\??/g, (match, code) => {
      try {
        return String.fromCharCode(parseInt(code, 10));
      } catch (e) {
        return match;
      }
    });
    text = text.replace(/\\[a-zA-Z0-9-]+\b ?/g, '');
    text = text.replace(/[{}]/g, '');
    return text.trim();
  }

  // Parse CSV content into structured HTML table
  function parseCsvToHtml(csvText) {
    if (!csvText || !csvText.trim()) return '';
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) return '';
    let html = '<div class="rx-excel-sheet" style="overflow-x:auto; margin-bottom:1.5rem;"><table class="rx-excel-table" style="width:100%; border-collapse:collapse;">';
    lines.forEach((line, idx) => {
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const cols = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        let val = match[1] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1).replace(/""/g, '"');
        }
        cols.push(val.trim());
        if (match.index + match[0].length >= line.length) break;
      }
      const cleanCols = cols.length > 0 ? cols : line.split(',');
      const tag = idx === 0 ? 'th' : 'td';
      html += '<tr>' + cleanCols.map(c => `<${tag} style="padding:8px 12px; border:1px solid var(--border-subtle, rgba(255,255,255,0.1)); text-align:left;">${c.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`).join('') + '</tr>';
    });
    html += '</table></div>';
    return html;
  }

  // Extract readable text from binary Word (.doc) and PowerPoint (.ppt) streams
  function extractBinaryOfficeText(arrayBuffer, minLength = 4) {
    try {
      const uint8 = new Uint8Array(arrayBuffer);
      const strings = [];

      // Scan UTF-16LE text runs
      let currentUtf16 = '';
      for (let i = 0; i < uint8.length - 1; i += 2) {
        const code = uint8[i] | (uint8[i + 1] << 8);
        if (code >= 32 && code <= 126) {
          currentUtf16 += String.fromCharCode(code);
        } else if (code === 10 || code === 13) {
          if (currentUtf16.trim().length >= minLength) strings.push(currentUtf16.trim());
          currentUtf16 = '';
        } else {
          if (currentUtf16.trim().length >= minLength) strings.push(currentUtf16.trim());
          currentUtf16 = '';
        }
      }
      if (currentUtf16.trim().length >= minLength) strings.push(currentUtf16.trim());

      // Scan ASCII text runs
      let currentAscii = '';
      for (let i = 0; i < uint8.length; i++) {
        const b = uint8[i];
        if (b >= 32 && b <= 126) {
          currentAscii += String.fromCharCode(b);
        } else if (b === 10 || b === 13) {
          if (currentAscii.trim().length >= minLength) strings.push(currentAscii.trim());
          currentAscii = '';
        } else {
          if (currentAscii.trim().length >= minLength) strings.push(currentAscii.trim());
          currentAscii = '';
        }
      }
      if (currentAscii.trim().length >= minLength) strings.push(currentAscii.trim());

      const filtered = strings.filter(s => {
        if (s.length < minLength) return false;
        if (/^(Root Entry|WordDocument|SummaryInformation|DocumentSummaryInformation|Table|CompObj|Current User|PowerPoint Document)/i.test(s)) return false;
        if (/^[^\w\s]+$/.test(s)) return false;
        return true;
      });

      const dedupeed = [];
      filtered.forEach(s => {
        if (dedupeed.length === 0 || dedupeed[dedupeed.length - 1] !== s) {
          dedupeed.push(s);
        }
      });

      return dedupeed.join('\n\n');
    } catch (err) {
      return '';
    }
  }

  function processUploadedFile(file) {
    if (!file) return;
    clearUploadError();

    const ext = getFileExtension(file);
    const mime = (file.type || '').toLowerCase();

    // 1. STRICTLY REJECT ZIP FILES
    if (ext === 'zip' || ((mime === 'application/zip' || mime === 'application/x-zip-compressed' || mime === 'application/x-zip' || mime === 'multipart/x-zip') && !['docx', 'pptx', 'xlsx'].includes(ext))) {
      showUploadError('ZIP files (.zip) are strictly not supported. Please upload a supported study material format (PDF, Word, PPT, Excel, CSV, Text, RTF, or Image).');
      return;
    }

    // 2. REJECT OTHER ARCHIVE AND EXECUTABLE FILES
    if (BLOCKED_EXTENSIONS.includes(ext) || BLOCKED_MIME_TYPES.includes(mime)) {
      showUploadError(`Files with format .${ext || 'archive/executable'} are not supported. Archive and executable formats cannot be uploaded.`);
      return;
    }

    // 3. VALIDATE AGAINST ALLOWLIST
    const isMimeAllowed = mime.startsWith('image/') || mime.startsWith('audio/') || mime.startsWith('video/') || mime.startsWith('text/') || mime.includes('pdf') || mime.includes('word') || mime.includes('officedocument') || mime.includes('excel') || mime.includes('powerpoint') || mime.includes('spreadsheet');
    if (!ALLOWED_EXTENSIONS.includes(ext) && !isMimeAllowed) {
      showUploadError(`Unsupported file format (.${ext || 'unknown'}). Please upload supported study materials (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, CSV, TXT, RTF, or Images).`);
      return;
    }

    // 4. FILE SIZE VALIDATION (50MB maximum)
    if (file.size > 50 * 1024 * 1024) {
      showUploadError(`File is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum allowed upload size is 50MB.`);
      return;
    }

    // 5. READ ORIGINAL FILE AS DATA URL TO PRESERVE ORIGINAL REPRESENTATION
    const dataUrlReader = new FileReader();
    dataUrlReader.onload = (eData) => {
      const originalDataUrl = eData.target.result;
      routeAndProcessFile(file, ext, originalDataUrl);
    };
    dataUrlReader.onerror = () => {
      routeAndProcessFile(file, ext, '');
    };
    dataUrlReader.readAsDataURL(file);
  }

  function routeAndProcessFile(file, ext, originalDataUrl) {
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext) || (file.type && file.type.startsWith('image/'));
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext) || (file.type && file.type.startsWith('audio/'));
    const isVideo = ['mp4', 'webm', 'mov', 'ogv', 'avi', 'mkv'].includes(ext) || (file.type && file.type.startsWith('video/'));

    if (isImage) {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Uploaded image — original format preserved.');
    } else if (isAudio) {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Uploaded audio — original format preserved.');
    } else if (isVideo) {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Uploaded video — original format preserved.');
    } else if (ext === 'docx' || (file.type && file.type.includes('wordprocessingml'))) {
      parseDocxFile(file, ext, originalDataUrl);
    } else if (ext === 'doc' || (file.type && file.type === 'application/msword')) {
      parseDocFile(file, ext, originalDataUrl);
    } else if (ext === 'pdf' || (file.type && file.type.includes('pdf'))) {
      parsePdfFile(file, ext, originalDataUrl);
    } else if (ext === 'xlsx' || ext === 'xls' || (file.type && (file.type.includes('spreadsheet') || file.type.includes('excel')))) {
      parseXlsxFile(file, ext, originalDataUrl);
    } else if (ext === 'csv' || (file.type && file.type === 'text/csv')) {
      parseCsvFile(file, ext, originalDataUrl);
    } else if (ext === 'pptx' || (file.type && file.type.includes('presentationml'))) {
      parsePptxFile(file, ext, originalDataUrl);
    } else if (ext === 'ppt' || (file.type && file.type === 'application/vnd.ms-powerpoint')) {
      parsePptFile(file, ext, originalDataUrl);
    } else if (ext === 'rtf' || (file.type && (file.type === 'application/rtf' || file.type === 'text/rtf'))) {
      parseRtfFile(file, ext, originalDataUrl);
    } else if (['txt', 'md', 'json', 'xml', 'html', 'htm', 'log'].includes(ext) || (file.type && file.type.startsWith('text/'))) {
      parseTextFile(file, ext, originalDataUrl);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Uploaded file — original format preserved.');
    }
  }

  // DOCX PARSER
  function parseDocxFile(file, ext, originalDataUrl) {
    if (typeof mammoth !== 'undefined' && mammoth.convertToHtml) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            const html = (result.value || '').trim();
            saveDocumentToUploads(file, originalDataUrl, html, ext, Boolean(html));
          })
          .catch(() => {
            saveDocumentToUploads(file, originalDataUrl, '', ext, false);
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    }
  }

  // DOC PARSER (Word 97-2003 Binary)
  function parseDocFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = extractBinaryOfficeText(e.target.result);
        if (text && text.length > 20) {
          const formatted = `<p>${text.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
          saveDocumentToUploads(file, originalDataUrl, formatted, ext, true, 'Word document text extracted.');
        } else {
          saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Word document — original format preserved.');
        }
      } catch (err) {
        saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Word document — original format preserved.');
      }
    };
    reader.onerror = () => saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    reader.readAsArrayBuffer(file);
  }

  // Multi-column & Paragraph-Preserving PDF Text Extractor
  function extractMultiColumnPdfText(pageItems) {
    if (!pageItems || pageItems.length === 0) return '';

    const items = pageItems.map(item => {
      const transform = item.transform || [];
      const x = transform[4] !== undefined ? transform[4] : 0;
      const y = transform[5] !== undefined ? transform[5] : 0;
      return { str: item.str || '', x, y, width: item.width || 0, height: item.height || 0 };
    }).filter(item => item.str.trim().length > 0);

    if (items.length === 0) return '';

    // Sort items vertically top-to-bottom
    items.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 4) {
        return b.y - a.y;
      }
      return a.x - b.x;
    });

    const paragraphs = [];
    let currentParagraphLines = [];
    let currentLineItems = [];
    let lastY = null;

    items.forEach(item => {
      if (lastY === null) {
        currentLineItems = [item];
        lastY = item.y;
      } else {
        const yDiff = Math.abs(lastY - item.y);
        if (yDiff <= 4) {
          currentLineItems.push(item);
        } else {
          currentLineItems.sort((a, b) => a.x - b.x);
          const lineStr = currentLineItems.map(i => i.str).join(' ').trim();
          if (lineStr) {
            currentParagraphLines.push(lineStr);
          }
          currentLineItems = [item];

          if (yDiff > 14 && currentParagraphLines.length > 0) {
            paragraphs.push(currentParagraphLines.join('\n'));
            currentParagraphLines = [];
          }
          lastY = item.y;
        }
      }
    });

    if (currentLineItems.length > 0) {
      currentLineItems.sort((a, b) => a.x - b.x);
      const lineStr = currentLineItems.map(i => i.str).join(' ').trim();
      if (lineStr) {
        currentParagraphLines.push(lineStr);
      }
    }

    if (currentParagraphLines.length > 0) {
      paragraphs.push(currentParagraphLines.join('\n'));
    }

    return paragraphs.filter(Boolean).join('\n\n');
  }

  // PDF PARSER
  function parsePdfFile(file, ext, originalDataUrl) {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.min.js';
      const reader = new FileReader();
      reader.onload = (e) => {
        const typedarray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
          const numPages = pdf.numPages;
          const promises = [];
          for (let i = 1; i <= numPages; i++) {
            promises.push(
              pdf.getPage(i).then(page => page.getTextContent().then(tc => extractMultiColumnPdfText(tc.items)))
            );
          }
          Promise.all(promises).then(pageTexts => {
            const fullText = pageTexts.filter(Boolean).join('\n\n-- Page Break --\n\n').trim();
            saveDocumentToUploads(file, originalDataUrl, fullText, ext, Boolean(fullText), fullText ? 'PDF text extracted for ReadX & Standard mode.' : 'PDF original file preserved.');
          }).catch((err) => {
            console.warn('PDF text extraction error:', err);
            saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'PDF original file preserved.');
          });
        }).catch((err) => {
          console.warn('PDF load error:', err);
          saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'PDF original file preserved.');
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'PDF original file preserved.');
    }
  }

  // EXCEL PARSER (.xlsx, .xls)
  function parseXlsxFile(file, ext, originalDataUrl) {
    if (typeof XLSX !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          let htmlTables = '';
          workbook.SheetNames.forEach(name => {
            const sheet = workbook.Sheets[name];
            const tableHtml = XLSX.utils.sheet_to_html(sheet, { header: '', footer: '' });
            if (tableHtml) {
              htmlTables += `<div class="rx-excel-sheet" style="margin-bottom:1.5rem;"><h4 style="margin-bottom:0.5rem;">📊 Sheet: ${name}</h4>${tableHtml}</div>`;
            }
          });
          saveDocumentToUploads(file, originalDataUrl, htmlTables.trim(), ext, Boolean(htmlTables.trim()), 'Spreadsheet table converted.');
        } catch (err) {
          saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Spreadsheet — original format preserved.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Spreadsheet — original format preserved.');
    }
  }

  // CSV PARSER
  function parseCsvFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = (e.target.result || '').trim();
        let tableHtml = '';
        if (typeof XLSX !== 'undefined') {
          try {
            const wb = XLSX.read(raw, { type: 'string' });
            const sheetName = wb.SheetNames[0];
            if (sheetName) {
              const sheet = wb.Sheets[sheetName];
              tableHtml = XLSX.utils.sheet_to_html(sheet, { header: '', footer: '' });
              if (tableHtml) {
                tableHtml = `<div class="rx-excel-sheet" style="margin-bottom:1.5rem;"><h4 style="margin-bottom:0.5rem;">📊 Data: ${file.name}</h4>${tableHtml}</div>`;
              }
            }
          } catch (xErr) { }
        }
        if (!tableHtml && raw) {
          tableHtml = parseCsvToHtml(raw);
        }
        saveDocumentToUploads(file, originalDataUrl, tableHtml || raw, ext, Boolean(tableHtml || raw), 'Spreadsheet CSV imported.');
      } catch (err) {
        saveDocumentToUploads(file, originalDataUrl, '', ext, false);
      }
    };
    reader.onerror = () => saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    reader.readAsText(file);
  }

  // PPTX PARSER
  function parsePptxFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      let slideCardsHtml = '';

      // Try reading PPTX slide XMLs via JSZip (bundled in mammoth)
      const jszip = typeof JSZip !== 'undefined' ? JSZip : (typeof window !== 'undefined' ? window.JSZip : null);
      if (jszip && jszip.loadAsync) {
        try {
          const zip = await jszip.loadAsync(arrayBuffer);
          const slideFiles = [];
          zip.forEach((relativePath, zipEntry) => {
            if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
              slideFiles.push(zipEntry);
            }
          });

          slideFiles.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
          });

          for (let i = 0; i < slideFiles.length; i++) {
            const slideXml = await slideFiles[i].async('text');
            const matches = slideXml.match(/<a:t>([^<]+)<\/a:t>/gi) || [];
            const textArr = matches.map(m => m.replace(/<\/?a:t>/gi, '').trim()).filter(Boolean);
            const cleanText = textArr.join(' ');
            if (cleanText) {
              slideCardsHtml += `<div class="rx-slide-card" style="margin-bottom:1.5rem;"><h4>📊 Slide ${i + 1}</h4><p style="margin-top:0.75rem;">${cleanText}</p></div>`;
            }
          }
        } catch (zipErr) {
          console.warn('JSZip PPTX parsing fallback:', zipErr);
        }
      }

      // Fallback regex extraction if needed
      if (!slideCardsHtml) {
        try {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const rawString = decoder.decode(arrayBuffer);
          const slideMatches = rawString.split(/<p:sld\b/gi);
          if (slideMatches.length > 1) {
            slideMatches.slice(1).forEach((slideXml, idx) => {
              const matches = slideXml.match(/<a:t>([^<]+)<\/a:t>/gi);
              if (matches && matches.length > 0) {
                const textArr = matches.map(m => m.replace(/<\/?a:t>/gi, '').trim()).filter(Boolean);
                const cleanText = Array.from(new Set(textArr)).join(' ');
                if (cleanText) {
                  slideCardsHtml += `<div class="rx-slide-card" style="margin-bottom:1.5rem;"><h4>📊 Slide ${idx + 1}</h4><p style="margin-top:0.75rem;">${cleanText}</p></div>`;
                }
              }
            });
          }
          if (!slideCardsHtml) {
            const matches = rawString.match(/<a:t>([^<]+)<\/a:t>/gi);
            if (matches && matches.length > 0) {
              const textArr = matches.map(m => m.replace(/<\/?a:t>/gi, '').trim()).filter(Boolean);
              const cleanText = Array.from(new Set(textArr)).join(' ');
              slideCardsHtml = `<div class="rx-slide-card"><h4>📊 Presentation Content</h4><p style="margin-top:0.75rem;">${cleanText}</p></div>`;
            }
          }
        } catch (err) { }
      }

      saveDocumentToUploads(file, originalDataUrl, slideCardsHtml, ext, Boolean(slideCardsHtml));
    };
    reader.readAsArrayBuffer(file);
  }

  // PPT PARSER (PowerPoint 97-2003 Binary)
  function parsePptFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = extractBinaryOfficeText(e.target.result);
        if (text && text.length > 20) {
          const chunks = text.split(/\n\n+/).filter(Boolean);
          let html = '';
          chunks.forEach((chunk, i) => {
            html += `<div class="rx-slide-card" style="margin-bottom:1.5rem;"><h4>📊 Slide / Section ${i + 1}</h4><p style="margin-top:0.75rem;">${chunk}</p></div>`;
          });
          saveDocumentToUploads(file, originalDataUrl, html, ext, true, 'PowerPoint presentation content extracted.');
        } else {
          saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'PowerPoint presentation — original format preserved.');
        }
      } catch (err) {
        saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'PowerPoint presentation — original format preserved.');
      }
    };
    reader.onerror = () => saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    reader.readAsArrayBuffer(file);
  }

  // RTF PARSER
  function parseRtfFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target.result || '';
        const cleanText = extractTextFromRtf(raw);
        if (cleanText) {
          const formatted = `<p>${cleanText.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
          saveDocumentToUploads(file, originalDataUrl, formatted, ext, true, 'Rich Text document parsed.');
        } else {
          saveDocumentToUploads(file, originalDataUrl, '', ext, false);
        }
      } catch (err) {
        saveDocumentToUploads(file, originalDataUrl, '', ext, false);
      }
    };
    reader.onerror = () => saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    reader.readAsText(file);
  }

  // TEXT / MD / HTML / JSON / XML PARSER
  function parseTextFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = (e.target.result || '').trim();
      let hasText = Boolean(content);

      if (ext === 'html' || ext === 'htm') {
        saveDocumentToUploads(file, originalDataUrl, content, ext, true);
        return;
      } else if (ext === 'md') {
        let html = content
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
          .replace(/^(?!<[a-z])(.*$)/gim, '<p>$1</p>')
          .replace(/<\/ul>\s*<ul>/g, '');
        saveDocumentToUploads(file, originalDataUrl, html, ext, true);
        return;
      }

      const formatted = `<p>${content.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      saveDocumentToUploads(file, originalDataUrl, formatted, ext, hasText);
    };
    reader.onerror = () => saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    reader.readAsText(file);
  }

  function saveDocumentToUploads(file, originalDataUrl, content, ext, hasExtractableText, customDesc) {
    const plainText = (content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = hasExtractableText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const id = 'upload-' + Date.now();
    const title = file.name.replace(/\.[^/.]+$/, '');

    // Track active Blob URL in memory for high-fidelity instant preview
    try {
      if (typeof URL !== 'undefined' && URL.createObjectURL) {
        activeBlobUrls.set(id, URL.createObjectURL(file));
      }
    } catch (e) { }

    // For non-images or large files, strip heavy Data URL (>200KB) to prevent QuotaExceededError in localStorage
    let safeDataUrl = originalDataUrl || '';
    if (safeDataUrl.length > 200000 && (!file.type || !file.type.startsWith('image/'))) {
      safeDataUrl = '';
    }

    const uploads = ReadXData.getUploads();
    const newItem = {
      id,
      title,
      filename: file.name,
      ext: ext || getFileExtension(file) || 'file',
      mimeType: file.type || 'application/octet-stream',
      originalDataUrl: safeDataUrl,
      hasExtractableText: hasExtractableText !== false,
      isReadable: hasExtractableText !== false,
      content: content || '',
      desc: customDesc || (hasExtractableText ? `Uploaded document — ${words} words.` : 'Original format preserved.'),
      excerpt: hasExtractableText ? (plainText.substring(0, 120) + '…') : 'Original view available.',
      readTime: hasExtractableText ? Math.max(1, Math.ceil(words / 200)) + ' min' : 'N/A',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      wordCount: words
    };

    try {
      uploads.unshift(newItem);
      ReadXData.saveUploads(uploads);
    } catch (err) {
      console.error('Error saving uploaded document:', err);
    }

    if (typeof ReadXData !== 'undefined' && ReadXData.recordDocumentUpload) {
      try {
        ReadXData.recordDocumentUpload(newItem.title, newItem.ext, newItem.wordCount);
      } catch (err) {
        console.warn('Error recording upload stat:', err);
      }
    }
    renderUploads();
    clearUploadError();
    openModal(newItem);
  }

  if (browseBtn) {
    browseBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (input) input.click();
      }
    });
  }

  if (zone) {
    zone.addEventListener('click', (e) => {
      if (e.target === browseBtn || (e.target && e.target.closest && (e.target.closest('#uploadBrowseBtn') || e.target.closest('label') || e.target.closest('button'))) || e.target === input) {
        return;
      }
      if (input) input.click();
    });
  }

  if (input) {
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) {
        processUploadedFile(input.files[0]);
      }
      input.value = '';
    });
  }

  if (zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        processUploadedFile(file);
      }
    });
  }

  renderUploads();
});