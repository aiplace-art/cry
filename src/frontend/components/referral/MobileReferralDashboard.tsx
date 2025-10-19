import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReferralStats, useReferralLink } from '../../hooks/useReferralAPI';
import {
  formatCurrency,
  formatNumber,
  copyToClipboard,
  generateQRCode,
  downloadQRCode,
  shortenAddress,
} from '../../utils/helpers';

interface MobileReferralDashboardProps {
  userId: string;
  userWallet?: string;
  userEmail?: string;
}

export const MobileReferralDashboard: React.FC<MobileReferralDashboardProps> = ({
  userId,
  userWallet,
  userEmail,
}) => {
  const { stats, loading: statsLoading, refetch: refetchStats } = useReferralStats(userId);
  const { link, loading: linkLoading, refetch: refetchLink } = useReferralLink(userId);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (link?.url) {
      generateQRCode(link.url).then(setQrCodeUrl);
    }
  }, [link]);

  // Pull-to-refresh functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - touchStart;

    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, 100));
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await Promise.all([refetchStats(), refetchLink()]);
      setTimeout(() => setIsRefreshing(false), 500);
    }
    setPullDistance(0);
  }, [pullDistance, refetchStats, refetchLink]);

  const handleCopy = async () => {
    if (link?.url) {
      const success = await copyToClipboard(link.url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, `hypeai-referral-${link?.code}.png`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && link?.url) {
      try {
        await navigator.share({
          title: 'Join HypeAI',
          text: 'Join HypeAI and earn rewards!',
          url: link.url,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (statsLoading || linkLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4"
          >
            <svg className="h-12 w-12 text-bnb-secondary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </motion.div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-20 bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: pullDistance / 60, y: pullDistance - 20 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-full shadow-lg p-2">
              <motion.svg
                animate={{ rotate: isRefreshing ? 360 : pullDistance * 3.6 }}
                transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                className="w-6 h-6 text-bnb-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Header */}
      <div className="bg-gradient-to-r from-bnb-secondary600 to-pink-600 px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Referral Hub</h1>
            <p className="text-bnb-text text-sm mt-1">
              {userWallet ? shortenAddress(userWallet) : userEmail}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-full transition-all active:scale-95"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Quick Stats - Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <div className="bg-white bg-opacity-20 rounded-xl p-4 min-w-[140px] flex-shrink-0">
            <p className="text-bnb-text text-xs mb-1">Total Referrals</p>
            <p className="text-2xl font-bold">{formatNumber(stats?.totalReferrals || 0)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 min-w-[140px] flex-shrink-0">
            <p className="text-bnb-text text-xs mb-1">Earned USDT</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalEarnedUSDT || 0)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 min-w-[140px] flex-shrink-0">
            <p className="text-bnb-text text-xs mb-1">Earned HYPE</p>
            <p className="text-2xl font-bold">{formatNumber(stats?.totalEarnedHYPE || 0, 0)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 min-w-[140px] flex-shrink-0">
            <p className="text-bnb-text text-xs mb-1">Pending</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.pendingRewards || 0)}</p>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Referral Link</h2>

          <div className="space-y-3">
            {/* Referral Code */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Referral Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link?.code || ''}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all active:scale-95"
                  style={{ minHeight: '44px' }}
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {/* Link Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bnb-primary/5 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600">Clicks</p>
                <p className="text-xl font-bold text-bnb-primary">{formatNumber(link?.clicks || 0)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600">Conversions</p>
                <p className="text-xl font-bold text-green-600">{formatNumber(link?.conversions || 0)}</p>
              </div>
            </div>

            {link && link.conversions > 0 && (
              <div className="bg-bnb-secondary/5 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600">Conversion Rate</p>
                <p className="text-xl font-bold text-bnb-secondary">
                  {((link.conversions / link.clicks) * 100).toFixed(1)}%
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-bnb-secondary600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ minHeight: '44px' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {showQR ? 'Hide QR' : 'Show QR'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 px-4 py-3 bg-bnb-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ minHeight: '44px' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* QR Code Modal */}
          <AnimatePresence>
            {showQR && qrCodeUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-4 flex flex-col items-center"
              >
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 border-4 border-gray-200 rounded-xl mb-3"
                />
                <button
                  onClick={handleDownloadQR}
                  className="px-6 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-dark transition-all active:scale-95"
                  style={{ minHeight: '44px' }}
                >
                  Download QR Code
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-bnb-primary50 to-bnb-primary50 rounded-2xl p-4">
          <h3 className="text-base font-bold text-gray-900 mb-3">Earn More</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="text-xl">🎯</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Target Communities</h4>
                <p className="text-xs text-gray-600">Share in crypto and AI groups</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-xl">📱</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Social Media</h4>
                <p className="text-xs text-gray-600">Post on Twitter, Telegram, Discord</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-xl">💡</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Create Content</h4>
                <p className="text-xs text-gray-600">Reviews, tutorials, or videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className="fixed bottom-20 right-4 bg-gradient-to-r from-bnb-secondary600 to-pink-600 text-white p-4 rounded-full shadow-lg z-40"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>
    </div>
  );
};
