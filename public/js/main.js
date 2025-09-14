// Script utama halaman index.html

// Update tanggal saat ini di header
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('id-ID', options);
  }
  updateDate();
  
  // Breaking news ticker
  const breakingTexts = [
    "Presiden Jokowi resmikan jalan tol baru di Jawa Barat yang akan mengurangi kemacetan ibukota hingga 30%.",
    "Harga bahan pokok mulai stabil setelah intervensi pemerintah di pasar.",
    "Timnas Indonesia berhasil mengalahkan Vietnam dengan skor 2-0 dalam kualifikasi Piala Dunia.",
    "Tech startup Indonesia berhasil mendapatkan pendanaan seri B senilai $50 juta.",
    "Festival kuliner nusantara akan digelar serentak di 10 kota besar Indonesia."
  ];
  
  let currentBreakingIndex = 0;
  function updateBreakingNews() {
    currentBreakingIndex = (currentBreakingIndex + 1) % breakingTexts.length;
    document.getElementById('breaking-text').textContent = breakingTexts[currentBreakingIndex];
  }
  setInterval(updateBreakingNews, 10000);
  