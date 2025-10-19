// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.dataset.tab;

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      this.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Edit Name functionality (placeholder)
  const editNameBtn = document.getElementById('editName');
  if (editNameBtn) {
    editNameBtn.addEventListener('click', function() {
      const displayName = document.getElementById('displayName');
      const newName = prompt('Enter new display name:', displayName.textContent);
      if (newName && newName.trim()) {
        displayName.textContent = newName.trim();
      }
    });
  }

  // Edit Avatar functionality (placeholder)
  const editAvatarBtn = document.getElementById('editAvatar');
  if (editAvatarBtn) {
    editAvatarBtn.addEventListener('click', function() {
      alert('Avatar upload functionality would be implemented here');
    });
  }
});
