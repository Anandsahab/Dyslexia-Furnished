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

  // ── Speak-to-Write Speech Recognition & Audio Visualizer ──────────────────

  function calculateRMS(samples) {
    if (!samples || samples.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < samples.length; i++) {
      var val = samples[i];
      sum += val * val;
    }
    return Math.sqrt(sum / samples.length);
  }

  function calculateLevelPercent(rms, gain, smoothingFactor, previousLevel) {
    var effectiveGain = typeof gain === 'number' ? gain : 3.5;
    var raw = Math.min(100, Math.max(0, rms * effectiveGain * 100));

    // Silence gate to suppress low ambient noise floor
    if (raw < 1.5) {
      raw = 0;
    }

    if (typeof previousLevel === 'number') {
      var factor = typeof smoothingFactor === 'number' ? smoothingFactor : 0.75;
      return Math.round((previousLevel * factor + raw * (1 - factor)) * 10) / 10;
    }
    return Math.round(raw * 10) / 10;
  }

  function mergeTranscript(baseText, finalTranscript, interimTranscript) {
    var base = (baseText || '').trim();
    var finalT = (finalTranscript || '').trim();
    var interimT = (interimTranscript || '').trim();

    var result = base;
    if (finalT) {
      if (result.length > 0) {
        result += ' ' + finalT;
      } else {
        result = finalT;
      }
    }
    if (interimT) {
      if (result.length > 0) {
        result += ' ' + interimT;
      } else {
        result = interimT;
      }
    }
    return result;
  }

  function mapSpeechErrorToStatus(errorCode) {
    switch (errorCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone access denied. Please allow microphone permissions in browser settings.';
      case 'audio-capture':
        return 'Microphone unavailable or capture failed. Check your audio device.';
      case 'no-speech':
        return 'No speech detected. Press "Speak to Write" to try again.';
      case 'network':
        return 'Speech network service error. Check connection or browser privacy shields.';
      case 'aborted':
        return 'Speech recognition was stopped.';
      case 'language-not-supported':
        return 'Selected language is not supported by your browser.';
      default:
        return 'Speech recognition error: ' + (errorCode || 'unknown');
    }
  }

  var SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  var _speechSupported = Boolean(SpeechRecognition);
  var _recognition = null;
  var _isRecording = false;
  var _speechLang = 'en-IN';
  var _sessionBaseText = '';
  var _sessionFinalText = '';
  var _sessionInterimText = '';
  var _lastFinalIndex = 0;
  var _isProgrammaticUpdate = false;

  // ── Web Audio State ────────────────────────────────────────────────────────
  var _audioCtx = null;
  var _audioStream = null;
  var _sourceNode = null;
  var _analyserNode = null;
  var _rafId = null;
  var _micSessionId = 0;
  var _isMeasuringAudio = false;
  var _currentAudioLevel = 0;
  var _lastVoiceDetected = false;

  function isSpeechSupported() {
    return _speechSupported;
  }

  function getSpeechState() {
    return {
      supported: _speechSupported,
      recording: _isRecording,
      lang: _speechLang,
      baseText: _sessionBaseText,
      finalText: _sessionFinalText,
      interimText: _sessionInterimText,
      lastFinalIndex: _lastFinalIndex,
      isProgrammaticUpdate: _isProgrammaticUpdate
    };
  }

  function updateVisualizerUI(levelPercent, isVoiceDetected, sampleData) {
    if (!_drawerEl) return;
    var valEl = _drawerEl.querySelector('#rxAudioLevelVal');
    var barEl = _drawerEl.querySelector('#rxAudioLevelBar');
    var badgeEl = _drawerEl.querySelector('#rxVoiceActivityBadge');

    if (valEl) {
      valEl.textContent = Math.round(levelPercent) + '%';
      valEl.setAttribute('aria-label', 'Microphone input level: ' + Math.round(levelPercent) + ' percent');
    }
    if (barEl) {
      barEl.style.width = Math.min(100, Math.max(0, levelPercent)) + '%';
    }
    if (badgeEl) {
      if (!_isRecording && !_isMeasuringAudio) {
        badgeEl.textContent = 'Idle';
        badgeEl.className = 'rx-voice-activity-badge rx-badge-idle';
      } else if (isVoiceDetected) {
        badgeEl.textContent = 'Voice detected';
        badgeEl.className = 'rx-voice-activity-badge rx-badge-voice';
      } else {
        badgeEl.textContent = 'No voice detected';
        badgeEl.className = 'rx-voice-activity-badge rx-badge-novoice';
      }
    }

    if (sampleData && _drawerEl) {
      var vbars = _drawerEl.querySelectorAll('.rx-vbar');
      if (vbars && vbars.length > 0) {
        var step = Math.floor(sampleData.length / vbars.length);
        for (var b = 0; b < vbars.length; b++) {
          var sampleVal = Math.abs(sampleData[b * step] || 0);
          var barHeight = Math.min(100, Math.max(8, Math.round(sampleVal * 100 * 2.5 + (levelPercent * 0.4))));
          vbars[b].style.height = barHeight + '%';
        }
      }
    }
  }

  function resetVisualizerUI() {
    _currentAudioLevel = 0;
    _lastVoiceDetected = false;
    updateVisualizerUI(0, false, null);
    if (_drawerEl) {
      var vbars = _drawerEl.querySelectorAll('.rx-vbar');
      if (vbars) {
        for (var b = 0; b < vbars.length; b++) {
          vbars[b].style.height = '10%';
        }
      }
      var badgeEl = _drawerEl.querySelector('#rxVoiceActivityBadge');
      if (badgeEl) {
        badgeEl.textContent = 'Idle';
        badgeEl.className = 'rx-voice-activity-badge rx-badge-idle';
      }
    }
  }

  function startAudioVisualizer(onReady, onError) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError({ code: 'not-supported', message: 'Microphone access is not supported in this browser environment.' });
      return;
    }

    var sessionId = ++_micSessionId;
    _isMeasuringAudio = true;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        // Handle late-resolving promises: if session was cancelled or drawer closed, release tracks immediately
        if (sessionId !== _micSessionId || (!_isRecording && !_isMeasuringAudio)) {
          stream.getTracks().forEach(function (track) {
            try { track.stop(); } catch (e) {}
          });
          return;
        }

        _audioStream = stream;

        // Monitor stream disconnection
        stream.getAudioTracks().forEach(function (track) {
          track.onended = function () {
            if (sessionId === _micSessionId) {
              stopAudioVisualizer();
              updateSpeechUI('error', 'Microphone stream ended unexpectedly or hardware disconnected.');
            }
          };
        });

        var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) {
          if (onError) onError({ code: 'audio-context-unsupported', message: 'Web Audio API is not supported in this browser.' });
          return;
        }

        try {
          _audioCtx = new AudioCtxClass();
          _sourceNode = _audioCtx.createMediaStreamSource(stream);
          _analyserNode = _audioCtx.createAnalyser();
          _analyserNode.fftSize = 256;
          _analyserNode.smoothingTimeConstant = 0.8;

          // Connect source strictly to analyser; NEVER to destination (avoids feedback!)
          _sourceNode.connect(_analyserNode);

          var bufferLength = _analyserNode.frequencyBinCount;
          var floatData = new Float32Array(bufferLength);
          var byteData = new Uint8Array(bufferLength);

          function renderFrame() {
            if (sessionId !== _micSessionId || !_isMeasuringAudio) return;

            var samples = [];
            if (_analyserNode.getFloatTimeDomainData) {
              _analyserNode.getFloatTimeDomainData(floatData);
              samples = floatData;
            } else if (_analyserNode.getByteTimeDomainData) {
              _analyserNode.getByteTimeDomainData(byteData);
              for (var i = 0; i < byteData.length; i++) {
                floatData[i] = (byteData[i] - 128) / 128;
              }
              samples = floatData;
            }

            var rms = calculateRMS(samples);
            _currentAudioLevel = calculateLevelPercent(rms, 3.5, 0.75, _currentAudioLevel);
            var isVoice = _currentAudioLevel > 4.0;

            updateVisualizerUI(_currentAudioLevel, isVoice, samples);

            // Announce voice activity status changes only on state transition (prevents screen reader spam)
            if (isVoice !== _lastVoiceDetected && _isRecording) {
              _lastVoiceDetected = isVoice;
              var statusEl = _drawerEl ? _drawerEl.querySelector('#rxNotesSpeechStatus') : null;
              if (statusEl && statusEl.classList.contains('rx-status-listening')) {
                statusEl.textContent = isVoice
                  ? '🟢 Listening — Voice detected'
                  : '🟡 Listening — No voice detected';
              }
            }

            _rafId = requestAnimationFrame(renderFrame);
          }

          _rafId = requestAnimationFrame(renderFrame);

          if (onReady) onReady();
        } catch (err) {
          if (onError) onError({ code: 'init-failed', message: 'Failed to initialize audio analyser: ' + (err.message || 'Error') });
        }
      })
      .catch(function (err) {
        if (sessionId !== _micSessionId) return;
        _isMeasuringAudio = false;
        var errName = err ? (err.name || err.message) : '';
        var code = 'unknown';
        var msg = 'Could not access microphone: ' + (err.message || 'Unknown error');

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          code = 'permission-denied';
          msg = 'Microphone access denied. Please allow microphone permissions in browser settings.';
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          code = 'not-found';
          msg = 'No microphone device found. Please check connected audio input devices.';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          code = 'not-readable';
          msg = 'Microphone is unavailable or busy with another application.';
        }

        if (onError) onError({ code: code, message: msg });
      });
  }

  function stopAudioVisualizer() {
    _micSessionId++; // Invalidate pending getUserMedia promises
    _isMeasuringAudio = false;

    if (_rafId) {
      cancelAnimationFrame(_rafId);
      _rafId = null;
    }

    if (_sourceNode) {
      try { _sourceNode.disconnect(); } catch (e) {}
      _sourceNode = null;
    }

    if (_analyserNode) {
      try { _analyserNode.disconnect(); } catch (e) {}
      _analyserNode = null;
    }

    if (_audioStream) {
      try {
        _audioStream.getTracks().forEach(function (track) {
          try { track.stop(); } catch (e) {}
        });
      } catch (e) {}
      _audioStream = null;
    }

    if (_audioCtx) {
      try {
        if (_audioCtx.state !== 'closed') {
          _audioCtx.close();
        }
      } catch (e) {}
      _audioCtx = null;
    }

    resetVisualizerUI();
  }

  function updateSpeechUI(state, customMessage) {
    if (!_drawerEl) return;
    var micBtn = _drawerEl.querySelector('#rxNotesMicBtn');
    var micLabel = _drawerEl.querySelector('#rxNotesMicLabel');
    var stopBtn = _drawerEl.querySelector('#rxNotesStopBtn');
    var langSelect = _drawerEl.querySelector('#rxNotesLangSelect');
    var statusEl = _drawerEl.querySelector('#rxNotesSpeechStatus');
    var interimEl = _drawerEl.querySelector('#rxNotesInterimDisplay');
    var clearSpeechBtn = _drawerEl.querySelector('#rxNotesClearSpeechBtn');

    if (!_speechSupported) {
      if (micBtn) {
        micBtn.disabled = false; // Keep enabled so user can see mic meter even if speech-to-text is unavailable
        micBtn.classList.remove('is-recording');
        micBtn.title = 'Speech-to-text is not supported in this browser. Microphone meter will display level.';
      }
      if (stopBtn) stopBtn.style.display = _isMeasuringAudio ? 'inline-flex' : 'none';
      if (langSelect) langSelect.disabled = true;
      if (statusEl) {
        statusEl.textContent = customMessage || 'Speech recognition is not supported in this browser. Microphone meter active.';
        statusEl.className = 'rx-notes-speech-status rx-status-unsupported';
      }
      if (interimEl) {
        interimEl.textContent = '';
        interimEl.style.display = 'none';
      }
      if (clearSpeechBtn) clearSpeechBtn.style.display = 'none';
      return;
    }

    if (state === 'listening') {
      if (micBtn) {
        micBtn.disabled = false;
        micBtn.classList.add('is-recording');
        micBtn.setAttribute('aria-label', 'Listening. Click to stop speech recognition');
        micBtn.title = 'Click to stop recording';
      }
      if (micLabel) micLabel.textContent = 'Listening…';
      if (stopBtn) stopBtn.style.display = 'inline-flex';
      if (langSelect) langSelect.disabled = true;
      if (statusEl) {
        statusEl.textContent = customMessage || '🟢 Listening — Voice detected';
        statusEl.className = 'rx-notes-speech-status rx-status-listening';
      }
      if (clearSpeechBtn) {
        clearSpeechBtn.style.display = _sessionFinalText ? 'inline-flex' : 'none';
      }
    } else if (state === 'requesting') {
      if (micBtn) {
        micBtn.disabled = true;
        micBtn.classList.remove('is-recording');
      }
      if (micLabel) micLabel.textContent = 'Requesting…';
      if (stopBtn) stopBtn.style.display = 'none';
      if (langSelect) langSelect.disabled = true;
      if (statusEl) {
        statusEl.textContent = customMessage || 'Requesting microphone permission…';
        statusEl.className = 'rx-notes-speech-status rx-status-requesting';
      }
    } else if (state === 'stopped') {
      if (micBtn) {
        micBtn.disabled = false;
        micBtn.classList.remove('is-recording');
        micBtn.setAttribute('aria-label', 'Start speak to write');
        micBtn.title = 'Dictate note with microphone';
      }
      if (micLabel) micLabel.textContent = 'Speak to Write';
      if (stopBtn) stopBtn.style.display = 'none';
      if (langSelect) langSelect.disabled = false;
      if (statusEl) {
        statusEl.textContent = customMessage || 'Speech stopped. Note ready to edit or save.';
        statusEl.className = 'rx-notes-speech-status rx-status-stopped';
      }
      if (interimEl) {
        interimEl.textContent = '';
        interimEl.style.display = 'none';
      }
      if (clearSpeechBtn) {
        clearSpeechBtn.style.display = _sessionFinalText ? 'inline-flex' : 'none';
      }
    } else if (state === 'error') {
      if (micBtn) {
        micBtn.disabled = false;
        micBtn.classList.remove('is-recording');
        micBtn.setAttribute('aria-label', 'Start speak to write');
      }
      if (micLabel) micLabel.textContent = 'Speak to Write';
      if (stopBtn) stopBtn.style.display = 'none';
      if (langSelect) langSelect.disabled = false;
      if (statusEl) {
        statusEl.textContent = customMessage || 'Speech recognition encountered an issue.';
        statusEl.className = 'rx-notes-speech-status rx-status-error';
      }
      if (interimEl) {
        interimEl.textContent = '';
        interimEl.style.display = 'none';
      }
      if (clearSpeechBtn) {
        clearSpeechBtn.style.display = _sessionFinalText ? 'inline-flex' : 'none';
      }
    } else {
      // idle / ready
      if (micBtn) {
        micBtn.disabled = false;
        micBtn.classList.remove('is-recording');
        micBtn.setAttribute('aria-label', 'Start speak to write');
        micBtn.title = 'Dictate note with microphone';
      }
      if (micLabel) micLabel.textContent = 'Speak to Write';
      if (stopBtn) stopBtn.style.display = 'none';
      if (langSelect) langSelect.disabled = false;
      if (statusEl) {
        statusEl.textContent = customMessage || 'Ready to dictate';
        statusEl.className = 'rx-notes-speech-status rx-status-idle';
      }
      if (interimEl) {
        interimEl.textContent = '';
        interimEl.style.display = 'none';
      }
      if (clearSpeechBtn) {
        clearSpeechBtn.style.display = _sessionFinalText ? 'inline-flex' : 'none';
      }
    }
  }

  function startSpeechRecognition() {
    if (!_speechSupported) return;

    var textarea = _drawerEl ? _drawerEl.querySelector('#rxNotesDrawerInput') : null;
    if (!textarea) return;

    try {
      if (_recognition) {
        try { _recognition.abort(); } catch (e) {}
        _recognition = null;
      }

      var RecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      _recognition = new RecClass();
      _recognition.continuous = true;
      _recognition.interimResults = true;
      var langSelect = _drawerEl ? _drawerEl.querySelector('#rxNotesLangSelect') : null;
      if (langSelect && langSelect.value) {
        _speechLang = langSelect.value;
      }
      _recognition.lang = _speechLang || 'en-IN';
      _recognition.maxAlternatives = 1;
      _lastFinalIndex = 0;

      _recognition.onstart = function () {
        _isRecording = true;
        updateSpeechUI('listening');
      };

      _recognition.onresult = function (event) {
        if (!_isRecording) return;
        var newFinal = '';
        var currentInterim = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          var item = event.results[i];
          if (item && item[0]) {
            var transcript = item[0].transcript || '';
            if (item.isFinal) {
              if (i >= _lastFinalIndex) {
                newFinal += (newFinal ? ' ' : '') + transcript.trim();
                _lastFinalIndex = i + 1;
              }
            } else {
              currentInterim += transcript;
            }
          }
        }

        if (newFinal) {
          _sessionFinalText = (_sessionFinalText ? _sessionFinalText + ' ' : '') + newFinal;
        }
        _sessionInterimText = currentInterim;

        var merged = mergeTranscript(_sessionBaseText, _sessionFinalText, _sessionInterimText);
        textarea.value = merged;

        var interimEl = _drawerEl ? _drawerEl.querySelector('#rxNotesInterimDisplay') : null;
        if (interimEl) {
          if (_sessionInterimText && _sessionInterimText.trim()) {
            interimEl.textContent = '“' + _sessionInterimText.trim() + '…”';
            interimEl.style.display = 'block';
          } else {
            interimEl.textContent = '';
            interimEl.style.display = 'none';
          }
        }

        var clearSpeechBtn = _drawerEl ? _drawerEl.querySelector('#rxNotesClearSpeechBtn') : null;
        if (clearSpeechBtn && _sessionFinalText) {
          clearSpeechBtn.style.display = 'inline-flex';
        }

        try {
          _isProgrammaticUpdate = true;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (e) {} finally {
          _isProgrammaticUpdate = false;
        }
      };

      _recognition.onerror = function (event) {
        var errCode = (event && event.error) ? event.error : 'unknown';
        if (errCode === 'no-speech') {
          return;
        }
        var msg = mapSpeechErrorToStatus(errCode);
        _isRecording = false;
        updateSpeechUI('error', msg);
      };

      _recognition.onend = function () {
        var wasRecording = _isRecording;
        _isRecording = false;

        if (textarea) {
          textarea.value = mergeTranscript(_sessionBaseText, _sessionFinalText, '');
          _sessionInterimText = '';
          _sessionBaseText = textarea.value;
          try {
            _isProgrammaticUpdate = true;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          } catch (e) {} finally {
            _isProgrammaticUpdate = false;
          }
        }

        if (wasRecording) {
          updateSpeechUI('stopped', 'Speech stopped. Note ready to edit or save.');
        } else {
          updateSpeechUI('stopped');
        }
      };

      _recognition.start();
    } catch (err) {
      _isRecording = false;
      updateSpeechUI('error', 'Could not start speech recognition: ' + (err.message || 'Error'));
    }
  }

  function stopSpeechRecognition(abort) {
    if (!_recognition && !_isRecording) return;
    _isRecording = false;
    if (_recognition) {
      try {
        if (abort) {
          _recognition.abort();
        } else {
          _recognition.stop();
        }
      } catch (e) {}
      _recognition = null;
    }

    var textarea = _drawerEl ? _drawerEl.querySelector('#rxNotesDrawerInput') : null;
    if (textarea) {
      textarea.value = mergeTranscript(_sessionBaseText, _sessionFinalText, '');
      _sessionInterimText = '';
      _sessionBaseText = textarea.value;
      try {
        _isProgrammaticUpdate = true;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {} finally {
        _isProgrammaticUpdate = false;
      }
    }

    updateSpeechUI('stopped', abort ? 'Speech cancelled.' : 'Speech stopped. Note ready to edit or save.');
  }

  // ── Coordinated Session Management ──────────────────────────────────────────

  function handleStartSession() {
    if (_isRecording || _isMeasuringAudio) return;
    _isRecording = true;

    var textarea = _drawerEl ? _drawerEl.querySelector('#rxNotesDrawerInput') : null;
    if (textarea) {
      _sessionBaseText = textarea.value || '';
      _sessionFinalText = '';
      _sessionInterimText = '';
      _lastFinalIndex = 0;
    }

    var langSelect = _drawerEl ? _drawerEl.querySelector('#rxNotesLangSelect') : null;
    if (langSelect && langSelect.value) {
      _speechLang = langSelect.value;
    }

    updateSpeechUI('requesting');

    // 1. Start Audio Visualizer
    startAudioVisualizer(
      function onVisualizerReady() {
        // Visualizer active
      },
      function onVisualizerError(errObj) {
        if (errObj && errObj.code === 'permission-denied') {
          _isRecording = false;
          stopSpeechRecognition(true);
          updateSpeechUI('error', errObj.message);
        } else if (!_speechSupported) {
          updateSpeechUI('error', errObj.message);
        } else {
          var statusEl = _drawerEl ? _drawerEl.querySelector('#rxNotesSpeechStatus') : null;
          if (statusEl) {
            statusEl.textContent = 'Audio meter unavailable (' + errObj.message + '). Transcribing…';
          }
        }
      }
    );

    // 2. Start Speech Recognition
    if (_speechSupported) {
      startSpeechRecognition();
    } else {
      updateSpeechUI('unsupported', 'Speech recognition is not supported in this browser. Microphone meter active.');
    }
  }

  function handleStopSession(abort) {
    stopAudioVisualizer();
    stopSpeechRecognition(abort);
    resetVisualizerUI();
  }

  function clearDictatedSpeech() {
    handleStopSession(true);
    var textarea = _drawerEl ? _drawerEl.querySelector('#rxNotesDrawerInput') : null;
    if (textarea) {
      textarea.value = _sessionBaseText || '';
      try {
        _isProgrammaticUpdate = true;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {} finally {
        _isProgrammaticUpdate = false;
      }
    }
    _sessionFinalText = '';
    _sessionInterimText = '';
    _lastFinalIndex = 0;
    updateSpeechUI('idle', 'Dictated speech cleared; original text kept.');
    resetVisualizerUI();
  }

  function resetSpeechSession() {
    handleStopSession(true);
    _sessionBaseText = '';
    _sessionFinalText = '';
    _sessionInterimText = '';
    _lastFinalIndex = 0;
    updateSpeechUI('idle', 'Ready to dictate');
    resetVisualizerUI();
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
            '<div class="rx-notes-speech-toolbar" id="rxNotesSpeechToolbar">',
              '<div class="rx-notes-speech-controls">',
                '<button type="button" class="btn btn-outline btn-sm rx-notes-mic-btn" id="rxNotesMicBtn" title="Dictate note with microphone" aria-label="Start speak to write">',
                  '<span class="rx-mic-icon" aria-hidden="true">🎙️</span> ',
                  '<span class="rx-mic-label" id="rxNotesMicLabel">Speak to Write</span>',
                '</button>',
                '<button type="button" class="btn btn-ghost btn-sm rx-notes-stop-btn" id="rxNotesStopBtn" title="Stop speech recognition" aria-label="Stop speech recognition" style="display:none;">',
                  '<span aria-hidden="true">⏹️</span> ',
                  '<span>Stop</span>',
                '</button>',
                '<select class="rx-notes-lang-select" id="rxNotesLangSelect" aria-label="Speech recognition language" title="Select dictation language">',
                  '<option value="en-IN" selected>English (India) — en-IN</option>',
                  '<option value="hi-IN">हिन्दी (India) — hi-IN</option>',
                  '<option value="en-US">English (US) — en-US</option>',
                  '<option value="en-GB">English (UK) — en-GB</option>',
                '</select>',
                '<button type="button" class="btn btn-ghost btn-sm rx-notes-clear-speech-btn" id="rxNotesClearSpeechBtn" title="Clear only dictated speech" aria-label="Clear dictated speech" style="display:none;">',
                  '<span>↩ Clear Dictated</span>',
                '</button>',
              '</div>',

              '<!-- Real-Time Microphone Visualizer Panel -->',
              '<div class="rx-audio-visualizer-panel" id="rxAudioVisualizerPanel" aria-label="Real-time microphone visualizer">',
                '<div class="rx-visualizer-header">',
                  '<div class="rx-visualizer-label-group">',
                    '<span class="rx-visualizer-mic-icon" aria-hidden="true">🎤</span>',
                    '<span class="rx-visualizer-title">Microphone input level</span>',
                  '</div>',
                  '<div class="rx-visualizer-meta">',
                    '<span class="rx-voice-activity-badge rx-badge-idle" id="rxVoiceActivityBadge">Idle</span>',
                    '<span class="rx-audio-level-pct" id="rxAudioLevelVal" aria-label="Microphone input level: 0 percent">0%</span>',
                  '</div>',
                '</div>',
                '<div class="rx-visualizer-meter-track" id="rxVisualizerMeterTrack">',
                  '<div class="rx-visualizer-meter-fill" id="rxAudioLevelBar" style="width: 0%;"></div>',
                  '<div class="rx-visualizer-bars" id="rxAudioVisualizerBars" aria-hidden="true">',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                    '<span class="rx-vbar"></span>',
                  '</div>',
                '</div>',
              '</div>',

              '<div class="rx-notes-speech-status-row">',
                '<div class="rx-notes-speech-status" id="rxNotesSpeechStatus" role="status" aria-live="polite">Ready to dictate</div>',
                '<div class="rx-notes-interim-preview" id="rxNotesInterimDisplay" aria-hidden="true" style="display:none;"></div>',
              '</div>',
              '<div class="rx-notes-privacy-note">',
                '<span>🔒 Audio is processed locally or via browser speech services. ReadX does not store raw audio.</span>',
              '</div>',
            '</div>',
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
    var micBtn = overlay.querySelector('#rxNotesMicBtn');
    var stopBtn = overlay.querySelector('#rxNotesStopBtn');
    var langSelect = overlay.querySelector('#rxNotesLangSelect');
    var clearSpeechBtn = overlay.querySelector('#rxNotesClearSpeechBtn');

    backdrop.addEventListener('click', closeNotesDrawer);
    closeBtn.addEventListener('click', closeNotesDrawer);

    if (micBtn) {
      micBtn.addEventListener('click', function () {
        if (_isRecording || _isMeasuringAudio) {
          handleStopSession(false);
        } else {
          handleStartSession();
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        handleStopSession(false);
      });
    }

    if (langSelect) {
      langSelect.addEventListener('change', function () {
        _speechLang = langSelect.value || 'en-IN';
      });
    }

    if (clearSpeechBtn) {
      clearSpeechBtn.addEventListener('click', function () {
        clearDictatedSpeech();
      });
    }

    // Preserve user typing during active recognition without loss
    if (textarea) {
      textarea.addEventListener('input', function (e) {
        if (_isProgrammaticUpdate || (e && e.isTrusted === false)) {
          return;
        }
        if (_isRecording || _isMeasuringAudio) {
          handleStopSession(false);
          _sessionBaseText = textarea.value || '';
          _sessionFinalText = '';
          _sessionInterimText = '';
          _lastFinalIndex = 0;
          updateSpeechUI('stopped', 'Dictation paused for manual typing. Click "Speak to Write" to resume.');
        }
      });
    }

    saveBtn.addEventListener('click', function () {
      if (_isRecording || _isMeasuringAudio) {
        handleStopSession(false);
      }
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
      _sessionBaseText = '';
      _sessionFinalText = '';
      _sessionInterimText = '';
      updateSpeechUI('idle', 'Ready to dictate');
      resetVisualizerUI();
      renderDrawerNotes();
      updateTriggerButtons();
    });

    clearBtn.addEventListener('click', function () {
      handleStopSession(true);
      textarea.value = '';
      _sessionBaseText = '';
      _sessionFinalText = '';
      _sessionInterimText = '';
      updateSpeechUI('idle', 'Ready to dictate');
      resetVisualizerUI();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isNotesDrawerOpen()) {
        closeNotesDrawer();
      }
    });

    // Check speech support on initial render
    if (!_speechSupported) {
      updateSpeechUI('unsupported');
    }

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

    resetSpeechSession();

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
    handleStopSession(true);
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

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && (_isRecording || _isMeasuringAudio)) {
        handleStopSession(true);
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', function () {
      if (_isRecording || _isMeasuringAudio) {
        handleStopSession(true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  var PublicAPI = {
    getNotes: loadNotes,
    saveNotes: saveNotes,
    open: openNotesDrawer,
    close: closeNotesDrawer,
    updateButtons: updateTriggerButtons,
    // Speak-to-Write API & Helpers
    startSpeech: handleStartSession,
    stopSpeech: handleStopSession,
    clearSpeech: clearDictatedSpeech,
    resetSpeech: resetSpeechSession,
    getSpeechState: getSpeechState,
    isSpeechSupported: isSpeechSupported,
    mergeTranscript: mergeTranscript,
    mapSpeechErrorToStatus: mapSpeechErrorToStatus,
    // Real-Time Visualizer Helpers & API
    calculateRMS: calculateRMS,
    calculateLevelPercent: calculateLevelPercent,
    startVisualizer: startAudioVisualizer,
    stopVisualizer: stopAudioVisualizer,
    getVisualizerState: function () {
      return {
        measuring: _isMeasuringAudio,
        level: _currentAudioLevel,
        voiceDetected: _lastVoiceDetected,
        sessionId: _micSessionId
      };
    }
  };

  if (typeof window !== 'undefined') {
    window.ReadXNotes = PublicAPI;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PublicAPI;
  }

})();
