// Settings Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Settings Navigation
  const settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
  const settingsSections = document.querySelectorAll('.settings-section');

  settingsNavBtns.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.dataset.section;

      // Remove active class from all buttons and sections
      settingsNavBtns.forEach(btn => btn.classList.remove('active'));
      settingsSections.forEach(section => section.classList.remove('active'));

      // Add active class to clicked button and corresponding section
      this.classList.add('active');
      document.getElementById(sectionId).classList.add('active');
    });
  });

  // Toggle switches
  const toggles = document.querySelectorAll('.toggle input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      console.log('Toggle changed:', this.checked);
      // You would save the preference here
    });
  });

  // Form submissions
  const forms = document.querySelectorAll('.settings-form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (window.toast) {
        window.toast.success('Settings saved successfully!');
      }
    });
  });

  // Save buttons
  const saveButtons = document.querySelectorAll('.btn-primary');
  saveButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!this.type || this.type !== 'submit') {
        e.preventDefault();
        if (window.toast) {
          window.toast.success('Settings saved successfully!');
        }
      }
    });
  });
});
