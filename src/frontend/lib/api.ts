import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Token API
export const tokenApi = {
  getTokenData: (address: string) =>
    apiClient.get(`/token/${address}`),

  getTokenPrice: (symbol: string) =>
    apiClient.get(`/token/price/${symbol}`),

  getTokenHistory: (address: string, timeframe: string) =>
    apiClient.get(`/token/${address}/history`, { params: { timeframe } }),

  getTopHolders: (address: string) =>
    apiClient.get(`/token/${address}/holders`),
};

// Staking API
export const stakingApi = {
  getStakingStats: (address: string) =>
    apiClient.get(`/staking/${address}/stats`),

  getUserStaking: (stakingAddress: string, userAddress: string) =>
    apiClient.get(`/staking/${stakingAddress}/user/${userAddress}`),

  getStakingHistory: (userAddress: string) =>
    apiClient.get(`/staking/history/${userAddress}`),
};

// AI API
export const aiApi = {
  getInsights: (symbol: string) =>
    apiClient.get(`/ai/insights/${symbol}`),

  getPrediction: (symbol: string, timeframe: string) =>
    apiClient.get(`/ai/prediction/${symbol}`, { params: { timeframe } }),

  getSentiment: (symbol: string) =>
    apiClient.get(`/ai/sentiment/${symbol}`),
};

// Analytics API
export const analyticsApi = {
  getChartData: (symbol: string, timeframe: string) =>
    apiClient.get(`/analytics/chart/${symbol}`, { params: { timeframe } }),

  getMarketMetrics: () =>
    apiClient.get('/analytics/metrics'),

  getVolume: (symbol: string, period: string) =>
    apiClient.get(`/analytics/volume/${symbol}`, { params: { period } }),
};

// Governance API
export const governanceApi = {
  getProposals: () =>
    apiClient.get('/governance/proposals'),

  getProposal: (id: string) =>
    apiClient.get(`/governance/proposals/${id}`),

  vote: (proposalId: string, support: boolean, signature: string) =>
    apiClient.post(`/governance/proposals/${proposalId}/vote`, { support, signature }),
};

// User API
export const userApi = {
  getProfile: (address: string) =>
    apiClient.get(`/user/${address}`),

  updateProfile: (address: string, data: any) =>
    apiClient.put(`/user/${address}`, data),

  getTransactions: (address: string) =>
    apiClient.get(`/user/${address}/transactions`),
};

// Websocket connection helper
export const createWebSocketConnection = () => {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  return new WebSocket(WS_URL);
};
