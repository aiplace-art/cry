import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface Benefit {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

interface BenefitsGridProps {
  benefits?: Benefit[];
  className?: string;
}

const defaultBenefits: Benefit[] = [
  {
    icon: '🚀',
    title: 'Early Access',
    description: 'Be among the first to access exclusive features and tools before public launch',
    gradient: 'from-bnb-primary500 to-cyan-500',
  },
  {
    icon: '💎',
    title: 'Bonus Tokens',
    description: 'Receive up to 30% bonus tokens during presale with special tier multipliers',
    gradient: 'from-bnb-secondary500 to-pink-500',
  },
  {
    icon: '🔒',
    title: 'Locked Liquidity',
    description: '100% of liquidity locked for 2 years ensuring long-term project stability',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: '⚡',
    title: 'Instant Staking',
    description: 'Stake your tokens immediately after presale with up to 50% APY rewards',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: '🎯',
    title: 'Governance Rights',
    description: 'Vote on key decisions and shape the future direction of the project',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: '🌟',
    title: 'VIP Community',
    description: 'Join exclusive VIP channels with direct access to the core development team',
    gradient: 'from-bnb-primary500 to-bnb-primary500',
  },
];

/**
 * BenefitsGrid Component
 *
 * Displays a grid of benefit cards with icons, descriptions, and hover animations
 * using glassmorphism styling. Each card features gradient accents and smooth transitions.
 *
 * @param benefits - Array of benefit objects (uses defaults if not provided)
 * @param className - Optional additional CSS classes
 */
export const BenefitsGrid: React.FC<BenefitsGridProps> = ({
  benefits = defaultBenefits,
  className = '',
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group relative"
        >
          {/* Card Container with Glassmorphism */}
          <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-white/40">
            {/* Animated Background Gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              initial={false}
            />

            {/* Glow Effect on Hover */}
            <motion.div
              className={`absolute -inset-1 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
              initial={false}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon Container */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg`}>
                  <span className="text-3xl">{benefit.icon}</span>
                </div>
              </motion.div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {benefit.description}
              </p>

              {/* Decorative Line */}
              <motion.div
                className={`h-1 bg-gradient-to-r ${benefit.gradient} rounded-full mt-4 origin-left`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>

            {/* Corner Accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${benefit.gradient} opacity-10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity duration-300`} />
            <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${benefit.gradient} opacity-10 blur-2xl rounded-full translate-y-1/2 -translate-x-1/2 group-hover:opacity-20 transition-opacity duration-300`} />

            {/* Shimmer Effect on Hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut',
              }}
            />

            {/* Particle Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 bg-gradient-to-r ${benefit.gradient} rounded-full opacity-0 group-hover:opacity-100`}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>

          {/* External Glow Ring */}
          <motion.div
            className={`absolute -inset-1 bg-gradient-to-br ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300 -z-10`}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}

      {/* Background Decoration */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </motion.div>
  );
};
