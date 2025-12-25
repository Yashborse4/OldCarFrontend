/**
 * Advanced Navigation Components
 * Provides enhanced navigation solutions with tab bars, headers, and navigation helpers
 */

import React, {
  memo,
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scale,
  SPACING,
  FONT_SIZES,
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';
import { useTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab Bar Item Interface
export interface TabBarItem {
  key: string;
  title: string;
  icon?: string;
  activeIcon?: string;
  badge?: number | string;
  disabled?: boolean;
}

// Custom Tab Bar Props
interface CustomTabBarProps {
  items: TabBarItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
  variant?: 'bottom' | 'top' | 'segmented';
  showLabels?: boolean;
  showIcons?: boolean;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  labelStyle?: TextStyle;
  iconSize?: number;
  animated?: boolean;

  // Badge
  badgeColor?: string;
  badgeTextColor?: string;

  // Background
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
}

// Custom Tab Bar Component
const CustomTabBarComponent: React.FC<CustomTabBarProps> = ({
  items,
  activeTab,
  onTabPress,
  variant = 'bottom',
  showLabels = true,
  showIcons = true,
  style,
  tabStyle,
  labelStyle,
  iconSize = 24,
  animated = true,
  badgeColor,
  badgeTextColor,
  backgroundColor,
  activeColor,
  inactiveColor,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(items.map(() => new Animated.Value(1))).current;

  const finalBadgeColor = badgeColor || colors.error;
  const finalBadgeTextColor = badgeTextColor || colors.onError;
  const finalActiveColor = activeColor || colors.primary;
  const finalInactiveColor = inactiveColor || colors.textSecondary;

  // Calculate active tab index and animate indicator
  useEffect(() => {
    const activeIndex = items.findIndex(item => item.key === activeTab);
    if (activeIndex >= 0 && animated) {
      Animated.spring(slideAnim, {
        toValue: activeIndex,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [activeTab, items, slideAnim, animated]);

  // Handle tab press with animation
  const handleTabPress = useCallback((item: TabBarItem, index: number) => {
    if (item.disabled) return;

    if (animated) {
      // Scale animation for pressed tab
      Animated.sequence([
        Animated.timing(scaleAnims[index], {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[index], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onTabPress(item.key);
  }, [animated, scaleAnims, onTabPress]);

  // Get container styles based on variant
  const getContainerStyles = useCallback((): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: backgroundColor || colors.surface,
    };

    switch (variant) {
      case 'bottom':
        return {
          ...baseStyle,
          paddingBottom: insets.bottom,
          paddingTop: SPACING.sm,
          elevation: 8,

        };

      case 'top':
        return {
          ...baseStyle,
          paddingTop: insets.top + SPACING.sm,
          paddingBottom: SPACING.sm,
          elevation: 4,

        };

      case 'segmented':
        return {
          ...baseStyle,
          margin: SPACING.md,
          borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.large,
          padding: SPACING.xs / 2,
          elevation: 2,

        };

      default:
        return baseStyle;
    }
  }, [variant, backgroundColor, colors.surface, insets]);

  // Render tab badge
  const renderBadge = useCallback((badge?: number | string) => {
    if (!badge) return null;

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: finalBadgeColor,
            minWidth: typeof badge === 'string' ? scale(20) : scale(16),
            height: typeof badge === 'string' ? scale(20) : scale(16),
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: finalBadgeTextColor,
              fontSize: typeof badge === 'string' ? FONT_SIZES.xs : scale(10),
            },
          ]}
          numberOfLines={1}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : String(badge)}
        </Text>
      </View>
    );
  }, [finalBadgeColor, finalBadgeTextColor]);

  // Render individual tab
  const renderTab = useCallback((item: TabBarItem, index: number) => {
    const isActive = item.key === activeTab;
    const iconColor = item.disabled
      ? colors.textDisabled
      : isActive
        ? finalActiveColor
        : finalInactiveColor;

    const labelColor = item.disabled
      ? colors.textDisabled
      : isActive
        ? finalActiveColor
        : finalInactiveColor;

    const iconName = isActive && item.activeIcon ? item.activeIcon : item.icon;

    return (
      <Animated.View
        key={item.key}
        style={[
          styles.tab,
          variant === 'segmented' && styles.segmentedTab,
          tabStyle,
          {
            transform: [{ scale: scaleAnims[index] }],
            opacity: item.disabled ? 0.5 : 1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleTabPress(item, index)}
          style={styles.tabButton}
          disabled={item.disabled}
          accessible
          accessibilityRole="tab"
          accessibilityLabel={item.title}
          accessibilityState={{ selected: isActive, disabled: item.disabled }}
        >
          {/* Tab Icon */}
          {showIcons && iconName && (
            <View style={styles.tabIconContainer}>
              <Ionicons
                name={iconName as any}
                size={scale(iconSize)}
                color={iconColor}
              />
              {renderBadge(item.badge)}
            </View>
          )}

          {/* Tab Label */}
          {showLabels && (
            <Text
              style={[
                styles.tabLabel,
                {
                  color: labelColor,
                  fontSize: variant === 'segmented' ? FONT_SIZES.sm : FONT_SIZES.xs,
                  fontWeight: isActive ? '600' : '500',
                },
                labelStyle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [
    activeTab,
    colors.textDisabled,
    finalActiveColor,
    finalInactiveColor,
    variant,
    tabStyle,
    scaleAnims,
    handleTabPress,
    showIcons,
    iconSize,
    renderBadge,
    showLabels,
    labelStyle,
  ]);

  // Render sliding indicator for segmented variant
  const renderIndicator = useCallback(() => {
    if (variant !== 'segmented' || !animated) return null;

    const indicatorWidth = SCREEN_WIDTH / items.length - SPACING.md;
    const translateX = slideAnim.interpolate({
      inputRange: items.map((_, index) => index),
      outputRange: items.map((_, index) => index * indicatorWidth),
    });

    return (
      <Animated.View
        style={[
          styles.segmentedIndicator,
          {
            backgroundColor: finalActiveColor,
            width: indicatorWidth - SPACING.xs,
            transform: [{ translateX }],
          },
        ]}
      />
    );
  }, [variant, animated, slideAnim, items, finalActiveColor]);

  return (
    <View style={[getContainerStyles(), style]}>
      {/* Sliding Indicator for Segmented */}
      {renderIndicator()}

      {/* Tabs Container */}
      <View style={styles.tabsContainer}>
        {items.map(renderTab)}
      </View>
    </View>
  );
};

// Header Component Props
interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;

  // Actions
  onBackPress?: () => void;
  onMenuPress?: () => void;

  // Styling
  style?: ViewStyle;
  titleStyle?: TextStyle;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';

  // Features
  showBackButton?: boolean;
  showMenuButton?: boolean;
  transparent?: boolean;

  // Search
  searchable?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

// Custom Header Component
const CustomHeaderComponent: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  centerComponent,
  onBackPress,
  onMenuPress,
  style,
  titleStyle,
  backgroundColor,
  statusBarStyle,
  showBackButton = false,
  showMenuButton = false,
  transparent = false,
  searchable = false,
  searchQuery = '',
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [isSearchActive, setIsSearchActive] = useState(false);

  const finalBackgroundColor = backgroundColor || (transparent ? 'transparent' : colors.surface);

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true);
    onSearchFocus?.();
  }, [onSearchFocus]);

  const handleSearchBlur = useCallback(() => {
    setIsSearchActive(false);
    onSearchBlur?.();
  }, [onSearchBlur]);

  const renderLeftComponent = useCallback(() => {
    if (leftComponent) return leftComponent;

    if (showBackButton) {
      return (
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.headerAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="arrow-back"
            size={scale(24)}
            color={colors.text}
          />
        </TouchableOpacity>
      );
    }

    if (showMenuButton) {
      return (
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.headerAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="menu"
            size={scale(24)}
            color={colors.text}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.headerAction} />;
  }, [leftComponent, showBackButton, showMenuButton, onBackPress, onMenuPress, colors.text]);

  const renderCenterComponent = useCallback(() => {
    if (centerComponent) return centerComponent;

    if (searchable && isSearchActive) {
      // Dynamic import to avoid circular dependency
      const { SearchInput } = require('./Input');

      return (
        <View style={styles.searchContainer}>
          <SearchInput
            value={searchQuery}
            onChangeText={onSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Search..."
            containerStyle={styles.searchInput}
            variant="filled"
          />
        </View>
      );
    }

    return (
      <View style={styles.headerCenter}>
        {title && (
          <Text
            style={[
              styles.headerTitle,
              { color: colors.text },
              titleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  }, [
    centerComponent,
    searchable,
    isSearchActive,
    searchQuery,
    onSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    title,
    subtitle,
    colors.text,
    colors.textSecondary,
    titleStyle,
  ]);

  const renderRightComponent = useCallback(() => {
    if (rightComponent) return rightComponent;

    if (searchable && !isSearchActive) {
      return (
        <TouchableOpacity
          onPress={handleSearchFocus}
          style={styles.headerAction}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="search"
            size={scale(24)}
            color={colors.text}
          />
        </TouchableOpacity>
      );
    }

    return <View style={styles.headerAction} />;
  }, [rightComponent, searchable, isSearchActive, handleSearchFocus, colors.text]);

  return (
    <SafeAreaView style={styles.headerSafeArea}>
      <StatusBar
        barStyle={statusBarStyle || 'dark-content'}
        backgroundColor={transparent ? 'transparent' : finalBackgroundColor}
        translucent={transparent}
      />
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: finalBackgroundColor,
            paddingTop: transparent ? insets.top + SPACING.sm : SPACING.sm,
            minHeight: scale(56) + (transparent ? insets.top : 0),
          },
          style,
        ]}
      >
        <View style={styles.headerContent}>
          {renderLeftComponent()}
          {renderCenterComponent()}
          {renderRightComponent()}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Floating Action Button Props
interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  title?: string;
  style?: ViewStyle;
  backgroundColor?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  disabled?: boolean;
  loading?: boolean;
}

// Floating Action Button Component
const FloatingActionButtonComponent: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  title,
  style,
  backgroundColor,
  color,
  size = 'medium',
  position = 'bottom-right',
  disabled = false,
  loading = false,
}) => {
  const colors = {
    text: '#1A202C',
    textSecondary: '#4A5568',
    textDisabled: '#9CA3AF',
    primary: '#FFD700',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    onPrimary: '#000000',
    surfaceDisabled: '#F5F5F5'
  };
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const finalBackgroundColor = backgroundColor || colors.primary;
  const finalColor = color || colors.onPrimary;

  const buttonSize = {
    small: scale(48),
    medium: scale(56),
    large: scale(64),
  }[size];

  const iconSizeMap = {
    small: 20,
    medium: 24,
    large: 28,
  }[size];

  const getPositionStyles = useCallback((): ViewStyle => {
    const bottom = insets.bottom + SPACING.lg;

    switch (position) {
      case 'bottom-left':
        return { position: 'absolute', bottom, left: SPACING.lg };
      case 'bottom-center':
        return { position: 'absolute', bottom, alignSelf: 'center' };
      case 'bottom-right':
      default:
        return { position: 'absolute', bottom, right: SPACING.lg };
    }
  }, [position, insets]);

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    }
  }, [disabled, scaleAnim]);

  return (
    <Animated.View
      style={[
        getPositionStyles(),
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.fab,
          {
            backgroundColor: disabled ? colors.surfaceDisabled : finalBackgroundColor,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={title || 'Floating action button'}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <Ionicons
            name="hourglass-empty"
            size={scale(iconSizeMap)}
            color={finalColor}
          />
        ) : (
          <Ionicons
            name={icon as any}
            size={scale(iconSizeMap)}
            color={finalColor}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Tab Bar Styles
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedTab: {
    marginHorizontal: SPACING.xs / 2,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    minHeight: scale(48),
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: SPACING.xs / 2,
  },
  tabLabel: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -scale(6),
    right: -scale(6),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  badgeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentedIndicator: {
    position: 'absolute',
    height: scale(36),
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    top: SPACING.xs / 2,
    left: SPACING.xs / 2,
    zIndex: -1,
  },

  // Header Styles
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerContainer: {
    elevation: 4,

  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerAction: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.xs / 2,
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  searchInput: {
    marginBottom: 0,
  },

  // FAB Styles
  fab: {
    elevation: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Memoized exports
export const CustomTabBar = memo(withPerformanceTracking(CustomTabBarComponent, 'CustomTabBar'));
export const CustomHeader = memo(withPerformanceTracking(CustomHeaderComponent, 'CustomHeader'));
export const FloatingActionButton = memo(withPerformanceTracking(FloatingActionButtonComponent, 'FloatingActionButton'));

// Display names
CustomTabBar.displayName = 'CustomTabBar';
CustomHeader.displayName = 'CustomHeader';
FloatingActionButton.displayName = 'FloatingActionButton';

// Export types
export type { CustomTabBarProps, HeaderProps, FloatingActionButtonProps };

export default CustomTabBar;


