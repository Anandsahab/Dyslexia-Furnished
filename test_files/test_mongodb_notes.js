// test_files/test_mongodb_notes.js
// Test suite for MongoDB Atlas connection and /api/notes endpoints

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, '..', file);
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
      } catch (e) {}
    }
  }
}

loadEnv();

const { connectToDatabase, getDb, pingDatabase, closeConnection, sanitizeError } = require('../api/db.js');
const notesHandler = require('../api/notes.js');

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
    end(data) {
      if (data && !this.body) {
        try {
          this.body = JSON.parse(data);
        } catch (e) {
          this.body = data;
        }
      }
      return this;
    }
  };
}

async function runTests() {
  console.log('=== STARTING MONGODB ATLAS & NOTES API INTEGRATION TESTS ===\n');

  // Test 1: Direct MongoDB Atlas Connection & Ping
  {
    console.log('Testing MongoDB connection...');
    const { client, db } = await connectToDatabase();
    assert.ok(client, 'MongoClient should be defined');
    assert.ok(db, 'Db should be defined');
    assert.strictEqual(db.databaseName, 'readx', 'Database name must be readx');

    const ping = await pingDatabase();
    assert.strictEqual(ping.ok, 1, 'Ping command should return ok: 1');
    console.log('✅ Test 1 Passed: Successfully connected and pinged MongoDB Atlas (readx DB)');
  }

  // Test 2: Error Sanitization - never leak credentials
  {
    const leaked = sanitizeError(new Error('Failed mongodb+srv://user:secret123@cluster0.abc.net/ test error'));
    assert.ok(!leaked.includes('secret123'), 'Sanitizer must remove passwords');
    assert.ok(leaked.includes('mongodb+srv://***:***@'), 'Sanitizer replaces credentials with asterisks');
    console.log('✅ Test 2 Passed: Error messages properly sanitize MongoDB credentials');
  }

  // Test 3: OPTIONS Preflight for /api/notes
  {
    const req = { method: 'OPTIONS' };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.headers['Access-Control-Allow-Methods'].includes('POST'));
    assert.ok(res.headers['Access-Control-Allow-Methods'].includes('DELETE'));
    console.log('✅ Test 3 Passed: OPTIONS preflight handled with correct CORS headers');
  }

  // Test 4: Validation on GET with missing parameters
  {
    const req = { method: 'GET', query: {} };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    console.log('✅ Test 4 Passed: GET without required params returns 400 Bad Request');
  }

  // Test 5: Validation on POST with empty text
  {
    const req = {
      method: 'POST',
      body: { type: 'topic', id: 'binary-search', text: '   ' }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    console.log('✅ Test 5 Passed: POST with empty text returns 400 Bad Request');
  }

  // Test 6: Create Note via POST /api/notes
  const testNoteId = 'note_test_' + Date.now();
  {
    const req = {
      method: 'POST',
      body: {
        type: 'topic',
        id: 'test-topic-mongo',
        noteId: testNoteId,
        text: 'This is a test note persisted directly to MongoDB Atlas.',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 201, 'POST should return 201 Created');
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.note.id, testNoteId);
    assert.strictEqual(res.body.note.type, 'topic');
    assert.strictEqual(res.body.note.targetId, 'test-topic-mongo');
    assert.strictEqual(res.body.note.text, 'This is a test note persisted directly to MongoDB Atlas.');
    console.log('✅ Test 6 Passed: Successfully created note in MongoDB via POST /api/notes');
  }

  // Test 7: Retrieve Notes via GET /api/notes
  {
    const req = {
      method: 'GET',
      query: { type: 'topic', id: 'test-topic-mongo' }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.notes), 'Notes must be an array');
    const found = res.body.notes.find(n => n.id === testNoteId);
    assert.ok(found, 'Created note must be retrieved in GET response');
    assert.strictEqual(found.text, 'This is a test note persisted directly to MongoDB Atlas.');
    console.log('✅ Test 7 Passed: Successfully retrieved note from MongoDB via GET /api/notes');
  }

  // Test 8: Update Note via PUT /api/notes
  {
    const req = {
      method: 'PUT',
      body: {
        noteId: testNoteId,
        text: 'Updated test note content in MongoDB.'
      }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.note.text, 'Updated test note content in MongoDB.');
    console.log('✅ Test 8 Passed: Successfully updated note in MongoDB via PUT /api/notes');
  }

  // Test 9: Delete Note via DELETE /api/notes
  {
    const req = {
      method: 'DELETE',
      query: { noteId: testNoteId }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.deletedCount, 1);
    console.log('✅ Test 9 Passed: Successfully deleted note from MongoDB via DELETE /api/notes');
  }

  // Test 10: Verify Deletion via GET
  {
    const req = {
      method: 'GET',
      query: { type: 'topic', id: 'test-topic-mongo' }
    };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const found = res.body.notes.find(n => n.id === testNoteId);
    assert.strictEqual(found, undefined, 'Deleted note must no longer be returned');
    console.log('✅ Test 10 Passed: Verified note deletion confirmed in MongoDB');
  }

  // Test 11: Unsupported method returns 405
  {
    const req = { method: 'PATCH' };
    const res = createMockRes();
    await notesHandler(req, res);
    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(res.body.success, false);
    console.log('✅ Test 11 Passed: Unsupported HTTP method rejected with 405');
  }

  await closeConnection();
  console.log('\n=== ALL MONGODB ATLAS & NOTES API TESTS PASSED SUCCESSFULLY! ✅ ===');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
