/**
 * HypeAI Variant 2 - Homepage JavaScript
 * Interactive features and functionality
 */

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const connectWalletBtn = document.getElementById('connectWallet');
const stakeAmountInput = document.getElementById('stakeAmount');

// Mobile Menu Toggle
if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking on links
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  });
}

// Header Scroll Effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  } else {
    header.style.boxShadow = 'none';
  }

  lastScroll = currentScroll;
});

// Stats Counter Animation
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    // Format the number
    let displayValue;
    if (target >= 1000000) {
      displayValue = '$' + (current / 1000000).toFixed(1) + 'M';
    } else if (target >= 1000) {
      displayValue = (current / 1000).toFixed(1) + 'K';
    } else {
      displayValue = Math.floor(current);
    }

    element.textContent = displayValue;
  }, 16);
}

// Intersection Observer for Stats
const statCards = document.querySelectorAll('.stat-value[data-target]');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseFloat(entry.target.getAttribute('data-target'));
      animateCounter(entry.target, target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statCards.forEach(card => {
  statsObserver.observe(card);
});

// Scroll Animations
const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

animateOnScrollElements.forEach(element => {
  scrollObserver.observe(element);
});

// Staking Calculator
if (stakeAmountInput) {
  const dailyReward = document.getElementById('dailyReward');
  const monthlyReward = document.getElementById('monthlyReward');
  const yearlyReward = document.getElementById('yearlyReward');

  function calculateRewards(amount) {
    const APY = 0.62; // 62% APY
    const dailyRate = APY / 365;
    const monthlyRate = APY / 12;

    const daily = amount * dailyRate;
    const monthly = amount * monthlyRate;
    const yearly = amount * APY;

    if (dailyReward) dailyReward.textContent = `${Math.round(daily)} HYPE`;
    if (monthlyReward) monthlyReward.textContent = `${Math.round(monthly)} HYPE`;
    if (yearlyReward) yearlyReward.textContent = `${Math.round(yearly).toLocaleString()} HYPE`;
  }

  stakeAmountInput.addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value) || 0;
    calculateRewards(amount);
  });

  // Initialize with default value
  calculateRewards(parseFloat(stakeAmountInput.value) || 10000);
}

// Token Distribution Chart
if (typeof Chart !== 'undefined') {
  const chartCanvas = document.getElementById('distributionChart');

  if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');

    const distributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Private Sale',
          'Public Sale',
          'Staking Rewards',
          'Team & Advisors',
          'Development',
          'Liquidity'
        ],
        datasets: [{
          data: [20, 15, 30, 15, 10, 10],
          backgroundColor: [
            '#F3BA2F',
            '#FCD535',
            '#0ECB81',
            '#00D4FF',
            '#E5A91A',
            '#B4941F'
          ],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(30, 32, 38, 0.95)',
            titleColor: '#F3BA2F',
            bodyColor: '#FFFFFF',
            borderColor: 'rgba(243, 186, 47, 0.2)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return ' ' + context.label + ': ' + context.parsed + '%';
              }
            }
          }
        },
        cutout: '70%',
        animation: {
          animateRotate: true,
          animateScale: false,
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  }
}

// Wallet Connection (Mock)
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', async () => {
    // This is a mock implementation
    // In production, you would integrate with Web3.js or ethers.js

    connectWalletBtn.textContent = 'Connecting...';
    connectWalletBtn.disabled = true;

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        // Get the connected account
        const account = accounts[0];
        const shortAddress = `${account.slice(0, 6)}...${account.slice(-4)}`;

        connectWalletBtn.textContent = shortAddress;
        connectWalletBtn.style.background = '#0ECB81';
      } catch (error) {
        console.error('Error connecting wallet:', error);
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.disabled = false;
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      connectWalletBtn.textContent = 'Connect Wallet';
      connectWalletBtn.disabled = false;
      alert('Please install MetaMask to connect your wallet.');
    }
  });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');

    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerHeight = header?.offsetHeight || 80;
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('button');
    const email = emailInput.value;

    if (!email) return;

    // Store original button text
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Show success message
    submitBtn.textContent = 'Subscribed!';
    submitBtn.style.background = '#0ECB81';
    emailInput.value = '';

    // Reset button after 3 seconds
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3000);
  });
}

// CTA Buttons Click Handlers
const ctaButtons = document.querySelectorAll('.cta-buttons button, .hero-buttons button');
ctaButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.textContent.includes('Private Sale')) {
      // Redirect to private sale page or show modal
      console.log('Join Private Sale clicked');
      // window.location.href = '/private-sale';
    } else if (button.textContent.includes('Learn More')) {
      // Scroll to features section
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (button.textContent.includes('Whitepaper')) {
      // Open whitepaper
      console.log('View Whitepaper clicked');
      // window.open('/whitepaper.pdf', '_blank');
    }
  });
});

// Add stagger animation to feature cards
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
  card.classList.add('animate-on-scroll', `stagger-${Math.min(index % 6 + 1, 6)}`);
});

// Add stagger animation to agent cards
const agentCards = document.querySelectorAll('.agent-card');
agentCards.forEach((card, index) => {
  card.classList.add('animate-on-scroll', `stagger-${Math.min(index % 6 + 1, 6)}`);
});

// Add stagger animation to benefit cards
const benefitCards = document.querySelectorAll('.benefit-card');
benefitCards.forEach((card, index) => {
  card.classList.add('animate-on-scroll', `stagger-${Math.min(index % 5 + 1, 5)}`);
});

// Prevent default on all buttons that don't have specific handlers
document.querySelectorAll('button').forEach(button => {
  if (!button.hasAttribute('type') || button.getAttribute('type') !== 'submit') {
    button.addEventListener('click', (e) => {
      // Let specific handlers run first
      e.preventDefault();
    });
  }
});

// Log initialization
console.log('%c HypeAI v2.0 ', 'background: linear-gradient(135deg, #F3BA2F, #FCD535); color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
console.log('%c Powered by Binance Smart Chain ', 'color: #F3BA2F; font-weight: bold;');
console.log('');
console.log('🚀 All systems operational');
console.log('🤖 27 AI agents active');
console.log('⚡ Connected to BSC');
