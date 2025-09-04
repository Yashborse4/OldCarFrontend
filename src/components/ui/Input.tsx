import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import * as Animatable from 'react-native-animatable';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  containerStyle?: ViewStyle;
  showCharacterCount?: boolean;
  maxLength?: number;
  floatingLabel?: boolean;
  required?: boolean;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'md',
  borderRadius = 'md',
  containerStyle,
  showCharacterCount = false,
  maxLength,
  floatingLabel = true,
  required = false,
  testID,
  value = '',
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const { colors, typography, spacing, borderRadius: radius, shadows } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (floatingLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (floatingLabel && label && !value) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setCharacterCount(text.length);
    props.onChangeText?.(text);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: spacing.md,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const sizeStyles = {
      sm: {
        minHeight: 40,
        paddingHorizontal: spacing.sm,
      },
      md: {
        minHeight: 48,
        paddingHorizontal: spacing.md,
      },
      lg: {
        minHeight: 56,
        paddingHorizontal: spacing.lg,
      },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: error ? colors.error : isFocused ? colors.primary : colors.inputBorder,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
      },
      filled: {
        backgroundColor: colors.surface,
        borderWidth: 0,
        ...shadows.sm,
      },
      glass: {
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backdropFilter: 'blur(10px)',
      },
    };

    return {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius[borderRadius],
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
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
    };

    return {
      flex: 1,
      color: colors.inputText,
      ...sizeStyles[size],
      ...(style as object),
    };
  };

  const getLabelStyle = () => {
    if (!floatingLabel || !label) return null;

    return {
      position: 'absolute' as const,
      left: leftIcon ? spacing.xl + spacing.md : spacing.md,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xs,
      color: error ? colors.error : isFocused ? colors.primary : colors.textSecondary,
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [typography.fontSizes.md, typography.fontSizes.sm],
      }),
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [size === 'lg' ? 16 : size === 'md' ? 12 : 8, -8],
      }),
    };
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={400}
      style={getContainerStyle()}
    >
      {!floatingLabel && label && (
        <Text style={styles.staticLabel}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        <TextInput
          {...props}
          value={value}
          style={getInputStyle()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          placeholder={floatingLabel ? undefined : props.placeholder}
          placeholderTextColor={colors.placeholder}
          maxLength={maxLength}
          testID={testID}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}

        {floatingLabel && label && (
          <Animated.Text style={getLabelStyle()}>
            {label}
            {required && <Text style={[styles.required, { color: colors.error }]}>*</Text>}
          </Animated.Text>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          {hint}
        </Text>
      )}

      {showCharacterCount && maxLength && (
        <Text style={[styles.characterCount, { color: colors.textTertiary }]}>
          {characterCount}/{maxLength}
        </Text>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  staticLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    fontSize: 14,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
    padding: 4,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
  },
  hintText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
  },
  characterCount: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'right',
  },
});

export default Input;

