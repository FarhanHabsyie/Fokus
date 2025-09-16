const SUPABASE_URL = 'https://ppmbksnakhndovwovjks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbWJrc25ha2huZG92d292amtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODA1MjcsImV4cCI6MjA3MzQ1NjUyN30.ZPpHhNWZgvuQFqV92AiP9YBvdmVtMSqyj1ZjEKoDssc';

// Menggunakan nama variabel yang berbeda saat inisialisasi untuk menghindari konflik
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Lalu, kita tetap menamainya 'supabase' agar tidak perlu mengubah file lain
const supabase = _supabase;