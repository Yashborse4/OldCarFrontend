import React, { memo } from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';

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
  // Hardcoded 
  const colors = {
    surface: '#FFFFFF',
    border: '#E5E5E7',
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      opacity: disabled ? 0.6 : 1,
      ...getVariantStyles(variant, colors),
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
const getVariantStyles = (variant: string, colors: any) => {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: colors.surface,
        elevation: 2,

      };
    case 'elevated':
      return {
        backgroundColor: colors.surface,
        elevation: 6,

      };
    case 'outlined':
      return {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border
      };
    default:
      return {
        backgroundColor: colors.surface,
        elevation: 2,

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

