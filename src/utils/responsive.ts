// Re-export from the enhanced version for backward compatibility
export * from './responsiveEnhanced';

// Backward compatibility exports
export { scaleSize as scale } from './responsiveEnhanced';
export { useResponsiveLayout as useResponsive } from './responsiveEnhanced';

// Legacy constants for backward compatibility
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 16,  // Alias for base
  lg: 18,
  xl: 20,
};

export const DIMENSIONS = {
  borderRadius: {
    sm: 4,
    small: 4,    // Alias
    md: 8,
    medium: 8,   // Alias
    lg: 12,
    large: 12,   // Alias
    xl: 16,
    full: 999,
  },
};

// Add RESPONSIVE_DIMENSIONS alias for backward compatibility
export const RESPONSIVE_DIMENSIONS = DIMENSIONS;
