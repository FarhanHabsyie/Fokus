document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
  
    if (!session) {
      window.location.href = 'index.html';
      return;
    }
  
    const user = session.user;
  
    // Tampilkan nama pengguna
    document.getElementById('user-name').textContent = user.user_metadata.full_name || 'Admin';
  
    const createPostForm = document.getElementById('create-post-form');
    const postList = document.getElementById('post-list');
    
    // === FUNGSI CRUD (Versi Supabase) ===
  
    // 1. READ: Tampilkan semua post
    async function loadPosts() {
        try {
            const { data: posts, error } = await supabase
              .from('posts')
              .select('id, title, category, createdAt, authorId')
              .order('createdAt', { ascending: false });
  
            if (error) throw error;
            
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
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const category = document.getElementById('post-category').value;
        const imageFile = document.getElementById('post-image').files[0];
  
        if (!imageFile) {
          alert('Foto berita wajib diunggah.');
          return;
        }
        
        const fileName = `${Date.now()}-${imageFile.name}`;
        
        // Upload gambar ke Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images') // Ganti dengan nama bucket Anda
          .upload(fileName, imageFile);
  
        if (uploadError) {
          alert('Gagal mengunggah gambar: ' + uploadError.message);
          return;
        }
        
        // Dapatkan URL publik dari gambar yang diunggah
        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
  
        // Simpan post ke database
      // ... di dalam createPostForm.addEventListener ...

      // Simpan post ke database
      const { error: postError } = await supabase
        .from('posts')
        .insert([{ 
            title, 
            content, 
            category, 
            // MENJADI SEPERTI INI:
            image_url: publicUrl,
            author_id: user.id 
        }]);
// ...
      
        if (postError) {
          alert('Gagal menerbitkan berita: ' + postError.message);
        } else {
          alert('Berita berhasil diterbitkan!');
          createPostForm.reset();
          loadPosts();
        }
    });
    
    // 3. DELETE: Hapus post
    async function deletePost(postId) {
        if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;
  
        try {
          // Ambil URL gambar sebelum menghapus post
          const { data: post, error: fetchError } = await supabase
              .from('posts')
              .select('imageUrl')
              .eq('id', postId)
              .single();
  
          if (fetchError || !post) throw new Error("Post tidak ditemukan.");
          
          // Hapus post dari database
          const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
          if (deleteError) throw deleteError;
  
          // Hapus gambar dari storage
          const fileName = post.imageUrl.split('/').pop();
          await supabase.storage.from('post-images').remove([fileName]);
  
          alert('Berita berhasil dihapus.');
          loadPosts();
        } catch (error) {
            alert('Terjadi kesalahan: ' + error.message);
        }
    }
  
    // Event Delegation untuk tombol Edit & Delete
    postList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            deletePost(e.target.dataset.id);
        }
        // Tambahkan logika untuk 'btn-edit' di sini
    });
  
    loadPosts();
  });