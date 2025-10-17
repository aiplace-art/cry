'use client';

import React, { useState, useEffect } from 'react';
import PrivateSaleWidget from '../components/PrivateSaleWidget';
import { usePrivateSale } from '../hooks/usePrivateSale';
import { useWallet } from '../hooks/useWallet';
import { PRIVATE_SALE_CONFIG } from '../lib/payment-config';
import { SOCIAL_LINKS } from '../lib/social-config';

export default function PrivateSalePage() {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const { config, getTimeRemaining, getProgress, purchases, getReferralLink } = usePrivateSale();
  const { wallet } = useWallet();

  // Update countdown every second
  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const progress = getProgress();
  const totalInvestors = 1247; // This would come from API

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 text-center font-semibold">
        ⚡ FAIR LAUNCH: Up to 30% Bonus Tokens • $500 Purchase Limit • Equal Opportunity for All
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full mb-6 animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-green-400 font-semibold text-sm">LIVE NOW</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Private Sale
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Up to 30% Bonus Tokens
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
              🤝 Community-First Fair Launch<br/>
              Support innovation while everyone gets equal opportunity
            </p>

            {/* Vesting Notice */}
            <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/50 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  📅 Transparent Vesting Schedule
                </div>
                <div className="text-lg text-gray-200 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>40% immediately</strong> at purchase</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-blue-400 text-xl">⏰</span>
                    <span><strong>60% vested</strong> over 6 months (10% per month)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Limit Warning */}
            <div className="max-w-2xl mx-auto mb-8 bg-orange-500/20 border border-orange-500/50 rounded-xl p-4">
              <div className="text-center text-orange-200">
                <span className="text-xl mr-2">⚠️</span>
                <strong>$500 Maximum Purchase Limit</strong> - Ensuring fair distribution for all community members
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-2xl">🎯</span>
                <span>Fair Access for Everyone</span>
              </div>
              <div className="hidden md:block text-gray-600">•</div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-2xl">🔒</span>
                <span>Transparent Vesting</span>
              </div>
              <div className="hidden md:block text-gray-600">•</div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">💎</span>
                <span>Up to 30% Bonus</span>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  ${(config.currentAmount / 1000000).toFixed(2)}M
                </div>
                <div className="text-gray-400">Raised</div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  ${PRIVATE_SALE_CONFIG.tokenPrice}
                </div>
                <div className="text-gray-400">Per Token</div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  {totalInvestors.toLocaleString()}
                </div>
                <div className="text-gray-400">Investors</div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {!timeRemaining.expired && (
            <div className="max-w-4xl mx-auto mb-12">
              <h3 className="text-center text-2xl font-semibold text-white mb-6">
                ⏰ Sale Ends In
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Days', value: timeRemaining.days },
                  { label: 'Hours', value: timeRemaining.hours },
                  { label: 'Minutes', value: timeRemaining.minutes },
                  { label: 'Seconds', value: timeRemaining.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center"
                  >
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {item.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-400 text-sm">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex justify-between text-white mb-3">
              <span className="font-semibold">Progress</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-gray-400 text-sm mt-2">
              <span>${(config.currentAmount / 1000000).toFixed(2)}M</span>
              <span>${(config.targetAmount / 1000000).toFixed(1)}M Goal</span>
            </div>
          </div>

          {/* Purchase Widget */}
          <PrivateSaleWidget />

          {/* Referral Section */}
          {wallet && (
            <div className="max-w-2xl mx-auto mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                🎁 Share & Earn
              </h3>
              <p className="text-gray-300 mb-6">
                Refer friends and earn 5% of their purchase in bonus HYPE tokens!
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={getReferralLink(wallet.address)}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getReferralLink(wallet.address));
                    alert('Referral link copied!');
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* My Purchases Dashboard */}
          {wallet && purchases.length > 0 && (
            <div className="max-w-4xl mx-auto mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                📊 My Purchases
              </h3>
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {purchase.totalTokens.toLocaleString()} HYPE
                        </div>
                        <div className="text-gray-400 text-sm">
                          ${purchase.amount.toLocaleString()} • {purchase.currency}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        purchase.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : purchase.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {purchase.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {new Date(purchase.timestamp).toLocaleString()}
                      </span>
                      <a
                        href={`https://etherscan.io/tx/${purchase.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>View TX</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vesting Calculator */}
          <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              📊 Vesting Schedule Calculator
            </h2>

            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <div className="text-center mb-8">
                <div className="text-lg text-gray-300 mb-2">Example: $500 Purchase</div>
                <div className="text-4xl font-bold text-white mb-1">333,333 HYPE Tokens</div>
                <div className="text-sm text-gray-400">(Base tokens at $0.0015 each)</div>
                <div className="text-2xl font-bold text-green-400 mt-2">+ 100,000 Bonus (30%)</div>
                <div className="text-3xl font-bold text-purple-400 mt-2">= 433,333 Total HYPE</div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold">Immediate (At Purchase)</div>
                      <div className="text-gray-400 text-sm">40% unlocked instantly</div>
                    </div>
                    <div className="text-2xl font-bold text-green-400">173,333 HYPE</div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="text-white font-semibold mb-3">Monthly Vesting (10% per month)</div>
                  <div className="space-y-2 text-sm">
                    {[1, 2, 3, 4, 5, 6].map((month) => (
                      <div key={month} className="flex justify-between items-center text-gray-300">
                        <span>Month {month}</span>
                        <span className="font-mono">43,333 HYPE</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-center text-blue-400 font-semibold">
                    <span>Total Vested (60%)</span>
                    <span>260,000 HYPE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Bonus Model */}
          <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              💡 Why Bonus Tokens Instead of Discounts?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-4">Community Benefits</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>✅ <strong>Fair pricing</strong> - Everyone pays the same base price</li>
                  <li>✅ <strong>Bonus rewards</strong> - Extra tokens for early supporters</li>
                  <li>✅ <strong>Purchase limit</strong> - $500 max ensures equal opportunity</li>
                  <li>✅ <strong>Transparent vesting</strong> - Clear unlock schedule</li>
                  <li>✅ <strong>Anti-whale protection</strong> - Prevents market manipulation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-4">Project Integrity</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>💰 <strong>Sustainable pricing</strong> - Maintains token value</li>
                  <li>💰 <strong>Development funding</strong> - Build quality products</li>
                  <li>💰 <strong>Community-first approach</strong> - Fair distribution</li>
                  <li>💰 <strong>Long-term alignment</strong> - Vesting encourages holding</li>
                  <li>💰 <strong>Market stability</strong> - Prevents pump and dump</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-center text-lg text-white font-semibold mb-2">
                🤝 Built on FAIRNESS
              </p>
              <p className="text-center text-gray-400">
                No massive discounts for whales. No unfair advantages.
                Everyone gets the same price, bonus rewards for early support, and transparent vesting.
              </p>
            </div>
          </div>

          {/* Bonus Tiers */}
          <div className="max-w-4xl mx-auto mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              💎 Bonus Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRIVATE_SALE_CONFIG.bonusTiers.slice(0, 5).map((tier) => (
                <div
                  key={tier.minAmount}
                  className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30 text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2">
                    +{tier.bonus}%
                  </div>
                  <div className="text-gray-300 text-sm">
                    ${tier.minAmount.toLocaleString()}+
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              ❓ Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <details className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 group">
                <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  <span>How does the bonus model work?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-gray-300">
                  <p className="mb-2"><strong>Everyone pays the same base price: $0.0015 per token</strong></p>
                  <p className="mb-2">Early supporters receive bonus tokens on top of their purchase:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>$50-$99: 5% bonus tokens</li>
                    <li>$100-$249: 10% bonus tokens</li>
                    <li>$250-$499: 20% bonus tokens</li>
                    <li>$500 (maximum): 30% bonus tokens</li>
                  </ul>
                  <p className="mt-2 text-green-400"><strong>This ensures fair pricing while rewarding early supporters!</strong></p>
                </div>
              </details>

              <details className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 group">
                <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  <span>Why is there a $500 purchase limit?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-gray-300">
                  <p className="mb-2"><strong>Community-first approach:</strong></p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Prevents whales from buying all tokens</li>
                    <li>Ensures fair distribution across more community members</li>
                    <li>Creates equal opportunity for all investors</li>
                    <li>Reduces risk of market manipulation at launch</li>
                    <li>Aligns with our mission of building a community-owned project</li>
                  </ul>
                  <p className="mt-2 text-blue-400"><strong>Fair launch means everyone gets a chance!</strong></p>
                </div>
              </details>

              <details className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 group">
                <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  <span>How does the vesting schedule work?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-gray-300">
                  <p className="mb-2"><strong>Transparent unlock schedule:</strong></p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li><strong>40% immediately</strong> - Available right after purchase</li>
                    <li><strong>60% vested</strong> - Unlocks monthly over 6 months</li>
                    <li>Each month: 10% of total tokens unlock</li>
                    <li>Example: If you buy 400,000 tokens, you get 160,000 immediately and 40,000 each month for 6 months</li>
                  </ul>
                  <p className="mt-2 text-purple-400"><strong>You can stake all tokens immediately to earn rewards!</strong></p>
                </div>
              </details>

              <details className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 group">
                <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  <span>Why use private sale funds?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-gray-300">
                  <p className="mb-2"><strong>Building the future of DeFi:</strong></p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Product development and engineering</li>
                    <li>Smart contract security audits (CertiK, etc.)</li>
                    <li>Marketing and community growth</li>
                    <li>DEX listing liquidity pools</li>
                    <li>Infrastructure and operations</li>
                  </ul>
                  <p className="mt-2"><strong className="text-green-400">Full transparency on fund usage through monthly reports!</strong></p>
                </div>
              </details>

              <details className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 group">
                <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                  <span>Is this investment safe?</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-4 text-gray-300">
                  <p className="mb-2"><strong>Security measures in place:</strong></p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>✅ Smart contracts audited by CertiK</li>
                    <li>✅ Multi-sig wallet for fund management</li>
                    <li>✅ Transparent vesting built into smart contract</li>
                    <li>✅ KYC verification for team members</li>
                    <li>✅ Public roadmap with milestone tracking</li>
                  </ul>
                  <p className="mt-2 text-orange-400"><strong>Always DYOR and invest only what you can afford to lose!</strong></p>
                </div>
              </details>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', text: 'Secure Transactions' },
              { icon: '✓', text: 'Smart Contract Verified' },
              { icon: '⚡', text: 'Instant Delivery' },
              { icon: '🛡️', text: 'Audited by CertiK' },
            ].map((badge) => (
              <div key={badge.text} className="text-white">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm text-gray-300">{badge.text}</div>
              </div>
            ))}
          </div>

          {/* Social Links Footer */}
          <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Join Our Community</h3>
              <p className="text-gray-400">Stay updated with the latest news and announcements</p>
            </div>

            <div className="flex justify-center gap-6 mb-8">
              <a
                href={SOCIAL_LINKS.telegram.channel}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all"
              >
                <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <div className="text-left">
                  <div className="text-white font-semibold">Telegram</div>
                  <div className="text-gray-400 text-sm">{SOCIAL_LINKS.telegram.username}</div>
                </div>
              </a>

              <a
                href={SOCIAL_LINKS.twitter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all"
              >
                <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <div className="text-left">
                  <div className="text-white font-semibold">Twitter</div>
                  <div className="text-gray-400 text-sm">{SOCIAL_LINKS.twitter.handle}</div>
                </div>
              </a>

              <a
                href={SOCIAL_LINKS.discord.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all"
              >
                <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <div className="text-left">
                  <div className="text-white font-semibold">Discord</div>
                  <div className="text-gray-400 text-sm">Join Server</div>
                </div>
              </a>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 HYPE Token. All rights reserved.</p>
              <p className="mt-2">
                <a href={SOCIAL_LINKS.website.url} className="hover:text-blue-400 transition">Website</a>
                {' • '}
                <a href="/docs" className="hover:text-blue-400 transition">Documentation</a>
                {' • '}
                <a href="/terms" className="hover:text-blue-400 transition">Terms</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
