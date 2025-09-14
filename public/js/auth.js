// Modul autentikasi: login, register, logout

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginClose = document.getElementById('login-close');
const registerClose = document.getElementById('register-close');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

loginBtn.addEventListener('click', () => {
  loginModal.classList.add('active');
});

registerBtn.addEventListener('click', () => {
  registerModal.classList.add('active');
});

loginClose.addEventListener('click', () => {
  loginModal.classList.remove('active');
});

registerClose.addEventListener('click', () => {
  registerModal.classList.remove('active');
});

switchToRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.classList.remove('active');
  registerModal.classList.add('active');
});

switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerModal.classList.remove('active');
  loginModal.classList.add('active');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.remove('active');
  }
  if (e.target === registerModal) {
    registerModal.classList.remove('active');
  }
});

// Login form handler
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem('currentUser ', JSON.stringify(user));
    alert('Login berhasil!');
    loginModal.classList.remove('active');
    loginForm.reset();
    // Bisa reload halaman atau redirect ke dashboard
  } else {
    alert('Email atau password salah!');
  }
});

// Register form handler
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirm = document.getElementById('register-confirm').value;

  if (password !== confirm) {
    alert('Password dan konfirmasi password tidak cocok!');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(user => user.email === email)) {
    alert('Email sudah terdaftar!');
    return;
  }

  const newUser  = {
    id: Date.now(),
    name,
    email,
    password,
    avatar: name.charAt(0).toUpperCase()
  };

  users.push(newUser );
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser ', JSON.stringify(newUser ));

  alert('Pendaftaran berhasil! Selamat datang di Fokus.com');
  registerModal.classList.remove('active');
  registerForm.reset();
  // Bisa reload halaman atau redirect ke dashboard
});
