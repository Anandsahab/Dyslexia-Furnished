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
  }

  let isModalSpeaking = false;

  function stopModalSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isModalSpeaking = false;
    if (modalTtsBtn) modalTtsBtn.textContent = '🔊 Read Aloud';
    const activeSentences = document.querySelectorAll('#modalReadXContainer .sentence');
    activeSentences.forEach(s => s.classList.remove('tts-active'));
  }

  function startModalSpeech() {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    stopModalSpeech();

    if (currentModalItem && typeof ReadXData !== 'undefined') {
      ReadXData.recordFeatureUse('readAloud', currentModalItem.title);
    }

    const sentences = Array.from(document.querySelectorAll('#modalReadXContainer .sentence'));

    if (sentences.length === 0) {
      const text = (modalReadXContainer.textContent || '').trim();
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => stopModalSpeech();
      utterance.onerror = () => stopModalSpeech();
      isModalSpeaking = true;
      if (modalTtsBtn) modalTtsBtn.textContent = '⏸️ Pause';
      window.speechSynthesis.speak(utterance);
      return;
    }

    let currentIndex = 0;
    isModalSpeaking = true;
    if (modalTtsBtn) modalTtsBtn.textContent = '⏸️ Pause';

    function playNextSentence() {
      if (!isModalSpeaking || currentIndex >= sentences.length) {
        stopModalSpeech();
        return;
      }

      sentences.forEach(s => s.classList.remove('tts-active'));
      const activeEl = sentences[currentIndex];
      activeEl.classList.add('tts-active');

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

      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const text = activeEl.innerText || activeEl.textContent;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;

      utterance.onend = () => {
        if (isModalSpeaking) {
          currentIndex++;
          playNextSentence();
        }
      };

      utterance.onerror = () => {
        stopModalSpeech();
      };

      window.speechSynthesis.speak(utterance);
    }

    playNextSentence();
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
    if (mode === 'standard') {
      stopModalSpeech();
      modalBtnStandard.classList.add('active');
      modalBtnReadX.classList.remove('active');
      modalStandardContainer.style.display = 'block';
      modalReadXContainer.style.display = 'none';
      modalFooterMeta.textContent = 'Standard Reading Mode · Original Document';
      if (modalTtsBtn) modalTtsBtn.style.display = 'none';
    } else {
      modalBtnReadX.classList.add('active');
      modalBtnStandard.classList.remove('active');
      modalReadXContainer.style.display = 'block';
      modalStandardContainer.style.display = 'none';
      modalFooterMeta.textContent = 'READX Accessible Mode · Dyslexia Adapted Text';
      if (modalTtsBtn) modalTtsBtn.style.display = 'inline-flex';
      
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
        matchedSentences.forEach(s => {
          const trimmed = s.trim();
          if (trimmed.length > 0) {
            overlayHtml += `<span class="sentence">${trimmed}</span> `;
          }
        });
      } else {
        overlayHtml = `<p class="sentence">${filename} — Accessibility Text Layer</p>`;
      }

      const initialRuler = localStorage.getItem('readxRulerEnabled') === 'true';
      const initialFocus = localStorage.getItem('readxFocusEnabled') === 'true';
      const initialPanel = localStorage.getItem('readxPanelEnabled') !== 'false';

      modalReadXContainer.innerHTML = `
        <div class="rx-pdf-readx-wrapper" id="rxPdfReadXWrapper">
          <div class="rx-pdf-readx-bar">
            <span class="rx-readx-badge">✨ READX Accessibility Layer Active</span>
            <div class="rx-pdf-tools">
              <button type="button" class="btn btn-xs btn-outline ${initialRuler ? 'active' : ''}" id="rxToggleRulerBtn">📏 Reading Guide Ruler</button>
              <button type="button" class="btn btn-xs btn-outline ${initialFocus ? 'active' : ''}" id="rxToggleFocusBtn">🎯 Line Focus Bar</button>
              <button type="button" class="btn btn-xs btn-outline ${initialPanel ? 'active' : ''}" id="rxToggleTextPanelBtn">📖 Accessible Text Layer</button>
            </div>
          </div>
          <div class="rx-pdf-view-stage" id="rxPdfViewStage">
            <div class="rx-reading-ruler-overlay" id="rxModalReadingRuler" style="display:${initialRuler ? 'block' : 'none'};"></div>
            <div class="rx-focus-highlight-overlay" id="rxModalFocusLine" style="display:${initialFocus ? 'block' : 'none'};"></div>
            <iframe src="${dataUrl}" class="rx-pdf-frame rx-pdf-readx-frame" title="${filename}"></iframe>
            <div class="rx-text-overlay-panel text-readx" id="rxTextOverlayPanel" style="display:${initialPanel ? 'block' : 'none'};">
              <h4 style="margin-bottom:1rem; font-size:1em; color:var(--copper); font-family:inherit;">📖 Accessible Dyslexia-Friendly Text</h4>
              <div class="rx-text-content-box">${overlayHtml}</div>
            </div>
          </div>
        </div>
      `;

      const stage = document.getElementById('rxPdfViewStage');
      const ruler = document.getElementById('rxModalReadingRuler');
      const focusLine = document.getElementById('rxModalFocusLine');
      const textPanel = document.getElementById('rxTextOverlayPanel');
      
      const btnRuler = document.getElementById('rxToggleRulerBtn');
      const btnFocus = document.getElementById('rxToggleFocusBtn');
      const btnPanel = document.getElementById('rxToggleTextPanelBtn');

      let rulerActive = initialRuler;
      let focusActive = initialFocus;
      let panelActive = initialPanel;

      if (btnRuler && ruler) {
        btnRuler.addEventListener('click', () => {
          rulerActive = !rulerActive;
          btnRuler.classList.toggle('active', rulerActive);
          ruler.style.display = rulerActive ? 'block' : 'none';
          localStorage.setItem('readxRulerEnabled', rulerActive ? 'true' : 'false');
        });
      }

      if (btnFocus && focusLine) {
        btnFocus.addEventListener('click', () => {
          focusActive = !focusActive;
          btnFocus.classList.toggle('active', focusActive);
          focusLine.style.display = focusActive ? 'block' : 'none';
          localStorage.setItem('readxFocusEnabled', focusActive ? 'true' : 'false');
        });
      }

      if (btnPanel && textPanel) {
        btnPanel.addEventListener('click', () => {
          panelActive = !panelActive;
          btnPanel.classList.toggle('active', panelActive);
          textPanel.style.display = panelActive ? 'block' : 'none';
          localStorage.setItem('readxPanelEnabled', panelActive ? 'true' : 'false');
        });
      }

      if (stage) {
        stage.addEventListener('mousemove', (e) => {
          const rect = stage.getBoundingClientRect();
          const relY = e.clientY - rect.top;
          if (ruler && rulerActive) ruler.style.top = Math.max(0, relY - 24) + 'px';
          if (focusLine && focusActive) focusLine.style.top = Math.max(0, relY - 10) + 'px';
        });
      }

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
    modalTtsBtn.addEventListener('click', () => {
      if (isModalSpeaking) {
        stopModalSpeech();
      } else {
        startModalSpeech();
      }
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
