import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Clock } from 'lucide-react';

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const stats: StatCard[] = [
  {
    id: 'price',
    title: 'Token Price',
    value: '$0.0012',
    change: '+24.5%',
    changeType: 'positive',
    icon: TrendingUp,
    color: 'from-primary-500 to-primary-700',
  },
  {
    id: 'raised',
    title: 'Total Raised',
    value: '$125,430',
    change: '+15.2%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'from-green-500 to-green-700',
  },
  {
    id: 'participants',
    title: 'Participants',
    value: '1,247',
    change: '+8.3%',
    changeType: 'positive',
    icon: Users,
    color: 'from-bnb-secondary500 to-bnb-primary700',
  },
  {
    id: 'remaining',
    title: 'Time Remaining',
    value: '5d 12h',
    change: 'Ends soon',
    changeType: 'neutral',
    icon: Clock,
    color: 'from-orange-500 to-orange-700',
  },
];

export function SwipeableStatsCards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
      if (offset > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (offset < 0 && currentIndex < stats.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  useEffect(() => {
    setDragOffset(-currentIndex * 100);
  }, [currentIndex]);

  return (
    <div className="relative w-full overflow-hidden" ref={containerRef}>
      <motion.div
        className="flex gap-4 px-4 py-2"
        drag="x"
        dragConstraints={{ left: -(stats.length - 1) * 100, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={{ x: `${dragOffset}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            className="flex-shrink-0 w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`h-full p-6 rounded-2xl bg-gradient-to-br ${stat.color} shadow-xl`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  stat.changeType === 'positive'
                    ? 'bg-green-500/30 text-green-100'
                    : stat.changeType === 'negative'
                    ? 'bg-red-500/30 text-red-100'
                    : 'bg-white/20 text-white'
                }`}>
                  {stat.change}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white/80 mb-2">
                {stat.title}
              </h3>

              <p className="text-4xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {stats.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all touch-manipulation no-tap-highlight ${
              index === currentIndex
                ? 'bg-primary-600 w-8'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            style={{ minWidth: '44px', minHeight: '44px', padding: '20px' }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
