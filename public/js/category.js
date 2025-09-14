// Fungsi untuk menampilkan berita (sama seperti di main.js, bisa ditaruh di utils.js jika ingin)
function displayPosts(posts) {
    const newsSection = document.querySelector('.news-section');
    newsSection.innerHTML = ''; // Kosongkan section

    if (posts.length === 0) {
        newsSection.innerHTML = '<p>Belum ada berita dalam kategori ini.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'news-card';

        const snippet = post.content.substring(0, 100) + '...';
        const postDate = new Date(post.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        // Diperbarui: Tambahkan tautan ke post.html dengan ID
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="news-card-link">
                <img src="${post.imageUrl}" alt="${post.title}" class="news-card-image">
                <div class="news-card-content">
                    <h3>${post.title}</h3>
                    <div class="post-meta">
                        <span>Oleh: ${post.authorName}</span> | <span>${postDate}</span>
                    </div>
                    <p>${snippet}</p>
                </div>
            </a>
        `;
        newsSection.appendChild(postElement);
    });
}

// Fungsi untuk memuat berita berdasarkan kategori
async function loadPostsByCategory(category) {
    try {
        const response = await fetch(`http://localhost:4000/posts?category=${category}`);
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error('Gagal memuat berita:', error);
        const newsSection = document.querySelector('.news-section');
        newsSection.innerHTML = '<p>Gagal memuat berita. Silakan coba lagi nanti.</p>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const categoryTitle = document.getElementById('category-title');

  if (category) {
    document.title = `Kategori ${category} - Fokus.com`;
    categoryTitle.textContent = `Berita Kategori: ${category}`;
    loadPostsByCategory(category);
  } else {
    categoryTitle.textContent = 'Kategori tidak ditemukan';
  }
});