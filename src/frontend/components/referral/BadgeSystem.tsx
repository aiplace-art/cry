import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: BadgeLevel;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  total?: number;
}

interface BadgeSystemProps {
  userId: string;
  currentLevel: BadgeLevel;
  totalReferrals: number;
  totalVolume: number;
  totalEarned: number;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  userId,
  currentLevel,
  totalReferrals,
  totalVolume,
  totalEarned,
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateBadges();
  }, [totalReferrals, totalVolume, totalEarned]);

  const calculateBadges = () => {
    const allBadges: Badge[] = [
      // Level Badges
      {
        id: 'bronze',
        name: 'Bronze Referrer',
        description: 'Reach Bronze level by referring 5 users',
        icon: '🥉',
        level: 'Bronze',
        requirement: 'Refer 5 users',
        earned: totalReferrals >= 5,
        progress: Math.min(totalReferrals, 5),
        total: 5,
      },
      {
        id: 'silver',
        name: 'Silver Referrer',
        description: 'Reach Silver level by referring 20 users',
        icon: '🥈',
        level: 'Silver',
        requirement: 'Refer 20 users',
        earned: totalReferrals >= 20,
        progress: Math.min(totalReferrals, 20),
        total: 20,
      },
      {
        id: 'gold',
        name: 'Gold Referrer',
        description: 'Reach Gold level by referring 50 users',
        icon: '🥇',
        level: 'Gold',
        requirement: 'Refer 50 users',
        earned: totalReferrals >= 50,
        progress: Math.min(totalReferrals, 50),
        total: 50,
      },
      {
        id: 'platinum',
        name: 'Platinum Elite',
        description: 'Reach Platinum level by referring 100 users',
        icon: '💎',
        level: 'Platinum',
        requirement: 'Refer 100 users',
        earned: totalReferrals >= 100,
        progress: Math.min(totalReferrals, 100),
        total: 100,
      },
      // Volume Badges
      {
        id: 'volume_10k',
        name: 'Volume Master',
        description: 'Generate $10,000 in referral volume',
        icon: '💰',
        level: 'Bronze',
        requirement: '$10,000 volume',
        earned: totalVolume >= 10000,
        progress: Math.min(totalVolume, 10000),
        total: 10000,
      },
      {
        id: 'volume_50k',
        name: 'Volume Legend',
        description: 'Generate $50,000 in referral volume',
        icon: '💎',
        level: 'Silver',
        requirement: '$50,000 volume',
        earned: totalVolume >= 50000,
        progress: Math.min(totalVolume, 50000),
        total: 50000,
      },
      {
        id: 'volume_100k',
        name: 'Volume Champion',
        description: 'Generate $100,000 in referral volume',
        icon: '👑',
        level: 'Gold',
        requirement: '$100,000 volume',
        earned: totalVolume >= 100000,
        progress: Math.min(totalVolume, 100000),
        total: 100000,
      },
      // Earnings Badges
      {
        id: 'earnings_1k',
        name: 'First Thousand',
        description: 'Earn your first $1,000 in commissions',
        icon: '💵',
        level: 'Bronze',
        requirement: 'Earn $1,000',
        earned: totalEarned >= 1000,
        progress: Math.min(totalEarned, 1000),
        total: 1000,
      },
      {
        id: 'earnings_5k',
        name: 'High Earner',
        description: 'Earn $5,000 in commissions',
        icon: '💸',
        level: 'Silver',
        requirement: 'Earn $5,000',
        earned: totalEarned >= 5000,
        progress: Math.min(totalEarned, 5000),
        total: 5000,
      },
      {
        id: 'earnings_10k',
        name: 'Top Earner',
        description: 'Earn $10,000 in commissions',
        icon: '🏆',
        level: 'Gold',
        requirement: 'Earn $10,000',
        earned: totalEarned >= 10000,
        progress: Math.min(totalEarned, 10000),
        total: 10000,
      },
      // Milestone Badges
      {
        id: 'first_referral',
        name: 'Getting Started',
        description: 'Make your first referral',
        icon: '🎯',
        level: 'Bronze',
        requirement: 'First referral',
        earned: totalReferrals >= 1,
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Make referrals for 7 consecutive days',
        icon: '🔥',
        level: 'Bronze',
        requirement: '7-day streak',
        earned: false, // Requires streak tracking
      },
      {
        id: 'conversion_master',
        name: 'Conversion Master',
        description: 'Achieve 50%+ conversion rate with 20+ clicks',
        icon: '🎖️',
        level: 'Silver',
        requirement: '50% conversion rate',
        earned: false, // Requires conversion tracking
      },
    ];

    setBadges(allBadges);
    setLoading(false);
  };

  const getLevelColor = (level: BadgeLevel) => {
    switch (level) {
      case 'Platinum': return 'from-bnb-secondary400 via-bnb-primary500 to-bnb-primary600';
      case 'Gold': return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'Silver': return 'from-gray-300 via-gray-400 to-gray-500';
      default: return 'from-orange-400 via-orange-500 to-orange-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const earnedBadges = badges.filter(b => b.earned);
  const unlockedBadges = badges.filter(b => !b.earned);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-bnb-secondary600 via-pink-600 to-bnb-primary700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Badges & Achievements</h1>
            <p className="text-bnb-text">
              {earnedBadges.length} of {badges.length} badges earned
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getLevelColor(currentLevel)} text-white text-2xl font-bold shadow-lg`}>
              {currentLevel} Level
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Achievement Progress</span>
            <span>{Math.round((earnedBadges.length / badges.length) * 100)}%</span>
          </div>
          <div className="w-full bg-bnb-dark bg-opacity-30 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-white h-3 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Level Benefits */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Level Benefits</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {(['Bronze', 'Silver', 'Gold', 'Platinum'] as BadgeLevel[]).map((level, index) => (
            <div
              key={level}
              className={`rounded-xl p-6 border-2 ${
                currentLevel === level ? 'border-bnb-border0 bg-bnb-secondary/5' : 'border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getLevelColor(level)} flex items-center justify-center text-white text-xl font-bold mb-4`}>
                {index + 1}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{level}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {index >= 0 && '10% base commission'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {index >= 1 && '+1.25x bonus multiplier'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {index >= 2 && '+1.5x bonus multiplier'}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {index >= 3 && '+2x bonus multiplier'}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Earned Badges */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Earned Badges ({earnedBadges.length})</h2>
        {earnedBadges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No badges earned yet. Start referring to unlock achievements!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-bnb-secondary50 to-pink-50 rounded-xl p-6 cursor-pointer shadow-md hover:shadow-xl transition-all"
                onClick={() => setSelectedBadge(badge)}
              >
                <div className="text-5xl mb-3 text-center">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 text-center mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600 text-center">{badge.requirement}</p>
                {badge.earnedAt && (
                  <p className="text-xs text-bnb-secondary text-center mt-2">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Locked Badges */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Locked Badges ({unlockedBadges.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {unlockedBadges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300 opacity-75 hover:opacity-100 transition-all"
              onClick={() => setSelectedBadge(badge)}
            >
              <div className="text-5xl mb-3 text-center grayscale">{badge.icon}</div>
              <h3 className="font-bold text-gray-700 text-center mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-500 text-center mb-3">{badge.requirement}</p>
              {badge.progress !== undefined && badge.total && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{badge.progress} / {badge.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-bnb-secondary h-2 rounded-full transition-all"
                      style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`text-8xl mb-4 ${!selectedBadge.earned && 'grayscale'}`}>
                {selectedBadge.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getLevelColor(selectedBadge.level)} text-white text-sm font-bold mb-4`}>
                {selectedBadge.level} Badge
              </div>
              {selectedBadge.earned ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4">
                  <p className="text-green-700 font-bold">Badge Earned! 🎉</p>
                  {selectedBadge.earnedAt && (
                    <p className="text-green-600 text-sm mt-1">
                      {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4">
                  <p className="text-gray-700 font-bold mb-2">How to Unlock</p>
                  <p className="text-gray-600 text-sm">{selectedBadge.requirement}</p>
                  {selectedBadge.progress !== undefined && selectedBadge.total && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Your Progress</span>
                        <span>{selectedBadge.progress} / {selectedBadge.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-bnb-secondary h-3 rounded-full transition-all"
                          style={{ width: `${(selectedBadge.progress / selectedBadge.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
