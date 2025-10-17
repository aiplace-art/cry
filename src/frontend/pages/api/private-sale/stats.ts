import type { NextApiRequest, NextApiResponse } from 'next';

interface StatsResponse {
  currentAmount: number;
  totalInvestors: number;
  averagePurchase: number;
  lastUpdated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      currentAmount: 0,
      totalInvestors: 0,
      averagePurchase: 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  try {
    // In production, fetch from database
    // const stats = await db.purchases.aggregate({
    //   totalAmount: { $sum: 'amount' },
    //   totalInvestors: { $count: 'DISTINCT walletAddress' },
    //   averagePurchase: { $avg: 'amount' },
    // });

    // Mock data for demonstration
    const stats = {
      currentAmount: 2847500, // $2.85M raised
      totalInvestors: 1247,
      averagePurchase: 2280,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return res.status(500).json({
      currentAmount: 0,
      totalInvestors: 0,
      averagePurchase: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
}
