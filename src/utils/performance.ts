/**
 * Performance Optimization Utilities
 * Provides tools for monitoring, optimizing, and improving app performance
 */

import { InteractionManager, Platform } from 'react-native';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();
  private static renderCounts: Map<string, number> = new Map();
  
  static startMeasure(name: string): void {
    this.measurements.set(name, Date.now());
  }
  
  static endMeasure(name: string): number {
    const start = this.measurements.get(name);
    if (!start) return 0;
    
    const duration = Date.now() - start;
    this.measurements.delete(name);
    
    if (__DEV__) {
      console.log(`⚡ Performance: ${name} took ${duration}ms`);
    }
    
    return duration;
  }
  
  static countRender(componentName: string): void {
    if (!__DEV__) return;
    
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    // Log excessive renders
    if (count > 0 && count % 10 === 0) {
      console.warn(`🔄 ${componentName} has rendered ${count} times`);
    }
  }
  
  static logStats(): void {
    if (!__DEV__) return;
    
    console.log('📊 Render Statistics:', Object.fromEntries(this.renderCounts));
    this.renderCounts.clear();
  }
}

/**
 * Debounced function utility
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<number | null>(null);
  
  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

/**
 * Throttled function utility
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  
  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Memoized callback with dependency optimization
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  // Use shallow comparison for object dependencies
  const memoizedDeps = useMemo(() => deps, deps);
  return useCallback(callback, memoizedDeps);
};

/**
 * Memoized value with performance tracking
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  return useMemo(() => {
    if (__DEV__ && debugName) {
      PerformanceMonitor.startMeasure(debugName);
      const result = factory();
      PerformanceMonitor.endMeasure(debugName);
      return result;
    }
    return factory();
  }, deps);
};

/**
 * Component render tracking HOC
 */
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = React.memo((props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    
    useEffect(() => {
      PerformanceMonitor.countRender(name);
    });
    
    return React.createElement(Component, props);
  });
  
  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Interaction-aware state updates
 * Delays state updates until interactions are complete
 */
export const useInteractionSafeState = <T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void] => {
  const [state, setState] = useState<T>(initialState);
  const pendingStateRef = useRef<T | ((prevState: T) => T) | null>(null);
  
  const setSafeState = useCallback((newState: T | ((prevState: T) => T)) => {
    if (InteractionManager.runAfterInteractions) {
      pendingStateRef.current = newState;
      InteractionManager.runAfterInteractions(() => {
        if (pendingStateRef.current !== null) {
          setState(pendingStateRef.current);
          pendingStateRef.current = null;
        }
      });
    } else {
      setState(newState);
    }
  }, []);
  
  return [state, setSafeState];
};

/**
 * Smart image loading hook
 */
export const useOptimizedImage = (uri: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);
  
  return {
    isLoaded,
    hasError,
    imageProps: {
      onLoad: handleLoad,
      onError: handleError,
      source: { uri },
    },
  };
};

/**
 * List performance optimization utilities
 */
// Key extractor function to avoid circular reference
const defaultKeyExtractor = (item: any, index: number) => {
  return item?.id?.toString() || item?.key?.toString() || index.toString();
};

export const LIST_OPTIMIZATION = {
  // Optimal getItemLayout for uniform list items
  getItemLayout: (itemHeight: number) => (
    data: any,
    index: number
  ) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
  
  // Key extractor with fallback
  keyExtractor: defaultKeyExtractor,
  
  // Default props for FlatList optimization
  defaultProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    initialNumToRender: 8,
    getItemLayout: undefined, // Set this per list based on item height
    keyExtractor: defaultKeyExtractor,
  },
};

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static maxCacheSize = 100;
  
  static set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    // Clean up expired entries first
    this.cleanup();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  static delete(key: string): void {
    this.cache.delete(key);
  }
  
  static clear(): void {
    this.cache.clear();
  }
  
  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  static getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

/**
 * Network-aware operations
 */
export const useNetworkOptimizedOperation = <T>(
  operation: () => Promise<T>,
  fallbackValue: T
) => {
  const [result, setResult] = useState<T>(fallbackValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await operation();
      setResult(data);
    } catch (err) {
      setError(err as Error);
      // Keep previous result on error
    } finally {
      setIsLoading(false);
    }
  }, [operation]);
  
  return { result, isLoading, error, execute };
};

/**
 * Component lazy loading utility
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => null
) => {
  return React.lazy(() => 
    importFunction().catch(error => {
      console.error('Failed to load component:', error);
      return { default: fallback as T };
    })
  );
};

/**
 * Animation performance utilities
 */
export const ANIMATION_CONFIG = {
  // Fast animations for better perceived performance
  fast: {
    duration: 200,
    useNativeDriver: true,
  },
  
  // Standard animations
  standard: {
    duration: 300,
    useNativeDriver: true,
  },
  
  // Slow animations for complex transitions
  slow: {
    duration: 500,
    useNativeDriver: true,
  },
  
  // Spring animations
  spring: {
    tension: 300,
    friction: 8,
    useNativeDriver: true,
  },
};

/**
 * Bundle size optimization utilities
 */
export const OptimizationHelpers = {
  // Lazy load heavy libraries
  loadHeavyLibrary: async <T>(importFn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const lib = await importFn();
          resolve(lib);
        } catch (error) {
          reject(error);
        }
      });
    });
  },
  
  // Platform-specific imports
  platformSelect: <T>(options: {
    ios?: () => Promise<T>;
    android?: () => Promise<T>;
    default: () => Promise<T>;
  }): Promise<T> => {
    const loader = Platform.select({
      ios: options.ios || options.default,
      android: options.android || options.default,
      default: options.default,
    });
    
    return loader();
  },
};

/**
 * Performance debugging tools
 */
export const DebugTools = {
  logRenderTime: (componentName: string) => {
    if (!__DEV__) return () => {};
    
    const start = Date.now();
    return () => {
      const end = Date.now();
      console.log(`🎨 ${componentName} render time: ${end - start}ms`);
    };
  },
  
  logMemoryUsage: () => {
    if (!__DEV__) return;
    
    // @ts-ignore - This is for debugging only
    if (typeof global !== 'undefined' && (global as any).gc) {
      // @ts-ignore
      (global as any).gc();
      console.log('🧠 Memory cleaned up');
    }
    
    const stats = MemoryManager.getStats();
    console.log('📊 Cache stats:', stats);
  },
  
  measureBundle: () => {
    if (!__DEV__) return;
    
    console.log('📦 Bundle platform:', Platform.OS);
    console.log('📦 Bundle version:', Platform.Version);
    console.log('📦 Is Hermes:', typeof globalThis !== 'undefined' && !!(globalThis as any).HermesInternal);
  },
};

// Auto cleanup on app state changes
export const initializePerformanceOptimizations = () => {
  // Cleanup cache periodically
  setInterval(() => {
    MemoryManager.cleanup();
  }, 60000); // Every minute
  
  // Log performance stats in dev mode
  if (__DEV__) {
    setInterval(() => {
      PerformanceMonitor.logStats();
      DebugTools.logMemoryUsage();
    }, 30000); // Every 30 seconds
  }
};


