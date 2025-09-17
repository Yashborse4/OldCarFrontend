import React, { useRef, useEffect, ReactNode, useState } from 'react';
import {
  Animated,
  Easing,
  ViewStyle,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useTheme } from '../../theme';

// Types for micro-interactions
export interface MicroInteractionConfig {
  type: 'pulse' | 'bounce' | 'shake' | 'glow' | 'ripple' | 'scale' | 'rotate' | 'slide';
  duration?: number;
  intensity?: number;
  repeat?: boolean;
  delay?: number;
}

interface MicroInteractionProps {
  children: ReactNode;
  config: MicroInteractionConfig;
  trigger?: 'mount' | 'focus' | 'press' | 'hover' | 'manual';
  isActive?: boolean;
  onAnimationComplete?: () => void;
  style?: ViewStyle;
}

// Pulse Animation Component
export const PulseAnimation: React.FC<MicroInteractionProps> = ({
  children,
  config,
  trigger = 'mount',
  isActive = false,
  onAnimationComplete,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { colors: themeColors } = useTheme();

  const startPulse = () => {
    const { duration = 1000, intensity = 0.1, repeat = true } = config;
    
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1 + intensity,
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (finished && repeat && isActive) {
        startPulse();
      } else if (finished) {
        onAnimationComplete?.();
      }
    });
  };

  useEffect(() => {
    if ((trigger === 'mount' || (trigger === 'manual' && isActive))) {
      startPulse();
    }
  }, [isActive, trigger]);

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Bounce Animation Component
export const BounceAnimation: React.FC<MicroInteractionProps> = ({
  children,
  config,
  trigger = 'mount',
  isActive = false,
  onAnimationComplete,
  style,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const startBounce = () => {
    const { duration = 600, intensity = 0.3 } = config;
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: -intensity,
        duration: duration * 0.4,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        tension: 150,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (finished) {
        onAnimationComplete?.();
      }
    });
  };

  useEffect(() => {
    if ((trigger === 'mount' || (trigger === 'manual' && isActive))) {
      startBounce();
    }
  }, [isActive, trigger]);

  return (
    <Animated.View style={[{ transform: [{ translateY: bounceAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Shake Animation Component
export const ShakeAnimation: React.FC<MicroInteractionProps> = ({
  children,
  config,
  trigger = 'mount',
  isActive = false,
  onAnimationComplete,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const startShake = () => {
    const { duration = 500, intensity = 10 } = config;
    
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -intensity,
        duration: duration / 8,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: intensity,
        duration: duration / 8,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -intensity,
        duration: duration / 8,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: intensity,
        duration: duration / 8,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (finished) {
        onAnimationComplete?.();
      }
    });
  };

  useEffect(() => {
    if ((trigger === 'mount' || (trigger === 'manual' && isActive))) {
      startShake();
    }
  }, [isActive, trigger]);

  return (
    <Animated.View style={[{ transform: [{ translateX: shakeAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Glow Animation Component
export const GlowAnimation: React.FC<MicroInteractionProps> = ({
  children,
  config,
  trigger = 'mount',
  isActive = false,
  onAnimationComplete,
  style,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { colors: themeColors } = useTheme();

  const startGlow = () => {
    const { duration = 1500, repeat = true } = config;
    
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: duration / 2,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start((finished) => {
      if (finished && repeat && isActive) {
        startGlow();
      } else if (finished) {
        onAnimationComplete?.();
      }
    });
  };

  useEffect(() => {
    if ((trigger === 'mount' || (trigger === 'manual' && isActive))) {
      startGlow();
    }
  }, [isActive, trigger]);

  return (
    <Animated.View
      style={[
        {
          shadowColor: themeColors.primary,
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          }),
          shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 20],
          }),
          elevation: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Loading Skeleton Component
interface LoadingSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const { colors: themeColors } = useTheme();

  useEffect(() => {
    const shimmer = () => {
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        shimmerAnim.setValue(-1);
        shimmer();
      });
    };

    shimmer();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width as number, width as number],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: themeColors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: themeColors.surface,
          opacity: 0.5,
          transform: [{ translateX: shimmerTranslate }],
        }}
      />
    </Animated.View>
  );
};

// Pressable with micro-interactions
interface InteractivePressableProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  pressedStyle?: ViewStyle;
  scaleIntensity?: number;
  hapticFeedback?: boolean;
}

export const InteractivePressable: React.FC<InteractivePressableProps> = ({
  children,
  onPress,
  disabled = false,
  style,
  pressedStyle,
  scaleIntensity = 0.95,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: scaleIntensity,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: handlePressIn,
    onPanResponderRelease: (event, gestureState) => {
      handlePressOut();
      if (!disabled && gestureState.dx < 10 && gestureState.dy < 10) {
        onPress();
      }
    },
    onPanResponderTerminate: handlePressOut,
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        },
        style,
        isPressed ? pressedStyle : {},
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Floating Action Button with micro-interactions
interface FloatingActionButtonProps {
  onPress: () => void;
  icon: ReactNode;
  size?: number;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  size = 56,
  backgroundColor,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { colors: themeColors, shadows } = useTheme();

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    onPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor || themeColors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: scaleAnim }, { rotate: rotation }],
          ...shadows.lg,
        },
        style,
      ]}
    >
      <InteractivePressable onPress={handlePress}>
        {icon}
      </InteractivePressable>
    </Animated.View>
  );
};

// Loading dots animation
export const LoadingDots: React.FC<{ color?: string; size?: number }> = ({
  color,
  size = 8,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const { colors: themeColors, isDark } = useTheme();

  useEffect(() => {
    const animateDots = () => {
      const animationDuration = 600;
      const animationDelay = 200;

      Animated.loop(
        Animated.stagger(animationDelay, [
          Animated.sequence([
            Animated.timing(dot1Anim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(dot1Anim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateDots();
  }, []);

  const getDotStyle = (anim: Animated.Value) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color || themeColors.primary,
    marginHorizontal: size / 4,
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Animated.View style={getDotStyle(dot1Anim)} />
      <Animated.View style={getDotStyle(dot2Anim)} />
      <Animated.View style={getDotStyle(dot3Anim)} />
    </Animated.View>
  );
};

// Micro-interaction factory function
export const createMicroInteraction = (config: MicroInteractionConfig) => {
  switch (config.type) {
    case 'pulse':
      return PulseAnimation;
    case 'bounce':
      return BounceAnimation;
    case 'shake':
      return ShakeAnimation;
    case 'glow':
      return GlowAnimation;
    default:
      return PulseAnimation;
  }
};

export default {
  PulseAnimation,
  BounceAnimation,
  ShakeAnimation,
  GlowAnimation,
  LoadingSkeleton,
  InteractivePressable,
  FloatingActionButton,
  LoadingDots,
  createMicroInteraction,
};


