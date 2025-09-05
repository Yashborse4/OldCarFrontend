/**
 * Optimized Image Component with Lazy Loading and Caching
 * Provides performance optimizations for image rendering
 */

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
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
  Dimensions,
  Pressable,
} from 'react-native';
import FastImage, { FastImageProps, Source, Priority, ResizeMode } from 'react-native-fast-image';
import { useTheme } from '../theme';
import { SPACING, scale, FONT_SIZES, DIMENSIONS as RESPONSIVE_DIMENSIONS } from '../utils/responsive';
import { MemoryManager, useOptimizedCallback, withPerformanceTracking } from '../utils/performance';
import { Skeleton } from './Loading';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  // Source can be URI string or ImageProps source
  source: string | ImageProps['source'] | Source;
  
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
  placeholderSource?: string | ImageProps['source'];
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  showActivityIndicator?: boolean;
  
  // Performance
  priority?: 'low' | 'normal' | 'high';
  preload?: boolean;
  useFastImage?: boolean;
  
  // Animation
  fadeIn?: boolean;
  fadeDuration?: number;
  scaleAnimation?: boolean;
  
  // Resize options
  resizeMode?: ImageProps['resizeMode'];
  blurRadius?: number;
  
  // Event callbacks
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onProgress?: (loaded: number, total: number) => void;
  onPress?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Quality options
  quality?: 'low' | 'medium' | 'high';
  
  // Fallback image
  fallbackSource?: ImageProps['source'];
  
  // Additional features
  aspectRatio?: number;
  borderRadius?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface ImageState {
  isLoading: boolean;
  hasError: boolean;
  isLoaded: boolean;
  loadProgress: number;
  isInView: boolean;
  retryAttempts: number;
}

/**
 * Enhanced Image cache management with better memory handling
 */
class ImageCache {
  private static cache = new Map<string, {
    uri: string;
    timestamp: number;
    size?: number;
    accessCount: number;
    lastAccessed: number;
  }>();
  
  private static maxCacheSize = 50; // Max number of cached images
  private static maxMemorySize = 50 * 1024 * 1024; // 50MB max cache size
  private static loadingPromises = new Map<string, Promise<boolean>>();
  
  static set(key: string, uri: string, size?: number): void {
    // Clean up old entries if needed
    this.cleanupIfNeeded();
    
    this.cache.set(key, {
      uri,
      timestamp: Date.now(),
      size,
      accessCount: 1,
      lastAccessed: Date.now(),
    });
  }
  
  static get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry) {
      // Update access stats
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      return entry.uri;
    }
    return null;
  }
  
  static has(key: string): boolean {
    return this.cache.has(key);
  }
  
  static async preload(uri: string): Promise<boolean> {
    const cacheKey = this.generateKey(uri);
    
    if (this.has(cacheKey)) {
      return true;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(uri);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new loading promise
    const loadingPromise = new Promise<boolean>((resolve) => {
      Image.prefetch(uri)
        .then(() => {
          this.set(cacheKey, uri);
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        })
        .finally(() => {
          this.loadingPromises.delete(uri);
        });
    });

    this.loadingPromises.set(uri, loadingPromise);
    return loadingPromise;
  }
  
  private static cleanupIfNeeded(): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Sort by access frequency and last accessed time
      const entries = Array.from(this.cache.entries()).sort((a, b) => {
        const aEntry = a[1];
        const bEntry = b[1];
        
        // Less frequently accessed first
        if (aEntry.accessCount !== bEntry.accessCount) {
          return aEntry.accessCount - bEntry.accessCount;
        }
        
        // Older last accessed first
        return aEntry.lastAccessed - bEntry.lastAccessed;
      });
      
      // Remove least frequently used entries
      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
  
  static generateKey(uri: string): string {
    return `img_${uri.replace(/[^a-zA-Z0-9]/g, '_')}_${uri.length}`;
  }
  
  static clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
  
  static getStats(): {
    count: number;
    maxSize: number;
    totalSize: number;
    loadingCount: number;
  } {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + (entry.size || 0), 0);
    
    return {
      count: this.cache.size,
      maxSize: this.maxCacheSize,
      totalSize,
      loadingCount: this.loadingPromises.size,
    };
  }
  
  static clearExpired(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > maxAge) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.cache.delete(key));
  }
}

/**
 * Main OptimizedImage component
 */
const OptimizedImageComponent: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  lazy = true,
  threshold = 100,
  cache = true,
  cacheKey,
  cacheDuration = 30 * 60 * 1000, // 30 minutes
  placeholder,
  placeholderSource,
  loadingComponent,
  errorComponent,
  showActivityIndicator = true,
  priority = 'normal',
  preload = false,
  useFastImage = true,
  fadeIn = true,
  fadeDuration = 300,
  scaleAnimation = false,
  resizeMode = 'cover',
  blurRadius,
  onLoadStart,
  onLoad,
  onError,
  onProgress,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  quality = 'medium',
  fallbackSource,
  aspectRatio,
  borderRadius = 0,
  overlayColor,
  overlayOpacity = 0.3,
  retryCount = 3,
  retryDelay = 1000,
  ...imageProps
}) => {
  const { colors, isDark } = useTheme();
  const [state, setState] = useState<ImageState>({
    isLoading: false,
    hasError: false,
    isLoaded: false,
    loadProgress: 0,
    isInView: !lazy,
    retryAttempts: 0,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(scaleAnimation ? 0.8 : 1)).current;
  const containerRef = useRef<View>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy || preload);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Generate cache key
  const imageCacheKey = cacheKey || ImageCache.generateKey(typeof source === 'string' ? source : (source as any)?.uri || 'unknown');
  
  // Get image URI
  const imageUri = typeof source === 'string' ? source : (source as any)?.uri;
  
  // Enhanced intersection observer for lazy loading
  const checkVisibility = useCallback(() => {
    if (!lazy || state.isInView || !containerRef.current) return;
    
    containerRef.current.measure((x, y, width, height, pageX, pageY) => {
      const screenHeight = Dimensions.get('window').height;
      const isVisible = pageY < screenHeight + threshold && pageY + height > -threshold;
      
      if (isVisible) {
        setState(prev => ({ ...prev, isInView: true }));
        setShouldLoad(true);
      }
    });
  }, [lazy, state.isInView, threshold]);
  
  // Retry mechanism for failed loads
  const retryLoad = useCallback(() => {
    if (state.retryAttempts < retryCount) {
      setState(prev => ({
        ...prev,
        hasError: false,
        isLoading: false,
        retryAttempts: prev.retryAttempts + 1,
      }));
      
      retryTimeoutRef.current = setTimeout(() => {
        setShouldLoad(false);
        setTimeout(() => setShouldLoad(true), 100);
      }, retryDelay * state.retryAttempts);
    }
  }, [state.retryAttempts, retryCount, retryDelay]);
  
  // Handle image loading start
  const handleLoadStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      hasError: false,
    }));
    
    onLoadStart?.();
  }, [onLoadStart]);
  
  // Handle image load success
  const handleLoad = useCallback((event?: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      isLoaded: true,
      hasError: false,
      retryAttempts: 0,
    }));
    
    // Cache the image
    if (cache && imageUri) {
      const imageSize = event?.nativeEvent?.source?.width || undefined;
      ImageCache.set(imageCacheKey, imageUri, imageSize);
    }
    
    // Animation sequence
    const animations = [];
    
    if (fadeIn) {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        })
      );
    } else {
      fadeAnim.setValue(1);
    }
    
    if (scaleAnimation) {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      );
    }
    
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
    
    onLoad?.();
  }, [cache, imageUri, imageCacheKey, fadeIn, fadeDuration, scaleAnimation, onLoad]);
  
  // Handle image load error
  const handleError = useCallback((error: any) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true,
    }));
    
    console.warn('Image load failed:', imageUri, error);
    
    // Attempt retry if enabled
    if (state.retryAttempts < retryCount) {
      retryLoad();
    } else {
      onError?.(error);
    }
  }, [imageUri, onError, state.retryAttempts, retryCount, retryLoad]);
  
  // Handle load progress
  const handleProgress = useCallback((event: any) => {
    const { loaded, total } = event.nativeEvent;
    const progress = total > 0 ? (loaded / total) * 100 : 0;
    
    setState(prev => ({
      ...prev,
      loadProgress: progress,
    }));
    
    onProgress?.(loaded, total);
  }, [onProgress]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // Preload image if needed
  useEffect(() => {
    if (preload && imageUri) {
      ImageCache.preload(imageUri);
    }
  }, [preload, imageUri]);
  
  // Check visibility on mount for lazy loading
  useEffect(() => {
    if (lazy && !state.isInView) {
      const timer = setTimeout(checkVisibility, 100);
      return () => clearTimeout(timer);
    }
  }, [lazy, state.isInView, checkVisibility]);
  
  // Get image source with optimizations
  const getOptimizedSource = useCallback(() => {
    if (!imageUri) return source;
    
    // Check cache first
    if (cache && ImageCache.has(imageCacheKey)) {
      const cachedUri = ImageCache.get(imageCacheKey);
      if (cachedUri) {
        return typeof source === 'string' ? { uri: cachedUri } : { ...source as any, uri: cachedUri };
      }
    }
    
    // Return original source
    return typeof source === 'string' ? { uri: source } : source;
  }, [source, imageUri, cache, imageCacheKey]);
  
  // Get container style with aspect ratio and border radius
  const getContainerStyle = useCallback(() => {
    const baseStyle: ViewStyle = {
      overflow: 'hidden',
      borderRadius,
      ...containerStyle,
    };

    if (aspectRatio) {
      baseStyle.aspectRatio = aspectRatio;
    }

    return baseStyle;
  }, [containerStyle, aspectRatio, borderRadius]);
  
  // Enhanced loading component
  const renderLoading = useCallback(() => {
    if (loadingComponent) return loadingComponent;
    
    if (!showActivityIndicator) {
      return (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          animated={true}
        />
      );
    }
    
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
  }, [loadingComponent, showActivityIndicator, borderRadius, colors, state.loadProgress]);
  
  // Enhanced error component
  const renderError = useCallback(() => {
    if (errorComponent) return errorComponent;
    
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Failed to load image
        </Text>
        {state.retryAttempts < retryCount && (
          <Pressable
            onPress={retryLoad}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.background }]}>
              Retry ({state.retryAttempts + 1}/{retryCount})
            </Text>
          </Pressable>
        )}
      </View>
    );
  }, [errorComponent, colors, state.retryAttempts, retryCount, retryLoad]);
  
  // Enhanced placeholder component
  const renderPlaceholder = useCallback(() => {
    if (placeholder) return placeholder;
    
    if (placeholderSource) {
      const placeholderImageSource = typeof placeholderSource === 'string'
        ? { uri: placeholderSource }
        : placeholderSource;
      
      return (
        <Image
          source={placeholderImageSource}
          style={[styles.placeholderImage, style]}
          resizeMode={resizeMode}
          blurRadius={blurRadius ? blurRadius * 0.5 : undefined}
        />
      );
    }
    
    return (
      <Skeleton
        width="100%"
        height="100%"
        borderRadius={borderRadius}
        animated={false}
        style={{ backgroundColor: isDark ? '#2D2D2D' : '#F5F5F5' }}
      />
    );
  }, [placeholder, placeholderSource, style, resizeMode, blurRadius, borderRadius, isDark]);
  
  // Render image overlay
  const renderOverlay = useCallback(() => {
    if (!overlayColor) return null;

    return (
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          },
        ]}
      />
    );
  }, [overlayColor, overlayOpacity]);
  
  // Main render logic
  const renderContent = useCallback(() => {
    // Don't render if lazy loading and not in view
    if (lazy && !state.isInView) {
      return renderPlaceholder();
    }

    // Don't load image if shouldLoad is false
    if (!shouldLoad) {
      return renderPlaceholder();
    }

    // Show error state
    if (state.hasError && !fallbackSource && state.retryAttempts >= retryCount) {
      return renderError();
    }

    const finalSource = state.hasError && fallbackSource 
      ? fallbackSource 
      : getOptimizedSource();

    const imageStyle = [
      style,
      {
        opacity: fadeIn ? fadeAnim : 1,
        transform: scaleAnimation ? [{ scale: scaleAnim }] : undefined,
      },
    ];

    // Fast Image configuration
    const fastImageProps: FastImageProps = {
      source: finalSource as Source,
      style: imageStyle,
      resizeMode: resizeMode as ResizeMode,
      onLoadStart: handleLoadStart,
      onLoad: handleLoad,
      onError: handleError,
      priority: priority as Priority,
      cache: cache ? FastImage.cacheControl.immutable : FastImage.cacheControl.web,
    };

    return (
      <>
        {/* Loading overlay */}
        {(state.isLoading || (!state.isLoaded && shouldLoad)) && (
          <View style={StyleSheet.absoluteFill}>
            {renderLoading()}
          </View>
        )}
        
        {/* Main image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: fadeIn ? fadeAnim : 1,
              transform: scaleAnimation ? [{ scale: scaleAnim }] : undefined,
            },
          ]}
        >
          {useFastImage ? (
            <FastImage {...fastImageProps} />
          ) : (
            <Image
              {...imageProps}
              source={finalSource as ImageProps['source']}
              style={imageStyle}
              resizeMode={resizeMode}
              blurRadius={blurRadius}
              onLoadStart={handleLoadStart}
              onLoad={handleLoad}
              onError={handleError}
              onProgress={handleProgress}
              accessible={true}
              accessibilityLabel={accessibilityLabel || 'Image'}
              accessibilityHint={accessibilityHint}
              fadeDuration={0} // Disable default fade, we use custom
              {...(Platform.OS === 'android' && {
                progressiveRenderingEnabled: true,
                borderRadius: borderRadius,
              })}
            />
          )}
          
          {/* Overlay */}
          {renderOverlay()}
        </Animated.View>
      </>
    );
  }, [
    lazy,
    state.isInView,
    state.hasError,
    state.isLoading,
    state.isLoaded,
    state.retryAttempts,
    shouldLoad,
    fallbackSource,
    retryCount,
    getOptimizedSource,
    style,
    fadeIn,
    fadeAnim,
    scaleAnimation,
    scaleAnim,
    useFastImage,
    priority,
    cache,
    resizeMode,
    blurRadius,
    borderRadius,
    imageProps,
    accessibilityLabel,
    accessibilityHint,
    renderPlaceholder,
    renderError,
    renderLoading,
    renderOverlay,
    handleLoadStart,
    handleLoad,
    handleError,
    handleProgress,
  ]);

  const content = (
    <View ref={containerRef} style={getContainerStyle()}>
      {renderContent()}
    </View>
  );

  // Wrap with Pressable if onPress is provided
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
});

// Memoized component with performance tracking
const OptimizedImage = memo(withPerformanceTracking(OptimizedImageComponent, 'OptimizedImage'));

// Fast image component for critical images
export const CriticalImage: React.FC<OptimizedImageProps> = memo((props) => (
  <OptimizedImage
    {...props}
    lazy={false}
    preload={true}
    priority="high"
    cache={true}
    useFastImage={true}
    showActivityIndicator={false}
  />
));

// Lazy image component for lists and galleries
export const LazyImage: React.FC<OptimizedImageProps> = memo((props) => (
  <OptimizedImage
    {...props}
    lazy={true}
    priority="low"
    fadeIn={true}
    scaleAnimation={true}
    threshold={150}
  />
));

// Avatar image with circular styling
export const AvatarImage: React.FC<OptimizedImageProps & {
  size?: number;
}> = memo(({ size = 40, style, containerStyle, ...props }) => {
  const avatarSize = scale(size);
  
  return (
    <OptimizedImage
      {...props}
      containerStyle={[
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        containerStyle,
      ]}
      style={[
        {
          width: '100%',
          height: '100%',
        },
        style,
      ]}
      lazy={false}
      cache={true}
      useFastImage={true}
      resizeMode="cover"
      borderRadius={avatarSize / 2}
    />
  );
});

// Car image component optimized for car listings
export const CarImage: React.FC<OptimizedImageProps> = memo((props) => (
  <OptimizedImage
    {...props}
    aspectRatio={16 / 9}
    borderRadius={RESPONSIVE_DIMENSIONS.borderRadius.medium}
    lazy={true}
    fadeIn={true}
    scaleAnimation={false}
    priority="normal"
    cache={true}
    useFastImage={true}
    retryCount={2}
  />
));

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    marginTop: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
    minHeight: scale(100),
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.small,
    marginTop: SPACING.xs,
  },
  retryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// Display names
OptimizedImage.displayName = 'OptimizedImage';
CriticalImage.displayName = 'CriticalImage';
LazyImage.displayName = 'LazyImage';
AvatarImage.displayName = 'AvatarImage';
CarImage.displayName = 'CarImage';

// Static methods for cache management
OptimizedImage.preload = ImageCache.preload;
OptimizedImage.clearCache = ImageCache.clear;
OptimizedImage.clearExpiredCache = ImageCache.clearExpired;
OptimizedImage.getCacheStats = ImageCache.getStats;

// Export cache manager for advanced usage
export { ImageCache };

// Export all variants
export { OptimizedImage, CriticalImage, LazyImage, AvatarImage, CarImage };
export default OptimizedImage;
