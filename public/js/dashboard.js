document.addEventListener('DOMContentLoaded', () => {
  // Ambil data sesi dari localStorage
  const sessionDataString = localStorage.getItem('supabase.auth.token');
  if (!sessionDataString) {
      window.location.href = 'index.html';
      return;
  }

  const sessionData = JSON.parse(sessionDataString);
  const user = sessionData.user;
  const token = sessionData.session.access_token;

  if (!user || !token) {
      window.location.href = 'index.html';
      return;
  }

  // Tampilkan nama pengguna (dari metadata Supabase)
  document.getElementById('user-name').textContent = user.user_metadata.full_name || 'Admin';

  const createPostForm = document.getElementById('create-post-form');
  const postList = document.getElementById('post-list');
  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-post-form');
  const editCloseBtn = document.getElementById('edit-close');

  // === FUNGSI CRUD (Versi Supabase) ===

  // 1. READ: Tampilkan semua post
  async function loadPosts() {
      try {
          const response = await fetch('http://localhost:4000/posts');
          const posts = await response.json();
          
          postList.innerHTML = `
              <table>
                  <thead>
                      <tr>
                          <th>Judul</th>
                          <th>Kategori</th>
                          <th>Tanggal</th>
                          <th>Aksi</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${posts.map(post => `
                          <tr>
                              <td>${post.title}</td>
                              <td>${post.category}</td>
                              <td>${new Date(post.createdAt).toLocaleDateString('id-ID')}</td>
                              <td>
                                  ${
                                    // Cek kepemilikan post berdasarkan authorId
                                    post.authorId === user.id
                                      ? `
                                  <button class="btn btn-sm btn-outline btn-edit" data-id="${post.id}">Edit</button>
                                  <button class="btn btn-sm btn-danger btn-delete" data-id="${post.id}">Hapus</button>
                                  ` : '<span>-</span>'
                                  }
                              </td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          `;
      } catch (error) {
          console.error('Gagal memuat post:', error);
          postList.innerHTML = '<p>Gagal memuat daftar berita.</p>';
      }
  }

  // 2. CREATE: Kirim post baru
  createPostForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('title', document.getElementById('post-title').value);
      formData.append('content', document.getElementById('post-content').value);
      formData.append('category', document.getElementById('post-category').value);
      formData.append('image', document.getElementById('post-image').files[0]);

      try {
          const response = await fetch('http://localhost:4000/posts', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }, // Kirim token Supabase
              body: formData
          });

          if (response.ok) {
              alert('Berita berhasil diterbitkan!');
              createPostForm.reset();
              loadPosts();
          } else {
              const data = await response.json();
              alert(`Gagal menerbitkan: ${data.error}`);
          }
      } catch (error) {
          alert('Terjadi kesalahan.');
      }
  });
  
  // 3. DELETE: Hapus post
  async function deletePost(postId) {
      if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;

      try {
          const response = await fetch(`http://localhost:4000/posts/${postId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
              alert('Berita berhasil dihapus.');
              loadPosts();
          } else {
              const data = await response.json();
              alert(`Gagal menghapus: ${data.error}`);
          }
      } catch (error) {
          alert('Terjadi kesalahan.');
      }
  }

  // Event Delegation untuk tombol Edit & Delete
  postList.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) {
          deletePost(e.target.dataset.id);
      }
      // Anda bisa menambahkan logika untuk 'btn-edit' di sini jika diperlukan
  });

  // Event untuk menutup modal
  editCloseBtn.addEventListener('click', () => editModal.style.display = 'none');
  window.addEventListener('click', (event) => {
      if (event.target === editModal) editModal.style.display = 'none';
  });

  loadPosts();
});