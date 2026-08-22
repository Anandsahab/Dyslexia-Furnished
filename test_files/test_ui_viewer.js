const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Verify CSS rules in pages.css
const pagesCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'pages.css'), 'utf8');

// Check that modal header, nav pill, zoom pill, standard-doc-view are defined
assert(pagesCss.includes('.rx-modal-header'), 'Missing .rx-modal-header in pages.css');
assert(pagesCss.includes('.rx-page-nav-pill'), 'Missing .rx-page-nav-pill in pages.css');
assert(pagesCss.includes('.rx-zoom-pill'), 'Missing .rx-zoom-pill in pages.css');
assert(pagesCss.includes('.standard-doc-view'), 'Missing .standard-doc-view in pages.css');
assert(pagesCss.includes('.rx-pdf-banner'), 'Missing .rx-pdf-banner in pages.css');

// Check that modalReadXContainer has scoped themes
assert(pagesCss.includes('#modalReadXContainer[data-theme="dark"]'), 'Missing dark theme for ReadX container');
assert(pagesCss.includes('#modalReadXContainer[data-theme="warm"]'), 'Missing warm theme for ReadX container');
assert(pagesCss.includes('#modalReadXContainer[data-theme="light"]'), 'Missing light theme for ReadX container');

// Ensure body[data-theme="dark"] #modalReadXContainer was cleaned up to avoid leaking to body
assert(!pagesCss.includes('body[data-theme="dark"] #modalReadXContainer'), 'Stray body[data-theme] selector in pages.css');

// 2. Verify upload.html structure
const uploadHtml = fs.readFileSync(path.join(__dirname, '..', 'upload.html'), 'utf8');
assert(uploadHtml.includes('id="modalCloseBtn"'), 'Missing modalCloseBtn in upload.html');
assert(uploadHtml.includes('id="modalFormatBadge"'), 'Missing modalFormatBadge in upload.html');
assert(uploadHtml.includes('id="modalDocTitle"'), 'Missing modalDocTitle in upload.html');
assert(uploadHtml.includes('id="modalPageNavPill"'), 'Missing modalPageNavPill in upload.html');
assert(uploadHtml.includes('id="modalPrevPageBtn"'), 'Missing modalPrevPageBtn in upload.html');
assert(uploadHtml.includes('id="modalPageIndicator"'), 'Missing modalPageIndicator in upload.html');
assert(uploadHtml.includes('id="modalNextPageBtn"'), 'Missing modalNextPageBtn in upload.html');
assert(uploadHtml.includes('id="modalZoomPill"'), 'Missing modalZoomPill in upload.html');
assert(uploadHtml.includes('id="modalZoomOutBtn"'), 'Missing modalZoomOutBtn in upload.html');
assert(uploadHtml.includes('id="modalZoomIndicator"'), 'Missing modalZoomIndicator in upload.html');
assert(uploadHtml.includes('id="modalZoomInBtn"'), 'Missing modalZoomInBtn in upload.html');
assert(uploadHtml.includes('id="modalBtnStandard"'), 'Missing modalBtnStandard in upload.html');
assert(uploadHtml.includes('id="modalBtnReadX"'), 'Missing modalBtnReadX in upload.html');

// 3. Verify upload.js logic
const uploadJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'upload.js'), 'utf8');
assert(uploadJs.includes('updateDocumentPagination'), 'Missing updateDocumentPagination in upload.js');
assert(uploadJs.includes('goToPage'), 'Missing goToPage in upload.js');
assert(uploadJs.includes('initPaginationEvents'), 'Missing initPaginationEvents in upload.js');
assert(uploadJs.includes('updateZoom'), 'Missing updateZoom in upload.js');
assert(!uploadJs.includes("document.body.setAttribute('data-theme'"), 'Found leaking document.body.setAttribute(data-theme) in upload.js');

console.log('✅ ALL VIEWER UI AND THEME VALIDATION TESTS PASSED!');
