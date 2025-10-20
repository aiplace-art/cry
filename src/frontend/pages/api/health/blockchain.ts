// Blockchain Health Check API Endpoint
// Checks RPC node connectivity and blockchain sync status

import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Test RPC connectivity
    const start = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const gasPrice = await provider.getFeeData();
    const latency = Date.now() - start;

    res.status(200).json({
      status: 'healthy',
      latency,
      connected: true,
      details: {
        blockNumber,
        chainId: Number(network.chainId),
        gasPrice: gasPrice.gasPrice?.toString(),
        rpcUrl: rpcUrl.replace(/\/\/[^@]+@/, '//***@'), // Hide credentials
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      connected: false,
      error: error instanceof Error ? error.message : 'Blockchain connection failed',
    });
  }
}
