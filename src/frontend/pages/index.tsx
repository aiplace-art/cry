'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { WalletConnect } from '@/components/WalletConnect';
import { TokenDashboard } from '@/components/TokenDashboard';
import { StakingInterface } from '@/components/StakingInterface';
import { TradingChart } from '@/components/TradingChart';
import { AIInsights } from '@/components/AIInsights';
import { GovernanceVoting } from '@/components/GovernanceVoting';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  LayoutDashboard,
  Lock,
  TrendingUp,
  Brain,
  Vote,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

type Tab = 'dashboard' | 'staking' | 'trading' | 'insights' | 'governance';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected } = useWeb3();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staking' as Tab, label: 'Staking', icon: Lock },
    { id: 'trading' as Tab, label: 'Trading', icon: TrendingUp },
    { id: 'insights' as Tab, label: 'AI Insights', icon: Brain },
    { id: 'governance' as Tab, label: 'Governance', icon: Vote },
  ];

  return (
    <>
      <Head>
        <title>Crypto dApp - Modern Web3 Interface</title>
        <meta name="description" content="Modern dApp with staking, trading, and governance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Ð</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Crypto dApp
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Web3</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-primary text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <div className="hidden md:block">
                  <WalletConnect />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-primary text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
                <div className="pt-2">
                  <WalletConnect />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {!isConnected && (
            <div className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-center">
                Please connect your wallet to access dApp features
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && CONTRACT_ADDRESSES.TOKEN && (
            <TokenDashboard tokenAddress={CONTRACT_ADDRESSES.TOKEN} />
          )}

          {activeTab === 'staking' && CONTRACT_ADDRESSES.STAKING && (
            <StakingInterface
              stakingAddress={CONTRACT_ADDRESSES.STAKING}
              tokenSymbol="TOKEN"
            />
          )}

          {activeTab === 'trading' && (
            <TradingChart tokenSymbol="TOKEN" />
          )}

          {activeTab === 'insights' && <AIInsights />}

          {activeTab === 'governance' && <GovernanceVoting />}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 Crypto dApp. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Documentation
                </a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  GitHub
                </a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Discord
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
