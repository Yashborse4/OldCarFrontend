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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Gradient } from './Gradient';
import { useTheme } from '../../theme';

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
  accessibilityLabel?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeRoute,
  onPress,
  accessibilityLabel,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
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
              backgroundColor: colors.primary,
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
          <Ionicons
            name={item.icon as any}
            size={24}
            color={isActive ? colors.primary : colors.textSecondary}
          />

          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={styles.badgeText}>
                {item.badge > 99 ? '99+' : item.badge.toString()}
              </Text>
            </View>
          )}

          {/* New indicator */}
          {item.isNew && (
            <View style={[styles.newDot, { backgroundColor: colors.error }]} />
          )}
        </Animated.View>

        {/* Label with fade animation */}
        <Animated.Text
          style={[
            styles.navLabel,
            {
              color: isActive ? colors.primary : colors.textSecondary,
              opacity: labelOpacity,
              fontWeight: isActive ? '600' : '500',
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
                backgroundColor: colors.primary,
                transform: [{ scale: indicatorScale }],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  }, [activeRoute, handlePress, colors.primary, colors.textSecondary, colors.error]);

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Background */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.surface },
        ]}
      />

      {/* Navigation items */}
      <View style={styles.navContainer}>
        {items.map((item, index) => renderNavItem(item, index))}
      </View>

      {/* Top border */}
      <Gradient colors={[
        'transparent',
        'rgba(0, 0, 0, 0.05)',
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
    elevation: 8,

    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  navContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
    minHeight: 60,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    bottom: 0,
    borderRadius: 12,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navLabel: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
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


