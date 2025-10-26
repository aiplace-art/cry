/**
 * Complete TypeScript Example: HypeAI Token Purchase
 *
 * This example demonstrates:
 * - Authentication
 * - Error handling
 * - Token purchase
 * - WebSocket real-time updates
 * - Type safety
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  referralCode: string;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface PresaleInfo {
  currentRound: number;
  totalRounds: number;
  tokenPrice: number;
  tokensAvailable: number;
  tokensSold: number;
  raisedAmount: number;
  startDate: string;
  endDate: string;
  bonus: number;
}

interface PurchaseRequest {
  amount: number;
  paymentMethod: 'bnb' | 'usdt' | 'card';
  referralCode?: string;
}

interface PurchaseResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  tokens: number;
  paymentAddress?: string;
  expiresAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'referral' | 'bonus';
  amount: number;
  tokens: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  txHash?: string;
  createdAt: string;
}

interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// ============================================================================
// API Client Class
// ============================================================================

class HypeAIClient {
  private api: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = 'https://api.hypeai.io/v1') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  // Setup request/response interceptors
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token expiration
        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            await this.refreshAccessToken();
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            throw refreshError;
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;

          await this.delay(delay);
          return this.api(originalRequest);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  // Format API errors
  private formatError(error: AxiosError): Error {
    if (error.response?.data) {
      const apiError = (error.response.data as any).error as APIError;
      const err = new Error(apiError.message);
      (err as any).code = apiError.code;
      (err as any).details = apiError.details;
      return err;
    }

    return error;
  }

  // Utility: Delay promise
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // Authentication Methods
  // ============================================================================

  async register(
    email: string,
    password: string,
    username: string,
    referralCode?: string
  ): Promise<User> {
    const response = await this.api.post<AuthResponse>('/auth/register', {
      email,
      password,
      username,
      referralCode
    });

    this.setTokens(response.data.token, response.data.refreshToken);
    return response.data.user;
  }

  async login(email: string, password: string): Promise<User> {
    const response = await this.api.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    this.setTokens(response.data.token, response.data.refreshToken);
    return response.data.user;
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<{ token: string }>(
      '/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${this.refreshToken}`
        }
      }
    );

    this.token = response.data.token;
    return response.data.token;
  }

  logout(): void {
    this.clearTokens();
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.token = accessToken;
    this.refreshToken = refreshToken;

    // Store in localStorage (or secure storage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // ============================================================================
  // Presale Methods
  // ============================================================================

  async getPresaleInfo(): Promise<PresaleInfo> {
    const response = await this.api.get<PresaleInfo>('/tokens/presale');
    return response.data;
  }

  async purchaseTokens(
    request: PurchaseRequest
  ): Promise<PurchaseResponse> {
    const response = await this.api.post<PurchaseResponse>(
      '/tokens/purchase',
      request
    );
    return response.data;
  }

  // ============================================================================
  // User Methods
  // ============================================================================

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/users/me');
    return response.data;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.api.patch<User>('/users/me', updates);
    return response.data;
  }

  // ============================================================================
  // Transaction Methods
  // ============================================================================

  async getTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await this.api.get('/analytics/transactions', {
      params: { page, limit }
    });
    return response.data;
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await this.api.get<Transaction>(
      `/analytics/transactions/${id}`
    );
    return response.data;
  }
}

// ============================================================================
// WebSocket Client Class
// ============================================================================

class HypeAIWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  constructor(
    private url: string,
    token: string
  ) {
    this.token = token;
    this.connect();
  }

  private connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.emit('connect', null);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.data);
        this.emit('message', message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnect', null);

      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };
  }

  private authenticate(): void {
    this.send({
      type: 'auth',
      token: this.token
    });
  }

  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  subscribe(channels: string[]): void {
    this.send({
      type: 'subscribe',
      channels
    });
  }

  unsubscribe(channels: string[]): void {
    this.send({
      type: 'unsubscribe',
      channels
    });
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}

// ============================================================================
// Usage Example
// ============================================================================

async function main() {
  const client = new HypeAIClient();

  try {
    // 1. Register/Login
    console.log('📝 Registering user...');
    const user = await client.register(
      'demo@example.com',
      'SecurePass123!',
      'demouser',
      'REF123' // optional referral code
    );
    console.log('✅ User registered:', user);

    // 2. Get presale information
    console.log('\n📊 Fetching presale info...');
    const presale = await client.getPresaleInfo();
    console.log('Current price:', presale.tokenPrice);
    console.log('Tokens available:', presale.tokensAvailable);
    console.log('Bonus:', presale.bonus, '%');

    // 3. Purchase tokens
    console.log('\n💰 Purchasing tokens...');
    const purchase = await client.purchaseTokens({
      amount: 1000,
      paymentMethod: 'bnb'
    });
    console.log('✅ Purchase successful!');
    console.log('Transaction ID:', purchase.transactionId);
    console.log('Tokens:', purchase.tokens);
    console.log('Payment address:', purchase.paymentAddress);

    // 4. Connect to WebSocket for real-time updates
    console.log('\n🌐 Connecting to WebSocket...');
    const ws = new HypeAIWebSocket(
      'wss://api.hypeai.io/v1/ws',
      client['token']! // Access private token
    );

    ws.on('connect', () => {
      console.log('✅ WebSocket connected');
      ws.subscribe(['presale_updates', 'transactions']);
    });

    ws.on('presale_update', (data) => {
      console.log('📊 Presale update:', {
        tokensSold: data.tokensSold,
        raisedAmount: data.raisedAmount
      });
    });

    ws.on('transaction_complete', (data) => {
      console.log('✅ Transaction completed:', {
        id: data.transactionId,
        tokens: data.tokens,
        status: data.status
      });
    });

    // 5. Get transaction history
    console.log('\n📜 Fetching transactions...');
    const { transactions, total } = await client.getTransactions(1, 10);
    console.log(`Found ${total} transactions`);
    transactions.forEach(tx => {
      console.log(`- ${tx.id}: ${tx.tokens} tokens (${tx.status})`);
    });

    // Keep alive for WebSocket messages
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Cleanup
    ws.disconnect();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { HypeAIClient, HypeAIWebSocket };
