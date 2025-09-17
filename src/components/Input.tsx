/**
 * Advanced Input Components with Validation and Accessibility
 * Provides comprehensive form input handling for the car app
 */

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, memo, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  FONT_SIZES, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
}

interface BaseInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string | boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  
  // Icons
  leftIcon?: string;
  rightIcon?: string;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  
  // Validation
  validate?: (value: string) => string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  
  // Visual enhancements
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  animateLabel?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const BaseInputComponent = forwardRef<InputRef, BaseInputProps>(({
  label,
  placeholder,
  value = '',
  onChangeText,
  error,
  helperText,
  disabled = false,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  variant = 'outlined',
  size = 'medium',
  animateLabel = true,
  showCharacterCount = false,
  maxLength,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}, ref) => {
  const { colors: themeColors, isDark } = useTheme();
  const { deviceInfo } = useResponsive();
  
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalValue, setInternalValue] = useState(value);
  
  const inputRef = useRef<TextInput>(null);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;

  // Get size-specific styles
  const getSizeStyles = useCallback(() => {
    const sizeMap = {
      small: {
        height: scale(40),
        fontSize: FONT_SIZES.sm,
        paddingHorizontal: SPACING.sm,
      },
      medium: {
        height: scale(48),
        fontSize: FONT_SIZES.md,
        paddingHorizontal: SPACING.md,
      },
      large: {
        height: scale(56),
        fontSize: FONT_SIZES.lg,
        paddingHorizontal: SPACING.lg,
      },
    };
    return sizeMap[size];
  }, [size]);

  // Validation logic
  const validateInput = useCallback((inputValue: string) => {
    if (validate) {
      const validationResult = validate(inputValue);
      setInternalError(validationResult);
      return validationResult;
    }
    return null;
  }, [validate]);

  // Handle text change
  const handleTextChange = useCallback((text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    if (validateOnChange) {
      validateInput(text);
    }
  }, [onChangeText, validateOnChange, validateInput]);

  // Handle focus
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    
    if (animateLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.timing(borderAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    textInputProps.onFocus?.(e);
  }, [animateLabel, label, labelAnimation, borderAnimation, textInputProps]);

  // Handle blur
  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    
    if (animateLabel && label && !internalValue) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    Animated.timing(borderAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    if (validateOnBlur) {
      validateInput(internalValue);
    }
    
    textInputProps.onBlur?.(e);
  }, [animateLabel, label, internalValue, labelAnimation, borderAnimation, validateOnBlur, validateInput, textInputProps]);

  // Imperative handle for ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setInternalValue('');
      onChangeText?.('');
      setInternalError(null);
    },
    isFocused: () => isFocused,
    getValue: () => internalValue,
    setValue: (newValue: string) => {
      setInternalValue(newValue);
      onChangeText?.(newValue);
    },
  }), [isFocused, internalValue, onChangeText]);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value);
    if (animateLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [value, animateLabel, label, labelAnimation]);

  // Get variant styles
  const getVariantStyles = useCallback(() => {
    const hasError = error || internalError;
    const sizeStyles = getSizeStyles();
    
    const baseInputStyle: TextStyle = {
      fontSize: sizeStyles.fontSize,
      color: disabled ? themeColors.textDisabled : themeColors.text,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: SPACING.sm,
      height: sizeStyles.height,
    };

    const baseContainerStyle: ViewStyle = {
      minHeight: sizeStyles.height,
    };

    switch (variant) {
      case 'outlined':
        return {
          container: {
            ...baseContainerStyle,
            borderWidth: 1,
            borderColor: hasError
              ? themeColors.error
              : isFocused
              ? themeColors.primary
              : themeColors.border,
            borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
            backgroundColor: disabled ? themeColors.surfaceDisabled : themeColors.surface,
          },
          input: {
            ...baseInputStyle,
            paddingTop: animateLabel && label ? SPACING.lg : SPACING.sm,
          },
        };
      
      case 'filled':
        return {
          container: {
            ...baseContainerStyle,
            backgroundColor: disabled ? themeColors.surfaceDisabled : themeColors.surfaceVariant,
            borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
            borderBottomWidth: 2,
            borderBottomColor: hasError
              ? themeColors.error
              : isFocused
              ? themeColors.primary
              : 'transparent',
          },
          input: {
            ...baseInputStyle,
            paddingTop: animateLabel && label ? SPACING.lg : SPACING.sm,
          },
        };
      
      case 'underlined':
        return {
          container: {
            ...baseContainerStyle,
            borderBottomWidth: isFocused ? 2 : 1,
            borderBottomColor: hasError
              ? themeColors.error
              : isFocused
              ? themeColors.primary
              : themeColors.border,
            backgroundColor: 'transparent',
          },
          input: {
            ...baseInputStyle,
            paddingHorizontal: 0,
            paddingTop: animateLabel && label ? SPACING.lg : SPACING.xs,
          },
        };
      
      default:
        return { container: baseContainerStyle, input: baseInputStyle };
    }
  }, [variant, error, internalError, isFocused, themeColors, disabled, getSizeStyles, animateLabel, label]);

  // Get animated label styles
  const getAnimatedLabelStyles = useCallback(() => {
    if (!animateLabel || !label) return {};
    
    const sizeStyles = getSizeStyles();
    
    return {
      position: 'absolute' as const,
      left: variant === 'underlined' ? 0 : sizeStyles.paddingHorizontal,
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.height / 2 - FONT_SIZES.md / 2, SPACING.xs],
      }),
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.fontSize, FONT_SIZES.sm],
      }),
      color: error || internalError
        ? themeColors.error
        : isFocused
        ? themeColors.primary
        : themeColors.textSecondary,
      backgroundColor: variant === 'outlined' ? themeColors.background : 'transparent',
      paddingHorizontal: variant === 'outlined' ? SPACING.xs : 0,
      zIndex: 1,
    };
  }, [animateLabel, label, labelAnimation, variant, error, internalError, isFocused, themeColors, getSizeStyles]);

  const variantStyles = getVariantStyles();
  const animatedLabelStyles = getAnimatedLabelStyles();
  const hasError = error || internalError;
  const displayError = typeof error === 'string' ? error : internalError;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Static label (when not animated) */}
      {label && !animateLabel && (
        <Text style={[styles.staticLabel, { color: themeColors.text }, labelStyle]}>
          {label}
          {required && <Text style={[styles.required, { color: themeColors.error }]}> *</Text>}
        </Text>
      )}
      
      {/* Input container */}
      <View style={[styles.inputContainer, variantStyles.container]}>
        {/* Animated label */}
        {label && animateLabel && (
          <Animated.Text style={[animatedLabelStyles, labelStyle]}>
            {label}
            {required && <Text style={[styles.required, { color: themeColors.error }]}> *</Text>}
          </Animated.Text>
        )}
        
        {/* Left icon */}
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            style={styles.leftIcon}
            disabled={!onLeftIconPress || disabled}
          >
            <MaterialIcons
              name={leftIcon}
              size={scale(20)}
              color={disabled ? themeColors.textDisabled : themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
        
        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[
            variantStyles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          value={internalValue}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!animateLabel || !label ? placeholder : undefined}
          placeholderTextColor={themeColors.textSecondary}
          editable={!disabled}
          maxLength={maxLength}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{
            disabled,
            expanded: isFocused,
          }}
          {...textInputProps}
        />
        
        {/* Right icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress || disabled}
          >
            <MaterialIcons
              name={rightIcon}
              size={scale(20)}
              color={disabled ? themeColors.textDisabled : themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Helper text, error, or character count */}
      <View style={styles.helperContainer}>
        <View style={styles.helperTextContainer}>
          {hasError && (
            <Text style={[styles.errorText, { color: themeColors.error }, errorStyle]}>
              {displayError}
            </Text>
          )}
          {!hasError && helperText && (
            <Text style={[styles.helperText, { color: themeColors.textSecondary }]}>
              {helperText}
            </Text>
          )}
        </View>
        
        {showCharacterCount && maxLength && (
          <Text style={[styles.characterCount, { color: themeColors.textSecondary }]}>
            {internalValue.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
});

// Password Input Component
interface PasswordInputProps extends Omit<BaseInputProps, 'rightIcon' | 'onRightIconPress' | 'secureTextEntry'> {
  showPasswordStrength?: boolean;
}

const PasswordInputComponent: React.FC<PasswordInputProps> = ({
  showPasswordStrength = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { colors: themeColors } = useTheme();

  const calculatePasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    if (showPasswordStrength) {
      setPasswordStrength(calculatePasswordStrength(text));
    }
    props.onChangeText?.(text);
  }, [showPasswordStrength, calculatePasswordStrength, props]);

  const getStrengthColor = useCallback(() => {
    switch (passwordStrength) {
      case 0:
      case 1: return themeColors.error;
      case 2:
      case 3: return themeColors.warning;
      case 4:
      case 5: return themeColors.success;
      default: return themeColors.textSecondary;
    }
  }, [passwordStrength, themeColors]);

  const getStrengthText = useCallback(() => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'Weak';
      case 2:
      case 3: return 'Medium';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  }, [passwordStrength]);

  return (
    <View>
      <BaseInput
        {...props}
        secureTextEntry={!isPasswordVisible}
        rightIcon={isPasswordVisible ? 'visibility-off' : 'visibility'}
        onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
        onChangeText={handlePasswordChange}
      />
      
      {showPasswordStrength && props.value && (
        <View style={styles.passwordStrength}>
          <View style={styles.strengthIndicator}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor: level <= passwordStrength
                      ? getStrengthColor()
                      : themeColors.surfaceVariant,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
            {getStrengthText()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Search Input Component
interface SearchInputProps extends Omit<BaseInputProps, 'leftIcon' | 'rightIcon' | 'onLeftIconPress' | 'onRightIconPress'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInputComponent: React.FC<SearchInputProps> = ({
  onClear,
  showClearButton = true,
  ...props
}) => {
  const handleClear = useCallback(() => {
    props.onChangeText?.('');
    onClear?.();
  }, [props, onClear]);

  return (
    <BaseInput
      {...props}
      leftIcon="search"
      rightIcon={showClearButton && props.value ? 'clear' : undefined}
      onRightIconPress={handleClear}
      variant="filled"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  staticLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  required: {
    fontSize: FONT_SIZES.sm,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: SPACING.sm,
    zIndex: 2,
    padding: SPACING.xs,
  },
  rightIcon: {
    position: 'absolute',
    right: SPACING.sm,
    zIndex: 2,
    padding: SPACING.xs,
  },
  inputWithLeftIcon: {
    paddingLeft: scale(48),
  },
  inputWithRightIcon: {
    paddingRight: scale(48),
  },
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
    minHeight: scale(16),
  },
  helperTextContainer: {
    flex: 1,
  },
  helperText: {
    fontSize: FONT_SIZES.xs,
    lineHeight: scale(16),
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    lineHeight: scale(16),
  },
  characterCount: {
    fontSize: FONT_SIZES.xs,
    marginLeft: SPACING.sm,
  },
  passwordStrength: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strengthIndicator: {
    flexDirection: 'row',
    flex: 1,
    gap: SPACING.xs / 2,
    marginRight: SPACING.sm,
  },
  strengthBar: {
    flex: 1,
    height: scale(4),
    borderRadius: scale(2),
  },
  strengthText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
});

// Memoized exports
export const BaseInput = memo(withPerformanceTracking(BaseInputComponent, 'BaseInput'));
export const PasswordInput = memo(withPerformanceTracking(PasswordInputComponent, 'PasswordInput'));
export const SearchInput = memo(withPerformanceTracking(SearchInputComponent, 'SearchInput'));

// Display names
BaseInput.displayName = 'BaseInput';
PasswordInput.displayName = 'PasswordInput';
SearchInput.displayName = 'SearchInput';

export default BaseInput;


