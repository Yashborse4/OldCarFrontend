import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as baseColors, spacing as baseSpacing, typography as baseTypography, borderRadius as baseBorderRadius } from '../design-system/tokens';

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    text: string;
    textSecondary: string;
    textDisabled: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    onPrimary: string;
    onSecondary: string;
    onSuccess: string;
    onWarning: string;
    onError: string;
    onInfo: string;
    surface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    border: string;
    background: string;

    white: string;
    black: string;
  };
  spacing: typeof baseSpacing;
  typography: typeof baseTypography;
  borderRadius: typeof baseBorderRadius;
}

const lightTheme: Theme = {
  mode: 'light',
  colors: baseColors,
  spacing: baseSpacing,
  typography: baseTypography,
  borderRadius: baseBorderRadius,
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Text colors for dark theme (High contrast, slightly off-white)
    text: '#F1F5F9', // Slate 100
    textSecondary: '#94A3B8', // Slate 400
    textDisabled: '#64748B', // Slate 500

    // Brand colors (Consistently vibrant but readable)
    primary: '#6366F1', // Indigo 500 - Lighter for dark mode visibility
    secondary: '#475569', // Slate 600
    success: '#34D399', // Emerald 400
    warning: '#FBBF24', // Amber 400
    error: '#F87171', // Red 400
    info: '#60A5FA', // Blue 400

    // On-color text
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSuccess: '#022C22',
    onWarning: '#451A03',
    onError: '#450A0A',
    onInfo: '#FFFFFF',

    // Surface colors (Rich dark blues instead of flat blacks)
    surface: '#1E293B', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    onSurfaceVariant: '#CBD5E1', // Slate 300

    // UI colors
    border: '#334155', // Slate 700
    background: '#0F172A', // Slate 900 - Deep, rich background


    // Utility colors
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: baseSpacing,
  typography: baseTypography,
  borderRadius: baseBorderRadius,
};

// Theme context interface
export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: 'light' | 'dark' | 'system';
}

// Theme persistence key
const THEME_STORAGE_KEY = '@app_theme_mode';

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light'
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(defaultMode);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeMode(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Determine current theme based on mode
  const getCurrentTheme = (): Theme => {
    if (themeMode === 'system') {
      return lightTheme; // Default to light regardless of device settings
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getCurrentTheme();
  const isDark = theme.mode === 'dark';

  const toggleTheme = async () => {
    const newMode = (() => {
      if (themeMode === 'system') {
        return 'dark';
      }
      return themeMode === 'light' ? 'dark' : 'light';
    })();

    setThemeMode(newMode);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const setTheme = async (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  // Show loading state while theme is being loaded
  if (isLoading) {
    return null; // Or a loading spinner if preferred
  }

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export themes for direct access if needed
export { lightTheme, darkTheme };