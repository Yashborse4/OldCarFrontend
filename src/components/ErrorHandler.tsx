import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ApiError, NetworkError } from '../services/ApiClient';

interface ErrorHandlerProps {
  error: Error | ApiError | NetworkError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
  customMessage?: string;
}

/**
 * Enhanced error handler component that displays different types of errors
 * with appropriate styling and actions
 */
export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  showDismiss = true,
  customMessage,
}) => {
  if (!error) return null;

  const getErrorInfo = (error: Error | ApiError | NetworkError) => {
    if (error instanceof NetworkError) {
      return {
        title: 'Network Error',
        message: error.message || 'Please check your internet connection and try again.',
        type: 'network',
        canRetry: true,
      };
    }

    if (error instanceof ApiError) {
      let message = error.message;
      
      // Handle specific error codes
      switch (error.status) {
        case 400:
          return {
            title: 'Invalid Request',
            message: message || 'Please check your input and try again.',
            type: 'validation',
            canRetry: false,
          };
        case 401:
          return {
            title: 'Authentication Required',
            message: 'Please login to continue.',
            type: 'auth',
            canRetry: false,
          };
        case 403:
          return {
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
            type: 'permission',
            canRetry: false,
          };
        case 404:
          return {
            title: 'Not Found',
            message: 'The requested resource could not be found.',
            type: 'notfound',
            canRetry: false,
          };
        case 409:
          return {
            title: 'Conflict',
            message: message || 'This action conflicts with existing data.',
            type: 'conflict',
            canRetry: false,
          };
        case 422:
          return {
            title: 'Validation Error',
            message: message || 'Please correct the highlighted fields.',
            type: 'validation',
            canRetry: false,
          };
        case 429:
          return {
            title: 'Too Many Requests',
            message: 'Please wait a moment before trying again.',
            type: 'ratelimit',
            canRetry: true,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
            type: 'server',
            canRetry: true,
          };
        default:
          return {
            title: 'Error',
            message: message || 'An unexpected error occurred.',
            type: 'generic',
            canRetry: true,
          };
      }
    }

    // Generic error
    return {
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      type: 'generic',
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo(error);
  const displayMessage = customMessage || errorInfo.message;

  const getErrorStyle = (type: string) => {
    switch (type) {
      case 'network':
        return styles.networkError;
      case 'validation':
        return styles.validationError;
      case 'auth':
        return styles.authError;
      case 'permission':
        return styles.permissionError;
      case 'server':
        return styles.serverError;
      default:
        return styles.genericError;
    }
  };

  return (
    <View style={[styles.container, getErrorStyle(errorInfo.type)]}>
      <View style={styles.content}>
        <Text style={styles.title}>{errorInfo.title}</Text>
        <Text style={styles.message}>{displayMessage}</Text>
        
        <View style={styles.actions}>
          {errorInfo.canRetry && onRetry && (
            <TouchableOpacity style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
          
          {showDismiss && onDismiss && (
            <TouchableOpacity 
              style={[styles.button, styles.dismissButton]} 
              onPress={onDismiss}
            >
              <Text style={[styles.buttonText, styles.dismissButtonText]}>
                Dismiss
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  dismissButtonText: {
    color: '#8E8E93',
  },
  // Error type styles
  networkError: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  validationError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  authError: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  permissionError: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFC107',
  },
  serverError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  genericError: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
});

export default ErrorHandler;


