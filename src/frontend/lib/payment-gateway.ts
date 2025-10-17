/**
 * Payment Gateway Integration
 *
 * This module provides integration with cryptocurrency payment gateways:
 * - Coinbase Commerce
 * - NOWPayments
 * - CoinGate
 */

import { PaymentMethod } from '../types/private-sale';

// Coinbase Commerce Integration
export class CoinbaseCommerce {
  private apiKey: string;
  private baseUrl = 'https://api.commerce.coinbase.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCharge(params: {
    name: string;
    description: string;
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
  }) {
    const response = await fetch(`${this.baseUrl}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': this.apiKey,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: params.amount.toString(),
          currency: params.currency,
        },
        metadata: params.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Coinbase Commerce charge');
    }

    return response.json();
  }

  async getCharge(chargeId: string) {
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': this.apiKey,
        'X-CC-Version': '2018-03-22',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch charge');
    }

    return response.json();
  }
}

// NOWPayments Integration
export class NOWPayments {
  private apiKey: string;
  private baseUrl = 'https://api.nowpayments.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPayment(params: {
    price_amount: number;
    price_currency: string;
    pay_currency: string;
    ipn_callback_url?: string;
    order_id: string;
    order_description: string;
  }) {
    const response = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create NOWPayments payment');
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    return response.json();
  }

  async getAvailableCurrencies() {
    const response = await fetch(`${this.baseUrl}/currencies`, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch currencies');
    }

    return response.json();
  }
}

// CoinGate Integration
export class CoinGate {
  private apiKey: string;
  private baseUrl: string;
  private isSandbox: boolean;

  constructor(apiKey: string, sandbox = false) {
    this.apiKey = apiKey;
    this.isSandbox = sandbox;
    this.baseUrl = sandbox
      ? 'https://api-sandbox.coingate.com/v2'
      : 'https://api.coingate.com/v2';
  }

  async createOrder(params: {
    price_amount: number;
    price_currency: string;
    receive_currency: string;
    callback_url?: string;
    cancel_url?: string;
    success_url?: string;
    order_id: string;
    description: string;
  }) {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create CoinGate order');
    }

    return response.json();
  }

  async getOrder(orderId: number) {
    const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
      headers: {
        'Authorization': `Token ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  }
}

// Factory function to get the appropriate payment gateway
export function getPaymentGateway(gateway: 'coinbase' | 'nowpayments' | 'coingate') {
  switch (gateway) {
    case 'coinbase':
      return new CoinbaseCommerce(
        process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY || ''
      );
    case 'nowpayments':
      return new NOWPayments(
        process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY || ''
      );
    case 'coingate':
      return new CoinGate(
        process.env.NEXT_PUBLIC_COINGATE_API_KEY || '',
        process.env.NODE_ENV === 'development'
      );
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
}

// Helper function to convert payment method to gateway currency code
export function getGatewayCurrencyCode(paymentMethod: PaymentMethod): string {
  const currencyMap: Record<string, string> = {
    eth: 'ETH',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    sol: 'SOL',
  };

  return currencyMap[paymentMethod.id] || paymentMethod.symbol;
}
