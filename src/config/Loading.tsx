import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  DimensionValue,
} from 'react-native';


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
  height = 20,
  borderRadius = 6,
  style,
  animated = true,
  shimmer = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (shimmer && animated) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [shimmer, animated, shimmerAnim]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#F8FAFC'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 0],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const skeletonStyle: ViewStyle = {
    width: width as DimensionValue,
    height: height as DimensionValue,
    borderRadius,
    backgroundColor: animated ? undefined : '#E2E8F0',
    overflow: 'hidden',
    ...style,
  };

  if (!animated) {
    return <View style={skeletonStyle} />;
  }

  return (
    <Animated.View style={[skeletonStyle, { backgroundColor }]}>
      {shimmer && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              opacity: shimmerOpacity,
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

// Car Card Skeleton
const CarCardSkeletonComponent: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.carCardSkeleton, style]}>
      {/* Image skeleton */}
      <SkeletonComponent
        height={180}
        borderRadius={12}
        style={styles.carImageSkeleton}
      />

      <View style={styles.carContentSkeleton}>
        {/* Title */}
        <SkeletonComponent
          width="80%"
          height={18}
          style={styles.carTitleSkeleton}
        />

        {/* Subtitle */}
        <SkeletonComponent
          width="60%"
          height={14}
          style={styles.carSubtitleSkeleton}
        />

        {/* Price and details row */}
        <View style={styles.carDetailsRow}>
          <SkeletonComponent
            width="40%"
            height={16}
          />
          <SkeletonComponent
            width="30%"
            height={16}
          />
        </View>

        {/* Tags */}
        <View style={styles.carTagsRow}>
          <SkeletonComponent
            width={60}
            height={24}
            borderRadius={12}
            style={styles.carTag}
          />
          <SkeletonComponent
            width={80}
            height={24}
            borderRadius={12}
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
        width={48}
        height={48}
        borderRadius={24}
        style={styles.chatAvatar}
      />

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <SkeletonComponent
            width="60%"
            height={16}
          />
          <SkeletonComponent
            width="20%"
            height={12}
          />
        </View>

        <SkeletonComponent
          width="80%"
          height={14}
          style={styles.chatMessage}
        />
      </View>

      {/* Unread indicator */}
      <SkeletonComponent
        width={8}
        height={8}
        borderRadius={4}
      />
    </View>
  );
};

// Generic List Skeleton
const SkeletonListComponent: React.FC<SkeletonListProps> = ({
  count = 5,
  itemHeight = 80,
  showAvatar = false,
  showImage = false,
  lines = 2,
  spacing = 16,
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
                width={showImage ? 80 : 40}
                height={showImage ? 60 : 40}
                borderRadius={showAvatar ? 20 : 6}
                style={styles.skeletonItemMedia}
              />
            )}

            {/* Content */}
            <View style={styles.skeletonItemText}>
              {Array.from({ length: lines }, (_, lineIndex) => (
                <SkeletonComponent
                  key={lineIndex}
                  width={lineIndex === lines - 1 ? '60%' : '100%'}
                  height={14}
                  style={StyleSheet.flatten([
                    styles.skeletonLine,
                    lineIndex === 0 && styles.skeletonFirstLine
                  ])}
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
              ? 'rgba(0, 0, 0, 0.3)' : '#FAFBFC',
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={[styles.loadingContent, { backgroundColor: '#FFFFFF' }]}>
          <SkeletonComponent
            width={40}
            height={40}
            borderRadius={20}
            animated
            style={styles.loadingSpinner}
          />
          {text && (
            <SkeletonComponent
              width={100}
              height={16}
              style={styles.loadingText}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  // Car Card Skeleton
  carCardSkeleton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  carImageSkeleton: {
    marginBottom: 8,
  },
  carContentSkeleton: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  carTitleSkeleton: {
    marginBottom: 4,
  },
  carSubtitleSkeleton: {
    marginBottom: 8,
  },
  carDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carTagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  carTag: {
    marginRight: 4,
  },

  // Chat Item Skeleton
  chatItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatAvatar: {
    marginRight: 8,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatMessage: {
    marginTop: 4,
  },

  // Generic List Skeleton
  skeletonList: {
    paddingHorizontal: 16,
  },
  skeletonListItem: {
    backgroundColor: 'transparent',
  },
  skeletonItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonItemMedia: {
    marginRight: 8,
  },
  skeletonItemText: {
    flex: 1,
  },
  skeletonLine: {
    marginBottom: 4,
  },
  skeletonFirstLine: {
    height: 16,
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
    padding: 24,
    borderRadius: 12,
    elevation: 5,

  },
  loadingSpinner: {
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 8,
  },

});

// Memoized exports
export const Skeleton = memo(SkeletonComponent);
export const CarCardSkeleton = memo(CarCardSkeletonComponent);
export const ChatItemSkeleton = memo(ChatItemSkeletonComponent);
export const SkeletonList = memo(SkeletonListComponent);
export const LoadingOverlay = memo(LoadingOverlayComponent);

// Display names
Skeleton.displayName = 'Skeleton';
CarCardSkeleton.displayName = 'CarCardSkeleton';
ChatItemSkeleton.displayName = 'ChatItemSkeleton';
SkeletonList.displayName = 'SkeletonList';
LoadingOverlay.displayName = 'LoadingOverlay';

export default Skeleton;


