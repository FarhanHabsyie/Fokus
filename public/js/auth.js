// ... (kode auth.js yang sudah ada)

// Tambahkan atau modifikasi bagian ini di dalam event listener loginForm
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  // ... (kode untuk mengambil email dan password)

  try {
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Tampilkan tombol admin dan sembunyikan tombol login/daftar
      document.getElementById('admin-btn').style.display = 'block';
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('register-btn').style.display = 'none';
      
      // Tambahkan tombol logout
      const userActions = document.querySelector('.user-actions');
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn btn-outline';
      logoutBtn.id = 'logout-btn';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      });
      userActions.appendChild(logoutBtn);

      // Tutup modal
      document.getElementById('login-modal').style.display = 'none';

    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
});

// Cek status login saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('admin-btn').style.display = 'block';
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('register-btn').style.display = 'none';

    const userActions = document.querySelector('.user-actions');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.id = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    });
    userActions.appendChild(logoutBtn);
  }
});