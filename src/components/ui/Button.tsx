import React, { memo, useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
  Platform,
  Pressable,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { 
  scale, 
  FONT_SIZES, 
  DIMENSIONS, 
  getResponsiveValue, 
  COMMON_STYLES,
  SPACING 
} from '../../utils/responsive';
import { 
  useOptimizedCallback, 
  withPerformanceTracking,
  ANIMATION_CONFIG,
  useDebounce 
} from '../../utils/performance';

export interface ButtonProps {
  // Core props
  title: string;
  onPress: () => void;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger' | 'success' | 'warning' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // State
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  
  // Content
  subtitle?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  
  // Layout
  fullWidth?: boolean;
  shadow?: boolean;
  elevation?: boolean;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  pressedStyle?: ViewStyle;
  
  // Animation & Interaction
  animationType?: 'bounce' | 'pulse' | 'fadeIn' | 'scale' | 'glow' | 'none';
  hapticFeedback?: boolean;
  debounceMs?: number;
  rippleEffect?: boolean;
  
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
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
  fullWidth = false,
  borderRadius = 'lg',
  shadow = true,
  elevation = true,
  style,
  textStyle,
  pressedStyle,
  animationType = 'scale',
  rippleEffect = true,
  debounceMs = 150,
  testID,
}) => {
  const { colors, typography, spacing, borderRadius: radius, shadows } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Animation handlers
  const handlePressIn = () => {
    setIsPressed(true);
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
    if (animationType === 'glow') {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
    if (rippleEffect) {
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
    if (animationType === 'glow') {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  };

  // Debounced press handler
  const debouncedOnPress = useDebounce(onPress, debounceMs);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius[borderRadius],
      opacity: disabled ? 0.6 : 1,
      position: 'relative',
      overflow: 'hidden',
    };

    const sizeStyles = {
      xs: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 32,
      },
      sm: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 48,
      },
      lg: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 56,
      },
      xl: {
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        minHeight: 64,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        ...(shadow ? shadows.md : {}),
      },
      secondary: {
        backgroundColor: colors.secondary,
        ...(shadow ? shadows.md : {}),
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      gradient: {
        ...(shadow ? shadows.lg : {}),
      },
      danger: {
        backgroundColor: colors.error,
        ...(shadow ? shadows.md : {}),
      },
      success: {
        backgroundColor: colors.success,
        ...(shadow ? shadows.md : {}),
      },
      warning: {
        backgroundColor: colors.warning,
        ...(shadow ? shadows.md : {}),
      },
      glass: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backdropFilter: 'blur(10px)',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      ...(isPressed ? pressedStyle : {}),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      xs: {
        fontSize: typography.fontSizes.xs,
      },
      sm: {
        fontSize: typography.fontSizes.sm,
      },
      md: {
        fontSize: typography.fontSizes.md,
      },
      lg: {
        fontSize: typography.fontSizes.lg,
      },
      xl: {
        fontSize: typography.fontSizes.xl,
      },
    };

    const variantStyles = {
      primary: {
        color: '#1A202C',
        fontWeight: typography.fontWeights.semibold as any,
      },
      secondary: {
        color: colors.surface,
        fontWeight: typography.fontWeights.semibold as any,
      },
      outline: {
        color: colors.primary,
        fontWeight: typography.fontWeights.semibold as any,
      },
      ghost: {
        color: colors.text,
        fontWeight: typography.fontWeights.medium as any,
      },
      gradient: {
        color: '#1A202C',
        fontWeight: typography.fontWeights.bold as any,
      },
      danger: {
        color: '#FFFFFF',
        fontWeight: typography.fontWeights.semibold as any,
      },
      success: {
        color: '#FFFFFF',
        fontWeight: typography.fontWeights.semibold as any,
      },
      warning: {
        color: '#1A202C',
        fontWeight: typography.fontWeights.semibold as any,
      },
      glass: {
        color: colors.text,
        fontWeight: typography.fontWeights.medium as any,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const renderRipple = () => {
    if (!rippleEffect) return null;
    
    return (
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [
              {
                scale: rippleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              },
            ],
            opacity: rippleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0],
            }),
          },
        ]}
      />
    );
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading && (
        <ActivityIndicator
          size={size === 'xs' || size === 'sm' ? 'small' : 'small'}
          color={variant === 'outline' || variant === 'ghost' || variant === 'glass' ? colors.primary : '#1A202C'}
          style={styles.loader}
        />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      <Text style={getTextStyle()}>{title}</Text>
      {icon && iconPosition === 'right' && !loading && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  const renderButtonContent = () => {
    const content = (
      <>
        {renderRipple()}
        {variant === 'glass' && (
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor={colors.surface}
          />
        )}
        {renderContent()}
        {animationType === 'glow' && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: radius[borderRadius],
                backgroundColor: colors.primary,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1],
                }),
              },
            ]}
          />
        )}
      </>
    );

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={['#FFD700', '#F7931E', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={getButtonStyle()}
        >
          {content}
        </LinearGradient>
      );
    }

    return <View style={getButtonStyle()}>{content}</View>;
  };

  const ButtonComponent = animationType === 'bounce' || animationType === 'pulse' ? 
    Animatable.createAnimatableComponent(Pressable) : Pressable;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <ButtonComponent
        onPress={disabled || loading ? undefined : debouncedOnPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        animation={animationType === 'bounce' || animationType === 'pulse' ? animationType : undefined}
        duration={animationType === 'bounce' || animationType === 'pulse' ? 600 : undefined}
        style={({ pressed }) => [{
          opacity: pressed && !disabled ? 0.9 : 1,
        }]}
      >
        {renderButtonContent()}
      </ButtonComponent>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  loader: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: -10,
    marginLeft: -10,
    zIndex: 1,
  },
});

export default Button;

