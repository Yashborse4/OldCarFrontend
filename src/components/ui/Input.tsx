import React, { useState, useRef, useCallback, forwardRef } from 'react';
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
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius, typography, shadows } from '../../design-system/tokens';
import * as Animatable from 'react-native-animatable';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string; // Icon name from MaterialIcons
  rightIcon?: string; // Icon name from MaterialIcons
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline' | 'filled' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  radius?: keyof typeof borderRadius;
  containerStyle?: ViewStyle;
  showCharacterCount?: boolean;
  maxLength?: number;
  floatingLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  success?: boolean;
  loading?: boolean;
  testID?: string;
}

export const Input = forwardRef<TextInput, InputProps>((
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    variant = 'default',
    size = 'md',
    radius = 'lg',
    containerStyle,
    showCharacterCount = false,
    maxLength,
    floatingLabel = true,
    required = false,
    disabled = false,
    success = false,
    loading = false,
    testID,
    value = '',
    onFocus,
    onBlur,
    style,
    ...props
  }: InputProps,
  ref: React.ForwardedRef<TextInput>
) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(value?.length || 0);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const focusAnimation = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback((e: any) => {
    if (disabled) return;
    
    setIsFocused(true);
    
    // Animate label and focus indicator
    if (floatingLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.timing(focusAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    onFocus?.(e);
  }, [disabled, floatingLabel, label, labelAnimation, focusAnimation, onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    
    // Animate label back if no value
    if (floatingLabel && label && !value) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.timing(focusAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    onBlur?.(e);
  }, [floatingLabel, label, value, labelAnimation, focusAnimation, onBlur]);

  const handleChangeText = useCallback((text: string) => {
    setCharacterCount(text.length);
    props.onChangeText?.(text);
  }, [props.onChangeText]);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

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

    type InputVariant = 'default' | 'outline' | 'filled' | 'glass' | 'minimal';
    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: (colors as any).background,
        borderWidth: 1,
        borderColor: error ? (colors as any).error : (isFocused ? (colors as any).primary : (colors as any).border),
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: error ? (colors as any).error : (isFocused ? (colors as any).primary : (colors as any).border),
      },
      filled: {
        backgroundColor: (colors as any).background,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
      },
      glass: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderWidth: 0,
      },
      minimal: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderBottomWidth: 1,
        borderRadius: 0,
        borderColor: error ? (colors as any).error : (isFocused ? (colors as any).primary : (colors as any).border),
      },
    };

    return {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius === 'sm' ? 8 : radius === 'lg' ? 16 : 12,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      padding: 0,
      margin: 0,
      color: (colors as any).text || '#000000',
      fontFamily: 'System',
      fontSize: size === 'sm' ? (typography.fontSizes as any).sm || 14 : 
               size === 'lg' ? (typography.fontSizes as any).lg || 18 : 
               (typography.fontSizes as any).base || 16,
      ...(style as any),
    };

    if (variant === 'minimal') {
      return {
        ...baseStyle,
        paddingVertical: 0,
        paddingHorizontal: 0,
      };
    }

    return baseStyle;
  };

  const getLabelStyle = (): any => {
    if (!floatingLabel || !label) return {};
    
    const baseFontSize = size === 'sm' ? (typography.fontSizes as any).sm || 14 : 
                        size === 'lg' ? (typography.fontSizes as any).lg || 18 : 
                        (typography.fontSizes as any).base || 16;

    return {
      position: 'absolute',
      left: leftIcon ? spacing.xl + spacing.md : spacing.md,
      fontFamily: 'System',
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [baseFontSize, (typography.fontSizes as any).sm || 12],
      }),
      color: error ? (colors as any).error : isFocused ? (colors as any).primary : (colors as any).textSecondary,
      backgroundColor: (colors as any).background,
      paddingHorizontal: spacing.xs,
      zIndex: 1,
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
          {required && <Text style={[styles.required, { color: (colors as any).error }]}>*</Text>}
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
          placeholderTextColor={(colors as any).placeholder}
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
            {required && <Text style={[styles.required, { color: (colors as any).error }]}>*</Text>}
          </Animated.Text>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: (colors as any).error }]}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text style={[styles.hintText, { color: (colors as any).textSecondary }]}>
          {hint}
        </Text>
      )}

      {showCharacterCount && maxLength && (
        <Text style={[styles.characterCount, { color: (colors as any).textTertiary }]}>
          {characterCount}/{maxLength}
        </Text>
      )}
    </Animatable.View>
  );
});

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



