/**
 * Secure Wallet Connection Module
 * Implements Binance-level security for Web3 wallet interactions
 */

// Import security utilities
// Assumes SecurityUtils and Logger are loaded globally

const WalletSecure = {
  // Configuration
  config: {
    timeout: 10000, // 10 seconds
    maxRetries: 3,
    supportedChains: [1, 56, 137], // Ethereum, BSC, Polygon
    requiredChainId: 56 // BSC by default
  },

  // State
  connectedAddress: null,
  chainId: null,
  isConnecting: false,

  // Rate limiter for connection attempts
  rateLimiter: null,

  /**
   * Initialize wallet module
   */
  init() {
    // Initialize rate limiter (5 attempts per minute)
    if (window.RateLimiter) {
      this.rateLimiter = new window.RateLimiter(5, 60000);
    }

    // Setup event listeners for account/network changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
    }

    // Check if already connected
    this.checkExistingConnection();

    if (window.Logger) {
      window.Logger.info('Wallet module initialized');
    }
  },

  /**
   * Check for existing wallet connection
   */
  async checkExistingConnection() {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts && accounts.length > 0) {
        this.connectedAddress = accounts[0];
        await this.updateChainId();
        this.updateUI();
      }
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Failed to check existing connection:', error);
      }
    }
  },

  /**
   * Connect wallet with security checks
   */
  async connect() {
    // Prevent concurrent connection attempts
    if (this.isConnecting) {
      if (window.toast) {
        window.toast.warning('Connection already in progress');
      }
      return null;
    }

    // Check rate limiting
    if (this.rateLimiter && !this.rateLimiter.isAllowed('wallet_connect')) {
      const timeUntilReset = Math.ceil(this.rateLimiter.getTimeUntilReset('wallet_connect') / 1000);
      if (window.toast) {
        window.toast.error(`Too many connection attempts. Try again in ${timeUntilReset} seconds`);
      }
      return null;
    }

    // Check if MetaMask/Web3 provider exists
    if (!window.ethereum) {
      if (window.toast) {
        window.toast.warning('Please install MetaMask to connect your wallet', 5000);
      }
      return null;
    }

    this.isConnecting = true;

    try {
      // Request accounts with timeout
      const accounts = await Promise.race([
        window.ethereum.request({ method: 'eth_requestAccounts' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), this.config.timeout)
        )
      ]);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const address = accounts[0];

      // Validate address format
      if (!this.validateAddress(address)) {
        throw new Error('Invalid address format received');
      }

      // Get chain ID
      await this.updateChainId();

      // Check if on correct network
      if (this.chainId !== this.config.requiredChainId) {
        await this.switchNetwork();
      }

      // Update state
      this.connectedAddress = address;

      // Update UI
      this.updateUI();

      // Log successful connection
      if (window.Logger) {
        window.Logger.info('Wallet connected:', {
          address: this.maskAddress(address),
          chainId: this.chainId
        });
      }

      if (window.toast) {
        window.toast.success(`Wallet connected: ${this.formatAddress(address)}`);
      }

      return address;

    } catch (error) {
      // Handle user rejection
      if (error.code === 4001 || error.message.includes('User rejected')) {
        if (window.toast) {
          window.toast.info('Connection request rejected');
        }
      } else if (error.message.includes('timeout')) {
        if (window.toast) {
          window.toast.error('Connection timeout. Please try again');
        }
      } else {
        // Sanitize error message for display
        const safeMessage = window.SecurityUtils
          ? window.SecurityUtils.escapeHTML(error.message.substring(0, 100))
          : 'Failed to connect wallet';

        if (window.toast) {
          window.toast.error(safeMessage);
        }

        if (window.Logger) {
          window.Logger.error('Wallet connection error:', error);
        }
      }

      return null;

    } finally {
      this.isConnecting = false;
    }
  },

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.connectedAddress = null;
    this.chainId = null;
    this.updateUI();

    if (window.toast) {
      window.toast.success('Wallet disconnected');
    }

    if (window.Logger) {
      window.Logger.info('Wallet disconnected');
    }
  },

  /**
   * Validate Ethereum address format
   */
  validateAddress(address) {
    if (!address || typeof address !== 'string') return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  /**
   * Format address for display (0x1234...5678)
   */
  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  /**
   * Mask address for logging (0x12**...***8)
   */
  maskAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 4)}**...***${address.substring(address.length - 1)}`;
  },

  /**
   * Update current chain ID
   */
  async updateChainId() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.chainId = parseInt(chainId, 16);
    } catch (error) {
      if (window.Logger) {
        window.Logger.error('Failed to get chain ID:', error);
      }
    }
  },

  /**
   * Switch to required network
   */
  async switchNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.config.requiredChainId.toString(16)}` }]
      });

      if (window.toast) {
        window.toast.success('Network switched successfully');
      }

      await this.updateChainId();

    } catch (error) {
      // Network doesn't exist, try to add it
      if (error.code === 4902) {
        await this.addNetwork();
      } else {
        if (window.toast) {
          window.toast.error('Failed to switch network');
        }

        if (window.Logger) {
          window.Logger.error('Network switch error:', error);
        }
      }
    }
  },

  /**
   * Add BSC network to MetaMask
   */
  async addNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-dataseed1.binance.org'],
          blockExplorerUrls: ['https://bscscan.com']
        }]
      });

      if (window.toast) {
        window.toast.success('BSC network added successfully');
      }

      await this.updateChainId();

    } catch (error) {
      if (window.toast) {
        window.toast.error('Failed to add network');
      }

      if (window.Logger) {
        window.Logger.error('Add network error:', error);
      }
    }
  },

  /**
   * Sign message securely
   */
  async signMessage(message) {
    if (!this.connectedAddress) {
      if (window.toast) {
        window.toast.warning('Please connect wallet first');
      }
      return null;
    }

    // Validate message
    if (!message || typeof message !== 'string') {
      if (window.toast) {
        window.toast.error('Invalid message to sign');
      }
      return null;
    }

    // Sanitize message
    const safeMessage = window.SecurityUtils
      ? window.SecurityUtils.escapeHTML(message)
      : message;

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [safeMessage, this.connectedAddress]
      });

      if (window.Logger) {
        window.Logger.info('Message signed successfully');
      }

      return signature;

    } catch (error) {
      const safeError = window.SecurityUtils
        ? window.SecurityUtils.escapeHTML(error.message)
        : 'Failed to sign message';

      if (window.toast) {
        window.toast.error(safeError);
      }

      if (window.Logger) {
        window.Logger.error('Sign message error:', error);
      }

      return null;
    }
  },

  /**
   * Handle account changes
   */
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // User disconnected
      this.disconnect();
    } else if (accounts[0] !== this.connectedAddress) {
      // Account changed
      this.connectedAddress = accounts[0];
      this.updateUI();

      if (window.toast) {
        window.toast.info(`Switched to ${this.formatAddress(accounts[0])}`);
      }

      if (window.Logger) {
        window.Logger.info('Account changed:', this.maskAddress(accounts[0]));
      }
    }
  },

  /**
   * Handle chain changes
   */
  handleChainChanged(chainIdHex) {
    this.chainId = parseInt(chainIdHex, 16);

    if (window.Logger) {
      window.Logger.info('Chain changed:', this.chainId);
    }

    // Reload page on chain change (recommended by MetaMask)
    window.location.reload();
  },

  /**
   * Handle disconnect
   */
  handleDisconnect() {
    this.disconnect();

    if (window.Logger) {
      window.Logger.info('Wallet disconnected by provider');
    }
  },

  /**
   * Update UI elements
   */
  updateUI() {
    const connectBtn = document.getElementById('connectWallet');
    if (!connectBtn) return;

    if (this.connectedAddress) {
      connectBtn.textContent = this.formatAddress(this.connectedAddress);
      connectBtn.classList.add('connected');
      connectBtn.disabled = false;

      // Change click handler to disconnect
      connectBtn.onclick = () => this.disconnect();
    } else {
      connectBtn.textContent = 'Connect Wallet';
      connectBtn.classList.remove('connected');
      connectBtn.disabled = false;

      // Change click handler to connect
      connectBtn.onclick = () => this.connect();
    }
  },

  /**
   * Get connection status
   */
  isConnected() {
    return this.connectedAddress !== null;
  },

  /**
   * Get current address
   */
  getAddress() {
    return this.connectedAddress;
  },

  /**
   * Get current chain ID
   */
  getChainId() {
    return this.chainId;
  }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalletSecure;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.WalletSecure = WalletSecure;

  // Auto-initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WalletSecure.init());
  } else {
    WalletSecure.init();
  }
}
