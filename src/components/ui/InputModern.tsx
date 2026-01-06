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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../../theme';
import { getResponsiveSpacing, getResponsiveTypography, getResponsiveBorderRadius } from '../../utils/responsiveEnhanced';

export interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'outline' | 'filled' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showCharacterCount?: boolean;
  maxLength?: number;
  floatingLabel?: boolean;
  required?: boolean;
  disabled?: boolean;
  success?: boolean;
  loading?: boolean;
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
      variant = 'outline',
      size = 'md',
      containerStyle,
      inputStyle,
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
      onChangeText,
      secureTextEntry,
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
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const isPasswordInput = secureTextEntry && !isPasswordVisible;
    const finalRightIcon = secureTextEntry
      ? (isPasswordVisible ? 'eye-off-outline' : 'eye-outline')
      : rightIcon;

    useEffect(() => {
      if (error) {
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    }, [error, shakeAnimation]);

    const handleFocus = useCallback((e: any) => {
      if (disabled) return;
      setIsFocused(true);
      if (floatingLabel) {
        Animated.spring(labelAnimation, {
          toValue: 1,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      }
      onFocus?.(e);
    }, [disabled, floatingLabel, labelAnimation, onFocus]);

    const handleBlur = useCallback((e: any) => {
      setIsFocused(false);
      if (floatingLabel && !value) {
        Animated.spring(labelAnimation, {
          toValue: 0,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      }
      onBlur?.(e);
    }, [floatingLabel, value, labelAnimation, onBlur]);

    const handleChangeText = useCallback((text: string) => {
      setCharacterCount(text.length);
      onChangeText?.(text);
    }, [onChangeText]);

    const handleRightIconPress = useCallback(() => {
      if (secureTextEntry) {
        setPasswordVisible(!isPasswordVisible);
      } else {
        onRightIconPress?.();
      }
    }, [secureTextEntry, isPasswordVisible, onRightIconPress]);

    const getBorderColor = () => {
      if (error) return '#EF4444';
      if (success) return '#10B981';
      if (isFocused) return colors.primary;
      return isDark ? 'rgba(255, 255, 255, 0.2)' : '#E5E7EB';
    };

    const getHeight = () => {
      switch (size) {
        case 'sm': return 40;
        case 'lg': return 56;
        default: return 50;
      }
    };

    const styles = StyleSheet.create({
      container: {
        marginBottom: getResponsiveSpacing('md'),
        ...containerStyle,
      },
      inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: getResponsiveBorderRadius('lg'),
        borderWidth: variant === 'outline' || variant === 'glass' ? 1.5 : 0,
        borderColor: getBorderColor(),
        backgroundColor: variant === 'filled'
          ? (isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6')
          : (variant === 'glass' ? 'transparent' : (isDark ? colors.surface : '#FFFFFF')),
        height: getHeight(),
        paddingHorizontal: getResponsiveSpacing('md'),
        overflow: 'hidden',
      },
      input: {
        flex: 1,
        fontSize: size === 'sm' ? getResponsiveTypography('xs') : getResponsiveTypography('sm'),
        color: colors.text,
        paddingVertical: 0,
        paddingHorizontal: getResponsiveSpacing('sm'),
        height: '100%',
        marginTop: floatingLabel ? 12 : 0, // Space for label
        ...inputStyle,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
      },
      label: {
        position: 'absolute',
        left: leftIcon ? 44 : 16,
        color: error ? '#EF4444' : isFocused ? colors.primary : colors.textSecondary,
        fontSize: getResponsiveTypography('sm'),
        fontWeight: '500',
      },
      supportText: {
        fontSize: getResponsiveTypography('xs'),
        marginTop: 4,
        marginLeft: 4,
      },
      glass: {
        ...StyleSheet.absoluteFillObject,
      }
    });

    // Interpolate label position
    const labelTop = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [getHeight() / 2 - 10, 6]
    });

    const labelSize = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [getResponsiveTypography('sm'), getResponsiveTypography('xs')]
    });

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnimation }] }]}>
          {variant === 'glass' && (
            <BlurView
              style={styles.glass}
              blurType={isDark ? "dark" : "light"}
              blurAmount={10}
              reducedTransparencyFallbackColor="white"
            />
          )}

          {leftIcon && (
            <View style={styles.iconContainer}>
              <Ionicons name={leftIcon as any} size={20} color={isFocused ? colors.primary : colors.textSecondary} />
            </View>
          )}

          <TextInput
            ref={ref}
            {...props}
            value={value}
            style={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            placeholder={floatingLabel && !isFocused && !value ? '' : (props.placeholder || label)}
            placeholderTextColor={colors.textSecondary}
            maxLength={maxLength}
            editable={!disabled && !loading}
            secureTextEntry={isPasswordInput}
            testID={testID}
          />

          {loading ? (
            <View style={styles.iconContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : finalRightIcon ? (
            <TouchableOpacity onPress={handleRightIconPress} style={styles.iconContainer} disabled={!secureTextEntry && !onRightIconPress}>
              <Ionicons name={finalRightIcon as any} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}

          {floatingLabel && label && (
            <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize }]} pointerEvents="none">
              {label}
              {required && <Text style={{ color: '#EF4444' }}> *</Text>}
            </Animated.Text>
          )}
        </Animated.View>

        {(error || hint || (showCharacterCount && maxLength)) && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              {error ? (
                <Text style={[styles.supportText, { color: '#EF4444' }]}>{error}</Text>
              ) : hint ? (
                <Text style={[styles.supportText, { color: colors.textSecondary }]}>{hint}</Text>
              ) : null}
            </View>
            {showCharacterCount && maxLength && (
              <Text style={[styles.supportText, { color: colors.textSecondary }]}>
                {characterCount}/{maxLength}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }
);

ModernInput.displayName = 'ModernInput';

export default ModernInput; // Default export
export { ModernInput as Input }; // Alias
