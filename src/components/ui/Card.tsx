import React, { memo, useRef } from 'react';
import { View, ViewStyle, TouchableWithoutFeedback, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { getResponsiveBorderRadius, getResponsiveSpacing } from '../../utils/responsiveEnhanced';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat' | 'floating';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = memo(({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          ...PlatformSelect({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: {
              elevation: 4,
            },
          }),
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
        };
      case 'outlined':
        return {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          backgroundColor: isDark ? '#27272A' : '#F4F4F5', // Zinc 800/100
        };
      case 'floating':
        return {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          ...PlatformSelect({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
            },
            android: {
              elevation: 10,
            },
          }),
        };
      default:
        return {};
    }
  };

  const getPadding = (padding: string) => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return getResponsiveSpacing('sm');
      case 'lg': return getResponsiveSpacing('lg');
      default: return getResponsiveSpacing('md');
    }
  };

  const cardStyle = {
    borderRadius: getResponsiveBorderRadius('xl'),
    padding: getPadding(padding),
    opacity: disabled ? 0.6 : 1,
    overflow: 'hidden' as const, // For gradient backgrounds if any
    ...getVariantStyles(variant),
    ...style,
  };

  if (onPress && !disabled) {
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
      >
        <Animated.View style={[cardStyle, { transform: [{ scale: scaleValue }] }]}>
          {children}
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
});

// Helper for platform specific styles that aren't StyleSheet.create
const PlatformSelect = (styles: { ios: any; android: any }) => {
  // @ts-ignore
  return styles[Platform.OS] || {};
};

// Need access to Platform inside the function
import { Platform } from 'react-native';

Card.displayName = 'Card';

export default Card;
