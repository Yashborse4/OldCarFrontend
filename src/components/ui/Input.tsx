import React, { useState, useCallback, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
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
    containerStyle,
    required = false,
    disabled = false,
    testID,
    value = '',
    onFocus,
    onBlur,
    secureTextEntry,
    style,
    ...props
  }: InputProps,
  ref: React.ForwardedRef<TextInput>
) => {
  const { colors: themeColors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handleFocus = useCallback((e: any) => {
    if (disabled) return;
    setIsFocused(true);
    onFocus?.(e);
  }, [disabled, onFocus]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const handleRightIconPress = useCallback(() => {
    if (secureTextEntry) {
      setPasswordVisible(!isPasswordVisible);
    } else {
      onRightIconPress?.();
    }
  }, [secureTextEntry, isPasswordVisible, onRightIconPress]);

  const getBorderColor = () => {
    if (error) return themeColors.error;
    if (isFocused) return themeColors.primary;
    return themeColors.border;
  };

  const getIconForSecureEntry = () => {
    if (secureTextEntry) {
      return isPasswordVisible ? 'visibility-off' : 'visibility';
    }
    return rightIcon;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      ...containerStyle,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.text,
      marginBottom: 8,
    },
    required: {
      color: themeColors.error,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: getBorderColor(),
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles(variant, themeColors),
      ...getSizeStyles(size),
    },
    input: {
      flex: 1,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15,
      fontWeight: '400',
      color: themeColors.text,
      paddingVertical: 0,
      ...(style as any),
    },
    leftIcon: {
      marginRight: 12,
    },
    rightIconContainer: {
      marginLeft: 12,
      padding: 4,
    },
    errorText: {
      fontSize: 12,
      color: themeColors.error,
      marginTop: 4,
      fontWeight: '500',
    },
    hintText: {
      fontSize: 12,
      color: themeColors.textSecondary,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            <MaterialIcons
              name={leftIcon as any}
              size={size === 'sm' ? 16 : 20}
              color={isFocused ? themeColors.primary : themeColors.textSecondary}
            />
          </View>
        )}

        <TextInput
          ref={ref}
          {...props}
          value={value}
          style={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={props.placeholder}
          placeholderTextColor={themeColors.textSecondary}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          testID={testID}
        />

        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress && !secureTextEntry}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={getIconForSecureEntry() as any}
              size={size === 'sm' ? 16 : 20}
              color={isFocused ? themeColors.primary : themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </View>
  );
});

// Helper functions
const getVariantStyles = (variant: string, themeColors: any) => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: themeColors.surface,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
      };
    default:
      return {
        backgroundColor: themeColors.surface,
      };
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        paddingHorizontal: 12,
        paddingVertical: 8,
        height: 40,
      };
    case 'md':
      return {
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 48,
      };
    case 'lg':
      return {
        paddingHorizontal: 20,
        paddingVertical: 16,
        height: 56,
      };
    default:
      return {
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 48,
      };
  }
};

Input.displayName = 'Input';

export default Input;

