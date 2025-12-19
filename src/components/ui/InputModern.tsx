import React, { useState, useRef, useCallback, forwardRef, useEffect } from 'react';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { spacing, borderRadius, typography } from '../../design-system/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

import { useTheme } from '../../theme';

export interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string; // Ionicons name
  rightIcon?: string; // Ionicons name
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline' | 'filled' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  radius?: keyof typeof borderRadius;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showCharacterCount?: boolean;
  maxLength?: number;
  floatingLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  success?: boolean;
  loading?: boolean;
  animationDelay?: number;
  testID?: string;
  textColor?: string;
}

export const ModernInput = forwardRef<TextInput, ModernInputProps>(
  (
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
      inputStyle,
      showCharacterCount = false,
      maxLength,
      floatingLabel = true,
      required = false,
      disabled = false,
      success = false,
      loading = false,
      animationDelay = 0,
      testID,
      value = '',
      onFocus,
      onBlur,
      secureTextEntry,
      textColor,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const colors = theme.colors;
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(value?.length || 0);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    // Animation values
    const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
    const focusAnimation = useRef(new Animated.Value(0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Handle password visibility for password inputs
    const isPasswordInput = secureTextEntry && !isPasswordVisible;
    const finalRightIcon = secureTextEntry
      ? (isPasswordVisible ? 'eye-off-outline' : 'eye-outline')
      : rightIcon;

    // Shake animation for errors
    useEffect(() => {
      if (error) {
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -4, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    }, [error, shakeAnimation]);

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

    const handleRightIconPress = useCallback(() => {
      if (secureTextEntry) {
        setPasswordVisible(!isPasswordVisible);
      } else {
        onRightIconPress?.();
      }
    }, [secureTextEntry, isPasswordVisible, onRightIconPress]);

    // Get border color based on state
    const getBorderColor = useCallback(() => {
      if (error) return colors.error;
      if (success) return colors.success;
      if (isFocused) return colors.primary;
      return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }, [error, success, isFocused, colors.error, colors.success, colors.primary, isDark]);

    // Styles (cleaned up: fix malformed blocks and ensure theme usage)
    const styles = StyleSheet.create({
      container: {
        marginBottom: spacing.lg,
        ...containerStyle,
      },
      staticLabel: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
      },
      required: {
        color: colors.error,
        fontSize: typography.fontSizes.sm,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        borderRadius: variant === 'minimal' ? 0 : borderRadius[radius],
        opacity: disabled ? 0.6 : 1,
        ...(size === 'sm'
          ? { minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }
          : size === 'md'
            ? { minHeight: 52, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }
            : { minHeight: 60, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }),
        ...(variant === 'default'
          ? { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: getBorderColor() }
          : variant === 'outline'
            ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: getBorderColor() }
            : variant === 'filled'
              ? { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderWidth: 0 }
              : variant === 'glass'
                ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)', overflow: 'hidden' }
                : { backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 2, borderBottomColor: getBorderColor(), borderRadius: 0, paddingHorizontal: 0 }),
      },
      glassBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: borderRadius[radius],
      },
      leftIconContainer: {
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
      },
      input: {
        flex: 1,
        fontSize:
          size === 'sm'
            ? typography.fontSizes.sm
            : size === 'md'
              ? typography.fontSizes.base
              : typography.fontSizes.lg,
        lineHeight:
          size === 'sm'
            ? typography.fontSizes.sm * 1.4
            : size === 'md'
              ? typography.fontSizes.base * 1.4
              : typography.fontSizes.lg * 1.4,
        color: textColor || colors.text,
        fontWeight: typography.fontWeights.medium,
        paddingVertical: 0,
        ...inputStyle,
      },
      rightIconContainer: {
        marginLeft: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xs,
      },
      floatingLabel: {
        position: 'absolute',
        left: leftIcon ? spacing.xl + spacing.md : spacing.lg,
        backgroundColor:
          variant === 'minimal' || variant === 'outline' ? 'transparent' : colors.background,
        paddingHorizontal: variant === 'minimal' || variant === 'outline' ? 0 : spacing.xs,
        color: error
          ? colors.error
          : success
            ? colors.success
            : isFocused
              ? colors.primary
              : colors.textSecondary,
        fontWeight: isFocused ? typography.fontWeights.semibold : typography.fontWeights.medium,
        zIndex: 1,
      },
      errorText: {
        fontSize: typography.fontSizes.sm,
        color: colors.error,
        marginTop: spacing.xs,
        fontWeight: typography.fontWeights.medium,
      },
      hintText: {
        fontSize: typography.fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
      },
      successText: {
        fontSize: typography.fontSizes.sm,
        color: colors.success,
        marginTop: spacing.xs,
        fontWeight: typography.fontWeights.medium,
      },
      characterCount: {
        fontSize: typography.fontSizes.xs,
        color: characterCount === maxLength ? colors.warning : colors.textSecondary,
        textAlign: 'right',
        marginTop: spacing.xs,
      },
      focusIndicator: {
        position: 'absolute',
        bottom: variant === 'minimal' ? -2 : 0,
        left: 0,
        right: 0,
        height: variant === 'minimal' ? 2 : 1,
        backgroundColor: colors.primary,
      },
    });

    return (
      <View style={styles.container}>
        {/* Static label */}
        {!floatingLabel && label && (
          <Text style={styles.staticLabel}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        {/* Input container with shake animation */}
        <Animated.View
          style={[
            styles.inputContainer,
            {
              transform: [{ translateX: shakeAnimation }],
            },
          ]}
        >
          {/* Glass background effect */}
          {variant === 'glass' && (
            <BlurView
              style={styles.glassBackground}
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={5}
              reducedTransparencyFallbackColor={colors.surface}
            />
          )}

          {/* Focus indicator */}
          {(isFocused || error || success) && (
            <Animated.View
              style={[
                styles.focusIndicator,
                {
                  backgroundColor: error ? colors.error : success ? colors.success : colors.primary,
                  transform: [
                    {
                      scaleX: focusAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}

          {/* Left icon */}
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon as any}
                size={size === 'lg' ? 24 : 20}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
            </View>
          )}

          {/* Text input */}
          <TextInput
            ref={ref}
            {...props}
            value={value}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            placeholder={floatingLabel ? undefined : props.placeholder}
            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : colors.textSecondary}
            maxLength={maxLength}
            editable={!disabled && !loading}
            secureTextEntry={isPasswordInput}
            testID={testID}
            accessibilityLabel={label}
            accessibilityHint={hint}
            accessibilityState={{
              disabled: disabled || loading,
            }}
          />

          {/* Right icon or loading indicator */}
          {loading ? (
            <View style={styles.rightIconContainer}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            </View>
          ) : finalRightIcon ? (
            <TouchableOpacity
              onPress={handleRightIconPress}
              style={styles.rightIconContainer}
              disabled={!secureTextEntry && !onRightIconPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={finalRightIcon as any}
                size={size === 'lg' ? 24 : 20}
                color={isFocused ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}

          {/* Floating label */}
          {floatingLabel && label && (
            <Animated.Text
              style={[
                styles.floatingLabel,
                {
                  fontSize: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [typography.fontSizes.base, typography.fontSizes.sm],
                  }),
                  top: labelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      size === 'lg' ? 18 : size === 'md' ? 15 : 12,
                      variant === 'minimal' ? -2 : -10
                    ],
                  }),
                },
              ]}
            >
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Animated.Text>
          )}
        </Animated.View>

        {/* Error message */}
        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        {/* Success message */}
        {success && !error && (
          <Text style={styles.successText}>
            ✓ Looks good!
          </Text>
        )}

        {/* Hint text */}
        {hint && !error && (
          <Text style={styles.hintText}>{hint}</Text>
        )}

        {/* Character count */}
        {showCharacterCount && maxLength && (
          <Text style={styles.characterCount}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>
    );
  }
);

ModernInput.displayName = 'ModernInput';

export { ModernInput as Input };
export default ModernInput;


