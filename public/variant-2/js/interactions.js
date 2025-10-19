/**
 * HypeAI Variant 2 - Page Interactions
 * BNB Theme - Smooth animations and interactivity
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initHeaderScroll();
    initMobileMenu();
    initAnimations();
    initActivityFeed();
    initWalletConnect();
    console.log('%c HypeAI v2.0 ', 'background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); color: #000; font-size: 16px; font-weight: bold; padding: 8px;');
    console.log('Powered by Binance Smart Chain ⚡');
  }

  /**
   * Header scroll effect
   */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add shadow on scroll
      if (currentScroll > 10) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      } else {
        header.style.boxShadow = 'none';
      }

      // Hide header on scroll down, show on scroll up
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });
  }

  /**
   * Mobile menu toggle
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.header-nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      menuToggle.classList.toggle('active');

      // Toggle aria-expanded
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Scroll animations
   */
  function initAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in, .glass-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });

    // Stagger animations for grids
    document.querySelectorAll('.content-grid .glass-card, .agents-grid .agent-card').forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
    });
  }

  /**
   * Live activity feed simulation (for agents page)
   */
  function initActivityFeed() {
    const activityLog = document.querySelector('.activity-log');
    if (!activityLog) return;

    const activities = [
      { agent: 'Market Analyzer', message: 'detected bullish pattern on BNB/USDT' },
      { agent: 'Auto Trader', message: 'executed buy order: 2.5 BNB at $315.42' },
      { agent: 'Yield Farmer', message: 'compounded rewards: +0.84 HYPE' },
      { agent: 'Risk Manager', message: 'adjusted portfolio allocation' },
      { agent: 'Sentiment Analyzer', message: 'social sentiment: 78% bullish' },
      { agent: 'Security Scanner', message: 'verified contract: 0x742d...3f8a (SAFE)' },
      { agent: 'Flash Arbitrage', message: 'found arbitrage opportunity: +$12.50' },
      { agent: 'Portfolio Optimizer', message: 'rebalanced portfolio for optimal returns' },
      { agent: 'Whale Tracker', message: 'large transfer detected: 10,000 BNB' },
      { agent: 'Staking Manager', message: 'auto-staked rewards: +1.2 HYPE' }
    ];

    // Add new activity every 5-8 seconds
    setInterval(() => {
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const now = new Date();
      const timeStr = `${now.getSeconds()}s ago`;

      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <div class="activity-time">${timeStr}</div>
        <div class="activity-message">
          <strong>${activity.agent}</strong> ${activity.message}
        </div>
      `;

      // Add to top of log
      activityLog.insertBefore(item, activityLog.firstChild);

      // Remove old items (keep max 10)
      while (activityLog.children.length > 10) {
        activityLog.removeChild(activityLog.lastChild);
      }

      // Animate in
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      requestAnimationFrame(() => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      });

    }, Math.random() * 3000 + 5000); // 5-8 seconds
  }

  /**
   * Wallet connect simulation
   */
  function initWalletConnect() {
    const walletButtons = document.querySelectorAll('.btn-bnb-primary');

    walletButtons.forEach(btn => {
      if (btn.textContent.includes('Connect Wallet')) {
        btn.addEventListener('click', async () => {
          // Check if MetaMask is installed
          if (typeof window.ethereum !== 'undefined') {
            try {
              // Request account access
              await window.ethereum.request({ method: 'eth_requestAccounts' });

              // Get account
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              const account = accounts[0];

              // Update button
              const short = account.slice(0, 6) + '...' + account.slice(-4);
              btn.innerHTML = `
                <span style="width: 8px; height: 8px; background: #0ECB81; border-radius: 50%; display: inline-block; margin-right: 8px;"></span>
                ${short}
              `;
              btn.style.background = 'rgba(14, 203, 129, 0.1)';
              btn.style.border = '2px solid #0ECB81';
              btn.style.color = '#0ECB81';

              showToast('Wallet connected successfully! 🎉', 'success');

            } catch (error) {
              console.error('Wallet connection error:', error);
              showToast('Failed to connect wallet. Please try again.', 'error');
            }
          } else {
            // MetaMask not installed
            showToast('Please install MetaMask to connect your wallet.', 'warning');
            setTimeout(() => {
              window.open('https://metamask.io/download/', '_blank');
            }, 2000);
          }
        });
      }
    });
  }

  /**
   * Toast notification
   */
  function showToast(message, type = 'info') {
    const colors = {
      success: '#0ECB81',
      error: '#F6465D',
      warning: '#F0B90B',
      info: '#F3BA2F'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(30, 32, 38, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid ${colors[type]};
      border-radius: 12px;
      padding: 16px 24px;
      color: #fff;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      animation: slideInUp 0.3s ease;
      max-width: 400px;
    `;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 4px; height: 40px; background: ${colors[type]}; border-radius: 2px;"></div>
        <div>${message}</div>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }

    /* Header transition */
    .site-header {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* Mobile menu styles */
    @media (max-width: 768px) {
      .header-nav {
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        background: rgba(30, 32, 38, 0.98);
        backdrop-filter: blur(16px);
        padding: 24px;
        border-top: 1px solid rgba(243, 186, 47, 0.2);
        transform: translateY(-100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        z-index: 999;
      }

      .header-nav.active {
        transform: translateY(0);
        opacity: 1;
      }

      .header-nav a {
        display: block;
        padding: 12px 0;
        font-size: 1.125rem;
        border-bottom: 1px solid rgba(243, 186, 47, 0.1);
      }

      .mobile-menu-toggle {
        display: block;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 8px;
      }

      .mobile-menu-toggle .hamburger {
        display: block;
        width: 24px;
        height: 2px;
        background: var(--bnb-gold);
        position: relative;
        transition: all 0.3s ease;
      }

      .mobile-menu-toggle .hamburger::before,
      .mobile-menu-toggle .hamburger::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 2px;
        background: var(--bnb-gold);
        transition: all 0.3s ease;
      }

      .mobile-menu-toggle .hamburger::before {
        top: -8px;
      }

      .mobile-menu-toggle .hamburger::after {
        bottom: -8px;
      }

      .mobile-menu-toggle.active .hamburger {
        background: transparent;
      }

      .mobile-menu-toggle.active .hamburger::before {
        top: 0;
        transform: rotate(45deg);
      }

      .mobile-menu-toggle.active .hamburger::after {
        bottom: 0;
        transform: rotate(-45deg);
      }
    }

    /* Smooth hover effects */
    .glass-card,
    .btn-bnb-primary,
    .btn-bnb-secondary,
    .social-icon {
      transition: all 0.3s ease;
    }

    /* Agent card pulse animation */
    .agent-status {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 10px currentColor;
        opacity: 1;
      }
      50% {
        box-shadow: 0 0 20px currentColor;
        opacity: 0.8;
      }
    }
  `;
  document.head.appendChild(style);

})();
