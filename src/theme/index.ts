/**
 * Theme System Index
 * 
 * Centralized exports for the complete theme system including:
 * - Theme context and provider
 * - Theme types and interfaces
 * - Light and dark theme configurations
 */

// Core theme exports
export { 
  ThemeProvider, 
  useTheme, 
  lightTheme, 
  darkTheme 
} from './ThemeContext';

// Type exports for TypeScript support
export type { 
  Theme, 
  ThemeContextType 
} from './ThemeContext';

// Re-export React Native's useColorScheme for convenience
export { useColorScheme } from 'react-native';

// Default export for convenience
export { ThemeProvider as default } from './ThemeContext';
