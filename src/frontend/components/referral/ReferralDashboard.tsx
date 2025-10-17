import React, { useState, useEffect } from 'react';
import { useReferralStats, useReferralLink } from '../../hooks/useReferralAPI';
import {
  formatCurrency,
  formatNumber,
  copyToClipboard,
  generateQRCode,
  downloadQRCode,
  shortenAddress,
} from '../../utils/helpers';

interface ReferralDashboardProps {
  userId: string;
  userWallet?: string;
  userEmail?: string;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  userId,
  userWallet,
  userEmail,
}) => {
  const { stats, loading: statsLoading, refetch: refetchStats } = useReferralStats(userId);
  const { link, loading: linkLoading, refetch: refetchLink } = useReferralLink(userId);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (link?.url) {
      generateQRCode(link.url).then(setQrCodeUrl);
    }
  }, [link]);

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

  if (statsLoading || linkLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referral Dashboard</h1>
            <p className="text-purple-100">
              {userWallet ? (
                <>Wallet: {shortenAddress(userWallet)}</>
              ) : (
                <>Email: {userEmail}</>
              )}
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={() => {
                refetchStats();
                refetchLink();
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Referrals */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Referrals</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {formatNumber(stats?.totalReferrals || 0)}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Earned USDT */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earned (USDT)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.totalEarnedUSDT || 0)}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Earned HYPE */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Earned (HYPE)</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {formatNumber(stats?.totalEarnedHYPE || 0, 0)}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pending Rewards */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Rewards</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.pendingRewards || 0)}
              </h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Referral Link</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link?.code || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                />
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link?.url || ''}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Clicks</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(link?.clicks || 0)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(link?.conversions || 0)}</p>
              </div>
            </div>

            {link && link.conversions > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((link.conversions / link.clicks) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {showQR && qrCodeUrl ? (
              <>
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border-4 border-gray-200 rounded-xl" />
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadQR}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => setShowQR(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Hide
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowQR(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Generate QR Code
              </button>
            )}

            <p className="text-sm text-gray-500 text-center">
              Share this QR code on social media or print it for offline promotion
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Maximize Your Earnings</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Target Your Audience</h4>
              <p className="text-sm text-gray-600">Share your link with communities interested in crypto and AI</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📱</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Use Social Media</h4>
              <p className="text-sm text-gray-600">Post on Twitter, Telegram, and Discord for maximum reach</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Create Content</h4>
              <p className="text-sm text-gray-600">Write reviews, tutorials, or videos about HypeAI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
