import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1920,
};

// Design reference dimensions (iPhone 14 Pro)
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

/**
 * Get current screen size category
 */
export const getScreenSize = (width = SCREEN_WIDTH) => {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'ultrawide';
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return getScreenSize() === 'mobile';
};

/**
 * Check if device is tablet
 */
export const isTablet = () => {
  return getScreenSize() === 'tablet';
};

/**
 * Check if device is desktop
 */
export const isDesktop = () => {
  const size = getScreenSize();
  return size === 'desktop' || size === 'ultrawide';
};

/**
 * Responsive width scaling
 */
export const wp = (percentage) => {
  const width = Dimensions.get('window').width;
  return PixelRatio.roundToNearestPixel((width * percentage) / 100);
};

/**
 * Responsive height scaling
 */
export const hp = (percentage) => {
  const height = Dimensions.get('window').height;
  return PixelRatio.roundToNearestPixel((height * percentage) / 100);
};

/**
 * Responsive font scaling
 */
export const normalize = (size) => {
  const scale = SCREEN_WIDTH / DESIGN_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

/**
 * Get number of grid columns based on screen size
 */
export const getGridColumns = (width = SCREEN_WIDTH) => {
  const size = getScreenSize(width);
  switch (size) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
    case 'ultrawide':
      return 3;
    default:
      return 1;
  }
};

/**
 * Get responsive spacing
 */
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
  xxl: normalize(48),
};

/**
 * Get responsive font sizes
 */
export const fontSize = {
  xs: normalize(10),
  sm: normalize(12),
  md: normalize(14),
  lg: normalize(16),
  xl: normalize(20),
  xxl: normalize(24),
  xxxl: normalize(32),
};

/**
 * Check if screen is small (height < 700)
 */
export const isSmallScreen = () => {
  return SCREEN_HEIGHT < 700;
};

/**
 * Get safe minimum touch target size (44x44 for iOS/Android)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Get optimal item width for grid
 */
export const getItemWidth = (numColumns = 1, spacing = 16) => {
  const width = Dimensions.get('window').width;
  const totalSpacing = spacing * (numColumns + 1);
  const availableWidth = width - totalSpacing;
  return availableWidth / numColumns;
};

/**
 * Responsive values based on screen size
 */
export const responsiveValue = (values) => {
  const size = getScreenSize();

  if (typeof values === 'object' && !Array.isArray(values)) {
    return values[size] || values.mobile || values.default;
  }

  return values;
};

/**
 * Get platform-specific styles
 */
export const platformStyles = (iosStyle, androidStyle, webStyle) => {
  if (Platform.OS === 'ios') return iosStyle;
  if (Platform.OS === 'android') return androidStyle;
  if (Platform.OS === 'web') return webStyle;
  return {};
};

export default {
  BREAKPOINTS,
  getScreenSize,
  isMobile,
  isTablet,
  isDesktop,
  wp,
  hp,
  normalize,
  getGridColumns,
  spacing,
  fontSize,
  isSmallScreen,
  MIN_TOUCH_TARGET,
  getItemWidth,
  responsiveValue,
  platformStyles,
};
