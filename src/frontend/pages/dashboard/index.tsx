import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthModal } from '../../components/referral/AuthModal';
import { ReferralDashboard } from '../../components/referral/ReferralDashboard';
import { ReferralList } from '../../components/referral/ReferralList';
import { ClaimRewards } from '../../components/referral/ClaimRewards';
import { ReferralSettings } from '../../components/referral/ReferralSettings';
import { useWeb3Auth } from '../../hooks/useWeb3Auth';
import { useUserSettings } from '../../hooks/useReferralAPI';

type TabType = 'overview' | 'referrals' | 'rewards' | 'settings';

interface User {
  id: string;
  wallet?: string;
  email?: string;
  name?: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { account, isConnected } = useWeb3Auth();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { settings } = useUserSettings(user?.id || '');

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setShowAuthModal(true);
        }
      } catch (error) {
        setShowAuthModal(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Set active tab from URL query
    const tab = router.query.tab as TabType;
    if (tab && ['overview', 'referrals', 'rewards', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    router.push(`/dashboard?tab=${tab}`, undefined, { shallow: true });
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setShowAuthModal(true);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return (
      <>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to HypeAI Referral Dashboard
            </h1>
            <p className="text-gray-600 mb-8">
              Please sign in to access your referral dashboard
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HypeAI</h1>
                <p className="text-xs text-gray-500">Referral Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {user.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : user.email}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('referrals')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'referrals'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Referrals
            </button>
            <button
              onClick={() => handleTabChange('rewards')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'rewards'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Claim Rewards
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'overview' && (
          <ReferralDashboard
            userId={user.id}
            userWallet={user.wallet}
            userEmail={user.email}
          />
        )}

        {activeTab === 'referrals' && <ReferralList userId={user.id} />}

        {activeTab === 'rewards' && (
          <ClaimRewards userId={user.id} settings={settings} />
        )}

        {activeTab === 'settings' && <ReferralSettings userId={user.id} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">HypeAI</h3>
              <p className="text-sm text-gray-600">
                Advanced AI-powered crypto trading platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://hypeai.agency" className="text-gray-600 hover:text-purple-600">
                    Main Website
                  </a>
                </li>
                <li>
                  <a href="/docs" className="text-gray-600 hover:text-purple-600">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/support" className="text-gray-600 hover:text-purple-600">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: support@hypeai.agency</li>
                <li>Telegram: @hypeai_support</li>
                <li>Twitter: @HypeAI_Official</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} HypeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
