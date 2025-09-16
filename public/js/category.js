// Fungsi untuk menampilkan berita
function displayPosts(posts) {
    const newsSection = document.querySelector('.news-section');
    newsSection.innerHTML = ''; // Kosongkan section

    if (!posts || posts.length === 0) {
        newsSection.innerHTML = '<p>Belum ada berita dalam kategori ini.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'news-card';

        const snippet = post.content.substring(0, 100) + '...';
        const postDate = new Date(post.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        // Mengambil nama penulis dari relasi 'users'
        const authorName = (post.users && post.users.name) ? post.users.name : 'Penulis';
        
        postElement.innerHTML = `
            <a href="post.html?id=${post.id}" class="news-card-link">
                <img src="${post.image_url}" alt="${post.title}" class="news-card-image">
                <div class="news-card-content">
                    <h3>${post.title}</h3>
                    <div class="post-meta">
                        <span>Oleh: ${authorName}</span> | <span>${postDate}</span>
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
        const { data, error } = await supabase
          .from('posts')
          .select(`*, users ( name )`)
          .eq('category', category)
          .order('created_at', { ascending: false });

        if (error) throw error;
        displayPosts(data);
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