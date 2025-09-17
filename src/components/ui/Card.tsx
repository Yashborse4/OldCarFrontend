import React, { memo } from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = memo(({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  const { colors: themeColors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles(variant, themeColors),
      ...getPaddingStyles(padding),
      ...style,
    },
  });

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card} testID={testID}>
      {children}
    </View>
  );
});

// Helper functions
const getVariantStyles = (variant: string, themeColors: any) => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: themeColors.surface,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      };
    case 'elevated':
      return {
        backgroundColor: themeColors.surface,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      };
    case 'outlined':
      return {
        backgroundColor: themeColors.surface,
        borderWidth: 1,
        borderColor: themeColors.border,
      };
    default:
      return {
        backgroundColor: themeColors.surface,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      };
  }
};

const getPaddingStyles = (padding: string) => {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'sm':
      return { padding: 12 };
    case 'md':
      return { padding: 16 };
    case 'lg':
      return { padding: 20 };
    default:
      return { padding: 16 };
  }
};

Card.displayName = 'Card';

export default Card;

