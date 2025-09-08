/**
 * Responsive Design System for Car Marketplace App
 * Provides consistent spacing, sizing, and responsive utilities
 * Optimized for performance with memoization
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Device dimensions cache
let screenData = Dimensions.get('screen');
let windowData = Dimensions.get('window');

// Update screen data when orientation changes
Dimensions.addEventListener('change', ({ screen, window }) => {
  screenData = screen;
  windowData = window;
});

// Device categorization
export interface DeviceInfo {
  isSmallScreen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  isTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
}

// Screen size breakpoints
export const BREAKPOINTS = {
  SMALL: 350,   // Small phones
  MEDIUM: 414,  // Standard phones
  LARGE: 768,   // Large phones / Small tablets
  TABLET: 1024, // Tablets
} as const;

// Get current device info (memoized)
let cachedDeviceInfo: DeviceInfo | null = null;
let lastWindowWidth = 0;

export const getDeviceInfo = (): DeviceInfo => {
  // Return cached info if window width hasn't changed
  if (cachedDeviceInfo && windowData.width === lastWindowWidth) {
    return cachedDeviceInfo;
  }

  const { width: windowWidth, height: windowHeight } = windowData;
  const { width: screenWidth, height: screenHeight } = screenData;
  
  const isLandscape = windowWidth > windowHeight;
  const effectiveWidth = Math.min(windowWidth, windowHeight); // Use smaller dimension for categorization
  
  cachedDeviceInfo = {
    isSmallScreen: effectiveWidth <= BREAKPOINTS.SMALL,
    isMediumScreen: effectiveWidth > BREAKPOINTS.SMALL && effectiveWidth <= BREAKPOINTS.MEDIUM,
    isLargeScreen: effectiveWidth > BREAKPOINTS.MEDIUM && effectiveWidth <= BREAKPOINTS.LARGE,
    isTablet: effectiveWidth > BREAKPOINTS.LARGE,
    isLandscape,
    screenWidth,
    screenHeight,
    windowWidth,
    windowHeight,
  };
  
  lastWindowWidth = windowWidth;
  return cachedDeviceInfo;
};

// Responsive scaling functions with performance optimization
const pixelRatio = PixelRatio.get();
const isIOS = Platform.OS === 'ios';

/**
 * Scale size based on screen width
 * @param size Base size for medium screens
 * @returns Scaled size for current device
 */
export const scale = (size: number): number => {
  const deviceInfo = getDeviceInfo();
  const { windowWidth } = deviceInfo;
  
  // Base width for scaling (iPhone 11 Pro width)
  const baseWidth = 375;
  const scaleFactor = windowWidth / baseWidth;
  
  // Limit scaling to prevent too large/small sizes
  const limitedScale = Math.max(0.8, Math.min(scaleFactor, 1.3));
  
  return Math.round(size * limitedScale);
};

/**
 * Scale font size with accessibility considerations
 * @param fontSize Base font size
 * @returns Scaled font size
 */
export const scaleFont = (fontSize: number): number => {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isSmallScreen) {
    return Math.round(fontSize * 0.9);
  } else if (deviceInfo.isTablet) {
    return Math.round(fontSize * 1.2);
  }
  
  return Math.round(fontSize * scale(1));
};

/**
 * Responsive spacing system
 */
export const SPACING = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
} as const;

/**
 * Responsive font sizes
 */
export const FONT_SIZES = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(20),
  xxxl: scaleFont(24),
  display: scaleFont(32),
} as const;

/**
 * Responsive dimensions for common UI elements
 */
export const DIMENSIONS = {
  buttonHeight: {
    small: scale(36),
    medium: scale(44),
    large: scale(52),
  },
  inputHeight: {
    small: scale(40),
    medium: scale(48),
    large: scale(56),
  },
  iconSize: {
    small: scale(16),
    medium: scale(20),
    large: scale(24),
    xl: scale(32),
  },
  borderRadius: {
    small: scale(4),
    medium: scale(8),
    large: scale(12),
    xl: scale(16),
  },
  cardPadding: getDeviceInfo().isSmallScreen ? SPACING.sm : SPACING.md,
  screenPadding: getDeviceInfo().isSmallScreen ? SPACING.sm : SPACING.md,
} as const;

/**
 * Responsive layout utilities
 */
export const LAYOUT = {
  // Container widths
  maxWidth: {
    small: '100%',
    medium: scale(600),
    large: scale(800),
  },
  
  // Grid system
  columns: {
    phone: 1,
    phoneLandscape: 2,
    tablet: getDeviceInfo().isTablet ? 3 : 2,
  },
  
  // Safe areas for different devices
  safeArea: {
    top: isIOS ? scale(44) : scale(24),
    bottom: isIOS ? scale(34) : scale(0),
  },
} as const;

/**
 * Get responsive value based on screen size
 * @param values Object with values for different screen sizes
 * @returns Appropriate value for current screen size
 */
export const getResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  tablet?: T;
  default: T;
}): T => {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isTablet && values.tablet !== undefined) {
    return values.tablet;
  }
  if (deviceInfo.isLargeScreen && values.large !== undefined) {
    return values.large;
  }
  if (deviceInfo.isMediumScreen && values.medium !== undefined) {
    return values.medium;
  }
  if (deviceInfo.isSmallScreen && values.small !== undefined) {
    return values.small;
  }
  
  return values.default;
};

/**
 * Responsive width/height percentages
 * @param percentage Percentage as number (0-100)
 * @returns Pixel value based on screen dimension
 */
export const wp = (percentage: number): number => {
  return Math.round((windowData.width * percentage) / 100);
};

export const hp = (percentage: number): number => {
  return Math.round((windowData.height * percentage) / 100);
};

/**
 * Safe area aware dimensions
 */
export const getSafeAreaDimensions = () => {
  const deviceInfo = getDeviceInfo();
  return {
    width: deviceInfo.windowWidth,
    height: deviceInfo.windowHeight - LAYOUT.safeArea.top - LAYOUT.safeArea.bottom,
    safeAreaTop: LAYOUT.safeArea.top,
    safeAreaBottom: LAYOUT.safeArea.bottom,
  };
};

/**
 * Responsive hook for components
 * Returns device info and responsive utilities
 */
export const useResponsive = () => {
  const deviceInfo = getDeviceInfo();
  
  return {
    deviceInfo,
    scale,
    scaleFont,
    wp,
    hp,
    SPACING,
    FONT_SIZES,
    DIMENSIONS,
    LAYOUT,
    getResponsiveValue,
    getSafeAreaDimensions,
  };
};

/**
 * Memoized responsive styles helper
 */
export const createResponsiveStyles = <T extends Record<string, any>>(
  styleCreator: (responsive: ReturnType<typeof useResponsive>) => T
): T => {
  const responsive = useResponsive();
  return styleCreator(responsive);
};

/**
 * Performance monitoring for responsive calculations
 */
export const ResponsiveDebugger = {
  logDeviceInfo: () => {
    const info = getDeviceInfo();
    console.log('📱 Device Info:', {
      type: info.isTablet ? 'Tablet' : info.isLargeScreen ? 'Large Phone' : info.isMediumScreen ? 'Medium Phone' : 'Small Phone',
      dimensions: `${info.windowWidth}x${info.windowHeight}`,
      orientation: info.isLandscape ? 'Landscape' : 'Portrait',
      pixelRatio: PixelRatio.get(),
      platform: Platform.OS,
    });
  },
  
  measurePerformance: (label: string, fn: () => void) => {
    const start = Date.now();
    fn();
    const end = Date.now();
    console.log(`⚡ ${label}: ${end - start}ms`);
  },
};

// Export commonly used combinations
export const COMMON_STYLES = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: scale(3),
  },
  
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: scale(5),
  },
  
  centerContent: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  flexRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  flexColumn: {
    flexDirection: 'column' as const,
  },
  
  fullSize: {
    width: '100%',
    height: '100%',
  },
} as const;


