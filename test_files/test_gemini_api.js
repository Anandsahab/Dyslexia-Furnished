// test_files/test_gemini_api.js
// Unit and integration tests for api/gemini.js Vercel serverless function

const assert = require('assert');
const handler = require('../api/gemini.js');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, val) {
      this.headers[key] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
}

async function runTests() {
  console.log('=== STARTING GEMINI BACKEND API INTEGRATION TESTS ===\n');

  // Test 1: Preflight OPTIONS
  {
    const req = { method: 'OPTIONS' };
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 200, 'OPTIONS should return 200');
    assert.strictEqual(res.headers['Access-Control-Allow-Methods'], 'GET, POST, OPTIONS');
    console.log('✅ Test 1 Passed: OPTIONS preflight handled correctly');
  }

  // Test 2: Method Not Allowed (PUT / DELETE)
  {
    const req = { method: 'PUT' };
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 405, 'PUT should return 405');
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('405'), 'Clean 405 JSON error returned');
    console.log('✅ Test 2 Passed: Non-POST/GET methods blocked with 405 JSON error');
  }

  // Test 3: Missing Environment Variable GEMINI_API_KEY
  {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = { method: 'POST', body: { prompt: 'Hello' } };
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 500, 'Missing API key should return 500');
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.error.includes('not configured'), 'Should return safe error message');
    console.log('✅ Test 3 Passed: Missing API key handled safely with 500');

    process.env.GEMINI_API_KEY = oldKey;
  }

  // Test 4: Missing Prompt/Body
  {
    process.env.GEMINI_API_KEY = 'mock_secret_key_12345';
    const req = { method: 'POST', body: {} };
    const res = createMockRes();
    await handler(req, res);
    assert.strictEqual(res.statusCode, 400, 'Empty prompt should return 400');
    assert.strictEqual(res.body.success, false);
    console.log('✅ Test 4 Passed: Missing prompt validated with 400');
  }

  // Test 5: Key Redaction / Leak Prevention
  {
    process.env.GEMINI_API_KEY = 'super_secret_test_key_xyz987';
    // Mock global fetch to simulate Gemini upstream error containing the key
    const originalFetch = global.fetch;
    global.fetch = async (url, opts) => {
      return {
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            message: `Invalid request with super_secret_test_key_xyz987 on resource`
          }
        })
      };
    };

    const req = { method: 'POST', body: { prompt: 'Explain gravity', action: 'simplify' } };
    const res = createMockRes();
    await handler(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(!res.body.error.includes('super_secret_test_key_xyz987'), 'API Key must NEVER appear in response error');
    assert.ok(res.body.error.includes('[REDACTED_API_KEY]'), 'Secret key was properly redacted');
    console.log('✅ Test 5 Passed: Upstream error sanitized and API key never leaked');

    // Test 6: Successful POST Gemini Response
    global.fetch = async (url, opts) => {
      const payload = JSON.parse(opts.body);
      assert.strictEqual(payload.contents[0].parts[0].text, 'Explain gravity');
      assert.ok(payload.systemInstruction, 'System instruction should be present for simplify action');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Gravity is the invisible force that pulls objects toward each other.' }]
              },
              finishReason: 'STOP'
            }
          ]
        })
      };
    };

    const reqSuccess = { method: 'POST', body: { prompt: 'Explain gravity', action: 'simplify' } };
    const resSuccess = createMockRes();
    await handler(reqSuccess, resSuccess);

    assert.strictEqual(resSuccess.statusCode, 200);
    assert.strictEqual(resSuccess.body.success, true);
    assert.strictEqual(resSuccess.body.action, 'simplify');
    assert.strictEqual(resSuccess.body.text, 'Gravity is the invisible force that pulls objects toward each other.');
    console.log('✅ Test 6 Passed: Successful POST request dispatched and formatted properly');

    // Test 7: Successful GET Request
    const reqGet = { method: 'GET', query: { prompt: 'Explain gravity', action: 'simplify' } };
    const resGet = createMockRes();
    await handler(reqGet, resGet);

    assert.strictEqual(resGet.statusCode, 200);
    assert.strictEqual(resGet.body.success, true);
    assert.strictEqual(resGet.body.text, 'Gravity is the invisible force that pulls objects toward each other.');
    console.log('✅ Test 7 Passed: Successful GET request dispatched and formatted properly');

    global.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  }

  console.log('\n=== ALL GEMINI BACKEND TESTS PASSED SUCCESSFULLY! ===\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
