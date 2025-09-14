// Script utama halaman index.html

// Update tanggal saat ini di header
function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('id-ID', options);
  }
}

// Fungsi untuk memuat Breaking News dinamis
async function loadBreakingNews() {
  try {
      const response = await fetch('http://localhost:4000/posts/latest');
      if (!response.ok) return;

      const latestPost = await response.json();
      
      const breakingTextElement = document.getElementById('breaking-text');
      const breakingLinkElement = document.getElementById('breaking-news-link');
      
      if (breakingTextElement && breakingLinkElement && latestPost && latestPost.id) {
          breakingTextElement.textContent = latestPost.title;
          breakingLinkElement.href = `post.html?id=${latestPost.id}`;
      } else if (breakingTextElement) {
          breakingTextElement.textContent = "Selamat datang di Fokus.com";
      }
  } catch (error) {
      console.error('Gagal memuat breaking news:', error);
      const breakingTextElement = document.getElementById('breaking-text');
      if (breakingTextElement) {
          breakingTextElement.textContent = "Tidak dapat memuat berita terbaru.";
      }
  }
}

// Fungsi untuk menampilkan berita di halaman
function displayPosts(posts) {
  const newsSection = document.querySelector('.news-section');
  newsSection.innerHTML = ''; 

  if (!posts || posts.length === 0) {
      newsSection.innerHTML = '<p>Belum ada berita untuk ditampilkan.</p>';
      return;
  }

  posts.forEach(post => {
      const postElement = document.createElement('article');
      postElement.className = 'news-card';

      const snippet = post.content ? post.content.substring(0, 100) + '...' : '';
      const postDate = new Date(post.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
      });

      // Mengakses nama penulis dari objek bersarang yang dikirim Supabase
      const authorName = (post.author && post.author.name) ? post.author.name : 'Penulis';

      postElement.innerHTML = `
          <a href="post.html?id=${post.id}" class="news-card-link">
              <img src="${post.imageUrl || ''}" alt="${post.title}" class="news-card-image">
              <div class="news-card-content">
                  <h3>${post.title}</h3>
                  <div class="post-meta">
                      <span>${post.category}</span> | <span>${postDate}</span>
                  </div>
                  <p>${snippet}</p>
              </div>
          </a>
      `;
      newsSection.appendChild(postElement);
  });
}

// Fungsi untuk memuat semua berita
async function loadAllPosts() {
  try {
      const response = await fetch('http://localhost:4000/posts');
      const posts = await response.json();
      displayPosts(posts);
  } catch (error) {
      console.error('Gagal memuat berita:', error);
      const newsSection = document.querySelector('.news-section');
      newsSection.innerHTML = '<p>Gagal memuat berita. Silakan coba lagi nanti.</p>';
  }
}

// Panggil semua fungsi yang perlu dijalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  //Breaking news dinonaktifkan sementara karena tidak ada di HTML baru
  //loadBreakingNews(); 
  loadAllPosts();
});