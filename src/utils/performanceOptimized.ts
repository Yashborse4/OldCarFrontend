import React, { 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect, 
  useState,
  memo,
  ComponentType,
} from 'react';
import {
  InteractionManager,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Easing,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Performance-optimized animation configurations
export const PERFORMANCE_ANIMATION_CONFIG = {
  // Ultra-smooth animations for critical interactions
  ultraSmooth: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Material Design standard
    useNativeDriver: true,
  },
  
  // Standard smooth animations
  smooth: {
    duration: 250,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },
  
  // Quick animations for micro-interactions
  quick: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  
  // Spring animations for bouncy effects
  spring: {
    tension: 300,
    friction: 20,
    useNativeDriver: true,
  },
  
  // Layout animations
  layout: {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      springDamping: 0.7,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  },
} ;

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameDrops: number = 0;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameDrops = 0;
    this.lastFrameTime = Date.now();
    
    const monitorFrame = (currentTime: number) => {
      const deltaTime = currentTime - this.lastFrameTime;
      
      // Detect frame drops (> 16.67ms for 60fps)
      if (deltaTime > 18) { // Small buffer for fluctuations
        this.frameDrops++;
      }
      
      this.lastFrameTime = currentTime;
      
      if (this.isMonitoring) {
        this.animationFrameId = requestAnimationFrame(monitorFrame);
      }
    };
    
    this.animationFrameId = requestAnimationFrame(monitorFrame);
  }

  stopMonitoring(): { frameDrops: number; performance: 'excellent' | 'good' | 'poor' } {
    this.isMonitoring = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const performance = this.frameDrops < 5 ? 'excellent' : this.frameDrops < 15 ? 'good' : 'poor';
    
    return { frameDrops: this.frameDrops, performance };
  }
}

// Optimized callback hook with dependency checking
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: { debounceMs?: number; throttleMs?: number } = {}
): T => {
  const { debounceMs, throttleMs } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallRef = useRef<number>(0);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      // Throttling logic
      if (throttleMs && now - lastCallRef.current < throttleMs) {
        return;
      }
      
      // Debouncing logic
      if (debounceMs) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = now;
          callback(...args);
        }, debounceMs);
        
        return;
      }
      
      lastCallRef.current = now;
      return callback(...args);
    }) as T,
    deps
  );
};

// Optimized memo with shallow comparison
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};

export const optimizedMemo = <P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual || shallowEqual);
};

// Performance-optimized FlatList configurations
export const OPTIMIZED_FLATLIST_PROPS = {
  // Basic optimization
  basic: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
  },
  
  // Heavy optimization for large lists
  heavy: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 5,
    windowSize: 5,
    getItemLayout: (data: any, index: number) => ({
      length: 100, // Adjust based on your item height
      offset: 100 * index,
      index,
    }),
  },
} ;

// Optimized animation hook
export const useOptimizedAnimation = (
  config: {
    toValue: number;
    duration?: number;
    easing?: (value: number) => number;
    delay?: number;
    useNativeDriver?: boolean;
  },
  deps: React.DependencyList = []
) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    
    Animated.timing(animatedValue, {
      ...PERFORMANCE_ANIMATION_CONFIG.smooth,
      ...config,
    }).start((finished) => {
      if (finished) {
        setIsAnimating(false);
      }
    });
  }, [animatedValue, ...deps]);

  const stopAnimation = useCallback(() => {
    animatedValue.stopAnimation();
    setIsAnimating(false);
  }, [animatedValue]);

  return {
    animatedValue,
    startAnimation,
    stopAnimation,
    isAnimating,
  };
};

// Interaction-safe async operations
export const useInteractionSafeAsync = () => {
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAfterInteractions = useCallback(
    <T>(asyncOperation: () => Promise<T>): Promise<T> => {
      return new Promise((resolve, reject) => {
        InteractionManager.runAfterInteractions(() => {
          if (mountedRef.current) {
            asyncOperation()
              .then(resolve)
              .catch(reject);
          }
        });
      });
    },
    []
  );

  return { runAfterInteractions, isMounted: () => mountedRef.current };
};

// Optimized state management with batching
export const useBatchedState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const pendingUpdatesRef = useRef<Partial<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const batchedSetState = useCallback((update: Partial<T> | ((prevState: T) => Partial<T>)) => {
    const updateObj = typeof update === 'function' ? update(state) : update;
    
    pendingUpdatesRef.current.push(updateObj);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const mergedUpdate = pendingUpdatesRef.current.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );
      
      setState(prevState => ({ ...prevState, ...mergedUpdate }));
      pendingUpdatesRef.current = [];
    }, 0);
  }, [state]);

  return [state, batchedSetState] as const;
};

// Image optimization utilities
export const getOptimizedImageProps = (
  width: number,
  height: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
) => {
  const qualityMap = {
    low: 0.3,
    medium: 0.7,
    high: 1.0,
  };

  return {
    resizeMode: 'cover' ,
    style: { width, height },
    fadeDuration: 300,
    progressiveRenderingEnabled: true,
    borderRadius: 0, // Avoid if possible for better performance
  };
};

// Component performance wrapper
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) => {
  const PerformanceTrackedComponent: React.FC<P> = (props) => {
    const renderStartTime = useRef<number>(0);
    
    useEffect(() => {
      renderStartTime.current = Date.now();
    });

    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      
      // Log slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName})`;
  
  return optimizedMemo(PerformanceTrackedComponent);
};

// Virtualization helper for large datasets
export const useVirtualization = <T>(
  data: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      data.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }, [scrollTop, itemHeight, containerHeight, data.length, overscan]);

  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
    }));
  }, [data, visibleRange]);

  const totalHeight = data.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
};

// Memory-efficient component lazy loading
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback: ComponentType = () => null
) => {
  return React.lazy(async () => {
    const module = await importFunc();
    
    // Pre-warm the component with performance tracking
    const Component = withPerformanceTracking(
      module.default,
      module.default.displayName || module.default.name || 'LazyComponent'
    );
    
    return { default: Component };
  });
};

// Animation queue for complex sequences
export class AnimationQueue {
  private queue: (() => Promise<void>)[] = [];
  private isRunning: boolean = false;

  add(animation: () => Promise<void>) {
    this.queue.push(animation);
    if (!this.isRunning) {
      this.process();
    }
  }

  private async process() {
    this.isRunning = true;
    
    while (this.queue.length > 0) {
      const animation = this.queue.shift();
      if (animation) {
        await animation();
        
        // Wait for next frame to maintain 60fps
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    }
    
    this.isRunning = false;
  }
}

export const animationQueue = new AnimationQueue();

export default {
  PERFORMANCE_ANIMATION_CONFIG,
  PerformanceMonitor,
  useOptimizedCallback,
  shallowEqual,
  optimizedMemo,
  OPTIMIZED_FLATLIST_PROPS,
  useOptimizedAnimation,
  useInteractionSafeAsync,
  useBatchedState,
  getOptimizedImageProps,
  withPerformanceTracking,
  useVirtualization,
  createLazyComponent,
  AnimationQueue,
  animationQueue,
};


