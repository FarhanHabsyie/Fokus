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
              .select('id, title, category, created_at, author_id')
              .order('created_at', { ascending: false });
  
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
                                <td>${new Date(post.created_at).toLocaleDateString('id-ID')}</td>
                                <td>
                                    ${
                                      post.author_id === user.id
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
              .select('image_url')
              .eq('id', postId)
              .single();
  
          if (fetchError || !post) throw new Error("Post tidak ditemukan.");
          
          // Hapus post dari database
          const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
          if (deleteError) throw deleteError;
  
          // Hapus gambar dari storage
          const fileName = post.image_url.split('/').pop();
          await supabase.storage.from('post-images').remove([fileName]);
  
          alert('Berita berhasil dihapus.');
          loadPosts();
        } catch (error) {
            alert('Terjadi kesalahan: ' + error.message);
        }
    }
  
    // Event Delegation untuk tombol Edit & Delete
    postList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            deletePost(e.target.dataset.id);
        } else if (e.target.classList.contains('btn-edit')) {
            const postId = e.target.dataset.id;
            try {
                const { data: post, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', postId)
                    .single();

                if (error) throw error;

                // Populate the modal with the post data
                document.getElementById('edit-post-id').value = post.id;
                document.getElementById('edit-post-title').value = post.title;
                document.getElementById('edit-post-content').value = post.content;
                document.getElementById('edit-post-category').value = post.category;
                document.getElementById('edit-existing-image-url').value = post.imageUrl;
                document.getElementById('edit-image-preview').src = post.imageUrl;

                // Show the modal
                document.getElementById('edit-modal').style.display = 'block';
            } catch (error) {
                alert('Gagal memuat data berita untuk diedit: ' + error.message);
            }
        }
    });

    // Close modal functionality
    document.getElementById('edit-close').addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
    });
  
    // Handle edit post form submission
    document.getElementById('edit-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const postId = document.getElementById('edit-post-id').value;
        const title = document.getElementById('edit-post-title').value;
        const content = document.getElementById('edit-post-content').value;
        const category = document.getElementById('edit-post-category').value;
        const existingImageUrl = document.getElementById('edit-existing-image-url').value;
        const newImageFile = document.getElementById('edit-post-image').files[0];

        let image_url = existingImageUrl;

        try {
            // If a new image is uploaded, replace the old one
            if (newImageFile) {
                const fileName = `${Date.now()}-${newImageFile.name}`;

                // Upload the new image to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, newImageFile);

                if (uploadError) {
                    alert('Gagal mengunggah gambar baru: ' + uploadError.message);
                    return;
                }

                // Get the public URL of the new image
                const { data: { publicUrl } } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(fileName);

                image_url = publicUrl;

                // Remove the old image from storage
                const oldFileName = existingImageUrl.split('/').pop();
                await supabase.storage.from('post-images').remove([oldFileName]);
            }

            // Update the post in the database
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    title,
                    content,
                    category,
                    image_url,
                })
                .eq('id', postId);

            if (updateError) {
                alert('Gagal memperbarui berita: ' + updateError.message);
            } else {
                alert('Berita berhasil diperbarui!');
                document.getElementById('edit-post-form').reset();
                document.getElementById('edit-modal').style.display = 'none';
                loadPosts();
            }
        } catch (error) {
            alert('Terjadi kesalahan saat memperbarui berita: ' + error.message);
        }
    });
  
    loadPosts();
  });