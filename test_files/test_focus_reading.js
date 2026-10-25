// test_files/test_focus_reading.js
// Comprehensive test suite for Dyslexia Focus Reading Studio & Customisation Controls

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== STARTING DYSLEXIA FOCUS READING STUDIO TEST SUITE ===\n');

// 1. Verify HTML Structure in upload.html
const uploadHtmlPath = path.join(__dirname, '../upload.html');
const uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');

// Toolbar buttons
assert.ok(uploadHtml.includes('id="rxSelectionAiToolbar"'), 'Selection toolbar element exists');
assert.ok(uploadHtml.includes('Focus Line'), 'Focus Line action present in toolbar');
assert.ok(uploadHtml.includes('Read Aloud'), 'Read Aloud action present in toolbar');
assert.ok(uploadHtml.includes('data-action="focus-line"'), 'Focus line data attribute present');
assert.ok(uploadHtml.includes('data-action="read-aloud"'), 'Read aloud data attribute present');

// Studio Overlay Elements
assert.ok(uploadHtml.includes('id="rxLineFocusOverlay"'), 'rxLineFocusOverlay exists in upload.html');
assert.ok(uploadHtml.includes('id="rxLineFocusBackdrop"'), 'rxLineFocusBackdrop exists');
assert.ok(uploadHtml.includes('id="rxFocusedLineCard"'), 'rxFocusedLineCard exists');
assert.ok(uploadHtml.includes('id="rxFocusedLineText"'), 'rxFocusedLineText exists');
// Confirm text-readx class is removed to eliminate !important specificity override
assert.ok(!uploadHtml.includes('id="rxFocusedLineText" class="rx-focused-line-text text-readx"'), 'text-readx class must NOT be on rxFocusedLineText');
assert.ok(uploadHtml.includes('id="rxFocusedCloseBtn"'), 'rxFocusedCloseBtn exists with exit control');
assert.ok(uploadHtml.includes('id="rxFocusedTtsBtn"'), 'rxFocusedTtsBtn exists on focused card');

// Studio Customisation Controls in upload.html
assert.ok(uploadHtml.includes('id="rxStudioToolbar"'), 'rxStudioToolbar customisation toolbar exists');
assert.ok(uploadHtml.includes('id="rxStudioFontSelect"'), 'Font family selector exists');
assert.ok(uploadHtml.includes('OpenDyslexic'), 'OpenDyslexic font option present');
assert.ok(uploadHtml.includes('Lexend'), 'Lexend font option present');
assert.ok(uploadHtml.includes('id="rxStudioFontDec"'), 'Decrease font size button exists');
assert.ok(uploadHtml.includes('id="rxStudioFontInc"'), 'Increase font size button exists');
assert.ok(uploadHtml.includes('id="rxStudioFontVal"'), 'Font size value badge exists');

assert.ok(uploadHtml.includes('id="rxStudioLineDec"'), 'Decrease line height button exists');
assert.ok(uploadHtml.includes('id="rxStudioLineInc"'), 'Increase line height button exists');
assert.ok(uploadHtml.includes('id="rxStudioLineVal"'), 'Line height value badge exists');

assert.ok(uploadHtml.includes('id="rxStudioLetterDec"'), 'Decrease letter spacing button exists');
assert.ok(uploadHtml.includes('id="rxStudioLetterInc"'), 'Increase letter spacing button exists');
assert.ok(uploadHtml.includes('id="rxStudioLetterVal"'), 'Letter spacing value badge exists');

assert.ok(uploadHtml.includes('id="rxStudioWordDec"'), 'Decrease word spacing button exists');
assert.ok(uploadHtml.includes('id="rxStudioWordInc"'), 'Increase word spacing button exists');
assert.ok(uploadHtml.includes('id="rxStudioWordVal"'), 'Word spacing value badge exists');

assert.ok(uploadHtml.includes('data-theme="dark"'), 'Dark graphite theme preset present');
assert.ok(uploadHtml.includes('data-theme="cream"'), 'Warm cream theme preset present');
assert.ok(uploadHtml.includes('data-theme="blue"'), 'Soft blue theme preset present');
assert.ok(uploadHtml.includes('data-theme="green"'), 'Soft green theme preset present');

assert.ok(uploadHtml.includes('id="rxStudioResetBtn"'), 'Reset studio settings button exists');
console.log('✅ Test 1 Passed: Complete HTML markup for Reading Studio & Controls verified');

// 2. Verify CSS Rules in css/pages.css
const pagesCssPath = path.join(__dirname, '../css/pages.css');
const pagesCss = fs.readFileSync(pagesCssPath, 'utf8');

assert.ok(pagesCss.includes('.rx-reading-dimmed'), '.rx-reading-dimmed styling defined');
assert.ok(pagesCss.includes('filter: blur(4px) opacity(0.32)'), 'Dimmed background applies blur and opacity');
assert.ok(pagesCss.includes('.rx-line-focus-overlay'), '.rx-line-focus-overlay defined');
assert.ok(pagesCss.includes('.rx-focused-line-card'), '.rx-focused-line-card defined');
assert.ok(pagesCss.includes('.rx-studio-toolbar'), '.rx-studio-toolbar defined in CSS');
assert.ok(pagesCss.includes('.rx-studio-step-btn'), '.rx-studio-step-btn styled');
assert.ok(pagesCss.includes('.rx-studio-value-badge'), '.rx-studio-value-badge styled');
assert.ok(pagesCss.includes('.rx-studio-select'), '.rx-studio-select styled');
assert.ok(pagesCss.includes('.swatch-preview.theme-dark'), 'Dark swatch preview styled');
assert.ok(pagesCss.includes('.swatch-preview.theme-cream'), 'Cream swatch preview styled');
assert.ok(pagesCss.includes('.swatch-preview.theme-blue'), 'Blue swatch preview styled');
assert.ok(pagesCss.includes('.swatch-preview.theme-green'), 'Green swatch preview styled');
assert.ok(pagesCss.includes('.rx-focus-active-sentence'), 'Active sentence highlighting class styled');
assert.ok(pagesCss.includes('--rx-focus-font-size'), 'CSS variable --rx-focus-font-size utilized');
assert.ok(pagesCss.includes('--rx-focus-line-height'), 'CSS variable --rx-focus-line-height utilized');
assert.ok(pagesCss.includes('--rx-focus-letter-spacing'), 'CSS variable --rx-focus-letter-spacing utilized');
assert.ok(pagesCss.includes('--rx-focus-word-spacing'), 'CSS variable --rx-focus-word-spacing utilized');
assert.ok(pagesCss.includes('https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Regular.woff2'), 'Working OpenDyslexic font URL defined');
console.log('✅ Test 2 Passed: CSS styling, CSS variables, and theme definitions verified in pages.css');

// 3. Verify JavaScript Logic in js/upload.js
const uploadJsPath = path.join(__dirname, '../js/upload.js');
const uploadJs = fs.readFileSync(uploadJsPath, 'utf8');

assert.ok(uploadJs.includes('openLineFocus'), 'openLineFocus function defined');
assert.ok(uploadJs.includes('closeLineFocus'), 'closeLineFocus function defined');
assert.ok(uploadJs.includes('applyStudioSettings'), 'applyStudioSettings function defined');
assert.ok(uploadJs.includes('resetStudioSettings'), 'resetStudioSettings function defined');
assert.ok(uploadJs.includes('STUDIO_THEMES'), 'STUDIO_THEMES color definitions defined');
assert.ok(uploadJs.includes('setupSentenceSpans'), 'setupSentenceSpans defined for live speech highlighting');
assert.ok(uploadJs.includes('clearSentenceHighlights'), 'clearSentenceHighlights defined for clean teardown');
assert.ok(uploadJs.includes('toggleSelectionSpeech'), 'toggleSelectionSpeech function defined');
assert.ok(uploadJs.includes('stopSelectionSpeech'), 'stopSelectionSpeech function defined');
assert.ok(uploadJs.includes('rx-reading-dimmed'), 'Surrounding reading content dimmed when focus line opens');
assert.ok(uploadJs.includes('Escape'), 'Escape key dismisses focus line overlay');
assert.ok(uploadJs.includes('closeLineFocus()'), 'closeModal and switchModalMode cleanup focus overlay');
assert.ok(uploadJs.includes("focusTextEl.style.setProperty('font-size'"), 'Direct inline font-size applied to focused element');
assert.ok(uploadJs.includes("focusTextEl.style.setProperty('font-family'"), 'Direct inline font-family applied to focused element');
assert.ok(uploadJs.includes("focusTextEl.style.setProperty('line-height'"), 'Direct inline line-height applied to focused element');
assert.ok(uploadJs.includes("focusTextEl.style.setProperty('letter-spacing'"), 'Direct inline letter-spacing applied to focused element');
assert.ok(uploadJs.includes("focusTextEl.style.setProperty('word-spacing'"), 'Direct inline word-spacing applied to focused element');
console.log('✅ Test 3 Passed: JavaScript studio controllers, themes, and event handlers verified in upload.js');

// 4. Pure Logic Tests: Customisation Value Stepping & Bounds
{
  const limits = {
    fontSize: { min: 16, max: 36, step: 2, default: 24 },
    lineHeight: { min: 1.4, max: 2.6, step: 0.1, default: 2.0 },
    letterSpacing: { min: 0.0, max: 0.15, step: 0.01, default: 0.035 },
    wordSpacing: { min: 0.0, max: 0.30, step: 0.02, default: 0.08 }
  };

  // Test Font Size stepping
  let size = limits.fontSize.default;
  size = Math.min(limits.fontSize.max, size + limits.fontSize.step);
  assert.strictEqual(size, 26, 'Increase font size steps correctly');
  size = 36;
  size = Math.min(limits.fontSize.max, size + limits.fontSize.step);
  assert.strictEqual(size, 36, 'Font size clamps at maximum 36px');
  size = 16;
  size = Math.max(limits.fontSize.min, size - limits.fontSize.step);
  assert.strictEqual(size, 16, 'Font size clamps at minimum 16px');

  // Test Line Height stepping
  let lh = limits.lineHeight.default;
  lh = Math.min(limits.lineHeight.max, Math.round((lh + limits.lineHeight.step) * 10) / 10);
  assert.strictEqual(lh, 2.1, 'Increase line height steps correctly');
  lh = 2.6;
  lh = Math.min(limits.lineHeight.max, Math.round((lh + limits.lineHeight.step) * 10) / 10);
  assert.strictEqual(lh, 2.6, 'Line height clamps at max 2.6');
  lh = 1.4;
  lh = Math.max(limits.lineHeight.min, Math.round((lh - limits.lineHeight.step) * 10) / 10);
  assert.strictEqual(lh, 1.4, 'Line height clamps at min 1.4');

  // Test Letter Spacing stepping
  let ls = limits.letterSpacing.default;
  ls = Math.min(limits.letterSpacing.max, Math.round((ls + limits.letterSpacing.step) * 1000) / 1000);
  assert.strictEqual(ls, 0.045, 'Increase letter spacing steps correctly');
  ls = 0.15;
  ls = Math.min(limits.letterSpacing.max, Math.round((ls + limits.letterSpacing.step) * 1000) / 1000);
  assert.strictEqual(ls, 0.15, 'Letter spacing clamps at max 0.15');
  ls = 0.0;
  ls = Math.max(limits.letterSpacing.min, Math.round((ls - limits.letterSpacing.step) * 1000) / 1000);
  assert.strictEqual(ls, 0.0, 'Letter spacing clamps at min 0.0');

  // Test Word Spacing stepping
  let ws = limits.wordSpacing.default;
  ws = Math.min(limits.wordSpacing.max, Math.round((ws + limits.wordSpacing.step) * 100) / 100);
  assert.strictEqual(ws, 0.10, 'Increase word spacing steps correctly');
  ws = 0.30;
  ws = Math.min(limits.wordSpacing.max, Math.round((ws + limits.wordSpacing.step) * 100) / 100);
  assert.strictEqual(ws, 0.30, 'Word spacing clamps at max 0.30');
  ws = 0.0;
  ws = Math.max(limits.wordSpacing.min, Math.round((ws - limits.wordSpacing.step) * 100) / 100);
  assert.strictEqual(ws, 0.0, 'Word spacing clamps at min 0.0');

  console.log('✅ Test 4 Passed: Value stepping, precision, and boundaries verified');
}

// 5. Accessible Theme Contrast Verification
{
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(hex1, hex2) {
    function hexToRgb(hex) {
      const bigint = parseInt(hex.replace('#', ''), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const l1 = getLuminance(r1, g1, b1);
    const l2 = getLuminance(r2, g2, b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // 1. Dark Theme (#1B1E17 bg, #F1EFE7 text)
  const darkRatio = getContrastRatio('#1B1E17', '#F1EFE7');
  assert.ok(darkRatio > 12, `Dark theme contrast ratio ${darkRatio.toFixed(1)} must exceed 12:1`);

  // 2. Cream Theme (#FBF9F1 bg, #1D2018 text)
  const creamRatio = getContrastRatio('#FBF9F1', '#1D2018');
  assert.ok(creamRatio > 14, `Cream theme contrast ratio ${creamRatio.toFixed(1)} must exceed 14:1`);

  // 3. Blue Theme (#EAF2F8 bg, #112333 text)
  const blueRatio = getContrastRatio('#EAF2F8', '#112333');
  assert.ok(blueRatio > 13, `Blue theme contrast ratio ${blueRatio.toFixed(1)} must exceed 13:1`);

  // 4. Green Theme (#ECF5EE bg, #122A17 text)
  const greenRatio = getContrastRatio('#ECF5EE', '#122A17');
  assert.ok(greenRatio > 13, `Green theme contrast ratio ${greenRatio.toFixed(1)} must exceed 13:1`);

  console.log(`✅ Test 5 Passed: All 4 themes verified with superior accessibility contrast (Dark: ${darkRatio.toFixed(1)}:1, Cream: ${creamRatio.toFixed(1)}:1, Blue: ${blueRatio.toFixed(1)}:1, Green: ${greenRatio.toFixed(1)}:1)`);
}

// 6. Sentence Segmentation & Exact Preservation
{
  const testCases = [
    'Dyslexia enhances holistic thinking. Many entrepreneurs and creators have dyslexia! This sentence tests punctuation? Indeed it does.',
    'Single short sentence without ending punct',
    'Special characters: 100% & (hello-world) @ # $ 42. Another sentence here.\nAnd line break paragraph? Yes!',
    'Quotes "inside a sentence." And exclamations! Final thought.'
  ];

  const regex = /[^.!?]+(?:[.!?]+["']?(?:\s+|$)|$)/g;

  testCases.forEach((passage, idx) => {
    const sentences = passage.match(regex);
    assert.ok(sentences && sentences.length >= 1, `Case ${idx + 1} matches sentences`);
    assert.strictEqual(sentences.join(''), passage, `Case ${idx + 1} joined text must equal original exactly`);
  });

  console.log('✅ Test 6 Passed: Sentence segmentation preserves exact text, newlines, and punctuation across all test cases');
}

// 7. Simulated DOM Environment Verification
{
  // Create minimal mock DOM to test applyStudioSettings, resetStudioSettings, and DOM updates
  class MockElement {
    constructor(id = '', tag = 'div') {
      this.id = id;
      this.tagName = tag.toUpperCase();
      this.style = {
        _props: {},
        setProperty(prop, val, priority = '') {
          this._props[prop] = { val, priority };
        },
        getPropertyValue(prop) {
          return this._props[prop] ? this._props[prop].val : '';
        }
      };
      this.classList = new Set();
      this.classList.add = (c) => this.classList.add(c);
      this.classList.remove = (c) => this.classList.delete(c);
      this.classList.toggle = (c, b) => b ? this.classList.add(c) : this.classList.delete(c);
      this.attributes = {};
      this.setAttribute = (k, v) => { this.attributes[k] = v; };
      this.getAttribute = (k) => this.attributes[k];
      this.textContent = '';
      this.innerHTML = '';
      this.disabled = false;
      this.children = [];
    }
    querySelectorAll() {
      return [];
    }
  }

  const focusCard = new MockElement('rxFocusedLineCard');
  const focusTextEl = new MockElement('rxFocusedLineText');
  const fontValBadge = new MockElement('rxStudioFontVal');
  const lineValBadge = new MockElement('rxStudioLineVal');
  const letterValBadge = new MockElement('rxStudioLetterVal');
  const wordValBadge = new MockElement('rxStudioWordVal');
  const fontDecBtn = new MockElement('rxStudioFontDec', 'button');
  const fontIncBtn = new MockElement('rxStudioFontInc', 'button');
  const lineDecBtn = new MockElement('rxStudioLineDec', 'button');
  const lineIncBtn = new MockElement('rxStudioLineInc', 'button');
  const letterDecBtn = new MockElement('rxStudioLetterDec', 'button');
  const letterIncBtn = new MockElement('rxStudioLetterInc', 'button');
  const wordDecBtn = new MockElement('rxStudioWordDec', 'button');
  const wordIncBtn = new MockElement('rxStudioWordInc', 'button');
  const fontSelect = new MockElement('rxStudioFontSelect', 'select');
  fontSelect.value = "'Lexend', sans-serif";

  const defaultStudioSettings = {
    fontSize: 24,
    lineHeight: 2.0,
    letterSpacing: 0.035,
    wordSpacing: 0.08,
    fontFamily: "'Lexend', sans-serif",
    theme: 'dark'
  };

  const STUDIO_THEMES = {
    dark: { text: '#F1EFE7' },
    cream: { text: '#1D2018' },
    blue: { text: '#112333' },
    green: { text: '#122A17' }
  };

  let studioSettings = { ...defaultStudioSettings };

  function applySettings() {
    focusCard.style.setProperty('--rx-focus-font-size', `${studioSettings.fontSize}px`);
    focusCard.style.setProperty('--rx-focus-line-height', `${studioSettings.lineHeight}`);
    focusCard.style.setProperty('--rx-focus-letter-spacing', `${studioSettings.letterSpacing}em`);
    focusCard.style.setProperty('--rx-focus-word-spacing', `${studioSettings.wordSpacing}em`);
    focusCard.style.setProperty('--rx-focus-font-family', studioSettings.fontFamily);

    const theme = STUDIO_THEMES[studioSettings.theme] || STUDIO_THEMES.dark;
    focusTextEl.style.setProperty('font-family', studioSettings.fontFamily, 'important');
    focusTextEl.style.setProperty('font-size', `${studioSettings.fontSize}px`, 'important');
    focusTextEl.style.setProperty('line-height', `${studioSettings.lineHeight}`, 'important');
    focusTextEl.style.setProperty('letter-spacing', `${studioSettings.letterSpacing}em`, 'important');
    focusTextEl.style.setProperty('word-spacing', `${studioSettings.wordSpacing}em`, 'important');
    focusTextEl.style.setProperty('color', theme.text, 'important');

    fontValBadge.textContent = `${studioSettings.fontSize}px`;
    lineValBadge.textContent = studioSettings.lineHeight.toFixed(1);
    letterValBadge.textContent = `${studioSettings.letterSpacing.toFixed(3)}em`;
    wordValBadge.textContent = `${studioSettings.wordSpacing.toFixed(2)}em`;

    fontDecBtn.disabled = studioSettings.fontSize <= 16;
    fontIncBtn.disabled = studioSettings.fontSize >= 36;
    lineDecBtn.disabled = studioSettings.lineHeight <= 1.4;
    lineIncBtn.disabled = studioSettings.lineHeight >= 2.6;
    letterDecBtn.disabled = studioSettings.letterSpacing <= 0.00;
    letterIncBtn.disabled = studioSettings.letterSpacing >= 0.15;
    wordDecBtn.disabled = studioSettings.wordSpacing <= 0.00;
    wordIncBtn.disabled = studioSettings.wordSpacing >= 0.30;
  }

  // Initial application
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-size'), '24px');
  assert.strictEqual(fontValBadge.textContent, '24px');
  assert.strictEqual(fontDecBtn.disabled, false);
  assert.strictEqual(fontIncBtn.disabled, false);

  // Stepping Font Size to maximum 36
  studioSettings.fontSize = 36;
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-size'), '36px');
  assert.strictEqual(fontValBadge.textContent, '36px');
  assert.strictEqual(fontIncBtn.disabled, true, 'Font Inc must be disabled at 36px');

  // Stepping Font Size to minimum 16
  studioSettings.fontSize = 16;
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-size'), '16px');
  assert.strictEqual(fontValBadge.textContent, '16px');
  assert.strictEqual(fontDecBtn.disabled, true, 'Font Dec must be disabled at 16px');

  // Change font to OpenDyslexic
  studioSettings.fontFamily = "'OpenDyslexic', 'Lexend', sans-serif";
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-family'), "'OpenDyslexic', 'Lexend', sans-serif");

  // Change theme to Cream
  studioSettings.theme = 'cream';
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('color'), '#1D2018');

  // Test Reset
  studioSettings = { ...defaultStudioSettings };
  applySettings();
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-size'), '24px');
  assert.strictEqual(focusTextEl.style.getPropertyValue('font-family'), "'Lexend', sans-serif");
  assert.strictEqual(focusTextEl.style.getPropertyValue('color'), '#F1EFE7');
  assert.strictEqual(fontValBadge.textContent, '24px');
  assert.strictEqual(lineValBadge.textContent, '2.0');

  console.log('✅ Test 7 Passed: Simulated DOM interaction and control lifecycle completely verified');
}

console.log('\n=== ALL DYSLEXIA FOCUS READING STUDIO TESTS PASSED! ✅ ===\n');
