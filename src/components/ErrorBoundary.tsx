/**
 * Error Boundary Components for Crash Prevention
 * Provides comprehensive error handling and graceful failure recovery
 */

import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { AntDesign, MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useTheme } from '../theme';
import { SPACING, FONT_SIZES, scale, getResponsiveValue } from '../utils/responsive';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'app' | 'screen' | 'component';
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onGoHome?: () => void;
  level: 'app' | 'screen' | 'component';
}

/**
 * Main Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log error with context
    this.logError(error, errorInfo, level);
    
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry for component-level errors
    if (level === 'component' && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      if (resetKeys && resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo, level: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      retryCount: this.state.retryCount,
    };

    // Log to console in development
    if (__DEV__) {
      console.error('🚨 Error Boundary Caught Error:', errorData);
    }

    // TODO: In production, send to error reporting service
    // crashlytics().recordError(error);
    // analytics().logEvent('error_boundary_triggered', errorData);
  };

  private scheduleRetry = () => {
    // Auto-retry after a delay for component-level errors
    this.resetTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }, 2000) as unknown as number;
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      Alert.alert(
        'Too Many Errors',
        'This component has failed multiple times. Please restart the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    this.resetErrorBoundary();
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: FallbackComponent, level = 'component' } = this.props;

    if (hasError) {
      const FallbackWrapper = FallbackComponent || DefaultErrorFallback;
      
      return (
        <FallbackWrapper
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          level={level}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  level,
}) => {
  const { colors, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.lg,
    },
    iconContainer: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: colors.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: getResponsiveValue({
        small: FONT_SIZES.xl,
        default: FONT_SIZES.xxl,
      }),
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    message: {
      fontSize: FONT_SIZES.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: FONT_SIZES.md * 1.5,
      marginBottom: SPACING.xl,
      maxWidth: scale(300),
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: SPACING.md,
    },
    button: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderRadius: scale(8),
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    errorDetails: {
      marginTop: SPACING.xl,
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: scale(8),
      width: '100%',
      maxHeight: scale(200),
    },
    errorText: {
      fontSize: FONT_SIZES.xs,
      color: colors.textSecondary,
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
    },
  });

  const getErrorMessage = () => {
    switch (level) {
      case 'app':
        return 'The app encountered an unexpected error. We apologize for the inconvenience.';
      case 'screen':
        return 'This screen could not load properly. Please try again.';
      default:
        return 'Something went wrong with this component. Please try refreshing.';
    }
  };

  const getErrorTitle = () => {
    switch (level) {
      case 'app':
        return 'App Error';
      case 'screen':
        return 'Screen Error';
      default:
        return 'Oops!';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name="error-outline"
          size={scale(40)}
          color={colors.error}
        />
      </View>

      <Text style={styles.title}>{getErrorTitle()}</Text>
      
      <Text style={styles.message}>
        {getErrorMessage()}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <AntDesign name="reload1" size={scale(16)} color="#FFFFFF" />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

        {level !== 'component' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => {
              // Navigate to home screen
              // navigation.navigate('Dashboard');
            }}
          >
            <AntDesign name="home" size={scale(16)} color={colors.text} />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              Go Home
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {__DEV__ && error && (
        <View style={styles.errorDetails}>
          <Text style={styles.errorText}>
            {error.message}
            {'\n\n'}
            {error.stack?.slice(0, 300)}...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

/**
 * Screen-level Error Boundary
 */
export const ScreenErrorBoundary: React.FC<{
  children: ReactNode;
  screenName?: string;
}> = ({ children, screenName }) => {
  return (
    <ErrorBoundary
      level="screen"
      onError={(error, errorInfo) => {
        console.error(`Screen Error (${screenName}):`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * App-level Error Boundary
 */
export const AppErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <ErrorBoundary
      level="app"
      onError={(error, errorInfo) => {
        // Log critical app errors
        console.error('Critical App Error:', error, errorInfo);
        // Send to crash reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * HOC for wrapping components with error boundaries
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<ErrorFallbackProps>;
    level?: 'app' | 'screen' | 'component';
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
) => {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary
      fallback={options?.fallback}
      level={options?.level}
      onError={options?.onError}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ComponentWithErrorBoundary;
};

/**
 * Custom Error Boundary Hook for functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // Re-throw error to be caught by nearest error boundary
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

/**
 * Safe component wrapper that prevents crashes
 */
export const SafeComponent: React.FC<{
  children: ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, fallback, onError }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    
    if (__DEV__) {
      console.error('SafeComponent caught error:', error);
    }
    
    return <>{fallback || null}</>;
  }
};

export default ErrorBoundary;
