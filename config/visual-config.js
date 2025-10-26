// Конфигурация визуальной системы HypeAI
// Все стили для генерации медиа-контента

import { HYPEAI_BRAND, BNB_CHAIN, COMBINED_PALETTE, LOGO_PATHS } from './brand-colors.js';

// 8 визуальных стилей для разнообразия контента
export const VISUAL_STYLES = {
  minimalist: {
    name: 'Минималистичный',
    colors: [HYPEAI_BRAND.primary, HYPEAI_BRAND.secondary],
    background: COMBINED_PALETTE.background,
    accent: BNB_CHAIN.gold,
    gradient: null,
    font: {
      title: 'bold 48px Arial',
      subtitle: '24px Arial',
      body: '18px Arial'
    }
  },

  techGradient: {
    name: 'Технологичный градиент',
    gradient: HYPEAI_BRAND.gradient.cosmic,
    accent: BNB_CHAIN.gold,
    grid: HYPEAI_BRAND.accent,
    background: COMBINED_PALETTE.background,
    font: {
      title: 'bold 52px "Segoe UI"',
      subtitle: '26px "Segoe UI"',
      body: '20px "Segoe UI"'
    }
  },

  neonGlow: {
    name: 'Неоновое свечение',
    colors: [HYPEAI_BRAND.primary, HYPEAI_BRAND.accent],
    background: '#000000',
    glow: HYPEAI_BRAND.alpha.primary50,
    accent: BNB_CHAIN.gold,
    font: {
      title: 'bold 50px Arial',
      subtitle: '25px Arial',
      body: '19px Arial'
    }
  },

  corporate: {
    name: 'Корпоративный',
    colors: [HYPEAI_BRAND.secondary, BNB_CHAIN.gold],
    background: COMBINED_PALETTE.backgroundLight,
    accent: HYPEAI_BRAND.primary,
    font: {
      title: 'bold 46px "Helvetica"',
      subtitle: '23px "Helvetica"',
      body: '18px "Helvetica"'
    }
  },

  energyFlow: {
    name: 'Энергетический поток',
    gradient: BNB_CHAIN.gradient.energyFlow,
    particles: HYPEAI_BRAND.primary,
    background: COMBINED_PALETTE.background,
    font: {
      title: 'bold 54px Arial',
      subtitle: '27px Arial',
      body: '21px Arial'
    }
  },

  cyberpunk: {
    name: 'Киберпанк',
    colors: [HYPEAI_BRAND.primary, '#FF00FF', BNB_CHAIN.gold],
    background: '#0D0221',
    grid: HYPEAI_BRAND.alpha.primary20,
    accent: BNB_CHAIN.yellow,
    font: {
      title: 'bold 56px monospace',
      subtitle: '28px monospace',
      body: '20px monospace'
    }
  },

  clean: {
    name: 'Чистый дизайн',
    colors: [HYPEAI_BRAND.primary, COMBINED_PALETTE.text],
    background: '#FFFFFF',
    accent: BNB_CHAIN.gold,
    textColor: COMBINED_PALETTE.background,
    font: {
      title: 'bold 48px "Helvetica Neue"',
      subtitle: '24px "Helvetica Neue"',
      body: '18px "Helvetica Neue"'
    }
  },

  cosmic: {
    name: 'Космический',
    gradient: HYPEAI_BRAND.gradient.energy,
    stars: HYPEAI_BRAND.alpha.primary20,
    accent: BNB_CHAIN.gold,
    background: '#000814',
    font: {
      title: 'bold 52px "Futura"',
      subtitle: '26px "Futura"',
      body: '19px "Futura"'
    }
  }
};

// Конфигурация для разных типов медиа
export const MEDIA_CONFIGS = {
  // Социальные сети
  socialPost: {
    width: 1200,
    height: 1200,
    format: 'png',
    style: 'techGradient',
    logo: LOGO_PATHS.hypeai,
    branding: 'full'
  },

  story: {
    width: 1080,
    height: 1920,
    format: 'png',
    style: 'neonGlow',
    logo: LOGO_PATHS.icon,
    branding: 'minimal'
  },

  banner: {
    width: 1500,
    height: 500,
    format: 'png',
    style: 'energyFlow',
    logo: LOGO_PATHS.hypeai,
    branding: 'full'
  },

  // Презентации
  slide: {
    width: 1920,
    height: 1080,
    format: 'png',
    style: 'corporate',
    logo: LOGO_PATHS.hypeai,
    branding: 'corner'
  },

  // Веб-сайт
  heroImage: {
    width: 1920,
    height: 1080,
    format: 'jpg',
    quality: 90,
    style: 'cosmic',
    logo: LOGO_PATHS.hypeai,
    branding: 'center'
  },

  thumbnail: {
    width: 640,
    height: 360,
    format: 'jpg',
    quality: 85,
    style: 'minimalist',
    logo: LOGO_PATHS.icon,
    branding: 'minimal'
  }
};

// Брендинг элементы (где разместить логотип)
export const BRANDING_POSITIONS = {
  full: {
    logo: { x: 100, y: 100, scale: 1.0 },
    tagline: true,
    position: 'top-left'
  },

  minimal: {
    logo: { x: 50, y: 50, scale: 0.6 },
    tagline: false,
    position: 'top-left'
  },

  corner: {
    logo: { x: 'right-50', y: 50, scale: 0.7 },
    tagline: false,
    position: 'top-right'
  },

  center: {
    logo: { x: 'center', y: 'center', scale: 1.2 },
    tagline: true,
    position: 'center'
  }
};

// Текстовые шаблоны для разных типов контента
export const TEXT_TEMPLATES = {
  announcement: {
    title: { maxLength: 40, align: 'left', weight: 'bold' },
    subtitle: { maxLength: 80, align: 'left', weight: 'normal' },
    cta: { text: 'Learn More', position: 'bottom-right' }
  },

  feature: {
    title: { maxLength: 30, align: 'center', weight: 'bold' },
    description: { maxLength: 120, align: 'center', weight: 'normal' },
    benefits: { bullets: true, maxItems: 3 }
  },

  stats: {
    metric: { size: 'large', color: HYPEAI_BRAND.primary },
    label: { size: 'small', color: COMBINED_PALETTE.textSecondary },
    layout: 'grid'
  },

  quote: {
    text: { maxLength: 100, align: 'center', style: 'italic' },
    author: { position: 'bottom-right', style: 'normal' },
    decoration: { type: 'quotation-marks', color: BNB_CHAIN.gold }
  }
};

// Экспорт всех конфигураций
export default {
  VISUAL_STYLES,
  MEDIA_CONFIGS,
  BRANDING_POSITIONS,
  TEXT_TEMPLATES,
  LOGO_PATHS
};
