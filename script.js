// ===== Authentication & State Management =====
const validUser = {
  username: 'admin',
  password: 'coffee123'
};

// DOM Elements — Login Page
const loginForm = document.getElementById('loginForm');
const alertBox = document.getElementById('alertBox');

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === validUser.username && password === validUser.password) {
      // Store session
      localStorage.setItem('currentUser', username);
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect
      window.location.href = 'dashboard.html';
    } else {
      showAlert('Invalid username or password. Please try again.');
    }
  });
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
}

// ===== Dashboard Authentication Guard & UI =====
const logoutBtn = document.getElementById('logoutBtn');
const welcomeUser = document.getElementById('welcomeUser');
const dashboardGreeting = document.getElementById('dashboardGreeting');

// Check auth on dashboard load
if (window.location.pathname.includes('dashboard.html')) {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const currentUser = localStorage.getItem('currentUser');

  if (!isLoggedIn || isLoggedIn !== 'true') {
    // Unauthorized — redirect to login
    window.location.href = 'index.html';
  } else {
    // Update UI with user info
    if (welcomeUser) welcomeUser.textContent = `Welcome, ${currentUser}`;
    // Time-based greeting
    if (dashboardGreeting) {
      const hour = new Date().getHours();
      if (hour < 12) dashboardGreeting.textContent = 'Good Morning! ☀️';
      else if (hour < 18) dashboardGreeting.textContent = 'Good Afternoon! 🌤️';
      else dashboardGreeting.textContent = 'Good Evening! 🌙';
    }
  }
}

// Logout Handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
  });
}