import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { MobileNavigation } from './MobileNavigation';
import { SwipeableStatsCards } from './SwipeableStatsCard';
import { MobileBuyPanel } from './MobileBuyPanel';
import { useResponsive } from '../../../hooks/useMediaQuery';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components for better performance
const MobileChart = lazy(() => import('./MobileChart').then(module => ({ default: module.MobileChart })));

interface MobileDashboardProps {
  tokenPrice?: number;
  totalRaised?: number;
  participants?: number;
  timeRemaining?: string;
}

export function MobileDashboard({
  tokenPrice = 0.0012,
  totalRaised = 125430,
  participants = 1247,
  timeRemaining = '5d 12h',
}: MobileDashboardProps) {
  const { isMobile, isTouchDevice, minTouchTarget } = useResponsive();

  if (!isMobile) {
    return null; // Desktop version will be shown instead
  }

  return (
    <div className="min-h-screen-safe bg-gray-50 dark:bg-gray-950 overscroll-none">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Main Content */}
      <motion.main
        className="pt-16 pb-24 px-4 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Section */}
        <section className="pt-4">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Private Sale
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get up to 30% bonus tokens
            </p>
          </motion.div>

          {/* Swipeable Stats Cards */}
          <SwipeableStatsCards />
        </section>

        {/* Progress Bar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sale Progress
              </span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                42%
              </span>
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '42%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ${totalRaised.toLocaleString()} raised
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                $300,000 goal
              </span>
            </div>
          </div>
        </motion.section>

        {/* Price Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Suspense fallback={
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          }>
            <MobileChart />
          </Suspense>
        </motion.section>

        {/* Buy Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MobileBuyPanel
            minInvestment={100}
            maxInvestment={50000}
            bonusPercentage={25}
            tokenPrice={tokenPrice}
          />
        </motion.section>

        {/* Features Grid */}
        <motion.section
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FeatureCard
            title="Secure"
            description="Audited smart contracts"
            icon="🔒"
          />
          <FeatureCard
            title="Vesting"
            description="6-month lock period"
            icon="⏰"
          />
          <FeatureCard
            title="Bonus"
            description="Up to 30% extra"
            icon="🎁"
          />
          <FeatureCard
            title="Support"
            description="24/7 assistance"
            icon="💬"
          />
        </motion.section>

        {/* Trust Indicators */}
        <motion.section
          className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4">Why Choose HYPE?</h3>
          <ul className="space-y-3">
            <TrustItem text="Certified smart contract audit" />
            <TrustItem text="Experienced development team" />
            <TrustItem text="Transparent tokenomics" />
            <TrustItem text="Active community support" />
          </ul>
        </motion.section>
      </motion.main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-sm">{text}</span>
    </li>
  );
}
