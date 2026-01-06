// Auth & Validation Logic

// Constants
const USERS_KEY = 'fintrack_users';
const CURRENT_USER_KEY = 'fintrack_current_user';

// Utilities
function validateEmail(email) {
    // Only accept Gmail addresses
    const gmailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    return gmailPattern.test(String(email).toLowerCase());
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function initializeUserData(userId, name, currency = '$') {
    const defaultData = {
        user: { name: name, currency: currency, joined: new Date().toISOString() },
        transactions: []
    };
    localStorage.setItem(`fintrack_data_${userId}`, JSON.stringify(defaultData));
}

// Language Functions
function changeLanguage(lang) {
    setLanguage(lang);
    applyTranslations();
    if (typeof updateHomepageTranslations === 'function') {
        updateHomepageTranslations();
    }
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = t(key);
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = getCurrentLanguage();
    const selectEl = document.getElementById('languageSelect');
    if (selectEl) {
        selectEl.value = savedLang;
    }
    applyTranslations();
    if (typeof updateHomepageTranslations === 'function') {
        updateHomepageTranslations();
    }

    // Load Saved Accounts for Autocomplete
    const savedAccounts = JSON.parse(localStorage.getItem('fintrack_saved_accounts')) || [];
    const loginIdentifier = document.getElementById('login-identifier');
    const loginPassword = document.getElementById('login-password');
    const rememberCheckbox = document.getElementById('remember-checkbox');
    const datalist = document.getElementById('saved-emails');

    // Populate Datalist
    if (datalist) {
        savedAccounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.email;
            datalist.appendChild(option);
        });
    }

    // Auto-fill removed on load as requested - user must select from suggestions

    // Listen for email typing to auto-fill password
    if (loginIdentifier && loginPassword) {
        loginIdentifier.addEventListener('input', (e) => {
            const typedEmail = e.target.value.trim();
            const match = savedAccounts.find(acc => acc.email === typedEmail);
            if (match) {
                loginPassword.value = match.password;
                if (rememberCheckbox) rememberCheckbox.checked = true;
            }
        });
    }
});

// UI Toggles
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const signUpMobileLink = document.getElementById('signUpMobile');
const signInMobileLink = document.getElementById('signInMobile');
const container = document.getElementById('container');

if (signUpButton) {
    signUpButton.addEventListener('click', () => container.classList.add("right-panel-active"));
}
if (signInButton) {
    signInButton.addEventListener('click', () => container.classList.remove("right-panel-active"));
}
if (signUpMobileLink) {
    signUpMobileLink.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.add("right-panel-active");
    });
}
if (signInMobileLink) {
    signInMobileLink.addEventListener('click', (e) => {
        e.preventDefault();
        container.classList.remove("right-panel-active");
    });
}

// GOOGLE AUTHENTICATION (Simulated)
// Note: For real Google OAuth, you need to set up Google Cloud Console project
// and use Google Sign-In API/SDK

const googleSignupBtn = document.getElementById('google-signup');
const googleSigninBtn = document.getElementById('google-signin');

if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleGoogleAuth('signup');
    });
}

if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleGoogleAuth('signin');
    });
}

function handleGoogleAuth(mode) {
    // Simulate Google Sign-In
    // In a real implementation, this would open Google OAuth popup
    const googleEmail = prompt('Demo: Enter your Gmail address to continue with Google Sign-In:');

    if (!googleEmail) return;

    if (!validateEmail(googleEmail)) {
        alert('Please enter a valid Gmail address.');
        return;
    }

    const users = getUsers();
    const existingUser = users.find(u => u.email === googleEmail);

    if (mode === 'signin') {
        // Sign In Mode
        if (existingUser) {
            // User exists, log them in
            localStorage.setItem(CURRENT_USER_KEY, existingUser.id);
            alert('Signing in with Google...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            alert('No account found with this Gmail address. Please sign up first.');
        }
    } else {
        // Sign Up Mode
        if (existingUser) {
            alert('Account already exists with this Gmail. Please sign in instead.');
            return;
        }

        // Extract name from email
        const username = googleEmail.split('@')[0];

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            email: googleEmail,
            password: 'google_oauth_' + Date.now(), // Not used for Google auth
            name: username,
            authProvider: 'google'
        };

        users.push(newUser);
        saveUsers(users);
        initializeUserData(newUser.id, username);

        // Auto login
        localStorage.setItem(CURRENT_USER_KEY, newUser.id);
        alert('Account created successfully with Google!');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// LOGIN LOGIC
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('login-identifier'); // Assuming this is email
        const passwordInput = document.getElementById('login-password');
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerText;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateEmail(email)) {
            alert('Please enter a valid Gmail address (e.g., xyz1@gmail.com).');
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            btn.innerText = 'Signing In...';
            // Set Session
            localStorage.setItem(CURRENT_USER_KEY, user.id);

            // Save Logic with Permission
            const rememberCheckbox = document.getElementById('remember-checkbox');
            if (rememberCheckbox && rememberCheckbox.checked) {
                if (confirm(t('saveLoginQuery'))) {
                    // Update single last-login info
                    localStorage.setItem('saved_login_info', JSON.stringify({ email, password }));

                    // Update list of all saved accounts
                    let savedAccounts = JSON.parse(localStorage.getItem('fintrack_saved_accounts')) || [];
                    const exists = savedAccounts.findIndex(acc => acc.email === email);
                    if (exists !== -1) {
                        savedAccounts[exists].password = password; // Update password if changed
                    } else {
                        savedAccounts.push({ email, password });
                    }
                    localStorage.setItem('fintrack_saved_accounts', JSON.stringify(savedAccounts));
                }
            } else {
                localStorage.removeItem('saved_login_info');
            }

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            alert('Invalid Email or Password.');
        }
    });
}

// SIGNUP LOGIC
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('signup-username');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const btn = signupForm.querySelector('button');

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (password.length < 4) {
            alert('Password must be at least 4 characters.');
            return;
        }

        const users = getUsers();
        if (users.find(u => u.email === email)) {
            alert('User with this email already exists.');
            return;
        }

        // Create User
        btn.innerText = 'Creating Account...';
        const newUser = {
            id: 'user_' + Date.now(),
            email: email,
            password: password, // In a real app, hash this!
            name: username
        };

        users.push(newUser);
        saveUsers(users);
        initializeUserData(newUser.id, username);

        // Auto Login
        localStorage.setItem(CURRENT_USER_KEY, newUser.id);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });
}
