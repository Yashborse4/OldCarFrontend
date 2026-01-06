import React, { useRef, useEffect } from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import {
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  scaleSize,
} from '../../utils/responsiveEnhanced';
import { AnimatedPressable, hapticFeedback } from './MicroInteractionsModern';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  rounded?: 'default' | 'full' | 'none';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptics?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  rounded = 'default',
  fullWidth = false,
  style,
  textStyle,
  haptics = true,
}) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptics) hapticFeedback.light();
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    if (fullWidth) baseStyle.width = '100%';

    // Size
    switch (size) {
      case 'sm':
        baseStyle.paddingHorizontal = getResponsiveSpacing('md');
        baseStyle.paddingVertical = scaleSize(6);
        baseStyle.height = scaleSize(32);
        break;
      case 'lg':
        baseStyle.paddingHorizontal = getResponsiveSpacing('xl');
        baseStyle.paddingVertical = scaleSize(14);
        baseStyle.height = scaleSize(56);
        break;
      default: // md
        baseStyle.paddingHorizontal = getResponsiveSpacing('lg');
        baseStyle.paddingVertical = scaleSize(10);
        baseStyle.height = scaleSize(44);
    }

    // Rounded
    if (rounded === 'full') {
      baseStyle.borderRadius = 999;
    } else if (rounded === 'none') {
      baseStyle.borderRadius = 0;
    } else {
      baseStyle.borderRadius = getResponsiveBorderRadius('xl'); // Modern default
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = isDark ? '#3A3A3C' : '#F2F2F7';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = colors.error;
        break;
      case 'success':
        baseStyle.backgroundColor = '#34C759'; // iOS Green
        break;
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return colors.text;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      case 'danger': return '#FFFFFF';
      case 'success': return '#FFFFFF';
      default: return colors.text;
    }
  };

  const getIconColor = () => {
    return getTextColor();
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return getResponsiveTypography('xs');
      case 'lg': return getResponsiveTypography('md');
      default: return getResponsiveTypography('sm');
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      animationType="scale"
      scaleValue={0.96}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={scaleSize(18)}
              color={getIconColor()}
              style={{ marginRight: scaleSize(8) }}
            />
          )}
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: '600',
                letterSpacing: 0.3,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={scaleSize(18)}
              color={getIconColor()}
              style={{ marginLeft: scaleSize(8) }}
            />
          )}
        </>
      )}
    </AnimatedPressable>
  );
};
