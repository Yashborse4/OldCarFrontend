// Design System Tokens (clean, centralized)
// Keep types narrow so React Native style types accept fontWeight etc.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  '2xl': 48,
  '3xl': 56,
} as const;

export const borderRadius = {
  sm: 4,
  small: 4,    // Alias for sm
  md: 8,
  medium: 8,   // Alias for md
  lg: 12,
  large: 12,   // Alias for lg
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,  // Alias for base
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 24,
  } as const,
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  } as const,
} as const;


export const colors = {
  // Primary Brand: Modern Indigo
  primary: '#4F46E5', // Indigo 600 - Dynamic, confident
  secondary: '#334155', // Slate 700 - Professional, solid

  // Semantic Colors (adjusted for modern vibrancy)
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  info: '#3B82F6', // Blue 500

  // Text Colors (High readability on light)
  text: '#0F172A', // Slate 900 - Sharp, nearly black
  textSecondary: '#64748B', // Slate 500 - Refined grey
  textDisabled: '#94A3B8', // Slate 400

  // Surface / Background
  background: '#F8FAFC', // Slate 50 - Premium, airy feel
  surface: '#FFFFFF', // Pure white for cards/modals
  surfaceVariant: '#F1F5F9', // Slate 100 - Subtle contrast
  border: '#E2E8F0', // Slate 200 - Delicate borders

  // On-Color Text
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onWarning: '#FFFFFF',
  onError: '#FFFFFF',
  onInfo: '#FFFFFF',
  onSurfaceVariant: '#334155',

  // Utilities

  white: '#FFFFFF',
  black: '#000000',
} as const;

// Debug log to verify export
console.log('Design system tokens loaded - colors:', !!colors);

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type FontSize = keyof typeof typography.fontSizes;
export type FontWeight = keyof typeof typography.fontWeights;
export type LetterSpacing = keyof typeof typography.letterSpacing;


