import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  DashboardLayout,
  DashboardOverview,
  BuyTokensPanel,
  MyPurchases,
  WalletPanel,
  ReferralDashboardBNB,
} from '../components/dashboard';

// Mock data for development
const mockPurchases = [
  {
    id: '1',
    date: '2025-10-15',
    amount: 2.5,
    paymentMethod: 'BNB' as const,
    tokenAmount: 58000,
    bonusTokens: 11600,
    totalTokens: 69600,
    vestedTokens: 46400,
    claimedTokens: 23200,
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  {
    id: '2',
    date: '2025-09-20',
    amount: 5000,
    paymentMethod: 'USDT' as const,
    tokenAmount: 200000,
    bonusTokens: 46000,
    totalTokens: 246000,
    vestedTokens: 164000,
    claimedTokens: 82000,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
];

const mockReferralStats = {
  totalReferrals: 12,
  totalEarnedUSDT: 2450.00,
  totalEarnedHYPE: 98000,
  pendingRewards: 500.00,
  level: 'Gold',
  bonusMultiplier: 1.5,
  levelProgress: 12,
  nextLevelThreshold: 20,
  milestoneRewards: 0,
};

const mockReferralLink = {
  code: 'HYPE-XYZ123',
  url: 'https://hypeai.io/presale?ref=HYPE-XYZ123',
  clicks: 145,
  conversions: 12,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock balances
  const [balances] = useState({
    hype: 315600,
    bnb: 1.234,
    usdt: 850.00,
  });

  const [prices] = useState({
    hype: 0.025,
    bnb: 580,
    usdt: 1,
  });

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0].address);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to connect your wallet!');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);

        // Switch to BSC Testnet if not already
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: '0x61' }]);
        } catch (switchError: any) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await provider.send('wallet_addEthereumChain', [
              {
                chainId: '0x61',
                chainName: 'BSC Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com/'],
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePurchase = async (amount: number, paymentMethod: 'BNB' | 'USDT') => {
    console.log('Purchase:', amount, paymentMethod);
    alert(`Purchase initiated: ${amount} ${paymentMethod}`);
  };

  const handleClaim = async (purchaseId: string) => {
    console.log('Claim:', purchaseId);
    alert(`Claiming tokens for purchase ${purchaseId}`);
  };

  const handleWithdraw = async (token: string) => {
    console.log('Withdraw:', token);
    alert(`Withdraw ${token} feature coming soon!`);
  };

  const handleDeposit = async (token: string) => {
    console.log('Deposit:', token);
    alert(`Deposit ${token} feature coming soon!`);
  };

  const handleBuyTokens = () => {
    setActiveTab('buy');
  };

  const handleClaimTokens = () => {
    setActiveTab('purchases');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            totalInvested={7500}
            tokensOwned={315600}
            vestingProgress={67}
            referralEarnings={2450}
            onBuyTokens={handleBuyTokens}
            onClaimTokens={handleClaimTokens}
          />
        );

      case 'buy':
        return (
          <BuyTokensPanel
            bnbPrice={prices.bnb}
            usdtPrice={prices.usdt}
            tokenPrice={prices.hype}
            onPurchase={handlePurchase}
          />
        );

      case 'purchases':
        return (
          <MyPurchases
            purchases={mockPurchases}
            onClaim={handleClaim}
          />
        );

      case 'wallet':
        return (
          <WalletPanel
            balances={balances}
            prices={prices}
            onWithdraw={handleWithdraw}
            onDeposit={handleDeposit}
          />
        );

      case 'referral':
        return (
          <ReferralDashboardBNB
            userId={walletAddress || 'guest'}
            stats={mockReferralStats}
            link={mockReferralLink}
            onRefresh={() => console.log('Refresh referral stats')}
          />
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      walletAddress={walletAddress}
      onConnectWallet={connectWallet}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
