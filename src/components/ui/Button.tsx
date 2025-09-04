import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  style?: ViewStyle;
  textStyle?: TextStyle;
  animationType?: 'bounce' | 'pulse' | 'fadeIn' | 'none';
  testID?: string;
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
  style,
  textStyle,
  animationType = 'none',
  testID,
}) => {
  const { colors, typography, spacing, borderRadius: radius, shadows } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius[borderRadius],
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      sm: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 52,
      },
      xl: {
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        minHeight: 60,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        ...shadows.md,
      },
      secondary: {
        backgroundColor: colors.secondary,
        ...shadows.md,
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
        ...shadows.lg,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : undefined,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
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
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#1A202C'}
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

  const buttonContent = variant === 'gradient' ? (
    <LinearGradient
      colors={['#FFD700', '#F7931E', '#D4AF37']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={getButtonStyle()}
    >
      {renderContent()}
    </LinearGradient>
  ) : (
    <View style={getButtonStyle()}>{renderContent()}</View>
  );

  const ButtonWrapper = animationType !== 'none' ? Animatable.createAnimatableComponent(TouchableOpacity) : TouchableOpacity;

  return (
    <ButtonWrapper
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      animation={animationType !== 'none' ? animationType : undefined}
      duration={animationType !== 'none' ? 600 : undefined}
    >
      {buttonContent}
    </ButtonWrapper>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default Button;

