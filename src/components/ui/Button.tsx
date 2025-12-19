import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  StyleSheet,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { width: '100%' }),
      paddingHorizontal: 20,
      paddingVertical: 12,
      height: 48,
      backgroundColor: variant === 'primary' ? colors.primary : 'transparent',
    },
    text: {
      fontWeight: '600',
      color: variant === 'primary' ? colors.onPrimary : colors.text,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFF' : colors.primary} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

export default Button;
