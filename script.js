document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const signInBtn = document.getElementById('signInBtn');

  // Toggle 3-dot Menu dropdown
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      menuDropdown.classList.remove('active');
    });
  }

  // Toggle Dark/Light Mode
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
  }

  // Handle Sign-in click action
  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
      alert("Sign-in popup / Google Authentication flow will be triggered here.");
    });
  }
});
