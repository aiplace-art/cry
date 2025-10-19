import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BNBButton } from '../ui/bnb';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  walletAddress?: string;
  onConnectWallet?: () => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'buy', label: 'Buy Tokens', icon: '💰' },
  { id: 'purchases', label: 'My Purchases', icon: '📦' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
  { id: 'referral', label: 'Referral', icon: '🎁' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab = 'overview',
  onTabChange,
  walletAddress,
  onConnectWallet,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14151A] via-[#1E2026] to-[#14151A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1E2026]/95 backdrop-blur-sm border-b border-[#848E9C]/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#14151A] text-[#EAECEF]"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F3BA2F] to-[#FCD535] rounded-full flex items-center justify-center font-bold text-[#14151A]">
                  H
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-[#EAECEF]">HypeAI</h1>
                  <p className="text-xs text-[#848E9C]">Private Sale</p>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {walletAddress ? (
                <div className="flex items-center gap-3 bg-[#14151A] px-4 py-2 rounded-lg border border-[#F3BA2F]/20">
                  <div className="w-2 h-2 bg-[#0ECB81] rounded-full animate-pulse"></div>
                  <span className="text-[#EAECEF] font-medium hidden sm:inline">
                    {shortenAddress(walletAddress)}
                  </span>
                  <svg className="w-5 h-5 text-[#F3BA2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              ) : (
                <BNBButton onClick={onConnectWallet} size="sm">
                  Connect Wallet
                </BNBButton>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#1E2026] border-r border-[#848E9C]/20 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange?.(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${activeTab === item.id
                        ? 'bg-gradient-to-r from-[#F3BA2F] to-[#FCD535] text-[#14151A] font-semibold shadow-lg shadow-[#F3BA2F]/20'
                        : 'text-[#EAECEF] hover:bg-[#14151A] hover:text-[#F3BA2F]'
                      }
                    `}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Stats Sidebar */}
              <div className="p-4 mt-6 border-t border-[#848E9C]/20">
                <div className="bg-gradient-to-br from-[#14151A] to-[#1E2026] p-4 rounded-xl border border-[#F3BA2F]/20">
                  <h3 className="text-sm font-semibold text-[#848E9C] mb-3">Sale Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-[#EAECEF] mb-1">
                        <span>Total Raised</span>
                        <span className="font-bold text-[#F3BA2F]">$2.4M</span>
                      </div>
                      <div className="w-full bg-[#14151A] rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#F3BA2F] to-[#FCD535] h-2 rounded-full" style={{ width: '48%' }}></div>
                      </div>
                    </div>
                    <div className="text-xs text-[#848E9C]">
                      Goal: $5M • 48% Complete
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-0 h-full w-64 bg-[#1E2026] border-r border-[#848E9C]/20 overflow-y-auto"
              >
                <div className="p-4 border-b border-[#848E9C]/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#EAECEF]">Menu</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-[#14151A] text-[#EAECEF]"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <nav className="p-4 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange?.(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${activeTab === item.id
                          ? 'bg-gradient-to-r from-[#F3BA2F] to-[#FCD535] text-[#14151A] font-semibold'
                          : 'text-[#EAECEF] hover:bg-[#14151A]'
                        }
                      `}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={`
            flex-1 transition-all duration-300
            ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
            pt-6 px-4 sm:px-6 lg:px-8 pb-12
          `}
        >
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1E2026] border-t border-[#848E9C]/20 z-40">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                ${activeTab === item.id
                  ? 'text-[#F3BA2F]'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[#848E9C] hover:text-[#EAECEF]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
