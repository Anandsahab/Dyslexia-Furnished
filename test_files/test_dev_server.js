// test_files/test_dev_server.js
// Verification suite for dev-server.js and local API routing

const http = require('http');
const assert = require('assert');
const server = require('../dev-server.js');
const ReadXGemini = require('../js/gemini.js');

const TEST_PORT = 3199;

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runDevServerTests() {
  console.log('=== STARTING LOCAL DEV SERVER & ROUTING INTEGRATION TESTS ===\n');

  // Start server on test port
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`📡 Test server listening on http://localhost:${TEST_PORT}`);

  try {
    // 1. Verify static upload.html is served
    {
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/upload.html',
        method: 'GET'
      });
      assert.strictEqual(res.statusCode, 200, 'upload.html must return 200');
      assert.ok(res.headers['content-type'].includes('text/html'), 'Must have text/html content-type');
      assert.ok(res.body.includes('modalBtnVisual'), 'Must contain Visual Learning UI element');
      console.log('✅ Test 1 Passed: Static upload.html served correctly with 200 OK');
    }

    // 2. Verify /Dyslexia-Furnished/upload.html subpath prefix handling
    {
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/Dyslexia-Furnished/upload.html',
        method: 'GET'
      });
      assert.strictEqual(res.statusCode, 200, 'Subpath /Dyslexia-Furnished/upload.html must return 200');
      assert.ok(res.headers['content-type'].includes('text/html'));
      assert.ok(res.body.includes('modalBtnVisual'));
      console.log('✅ Test 2 Passed: Subpath /Dyslexia-Furnished/upload.html prefix stripped and served correctly');
    }

    // 3. Verify OPTIONS preflight on /api/gemini returns CORS headers
    {
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/gemini',
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5500',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert.strictEqual(res.statusCode, 200, 'OPTIONS must return 200');
      assert.strictEqual(res.headers['access-control-allow-origin'], '*', 'CORS Allow-Origin must be *');
      assert.ok(res.headers['access-control-allow-methods'].includes('POST'), 'CORS Allow-Methods must include POST');
      console.log('✅ Test 3 Passed: OPTIONS preflight on /api/gemini returns valid CORS headers for Live Server origin');
    }

    // 4. Verify /api/gemini reaches the handler rather than static 404
    {
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/gemini',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5500'
        }
      }, { action: 'visualize', prompt: 'Short test input text here' });

      // If GEMINI_API_KEY is unset in local environment, handler returns 500 JSON (not static 404 HTML)
      assert.notStrictEqual(res.statusCode, 404, 'Must NOT return 404 Not Found');
      assert.ok(res.headers['content-type'].includes('application/json'), 'Must return JSON from handler, not HTML 404');
      const body = JSON.parse(res.body);
      assert.strictEqual(typeof body, 'object', 'Body must be valid JSON');
      console.log(`✅ Test 4 Passed: POST /api/gemini reaches function handler directly (Status: ${res.statusCode}, JSON response returned)`);
    }

    // 5. Verify /Dyslexia-Furnished/api/gemini reaches the function handler
    {
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/Dyslexia-Furnished/api/gemini',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { action: 'visualize', prompt: 'Short test input text here' });

      assert.notStrictEqual(res.statusCode, 404, 'Subpath API must NOT return 404');
      assert.ok(res.headers['content-type'].includes('application/json'), 'Must return JSON');
      console.log('✅ Test 5 Passed: Subpath POST /Dyslexia-Furnished/api/gemini reaches function handler directly');
    }

    // 6. Verify js/gemini.js dynamic endpoint resolution for different origins
    {
      // Simulate Live Server on port 5500
      global.window = {
        location: {
          hostname: 'localhost',
          port: '5500',
          pathname: '/Dyslexia-Furnished/upload.html'
        }
      };
      assert.strictEqual(ReadXGemini.getEndpoint(), 'http://localhost:3000/api/gemini', 'Port 5500 must route to http://localhost:3000/api/gemini');

      // Simulate local server on port 3000
      global.window = {
        location: {
          hostname: 'localhost',
          port: '3000',
          pathname: '/upload.html'
        }
      };
      assert.strictEqual(ReadXGemini.getEndpoint(), '/api/gemini', 'Port 3000 must use /api/gemini');

      // Simulate production Vercel
      global.window = {
        location: {
          hostname: 'dyslexia-1.vercel.app',
          port: '',
          pathname: '/upload.html'
        }
      };
      assert.strictEqual(ReadXGemini.getEndpoint(), '/api/gemini', 'Vercel production must use /api/gemini');

      delete global.window;
      console.log('✅ Test 6 Passed: Dynamic endpoint resolver correctly routes Live Server (5500), local dev (3000), and Vercel');
    }

    // 7. Verify with dummy GEMINI_API_KEY that handler returns valid response or processes action
    {
      process.env.GEMINI_API_KEY = 'mock_key_for_routing_check';
      const res = await httpRequest({
        hostname: 'localhost',
        port: TEST_PORT,
        path: '/api/gemini',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, { action: 'visualize', prompt: 'x' }); // prompt too short -> should return 400 INVALID_INPUT from handler

      assert.strictEqual(res.statusCode, 400, 'Short input must trigger 400 from handler');
      const body = JSON.parse(res.body);
      assert.strictEqual(body.code, 'INVALID_INPUT');
      console.log('✅ Test 7 Passed: Handler validation logic executes successfully via HTTP request');
      delete process.env.GEMINI_API_KEY;
    }

    console.log('\n=== ALL DEV SERVER & ROUTING TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    await new Promise(resolve => server.close(resolve));
    console.log('🛑 Test server stopped.');
  }
}

runDevServerTests().catch(err => {
  console.error('❌ Dev server test failure:', err);
  server.close(() => process.exit(1));
});
