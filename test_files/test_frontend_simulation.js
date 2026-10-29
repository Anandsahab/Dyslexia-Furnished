// test_files/test_frontend_simulation.js
// Client-side DOM & Simulation test for Login Streak UI and Auth integration

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock localStorage and sessionStorage
class StorageMock {
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

const localStorage = new StorageMock();
const sessionStorage = new StorageMock();

// Mock DOM elements
class ElementMock {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.textContent = '';
    this.className = '';
    this._innerHTML = '';
    this.attributes = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      }
    };
    this.children = [];
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
}

const elements = {
  streakCount: new ElementMock('streakCount', 'div'),
  streakLongest: new ElementMock('streakLongest', 'strong'),
  streakWeekDots: new ElementMock('streakWeekDots', 'div'),
  coinBalance: new ElementMock('coinBalance', 'div'),
  heroCoinCount: new ElementMock('heroCoinCount', 'strong'),
  coinTotalEarned: new ElementMock('coinTotalEarned', 'strong'),
  coinRewardBadge: new ElementMock('coinRewardBadge', 'div'),
  coinRewardStatus: new ElementMock('coinRewardStatus', 'span'),
  profileDisplayName: new ElementMock('profileDisplayName', 'h1'),
  profileDisplayEmail: new ElementMock('profileDisplayEmail', 'span'),
  profileAvatar: new ElementMock('profileAvatar', 'div')
};

const document = {
  getElementById: (id) => elements[id] || new ElementMock(id),
  createElement: (tag) => new ElementMock('auto_' + Math.random(), tag),
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

global.window = window;
global.document = document;
global.localStorage = localStorage;
global.sessionStorage = sessionStorage;
global.fetch = () => Promise.resolve({ json: () => Promise.resolve({ success: true }) });

// Load data.js, auth.js, profile.js in simulated sandbox
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const authCode = fs.readFileSync(path.join(__dirname, '../js/auth.js'), 'utf8');

const vm = require('vm');
vm.runInThisContext(dataCode + '\nglobal.ReadXData = ReadXData;');
vm.runInThisContext(authCode + '\nglobal.ReadXAuth = ReadXAuth;');

// Extract renderStreakWidget from js/profile.js
const profileCode = fs.readFileSync(path.join(__dirname, '../js/profile.js'), 'utf8');
const renderStreakWidgetMatch = profileCode.match(/function renderStreakWidget\(stats\) \{[\s\S]*?\n\}/);
if (!renderStreakWidgetMatch) {
  throw new Error('Could not find renderStreakWidget in js/profile.js');
}
vm.runInThisContext(renderStreakWidgetMatch[0] + '\nglobal.renderStreakWidget = renderStreakWidget;');

console.log('=================================================================');
console.log('   CLIENT-SIDE UI & AUTH INTEGRATION SIMULATION SUITE');
console.log('=================================================================\n');

// 1. Initial State: Seed demo accounts
ReadXAuth.init();
const users = ReadXAuth.getUsers();
assert.ok(users.length >= 2, 'Default users seeded');

const demo1 = users[0]; // usr_demo_1, chaitanya@readx.app
const demo2 = users[1]; // usr_demo_2, tanisha@readx.app

// Verify user starts with 0 streak before any login
let stats1 = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(stats1.streak.current, 0, 'Initial unauthenticated streak is 0');
renderStreakWidget(stats1);
assert.strictEqual(elements.streakCount.textContent, 0, 'UI streak count is 0 initially');
assert.strictEqual(elements.streakLongest.textContent, '0 days', 'UI longest streak is 0 initially');
console.log('✅ Step 1: Initial unauthenticated state correctly shows 0-day streak');

// 2. First genuine successful login
const loginRes1 = ReadXAuth.login({ email: demo1.email, password: demo1.password });
assert.strictEqual(loginRes1.success, true, 'Login must succeed');
stats1 = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(stats1.streak.current, 1, 'First login starts streak at 1');
assert.strictEqual(stats1.streak.longest, 1, 'First login longest streak is 1');
assert.strictEqual(stats1.coins.balance, 1, 'First login awards 1 coin');
renderStreakWidget(stats1);
assert.strictEqual(elements.streakCount.textContent, 1, 'Reading streak card displays 1');
assert.strictEqual(elements.streakLongest.textContent, '1 day', 'Reading streak card longest displays 1 day');
assert.strictEqual(elements.coinBalance.textContent, 1, 'Coins balance card displays 1');
assert.strictEqual(elements.heroCoinCount.textContent, 1, 'Hero coin count displays 1');
assert.strictEqual(elements.coinRewardStatus.textContent, 'earned today', 'Reward status is earned today');
assert.ok(elements.streakWeekDots.children.length === 7, '7 week dots rendered');
const todayDot = elements.streakWeekDots.children.find(d => d.className.includes('today'));
assert.ok(todayDot, 'Today dot rendered');
assert.ok(todayDot.className.includes('active'), 'Today dot has active class');
console.log('✅ Step 2: First successful login updates streak to 1, awards 1 coin, and displays on Profile');

// 3. Multiple logins on the same day must not inflate streak
for (let i = 0; i < 3; i++) {
  ReadXAuth.logout({ redirectUrl: null });
  const reLogin = ReadXAuth.login({ email: demo1.email, password: demo1.password });
  assert.strictEqual(reLogin.success, true);
  stats1 = ReadXData.getLearningStats(demo1.id);
  assert.strictEqual(stats1.streak.current, 1, 'Same day re-login must remain 1');
  renderStreakWidget(stats1);
  assert.strictEqual(elements.streakCount.textContent, 1, 'UI card still displays 1');
}
console.log('✅ Step 3: Multiple logins on same day do not inflate streak (remains 1)');

// 4. Page refresh / session restore must not increase streak
for (let i = 0; i < 3; i++) {
  // Session restore
  const current = ReadXAuth.getCurrentUser();
  assert.strictEqual(current.id, demo1.id);
  const refreshedStats = ReadXData.getLearningStats(current.id);
  renderStreakWidget(refreshedStats);
  assert.strictEqual(elements.streakCount.textContent, 1, 'Refresh does not increment streak');
}
console.log('✅ Step 4: Page refresh and session restoration do not increase the streak');

// 5. Next consecutive day's login increments streak
const today = new Date();
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1);
const nextDayStr = ReadXData.toLocalCalendarDate(nextDay);

ReadXData.recordUserLogin(demo1.id, nextDayStr);
stats1 = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(stats1.streak.current, 2, 'Next consecutive day increments streak to 2');
assert.strictEqual(stats1.streak.longest, 2, 'Longest streak updates to 2');
renderStreakWidget(stats1);
assert.strictEqual(elements.streakCount.textContent, 2, 'UI card displays 2');
assert.strictEqual(elements.streakLongest.textContent, '2 days');
console.log('✅ Step 5: Next consecutive day login increments streak by 1 (1 -> 2)');

// 6. Day 3 consecutive login increments streak to 3
const day3 = new Date(nextDay);
day3.setDate(nextDay.getDate() + 1);
const day3Str = ReadXData.toLocalCalendarDate(day3);

ReadXData.recordUserLogin(demo1.id, day3Str);
stats1 = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(stats1.streak.current, 3, 'Consecutive day increments to 3');
assert.strictEqual(stats1.streak.longest, 3);
renderStreakWidget(stats1);
assert.strictEqual(elements.streakCount.textContent, 3);
console.log('✅ Step 6: Day 3 consecutive login increments streak to 3');

// 7. Missed day followed by login resets active streak to 1
const missedDayLogin = new Date(day3);
missedDayLogin.setDate(day3.getDate() + 2); // Skipped 1 day!
const missedDayLoginStr = ReadXData.toLocalCalendarDate(missedDayLogin);

ReadXData.recordUserLogin(demo1.id, missedDayLoginStr);
stats1 = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(stats1.streak.current, 1, 'Missed day resets active streak to 1');
assert.strictEqual(stats1.streak.longest, 3, 'Longest streak preserves maximum of 3');
renderStreakWidget(stats1);
assert.strictEqual(elements.streakCount.textContent, 1);
assert.strictEqual(elements.streakLongest.textContent, '3 days');
console.log('✅ Step 7: Missed calendar day resets active streak to 1 on next login (preserves longest = 3)');

// 8. Two different users maintain isolated streaks
ReadXAuth.logout({ redirectUrl: null });
const loginRes2 = ReadXAuth.login({ email: demo2.email, password: demo2.password });
assert.strictEqual(loginRes2.success, true);
const stats2 = ReadXData.getLearningStats(demo2.id);
assert.strictEqual(stats2.streak.current, 1, 'User 2 first login is streak 1');
assert.strictEqual(stats2.streak.longest, 1);
assert.strictEqual(stats2.coins.balance, 1, 'User 2 has 1 coin');
renderStreakWidget(stats2);
assert.strictEqual(elements.streakCount.textContent, 1);
assert.strictEqual(elements.streakLongest.textContent, '1 day');
assert.strictEqual(elements.coinBalance.textContent, 1);

// Verify User 1 is unaffected
const verifyUser1Stats = ReadXData.getLearningStats(demo1.id);
assert.strictEqual(verifyUser1Stats.streak.current, 1);
assert.strictEqual(verifyUser1Stats.streak.longest, 3);
assert.strictEqual(verifyUser1Stats.coins.balance, 4, 'User 1 coin balance unaffected');
console.log('✅ Step 8: User streaks and coins remain isolated and independent across different authenticated user IDs');

// 9. Reading activity does NOT alter streak
ReadXData.startReadingSession('topic-binary-search', 'Binary Search', 500);
ReadXData.endReadingSession('topic-binary-search', 500);
const afterReadingStats = ReadXData.getLearningStats(demo2.id);
assert.strictEqual(afterReadingStats.streak.current, 1, 'Reading activity must NOT modify streak');
console.log('✅ Step 9: Reading activity verified to NOT mutate login streak');

console.log('\n=================================================================');
console.log(' 🎉 ALL FRONTEND SIMULATION TESTS PASSED SUCCESSFULLY!');
console.log('=================================================================');
