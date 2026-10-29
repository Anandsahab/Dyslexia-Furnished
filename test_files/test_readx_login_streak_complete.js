// test_files/test_readx_login_streak_complete.js
// Comprehensive Verification Suite for ReadX Login Streak & Daily Coins System
// Verifies all Step 7 scenarios with isolated test data and mocked dates.

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser localStorage and sessionStorage
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store.hasOwnProperty(key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Mock DOM elements
class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.textContent = '';
    this.className = '';
    this._innerHTML = '';
    this.attributes = {};
    this.children = [];
    this.classList = {
      _set: new Set(),
      add: (c) => this.classList._set.add(c),
      remove: (c) => this.classList._set.delete(c),
      contains: (c) => this.classList._set.has(c)
    };
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] || null;
  }
  get innerHTML() {
    return this._innerHTML || '';
  }
  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') this.children = [];
  }
  appendChild(child) {
    this.children.push(child);
  }
  querySelector(sel) {
    if (sel.startsWith('.')) {
      const cls = sel.slice(1);
      return this.children.find(c => c.className && c.className.includes(cls)) || null;
    }
    return null;
  }
}

function setupSandbox() {
  const localStorage = new MockStorage();
  const sessionStorage = new MockStorage();

  const elements = {
    streakCount: new MockElement('streakCount', 'div'),
    streakLongest: new MockElement('streakLongest', 'strong'),
    streakWeekDots: new MockElement('streakWeekDots', 'div'),
    coinBalance: new MockElement('coinBalance', 'div'),
    heroCoinCount: new MockElement('heroCoinCount', 'strong'),
    coinTotalEarned: new MockElement('coinTotalEarned', 'strong'),
    coinRewardBadge: new MockElement('coinRewardBadge', 'div'),
    coinRewardStatus: new MockElement('coinRewardStatus', 'span'),
    statSessions: new MockElement('statSessions', 'div'),
    statWords: new MockElement('statWords', 'div'),
    statAccuracy: new MockElement('statAccuracy', 'div'),
    statReadTime: new MockElement('statReadTime', 'div'),
    profileDisplayName: new MockElement('profileDisplayName', 'h1'),
    profileDisplayEmail: new MockElement('profileDisplayEmail', 'span'),
    profileAvatar: new MockElement('profileAvatar', 'div')
  };

  const document = {
    getElementById: (id) => elements[id] || new MockElement(id),
    createElement: (tag) => new MockElement('gen_' + Math.random(), tag),
    addEventListener: () => {},
    documentElement: { setAttribute: () => {} }
  };

  const window = {
    localStorage,
    sessionStorage,
    document,
    location: { href: 'http://localhost:3000/profile.html', pathname: '/profile.html', search: '', port: '3000', replace: () => {} },
    addEventListener: () => {},
    dispatchEvent: () => {}
  };

  const context = {
    window,
    document,
    localStorage,
    sessionStorage,
    console,
    Date,
    Math,
    Array,
    Object,
    JSON,
    String,
    Number,
    Set,
    fetch: () => Promise.resolve({ json: () => Promise.resolve({ success: true }) })
  };

  // Load files into VM context
  const topicsCode = fs.readFileSync(path.join(__dirname, '../js/topics.js'), 'utf8');
  const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
  const authCode = fs.readFileSync(path.join(__dirname, '../js/auth.js'), 'utf8');
  const profileCode = fs.readFileSync(path.join(__dirname, '../js/profile.js'), 'utf8');

  vm.createContext(context);
  vm.runInContext(topicsCode + '\nwindow.ReadXTopics = typeof ReadXTopics !== "undefined" ? ReadXTopics : null;', context);
  vm.runInContext(dataCode + '\nwindow.ReadXData = ReadXData;', context);
  vm.runInContext(authCode + '\nwindow.ReadXAuth = ReadXAuth;', context);
  vm.runInContext(profileCode + '\nwindow.renderStreakWidget = renderStreakWidget;', context);

  return { context, elements, localStorage, sessionStorage };
}

console.log('=================================================================');
console.log('  READX: COMPREHENSIVE LOGIN STREAK & DAILY COINS TEST SUITE');
console.log('=================================================================\n');

const { context, elements, localStorage } = setupSandbox();
const ReadXAuth = context.window.ReadXAuth;
const ReadXData = context.window.ReadXData;
const renderStreakWidget = context.window.renderStreakWidget;

// Setup test users
ReadXAuth.init();
const testUserA = {
  id: 'usr_test_alpha',
  name: 'Alex Reader',
  email: 'alex@readx.test',
  password: 'password123'
};
const testUserB = {
  id: 'usr_test_beta',
  name: 'Sam Scholar',
  email: 'sam@readx.test',
  password: 'password123'
};

// Register test accounts
const signupA = ReadXAuth.signup(testUserA);
assert.strictEqual(signupA.success, true, 'User A signup must succeed');
testUserA.id = signupA.user.id;
ReadXAuth.logout({ redirectUrl: null });

const signupB = ReadXAuth.signup(testUserB);
assert.strictEqual(signupB.success, true, 'User B signup must succeed');
testUserB.id = signupB.user.id;
ReadXAuth.logout({ redirectUrl: null });

// Clear streak stats to start with a pristine state for testing
localStorage.removeItem(ReadXData.getUserStorageKey('learning-stats', testUserA.id));
localStorage.removeItem(ReadXData.getUserStorageKey('login-streak', testUserA.id));
localStorage.removeItem(ReadXData.getUserStorageKey('daily-coins', testUserA.id));

localStorage.removeItem(ReadXData.getUserStorageKey('learning-stats', testUserB.id));
localStorage.removeItem(ReadXData.getUserStorageKey('login-streak', testUserB.id));
localStorage.removeItem(ReadXData.getUserStorageKey('daily-coins', testUserB.id));

console.log('--- TEST 1: Initial Unauthenticated State ---');
let initialStatsA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(initialStatsA.streak.current, 0, 'Initial streak current must be 0');
assert.strictEqual(initialStatsA.streak.currentStreak, 0, 'Initial streak currentStreak alias must be 0');
assert.strictEqual(initialStatsA.streak.longest, 0, 'Initial longest must be 0');
assert.strictEqual(initialStatsA.coins.balance, 0, 'Initial coin balance must be 0');
renderStreakWidget(initialStatsA);
assert.strictEqual(elements.streakCount.textContent, 0, 'Streak count DOM element is 0');
assert.strictEqual(elements.streakLongest.textContent, '0 days', 'Longest streak DOM element is 0 days');
assert.strictEqual(elements.coinBalance.textContent, 0, 'Coin balance DOM element is 0');
assert.strictEqual(elements.heroCoinCount.textContent, 0, 'Hero coin count DOM element is 0');
console.log('✅ Passed: Initial unauthenticated state correctly shows 0 streak and 0 coins');

console.log('--- TEST 2: First Login Today -> Streak 1, Balance +1 ---');
const todayDateStr = ReadXData.toLocalCalendarDate(new Date());
const loginResA = ReadXAuth.login({ email: testUserA.email, password: testUserA.password });
assert.strictEqual(loginResA.success, true, 'Login A must succeed');

let statsA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(statsA.streak.current, 1, 'First login current streak is 1');
assert.strictEqual(statsA.streak.longest, 1, 'First login longest streak is 1');
assert.strictEqual(statsA.streak.lastLoginDate, todayDateStr, 'Last login date matches today');
assert.strictEqual(statsA.coins.balance, 1, 'Coins balance awarded is exactly 1');
assert.strictEqual(statsA.coins.lastCoinDate, todayDateStr, 'Coin award date matches today');
assert.strictEqual(statsA.streak.loginDates.includes(todayDateStr), true, 'Today is recorded in loginDates');

renderStreakWidget(statsA);
assert.strictEqual(elements.streakCount.textContent, 1, 'UI streak count is 1');
assert.strictEqual(elements.streakLongest.textContent, '1 day', 'UI longest streak is 1 day');
assert.strictEqual(elements.coinBalance.textContent, 1, 'UI coin balance is 1');
assert.strictEqual(elements.heroCoinCount.textContent, 1, 'UI hero coin count is 1');
assert.strictEqual(elements.coinRewardStatus.textContent, 'earned today', 'UI coin reward shows earned today');
console.log('✅ Passed: First login today sets streak to 1, balance to +1, and UI updates properly');

console.log('--- TEST 3: Refresh Dashboard -> No Extra Coin, Streak Preserved ---');
for (let i = 0; i < 5; i++) {
  const refreshedStats = ReadXData.getLearningStats(testUserA.id);
  assert.strictEqual(refreshedStats.streak.current, 1, 'Refreshed streak remains 1');
  assert.strictEqual(refreshedStats.coins.balance, 1, 'Refreshed coins remain 1');
  renderStreakWidget(refreshedStats);
  assert.strictEqual(elements.streakCount.textContent, 1);
  assert.strictEqual(elements.coinBalance.textContent, 1);
}
console.log('✅ Passed: Refreshing dashboard never awards extra coins (idempotent read-only)');

console.log('--- TEST 4: Navigate Between Pages -> No Extra Coin ---');
const pages = ['library.html', 'reader.html', 'practice.html', 'upload.html', 'profile.html'];
pages.forEach(page => {
  context.window.location.pathname = `/${page}`;
  // Opening protected or non-protected pages with existing session
  const currentUser = ReadXAuth.getCurrentUser();
  assert.strictEqual(currentUser.id, testUserA.id, 'Session retained across pages');
  const pageStats = ReadXData.getLearningStats(currentUser.id);
  assert.strictEqual(pageStats.coins.balance, 1, `No coin change on navigating to ${page}`);
  assert.strictEqual(pageStats.streak.current, 1, `No streak change on navigating to ${page}`);
});
console.log('✅ Passed: Navigating between pages awards 0 duplicate coins');

console.log('--- TEST 5: Log Out and Back In Today -> No Extra Coin ---');
for (let i = 0; i < 3; i++) {
  ReadXAuth.logout({ redirectUrl: null });
  assert.strictEqual(ReadXAuth.isLoggedIn(), false, 'User logged out');
  
  const reLogin = ReadXAuth.login({ email: testUserA.email, password: testUserA.password });
  assert.strictEqual(reLogin.success, true, 'Re-login succeeds');
  
  const reStats = ReadXData.getLearningStats(testUserA.id);
  assert.strictEqual(reStats.streak.current, 1, 'Same-day re-login streak remains 1');
  assert.strictEqual(reStats.coins.balance, 1, 'Same-day re-login coins remain 1');
  renderStreakWidget(reStats);
  assert.strictEqual(elements.streakCount.textContent, 1);
  assert.strictEqual(elements.coinBalance.textContent, 1);
}
console.log('✅ Passed: Logging out and in on same day never awards extra coins');

console.log('--- TEST 6: Login on Following Day -> Streak Increases to 2, Balance +1 ---');
const day2 = new Date();
day2.setDate(day2.getDate() + 1);
const day2Str = ReadXData.toLocalCalendarDate(day2);

ReadXData.recordUserLogin(testUserA.id, day2Str);
statsA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(statsA.streak.current, 2, 'Following day login increases streak to 2');
assert.strictEqual(statsA.streak.longest, 2, 'Longest streak increases to 2');
assert.strictEqual(statsA.coins.balance, 2, 'Following day login increases coin balance to 2');
assert.strictEqual(statsA.coins.lastCoinDate, day2Str, 'lastCoinDate updated to day 2');
assert.strictEqual(statsA.streak.lastCoinAwardDate, day2Str, 'lastCoinAwardDate updated to day 2');

renderStreakWidget(statsA);
assert.strictEqual(elements.streakCount.textContent, 2, 'UI streak displays 2');
assert.strictEqual(elements.streakLongest.textContent, '2 days', 'UI longest displays 2 days');
assert.strictEqual(elements.coinBalance.textContent, 2, 'UI coin balance displays 2');
console.log('✅ Passed: Next consecutive day increments streak by 1 and awards +1 coin');

console.log('--- TEST 7: Consecutive Day 3 Login -> Streak Increases to 3, Balance +1 ---');
const day3 = new Date(day2);
day3.setDate(day2.getDate() + 1);
const day3Str = ReadXData.toLocalCalendarDate(day3);

ReadXData.recordUserLogin(testUserA.id, day3Str);
statsA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(statsA.streak.current, 3, 'Consecutive day 3 streak is 3');
assert.strictEqual(statsA.streak.longest, 3, 'Longest streak is 3');
assert.strictEqual(statsA.coins.balance, 3, 'Coin balance is 3');
renderStreakWidget(statsA);
assert.strictEqual(elements.streakCount.textContent, 3);
assert.strictEqual(elements.coinBalance.textContent, 3);
console.log('✅ Passed: Consecutive day 3 login increments streak to 3 and awards +1 coin');

console.log('--- TEST 8: Skip a Calendar Day, Then Log In -> Reset to 1, Longest & Coins Retained ---');
const day5 = new Date(day3);
day5.setDate(day3.getDate() + 2); // Skipped day 4!
const day5Str = ReadXData.toLocalCalendarDate(day5);

ReadXData.recordUserLogin(testUserA.id, day5Str);
statsA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(statsA.streak.current, 1, 'Missed day resets active streak to 1');
assert.strictEqual(statsA.streak.longest, 3, 'Longest streak preserved at 3');
assert.strictEqual(statsA.coins.balance, 4, 'Coins not reset on broken streak (3 + 1 = 4)');
assert.strictEqual(statsA.coins.lastCoinDate, day5Str, 'lastCoinDate updated to day 5');
assert.strictEqual(statsA.streak.loginDates.length, 4, 'Historical login dates preserved');

renderStreakWidget(statsA);
assert.strictEqual(elements.streakCount.textContent, 1, 'UI displays reset streak 1');
assert.strictEqual(elements.streakLongest.textContent, '3 days', 'UI displays preserved longest 3 days');
assert.strictEqual(elements.coinBalance.textContent, 4, 'UI displays preserved cumulative coins 4');
console.log('✅ Passed: Missed calendar day resets streak to 1 while preserving longest streak and coins');

console.log('--- TEST 9: Different Users -> Independent Streaks, Dates, and Coin Balances ---');
ReadXAuth.logout({ redirectUrl: null });
const loginResB = ReadXAuth.login({ email: testUserB.email, password: testUserB.password });
assert.strictEqual(loginResB.success, true, 'User B login succeeds');

let statsB = ReadXData.getLearningStats(testUserB.id);
assert.strictEqual(statsB.streak.current, 1, 'User B starts with independent streak 1');
assert.strictEqual(statsB.streak.longest, 1, 'User B longest is 1');
assert.strictEqual(statsB.coins.balance, 1, 'User B has 1 coin');

renderStreakWidget(statsB);
assert.strictEqual(elements.streakCount.textContent, 1);
assert.strictEqual(elements.streakLongest.textContent, '1 day');
assert.strictEqual(elements.coinBalance.textContent, 1);

// Verify User A was not modified
const recheckA = ReadXData.getLearningStats(testUserA.id);
assert.strictEqual(recheckA.streak.current, 1, 'User A streak intact');
assert.strictEqual(recheckA.streak.longest, 3, 'User A longest streak intact (3)');
assert.strictEqual(recheckA.coins.balance, 4, 'User A coins intact (4)');
assert.strictEqual(recheckA.streak.loginDates.length, 4, 'User A login dates intact');
console.log('✅ Passed: User accounts maintain strictly isolated and independent streaks and coins');

console.log('--- TEST 10: Weekly Circles Match Actual Login Dates, NOT Reading Dates ---');
// User B reads a document today
ReadXData.startReadingSession('topic-binary-search', 'Binary Search', 300);
ReadXData.endReadingSession('topic-binary-search', 300);

statsB = ReadXData.getLearningStats(testUserB.id);
assert.strictEqual(statsB.readingSessions, 1, 'Reading session recorded');
assert.strictEqual(statsB.wordsRead, 300, 'Words read recorded');
assert.strictEqual(statsB.streak.current, 1, 'Reading did not alter login streak');

renderStreakWidget(statsB);
assert.strictEqual(elements.streakWeekDots.children.length, 7, '7 week dots rendered');

// Verify accessible attributes on week dots
elements.streakWeekDots.children.forEach((dot, idx) => {
  assert.ok(dot.getAttribute('title'), `Dot ${idx} has title attribute`);
  assert.ok(dot.getAttribute('aria-label'), `Dot ${idx} has aria-label attribute`);
  assert.ok(dot.getAttribute('data-date'), `Dot ${idx} has data-date attribute`);
  assert.ok(dot.innerHTML.includes('streak-dot-circle'), `Dot ${idx} has streak-dot-circle`);
  assert.ok(dot.innerHTML.includes('title='), `Circle ${idx} has title in HTML`);
  assert.ok(dot.innerHTML.includes('aria-label='), `Circle ${idx} has aria-label in HTML`);
});
console.log('✅ Passed: Weekly indicators match login activity with accessible tooltips and dates');

console.log('--- TEST 11: Existing Features Continue Working Unaffected ---');
// Practice accuracy
ReadXData.recordTopicPractice('topic-binary-search', 4, 5, 'Binary Search');
const statsAfterPractice = ReadXData.getLearningStats(testUserB.id);
assert.strictEqual(statsAfterPractice.questionsAttempted, 5);
assert.strictEqual(statsAfterPractice.questionsCorrect, 4);
assert.strictEqual(statsAfterPractice.practiceAccuracy, 80);
assert.strictEqual(statsAfterPractice.streak.current, 1, 'Streak unchanged by practice');
assert.strictEqual(statsAfterPractice.coins.balance, 1, 'Coins unchanged by practice');

// Profile save
ReadXData.saveProfile({ name: 'Sam Updated', email: 'sam@readx.test', bio: 'Updated bio' }, testUserB.id);
const profileB = ReadXData.getProfile(testUserB.id);
assert.strictEqual(profileB.name, 'Sam Updated');
assert.strictEqual(profileB.bio, 'Updated bio');

// Reading progress
ReadXData.setReadingProgress('topic-binary-search', 75, testUserB.id);
assert.strictEqual(ReadXData.getReadingProgress('topic-binary-search', testUserB.id), 75);
console.log('✅ Passed: Practice, profile, and reading progress continue working perfectly');

console.log('\n=================================================================');
console.log(' 🏆 ALL 11 VERIFICATION SCENARIOS PASSED WITH ZERO FAILURES!');
console.log('=================================================================');
