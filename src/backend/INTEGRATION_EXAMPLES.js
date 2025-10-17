/**
 * HypeAI Referral System - Integration Examples
 * Copy-paste ready code snippets for frontend integration
 */

// ==============================================
// 1. AXIOS CLIENT SETUP
// ==============================================

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==============================================
// 2. AUTHENTICATION SERVICE
// ==============================================

class AuthService {
  // Email/Password Registration
  async register(email, password, referrerCode = null) {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      referrerCode
    });

    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  // Email/Password Login
  async login(email, password) {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    const { token, user } = response.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  // Web3 Authentication with MetaMask
  async loginWithMetaMask(referrerCode = null) {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    const walletAddress = accounts[0];

    // Step 1: Get nonce
    const nonceResponse = await apiClient.post('/auth/web3/nonce', {
      walletAddress
    });

    const { nonce } = nonceResponse.data.data;

    // Step 2: Sign message
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [nonce, walletAddress]
    });

    // Step 3: Verify signature
    const verifyResponse = await apiClient.post('/auth/web3/verify', {
      walletAddress,
      signature,
      referrerCode
    });

    const { token, user } = verifyResponse.data.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  }

  // Logout
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Get stored user
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// ==============================================
// 3. REFERRAL SERVICE
// ==============================================

class ReferralService {
  // Get user's referral code
  async getMyReferralCode() {
    const response = await apiClient.get('/referral/code');
    return response.data.data;
  }

  // Get referral statistics
  async getStats() {
    const response = await apiClient.get('/referral/stats');
    return response.data.data;
  }

  // Get list of referrals
  async getReferralList(limit = 50, offset = 0) {
    const response = await apiClient.get('/referral/list', {
      params: { limit, offset }
    });
    return response.data.data;
  }

  // Get pending rewards
  async getPendingRewards() {
    const response = await apiClient.get('/referral/rewards/pending');
    return response.data.data;
  }

  // Claim rewards
  async claimRewards(rewardType, rewardIds) {
    const response = await apiClient.post('/referral/claim', {
      rewardType,
      rewardIds
    });
    return response.data.data;
  }

  // Get referral chain (multi-level)
  async getReferralChain(depth = 3) {
    const response = await apiClient.get('/referral/chain', {
      params: { depth }
    });
    return response.data.data;
  }

  // Validate referral code (public)
  async validateCode(code) {
    const response = await apiClient.get(`/referral/validate/${code}`);
    return response.data.data;
  }

  // Get leaderboard (public)
  async getLeaderboard(limit = 100) {
    const response = await apiClient.get('/referral/leaderboard', {
      params: { limit }
    });
    return response.data.data;
  }

  // Generate referral link
  generateReferralLink(referralCode, baseUrl = 'https://hypeai.io') {
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  // Share referral link
  async shareReferralLink(referralCode) {
    const link = this.generateReferralLink(referralCode);

    if (navigator.share) {
      await navigator.share({
        title: 'Join HypeAI',
        text: 'Join HypeAI and get bonus tokens!',
        url: link
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(link);
      alert('Referral link copied to clipboard!');
    }
  }
}

// ==============================================
// 4. PURCHASE SERVICE
// ==============================================

class PurchaseService {
  // Record purchase
  async recordPurchase(txHash, amountUsd, amountTokens, tokenPrice, referrerCode = null) {
    const response = await apiClient.post('/purchase/record', {
      txHash,
      amountUsd,
      amountTokens,
      tokenPrice,
      referrerCode
    });
    return response.data.data;
  }

  // Confirm purchase
  async confirmPurchase(purchaseId, blockNumber) {
    const response = await apiClient.post(`/purchase/confirm/${purchaseId}`, {
      blockNumber
    });
    return response.data.data;
  }

  // Get purchase history
  async getPurchaseHistory(limit = 50, offset = 0) {
    const response = await apiClient.get('/purchase/history', {
      params: { limit, offset }
    });
    return response.data.data;
  }

  // Verify blockchain transaction (public)
  async verifyTransaction(txHash) {
    const response = await apiClient.get(`/purchase/verify/${txHash}`);
    return response.data.data;
  }

  // Complete purchase flow with blockchain verification
  async completePurchaseFlow(txHash, amountUsd, amountTokens, tokenPrice) {
    // Step 1: Record purchase
    const purchase = await this.recordPurchase(
      txHash,
      amountUsd,
      amountTokens,
      tokenPrice
    );

    // Step 2: Wait for blockchain confirmation
    const txData = await this.waitForConfirmation(txHash);

    // Step 3: Confirm purchase
    await this.confirmPurchase(purchase.purchaseId, txData.blockNumber);

    return purchase;
  }

  // Wait for blockchain confirmation
  async waitForConfirmation(txHash, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const txData = await this.verifyTransaction(txHash);

        if (txData.status === 'success' && txData.confirmations >= 2) {
          return txData;
        }
      } catch (error) {
        // Transaction not found yet
      }

      // Wait 10 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error('Transaction confirmation timeout');
  }
}

// ==============================================
// 5. DASHBOARD SERVICE
// ==============================================

class DashboardService {
  // Get overview
  async getOverview() {
    const response = await apiClient.get('/dashboard/overview');
    return response.data.data;
  }

  // Get earnings breakdown
  async getEarnings() {
    const response = await apiClient.get('/dashboard/earnings');
    return response.data.data;
  }

  // Get referral analytics
  async getReferralAnalytics() {
    const response = await apiClient.get('/dashboard/referrals');
    return response.data.data;
  }

  // Get stats summary
  async getStatsSummary() {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
  }

  // Get recent activity
  async getRecentActivity(limit = 20) {
    const response = await apiClient.get('/dashboard/activity', {
      params: { limit }
    });
    return response.data.data;
  }
}

// ==============================================
// 6. REACT HOOKS EXAMPLES
// ==============================================

// Example: useAuth hook
function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const authService = new AuthService();

  React.useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setUser(user);
    return user;
  };

  const loginWithMetaMask = async (referrerCode) => {
    const user = await authService.loginWithMetaMask(referrerCode);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithMetaMask,
    logout
  };
}

// Example: useReferralStats hook
function useReferralStats() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const referralService = new ReferralService();

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await referralService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, reload: loadStats };
}

// ==============================================
// 7. REACT COMPONENT EXAMPLES
// ==============================================

// Login Component
function LoginComponent() {
  const { login, loginWithMetaMask } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleMetaMaskLogin = async () => {
    try {
      await loginWithMetaMask();
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login with Email</button>
      </form>

      <button onClick={handleMetaMaskLogin}>
        Login with MetaMask
      </button>
    </div>
  );
}

// Referral Dashboard Component
function ReferralDashboard() {
  const { stats, loading } = useReferralStats();
  const referralService = new ReferralService();

  const handleShare = async () => {
    if (stats) {
      await referralService.shareReferralLink(stats.referral_code);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Your Referral Dashboard</h2>

      <div>
        <h3>Referral Code: {stats.referral_code}</h3>
        <button onClick={handleShare}>Share</button>
      </div>

      <div>
        <p>Total Referrals: {stats.total_referrals}</p>
        <p>Total Earnings: ${stats.total_earnings}</p>
        <p>Pending Rewards: ${stats.pending_rewards}</p>
        <p>Claimed Rewards: ${stats.claimed_rewards}</p>
      </div>
    </div>
  );
}

// Rewards Claiming Component
function RewardsClaimingComponent() {
  const [rewards, setRewards] = React.useState([]);
  const [selectedRewards, setSelectedRewards] = React.useState([]);
  const referralService = new ReferralService();

  React.useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const data = await referralService.getPendingRewards();
    setRewards(data.rewards);
  };

  const handleClaim = async () => {
    if (selectedRewards.length === 0) {
      alert('Select rewards to claim');
      return;
    }

    try {
      await referralService.claimRewards('tokens', selectedRewards);
      alert('Rewards claimed successfully!');
      loadRewards();
      setSelectedRewards([]);
    } catch (error) {
      alert(error.response?.data?.error || 'Claim failed');
    }
  };

  return (
    <div>
      <h2>Pending Rewards</h2>

      {rewards.map((reward) => (
        <div key={reward.id}>
          <input
            type="checkbox"
            checked={selectedRewards.includes(reward.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRewards([...selectedRewards, reward.id]);
              } else {
                setSelectedRewards(selectedRewards.filter(id => id !== reward.id));
              }
            }}
          />
          <span>${reward.amount} from {reward.referred_user}</span>
        </div>
      ))}

      <button onClick={handleClaim} disabled={selectedRewards.length === 0}>
        Claim Selected Rewards
      </button>
    </div>
  );
}

// ==============================================
// 8. EXPORT SERVICES
// ==============================================

module.exports = {
  apiClient,
  AuthService,
  ReferralService,
  PurchaseService,
  DashboardService,
  // React hooks
  useAuth,
  useReferralStats,
  // React components
  LoginComponent,
  ReferralDashboard,
  RewardsClaimingComponent
};
