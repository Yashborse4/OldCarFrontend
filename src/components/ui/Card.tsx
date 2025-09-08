import React, { useState, useRef, useCallback } from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../theme';
import { spacing, borderRadius, shadows } from '../../design-system/tokens';
import { AnimatedPressable, hapticFeedback } from './MicroInteractionsModern';
import * as Animatable from 'react-native-animatable';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'neumorphic' | 'floating' | 'shimmer' | 'modern';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  radius?: keyof typeof borderRadius;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  animationType?: 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounce' | 'scale' | 'glow' | 'none';
  animationDelay?: number;
  pressAnimation?: boolean;
  hoverEffect?: boolean;
  shimmerEffect?: boolean;
  hapticFeedback?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  radius = 'lg',
  onPress,
  onLongPress,
  disabled = false,
  style,
  animationType = 'none',
  animationDelay = 0,
  pressAnimation = true,
  hoverEffect = false,
  shimmerEffect = false,
  hapticFeedback: enableHaptic = true,
  testID,
}) => {
  const { colors, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  // Enhanced animation handlers
  const handlePressIn = useCallback(() => {
    if (!pressAnimation || disabled) return;
    
    if (enableHaptic) {
      hapticFeedback.light();
    }
    
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 400,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [pressAnimation, disabled, enableHaptic, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!pressAnimation) return;
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 400,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [pressAnimation, scaleAnim]);

  // Shimmer animation
  React.useEffect(() => {
    if (shimmerEffect) {
      const shimmer = () => {
        shimmerAnim.setValue(-1);
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(shimmer);
      };
      shimmer();
    }
  }, [shimmerEffect]);

  const getCardStyle = useCallback((): ViewStyle => {
    const paddingStyles = {
      none: { padding: 0 },
      xs: { padding: spacing.xs },
      sm: { padding: spacing.sm },
      md: { padding: spacing.md },
      lg: { padding: spacing.lg },
      xl: { padding: spacing.xl },
      '2xl': { padding: spacing['2xl'] },
    };

    const variantStyles = {
      default: {
        backgroundColor: themeColors.surface,
        borderWidth: 0,
        ...shadows.sm,
      },
      elevated: {
        backgroundColor: themeColors.surface,
        ...shadows.lg,
      },
      outlined: {
        backgroundColor: themeColors.surface,
        borderWidth: 1.5,
        borderColor: themeColors.border,
      },
      glass: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      },
      gradient: {
        borderWidth: 0,
        ...shadows.xl,
      },
      modern: {
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
        ...shadows.md,
      },
      neumorphic: {
        backgroundColor: themeColors.background,
        shadowColor: isDark ? '#000000' : '#FFFFFF',
        shadowOffset: { width: -4, height: -4 },
        shadowOpacity: isDark ? 0.3 : 0.6,
        shadowRadius: 6,
        elevation: 8,
      },
      floating: {
        backgroundColor: themeColors.surface,
        ...shadows['2xl'],
        transform: [{ translateY: -2 }],
      },
      shimmer: {
        backgroundColor: themeColors.surface,
        overflow: 'hidden',
        position: 'relative',
        ...shadows.sm,
      },
    };

    return {
      borderRadius: borderRadius[radius],
      position: 'relative',
      overflow: variant === 'glass' || shimmerEffect ? 'hidden' : 'visible',
      ...paddingStyles[padding],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  }, [variant, padding, radius, disabled, colors, isDark, shimmerEffect, style]);

  const renderShimmer = () => {
    if (!shimmerEffect) return null;
    
    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              {
                translateX: shimmerAnim.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-200, 200],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.1)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    );
  };

  const renderContent = useCallback(() => {
    const content = (
      <>
        {variant === 'glass' && (
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType={isDark ? 'dark' : 'light'}
            blurAmount={12}
            reducedTransparencyFallbackColor={themeColors.surface}
          />
        )}
        
        {/* Neumorphic inner shadow */}
        {variant === 'neumorphic' && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: borderRadius[radius],
                shadowColor: isDark ? '#FFFFFF' : '#000000',
                shadowOffset: { width: 4, height: 4 },
                shadowOpacity: isDark ? 0.05 : 0.1,
                shadowRadius: 6,
                backgroundColor: 'transparent',
              },
            ]}
          />
        )}
        
        {children}
        {renderShimmer()}
      </>
    );

    if (variant === 'gradient') {
      const gradientColors = isDark 
        ? ['#1A1A1A', '#2D2D2D', '#404040']
        : ['#FFFFFF', '#F8FAFC', '#EDF2F7'];
        
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getCardStyle()}
        >
          {content}
        </LinearGradient>
      );
    }

    return <View style={getCardStyle()}>{content}</View>;
  }, [variant, isDark, colors, borderRadius, radius, children, renderShimmer, getCardStyle]);

  // Use modern AnimatedPressable for better interactions
  if (onPress || onLongPress) {
    return (
      <Animatable.View
        animation={animationType !== 'none' ? animationType : undefined}
        delay={animationDelay}
        duration={animationType !== 'none' ? 600 : undefined}
      >
        <AnimatedPressable
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={disabled}
          style={{ transform: [{ scale: scaleAnim }] }}
          scaleValue={0.98}
          hapticType={enableHaptic ? "light" : undefined}
          animationType={pressAnimation ? "scale" : undefined}
        >
          {renderContent()}
        </AnimatedPressable>
      </Animatable.View>
    );
  }

  // Static card without interactions
  return (
    <Animatable.View
      animation={animationType !== 'none' ? animationType : undefined}
      delay={animationDelay}
      duration={animationType !== 'none' ? 600 : undefined}
    >
      {renderContent()}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    // Remove any default TouchableOpacity styles if needed
  },
  pressed: {
    opacity: 0.95,
  },
});

export default Card;



