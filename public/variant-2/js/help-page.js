// Help Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // FAQ Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Open clicked item if it wasn't active
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // Category Filter
  const categoryButtons = document.querySelectorAll('.category-btn');
  const faqItems = document.querySelectorAll('.faq-item');

  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;

      // Update active button
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter FAQ items
      faqItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
          item.classList.remove('active');
        }
      });
    });
  });

  // Search Functionality
  const searchInput = document.getElementById('faqSearch');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();

      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();

        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
          item.classList.remove('active');
        }
      });

      // Reset category filter when searching
      if (searchTerm) {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
      } else {
        categoryButtons[0].classList.add('active'); // Reset to "All"
      }
    });
  }
});
