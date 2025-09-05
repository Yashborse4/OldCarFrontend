/**
 * Optimized Image Component with Lazy Loading and Caching
 * Provides performance optimizations for image rendering
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageStyle,
  ViewStyle,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useTheme } from '../theme';
import { SPACING, scale, FONT_SIZES } from '../utils/responsive';
import { MemoryManager, useOptimizedCallback } from '../utils/performance';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  // Source can be URI string or ImageProps source
  source: string | ImageProps['source'];
  
  // Styling
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  
  // Lazy loading
  lazy?: boolean;
  threshold?: number; // Distance from viewport to start loading
  
  // Caching
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  
  // Placeholder and loading
  placeholder?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  
  // Performance
  priority?: 'low' | 'normal' | 'high';
  preload?: boolean;
  
  // Animation
  fadeIn?: boolean;
  fadeDuration?: number;
  
  // Resize options
  resizeMode?: ImageProps['resizeMode'];
  blurRadius?: number;
  
  // Event callbacks
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onProgress?: (loaded: number, total: number) => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Quality options
  quality?: 'low' | 'medium' | 'high';
  
  // Fallback image
  fallbackSource?: ImageProps['source'];
}

interface ImageState {
  isLoading: boolean;
  hasError: boolean;
  isLoaded: boolean;
  loadProgress: number;
}

/**
 * Image cache management
 */
class ImageCache {
  private static cache = new Map<string, {
    uri: string;
    timestamp: number;
    size?: number;
  }>();
  
  private static maxCacheSize = 50; // Max number of cached images
  
  static set(key: string, uri: string, size?: number): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      uri,
      timestamp: Date.now(),
      size,
    });
  }
  
  static get(key: string): string | null {
    const entry = this.cache.get(key);
    return entry ? entry.uri : null;
  }
  
  static clear(): void {
    this.cache.clear();
  }
  
  static getStats(): {
    count: number;
    maxSize: number;
  } {
    return {
      count: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

/**
 * Main OptimizedImage component
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  containerStyle,
  lazy = true,
  threshold = 100,
  cache = true,
  cacheKey,
  cacheDuration = 30 * 60 * 1000, // 30 minutes
  placeholder,
  loadingComponent,
  errorComponent,
  priority = 'normal',
  preload = false,
  fadeIn = true,
  fadeDuration = 300,
  resizeMode = 'cover',
  blurRadius,
  onLoadStart,
  onLoad,
  onError,
  onProgress,
  accessibilityLabel,
  accessibilityHint,
  quality = 'medium',
  fallbackSource,
  ...imageProps
}) => {
  const { colors } = useTheme();
  const [state, setState] = useState<ImageState>({
    isLoading: false,
    hasError: false,
    isLoaded: false,
    loadProgress: 0,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const viewRef = useRef<View>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy || preload);
  
  // Generate cache key
  const imageCacheKey = cacheKey || (typeof source === 'string' ? source : 'image_' + Date.now());
  
  // Get image URI
  const imageUri = typeof source === 'string' ? source : (source as any)?.uri;
  
  // Quality adjustments based on device
  const getQualityParams = useOptimizedCallback(() => {
    const qualityMap = {
      low: { quality: 0.3, format: 'jpg' },
      medium: { quality: 0.7, format: 'jpg' },
      high: { quality: 0.9, format: 'jpg' },
    };
    
    return qualityMap[quality];
  }, [quality]);
  
  // Intersection observer for lazy loading (simulated)
  const checkVisibility = useOptimizedCallback(() => {
    if (!lazy || shouldLoad) return;
    
    // Simple visibility check
    // In a real implementation, you'd use react-native-intersection-observer
    setShouldLoad(true);
  }, [lazy, shouldLoad]);
  
  // Handle image loading start
  const handleLoadStart = useOptimizedCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));
    
    onLoadStart?.();
  }, [onLoadStart]);
  
  // Handle image load success
  const handleLoad = useOptimizedCallback((event: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      isLoaded: true,
      hasError: false,
    }));
    
    // Cache the image
    if (cache && imageUri) {
      ImageCache.set(imageCacheKey, imageUri, event?.nativeEvent?.source?.width);
    }
    
    // Fade in animation
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
    
    onLoad?.();
  }, [cache, imageUri, imageCacheKey, fadeIn, fadeDuration, onLoad]);
  
  // Handle image load error
  const handleError = useOptimizedCallback((error: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
    }));
    
    console.warn('Image load failed:', imageUri, error);
    onError?.(error);
  }, [imageUri, onError]);
  
  // Handle load progress
  const handleProgress = useOptimizedCallback((event: any) => {
    const { loaded, total } = event.nativeEvent;
    const progress = total > 0 ? (loaded / total) * 100 : 0;
    
    setState(prev => ({
      ...prev,
      loadProgress: progress,
    }));
    
    onProgress?.(loaded, total);
  }, [onProgress]);
  
  // Preload image if needed
  useEffect(() => {
    if (preload && imageUri) {
      Image.prefetch(imageUri);
    }
  }, [preload, imageUri]);
  
  // Check visibility on mount for lazy loading
  useEffect(() => {
    if (lazy && !shouldLoad) {
      // Simulate intersection observer
      const timer = setTimeout(checkVisibility, 100);
      return () => clearTimeout(timer);
    }
  }, [lazy, shouldLoad, checkVisibility]);
  
  // Get image source with optimizations
  const getOptimizedSource = useOptimizedCallback((): ImageProps['source'] => {
    if (!imageUri) return source as ImageProps['source'];
    
    // Check cache first
    if (cache) {
      const cachedUri = ImageCache.get(imageCacheKey);
      if (cachedUri) {
        return { uri: cachedUri };
      }
    }
    
    // Return original source
    if (typeof source === 'string') {
      return { uri: source };
    }
    
    return source as ImageProps['source'];
  }, [source, imageUri, cache, imageCacheKey]);
  
  // Loading component
  const renderLoading = () => {
    if (loadingComponent) return loadingComponent;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="small" 
          color={colors.primary}
          style={styles.loader}
        />
        {state.loadProgress > 0 && (
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {Math.round(state.loadProgress)}%
          </Text>
        )}
      </View>
    );
  };
  
  // Error component
  const renderError = () => {
    if (errorComponent) return errorComponent;
    
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Failed to load image
        </Text>
      </View>
    );
  };
  
  // Placeholder component
  const renderPlaceholder = () => {
    if (placeholder) return placeholder;
    
    return (
      <View style={[styles.placeholderContainer, { backgroundColor: colors.surface }]} />
    );
  };
  
  // Don't render if lazy loading and shouldn't load yet
  if (lazy && !shouldLoad) {
    return (
      <View ref={viewRef} style={[styles.container, containerStyle]}>
        {renderPlaceholder()}
      </View>
    );
  }
  
  // Show error state
  if (state.hasError && !fallbackSource) {
    return (
      <View style={[styles.container, containerStyle]}>
        {renderError()}
      </View>
    );
  }
  
  // Get final image source (with fallback if error occurred)
  const finalSource = state.hasError && fallbackSource 
    ? fallbackSource 
    : getOptimizedSource();
  
  return (
    <View style={[styles.container, containerStyle]} ref={viewRef}>
      {/* Placeholder/Loading layer */}
      {(!state.isLoaded || state.isLoading) && (
        <View style={StyleSheet.absoluteFill}>
          {state.isLoading ? renderLoading() : renderPlaceholder()}
        </View>
      )}
      
      {/* Actual image */}
      <Animated.Image
        {...imageProps}
        source={finalSource}
        style={[
          style,
          {
            opacity: fadeIn ? fadeAnim : 1,
          },
        ]}
        resizeMode={resizeMode}
        blurRadius={blurRadius}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        onProgress={handleProgress}
        accessible={true}
        accessibilityLabel={accessibilityLabel || 'Image'}
        accessibilityHint={accessibilityHint}
        // Performance optimizations
        fadeDuration={0} // Disable default fade, we use custom
        {...(Platform.OS === 'android' && {
          progressiveRenderingEnabled: true,
          borderRadius: (style as any)?.borderRadius || 0,
        })}
      />
    </View>
  );
});

// Fast image component for critical images
export const FastImage: React.FC<OptimizedImageProps> = memo((props) => (
  <OptimizedImage
    {...props}
    lazy={false}
    preload={true}
    priority="high"
    cache={true}
  />
));

// Lazy image component for lists
export const LazyImage: React.FC<OptimizedImageProps> = memo((props) => (
  <OptimizedImage
    {...props}
    lazy={true}
    priority="low"
    fadeIn={true}
  />
));

// Avatar image with circular styling
export const AvatarImage: React.FC<OptimizedImageProps & {
  size?: number;
}> = memo(({ size = 40, style, ...props }) => {
  const avatarSize = scale(size);
  
  return (
    <OptimizedImage
      {...props}
      style={[
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
      lazy={false}
      cache={true}
      resizeMode="cover"
    />
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loader: {
    marginBottom: SPACING.xs,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#E5E5E5',
  },
});

OptimizedImage.displayName = 'OptimizedImage';
FastImage.displayName = 'FastImage';
LazyImage.displayName = 'LazyImage';
AvatarImage.displayName = 'AvatarImage';

export { ImageCache };
export default OptimizedImage;
