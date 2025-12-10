import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
} from 'react-native';
import { Gradient } from './Gradient';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
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
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { width: '100%' }),
      ...getVariantStyles(variant, colors),
      ...getSizeStyles(size),
    },
    text: {
      fontWeight: '600',
      ...getTextStyles(variant, size, colors),
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
      <Gradient colors={[colors.primary, colors.secondary]} style={[styles.button, style]}
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
              color={colors.onPrimary}
              style={styles.loader}
            />
          )}
          {icon && !loading && (
            <MaterialIcons
              name={icon as any}
              size={size === 'sm' ? 16 : 20}
              color={colors.onPrimary}
              style={styles.icon}
            />
          )}
          <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
      </Gradient>
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
          color={getLoaderColor(variant, colors)}
          style={styles.loader}
        />
      )}
      {icon && !loading && (
        <MaterialIcons
          name={icon as any}
          size={size === 'sm' ? 16 : 20}
          color={getIconColor(variant, colors)}
          style={styles.icon}
        />
      )}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
});

// Helper functions
const getVariantStyles = (variant: string, colors: any) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        elevation: 2,

      };
    case 'secondary':
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: colors.error,
        elevation: 2,

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

const getTextStyles = (variant: string, size: string, colors: any) => {
  const baseStyles = {
    fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15,
    textAlign: 'center' as const,
  };

  switch (variant) {
    case 'primary':
      return { ...baseStyles, color: colors.onPrimary };
    case 'secondary':
      return { ...baseStyles, color: colors.text };
    case 'outline':
      return { ...baseStyles, color: colors.primary };
    case 'ghost':
      return { ...baseStyles, color: colors.text };
    case 'danger':
      return { ...baseStyles, color: '#FFFFFF' };
    default:
      return { ...baseStyles, color: colors.text };
  }
};

const getLoaderColor = (variant: string, colors: any) => {
  switch (variant) {
    case 'primary':
      return colors.onPrimary;
    case 'outline':
      return colors.primary;
    case 'danger':
      return '#FFFFFF';
    default:
      return colors.text;
  }
};

const getIconColor = (variant: string, colors: any) => {
  switch (variant) {
    case 'primary':
      return colors.onPrimary;
    case 'outline':
      return colors.primary;
    case 'danger':
      return '#FFFFFF';
    default:
      return colors.text;
  }
};

Button.displayName = 'Button';

export default Button;
