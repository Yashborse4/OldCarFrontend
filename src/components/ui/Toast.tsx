import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { AntDesign, MaterialIcons } from '@react-native-vector-icons/ant-design';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';
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

interface ToastItemProps extends ToastConfig {
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
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          background: ['#10B981', '#059669'],
          border: '#10B981',
          icon: '#FFFFFF',
          text: '#FFFFFF',
          glow: 'rgba(16, 185, 129, 0.3)',
        };
      case 'error':
        return {
          background: ['#EF4444', '#DC2626'],
          border: '#EF4444',
          icon: '#FFFFFF',
          text: '#FFFFFF',
          glow: 'rgba(239, 68, 68, 0.3)',
        };
      case 'warning':
        return {
          background: ['#F59E0B', '#D97706'],
          border: '#F59E0B',
          icon: '#FFFFFF',
          text: '#FFFFFF',
          glow: 'rgba(245, 158, 11, 0.3)',
        };
      case 'info':
        return {
          background: ['#3B82F6', '#2563EB'],
          border: '#3B82F6',
          icon: '#FFFFFF',
          text: '#FFFFFF',
          glow: 'rgba(59, 130, 246, 0.3)',
        };
      default:
        return {
          background: [themeColors.surface, themeColors.card],
          border: themeColors.border,
          icon: themeColors.text,
          text: themeColors.text,
          glow: 'rgba(0, 0, 0, 0.1)',
        };
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <AntDesign name="checkcircle1" size={24} color={toastColors.icon} />;
      case 'error':
        return <AntDesign name="closecircle" size={24} color={toastColors.icon} />;
      case 'warning':
        return <AntDesign name="exclamationcircle1" size={24} color={toastColors.icon} />;
      case 'info':
        return <AntDesign name="infocircle1" size={24} color={toastColors.icon} />;
      default:
        return <MaterialIcons name="notifications" size={24} color={toastColors.icon} />;
    }
  };

  const toastColors = getToastColors();

  useEffect(() => {
    // Enter animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    // Exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
      onRemove(id);
    });
  };

  const getPositionStyle = () => {
    const baseOffset = spacing.lg + (index * (70 + spacing.sm));
    
    switch (position) {
      case 'top':
        return {
          top: Platform.OS === 'ios' ? 60 + baseOffset : 30 + baseOffset,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
            { scale: scaleAnim },
          ],
        };
      case 'center':
        return {
          top: (screenHeight - 100) / 2,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth, 0],
              }),
            },
            { scale: scaleAnim },
          ],
        };
      case 'bottom':
        return {
          bottom: Platform.OS === 'ios' ? 100 + baseOffset : 80 + baseOffset,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
            { scale: scaleAnim },
          ],
        };
      default:
        return {};
    }
  };

  return (
    <>
      {backdrop && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      )}
      
      <Animated.View
        style={[
          styles.container,
          getPositionStyle(),
          {
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            onPress?.();
            if (!onPress) handleDismiss();
          }}
          style={styles.touchable}
        >
          {/* Glass morphism effect */}
          <BlurView
            style={styles.blurContainer}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor={themeColors.surface}
          />
          
          {/* Gradient overlay */}
          <LinearGradient
            colors={toastColors.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientOverlay}
          />
          
          {/* Glow effect */}
          <View
            style={[
              styles.glowEffect,
              {
                shadowColor: toastColors.glow,
                borderColor: toastColors.border,
              },
            ]}
          />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={2000}
              >
                {getIcon()}
              </Animatable.View>
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  { color: toastColors.text },
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>
              {message && (
                <Text
                  style={[
                    styles.message,
                    { color: toastColors.text, opacity: 0.9 },
                  ]}
                  numberOfLines={3}
                >
                  {message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <AntDesign
                name="close"
                size={18}
                color={toastColors.text}
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 70,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.95,
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 70,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ToastItem;


