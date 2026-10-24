// dev-server.js
// Standalone, zero-dependency local development server for ReadX
// Serves static assets and routes /api/gemini directly to api/gemini.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables from .env or .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        raw.split(/\r?\n/).forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const eq = trimmed.indexOf('=');
            if (eq > 0) {
              const k = trimmed.slice(0, eq).trim();
              const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
              if (!process.env[k]) {
                process.env[k] = v;
              }
            }
          }
        });
        console.log(`📄 Loaded environment configuration from ${file}`);
      } catch (e) {
        console.warn(`Could not read ${file}:`, e.message);
      }
    }
  }
}

loadEnv();

const handler = require('./api/gemini.js');
const notesHandler = require('./api/notes.js');

const PORT = parseInt(process.env.PORT, 10) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain; charset=utf-8',
  '.rtf': 'application/rtf',
  '.csv': 'text/csv; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4'
};

const server = http.createServer(async (req, res) => {
  // Set default CORS headers so Live Server or other ports can access API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Polyfill Express/Vercel helper methods on res
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };

  res.json = function (obj) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
    return res;
  };

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || '/';

  // Strip subpath prefix if requested via /Dyslexia-Furnished/...
  if (pathname === '/Dyslexia-Furnished') {
    pathname = '/';
  } else if (pathname.startsWith('/Dyslexia-Furnished/')) {
    pathname = pathname.slice('/Dyslexia-Furnished'.length);
  }

  // 1. Route API requests
  if (pathname === '/api/gemini' || pathname === '/api/gemini.js') {
    req.query = parsedUrl.query || {};

    // Collect request body for POST/PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
          req.body = rawBody;
        }
        try {
          await handler(req, res);
        } catch (err) {
          console.error('[DEV SERVER API ERROR]:', err);
          if (!res.writableEnded) {
            res.status(500).json({ success: false, error: err.message });
          }
        }
      });
      return;
    }

    try {
      await handler(req, res);
    } catch (err) {
      console.error('[DEV SERVER API ERROR]:', err);
      if (!res.writableEnded) {
        res.status(500).json({ success: false, error: err.message });
      }
    }
    return;
  }

  if (pathname === '/api/notes' || pathname === '/api/notes.js') {
    req.query = parsedUrl.query || {};

    // Collect request body for POST/PUT/DELETE requests
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = rawBody ? JSON.parse(rawBody) : {};
        } catch (e) {
          req.body = rawBody;
        }
        try {
          await notesHandler(req, res);
        } catch (err) {
          console.error('[DEV SERVER NOTES API ERROR]:', err);
          if (!res.writableEnded) {
            res.status(500).json({ success: false, error: err.message });
          }
        }
      });
      return;
    }

    try {
      await notesHandler(req, res);
    } catch (err) {
      console.error('[DEV SERVER NOTES API ERROR]:', err);
      if (!res.writableEnded) {
        res.status(500).json({ success: false, error: err.message });
      }
    }
    return;
  }

  // 2. Serve static files
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if .html can be appended (cleanUrls)
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(htmlPath).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>Resource <code>${pathname}</code> was not found on this server.</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(` 🚀 ReadX Local Development Server is LIVE!`);
    console.log(`============================================================`);
    console.log(` 🌐 Reader / Upload: http://localhost:${PORT}/upload.html`);
    console.log(` 🏠 Homepage:        http://localhost:${PORT}/index.html`);
    console.log(` 📡 Gemini API:      http://localhost:${PORT}/api/gemini`);
    console.log(`============================================================\n`);
  });
}

module.exports = server;
