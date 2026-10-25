// test_files/test_toolbar_polish.js
// Verification suite for ReadX PDF Viewer Toolbar UI-Only Polish

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== STARTING PDF VIEWER TOOLBAR POLISH VERIFICATION ===\n');

// 1. Verify upload.html markup and structure
const uploadHtmlPath = path.join(__dirname, '..', 'upload.html');
const uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');

// Left group elements
assert.ok(uploadHtml.includes('class="rx-modal-header-left"'), 'Must have rx-modal-header-left container');
assert.ok(uploadHtml.includes('id="modalCloseBtn"'), 'Must preserve modalCloseBtn');
assert.ok(uploadHtml.includes('id="modalFormatBadge"'), 'Must preserve modalFormatBadge');
assert.ok(uploadHtml.includes('id="modalDocTitle"'), 'Must preserve modalDocTitle');
console.log('✅ Step 1: Left group (Back button, PDF badge, Filename) fully preserved');

// Center group elements
assert.ok(uploadHtml.includes('class="rx-modal-header-center" id="modalPageControls"'), 'Must preserve modalPageControls center container');
assert.ok(uploadHtml.includes('id="modalPageNavPill"'), 'Must preserve modalPageNavPill');
assert.ok(uploadHtml.includes('id="modalPrevPageBtn"'), 'Must preserve modalPrevPageBtn');
assert.ok(uploadHtml.includes('id="modalPageIndicator"'), 'Must preserve modalPageIndicator');
assert.ok(uploadHtml.includes('id="modalNextPageBtn"'), 'Must preserve modalNextPageBtn');
assert.ok(uploadHtml.includes('id="modalZoomPill"'), 'Must preserve modalZoomPill');
assert.ok(uploadHtml.includes('id="modalZoomOutBtn"'), 'Must preserve modalZoomOutBtn');
assert.ok(uploadHtml.includes('id="modalZoomIndicator"'), 'Must preserve modalZoomIndicator');
assert.ok(uploadHtml.includes('id="modalZoomInBtn"'), 'Must preserve modalZoomInBtn');
console.log('✅ Step 2: Center group (Page navigation & Zoom controls) fully preserved');

// Right group elements
assert.ok(uploadHtml.includes('class="rx-modal-header-right"'), 'Must have rx-modal-header-right container');
assert.ok(uploadHtml.includes('class="rx-modal-action-area" id="modalActionArea"'), 'Must have distinct action area for Make My Notes');
assert.ok(uploadHtml.includes('id="uploadMakeNotesBtn"'), 'Must preserve uploadMakeNotesBtn ID');
assert.ok(uploadHtml.includes('class="rx-header-divider rx-header-divider--actions"'), 'Must have divider separating action from reading modes');
assert.ok(uploadHtml.includes('id="modalModeToggle"'), 'Must have modalModeToggle');
assert.ok(uploadHtml.includes('id="modalBtnStandard"'), 'Must preserve modalBtnStandard');
assert.ok(uploadHtml.includes('id="modalBtnReadX"'), 'Must preserve modalBtnReadX');
assert.ok(uploadHtml.includes('id="modalBtnVisual"'), 'Must preserve modalBtnVisual');
console.log('✅ Step 3: Right group (Distinct Make My Notes action area + Mode controls) fully verified');

// 2. Verify css/pages.css styling
const pagesCssPath = path.join(__dirname, '..', 'css', 'pages.css');
const pagesCss = fs.readFileSync(pagesCssPath, 'utf8');

assert.ok(pagesCss.includes('.rx-modal-header {'), 'Must style .rx-modal-header');
assert.ok(pagesCss.includes('.rx-modal-header-left {'), 'Must style .rx-modal-header-left');
assert.ok(pagesCss.includes('.rx-modal-header-center {'), 'Must style .rx-modal-header-center');
assert.ok(pagesCss.includes('.rx-modal-header-right {'), 'Must style .rx-modal-header-right');
assert.ok(pagesCss.includes('.rx-modal-action-area {'), 'Must style .rx-modal-action-area');
assert.ok(pagesCss.includes('.rx-modal-header .make-my-notes-btn'), 'Must scope make-my-notes-btn in modal header');
assert.ok(pagesCss.includes('.rx-header-divider--actions'), 'Must style .rx-header-divider--actions');
assert.ok(pagesCss.includes('.rx-modal-title {'), 'Must style .rx-modal-title with ellipsis');

// Confirm ellipsis and truncation rules
assert.ok(pagesCss.includes('text-overflow: ellipsis;'), 'Must have text-overflow: ellipsis for filename truncation');
assert.ok(pagesCss.includes('white-space: nowrap;'), 'Must have white-space: nowrap for title');
console.log('✅ Step 4: Visual hierarchy, distinct styling, and filename truncation verified in pages.css');

// Confirm responsive rules exist
assert.ok(pagesCss.includes('@media (max-width: 1180px)'), 'Must have 1180px breakpoint for medium viewports');
assert.ok(pagesCss.includes('@media (max-width: 960px)'), 'Must have 960px breakpoint for tablet wrap');
assert.ok(pagesCss.includes('@media (max-width: 680px)'), 'Must have 680px breakpoint for mobile layout');
console.log('✅ Step 5: Responsive media queries for 1180px, 960px, and 680px verified');

// Confirm notes.js functionality is untouched
const notesJsPath = path.join(__dirname, '..', 'js', 'notes.js');
const notesJs = fs.readFileSync(notesJsPath, 'utf8');
assert.ok(notesJs.includes("getElementById('uploadMakeNotesBtn')"), 'notes.js binding to uploadMakeNotesBtn preserved');
console.log('✅ Step 6: notes.js functional integration preserved');

console.log('\n=== ALL TOOLBAR POLISH VERIFICATIONS PASSED SUCCESSFULLY! ===\n');
