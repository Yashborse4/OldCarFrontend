import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { getResponsiveSpacing, getResponsiveBorderRadius, getResponsiveTypography } from '../../utils/responsiveEnhanced';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type ToastPosition = 'top' | 'center' | 'bottom';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  position?: ToastPosition;
  duration?: number;
  backdrop?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  onDismiss?: () => void;
}

export interface ToastItemProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  position?: ToastPosition;
  duration?: number;
  backdrop?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  onDismiss?: () => void;
  onRemove: (id: string) => void;
  index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  type,
  title,
  message,
  position = 'top',
  duration = 3000,
  backdrop = false,
  icon,
  onPress,
  onDismiss,
  onRemove,
  index,
}) => {
  const { theme, isDark } = useTheme();
  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Colors based on type
  const getToastColors = () => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', icon: '#10B981', text: '#064E3B' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', icon: '#EF4444', text: '#7F1D1D' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', icon: '#F59E0B', text: '#78350F' };
      case 'info':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', icon: '#3B82F6', text: '#1E3A8A' };
      default:
        return { bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: theme.colors.border, icon: theme.colors.text, text: theme.colors.text };
    }
  };

  const colors = getToastColors();
  const textColor = isDark && type === 'neutral' ? '#F9FAFB' : (type === 'neutral' ? '#111827' : colors.text);

  const getIconName = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const handleDismiss = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 0.8, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      onDismiss?.();
      onRemove(id);
    });
  }, [id, onDismiss, onRemove, opacityAnim, scaleAnim, slideAnim]);

  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss, slideAnim, opacityAnim, scaleAnim]);

  const getPositionStyle = () => {
    const offset = 20 + (index * 80); // Spacing between toasts
    switch (position) {
      case 'top':
        return {
          top: Platform.OS === 'ios' ? 50 + offset : 20 + offset,
          alignSelf: 'center',
          transform: [
            { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) },
            { scale: scaleAnim }
          ]
        };
      case 'bottom':
        return {
          bottom: Platform.OS === 'ios' ? 50 + offset : 20 + offset,
          alignSelf: 'center',
          transform: [
            { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
            { scale: scaleAnim }
          ]
        };
      default: // center
        return {
          top: screenHeight / 2 - 40,
          alignSelf: 'center',
          transform: [
            { scale: scaleAnim }
          ]
        };
    }
  };

  return (
    <Animated.View style={[styles.container, getPositionStyle() as any, { opacity: opacityAnim }]}>
      {backdrop && <View style={styles.backdrop} />}

      <BlurView
        style={styles.blur}
        blurType={isDark ? "dark" : "light"}
        blurAmount={10}
        reducedTransparencyFallbackColor={isDark ? "#1F2937" : "#FFFFFF"}
      />

      <TouchableOpacity
        style={[styles.content, { borderColor: colors.border, backgroundColor: colors.bg }]}
        onPress={onPress || handleDismiss}
        activeOpacity={0.9}
      >
        <Ionicons name={getIconName()} size={24} color={colors.icon} style={styles.icon} />

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: '#000000' }]}>{title}</Text>
          {message && <Text style={[styles.message, { color: '#374151' }]}>{message}</Text>}
        </View>

        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenWidth - 32,
    maxWidth: 400,
    zIndex: 9999,
    borderRadius: getResponsiveBorderRadius('xl'),
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderRadius: getResponsiveBorderRadius('xl'),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  }
});

export default ToastItem;
