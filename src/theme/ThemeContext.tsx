import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Enhanced Color System
export interface Colors {
  // Base colors
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  secondary: string;
  accent: string;
  
  // Status colors
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  error: string;
  onError: string;
  info: string;
  onInfo: string;
  
  // UI colors
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  disabled: string;
  surfaceDisabled: string;
  navbar: string;
  icons: string;
  onSurfaceVariant: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  
  // Special colors
  price: string;
  discount: string;
  rating: string;
  
  // Glass morphism
  glass: string;
  glassBorder: string;
}

export interface Typography {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
  };
  fontWeights: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  full: number;
}

export interface Shadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

const typography: Typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

const borderRadius: BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Light Theme Colors
const LightColors: Colors = {
  // Base colors
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textDisabled: '#9CA3AF',
  
  // Brand colors
  primary: '#FFD700',
  primaryLight: '#FFED4A',
  primaryDark: '#D4AF37',
  onPrimary: '#1A202C',
  secondary: '#667EEA',
  accent: '#ED8936',
  
  // Status colors
  success: '#48BB78',
  onSuccess: '#FFFFFF',
  warning: '#ED8936',
  onWarning: '#FFFFFF',
  error: '#F56565',
  onError: '#FFFFFF',
  info: '#4299E1',
  onInfo: '#FFFFFF',
  
  // UI colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
  disabled: '#CBD5E0',
  surfaceDisabled: '#E2E8F0',
  navbar: '#1A202C',
  icons: '#4A5568',
  onSurfaceVariant: '#4A5568',
  
  // Input colors
  inputBackground: '#F7FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#2D3748',
  placeholder: '#9CA3AF',
  
  // Special colors
  price: '#48BB78',
  discount: '#F56565',
  rating: '#FFD700',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
};

// Dark Theme Colors
const DarkColors: Colors = {
  // Base colors
  background: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceVariant: '#262626',
  card: '#262626',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textDisabled: '#6B7280',
  
  // Brand colors
  primary: '#FFD700',
  primaryLight: '#FFED4A',
  primaryDark: '#D4AF37',
  onPrimary: '#1A202C',
  secondary: '#667EEA',
  accent: '#ED8936',
  
  // Status colors
  success: '#68D391',
  onSuccess: '#1A202C',
  warning: '#F6AD55',
  onWarning: '#1A202C',
  error: '#FC8181',
  onError: '#1A202C',
  info: '#63B3ED',
  onInfo: '#1A202C',
  
  // UI colors
  border: '#374151',
  borderLight: '#4B5563',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  disabled: '#4B5563',
  surfaceDisabled: '#374151',
  navbar: '#1A1A1A',
  icons: '#FFD700',
  onSurfaceVariant: '#D1D5DB',
  
  // Input colors
  inputBackground: '#262626',
  inputBorder: '#374151',
  inputText: '#F9FAFB',
  placeholder: '#6B7280',
  
  // Special colors
  price: '#68D391',
  discount: '#FC8181',
  rating: '#FFD700',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

const createShadows = (isDark: boolean): Shadows => ({
  sm: {
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.4 : 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.5 : 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  xl: {
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: isDark ? 0.6 : 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
});

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  dark: boolean;
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

// Define the context type
export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  colors: Colors;
  themeColors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  dimensions: {
    width: number;
    height: number;
    isSmall: boolean;
    isMedium: boolean;
    isLarge: boolean;
  };
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useDeviceColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('themePreference');
      if (storedTheme) {
        setIsDark(storedTheme === 'dark');
      } else if (systemColorScheme) {
        setIsDark(systemColorScheme === 'dark');
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const colors = isDark ? DarkColors : LightColors;
  const shadows = createShadows(isDark);
  
  const dimensions = {
    width,
    height,
    isSmall: width < 375,
    isMedium: width >= 375 && width < 414,
    isLarge: width >= 414,
  };
  
  const theme: Theme = {
    dark: isDark,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
  };
  
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      isDark,
      colors,
      themeColors: colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      dimensions,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Legacy support - keeping the old interface for backward compatibility
export const Colors = {
  light: LightColors,
  dark: DarkColors,
};

export const LightTheme: Theme = {
  dark: false,
  colors: LightColors,
  typography,
  spacing,
  borderRadius,
  shadows: createShadows(false),
};

export const DarkTheme: Theme = {
  dark: true,
  colors: DarkColors,
  typography,
  spacing,
  borderRadius,
  shadows: createShadows(true),
};

export type ThemeColors = Colors;


