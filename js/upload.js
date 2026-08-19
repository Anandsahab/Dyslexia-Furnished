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
  const modalDocTitle = document.getElementById('modalDocTitle');
  const modalFormatBadge = document.getElementById('modalFormatBadge');
  const modalStandardContainer = document.getElementById('modalStandardContainer');
  const modalReadXContainer = document.getElementById('modalReadXContainer');
  const modalFooterMeta = document.getElementById('modalFooterMeta');
  const modalTtsBtn = document.getElementById('modalTtsBtn');

  let currentModalItem = null;
  let activeModalMode = 'standard';

  const ARCHIVE_EXTENSIONS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'tgz', 'zipx'];
  const ARCHIVE_MIME_TYPES = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    'application/x-tar'
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

    if (modalDocTitle) modalDocTitle.textContent = item.title || item.filename || 'Document Viewer';
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

    // STEP 3: Deferred initialization of READX accessibility layer so it CANNOT block modal opening!
    setTimeout(() => {
      try {
        renderModalReadXView(item, hasText);
      } catch (err) {
        console.error('Error initializing READX view:', err);
      }
    }, 50);
  }  let isModalSpeaking = false;
  let isModalPaused = false;
  let speechSentences = [];
  let speechCurrentIndex = 0;
  let selectedSpeechRate = 1.0;
  let selectedVoiceURI = '';

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

  function updateAudioUiState() {
    const playBtnMain = document.getElementById('modalTtsBtn');
    const stopBtnMain = document.getElementById('modalTtsStopBtn');
    const playBtnPanel = document.getElementById('panelTtsPlayBtn');
    const stopBtnPanel = document.getElementById('panelTtsStopBtn');

    let playLabel = '▶️ Read Aloud';
    if (isModalSpeaking && !isModalPaused) {
      playLabel = '⏸️ Pause';
    } else if (isModalSpeaking && isModalPaused) {
      playLabel = '▶️ Resume';
    }

    if (playBtnMain) playBtnMain.textContent = playLabel;
    if (playBtnPanel) playBtnPanel.textContent = playLabel;

    const stopDisplay = isModalSpeaking ? 'inline-flex' : 'none';
    if (stopBtnMain) stopBtnMain.style.display = stopDisplay;
    if (stopBtnPanel) stopBtnPanel.style.display = stopDisplay;
  }

  function stopModalSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isModalSpeaking = false;
    isModalPaused = false;
    speechCurrentIndex = 0;
    updateAudioUiState();

    const activeSentences = document.querySelectorAll('.sentence.tts-active');
    activeSentences.forEach(s => s.classList.remove('tts-active'));
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

      const stage = document.getElementById('rxPdfViewStage');
      const focusLine = document.getElementById('rxModalFocusLine');
      const ruler = document.getElementById('rxModalReadingRuler');
      if (stage && activeEl) {
        const stageRect = stage.getBoundingClientRect();
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

    if (currentModalItem && typeof ReadXData !== 'undefined') {
      ReadXData.recordFeatureUse('readAloud', currentModalItem.title);
    }

    const container = document.getElementById('rxTextOverlayPanel') || modalReadXContainer;
    speechSentences = Array.from(container.querySelectorAll('.sentence'));

    if (speechSentences.length === 0) {
      const text = (container.textContent || '').trim();
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
    const modalFooterActions = document.getElementById('modalFooterActions');
    const modalAudioBar = document.getElementById('modalAudioBar');

    if (mode === 'standard') {
      stopModalSpeech();
      modalBtnStandard.classList.add('active');
      modalBtnReadX.classList.remove('active');
      modalStandardContainer.style.display = 'block';
      modalReadXContainer.style.display = 'none';
      modalFooterMeta.textContent = 'Standard Reading Mode · Original Document';
      if (modalAudioBar) modalAudioBar.style.display = 'none';
    } else {
      modalBtnReadX.classList.add('active');
      modalBtnStandard.classList.remove('active');
      modalReadXContainer.style.display = 'block';
      modalStandardContainer.style.display = 'none';
      modalFooterMeta.textContent = 'READX Accessible Mode · Accessibility Layer Active';
      if (modalAudioBar) modalAudioBar.style.display = 'inline-flex';
      
      if (currentModalItem && typeof ReadXData !== 'undefined') {
        ReadXData.recordFeatureUse('readx', currentModalItem.title);
      }
    }
  }

  function renderModalStandardView(item) {
    modalStandardContainer.innerHTML = '';
    const ext = (item.ext || 'file').toLowerCase();
    const dataUrl = item.originalDataUrl || '';
    const filename = item.filename || item.title;

    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <img src="${dataUrl || 'assets/placeholder.svg'}" alt="${filename}">
          <p class="text-caption">${filename}</p>
        </div>
      `;
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <h3>🎵 ${filename}</h3>
          <audio controls src="${dataUrl}"></audio>
        </div>
      `;
    } else if (['mp4', 'webm', 'mov', 'ogv', 'avi'].includes(ext)) {
      modalStandardContainer.innerHTML = `
        <div class="rx-original-media">
          <h3>🎬 ${filename}</h3>
          <video controls src="${dataUrl}" style="max-width:100%; max-height:60vh;"></video>
        </div>
      `;
    } else if (ext === 'pdf') {
      if (dataUrl) {
        modalStandardContainer.innerHTML = `<iframe src="${dataUrl}" class="rx-pdf-frame" title="${filename}"></iframe>`;
      } else {
        renderModalFallback(filename, ext);
      }
    } else if (['json', 'xml', 'css', 'js'].includes(ext)) {
      const safeContent = (item.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      modalStandardContainer.innerHTML = `
        <div>
          <h4 style="margin-bottom:0.75rem;">📄 Code / Structured Document View</h4>
          <pre class="rx-code-block"><code>${safeContent || 'Empty content'}</code></pre>
        </div>
      `;
    } else {
      const formatted = (item.content || '').startsWith('<') ? item.content : `<p>${(item.content || '').replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      modalStandardContainer.innerHTML = `
        <div class="reading-content standard-doc-view">
          ${formatted || '<p class="text-muted">Original document content displayed.</p>'}
        </div>
      `;
    }
  }

  function renderModalFallback(filename, ext, dataUrl) {
    modalStandardContainer.innerHTML = `
      <div class="empty-state">
        <span class="text-label">Preview Unavailable</span>
        <p>Preview is not natively available for .${ext} files, but your original file is preserved.</p>
        ${dataUrl ? `<a href="${dataUrl}" download="${filename}.${ext}" class="btn btn-outline btn-sm" style="margin-top:1rem;">Download Original File</a>` : ''}
      </div>
    `;
  }

  function renderModalReadXView(item, hasText) {
    const ext = (item.ext || 'file').toLowerCase();
    const dataUrl = item.originalDataUrl || '';
    const filename = item.filename || item.title;

    if (ext === 'pdf' && dataUrl) {
      const rawText = item.content || '';
      const sentenceRegex = /[^.!?]+[.!?]+/g;
      const matchedSentences = rawText.match(sentenceRegex) || (rawText ? [rawText] : []);
      
      let overlayHtml = '';
      if (matchedSentences.length > 0) {
        matchedSentences.forEach((s, sIdx) => {
          const trimmed = s.trim();
          if (trimmed.length > 0) {
            overlayHtml += `<span class="sentence" data-s-idx="${sIdx}">${trimmed}</span> `;
          }
        });
      } else {
        overlayHtml = `<p class="sentence" data-s-idx="0">${filename} — Accessibility Text Layer</p>`;
      }

      let rulerActive = localStorage.getItem('readxRulerEnabled') === 'true';
      let focusActive = localStorage.getItem('readxFocusEnabled') === 'true';
      let windowActive = localStorage.getItem('readxWindowEnabled') === 'true';
      let panelActive = localStorage.getItem('readxPanelEnabled') !== 'false';
      let textOverlayActive = localStorage.getItem('readxTextOverlayEnabled') === 'true';
      let focusHeight = 36;
      let windowHeight = 140;
      let zoomLevel = 100;

      modalReadXContainer.innerHTML = `
        <div class="rx-pdf-readx-wrapper" id="rxPdfReadXWrapper">
          <div class="rx-pdf-readx-bar" id="rxPdfReadXBar">
            <span class="rx-readx-badge">✨ READX Accessibility Layer Active</span>
            <div class="rx-pdf-tools">
              <button type="button" class="btn btn-xs btn-outline ${rulerActive ? 'active' : ''}" id="rxQuickRulerBtn">📏 Reading Guide</button>
              <button type="button" class="btn btn-xs btn-outline ${focusActive ? 'active' : ''}" id="rxQuickFocusBtn">🎯 Line Focus</button>
              <button type="button" class="btn btn-xs btn-outline ${windowActive ? 'active' : ''}" id="rxQuickWindowBtn">🔍 Focus Window</button>
              <button type="button" class="btn btn-xs btn-outline ${textOverlayActive ? 'active' : ''}" id="rxQuickTextPanelBtn">📖 Accessible Text</button>
            </div>
            <div class="rx-pdf-tools" style="margin-left:auto;">
              <button type="button" class="btn btn-xs btn-ghost" id="rxZoomOutBtn" title="Zoom Out">–</button>
              <span class="rx-ctrl-value" id="rxZoomValueDisplay" style="min-width:3.2rem; text-align:center;">100%</span>
              <button type="button" class="btn btn-xs btn-ghost" id="rxZoomInBtn" title="Zoom In">+</button>
              <button type="button" class="btn btn-xs btn-ghost" id="rxZoomResetBtn" title="Reset Zoom">Reset</button>
              <button type="button" class="btn btn-xs btn-outline ${panelActive ? 'active' : ''}" id="rxTogglePanelBtn" title="Toggle Preferences Panel">⚡ Preferences</button>
            </div>
          </div>

          <div class="rx-pdf-readx-layout">
            <div class="rx-pdf-view-stage" id="rxPdfViewStage">
              <div class="rx-reading-ruler-overlay" id="rxModalReadingRuler" style="display:${rulerActive ? 'block' : 'none'};"></div>
              <div class="rx-focus-highlight-overlay" id="rxModalFocusLine" style="display:${focusActive ? 'block' : 'none'};"></div>
              <div class="rx-focus-dim-mask" id="rxModalFocusDimTop" style="display:${focusActive ? 'block' : 'none'};"></div>
              <div class="rx-focus-dim-mask" id="rxModalFocusDimBottom" style="display:${focusActive ? 'block' : 'none'};"></div>
              <div class="rx-focus-window-overlay" id="rxModalFocusWindow" style="display:${windowActive ? 'block' : 'none'};"></div>
              
              <iframe src="${dataUrl}" class="rx-pdf-frame rx-pdf-readx-frame" id="rxPdfFrame" title="${filename}"></iframe>

              <div class="rx-text-overlay-panel text-readx" id="rxTextOverlayPanel" style="display:${textOverlayActive ? 'block' : 'none'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                  <h4 style="margin:0; font-size:0.95rem; color:var(--copper); font-family:inherit;">📖 Accessible Dyslexia-Friendly Text</h4>
                  <button type="button" class="btn btn-xs btn-ghost" id="rxCloseTextPanelBtn">✕</button>
                </div>
                <div class="rx-text-content-box">${overlayHtml}</div>
              </div>
            </div>

            <!-- ACCESSIBILITY & READING PREFERENCES SIDE PANEL -->
            <aside class="rx-accessibility-panel ${panelActive ? '' : 'collapsed'}" id="rxAccessibilityPanel">
              <div class="rx-panel-header">
                <h3>⚡ Reading Preferences</h3>
                <button type="button" class="rx-modal-close" id="rxClosePanelBtn" style="font-size:1.25rem;" title="Close Panel">&times;</button>
              </div>

              <div class="rx-panel-content">
                <!-- GROUP 1: READING TYPOGRAPHY -->
                <div class="rx-panel-group">
                  <div class="rx-group-header" data-toggle-group="grpTypography">
                    <span>🔤 Typography & Spacing</span>
                    <span class="grp-arrow">▼</span>
                  </div>
                  <div class="rx-group-content" id="grpTypography">
                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Font Size</label>
                        <span class="rx-ctrl-value" id="valPanelTextSize">18px</span>
                      </div>
                      <input type="range" id="setPanelTextSize" min="14" max="32" step="1" value="18">
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Line Spacing</label>
                        <span class="rx-ctrl-value" id="valPanelLineHeight">1.8</span>
                      </div>
                      <input type="range" id="setPanelLineHeight" min="1.2" max="2.6" step="0.1" value="1.8">
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Letter Spacing</label>
                        <span class="rx-ctrl-value" id="valPanelLetterSpacing">0.05em</span>
                      </div>
                      <input type="range" id="setPanelLetterSpacing" min="0" max="0.20" step="0.01" value="0.05">
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Word Spacing</label>
                        <span class="rx-ctrl-value" id="valPanelWordSpacing">0.12em</span>
                      </div>
                      <input type="range" id="setPanelWordSpacing" min="0" max="0.35" step="0.02" value="0.12">
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Font Family</label>
                      </div>
                      <div class="rx-seg-control" id="panelFontControl">
                        <button class="rx-seg-btn active" data-font="'OpenDyslexic', 'Lexend', sans-serif" type="button">Dyslexic</button>
                        <button class="rx-seg-btn" data-font="'Lexend', sans-serif" type="button">Lexend</button>
                        <button class="rx-seg-btn" data-font="'Inter', sans-serif" type="button">Inter</button>
                        <button class="rx-seg-btn" data-font="'Lora', serif" type="button">Lora</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- GROUP 2: FOCUS & TRACKING -->
                <div class="rx-panel-group">
                  <div class="rx-group-header" data-toggle-group="grpFocus">
                    <span>🎯 Focus & Tracking Tools</span>
                    <span class="grp-arrow">▼</span>
                  </div>
                  <div class="rx-group-content" id="grpFocus">
                    <div class="rx-switch-row">
                      <label for="chkPanelRuler">Reading Guide Ruler</label>
                      <input type="checkbox" id="chkPanelRuler" ${rulerActive ? 'checked' : ''}>
                    </div>

                    <div class="rx-switch-row">
                      <label for="chkPanelLineFocus">Line Focus Bar</label>
                      <input type="checkbox" id="chkPanelLineFocus" ${focusActive ? 'checked' : ''}>
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label style="font-size:0.75rem;">Line Focus Height</label>
                        <span class="rx-ctrl-value" id="valPanelFocusHeight">36px</span>
                      </div>
                      <input type="range" id="setPanelFocusHeight" min="20" max="70" step="2" value="36">
                    </div>

                    <div class="rx-switch-row">
                      <label for="chkPanelFocusWindow">Focus Window Spotlight</label>
                      <input type="checkbox" id="chkPanelFocusWindow" ${windowActive ? 'checked' : ''}>
                    </div>

                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label style="font-size:0.75rem;">Window Height</label>
                        <span class="rx-ctrl-value" id="valPanelWindowHeight">140px</span>
                      </div>
                      <input type="range" id="setPanelWindowHeight" min="80" max="260" step="10" value="140">
                    </div>
                  </div>
                </div>

                <!-- GROUP 3: VISUAL COMFORT & THEME -->
                <div class="rx-panel-group">
                  <div class="rx-group-header" data-toggle-group="grpVisual">
                    <span>🎨 Visual Comfort & Themes</span>
                    <span class="grp-arrow">▼</span>
                  </div>
                  <div class="rx-group-content" id="grpVisual">
                    <div class="rx-ctrl-row">
                      <div class="rx-ctrl-label-flex">
                        <label>Reading Theme</label>
                      </div>
                      <div class="rx-seg-control" id="panelThemeControl">
                        <button class="rx-seg-btn" data-theme-val="warm" type="button">📜 Warm</button>
                        <button class="rx-seg-btn" data-theme-val="light" type="button">☀️ Light</button>
                        <button class="rx-seg-btn" data-theme-val="dark" type="button">🌙 Dark</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- GROUP 4: AUDIO READ ALOUD -->
                <div class="rx-panel-group">
                  <div class="rx-group-header" data-toggle-group="grpAudio">
                    <span>🔊 Read Aloud (Audio)</span>
                    <span class="grp-arrow">▼</span>
                  </div>
                  <div class="rx-group-content" id="grpAudio">
                    <div class="rx-audio-panel-box">
                      <div class="rx-audio-btns-row">
                        <button type="button" class="btn btn-primary btn-sm" id="panelTtsPlayBtn" style="flex:1;">▶️ Read Aloud</button>
                        <button type="button" class="btn btn-outline btn-sm" id="panelTtsStopBtn" style="display:none;">⏹️ Stop</button>
                      </div>
                      <div class="rx-ctrl-row">
                        <div class="rx-ctrl-label-flex">
                          <label>Reading Speed</label>
                          <span class="rx-ctrl-value" id="valPanelSpeed">1.0x</span>
                        </div>
                        <input type="range" id="setPanelSpeed" min="0.75" max="2.0" step="0.25" value="1.0">
                      </div>
                      <div class="rx-ctrl-row">
                        <label style="font-size:0.75rem;">Voice Selection</label>
                        <select class="rx-audio-speed-select" id="panelTtsVoiceSelect" style="width:100%; border-radius:var(--radius-sm); padding:0.4rem;">
                          <option value="">Default System Voice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </aside>
          </div>
        </div>
      `;

      // Helper function to handle mouse/touch positioning on stage
      const stage = document.getElementById('rxPdfViewStage');
      const ruler = document.getElementById('rxModalReadingRuler');
      const focusLine = document.getElementById('rxModalFocusLine');
      const dimTop = document.getElementById('rxModalFocusDimTop');
      const dimBottom = document.getElementById('rxModalFocusDimBottom');
      const focusWindow = document.getElementById('rxModalFocusWindow');
      const accessibilityPanel = document.getElementById('rxAccessibilityPanel');
      const textOverlayPanel = document.getElementById('rxTextOverlayPanel');

      const updateOverlaysPos = (clientY) => {
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const relY = Math.max(0, Math.min(rect.height, clientY - rect.top));

        if (ruler && rulerActive) {
          ruler.style.top = Math.max(0, relY - 18) + 'px';
        }

        if (focusLine && focusActive) {
          const halfH = focusHeight / 2;
          const topPos = Math.max(0, relY - halfH);
          focusLine.style.top = topPos + 'px';
          focusLine.style.height = focusHeight + 'px';

          if (dimTop) {
            dimTop.style.top = '0px';
            dimTop.style.height = topPos + 'px';
          }
          if (dimBottom) {
            const bTop = topPos + focusHeight;
            dimBottom.style.top = bTop + 'px';
            dimBottom.style.height = Math.max(0, rect.height - bTop) + 'px';
          }
        }

        if (focusWindow && windowActive) {
          const halfW = windowHeight / 2;
          focusWindow.style.top = Math.max(0, relY - halfW) + 'px';
          focusWindow.style.height = windowHeight + 'px';
        }
      };

      if (stage) {
        stage.addEventListener('mousemove', (e) => updateOverlaysPos(e.clientY));
        stage.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches[0]) updateOverlaysPos(e.touches[0].clientY);
        });
      }

      // Quick Bar Buttons
      const btnQuickRuler = document.getElementById('rxQuickRulerBtn');
      const btnQuickFocus = document.getElementById('rxQuickFocusBtn');
      const btnQuickWindow = document.getElementById('rxQuickWindowBtn');
      const btnQuickTextPanel = document.getElementById('rxQuickTextPanelBtn');
      const btnTogglePanel = document.getElementById('rxTogglePanelBtn');
      const btnClosePanel = document.getElementById('rxClosePanelBtn');
      const btnCloseTextPanel = document.getElementById('rxCloseTextPanelBtn');

      const chkPanelRuler = document.getElementById('chkPanelRuler');
      const chkPanelLineFocus = document.getElementById('chkPanelLineFocus');
      const chkPanelFocusWindow = document.getElementById('chkPanelFocusWindow');

      const toggleRuler = (val) => {
        rulerActive = typeof val === 'boolean' ? val : !rulerActive;
        if (ruler) ruler.style.display = rulerActive ? 'block' : 'none';
        if (btnQuickRuler) btnQuickRuler.classList.toggle('active', rulerActive);
        if (chkPanelRuler) chkPanelRuler.checked = rulerActive;
        localStorage.setItem('readxRulerEnabled', rulerActive ? 'true' : 'false');
      };

      const toggleFocus = (val) => {
        focusActive = typeof val === 'boolean' ? val : !focusActive;
        if (focusLine) focusLine.style.display = focusActive ? 'block' : 'none';
        if (dimTop) dimTop.style.display = focusActive ? 'block' : 'none';
        if (dimBottom) dimBottom.style.display = focusActive ? 'block' : 'none';
        if (btnQuickFocus) btnQuickFocus.classList.toggle('active', focusActive);
        if (chkPanelLineFocus) chkPanelLineFocus.checked = focusActive;
        localStorage.setItem('readxFocusEnabled', focusActive ? 'true' : 'false');
      };

      const toggleWindow = (val) => {
        windowActive = typeof val === 'boolean' ? val : !windowActive;
        if (focusWindow) focusWindow.style.display = windowActive ? 'block' : 'none';
        if (btnQuickWindow) btnQuickWindow.classList.toggle('active', windowActive);
        if (chkPanelFocusWindow) chkPanelFocusWindow.checked = windowActive;
        localStorage.setItem('readxWindowEnabled', windowActive ? 'true' : 'false');
      };

      const toggleTextOverlay = (val) => {
        textOverlayActive = typeof val === 'boolean' ? val : !textOverlayActive;
        if (textOverlayPanel) textOverlayPanel.style.display = textOverlayActive ? 'block' : 'none';
        if (btnQuickTextPanel) btnQuickTextPanel.classList.toggle('active', textOverlayActive);
        localStorage.setItem('readxTextOverlayEnabled', textOverlayActive ? 'true' : 'false');
      };

      const togglePanel = (val) => {
        panelActive = typeof val === 'boolean' ? val : !panelActive;
        if (accessibilityPanel) accessibilityPanel.classList.toggle('collapsed', !panelActive);
        if (btnTogglePanel) btnTogglePanel.classList.toggle('active', panelActive);
        localStorage.setItem('readxPanelEnabled', panelActive ? 'true' : 'false');
      };

      if (btnQuickRuler) btnQuickRuler.addEventListener('click', () => toggleRuler());
      if (btnQuickFocus) btnQuickFocus.addEventListener('click', () => toggleFocus());
      if (btnQuickWindow) btnQuickWindow.addEventListener('click', () => toggleWindow());
      if (btnQuickTextPanel) btnQuickTextPanel.addEventListener('click', () => toggleTextOverlay());
      if (btnTogglePanel) btnTogglePanel.addEventListener('click', () => togglePanel());
      if (btnClosePanel) btnClosePanel.addEventListener('click', () => togglePanel(false));
      if (btnCloseTextPanel) btnCloseTextPanel.addEventListener('click', () => toggleTextOverlay(false));

      if (chkPanelRuler) chkPanelRuler.addEventListener('change', (e) => toggleRuler(e.target.checked));
      if (chkPanelLineFocus) chkPanelLineFocus.addEventListener('change', (e) => toggleFocus(e.target.checked));
      if (chkPanelFocusWindow) chkPanelFocusWindow.addEventListener('change', (e) => toggleWindow(e.target.checked));

      // Zoom Controls
      const pdfFrame = document.getElementById('rxPdfFrame');
      const valZoom = document.getElementById('rxZoomValueDisplay');
      const updateZoom = (val) => {
        zoomLevel = val;
        if (pdfFrame) pdfFrame.style.transform = `scale(${zoomLevel / 100})`;
        if (valZoom) valZoom.textContent = zoomLevel + '%';
      };

      if (document.getElementById('rxZoomInBtn')) {
        document.getElementById('rxZoomInBtn').addEventListener('click', () => updateZoom(Math.min(200, zoomLevel + 15)));
      }
      if (document.getElementById('rxZoomOutBtn')) {
        document.getElementById('rxZoomOutBtn').addEventListener('click', () => updateZoom(Math.max(60, zoomLevel - 15)));
      }
      if (document.getElementById('rxZoomResetBtn')) {
        document.getElementById('rxZoomResetBtn').addEventListener('click', () => updateZoom(100));
      }

      // Accordion Group Header Toggles
      document.querySelectorAll('#rxAccessibilityPanel .rx-group-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
          const targetId = hdr.dataset.toggleGroup;
          const targetGrp = document.getElementById(targetId);
          if (targetGrp) {
            const isHidden = targetGrp.hasAttribute('hidden');
            if (isHidden) {
              targetGrp.removeAttribute('hidden');
              hdr.querySelector('.grp-arrow').textContent = '▼';
            } else {
              targetGrp.setAttribute('hidden', '');
              hdr.querySelector('.grp-arrow').textContent = '▶';
            }
          }
        });
      });

      // Spacing & Typography inputs
      const rangeTextSize = document.getElementById('setPanelTextSize');
      const rangeLineHeight = document.getElementById('setPanelLineHeight');
      const rangeLetterSpacing = document.getElementById('setPanelLetterSpacing');
      const rangeWordSpacing = document.getElementById('setPanelWordSpacing');
      const rangeFocusHeight = document.getElementById('setPanelFocusHeight');
      const rangeWindowHeight = document.getElementById('setPanelWindowHeight');
      const rangeSpeed = document.getElementById('setPanelSpeed');
      const selectSpeedFooter = document.getElementById('modalTtsSpeedSelect');

      if (rangeTextSize) {
        rangeTextSize.addEventListener('input', (e) => {
          const val = e.target.value;
          document.getElementById('valPanelTextSize').textContent = val + 'px';
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.textSize = parseInt(val, 10);
            App.saveSettings(s);
          }
        });
      }

      if (rangeLineHeight) {
        rangeLineHeight.addEventListener('input', (e) => {
          const val = e.target.value;
          document.getElementById('valPanelLineHeight').textContent = val;
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.lineHeight = parseFloat(val);
            App.saveSettings(s);
          }
        });
      }

      if (rangeLetterSpacing) {
        rangeLetterSpacing.addEventListener('input', (e) => {
          const val = e.target.value;
          document.getElementById('valPanelLetterSpacing').textContent = val + 'em';
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.letterSpacing = parseFloat(val);
            App.saveSettings(s);
          }
        });
      }

      if (rangeWordSpacing) {
        rangeWordSpacing.addEventListener('input', (e) => {
          const val = e.target.value;
          document.getElementById('valPanelWordSpacing').textContent = val + 'em';
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.wordSpacing = parseFloat(val);
            App.saveSettings(s);
          }
        });
      }

      if (rangeFocusHeight) {
        rangeFocusHeight.addEventListener('input', (e) => {
          focusHeight = parseInt(e.target.value, 10);
          document.getElementById('valPanelFocusHeight').textContent = focusHeight + 'px';
        });
      }

      if (rangeWindowHeight) {
        rangeWindowHeight.addEventListener('input', (e) => {
          windowHeight = parseInt(e.target.value, 10);
          document.getElementById('valPanelWindowHeight').textContent = windowHeight + 'px';
        });
      }

      if (rangeSpeed) {
        rangeSpeed.addEventListener('input', (e) => {
          selectedSpeechRate = parseFloat(e.target.value);
          document.getElementById('valPanelSpeed').textContent = selectedSpeechRate + 'x';
          if (selectSpeedFooter) selectSpeedFooter.value = selectedSpeechRate;
        });
      }

      if (selectSpeedFooter) {
        selectSpeedFooter.addEventListener('change', (e) => {
          selectedSpeechRate = parseFloat(e.target.value);
          if (rangeSpeed) rangeSpeed.value = selectedSpeechRate;
          if (document.getElementById('valPanelSpeed')) document.getElementById('valPanelSpeed').textContent = selectedSpeechRate + 'x';
        });
      }

      // Font Family segmented control
      document.querySelectorAll('#panelFontControl .rx-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#panelFontControl .rx-seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const font = btn.dataset.font;
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.fontFamily = font;
            App.saveSettings(s);
          }
        });
      });

      // Theme segmented control
      document.querySelectorAll('#panelThemeControl .rx-seg-btn').forEach(btn => {
        const currentTheme = document.body.getAttribute('data-theme') || 'warm';
        btn.classList.toggle('active', btn.dataset.themeVal === currentTheme);
        btn.addEventListener('click', () => {
          document.querySelectorAll('#panelThemeControl .rx-seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const themeVal = btn.dataset.themeVal;
          document.body.setAttribute('data-theme', themeVal);
          if (typeof App !== 'undefined' && App.getSettings) {
            const s = App.getSettings();
            s.theme = themeVal;
            App.saveSettings(s);
          }
        });
      });

      // TTS Play / Stop buttons inside Panel
      const panelPlayBtn = document.getElementById('panelTtsPlayBtn');
      const panelStopBtn = document.getElementById('panelTtsStopBtn');
      const panelVoiceSelect = document.getElementById('panelTtsVoiceSelect');

      populateVoiceDropdowns();

      if (panelVoiceSelect) {
        panelVoiceSelect.addEventListener('change', (e) => {
          selectedVoiceURI = e.target.value;
        });
      }

      if (panelPlayBtn) {
        panelPlayBtn.addEventListener('click', () => startModalSpeech());
      }
      if (panelStopBtn) {
        panelStopBtn.addEventListener('click', () => stopModalSpeech());
      }

      // Accessible text sentence click handlers
      document.querySelectorAll('#rxTextOverlayPanel .sentence').forEach(sent => {
        sent.addEventListener('click', () => {
          const sIdx = parseInt(sent.dataset.sIdx || '0', 10);
          toggleTextOverlay(true);
          startModalSpeech(sIdx);
        });
      });

      // Re-apply live settings to newly injected overlay panel
      if (typeof ReadingAssist !== 'undefined') {
        ReadingAssist.applySettingsToDOM(ReadingAssist.getSettings());
      }
      return;
    }

    if (hasText && item.content) {
      const formatted = item.content.startsWith('<') ? item.content : `<p>${item.content.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      modalReadXContainer.innerHTML = `
        <div class="reading-content text-readx dyslexia-mode-view">
          ${formatted}
        </div>
      `;
      if (typeof ReadingAssist !== 'undefined') {
        ReadingAssist.chunkText();
        ReadingAssist.sentences = Array.from(modalReadXContainer.querySelectorAll('.sentence'));
      }
    } else if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      modalReadXContainer.innerHTML = `
        <div class="rx-original-media" style="padding:2rem; text-align:center;">
          <img src="${dataUrl || 'assets/placeholder.svg'}" alt="${filename}" style="max-height:65vh; margin:0 auto; filter: contrast(1.05);">
          <p class="text-caption" style="margin-top:1rem; font-family:var(--readx-font); font-size:1.1rem;">✨ Image READX High-Contrast View — ${filename}</p>
        </div>
      `;
    } else {
      modalReadXContainer.innerHTML = `
        <div class="empty-state">
          <span class="text-label">READX Accessibility Layer Active</span>
          <p>READX accessibility layer is active for your document. Original layout is preserved under Standard Reading.</p>
        </div>
      `;
    }
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
    if (ARCHIVE_EXTENSIONS.includes(ext)) return true;
    if (file.type && ARCHIVE_MIME_TYPES.includes(file.type.toLowerCase())) return true;
    return false;
  }

  function processUploadedFile(file) {
    if (!file) return;
    clearUploadError();

    const ext = getFileExtension(file);

    // 1. REJECT ZIP AND ARCHIVE FILES IMMEDIATELY
    if (isArchiveFile(file, ext)) {
      showUploadError('ZIP files are not supported. Please select a document file.');
      return;
    }

    // 2. READ ORIGINAL FILE AS DATA URL TO PRESERVE ORIGINAL REPRESENTATION
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
    } else if (ext === 'pdf' || (file.type && file.type.includes('pdf'))) {
      parsePdfFile(file, ext, originalDataUrl);
    } else if (ext === 'xlsx' || ext === 'xls' || (file.type && (file.type.includes('spreadsheet') || file.type.includes('excel')))) {
      parseXlsxFile(file, ext, originalDataUrl);
    } else if (ext === 'pptx') {
      parsePptxFile(file, ext, originalDataUrl);
    } else if (['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'rtf', 'log'].includes(ext) || (file.type && file.type.startsWith('text/'))) {
      parseTextFile(file, ext, originalDataUrl);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false, 'Uploaded file — original format preserved.');
    }
  }

  // DOCX PARSER — Uses mammoth.convertToHtml to preserve headings, lists, tables, images, paragraphs
  function parseDocxFile(file, ext, originalDataUrl) {
    if (typeof mammoth !== 'undefined' && mammoth.convertToHtml) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            const html = (result.value || '').trim();
            saveDocumentToUploads(file, originalDataUrl, html, ext, true);
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

  // Multi-column PDF Text Extractor for TTS (Preserves Left Column -> Right Column Reading Order)
  function extractMultiColumnPdfText(pageItems) {
    if (!pageItems || pageItems.length === 0) return '';

    const items = pageItems.map(item => {
      const transform = item.transform || [];
      const x = transform[4] !== undefined ? transform[4] : 0;
      const y = transform[5] !== undefined ? transform[5] : 0;
      return { str: item.str || '', x, y, width: item.width || 0, height: item.height || 0 };
    }).filter(item => item.str.trim().length > 0);

    if (items.length === 0) return '';

    const xCoords = items.map(item => item.x).sort((a, b) => a - b);
    const minX = xCoords[0];
    const maxX = xCoords[xCoords.length - 1];
    const pageWidth = maxX - minX;

    const midX = minX + pageWidth / 2;
    const leftCol = items.filter(item => (item.x + item.width) <= midX + 30);
    const rightCol = items.filter(item => item.x > midX - 30);

    if (leftCol.length > items.length * 0.2 && rightCol.length > items.length * 0.2 && Math.abs(leftCol.length - rightCol.length) < items.length * 0.6) {
      leftCol.sort((a, b) => b.y - a.y || a.x - b.x);
      rightCol.sort((a, b) => b.y - a.y || a.x - b.x);
      return leftCol.map(i => i.str).join(' ') + '\n\n' + rightCol.map(i => i.str).join(' ');
    } else {
      items.sort((a, b) => (Math.abs(b.y - a.y) > 8 ? b.y - a.y : a.x - b.x));
      return items.map(i => i.str).join(' ');
    }
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
            saveDocumentToUploads(file, originalDataUrl, fullText, ext, true);
          }).catch(() => {
            saveDocumentToUploads(file, originalDataUrl, '', ext, true);
          });
        }).catch(() => {
          saveDocumentToUploads(file, originalDataUrl, '', ext, true);
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, true);
    }
  }

  // EXCEL / XLSX PARSER — Generates HTML tables
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
          saveDocumentToUploads(file, originalDataUrl, htmlTables.trim(), ext, Boolean(htmlTables.trim()));
        } catch (err) {
          saveDocumentToUploads(file, originalDataUrl, '', ext, false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      saveDocumentToUploads(file, originalDataUrl, '', ext, false);
    }
  }

  // PPTX PARSER — Generates slide cards
  function parsePptxFile(file, ext, originalDataUrl) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const rawString = decoder.decode(buffer);
        const slideMatches = rawString.split(/<p:sld\b/gi);
        let slideCardsHtml = '';
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
        saveDocumentToUploads(file, originalDataUrl, slideCardsHtml, ext, Boolean(slideCardsHtml));
      } catch (err) {
        saveDocumentToUploads(file, originalDataUrl, '', ext, false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // TEXT / MD / HTML PARSER — Preserves Markdown and HTML structure
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
      } else if (ext === 'rtf') {
        content = content.replace(/\\rtf1[\s\S]*?\\deflang\d*/g, '').replace(/\\[a-z0-9]+\b/gi, '').replace(/[{}]/g, '').trim();
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

    const uploads = ReadXData.getUploads();
    const newItem = {
      id,
      title,
      filename: file.name,
      ext: ext || getFileExtension(file) || 'file',
      mimeType: file.type || 'application/octet-stream',
      originalDataUrl: originalDataUrl || '',
      hasExtractableText: hasExtractableText !== false,
      isReadable: hasExtractableText !== false,
      content: content || '',
      desc: customDesc || (hasExtractableText ? `Uploaded document — ${words} words.` : 'Original format preserved.'),
      excerpt: hasExtractableText ? (plainText.substring(0, 120) + '…') : 'Original view available.',
      readTime: hasExtractableText ? Math.max(1, Math.ceil(words / 200)) + ' min' : 'N/A',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      wordCount: words
    };

    uploads.unshift(newItem);
    ReadXData.saveUploads(uploads);
    if (typeof ReadXData !== 'undefined' && ReadXData.recordDocumentUpload) {
      ReadXData.recordDocumentUpload(newItem.title, newItem.ext, newItem.wordCount);
    }
    renderUploads();
    clearUploadError();
    openModal(newItem);
  }

  browseBtn.addEventListener('click', () => input.click());
  zone.addEventListener('click', (e) => {
    if (e.target === browseBtn || e.target.closest('button')) return;
    input.click();
  });

  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      processUploadedFile(input.files[0]);
    }
    input.value = '';
  });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      processUploadedFile(file);
    }
  });

  renderUploads();
});
