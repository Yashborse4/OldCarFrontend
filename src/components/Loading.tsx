/**
 * Loading Components with Skeleton Screens
 * Provides comprehensive loading states for better user experience
 */

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS, 
  getResponsiveValue,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
  shimmer?: boolean;
}

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  spacing?: number;
}

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  transparent?: boolean;
  children?: React.ReactNode;
}

// Basic Skeleton Component
const SkeletonComponent: React.FC<SkeletonProps> = ({
  width = '100%',
  height = scale(20),
  borderRadius = RESPONSIVE_DIMENSIONS.borderRadius.small,
  style,
  animated = true,
  shimmer = true,
}) => {
  const { colors, isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [animated, animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? '#2D2D2D' : '#E5E7EB',
      isDark ? '#3D3D3D' : '#F3F4F6'
    ],
  });

  const skeletonStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: animated ? undefined : (isDark ? '#2D2D2D' : '#E5E7EB'),
    overflow: 'hidden',
    ...style,
  };

  if (!animated) {
    return <View style={skeletonStyle} />;
  }

  return (
    <Animated.View style={[skeletonStyle, { backgroundColor }]}>
      {shimmer && (
        <LinearGradient
          colors={[
            'transparent',
            isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
            'transparent'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </Animated.View>
  );
};

// Car Card Skeleton
const CarCardSkeletonComponent: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { deviceInfo } = useResponsive();
  
  const cardWidth = getResponsiveValue({
    small: '100%',
    tablet: '48%',
    default: '100%'
  });

  return (
    <View style={[styles.carCardSkeleton, { width: cardWidth }, style]}>
      {/* Image skeleton */}
      <SkeletonComponent
        height={scale(180)}
        borderRadius={RESPONSIVE_DIMENSIONS.borderRadius.medium}
        style={styles.carImageSkeleton}
      />
      
      <View style={styles.carContentSkeleton}>
        {/* Title */}
        <SkeletonComponent
          width="80%"
          height={scale(18)}
          style={styles.carTitleSkeleton}
        />
        
        {/* Subtitle */}
        <SkeletonComponent
          width="60%"
          height={scale(14)}
          style={styles.carSubtitleSkeleton}
        />
        
        {/* Price and details row */}
        <View style={styles.carDetailsRow}>
          <SkeletonComponent
            width="40%"
            height={scale(16)}
          />
          <SkeletonComponent
            width="30%"
            height={scale(16)}
          />
        </View>
        
        {/* Tags */}
        <View style={styles.carTagsRow}>
          <SkeletonComponent
            width={scale(60)}
            height={scale(24)}
            borderRadius={scale(12)}
            style={styles.carTag}
          />
          <SkeletonComponent
            width={scale(80)}
            height={scale(24)}
            borderRadius={scale(12)}
            style={styles.carTag}
          />
        </View>
      </View>
    </View>
  );
};

// Chat Item Skeleton
const ChatItemSkeletonComponent: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.chatItemSkeleton, style]}>
      {/* Avatar */}
      <SkeletonComponent
        width={scale(48)}
        height={scale(48)}
        borderRadius={scale(24)}
        style={styles.chatAvatar}
      />
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <SkeletonComponent
            width="60%"
            height={scale(16)}
          />
          <SkeletonComponent
            width="20%"
            height={scale(12)}
          />
        </View>
        
        <SkeletonComponent
          width="80%"
          height={scale(14)}
          style={styles.chatMessage}
        />
      </View>
      
      {/* Unread indicator */}
      <SkeletonComponent
        width={scale(8)}
        height={scale(8)}
        borderRadius={scale(4)}
      />
    </View>
  );
};

// Generic List Skeleton
const SkeletonListComponent: React.FC<SkeletonListProps> = ({
  count = 5,
  itemHeight = scale(80),
  showAvatar = false,
  showImage = false,
  lines = 2,
  spacing = SPACING.md,
}) => {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <View style={styles.skeletonList}>
      {items.map((index) => (
        <View key={index} style={[styles.skeletonListItem, { marginBottom: spacing }]}>
          <View style={styles.skeletonItemContent}>
            {/* Avatar or Image */}
            {(showAvatar || showImage) && (
              <SkeletonComponent
                width={showImage ? scale(80) : scale(40)}
                height={showImage ? scale(60) : scale(40)}
                borderRadius={showAvatar ? scale(20) : RESPONSIVE_DIMENSIONS.borderRadius.small}
                style={styles.skeletonItemMedia}
              />
            )}
            
            {/* Content */}
            <View style={styles.skeletonItemText}>
              {Array.from({ length: lines }, (_, lineIndex) => (
                <SkeletonComponent
                  key={lineIndex}
                  width={lineIndex === lines - 1 ? '60%' : '100%'}
                  height={scale(14)}
                  style={[
                    styles.skeletonLine,
                    lineIndex === 0 && styles.skeletonFirstLine
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Loading Overlay
const LoadingOverlayComponent: React.FC<LoadingOverlayProps> = ({
  visible,
  text = 'Loading...',
  transparent = false,
  children,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return <>{children}</>;

  return (
    <View style={styles.overlayContainer}>
      {children}
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: transparent 
              ? 'rgba(0, 0, 0, 0.3)' 
              : colors.background,
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={[styles.loadingContent, { backgroundColor: colors.surface }]}>
          <SkeletonComponent
            width={scale(40)}
            height={scale(40)}
            borderRadius={scale(20)}
            animated={true}
            style={styles.loadingSpinner}
          />
          {text && (
            <SkeletonComponent
              width={scale(100)}
              height={scale(16)}
              style={styles.loadingText}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// Dashboard Skeleton
const DashboardSkeletonComponent: React.FC = () => {
  const { deviceInfo } = useResponsive();
  
  return (
    <View style={styles.dashboardSkeleton}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <SkeletonComponent
          width="60%"
          height={scale(24)}
          style={styles.dashboardTitle}
        />
        <SkeletonComponent
          width={scale(40)}
          height={scale(40)}
          borderRadius={scale(20)}
        />
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.statCard}>
            <SkeletonComponent
              width="100%"
              height={scale(60)}
              borderRadius={RESPONSIVE_DIMENSIONS.borderRadius.medium}
            />
          </View>
        ))}
      </View>
      
      {/* Chart */}
      <SkeletonComponent
        height={scale(200)}
        borderRadius={RESPONSIVE_DIMENSIONS.borderRadius.medium}
        style={styles.chartSkeleton}
      />
      
      {/* List */}
      <SkeletonListComponent
        count={3}
        showImage={true}
        lines={2}
        spacing={SPACING.sm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Car Card Skeleton
  carCardSkeleton: {
    backgroundColor: 'transparent',
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  carImageSkeleton: {
    marginBottom: SPACING.sm,
  },
  carContentSkeleton: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  carTitleSkeleton: {
    marginBottom: SPACING.xs,
  },
  carSubtitleSkeleton: {
    marginBottom: SPACING.sm,
  },
  carDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  carTagsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  carTag: {
    marginRight: SPACING.xs,
  },

  // Chat Item Skeleton
  chatItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chatAvatar: {
    marginRight: SPACING.sm,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  chatMessage: {
    marginTop: SPACING.xs,
  },

  // Generic List Skeleton
  skeletonList: {
    paddingHorizontal: SPACING.md,
  },
  skeletonListItem: {
    backgroundColor: 'transparent',
  },
  skeletonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonItemMedia: {
    marginRight: SPACING.sm,
  },
  skeletonItemText: {
    flex: 1,
  },
  skeletonLine: {
    marginBottom: SPACING.xs,
  },
  skeletonFirstLine: {
    height: scale(16),
  },

  // Loading Overlay
  overlayContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingSpinner: {
    marginBottom: SPACING.sm,
  },
  loadingText: {
    marginTop: SPACING.sm,
  },

  // Dashboard Skeleton
  dashboardSkeleton: {
    padding: SPACING.md,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dashboardTitle: {
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    width: '22%',
    minWidth: scale(80),
  },
  chartSkeleton: {
    marginBottom: SPACING.lg,
  },
});

// Memoized exports
export const Skeleton = memo(withPerformanceTracking(SkeletonComponent, 'Skeleton'));
export const CarCardSkeleton = memo(withPerformanceTracking(CarCardSkeletonComponent, 'CarCardSkeleton'));
export const ChatItemSkeleton = memo(withPerformanceTracking(ChatItemSkeletonComponent, 'ChatItemSkeleton'));
export const SkeletonList = memo(withPerformanceTracking(SkeletonListComponent, 'SkeletonList'));
export const LoadingOverlay = memo(withPerformanceTracking(LoadingOverlayComponent, 'LoadingOverlay'));
export const DashboardSkeleton = memo(withPerformanceTracking(DashboardSkeletonComponent, 'DashboardSkeleton'));

// Display names
Skeleton.displayName = 'Skeleton';
CarCardSkeleton.displayName = 'CarCardSkeleton';
ChatItemSkeleton.displayName = 'ChatItemSkeleton';
SkeletonList.displayName = 'SkeletonList';
LoadingOverlay.displayName = 'LoadingOverlay';
DashboardSkeleton.displayName = 'DashboardSkeleton';

export default Skeleton;
