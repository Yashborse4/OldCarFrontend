// This file re-exports useTheme from ThemeContext for backward compatibility
import { useTheme } from './ThemeContext';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Export the React Native's useColorScheme hook for device theme detection
export { useDeviceColorScheme as useNativeColorScheme };

// Export our custom theme hook that provides theme values and toggle functionality
export const useColorScheme = useTheme;
