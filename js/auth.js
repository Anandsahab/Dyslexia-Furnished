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
        joined: currentUser.joined || '2026-01-15',
        bio: currentUser.bio || 'ReadX learner'
      });
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
    if (!user || !user.name) return 'R';
    return user.name.trim().charAt(0).toUpperCase();
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
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const target = `${redirectUrl}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = target;
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
  }
};

// Initialize default data on load
ReadXAuth.init();
