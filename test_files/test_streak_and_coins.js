// test_files/test_streak_and_coins.js
// Verification suite for Live Login Streak and Daily Coins System

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Load environment variables
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
const devServer = require('../dev-server.js');
const { calculateStreakUpdate, formatStreak, getDaysDifference } = streakHandler;

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

function makeHttpRequest(port, method, urlPath, postData = null) {
  return new Promise((resolve, reject) => {
    const dataStr = postData ? JSON.stringify(postData) : null;
    const req = http.request({
      hostname: 'localhost',
      port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {})
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
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function runAllTests() {
  console.log('=================================================================');
  console.log('  LIVE LOGIN STREAK & DAILY COINS SUITE');
  console.log('=================================================================\n');

  // Verify MongoDB connection
  const db = await getDb();
  const ping = await pingDatabase();
  assert.strictEqual(ping.ok, 1, 'MongoDB connection must be active');
  console.log('✅ Step 0: MongoDB Atlas connection verified');

  const userA = 'test_usr_coin_a_' + Date.now();
  const userB = 'test_usr_coin_b_' + Date.now();
  const TEST_SERVER_PORT = 3198;

  let serverStarted = false;

  try {
    // -----------------------------------------------------------------
    // TEST 1: First login -> starts streak at 1, awards exactly 1 coin
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
      assert.strictEqual(res.body.streak.coins, 1, 'First login must award exactly 1 coin');
      assert.strictEqual(res.body.streak.coinAwardedToday, true, 'First login must indicate coin awarded');
      assert.strictEqual(res.body.coins.balance, 1, 'Coins balance must be 1');
      assert.strictEqual(res.body.coins.awardedToday, true);
      console.log('✅ Test 1 Passed: First login starts streak at 1 day and awards exactly +1 coin');
    }

    // -----------------------------------------------------------------
    // TEST 2: Multiple same-day logins -> idempotent, streak remains 1, coins remain 1
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
        assert.strictEqual(res.body.streak.current, 1, 'Same day login must not increment streak');
        assert.strictEqual(res.body.streak.longest, 1);
        assert.strictEqual(res.body.streak.coins, 1, 'Same day login must not award extra coins');
        assert.strictEqual(res.body.streak.coinAwardedToday, false, 'No new coin awarded on repeated same-day login');
        assert.strictEqual(res.body.coins.balance, 1);
      }
      console.log('✅ Test 2 Passed: Repeated same-day logins do not increase streak or award extra coins');
    }

    // -----------------------------------------------------------------
    // TEST 3: Consecutive day login (Day 2) -> streak 2, coins 2 (+1 coin)
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-25' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 2, 'Consecutive day login must increment streak to 2');
      assert.strictEqual(res.body.streak.longest, 2, 'Longest streak must update to 2');
      assert.strictEqual(res.body.streak.coins, 2, 'Next day login must award exactly +1 coin (total 2)');
      assert.strictEqual(res.body.streak.coinAwardedToday, true);
      assert.strictEqual(res.body.coins.balance, 2);
      console.log('✅ Test 3 Passed: Next consecutive day increments streak by 1 and awards exactly +1 coin (balance = 2)');
    }

    // -----------------------------------------------------------------
    // TEST 4: Day 3 consecutive login -> streak 3, coins 3 (+1 coin)
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
      assert.strictEqual(res.body.streak.coins, 3, 'Day 3 login must award +1 coin (total 3)');
      assert.strictEqual(res.body.streak.coinAwardedToday, true);
      assert.strictEqual(res.body.coins.balance, 3);
      console.log('✅ Test 4 Passed: Day 3 consecutive login increments streak to 3 and awards +1 coin (balance = 3)');
    }

    // -----------------------------------------------------------------
    // TEST 5: Missed calendar day (skip 2026-10-27, login 2026-10-28)
    //         -> streak resets to 1, longest preserved (3), coins increment to 4 (coins never reset!)
    // -----------------------------------------------------------------
    {
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-28' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 1, 'Missed day must reset current streak to 1');
      assert.strictEqual(res.body.streak.longest, 3, 'Longest streak must preserve maximum (3)');
      assert.strictEqual(res.body.streak.coins, 4, 'Coins must NOT reset on missed day! Awards +1 on login to 4');
      assert.strictEqual(res.body.streak.coinAwardedToday, true);
      assert.strictEqual(res.body.coins.balance, 4);
      console.log('✅ Test 5 Passed: Missed calendar day resets streak to 1, preserves longest streak (3), and awards +1 coin without resetting balance (coins = 4)');
    }

    // -----------------------------------------------------------------
    // TEST 6: Page refresh / GET requests (simulating opening profile)
    //         -> streak and coins remain unchanged, never awards coins
    // -----------------------------------------------------------------
    {
      for (let i = 0; i < 5; i++) {
        const req = {
          method: 'GET',
          query: { userId: userA, date: '2026-10-28' }
        };
        const res = createMockRes();
        await streakHandler(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.streak.current, 1, 'GET/refresh must not change streak');
        assert.strictEqual(res.body.streak.longest, 3);
        assert.strictEqual(res.body.streak.coins, 4, 'GET/refresh must NEVER award coins');
        assert.strictEqual(res.body.streak.todayRewardEarned, true, 'Today reward indicator must show earned');
        assert.strictEqual(res.body.coins.balance, 4);
        assert.strictEqual(res.body.coins.awardedToday, true);
      }
      console.log('✅ Test 6 Passed: Opening Profile and refreshing never awards extra coins (read-only persistence)');
    }

    // -----------------------------------------------------------------
    // TEST 7: Logout / Login simulation on the same calendar day
    // -----------------------------------------------------------------
    {
      // User logs in again on 2026-10-28 after logging out
      const req = {
        method: 'POST',
        body: { userId: userA, loginDate: '2026-10-28' }
      };
      const res = createMockRes();
      await streakHandler(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.streak.current, 1);
      assert.strictEqual(res.body.streak.coins, 4, 'Logging back in on the same day must not award extra coins');
      assert.strictEqual(res.body.streak.coinAwardedToday, false);
      console.log('✅ Test 7 Passed: Logging out and logging back in on the same day awards 0 extra coins');
    }

    // -----------------------------------------------------------------
    // TEST 8: Two different users maintain isolated streaks and coins
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
      assert.strictEqual(resB.body.streak.coins, 1, 'User B starts with 1 coin');
      assert.strictEqual(resB.body.streak.userId, userB);

      // Verify User A is completely unaffected
      const reqA = {
        method: 'GET',
        query: { userId: userA, date: '2026-10-28' }
      };
      const resA = createMockRes();
      await streakHandler(reqA, resA);

      assert.strictEqual(resA.body.streak.current, 1);
      assert.strictEqual(resA.body.streak.longest, 3);
      assert.strictEqual(resA.body.streak.coins, 4, 'User A balance must remain 4');
      assert.strictEqual(resA.body.streak.userId, userA);
      console.log('✅ Test 8 Passed: Two different users maintain strictly isolated streak and coin balances');
    }

    // -----------------------------------------------------------------
    // TEST 9: Concurrent login requests (race condition safety)
    // -----------------------------------------------------------------
    {
      const userC = 'test_usr_concurrent_' + Date.now();
      try {
        // Fire 5 concurrent login requests for userC on the same calendar date
        const promises = [];
        for (let i = 0; i < 5; i++) {
          const req = {
            method: 'POST',
            body: { userId: userC, loginDate: '2026-10-29' }
          };
          const res = createMockRes();
          promises.push(streakHandler(req, res).then(() => res));
        }

        const results = await Promise.all(promises);
        
        // Fetch final record from database
        const finalDoc = await db.collection('login_streaks').findOne({ userId: userC });
        assert.strictEqual(finalDoc.coins, 1, 'Concurrent requests must award exactly 1 coin, never duplicate!');
        assert.strictEqual(finalDoc.currentStreak, 1, 'Concurrent streak must be exactly 1');

        console.log('✅ Test 9 Passed: Concurrent login requests are race-condition safe and award exactly 1 coin');
      } finally {
        await db.collection('login_streaks').deleteOne({ userId: userC });
      }
    }

    // -----------------------------------------------------------------
    // TEST 10: Live Dev Server HTTP routing for /api/streak
    // -----------------------------------------------------------------
    {
      await new Promise(resolve => devServer.listen(TEST_SERVER_PORT, resolve));
      serverStarted = true;

      // GET test
      const httpGetRes = await makeHttpRequest(TEST_SERVER_PORT, 'GET', `/api/streak?userId=${encodeURIComponent(userA)}`);
      assert.strictEqual(httpGetRes.status, 200);
      assert.strictEqual(httpGetRes.data.success, true);
      assert.strictEqual(httpGetRes.data.streak.current, 1);
      assert.strictEqual(httpGetRes.data.streak.longest, 3);
      assert.strictEqual(httpGetRes.data.streak.coins, 4);
      assert.strictEqual(httpGetRes.data.coins.balance, 4);

      // POST test with invalid date -> 400
      const badReq = await makeHttpRequest(TEST_SERVER_PORT, 'POST', '/api/streak', {
        userId: userA,
        loginDate: 'invalid-date'
      });
      assert.strictEqual(badReq.status, 400);

      // Missing userId -> 400
      const missingUser = await makeHttpRequest(TEST_SERVER_PORT, 'GET', '/api/streak');
      assert.strictEqual(missingUser.status, 400);

      console.log('✅ Test 10 Passed: Live HTTP server routes /api/streak accurately with validation');
    }

    console.log('\n=================================================================');
    console.log(' 🎉 ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('=================================================================');
  } finally {
    if (serverStarted) {
      await new Promise(resolve => devServer.close(resolve));
    }
    // Cleanup test records from MongoDB Atlas
    await db.collection('login_streaks').deleteMany({
      userId: { $in: [userA, userB] }
    });
    console.log('🧹 Cleaned up test records from MongoDB Atlas.');
  }
}

runAllTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
