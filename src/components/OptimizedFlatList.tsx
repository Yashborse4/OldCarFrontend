/**
 * Optimized FlatList Component with Performance Enhancements
 * Provides better performance for large lists with smart rendering
 */

import React, { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../theme';
import { SPACING, FONT_SIZES, scale, useResponsive } from '../utils/responsive';
import { useOptimizedCallback, LIST_OPTIMIZATION } from '../utils/performance';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  // Enhanced render item with performance optimizations
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  
  // Performance optimizations
  itemHeight?: number;
  estimatedItemHeight?: number;
  cacheSize?: number;
  
  // Loading states
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  
  // Empty state
  emptyComponent?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  
  // Error state
  error?: string | null;
  errorComponent?: React.ReactNode;
  onRetry?: () => void;
  
  // Header/Footer components
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  loadingFooter?: boolean;
  
  // Pagination
  hasNextPage?: boolean;
  loadingMore?: boolean;
  
  // Responsive grid
  numColumns?: number;
  columnWrapperStyle?: any;
  
  // Animation
  animatedScroll?: boolean;
  
  // Search/Filter
  searchQuery?: string;
  filterPredicate?: (item: T) => boolean;
  
  // Performance monitoring
  enablePerformanceMonitoring?: boolean;
}

/**
 * Default empty state component
 */
const DefaultEmptyComponent: React.FC<{
  title?: string;
  message?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}> = ({ title, message, loading, error, onRetry }) => {
  const { colors } = useTheme();
  const { SPACING: spacing, FONT_SIZES: fontSize } = useResponsive();

  if (loading) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: fontSize.md }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fontSize.lg }]}>
          Something went wrong
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.textSecondary, fontSize: fontSize.md }]}>
          {error}
        </Text>
        {onRetry && (
          <Text 
            style={[styles.retryButton, { color: colors.primary, fontSize: fontSize.md }]}
            onPress={onRetry}
          >
            Try Again
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyTitle, { color: colors.text, fontSize: fontSize.lg }]}>
        {title || 'No items found'}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary, fontSize: fontSize.md }]}>
        {message || 'There are no items to display at the moment.'}
      </Text>
    </View>
  );
};

/**
 * Optimized item separator
 */
const ItemSeparator = memo(() => {
  const { colors } = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
});

/**
 * Footer loading component
 */
const FooterLoadingComponent: React.FC<{
  loading?: boolean;
}> = memo(({ loading }) => {
  const { colors } = useTheme();
  
  if (!loading) return null;
  
  return (
    <View style={styles.footerLoading}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.footerLoadingText, { color: colors.textSecondary }]}>
        Loading more...
      </Text>
    </View>
  );
});

/**
 * Main OptimizedFlatList component
 */
function OptimizedFlatList<T>({
  data = [],
  renderItem,
  itemHeight,
  estimatedItemHeight = 80,
  cacheSize = 10,
  loading = false,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.1,
  emptyComponent,
  emptyTitle,
  emptyMessage,
  error,
  errorComponent,
  onRetry,
  headerComponent,
  footerComponent,
  loadingFooter = false,
  hasNextPage = false,
  loadingMore = false,
  numColumns = 1,
  columnWrapperStyle,
  animatedScroll = false,
  searchQuery,
  filterPredicate,
  enablePerformanceMonitoring = false,
  keyExtractor,
  ...flatListProps
}: OptimizedFlatListProps<T>) {
  const { colors } = useTheme();
  const { deviceInfo } = useResponsive();
  const flatListRef = useRef<FlatList<T>>(null);
  const [renderStartTime, setRenderStartTime] = useState<number>(0);

  // Responsive numColumns based on device
  const responsiveNumColumns = useMemo(() => {
    if (deviceInfo.isTablet) {
      return numColumns === 1 ? 2 : Math.max(numColumns, 2);
    }
    if (deviceInfo.isLandscape && numColumns === 1) {
      return 2;
    }
    return numColumns;
  }, [numColumns, deviceInfo]);

  // Filter and search data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(item => {
        // Basic search - override with custom logic
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(query);
      });
    }

    // Apply custom filter
    if (filterPredicate) {
      filteredData = filteredData.filter(filterPredicate);
    }

    return filteredData;
  }, [data, searchQuery, filterPredicate]);

  // Optimized key extractor
  const optimizedKeyExtractor = useOptimizedCallback(
    (item: T, index: number): string => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return LIST_OPTIMIZATION.keyExtractor(item, index);
    },
    [keyExtractor]
  );

  // Optimized getItemLayout for better performance
  const getItemLayout = useOptimizedCallback(
    itemHeight
      ? LIST_OPTIMIZATION.getItemLayout(itemHeight)
      : undefined,
    [itemHeight]
  );

  // Enhanced render item with performance tracking
  const enhancedRenderItem = useOptimizedCallback(
    ({ item, index }: { item: T; index: number }) => {
      const startTime = enablePerformanceMonitoring ? Date.now() : 0;
      
      const result = renderItem({ item, index });
      
      if (enablePerformanceMonitoring && __DEV__) {
        const renderTime = Date.now() - startTime;
        if (renderTime > 16) { // More than one frame
          console.warn(`Slow render: Item ${index} took ${renderTime}ms`);
        }
      }
      
      return result;
    },
    [renderItem, enablePerformanceMonitoring]
  );

  // Handle end reached with debouncing
  const handleEndReached = useOptimizedCallback(() => {
    if (hasNextPage && !loadingMore && onEndReached) {
      onEndReached();
    }
  }, [hasNextPage, loadingMore, onEndReached]);

  // Optimized refresh control
  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      ) : undefined,
    [onRefresh, refreshing, colors]
  );

  // Empty component with error handling
  const renderEmptyComponent = useOptimizedCallback(() => {
    if (emptyComponent) return emptyComponent;
    if (errorComponent && error) return errorComponent;
    
    return (
      <DefaultEmptyComponent
        title={emptyTitle}
        message={emptyMessage}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    );
  }, [emptyComponent, errorComponent, error, emptyTitle, emptyMessage, loading, onRetry]);

  // Header component with performance optimization
  const renderHeader = useOptimizedCallback(() => {
    return headerComponent || null;
  }, [headerComponent]);

  // Footer component with loading state
  const renderFooter = useOptimizedCallback(() => {
    return (
      <View>
        {footerComponent}
        <FooterLoadingComponent loading={loadingMore} />
      </View>
    );
  }, [footerComponent, loadingMore]);

  // Item separator component
  const renderItemSeparator = useOptimizedCallback(() => {
    return <ItemSeparator />;
  }, []);

  // Performance monitoring
  useEffect(() => {
    if (enablePerformanceMonitoring && __DEV__) {
      setRenderStartTime(Date.now());
    }
  }, [data, enablePerformanceMonitoring]);

  useEffect(() => {
    if (enablePerformanceMonitoring && __DEV__ && renderStartTime > 0) {
      const totalRenderTime = Date.now() - renderStartTime;
      console.log(`FlatList render time: ${totalRenderTime}ms for ${processedData.length} items`);
    }
  }, [processedData.length, renderStartTime, enablePerformanceMonitoring]);

  // Optimized FlatList props
  const optimizedProps = useMemo(() => ({
    ...LIST_OPTIMIZATION.defaultProps,
    ...flatListProps,
    // Override with our optimizations
    removeClippedSubviews: Platform.OS === 'android' ? true : flatListProps.removeClippedSubviews,
    maxToRenderPerBatch: deviceInfo.isTablet ? 15 : 10,
    windowSize: deviceInfo.isTablet ? 15 : 10,
    initialNumToRender: deviceInfo.isTablet ? 12 : 8,
    updateCellsBatchingPeriod: 100,
    maintainVisibleContentPosition: animatedScroll ? {
      minIndexForVisible: 0,
      autoscrollToTopThreshold: 10,
    } : undefined,
  }), [flatListProps, deviceInfo, animatedScroll]);

  return (
    <FlatList<T>
      ref={flatListRef}
      data={processedData}
      renderItem={enhancedRenderItem}
      keyExtractor={optimizedKeyExtractor}
      getItemLayout={getItemLayout}
      numColumns={responsiveNumColumns}
      columnWrapperStyle={responsiveNumColumns > 1 ? columnWrapperStyle : undefined}
      refreshControl={refreshControl}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={renderEmptyComponent}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ItemSeparatorComponent={renderItemSeparator}
      contentContainerStyle={[
        processedData.length === 0 && styles.emptyContentContainer,
        flatListProps.contentContainerStyle,
      ]}
      style={[styles.container, flatListProps.style]}
      {...optimizedProps}
    />
  );
}

// Memoized export
const MemoizedOptimizedFlatList = memo(OptimizedFlatList) as typeof OptimizedFlatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    minHeight: Dimensions.get('window').height * 0.5,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    marginHorizontal: SPACING.md,
  },
  footerLoading: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerLoadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.sm,
  },
});

// Export specialized versions
export const CarList = <T extends any>(props: OptimizedFlatListProps<T>) => (
  <MemoizedOptimizedFlatList
    {...props}
    estimatedItemHeight={120}
    enablePerformanceMonitoring={__DEV__}
  />
);

export const ChatList = <T extends any>(props: OptimizedFlatListProps<T>) => (
  <MemoizedOptimizedFlatList
    {...props}
    estimatedItemHeight={70}
    enablePerformanceMonitoring={__DEV__}
  />
);

export const GridList = <T extends any>(props: OptimizedFlatListProps<T>) => (
  <MemoizedOptimizedFlatList
    {...props}
    numColumns={2}
    estimatedItemHeight={200}
    enablePerformanceMonitoring={__DEV__}
  />
);

ItemSeparator.displayName = 'ItemSeparator';
FooterLoadingComponent.displayName = 'FooterLoadingComponent';
MemoizedOptimizedFlatList.displayName = 'OptimizedFlatList';

export default MemoizedOptimizedFlatList;
