import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  testID,
}) => {
  const { colors: themeColors, isDark } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { width: '100%' }),
      ...getVariantStyles(variant, themeColors, isDark),
      ...getSizeStyles(size),
    },
    text: {
      fontWeight: '600',
      ...getTextStyles(variant, size, themeColors),
    },
    icon: {
      marginRight: 8,
    },
    loader: {
      marginRight: 8,
    },
  });

  if (variant === 'primary' && !disabled) {
    return (
      <LinearGradient
        colors={['#FFD700', '#F7931E']}
        style={[styles.button, style]}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
          onPress={onPress}
          disabled={disabled || loading}
          testID={testID}
          activeOpacity={0.8}
        >
          {loading && (
            <ActivityIndicator
              size={size === 'sm' ? 'small' : 'small'}
              color="#1A202C"
              style={styles.loader}
            />
          )}
          {icon && !loading && (
            <MaterialIcons
              name={icon as any}
              size={size === 'sm' ? 16 : 20}
              color="#1A202C"
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'small'}
          color={getLoaderColor(variant, themeColors)}
          style={styles.loader}
        />
      )}
      {icon && !loading && (
        <MaterialIcons
          name={icon as any}
          size={size === 'sm' ? 16 : 20}
          color={getIconColor(variant, themeColors)}
          style={styles.icon}
        />
      )}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
});

// Helper functions
const getVariantStyles = (variant: string, themeColors: any, isDark: boolean) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: themeColors.primary,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      };
    case 'secondary':
      return {
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: themeColors.primary,
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: themeColors.error,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      };
    default:
      return {};
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: 16,
        paddingVertical: 10,
        height: 40,
      };
    case 'md':
      return {
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 48,
      };
    case 'lg':
      return {
        paddingHorizontal: 24,
        paddingVertical: 16,
        height: 56,
      };
    default:
      return {
        paddingHorizontal: 20,
        paddingVertical: 12,
        height: 48,
      };
  }
};

const getTextStyles = (variant: string, size: string, themeColors: any) => {
  const baseStyles = {
    fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15,
    textAlign: 'center' as const,
  };

  switch (variant) {
    case 'primary':
      return { ...baseStyles, color: '#1A202C' };
    case 'secondary':
      return { ...baseStyles, color: themeColors.text };
    case 'outline':
      return { ...baseStyles, color: themeColors.primary };
    case 'ghost':
      return { ...baseStyles, color: themeColors.text };
    case 'danger':
      return { ...baseStyles, color: '#FFFFFF' };
    default:
      return { ...baseStyles, color: themeColors.text };
  }
};

const getLoaderColor = (variant: string, themeColors: any) => {
  switch (variant) {
    case 'primary':
      return '#1A202C';
    case 'outline':
      return themeColors.primary;
    case 'danger':
      return '#FFFFFF';
    default:
      return themeColors.text;
  }
};

const getIconColor = (variant: string, themeColors: any) => {
  switch (variant) {
    case 'primary':
      return '#1A202C';
    case 'outline':
      return themeColors.primary;
    case 'danger':
      return '#FFFFFF';
    default:
      return themeColors.text;
  }
};

Button.displayName = 'Button';

export default Button;