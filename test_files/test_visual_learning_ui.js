// test_files/test_visual_learning_ui.js
// Verification suite for Visual Learning UI integration in upload reader modal

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== STARTING VISUAL LEARNING UI INTEGRATION TESTS ===\n');

// 1. Verify upload.html structure
const uploadHtmlPath = path.join(__dirname, '..', 'upload.html');
const uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');

assert.ok(uploadHtml.includes('id="modalBtnVisual"'), 'upload.html must include modalBtnVisual');
assert.ok(uploadHtml.includes('id="modalVisualContainer"'), 'upload.html must include modalVisualContainer');
assert.ok(uploadHtml.includes('id="rxVisualWorkspace"'), 'upload.html must include rxVisualWorkspace');
assert.ok(uploadHtml.includes('id="modalBtnStandard"'), 'upload.html preserves modalBtnStandard');
assert.ok(uploadHtml.includes('id="modalBtnReadX"'), 'upload.html preserves modalBtnReadX');
console.log('✅ Step 1: upload.html markup and DOM elements verified');

// 2. Verify css/pages.css styles
const pagesCssPath = path.join(__dirname, '..', 'css', 'pages.css');
const pagesCss = fs.readFileSync(pagesCssPath, 'utf8');

assert.ok(pagesCss.includes('.rx-mode-btn.active#modalBtnVisual'), 'pages.css must style active modalBtnVisual');
assert.ok(pagesCss.includes('.rx-visual-workspace'), 'pages.css must style rx-visual-workspace');
assert.ok(pagesCss.includes('.rx-concept-cards-grid'), 'pages.css must style rx-concept-cards-grid');
assert.ok(pagesCss.includes('.rx-concept-card'), 'pages.css must style rx-concept-card');
assert.ok(pagesCss.includes('.rx-card-term'), 'pages.css must style rx-card-term');
assert.ok(pagesCss.includes('.rx-card-definition'), 'pages.css must style rx-card-definition');
assert.ok(pagesCss.includes('.rx-card-plain'), 'pages.css must style rx-card-plain');
assert.ok(pagesCss.includes('.rx-card-tts-btn'), 'pages.css must style rx-card-tts-btn');
assert.ok(pagesCss.includes('.rx-visual-status-card'), 'pages.css must style rx-visual-status-card for loading/empty/error');
console.log('✅ Step 2: Visual Learning styles and component CSS verified in pages.css');

// 3. Verify js/upload.js integration
const uploadJsPath = path.join(__dirname, '..', 'js', 'upload.js');
const uploadJs = fs.readFileSync(uploadJsPath, 'utf8');

assert.ok(uploadJs.includes("getElementById('modalBtnVisual')"), 'upload.js must acquire modalBtnVisual');
assert.ok(uploadJs.includes("getElementById('modalVisualContainer')"), 'upload.js must acquire modalVisualContainer');
assert.ok(uploadJs.includes("switchModalMode('visual')"), 'upload.js must support switching to visual mode');
assert.ok(uploadJs.includes('renderVisualLearningView'), 'upload.js must define renderVisualLearningView');
assert.ok(uploadJs.includes('renderVisualLoadingState'), 'upload.js must define renderVisualLoadingState');
assert.ok(uploadJs.includes('renderVisualEmptyState'), 'upload.js must define renderVisualEmptyState');
assert.ok(uploadJs.includes('renderVisualErrorState'), 'upload.js must define renderVisualErrorState');
assert.ok(uploadJs.includes('renderVisualCardsContent'), 'upload.js must define renderVisualCardsContent');
assert.ok(uploadJs.includes('speakConceptCard'), 'upload.js must define speakConceptCard for card TTS');
assert.ok(uploadJs.includes('ReadXGemini.visualizeContent'), 'upload.js must invoke ReadXGemini.visualizeContent');
console.log('✅ Step 3: Controller methods, state transitions, and card renderers verified in js/upload.js');

// 4. Verify js/gemini.js helper
const geminiJsPath = path.join(__dirname, '..', 'js', 'gemini.js');
const geminiJs = fs.readFileSync(geminiJsPath, 'utf8');

assert.ok(geminiJs.includes('visualizeContent'), 'gemini.js must expose visualizeContent');
assert.ok(geminiJs.includes("action: 'visualize'"), 'gemini.js must dispatch action: visualize');
assert.ok(geminiJs.includes('visualData: data.visualData'), 'gemini.js must return visualData');
console.log('✅ Step 4: Client helper ReadXGemini.visualizeContent verified in js/gemini.js');

console.log('\n=== ALL VISUAL LEARNING UI INTEGRATION TESTS PASSED! ===\n');
