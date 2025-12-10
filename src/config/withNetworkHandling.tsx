import React, { useState, useEffect, useCallback, ComponentType } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNetwork, useNetworkRefresh } from '../context/NetworkContext';
import NetworkError, { NetworkStatusIndicator } from './NetworkError';

export interface NetworkHandlingProps {
  isLoading?: boolean;
  onRefresh?: () => void | Promise<void>;
  showNetworkBanner?: boolean;
  showNetworkOverlay?: boolean;
  showNetworkStatusIndicator?: boolean;
  networkErrorMode?: 'overlay' | 'inline' | 'banner';
  customNetworkErrorComponent?: React.ComponentType<any>;
}

interface WithNetworkHandlingOptions {
  showOfflineOverlay?: boolean;
  showOfflineBanner?: boolean;
  showStatusIndicator?: boolean;
  autoRefreshOnReconnect?: boolean;
  errorMode?: 'overlay' | 'inline' | 'banner';
}

const withNetworkHandling = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithNetworkHandlingOptions = {}
) => {
  const {
    showOfflineOverlay = true,
    showOfflineBanner = false,
    showStatusIndicator = true,
    autoRefreshOnReconnect = true,
    errorMode = 'overlay',
  } = options;

  const NetworkAwareComponent: React.FC<P & NetworkHandlingProps> = (props) => {
    const { 
      isLoading = false,
      onRefresh,
      showNetworkBanner = showOfflineBanner,
      showNetworkOverlay = showOfflineOverlay,
      showNetworkStatusIndicator = showStatusIndicator,
      networkErrorMode = errorMode,
      customNetworkErrorComponent: CustomNetworkError,
      ...restProps 
    } = props;

  const isDark = false;
  const colors = { text: '#1A202C', textSecondary: '#4A5568', primary: '#FFD700', surface: '#FFFFFF', background: '#FAFBFC' };
    const { isOnline, isOffline } = useNetwork();
    const [hasBeenOffline, setHasBeenOffline] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Track if user has been offline to show appropriate messages
    useEffect(() => {
      if (isOffline) {
        setHasBeenOffline(true);
      }
    }, [isOffline]);

    // Auto-refresh callback when coming back online
    const handleAutoRefresh = useCallback(async () => {
      if (autoRefreshOnReconnect && onRefresh && hasBeenOffline) {
        console.log('🔄 Auto-refreshing screen after reconnection...');
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Error during auto-refresh:', error);
        } finally {
          setIsRefreshing(false);
          setHasBeenOffline(false);
        }
      }
    }, [autoRefreshOnReconnect, onRefresh, hasBeenOffline]);

    // Set up network refresh listener
    useNetworkRefresh(handleAutoRefresh);

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      statusIndicatorContainer: {
        position: 'absolute',
        top: 40, // Below status bar
        right: 16,
        zIndex: 1000,
      },
      overlayContainer: {
        flex: 1,
        position: 'relative',
      },
      inlineErrorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      },
    });

    // Custom retry handler
    const handleRetry = async () => {
      if (onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Error during retry:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    return (
      <View style={styles.container}>
        {/* Network Status Indicator */}
        {showNetworkStatusIndicator && isOffline && (
          <View style={styles.statusIndicatorContainer}>
            <NetworkStatusIndicator visible={isOffline} />
          </View>
        )}

        {/* Banner Mode Network Error */}
        {showNetworkBanner && isOffline && networkErrorMode === 'banner' && (
          <View style={styles.inlineErrorContainer}>
            {CustomNetworkError ? (
              <CustomNetworkError 
                visible={isOffline} 
                onRetry={handleRetry}
                mode="banner"
              />
            ) : (
              <NetworkError
                visible={isOffline}
                onRetry={handleRetry}
                mode="banner"
                title="No Internet"
                message="Check your connection"
                showRetryButton
              />
            )}
          </View>
        )}

        {/* Main Content */}
        <View style={styles.overlayContainer}>
          <WrappedComponent 
            {...(restProps as P)} 
            isLoading={isLoading || isRefreshing}
            onRefresh={onRefresh}
          />

          {/* Overlay Mode Network Error */}
          {showNetworkOverlay && isOffline && networkErrorMode === 'overlay' && (
            <>
              {CustomNetworkError ? (
                <CustomNetworkError 
                  visible={isOffline} 
                  onRetry={handleRetry}
                  mode="overlay"
                />
              ) : (
                <NetworkError
                  visible={isOffline}
                  onRetry={handleRetry}
                  mode="overlay"
                  title="No Internet Available"
                  message="Please check your internet connection and try again. The app will automatically refresh when connection is restored."
                  showRetryButton
                />
              )}
            </>
          )}

          {/* Inline Mode Network Error */}
          {networkErrorMode === 'inline' && isOffline && (
            <View style={styles.inlineErrorContainer}>
              {CustomNetworkError ? (
                <CustomNetworkError 
                  visible={isOffline} 
                  onRetry={handleRetry}
                  mode="inline"
                />
              ) : (
                <NetworkError
                  visible={isOffline}
                  onRetry={handleRetry}
                  mode="inline"
                  title="Connection Lost"
                  message="Unable to load content. Please check your internet connection."
                  showRetryButton
                />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Set display name for debugging
  NetworkAwareComponent.displayName = `withNetworkHandling(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return NetworkAwareComponent;
};

// Predefined HOC configurations for common use cases
export const withOverlayNetworkHandling = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withNetworkHandling(WrappedComponent, {
  showOfflineOverlay: true,
  showOfflineBanner: false,
  showStatusIndicator: true,
  autoRefreshOnReconnect: true,
  errorMode: 'overlay',
});

export const withBannerNetworkHandling = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withNetworkHandling(WrappedComponent, {
  showOfflineOverlay: false,
  showOfflineBanner: true,
  showStatusIndicator: false,
  autoRefreshOnReconnect: true,
  errorMode: 'banner',
});

export const withInlineNetworkHandling = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withNetworkHandling(WrappedComponent, {
  showOfflineOverlay: false,
  showOfflineBanner: false,
  showStatusIndicator: true,
  autoRefreshOnReconnect: true,
  errorMode: 'inline',
});

export const withMinimalNetworkHandling = <P extends object>(
  WrappedComponent: ComponentType<P>
) => withNetworkHandling(WrappedComponent, {
  showOfflineOverlay: false,
  showOfflineBanner: false,
  showStatusIndicator: true,
  autoRefreshOnReconnect: true,
  errorMode: 'inline',
});

// Network aware component wrapper (for functional components)
export const NetworkAwareWrapper: React.FC<{
  children: React.ReactNode;
  mode?: 'overlay' | 'banner' | 'inline' | 'minimal';
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
}> = ({ 
  children, 
  mode = 'overlay', 
  onRefresh,
  isLoading = false
}) => {
  const { isOffline } = useNetwork();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRetry = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during retry:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const colors = { text: '#1A202C', textSecondary: '#4A5568', primary: '#FFD700', surface: '#FFFFFF', background: '#FAFBFC' };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    statusIndicatorContainer: {
      position: 'absolute',
      top: 40,
      right: 16,
      zIndex: 1000,
    },
  });

  return (
    <View style={styles.container}>
      {/* Status indicator for all modes except banner */}
      {mode !== 'banner' && isOffline && (
        <View style={styles.statusIndicatorContainer}>
          <NetworkStatusIndicator visible={isOffline} />
        </View>
      )}

      {/* Children content */}
      {children}

      {/* Network error based on mode */}
      {isOffline && (
        <NetworkError
          visible={isOffline}
          onRetry={handleRetry}
          mode={mode === 'minimal' ? 'inline' : mode}
          showRetryButton
        />
      )}
    </View>
  );
};

export default withNetworkHandling;


