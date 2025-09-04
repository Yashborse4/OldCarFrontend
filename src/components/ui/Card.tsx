import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  animationType?: 'fadeInUp' | 'fadeInDown' | 'slideInLeft' | 'slideInRight' | 'zoomIn' | 'bounce' | 'none';
  delay?: number;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius = 'lg',
  onPress,
  disabled = false,
  style,
  animationType = 'none',
  delay = 0,
  testID,
}) => {
  const { colors, spacing, borderRadius: radius, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const paddingStyles = {
      none: { padding: 0 },
      sm: { padding: spacing.sm },
      md: { padding: spacing.md },
      lg: { padding: spacing.lg },
      xl: { padding: spacing.xl },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.card,
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: colors.card,
        ...shadows.md,
      },
      outlined: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      },
      glass: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backdropFilter: 'blur(10px)',
      },
      gradient: {
        // Gradient will be handled by LinearGradient component
        borderWidth: 0,
        ...shadows.lg,
      },
    };

    return {
      borderRadius: radius[borderRadius],
      ...paddingStyles[padding],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
      ...style,
    };
  };

  const renderContent = () => {
    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={[colors.card, colors.surface, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getCardStyle()}
        >
          {children}
        </LinearGradient>
      );
    }

    return <View style={getCardStyle()}>{children}</View>;
  };

  const CardComponent = animationType !== 'none' ? Animatable.View : View;
  const TouchableComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      animation={animationType !== 'none' ? animationType : undefined}
      delay={delay}
      duration={animationType !== 'none' ? 600 : undefined}
    >
      <TouchableComponent
        onPress={onPress}
        disabled={disabled || !onPress}
        activeOpacity={onPress ? 0.9 : 1}
        testID={testID}
        style={onPress ? styles.touchable : undefined}
      >
        {renderContent()}
      </TouchableComponent>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  touchable: {
    // Remove any default TouchableOpacity styles if needed
  },
});

export default Card;

