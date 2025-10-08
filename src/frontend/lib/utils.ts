import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ethers } from 'ethers';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTokenAmount(amount: string | number, decimals: number = 18): string {
  const value = typeof amount === 'string' ? ethers.parseUnits(amount, decimals) : amount;
  return ethers.formatUnits(value, decimals);
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}

export function calculateAPY(
  stakingAmount: number,
  rewardRate: number,
  duration: number
): number {
  if (stakingAmount === 0) return 0;
  const periodsPerYear = 365 / duration;
  const periodReturn = rewardRate / 100;
  return ((1 + periodReturn) ** periodsPerYear - 1) * 100;
}

export function formatTimeRemaining(endTime: number): string {
  const now = Date.now() / 1000;
  const remaining = endTime - now;

  if (remaining <= 0) return 'Ended';

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    5: 'Goerli',
    137: 'Polygon',
    80001: 'Mumbai',
    56: 'BSC',
    97: 'BSC Testnet',
  };
  return chains[chainId] || `Chain ${chainId}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
