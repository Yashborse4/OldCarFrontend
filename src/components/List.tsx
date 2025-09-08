/**
 * Advanced List Components
 * Provides enhanced FlatList with pagination, pull-to-refresh, search, and performance optimizations
 */

import React, { 
  memo, 
  useCallback, 
  useState, 
  useRef, 
  useEffect, 
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  FlatListProps,
  ListRenderItem,
  Animated,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  FONT_SIZES, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';
import { Skeleton, SkeletonList } from './Loading';
import { SearchInput } from './Input';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced List Props
export interface EnhancedListRef<T> {
  scrollToTop: () => void;
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToItem: (item: T, animated?: boolean) => void;
  refresh: () => void;
  loadMore: () => void;
  search: (query: string) => void;
  clearSearch: () => void;
  getScrollPosition: () => number;
}

interface BaseListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem' | 'refreshControl' | 'onEndReached'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  
  // Loading states
  loading?: boolean;
  refreshing?: boolean;
  loadingMore?: boolean;
  
  // Pagination
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  hasMore?: boolean;
  
  // Pull to refresh
  onRefresh?: () => void;
  pullToRefreshEnabled?: boolean;
  
  // Search
  searchEnabled?: boolean;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Empty state
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: {
    title: string;
    onPress: () => void;
  };
  
  // Error state
  error?: string | null;
  onRetry?: () => void;
  
  // Performance optimizations
  optimizeForPerformance?: boolean;
  estimatedItemSize?: number;
  
  // Header and Footer
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  
  // Styling
  contentContainerStyle?: ViewStyle;
  
  // Accessibility
  accessibilityLabel?: string;
}

// Base Enhanced List Component
const BaseListComponent = forwardRef<EnhancedListRef<any>, BaseListProps<any>>(({
  data,
  renderItem,
  loading = false,
  refreshing = false,
  loadingMore = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  hasMore = false,
  onRefresh,
  pullToRefreshEnabled = true,
  searchEnabled = false,
  searchQuery = '',
  onSearch,
  searchPlaceholder = 'Search...',
  emptyTitle = 'No items found',
  emptyMessage = 'There are no items to display at the moment.',
  emptyIcon = 'search',
  emptyAction,
  error,
  onRetry,
  optimizeForPerformance = true,
  estimatedItemSize = 100,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  accessibilityLabel,
  ...flatListProps
}, ref) => {
  const { colors, isDark } = useTheme();
  const { deviceInfo } = useResponsive();
  const flatListRef = useRef<FlatList>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchText, setSearchText] = useState(searchQuery);

  // Imperative methods
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    scrollToIndex: (index: number, animated = true) => {
      flatListRef.current?.scrollToIndex({ index, animated });
    },
    scrollToItem: (item: any, animated = true) => {
      const index = data.findIndex(d => d === item);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, animated });
      }
    },
    refresh: () => {
      onRefresh?.();
    },
    loadMore: () => {
      if (hasMore && !loadingMore) {
        onEndReached?.();
      }
    },
    search: (query: string) => {
      setSearchText(query);
      onSearch?.(query);
    },
    clearSearch: () => {
      setSearchText('');
      onSearch?.('');
    },
    getScrollPosition: () => scrollPosition,
  }), [data, hasMore, loadingMore, onEndReached, onRefresh, onSearch, scrollPosition]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchText(query);
    onSearch?.(query);
  }, [onSearch]);

  // Handle scroll
  const handleScroll = useCallback((event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollPosition(offset);
    flatListProps.onScroll?.(event);
  }, [flatListProps.onScroll]);

  // Get item layout for performance optimization
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: estimatedItemSize,
    offset: estimatedItemSize * index,
    index,
  }), [estimatedItemSize]);

  // Key extractor
  const keyExtractor = useCallback((item: any, index: number) => {
    if (item?.id) return String(item.id);
    if (item?.key) return String(item.key);
    return String(index);
  }, []);

  // Render loading footer
  const renderLoadingFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator
          size="small"
          color={themeColors.primary}
          style={styles.footerIndicator}
        />
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading more...
        </Text>
      </View>
    );
  }, [loadingMore, colors]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons
          name={emptyIcon}
          size={scale(64)}
          color={themeColors.textDisabled}
          style={styles.emptyIcon}
        />
        
        <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
          {emptyTitle}
        </Text>
        
        <Text style={[styles.emptyMessage, { color: themeColors.textSecondary }]}>
          {emptyMessage}
        </Text>
        
        {emptyAction && (
          <TouchableOpacity
            style={[styles.emptyAction, { backgroundColor: themeColors.primary }]}
            onPress={emptyAction.onPress}
          >
            <Text style={[styles.emptyActionText, { color: themeColors.onPrimary }]}>
              {emptyAction.title}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, emptyIcon, emptyTitle, emptyMessage, emptyAction, colors]);

  // Render error state
  const renderErrorState = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <MaterialIcons
          name="error-outline"
          size={scale(64)}
          color={themeColors.error}
          style={styles.errorIcon}
        />
        
        <Text style={[styles.errorTitle, { color: themeColors.error }]}>
          Something went wrong
        </Text>
        
        <Text style={[styles.errorMessage, { color: themeColors.textSecondary }]}>
          {error}
        </Text>
        
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
            onPress={onRetry}
          >
            <MaterialIcons
              name="refresh"
              size={scale(18)}
              color={themeColors.onPrimary}
              style={styles.retryIcon}
            />
            <Text style={[styles.retryText, { color: themeColors.onPrimary }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [error, onRetry, colors]);

  // Render search header
  const renderSearchHeader = useCallback(() => {
    if (!searchEnabled) return null;

    return (
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder={searchPlaceholder}
          variant="filled"
          containerStyle={styles.searchInput}
        />
      </View>
    );
  }, [searchEnabled, searchText, handleSearch, searchPlaceholder]);

  // Render initial loading state
  if (loading && data.length === 0) {
    return (
      <View style={[styles.container, contentContainerStyle]}>
        {renderSearchHeader()}
        <SkeletonList
          count={8}
          itemHeight={estimatedItemSize}
          showImage={true}
          lines={2}
        />
      </View>
    );
  }

  // Show error state if error and no data
  if (error && data.length === 0) {
    return (
      <View style={[styles.container, contentContainerStyle]}>
        {renderSearchHeader()}
        {renderErrorState()}
      </View>
    );
  }

  // Combined header component
  const combinedHeaderComponent = useMemo(() => (
    <View>
      {renderSearchHeader()}
      {ListHeaderComponent}
    </View>
  ), [renderSearchHeader, ListHeaderComponent]);

  // Combined footer component
  const combinedFooterComponent = useMemo(() => (
    <View>
      {renderLoadingFooter()}
      {ListFooterComponent}
    </View>
  ), [renderLoadingFooter, ListFooterComponent]);

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        
        // Performance optimizations
        {...(optimizeForPerformance && {
          getItemLayout: getItemLayout,
          removeClippedSubviews: true,
          maxToRenderPerBatch: 10,
          updateCellsBatchingPeriod: 50,
          initialNumToRender: 10,
          windowSize: 10,
        })}
        
        // Pagination
        onEndReached={hasMore ? onEndReached : undefined}
        onEndReachedThreshold={onEndReachedThreshold}
        
        // Pull to refresh
        refreshControl={
          pullToRefreshEnabled && onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
              progressBackgroundColor={themeColors.surface}
            />
          ) : undefined
        }
        
        // Components
        ListHeaderComponent={combinedHeaderComponent}
        ListFooterComponent={combinedFooterComponent}
        ListEmptyComponent={renderEmptyState}
        
        // Scroll handling
        onScroll={handleScroll}
        scrollEventThrottle={16}
        
        // Styling
        style={styles.list}
        showsVerticalScrollIndicator={false}
        
        // Accessibility
        accessible={!!accessibilityLabel}
        accessibilityLabel={accessibilityLabel}
        
        // Other props
        {...flatListProps}
      />
    </View>
  );
});

// Car List Component
interface CarListProps extends Omit<BaseListProps<any>, 'renderItem' | 'estimatedItemSize'> {
  cars: any[];
  onCarPress?: (car: any) => void;
  onFavoritePress?: (carId: string, isFavorite: boolean) => void;
  onImagePress?: (carId: string, imageIndex: number) => void;
  compact?: boolean;
  showFeatures?: boolean;
}

const CarListComponent: React.FC<CarListProps> = ({
  cars,
  onCarPress,
  onFavoritePress,
  onImagePress,
  compact = false,
  showFeatures = false,
  ...baseProps
}) => {
  const renderCarItem = useCallback<ListRenderItem<any>>(({ item, index }) => {
    // Dynamic import to avoid circular dependencies
    const { CarCard } = require('./Card');
    
    return (
      <CarCard
        car={item}
        onPress={() => onCarPress?.(item)}
        onFavoritePress={onFavoritePress}
        onImagePress={onImagePress}
        compact={compact}
        showFeatures={showFeatures}
        style={styles.carItem}
      />
    );
  }, [onCarPress, onFavoritePress, onImagePress, compact, showFeatures]);

  return (
    <BaseList
      {...baseProps}
      data={cars}
      renderItem={renderCarItem}
      estimatedItemSize={compact ? scale(120) : scale(350)}
      emptyTitle="No cars found"
      emptyMessage="Try adjusting your search or filters"
      emptyIcon="directions-car"
    />
  );
};

// Profile List Component
interface ProfileListProps extends Omit<BaseListProps<any>, 'renderItem' | 'estimatedItemSize'> {
  profiles: any[];
  onProfilePress?: (profile: any) => void;
  onAvatarPress?: (userId: string) => void;
  horizontal?: boolean;
}

const ProfileListComponent: React.FC<ProfileListProps> = ({
  profiles,
  onProfilePress,
  onAvatarPress,
  horizontal = false,
  ...baseProps
}) => {
  const renderProfileItem = useCallback<ListRenderItem<any>>(({ item }) => {
    // Dynamic import to avoid circular dependencies
    const { ProfileCard } = require('./Card');
    
    return (
      <ProfileCard
        user={item}
        onPress={() => onProfilePress?.(item)}
        onAvatarPress={onAvatarPress}
        horizontal={horizontal}
        style={styles.profileItem}
      />
    );
  }, [onProfilePress, onAvatarPress, horizontal]);

  return (
    <BaseList
      {...baseProps}
      data={profiles}
      renderItem={renderProfileItem}
      estimatedItemSize={horizontal ? scale(100) : scale(180)}
      emptyTitle="No profiles found"
      emptyMessage="No user profiles to display"
      emptyIcon="people"
    />
  );
};

// Sectioned List Component
interface SectionData<T> {
  title: string;
  data: T[];
  key?: string;
}

interface SectionedListProps<T> extends Omit<BaseListProps<T>, 'data' | 'renderItem'> {
  sections: SectionData<T>[];
  renderItem: (item: T, section: SectionData<T>, index: number) => React.ReactElement;
  renderSectionHeader?: (section: SectionData<T>) => React.ReactElement;
  stickyHeaders?: boolean;
}

const SectionedListComponent = <T,>({
  sections,
  renderItem,
  renderSectionHeader,
  stickyHeaders = true,
  ...baseProps
}: SectionedListProps<T>) => {
  const { colors } = useTheme();

  // Flatten sections into single array with section headers
  const flattenedData = useMemo(() => {
    const items: any[] = [];
    
    sections.forEach((section, sectionIndex) => {
      // Add section header
      items.push({
        type: 'header',
        section,
        sectionIndex,
        key: `header-${sectionIndex}`,
      });
      
      // Add section items
      section.data.forEach((item, itemIndex) => {
        items.push({
          type: 'item',
          item,
          section,
          sectionIndex,
          itemIndex,
          key: `item-${sectionIndex}-${itemIndex}`,
        });
      });
    });
    
    return items;
  }, [sections]);

  const renderFlattenedItem = useCallback<ListRenderItem<any>>(({ item: flatItem }) => {
    if (flatItem.type === 'header') {
      if (renderSectionHeader) {
        return renderSectionHeader(flatItem.section);
      }
      
      return (
        <View style={[styles.sectionHeader, { backgroundColor: themeColors.surfaceVariant }]}>
          <Text style={[styles.sectionHeaderText, { color: themeColors.onSurfaceVariant }]}>
            {flatItem.section.title}
          </Text>
        </View>
      );
    }
    
    return renderItem(flatItem.item, flatItem.section, flatItem.itemIndex);
  }, [renderItem, renderSectionHeader, colors]);

  return (
    <BaseList
      {...baseProps}
      data={flattenedData}
      renderItem={renderFlattenedItem}
      stickyHeaderIndices={stickyHeaders ? 
        flattenedData
          .map((item, index) => item.type === 'header' ? index : null)
          .filter((index): index is number => index !== null)
        : undefined
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  
  // Search
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  
  // Loading
  loadingFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerIndicator: {
    marginBottom: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: SPACING.xl,
  },
  emptyAction: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  errorIcon: {
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: SPACING.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryIcon: {
    marginRight: SPACING.sm,
  },
  retryText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  
  // Item styles
  carItem: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  profileItem: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  
  // Section styles
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionHeaderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

// Memoized exports
export const BaseList = memo(withPerformanceTracking(BaseListComponent, 'BaseList'));
export const CarList = memo(withPerformanceTracking(CarListComponent, 'CarList'));
export const ProfileList = memo(withPerformanceTracking(ProfileListComponent, 'ProfileList'));
export const SectionedList = memo(withPerformanceTracking(SectionedListComponent, 'SectionedList')) as <T>(
  props: SectionedListProps<T>
) => React.ReactElement;

// Display names
BaseList.displayName = 'BaseList';
CarList.displayName = 'CarList';
ProfileList.displayName = 'ProfileList';
// Note: displayName cannot be set on generic memoized components

export default BaseList;


