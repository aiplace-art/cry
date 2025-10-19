import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACTS = {
  HypeAI: '0x02B23B891b3A3717673291aD34EB67893A19D978',
  HypeAIPrivateSale: '0xFb7dd436646658e3E14C70c9F4E60aC38CB74696',
  MockUSDT: '0x284D311f0E4562a3a870720D97aa12c445922137',
  ChainlinkBNBUSD: '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526',
};

const PRIVATE_SALE_ABI = [
  'function buyWithBNB(address referrer) external payable',
  'function buyWithUSDT(uint256 amount, address referrer) external',
  'function claimTokens() external',
  'function getUserPurchases(address user) external view returns (tuple(uint256 amount, uint256 tokenAmount, uint256 timestamp, bool claimed)[])',
  'function getVestedAmount(address user) external view returns (uint256)',
  'function tokenPrice() external view returns (uint256)',
  'function saleStartTime() external view returns (uint256)',
  'function saleDuration() external view returns (uint256)',
  'function totalRaised() external view returns (uint256)',
];

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
];

export const usePrivateSale = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      // Check if already connected
      checkConnection();
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      checkConnection();
    }
  };

  const checkConnection = async () => {
    if (!provider) return;

    try {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const userSigner = await provider.getSigner();
        setSigner(userSigner);
        setAccount(accounts[0].address);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const connectWallet = async () => {
    if (!provider) {
      setError('No Web3 provider found. Please install MetaMask.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const accounts = await provider.send('eth_requestAccounts', []);
      const userSigner = await provider.getSigner();

      setSigner(userSigner);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Switch to BSC Testnet
      await switchToBSCTestnet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToBSCTestnet = async () => {
    if (!provider) return;

    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: '0x61' }]);
    } catch (switchError: any) {
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
  };

  const buyWithBNB = async (bnbAmount: string, referrer?: string) => {
    if (!signer) throw new Error('Wallet not connected');

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        signer
      );

      const referrerAddress = referrer || ethers.ZeroAddress;
      const tx = await contract.buyWithBNB(referrerAddress, {
        value: ethers.parseEther(bnbAmount),
      });

      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Failed to buy with BNB');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const buyWithUSDT = async (usdtAmount: string, referrer?: string) => {
    if (!signer) throw new Error('Wallet not connected');

    try {
      setIsLoading(true);
      setError(null);

      const usdtContract = new ethers.Contract(
        CONTRACTS.MockUSDT,
        ERC20_ABI,
        signer
      );

      const amount = ethers.parseUnits(usdtAmount, 18);

      // Check allowance
      const allowance = await usdtContract.allowance(account, CONTRACTS.HypeAIPrivateSale);

      if (allowance < amount) {
        const approveTx = await usdtContract.approve(CONTRACTS.HypeAIPrivateSale, amount);
        await approveTx.wait();
      }

      // Buy tokens
      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        signer
      );

      const referrerAddress = referrer || ethers.ZeroAddress;
      const tx = await contract.buyWithUSDT(amount, referrerAddress);

      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Failed to buy with USDT');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const claimTokens = async () => {
    if (!signer) throw new Error('Wallet not connected');

    try {
      setIsLoading(true);
      setError(null);

      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        signer
      );

      const tx = await contract.claimTokens();
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getVestedAmount = async (userAddress?: string) => {
    if (!provider) throw new Error('Provider not initialized');

    try {
      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        provider
      );

      const address = userAddress || account;
      if (!address) throw new Error('No address provided');

      const vested = await contract.getVestedAmount(address);
      return ethers.formatEther(vested);
    } catch (err: any) {
      setError(err.message || 'Failed to get vested amount');
      throw err;
    }
  };

  const getUserPurchases = async (userAddress?: string) => {
    if (!provider) throw new Error('Provider not initialized');

    try {
      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        provider
      );

      const address = userAddress || account;
      if (!address) throw new Error('No address provided');

      const purchases = await contract.getUserPurchases(address);
      return purchases;
    } catch (err: any) {
      setError(err.message || 'Failed to get user purchases');
      throw err;
    }
  };

  const getTokenBalance = async (tokenAddress: string, userAddress?: string) => {
    if (!provider) throw new Error('Provider not initialized');

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const address = userAddress || account;
      if (!address) throw new Error('No address provided');

      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (err: any) {
      setError(err.message || 'Failed to get token balance');
      throw err;
    }
  };

  const getSaleInfo = async () => {
    if (!provider) throw new Error('Provider not initialized');

    try {
      const contract = new ethers.Contract(
        CONTRACTS.HypeAIPrivateSale,
        PRIVATE_SALE_ABI,
        provider
      );

      const [tokenPrice, saleStartTime, saleDuration, totalRaised] = await Promise.all([
        contract.tokenPrice(),
        contract.saleStartTime(),
        contract.saleDuration(),
        contract.totalRaised(),
      ]);

      return {
        tokenPrice: ethers.formatEther(tokenPrice),
        saleStartTime: Number(saleStartTime),
        saleDuration: Number(saleDuration),
        totalRaised: ethers.formatEther(totalRaised),
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get sale info');
      throw err;
    }
  };

  return {
    provider,
    signer,
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    buyWithBNB,
    buyWithUSDT,
    claimTokens,
    getVestedAmount,
    getUserPurchases,
    getTokenBalance,
    getSaleInfo,
    contracts: CONTRACTS,
  };
};
