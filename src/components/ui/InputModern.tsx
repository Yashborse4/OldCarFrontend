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
  ActivityIndicator,
} from 'react-native';
import { spacing, borderRadius, typography } from '../../design-system/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';

export interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
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
      variant = 'default',
      size = 'md',
      radius = 'lg',
      containerStyle,
      inputStyle,
      required = false,
      disabled = false,
      success = false,
      loading = false,
      value = '',
      textColor,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const colors = theme.colors;

    const styles = StyleSheet.create({
      container: {
        marginBottom: spacing.lg,
        ...containerStyle,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: error ? colors.error : colors.border,
        borderRadius: borderRadius[radius],
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        minHeight: size === 'sm' ? 44 : 52,
      },
      input: {
        flex: 1,
        color: textColor || colors.text,
        fontSize: typography.fontSizes.base,
        paddingVertical: 0,
        ...inputStyle,
      },
      label: {
        marginBottom: spacing.sm,
        fontSize: typography.fontSizes.sm,
        color: colors.textSecondary,
      },
    });

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            value={value}
            style={styles.input}
            placeholderTextColor={colors.textSecondary}
            editable={!disabled && !loading}
            {...props}
          />
          {loading && <ActivityIndicator color={colors.primary} />}
        </View>
        {error && <Text style={{ color: colors.error, fontSize: 12 }}>{error}</Text>}
      </View>
    );
  }
);

ModernInput.displayName = 'ModernInput';

export { ModernInput as Input };
export default ModernInput;
