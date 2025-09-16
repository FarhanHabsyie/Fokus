const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const supabase = require('./supabaseClient'); // Impor klien Supabase
// ... baris kode sebelumnya

console.log('Mencoba terhubung ke Supabase URL:', process.env.SUPABASE_URL); // <-- TAMBAHKAN BARIS INI
// ... sisa kode

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Multer untuk menangani upload di memori
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// ======================
// AUTH & API ENDPOINTS (Versi Supabase)
// ======================

// Middleware untuk mendapatkan user dari token
const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: 'Token otorisasi diperlukan' });
    }
    const token = authorization.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }
    req.user = user;
    next();
};

// Register
app.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Registrasi berhasil! Cek email untuk verifikasi.', data });
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(401).json({ error: error.message });
    res.json(data);
});

// Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:4000/reset-password.html',
    });

    if (error) {
        // Jangan beri tahu jika email tidak ada, demi keamanan
        console.error("Error reset password:", error.message);
    }
    res.json({ message: 'Jika email terdaftar, tautan reset telah dikirim.' });
});

// Update Password (saat user sudah login atau setelah reset)
app.post('/update-password', requireAuth, async (req, res) => {
    const { password } = req.body;
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password berhasil diperbarui.' });
});


// ======================
// POSTS API (Versi Supabase)
// ======================

// Get all posts
app.get("/posts", async (req, res) => {
    let query = supabase.from('posts').select(`
        id, title, content, category, imageUrl, createdAt,
        author:profiles ( name )
    `).order('createdAt', { ascending: false });

    if (req.query.category) {
        query = query.eq('category', req.query.category);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Get single post
app.get("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('posts')
        .select(`*, author:users ( name )`)
        .eq('id', id)
        .single();
        
    if (error) return res.status(404).json({ error: 'Berita tidak ditemukan' });
    res.json(data);
});

// Create post
app.post("/posts", requireAuth, upload.single('image'), async (req, res) => {
    const { title, content, category } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: "Foto berita wajib diunggah." });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    // Upload gambar ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images') // Nama bucket Anda
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
        });

    if (uploadError) {
        return res.status(500).json({ error: 'Gagal mengunggah gambar.' });
    }

    // Dapatkan URL publik dari gambar yang diunggah
    const { data } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    // Simpan post ke database
    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{ 
            title, 
            content, 
            category, 
            imageUrl: publicUrl,
            authorId: req.user.id 
        }]);
    
    if (postError) return res.status(500).json({ error: postError.message });
    res.status(201).json(postData);
});

// Update post
app.put("/posts/:id", requireAuth, upload.single('image'), async (req, res) => {
    // Implementasi update dengan cek hak akses (seperti di delete)
    res.status(501).json({ message: "Update belum diimplementasikan" });
});

// Delete post
app.delete("/posts/:id", requireAuth, async (req, res) => {
    const { id } = req.params;

    // Cek kepemilikan
    const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('authorId, imageUrl')
        .eq('id', id)
        .single();

    if (fetchError || !post) return res.status(404).json({ error: "Post tidak ditemukan." });

    if (post.authorId !== req.user.id) {
        return res.status(403).json({ error: "Anda tidak punya izin untuk menghapus post ini." });
    }

    // Hapus gambar dari storage
    const fileName = post.imageUrl.split('/').pop();
    await supabase.storage.from('post-images').remove([fileName]);

    // Hapus post dari database
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', id);

    if (deleteError) return res.status(500).json({ error: deleteError.message });
    res.json({ message: "Post berhasil dihapus" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server jalan di http://localhost:${PORT}`)
);