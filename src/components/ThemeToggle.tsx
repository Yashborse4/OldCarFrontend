import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  withTiming, 
  interpolateColor,
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useTheme } from '../theme';

// Create an animated version of the MaterialIcons component
const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

// Define colors for sun and moon icons
const colors = {
  sun: '#FFA500',  // Orange for sun
  moon: '#6B7280', // Gray for moon
};

const ThemeToggle = () => {
  const { themeMode, toggleTheme } = useTheme();
  const progress = useSharedValue(themeMode === 'dark' ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(themeMode === 'dark' ? 1 : 0, {
      duration: 300,
    });
  }, [themeMode]);

  // Animated styles for both icons
  const sunAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      opacity: interpolate(progress.value, [0, 0.5, 1], [1, 0, 0]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [1, 0.5, 0.5]),
        },
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
        },
      ],
    };
  });

  const moonAnimatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
      transform: [
        {
          scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 0.5, 1]),
        },
        {
          rotate: `${interpolate(progress.value, [0, 1], [-180, 0])}deg`,
        },
      ],
    };
  });

  // Animated style for color interpolation
  const animatedColorStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        progress.value,
        [0, 1],
        [themeColors.sun, themeColors.moon]
      ),
    };
  });

  return (
    <Pressable onPress={toggleTheme}>
      <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedIcon
          name="wb-sunny"
          style={[sunAnimatedStyle, animatedColorStyle]}
          size={24}
        />
        <AnimatedIcon
          name="nightlight-round"
          style={[moonAnimatedStyle, animatedColorStyle]}
          size={24}
        />
      </View>
    </Pressable>
  );
};

export default ThemeToggle;



