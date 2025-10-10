import { NextResponse } from 'next/server';
import { BlockchainService } from '../../../lib/blockchain';

export async function GET() {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
    const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';

    const blockchain = new BlockchainService(rpcUrl, tokenAddress);
    const data = await blockchain.getTokenData();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Token API error:', error);
    // Return mock data on error
    return NextResponse.json({
      totalSupply: '1000000000',
      holders: 1247,
      symbol: 'HYPE',
      name: 'HypeAI',
      decimals: 18,
      address: '0x...',
    });
  }
}
