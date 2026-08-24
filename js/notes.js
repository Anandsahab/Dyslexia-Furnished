// js/notes.js — ReadX "MAKE MY NOTES" Feature
// Scope: Exclusively on Library topic content pages and My Content document reader.
// Positioned on the right side of the content/reading area.
// Allows creating, writing/editing, saving, viewing, and deleting notes per topic / document.
// Client-side localStorage persistence. Zero backend/API dependencies.

(function () {
  'use strict';

  // ── Storage Helpers ──────────────────────────────────────────────────────────

  function sanitizeKey(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').slice(0, 64);
  }

  function getStorageKey(type, id) {
    return 'readx_notes_' + type + '_' + sanitizeKey(id);
  }

  function loadNotes(type, id) {
    if (!type || !id) return [];
    try {
      var key = getStorageKey(type, id);
      var raw = localStorage.getItem(key);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      // Handle legacy single-object format if present
      if (parsed && typeof parsed === 'object' && parsed.text && parsed.text.trim()) {
        return [{
          id: 'note_' + (parsed.savedAt || Date.now()),
          text: parsed.text,
          createdAt: parsed.savedAt || Date.now(),
          updatedAt: parsed.savedAt || Date.now()
        }];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  function saveNotes(type, id, notes) {
    if (!type || !id) return false;
    try {
      var key = getStorageKey(type, id);
      if (!notes || notes.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(notes));
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function formatDate(ts) {
    if (!ts) return '';
    try {
      var d = new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
        ' at ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Active Context & Drawer UI ───────────────────────────────────────────────

  var _activeType = null;   // 'topic' | 'doc'
  var _activeId = null;     // topicId | docId
  var _activeTitle = '';    // human readable title
  var _editingNoteId = null;
  var _drawerEl = null;

  function ensureDrawerInDOM() {
    if (_drawerEl) return _drawerEl;

    var overlay = document.createElement('div');
    overlay.id = 'rxNotesDrawerOverlay';
    overlay.className = 'rx-notes-drawer-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<div class="rx-notes-drawer-backdrop" id="rxNotesBackdrop"></div>',
      '<div class="rx-notes-drawer" role="dialog" aria-modal="true" aria-label="Make My Notes">',
        '<div class="rx-notes-drawer-header">',
          '<div class="rx-notes-header-left">',
            '<span class="rx-notes-header-icon">📝</span>',
            '<div class="rx-notes-header-titles">',
              '<h3 class="rx-notes-heading">MAKE MY NOTES</h3>',
              '<span class="rx-notes-doc-badge" id="rxNotesDocBadge">Content</span>',
            '</div>',
          '</div>',
          '<div class="rx-notes-header-right">',
            '<span class="rx-notes-badge" id="rxNotesCountBadge">0 notes</span>',
            '<button type="button" class="rx-notes-close-btn" id="rxNotesDrawerCloseBtn" aria-label="Close notes" title="Close">✕</button>',
          '</div>',
        '</div>',
        '<div class="rx-notes-drawer-body">',
          '<div class="rx-notes-list" id="rxNotesDrawerList"></div>',
          '<div class="rx-notes-compose">',
            '<span class="rx-notes-compose-label">Add a Note</span>',
            '<textarea class="rx-notes-textarea" id="rxNotesDrawerInput" placeholder="Write your note here… (key concepts, formulas, reminders, questions)" rows="4"></textarea>',
            '<div class="rx-notes-compose-actions">',
              '<button type="button" class="btn btn-primary btn-sm" id="rxNotesDrawerSaveBtn">Save Note</button>',
              '<button type="button" class="btn btn-ghost btn-sm" id="rxNotesDrawerClearBtn">Clear</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    _drawerEl = overlay;

    var backdrop = overlay.querySelector('#rxNotesBackdrop');
    var closeBtn = overlay.querySelector('#rxNotesDrawerCloseBtn');
    var saveBtn = overlay.querySelector('#rxNotesDrawerSaveBtn');
    var clearBtn = overlay.querySelector('#rxNotesDrawerClearBtn');
    var textarea = overlay.querySelector('#rxNotesDrawerInput');

    backdrop.addEventListener('click', closeNotesDrawer);
    closeBtn.addEventListener('click', closeNotesDrawer);

    saveBtn.addEventListener('click', function () {
      if (!_activeType || !_activeId) return;
      var text = (textarea.value || '').trim();
      if (!text) return;
      var current = loadNotes(_activeType, _activeId);
      var newNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: text,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      current.push(newNote);
      saveNotes(_activeType, _activeId, current);
      textarea.value = '';
      renderDrawerNotes();
      updateTriggerButtons();
    });

    clearBtn.addEventListener('click', function () {
      textarea.value = '';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isNotesDrawerOpen()) {
        closeNotesDrawer();
      }
    });

    return _drawerEl;
  }

  function isNotesDrawerOpen() {
    return Boolean(_drawerEl && _drawerEl.classList.contains('active'));
  }

  function openNotesDrawer(type, id, title) {
    _activeType = type;
    _activeId = id;
    _activeTitle = title || 'Content';
    _editingNoteId = null;

    ensureDrawerInDOM();

    var badge = _drawerEl.querySelector('#rxNotesDocBadge');
    if (badge) badge.textContent = _activeTitle;

    var textarea = _drawerEl.querySelector('#rxNotesDrawerInput');
    if (textarea) textarea.value = '';

    renderDrawerNotes();

    _drawerEl.style.display = 'block';
    _drawerEl.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      _drawerEl.classList.add('active');
      if (textarea) textarea.focus();
    });
  }

  function closeNotesDrawer() {
    if (!_drawerEl) return;
    _editingNoteId = null;
    _drawerEl.classList.remove('active');
    _drawerEl.setAttribute('aria-hidden', 'true');
    setTimeout(function () {
      if (!_drawerEl.classList.contains('active')) {
        _drawerEl.style.display = 'none';
      }
    }, 250);
    updateTriggerButtons();
  }

  function renderDrawerNotes() {
    if (!_drawerEl || !_activeType || !_activeId) return;

    var listEl = _drawerEl.querySelector('#rxNotesDrawerList');
    var countBadge = _drawerEl.querySelector('#rxNotesCountBadge');
    if (!listEl) return;

    var notes = loadNotes(_activeType, _activeId);

    if (countBadge) {
      countBadge.textContent = notes.length + ' note' + (notes.length === 1 ? '' : 's');
    }

    if (notes.length === 0) {
      listEl.innerHTML = '<div class="rx-notes-empty-state">No notes saved yet for this content. Write your first note below!</div>';
      return;
    }

    listEl.innerHTML = notes.map(function (note) {
      var isEditing = _editingNoteId === note.id;
      if (isEditing) {
        return [
          '<div class="rx-note-card rx-note-card--editing" data-note-id="' + escapeHtml(note.id) + '">',
            '<div class="rx-note-edit-box">',
              '<textarea class="rx-notes-textarea rx-notes-edit-input" id="rxEditInput_' + escapeHtml(note.id) + '">' + escapeHtml(note.text) + '</textarea>',
              '<div class="rx-note-actions">',
                '<button type="button" class="btn btn-primary btn-sm rx-note-save-edit-btn" data-note-id="' + escapeHtml(note.id) + '">Save Changes</button>',
                '<button type="button" class="btn btn-ghost btn-sm rx-note-cancel-edit-btn" data-note-id="' + escapeHtml(note.id) + '">Cancel</button>',
              '</div>',
            '</div>',
          '</div>'
        ].join('');
      }

      var dateLabel = formatDate(note.updatedAt || note.createdAt);
      return [
        '<div class="rx-note-card" data-note-id="' + escapeHtml(note.id) + '">',
          '<div class="rx-note-card-header">',
            '<span class="rx-note-date">' + escapeHtml(dateLabel) + '</span>',
            '<div class="rx-note-actions">',
              '<button type="button" class="rx-note-action-btn rx-note-edit-btn" data-note-id="' + escapeHtml(note.id) + '" title="Edit note">✏️ Edit</button>',
              '<button type="button" class="rx-note-action-btn delete-btn rx-note-delete-btn" data-note-id="' + escapeHtml(note.id) + '" title="Delete note">🗑️ Delete</button>',
            '</div>',
          '</div>',
          '<div class="rx-note-text">' + escapeHtml(note.text) + '</div>',
        '</div>'
      ].join('');
    }).join('');

    // Bind Edit buttons
    listEl.querySelectorAll('.rx-note-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var noteId = btn.getAttribute('data-note-id');
        _editingNoteId = noteId;
        renderDrawerNotes();
        var editInput = document.getElementById('rxEditInput_' + noteId);
        if (editInput) {
          editInput.focus();
          editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        }
      });
    });

    // Bind Save Edit buttons
    listEl.querySelectorAll('.rx-note-save-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var noteId = btn.getAttribute('data-note-id');
        var editInput = document.getElementById('rxEditInput_' + noteId);
        if (!editInput) return;
        var updatedText = (editInput.value || '').trim();
        if (!updatedText) return;

        var current = loadNotes(_activeType, _activeId);
        var target = current.find(function (n) { return n.id === noteId; });
        if (target) {
          target.text = updatedText;
          target.updatedAt = Date.now();
          saveNotes(_activeType, _activeId, current);
        }
        _editingNoteId = null;
        renderDrawerNotes();
        updateTriggerButtons();
      });
    });

    // Bind Cancel Edit buttons
    listEl.querySelectorAll('.rx-note-cancel-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _editingNoteId = null;
        renderDrawerNotes();
      });
    });

    // Bind Delete buttons
    listEl.querySelectorAll('.rx-note-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var noteId = btn.getAttribute('data-note-id');
        var current = loadNotes(_activeType, _activeId);
        var filtered = current.filter(function (n) { return n.id !== noteId; });
        saveNotes(_activeType, _activeId, filtered);
        if (_editingNoteId === noteId) {
          _editingNoteId = null;
        }
        renderDrawerNotes();
        updateTriggerButtons();
      });
    });
  }

  // ── Trigger Buttons Update ───────────────────────────────────────────────────

  function updateTriggerButtons() {
    // 1. Library button
    var libBtn = document.getElementById('wsMakeNotesBtn');
    var libTopicId = getActiveLibraryTopicId();
    if (libBtn && libTopicId) {
      var libNotes = loadNotes('topic', libTopicId);
      var libCount = libNotes.length;
      libBtn.innerHTML = '<span>📝</span> MAKE MY NOTES' + (libCount > 0 ? ' <span class="notes-count-pill">' + libCount + '</span>' : '');
    }

    // 2. My Content button
    var uploadBtn = document.getElementById('uploadMakeNotesBtn');
    var docId = getActiveUploadDocId();
    if (uploadBtn && docId) {
      var docNotes = loadNotes('doc', docId);
      var docCount = docNotes.length;
      uploadBtn.innerHTML = '<span>📝</span> MAKE MY NOTES' + (docCount > 0 ? ' <span class="notes-count-pill">' + docCount + '</span>' : '');
    }
  }

  // ── Helper ID getters ────────────────────────────────────────────────────────

  function getActiveLibraryTopicId() {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = params.get('topic');
    if (fromUrl) return fromUrl;
    var titleEl = document.getElementById('wsTitle');
    if (titleEl && titleEl.dataset && titleEl.dataset.topicId) {
      return titleEl.dataset.topicId;
    }
    return null;
  }

  function getActiveLibraryTopicTitle() {
    var titleEl = document.getElementById('wsTitle');
    return titleEl ? (titleEl.textContent || '').trim() : 'Topic';
  }

  function getActiveUploadDocId() {
    var titleEl = document.getElementById('modalDocTitle');
    if (!titleEl) return null;
    var title = (titleEl.textContent || '').trim();
    if (!title || title === 'Document Viewer') return null;
    return sanitizeKey(title);
  }

  function getActiveUploadDocTitle() {
    var titleEl = document.getElementById('modalDocTitle');
    return titleEl ? (titleEl.textContent || '').trim() : 'Document';
  }

  // ── Library Integration ──────────────────────────────────────────────────────

  function initLibraryIntegration() {
    var workspace = document.getElementById('libraryWorkspace');
    if (!workspace) return;

    var btn = document.getElementById('wsMakeNotesBtn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var topicId = getActiveLibraryTopicId();
        if (!topicId) return;
        var title = getActiveLibraryTopicTitle();
        openNotesDrawer('topic', topicId, title);
      });
    }

    if (typeof MutationObserver !== 'undefined') {
      var workspaceObserver = new MutationObserver(function () {
        if (!workspace.hidden) {
          updateTriggerButtons();
        } else if (isNotesDrawerOpen()) {
          closeNotesDrawer();
        }
      });
      workspaceObserver.observe(workspace, { attributes: true, attributeFilter: ['hidden'] });
    }

    if (!workspace.hidden) {
      updateTriggerButtons();
    }
  }

  // ── My Content Integration ───────────────────────────────────────────────────

  function initUploadIntegration() {
    var modal = document.getElementById('rxReaderModal');
    if (!modal) return;

    var btn = document.getElementById('uploadMakeNotesBtn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var docId = getActiveUploadDocId();
        if (!docId) return;
        var title = getActiveUploadDocTitle();
        openNotesDrawer('doc', docId, title);
      });
    }

    if (typeof MutationObserver !== 'undefined') {
      var modalObserver = new MutationObserver(function () {
        if (modal.classList.contains('active')) {
          setTimeout(updateTriggerButtons, 50);
        } else if (isNotesDrawerOpen()) {
          closeNotesDrawer();
        }
      });
      modalObserver.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
    }
  }

  // ── Main Initializer ─────────────────────────────────────────────────────────

  function init() {
    var page = window.location.pathname.split('/').pop() || '';

    if (page === 'library.html' || page === 'library' || page === 'index.html') {
      initLibraryIntegration();
    }

    if (page === 'upload.html' || page === 'upload') {
  initUploadIntegration();
}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.ReadXNotes = {
    getNotes: loadNotes,
    saveNotes: saveNotes,
    open: openNotesDrawer,
    close: closeNotesDrawer,
    updateButtons: updateTriggerButtons
  };

})();
