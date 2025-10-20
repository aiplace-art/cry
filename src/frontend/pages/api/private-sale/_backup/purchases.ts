import type { NextApiRequest, NextApiResponse } from 'next';
import { Purchase } from '../../../types/private-sale';

interface PurchasesResponse {
  purchases: Purchase[];
  total: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PurchasesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ purchases: [], total: 0 });
  }

  try {
    const { wallet } = req.query;

    if (!wallet || typeof wallet !== 'string') {
      return res.status(400).json({ purchases: [], total: 0 });
    }

    // In production, fetch from database
    // const purchases = await db.purchases.find({
    //   walletAddress: wallet.toLowerCase(),
    // }).sort({ createdAt: -1 });

    // Mock data for demonstration
    const mockPurchases: Purchase[] = [
      {
        id: 'purchase_1',
        amount: 1000,
        currency: 'USDT',
        tokensReceived: 20000,
        bonusTokens: 3000,
        totalTokens: 23000,
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'completed',
        timestamp: new Date(Date.now() - 86400000),
        walletAddress: wallet.toLowerCase(),
      },
      {
        id: 'purchase_2',
        amount: 500,
        currency: 'ETH',
        tokensReceived: 10000,
        bonusTokens: 1000,
        totalTokens: 11000,
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        status: 'completed',
        timestamp: new Date(Date.now() - 172800000),
        walletAddress: wallet.toLowerCase(),
      },
    ];

    return res.status(200).json({
      purchases: mockPurchases,
      total: mockPurchases.length,
    });
  } catch (error) {
    console.error('Purchases fetch error:', error);
    return res.status(500).json({ purchases: [], total: 0 });
  }
}
