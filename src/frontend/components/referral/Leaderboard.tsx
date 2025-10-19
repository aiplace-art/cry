import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  address: string;
  name?: string;
  totalVolume: number;
  totalReferrals: number;
  totalEarned: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  badges: string[];
}

interface LeaderboardProps {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  userId,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'volume' | 'referrals' | 'earnings'>('volume');
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filter, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/referrals/leaderboard?filter=${filter}&range=${timeRange}`);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platinum': return 'from-bnb-secondary400 via-bnb-primary500 to-bnb-primary600';
      case 'Gold': return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'Silver': return 'from-gray-300 via-gray-400 to-gray-500';
      default: return 'from-orange-400 via-orange-500 to-orange-600';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-bnb-secondary600 via-pink-600 to-bnb-primary700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Top Referrers</h1>
            <p className="text-bnb-text">Compete for the top spot and earn exclusive rewards</p>
          </div>
          <div className="text-6xl">🏆</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('volume')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'volume'
                  ? 'bg-bnb-secondary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Volume
            </button>
            <button
              onClick={() => setFilter('referrals')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'referrals'
                  ? 'bg-bnb-secondary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Referrals
            </button>
            <button
              onClick={() => setFilter('earnings')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'earnings'
                  ? 'bg-bnb-secondary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Earnings
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-bnb-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-bnb-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-bnb-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-bnb-secondary mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referrer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Volume</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Referrals</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Earned</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {entries.map((entry, index) => (
                    <motion.tr
                      key={entry.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${
                        entry.address === userId ? 'bg-bnb-secondary/5' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-bold ${entry.rank <= 3 ? '' : 'text-gray-600'}`}>
                          {getRankIcon(entry.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.name || shortenAddress(entry.address)}
                          </p>
                          {entry.address === userId && (
                            <span className="text-xs text-bnb-secondary font-semibold">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getLevelColor(entry.level)} text-white text-xs font-bold`}>
                          {entry.level}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(entry.totalVolume)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatNumber(entry.totalReferrals)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatCurrency(entry.totalEarned)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-center">
                          {entry.badges.slice(0, 3).map((badge, i) => (
                            <span key={i} className="text-lg" title={badge}>
                              {badge}
                            </span>
                          ))}
                          {entry.badges.length > 3 && (
                            <span className="text-xs text-gray-500">+{entry.badges.length - 3}</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="text-center p-12">
            <p className="text-gray-500 text-lg">No entries yet. Be the first to make the leaderboard!</p>
          </div>
        )}
      </div>

      {/* Prizes Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Monthly Prizes</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border-4 border-yellow-400">
            <div className="text-4xl mb-3">🥇</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">1st Place</h4>
            <p className="text-3xl font-bold text-yellow-600 mb-2">$5,000</p>
            <p className="text-sm text-gray-600">+ Platinum Badge</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border-4 border-gray-400">
            <div className="text-4xl mb-3">🥈</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">2nd Place</h4>
            <p className="text-3xl font-bold text-gray-600 mb-2">$2,500</p>
            <p className="text-sm text-gray-600">+ Gold Badge</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg border-4 border-orange-400">
            <div className="text-4xl mb-3">🥉</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">3rd Place</h4>
            <p className="text-3xl font-bold text-orange-600 mb-2">$1,000</p>
            <p className="text-sm text-gray-600">+ Silver Badge</p>
          </div>
        </div>
      </div>
    </div>
  );
};
