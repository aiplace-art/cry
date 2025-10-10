import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
}

interface TimeUnit {
  value: number;
  label: string;
}

/**
 * CountdownTimer Component
 *
 * Displays a live countdown to the presale end date with animated numbers
 * and special glow effects when less than 24 hours remain.
 *
 * @param endDate - The end date/time of the presale
 * @param className - Optional additional CSS classes
 */
export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        return [];
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Check if less than 24 hours remain
      setIsUrgent(difference < 24 * 60 * 60 * 1000);

      return [
        { value: days, label: 'Days' },
        { value: hours, label: 'Hours' },
        { value: minutes, label: 'Minutes' },
        { value: seconds, label: 'Seconds' },
      ];
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.length === 0) {
    return (
      <div className={`text-center ${className}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-red-500"
        >
          Presale Ended
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center gap-3 md:gap-6 ${className}`}>
      {timeLeft.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Time Unit Container */}
          <div
            className={`
              relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5
              rounded-xl md:rounded-2xl p-3 md:p-6 min-w-[70px] md:min-w-[100px]
              border border-white/20 shadow-2xl
              ${isUrgent ? 'animate-pulse-glow' : ''}
            `}
          >
            {/* Glow Effect for Urgent State */}
            {isUrgent && (
              <motion.div
                className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-xl"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Number Display */}
            <div className="relative">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={unit.value}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    text-3xl md:text-5xl font-bold tabular-nums
                    bg-gradient-to-br ${
                      isUrgent
                        ? 'from-red-400 via-orange-400 to-yellow-400'
                        : 'from-blue-400 via-purple-400 to-pink-400'
                    }
                    bg-clip-text text-transparent
                  `}
                >
                  {String(unit.value).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>

              {/* Label */}
              <motion.div
                className="text-xs md:text-sm text-gray-400 font-medium mt-1 md:mt-2 uppercase tracking-wider"
                animate={isUrgent ? { color: ['#9ca3af', '#ef4444', '#9ca3af'] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {unit.label}
              </motion.div>
            </div>

            {/* Separator (except for last item) */}
            {index < timeLeft.length - 1 && (
              <div className="absolute -right-2 md:-right-3 top-1/2 -translate-y-1/2 text-xl md:text-3xl font-bold text-gray-600">
                :
              </div>
            )}
          </div>
        </motion.div>
      ))}

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5),
                        0 0 40px rgba(249, 115, 22, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8),
                        0 0 60px rgba(249, 115, 22, 0.5);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
