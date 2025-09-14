const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Masukkan URL dan Key dari proyek Supabase Anda
const supabaseUrl = 'https://ppmbksnakhndovwovjks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbWJrc25ha2huZG92d292amtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODA1MjcsImV4cCI6MjA3MzQ1NjUyN30.ZPpHhNWZgvuQFqV92AiP9YBvdmVtMSqyj1ZjEKoDssc';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;