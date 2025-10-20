/* ========================================
   SERVICES PAGE FUNCTIONALITY
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Tab Filtering
  const tabs = document.querySelectorAll('.services-tab');
  const serviceCards = document.querySelectorAll('.service-card, .service-featured-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetAudience = tab.dataset.tab;

      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Filter service cards
      serviceCards.forEach(card => {
        const cardAudience = card.dataset.audience || 'all';

        if (targetAudience === 'all') {
          card.classList.remove('hidden');
          card.classList.add('visible');
          card.style.display = 'flex';
        } else {
          // Check if card audience includes the target (space-separated list)
          const audiences = cardAudience.split(' ');

          if (audiences.includes(targetAudience) || audiences.includes('all')) {
            card.classList.remove('hidden');
            card.classList.add('visible');
            card.style.display = 'flex';
          } else {
            card.classList.add('hidden');
            card.classList.remove('visible');
            setTimeout(() => {
              if (card.classList.contains('hidden')) {
                card.style.display = 'none';
              }
            }, 300);
          }
        }
      });
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Language toggle (if needed)
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = document.querySelector('.lang-current');
      if (currentLang) {
        const lang = currentLang.textContent === 'EN' ? 'RU' : 'EN';
        currentLang.textContent = lang;
        // Here you would typically load translations
        console.log('Language switched to:', lang);
      }
    });
  }

  // Button click handlers (placeholder - connect to real order system)
  const buttons = document.querySelectorAll('.btn-primary, .btn-outline');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Don't prevent default for actual links
      if (e.target.tagName !== 'A') {
        e.preventDefault();

        const buttonText = e.target.textContent;
        console.log('Button clicked:', buttonText);

        // Show alert for now - replace with actual order flow
        if (buttonText.includes('Get Started') || buttonText.includes('Order') || buttonText.includes('Buy')) {
          alert('Order system coming soon! For now, please contact us directly.');
        } else if (buttonText.includes('Contact') || buttonText.includes('Sales')) {
          alert('Opening contact form... (Coming soon)');
        }
      }
    });
  });

  // Scroll animations (fade in on scroll)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all cards
  serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Advantage cards animation
  const advantageCards = document.querySelectorAll('.advantage-card');
  advantageCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

});
