import React, { useState, useEffect } from 'react';
import { useUserSettings } from '../../hooks/useReferralAPI';
import { validateWalletAddress } from '../../utils/helpers';

interface ReferralSettingsProps {
  userId: string;
}

export const ReferralSettings: React.FC<ReferralSettingsProps> = ({ userId }) => {
  const { settings, loading, error, updateSettings } = useUserSettings(userId);

  const [rewardType, setRewardType] = useState<'USDT' | 'HYPE'>('HYPE');
  const [payoutWallet, setPayoutWallet] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [kycFile, setKycFile] = useState<File | null>(null);

  const [walletError, setWalletError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (settings) {
      setRewardType(settings.rewardType);
      setPayoutWallet(settings.payoutWallet || '');
      setEmailNotifications(settings.emailNotifications);
      setTelegramNotifications(settings.telegramNotifications);
    }
  }, [settings]);

  const handleWalletChange = (value: string) => {
    setPayoutWallet(value);
    if (value && !validateWalletAddress(value)) {
      setWalletError('Invalid wallet address format');
    } else {
      setWalletError('');
    }
  };

  const handleSave = async () => {
    if (payoutWallet && !validateWalletAddress(payoutWallet)) {
      setWalletError('Invalid wallet address format');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await updateSettings({
        rewardType,
        payoutWallet,
        emailNotifications,
        telegramNotifications,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleKYCUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setSaveError('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('File size must be less than 5MB');
      return;
    }

    setKycFile(file);

    // Upload KYC document
    setSaving(true);
    setSaveError('');

    const formData = new FormData();
    formData.append('kyc', file);
    formData.append('userId', userId);

    try {
      const response = await fetch('/api/referrals/kyc', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload KYC document');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Referral Settings</h1>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span className="font-medium">Settings saved successfully!</span>
          </p>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 flex items-center gap-2">
            <span className="text-xl">⚠</span>
            <span className="font-medium">{saveError}</span>
          </p>
        </div>
      )}

      {/* Reward Type Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reward Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose how you want to receive rewards
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setRewardType('HYPE')}
                className={`p-6 border-2 rounded-xl transition-all ${
                  rewardType === 'HYPE'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      rewardType === 'HYPE'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {rewardType === 'HYPE' && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">HYPE Tokens</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Receive rewards in HYPE tokens with potential for growth
                </p>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                  +20% Bonus
                </div>
              </button>

              <button
                onClick={() => setRewardType('USDT')}
                className={`p-6 border-2 rounded-xl transition-all ${
                  rewardType === 'USDT'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      rewardType === 'USDT'
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {rewardType === 'USDT' && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">USDT</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Receive stable USD-pegged rewards directly to your wallet
                </p>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                  Stable Value
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Wallet */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payout Wallet</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={payoutWallet}
              onChange={(e) => handleWalletChange(e.target.value)}
              placeholder="0x..."
              className={`w-full px-4 py-3 border rounded-lg font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                walletError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {walletError && (
              <p className="mt-2 text-sm text-red-600">{walletError}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              This wallet will receive your {rewardType === 'HYPE' ? 'HYPE token' : 'USDT'} rewards
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">
                Receive updates about referrals and claims via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-medium text-gray-900">Telegram Notifications</p>
              <p className="text-sm text-gray-500">
                Get instant notifications in Telegram
              </p>
            </div>
            <input
              type="checkbox"
              checked={telegramNotifications}
              onChange={(e) => setTelegramNotifications(e.target.checked)}
              className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* KYC Verification */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">KYC Verification</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              KYC verification is required for withdrawals over $1,000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  settings?.kycStatus === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : settings?.kycStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : settings?.kycStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {settings?.kycStatus === 'approved' && '✓ Approved'}
                {settings?.kycStatus === 'pending' && '⏳ Pending Review'}
                {settings?.kycStatus === 'rejected' && '❌ Rejected'}
                {settings?.kycStatus === 'not_submitted' && '📝 Not Submitted'}
              </span>
            </div>
          </div>

          {settings?.kycStatus !== 'approved' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload KYC Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleKYCUpload}
                  className="hidden"
                  id="kyc-upload"
                />
                <label htmlFor="kyc-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 font-medium mb-1">
                    {kycFile ? kycFile.name : 'Click to upload'}
                  </p>
                  <p className="text-sm text-gray-500">
                    ID card, passport, or driver's license (JPG, PNG, PDF - Max 5MB)
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !!walletError}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};
