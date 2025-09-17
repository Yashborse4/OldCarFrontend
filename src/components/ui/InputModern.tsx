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
import { useTheme } from '../../theme';
import { spacing, borderRadius, typography, shadows } from '../../design-system/tokens';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { BlurView } from '@react-native-community/blur';
import * as Animatable from 'react-native-animatable';

export interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string; // MaterialIcons name
  rightIcon?: string; // MaterialIcons name
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
      ...props
    },
    ref
  ) => {
    const { colors: themeColors, isDark } = useTheme();
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
      ? (isPasswordVisible ? 'visibility-off' : 'visibility')
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
      if (error) return themeColors.error;
      if (success) return themeColors.success;
      if (isFocused) return themeColors.primary;
      return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    }, [error, success, isFocused, themeColors, isDark]);

    // Styles
    const styles = StyleSheet.create({
      container: {
        marginBottom: spacing.lg,
        ...containerStyle,
      },
      staticLabel: {
        fontSize: typography.fontSizes.sm,
        fontWeight: typography.fontWeights.semibold,
        color: themeColors.textSecondary,
        marginBottom: spacing.sm,
      },
      required: {
        color: themeColors.error,
        fontSize: typography.fontSizes.sm,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        ...(() => {
          const sizeStyles = {
            sm: {
              minHeight: 44,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
            md: {
              minHeight: 52,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
            lg: {
              minHeight: 60,
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.lg,
            },
          };

          const variantStyles = {
            default: {
              backgroundColor: themeColors.surface,
              borderWidth: 1.5,
              borderColor: getBorderColor(),
              ...shadows.sm,
            },
            outline: {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: getBorderColor(),
            },
            filled: {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 0,
              ...shadows.sm,
            },
            glass: {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            },
            minimal: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderBottomWidth: 2,
              borderBottomColor: getBorderColor(),
              borderRadius: 0,
              paddingHorizontal: 0,
            },
          };

          return {
            borderRadius: variant === 'minimal' ? 0 : borderRadius[radius],
            opacity: disabled ? 0.6 : 1,
            ...sizeStyles[size],
            ...variantStyles[variant],
          };
        })(),
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
        fontSize: (() => {
          const sizes = {
            sm: typography.fontSizes.sm,
            md: typography.fontSizes.base,
            lg: typography.fontSizes.lg,
          };
          return sizes[size];
        })(),
        lineHeight: (() => {
          const sizes = {
            sm: typography.fontSizes.sm * 1.4,
            md: typography.fontSizes.base * 1.4,
            lg: typography.fontSizes.lg * 1.4,
          };
          return sizes[size];
        })(),
        color: themeColors.text,
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
        backgroundColor: variant === 'minimal' ? 'transparent' : themeColors.background,
        paddingHorizontal: variant === 'minimal' ? 0 : spacing.xs,
        color: error ? themeColors.error : success ? themeColors.success : isFocused ? themeColors.primary : themeColors.textSecondary,
        fontWeight: isFocused ? typography.fontWeights.semibold : typography.fontWeights.medium,
        zIndex: 1,
      },
      errorText: {
        fontSize: typography.fontSizes.sm,
        color: themeColors.error,
        marginTop: spacing.xs,
        fontWeight: typography.fontWeights.medium,
      },
      hintText: {
        fontSize: typography.fontSizes.sm,
        color: themeColors.textSecondary,
        marginTop: spacing.xs,
      },
      successText: {
        fontSize: typography.fontSizes.sm,
        color: themeColors.success,
        marginTop: spacing.xs,
        fontWeight: typography.fontWeights.medium,
      },
      characterCount: {
        fontSize: typography.fontSizes.xs,
        color: characterCount === maxLength ? themeColors.warning : themeColors.textSecondary,
        textAlign: 'right',
        marginTop: spacing.xs,
      },
      focusIndicator: {
        position: 'absolute',
        bottom: variant === 'minimal' ? -2 : 0,
        left: 0,
        right: 0,
        height: variant === 'minimal' ? 2 : 1,
        backgroundColor: themeColors.primary,
      },
    });

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={300}
        delay={animationDelay}
        style={styles.container}
      >
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
              reducedTransparencyFallbackColor={themeColors.surface}
            />
          )}

          {/* Focus indicator */}
          {(isFocused || error || success) && (
            <Animated.View
              style={[
                styles.focusIndicator,
                {
                  backgroundColor: error ? themeColors.error : success ? themeColors.success : themeColors.primary,
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
              <MaterialIcons
                name={leftIcon as any}
                size={size === 'lg' ? 24 : 20}
                color={isFocused ? themeColors.primary : themeColors.textSecondary}
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
            placeholderTextColor={themeColors.textSecondary}
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
                color={themeColors.primary}
              />
            </View>
          ) : finalRightIcon ? (
            <TouchableOpacity
              onPress={handleRightIconPress}
              style={styles.rightIconContainer}
              disabled={!secureTextEntry && !onRightIconPress}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={finalRightIcon as any}
                size={size === 'lg' ? 24 : 20}
                color={isFocused ? themeColors.primary : themeColors.textSecondary}
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
          <Animatable.Text
            animation="fadeInLeft"
            duration={200}
            style={styles.errorText}
          >
            {error}
          </Animatable.Text>
        )}

        {/* Success message */}
        {success && !error && (
          <Animatable.Text
            animation="fadeInLeft"
            duration={200}
            style={styles.successText}
          >
            ✓ Looks good!
          </Animatable.Text>
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
      </Animatable.View>
    );
  }
);

ModernInput.displayName = 'ModernInput';

export { ModernInput as Input };
export default ModernInput;


