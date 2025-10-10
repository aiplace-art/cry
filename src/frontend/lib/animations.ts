import { Variants } from 'framer-motion';

// ============================================================================
// PAGE LOAD SEQUENCE ANIMATIONS
// ============================================================================

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -60,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

export const scaleOut: Variants = {
  visible: {
    opacity: 1,
    scale: 1
  },
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: [0.36, 0, 0.66, -0.56]
    }
  }
};

// Staggered container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Page load sequence with delays
export const pageLoadSequence = {
  hero: { delay: 0 },
  stats: { delay: 0.3 },
  benefits: { delay: 0.5 },
  purchase: { delay: 0.7 }
};

// ============================================================================
// HOVER EFFECTS
// ============================================================================

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  hover: {
    scale: 1.03,
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 0 40px -5px rgba(139, 92, 246, 0.3)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

export const cardTilt: Variants = {
  rest: {
    rotateY: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  hover: {
    rotateY: 5,
    rotateX: 5,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

export const glowEffect: Variants = {
  rest: {
    filter: 'brightness(1) drop-shadow(0 0 0px rgba(139, 92, 246, 0))',
  },
  hover: {
    filter: 'brightness(1.1) drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))',
    transition: {
      duration: 0.3
    }
  }
};

export const buttonHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 0 0px rgba(139, 92, 246, 0)',
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)',
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// ============================================================================
// COUNTDOWN TIMER ANIMATIONS
// ============================================================================

export const numberFlip: Variants = {
  hidden: {
    rotateX: -90,
    opacity: 0
  },
  visible: {
    rotateX: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  exit: {
    rotateX: 90,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

export const urgentPulse: Variants = {
  normal: {
    scale: 1,
    opacity: 1
  },
  urgent: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const colorShift: Variants = {
  normal: {
    color: '#ffffff',
    textShadow: '0 0 0px rgba(255, 255, 255, 0)'
  },
  urgent: {
    color: ['#ffffff', '#ff6b6b', '#ffffff'],
    textShadow: [
      '0 0 0px rgba(255, 107, 107, 0)',
      '0 0 20px rgba(255, 107, 107, 0.8)',
      '0 0 0px rgba(255, 107, 107, 0)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// ============================================================================
// PROGRESS BAR ANIMATIONS
// ============================================================================

export const progressFill = (percentage: number) => ({
  initial: { width: '0%' },
  animate: {
    width: `${percentage}%`,
    transition: {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
});

export const shimmerEffect: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const particleBurst = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: [0, 1.5, 2],
    opacity: [1, 0.6, 0],
    transition: {
      duration: 1,
      ease: 'easeOut'
    }
  }
};

export const milestoneGlow: Variants = {
  hidden: {
    boxShadow: '0 0 0px rgba(139, 92, 246, 0)'
  },
  visible: {
    boxShadow: [
      '0 0 0px rgba(139, 92, 246, 0)',
      '0 0 40px rgba(139, 92, 246, 0.8)',
      '0 0 60px rgba(139, 92, 246, 0.6)',
      '0 0 40px rgba(139, 92, 246, 0.8)',
      '0 0 0px rgba(139, 92, 246, 0)'
    ],
    transition: {
      duration: 2,
      times: [0, 0.2, 0.5, 0.8, 1],
      ease: 'easeInOut'
    }
  }
};

// ============================================================================
// PURCHASE FLOW ANIMATIONS
// ============================================================================

export const loadingSpinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const successConfetti = {
  initial: {
    y: -20,
    opacity: 0,
    scale: 0
  },
  animate: (i: number) => ({
    y: [0, -100, 200],
    x: [0, (Math.random() - 0.5) * 200],
    opacity: [0, 1, 0],
    scale: [0, 1, 0.5],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 2,
      delay: i * 0.05,
      ease: 'easeOut'
    }
  })
};

export const successCheckmark: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export const transactionPending: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const errorShake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  }
};

export const bounce: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

// ============================================================================
// BACKGROUND ANIMATIONS
// ============================================================================

export const gradientRotation: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const floatingParticle = (delay: number = 0) => ({
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    opacity: [0.3, 0.8, 0.3],
    scale: [1, 1.2, 1],
    transition: {
      duration: 6,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
});

export const gridMovement: Variants = {
  animate: {
    backgroundPosition: ['0px 0px', '50px 50px'],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const sectionGlow: Variants = {
  hidden: {
    opacity: 0,
    boxShadow: '0 0 0px rgba(139, 92, 246, 0)'
  },
  visible: {
    opacity: 1,
    boxShadow: [
      '0 0 0px rgba(139, 92, 246, 0)',
      '0 0 100px rgba(139, 92, 246, 0.3)',
      '0 0 0px rgba(139, 92, 246, 0)'
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// ============================================================================
// UTILITY ANIMATIONS
// ============================================================================

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const shake: Variants = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

// ============================================================================
// COMPOSITE ANIMATION CONFIGS
// ============================================================================

export const heroAnimationSequence = {
  container: staggerContainer,
  title: fadeInDown,
  subtitle: fadeInUp,
  cta: scaleIn
};

export const statsAnimationSequence = {
  container: staggerContainer,
  leftCard: slideInLeft,
  rightCard: slideInRight,
  centerCard: scaleIn
};

export const benefitsAnimationSequence = {
  container: staggerContainer,
  card: fadeInUp,
  hover: cardHover,
  glow: glowEffect
};

export const purchaseWidgetAnimation = {
  container: scaleIn,
  button: buttonHover,
  pending: transactionPending,
  success: successConfetti,
  error: errorShake
};

// ============================================================================
// EXPORT ALL ANIMATIONS
// ============================================================================

export const animations = {
  // Page Load
  fadeInUp,
  fadeInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  scaleOut,
  staggerContainer,
  pageLoadSequence,

  // Hover Effects
  cardHover,
  cardTilt,
  glowEffect,
  buttonHover,

  // Countdown
  numberFlip,
  urgentPulse,
  colorShift,

  // Progress Bar
  progressFill,
  shimmerEffect,
  particleBurst,
  milestoneGlow,

  // Purchase Flow
  loadingSpinner,
  successConfetti,
  successCheckmark,
  transactionPending,
  errorShake,
  bounce,

  // Background
  gradientRotation,
  floatingParticle,
  gridMovement,
  sectionGlow,

  // Utility
  pulse,
  float,
  shake,

  // Composite
  heroAnimationSequence,
  statsAnimationSequence,
  benefitsAnimationSequence,
  purchaseWidgetAnimation
};

export default animations;
