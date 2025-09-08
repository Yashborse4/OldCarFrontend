import React, { useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius, typography, shadows } from '../../design-system/tokens';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  route: string;
  badge?: number;
  isNew?: boolean;
}

interface BottomNavigationProps {
  items: NavigationItem[];
  activeRoute: string;
  onPress: (route: string, item: NavigationItem) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeRoute,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});

  // Initialize animations for each item
  items.forEach((item) => {
    if (!animationRefs.current[item.id]) {
      animationRefs.current[item.id] = new Animated.Value(
        activeRoute === item.route ? 1 : 0
      );
    }
  });

  const handlePress = useCallback((item: NavigationItem) => {
    // Animate the pressed item
    Object.keys(animationRefs.current).forEach((key) => {
      Animated.timing(animationRefs.current[key], {
        toValue: key === item.id ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: false,
      }).start();
    });

    onPress(item.route, item);
  }, [onPress]);

  const renderNavItem = useCallback((item: NavigationItem, index: number) => {
    const isActive = activeRoute === item.route;
    const animationValue = animationRefs.current[item.id];

    // Animated styles
    const indicatorScale = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const iconTranslateY = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -4],
    });

    const labelOpacity = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
    });

    const backgroundOpacity = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.12],
    });

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.navItem}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        {/* Background indicator */}
        <Animated.View
          style={[
            styles.activeBackground,
            {
              backgroundColor: themeColors.primary,
              opacity: backgroundOpacity,
              transform: [{ scale: indicatorScale }],
            },
          ]}
        />

        {/* Icon container with animation */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ translateY: iconTranslateY }],
            },
          ]}
        >
          <MaterialIcons
            name={item.icon as any}
            size={24}
            color={isActive ? themeColors.primary : themeColors.textSecondary}
          />
          
          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <View style={[styles.badge, { backgroundColor: themeColors.error }]}>
              <Text style={styles.badgeText}>
                {item.badge > 99 ? '99+' : item.badge.toString()}
              </Text>
            </View>
          )}

          {/* New indicator */}
          {item.isNew && (
            <View style={[styles.newDot, { backgroundColor: themeColors.error }]} />
          )}
        </Animated.View>

        {/* Label with fade animation */}
        <Animated.Text
          style={[
            styles.navLabel,
            {
              color: isActive ? themeColors.primary : themeColors.textSecondary,
              opacity: labelOpacity,
              fontWeight: isActive 
                ? typography.fontWeights.semibold 
                : typography.fontWeights.medium,
            },
          ]}
        >
          {item.label}
        </Animated.Text>

        {/* Active indicator dot */}
        {isActive && (
          <Animated.View
            style={[
              styles.activeDot,
              {
                backgroundColor: themeColors.primary,
                transform: [{ scale: indicatorScale }],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  }, [activeRoute, colors, handlePress]);

  return (
    <View style={styles.container}>
      {/* Glass morphism background for iOS, solid for Android */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={20}
          reducedTransparencyFallbackColor={themeColors.surface}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: themeColors.surface },
          ]}
        />
      )}

      {/* Navigation items */}
      <View style={styles.navContainer}>
        {items.map((item, index) => renderNavItem(item, index))}
      </View>

      {/* Top border */}
      <LinearGradient
        colors={[
          'transparent',
          isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBorder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  navContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg + spacing.md : spacing.lg,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
    minHeight: 60,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: spacing.sm,
    right: spacing.sm,
    bottom: 0,
    borderRadius: borderRadius.lg,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#FFFFFF',
  },
  newDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  navLabel: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.wide,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});

export default BottomNavigation;


