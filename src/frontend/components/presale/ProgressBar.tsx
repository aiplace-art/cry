import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ProgressBarProps {
  currentAmount: number;
  goalAmount: number;
  currency?: string;
  className?: string;
}

/**
 * ProgressBar Component
 *
 * Animated progress bar showing fundraising progress with smooth animations,
 * color gradients based on progress, and formatted currency displays.
 *
 * @param currentAmount - Current amount raised
 * @param goalAmount - Target goal amount
 * @param currency - Currency symbol (default: '$')
 * @param className - Optional additional CSS classes
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentAmount,
  goalAmount,
  currency = '$',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  // Calculate progress percentage
  const progressPercentage = Math.min((currentAmount / goalAmount) * 100, 100);

  // Animated progress value
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  // Animated counter values
  const animatedCurrent = useMotionValue(0);
  const smoothCurrent = useSpring(animatedCurrent, {
    stiffness: 50,
    damping: 30,
  });

  // Transform progress to color stops
  const progressColor = useTransform(
    smoothProgress,
    [0, 50, 75, 100],
    [
      'from-blue-500 via-blue-600 to-blue-700',
      'from-purple-500 via-purple-600 to-purple-700',
      'from-pink-500 via-pink-600 to-pink-700',
      'from-green-500 via-green-600 to-green-700',
    ]
  );

  useEffect(() => {
    setMounted(true);
    progress.set(progressPercentage);
    animatedCurrent.set(currentAmount);
  }, [progress, progressPercentage, animatedCurrent, currentAmount]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Get milestone text
  const getMilestoneText = (percentage: number): string => {
    if (percentage >= 100) return '🎉 Goal Reached!';
    if (percentage >= 75) return '🚀 Almost There!';
    if (percentage >= 50) return '💪 Halfway There!';
    if (percentage >= 25) return '⭐ Great Start!';
    return '🔥 Just Getting Started!';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Stats */}
      <div className="flex justify-between items-baseline mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-sm text-gray-400 uppercase tracking-wide mb-1">Raised</span>
          <motion.span className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {mounted && (
              <motion.span>
                {currency}
                {Math.round(smoothCurrent.get()).toLocaleString()}
              </motion.span>
            )}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-end"
        >
          <span className="text-sm text-gray-400 uppercase tracking-wide mb-1">Goal</span>
          <span className="text-2xl md:text-4xl font-bold text-gray-300">
            {currency}
            {formatCurrency(goalAmount)}
          </span>
        </motion.div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-8 md:h-12 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
          {/* Animated Fill */}
          <motion.div
            className="h-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: 2,
              ease: 'easeOut',
              delay: 0.3,
            }}
          >
            {/* Gradient Fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 1,
                }}
              />
            </div>

            {/* Glow Effect */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/40 to-transparent blur-xl"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>

          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm md:text-lg font-bold text-white drop-shadow-lg z-10"
            >
              {Math.round(progressPercentage)}%
            </motion.span>
          </div>
        </div>

        {/* Particle Effects at Progress Edge */}
        {mounted && progressPercentage > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            animate={{
              left: `${progressPercentage}%`,
            }}
            transition={{
              duration: 2,
              ease: 'easeOut',
              delay: 0.3,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Milestone Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-4"
      >
        <span className="text-sm md:text-base font-semibold text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text">
          {getMilestoneText(progressPercentage)}
        </span>
      </motion.div>

      {/* Progress Milestones */}
      <div className="flex justify-between mt-3 px-1">
        {[25, 50, 75, 100].map((milestone) => (
          <motion.div
            key={milestone}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: progressPercentage >= milestone ? 1 : 0.3,
              scale: progressPercentage >= milestone ? 1 : 0.8,
            }}
            transition={{ delay: 1 + milestone / 100 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-2 h-2 rounded-full mb-1 ${
                progressPercentage >= milestone
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 shadow-lg shadow-green-500/50'
                  : 'bg-gray-600'
              }`}
            />
            <span className="text-xs text-gray-500">{milestone}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
