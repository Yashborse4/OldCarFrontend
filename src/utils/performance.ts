// Re-export from the optimized version for backward compatibility
export * from './performanceOptimized';

// Backward compatibility export
export const LIST_OPTIMIZATION = {
  ITEM_HEIGHT_CACHE_SIZE: 100,
  RENDER_AHEAD_DISTANCE: 1000,
  SCROLL_EVENT_THROTTLE: 16,
  MAX_TO_RENDER_PER_BATCH: 10,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
  INITIAL_NUM_TO_RENDER: 10,
  WINDOW_SIZE: 10,
  
  // Add missing getItemLayout function
  getItemLayout: (itemHeight: number) => (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
  
  // Add keyExtractor utility
  keyExtractor: (item: any, index: number): string => {
    return item?.id?.toString() || item?.key?.toString() || index.toString();
  },
  
  // Add default props for FlatList
  defaultProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
  }
};
