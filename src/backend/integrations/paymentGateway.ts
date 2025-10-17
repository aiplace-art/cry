import axios from 'axios';
import crypto from 'crypto';
import { PaymentMethod, PaymentGateway, PaymentResponse } from '../types/privateSale.types';

interface PaymentConfig {
  gateway: PaymentGateway;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export class PaymentGatewayService {
  private coinbaseConfig: PaymentConfig;
  private nowpaymentsConfig: PaymentConfig;
  private coingateConfig: PaymentConfig;

  constructor() {
    this.coinbaseConfig = {
      gateway: PaymentGateway.COINBASE,
      apiKey: process.env.COINBASE_API_KEY || '',
      secretKey: process.env.COINBASE_SECRET || '',
      webhookSecret: process.env.COINBASE_WEBHOOK_SECRET || ''
    };

    this.nowpaymentsConfig = {
      gateway: PaymentGateway.NOWPAYMENTS,
      apiKey: process.env.NOWPAYMENTS_API_KEY || '',
      secretKey: process.env.NOWPAYMENTS_SECRET || '',
      webhookSecret: process.env.NOWPAYMENTS_IPN_SECRET || ''
    };

    this.coingateConfig = {
      gateway: PaymentGateway.COINGATE,
      apiKey: process.env.COINGATE_API_KEY || '',
      secretKey: process.env.COINGATE_SECRET || ''
    };
  }

  async createPayment(
    amountUSD: number,
    paymentMethod: PaymentMethod,
    metadata: any
  ): Promise<PaymentResponse> {
    // Select gateway based on payment method
    const gateway = this.selectGateway(paymentMethod);

    switch (gateway) {
      case PaymentGateway.COINBASE:
        return this.createCoinbasePayment(amountUSD, paymentMethod, metadata);
      case PaymentGateway.NOWPAYMENTS:
        return this.createNOWPaymentsPayment(amountUSD, paymentMethod, metadata);
      case PaymentGateway.COINGATE:
        return this.createCoinGatePayment(amountUSD, paymentMethod, metadata);
      default:
        throw new Error('Unsupported payment gateway');
    }
  }

  private selectGateway(paymentMethod: PaymentMethod): PaymentGateway {
    // Route different payment methods to appropriate gateways
    if (paymentMethod === PaymentMethod.CARD) {
      return PaymentGateway.COINBASE;
    }
    if (paymentMethod === PaymentMethod.BTC) {
      return PaymentGateway.NOWPAYMENTS;
    }
    return PaymentGateway.COINGATE;
  }

  private async createCoinbasePayment(
    amountUSD: number,
    paymentMethod: PaymentMethod,
    metadata: any
  ): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        'https://api.commerce.coinbase.com/charges',
        {
          name: 'Token Private Sale',
          description: `Purchase of ${metadata.tokens} tokens`,
          pricing_type: 'fixed_price',
          local_price: {
            amount: amountUSD.toFixed(2),
            currency: 'USD'
          },
          metadata: {
            wallet_address: metadata.walletAddress,
            purchase_id: metadata.purchaseId,
            referral_code: metadata.referralCode
          }
        },
        {
          headers: {
            'X-CC-Api-Key': this.coinbaseConfig.apiKey,
            'X-CC-Version': '2018-03-22',
            'Content-Type': 'application/json'
          }
        }
      );

      const charge = response.data.data;

      return {
        paymentId: charge.id,
        paymentUrl: charge.hosted_url,
        paymentAddress: charge.addresses?.[paymentMethod.toLowerCase()] || '',
        amount: amountUSD,
        currency: paymentMethod,
        expiresAt: new Date(charge.expires_at)
      };
    } catch (error: any) {
      console.error('Coinbase payment creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Coinbase payment');
    }
  }

  private async createNOWPaymentsPayment(
    amountUSD: number,
    paymentMethod: PaymentMethod,
    metadata: any
  ): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        'https://api.nowpayments.io/v1/payment',
        {
          price_amount: amountUSD,
          price_currency: 'usd',
          pay_currency: paymentMethod.toLowerCase(),
          order_id: metadata.purchaseId,
          order_description: `Token purchase - ${metadata.tokens} tokens`,
          ipn_callback_url: `${process.env.API_URL}/api/private-sale/webhook/nowpayments`,
          success_url: `${process.env.FRONTEND_URL}/purchase/success`,
          cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`
        },
        {
          headers: {
            'x-api-key': this.nowpaymentsConfig.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const payment = response.data;

      return {
        paymentId: payment.payment_id,
        paymentUrl: payment.invoice_url || '',
        paymentAddress: payment.pay_address,
        amount: payment.pay_amount,
        currency: paymentMethod,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      };
    } catch (error: any) {
      console.error('NOWPayments creation error:', error.response?.data || error.message);
      throw new Error('Failed to create NOWPayments payment');
    }
  }

  private async createCoinGatePayment(
    amountUSD: number,
    paymentMethod: PaymentMethod,
    metadata: any
  ): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        'https://api.coingate.com/v2/orders',
        {
          order_id: metadata.purchaseId,
          price_amount: amountUSD,
          price_currency: 'USD',
          receive_currency: paymentMethod,
          title: 'Token Private Sale',
          description: `Purchase of ${metadata.tokens} tokens`,
          callback_url: `${process.env.API_URL}/api/private-sale/webhook/coingate`,
          success_url: `${process.env.FRONTEND_URL}/purchase/success`,
          cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`
        },
        {
          headers: {
            Authorization: `Token ${this.coingateConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const order = response.data;

      return {
        paymentId: order.id.toString(),
        paymentUrl: order.payment_url,
        paymentAddress: order.payment_address || '',
        amount: amountUSD,
        currency: paymentMethod,
        expiresAt: new Date(order.expire_at)
      };
    } catch (error: any) {
      console.error('CoinGate payment creation error:', error.response?.data || error.message);
      throw new Error('Failed to create CoinGate payment');
    }
  }

  async verifyWebhook(
    gateway: PaymentGateway,
    signature: string,
    payload: any
  ): Promise<boolean> {
    switch (gateway) {
      case PaymentGateway.COINBASE:
        return this.verifyCoinbaseWebhook(signature, payload);
      case PaymentGateway.NOWPAYMENTS:
        return this.verifyNOWPaymentsWebhook(signature, payload);
      case PaymentGateway.COINGATE:
        return this.verifyCoinGateWebhook(signature, payload);
      default:
        return false;
    }
  }

  private verifyCoinbaseWebhook(signature: string, payload: any): boolean {
    const secret = this.coinbaseConfig.webhookSecret;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    return hash === signature;
  }

  private verifyNOWPaymentsWebhook(signature: string, payload: any): boolean {
    const secret = this.nowpaymentsConfig.webhookSecret;
    const sorted = this.sortObject(payload);
    const hash = crypto
      .createHmac('sha512', secret || '')
      .update(JSON.stringify(sorted))
      .digest('hex');
    return hash === signature;
  }

  private verifyCoinGateWebhook(signature: string, payload: any): boolean {
    // CoinGate uses token-based verification
    return true; // Implement based on CoinGate's specific requirements
  }

  private sortObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(this.sortObject);

    return Object.keys(obj)
      .sort()
      .reduce((result: any, key) => {
        result[key] = this.sortObject(obj[key]);
        return result;
      }, {});
  }

  async getPaymentStatus(paymentId: string, gateway: PaymentGateway): Promise<string> {
    switch (gateway) {
      case PaymentGateway.COINBASE:
        return this.getCoinbasePaymentStatus(paymentId);
      case PaymentGateway.NOWPAYMENTS:
        return this.getNOWPaymentsStatus(paymentId);
      case PaymentGateway.COINGATE:
        return this.getCoinGateStatus(paymentId);
      default:
        throw new Error('Unsupported gateway');
    }
  }

  private async getCoinbasePaymentStatus(chargeId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.commerce.coinbase.com/charges/${chargeId}`,
        {
          headers: {
            'X-CC-Api-Key': this.coinbaseConfig.apiKey,
            'X-CC-Version': '2018-03-22'
          }
        }
      );
      return response.data.data.timeline[response.data.data.timeline.length - 1].status;
    } catch (error) {
      throw new Error('Failed to get Coinbase payment status');
    }
  }

  private async getNOWPaymentsStatus(paymentId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.nowpayments.io/v1/payment/${paymentId}`,
        {
          headers: {
            'x-api-key': this.nowpaymentsConfig.apiKey
          }
        }
      );
      return response.data.payment_status;
    } catch (error) {
      throw new Error('Failed to get NOWPayments status');
    }
  }

  private async getCoinGateStatus(orderId: string): Promise<string> {
    try {
      const response = await axios.get(
        `https://api.coingate.com/v2/orders/${orderId}`,
        {
          headers: {
            Authorization: `Token ${this.coingateConfig.apiKey}`
          }
        }
      );
      return response.data.status;
    } catch (error) {
      throw new Error('Failed to get CoinGate status');
    }
  }
}

export const paymentGateway = new PaymentGatewayService();
