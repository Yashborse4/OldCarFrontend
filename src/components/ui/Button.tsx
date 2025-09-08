import React, { memo, useRef, useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  StyleSheet,
  Animated,
  Pressable,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';
import { spacing, borderRadius, typography, shadows, colors as designTokens } from '../../design-system/tokens';

export interface ButtonProps {
  // Core props
  title: string;
  onPress?: () => void;
  
  // Appearance
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger' | 'success' | 'warning' | 'glass' | 'subtle';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: keyof typeof borderRadius;
  
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
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Animation & Interaction
  animationType?: 'bounce' | 'pulse' | 'scale' | 'glow' | 'none';
  hapticFeedback?: boolean;
  rippleEffect?: boolean;
  
  // Accessibility
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  radius = 'lg',
  style,
  textStyle,
  animationType = 'scale',
  rippleEffect = true,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}) => {
  const { themeColors, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Animation handlers
  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        tension: 400,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
    
    if (animationType === 'glow') {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }).start();
    }
    
    if (rippleEffect) {
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }).start();
    }
  }, [animationType, rippleEffect, disabled, loading, scaleAnim, glowAnim, rippleAnim]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
    
    if (animationType === 'glow') {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }).start();
    }
  }, [animationType, scaleAnim, glowAnim]);

  const getButtonStyle = useCallback((): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius[radius],
      opacity: disabled ? 0.5 : 1,
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
        minHeight: 40,
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
        paddingVertical: spacing.xl,
        minHeight: 64,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: themeColors.primary,
        ...shadows.md,
      },
      secondary: {
        backgroundColor: themeColors.secondary,
        ...shadows.sm,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: themeColors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      subtle: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      gradient: {
        ...shadows.lg,
      },
      danger: {
        backgroundColor: themeColors.error,
        ...shadows.md,
      },
      success: {
        backgroundColor: themeColors.success,
        ...shadows.md,
      },
      warning: {
        backgroundColor: themeColors.warning,
        ...shadows.md,
      },
      glass: {
        backgroundColor: themeColors.glass,
        borderWidth: 1,
        borderColor: themeColors.glassBorder,
        backdropFilter: 'blur(10px)',
      },
    };


    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      ...style,
    };
  }, [variant, size, disabled, isDark, fullWidth, style, radius]);

  const getTextStyle = useCallback((): TextStyle => {
    const sizeStyles = {
      xs: {
        fontSize: typography.fontSizes.xs,
        lineHeight: typography.fontSizes.xs * 1.4,
      },
      sm: {
        fontSize: typography.fontSizes.sm,
        lineHeight: typography.fontSizes.sm * 1.4,
      },
      md: {
        fontSize: typography.fontSizes.base,
        lineHeight: typography.fontSizes.base * 1.4,
      },
      lg: {
        fontSize: typography.fontSizes.lg,
        lineHeight: typography.fontSizes.lg * 1.4,
      },
      xl: {
        fontSize: typography.fontSizes.xl,
        lineHeight: typography.fontSizes.xl * 1.4,
      },
    };

    const getTextColor = () => {
      switch (variant) {
        case 'primary':
        case 'gradient':
          return isDark ? themeColors.background : designTokens.gray[900];
        case 'secondary':
        case 'danger':
        case 'success':
          return designTokens.white;
        case 'outline':
          return themeColors.primary;
        case 'warning':
          return designTokens.gray[900];
        case 'ghost':
        case 'subtle':
          return themeColors.text;
        case 'glass':
          return themeColors.text;
        default:
          return themeColors.text;
      }
    };

    return {
      ...sizeStyles[size],
      color: getTextColor(),
      fontWeight: typography.fontWeights.semibold,
      textAlign: 'center' as const,
      letterSpacing: typography.letterSpacing.wide,
      ...textStyle,
    };
  }, [size, variant, colors, isDark, textStyle]);

  const renderRipple = useCallback(() => {
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
                  outputRange: [0, 3],
                }),
              },
            ],
            opacity: rippleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0],
            }),
          },
        ]}
      />
    );
  }, [rippleEffect, rippleAnim]);

  const renderContent = useCallback(() => {
    const indicatorColor = (() => {
      switch (variant) {
        case 'outline':
        case 'ghost':
        case 'subtle':
        case 'glass':
          return themeColors.primary;
        case 'primary':
        case 'gradient':
        case 'warning':
          return isDark ? themeColors.background : designTokens.gray[900];
        default:
          return designTokens.white;
      }
    })();

    return (
      <View style={styles.contentContainer}>
        {loading && (
          <ActivityIndicator
            size={size === 'xs' || size === 'sm' ? 'small' : 'small'}
            color={indicatorColor}
            style={styles.loader}
          />
        )}
        {icon && iconPosition === 'left' && !loading && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        {!loading && <Text style={getTextStyle()}>{title}</Text>}
        {icon && iconPosition === 'right' && !loading && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  }, [loading, size, variant, colors, isDark, icon, iconPosition, title, getTextStyle]);

  const renderButtonContent = useCallback(() => {
    const content = (
      <>
        {renderRipple()}
        {variant === 'glass' && (
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType={isDark ? "dark" : "light"}
            blurAmount={8}
            reducedTransparencyFallbackColor={themeColors.surface}
          />
        )}
        {renderContent()}
        {animationType === 'glow' && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: borderRadius[radius],
                backgroundColor: themeColors.primary,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.15],
                }),
              },
            ]}
          />
        )}
      </>
    );

    if (variant === 'gradient') {
      const gradientColors = isDark 
        ? [designTokens.primary[400], designTokens.primary[500], designTokens.primary[600]]
        : [designTokens.primary[300], designTokens.primary[400], designTokens.primary[500]];
        
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getButtonStyle()}
        >
          {content}
        </LinearGradient>
      );
    }

    return <View style={getButtonStyle()}>{content}</View>;
  }, [variant, isDark, renderRipple, renderContent, animationType, glowAnim, borderRadius, radius, colors, getButtonStyle]);

  const handlePress = useCallback(() => {
    if (disabled || loading || !onPress) return;
    onPress();
  }, [disabled, loading, onPress]);

  const ButtonComponent = animationType === 'bounce' || animationType === 'pulse' ? 
    Animatable.createAnimatableComponent(Pressable) : Pressable;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <ButtonComponent
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole as any}
        accessibilityState={{
          disabled: disabled || loading,
          selected: isPressed,
        }}
        animation={animationType === 'bounce' || animationType === 'pulse' ? animationType : undefined}
        duration={animationType === 'bounce' || animationType === 'pulse' ? 600 : undefined}
        style={({ pressed }) => [{
          opacity: pressed && !disabled ? 0.95 : 1,
        }]}
      >
        {renderButtonContent()}
      </ButtonComponent>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  loader: {
    marginRight: spacing.sm,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  ripple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: -12,
    marginLeft: -12,
    zIndex: 1,
  },
});

export { Button };
export default Button;



