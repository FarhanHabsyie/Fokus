document.addEventListener('DOMContentLoaded', () => {
  // === Elemen-elemen DOM ===
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const adminBtn = document.getElementById('admin-btn');
  const userActions = document.querySelector('.user-actions');

  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  
  const loginClose = document.getElementById('login-close');
  const registerClose = document.getElementById('register-close');

  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // === Fungsi untuk mengelola status UI berdasarkan Sesi Supabase ===
  function updateUIBasedOnLoginState(user) {
    if (user) {
      // Pengguna sudah login
      loginBtn.style.display = 'none';
      registerBtn.style.display = 'none';
      adminBtn.style.display = 'inline-block';

      // Tambahkan tombol logout jika belum ada
      if (!document.getElementById('logout-btn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline';
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', async () => {
          await supabase.auth.signOut();
          window.location.reload(); // Muat ulang halaman setelah logout
        });
        userActions.appendChild(logoutBtn);
      }
    } else {
      // Pengguna belum login
      loginBtn.style.display = 'inline-block';
      registerBtn.style.display = 'inline-block';
      adminBtn.style.display = 'none';

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.remove();
      }
    }
  }

  // === Event Listeners untuk Modal ===
  loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
  registerBtn.addEventListener('click', () => registerModal.style.display = 'flex');
  loginClose.addEventListener('click', () => loginModal.style.display = 'none');
  registerClose.addEventListener('click', () => registerModal.style.display = 'none');

  window.addEventListener('click', (event) => {
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === registerModal) registerModal.style.display = 'none';
  });

  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
  });

  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
  });

  // === Event Listeners untuk Form (Versi Supabase) ===

  // Proses Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(`Login gagal: ${error.message}`);
    } else {
      loginModal.style.display = 'none';
      window.location.reload();
    }
  });

  // Proses Daftar
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (password !== confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      alert(`Pendaftaran gagal: ${error.message}`);
    } else {
      registerModal.innerHTML = `
            <div class="modal-content">
                <h2 class="modal-title">👍 Registrasi Berhasil!</h2>
                <p style="text-align: center; line-height: 1.6;">
                    Kami telah mengirimkan tautan verifikasi ke <strong>${email}</strong>.
                    <br>
                    Silakan periksa email Anda untuk mengaktifkan akun.
                </p>
            </div>
        `;
    }
  });

  // === Inisialisasi: Cek status login saat halaman dimuat ===
  // Menggunakan onAuthStateChange agar UI selalu sinkron dengan status login
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    updateUIBasedOnLoginState(user);
  });
});