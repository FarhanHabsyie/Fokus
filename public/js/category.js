document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const categoryTitle = document.getElementById('category-title');
  
    if (category) {
      categoryTitle.textContent = `Berita Kategori: ${category}`;
      // TODO: Fetch and display news for the specific category
    } else {
      categoryTitle.textContent = 'Kategori tidak ditemukan';
    }
  
    // check login state to show admin button
    const token = localStorage.getItem('token');
    if(token) {
      document.getElementById('admin-btn').style.display = 'block';
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('register-btn').style.display = 'none';
    }
  });