document.addEventListener('DOMContentLoaded', function() {
  // Audience Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  if(tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Hide all tab panes
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Show the corresponding tab pane
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId + '-tab').classList.add('active');
      });
    });
  }
  
  // FAQ toggles
  const faqItems = document.querySelectorAll('.faq-item h4');
  
  if(faqItems.length > 0) {
    faqItems.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        
        // Toggle display
        if(content.classList.contains('active')) {
          content.classList.remove('active');
        } else {
          content.classList.add('active');
        }
      });
    });
  }
  
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only proceed if the href is not just "#"
      if(this.getAttribute('href') !== '#') {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if(targetElement) {
          // Scroll smoothly to the target
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Offset for header
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Cookie notice
  const cookieNotice = document.querySelector('.cookie-notice');
  const cookieBtn = document.querySelector('.cookie-notice button');
  
  if(cookieBtn) {
    cookieBtn.addEventListener('click', function() {
      // In a real implementation, this would save the cookie preference
      // For now, just hide the notice
      cookieNotice.style.display = 'none';
      
      // Set a cookie to remember the preference
      document.cookie = "cookie_preferences=accepted; max-age=31536000; path=/";
    });
    
    // Check if cookie preference is already set
    if(document.cookie.indexOf('cookie_preferences=accepted') !== -1) {
      cookieNotice.style.display = 'none';
    }
  }
});
