// api/streak.js
// Vercel Serverless Function for ReadX Login Streak Persistence with MongoDB Atlas
// Supports GET, POST, DELETE operations for user login streaks.

const { getDb, sanitizeError } = require('./db.js');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }
  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

/**
 * Calculates calendar day difference between two YYYY-MM-DD date strings.
 * Uses Date.UTC to prevent daylight savings anomalies.
 */
function getDaysDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return null;
  const s1 = String(dateStr1).split('T')[0].trim();
  const s2 = String(dateStr2).split('T')[0].trim();
  const p1 = s1.split('-').map(Number);
  const p2 = s2.split('-').map(Number);
  if (p1.length !== 3 || p2.length !== 3) return null;
  if (isNaN(p1[0]) || isNaN(p1[1]) || isNaN(p1[2])) return null;
  if (isNaN(p2[0]) || isNaN(p2[1]) || isNaN(p2[2])) return null;
  const utc1 = Date.UTC(p1[0], p1[1] - 1, p1[2]);
  const utc2 = Date.UTC(p2[0], p2[1] - 1, p2[2]);
  return Math.round((utc2 - utc1) / (24 * 60 * 60 * 1000));
}

function getLocalCalendarDate(d = new Date()) {
  let dateObj;
  if (d instanceof Date) {
    dateObj = d;
  } else if (typeof d === 'string' || typeof d === 'number') {
    dateObj = new Date(d);
  } else {
    dateObj = new Date();
  }
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates consecutive login streak and daily coins update based on login activity.
 * Rule: exactly +1 coin per calendar day on first successful login of that day.
 */
function calculateStreakUpdate(existingDoc, todayStr) {
  const current = existingDoc && (typeof existingDoc.currentStreak === 'number'
    ? existingDoc.currentStreak
    : (typeof existingDoc.current === 'number' ? existingDoc.current : 0)) || 0;
  const longest = existingDoc && (typeof existingDoc.longestStreak === 'number'
    ? existingDoc.longestStreak
    : (typeof existingDoc.longest === 'number' ? existingDoc.longest : 0)) || 0;
  const lastLogin = (existingDoc && existingDoc.lastLoginDate) || null;
  let dates = Array.isArray(existingDoc && existingDoc.loginDates) ? [...existingDoc.loginDates] : [];

  const existingCoins = existingDoc && (typeof existingDoc.coins === 'number'
    ? existingDoc.coins
    : (typeof existingDoc.coinsBalance === 'number' ? existingDoc.coinsBalance : 0)) || 0;
  const lastCoinDate = (existingDoc && (existingDoc.lastCoinDate || existingDoc.lastCoinAwardDate)) || null;

  // Daily Coins Rule: Award exactly +1 coin per user per calendar day on first successful login of that day
  let newCoins = existingCoins;
  let coinAwardedToday = false;
  let newLastCoinDate = lastCoinDate;

  if (lastCoinDate !== todayStr) {
    newCoins = existingCoins + 1;
    newLastCoinDate = todayStr;
    coinAwardedToday = true;
  }

  const buildDoc = (curr, long, lastLog, updatedDates) => ({
    current: curr,
    currentStreak: curr,
    longest: long,
    longestStreak: long,
    lastLoginDate: lastLog,
    loginDates: updatedDates,
    coins: newCoins,
    coinsBalance: newCoins,
    lastCoinDate: newLastCoinDate,
    lastCoinAwardDate: newLastCoinDate,
    coinAwardedToday
  });

  if (!lastLogin || dates.length === 0 || current === 0) {
    // First reliably recorded login starts streak at 1
    const updatedDates = Array.from(new Set(dates.concat(todayStr))).sort();
    return buildDoc(1, Math.max(longest, 1), todayStr, updatedDates);
  }

  const diff = getDaysDifference(lastLogin, todayStr);

  if (diff === 0) {
    // Multiple logins on the same calendar day: idempotent (does not increase streak or coins)
    const updatedDates = Array.from(new Set(dates.concat(todayStr))).sort();
    return buildDoc(current, longest, todayStr, updatedDates);
  }

  if (diff === 1) {
    // Next consecutive calendar day: increment streak by 1
    const newCurrent = current + 1;
    const newLongest = Math.max(longest, newCurrent);
    const updatedDates = Array.from(new Set(dates.concat(todayStr))).sort();
    return buildDoc(newCurrent, newLongest, todayStr, updatedDates);
  }

  if (diff > 1) {
    // Missed one or more calendar days: reset active streak to 1 while preserving longest
    const newCurrent = 1;
    const newLongest = Math.max(longest, 1);
    const updatedDates = Array.from(new Set(dates.concat(todayStr))).sort();
    return buildDoc(newCurrent, newLongest, todayStr, updatedDates);
  }

  // diff < 0 (loginDate earlier than last recorded login)
  const updatedDates = Array.from(new Set(dates.concat(todayStr))).sort();
  return buildDoc(current, longest, lastLogin, updatedDates);
}

/**
 * Format streak and coins object for API response
 */
function formatStreak(userId, doc, dateStr) {
  const checkDate = dateStr || getLocalCalendarDate();
  if (!doc) {
    return {
      userId,
      current: 0,
      currentStreak: 0,
      longest: 0,
      longestStreak: 0,
      lastLoginDate: null,
      loginDates: [],
      coins: 0,
      coinsBalance: 0,
      lastCoinDate: null,
      lastCoinAwardDate: null,
      todayRewardEarned: false
    };
  }
  const coins = typeof doc.coins === 'number'
    ? doc.coins
    : (typeof doc.coinsBalance === 'number' ? doc.coinsBalance : 0);
  const lastCoinDate = doc.lastCoinDate || doc.lastCoinAwardDate || null;
  const current = typeof doc.currentStreak === 'number'
    ? doc.currentStreak
    : (typeof doc.current === 'number' ? doc.current : 0);
  const longest = typeof doc.longestStreak === 'number'
    ? doc.longestStreak
    : (typeof doc.longest === 'number' ? doc.longest : 0);

  return {
    userId: doc.userId || userId,
    current,
    currentStreak: current,
    longest,
    longestStreak: longest,
    lastLoginDate: doc.lastLoginDate || null,
    loginDates: Array.isArray(doc.loginDates) ? doc.loginDates : [],
    coins,
    coinsBalance: coins,
    lastCoinDate,
    lastCoinAwardDate: lastCoinDate,
    todayRewardEarned: !!lastCoinDate && lastCoinDate === checkDate
  };
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { success: true });
  }

  try {
    const db = await getDb();
    const collection = db.collection('login_streaks');

    // Parse query params
    const query = req.query || {};
    // Parse body if string
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    // 2. GET — Retrieve streak & coins by userId (read-only: never awards coins or resets streak)
    if (req.method === 'GET') {
      const userId = String(query.userId || query.id || '').trim();

      if (!userId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required query parameter: "userId" is required.'
        });
      }

      const doc = await collection.findOne({ userId });
      const formatted = formatStreak(userId, doc, query.date);
      return sendJson(res, 200, {
        success: true,
        streak: formatted,
        coins: {
          balance: formatted.coins,
          lastCoinDate: formatted.lastCoinDate,
          awardedToday: formatted.todayRewardEarned
        }
      });
    }

    // 3. POST — Record genuine successful login, update streak, and award daily coins (+1 per calendar day)
    if (req.method === 'POST') {
      const userId = String(body.userId || body.id || query.userId || '').trim();
      const loginDate = String(body.loginDate || body.date || '').trim() || getLocalCalendarDate();

      if (!userId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required field: "userId" is required to record login streak.'
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(loginDate)) {
        return sendJson(res, 400, {
          success: false,
          error: 'Invalid loginDate format. Expected "YYYY-MM-DD".'
        });
      }

      const existingDoc = await collection.findOne({ userId });
      const updated = calculateStreakUpdate(existingDoc, loginDate);

      // Concurrency & idempotency safety:
      // If awarding today's coin, ensure a concurrent request hasn't already awarded it
      if (updated.coinAwardedToday) {
        const updateResult = await collection.updateOne(
          {
            userId,
            lastCoinDate: { $ne: loginDate }
          },
          {
            $set: {
              userId,
              currentStreak: updated.current,
              longestStreak: updated.longest,
              lastLoginDate: updated.lastLoginDate,
              loginDates: updated.loginDates,
              coins: updated.coins,
              lastCoinDate: updated.lastCoinDate,
              updatedAt: Date.now()
            }
          },
          { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
          // Check if doc didn't exist yet, or another concurrent request beat us to it
          const freshDoc = await collection.findOne({ userId });
          if (freshDoc) {
            // Already updated concurrently! Sync with the fresh values
            updated.coins = typeof freshDoc.coins === 'number' ? freshDoc.coins : updated.coins;
            updated.lastCoinDate = freshDoc.lastCoinDate;
            updated.current = freshDoc.currentStreak || updated.current;
            updated.longest = freshDoc.longestStreak || updated.longest;
            updated.lastLoginDate = freshDoc.lastLoginDate || updated.lastLoginDate;
            updated.loginDates = freshDoc.loginDates || updated.loginDates;
            updated.coinAwardedToday = false;
          } else {
            // Document does not exist yet: insert fresh record
            await collection.updateOne(
              { userId },
              {
                $setOnInsert: {
                  userId,
                  currentStreak: updated.current,
                  longestStreak: updated.longest,
                  lastLoginDate: updated.lastLoginDate,
                  loginDates: updated.loginDates,
                  coins: updated.coins,
                  lastCoinDate: updated.lastCoinDate,
                  updatedAt: Date.now()
                }
              },
              { upsert: true }
            );
          }
        }
      } else {
        // Same-day idempotent update: coin already awarded for today
        await collection.updateOne(
          { userId },
          {
            $set: {
              userId,
              currentStreak: updated.current,
              longestStreak: updated.longest,
              lastLoginDate: updated.lastLoginDate,
              loginDates: updated.loginDates,
              coins: updated.coins,
              lastCoinDate: updated.lastCoinDate,
              updatedAt: Date.now()
            }
          },
          { upsert: true }
        );
      }

      return sendJson(res, 200, {
        success: true,
        streak: {
          userId,
          current: updated.current,
          currentStreak: updated.current,
          longest: updated.longest,
          longestStreak: updated.longest,
          lastLoginDate: updated.lastLoginDate,
          loginDates: updated.loginDates,
          coins: updated.coins,
          coinsBalance: updated.coins,
          lastCoinDate: updated.lastCoinDate,
          lastCoinAwardDate: updated.lastCoinDate,
          coinAwardedToday: updated.coinAwardedToday
        },
        coins: {
          balance: updated.coins,
          coinsBalance: updated.coins,
          lastCoinDate: updated.lastCoinDate,
          lastCoinAwardDate: updated.lastCoinDate,
          awardedToday: updated.coinAwardedToday
        }
      });
    }

    // 4. DELETE — Reset or remove streak (for testing and isolation)
    if (req.method === 'DELETE') {
      const userId = String(query.userId || query.id || body.userId || body.id || '').trim();

      if (!userId) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required parameter: "userId" is required.'
        });
      }

      const result = await collection.deleteOne({ userId });
      return sendJson(res, 200, {
        success: true,
        deletedCount: result.deletedCount
      });
    }

    // 5. Non-supported method
    return sendJson(res, 405, {
      success: false,
      error: `Method ${req.method} not allowed. Supported methods: GET, POST, DELETE, OPTIONS.`
    });

  } catch (err) {
    const safeError = sanitizeError(err);
    console.error('[api/streak error]:', safeError);
    return sendJson(res, 500, {
      success: false,
      error: 'An internal database error occurred while processing the login streak request.'
    });
  }
};

module.exports.calculateStreakUpdate = calculateStreakUpdate;
module.exports.getDaysDifference = getDaysDifference;
module.exports.getLocalCalendarDate = getLocalCalendarDate;
module.exports.formatStreak = formatStreak;
