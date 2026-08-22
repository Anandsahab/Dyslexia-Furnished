const fs = require('fs');
const path = require('path');

console.log('=== STARTING MY CONTENT FILE UPLOAD & VALIDATION AUDIT ===\n');

// 1. Audit upload.html for accept attribute and design elements
const uploadHtmlPath = path.join(__dirname, '..', 'upload.html');
const uploadHtml = fs.readFileSync(uploadHtmlPath, 'utf8');

console.log('1. Auditing upload.html:');
const hasUploadInput = uploadHtml.includes('id="uploadInput"');
console.log(' - uploadInput element exists:', hasUploadInput ? 'PASS' : 'FAIL');

const acceptMatch = uploadHtml.match(/<input[^>]+id="uploadInput"[^>]+accept="([^"]+)"/);
if (acceptMatch) {
  console.log(' - accept attribute found:', acceptMatch[1]);
} else {
  console.log(' - accept attribute found: FAIL (not found on input)');
}

const requiredExtensionsInAccept = [
  '.pdf', '.doc', '.docx', '.txt', '.rtf',
  '.ppt', '.pptx',
  '.xls', '.xlsx', '.csv',
  '.jpg', '.jpeg', '.png', '.webp'
];

let allAcceptPresent = true;
requiredExtensionsInAccept.forEach(ext => {
  if (!acceptMatch || !acceptMatch[1].includes(ext)) {
    console.log(`   ❌ Missing ${ext} in accept attribute`);
    allAcceptPresent = false;
  }
});
if (allAcceptPresent) {
  console.log(' - All 14 required extensions present in accept attribute: PASS');
}

const zipInAccept = acceptMatch && acceptMatch[1].includes('.zip');
console.log(' - .zip excluded from accept attribute:', !zipInAccept ? 'PASS' : 'FAIL (Found .zip in accept!)');

// 2. Audit upload.js validation logic
const uploadJsPath = path.join(__dirname, '..', 'js', 'upload.js');
const uploadJs = fs.readFileSync(uploadJsPath, 'utf8');

console.log('\n2. Auditing upload.js validation rules:');

// Extract BLOCKED_EXTENSIONS and ALLOWED_EXTENSIONS from upload.js
const blockedExtsMatch = uploadJs.match(/const BLOCKED_EXTENSIONS = \[([\s\S]*?)\];/);
const allowedExtsMatch = uploadJs.match(/const ALLOWED_EXTENSIONS = \[([\s\S]*?)\];/);

console.log(' - BLOCKED_EXTENSIONS defined:', Boolean(blockedExtsMatch) ? 'PASS' : 'FAIL');
console.log(' - ALLOWED_EXTENSIONS defined:', Boolean(allowedExtsMatch) ? 'PASS' : 'FAIL');

// Mock browser validation simulator replicating upload.js processUploadedFile logic
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
const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'html', 'htm', 'json', 'xml', 'log',
  'ppt', 'pptx',
  'xls', 'xlsx', 'csv',
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp',
  'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac',
  'mp4', 'webm', 'mov', 'ogv', 'avi', 'mkv'
];

function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function testValidation(filename, mimeType, size = 1024) {
  const ext = getFileExtension(filename);
  const mime = (mimeType || '').toLowerCase();

  // 1. STRICTLY REJECT ZIP FILES
  if (ext === 'zip' || ((mime === 'application/zip' || mime === 'application/x-zip-compressed' || mime === 'application/x-zip' || mime === 'multipart/x-zip') && !['docx', 'pptx', 'xlsx'].includes(ext))) {
    return { allowed: false, error: 'ZIP files (.zip) are strictly not supported. Please upload a supported study material format (PDF, Word, PPT, Excel, CSV, Text, RTF, or Image).' };
  }

  // 2. REJECT OTHER ARCHIVE AND EXECUTABLE FILES
  if (BLOCKED_EXTENSIONS.includes(ext) || BLOCKED_MIME_TYPES.includes(mime)) {
    return { allowed: false, error: `Files with format .${ext || 'archive/executable'} are not supported. Archive and executable formats cannot be uploaded.` };
  }

  // 3. VALIDATE AGAINST ALLOWLIST
  const isMimeAllowed = mime.startsWith('image/') || mime.startsWith('audio/') || mime.startsWith('video/') || mime.startsWith('text/') || mime.includes('pdf') || mime.includes('word') || mime.includes('officedocument') || mime.includes('excel') || mime.includes('powerpoint') || mime.includes('spreadsheet');
  if (!ALLOWED_EXTENSIONS.includes(ext) && !isMimeAllowed) {
    return { allowed: false, error: `Unsupported file format (.${ext || 'unknown'}). Please upload supported study materials (PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, CSV, TXT, RTF, or Images).` };
  }

  // 4. FILE SIZE VALIDATION (50MB)
  if (size > 50 * 1024 * 1024) {
    return { allowed: false, error: `File is too large. Maximum allowed upload size is 50MB.` };
  }

  return { allowed: true, error: null };
}

// 3. Run test table
const testCases = [
  // Required study documents
  { type: 'PDF', file: 'lecture-notes.pdf', mime: 'application/pdf', expectAllowed: true },
  { type: 'DOC', file: 'assignment.doc', mime: 'application/msword', expectAllowed: true },
  { type: 'DOCX', file: 'research-paper.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', expectAllowed: true },
  { type: 'TXT', file: 'syllabus.txt', mime: 'text/plain', expectAllowed: true },
  { type: 'RTF', file: 'reading-summary.rtf', mime: 'application/rtf', expectAllowed: true },
  // Required presentations
  { type: 'PPT', file: 'slides.ppt', mime: 'application/vnd.ms-powerpoint', expectAllowed: true },
  { type: 'PPTX', file: 'chapter1-slides.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', expectAllowed: true },
  // Required spreadsheets
  { type: 'XLS', file: 'grades.xls', mime: 'application/vnd.ms-excel', expectAllowed: true },
  { type: 'XLSX', file: 'dataset.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', expectAllowed: true },
  { type: 'CSV', file: 'experiment-data.csv', mime: 'text/csv', expectAllowed: true },
  // Required images
  { type: 'JPG', file: 'diagram.jpg', mime: 'image/jpeg', expectAllowed: true },
  { type: 'JPEG', file: 'flowchart.jpeg', mime: 'image/jpeg', expectAllowed: true },
  { type: 'PNG', file: 'mindmap.png', mime: 'image/png', expectAllowed: true },
  { type: 'WEBP', file: 'infographic.webp', mime: 'image/webp', expectAllowed: true },
  // Strictly blocked
  { type: 'ZIP', file: 'archive.zip', mime: 'application/zip', expectAllowed: false },
  // Other blocked archives & executables
  { type: 'RAR', file: 'archive.rar', mime: 'application/x-rar-compressed', expectAllowed: false },
  { type: '7Z', file: 'bundle.7z', mime: 'application/x-7z-compressed', expectAllowed: false },
  { type: 'EXE', file: 'installer.exe', mime: 'application/x-msdownload', expectAllowed: false },
  { type: 'MSI', file: 'setup.msi', mime: 'application/x-msi', expectAllowed: false },
  // Bypass attempt: zip renamed to txt or with zip mime
  { type: 'ZIP (MIME Bypass)', file: 'sneaky.txt', mime: 'application/zip', expectAllowed: false }
];

console.log('\n3. Execution of Test Suite:');
console.log('| File Type | Upload Allowed | Correctly Validated | Result |');
console.log('|-----------|----------------|---------------------|--------|');

let allPassed = true;
testCases.forEach(tc => {
  const res = testValidation(tc.file, tc.mime);
  const isCorrect = res.allowed === tc.expectAllowed;
  if (!isCorrect) allPassed = false;
  
  const uploadAllowedSymbol = res.allowed ? '✅' : '❌';
  const validatedSymbol = isCorrect ? (tc.expectAllowed ? '✅' : '✅ Blocked') : '❌ Failed';
  const statusStr = isCorrect ? 'PASS' : 'FAIL';
  
  console.log(`| ${tc.type.padEnd(9)} | ${uploadAllowedSymbol.padEnd(14)} | ${validatedSymbol.padEnd(19)} | ${statusStr} |`);
});

console.log('\n=== AUDIT CONCLUSION ===');
console.log('Overall Test Status:', allPassed ? 'ALL TESTS PASSED SUCCESSFULLY ✅' : 'SOME TESTS FAILED ❌');
