document.addEventListener('DOMContentLoaded', function() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = themeToggleBtn.querySelector('i');
  
  // Function to set theme
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
      localStorage.setItem('ship-fast-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
      localStorage.setItem('ship-fast-theme', 'light');
    }
  }
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('ship-fast-theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply the appropriate theme
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemPrefersDark) {
    setTheme('dark');
  } else {
    setTheme('light');
  }
  
  // Toggle theme when button is clicked
  themeToggleBtn.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  });
  
  // Update theme if system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('ship-fast-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
});
