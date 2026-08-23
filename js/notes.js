// js/notes.js — ReadX Notes Feature
// Scope: ONLY library.html (Library Topic Workspace) and upload.html (My Content Reader)
// Adds a small, compact "✎ Notes" tab immediately to the right of the code panel / reader.
// Clicking it opens a smooth notes drawer. Closing it returns exactly to the existing layout.

(function () {
  'use strict';

  // ── Storage Helpers ──────────────────────────────────────────────────────────

  function sanitizeKey(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').slice(0, 64);
  }

  function getStorageKey(type, id) {
    return 'readx_notes_' + type + '_' + sanitizeKey(id);
  }

  function loadNote(type, id) {
    try {
      var key = getStorageKey(type, id);
      var raw = localStorage.getItem(key);
      if (!raw) return { text: '', savedAt: null };
      return JSON.parse(raw);
    } catch (e) {
      return { text: '', savedAt: null };
    }
  }

  function saveNote(type, id, text) {
    try {
      var key = getStorageKey(type, id);
      var data = { text: text, savedAt: Date.now() };
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (e) {
      return null;
    }
  }

  function deleteNote(type, id) {
    try {
      var key = getStorageKey(type, id);
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function getAllNotes() {
    var notes = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('readx_notes_') === 0) {
        try {
          var raw = localStorage.getItem(k);
          var parsed = raw ? JSON.parse(raw) : null;
          if (parsed && parsed.text && parsed.text.trim()) {
            var parts = k.replace('readx_notes_', '').split('_');
            var type = parts[0] || 'topic';
            var id = parts.slice(1).join('_') || '';
            notes.push({
              key: k,
              type: type,
              id: id,
              text: parsed.text,
              savedAt: parsed.savedAt
            });
          }
        } catch (err) {}
      }
    }
    notes.sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
    return notes;
  }

  function formatTime(ts) {
    if (!ts) return 'Just now';
    var d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' at ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Confirmation Modal ───────────────────────────────────────────────────────

  var _confirmModalEl = null;

  function showConfirmModal(onConfirm) {
    if (!_confirmModalEl) {
      var modal = document.createElement('div');
      modal.className = 'rx-notes-modal-overlay';
      modal.innerHTML = [
        '<div class="rx-notes-modal" role="dialog" aria-modal="true">',
          '<div class="rx-notes-modal-icon">🗑️</div>',
          '<h3 class="rx-notes-modal-title">Clear Notes?</h3>',
          '<p class="rx-notes-modal-msg">This will permanently delete your notes for this document. This cannot be undone.</p>',
          '<div class="rx-notes-modal-actions">',
            '<button type="button" class="rx-notes-modal-cancel" id="rxNotesCancelBtn">Cancel</button>',
            '<button type="button" class="rx-notes-modal-confirm" id="rxNotesConfirmBtn">Yes, Clear</button>',
          '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
      _confirmModalEl = modal;
    }

    _confirmModalEl.style.display = 'flex';
    requestAnimationFrame(function () {
      _confirmModalEl.classList.add('active');
    });

    var cancelBtn = _confirmModalEl.querySelector('#rxNotesCancelBtn');
    var confirmBtn = _confirmModalEl.querySelector('#rxNotesConfirmBtn');

    function close() {
      _confirmModalEl.classList.remove('active');
      setTimeout(function () {
        _confirmModalEl.style.display = 'none';
      }, 200);
    }

    cancelBtn.onclick = close;
    _confirmModalEl.onclick = function (e) {
      if (e.target === _confirmModalEl) close();
    };

    confirmBtn.onclick = function () {
      close();
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  // ── Unified Notes Drawer ─────────────────────────────────────────────────────

  var _drawerEl = null;
  var _activeType = null;
  var _activeId = null;
  var _activeTitle = '';
  var _autosaveTimer = null;
  var _onDrawerStateChange = null;

  function ensureDrawerInDOM() {
    if (_drawerEl) return;

    var el = document.createElement('div');
    el.id = 'rxNotesDrawer';
    el.className = 'rx-notes-drawer';
    el.setAttribute('aria-label', 'Notes drawer');
    el.innerHTML = [
      '<div class="rx-notes-drawer-inner">',
        '<div class="rx-notes-drawer-header">',
          '<div class="rx-notes-header-title-group">',
            '<span class="rx-notes-icon">📝</span>',
            '<h3 class="rx-notes-heading">YOUR NOTES</h3>',
          '</div>',
          '<button type="button" class="rx-notes-close-btn" id="rxDrawerCloseBtn" aria-label="Close notes" title="Close notes (saved)">✕</button>',
        '</div>',
        '<div class="rx-notes-meta-bar">',
          '<span class="rx-notes-doc-badge" id="rxDrawerDocBadge">Document</span>',
          '<span class="rx-notes-status" id="rxDrawerStatus">Saved</span>',
        '</div>',
        '<div class="rx-notes-editor-container">',
          '<textarea class="rx-notes-textarea" id="rxDrawerTextarea" placeholder="Start writing your notes here…&#10;&#10;• Key concepts&#10;• Code explanations&#10;• Questions" spellcheck="true" aria-label="Notes"></textarea>',
        '</div>',
        '<div class="rx-notes-box-footer">',
          '<button type="button" class="rx-notes-clear-action" id="rxDrawerClearBtn" title="Clear notes">🗑 Clear</button>',
          '<span class="rx-notes-char-indicator" id="rxDrawerCharCount">0 chars</span>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(el);
    _drawerEl = el;

    var closeBtn = el.querySelector('#rxDrawerCloseBtn');
    var clearBtn = el.querySelector('#rxDrawerClearBtn');
    var textarea = el.querySelector('#rxDrawerTextarea');
    var statusEl = el.querySelector('#rxDrawerStatus');
    var charsEl = el.querySelector('#rxDrawerCharCount');

    closeBtn.addEventListener('click', function () {
      closeDrawer();
    });

    textarea.addEventListener('input', function () {
      var val = textarea.value;
      charsEl.textContent = val.length + ' chars';
      statusEl.textContent = 'Saving…';
      statusEl.classList.remove('saved');

      clearTimeout(_autosaveTimer);
      _autosaveTimer = setTimeout(function () {
        if (_activeType && _activeId) {
          saveNote(_activeType, _activeId, val);
          statusEl.textContent = '✓ Saved';
          statusEl.classList.add('saved');
          updateTabLabel();
        }
      }, 500);
    });

    clearBtn.addEventListener('click', function () {
      showConfirmModal(function () {
        if (_activeType && _activeId) {
          textarea.value = '';
          deleteNote(_activeType, _activeId);
          statusEl.textContent = 'Cleared';
          charsEl.textContent = '0 chars';
          updateTabLabel();
        }
      });
    });
  }

  function openDrawer(type, id, title, stateChangeCallback) {
    ensureDrawerInDOM();
    _activeType = type;
    _activeId = id;
    _activeTitle = title || 'Document';
    _onDrawerStateChange = stateChangeCallback;

    var noteData = loadNote(type, id);
    var textarea = _drawerEl.querySelector('#rxDrawerTextarea');
    var statusEl = _drawerEl.querySelector('#rxDrawerStatus');
    var charsEl = _drawerEl.querySelector('#rxDrawerCharCount');
    var badgeEl = _drawerEl.querySelector('#rxDrawerDocBadge');

    badgeEl.textContent = _activeTitle;
    textarea.value = noteData.text || '';
    charsEl.textContent = (noteData.text || '').length + ' chars';
    statusEl.textContent = noteData.savedAt ? '✓ Saved' : 'Ready';

    _drawerEl.classList.add('open');

    if (typeof _onDrawerStateChange === 'function') {
      _onDrawerStateChange(true);
    }

    setTimeout(function () {
      textarea.focus();
    }, 150);
  }

  function closeDrawer() {
    if (!_drawerEl) return;

    var textarea = _drawerEl.querySelector('#rxDrawerTextarea');
    if (_activeType && _activeId && textarea) {
      saveNote(_activeType, _activeId, textarea.value);
    }

    _drawerEl.classList.remove('open');
    updateTabLabel();

    if (typeof _onDrawerStateChange === 'function') {
      _onDrawerStateChange(false);
    }
  }

  function isDrawerOpen() {
    return Boolean(_drawerEl && _drawerEl.classList.contains('open'));
  }

  // ── Tab Management ───────────────────────────────────────────────────────────

  function updateTabLabel() {
    var libTab = document.getElementById('rxNotesLibraryTab');
    var readerTab = document.getElementById('rxNotesReaderTab');
    if (!_activeType || !_activeId) return;

    var noteData = loadNote(_activeType, _activeId);
    var hasNotes = Boolean(noteData.text && noteData.text.trim());

    var html = hasNotes
      ? '<span class="rx-tab-icon">✎</span><span class="rx-tab-label">Notes</span><span class="rx-tab-dot"></span>'
      : '<span class="rx-tab-icon">📝</span><span class="rx-tab-label">Want to make notes?</span>';

    if (libTab) {
      libTab.classList.toggle('rx-prompt-state', !hasNotes);
      libTab.innerHTML = html;
    }
    if (readerTab) {
      readerTab.classList.toggle('rx-prompt-state', !hasNotes);
      readerTab.innerHTML = html;
    }
  }

  // ── Library Topic Workspace Integration ──────────────────────────────────────

  function initLibraryWorkspace() {
    var workspace = document.getElementById('libraryWorkspace');
    if (!workspace) return;

    function getActiveTopicId() {
      // Primary: URL param (set by library.js before showing workspace)
      var params = new URLSearchParams(window.location.search);
      var fromUrl = params.get('topic');
      if (fromUrl) return fromUrl;
      // Fallback: read from wsTitle data attribute if library.js sets it
      var titleEl = document.getElementById('wsTitle');
      if (titleEl && titleEl.dataset && titleEl.dataset.topicId) return titleEl.dataset.topicId;
      return null;
    }

    function onTopicOpen() {
      var topicId = getActiveTopicId();
      if (!topicId) {
        // Retry once more after a longer delay in case URL hasn't updated yet
        setTimeout(function () {
          topicId = getActiveTopicId();
          if (!topicId) return;
          bindTopic(topicId);
        }, 200);
        return;
      }
      bindTopic(topicId);
    }

    function bindTopic(topicId) {
      var titleEl = document.getElementById('wsTitle');
      var title = titleEl ? (titleEl.textContent || topicId) : topicId;

      _activeType = 'topic';
      _activeId = topicId;
      _activeTitle = title;

      // Remove stale tab from previous topic before injecting new one
      var oldTab = document.getElementById('rxNotesLibraryTab');
      if (oldTab) oldTab.remove();

      injectLibraryEdgeTab();
      injectLibraryToolbarBtn();
      updateTabLabel();
    }

    function onTopicClose() {
      closeDrawer();
      var tab = document.getElementById('rxNotesLibraryTab');
      if (tab) tab.remove();
      var btn = document.getElementById('wsToggleNotes');
      if (btn) btn.remove();
    }

    var observer = new MutationObserver(function () {
      if (!workspace.hidden) {
        setTimeout(onTopicOpen, 80);
      } else {
        onTopicClose();
      }
    });
    observer.observe(workspace, { attributes: true, attributeFilter: ['hidden'] });

    if (!workspace.hidden) {
      setTimeout(onTopicOpen, 80);
    }
  }

  function injectLibraryEdgeTab() {
    if (document.getElementById('rxNotesLibraryTab')) return;

    var tab = document.createElement('button');
    tab.type = 'button';
    tab.id = 'rxNotesLibraryTab';
    tab.className = 'rx-notes-edge-tab';
    tab.setAttribute('aria-label', 'Open notes panel');

    tab.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer(_activeType, _activeId, _activeTitle, function (open) {
          tab.classList.toggle('active', open);
          var tbBtn = document.getElementById('wsToggleNotes');
          if (tbBtn) tbBtn.classList.toggle('active', open);
        });
      }
    });

    document.body.appendChild(tab);
  }

  function injectLibraryToolbarBtn() {
    var row = document.querySelector('.ws-tools-row');
    if (!row || document.getElementById('wsToggleNotes')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'wsToggleNotes';
    btn.className = 'ws-tool-btn ws-notes-tool-btn';
    btn.innerHTML = '📝 Notes';
    btn.title = 'Toggle Notes panel';
    btn.addEventListener('click', function () {
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer(_activeType, _activeId, _activeTitle, function (open) {
          btn.classList.toggle('active', open);
          var tab = document.getElementById('rxNotesLibraryTab');
          if (tab) tab.classList.toggle('active', open);
        });
      }
    });
    row.appendChild(btn);
  }

  // ── My Content Document Reader Integration ───────────────────────────────────

  function initUploadReader() {
    var modal = document.getElementById('rxReaderModal');
    if (!modal) return;

    function getUploadDocId() {
      var titleEl = document.getElementById('modalDocTitle');
      if (!titleEl) return null;
      var title = (titleEl.textContent || '').trim();
      if (!title || title === 'Document Viewer') return null;
      return sanitizeKey(title);
    }

    function onModalOpen() {
      var docId = getUploadDocId();
      if (!docId) return;

      var titleEl = document.getElementById('modalDocTitle');
      var docTitle = titleEl ? titleEl.textContent : 'Document';

      _activeType = 'upload';
      _activeId = docId;
      _activeTitle = docTitle;

      injectUploadFloatingBarBtn();
      injectUploadReaderTab();
    }

    function onModalClose() {
      closeDrawer();
      var btn = document.getElementById('rxBtnNotes');
      if (btn) btn.remove();
      var div = document.getElementById('rxBtnNotesDivider');
      if (div) div.remove();
      var tab = document.getElementById('rxNotesReaderTab');
      if (tab) tab.remove();
    }

    var observer = new MutationObserver(function () {
      if (modal.classList.contains('active')) {
        setTimeout(onModalOpen, 80);
      } else {
        onModalClose();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });

    var styleObserver = new MutationObserver(function () {
      if (modal.style.display === 'none') {
        onModalClose();
      }
    });
    styleObserver.observe(modal, { attributes: true, attributeFilter: ['style'] });
  }

  function injectUploadReaderTab() {
    if (document.getElementById('rxNotesReaderTab')) return;

    var container = document.querySelector('.rx-reader-modal-container');
    if (!container) return;

    var tab = document.createElement('button');
    tab.type = 'button';
    tab.id = 'rxNotesReaderTab';
    tab.className = 'rx-notes-reader-tab';
    tab.setAttribute('aria-label', 'Open notes panel');

    var noteData = loadNote(_activeType, _activeId);
    var hasNotes = Boolean(noteData.text && noteData.text.trim());

    if (hasNotes) {
      tab.innerHTML = '<span class="rx-tab-icon">✎</span><span class="rx-tab-label">Notes</span>';
    } else {
      tab.innerHTML = '<span class="rx-tab-icon">📝</span><span class="rx-tab-label">Want to make notes?</span>';
    }

    tab.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer(_activeType, _activeId, _activeTitle, function (open) {
          tab.classList.toggle('active', open);
          var barBtn = document.getElementById('rxBtnNotes');
          if (barBtn) barBtn.classList.toggle('active', open);
        });
      }
    });

    container.appendChild(tab);
  }

  function injectUploadFloatingBarBtn() {
    var bar = document.getElementById('rxFloatingControlBar');
    if (!bar || document.getElementById('rxBtnNotes')) return;

    var divider = document.createElement('span');
    divider.id = 'rxBtnNotesDivider';
    divider.className = 'rx-bar-divider';
    bar.appendChild(divider);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'rxBtnNotes';
    btn.className = 'rx-bar-btn rx-toggle-btn';
    btn.innerHTML = '<span>📝</span> Notes';
    btn.title = 'Toggle Notes panel';
    btn.addEventListener('click', function () {
      if (isDrawerOpen()) {
        closeDrawer();
      } else {
        openDrawer(_activeType, _activeId, _activeTitle, function (open) {
          btn.classList.toggle('active', open);
          var tab = document.getElementById('rxNotesReaderTab');
          if (tab) tab.classList.toggle('active', open);
        });
      }
    });
    bar.appendChild(btn);
  }

  // ── Library All-Notes View ───────────────────────────────────────────────────

  function initLibraryNotesView() {
    var toolbar = document.querySelector('.toolbar');
    if (!toolbar || document.getElementById('libraryNotesNavBtn')) return;

    var navBtn = document.createElement('button');
    navBtn.type = 'button';
    navBtn.id = 'libraryNotesNavBtn';
    navBtn.className = 'library-notes-nav-btn';
    navBtn.innerHTML = '📝 Notes';
    navBtn.title = 'View all your saved notes';
    toolbar.appendChild(navBtn);

    var main = document.querySelector('.page-main');
    if (!main) return;

    var viewEl = document.createElement('div');
    viewEl.id = 'rxLibraryNotesView';
    viewEl.className = 'rx-library-notes-view';
    viewEl.hidden = true;
    viewEl.innerHTML = [
      '<div class="rx-lnv-header">',
        '<button type="button" class="rx-lnv-back" id="rxLnvBack">← Back to Library</button>',
        '<h2 class="rx-lnv-title">📝 Your Saved Notes</h2>',
        '<p class="rx-lnv-subtitle">Browse and manage notes across all your Library topics and uploaded documents.</p>',
      '</div>',
      '<div class="rx-lnv-body">',
        '<div class="rx-lnv-empty" id="rxLnvEmpty" hidden>',
          '<span class="rx-lnv-empty-icon">📒</span>',
          '<p>No notes written yet. Open any Library topic or uploaded document to start taking notes!</p>',
        '</div>',
        '<div class="rx-lnv-list" id="rxLnvList"></div>',
      '</div>'
    ].join('');

    main.appendChild(viewEl);

    navBtn.addEventListener('click', showNotesView);
    viewEl.querySelector('#rxLnvBack').addEventListener('click', hideNotesView);

    function showNotesView() {
      var browse = document.getElementById('libraryBrowse');
      var workspace = document.getElementById('libraryWorkspace');
      if (browse) browse.hidden = true;
      if (workspace) workspace.hidden = true;

      renderNotesList();
      viewEl.hidden = false;
      navBtn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function hideNotesView() {
      viewEl.hidden = true;
      navBtn.classList.remove('active');
      var browse = document.getElementById('libraryBrowse');
      if (browse) browse.hidden = false;
    }

    function renderNotesList() {
      var list = document.getElementById('rxLnvList');
      var empty = document.getElementById('rxLnvEmpty');
      if (!list) return;

      list.innerHTML = '';
      var all = getAllNotes();

      if (all.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;

      all.forEach(function (n) {
        var card = document.createElement('div');
        card.className = 'rx-lnv-card';

        var isUpload = n.type === 'upload';
        var badge = isUpload ? '📄 My Content' : '📚 Library Topic';
        var titleDisplay = n.id.replace(/-/g, ' ');

        card.innerHTML = [
          '<div class="rx-lnv-card-header">',
            '<span class="rx-lnv-card-type">' + badge + '</span>',
            '<span class="rx-lnv-card-date">' + formatTime(n.savedAt) + '</span>',
          '</div>',
          '<h4 class="rx-lnv-card-title">' + escapeHTML(titleDisplay) + '</h4>',
          '<p class="rx-lnv-card-preview">' + escapeHTML(n.text) + '</p>',
          '<div class="rx-lnv-card-footer">',
            (!isUpload
              ? '<button type="button" class="rx-lnv-open-btn" data-topic="' + escapeHTML(n.id) + '">Open Topic →</button>'
              : '<span class="rx-lnv-upload-note">Open in My Content</span>'),
            '<button type="button" class="rx-lnv-delete-btn" title="Delete note">🗑</button>',
          '</div>'
        ].join('');

        var openBtn = card.querySelector('.rx-lnv-open-btn');
        if (openBtn) {
          openBtn.addEventListener('click', function () {
            hideNotesView();
            var tid = openBtn.getAttribute('data-topic');
            window.location.href = 'library.html?topic=' + encodeURIComponent(tid);
          });
        }

        var deleteBtn = card.querySelector('.rx-lnv-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function () {
            showConfirmModal(function () {
              deleteNote(n.type, n.id);
              renderNotesList();
            });
          });
        }

        list.appendChild(card);
      });
    }
  }

  // ── Page Initializer ─────────────────────────────────────────────────────────

  function init() {
    var page = window.location.pathname.split('/').pop() || '';

    if (page === 'library.html' || page === '' || page === 'index.html') {
      if (document.getElementById('libraryWorkspace')) {
        document.addEventListener('DOMContentLoaded', function () {
          initLibraryWorkspace();
          initLibraryNotesView();
        });
      }
    }

    if (page === 'upload.html') {
      document.addEventListener('DOMContentLoaded', function () {
        initUploadReader();
      });
    }
  }

  init();

  // Public debug API
  window.ReadXNotes = {
    open: function () { openDrawer(_activeType, _activeId, _activeTitle); },
    close: closeDrawer,
    load: loadNote,
    save: saveNote,
    getAll: getAllNotes
  };

})();
