import React, { useRef, useEffect, useCallback } from 'react';
import {
  Animated,
  Easing,
  Vibration,
  Platform,
  ViewStyle,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native';
import { spacing, typography } from '../../design-system/tokens';

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if (Platform.OS === 'ios') {
      // iOS haptic feedback would go here
      // For now, we'll use Vibration API
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(50);
    }
  },
  medium: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(20);
    } else {
      Vibration.vibrate(100);
    }
  },
  heavy: () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(30);
    } else {
      Vibration.vibrate([0, 200]);
    }
  },
};

// Advanced animation configurations
export const ADVANCED_ANIMATIONS = {
  spring: {
    tension: 300,
    friction: 8,
    useNativeDriver: true,
  },
  timing: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    useNativeDriver: true,
  },
  smooth: {
    duration: 200,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },
  bouncy: {
    tension: 100,
    friction: 3,
    useNativeDriver: true,
  },
};

// Pressable with advanced animations
interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  scaleValue?: number;
  hapticType?: 'light' | 'medium' | 'heavy';
  animationType?: 'scale' | 'bounce' | 'glow' | 'lift';
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  scaleValue = 0.96,
  hapticType = 'light',
  animationType = 'scale',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    hapticFeedback[hapticType]();

    switch (animationType) {
      case 'scale':
        Animated.spring(scaleAnim, {
          toValue: scaleValue,
          ...ADVANCED_ANIMATIONS.spring,
        }).start();
        break;
      case 'bounce':
        Animated.spring(scaleAnim, {
          toValue: scaleValue,
          ...ADVANCED_ANIMATIONS.bouncy,
        }).start();
        break;
      case 'glow':
        Animated.timing(glowAnim, {
          toValue: 1,
          ...ADVANCED_ANIMATIONS.timing,
        }).start();
        break;
      case 'lift':
        Animated.timing(liftAnim, {
          toValue: -4,
          ...ADVANCED_ANIMATIONS.smooth,
        }).start();
        break;
    }
  }, [disabled, hapticType, animationType, scaleValue, scaleAnim, glowAnim, liftAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;

    switch (animationType) {
      case 'scale':
      case 'bounce':
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...ADVANCED_ANIMATIONS.spring,
        }).start();
        break;
      case 'glow':
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
        break;
      case 'lift':
        Animated.timing(liftAnim, {
          toValue: 0,
          ...ADVANCED_ANIMATIONS.smooth,
        }).start();
        break;
    }
  }, [disabled, animationType, scaleAnim, glowAnim, liftAnim]);

  const getAnimatedStyle = () => {
    const baseTransform = [];

    if (animationType === 'scale' || animationType === 'bounce') {
      baseTransform.push({ scale: scaleAnim });
    }

    if (animationType === 'lift') {
      baseTransform.push({ translateY: liftAnim });
    }

    return {
      transform: baseTransform,
      opacity: animationType === 'glow' 
        ? glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.8],
          })
        : disabled ? 0.6 : 1,
    };
  };

  return (
    <TapGestureHandler
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.BEGAN) {
          handlePressIn();
        } else if (nativeEvent.state === State.END) {
          handlePressOut();
          onPress?.();
        }
      }}
      enabled={!disabled}
    >
      <Animated.View style={[style, getAnimatedStyle()]}>
        {children}
      </Animated.View>
    </TapGestureHandler>
  );
};

// Swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
  threshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  style,
  threshold = 50,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX, velocityX } = nativeEvent;

      if (Math.abs(translationX) > threshold || Math.abs(velocityX) > 500) {
        // Swipe detected
        const direction = translationX > 0 ? 'right' : 'left';
        
        hapticFeedback.medium();
        
        // Animate out
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: direction === 'right' ? 300 : -300,
            ...ADVANCED_ANIMATIONS.timing,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            ...ADVANCED_ANIMATIONS.timing,
          }),
        ]).start(() => {
          // Call appropriate callback
          if (direction === 'right') {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
          
          // Reset position
          translateX.setValue(0);
          opacity.setValue(1);
        });
      } else {
        // Return to center
        Animated.spring(translateX, {
          toValue: 0,
          ...ADVANCED_ANIMATIONS.spring,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

// Loading skeleton component
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const shimmer = () => {
      shimmerAnim.setValue(-1);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(shimmer);
    };
    shimmer();
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: [
            {
              translateX: shimmerAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-100%', '100%'],
              }),
            },
          ],
        }}
      />
    </Animated.View>
  );
};

// Pulse animation hook
export const usePulseAnimation = (duration: number = 1000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };
    pulse();
  }, [pulseAnim, duration]);

  return pulseAnim;
};

// Stagger animation hook
export const useStaggerAnimation = (
  items: any[],
  delay: number = 100
) => {
  const animations = useRef(
    items.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const staggerAnimations = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    Animated.stagger(delay, staggerAnimations).start();
  }, [animations, delay]);

  return animations;
};

// Parallax scroll hook
export const useParallaxScroll = (scrollY: Animated.Value) => {
  const parallax = {
    slow: scrollY.interpolate({
      inputRange: [0, 300],
      outputRange: [0, -50],
      extrapolate: 'clamp',
    }),
    medium: scrollY.interpolate({
      inputRange: [0, 300],
      outputRange: [0, -100],
      extrapolate: 'clamp',
    }),
    fast: scrollY.interpolate({
      inputRange: [0, 300],
      outputRange: [0, -150],
      extrapolate: 'clamp',
    }),
  };

  const fadeOut = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const scale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 1.2],
    extrapolate: 'clamp',
  });

  return { parallax, fadeOut, scale };
};

// Floating Action Button with physics
interface FloatingActionButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  style?: ViewStyle;
  size?: number;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  style,
  size = 56,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    hapticFeedback.medium();
    
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.2,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  }, [bounceAnim, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#007AFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        style,
        {
          transform: [
            { scale: scaleAnim },
            { scale: bounceAnim },
          ],
        },
      ]}
      animationType="scale"
      hapticType="medium"
    >
      {icon}
    </AnimatedPressable>
  );
};

export {
  ADVANCED_ANIMATIONS,
  hapticFeedback,
};


