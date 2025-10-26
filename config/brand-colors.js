// Централизованная конфигурация цветов HypeAI + BNB Chain
// КРИТИЧЕСКИ ВАЖНО: Все цвета бренда ТОЛЬКО из этого файла!

export const HYPEAI_BRAND = {
  // Основные цвета HypeAI (из официального брендбука)
  primary: '#00E5FF',      // Electric Cyan - основной цвет бренда
  secondary: '#00AAFF',    // Blue - вспомогательный
  accent: '#0077FF',       // Dark Blue - акценты

  // Градиенты HypeAI
  gradient: {
    primary: 'linear-gradient(135deg, #00E5FF 0%, #0077FF 100%)',
    cosmic: 'linear-gradient(135deg, #0077FF 0%, #00E5FF 50%, #00AAFF 100%)',
    energy: 'radial-gradient(circle, #00E5FF 0%, #0077FF 70%)',
    glow: 'linear-gradient(180deg, #00E5FF 0%, #00AAFF 50%, #0077FF 100%)'
  },

  // Цвета с прозрачностью для эффектов
  alpha: {
    primary10: 'rgba(0, 229, 255, 0.1)',
    primary20: 'rgba(0, 229, 255, 0.2)',
    primary50: 'rgba(0, 229, 255, 0.5)',
    secondary20: 'rgba(0, 170, 255, 0.2)',
    accent30: 'rgba(0, 119, 255, 0.3)'
  }
};

export const BNB_CHAIN = {
  // BNB Chain официальные цвета (мы работаем на их сети!)
  gold: '#F3BA2F',         // BNB Gold - официальный цвет BNB
  yellow: '#FFE900',       // BNB Yellow - яркий акцент
  dark: '#14151A',         // BNB Dark - темный фон

  // Градиенты BNB Chain
  gradient: {
    golden: 'linear-gradient(135deg, #FFE900 0%, #F3BA2F 100%)',
    hybrid: 'linear-gradient(135deg, #F3BA2F 0%, #00E5FF 100%)', // BNB + HypeAI
    energyFlow: 'linear-gradient(90deg, #F3BA2F 0%, #00E5FF 50%, #F3BA2F 100%)' // Двустороннее слияние
  },

  // BNB цвета с прозрачностью
  alpha: {
    gold20: 'rgba(243, 186, 47, 0.2)',
    gold50: 'rgba(243, 186, 47, 0.5)',
    yellow20: 'rgba(255, 233, 0, 0.2)'
  }
};

export const COMBINED_PALETTE = {
  // Гибридная палитра для визуалов
  hypeai: HYPEAI_BRAND.primary,
  bnb: BNB_CHAIN.gold,

  // Фоны и текст
  background: '#0A0E27',    // Темный космос
  backgroundLight: '#1A1E37', // Светлее для карточек
  text: '#FFFFFF',
  textSecondary: '#B0B8C8',
  textMuted: '#6B7280',

  // Статусы и акценты
  success: '#10B981',       // Зеленый успех
  warning: '#F59E0B',       // Оранжевое предупреждение
  error: '#EF4444',         // Красная ошибка
  info: HYPEAI_BRAND.primary // Информация = HypeAI cyan
};

// Экспорт цветовых схем для разных типов контента
export const COLOR_SCHEMES = {
  // Схема для социальных медиа
  social: {
    primary: HYPEAI_BRAND.primary,
    secondary: BNB_CHAIN.gold,
    background: COMBINED_PALETTE.background,
    text: COMBINED_PALETTE.text
  },

  // Схема для веб-сайта
  website: {
    primary: HYPEAI_BRAND.primary,
    secondary: HYPEAI_BRAND.secondary,
    accent: BNB_CHAIN.gold,
    background: COMBINED_PALETTE.background,
    text: COMBINED_PALETTE.text
  },

  // Схема для презентаций
  presentation: {
    primary: HYPEAI_BRAND.gradient.cosmic,
    accent: BNB_CHAIN.gold,
    background: COMBINED_PALETTE.background,
    text: COMBINED_PALETTE.text
  }
};

// Путь к официальным логотипам
export const LOGO_PATHS = {
  hypeai: '/Users/ai.place/Crypto/website/logo-official-BRIGHT.svg',
  icon: '/Users/ai.place/Crypto/website/logo-icon-only.svg'
};

export default {
  HYPEAI_BRAND,
  BNB_CHAIN,
  COMBINED_PALETTE,
  COLOR_SCHEMES,
  LOGO_PATHS
};
