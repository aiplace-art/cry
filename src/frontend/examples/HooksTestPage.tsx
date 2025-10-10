/**
 * Hooks Test Page
 * Use this to test all Web3 hooks functionality
 */

import React, { useState } from 'react';
import { useWallet, usePresale, TransactionStatus } from '@/hooks';
import { formatters, calculateBNBFromUSD, calculateExpectedTokens } from '@/lib/contracts';

export default function HooksTestPage() {
  const wallet = useWallet();
  const presale = usePresale();
  const [testAmount, setTestAmount] = useState('100');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Web3 Hooks Test Page</h1>

        {/* Wallet Hook Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">useWallet Hook</h2>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">State:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(
                  {
                    isMetaMaskInstalled: wallet.isMetaMaskInstalled,
                    isConnected: wallet.isConnected,
                    address: wallet.address,
                    chainId: wallet.chainId,
                    isCorrectNetwork: wallet.isCorrectNetwork,
                    bnbBalance: wallet.bnbBalance,
                    usdtBalance: wallet.usdtBalance,
                    hypeaiBalance: wallet.hypeaiBalance,
                    isLoading: wallet.isLoading,
                    error: wallet.error,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={wallet.connectWallet}
                disabled={wallet.isConnected || wallet.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Connect Wallet
              </button>

              <button
                onClick={wallet.disconnectWallet}
                disabled={!wallet.isConnected}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                Disconnect
              </button>

              <button
                onClick={wallet.switchToBSC}
                disabled={!wallet.isConnected || wallet.isCorrectNetwork}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
              >
                Switch to BSC
              </button>

              <button
                onClick={wallet.refreshBalances}
                disabled={!wallet.isConnected}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Refresh Balances
              </button>
            </div>
          </div>
        </div>

        {/* Presale Hook Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">usePresale Hook</h2>

          {/* Sale Stats */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Sale Statistics:</h3>
            <div className="p-4 bg-gray-50 rounded">
              {presale.saleStats ? (
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(presale.saleStats, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No data (wallet not connected or wrong network)</p>
              )}
            </div>
            <button
              onClick={presale.getSaleStats}
              disabled={!wallet.isConnected || !wallet.isCorrectNetwork}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              Refresh Sale Stats
            </button>
          </div>

          {/* User Eligibility */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">User Eligibility:</h3>
            <div className="p-4 bg-gray-50 rounded">
              {presale.userEligibility ? (
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(presale.userEligibility, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500">No data (wallet not connected or wrong network)</p>
              )}
            </div>
            <button
              onClick={() => wallet.address && presale.checkEligibility(wallet.address)}
              disabled={!wallet.address || !wallet.isCorrectNetwork}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              Check Eligibility
            </button>
          </div>

          {/* Transaction State */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Transaction State:</h3>
            <div className="p-4 bg-gray-50 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(presale.transactionState, null, 2)}
              </pre>
            </div>

            {presale.transactionState.status === TransactionStatus.PENDING && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">
                  Transaction Pending:{' '}
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

            {presale.transactionState.status === TransactionStatus.SUCCESS && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">
                  Transaction Success! Hash: {presale.transactionState.hash}
                </p>
              </div>
            )}

            {presale.transactionState.status === TransactionStatus.ERROR && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">Error: {presale.transactionState.error}</p>
              </div>
            )}

            <button
              onClick={presale.resetTransactionState}
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reset Transaction State
            </button>
          </div>

          {/* Purchase Test */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Test Purchase Functions:</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Amount (USD):
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                min="40"
                max="800"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-gray-600">BNB Required:</p>
                <p className="font-bold">{calculateBNBFromUSD(Number(testAmount))} BNB</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm text-gray-600">Expected Tokens:</p>
                <p className="font-bold">{calculateExpectedTokens(Number(testAmount))} HYPEAI</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => presale.purchaseWithBNB(Number(testAmount))}
                disabled={
                  !wallet.isConnected ||
                  !wallet.isCorrectNetwork ||
                  presale.transactionState.status !== TransactionStatus.IDLE ||
                  !presale.userEligibility?.eligible
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Purchase with BNB
              </button>

              <button
                onClick={() => presale.purchaseWithUSDT(Number(testAmount))}
                disabled={
                  !wallet.isConnected ||
                  !wallet.isCorrectNetwork ||
                  presale.transactionState.status !== TransactionStatus.IDLE ||
                  !presale.userEligibility?.eligible
                }
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Purchase with USDT
              </button>
            </div>

            {!presale.userEligibility?.eligible && wallet.isConnected && wallet.isCorrectNetwork && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Not eligible to purchase. Check eligibility details above.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Utility Functions Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Utility Functions</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Formatters:</h3>
                <div className="space-y-1 text-sm">
                  <p>formatUSD(123.45): {formatters.formatUSD(123.45)}</p>
                  <p>formatTokenAmount(1234567): {formatters.formatTokenAmount(1234567)}</p>
                  <p>
                    formatAddress(0x1234...7890):{' '}
                    {formatters.formatAddress('0x1234567890123456789012345678901234567890')}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Calculations:</h3>
                <div className="space-y-1 text-sm">
                  <p>BNB for $100: {calculateBNBFromUSD(100)} BNB</p>
                  <p>Tokens for $100: {calculateExpectedTokens(100)} HYPEAI</p>
                  <p>Tokens for $400: {calculateExpectedTokens(400)} HYPEAI</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading States</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Wallet:</h3>
              <p className="text-sm">
                isLoading: {wallet.isLoading ? '✅ True' : '❌ False'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Presale:</h3>
              <p className="text-sm">
                isLoading: {presale.isLoading ? '✅ True' : '❌ False'}
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug Information</h2>

          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Environment:</h3>
              <div className="text-sm space-y-1">
                <p>
                  Presale Contract: {process.env.NEXT_PUBLIC_PRESALE_CONTRACT || '❌ Not set'}
                </p>
                <p>
                  HypeAI Token: {process.env.NEXT_PUBLIC_HYPEAI_TOKEN || '❌ Not set'}
                </p>
                <p>
                  USDT Token: {process.env.NEXT_PUBLIC_USDT_TOKEN || '❌ Not set'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Browser:</h3>
              <div className="text-sm space-y-1">
                <p>User Agent: {navigator.userAgent}</p>
                <p>
                  window.ethereum:{' '}
                  {typeof window !== 'undefined' && window.ethereum ? '✅ Available' : '❌ Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Ensure MetaMask is installed and you have test BNB on BSC testnet</li>
            <li>Click "Connect Wallet" to connect your MetaMask</li>
            <li>If on wrong network, click "Switch to BSC"</li>
            <li>Check that sale stats and eligibility load automatically</li>
            <li>Try refreshing balances</li>
            <li>Test purchase calculations with different amounts</li>
            <li>If whitelisted, test purchase with BNB (will require real transaction)</li>
            <li>Monitor transaction state changes in real-time</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>

        {/* Test Checklist */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-900 mb-3">Test Checklist</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>MetaMask connection works</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Network switching to BSC works</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Balances load correctly (BNB, USDT, HypeAI)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Sale stats load automatically</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>User eligibility checks work</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Token calculations are correct</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Purchase buttons enable/disable correctly</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Error messages are user-friendly</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Real-time updates work (after purchases)</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Disconnect wallet works</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
