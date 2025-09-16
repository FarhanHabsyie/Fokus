document.addEventListener('DOMContentLoaded', () => {
    const postContentArea = document.getElementById('post-content-area');
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    async function loadPost(id) {
        if (!id) {
            postContentArea.innerHTML = '<h2>Berita tidak ditemukan.</h2>';
            return;
        }

        try {
            const { data: post, error } = await supabase
                .from('posts')
                .select(`*, users ( name )`)
                .eq('id', id)
                .single();
            
            if (error) throw error;

            document.title = `${post.title} - Fokus.com`;

            const postDate = new Date(post.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Mengambil nama penulis dari relasi 'users'
            const authorName = post.users ? post.users.name : 'Penulis Anonim';

            postContentArea.innerHTML = `
                <h1 class="post-title">${post.title}</h1>
                <div class="post-meta">
                    <span>Oleh: <strong>${authorName}</strong></span> | 
                    <span>${postDate} WIB</span> | 
                    <span>Kategori: <strong>${post.category}</strong></span>
                </div>
                <img src="${post.image_url}" alt="${post.title}" class="post-image-full">
                <div class="post-body">
                    ${post.content.replace(/\n/g, '<br>')}
                </div>
            `;
        } catch (error) {
            console.error('Gagal memuat post:', error);
            postContentArea.innerHTML = `<h2>Terjadi kesalahan saat memuat berita.</h2>`;
        }
    }

    loadPost(postId);
});