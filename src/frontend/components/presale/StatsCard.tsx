import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface StatsCardProps {
  value: number;
  label: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  gradient?: string;
  glowColor?: string;
  animationDuration?: number;
  className?: string;
}

/**
 * StatsCard Component
 *
 * Reusable stat display card with animated number counters, icon support,
 * glowing borders, and customizable gradients. Features smooth count-up
 * animations and glassmorphism styling.
 *
 * @param value - The numeric value to display
 * @param label - The label/description for the stat
 * @param icon - Optional emoji or icon to display
 * @param prefix - Optional prefix (e.g., '$', '+')
 * @param suffix - Optional suffix (e.g., '%', 'K', 'M')
 * @param decimals - Number of decimal places (default: 0)
 * @param gradient - Tailwind gradient classes (default: 'from-bnb-primary500 to-bnb-primary500')
 * @param glowColor - Glow color on hover (default: 'blue')
 * @param animationDuration - Duration of count animation in seconds (default: 2)
 * @param className - Optional additional CSS classes
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon,
  prefix = '',
  suffix = '',
  decimals = 0,
  gradient = 'from-bnb-primary500 to-bnb-primary500',
  glowColor = 'blue',
  animationDuration = 2,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  // Animated value
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform for display
  const displayValue = useTransform(springValue, (latest) =>
    latest.toFixed(decimals)
  );

  useEffect(() => {
    setMounted(true);
    motionValue.set(value);
  }, [motionValue, value]);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(decimals);
  };

  // Glow colors mapping
  const glowColors: Record<string, string> = {
    blue: 'shadow-bnb-primary500/50',
    purple: 'shadow-bnb-secondary500/50',
    pink: 'shadow-pink-500/50',
    green: 'shadow-green-500/50',
    yellow: 'shadow-yellow-500/50',
    red: 'shadow-red-500/50',
    cyan: 'shadow-cyan-500/50',
    orange: 'shadow-orange-500/50',
  };

  const glowClass = glowColors[glowColor] || glowColors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${className}`}
    >
      {/* Card Container */}
      <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-white/40">
        {/* Gradient Overlay on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          initial={false}
        />

        {/* Animated Glow Border */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-40 blur-xl ${glowClass} transition-all duration-300 -z-10`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon */}
          {icon && (
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <span className="text-2xl">{icon}</span>
              </div>
            </motion.div>
          )}

          {/* Value Container */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Animated Number */}
            <motion.div
              className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}
            >
              {mounted ? (
                <span className="tabular-nums">
                  {prefix}
                  <motion.span>
                    {Math.round(springValue.get()).toLocaleString()}
                  </motion.span>
                  {suffix}
                </span>
              ) : (
                <span>0</span>
              )}
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-sm md:text-base font-medium uppercase tracking-wider"
            >
              {label}
            </motion.div>
          </div>

          {/* Progress Indicator Bar */}
          <motion.div
            className={`h-1 bg-gradient-to-r ${gradient} rounded-full mt-4 origin-left`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: animationDuration, ease: 'easeOut' }}
          />

          {/* Decorative Corner Accents */}
          <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} opacity-20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2`} />
          <div className={`absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr ${gradient} opacity-20 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2`} />

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'linear',
            }}
          />

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r ${gradient} rounded-full`}
                style={{
                  left: `${30 + i * 20}%`,
                  bottom: '20%',
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Pulse Ring on Hover */}
          <motion.div
            className={`absolute inset-0 border-2 border-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-50`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Animated Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* External Glow on Hover */}
      <motion.div
        className={`absolute -inset-2 bg-gradient-to-br ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-2xl transition-all duration-500 -z-20`}
        initial={false}
      />
    </motion.div>
  );
};

/**
 * Example Usage:
 *
 * <StatsCard
 *   value={1500000}
 *   label="Total Raised"
 *   icon="💰"
 *   prefix="$"
 *   gradient="from-green-500 to-emerald-500"
 *   glowColor="green"
 * />
 *
 * <StatsCard
 *   value={87.5}
 *   label="Progress"
 *   icon="📈"
 *   suffix="%"
 *   decimals={1}
 *   gradient="from-bnb-primary500 to-cyan-500"
 *   glowColor="cyan"
 * />
 *
 * <StatsCard
 *   value={5420}
 *   label="Contributors"
 *   icon="👥"
 *   gradient="from-bnb-secondary500 to-pink-500"
 *   glowColor="purple"
 * />
 */
