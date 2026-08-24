// js/auth.js — ReadX Front-end Demo Authentication System
// Pure Vanilla JavaScript demo authentication using localStorage / sessionStorage.
// Structured cleanly so that real backend API endpoints (e.g. REST, Supabase, Firebase)
// can easily replace the localStorage layer in the future.

const ReadXAuth = {
  STORAGE_KEYS: {
    USERS: 'readx-users',
    SESSION: 'readx-session',
    REMEMBER: 'readx-remember-me'
  },

  // Seed default demo accounts if not already initialized
  init() {
    const existingUsers = this.getUsers();
    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: 'usr_demo_1',
          name: 'Chaitanya Anand',
          email: 'chaitanya@readx.app',
          password: 'password123',
          joined: '2026-01-15',
          bio: 'Computer Science student · ReadX learner'
        },
        {
          id: 'usr_demo_2',
          name: 'Tanisha Awla',
          email: 'tanisha@readx.app',
          password: 'password123',
          joined: '2026-02-10',
          bio: 'Cognitive Science researcher · Assistive typography advocate'
        }
      ];
      try {
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      } catch (err) {
        console.warn('ReadXAuth: Unable to seed default users into localStorage', err);
      }
    }

    // Sync session to ReadXData profile if logged in
    const currentUser = this.getCurrentUser();
    if (currentUser && typeof ReadXData !== 'undefined') {
      ReadXData.saveProfile({
        name: currentUser.name,
        email: currentUser.email,
        joined: currentUser.joined || new Date().toISOString().split('T')[0],
        bio: currentUser.bio || 'ReadX Learner'
      }, currentUser.id);
    }
  },

  // Retrieve all registered users
  getUsers() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('ReadXAuth: Error parsing users from localStorage', e);
      return [];
    }
  },

  // Find a user by email (case-insensitive)
  getUserByEmail(email) {
    if (!email) return null;
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  // Get active session user
  getCurrentUser() {
    try {
      // First check localStorage (for remembered session), then sessionStorage
      const sessionLocal = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (sessionLocal) return JSON.parse(sessionLocal);

      const sessionStore = sessionStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (sessionStore) return JSON.parse(sessionStore);

      return null;
    } catch (e) {
      console.error('ReadXAuth: Error retrieving current session', e);
      return null;
    }
  },

  // Check if current user is authenticated
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  // Get user avatar initial
  getAvatarInitial() {
    const user = this.getCurrentUser();
    if (!user) return 'R';
    const nameStr = (user.name || user.email || '').trim();
    if (!nameStr) return 'R';
    return nameStr.charAt(0).toUpperCase();
  },

  // Register a new user
  signup({ name, email, password }) {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = password || '';

    // Validation checks
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      joined: new Date().toISOString().split('T')[0],
      bio: 'ReadX learner'
    };

    users.push(newUser);
    try {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (err) {
      return { success: false, error: 'Storage quota exceeded. Could not save user account.' };
    }

    // Automatically create session for seamless onboarding
    this.createSession(newUser, true);

    return { success: true, user: newUser };
  },

  // Log in with credentials
  login({ email, password, rememberMe = true }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = password || '';

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both your email and password.' };
    }

    const user = this.getUserByEmail(cleanEmail);
    if (!user || user.password !== cleanPass) {
      return { success: false, error: 'Incorrect email or password. Please check your credentials.' };
    }

    this.createSession(user, rememberMe);
    return { success: true, user };
  },

  // Establish user session
  createSession(user, rememberMe = true) {
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      joined: user.joined,
      bio: user.bio || 'ReadX learner'
    };

    try {
      if (rememberMe) {
        localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        localStorage.setItem(this.STORAGE_KEYS.REMEMBER, 'true');
        sessionStorage.removeItem(this.STORAGE_KEYS.SESSION);
      } else {
        sessionStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        localStorage.removeItem(this.STORAGE_KEYS.REMEMBER);
      }

      // Keep ReadXData synchronized
      if (typeof ReadXData !== 'undefined') {
        ReadXData.saveProfile(sessionData);
      }
    } catch (e) {
      console.error('ReadXAuth: Error setting session', e);
    }
  },

  // Update profile for current active user
  updateCurrentUserProfile({ name, email, bio }) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());

    const updatedUser = {
      ...currentUser,
      name: (name || currentUser.name).trim(),
      email: (email || currentUser.email).trim().toLowerCase(),
      bio: bio !== undefined ? bio : currentUser.bio
    };

    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio
      };
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    const isRemembered = localStorage.getItem(this.STORAGE_KEYS.REMEMBER) === 'true';
    this.createSession(updatedUser, isRemembered);

    return updatedUser;
  },

  // Log out current session
  logout({ redirectUrl = 'index.html' } = {}) {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.SESSION);
      localStorage.removeItem(this.STORAGE_KEYS.REMEMBER);
      sessionStorage.removeItem(this.STORAGE_KEYS.SESSION);
    } catch (e) {
      console.error('ReadXAuth: Error logging out', e);
    }

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  // Guard protected pages
  protectPage({ redirectUrl = 'login.html' } = {}) {
    if (!this.isLoggedIn()) {
      const page = window.location.pathname.split('/').pop() || 'index.html';
      const search = window.location.search || '';
      const currentPath = page + search;
      const target = `${redirectUrl}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.replace(target);
      return false;
    }
    return true;
  },

  // Redirect authenticated user if visiting login / signup
  redirectIfLoggedIn({ defaultUrl = 'index.html' } = {}) {
    if (this.isLoggedIn()) {
      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get('redirect') || defaultUrl;
      // Sanitize target to prevent open redirect
      const safeTarget = redirectTarget.startsWith('/') || !redirectTarget.includes('://')
        ? redirectTarget
        : defaultUrl;
      window.location.href = safeTarget;
      return true;
    }
    return false;
  },

  // ==========================================
  // CAPTCHA-BASED PASSWORD RESET FLOW
  // ==========================================

  // Step 1: Validate Email Address
  verifyResetEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const user = this.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    return {
      success: true,
      email: cleanEmail,
      name: user.name
    };
  },

  // Step 2: Generate dynamic CAPTCHA challenge
  generateCaptchaChallenge() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const captchaData = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };

    try {
      sessionStorage.setItem('readx-captcha-challenge', JSON.stringify(captchaData));
    } catch (e) {}

    return {
      captchaCode: code
    };
  },

  // Step 2b: Verify CAPTCHA Code
  verifyCaptchaChallenge(inputCode, email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanInput = String(inputCode || '').trim().toUpperCase();

    if (!cleanInput) {
      return { success: false, error: 'Please enter the verification code.' };
    }

    let captchaData = null;
    try {
      const raw = sessionStorage.getItem('readx-captcha-challenge');
      if (raw) captchaData = JSON.parse(raw);
    } catch (e) {}

    if (!captchaData) {
      return { success: false, error: 'Verification code expired. Please refresh the code.' };
    }

    if (Date.now() > captchaData.expiresAt) {
      return { success: false, error: 'Verification code expired. Please refresh the code.' };
    }

    if (cleanInput !== captchaData.code.toUpperCase()) {
      return { success: false, error: 'Incorrect verification code. Please try again.' };
    }

    // Invalidate CAPTCHA immediately after successful verification
    try {
      sessionStorage.removeItem('readx-captcha-challenge');
    } catch (e) {}

    // Create verified reset session
    const resetToken = 'rst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    const resetSession = {
      email: cleanEmail,
      resetToken,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    try {
      sessionStorage.setItem('readx-reset-session', JSON.stringify(resetSession));
    } catch (e) {}

    return { success: true, resetToken, email: cleanEmail };
  },

  // Step 3/4: Update Password
  resetPasswordWithVerifiedSession({ email, newPassword, confirmPassword, resetToken }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = newPassword || '';
    const cleanConfirm = confirmPassword || '';

    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (cleanPass !== cleanConfirm) {
      return { success: false, error: 'Passwords do not match. Please re-enter.' };
    }

    let session = null;
    try {
      const raw = sessionStorage.getItem('readx-reset-session');
      if (raw) session = JSON.parse(raw);
    } catch (e) {}

    if (!session || session.email !== cleanEmail) {
      return { success: false, error: 'Reset session is invalid or has expired. Please restart.' };
    }

    if (resetToken && session.resetToken !== resetToken) {
      return { success: false, error: 'Invalid reset authorization token.' };
    }

    if (Date.now() > session.expiresAt) {
      return { success: false, error: 'Reset session timed out. Please restart the reset process.' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      return { success: false, error: 'Account could not be found to update password.' };
    }

    // Update password in users list
    users[userIndex].password = cleanPass;

    try {
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
      sessionStorage.removeItem('readx-reset-session');
    } catch (e) {
      return { success: false, error: 'Storage error while saving updated password.' };
    }

    return { success: true, email: cleanEmail };
  }
};

// Initialize default data on load
ReadXAuth.init();
