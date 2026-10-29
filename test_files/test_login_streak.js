// test_files/test_login_streak.js
// Verification suite for Feature 1: Login Streak — Track Consecutive Login Days

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');

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

const { connectToDatabase, getDb, pingDatabase } = require('../api/db.js');
const streakHandler = require('../api/streak.js');
const { calculateStreakUpdate, getDaysDifference } = streakHandler;

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

function httpPost(urlPath, postData) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(postData);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 3000,
      path: urlPath
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

const devServer = require('../dev-server.js');

async function runVerification() {
  console.log('=================================================================');
  console.log('   LOGIN STREAK VERIFICATION SUITE (FEATURE 1)');
  console.log('=================================================================\n');

  // Ensure dev server is listening
  let serverInstance = null;
  await new Promise(resolve => {
    const s = devServer.listen(3000, () => {
      serverInstance = s;
      resolve();
    });
    s.on('error', err => {
      if (err.code === 'EADDRINUSE') resolve();
      else resolve();
    });
  });

  // Verify DB connection
  const db = await getDb();
  const ping = await pingDatabase();
  assert.strictEqual(ping.ok, 1, 'MongoDB connection must be active');
  console.log('✅ Step 0: MongoDB Atlas connection verified');

  const userA = 'test_usr_streak_a_' + Date.now();
  const userB = 'test_usr_streak_b_' + Date.now();

  try {
    // -----------------------------------------------------------------
    // TEST 1: First login -> streak 1
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-24' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.streak.current, 1, 'First login must start streak at 1');
      assert.strictEqual(res.body.streak.longest, 1, 'First login longest streak must be 1');
      assert.strictEqual(res.body.streak.lastLoginDate, '2026-10-24');
      console.log('✅ Test 1 Passed: First login starts streak at 1 day');
    }

    // -----------------------------------------------------------------
    // TEST 2: Multiple logins on same day -> streak remains 1 (idempotent)
    // -----------------------------------------------------------------
    {
      for (let i = 0; i < 3; i++) {
        const req = {
          method: 'POST',
          body: { userId: userA, loginDate: '2026-10-24' }
        };
        const res = createMockRes();
        await streakHandler(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.streak.current, 1, 'Multiple logins on same day must remain 1');
        assert.strictEqual(res.body.streak.longest, 1);
      }
      console.log('✅ Test 2 Passed: Multiple logins on same calendar day count as only one streak day (idempotent)');
    }

    // -----------------------------------------------------------------
    // TEST 3: Next consecutive day login -> streak increments
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-25' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 2, 'Consecutive day login must increment streak');
      assert.strictEqual(res.body.streak.longest, 2, 'Longest streak must update to 2');
      assert.strictEqual(res.body.streak.lastLoginDate, '2026-10-25');
      console.log('✅ Test 3 Passed: Consecutive day login increments streak by 1 (1 -> 2)');
    }

    // -----------------------------------------------------------------
    // TEST 3b: Another consecutive day login -> streak increments again
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-26' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 3, 'Consecutive day login must increment streak to 3');
      assert.strictEqual(res.body.streak.longest, 3);
      console.log('✅ Test 3b Passed: Day 3 consecutive login increments streak to 3');
    }

    // -----------------------------------------------------------------
    // TEST 4: Missed day (skip 2026-10-27) followed by login on 2026-10-28 -> resets to 1
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-28' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 1, 'Missed day must reset active streak to 1');
      assert.strictEqual(res.body.streak.longest, 3, 'Longest streak must preserve historical maximum of 3');
      assert.strictEqual(res.body.streak.lastLoginDate, '2026-10-28');
      console.log('✅ Test 4 Passed: Missed calendar day resets active streak to 1 while preserving longest streak (3)');
    }

    // -----------------------------------------------------------------
    // TEST 5: Refresh or session restoration -> streak does not increase
    // -----------------------------------------------------------------
    {
      // GET requests simulate opening profile or refreshing page
      for (let i = 0; i < 4; i++) {
        const req = {
          method: 'GET',
          query: { userId: userA }
        };
        const res = createMockRes();
        await streakHandler(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.streak.current, 1, 'GET/refresh must not increment streak');
        assert.strictEqual(res.body.streak.longest, 3);
      }
      console.log('✅ Test 5 Passed: Refresh or session restoration does not increase the streak');
    }

    // -----------------------------------------------------------------
    // TEST 6: Two different users -> streaks remain independent
    // -----------------------------------------------------------------
    {
      // User B first login on 2026-10-28
      const reqB = {
        method: 'POST',
        body: { userId: userB, loginDate: '2026-10-28' }
      };
      const resB = createMockRes();
      await streakHandler(reqB, resB);

      assert.strictEqual(resB.body.streak.current, 1);
      assert.strictEqual(resB.body.streak.longest, 1);
      assert.strictEqual(resB.body.streak.userId, userB);

      // Verify User A is unaffected
      const reqA = {
        method: 'GET',
        query: { userId: userA }
      };
      const resA = createMockRes();
      await streakHandler(reqA, resA);

      assert.strictEqual(resA.body.streak.current, 1);
      assert.strictEqual(resA.body.streak.longest, 3);
      assert.strictEqual(resA.body.streak.userId, userA);
      console.log('✅ Test 6 Passed: Two different users maintain isolated and independent streaks');
    }

    // -----------------------------------------------------------------
    // TEST 7: HTTP endpoint on Live Dev Server (/api/streak)
    // -----------------------------------------------------------------
    {
      const httpRes = await httpGet(`/api/streak?userId=${encodeURIComponent(userA)}`);
      assert.strictEqual(httpRes.status, 200);
      assert.strictEqual(httpRes.data.success, true);
      assert.strictEqual(httpRes.data.streak.current, 1);
      assert.strictEqual(httpRes.data.streak.longest, 3);
      console.log('✅ Test 7 Passed: HTTP dev server /api/streak routes correctly and returns MongoDB data');
    }

    // -----------------------------------------------------------------
    // TEST 8: Input validation
    // -----------------------------------------------------------------
    {
      const badReq1 = await httpGet('/api/streak');
      assert.strictEqual(badReq1.status, 400);

      const badReq2 = await httpPost('/api/streak', { userId: userA, loginDate: 'not-a-date' });
      assert.strictEqual(badReq2.status, 400);
      console.log('✅ Test 8 Passed: API properly validates parameters and rejects invalid input');
    }

    console.log('\n=================================================================');
    console.log(' 🎉 ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('=================================================================');
  } finally {
    if (serverInstance) {
      await new Promise(r => serverInstance.close(r));
    }
    // Cleanup test records
    await db.collection('login_streaks').deleteMany({
      userId: { $in: [userA, userB] }
    });
    console.log('🧹 Cleaned up test records from MongoDB Atlas.');
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
