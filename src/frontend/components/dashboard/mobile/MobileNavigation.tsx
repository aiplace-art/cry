import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  TrendingUp,
  Wallet,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, href: '/dashboard' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, href: '/wallet' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function MobileNavigation() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top Hamburger Menu */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary-600 to-secondary-600 safe-area-inset-top"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm touch-manipulation no-tap-highlight"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>

          <h1 className="text-xl font-bold text-white">HYPE Dashboard</h1>

          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </motion.header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.nav
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 shadow-2xl safe-area-inset-left safe-area-inset-top safe-area-inset-bottom"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-6 py-4 text-left touch-manipulation no-tap-highlight hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      style={{ minHeight: '60px' }}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center flex-1 gap-1 py-2 touch-manipulation no-tap-highlight relative"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label={item.label}
              >
                <div className={`relative ${isActive ? 'text-primary-600' : 'text-gray-400'} transition-colors`}>
                  <item.icon className="w-6 h-6" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-gray-400'} transition-colors`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
