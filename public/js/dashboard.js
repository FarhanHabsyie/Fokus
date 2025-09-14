// Pastikan halaman ini hanya bisa diakses jika user sudah login
const currentUser  = JSON.parse(localStorage.getItem('currentUser '));
if (!currentUser ) {
  alert('Anda harus login terlebih dahulu!');
  window.location.href = 'index.html';
}

// Tampilkan nama dan avatar user di header
document.getElementById('user-name').textContent = currentUser .name;
document.getElementById('user-avatar').textContent = currentUser .avatar;

// Logout handler
document.getElementById('logout-btn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('currentUser ');
  window.location.href = 'index.html';
});

// Form buat berita
const createNewsForm = document.getElementById('create-news-form');
const userNewsList = document.getElementById('user-news-list');
const saveDraftBtn = document.getElementById('save-draft-btn');

function loadUserNews() {
  const allNews = JSON.parse(localStorage.getItem('news')) || [];
  const userNews = allNews.filter(news => news.userId === currentUser .id);

  userNewsList.innerHTML = '';

  if (userNews.length === 0) {
    userNewsList.innerHTML = '<tr><td colspan="5" class="text-center">Anda belum memiliki berita</td></tr>';
    return;
  }

  userNews.forEach(news => {
    const tr = document.createElement('tr');
    const dateFormatted = new Date(news.date).toLocaleDateString('id-ID');

    tr.innerHTML = `
      <td>${news.title}</td>
      <td>${news.category}</td>
      <td>${dateFormatted}</td>
      <td>${news.status}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${news.id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${news.id}">Hapus</button>
      </td>
    `;

    userNewsList.appendChild(tr);
  });

  // Event listener tombol hapus
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newsId = Number(btn.getAttribute('data-id'));
      if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
        deleteNews(newsId);
      }
    });
  });

  // Event listener tombol edit
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const newsId = Number(btn.getAttribute('data-id'));
      editNews(newsId);
    });
  });
}

function deleteNews(newsId) {
  let allNews = JSON.parse(localStorage.getItem('news')) || [];
  allNews = allNews.filter(news => news.id !== newsId);
  localStorage.setItem('news', JSON.stringify(allNews));
  loadUserNews();
}

function editNews(newsId) {
  const allNews = JSON.parse(localStorage.getItem('news')) || [];
  const news = allNews.find(n => n.id === newsId);
  if (!news) return;

  // Isi form dengan data berita yang diedit
  document.getElementById('news-title').value = news.title;
  document.getElementById('news-category').value = news.category;
  document.getElementById('news-image').value = news.image;
  document.getElementById('news-content').value = news.content;

  // Simpan ID berita yang sedang diedit di atribut form
  createNewsForm.setAttribute('data-edit-id', newsId);
}

// Simpan draft (status draft)
saveDraftBtn.addEventListener('click', () => {
  saveNews('draft');
});

// Submit form publikasi berita
createNewsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  saveNews('published');
});

function saveNews(status) {
  const title = document.getElementById('news-title').value.trim();
  const category = document.getElementById('news-category').value;
  const image = document.getElementById('news-image').value.trim() || 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/441e9342-dbee-4168-9b1f-62f414e651c2.png';
  const content = document.getElementById('news-content').value.trim();

  if (!title || !category || !content) {
    alert('Judul, kategori, dan isi berita wajib diisi!');
    return;
  }

  let allNews = JSON.parse(localStorage.getItem('news')) || [];

  const editId = createNewsForm.getAttribute('data-edit-id');

  if (editId) {
    // Update berita yang diedit
    const index = allNews.findIndex(n => n.id === Number(editId));
    if (index !== -1) {
      allNews[index] = {
        ...allNews[index],
        title,
        category,
        image,
        content,
        status,
        date: new Date().toISOString()
      };
      alert('Berita berhasil diperbarui!');
    }
    createNewsForm.removeAttribute('data-edit-id');
  } else {
    // Tambah berita baru
    const newNews = {
      id: Date.now(),
      userId: currentUser .id,
      title,
      category,
      image,
      content,
      date: new Date().toISOString(),
      status
    };
    allNews.push(newNews);
    alert(status === 'published' ? 'Berita berhasil dipublikasikan!' : 'Draft berhasil disimpan!');
  }

  localStorage.setItem('news', JSON.stringify(allNews));
  createNewsForm.reset();
  loadUserNews();
}

// Muat berita user saat halaman siap
loadUserNews();
