/**
 * Complete Presale Integration Example
 * Demonstrates how to use useWallet and usePresale hooks
 */

import React, { useState, useEffect } from 'react';
import { useWallet, usePresale, TransactionStatus } from '@/hooks';
import { formatters, calculateBNBFromUSD, ERROR_MESSAGES } from '@/lib/contracts';

export default function PresaleIntegrationExample() {
  const wallet = useWallet();
  const presale = usePresale();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BNB' | 'USDT'>('BNB');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Show notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle purchase
  const handlePurchase = async () => {
    const amount = Number(purchaseAmount);

    // Validation
    if (!amount || amount < 40) {
      showNotification('error', 'Minimum purchase is $40');
      return;
    }

    if (presale.userEligibility && amount > presale.userEligibility.remainingAllocation) {
      showNotification('error', `Maximum remaining allocation is $${presale.userEligibility.remainingAllocation}`);
      return;
    }

    try {
      presale.resetTransactionState();

      let result;
      if (paymentMethod === 'BNB') {
        result = await presale.purchaseWithBNB(amount);
      } else {
        result = await presale.purchaseWithUSDT(amount);
      }

      showNotification('success', `Purchase successful! Transaction: ${result.hash}`);
      setPurchaseAmount('');
    } catch (error: any) {
      showNotification('error', error.message || 'Purchase failed');
    }
  };

  // Calculate display values
  const expectedTokens = purchaseAmount ? presale.calculateExpectedTokens(Number(purchaseAmount)) : '0';
  const bnbRequired = purchaseAmount ? calculateBNBFromUSD(Number(purchaseAmount), 600) : '0';

  // Render wallet not installed
  if (!wallet.isMetaMaskInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">MetaMask Required</h1>
          <p className="text-gray-600 mb-6">
            Please install MetaMask to participate in the HypeAI Private Sale.
          </p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  // Render wallet not connected
  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to participate in the HypeAI Founding Members Private Sale.
          </p>
          <button
            onClick={wallet.connectWallet}
            disabled={wallet.isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wallet.isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {wallet.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{wallet.error.message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render wrong network
  if (!wallet.isCorrectNetwork) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Wrong Network</h1>
          <p className="text-gray-600 mb-6">
            Please switch to BNB Smart Chain (BSC) to participate in the sale.
          </p>
          <button
            onClick={wallet.switchToBSC}
            disabled={wallet.isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wallet.isLoading ? 'Switching...' : 'Switch to BSC'}
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Connected to Chain ID: {wallet.chainId}</p>
            <p>Required: BSC (56)</p>
          </div>
        </div>
      </div>
    );
  }

  // Render not eligible
  if (presale.userEligibility && !presale.userEligibility.eligible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Not Eligible</h1>
          <p className="text-gray-600 mb-6">Your address is not eligible to participate in this private sale.</p>

          {!presale.userEligibility.isWhitelisted && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-800 font-semibold">Not Whitelisted</p>
              <p className="text-yellow-600 text-sm mt-1">
                Your address is not on the whitelist. Please contact the team to get whitelisted.
              </p>
            </div>
          )}

          {presale.userEligibility.remainingAllocation === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-green-800 font-semibold">Maximum Reached</p>
              <p className="text-green-600 text-sm mt-1">
                You have reached your maximum purchase allocation of $800.
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Connected: {formatters.formatAddress(wallet.address!)}</p>
            <button
              onClick={wallet.disconnectWallet}
              className="mt-4 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main presale interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HypeAI Private Sale</h1>
              <p className="text-gray-600">Founding Members Exclusive</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatters.formatAddress(wallet.address!)}</p>
              <button
                onClick={wallet.disconnectWallet}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}
            >
              {notification.message}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sale Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sale Progress</h2>

            {presale.saleStats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-purple-600">
                      {presale.saleStats.progressPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(presale.saleStats.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Raised</p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatters.formatUSD(presale.saleStats.totalUSDRaised)}
                    </p>
                    <p className="text-xs text-gray-500">of $80,000</p>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Members</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {presale.saleStats.foundingMembersCount}
                    </p>
                    <p className="text-xs text-gray-500">of 500</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tokens Sold</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatters.formatTokenAmount(presale.saleStats.totalTokensSold)}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Time Left</p>
                    <p className="text-lg font-bold text-blue-900">
                      {Math.floor(presale.saleStats.timeRemaining / 3600)}h
                    </p>
                  </div>
                </div>

                {!presale.saleStats.isActive && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-semibold">Sale Inactive</p>
                    <p className="text-red-600 text-sm">The sale is currently not active.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading sale data...</p>
              </div>
            )}
          </div>

          {/* Purchase Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase Tokens</h2>

            {presale.userEligibility && (
              <div className="space-y-4">
                {/* User Stats */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Your Contribution</span>
                    <span className="font-bold text-purple-900">
                      {formatters.formatUSD(presale.userEligibility.contribution)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Tokens Purchased</span>
                    <span className="font-bold text-purple-900">
                      {formatters.formatTokenAmount(presale.userEligibility.tokensPurchased)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Remaining Allocation</span>
                    <span className="font-bold text-green-600">
                      {formatters.formatUSD(presale.userEligibility.remainingAllocation)}
                    </span>
                  </div>
                  {presale.userEligibility.isFoundingMember && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-purple-900 font-semibold text-center">
                        🎉 Founding Member
                      </p>
                    </div>
                  )}
                </div>

                {/* Purchase Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    min="40"
                    max={presale.userEligibility.remainingAllocation}
                    step="10"
                    placeholder="Enter amount in USD"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Min: $40</span>
                    <span>Max: ${presale.userEligibility.remainingAllocation}</span>
                  </div>
                </div>

                {/* Expected Tokens */}
                {purchaseAmount && Number(purchaseAmount) >= 40 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700 mb-1">You will receive:</p>
                    <p className="text-2xl font-bold text-green-900">{expectedTokens} HYPEAI</p>
                    <p className="text-xs text-green-600 mt-1">Includes 10% bonus!</p>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('BNB')}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        paymentMethod === 'BNB'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      BNB
                      {purchaseAmount && (
                        <div className="text-xs mt-1 opacity-90">{bnbRequired} BNB</div>
                      )}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('USDT')}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        paymentMethod === 'USDT'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      USDT
                      {purchaseAmount && (
                        <div className="text-xs mt-1 opacity-90">${purchaseAmount}</div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={
                    presale.transactionState.status !== TransactionStatus.IDLE ||
                    !purchaseAmount ||
                    Number(purchaseAmount) < 40
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {presale.transactionState.status === TransactionStatus.APPROVING && 'Approving USDT...'}
                  {presale.transactionState.status === TransactionStatus.PENDING && 'Processing Transaction...'}
                  {presale.transactionState.status === TransactionStatus.IDLE && `Purchase with ${paymentMethod}`}
                </button>

                {/* Transaction Status */}
                {presale.transactionState.status === TransactionStatus.PENDING && presale.transactionState.hash && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      Transaction pending...{' '}
                      <a
                        href={`https://bscscan.com/tx/${presale.transactionState.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View on BSCScan
                      </a>
                    </p>
                  </div>
                )}

                {/* Wallet Balances */}
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Balances</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">BNB:</span>
                      <span className="font-medium">{parseFloat(wallet.bnbBalance).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">USDT:</span>
                      <span className="font-medium">{parseFloat(wallet.usdtBalance).toFixed(2)}</span>
                    </div>
                    {wallet.hypeaiBalance !== '0' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">HYPEAI:</span>
                        <span className="font-medium text-purple-600">
                          {formatters.formatTokenAmount(wallet.hypeaiBalance)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={wallet.refreshBalances}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700"
                  >
                    Refresh Balances
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
