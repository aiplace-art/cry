import React, { useState, useEffect, lazy, Suspense } from 'react';
import { MobileNav } from './MobileNav';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { registerServiceWorker, setupAutoUpdate, isOnline, addOfflineListener, addOnlineListener } from '../../utils/pwa';

// Lazy load heavy components
const MobileReferralDashboard = lazy(() =>
  import('./MobileReferralDashboard').then((module) => ({ default: module.MobileReferralDashboard }))
);
const MobileReferralList = lazy(() =>
  import('./MobileReferralList').then((module) => ({ default: module.MobileReferralList }))
);
const ClaimRewards = lazy(() => import('./ClaimRewards').then((module) => ({ default: module.ClaimRewards })));
const ReferralSettings = lazy(() =>
  import('./ReferralSettings').then((module) => ({ default: module.ReferralSettings }))
);

interface MobileOptimizedAppProps {
  userId: string;
  userWallet?: string;
  userEmail?: string;
}

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin h-12 w-12 border-4 border-bnb-secondary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Offline banner
const OfflineBanner: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span>You're offline. Some features may be limited.</span>
      </div>
    </div>
  );
};

export const MobileOptimizedApp: React.FC<MobileOptimizedAppProps> = ({ userId, userWallet, userEmail }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'referrals' | 'rewards' | 'settings'>('dashboard');
  const [online, setOnline] = useState(isOnline());
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Register service worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('[App] Service worker registered');
        setupAutoUpdate();
      }
    });

    // Setup online/offline listeners
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    addOnlineListener(handleOnline);
    addOfflineListener(handleOffline);

    return () => {
      // Cleanup not needed as pwa utils handle it
    };
  }, []);

  // Preload next tab on hover/focus (only on desktop)
  const handleTabHover = (tab: typeof activeTab) => {
    if (window.innerWidth >= 768) {
      // Preload logic here if needed
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner */}
      <OfflineBanner isOnline={online} />

      {/* Main Content with Suspense */}
      <main className="pb-16 md:pb-0">
        <Suspense fallback={<LoadingScreen />}>
          {activeTab === 'dashboard' && (
            <MobileReferralDashboard userId={userId} userWallet={userWallet} userEmail={userEmail} />
          )}
          {activeTab === 'referrals' && <MobileReferralList userId={userId} />}
          {activeTab === 'rewards' && <ClaimRewards userId={userId} settings={settings} />}
          {activeTab === 'settings' && <ReferralSettings userId={userId} />}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};
