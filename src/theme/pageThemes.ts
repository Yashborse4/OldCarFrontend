import { Colors } from './ThemeContext';

// Base theme interface for page-specific themes
export interface PageTheme {
  name: string;
  description: string;
  backgroundGradient: string[];
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputPlaceholder: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  glowColor: string;
  rippleColor: string;
  overlayColor: string;
  dividerColor: string;
  iconColor: string;
  buttonPrimary: string;
  buttonSecondary: string;
  featureTagBg?: string;
  featureTagBorder?: string;
  priceColor?: string;
  ratingColor?: string;
}

// Authentication Screen Themes
export const createAuthThemes = (baseColors: Colors, isDark: boolean) => ({
  login: {
    name: 'Login Theme',
    description: 'Elegant and professional login experience',
    backgroundGradient: isDark 
      ? ['#0F0F0F', '#1A1A1A', '#262626'] 
      : ['#FAFBFC', '#F8FAFC', '#EDF2F7'],
    cardBackground: isDark 
      ? 'rgba(26, 26, 26, 0.7)' 
      : 'rgba(255, 255, 255, 0.8)',
    cardBorder: isDark 
      ? 'rgba(255, 215, 0, 0.1)' 
      : 'rgba(255, 215, 0, 0.15)',
    cardShadow: isDark 
      ? 'rgba(255, 215, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#D1D5DB' : '#6B7280',
    tertiaryText: isDark ? '#9CA3AF' : '#9CA3AF',
    accent: baseColors.primary,
    accentHover: baseColors.primaryDark,
    accentLight: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.05)',
    inputBackground: isDark 
      ? 'rgba(55, 65, 81, 0.3)' 
      : 'rgba(249, 250, 251, 0.8)',
    inputBorder: isDark 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(229, 231, 235, 0.6)',
    inputBorderFocused: baseColors.primary,
    inputPlaceholder: isDark ? '#9CA3AF' : '#6B7280',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,
    glowColor: isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.2)',
    rippleColor: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)',
    overlayColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)',
    dividerColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    iconColor: baseColors.primary,
    buttonPrimary: baseColors.primary,
    buttonSecondary: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(249, 250, 251, 1)',
  } as PageTheme,

  register: {
    name: 'Register Theme',
    description: 'Welcoming and encouraging registration experience',
    backgroundGradient: isDark 
      ? ['#1A1A2E', '#16213E', '#0F3460'] 
      : ['#E3F2FD', '#BBDEFB', '#90CAF9'],
    cardBackground: isDark 
      ? 'rgba(22, 33, 62, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark 
      ? 'rgba(144, 202, 249, 0.2)' 
      : 'rgba(33, 150, 243, 0.2)',
    cardShadow: isDark 
      ? 'rgba(144, 202, 249, 0.1)' 
      : 'rgba(33, 150, 243, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#BBDEFB' : '#1976D2',
    tertiaryText: isDark ? '#90CAF9' : '#42A5F5',
    accent: '#2196F3',
    accentHover: '#1976D2',
    accentLight: isDark ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
    inputBackground: isDark 
      ? 'rgba(22, 33, 62, 0.4)' 
      : 'rgba(227, 242, 253, 0.8)',
    inputBorder: isDark 
      ? 'rgba(144, 202, 249, 0.3)' 
      : 'rgba(33, 150, 243, 0.3)',
    inputBorderFocused: '#2196F3',
    inputPlaceholder: isDark ? '#90CAF9' : '#1976D2',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: '#2196F3',
    glowColor: isDark ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)',
    rippleColor: isDark ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.1)',
    overlayColor: isDark ? 'rgba(26, 26, 46, 0.8)' : 'rgba(227, 242, 253, 0.4)',
    dividerColor: isDark ? 'rgba(144, 202, 249, 0.1)' : 'rgba(33, 150, 243, 0.1)',
    iconColor: '#2196F3',
    buttonPrimary: '#2196F3',
    buttonSecondary: isDark ? 'rgba(22, 33, 62, 0.8)' : 'rgba(227, 242, 253, 1)',
  } as PageTheme,
});

// Car-related Screen Themes
export const createCarThemes = (baseColors: Colors, isDark: boolean) => ({
  carDetails: {
    name: 'Car Details Theme',
    description: 'Premium and luxurious car showcase experience',
    backgroundGradient: isDark 
      ? ['#0F0F0F', '#1A1A1A', '#1F1F1F'] 
      : ['#FFFFFF', '#F8FAFC', '#EDF2F7'],
    cardBackground: isDark 
      ? 'rgba(26, 26, 26, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDark 
      ? 'rgba(255, 215, 0, 0.08)' 
      : 'rgba(229, 231, 235, 0.8)',
    cardShadow: isDark 
      ? 'rgba(255, 215, 0, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#D1D5DB' : '#6B7280',
    tertiaryText: isDark ? '#9CA3AF' : '#9CA3AF',
    accent: baseColors.primary,
    accentHover: baseColors.primaryDark,
    accentLight: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.05)',
    inputBackground: isDark 
      ? 'rgba(55, 65, 81, 0.3)' 
      : 'rgba(249, 250, 251, 0.8)',
    inputBorder: isDark 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(229, 231, 235, 0.6)',
    inputBorderFocused: baseColors.primary,
    inputPlaceholder: isDark ? '#9CA3AF' : '#6B7280',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,
    glowColor: isDark ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.1)',
    rippleColor: isDark ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.1)',
    overlayColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)',
    dividerColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    iconColor: baseColors.primary,
    buttonPrimary: baseColors.primary,
    buttonSecondary: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(249, 250, 251, 1)',
    featureTagBg: isDark 
      ? 'rgba(55, 65, 81, 0.6)' 
      : 'rgba(249, 250, 251, 0.9)',
    featureTagBorder: isDark 
      ? 'rgba(75, 85, 99, 0.3)' 
      : 'rgba(229, 231, 235, 0.5)',
    priceColor: '#10B981', // Green for price
    ratingColor: '#F59E0B', // Amber for ratings
  } as PageTheme,

  carSearch: {
    name: 'Car Search Theme',
    description: 'Clean and focused search experience',
    backgroundGradient: isDark 
      ? ['#111827', '#1F2937', '#374151'] 
      : ['#F9FAFB', '#F3F4F6', '#E5E7EB'],
    cardBackground: isDark 
      ? 'rgba(31, 41, 55, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark 
      ? 'rgba(75, 85, 99, 0.3)' 
      : 'rgba(209, 213, 219, 0.5)',
    cardShadow: isDark 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#D1D5DB' : '#6B7280',
    tertiaryText: isDark ? '#9CA3AF' : '#9CA3AF',
    accent: '#8B5CF6', // Purple accent for search
    accentHover: '#7C3AED',
    accentLight: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
    inputBackground: isDark 
      ? 'rgba(55, 65, 81, 0.6)' 
      : 'rgba(255, 255, 255, 0.8)',
    inputBorder: isDark 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(209, 213, 219, 0.6)',
    inputBorderFocused: '#8B5CF6',
    inputPlaceholder: isDark ? '#9CA3AF' : '#6B7280',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: '#8B5CF6',
    glowColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
    rippleColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
    overlayColor: isDark ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.4)',
    dividerColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.3)',
    iconColor: '#8B5CF6',
    buttonPrimary: '#8B5CF6',
    buttonSecondary: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 1)',
  } as PageTheme,

  sellCar: {
    name: 'Sell Car Theme',
    description: 'Trustworthy and professional selling experience',
    backgroundGradient: isDark 
      ? ['#0F172A', '#1E293B', '#334155'] 
      : ['#F8FAFC', '#F1F5F9', '#E2E8F0'],
    cardBackground: isDark 
      ? 'rgba(30, 41, 59, 0.9)' 
      : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark 
      ? 'rgba(34, 197, 94, 0.2)' 
      : 'rgba(34, 197, 94, 0.2)',
    cardShadow: isDark 
      ? 'rgba(34, 197, 94, 0.1)' 
      : 'rgba(34, 197, 94, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#CBD5E1' : '#64748B',
    tertiaryText: isDark ? '#94A3B8' : '#94A3B8',
    accent: '#22C55E', // Green accent for selling
    accentHover: '#16A34A',
    accentLight: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
    inputBackground: isDark 
      ? 'rgba(51, 65, 85, 0.4)' 
      : 'rgba(248, 250, 252, 0.8)',
    inputBorder: isDark 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(226, 232, 240, 0.6)',
    inputBorderFocused: '#22C55E',
    inputPlaceholder: isDark ? '#94A3B8' : '#64748B',
    success: '#22C55E',
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,
    glowColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
    rippleColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
    overlayColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.4)',
    dividerColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(226, 232, 240, 0.3)',
    iconColor: '#22C55E',
    buttonPrimary: '#22C55E',
    buttonSecondary: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(248, 250, 252, 1)',
  } as PageTheme,
});

// Dashboard and General App Themes
export const createDashboardThemes = (baseColors: Colors, isDark: boolean) => ({
  dashboard: {
    name: 'Dashboard Theme',
    description: 'Professional and data-focused dashboard experience',
    backgroundGradient: isDark 
      ? ['#0C0C0C', '#1A1A1A', '#2D2D2D'] 
      : ['#FFFFFF', '#FAFAFA', '#F5F5F5'],
    cardBackground: isDark 
      ? 'rgba(42, 42, 42, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDark 
      ? 'rgba(75, 85, 99, 0.3)' 
      : 'rgba(229, 231, 235, 0.6)',
    cardShadow: isDark 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#D1D5DB' : '#6B7280',
    tertiaryText: isDark ? '#9CA3AF' : '#9CA3AF',
    accent: '#6366F1', // Indigo accent for dashboard
    accentHover: '#4F46E5',
    accentLight: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
    inputBackground: isDark 
      ? 'rgba(55, 65, 81, 0.6)' 
      : 'rgba(249, 250, 251, 0.8)',
    inputBorder: isDark 
      ? 'rgba(75, 85, 99, 0.4)' 
      : 'rgba(229, 231, 235, 0.6)',
    inputBorderFocused: '#6366F1',
    inputPlaceholder: isDark ? '#9CA3AF' : '#6B7280',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: '#6366F1',
    glowColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
    rippleColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
    overlayColor: isDark ? 'rgba(12, 12, 12, 0.8)' : 'rgba(255, 255, 255, 0.4)',
    dividerColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.3)',
    iconColor: '#6366F1',
    buttonPrimary: '#6366F1',
    buttonSecondary: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(249, 250, 251, 1)',
  } as PageTheme,

  profile: {
    name: 'Profile Theme',
    description: 'Personal and customizable profile experience',
    backgroundGradient: isDark 
      ? ['#1E1B4B', '#312E81', '#3730A3'] 
      : ['#EDE9FE', '#DDD6FE', '#C4B5FD'],
    cardBackground: isDark 
      ? 'rgba(49, 46, 129, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark 
      ? 'rgba(196, 181, 253, 0.2)' 
      : 'rgba(124, 58, 237, 0.2)',
    cardShadow: isDark 
      ? 'rgba(196, 181, 253, 0.1)' 
      : 'rgba(124, 58, 237, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#DDD6FE' : '#7C3AED',
    tertiaryText: isDark ? '#C4B5FD' : '#8B5CF6',
    accent: '#7C3AED',
    accentHover: '#6D28D9',
    accentLight: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.05)',
    inputBackground: isDark 
      ? 'rgba(49, 46, 129, 0.4)' 
      : 'rgba(237, 233, 254, 0.8)',
    inputBorder: isDark 
      ? 'rgba(196, 181, 253, 0.3)' 
      : 'rgba(124, 58, 237, 0.3)',
    inputBorderFocused: '#7C3AED',
    inputPlaceholder: isDark ? '#C4B5FD' : '#7C3AED',
    success: baseColors.success,
    error: baseColors.error,
    warning: baseColors.warning,
    info: '#7C3AED',
    glowColor: isDark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)',
    rippleColor: isDark ? 'rgba(124, 58, 237, 0.1)' : 'rgba(124, 58, 237, 0.1)',
    overlayColor: isDark ? 'rgba(30, 27, 75, 0.8)' : 'rgba(237, 233, 254, 0.4)',
    dividerColor: isDark ? 'rgba(196, 181, 253, 0.1)' : 'rgba(124, 58, 237, 0.1)',
    iconColor: '#7C3AED',
    buttonPrimary: '#7C3AED',
    buttonSecondary: isDark ? 'rgba(49, 46, 129, 0.8)' : 'rgba(237, 233, 254, 1)',
  } as PageTheme,
});

// Chat and Communication Themes
export const createChatThemes = (baseColors: Colors, isDark: boolean) => ({
  chat: {
    name: 'Chat Theme',
    description: 'Friendly and communicative chat experience',
    backgroundGradient: isDark 
      ? ['#164E63', '#0F766E', '#065F46'] 
      : ['#ECFDF5', '#D1FAE5', '#A7F3D0'],
    cardBackground: isDark 
      ? 'rgba(15, 118, 110, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)',
    cardBorder: isDark 
      ? 'rgba(167, 243, 208, 0.2)' 
      : 'rgba(16, 185, 129, 0.2)',
    cardShadow: isDark 
      ? 'rgba(167, 243, 208, 0.1)' 
      : 'rgba(16, 185, 129, 0.1)',
    primaryText: baseColors.text,
    secondaryText: isDark ? '#D1FAE5' : '#065F46',
    tertiaryText: isDark ? '#A7F3D0' : '#047857',
    accent: '#10B981',
    accentHover: '#059669',
    accentLight: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    inputBackground: isDark 
      ? 'rgba(15, 118, 110, 0.4)' 
      : 'rgba(236, 253, 245, 0.8)',
    inputBorder: isDark 
      ? 'rgba(167, 243, 208, 0.3)' 
      : 'rgba(16, 185, 129, 0.3)',
    inputBorderFocused: '#10B981',
    inputPlaceholder: isDark ? '#A7F3D0' : '#065F46',
    success: '#10B981',
    error: baseColors.error,
    warning: baseColors.warning,
    info: baseColors.info,
    glowColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
    rippleColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    overlayColor: isDark ? 'rgba(22, 78, 99, 0.8)' : 'rgba(236, 253, 245, 0.4)',
    dividerColor: isDark ? 'rgba(167, 243, 208, 0.1)' : 'rgba(16, 185, 129, 0.1)',
    iconColor: '#10B981',
    buttonPrimary: '#10B981',
    buttonSecondary: isDark ? 'rgba(15, 118, 110, 0.8)' : 'rgba(236, 253, 245, 1)',
  } as PageTheme,
});

// Complete theme collection
export const createPageThemes = (baseColors: Colors, isDark: boolean) => {
  return {
    auth: createAuthThemes(baseColors, isDark),
    car: createCarThemes(baseColors, isDark),
    dashboard: createDashboardThemes(baseColors, isDark),
    chat: createChatThemes(baseColors, isDark),
  };
};

// Theme selector utility
export const getPageTheme = (
  pageType: 'auth' | 'car' | 'dashboard' | 'chat',
  subType: string,
  baseColors: Colors,
  isDark: boolean
): PageTheme => {
  const themes = createPageThemes(baseColors, isDark);
  
  switch (pageType) {
    case 'auth':
      return themes.auth[subType as keyof typeof themes.auth] || themes.auth.login;
    case 'car':
      return themes.car[subType as keyof typeof themes.car] || themes.car.carDetails;
    case 'dashboard':
      return themes.dashboard[subType as keyof typeof themes.dashboard] || themes.dashboard.dashboard;
    case 'chat':
      return themes.chat[subType as keyof typeof themes.chat] || themes.chat.chat;
    default:
      return themes.dashboard.dashboard;
  }
};

// Theme utilities
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  // Simple color blending utility - in a real app, use a proper color manipulation library
  return color1; // Placeholder
};

export const lightenColor = (color: string, amount: number = 0.1): string => {
  // Simple color lightening utility - in a real app, use a proper color manipulation library
  return color; // Placeholder
};

export const darkenColor = (color: string, amount: number = 0.1): string => {
  // Simple color darkening utility - in a real app, use a proper color manipulation library
  return color; // Placeholder
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast color detection - in a real app, use a proper color utility
  return backgroundColor.includes('rgba(0') || backgroundColor.includes('#0') ? '#FFFFFF' : '#000000';
};

export default {
  createPageThemes,
  getPageTheme,
  blendColors,
  lightenColor,
  darkenColor,
  getContrastColor,
};


