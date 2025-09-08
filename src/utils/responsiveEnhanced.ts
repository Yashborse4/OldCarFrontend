import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useState, useEffect } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced breakpoints for better device categorization
export const BREAKPOINTS = {
  xs: 0,    // Small phones (iPhone SE, small Android)
  sm: 375,  // Standard phones (iPhone 6/7/8, most Android)
  md: 414,  // Large phones (iPhone Plus, large Android)
  lg: 768,  // Tablets (iPad, Android tablets)
  xl: 1024, // Large tablets/small laptops
  xxl: 1440, // Desktop screens
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Device type detection
export const DEVICE_TYPES = {
  PHONE: 'phone',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
} as const;

export type DeviceType = typeof DEVICE_TYPES[keyof typeof DEVICE_TYPES];

// Enhanced responsive scales
export const RESPONSIVE_SCALES = {
  // Spacing scales for different device types
  spacing: {
    phone: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
    },
    tablet: {
      xs: 6,
      sm: 12,
      md: 18,
      lg: 24,
      xl: 30,
      xxl: 36,
    },
    desktop: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
      xxl: 48,
    },
  },
  
  // Typography scales
  typography: {
    phone: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      display: 24,
      hero: 28,
    },
    tablet: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      display: 28,
      hero: 32,
    },
    desktop: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
      xxl: 26,
      display: 32,
      hero: 36,
    },
  },
  
  // Border radius scales
  borderRadius: {
    phone: {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
      xxl: 16,
      full: 9999,
    },
    tablet: {
      xs: 3,
      sm: 6,
      md: 9,
      lg: 12,
      xl: 18,
      xxl: 24,
      full: 9999,
    },
    desktop: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      full: 9999,
    },
  },
} as const;

// Enhanced responsive functions
export const getDeviceType = (): DeviceType => {
  if (Platform.OS === 'web') return DEVICE_TYPES.DESKTOP;
  if (SCREEN_WIDTH >= BREAKPOINTS.lg) return DEVICE_TYPES.TABLET;
  return DEVICE_TYPES.PHONE;
};

export const getCurrentBreakpoint = (): Breakpoint => {
  if (SCREEN_WIDTH >= BREAKPOINTS.xxl) return 'xxl';
  if (SCREEN_WIDTH >= BREAKPOINTS.xl) return 'xl';
  if (SCREEN_WIDTH >= BREAKPOINTS.lg) return 'lg';
  if (SCREEN_WIDTH >= BREAKPOINTS.md) return 'md';
  if (SCREEN_WIDTH >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS[breakpoint];
};

export const isBetweenBreakpoints = (min: Breakpoint, max: Breakpoint): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS[min] && SCREEN_WIDTH < BREAKPOINTS[max];
};

// Enhanced scaling functions
export const scaleSize = (size: number, factor: number = 1): number => {
  const deviceType = getDeviceType();
  const pixelDensity = PixelRatio.get();
  
  let scaleFactor = 1;
  
  switch (deviceType) {
    case DEVICE_TYPES.PHONE:
      scaleFactor = Math.min(SCREEN_WIDTH / 375, 1.2); // Base on iPhone 6/7/8
      break;
    case DEVICE_TYPES.TABLET:
      scaleFactor = Math.min(SCREEN_WIDTH / 768, 1.4); // Base on iPad
      break;
    case DEVICE_TYPES.DESKTOP:
      scaleFactor = Math.min(SCREEN_WIDTH / 1440, 1.6); // Base on desktop
      break;
  }
  
  // Adjust for high-density screens
  if (pixelDensity > 2) {
    scaleFactor *= 0.95; // Slightly reduce size on high-density screens
  }
  
  return Math.round(size * scaleFactor * factor);
};

// Get responsive value based on breakpoints
export const getResponsiveValue = <T>(values: {
  [K in Breakpoint]?: T;
} & { default?: T }): T => {
  const breakpoint = getCurrentBreakpoint();
  const orderedBreakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  // Try to find the value for current or smaller breakpoint
  for (const bp of orderedBreakpoints) {
    if (SCREEN_WIDTH >= BREAKPOINTS[bp] && values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return values.default as T;
};

// Get responsive spacing
export const getResponsiveSpacing = (size: keyof typeof RESPONSIVE_SCALES.spacing.phone): number => {
  const deviceType = getDeviceType();
  return RESPONSIVE_SCALES.spacing[deviceType][size];
};

// Get responsive typography
export const getResponsiveTypography = (size: keyof typeof RESPONSIVE_SCALES.typography.phone): number => {
  const deviceType = getDeviceType();
  return RESPONSIVE_SCALES.typography[deviceType][size];
};

// Get responsive border radius
export const getResponsiveBorderRadius = (size: keyof typeof RESPONSIVE_SCALES.borderRadius.phone): number => {
  const deviceType = getDeviceType();
  return RESPONSIVE_SCALES.borderRadius[deviceType][size];
};

// Enhanced width and height percentage functions
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Minimum and maximum size functions
export const minSize = (size: number, min: number): number => Math.max(size, min);
export const maxSize = (size: number, max: number): number => Math.min(size, max);
export const clampSize = (size: number, min: number, max: number): number => 
  Math.min(Math.max(size, min), max);

// Enhanced responsive hook
export const useResponsiveLayout = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const deviceType = getDeviceType();
  const breakpoint = getCurrentBreakpoint();
  const isTablet = deviceType === DEVICE_TYPES.TABLET;
  const isPhone = deviceType === DEVICE_TYPES.PHONE;
  const isDesktop = deviceType === DEVICE_TYPES.DESKTOP;
  
  return {
    // Screen dimensions
    width: dimensions.width,
    height: dimensions.height,
    
    // Device info
    deviceType,
    breakpoint,
    isTablet,
    isPhone,
    isDesktop,
    isLandscape: dimensions.width > dimensions.height,
    isPortrait: dimensions.width <= dimensions.height,
    
    // Responsive utilities
    wp,
    hp,
    scaleSize,
    getResponsiveValue,
    getResponsiveSpacing,
    getResponsiveTypography,
    getResponsiveBorderRadius,
    
    // Layout helpers
    safeMargin: getResponsiveSpacing('md'),
    contentPadding: getResponsiveSpacing('lg'),
    sectionSpacing: getResponsiveSpacing('xl'),
    
    // Typography helpers
    bodyText: getResponsiveTypography('md'),
    heading: getResponsiveTypography('xl'),
    title: getResponsiveTypography('xxl'),
    
    // Component sizing
    buttonHeight: isTablet ? 56 : 48,
    inputHeight: isTablet ? 52 : 44,
    cardPadding: getResponsiveSpacing('lg'),
    
    // Breakpoint checks
    isBreakpoint,
    isBetweenBreakpoints,
  };
};

// CSS-in-JS style generator for responsive design
export const createResponsiveStyles = <T extends Record<string, any>>(
  styleGenerator: (layout: ReturnType<typeof useResponsiveLayout>) => T
): T => {
  const layout = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    deviceType: getDeviceType(),
    breakpoint: getCurrentBreakpoint(),
    isTablet: getDeviceType() === DEVICE_TYPES.TABLET,
    isPhone: getDeviceType() === DEVICE_TYPES.PHONE,
    isDesktop: getDeviceType() === DEVICE_TYPES.DESKTOP,
    isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
    isPortrait: SCREEN_WIDTH <= SCREEN_HEIGHT,
    wp,
    hp,
    scaleSize,
    getResponsiveValue,
    getResponsiveSpacing,
    getResponsiveTypography,
    getResponsiveBorderRadius,
    safeMargin: getResponsiveSpacing('md'),
    contentPadding: getResponsiveSpacing('lg'),
    sectionSpacing: getResponsiveSpacing('xl'),
    bodyText: getResponsiveTypography('md'),
    heading: getResponsiveTypography('xl'),
    title: getResponsiveTypography('xxl'),
    buttonHeight: getDeviceType() === DEVICE_TYPES.TABLET ? 56 : 48,
    inputHeight: getDeviceType() === DEVICE_TYPES.TABLET ? 52 : 44,
    cardPadding: getResponsiveSpacing('lg'),
    isBreakpoint,
    isBetweenBreakpoints,
  };
  
  return styleGenerator(layout as any);
};

// Component-specific responsive helpers
export const getResponsiveCardStyle = () => ({
  padding: getResponsiveSpacing('lg'),
  borderRadius: getResponsiveBorderRadius('lg'),
  marginBottom: getResponsiveSpacing('md'),
});

export const getResponsiveButtonStyle = () => ({
  height: getDeviceType() === DEVICE_TYPES.TABLET ? 56 : 48,
  paddingHorizontal: getResponsiveSpacing('lg'),
  borderRadius: getResponsiveBorderRadius('md'),
});

export const getResponsiveInputStyle = () => ({
  height: getDeviceType() === DEVICE_TYPES.TABLET ? 52 : 44,
  paddingHorizontal: getResponsiveSpacing('md'),
  fontSize: getResponsiveTypography('md'),
  borderRadius: getResponsiveBorderRadius('sm'),
});

export const getResponsiveModalStyle = () => ({
  maxWidth: getResponsiveValue({
    xs: wp(90),
    sm: wp(85),
    md: wp(80),
    lg: wp(70),
    xl: wp(60),
    xxl: wp(50),
  }),
  padding: getResponsiveSpacing('xl'),
  borderRadius: getResponsiveBorderRadius('xl'),
});

export default {
  BREAKPOINTS,
  DEVICE_TYPES,
  RESPONSIVE_SCALES,
  getDeviceType,
  getCurrentBreakpoint,
  isBreakpoint,
  isBetweenBreakpoints,
  scaleSize,
  getResponsiveValue,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  wp,
  hp,
  minSize,
  maxSize,
  clampSize,
  useResponsiveLayout,
  createResponsiveStyles,
  getResponsiveCardStyle,
  getResponsiveButtonStyle,
  getResponsiveInputStyle,
  getResponsiveModalStyle,
};


